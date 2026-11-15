# Europe in Space
## Product Requirements Document (PRD)

**Version:** 1.1  
**Date:** November 15, 2026  
**Status:** Consolidated draft — ready for technical design  
**Domain:** europeinspace.org  
**Project type:** Independent, open-source personal project  
**Business model:** Non-commercial  
**Initial hosting:** Cloudflare Free  
**Future hosting option:** Vercel

---

# 1. Executive Summary

**Europe in Space** is an independent, interactive web platform dedicated to exploring Europe's activities in space.

The platform brings together information about European space missions, satellites, observatories, launches, astronomical imagery and scientific discoveries into one accessible digital experience.

Rather than functioning primarily as a traditional news website, Europe in Space focuses on **interactive exploration, visualization and access to real space data**.

Visitors will be able to discover European missions, track selected satellites around Earth, explore telescope imagery and understand Europe's contributions to space exploration.

The platform will primarily use publicly available data from organizations including:

- European Space Agency (ESA)
- EUMETSAT
- Copernicus Data Space Ecosystem
- European Southern Observatory (ESO)
- CelesTrak
- NASA Jet Propulsion Laboratory (JPL)
- The Space Devs

The project will be developed incrementally as a personal engineering initiative, with publicly available source code.

The initial implementation will run on Cloudflare's free-tier infrastructure, using a portable architecture that allows migration to Vercel or another provider without substantial application changes.

## 1.1 Product Vision

> Make Europe's presence in space visible, understandable and explorable.

## 1.2 Product Tagline

**Explore Europe's journey into space.**

## 1.3 Product Principles

1. **Explore, don't just read.** Prioritize interactive experiences over static information.
2. **Real data, clearly explained.** Use authoritative sources and distinguish observations from predictions.
3. **Europe first, not Europe only.** Highlight European contributions while providing relevant international context.
4. **Open by design.** Prefer public data, open-source technologies and transparent methodology.
5. **Beautiful and understandable.** Make complex scientific information accessible.
6. **Build for curiosity.** Allow the project to evolve naturally through exploration and experimentation.
7. **Free-first infrastructure.** Design the MVP to operate within Cloudflare's free tier.
8. **Portable by design.** Keep application functionality independent of the hosting provider.
9. **Simplicity over complexity.** Avoid premature infrastructure and architectural abstractions.

---

# 2. Problem Statement

Information about Europe's space activities is distributed across numerous agencies, scientific institutions, databases and websites.

Examples include:

- ESA mission websites.
- EUMETSAT satellite and weather resources.
- Copernicus Earth observation services.
- ESO observatory and image archives.
- Satellite orbital databases.
- National space agency websites.
- Individual mission websites and scientific publications.

Although many resources are publicly accessible, visitors must navigate different interfaces, understand specialized terminology and combine information from multiple sources.

Existing space platforms frequently concentrate on individual agencies, news, orbital tracking or astronomical imagery.

## 2.1 Opportunity

Europe in Space aims to provide a coherent, interactive exploration experience connecting these different information sources.

Example user journey:

**Sentinel-2 mission → Sentinel-2A spacecraft → orbital visualization → Earth observation imagery → mission information**

The platform's primary differentiator is the ability to explore relationships between missions, spacecraft, launches, observations and scientific discoveries.

---

# 3. Product Goals and Non-Goals

## 3.1 Goals

### G1 — Mission Discovery

Provide a structured, searchable catalog of European space missions.

### G2 — Interactive Satellite Tracking

Visualize selected European satellites around Earth using publicly available orbital data.

### G3 — Space Imagery Exploration

Provide curated astronomical, Earth observation and mission imagery with appropriate attribution.

### G4 — Observatory Discovery

Help visitors discover European space-based and ground-based observatories.

### G5 — Data Transparency

Clearly display original sources, timestamps, update frequency and known limitations.

### G6 — Engineering Experimentation

Support experimentation with orbital mechanics, geospatial visualization, public APIs, data processing and modern frontend technologies.

### G7 — Open-Source Contribution

Publish project source code and technical documentation through GitHub.

### G8 — Low-Cost Operation

Run the MVP with €0/month infrastructure spending, excluding domain registration.

### G9 — Infrastructure Portability

Support migration from Cloudflare to Vercel without rewriting core application functionality.

## 3.2 Non-Goals

The initial product will not:

- Become a breaking-news publication.
- Compete with professional satellite tracking platforms.
- Provide operational or safety-critical orbital information.
- Operate its own ground station or telescope.
- Promise actual live spacecraft telemetry.
- Guarantee live telescope video.
- Offer a commercial subscription service.
- Catalog every European mission immediately.
- Provide a native mobile application.
- Deliver guaranteed real-time launch coverage.
- Require accounts or user profiles.
- Build a distributed microservices platform.
- Support simultaneous deployment to multiple cloud providers.

---

# 4. Target Audience

## Persona A — Curious Space Explorer

Interested in space exploration and Europe's contribution to it.

**Needs:**
- Accessible explanations.
- Engaging imagery.
- Easy mission discovery.
- Interactive experiences.

**Relevant features:** Mission Explorer, Imagery Gallery, Observatory Explorer.

## Persona B — Space Enthusiast

Familiar with satellites, missions and launches.

**Needs:**
- Accurate spacecraft details.
- Orbital visualization.
- Mission relationships.
- Reliable source links.

**Relevant features:** Satellite Tracker, Mission Details, Launch Calendar.

## Persona C — Developer / Technical Explorer

Interested in space data, orbital mechanics and visualization.

**Needs:**
- Transparent calculations.
- Data provenance.
- Structured datasets.
- Open-source implementation.

**Relevant features:** Satellite Tracker, Methodology, GitHub, future API.

## Persona D — Student / Educator

Uses space exploration for learning or teaching.

**Needs:**
- Trustworthy information.
- Understandable terminology.
- Interactive educational experiences.
- Accessible visualizations.

**Relevant features:** Mission Explorer, Satellite Tracker, Observatory Explorer.

---

# 5. Product Scope and Priorities

| Module | Description | Priority |
|---|---|---|
| Website Foundation | Homepage, navigation, responsive layout | P0 |
| Mission Explorer | Searchable European mission catalog | P0 |
| Mission Details | Information and related spacecraft | P0 |
| Satellite Tracker | 3D Earth and predicted positions | P0 |
| Data Provenance | Sources, timestamps and methodology | P0 |
| Space Imagery | Curated astronomical and mission imagery | P1 |
| Observatory Explorer | European observatories and telescopes | P1 |
| Launch Calendar | Upcoming and historical launches | P2 |
| Earth Observation Explorer | Selected Copernicus imagery | P2 |
| Deep Space Explorer | Spacecraft beyond Earth orbit | P3 |
| Public API | Structured platform data access | P3 |

### Priority Definitions

- **P0:** Essential MVP.
- **P1:** First product expansion.
- **P2:** Subsequent capabilities.
- **P3:** Optional experiments.

---

# 6. Functional Requirements

## 6.1 Mission Explorer

**Purpose:** Allow visitors to discover European space missions.

### Requirements

- **FR-MIS-001:** Display a catalog of selected European missions.
- **FR-MIS-002:** Search missions by name.
- **FR-MIS-003:** Filter missions by status, agency and category.
- **FR-MIS-004:** Provide individual mission detail pages.
- **FR-MIS-005:** Display verified participating organizations and countries where appropriate.
- **FR-MIS-006:** Associate missions with relevant spacecraft.
- **FR-MIS-007:** Provide links to official mission resources.
- **FR-MIS-008:** Handle missions without trackable spacecraft.
- **FR-MIS-009:** Display verification and source metadata.

### Mission Categories

- Earth observation.
- Telecommunications.
- Navigation.
- Space science.
- Astronomy.
- Planetary exploration.
- Human spaceflight.
- Technology demonstration.

### Initial Mission Candidates

- Sentinel-1
- Sentinel-2
- Sentinel-3
- Galileo
- Euclid
- Gaia
- BepiColombo
- Solar Orbiter
- JUICE
- Hera

These are candidate records for the initial catalog. Their current status, dates and spacecraft relationships must be verified during content preparation.

### Mission Data Model

```typescript
interface Mission {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: MissionCategory;
  status: MissionStatus;
  launchDate?: string;
  organizations: string[];
  countries: string[];
  spacecraftIds: string[];
  image?: ImageReference;
  officialUrl: string;
  sourceIds: string[];
  lastVerifiedAt: string;
}
```

This model is illustrative and subject to refinement during technical design.

---

## 6.2 Satellite Tracker

**Purpose:** Display predicted positions and orbits of selected European spacecraft.

### Requirements

- **FR-SAT-001:** Render an interactive 3D Earth.
- **FR-SAT-002:** Display selected spacecraft.
- **FR-SAT-003:** Calculate spacecraft positions using orbital elements.
- **FR-SAT-004:** Support spacecraft selection.
- **FR-SAT-005:** Display satellite name and catalog identifier.
- **FR-SAT-006:** Show predicted orbital paths.
- **FR-SAT-007:** Display ground tracks where supported.
- **FR-SAT-008:** Display orbital element epoch and retrieval timestamps.
- **FR-SAT-009:** Explain the difference between predicted positions and live telemetry.
- **FR-SAT-010:** Provide accessible alternatives to the 3D visualization.
- **FR-SAT-011:** Handle unavailable or stale orbital elements gracefully.

### Initial Coverage

Begin with a curated set of Sentinel spacecraft.

Expand to additional European spacecraft after validating performance and data reliability.

### Orbital Calculation Approach

1. Retrieve orbital elements from CelesTrak.
2. Validate and cache the source data.
3. Deliver the cached dataset to the browser.
4. Calculate predicted positions using SGP4.
5. Render spacecraft and orbital paths using CesiumJS.

### Important Distinction

The tracker shows **calculated orbital predictions**, not continuous direct telemetry.

The interface must display the prediction time and orbital data epoch.

### Disclaimer

"Satellite positions are calculated estimates based on publicly available orbital data and are not intended for operational navigation or safety-critical use."

---

## 6.3 Mission Detail Pages

Each mission page must provide:

- Mission name and overview.
- Representative imagery when permitted.
- Mission status.
- Participating organizations.
- Launch date where applicable.
- Mission objectives.
- Associated spacecraft.
- Satellite tracking link when available.
- Related imagery.
- Official sources.
- Data verification information.

Unavailable information must not be replaced with invented values.

---

## 6.4 Space Imagery

**Purpose:** Allow visitors to explore space imagery and scientific discoveries.

### Requirements

- **FR-IMG-001:** Display a curated image gallery.
- **FR-IMG-002:** Support filtering by source and category.
- **FR-IMG-003:** Provide individual image detail pages.
- **FR-IMG-004:** Display image descriptions.
- **FR-IMG-005:** Display creator and organization attribution.
- **FR-IMG-006:** Link to original source materials.
- **FR-IMG-007:** Record relevant usage rights.
- **FR-IMG-008:** Exclude assets without suitable reuse permissions.

### Potential Sources

- ESA/Hubble.
- ESO public imagery.
- Selected ESA mission galleries.
- Copernicus image products.

Initially, the mission catalog may include only properly licensed representative imagery.

A full gallery is a P1 feature.

---

## 6.5 Observatory Explorer

**Purpose:** Provide information about European observatories and telescopes.

### Requirements

- **FR-OBS-001:** Display a catalog of selected observatories.
- **FR-OBS-002:** Provide detail pages.
- **FR-OBS-003:** Describe scientific objectives and instruments.
- **FR-OBS-004:** Display relevant images and discoveries.
- **FR-OBS-005:** Link to official resources.
- **FR-OBS-006:** Distinguish ground-based and space-based observatories.

### Future Possibilities

- Integration with astronomical archives.
- Virtual Observatory protocols.
- Scientific observation search.
- Interactive sky exploration.

Live telescope video is not an initial requirement.

---

## 6.6 Launch Calendar

**Purpose:** Show European space launch activity.

### Requirements

- Display upcoming launches.
- Display historical launches.
- Associate launches with missions.
- Display launch vehicles and sites.
- Display scheduled times when available.
- Indicate tentative dates.
- Link to original sources.

**Candidate integration:** Launch Library 2.

Launch information should be cached and refreshed within provider limits.

---

## 6.7 Earth Observation Explorer

**Purpose:** Explore selected Earth observation imagery.

### Requirements

- Display an interactive Earth map.
- Select available imagery layers.
- Display acquisition dates.
- Show source and processing metadata.
- Integrate selected Copernicus products.
- Respect API quotas and processing limits.
- Explain imagery limitations, including acquisition delays and cloud coverage.

The initial implementation should focus on curated experiences rather than unrestricted large-scale imagery processing.

---

## 6.8 Data Provenance

All externally sourced data must provide traceable provenance.

Required fields where applicable:

- Data provider.
- Original source URL.
- Source identifier.
- Observation or publication timestamp.
- Last successful retrieval timestamp.
- License or usage terms.
- Processing method.
- Known limitations.

The platform must clearly distinguish current data, historical data, predictions and stale records.

---

# 7. Information Architecture

## 7.1 Primary Navigation

**Explore**
- Home
- Missions
- Satellites
- Observatories
- Images
- Launches

**Project**
- About
- Data Sources
- Methodology
- GitHub

Only implemented features should appear as active navigation destinations.

## 7.2 URL Structure

```text
/
├── missions/
│   └── [mission-slug]/
├── satellites/
│   └── [satellite-id]/
├── observatories/
│   └── [observatory-slug]/
├── images/
│   └── [image-id]/
├── launches/
├── about/
├── data-sources/
└── methodology/
```

## 7.3 Homepage

The homepage should provide:

1. Clear product identity and introduction.
2. Featured European mission.
3. Entry point into satellite tracking.
4. Selected missions.
5. Featured imagery or discoveries.
6. Links to data sources and project information.

The homepage should encourage exploration rather than overwhelm visitors with technical details.

---

# 8. User Experience and Design

## 8.1 Visual Direction

**European Mission Control meets Scientific Observatory.**

The design should combine:

- Scientific credibility.
- Editorial-quality typography.
- Immersive space imagery.
- Interactive maps and orbital visualization.
- Clean information architecture.
- Modern data dashboards.

## 8.2 Design Principles

### Dark-First

Prioritize a dark interface suitable for space imagery and orbital visualization.

### Progressive Disclosure

Present accessible explanations before exposing technical details.

### Data-Driven Visuals

Use visualizations, orbit paths, timelines, diagrams and maps to communicate information.

### Scientific Clarity

Label calculated values, measurements, timestamps and data limitations.

### Accessibility

Support keyboard navigation, readable contrast, reduced motion preferences and alternatives to complex visualizations.

## 8.3 Responsive Design

Support desktop, tablet and mobile.

Mission content must remain fully accessible without loading the 3D globe.

The satellite tracker should provide simplified controls and a usable fallback for constrained devices.

---

# 9. Data Sources and Integration Strategy

## 9.1 Candidate Data Sources

| Provider | Data | Access |
|---|---|---|
| ESA | Missions and spacecraft | Public information and available datasets |
| CelesTrak | Orbital elements | Public GP data |
| Copernicus Data Space | Earth observation imagery | Free access with quotas |
| EUMETSAT | Weather satellite data | Public and free products |
| ESA/Hubble | Astronomical imagery | Public archive |
| ESO | Observatory information and imagery | Public archive |
| The Space Devs | Launch information | Rate-limited API |
| NASA JPL Horizons | Solar system ephemerides | Public scientific service |

Free availability does not automatically grant unrestricted redistribution rights.

Actual licensing and service quotas must be verified for each integration.

## 9.2 Integration Architecture

Preferred data flow:

**External Provider → Scheduled Ingestion → Validation → Normalization → Cache/Storage → Application → User**

External providers should not receive unnecessary requests from every visitor.

## 9.3 Ingestion Requirements

- Respect provider rate limits.
- Validate incoming data.
- Preserve source metadata.
- Use cached data during temporary outages.
- Prevent failed updates from overwriting valid records.
- Make ingestion operations idempotent where practical.
- Log failures and successful updates.

## 9.4 Data Freshness

Different datasets require different refresh schedules.

Examples:

- Orbital elements: aligned with provider updates.
- Mission descriptions: reviewed periodically.
- Launch schedules: refreshed according to source limits.
- Image metadata: periodic synchronization.
- Scientific data: provider-specific schedules.

Freshness and retrieval timestamps must be visible where relevant.

---

# 10. Technical Architecture

## 10.1 Architectural Strategy

**Static-first modular monolith with portable domain logic and lightweight serverless integrations.**

The application will initially run on Cloudflare Free.

Infrastructure-specific code must remain isolated so the application can later migrate to Vercel.

## 10.2 Technology Stack

| Layer | Technology |
|---|---|
| Web framework | Astro |
| Interactive components | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| 3D Earth | CesiumJS |
| Orbital mechanics | satellite.js |
| Optional 2D maps | MapLibre GL JS |
| Initial hosting | Cloudflare Workers Static Assets |
| API | Cloudflare Workers |
| Initial content storage | Markdown / MDX / JSON |
| Database when required | Cloudflare D1 |
| Scheduled jobs | Cloudflare Cron Triggers |
| Validation | Zod |
| Unit testing | Vitest |
| End-to-end testing | Playwright |
| CI/CD | GitHub Actions |
| Cloudflare deployment | Wrangler |
| Future hosting | Vercel |

The exact library versions must be selected during implementation.

Optional Cesium terrain and imagery providers must be chosen without requiring paid services for the MVP.

## 10.3 Logical Architecture

```text
Europe in Space
│
├── Presentation
│   ├── Astro Website
│   ├── React Components
│   ├── Mission Explorer
│   ├── Satellite Tracker
│   └── Visualization Components
│
├── Application Core
│   ├── Mission Service
│   ├── Satellite Service
│   ├── Observatory Service
│   ├── Domain Models
│   └── Validation
│
├── Data Source Integrations
│   ├── CelesTrak
│   ├── ESA
│   ├── Copernicus
│   ├── EUMETSAT
│   └── Other Providers
│
├── Persistence Interfaces
│   ├── Mission Repository
│   ├── Satellite Repository
│   └── Source Repository
│
└── Infrastructure
    └── Cloudflare
        ├── Workers
        ├── Static Assets
        ├── D1 (optional)
        └── Cron Triggers
```

The application core must not import Cloudflare-specific runtime dependencies.

## 10.4 Initial Repository Structure

```text
europeinspace/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── layouts/
│       │   ├── styles/
│       │   └── lib/
│       └── astro.config.mjs
│
├── packages/
│   ├── core/
│   │   ├── missions/
│   │   ├── satellites/
│   │   └── models/
│   │
│   ├── data-sources/
│   │   └── celestrak/
│   │
│   └── data/
│       ├── repositories/
│       └── schemas/
│
├── infrastructure/
│   └── cloudflare/
│
├── content/
│   └── missions/
│
├── .github/
│   └── workflows/
│
└── README.md
```

This is a target organization, not a requirement to create every directory immediately.

For the first milestone, the repository may use a simpler structure. Separate packages should only be introduced when they provide meaningful architectural boundaries.

Vercel-specific implementation code must not be created until needed.

---

# 11. Architecture Decision Records

## ADR-001 — Server-Side Data Aggregation

**Status:** Accepted

External datasets should be retrieved through controlled ingestion processes instead of unrestricted browser requests, where the provider's policies and rate limits make that appropriate.

**Rationale:**
- Protect provider quotas.
- Improve availability.
- Support data validation.
- Centralize provenance.

## ADR-002 — Client-Side Orbital Computation

**Status:** Accepted

Satellite position calculations will run in the browser using SGP4-compatible software.

**Rationale:**
- Reduce server costs.
- Avoid continuous backend requests.
- Improve interactivity.
- Support Cloudflare Free limits.

## ADR-003 — Provenance-First Data Model

**Status:** Accepted

Important externally sourced records must retain source references, timestamps and usage information.

**Rationale:**
- Scientific transparency.
- Data quality.
- Legal compliance.
- Easier troubleshooting.

## ADR-004 — Modular Feature Boundaries

**Status:** Accepted

Mission discovery, satellite tracking, imagery, observatories and launches should remain logically separated.

**Rationale:**
- Maintainability.
- Independent feature evolution.
- Testability.

## ADR-005 — Avoid Premature Infrastructure Complexity

**Status:** Accepted

Begin with a modular application and lightweight scheduled tasks.

Do not introduce Kubernetes, microservices, distributed queues or complex orchestration without a demonstrated requirement.

## ADR-006 — Cloudflare Free-First Architecture

**Status:** Accepted

### Decision

Europe in Space will initially operate on Cloudflare's free-tier services.

### Requirements

- No paid infrastructure dependency for the MVP.
- No mandatory paid database.
- No mandatory paid mapping or globe service.
- No server request for every satellite position update.
- Prefer static generation and client-side computation.
- Cache public datasets.
- Keep Worker execution lightweight.
- Monitor relevant platform quotas.
- Avoid large-scale backend imagery processing.

### Consequences

The initial architecture must support graceful degradation when data sources or platform quotas become temporarily unavailable.

**Acceptance criterion:** The complete MVP can be deployed without requiring paid Cloudflare services or paid third-party data infrastructure.

## ADR-007 — Cloud Portability

**Status:** Accepted

### Decision

Europe in Space must separate application functionality from hosting-specific infrastructure.

### Requirements

- Domain models must be provider-independent.
- Data source integrations must not require Cloudflare APIs.
- Business logic must remain portable.
- Repository interfaces must isolate persistence.
- Scheduling implementation must remain replaceable.
- Environment configuration must be separated from domain logic.
- Database schema and migrations must be maintained in source control.
- Browser-based visualizations must be independent of the hosting platform.

### Consequences

A future migration to Vercel may require replacing deployment adapters, persistent storage and scheduled jobs.

It must not require rewriting mission logic, satellite calculations or core frontend experiences.

**Important:** Portability does not require creating multiple infrastructure implementations in the MVP.

## ADR-008 — Static Content Before Database

**Status:** Accepted

Curated content should initially be stored in version-controlled Markdown, MDX or JSON files.

Cloudflare D1 will be introduced only when persistent structured queries or automated ingestion requirements justify it.

**Rationale:**
- Lower complexity.
- Better portability.
- Easier review.
- No database dependency for the initial site.
- Simpler free-tier operation.

---

# 12. Persistence and Data Management

## 12.1 Stage 1 — Static Content

Use version-controlled content for:

- Mission descriptions.
- Agency metadata.
- Observatory descriptions.
- Image references.
- Curated links.

Use small cached JSON datasets for satellite data where appropriate.

## 12.2 Stage 2 — Cloudflare D1

Introduce D1 for requirements such as:

- Persisted ingestion metadata.
- Structured catalog queries.
- Larger satellite datasets.
- Relationships that are difficult to maintain in static files.
- Data synchronization history.

Database operations must be isolated from application services.

## 12.3 Stage 3 — Future Migration

If the platform moves to Vercel:

1. Export existing data.
2. Select a target database.
3. Translate incompatible schema or queries.
4. Migrate records.
5. Verify data integrity.
6. Replace persistence adapters.
7. Run regression tests.

For a small static-content-first deployment, database migration may not be necessary at all.

---

# 13. Cloudflare Deployment Strategy

## 13.1 Initial Platform

The application will deploy to Cloudflare Workers with static asset support.

### Responsibilities

**Static Assets**
- Serve generated pages.
- Serve CSS and JavaScript.
- Serve small bundled datasets.
- Serve eligible locally hosted image assets.

**Workers**
- Provide lightweight API endpoints when needed.
- Return cached structured data.
- Support ingestion-related operations.

**Cron Triggers**
- Fetch updated orbital datasets.
- Refresh suitable external metadata.
- Execute lightweight synchronization tasks.

**D1 — Optional**
- Store structured information that requires persistence.

## 13.2 Cost Constraints

**Target recurring infrastructure cost: €0/month, excluding domain registration.**

The project must:

- Remain within published free-tier quotas.
- Avoid mandatory paid APIs.
- Minimize storage and bandwidth.
- Prefer cached content.
- Avoid expensive backend processing.
- Provide an alternative when a free-tier capability is unavailable.

This target does not guarantee that the application can support unlimited traffic at no cost.

Cloudflare's current limits and billing arrangements must be rechecked before enabling new infrastructure services.

## 13.3 Deployment Pipeline

Recommended process:

1. Developer pushes changes to GitHub.
2. GitHub Actions executes validation.
3. Unit tests run.
4. Application build runs.
5. Deployment occurs through Wrangler.
6. Post-deployment smoke tests validate critical routes.

Production secrets must not be committed to the repository.

## 13.4 Local Development

Developers must be able to:

- Run the application locally.
- Build the static website.
- Execute tests.
- Use fixtures for external data.
- Test Worker integrations where required.
- Validate orbital calculations without production infrastructure.

---

# 14. Future Vercel Migration Strategy

Moving to Vercel is a future option, not a launch requirement.

## 14.1 Migration Scope

| Component | Migration approach |
|---|---|
| Astro | Keep existing application |
| React | No expected changes |
| CesiumJS | No expected changes |
| satellite.js | No expected changes |
| Static content | Keep content files |
| Cloudflare Workers | Replace runtime-specific endpoints |
| Cloudflare D1 | Migrate or replace persistence |
| Cloudflare Cron | Replace scheduling mechanism |
| Deployment | Use supported Vercel deployment adapter |
| Domain | Update appropriate DNS configuration |

## 14.2 Migration Options

### Option A — Frontend Migration

Move the Astro application to Vercel while retaining Cloudflare-hosted data services.

Advantages:
- Smaller initial migration.
- Less disruption.
- Existing data pipelines remain operational.

Disadvantages:
- Two infrastructure providers.
- Additional operational complexity.

### Option B — Full Migration

Move the application, API, persistence and scheduled tasks away from Cloudflare.

Advantages:
- Consolidated infrastructure.
- No ongoing Cloudflare runtime dependency.

Disadvantages:
- Requires additional integration and data migration work.

## 14.3 Migration Acceptance Criteria

- All core pages function correctly.
- Mission data remains consistent.
- Satellite calculations produce equivalent results.
- Source metadata is preserved.
- Scheduled ingestion works.
- Secrets and configuration are correctly migrated.
- DNS cutover is validated.
- No unexpected paid service becomes mandatory.

---

# 15. Non-Functional Requirements

## 15.1 Performance

- Core content must remain usable on mobile networks.
- Mission pages must not require loading CesiumJS.
- Heavy visualization assets must load on demand.
- Satellite rendering must limit unnecessary objects and calculations.
- Static content should be served through Cloudflare's edge infrastructure.
- External provider latency must not unnecessarily block cached content.

## 15.2 Reliability

- Cached content must remain accessible during temporary provider outages.
- Ingestion failures must be logged.
- Invalid updates must not overwrite verified data.
- Stale data must be clearly labeled.
- Critical content must not depend on continuous external API availability.

## 15.3 Security

- Validate external data.
- Protect private credentials.
- Keep secrets outside Git.
- Restrict expensive public API operations.
- Maintain dependency updates.
- Apply reasonable abuse protection.

## 15.4 Accessibility

Target WCAG 2.2 AA for core interactions.

Requirements include:
- Keyboard support.
- Semantic controls.
- Readable contrast.
- Text alternatives.
- Reduced-motion support.
- Non-visual alternatives to important 3D information.

## 15.5 Privacy

- No accounts for the MVP.
- No unnecessary personal data collection.
- Prefer minimal, privacy-respecting analytics.
- Document third-party integrations affecting visitors.

## 15.6 SEO

- Indexable mission pages.
- Semantic HTML.
- Descriptive titles and metadata.
- Sitemap.
- Canonical URLs.
- Structured metadata where useful.

---

# 16. MVP Definition

## 16.1 MVP Objective

Validate the platform's main concept:

**Connect European mission information with interactive satellite visualization powered by real public data.**

## 16.2 MVP Deliverables

### MVP-01 — Website Foundation

- Responsive application.
- Homepage.
- Navigation.
- About page.
- Data sources page.
- Basic design system.

### MVP-02 — Mission Catalog

- Approximately 10 curated European missions.
- Search.
- Basic filtering.
- Mission detail pages.
- Verified source links.

### MVP-03 — Satellite Tracker

- Interactive 3D Earth.
- Selected Sentinel spacecraft.
- Predicted orbital positions.
- Orbit visualization.
- Spacecraft details.
- Source timestamps.
- Tracking disclaimer.

### MVP-04 — Data Integration

- CelesTrak connector.
- Data validation.
- Cached orbital elements.
- Source metadata.
- Basic ingestion workflow.

### MVP-05 — Engineering Foundation

- Public GitHub repository.
- Project README.
- Local setup instructions.
- Automated tests.
- CI/CD.
- Cloudflare deployment.
- Documented architectural decisions.

## 16.3 MVP Exclusions

- Complete image gallery.
- Observatory catalog.
- Launch calendar.
- Interactive Copernicus processing.
- Deep-space visualization.
- Accounts and personalization.
- Public developer API.
- Vercel deployment implementation.

## 16.4 MVP Acceptance Criteria

The MVP is complete when:

1. Visitors can browse the curated mission catalog.
2. Visitors can search and filter missions.
3. Mission pages display verified source information.
4. At least one Sentinel spacecraft can be visualized.
5. Orbital positions are calculated using real orbital elements.
6. The interface clearly identifies predictions and source timestamps.
7. Supported missions link to their associated spacecraft.
8. External data retrieval respects provider restrictions.
9. The site works on desktop and mobile, with an accessible tracker fallback.
10. Automated tests pass.
11. The application deploys to Cloudflare Free.
12. No paid infrastructure service is mandatory.
13. Core application logic has no Cloudflare-specific dependencies.
14. Repository documentation explains how to build and deploy the project.

---

# 17. Delivery Roadmap

Delivery follows milestones rather than mandatory commercial deadlines.

## Phase 0 — Foundation

**Objective:** Establish the project.

Deliverables:
- Confirm domain and branding.
- Create GitHub repository.
- Initialize Astro and TypeScript.
- Configure styling and design tokens.
- Establish CI.
- Configure Cloudflare deployment.
- Publish a minimal landing page.
- Verify initial data licenses.

## Phase 1 — Mission Explorer

**Objective:** Deliver the first useful information experience.

Deliverables:
- Mission content schema.
- Initial mission catalog.
- Search and filters.
- Mission detail pages.
- Source attribution.

## Phase 2 — Satellite Tracker

**Objective:** Deliver the primary interactive feature.

Deliverables:
- CelesTrak integration.
- Cached orbital elements.
- Browser-side SGP4.
- CesiumJS visualization.
- Spacecraft selection.
- Orbital paths.
- Mission-to-spacecraft navigation.

## Phase 3 — Imagery and Observatories

**Objective:** Expand exploration beyond satellite tracking.

Deliverables:
- Licensed image gallery.
- Image details.
- Observatory catalog.
- Observatory pages.
- Mission-related imagery.

## Phase 4 — Launches and Earth Observation

**Objective:** Introduce richer mission and Earth data.

Deliverables:
- Launch calendar.
- Mission/launch associations.
- Selected Copernicus imagery.
- Image metadata and acquisition dates.

## Phase 5 — Experimental Capabilities

Potential features:
- Deep-space mission tracking.
- Satellite pass predictions.
- Mission timelines.
- Interactive solar system.
- AI-assisted exploration of mission metadata.
- Public APIs.
- Embeddable visualizations.
- Personal collections.

These are exploratory ideas, not commitments.

---

# 18. First Engineering Milestone — First Orbit

## 18.1 Objective

Create a minimal end-to-end experience connecting a real European mission to a live-updating visualization of a spacecraft's predicted orbit.

## 18.2 User Scenario

A visitor opens europeinspace.org, selects Sentinel-2, reads its mission information and opens an interactive Earth visualization showing the predicted position and orbital path of a related spacecraft.

## 18.3 Scope

Required components:

1. Minimal homepage.
2. One verified mission record.
3. One spacecraft record.
4. CelesTrak data connector.
5. Orbital data cache.
6. SGP4 propagation.
7. 3D Earth visualization.
8. Source timestamps.
9. Orbital accuracy disclaimer.
10. Cloudflare Free deployment.

## 18.4 Implementation Principles

- Use static content wherever possible.
- Avoid a database unless required.
- Execute calculations in the browser.
- Keep external data ingestion controlled.
- Prefer simple, well-tested code.
- Keep domain logic independent of deployment infrastructure.

## 18.5 Definition of Done

- The mission detail page works.
- A real spacecraft is associated with the mission.
- Valid public orbital elements are loaded.
- Predicted positions are displayed.
- Calculations are tested against an independent reference for a defined epoch.
- The interface displays timestamps and limitations.
- The application works in current desktop browsers.
- Mobile users receive a usable experience or accessible fallback.
- No paid hosting dependencies are required.
- Production deployment is reproducible.
- Source attribution is documented.

---

# 19. Success Criteria

As a personal project, success should prioritize utility, learning and enjoyment over commercial metrics.

## 19.1 Product Success

- Visitors can explore European missions.
- Tracking works accurately within documented limitations.
- Data sources are transparent.
- The website is accessible and understandable.

## 19.2 Engineering Success

- The codebase is maintainable.
- Integrations are reliable.
- Tests cover important behavior.
- Deployment is reproducible.
- New capabilities can be introduced incrementally.
- Infrastructure remains portable.

## 19.3 Personal Success

- The project remains enjoyable.
- It encourages technical learning.
- It creates meaningful public engineering work.
- It supports exploration of space science.
- It can grow without becoming a full-time obligation.

## 19.4 Initial Targets

| Indicator | Target |
|---|---|
| Curated missions | Approximately 10 |
| Trackable spacecraft | At least 1 validated |
| Core UI | Responsive |
| Source provenance | Available for relevant data |
| Automated tests | Passing |
| Source repository | Public |
| Hosting cost | €0/month target |
| Hosting provider | Cloudflare |
| Migration compatibility | Architectural boundaries in place |

---

# 20. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Data license restrictions | High | Verify source and asset usage rights |
| Inaccurate satellite tracking | High | Validate SGP4 calculations and timestamps |
| API outages | Medium | Cache verified data |
| Rate limits | Medium | Scheduled ingestion |
| Free-tier quota exhaustion | Medium | Static-first architecture, monitoring |
| Large imagery costs | Medium | Use curated or remote assets |
| Scope expansion | High | Maintain strict MVP |
| Browser rendering performance | Medium | Lazy loading and object limits |
| Incomplete mission metadata | Medium | Curated catalog and validation |
| Hosting lock-in | Medium | Provider-independent core |
| Maintenance fatigue | Medium | Simple architecture and flexible roadmap |
| Brand naming conflict | Medium | Trademark and identity checks |

---

# 21. Legal, Licensing and Identity

## 21.1 Independent Project

Europe in Space is an independent personal initiative.

It is not affiliated with or endorsed by ESA, EUMETSAT, ESO, the European Union or other space agencies.

## 21.2 Proposed Disclaimer

"Europe in Space is an independent, open-source project exploring European space missions and publicly available space data. It is not affiliated with or endorsed by the European Space Agency or other space organizations."

## 21.3 Content Licensing

Requirements:

- Respect source licensing.
- Display required attribution.
- Link to original scientific data.
- Avoid unauthorized agency logos.
- Record image usage permissions.
- Respect API terms.
- Document data provenance.

## 21.4 Project Licensing

The source code should be publicly available under an appropriate open-source license.

The final license must be selected after reviewing project dependencies and third-party content.

The project code license does not automatically apply to external imagery or scientific datasets.

## 21.5 Naming

**Preferred name:** Europe in Space  
**Preferred domain:** europeinspace.org

The name has existing third-party uses. Basic trademark and brand checks should be completed before a formal public launch.

---

# 22. Open Questions

## OQ-001 — European Mission Classification

How should a mission qualify as European?

Potential criteria include:
- ESA leadership.
- European national agency leadership.
- Substantial European industrial participation.
- European scientific contribution.
- European Union program involvement.

A consistent classification policy is needed.

## OQ-002 — Initial Dataset

Which exact spacecraft will be included in the First Orbit milestone?

Identifiers and current orbital-data availability must be validated.

## OQ-003 — Design System

What typography, color palette and component language will define Europe in Space?

Current direction: dark-first scientific exploration.

## OQ-004 — Content Workflow

Should curated mission content remain Git-managed, or eventually move to an editorial interface?

Initial preference: Git-managed content.

## OQ-005 — Data Persistence

At what scale does D1 become preferable to static JSON datasets?

Initial preference: introduce D1 only when required.

## OQ-006 — Monitoring

Which free or low-cost monitoring tools should be used for deployment and ingestion health?

## OQ-007 — Imagery Delivery

Should the platform reference remote imagery, maintain curated local thumbnails or use an object store?

The decision must account for licensing, caching and provider restrictions.

---

# 23. Reference Resources

## European Organizations

- ESA — https://www.esa.int
- Copernicus — https://dataspace.copernicus.eu
- EUMETSAT — https://www.eumetsat.int
- ESO — https://www.eso.org
- ESA/Hubble — https://esahubble.org

## Space Data

- CelesTrak — https://celestrak.org
- JPL Horizons — https://ssd.jpl.nasa.gov/horizons/
- Launch Library 2 — https://ll.thespacedevs.com/docs

## Development

- Astro — https://astro.build
- React — https://react.dev
- CesiumJS — https://cesium.com/platform/cesiumjs/
- satellite.js — https://github.com/shashwatak/satellite-js
- MapLibre — https://maplibre.org

## Cloudflare

- Workers — https://developers.cloudflare.com/workers/
- Static Assets — https://developers.cloudflare.com/workers/static-assets/
- D1 — https://developers.cloudflare.com/d1/
- Cron Triggers — https://developers.cloudflare.com/workers/configuration/cron-triggers/
- Wrangler — https://developers.cloudflare.com/workers/wrangler/

## Future Hosting

- Vercel — https://vercel.com
- Vercel Astro documentation — https://vercel.com/docs/frameworks/frontend/astro

Provider limits, documentation, licensing and integration support must be checked again during implementation.

---

# 24. Final Product Statement

**Europe in Space is an independent, open-source platform for exploring Europe's activities beyond Earth.**

It connects missions, spacecraft, scientific observations, imagery and space data into a coherent interactive experience.

The project begins with a mission explorer and satellite tracker and can gradually evolve into a broader European space exploration platform.

It will initially run on Cloudflare Free, using a simple, portable architecture that preserves the option of future deployment to Vercel.

The project's objective is not to become the largest space information service.

Its purpose is to make European space exploration accessible, interactive and enjoyable while providing a meaningful environment for continuous engineering experimentation.

**Project:** Europe in Space  
**Domain:** europeinspace.org  
**PRD Version:** 1.1  
**Next Milestone:** First Orbit  
**Status:** Ready for technical design and implementation planning.
