import { readFile } from "node:fs/promises";
import { parse } from "parse5";

const route = "/missions/sentinel-2/";
const citationPrefix = "#source-";
const nonEditorialElements = new Set(["script", "style", "template"]);

function* descendants(node) {
  for (const child of node.childNodes ?? []) {
    yield child;
    yield* descendants(child);
  }
}

function attribute(node, name) {
  return node.attrs?.find((attr) => attr.name === name)?.value;
}

function citationFragment(node) {
  const href = node.tagName === "a" && attribute(node, "href");
  return href && href.startsWith(citationPrefix) ? href : undefined;
}

function* overviewContent(node) {
  if (attribute(node, "hidden") !== undefined ||
      nonEditorialElements.has(node.tagName) || /^h[1-6]$/.test(node.tagName)) return;
  yield node;
  if (citationFragment(node)) return;
  for (const child of node.childNodes ?? []) yield* overviewContent(child);
}

export function validateSentinel2Html(html) {
  const nodes = [...descendants(parse(html))];
  const ids = new Map();
  for (const node of nodes) {
    const id = attribute(node, "id");
    if (id === undefined) continue;
    const matches = ids.get(id) ?? [];
    matches.push(node);
    ids.set(id, matches);
  }

  const overview = nodes.find((node) => attribute(node, "data-mission-overview") !== undefined);
  const content = overview ? [...overviewContent(overview)] : [];
  if (!content.some((node) => node.nodeName === "#text" && /[\p{L}\p{N}]/u.test(node.value))) {
    throw new Error(`${route} Overview must contain editorial prose.`);
  }
  if (!content.some(citationFragment)) {
    throw new Error(`${route} Overview must contain a citation.`);
  }

  const sources = ids.get("sources");
  const sourceEntries = sources?.length === 1
    ? new Set([...descendants(sources[0])].filter((node) => attribute(node, "data-source-entry") !== undefined))
    : new Set();
  const citationContainers = nodes.filter((node) => node === overview ||
    attribute(node, "data-spacecraft-statement") !== undefined ||
    attribute(node, "data-spacecraft-status") !== undefined);

  for (const container of citationContainers) {
    for (const link of descendants(container)) {
      const fragment = citationFragment(link);
      if (!fragment) continue;
      const matches = ids.get(fragment.slice(1));
      if (matches?.length !== 1 || !sourceEntries.has(matches[0])) {
        throw new Error(`${route} Citation ${fragment} must resolve to exactly one Sources entry.`);
      }
    }
  }
}

export function sentinel2Validation() {
  return {
    name: "sentinel-2-validation",
    hooks: {
      async "astro:build:done"({ dir }) {
        const output = new URL("missions/sentinel-2/index.html", dir);
        validateSentinel2Html(await readFile(output, "utf8"));
      },
    },
  };
}
