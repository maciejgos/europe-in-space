# ADR-016 — D1 for First Orbit orbital persistence

**Status:** Accepted  
**Decision owner:** Project maintainer  
**Supersedes:** [ADR-009](009-cloudflare-kv-for-initial-orbital-persistence.md)

## Context

Delayed or overlapping ingestion runs can finish in reverse epoch order. A separate read, compare, and write against Workers KV cannot enforce that the published orbital epoch only advances.

## Decision

- Store one latest validated orbital dataset per supported spacecraft in Cloudflare D1, keyed by verified NORAD catalog identifier. Store its normalized epoch, elements, retrieval timestamp, provenance, and schema version together.
- Publish a candidate using one conditional insert or update. Insert when no record exists. Replace a record only if the incoming epoch is strictly newer. Older and equal epochs leave the published record unchanged. Track ingestion health separately.
- Keep the provider-neutral orbital repository interface. The Worker API serves orbital data directly from D1. Editorial content stays in version-controlled Astro collections.
- Set the refresh schedule in deployment configuration. Start with one run per day in UTC and validate the schedule for the selected spacecraft before release. Adjust it if prediction freshness or missed-run behavior warrants a different interval.

## Rationale and trade-offs

D1 makes the epoch condition part of the write and keeps the read path on the same store. A Durable Object could enforce the same rule. Adding KV as a separate read layer would also require publication and retry handling. D1 requires a schema migration and remains subject to plan quotas.

## Validation before release

- Verify initial insert, newer update, older update, equal-epoch retry, and preservation of the last valid record after a failed update.
- Finish an older ingestion after a newer one commits and verify the Worker API still serves the newer epoch.
- Verify scheduled ingestion in the target environment. Assess the orbital epoch age during a full daily cycle and after a missed refresh for the selected spacecraft.
