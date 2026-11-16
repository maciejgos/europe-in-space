# ADR-014: Token-Free 3D Globe for First Orbit

- **Status:** Proposed
- **Date:** 2026-11-15
- **Decision owners:** Project maintainer
- **Scope:** Europe in Space / First Orbit

## Context

First Orbit requires an interactive Earth visualization with spacecraft markers and orbital trajectories. CesiumJS is open-source, but its common default globe imagery, terrain, or related hosted services may use Cesium ion or another provider with account, token, usage, or licensing requirements. The accepted Cloudflare Free-first decision favors no mandatory paid external map service.

## Proposed Decision

**Decision deferred:** Before implementing the globe imagery feature, compare locally served Earth textures with hosted imagery services. Assess licensing and attribution, free-tier limits and potential costs, account/token requirements, privacy, reliability, visual detail, and browser/mobile performance. The token-free approach and untextured fallback below remain proposals pending that analysis; neither has been accepted. The accepted requirement to avoid mandatory paid infrastructure remains in force.

Build the first CesiumJS viewer **without relying on a paid Cesium ion service or a mandatory provider-issued token**. Use the WGS84 ellipsoid and either a suitably licensed, locally served Earth texture/imagery layer or another verified token-free imagery source with compliant usage terms.

- Configure imagery and terrain explicitly instead of relying on hosted defaults.
- Verify image licensing, distribution permissions, attribution, and any caching rules before committing assets.
- Support an untextured globe if a compliant imagery source is not yet selected.
- Keep imagery configuration separate from orbit rendering so the provider can be changed.
- Avoid introducing paid basemap/terrain usage as a hidden MVP requirement.
- Preserve the possibility of optional enhanced imagery in later milestones.

*Token-free* does not mean *license-free* or unlimited consumption of a third-party tile endpoint.

## Rationale

The core feature is orbital visualization, not photorealistic terrain. A simple globe is adequate for the first vertical slice, reduces cost and dependency risk, and supports future provider changes.

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

1. **Cesium ion free allocation** — useful for experimentation, but may require an account/token and introduces service conditions.
2. **Public OSM-style tile servers** — not automatically acceptable for high-volume globe rendering or bulk caching; policies vary.
3. **Paid imagery/terrain provider** — improved visuals but conflicts with the initial cost target.
4. **Build a custom 3D globe renderer** — unnecessary effort relative to First Orbit needs.

## Validation Before Release

- Render a Cesium globe in production with no required paid service or secret token.
- Verify imagery license, attribution, and usage policy.
- Test browser loading, mobile performance, and WebGL fallback.
- Ensure satellite markers and orbit paths work with the plain WGS84 ellipsoid.

## Revisit When

Higher-resolution terrain, advanced imagery, map labels, or large-scale usage merits a different provider or licensing arrangement.
