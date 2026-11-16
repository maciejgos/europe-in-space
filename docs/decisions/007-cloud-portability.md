# ADR-007: Cloud portability

- **Status:** Accepted
- **Date:** 2026-11-15
- **Project:** Europe in Space
- **Scope:** First Orbit and relevant subsequent features

## Context
Cloudflare is the preferred initial host, but the project may move to Vercel or another provider. Storage bindings, scheduling hooks, and request handlers differ between platforms.

## Decision
Keep mission logic, orbital calculations, data validation, data source connectors, content, and browser visualization independent of hosting-provider APIs. Isolate storage, scheduling, and runtime handlers behind small infrastructure adapters or clear boundaries. Maintain schemas, configuration guidance, and migrations in source control as applicable. Do **not** implement a Vercel adapter until a move is justified.

## Rationale
- Reduce vendor lock-in without incurring multi-cloud complexity now.
- Keep core features testable locally.
- Limit future migration primarily to hosting and persistence concerns.

## Consequences
- Cloudflare-specific D1/Workers types belong at infrastructure edges.
- A full migration may require data export, a replacement datastore, and new scheduled jobs.
- Portability means avoiding a *substantial core application rewrite*, not guaranteeing zero migration effort.
- Deployment portability should be checked through build/test contracts, not by maintaining duplicate production stacks.

## Alternatives considered
- **Deep Cloudflare binding throughout the app:** rejected for migration risk.
- **Build and operate both providers immediately:** rejected as premature complexity.

## References
- [Project architecture](../../ARCHITECTURE.md)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
