import { describe, expect, it } from "vitest";
import { validateSentinel2Html } from "../../scripts/validate-sentinel-2.mjs";

const citation = '<a href="#source-esa">ESA</a>';
const statement = '<p data-spacecraft-statement>Launch. ' + citation + '</p>';
const source = '<article data-source-entry id="source-esa">ESA</article>';

function page(overview: string, sources = source, spacecraft = statement) {
  return `<div data-mission-overview>${overview}</div>${spacecraft}<section id="sources">${sources}</section>`;
}

describe("Sentinel-2 generated HTML", () => {
  it("accepts editorial prose and citations to a unique source", () => {
    expect(() => validateSentinel2Html(page(`<p>Mission overview. ${citation}</p>`))).not.toThrow();
  });

  it.each([
    "",
    "<h3>Heading</h3>",
    `<p>${citation} · ${citation}</p>`,
    "<p hidden>Hidden prose.</p><script>script text</script>",
  ])("rejects an overview without editorial prose: %s", (overview) => {
    expect(() => validateSentinel2Html(page(overview))).toThrow(/overview.*prose/i);
  });

  it("rejects uncited overview prose even when spacecraft cite sources", () => {
    expect(() => validateSentinel2Html(page("<p>Mission overview.</p>"))).toThrow(/overview.*citation/i);
  });

  it.each([
    "",
    source + '<div id="source-esa"></div>',
    '<div id="source-esa"></div>',
  ])("rejects a missing, duplicate, or unmarked destination: %s", (sources) => {
    expect(() => validateSentinel2Html(page(`Mission overview. ${citation}`, sources))).toThrow(/#source-esa/);
  });

  it("rejects a status citation to a marked entry outside Sources", () => {
    const status = '<p data-spacecraft-status><a href="#source-other">Source</a></p>';
    const outside = '<article data-source-entry id="source-other">Other</article>';
    expect(() => validateSentinel2Html(page(`Mission overview. ${citation}`, source, statement + status + outside)))
      .toThrow(/#source-other/);
  });
});
