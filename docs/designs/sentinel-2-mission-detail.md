# Sentinel-2 mission detail page

- **Author** Maciej Gos
- **Status** Draft
- **Date** 2026-11-24

## Overview

Publish the first verified Europe in Space mission profile at `/missions/sentinel-2/`. A visitor should be able to explain what Sentinel-2 observes, why those observations matter, and how the spacecraft relate to the mission. They should also be able to follow the sources behind the page.

## The problem

Before this release, the catalog and detail route served a layout preview. The overview described the interface, the spacecraft panel held placeholder copy, and the orbit panel pointed toward a tracker under development.

The page needs a reviewable source of editorial content. [ADR-008](../decisions/008-static-content-before-database.md) requires version-controlled editorial content with Astro validation. The [First Orbit technical design](../Technical%20Design%20Document.md#71-storage) specifies Astro collections for mission content. That lets the editorial page ship independently of the tracking work.

## Goals

- Publish one source-backed mission overview, an explanation of what the mission observes, and a concise account of its spacecraft.
- Give visitors working paths from the homepage, mission catalog, and site search to the existing mission URL.
- Display source publishers and links, relevant source dates, the editorial verification date, and illustration attribution and applicable usage terms.
- Make the mission content readable from the generated HTML on mobile and desktop.

## Non-goals

Live or predicted positions, orbital data ingestion, D1 provisioning, spacecraft detail routes, imagery browsing, and expansion to additional missions belong to later work.

First Orbit is the broader milestone that includes a public spacecraft tracker.

- [EIS-004](../Technical%20Design%20Document.md#eis-004--define-domain-models) covers mission-entry validation and inline spacecraft associations in this release. Validation for the deferred domain fields and normalized spacecraft records remains open.
- [EIS-005](../Technical%20Design%20Document.md#eis-005--implement-mission-content-collection) covers the static build of the mission profile in this release. Display of the deferred required mission fields remains open.
- [EIS-006](../Technical%20Design%20Document.md#eis-006--build-mission-navigation) covers the homepage-to-mission path in this release. The tracker path remains open.

## Critical user journeys

| Given | When | Then |
| --- | --- | --- |
| A reader starts on the homepage, in the catalog, or in site search | They select Sentinel-2 | The mission page opens at its existing URL, with a plain-language explanation of what it observes and why. |
| A reader wants to understand the spacecraft | They navigate to Spacecraft | They can distinguish the mission from its individual spacecraft and see which facts each source supports. |
| A reader opens the URL with JavaScript disabled | They follow a section link | The link reaches its visible Overview, Spacecraft, or Sources target in the generated HTML. |
| A reader wants to check a claim | They follow the citation next to the claim | They reach the Sources entry and can open its official publication. The Sources section displays the whole-record verification date once, above the entries. |

## Technical plan

Use one build-time Markdown entry in an Astro content collection. Keep the existing fixed route for this slice. The build reads the entry into the existing detail layout and feeds the catalog card and search result from the same structured fields. Cloudflare serves the generated assets through the existing deployment.

| Content | Representation and validation |
| --- | --- |
| Identity and catalog copy | Use the collection entry ID derived from the filename for route identity. Require a title, summary, and supported category. Review factual claims in the shared summary and make them traceable to cited evidence on the mission detail page. The mission route expects the Sentinel-2 entry and fails the build with a clear error if it is missing. |
| Editorial overview | Use the Markdown body for the explanation and examples. Place descriptive links to the canonical Sources entries next to the claims they support. Each Sources entry links to the official publication. |
| Spacecraft | Require display names and spacecraft IDs that are unique within the mission entry. Write each spacecraft summary as short statements with source references. Group statements under one citation only when it supports every claim in the group. Render the spacecraft citations beside the statements they support, linking to the same Sources entries. These editorial IDs do not select a tracking target. |
| Sources | Require named publishers, descriptive titles, HTTPS URLs, and unique source IDs. Store one editorial verification date on the mission record and show it once at the top of the Sources section. Record and display a publication or effective date when the source provides a date relevant to the claim. Keep that date separate from the editorial verification date. Store and show applicable usage terms with the source. Validate dates when present and check references from structured fields against the record's source IDs. |
| Hero | Reference the existing illustration and store its attribution and applicable usage terms with the asset. Display the attribution, applicable terms, and the AI-generated label. |

Fail the build if the mission overview has no editorial text, any of Sentinel-2A, Sentinel-2B, or Sentinel-2C lacks a cited spacecraft summary, or the record has no cited source. During the build, verify that each rendered overview, spacecraft statement, and status citation fragment matches exactly one ID in the page and that its target is a Sources entry.

The collection entry ID represents the First Orbit mission ID and slug, and the title represents the mission name. Each inline spacecraft ID supplies the corresponding mission-to-spacecraft association through its containing entry. Display the mission title, category, summary, and spacecraft names, with spacecraft status shown when verified. The Sources section identifies the ESA overview as the official mission page. Dedicated fields for mission status, organizations, and launch date, normalized spacecraft records, and orbital identifiers and trackability belong to later First Orbit work.

Preserve the hero and shared page components. Use ordinary in-page links to visible Overview, Spacecraft, and Sources sections. Hide the placeholder Orbit section until a working route exists. Keyboard users can activate the native section links, and the target content remains available with JavaScript disabled.

Use [ESA’s Sentinel-2 overview](https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-2/) and [Copernicus mission documentation](https://sentiwiki.copernicus.eu/web/s2-mission) as starting points for editorial verification. For each editorial update, review changed claims and their citations. Set or advance the mission’s editorial verification date only after checking the entire public record, including the shared summary, overview, spacecraft statements, displayed status, and their sources. Use dated operator statements for time-sensitive roles. Use [ADR-003](../decisions/003-provenance-first-data-model.md) for provenance requirements.

Keep any spacecraft status distinct from mission status. Display a status only when a source establishes both the status and when it applied. Show the label with its as-of date and cite the source beside it. Use the date the source establishes for the role or event being described. Distinguish it from the source publication date, the whole-record verification date, and dates of other events such as a campaign’s announced end. Omit the label when the source does not establish when it applied. Status labels are dated editorial descriptions. A controlled status vocabulary belongs to the later normalized spacecraft model.

Explain the handover from Sentinel-2A to Sentinel-2C and the separate Sentinel-2A observation extension using dated, attributed wording. Identify the nominal Sentinel-2B and Sentinel-2C pairing, the standard two-satellite configuration, using a source that establishes when it applied. If the evidence only establishes a past pairing, describe it as historical and cite that evidence. Mark any future change as planned and give the date it is expected to apply when the source provides one. Include Sentinel-2D as a planned successor to Sentinel-2B only when a source verifies that role and the detail explains continuity.

## Alternatives considered

| Approach | Trade-off |
| --- | --- |
| Embed all text in the existing Astro page | Smallest edit for one page. It duplicates catalog and search metadata and bypasses the collection validation specified by ADR-008. |
| Generate dynamic routes from the collection now | Makes each entry publishable through a shared template. With one route, the extra routing change has little immediate value. |
| Read mission content from D1 | Supports editing independently of builds and runtime queries. It adds a binding, migrations, and a runtime dependency. The editorial model in ADR-008 uses Git review and rebuilds. |

## Risks and mitigations

- Spacecraft roles can change between releases. Date time-sensitive statements and update them through Git review and a rebuild.
- Renamed source entries can break citations. Check structured references and rendered citation fragments during the build.
- The build trusts Git-reviewed Markdown. Review external link destinations and applicable usage terms before merging.
- A missing or invalid mission entry fails the build. Keep serving the previous deployment until a valid build is ready.
- The fixed route serves one profile. Revisit route generation when adding a second mission.

## Rollout and rollback

Release through the existing static build after editorial and browser checks. Content corrections use a Git change and redeploy. Roll back by redeploying the previous build or reverting the change. The URL remains stable across rollout and rollback. Building and serving the mission page requires no upstream fetch for mission content or orbital data.

## Detailed implementation plan

The checked-in baseline has a layout preview. The working tree already includes the first collection, record, page, discovery, and navigation changes.

| File | Change from the checked-in baseline |
| --- | --- |
| `src/content.config.ts` | **Create.** Define and validate the mission collection and structured source references. |
| `src/content/missions/sentinel-2.md` | **Create.** Add the source-backed mission overview, cited spacecraft statements, discovery metadata, verification date, and illustration attribution. |
| `src/pages/missions/sentinel-2.astro` | **Modify.** Load the fixed entry and render visible sections, nearby citations, and marked Sources entries. |
| `astro.config.mjs` | **Modify.** Register the generated-page check with `astro:build:done`. |
| `scripts/validate-sentinel-2.mjs` | **Create.** Validate the generated Sentinel-2 page and fail the build on invalid output. |
| `package.json`, `pnpm-lock.yaml` | **Modify.** Add `parse5` as a direct development dependency and update the lockfile. |
| `src/pages/missions/index.astro`, `src/components/layout/SearchDialog.astro` | **Modify.** Look up `getEntry("missions", "sentinel-2")` directly. Use its metadata and the fixed route. Reuse the catalog and search filters. |
| `src/components/sections/FeatureCards.astro` | **Modify.** Populate the featured card from the same Sentinel-2 entry and link to the fixed route. |
| `src/data/site.ts` | **Modify.** Export `missionCategories` for the schema and catalog. Remove the hard-coded mission search preview and retain general search results. |
| `tests/e2e/navigation.spec.ts` | **Modify.** Cover discovery, citation placement, and navigation without JavaScript. |

### Record and editorial content

Replace the spacecraft-level `summary` and `sources` with `statements: { text: string; sourceIds: string[] }[]`. Require at least one statement per spacecraft, trimmed nonempty text, and at least one known source ID per statement. Replace the status string with an optional `{ label: string; asOf: string; sourceId: string }` object. Validate its nonempty label, calendar-valid ISO date, and known source ID. Keep the existing mission and source metadata fields, HTTPS URL checks, and unique spacecraft and source IDs. When the fixed route loads the entry, require `sentinel-2a`, `sentinel-2b`, and `sentinel-2c`. Render citations beside the statements and any displayed status labels. Give the `esa-overview` entry the visible label “Official mission page” in Sources.

Cite the ESA overview for the three launches. Cite the operator handover notice for the January 21, 2025 transfer from Sentinel-2A to Sentinel-2C. Cite `copernicus-mission` for the March 2025 start of Sentinel-2A’s separate observation extension and for the standard Sentinel-2B and Sentinel-2C pairing when that extension began. Preserve month precision. Put the pairing in a cited spacecraft statement and remove the separate uncited sentence from the route. Remove the `extension` source entry and its October 9, 2026 assertion from Playwright. Keep the handover publication and effective date assertions and add an assertion that the March 2025 statement links to SentiWiki. Leave status badges, Sentinel-2D, and the announced extension end for a later editorial update. Set the mission verification date after reviewing the entire public record.

### Generated-page validation

In the Astro build hook, read `missions/sentinel-2/index.html` relative to the hook’s output directory using Node’s filesystem API. Parse the whole document with `parse5` and index every ID by occurrence. Reserve the `#source-` prefix for citations and recognize such links before resolving their destinations. Mark the Markdown body with `data-mission-overview`, each statement container with `data-spacecraft-statement`, each optional status container with `data-spacecraft-status`, and each Sources entry with `data-source-entry` and ID `source-{id}`. Check citation links within these overview, statement, and status containers. Each fragment must match exactly one ID in the full document, and the matching element must be a `[data-source-entry]` descendant of `#sources`.

Use a structural check for the overview. Exclude subtrees rooted at headings (`h1` through `h6`), citation anchors, `script`, `style`, `template`, and elements with the `hidden` attribute. Require at least one Unicode letter or number in the remaining text. Separately require at least one citation anchor inside `[data-mission-overview]` outside headings and the excluded non-content and hidden subtrees. The browser checks actual visibility. On failure, identify the route and offending fragment or missing content.

### Implementation phases

1. Change the schema, record, detail rendering, and affected Playwright assertions together. Run `pnpm check`, `pnpm build`, and `pnpm test:e2e`.
2. Add generated-page validation and limit discovery to the fixed Sentinel-2 route. Run the build and its failure checks.
3. Complete the browser, Cloudflare preview, and editorial checks below.

### Verification and release criteria

- **Build.** Run `pnpm check` and `pnpm build`. Temporarily modify the record or route one case at a time. Check an absent entry, a blank overview, a heading-only overview, an overview with only citation anchors and punctuation, an overview with editorial text only in excluded subtrees, and prose without an overview citation. Check a missing required spacecraft, a malformed source URL, a non-HTTPS source URL, an invalid date, and unknown statement and status references as separate cases. With a temporary dated status, check that its citation passes for a valid source and fails when the rendered destination is outside Sources. Check generated HTML failures with a stale overview fragment after a source ID rename, a duplicate ID introduced in overview markup that passes schema validation, and a matching target outside Sources. Require a diagnostic naming the mission and invalid field, spacecraft, or citation. Restore the originals after each case and confirm a successful build after restoration.
- **Browser.** Run `pnpm test:e2e`. Check homepage, catalog, and search discovery, plus catalog filtering and reset. With JavaScript disabled, focus each Overview, Spacecraft, and Sources link and press Enter. Assert the URL fragment, visible target, and target focus for each. Assert a visible citation inside the overview and at least one visible citation within each spacecraft statement container. For every citation, assert that its ID occurs once and the target belongs to `#sources [data-source-entry]`. Assert that mission content has no status badges, Orbit controls, or tracker links. Check mobile layout and keyboard focus.
- **Local Workers asset smoke test.** After building, run `pnpm exec wrangler dev` with the existing ASSETS binding and no storage binding. Request `/missions/sentinel-2/` and require HTTP 200 with the Sentinel-2 heading and Sources section in the response.
- **Editorial.** Verify the shared summary and published claims against their cited publications. Check the single whole-record verification date above Sources, applicable publication and effective dates, the dated citation beside any status label if one is introduced, and illustration attribution, AI-generated labeling, and applicable terms.

## Open decision for First Orbit

Once the [First Orbit §8.1 comparison](../Technical%20Design%20Document.md#81-source) selects a verified spacecraft and its public tracker route works, add the mission-page link using the target from that spacecraft’s verified record.

*Drafted with EGM*
