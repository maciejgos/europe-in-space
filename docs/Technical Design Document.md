# Europe in Space
## Technical Design Document — First Orbit

**Version:** 1.0  
**Date:** November 15, 2026  
**Status:** Proposed — implementation-ready design  
**Related document:** Europe in Space PRD v1.1  
**Milestone:** First Orbit  
**Domain:** europeinspace.org  
**Target hosting:** Cloudflare Free  
**Future portability:** Vercel

---

# 1. Executive Summary

First Orbit is the initial engineering milestone for Europe in Space, an independent, open-source platform for exploring European space missions and scientific data.

The milestone will deliver a working vertical slice connecting a European space mission with a real spacecraft and an interactive visualization of its predicted position in Earth orbit.

The first implementation will use the Sentinel-2 mission and one associated spacecraft, subject to verification of its current orbital data.

The solution will be designed around three principles:

1. **Static-first:** Generate mission content at build time and minimize runtime infrastructure.
2. **Client-side visualization:** Perform orbital calculations and render the 3D Earth in the visitor's browser.
3. **Infrastructure portability:** Keep business logic independent of Cloudflare.

The production environment will initially run on Cloudflare Free without requiring paid infrastructure services.

## 1.1 Expected User Experience

A visitor opens `europeinspace.org`, discovers the Sentinel-2 mission, and selects the option to explore its associated spacecraft.

The application opens an interactive globe displaying:

- Earth.
- A spacecraft's predicted position.
- Its orbital trajectory.
- Its predicted ground track.
- Basic spacecraft metadata.
- The current prediction timestamp.
- The epoch and freshness of the orbital data.
- A link to the original orbital data source.

The spacecraft moves as simulation time advances without requiring continuous requests to the backend.

## 1.2 Scope

First Orbit includes:

- Responsive website foundation.
- Initial homepage.
- One fully populated mission detail page.
- One verified spacecraft record.
- Mission-to-spacecraft navigation.
- CelesTrak integration.
- Orbital data caching.
- Browser-side SGP4 propagation.
- Interactive 3D visualization.
- A lightweight accessible data alternative.
- Automated testing.
- Cloudflare deployment.
- Basic technical documentation.

Additional missions, observatories, image galleries, launch calendars and Earth observation tools remain outside this milestone.

---

# 2. Architectural Drivers

## 2.1 Functional Drivers

| ID | Requirement |
|---|---|
| AD-001 | Display verified European mission data |
| AD-002 | Associate missions with spacecraft |
| AD-003 | Retrieve orbital data from CelesTrak |
| AD-004 | Calculate spacecraft positions from real orbital elements |
| AD-005 | Render a 3D Earth and satellite orbit |
| AD-006 | Display data provenance and freshness |
| AD-007 | Support desktop and mobile browsers |
| AD-008 | Remain useful during external data outages |

## 2.2 Quality Drivers

**Maintainability**

Components must have clear responsibilities and remain independently testable.

**Performance**

The static website must not require loading large visualization libraries until the user opens the tracker.

**Portability**

Mission logic, orbital calculations and data contracts must not depend on Cloudflare APIs.

**Reliability**

The platform should continue serving cached orbital data when CelesTrak is temporarily unavailable, while clearly identifying stale data.

**Cost efficiency**

The MVP must fit within Cloudflare Free limits.

**Scientific correctness**

Orbital calculations must use valid input data, correct coordinate systems and explicit timestamps.

**Accessibility**

Mission information and essential spacecraft data must remain accessible without a 3D canvas.

---

# 3. Architecture Overview

## 3.1 High-Level Architecture

```text
                        VISITOR
                           |
                           v
                europeinspace.org
                           |
             +-------------+-------------+
             |                           |
             v                           v
       STATIC WEBSITE              DATA API
       Astro + React               Cloudflare Worker
             |                           |
             |                           v
             |                     Cloudflare KV
             |                           ^
             |                           |
             |                    Scheduled Ingestion
             |                    Cloudflare Cron
             |                           |
             |                           v
             |                       CelesTrak
             |
             v
       SATELLITE TRACKER
       React + CesiumJS
             |
             v
       satellite.js / SGP4
             |
             v
       Browser Rendering
```

The system has two independent runtime responsibilities:

1. Deliver static content and browser application assets.
2. Provide cached orbital data and keep that cache updated.

All rendering and orbital propagation occur on the client.

## 3.2 Cloudflare Services

### Workers Static Assets

Host:

- Generated HTML.
- CSS.
- JavaScript.
- Local fonts.
- Small static datasets.
- Licensed imagery and assets.

### Cloudflare Worker

Provide a minimal HTTP API:

- Read cached satellite data.
- Return provenance and freshness metadata.
- Return appropriate errors for unavailable data.

The same Worker can execute scheduled ingestion.

### Cloudflare KV

Store the latest validated orbital records and ingestion metadata.

KV is selected because:

- The dataset is small.
- Reads are simple.
- Relational queries are unnecessary.
- Persistence survives application deployments.
- The free tier is sufficient for initial usage.

### Cron Triggers

Periodically retrieve orbital data from CelesTrak.

Initial refresh schedule: every six hours.

This is a conservative starting policy rather than a requirement for precise six-hour freshness. It can be adjusted after confirming source policies, observed data updates and platform quotas.

## 3.3 Why Not D1 Yet?

First Orbit does not require relational persistence.

Mission content is stored in source-controlled files.

The orbital data service needs only a small number of cached records.

D1 may become appropriate when the platform has a larger normalized catalog, automated mission ingestion or complex relationships.

---

# 4. Technology Stack

| Responsibility | Technology |
|---|---|
| Application framework | Astro |
| UI components | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Content validation | Zod |
| 3D Earth | CesiumJS |
| Orbital propagation | satellite.js |
| Static hosting | Cloudflare Workers Static Assets |
| API runtime | Cloudflare Workers |
| Orbital data cache | Cloudflare KV |
| Scheduling | Cloudflare Cron Triggers |
| Unit testing | Vitest |
| Browser testing | Playwright |
| Package management | pnpm |
| CI/CD | GitHub Actions |
| Deployment | Wrangler |

Dependency versions should be pinned and committed using the lockfile.

No Vercel-specific packages are required initially.

---

# 5. Repository Architecture

## 5.1 Recommended Initial Structure

```text
europeinspace/
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── data-sources.astro
│   │   ├── missions/
│   │   │   └── [slug].astro
│   │   └── satellites/
│   │       └── [id].astro
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── missions/
│   │   ├── satellites/
│   │   └── ui/
│   │
│   ├── features/
│   │   └── satellite-tracker/
│   │       ├── SatelliteTracker.tsx
│   │       ├── GlobeViewer.tsx
│   │       ├── SatelliteDetails.tsx
│   │       ├── OrbitPath.ts
│   │       └── useSatellitePosition.ts
│   │
│   ├── core/
│   │   ├── missions/
│   │   ├── satellites/
│   │   ├── orbital/
│   │   └── models/
│   │
│   ├── integrations/
│   │   └── celestrak/
│   │
│   ├── content/
│   │   └── missions/
│   │
│   ├── styles/
│   └── config/
│
├── worker/
│   ├── index.ts
│   ├── api/
│   ├── ingestion/
│   └── storage/
│
├── public/
│   └── assets/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── fixtures/
│   └── e2e/
│
├── .github/
│   └── workflows/
│
├── docs/
│   ├── architecture/
│   └── decisions/
│
├── astro.config.mjs
├── wrangler.jsonc
├── package.json
├── pnpm-lock.yaml
└── README.md
```

## 5.2 Structural Decision

Begin with one repository and one deployable application.

Do not introduce a monorepo or independent packages until reuse justifies the complexity.

The architecture should retain clear module boundaries without requiring additional build tooling.

## 5.3 Dependency Rules

**Presentation layer**

May depend on application services and domain models.

**Application core**

Must not import Cloudflare Workers, KV bindings, Astro runtime APIs or CesiumJS rendering objects.

**Data source integrations**

May implement contracts from the core but must not own business entities.

**Infrastructure**

Implements persistence, scheduling and deployment-specific functionality.

**Orbital mathematics**

Must remain independently testable without a browser or Cloudflare runtime.

---

# 6. Domain Model

## 6.1 Mission

```typescript
export interface Mission {
  id: string;
  slug: string;
  name: string;
  summary: string;

  category: MissionCategory;
  status: MissionStatus;

  organizations: string[];
  spacecraftIds: string[];

  launchDate?: string;
  officialUrl: string;

  sourceIds: string[];
  lastVerifiedAt: string;
}
```

## 6.2 Spacecraft

```typescript
export interface Spacecraft {
  id: string;
  name: string;

  missionId: string;
  noradCatalogId?: number;

  internationalDesignator?: string;

  status: SpacecraftStatus;

  trackable: boolean;
  officialUrl?: string;

  sourceIds: string[];
}
```

The NORAD catalog identifier is the primary link between curated spacecraft metadata and CelesTrak orbital records.

A spacecraft must not be marked as trackable merely because it belongs to an active mission.

## 6.3 Orbital Dataset

```typescript
export interface OrbitalDataset {
  spacecraftId: string;
  noradCatalogId: number;

  format: "OMM_JSON";
  elements: Record<string, unknown>;

  epoch: string;
  fetchedAt: string;

  source: {
    provider: "CelesTrak";
    url: string;
  };

  schemaVersion: number;
}
```

The production model should use a validated OMM schema instead of an unrestricted record.

Raw source fields should be preserved where needed for correct propagation.

## 6.4 Calculated Position

```typescript
export interface SatellitePosition {
  spacecraftId: string;
  timestamp: string;

  latitudeDeg: number;
  longitudeDeg: number;
  altitudeKm: number;

  positionEciKm: {
    x: number;
    y: number;
    z: number;
  };
}
```

All coordinate units must be explicit.

The project must not silently mix degrees and radians, kilometers and meters, or inertial and Earth-fixed reference frames.

---

# 7. Mission Content Management

## 7.1 Storage

Mission descriptions will be stored as Astro content collection entries, backed by Markdown or MDX files.

The collection must use schema validation.

Example:

```text
src/content/missions/
└── sentinel-2.md
```

## 7.2 Example Content

```yaml
---
id: sentinel-2
name: Sentinel-2
category: earth-observation
status: active
organizations:
  - ESA
spacecraftIds:
  - sentinel-2a
officialUrl: https://www.esa.int/
lastVerifiedAt: "2026-11-15"
---
```

This is illustrative content, not a verified final record. Mission-wide status and individual spacecraft status must be modeled separately.

## 7.3 Content Validation

The build must fail when required fields are missing or invalid.

Checks should include:

- Unique mission IDs.
- Unique slugs.
- Valid date formats.
- Valid source URLs.
- Existing spacecraft associations.
- Permitted status values.
- Required attribution metadata for images.

## 7.4 Initial Content Strategy

First Orbit requires one fully verified mission.

The broader PRD target of approximately 10 missions belongs to the complete MVP.

This separation prevents catalog production from blocking validation of the satellite tracker.

---

# 8. CelesTrak Integration

## 8.1 Source

CelesTrak's General Perturbations endpoint supports queries by catalog number and structured OMM JSON output.

Endpoint pattern:

```text
https://celestrak.org/NORAD/elements/gp.php
  ?CATNR={catalogNumber}
  &FORMAT=JSON
```

The catalog number must be obtained from verified spacecraft metadata.

Do not guess catalog identifiers from spacecraft names.

## 8.2 Format Decision

Use **CCSDS OMM JSON** rather than TLE as the preferred internal source format.

Reasons:

- Structured data.
- Explicit field names.
- Better suitability for future catalog expansion.
- Supported by recent satellite.js versions.

The implementation must explicitly request JSON because CelesTrak's default response format may differ.

## 8.3 Connector Contract

```typescript
export interface OrbitalDataProvider {
  getOrbitalElements(
    noradCatalogId: number
  ): Promise<OrbitalDataset>;
}
```

CelesTrak is one implementation of this interface.

A different orbital-data provider could be added later without changing the tracker.

## 8.4 Ingestion Workflow

1. Scheduled job starts.
2. Load the configured spacecraft catalog.
3. Retrieve OMM JSON from CelesTrak.
4. Validate the HTTP response.
5. Validate the payload schema.
6. Verify the returned catalog identifier.
7. Parse and validate the orbital epoch.
8. Validate that the orbital elements can be initialized for SGP4.
9. Compare the new record with the cached record.
10. Persist the new validated dataset.
11. Update ingestion metadata.
12. Log success or failure.

## 8.5 Failure Handling

If CelesTrak is unavailable:

- Do not delete the previous record.
- Preserve the most recent valid dataset.
- Record the failure.
- Continue serving cached data with a warning.
- Avoid aggressive retries.

If a response is empty, malformed or inconsistent:

- Reject the update.
- Preserve the previous valid record.
- Record the validation failure.

If a spacecraft has no current public orbital elements:

- Mark tracking as unavailable.
- Do not generate synthetic live positions.
- Keep the mission page accessible.

## 8.6 Freshness Policy

Initial proposal:

- Scheduled polling: every 6 hours.
- Client refetch on page load.
- No continuous polling from the browser.
- Display both retrieval time and orbital epoch.
- Warn when data becomes older than the configured freshness threshold.

Freshness thresholds are product configuration values and must be validated against the actual source cadence and spacecraft category.

Do not assume that an old element set remains sufficiently accurate merely because it exists in cache.

---

# 9. Cloudflare KV Design

## 9.1 Purpose

KV will store small, frequently read datasets produced by the ingestion process.

It is not a general relational database.

## 9.2 Key Design

```text
orbital:latest:{noradCatalogId}
orbital:metadata:{noradCatalogId}
ingestion:last-success
```

Example:

```text
orbital:latest:12345
```

The numeric value above is illustrative, not an assigned Sentinel catalog ID.

## 9.3 Storage Interface

```typescript
export interface OrbitalDatasetRepository {
  findLatest(
    noradCatalogId: number
  ): Promise<OrbitalDataset | null>;

  save(
    dataset: OrbitalDataset
  ): Promise<void>;
}
```

## 9.4 Cloudflare Adapter

```typescript
export class CloudflareKvOrbitalRepository
  implements OrbitalDatasetRepository {

  constructor(
    private readonly kv: KVNamespace
  ) {}

  // Implementation follows repository contract.
}
```

This class belongs in the infrastructure layer.

The domain and satellite-tracking components must not reference KV directly.

## 9.5 Consistency Considerations

Workers KV is eventually consistent.

For First Orbit this is acceptable because orbital elements are periodically refreshed rather than modified interactively.

Requirements:

- Store each validated dataset as an atomic value.
- Include a source epoch and fetch timestamp.
- Avoid assumptions of immediate global consistency.
- Do not use KV for transactional updates.
- Avoid unnecessary writes.

If stronger consistency or relational querying becomes necessary, evaluate D1.

---

# 10. HTTP API Design

## 10.1 Initial Endpoint

```http
GET /api/satellites/{noradCatalogId}/orbital-elements
```

Example response:

```json
{
  "spacecraftId": "sentinel-2a",
  "noradCatalogId": 12345,
  "format": "OMM_JSON",
  "epoch": "2026-11-15T00:00:00Z",
  "fetchedAt": "2026-11-15T06:00:00Z",
  "elements": {},
  "source": {
    "provider": "CelesTrak",
    "url": "https://celestrak.org/"
  },
  "schemaVersion": 1
}
```

Values are illustrative. The implementation must return a validated OMM payload and the real verified catalog ID.

## 10.2 Response Behavior

| Situation | Response |
|---|---|
| Valid cached record | 200 |
| Unknown spacecraft | 404 |
| Known spacecraft without data | 503 or explicit unavailable state |
| Invalid request | 400 |
| Unexpected server error | 500 |

Use a consistent error structure.

```json
{
  "error": {
    "code": "ORBITAL_DATA_UNAVAILABLE",
    "message": "Orbital data is temporarily unavailable."
  }
}
```

## 10.3 API Security

- Accept only validated catalog identifiers.
- Prefer an allowlist of supported spacecraft.
- Do not expose an unrestricted proxy to CelesTrak.
- Apply appropriate HTTP caching.
- Avoid returning internal stack traces.
- Limit response size.
- Do not expose secrets or infrastructure configuration.

## 10.4 Caching

Use cache headers appropriate for periodically refreshed orbital datasets.

The source response must include enough metadata for the browser to determine data age independently of HTTP cache duration.

The frontend must handle temporary API failure gracefully.

---

# 11. Orbital Computation

## 11.1 Propagation Algorithm

Use satellite.js with the SGP4 propagator.

The pipeline is:

```text
OMM JSON
   |
   v
Parse orbital elements
   |
   v
Initialize SGP4 satellite record
   |
   v
Propagate to simulation time
   |
   v
ECI position
   |
   +--> Earth-fixed / geodetic conversion
   |
   v
Cesium Cartesian position
   |
   v
3D rendering
```

## 11.2 Coordinate Systems

The implementation must explicitly handle:

- Earth-centered inertial coordinates.
- Earth-fixed coordinates.
- Geodetic latitude and longitude.
- Altitude.
- Cesium's Earth-centered Cartesian representation.

Conversion must consider Greenwich sidereal time for the relevant timestamp.

## 11.3 Units

satellite.js typically works with kilometers and radians in its orbital mathematics APIs.

CesiumJS uses meters for Cartesian positions.

Conversions must be centralized in the orbital module.

Example contract:

```typescript
export function calculatePosition(
  dataset: OrbitalDataset,
  time: Date
): SatellitePosition;
```

## 11.4 Time Handling

- Use UTC internally.
- Use ISO 8601 timestamps in APIs.
- Capture simulation time consistently.
- Never mix observation time with wall-clock time.
- Allow deterministic propagation for tests.
- Display a clearly labeled UTC timestamp in the initial UI.

## 11.5 Propagation Failures

If satellite.js cannot propagate a record:

- Handle the failure explicitly.
- Stop displaying the affected calculated position.
- Display an unavailable state.
- Log a diagnostic code without overwhelming the UI.

## 11.6 Orbit Path Generation

An orbital path is generated by sampling propagated positions across a defined time interval.

Initial proposal:

- Sample over approximately one orbital period.
- Use a configurable sampling interval.
- Generate paths only for selected spacecraft.
- Recalculate when necessary.
- Avoid creating a new path every animation frame.

## 11.7 Ground Track

Calculate geodetic latitude and longitude for each sampled position.

Handle longitude wrapping at the antimeridian.

The ground track must not display an artificial line across the map when the satellite crosses ±180° longitude.

---

# 12. 3D Visualization Design

## 12.1 Components

```text
SatelliteTracker
├── TrackerToolbar
├── GlobeViewer
│   ├── EarthGlobe
│   ├── SatelliteMarker
│   ├── OrbitPath
│   └── GroundTrack
├── SatelliteDetails
├── SimulationClock
└── DataFreshnessIndicator
```

## 12.2 Rendering Technology

Use CesiumJS.

The viewer should use an explicitly configured globe imagery source and terrain strategy.

The initial product must not require paid Cesium ion services.

A token-free globe is possible with CesiumJS, but the default ion terrain, imagery and geocoding services must not be assumed available without a token.

## 12.3 Globe Imagery

Preferred approach:

- Start with the WGS84 ellipsoid.
- Use a low-resolution, legally reusable Earth texture or imagery provider.
- Verify the redistribution or tile-service usage terms.
- Avoid relying on an unrestricted public map tile service.
- Keep imagery attribution visible.

Do not introduce an external paid mapping dependency merely to deliver First Orbit.

A simple globe is sufficient to prove the functionality.

## 12.4 Satellite Marker

The satellite marker should:

- Follow the calculated position.
- Remain distinguishable from the orbital path.
- Be selectable.
- Display its associated mission.
- Use accessible labels outside the canvas.

## 12.5 Animation

Initial behavior:

- Start at the current UTC time.
- Update the displayed spacecraft position approximately once per second.
- Use the rendering engine efficiently.
- Pause or reduce activity when the tracker is not visible.
- Support a manual pause control.
- Respect reduced-motion preferences.

A later version may support simulation speed and time travel.

## 12.6 Orbit Camera

Provide:

- Zoom and rotation.
- Reset camera.
- Focus on spacecraft.
- Reasonable default orientation.
- Camera movement limits where useful.

The viewer should not continuously force camera movement unless the user explicitly enables following.

## 12.7 Mobile Behavior

On mobile:

- Simplify controls.
- Avoid unnecessary scene effects.
- Reduce labels.
- Disable optional computationally expensive features.
- Provide a clearly accessible spacecraft information panel.

## 12.8 Accessibility Fallback

If WebGL is unavailable or disabled, display:

- Spacecraft name.
- Latitude.
- Longitude.
- Altitude.
- Prediction time.
- Orbital data epoch.
- Source link.
- Explanatory message.

The fallback must not require CesiumJS to render.

---

# 13. Frontend Application Design

## 13.1 Astro Responsibilities

Astro handles:

- Static page generation.
- Routing.
- SEO metadata.
- Mission detail pages.
- Global layouts.
- Static content loading.

## 13.2 React Responsibilities

React handles:

- Satellite tracker.
- Dynamic selection.
- Interactive controls.
- Tracking state.
- Live position calculations.
- Data freshness indicators.

## 13.3 Hydration Strategy

The tracker must not hydrate on unrelated pages.

On the tracking page, load the interactive component on demand using an appropriate Astro client directive or dynamic import.

CesiumJS should not be part of the default homepage JavaScript bundle.

## 13.4 State Model

Example:

```typescript
interface TrackerState {
  spacecraftId: string;

  simulationTime: Date;
  isPlaying: boolean;

  showOrbit: boolean;
  showGroundTrack: boolean;

  loading: boolean;
  error?: string;
}
```

The implementation should separate transient UI state from orbital source data.

## 13.5 Client Data Loading

1. Load the static tracking page.
2. Initialize the tracking interface.
3. Request cached orbital data.
4. Validate the response.
5. Initialize SGP4.
6. Calculate the initial position.
7. Initialize the 3D viewer.
8. Start the animation loop.

If data validation fails, display the fallback state.

---

# 14. Cloudflare Deployment

## 14.1 Deployment Model

Deploy a statically generated Astro site and a small Worker script using Cloudflare Workers Static Assets.

Static file requests should normally bypass the Worker script.

API requests should invoke the Worker.

Scheduled jobs should invoke the same Worker's scheduled handler.

## 14.2 Wrangler Configuration

Illustrative configuration:

```json
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "europe-in-space",
  "compatibility_date": "2026-11-15",
  "main": "./worker/index.ts",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "run_worker_first": ["/api/*"],
    "not_found_handling": "404-page"
  },
  "triggers": {
    "crons": ["0 */6 * * *"]
  },
  "kv_namespaces": [
    {
      "binding": "ORBITAL_CACHE",
      "id": "REPLACE_WITH_KV_NAMESPACE_ID"
    }
  ]
}
```

The KV namespace must be created before deployment and the actual identifier inserted into environment configuration.

Static asset routing and the availability of the configured 404 page must be tested during deployment.

## 14.3 Worker Entrypoint

The Worker must implement:

- An HTTP fetch handler for the API.
- A scheduled handler for ingestion.

Conceptual structure:

```typescript
export default {
  async fetch(request, env, ctx) {
    // Handle /api/* requests.
    // Delegate static assets to env.ASSETS.
  },

  async scheduled(controller, env, ctx) {
    // Run CelesTrak ingestion.
    // Validate and persist datasets.
  }
};
```

Actual handler types and implementation details must follow the selected Wrangler and Workers runtime versions.

## 14.4 Environment Configuration

Define:

- Production domain.
- Supported spacecraft IDs.
- Data source endpoints.
- Cache configuration.
- Refresh schedule.
- Optional feature flags.

Do not embed secrets in frontend JavaScript.

## 14.5 Custom Domain

The production site will use:

`https://europeinspace.org`

Domain routing must be configured through Cloudflare after the domain is registered and its DNS arrangement is confirmed.

Custom-domain configuration should be separate from application logic.

---

# 15. Cloud Portability

## 15.1 Portability Boundary

The following must be platform-independent:

- Mission content.
- Domain models.
- CelesTrak client.
- Input validation.
- Orbital calculations.
- CesiumJS components.
- React UI.
- Astro pages.

The following may be platform-specific:

- Runtime handlers.
- KV storage adapter.
- Scheduled-job registration.
- Deployment configuration.
- Environment bindings.

## 15.2 Future Vercel Migration

The migration path should be:

1. Deploy the Astro static application to Vercel.
2. Replace or relocate the orbital-data API.
3. Replace Cloudflare KV with a suitable data store.
4. Replace Cron Triggers with an appropriate scheduler.
5. Retain existing domain, application and visualization logic.
6. Validate parity.
7. Switch domain routing.

The application must not require running both hosting providers at the same time.

## 15.3 Storage Portability

Because KV usage is isolated behind an interface, a future implementation could use:

- A relational database.
- Another key-value store.
- An object store.
- A versioned JSON artifact.

The appropriate target will be chosen during migration.

---

# 16. Security and Reliability

## 16.1 Input Validation

Validate:

- Mission IDs.
- Spacecraft IDs.
- NORAD catalog identifiers.
- CelesTrak response format.
- Required orbital fields.
- Dates.
- URLs.
- Numeric ranges.

## 16.2 External Data Safety

Treat external content as untrusted.

Do not render arbitrary source HTML.

Do not use externally supplied URLs as unrestricted Worker fetch destinations.

## 16.3 API Protection

- Restrict APIs to known supported spacecraft.
- Avoid unrestricted query parameters.
- Use caching to limit backend work.
- Return generic internal-error responses.
- Do not expose deployment credentials.

## 16.4 Reliability

The system must distinguish:

- No data yet.
- Temporary source failure.
- Stale cached data.
- Invalid orbital data.
- Propagation failure.
- Visualization failure.

Each state should have a defined user-facing response.

## 16.5 Logging

Log:

- Ingestion start and completion.
- Source request failures.
- Validation failures.
- Successful cache updates.
- Unexpected API errors.

Avoid logging personal data.

---

# 17. Testing Strategy

## 17.1 Unit Tests

### Mission Domain

- Valid mission records.
- Invalid status.
- Missing required fields.
- Mission-to-spacecraft association.

### Orbital Mathematics

- OMM parsing.
- Propagation to a fixed timestamp.
- Unit conversions.
- Coordinate transformations.
- Failure handling.
- Ground-track longitude wrapping.

### Data Validation

- Valid CelesTrak responses.
- Empty responses.
- Invalid identifiers.
- Incorrect types.
- Invalid epoch values.

## 17.2 Integration Tests

- CelesTrak client with recorded fixtures.
- Orbital-data repository.
- Ingestion pipeline.
- Worker API responses.
- Cache unavailable behavior.

External API calls should be mocked during normal CI testing.

## 17.3 Scientific Validation

Orbital calculations should be compared with an independent trusted reference or published verification dataset.

Validation must specify:

- Input orbital elements.
- Epoch.
- Prediction timestamp.
- Coordinate reference frame.
- Expected position.
- Numeric tolerance.
- Software version.

The test must not compare two calculations that both depend on the same unverified conversion implementation.

## 17.4 End-to-End Tests

Using Playwright:

**E2E-001 — Home to Mission**

Visitor opens the homepage and navigates to Sentinel-2.

**E2E-002 — Mission to Tracker**

Visitor opens a linked spacecraft visualization.

**E2E-003 — Orbit Visualization**

The tracking page loads valid orbital information and displays the spacecraft.

**E2E-004 — Source Information**

Visitor can inspect orbital data timestamps and attribution.

**E2E-005 — Source Unavailable**

The tracker shows a useful unavailable or stale-data state.

**E2E-006 — Mobile**

Mission navigation and tracking information work at a mobile viewport.

**E2E-007 — WebGL Fallback**

Essential spacecraft information remains accessible when 3D rendering is unavailable.

## 17.5 CI Quality Gates

Every pull request should run:

- Type checking.
- Linting.
- Formatting validation.
- Unit tests.
- Static build.
- Relevant integration tests.

End-to-end tests should run before production release and preferably in CI when the test environment is stable.

---

# 18. Performance Strategy

## 18.1 Website

- Generate mission pages statically.
- Minimize global JavaScript.
- Use optimized images.
- Load heavy components only where necessary.
- Avoid unnecessary runtime API calls.

## 18.2 Tracker

- Initialize CesiumJS on the tracker page only.
- Keep the number of visible spacecraft small.
- Recalculate orbital paths only when necessary.
- Limit orbit sample density.
- Reduce rendering activity when hidden.
- Avoid excessive React state updates per animation frame.

## 18.3 Initial Performance Targets

| Metric | Target |
|---|---|
| Core static pages | Good Core Web Vitals |
| Global JavaScript | Minimal |
| Tracker loading | Lazy/on-demand |
| Satellite positions | Approximately 1 update per second |
| Visible spacecraft | One initially |
| API request frequency | Once per page load under normal conditions |
| Background orbital refresh | Every 6 hours initially |
| Database dependency | None |
| Paid infrastructure | None |

Performance targets must be verified on actual devices rather than assumed from the architecture.

---

# 19. Delivery Plan and Engineering Backlog

## Epic 1 — Project Foundation

### EIS-001 — Initialize repository

**Tasks:**
- Create repository.
- Initialize Astro.
- Configure TypeScript.
- Configure React.
- Configure Tailwind CSS.
- Configure pnpm.
- Add standard project scripts.

**Acceptance criteria:**
- Project builds locally.
- Type checking passes.
- No Cloudflare dependency exists in domain logic.

### EIS-002 — Establish application shell

**Tasks:**
- Define design tokens.
- Create base layout.
- Create responsive header.
- Create footer.
- Add error and 404 pages.

**Acceptance criteria:**
- Core navigation works on desktop and mobile.
- Keyboard navigation works.

### EIS-003 — Configure CI

**Tasks:**
- GitHub Actions workflow.
- Type checking.
- Linting.
- Unit testing.
- Production build.

**Acceptance criteria:**
- Pull requests receive automated validation.
- Failed validation prevents automatic deployment.

---

## Epic 2 — Mission Content

### EIS-004 — Define domain models

**Tasks:**
- Mission schema.
- Spacecraft schema.
- Source metadata schema.
- Validation utilities.

**Acceptance criteria:**
- Invalid records fail validation.
- IDs and relationships are consistent.

### EIS-005 — Implement mission content collection

**Tasks:**
- Astro content collection.
- Mission detail template.
- Seed one mission.
- Add source links.

**Acceptance criteria:**
- The verified mission page builds statically.
- Required fields are displayed correctly.

### EIS-006 — Build mission navigation

**Tasks:**
- Mission card.
- Mission detail view.
- Associated spacecraft link.

**Acceptance criteria:**
- Visitor can navigate from homepage to mission and tracker.

---

## Epic 3 — Orbital Data

### EIS-007 — Implement CelesTrak connector

**Tasks:**
- HTTP client.
- OMM JSON parsing.
- Response validation.
- Source metadata.
- Error handling.

**Acceptance criteria:**
- Valid data is parsed correctly.
- Invalid data is rejected.
- Tests use recorded fixtures.

### EIS-008 — Implement repository interface

**Tasks:**
- Define repository contract.
- Create in-memory test implementation.
- Create Cloudflare KV implementation.

**Acceptance criteria:**
- Application logic depends only on the repository interface.
- Cache tests pass.

### EIS-009 — Implement ingestion pipeline

**Tasks:**
- Configure spacecraft selection.
- Fetch orbital data.
- Validate response.
- Persist latest valid record.
- Record ingestion status.

**Acceptance criteria:**
- A failed update does not destroy valid cached data.
- Repeated execution is safe.

### EIS-010 — Implement orbital-data API

**Tasks:**
- API route.
- Identifier validation.
- Repository lookup.
- Response contract.
- Cache headers.
- Error responses.

**Acceptance criteria:**
- The endpoint serves a valid cached orbital record.
- Unknown identifiers return a defined response.
- No direct unrestricted provider proxy is exposed.

---

## Epic 4 — Orbital Mathematics

### EIS-011 — Implement SGP4 service

**Tasks:**
- Parse OMM data with satellite.js.
- Initialize satellite record.
- Calculate position at a given time.
- Handle propagation errors.

**Acceptance criteria:**
- Deterministic calculations are possible.
- Failure states are handled.
- Numerical validation passes.

### EIS-012 — Implement coordinate transformations

**Tasks:**
- Calculate Earth-fixed position.
- Calculate geodetic coordinates.
- Convert units for CesiumJS.
- Handle timestamp conversions.

**Acceptance criteria:**
- Coordinates are validated.
- Longitude and latitude remain in valid ranges.

### EIS-013 — Implement orbital paths

**Tasks:**
- Sample trajectory.
- Generate orbit polyline.
- Calculate ground track.
- Handle antimeridian crossings.

**Acceptance criteria:**
- Predicted path renders without obvious discontinuities.
- Sampling does not run continuously when unnecessary.

---

## Epic 5 — Interactive Tracker

### EIS-014 — Integrate CesiumJS

**Tasks:**
- Configure assets.
- Initialize globe.
- Configure imagery.
- Add camera controls.
- Implement error fallback.

**Acceptance criteria:**
- Globe renders without a paid service dependency.
- Tracker does not load on unrelated pages.

### EIS-015 — Render spacecraft

**Tasks:**
- Add spacecraft marker.
- Update position.
- Add selection interaction.
- Display details.

**Acceptance criteria:**
- Marker follows calculated positions.
- Selected spacecraft details are correct.

### EIS-016 — Render orbital trajectory

**Tasks:**
- Add orbital polyline.
- Add optional ground track.
- Add visibility controls.

**Acceptance criteria:**
- Trajectory is visible.
- Controls work.
- Path generation is efficient.

### EIS-017 — Implement tracking status UI

**Tasks:**
- Display simulation time.
- Display orbital epoch.
- Display data retrieval time.
- Display source.
- Display warning states.

**Acceptance criteria:**
- The user can identify whether the displayed position is predicted.
- Stale-data states are visible.

### EIS-018 — Mobile and accessibility

**Tasks:**
- Responsive controls.
- Accessible details view.
- Reduced-motion behavior.
- WebGL fallback.

**Acceptance criteria:**
- Important data remains accessible without the canvas.
- Core controls support keyboard navigation.

---

## Epic 6 — Deployment

### EIS-019 — Configure Cloudflare Worker

**Tasks:**
- Wrangler configuration.
- Static asset binding.
- Worker API handler.
- KV namespace.
- Cron Trigger.

**Acceptance criteria:**
- Local Worker testing succeeds.
- Static assets and API routes work together.

### EIS-020 — Production deployment

**Tasks:**
- Configure production environment.
- Deploy application.
- Configure domain.
- Verify HTTPS.
- Run smoke tests.

**Acceptance criteria:**
- Site loads at the configured domain.
- API returns cached orbital data.
- Scheduled ingestion runs successfully.
- No paid service is required.

### EIS-021 — Documentation

**Tasks:**
- README.
- Local development guide.
- Architecture overview.
- Data source documentation.
- Deployment instructions.
- Orbital calculation methodology.

**Acceptance criteria:**
- A new contributor can run and understand the application.
- Deployment steps are reproducible.

---

# 20. Release Criteria

First Orbit is ready for release when:

### Product

- Mission page is functional.
- One verified spacecraft can be tracked.
- 3D visualization works.
- Orbital predictions update correctly.
- Data source and timestamps are visible.

### Engineering

- Automated checks pass.
- Orbital mathematics is independently validated.
- External API failures are handled.
- Application boundaries are maintained.
- No critical runtime errors remain.

### Infrastructure

- Site is deployed to Cloudflare Free.
- Orbital data is cached.
- Scheduled ingestion works.
- No paid service is required.
- Deployment is reproducible.

### Documentation

- Architecture is documented.
- Data sources are cited.
- Licensing is addressed.
- Local development is explained.
- Scientific limitations are disclosed.

---

# 21. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Orbital dataset unavailable | Verify selected spacecraft before implementation |
| Outdated orbital elements | Preserve epoch and apply freshness policy |
| Incorrect coordinates | Independent numerical validation |
| CesiumJS bundle size | Lazy loading |
| Free map imagery restrictions | Use licensed assets or compliant imagery provider |
| Cloudflare KV consistency | Atomic dataset values and version timestamps |
| Worker CPU constraints | Keep processing lightweight |
| CelesTrak API restrictions | Conservative ingestion and caching |
| Cloudflare lock-in | Repository interfaces and portable core |
| Excessive scope | One mission and one spacecraft initially |
| Mobile rendering issues | Accessible non-3D fallback |

---

# 22. Revised Architecture Decisions

The following decisions extend the main PRD.

## ADR-009 — Cloudflare KV for Initial Orbital Persistence

**Status:** Proposed for acceptance

Use Cloudflare KV as the initial persistent store for cached orbital elements.

Reason: the data access pattern is simple key-based retrieval and does not currently justify a relational database.

## ADR-010 — OMM JSON as Orbital Data Format

**Status:** Proposed for acceptance

Prefer CCSDS OMM JSON from CelesTrak for ingestion and propagation.

Preserve source metadata and validate required fields.

## ADR-011 — Client-Side SGP4 Propagation

**Status:** Accepted from PRD

Perform spacecraft position calculations in the browser.

Do not continuously calculate positions on Cloudflare Workers.

## ADR-012 — Astro Static Generation

**Status:** Proposed for acceptance

Generate mission and informational pages statically.

Use React only for genuinely interactive experiences.

## ADR-013 — Single Repository, Modular Monolith

**Status:** Proposed for acceptance

Use one repository and deployment unit for First Orbit.

Avoid introducing monorepo tooling prematurely.

## ADR-014 — Token-Free 3D Globe

**Status:** Proposed for acceptance

The initial tracking experience must not rely on a paid Cesium ion subscription or other paid imagery service.

Any external imagery used must comply with attribution and usage requirements.

---

# 23. Implementation Sequence

The recommended order is:

**Step 1 — Foundation**
- Repository.
- Astro.
- React.
- TypeScript.
- CI.
- Static Cloudflare deployment.

**Step 2 — Content**
- Mission model.
- Spacecraft model.
- One verified mission page.
- Navigation.

**Step 3 — Data**
- CelesTrak connector.
- OMM validation.
- Orbital repository.
- Cloudflare KV.
- Scheduled ingestion.
- API.

**Step 4 — Mathematics**
- SGP4 integration.
- Coordinate conversion.
- Independent verification.
- Orbit-path calculations.

**Step 5 — Visualization**
- CesiumJS.
- Spacecraft marker.
- Predicted orbit.
- Tracking details.
- Mobile fallback.

**Step 6 — Release**
- Integration testing.
- Performance review.
- Data and image licensing review.
- Production deployment.
- Documentation.

A simple static prototype can be deployed after Step 1. Later steps should be independently testable and incrementally integrated.

---

# 24. Technical Reference Documentation

## Application

- Astro: https://docs.astro.build/
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/
- Tailwind CSS: https://tailwindcss.com/

## Orbital Data and Visualization

- CelesTrak GP formats: https://celestrak.org/NORAD/documentation/gp-data-formats.php
- satellite.js: https://github.com/shashwatak/satellite-js
- CesiumJS: https://cesium.com/learn/cesiumjs-learn/

## Cloudflare

- Workers: https://developers.cloudflare.com/workers/
- Static Assets: https://developers.cloudflare.com/workers/static-assets/
- KV: https://developers.cloudflare.com/kv/
- Cron Triggers: https://developers.cloudflare.com/workers/configuration/cron-triggers/
- Wrangler: https://developers.cloudflare.com/workers/wrangler/

## Testing

- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/

## Future Hosting

- Vercel: https://vercel.com/docs

Free-tier policies, dependency compatibility and third-party usage terms must be confirmed at implementation time.

---

# 25. Final Technical Recommendation

First Orbit should prioritize demonstrating the central experience of Europe in Space:

**A visitor discovers a European space mission and explores the predicted orbit of a real spacecraft through an interactive 3D globe.**

The proposed architecture deliberately avoids unnecessary infrastructure:

- Astro for static content.
- React for interaction.
- CesiumJS for visualization.
- satellite.js for orbital calculations.
- Cloudflare Workers for a minimal API.
- Cloudflare KV for orbital data.
- Cron Triggers for periodic ingestion.
- GitHub Actions for quality and deployment.

The design keeps application logic portable, allowing future migration to Vercel without rewriting the main product.

The recommended first implementation task is **EIS-001 — Initialize the repository**, followed by establishing a reproducible static Cloudflare deployment before introducing external data integrations.

**Document:** Europe in Space — First Orbit TDD  
**Version:** 1.0  
**Status:** Ready for engineering implementation  
**Next deliverable:** Repository initialization and first deployable vertical slice.
