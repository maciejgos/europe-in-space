# Architecture Decision Records

This index links to the individual decision records, which are authoritative for approval status and technical decisions.

| ID | Decision | Status |
|---|---|---|
| ADR-001 | [Server-side data aggregation](./001-server-side-data-aggregation.md) | Accepted |
| ADR-002 | [Client-side orbital computation](./002-client-side-orbital-computation.md) | Accepted |
| ADR-003 | [Provenance-first data model](./003-provenance-first-data-model.md) | Accepted |
| ADR-004 | [Modular feature boundaries](./004-modular-feature-boundaries.md) | Accepted |
| ADR-005 | [Avoid premature infrastructure complexity](./005-avoid-premature-infrastructure-complexity.md) | Accepted |
| ADR-006 | [Cloudflare Free-first architecture](./006-cloudflare-free-first-architecture.md) | Accepted |
| ADR-007 | [Cloud portability](./007-cloud-portability.md) | Accepted |
| ADR-008 | [Static content before database](./008-static-content-before-database.md) | Accepted |
| ADR-009 | [Cloudflare KV for Initial Orbital Persistence](009-cloudflare-kv-for-initial-orbital-persistence.md) | Superseded by ADR-016 |
| ADR-010 | [OMM JSON as the Preferred Orbital Data Format](010-omm-json-as-orbital-data-format.md) | Accepted |
| ADR-011 | [Client-side SGP4 propagation](./011-client-side-sgp4-propagation.md) | Accepted |
| ADR-012 | [Astro Static Generation for the Public Website](012-astro-static-generation.md) | Accepted |
| ADR-013 | [Single Repository and Modular Monolith](013-single-repository-modular-monolith.md) | Accepted |
| ADR-014 | [Token-Free 3D Globe for First Orbit](014-token-free-3d-globe.md) | Accepted |
| ADR-015 | [AI-Assisted Development and Transparency](015-ai-assisted-development-and-transparency.md) | Accepted |
| ADR-016 | [D1 for First Orbit orbital persistence](016-d1-for-first-orbit-orbital-persistence.md) | Accepted |

## Conventions

Each ADR records context, decision, rationale, consequences, and alternatives. Once accepted, an ADR should be superseded by a new ADR rather than silently rewritten when the decision changes. **Accepted** means the project maintainer has approved the architectural choice. It does not mean implementation or technical validation is complete. **Proposed** means the choice still awaits approval, including explicitly deferred decisions. Technical checks belong under **Validation Before Release** and must pass before releasing the affected feature. Record approval when it occurs; do not keep an approved choice Proposed solely because implementation checks are pending. Approval of one part of an ADR does not automatically accept its remaining proposals.
