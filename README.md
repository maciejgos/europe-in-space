# 🌍 Europe in Space

**Explore Europe's journey into space.**

[**Website**](https://europeinspace.org) · [**Features**](#what-were-building) · [**Technology**](#technology-stack) · [**Roadmap**](#development-roadmap) · [**Development**](#development) · [**Contributing**](#contributing) · [**About**](#about-the-project)

> **Project status:** Early development — First Orbit milestone

Europe in Space is an independent, open-source project dedicated to making Europe's presence in space more accessible, interactive and enjoyable to explore.

The goal is to bring European space missions, satellites, observatories, scientific discoveries and imagery together into one interactive platform powered by real, publicly available space data.

Rather than building another space news website, Europe in Space focuses on **exploration through data, visualization and technology**.

## 🚀 What we're building

Europe in Space aims to become an interactive destination for exploring Europe's activities beyond Earth.

### 🛰️ Satellite Tracker

Explore European spacecraft orbiting Earth through an interactive 3D globe.

- Visualize predicted satellite positions and orbital trajectories.
- Explore spacecraft associated with European missions.
- Follow orbital paths and ground tracks.
- Inspect orbital information and data sources.

Satellite positions are calculated from publicly available orbital elements, not continuous live spacecraft telemetry.

### 🌌 Mission Explorer

Discover the missions shaping Europe's contribution to space exploration.

- Browse European space missions.
- Explore mission objectives, timelines and spacecraft.
- Discover participating agencies and organizations.
- Connect mission information with interactive visualizations.

### 🔭 Observatories and Telescopes

Explore Europe's astronomical observatories and scientific instruments.

- Discover space-based and ground-based observatories.
- Learn about telescopes and their scientific objectives.
- Explore astronomical observations and discoveries.

### 📷 Space Imagery

Explore the universe through imagery from European space programs and observatories.

- Discover astronomical photography.
- Explore selected Earth observation imagery.
- Learn about the instruments and missions behind each image.
- Access original sources and attribution information.

### 🌍 Earth Observation

Explore Earth through data collected by European observation missions, including the Copernicus Sentinel program.

Future capabilities may include interactive imagery layers, observation timelines and selected environmental datasets.

## 🛠️ Technology stack

Europe in Space is being designed as a **static-first, cloud-portable web application**, with interactive visualization and lightweight serverless data services.

| Area | Technology |
|---|---|
| Web framework | Astro |
| Interactive UI | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| 3D visualization | CesiumJS |
| Orbital calculations | satellite.js |
| Hosting | Cloudflare Workers Static Assets |
| Serverless API | Cloudflare Workers |
| Orbital data storage | Cloudflare D1 |
| Scheduled ingestion | Cloudflare Cron Triggers |
| Testing | Vitest, Playwright |
| CI/CD | GitHub Actions |

The initial goal is to run the platform entirely within **Cloudflare's free tier**, excluding domain registration.

The application is also being designed to remain portable, allowing a future move to Vercel or another hosting provider without rewriting its core functionality.

These are the planned technologies; the stack may evolve as development progresses.

## 🛰️ Data sources

Europe in Space combines publicly accessible space data from established scientific organizations and services.

Planned sources include:

| Provider | Purpose |
|---|---|
| [European Space Agency (ESA)](https://www.esa.int/) | European missions and spacecraft |
| [CelesTrak](https://celestrak.org/) | Satellite orbital elements |
| [Copernicus Data Space](https://dataspace.copernicus.eu/) | Earth observation data |
| [EUMETSAT](https://www.eumetsat.int/) | Meteorological satellite data |
| [European Southern Observatory](https://www.eso.org/) | Astronomical observations and imagery |
| [ESA/Hubble](https://esahubble.org/) | Space telescope imagery |
| [NASA JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) | Solar system and spacecraft ephemerides |

Data sources will be integrated incrementally.

Each integration should preserve relevant provenance information, including original sources, timestamps and attribution requirements.

**Publicly accessible does not necessarily mean unrestricted reuse.** Third-party datasets, images and materials remain subject to their respective licenses and usage conditions.

## 🧭 Development roadmap

Europe in Space is a personal project being developed incrementally.

### Phase 1 — First Orbit

The first milestone focuses on demonstrating the platform's core experience.

- [x] Set up the Astro application and Cloudflare Worker configuration.
- [x] Provision Cloudflare resources and deploy the application.
- [x] Create the initial design system and responsive layout.
- [x] Implement the first European mission detail page.
- [ ] Integrate CelesTrak orbital data.
- [ ] Implement browser-based orbital calculations.
- [ ] Build an interactive 3D Earth visualization.
- [ ] Display a real spacecraft's predicted position and orbit.
- [ ] Add source attribution and data freshness indicators.
- [ ] Establish automated testing and CI/CD.

**Milestone goal:** Select a European mission and explore the predicted orbit of one of its spacecraft.

### Phase 2 — Mission Explorer

- [ ] Build a searchable European mission catalog.
- [ ] Add mission categories and filtering.
- [ ] Connect missions with spacecraft.
- [ ] Expand satellite tracking coverage.

### Phase 3 — Space Imagery and Observatories

- [ ] Create a curated space imagery gallery.
- [ ] Add European observatory profiles.
- [ ] Connect scientific imagery with relevant missions.

### Phase 4 — Launches and Earth Observation

- [ ] Introduce a European launch calendar.
- [ ] Explore selected Copernicus imagery.
- [ ] Add Earth observation visualizations.

### Future experiments

Potential ideas include deep-space spacecraft visualization, satellite pass predictions, interactive mission timelines, a solar system explorer and public data APIs.

The roadmap is intentionally flexible. This is a project driven by curiosity, exploration and engineering experimentation rather than commercial deadlines.

## 🤖 Building with OpenAI Codex

Europe in Space is being developed with the assistance of [OpenAI Codex](https://developers.openai.com/codex/).

An important part of this project is exploring how AI coding agents can support real software engineering — from architecture and implementation to testing, debugging and maintenance.

Codex is used as a development assistant, while architectural decisions, scientific validation, code review, security and final implementation responsibility remain with the project maintainer.

The development process will also serve as an opportunity to document practical AI-assisted engineering workflows.

Topics I plan to explore include:

- Turning product requirements into implementation tasks.
- Designing maintainable architectures with coding agents.
- Integrating scientific data APIs.
- Validating orbital mechanics and numerical calculations.
- Building interactive visualizations.
- Reviewing, testing and improving AI-assisted code.
- Understanding where AI coding agents are useful — and where human judgment is essential.

The goal is not merely to generate code with AI, but to understand how AI can improve the engineering process while maintaining correctness, transparency and ownership.

Selected lessons and workflows may be shared through project documentation and technical articles.

*This is an independent project and is not affiliated with or endorsed by OpenAI.*

## 💻 Development

The scaffold requires Node.js 22.23.4 or newer and pnpm 12.21.0 (see `packageManager` in `package.json`).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Astro. The homepage is at `/`, the interactive component reference is at `/design-system/`, and `/missions/` demonstrates catalog filtering and a mission layout preview. Other exploration areas have responsive starter layouts with explicit development status. No orbital data is connected yet.

Design rationale, scope and asset information are in [the initial design brief](docs/designs/initial-design-system.md).

Other checks are available with `pnpm check`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`. Install the browser for the end-to-end test once with `pnpm exec playwright install chromium`.

For a local preview of the Worker and built static assets, run `pnpm build` followed by `pnpm exec wrangler dev`. The Worker reserves `/api/*`, which currently returns 404. D1, scheduled ingestion, orbital calculations, and the tracker have not yet been implemented; deployment requires Cloudflare configuration and provisioning.

The application separates portable domain logic, data source integrations, and infrastructure-specific implementations as described in [ARCHITECTURE.md](ARCHITECTURE.md).

## 🤝 Contributing

Europe in Space is intended to be an open-source project, and contributions, feedback and ideas are welcome.

The project is currently in its early stages, so contribution guidelines and development conventions will evolve as the implementation takes shape.

If you're interested in space exploration, scientific data, orbital mechanics, web visualization or AI-assisted engineering, feel free to open a GitHub issue to share an idea or discuss an improvement.

For substantial changes, please open an issue before beginning implementation.

## 📄 License

An open-source license will be selected and added to the repository before its first public code release.

Until a license is published, the source code should not be assumed to grant redistribution or modification rights.

Third-party space data, imagery, logos and other materials remain subject to their respective licenses and attribution requirements.

## ℹ️ About the project

Europe in Space is a personal engineering and exploration project created out of curiosity about space, science and technology.

It is an opportunity to learn, experiment and build something useful at the intersection of software engineering and European space exploration.

The project is independent and is not affiliated with or endorsed by the European Space Agency, the European Union, EUMETSAT, ESO or other space organizations.

Satellite positions and trajectories presented by the platform are predictions derived from publicly available orbital data. They must not be used for operational navigation, collision avoidance or other safety-critical purposes.

---

**Europe in Space** · [europeinspace.org](https://europeinspace.org)

*Built for curiosity. Powered by open space data. Developed with the assistance of OpenAI Codex.*