# CelesTrak orbital data ingestion

- **Author** Maciej Gos
- **Status** Implemented locally (2026-11-27); remote provisioning and release verification pending
- **Date** 2026-11-27

## Overview

Implement the server-side half of the README's First Orbit item "Integrate CelesTrak orbital data": a scheduled Cloudflare Worker job retrieves CCSDS OMM JSON orbital elements for the curated Sentinel-2 spacecraft from CelesTrak's official GP endpoint, validates them, publishes them atomically into Cloudflare D1, and serves the cached dataset with provenance through a documented read API. Browser propagation, the 3D tracker, and visualization stay out of scope.

## The problem

The satellite tracker (PRD [§6.2](../Product%20Requirements%20Document.md#62-satellite-tracker)) needs validated orbital elements delivered from a cache, not fetched by every visitor. [ADR-001](../decisions/001-server-side-data-aggregation.md) requires controlled server-side ingestion for rate-limited providers; [ADR-010](../decisions/010-omm-json-as-orbital-data-format.md) fixes CCSDS OMM JSON as the ingestion format; [ADR-016](../decisions/016-d1-for-first-orbit-orbital-persistence.md) fixes D1 with a single conditional newer-epoch write as the store; [ADR-003](../decisions/003-provenance-first-data-model.md) requires provider, source URL, epoch, retrieval timestamp, and schema version to be preserved with each record. The Worker currently returns 404 for all of `/api/*`, `wrangler.jsonc` has no D1 binding or cron trigger, and no CelesTrak client exists.

This slice covers [EIS-007](../Technical%20Design%20Document.md#eis-007--implement-celestrak-connector) (connector), [EIS-008](../Technical%20Design%20Document.md#eis-008--implement-repository-interface) (repository contract + D1 adapter), [EIS-009](../Technical%20Design%20Document.md#eis-009--implement-ingestion-pipeline) (scheduled pipeline), [EIS-010](../Technical%20Design%20Document.md#eis-010--implement-orbital-data-api) (read API), and the local parts of [EIS-019](../Technical%20Design%20Document.md#eis-019--configure-cloudflare-worker) (scheduled handler, D1 migration applied to local state).

## Goals

- Maintain an explicit, verified mapping from the mission's editorial spacecraft IDs to NORAD catalog IDs and international designators (TDD [§6.2](../Technical%20Design%20Document.md#62-spacecraft), [§8.1](../Technical%20Design%20Document.md#81-source)).
- Ingest OMM JSON from `https://celestrak.org/NORAD/elements/gp.php?CATNR={id}&FORMAT=JSON` on a daily UTC cron schedule, one request per spacecraft per run, with validation of HTTP status, JSON shape, catalog ID, designator, epoch, and element ranges.
- Publish each validated candidate into D1 with one atomic statement that replaces the stored record only when the candidate epoch is strictly newer; preserve the last valid record on any failure and record ingestion health separately.
- Serve `GET /api/satellites/{noradCatalogId}/orbital-elements` from D1 with the response contract in ARCHITECTURE [§12](../../ARCHITECTURE.md#12-api-architecture), including provenance and cache headers, restricted to the configured spacecraft allowlist.
- Cover acceptance and failure cases with fixture-based tests that run offline in CI.

## Non-goals

- Tracker UI, CesiumJS rendering, browser SGP4 propagation, coordinate transforms, and freshness-policy UI (EIS-011 through EIS-018).
- Remote Cloudflare provisioning (`wrangler d1 create`, real `database_id`, production migration, deploy) and end-to-end verification in the target environment (EIS-019 preview / EIS-020 production). Recorded under "Remaining release work" below.
- Spacecraft selection for the public tracker (TDD §8.1 steps 3–4: accuracy comparison, redistribution-rights confirmation). Ingestion covers all three verified Sentinel-2 spacecraft; the tracker will later select one, preferring Sentinel-2C.
- A general-purpose public API or an unrestricted CelesTrak proxy (ARCHITECTURE §12).

## Critical user journeys

| Given | When | Then |
| --- | --- | --- |
| The cron trigger fires | The scheduled handler runs | The job attempts each allowlisted spacecraft once unless an upstream error or no-data result ends the run. It records each outcome and preserves existing data on failure. |
| CelesTrak returns valid OMM JSON for a spacecraft | Ingestion validates it | The dataset is stored in D1 with normalized epoch, retrieval timestamp, source URL, and schema version, and is served by the API with HTTP 200. |
| CelesTrak returns 404 "No GP data found" | Ingestion handles it | The run is recorded as `no_data`; the previous valid record, if any, is preserved; the job stops before requesting another spacecraft. |
| CelesTrak returns a non-200 error or the request fails | Ingestion handles it | The run is recorded as `upstream_error`; the previous record is preserved; the worker stops (no retry loop), per the CelesTrak usage policy. |
| The response is malformed, fails schema validation, or carries a mismatched catalog ID/designator | Validation rejects it | The run is recorded as `validation_error`; the previous record is preserved. |
| An older or equal epoch arrives after a newer one | D1 evaluates the conditional write | The stored record and its retrieval timestamp are unchanged; the outcome is `skipped`. |
| A visitor requests `/api/satellites/40697/orbital-elements` | The Worker API reads D1 | HTTP 200 with the validated OMM payload, epoch, `fetchedAt`, source, and schema version, plus a bounded `Cache-Control` header. |
| A visitor requests an invalid, unknown, or not-yet-ingested identifier | The Worker API validates and looks up | 400 `INVALID_IDENTIFIER`, 404 `UNKNOWN_SPACECRAFT`, or 503 `ORBITAL_DATA_UNAVAILABLE` with the consistent error body. |

## Technical plan

### Spacecraft ID mapping

A new explicit catalog in `src/config/spacecraft.ts` maps each editorial spacecraft ID to its verified NORAD catalog ID and international designator, per the TDD [§8.1](../Technical%20Design%20Document.md#81-source) candidate table. The editorial mission content (Astro collection) deliberately does not carry orbital identifiers; the mapping lives in code and is the single source for both ingestion and the API allowlist.

| Spacecraft ID | Name | NORAD catalog ID | International designator |
|---|---|---:|---|
| `sentinel-2a` | Sentinel-2A | 40697 | 2015-028A |
| `sentinel-2b` | Sentinel-2B | 42063 | 2017-013A |
| `sentinel-2c` | Sentinel-2C | 60989 | 2024-157A |

All three IDs and designators were verified against the live CelesTrak endpoint `gp.php?NAME=SENTINEL-2&FORMAT=JSON` on 2026-11-27 (`OBJECT_NAME`/`OBJECT_ID`/`NORAD_CAT_ID` match). Re-verify before release; do not guess identifiers from names (TDD §8.1).

### Connector (EIS-007)

`src/integrations/celestrak/client.ts` implements the `OrbitalDataProvider` contract from TDD [§8.3](../Technical%20Design%20Document.md#83-connector-contract). The base URL is configurable (`CELESTRAK_BASE_URL` var, default the official endpoint) so local tests and dev can point at a fixture server. Each call issues exactly one GET to `{base}?CATNR={id}&FORMAT=JSON` with `Accept: application/json`, `Accept-Encoding: gzip, br`, and a 15 s timeout. Behavior:

| Upstream result | Handling |
| --- | --- |
| HTTP 200 + OMM JSON array containing a record with the requested `NORAD_CAT_ID` | Validate against the OMM zod schema, normalize the epoch, and return an `OrbitalDataset` with provenance (`source.url` = full request URL, `fetchedAt` = retrieval time, `schemaVersion` = 1). |
| HTTP 404 (`No GP data found`) or an empty array | `CelesTrakNoDataError`; ingestion records `no_data`. |
| Any other non-200, or a network/timeout failure | `CelesTrakUpstreamError`; stop, do not retry (CelesTrak usage policy sends repeated non-200 requests to a firewall). |
| 200 but invalid JSON, schema-invalid, missing the requested catalog ID, or `OBJECT_ID` mismatch | `OmmValidationError`; the update is rejected. |

The OMM schema (`src/core/orbital/omm.ts`) validates the CelesTrak OMM JSON flavor (CCSDS 502.0-B-3 keywords): required named fields, numeric ranges (0 ≤ eccentricity < 1, 0–180 inclination, 0–360 angles, positive mean motion and catalog ID), and a strict UTC epoch format. Unknown keys are preserved (`looseObject`) so raw source fields survive round-trip (TDD §6.3). The epoch is normalized to a fixed-width UTC ISO-8601 string (`YYYY-MM-DDTHH:mm:ss.sssZ`) so string comparison in SQL matches chronological order (TDD §9.3). The EIS-011 [shared SGP4 initializer](orbital-calculations.md) validates propagation at the epoch before conditional publication (TDD §8.4 step 8).

### Scheduled ingestion (EIS-009 + local EIS-019)

`worker/index.ts` gains a `scheduled` handler; `wrangler.jsonc` configures `triggers.crons: ["0 3 * * *"]` (daily UTC starting cadence per ADR-016/TDD §8.6). Each run iterates the allowlist and, per spacecraft: fetch → validate → verify `OBJECT_ID` against the mapping → initialize SGP4 → `publishIfNewer` → record an `ingestion_runs` row. The job stops on an upstream error or no-data result and logs the cause for investigation. A response validation or publication failure preserves stored data and allows the job to continue with the next spacecraft (TDD §8.5). There are no retries and no per-visitor fetches (ADR-001).

### Persistence (EIS-008, ADR-016)

Migration `worker/migrations/0001_orbital_datasets.sql` creates:

- `orbital_datasets` keyed by `norad_catalog_id` (primary key), storing `spacecraft_id`, `object_name`, `international_designator`, normalized `epoch`, `fetched_at`, `format`, the complete validated `elements` JSON, `source_url`, and `schema_version`.
- `ingestion_runs` for health: catalog ID, spacecraft ID, start/finish timestamps, `outcome` (`published | skipped | no_data | upstream_error | validation_error | storage_error | error`), detail, and candidate epoch.

Publication is one statement:

```sql
INSERT INTO orbital_datasets (...) VALUES (...)
ON CONFLICT(norad_catalog_id) DO UPDATE SET ...
WHERE excluded.epoch > orbital_datasets.epoch;
```

`meta.changes > 0` means `published`, otherwise `skipped`; storage errors are distinguished from skips. An older run finishing after a newer one cannot overwrite it (ADR-016 release check, covered by tests). The repository implements the provider-neutral `OrbitalDatasetRepository` contract from TDD [§9.2](../Technical%20Design%20Document.md#92-repository-contract); domain and connector code import no Cloudflare APIs (ADR-009 validation note).

### Read API (EIS-010, ARCHITECTURE §12)

`GET /api/satellites/{noradCatalogId}/orbital-elements` (already reserved by `run_worker_first: ["/api/*"]`):

| Condition | Response |
| --- | --- |
| Stored dataset exists (even if aged) | 200, JSON `OrbitalApiResponse` = dataset incl. `elements`, `epoch`, `fetchedAt`, `source`, `schemaVersion`; `Cache-Control: public, max-age=300` |
| Identifier not a 1–9 digit integer | 400 `{ error: { code: "INVALID_IDENTIFIER", ... } }` |
| Identifier not in the spacecraft allowlist | 404 `UNKNOWN_SPACECRAFT` |
| Allowlisted but no stored dataset | 503 `ORBITAL_DATA_UNAVAILABLE` |
| Method other than GET on the orbital-elements route | 405 `METHOD_NOT_ALLOWED`, with `Allow: GET` |
| Unknown `/api/*` route or storage failure | 404 `NOT_FOUND` / 500 `STORAGE_ERROR` |

The API validates identifiers, uses the configured allowlist, exposes no proxy to CelesTrak, returns bounded payloads, and never leaks stack traces or configuration.

### Tests and fixtures

Recorded-shape fixtures live in `tests/fixtures/celestrak/`. Per TDD §8.1 step 2, real CelesTrak orbital elements are **not** committed until redistribution rights for the feed/fixtures are confirmed; the committed fixtures use the exact official response shape with clearly synthetic element values (see `tests/fixtures/celestrak/README.md`). Live responses are exercised manually against local `wrangler dev`, never in CI. Coverage: OMM schema/epoch normalization, connector success and every failure branch (404, 500, network, malformed, wrong ID, empty, allowlist, single-attempt/no-retry), D1 conditional publication against a real local SQLite (`node:sqlite`) executing the actual migration and SQL (insert, newer, older, equal, out-of-order, preservation on failure), the ingestion pipeline with fakes, and Worker routing/scheduled handler via `vi.stubGlobal("fetch", ...)`.

## Alternatives considered

| Approach | Trade-off |
| --- | --- |
| TLE as the ingestion format | Rejected by ADR-010 and by CelesTrak's 2026-07-11 exhaustion of 5-digit catalog numbers: objects above 99999 have no TLE. OMM JSON removes the limit. |
| CSV instead of JSON | CelesTrak's usage policy recommends CSV (~3× smaller), but for single-CATNR queries JSON is ~300 B and gives schema-validatable named fields. Keep JSON (ADR-010); revisit only for bulk group fetches. |
| Read-compare-write publication against KV | Rejected by ADR-016: only a conditional write inside D1 guarantees epoch ordering under overlapping runs. |
| Fetching CelesTrak from the browser or on each API request | Rejected by ADR-001 (provider load, policy, provenance) and ARCHITECTURE §12 (no proxy). |
| Storing parsed element columns instead of the raw OMM JSON | Rejected by TDD §6.3/ADR-003: preserve the complete validated source record; normalized epoch is stored separately for ordering. |

## Risks and mitigations

- CelesTrak rate-limits or firewall-blocks abusive patterns. Mitigation: one request per spacecraft per daily run, gzip accepted, immediate stop on any non-200 with a recorded health row, no retries.
- Out-of-order or overlapping runs could regress the stored epoch. Mitigation: single conditional `ON CONFLICT ... WHERE excluded.epoch > ...` write; tested including the older-after-newer race.
- Committing real orbital elements without confirmed redistribution rights. Mitigation: synthetic fixtures in Git; live data stays in local D1 only until TDD §8.1 step 2 is resolved.
- Placeholder `database_id` in `wrangler.jsonc` could be deployed by mistake. Mitigation: UUID-zero placeholder plus comment; deployment is out of scope for this change and gated on `wrangler d1 create`.
- Catalog IDs can be re-cataloged. Mitigation: `OBJECT_ID` designator is verified against the mapping on every ingestion; mismatch is a `validation_error`, never a silent write.
- Local-only verification may miss target-environment behavior. Mitigation: remaining release work below requires ADR-016's target-environment checks before cutover.

## Rollout and rollback

Local rollout: apply the migration to local D1 (`wrangler d1 migrations apply DB --local`), run `wrangler dev --test-scheduled` and trigger `/__scheduled`, then read `/api/satellites/40697/orbital-elements`. Remote rollout (later, EIS-019/020): create the real D1 database, replace `database_id`, apply migrations remotely, deploy, verify cron and API in the target environment. Rollback: the Worker serves static assets independently of D1; removing the cron trigger or reverting the Worker keeps the site up while the last valid dataset remains in D1. No destructive operations are part of this change.

## Detailed implementation plan

| File | Change |
| --- | --- |
| `docs/designs/celestrak-orbital-ingestion.md` | **Create.** This specification. |
| `src/config/spacecraft.ts` | **Create.** Explicit Sentinel-2 → NORAD catalog ID / designator mapping and allowlist lookup. |
| `src/core/orbital/types.ts` | **Create.** `OrbitalDataset`, `OrbitalDatasetRepository`, `OrbitalDataProvider`, API types, schema version. |
| `src/core/orbital/omm.ts` | **Create.** OMM JSON zod schema (loose), array parser, `OmmValidationError`, UTC epoch normalizer. |
| `src/integrations/celestrak/client.ts` | **Create.** `OrbitalDataProvider` over `gp.php?CATNR=&FORMAT=JSON`; configurable base URL/fetch/clock; typed no-data/upstream/validation errors; single attempt with timeout. |
| `worker/env.ts` | **Create.** Worker `Env` (`ASSETS`, `DB`, `CELESTRAK_BASE_URL`). |
| `worker/index.ts` | **Modify.** Route `/api/*` to the API handler; add `scheduled` handler invoking ingestion. |
| `worker/api/index.ts`, `worker/api/orbital.ts` | **Create.** API routing and the orbital-elements endpoint with the status/error/cache contract. |
| `worker/ingestion/scheduled.ts` | **Create.** Per-spacecraft ingest → validate → conditional publish → health record; failure classification; no retries. |
| `worker/storage/d1-orbital-repository.ts` | **Create.** D1 adapter implementing the repository contract with the atomic conditional write; `recordIngestionRun`. |
| `worker/migrations/0001_orbital_datasets.sql` | **Create.** `orbital_datasets` + `ingestion_runs` schema. |
| `wrangler.jsonc` | **Modify.** Add `vars.CELESTRAK_BASE_URL`, D1 binding with placeholder `database_id` and `migrations_dir`, and the daily cron trigger. |
| `tsconfig.worker.json` | **Modify.** Include the shared `src/config`, `src/core`, `src/integrations` modules used by the Worker. |
| `tests/fixtures/celestrak/*` | **Create.** Synthetic-shape OMM JSON fixtures (valid, newer/older epochs, wrong ID, missing fields, empty, malformed) + `no-gp-data.txt` + README on fixture rights. |
| `tests/helpers/sqlite-d1.ts` | **Create.** `node:sqlite`-backed D1-compatible shim applying the real migration, for integration tests. |
| `tests/unit/omm.test.ts`, `tests/unit/celestrak-client.test.ts`, `tests/unit/ingestion.test.ts`, `tests/unit/worker.test.ts` | **Create/extend.** Unit coverage of validation, connector failure branches, pipeline outcomes, API and scheduled routing. |
| `tests/integration/d1-orbital-repository.test.ts`, `tests/integration/ingestion-pipeline.test.ts` | **Create.** Real-SQL conditional-publication semantics and end-to-end scheduled ingestion → D1 → API against the sqlite shim. |
| `README.md` | **Modify.** Mark the roadmap item and document local run/verification commands plus pending remote provisioning. |

### Verification and release criteria

- **Checks.** `pnpm check`, `pnpm test`, `pnpm build` must pass; Playwright e2e (`pnpm test:e2e`) must remain green (no page changes expected).
- **Local Worker.** Apply the migration to local D1, run `wrangler dev --test-scheduled`, trigger the cron, and require a 200 API response with provenance for each ingested Sentinel-2 spacecraft; repeat with a failing upstream to confirm preservation.
- **Unit/integration.** All fixture tests above pass, including older/equal-epoch skips, out-of-order publication, failure preservation, no-retry behavior, and the API status matrix.
- **Release (pending, not done here).** See "Remaining release work".

## Remaining release work (live provisioning — intentionally not done in this change)

1. `wrangler d1 create europe-in-space` and replace the placeholder `database_id` in `wrangler.jsonc`; apply `worker/migrations` to preview and production D1.
2. Deploy and verify the cron trigger, scheduled ingestion, and API in the target environment (ADR-016 "Validation before release", EIS-019/EIS-020).
3. Confirm redistribution/attribution terms for the exact CelesTrak feed and for any real orbital elements before committing recorded fixtures or publishing datasets publicly (TDD §8.1 step 2; CelesTrak usage policy).
4. Choose the tracker spacecraft (prefer Sentinel-2C) after the TDD §8.1 accuracy comparison across daily cycles and a missed run; set per-spacecraft freshness thresholds (TDD §8.6) before EIS-011+.
5. Validate the daily cadence against element age and a missed run in the target environment and adjust `triggers.crons` if warranted.

## Open questions

- Keep `FORMAT=JSON` (ADR-010) or switch single-object fetches to `FORMAT=CSV` per CelesTrak's size guidance? Current choice: JSON (~300 B per object, schema-friendly).
- Should `ingestion_runs` rows be pruned (e.g., keep 90 days) to bound D1 growth on the free tier?
- Does the API need an `ETag`/`Last-Modified` beyond `max-age=300` once the tracker consumes it?
