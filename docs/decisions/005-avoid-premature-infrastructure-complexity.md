# ADR-005: Avoid premature infrastructure complexity

- **Status:** Accepted
- **Date:** 2026-11-15
- **Project:** Europe in Space
- **Scope:** First Orbit and relevant subsequent features

## Context
Europe in Space is a non-commercial pet project with limited maintenance time and a zero-cost hosting target. The first milestone has one mission, one spacecraft, scheduled updates, and a browser-based tracker.

## Decision
Use the simplest reliable deployment and data flow that meets current requirements. Prefer a modular monolith, static content, lightweight Workers endpoints, and a small scheduled ingestion job. Do not introduce Kubernetes, microservices, distributed message queues, or complex orchestration without demonstrated need.

## Rationale
- Maximize time spent on the space exploration experience.
- Minimize cost, security surface, maintenance, and deployment risk.
- Preserve flexibility through clear boundaries instead of distributed infrastructure.

## Consequences
- Scaling and failure isolation are less granular initially.
- Revisit deployment topology only in response to concrete usage or reliability evidence.
- Simplicity does not eliminate testing, logging, schema validation, or recovery from failed ingestion.

## Alternatives considered
- **Microservices/event-driven pipeline from inception:** rejected for unjustified complexity.
- **Dedicated always-on server:** unnecessary for current static and scheduled workloads.

## References
- [Project architecture](../../ARCHITECTURE.md)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
