# Initial design system: visual and interaction QA

Date: 2026-11-19  
Scope: initial design system and responsive layouts from the supplied mockups  
final result: passed

## Source and comparison

Primary source: **Europe in Space Homepage-1.png**, 1672 × 941 pixels. Supporting references: **Europe in Space UI Showcase-2.png** and **Europe in Space User Journey-3.png**.

The final homepage was captured in the in-app browser at **1672 × 941 CSS pixels**, device pixel ratio **1**, default content state. The final JPEG is 1672 × 941 pixels. Source and implementation were placed together in the same comparison image before evaluation; a second comparison focuses on feature cards.

- [Desktop implementation](docs/designs/evidence/homepage-desktop.jpg)
- [Source and implementation together, source on left](docs/designs/evidence/homepage-comparison.jpg)
- [Focused cards comparison, source on top](docs/designs/evidence/cards-comparison.jpg)
- [Phone implementation, 390 × 844](docs/designs/evidence/homepage-mobile-viewport.jpg)
- [Tablet implementation](docs/designs/evidence/homepage-tablet.jpg)
- [Phone search state](docs/designs/evidence/search-mobile.jpg)
- [Phone component layout](docs/designs/evidence/design-system-mobile-components.jpg)

This is a responsive working interpretation for the README milestone, rather than an exact scientific product simulation. The hero and satellite illustrations are generated assets, the generic planet mark comes from Phosphor, and future features have clear development labels.

## Findings and corrections

The initial visual review found the following P2 issues. All have been corrected and checked again in the browser:

1. **Footer contrast:** the bright Earth continued behind footer text. Added a fading image mask and more opaque card surfaces. Final desktop evidence shows a dark, readable footer base.
2. **Orbit-card imagery:** a cropped Earth image read as a flat map. Replaced it with a complete globe illustration; blended its background so a square image boundary is not visible.
3. **Tablet text contrast:** the Earth crossed the headline and paragraph. Shifted the tablet artwork to the right, preserving dark space behind the copy. The revised tablet capture shows the correction.
4. **Narrow card framing:** satellite and globe artwork competed with card text. Adjusted object position, image size and copy area, with a restrained text scrim over the satellite image. Phone and tablet captures show separated text and focal subjects.
5. **Phone text contrast:** at 320px the Earth crossed the longer description. Moved the mobile artwork lower so the description has a dark reading area.

No unresolved P0, P1 or P2 finding remains for the requested scope.

## Required fidelity checks

| Area | Result |
| --- | --- |
| Typography | Local Inter Variable loads. Display hierarchy, restrained weights and two-line desktop headline follow the reference. The smallest phone permits natural three-line wrapping. |
| Spacing and layout | Wide three-card composition matches the reference proportions. Tablet becomes two cards plus a full-width card; phone becomes a stack. No page-level horizontal overflow at 1672, 768, 390 or 320px. |
| Colors and tokens | Navy surfaces, blue primary action, pale text and muted secondary text follow the homepage reference. States have visible text and focus indicators. |
| Image quality | Three optimized local WebP illustrations load successfully. The hero preserves dark space for live text. Illustrations are disclosed on the data-sources page. |
| Copy and content | Homepage copy follows the supplied design. Sample catalog/detail content is explicitly a layout preview; future integrations do not claim live or predicted results. |
| Icons | One Phosphor Regular family is used consistently. Decorative icons are hidden from assistive technology. |

## Interaction checks through the in-app browser

Passed:

- Homepage mission action opens the catalog; the satellite action opens its responsive destination layout.
- Desktop Explore menu expands and dismisses with Escape.
- Phone menu opens and closes; Escape returns focus to the menu control.
- Search opens as a modal, focuses the input, filters results, shows a zero-result state and dismisses with Escape. The native dialog returns focus to the trigger.
- Search results navigate to the component library. Phone search remains usable at 390px.
- Mission category filters produce the expected sample/empty states. Reset restores the sample. Text search finds Sentinel and produces an empty state for an unmatched query.
- Mission detail tabs switch content. ArrowRight moves selection and keyboard focus from Orbit to Sources.
- Component-reference chips update selected state. Component search returns Button for “button”.
- Component panels and buttons wrap without page overflow at 320px.
- Browser logs inspected during testing contain no application errors.

The production build, Astro/TypeScript checks, baseline unit test and built-route/asset link validation are also checked separately. The Playwright CLI suite was not run; the interaction checks above used the in-app browser.

## P3 follow-up

The generated globe has more detailed illuminated geography than the reference. Brand mark refinement and final art direction can be handled after maintainer review. Real mission content, a live orbital-data integration and a functioning Cesium tracker are outside this milestone.
