# ADR-006: Cloudflare Free-first architecture

- **Status:** Accepted
- **Date:** 2026-11-15
- **Project:** Europe in Space
- **Scope:** First Orbit and relevant subsequent features

## Context
The project is an independently maintained pet project. A recurring hosting bill is undesirable. Cloudflare provides free-tier static assets, lightweight serverless execution, and selected storage/scheduling services, each subject to current published quotas and terms.

## Decision
Use Cloudflare Free as the initial deployment target and design the First Orbit milestone to require no paid infrastructure services. Serve static content as assets, run small API and ingestion handlers in Workers where needed, and perform orbital propagation in the browser. The domain registration cost is excluded from the hosting target.

## Rationale
- Keep ongoing operating costs and maintenance low.
- Fit the workload to static hosting, caching, and scheduled updates.
- Encourage efficient resource use and graceful degradation.

## Consequences
- Free quotas and resource limits must be reviewed against official documentation before deployment and periodically thereafter.
- Some optional features (large imagery, intensive processing, high traffic) may need redesign or paid services later.
- The target is **€0/month for MVP infrastructure**, not a guarantee of unlimited zero-cost service.
- Do not enable billable add-ons without an explicit decision.

## Alternatives considered
- **Paid server/VPS:** not necessary for the MVP.
- **Vercel Hobby as first host:** viable for a personal non-commercial project, but Cloudflare is the initial preference; ADR-007 preserves migration flexibility.

## References
- [Project architecture](../../ARCHITECTURE.md)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
