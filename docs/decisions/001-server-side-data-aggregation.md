# ADR-001: Server-side data aggregation

- **Status:** Accepted
- **Date:** 2026-11-15
- **Project:** Europe in Space
- **Scope:** First Orbit and relevant subsequent features

## Context
Europe in Space consumes scientific data from providers with different availability, response formats, licensing requirements, and request limits. Allowing each browser to fetch directly from these providers could multiply traffic, expose the site to provider outages, complicate provenance, and make data validation inconsistent.

## Decision
For frequently reused or rate-limited external datasets, ingest data through controlled server-side jobs, validate and normalize it, and serve a cached representation to clients. The initial automated source is CelesTrak orbital elements. Curated mission information may remain in source-controlled static content instead of requiring a server ingestion pipeline.

Browser-side direct access is permitted for integrations where the provider explicitly supports it and it is appropriate for usage, licensing, reliability, and security; this is not a blanket proxy requirement.

## Rationale
- Limit repeated upstream requests and respect provider policies.
- Preserve source timestamps, attribution, and processing metadata.
- Deliver consistent, validated data and continue serving acceptable cached data during transient outages.
- Keep API provider details out of presentation components.

## Consequences
- Scheduled ingestion and cache invalidation must be maintained.
- Cached data may lag the upstream source; the UI must disclose relevant freshness and epoch information.
- A provider failure must not overwrite the most recent valid record.
- External data and links are untrusted and require validation.

## Alternatives considered
- **Browser-to-provider requests for every visitor:** rejected for the initial orbital dataset due to rate-limit and resilience concerns.
- **Fetch on every application API request:** rejected for unnecessary provider load and slower requests.
- **Manually updating all data:** useful for small editorial catalogs, insufficient for changing orbital elements.

## References
- [Project architecture](../../ARCHITECTURE.md)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
