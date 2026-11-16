# ADR-009: Cloudflare KV for Initial Orbital Persistence

- **Status:** Accepted
- **Date:** 2026-11-15
- **Decision owners:** Project maintainer
- **Scope:** Europe in Space / First Orbit

## Context

The *First Orbit* milestone needs to serve a small set of validated CelesTrak orbital-element records to browser clients. Updates are infrequent, reads are key-based, and there is no current requirement for joins, transactions, user-generated records, or a relational query interface.

The accepted [ADR-006](006-cloudflare-free-first-architecture.md) sets Cloudflare Free as the initial target; [ADR-007](007-cloud-portability.md) requires infrastructure-specific persistence to remain replaceable; [ADR-008](008-static-content-before-database.md) requires deferring unnecessary storage. Scheduled orbital updates must be published without rebuilding the website.

## Decision

For First Orbit, store the latest validated orbital dataset in **Cloudflare Workers KV**, accessed only through a provider-neutral `OrbitalDatasetRepository` contract.

- Key data by verified NORAD catalog identifier, e.g. `orbital:latest:{catalogId}`.
- Store orbital epoch, retrieval timestamp, provider, source URL, schema version, and the complete validated record together as one value.
- Publish the latest valid record only after full validation; preserve it on failed ingestion.
- Compare orbital element epochs for the same catalog identifier before publishing. An incoming record with an older epoch must not automatically replace a newer stored record, even if retrieved more recently. Log the skipped update and preserve the newer record.
- Store ingestion health metadata separately if needed.
- Restrict the initial dataset to an allowlist of spacecraft.
- Explicitly tolerate eventual consistency; never rely on global read-after-write guarantees.
- Keep content descriptions in version-controlled Astro collections, not KV.

Serve the cached orbital dataset only through the Worker API for First Orbit. Do not publish an additional static JSON artifact.

## Rationale

KV matches low-frequency writes and simple key lookups, supports Cron-triggered ingestion without rebuilding the site, and has a small conceptual footprint. Isolating KV behind a repository interface limits lock-in.

## Consequences

### Positive
- Ingestion and site deployment can proceed independently.
- API reads are simple and can be cached.
- No relational database operations or migrations are needed initially.

### Negative / trade-offs
- Eventually consistent reads can return different versions in different locations temporarily.
- KV and Worker free-tier quotas and service availability constrain operation.
- KV is not suitable for relational queries or transactional multi-record changes.
- Moving fully to Vercel requires replacing storage and scheduled ingestion.

## Alternatives Considered

1. **Versioned static JSON in the deployment** — least operational complexity and most portable; requires a build/deployment or an external publication flow to update records. Rejected as the primary store because scheduled updates should not require rebuilding the website.
2. **Cloudflare D1** — relational querying and stronger transaction capabilities, but premature for a few orbital records.
3. **Remote CelesTrak fetch from every browser** — rejected for provider load, quotas, inconsistent availability, and lack of controlled validation.
4. **Cloudflare R2 / other object storage** — viable for immutable versioned datasets, but adds a different storage surface and configuration.

## Validation Before Release

- Demonstrate an end-to-end scheduled update and cached read on Cloudflare Free.
- Verify provider access policy, data age warnings, KV usage, and stale-data behavior.
- Verify the core and CelesTrak connector do not import Cloudflare APIs.
- Verify that an older valid record cannot replace a newer record, including delayed or overlapping ingestion runs. A read-compare-write sequence against eventually consistent KV alone does not establish this guarantee; validate the ingestion coordination approach before release.

## Revisit When

A catalog requires relational queries, transactional updates, a new hosting provider, or higher write/read scale.
