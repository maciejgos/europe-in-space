# Initial design system and responsive layout

Date: 2026-11-19  
Status: Working design exploration, ready for maintainer review  
Base: `main` at `eea827b`  
Branch: `codex/initial-design-system-layout`

## What this resolves

The README’s First Orbit milestone needs a recognizable visual language and a responsive shell before scientific integrations are added. This implementation turns the three supplied mockups into working Astro layouts, with the homepage as the primary visual reference.

The source checkout had unfinished changes. This work starts independently from main and does not copy or alter those changes.

## Brainstorm and direction

Three useful ways to interpret the references were considered:

1. **An image-led entry point.** A large view of Europe from space, one primary mission action and three focused feature cards. Selected for the homepage because it introduces the subject before asking visitors to understand data.
2. **A compact exploration interface.** Catalog controls, clear status labels and tabbed detail panels. Used for the inner layout examples, where visitors have already chosen what to explore.
3. **A data-heavy tracker dashboard.** Dense metrics, orbit controls and a real-time-looking globe. Deferred until real orbital data, calculations and freshness indicators exist. Rendering invented positions would undermine the project’s scientific transparency.

The last homepage mockup supplies the main composition and blue action color. The showcase and journey boards inform cards, page headers, filters, tabs, search and compact navigation. They are visual references, not authorization to publish, deploy or implement every later roadmap feature.

## Design decisions

- Dark navy foundations keep the imagery central; blue identifies primary actions. No theme toggle is added for this milestone.
- Inter Variable and Phosphor Regular are hosted locally, avoiding runtime font or icon services.
- CSS custom properties define semantic color, surface, border, spacing and radius tokens. Tailwind remains available through the existing Vite integration.
- Shared Astro components provide buttons, badges, icons, page headings, header, footer and search. Ordinary content pages ship static HTML; no React hydration is required for this milestone.
- Native disclosure controls and a native modal dialog provide the menu and search behavior. Focus styles, Escape dismissal, dialog focus return, hidden states and keyboard-operated tabs are included.
- Images are optimized local WebP assets. They are explicitly decorative concept art, not scientific observations or spacecraft telemetry.
- The browser header uses an expandable menu below 900px. A second fixed bottom navigation is omitted to preserve reading space and avoid duplicating destinations.

## Responsive rules

| Width | Layout |
| --- | --- |
| 320–599px | Single-column feature cards, 22px page gutters, compact header, wrapping actions |
| 600–899px | Two feature columns, full-width data card, compact header |
| 900px and up | Three feature columns, desktop navigation, fluid gutters |

Content is capped at 1512px. Headings scale with viewport width. Card artwork is cropped and blended to preserve space for editable text. Reduced motion disables transitions and card movement.

## Working routes and scope

- `/`: reference-led responsive homepage.
- `/design-system/`: interactive foundations and component reference.
- `/missions/`: one sample mission, working category selection, text search, empty state and reset.
- `/missions/sentinel-2/`: mission **layout preview**, with keyboard-accessible Overview, Spacecraft, Orbit and Sources tabs.
- `/satellites/`, `/observatories/`, `/imagery/`, `/earth/`: responsive destination layouts with explicit development status.
- `/about/`, `/data-sources/`, `/404.html`: supporting pages using the same shell.

Global search finds local destinations and the sample mission. All homepage actions have real destinations. No external integrations, live positions, Cesium globe, verified mission catalog or deployment is claimed. Those remain separate roadmap work.

## Assets and provenance

Built-in image generation produced all three decorative images, using the supplied homepage mockup as the visual reference. Final files live in `public/images/`:

- `europe-night.webp`: wide cinematic Europe-at-night Earth background. Prompt: “Wide 16:9 space background only; no text, UI, logos or cards. Large realistic Earth at night on the right, Europe illuminated by warm golden city lights, fine icy blue atmosphere and clouds, sparse navy starfield with dark left negative space for editable copy. Subtle thin orbital arcs. Match the reference composition. Decorative illustration, not live scientific imagery.”
- `sentinel-feature.webp`: feature-card spacecraft. Prompt: “Cinematic wide Sentinel-style satellite illustration; silver and gold spacecraft with a deep blue solar panel in the right 60%, dark left 35% for live copy, blue Earth horizon along the bottom, sparse stars, realistic materials, no text, logos, borders or UI. Match the supplied homepage reference. Decorative concept image, not a scientific photograph.”
- `orbit-globe.webp`: complete Earth illustration. Prompt: “A complete spherical Earth centered on Europe at night, blue atmosphere, three thin pale-blue orbital paths with small dot markers, almost-black navy background, full globe visible with breathing room, crisp cinematic realistic illustration. Square composition for a 210px card slot. No text, UI or logos.”

Inter Variable is under the SIL Open Font License (`public/fonts/LICENSE`). Phosphor icons are under MIT (`public/icons/LICENSE`). The generic planet icon serves as the initial project mark; the EU and ESA logos are not used.

## Review and follow-up

The implementation should be reviewed as a working visual foundation. The next feature can replace the sample mission copy with verified content, then connect spacecraft and real orbital elements without changing the shared shell.

Validation and visual evidence are recorded in `design-qa.md` at the worktree root. No changes have been merged into main or published.
