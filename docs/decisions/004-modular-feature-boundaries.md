# ADR-004: Modular feature boundaries

- **Status:** Accepted
- **Date:** 2026-11-15
- **Project:** Europe in Space
- **Scope:** First Orbit and relevant subsequent features

## Context
The project will grow from a mission explorer and one satellite tracker to imagery, observatories, launches, and potentially deep-space data. These features have different sources, models, and update cadences.

## Decision
Organize code by coherent feature/domain boundaries (missions, spacecraft/orbital calculations, imagery, observatories, launches), with shared contracts only where justified. Separate domain models and application logic from UI and provider-specific adapters. Begin within one application/repository; module boundaries do not require microservices or separate packages.

## Rationale
- Support testing and incremental delivery.
- Avoid coupling unrelated sources and feature lifecycles.
- Enable future hosting or persistence changes without rewriting business logic.

## Consequences
- Cross-feature links, such as mission-to-spacecraft, require stable identifiers and explicit contracts.
- Avoid premature generic abstractions; introduce interfaces where an actual boundary exists.
- Feature modules may share validated source/provenance primitives.

## Alternatives considered
- **One large undifferentiated application module:** rejected due to growing coupling.
- **Separate service per feature from day one:** rejected as operational overengineering.

## References
- [Project architecture](../../ARCHITECTURE.md)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
