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

## EIS-014 implementation

The static Astro route at `/satellites/` serves a world map if JavaScript is disabled, WebGL 2 is unavailable, or the interactive globe fails. The route loads CesiumJS 1.147.0 on demand and uses a `CesiumWidget` with an explicit WGS84 globe, ellipsoid terrain provider, and same-origin single-tile imagery. The ion token is cleared, and no ion imagery, hosted terrain, geocoder, or provider picker is configured. Rendering is on demand, with a fixed initial view at 15° E, 50° N.

The basemap is [Natural Earth II by Tom Patterson](https://www.shadedrelief.com/natural2/index.html), sourced from the CesiumJS 1.147.0 package at `Build/Cesium/Assets/Textures/NaturalEarthII`. The package [license notices](https://github.com/CesiumGS/cesium/blob/1.147/LICENSE.md) identify the Natural Earth data as public domain. The publisher's [terms of use](https://www.naturalearthdata.com/about/terms-of-use/) permit modification and redistribution, including in this repository and on the public site. Both views display “Made with Natural Earth.”

The asset at `public/maps/natural-earth-ii.jpg` stitches the 32 level-2 JPEG tiles (256 × 256, TMS numbering from the south) into a 2048 × 1024 EPSG:4326 raster. The only processing is stitching and sRGB JPEG re-encoding at quality 0.68. The raster is **379,046 bytes** (370 KiB). SHA-256 is `82368b52ad800cad387f4966e0fc969632244ffb684276c64783232967d55132`. It is geographic map data. The Europe-at-night artwork used elsewhere on the site is illustrative.

Development and production serve version-matched Cesium workers and runtime data under `/cesium/`. Cesium uses its bundled approximate terrain heights table to initialize ground primitive support and IAU2006 XYS coefficients for frame transforms. The rendered surface uses ellipsoid geometry. The production Cesium JavaScript chunk is about 3.92 MB minified and 1.03 MB gzip-compressed. The browser requests the chunk only on the tracker route.

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

## Foundation verification

- Chromium against a fresh production preview exercised desktop drag and wheel zoom, keyboard camera controls, and touch rotation and pinch zoom at 390 × 844. The full globe was visible at rest at 1440 × 1000 and 390 × 844. The suite also covered JavaScript-disabled, WebGL-disabled, and failed-module fallbacks.
- Production request checks confirmed same-origin map imagery, terrain mesh workers, and both runtime data paths, with no cross-origin HTTP requests or browser errors during desktop interaction. Home, mission catalog, Sentinel-2, and observatory pages requested no globe code, workers, or imagery.
- A separate development smoke test confirmed that the interactive globe loaded and both runtime data paths resolved successfully.
- Representative physical-phone performance under a documented network profile and a deployed production smoke test remain release checks.

## Validation Before Release

- Render a Cesium globe in production with no required paid service or secret token.
- Verify imagery license, attribution, and usage policy.
- Test browser loading, mobile performance, and WebGL fallback.
- Verify that marker and orbit path rendering works independently of imagery when those features are implemented.

## Revisit When

Higher-resolution terrain, advanced imagery, map labels, or large-scale usage merits a different provider or licensing arrangement.
