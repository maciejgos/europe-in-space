# ADR-012: Astro Static Generation for the Public Website

- **Status:** Accepted
- **Date:** 2026-11-15
- **Decision owners:** Project maintainer
- **Scope:** Europe in Space / First Orbit

## Context

Most initial Europe in Space content is editorial: mission descriptions, project information, data-source documentation, and methodology. The interactive satellite viewer is limited to specific pages. The project targets Cloudflare Free and portability to Vercel, while minimizing runtime compute and JavaScript shipped to users.

## Decision

Use **Astro in static-output mode** for content pages and routes in First Orbit. Load React and CesiumJS only for interactive surfaces that need them. Deploy the static website, lightweight Worker API, and scheduled ingestion together in one Cloudflare Workers Static Assets deployment. Serve mutable orbital elements through the Worker API using the store specified in [ADR-016](016-d1-for-first-orbit-orbital-persistence.md).

- Build mission pages from source-controlled content collections.
- Validate structured metadata at build time.
- Render navigational and explanatory content without client hydration.
- Lazy-load the tracker and its heavy dependencies.
- Avoid Astro runtime SSR and a platform-specific Astro adapter unless a demonstrated feature requires it.
- Keep static URLs, links, and data-source references usable without the interactive viewer.

## Rationale

Static generation fits the current content workload, simplifies hosting, improves portability, and avoids routine server-side page rendering. Astro's islands architecture lets a small React/Cesium application coexist with mostly static pages.

## Consequences

### Positive
- Low runtime resource consumption and good caching characteristics.
- Mission content can be reviewed as code changes.
- The frontend is straightforward to move between hosting providers.

### Negative / trade-offs
- Changes to editorial pages require a new build and deploy.
- Features such as authenticated accounts or server-rendered personalization would require additional architecture.
- The Cesium viewer still requires separate performance and mobile testing.

## Alternatives Considered

1. **Next.js SSR** — supports rich dynamic routes but introduces unnecessary runtime concerns for the first milestone.
2. **Astro SSR/hybrid** — a valid future option, but adds deployment runtime coupling without a current need.
3. **Entirely client-rendered React SPA** — possible, but weaker default fit for content-heavy, indexable pages.
4. **Plain HTML generator** — sufficiently portable but makes content collections and interactive islands less convenient.

## Validation Before Release

- Deploy a static Astro build on Cloudflare Workers Static Assets.
- Confirm mission routes are indexable and function with JavaScript disabled.
- Verify Cesium is absent from unrelated page bundles.
- Run representative performance and mobile smoke tests.

## Revisit When

The product needs runtime personalization, per-request rendering, or editorial updates that cannot be served efficiently through build-time content.
