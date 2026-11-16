# ADR-014: Token-Free 3D Globe for First Orbit

- **Status:** Accepted
- **Date:** 2026-11-15
- **Decision owners:** Project maintainer
- **Scope:** Europe in Space / First Orbit

## Context

First Orbit requires an interactive Earth visualization with spacecraft markers and orbital trajectories. CesiumJS is open-source, but its common default globe imagery, terrain, or related hosted services may use Cesium ion or another provider with account, token, usage, or licensing requirements. The accepted Cloudflare Free-first decision favors no mandatory paid external map service.

## Decision

Render the WGS84 ellipsoid in CesiumJS with a low-resolution Earth texture served from the project's own static assets. Configure imagery and terrain explicitly. The tracker loads its imagery from the same origin without a provider token, third-party tiles, or hosted terrain.

Choose the exact asset before integrating it. Verify terms for redistribution in the repository and on the public site, record the source and any modifications, and display the required attribution. Measure the texture's download size and rendering performance on a representative phone. A plain ellipsoid remains an option if an eligible texture cannot meet those checks, pending a separate decision.

## Rationale

A local texture provides geographic context and keeps the globe available without an imagery service. An appropriately sized asset limits mobile download cost.

## Consequences

### Positive
- No mandatory paid imagery API or token-management step.
- More predictable free-tier footprint.
- Spacecraft tracking remains independent of basemap providers.

### Negative / trade-offs
- The first globe may have less detail than commercial imagery services.
- Selecting and preparing legally reusable Earth imagery requires review.
- Cesium asset bundling, workers, and performance still require correct configuration.

## Alternatives Considered

A plain ellipsoid can display the trajectory with a smaller download. It removes recognizable geographic features.

1. **Cesium ion free allocation** — useful for experimentation, but may require an account/token and introduces service conditions.
2. **Public OSM-style tile servers** — not automatically acceptable for high-volume globe rendering or bulk caching; policies vary.
3. **Paid imagery/terrain provider** — improved visuals but conflicts with the initial cost target.
4. **Build a custom 3D globe renderer** — unnecessary effort relative to First Orbit needs.

## Validation Before Release

- Render a Cesium globe in production with no required paid service or secret token.
- Verify imagery license, attribution, and usage policy.
- Test browser loading, mobile performance, and WebGL fallback.
- Verify that marker and orbit path rendering works independently of imagery and that required attribution is visible.

## Revisit When

Higher-resolution terrain, advanced imagery, map labels, or large-scale usage merits a different provider or licensing arrangement.
