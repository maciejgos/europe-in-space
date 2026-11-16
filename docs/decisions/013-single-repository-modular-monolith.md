# ADR-013: Single Repository and Modular Monolith

- **Status:** Accepted
- **Date:** 2026-11-15
- **Decision owners:** Project maintainer
- **Scope:** Europe in Space / First Orbit

## Context

Europe in Space is a solo-maintained pet project. The First Orbit scope contains one static website, an interactive satellite tracker, a small data API, and scheduled ingestion. The project needs clear separation of concerns without creating unnecessary release, package, and operational coordination.

## Decision

Keep **one Git repository with one application and a small Worker runtime**, organized into modules for presentation, core domain, orbital calculations, integrations, and infrastructure. Deploy the static site, Worker API, and scheduled ingestion together in one Cloudflare Workers Static Assets deployment for First Orbit.

- Start with `src/` and `worker/` rather than a multi-package workspace.
- Separate modules by responsibility with explicit import boundaries.
- Keep domain logic and calculations independent of UI and Cloudflare runtime types.
- Keep API contracts and data schema changes in the same repository.
- Introduce shared packages, additional applications, or services only after demonstrated reuse or scaling needs.

The phrase *modular monolith* describes **code ownership and deployment simplicity**; it does not require every process to execute in the same runtime. Browser computation and Worker scheduling remain separate runtime activities.

## Rationale

A single repository reduces initial maintenance burden while supporting tests and portability. Modules provide adequate boundaries for the anticipated product evolution.

## Consequences

### Positive
- One codebase for changes spanning mission, tracker, API and ingestion.
- Simplified CI, dependency updates, versioning and local development.
- Architectural boundaries can be enforced without extra workspace tooling.

### Negative / trade-offs
- Build and deployment concerns can become coupled as the project expands.
- Poor discipline can lead to unwanted module imports despite the intended layering.
- More sophisticated workloads may eventually justify separate deployables.

## Alternatives Considered

1. **Monorepo with packages and applications** — flexible but unnecessary workspace and build complexity for First Orbit.
2. **Separate API and frontend repositories** — clearer service autonomy at the cost of coordination and schema drift.
3. **Microservices** — disproportionate operational overhead.
4. **Single undifferentiated source folder** — simplest initially but increases coupling risk.

## Validation Before Release

- Establish `src/core`, `src/integrations`, `src/features`, and `worker` boundaries only where needed.
- Show that core tests run without Astro, Cesium, or Cloudflare runtimes.
- Confirm CI builds and deploys the application reproducibly.

## Revisit When

Multiple independent contributors or deployable products need separate ownership, release cycles or operational scaling.
