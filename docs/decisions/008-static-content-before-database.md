# ADR-008: Static content before database

- **Status:** Accepted
- **Date:** 2026-11-15
- **Project:** Europe in Space
- **Scope:** First Orbit and relevant subsequent features

## Context
The first milestone needs a small curated mission catalog and one spacecraft association. This content changes relatively infrequently and can be reviewed through Git. A relational database would add unnecessary setup, migrations, and operations.

## Decision
Store curated editorial content (missions, organizations, source references, and eventually observatories) as version-controlled Markdown/MDX/JSON, using Astro content validation. Introduce a database only when structured queries, automated updates, ingestion history, or scale require one. Frequently changing orbital datasets are a separate concern and use the orbital storage adapter specified in [ADR-016](016-d1-for-first-orbit-orbital-persistence.md).

## Rationale
- Static pages are fast and portable.
- Content changes are reviewable and reproducible.
- Avoid database cost and runtime dependency before needed.

## Consequences
- Editorial updates normally require a build and deployment.
- Cross-record references must be checked at build time.
- Dynamic catalog features may later justify D1 or another database behind repository interfaces.

## Alternatives considered
- **Start with D1 for everything:** rejected for unnecessary persistence complexity.
- **Hard-code records inside UI components:** rejected due to weak validation and maintainability.

## References
- [Project architecture](../../ARCHITECTURE.md)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
