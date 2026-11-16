# ADR-011: Client-side SGP4 propagation

- **Status:** Accepted
- **Date:** 2026-11-15
- **Project:** Europe in Space
- **Scope:** First Orbit and relevant subsequent features

## Context
First Orbit must compute plausible, reproducible predicted satellite positions from publicly available orbital elements. Orbital propagation is scientifically sensitive: coordinate frames, time standards, data epoch, and numerical validation matter.

## Decision
Use the SGP4 propagation method through `satellite.js` in the visitor's browser for supported Earth-orbiting spacecraft. Ingest validated CelesTrak GP/OMM data, initialize the appropriate satellite record, propagate it at an explicit UTC simulation time, handle propagation failures, and convert coordinates to the frame and units required by CesiumJS. Use independent known test vectors or trusted reference calculations to verify numerical results.

SGP4-derived positions are **predictions**, not live telemetry, and must not be used for operational navigation or collision avoidance. Deep-space mission ephemerides may require other models and are outside this ADR.

## Rationale
- SGP4 is the established method for compatible general-perturbations element sets.
- `satellite.js` offers a JavaScript implementation suitable for browser execution.
- Deterministic tests can verify parsing, propagation, and coordinate conversions.
- This ADR specifies the *algorithm and scientific treatment*; ADR-002 specifies the *execution location*.

## Consequences
- Preserve original element epoch and distinguish it from fetch and prediction times.
- Avoid mixing TEME, Earth-fixed, geodetic, and Cesium frames or kilometers/meters.
- Stale or unsupported elements must result in warnings or unavailable states, not fabricated positions.
- Performance and numerical tolerances must be measured and documented.

## Alternatives considered
- **Keplerian two-body propagation:** rejected for compatibility and accuracy expectations with GP elements.
- **Server-side SGP4 on each animation step:** rejected under ADR-002.
- **Assume all spacecraft share GP/SGP4 data:** rejected; deep-space missions need other data/ephemeris methods.

## References
- [Project architecture](../../ARCHITECTURE.md)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
