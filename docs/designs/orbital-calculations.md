# First Orbit calculation and numerical validation

Use satellite.js 6.0.1 with its JavaScript SGP4 path and WGS-72 gravity
constants. The input is CelesTrak GP OMM JSON with UTC epochs, TEME
elements, Earth as the central body, and SGP4 mean-element theory. CelesTrak
can omit those metadata fields. The supported GP ephemeris type is 0. The initializer checks propagation
at the element epoch.

Return TEME-of-date Cartesian coordinates in kilometers. For each sample,
rotate about the Z axis by negative IAU 1982 Greenwich mean sidereal time
to obtain pseudo-Earth-fixed (PEF) coordinates, then scale to meters for
Cesium. Use UTC as UT1 (DUT1 = 0) and omit polar motion. This approximates
Earth-fixed coordinates for visualization. Derive geodetic longitude,
latitude, and ellipsoid height using WGS84 (semi-major axis 6378137 m and
inverse flattening 298.257223563). Longitude is in [-180, 180] degrees,
latitude in [-90, 90] degrees, and height in kilometers.

Prediction times are explicit JavaScript Date instants with millisecond
resolution and no leap-second representation. Derive elapsed SGP4 time
from the source OMM epoch, including its sub-millisecond fraction. The
pinned library uses millisecond precision for epoch-dependent internal
initialization. A path starts
at its requested instant and ends one mean-motion period later. Include
both endpoints. Default to 60-second spacing and cap the path at 512
points by widening the effective spacing as needed.

## Independent references and acceptance

- Use Vallado et al., AIAA 2006-6753 Rev. 2, Appendices D and E, case
  00005 (Vanguard 1). Map its TLE to OMM and use the production
  initializer. The reference epoch is 2000 day 179.78495062
  (2000-06-27T18:50:19.733568Z). Test at 2000-06-27T18:50:19.734Z and
  2000-06-28T00:50:19.734Z (+360 minutes). Allow 0.01 km per TEME
  component for millisecond rounding and Julian-date arithmetic.
  [Published inputs and vectors](https://celestrak.org/publications/AIAA/2006-6753/AIAA-2006-6753-Rev2.pdf)
- Use ERFA GMST82, RZ and GC2GD with WGS84 on the published TEME vectors
  at both timestamps. Identify UTC with UT1 and apply no polar motion.
  Compare the resulting reference values with the full production
  pipeline to within 10 m per Cartesian component, 0.0001 degrees per
  geodetic angle and 0.01 km in ellipsoid height. These tolerances
  include the small propagated position shift due to millisecond
  rounding. [ERFA reference implementation](https://github.com/liberfa/erfa/tree/v2.0.1/src)

The Copernicus operator-orbit comparison and public freshness thresholds
are deferred. These checks measure numerical agreement with the published
case and coordinate references.

The coordinate reference was generated with PyERFA 2.0.1.5 using
`dtf2d("UT1", ...)`, `rxp(rz(gmst82(*jd), eye(3)), temeKm * 1000)`,
and `gc2gd(1, pef)`. The reference values are recorded in the orbital
calculation test.

Resonant deep-space propagation has a ten-year computational limit
relative to the element epoch because SGP4 integrates resonance in
fixed-size steps. This limit bounds work and does not establish
prediction accuracy or a public freshness threshold.

## Integration

Call `initializeOrbit(dataset)` once per element set and reuse the returned
`calculatePosition(time)` and `sampleOrbit(start, intervalSeconds)` methods.
They throw `OrbitCalculationError` with a stable code. A failed sample stops
the path calculation before it returns any points. The module performs no
network or clock reads. A future ingestion pipeline can use the initializer
to reject unusable elements before publication.

The 6.0.1 package provides a JavaScript ESM bundle for browser bundlers
and a CommonJS entry point for Node. The 7.2.0 root entry also exposes
optional WASM runtimes that introduce Node built-in imports during browser
bundling. The 6.0.1 pin keeps the shared module portable with the current
browser and Worker build configurations.
