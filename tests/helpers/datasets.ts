import { readFileSync } from "node:fs";
import { normalizeEpoch, parseOmmArray } from "../../src/core/orbital/omm";
import type { TrackedSpacecraft } from "../../src/config/spacecraft";
import type { OrbitalDataset } from "../../src/core/orbital/types";

export function fixtureText(name: string): string {
  return readFileSync(new URL(`../fixtures/celestrak/${name}`, import.meta.url), "utf8");
}

export function fixtureJson(name: string): unknown {
  return JSON.parse(fixtureText(name));
}

export function okJsonResponse(name: string): Response {
  return new Response(fixtureText(name), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

/** Build an OrbitalDataset from a fixture for the given tracked spacecraft. */
export function datasetFromFixture(
  spacecraft: TrackedSpacecraft,
  fixtureName: string,
  options: { fetchedAt?: string; baseUrl?: string; overrideRecord?: (record: Record<string, unknown>) => Record<string, unknown> } = {},
): OrbitalDataset {
  const records = parseOmmArray(fixtureJson(fixtureName));
  const raw = records.find((record) => record.NORAD_CAT_ID === spacecraft.noradCatalogId);
  if (!raw) throw new Error(`Fixture ${fixtureName} has no record for ${spacecraft.noradCatalogId}`);
  const record = options.overrideRecord ? options.overrideRecord(raw as unknown as Record<string, unknown>) : raw;
  const parsed = parseOmmArray([record])[0];
  return {
    spacecraftId: spacecraft.spacecraftId,
    noradCatalogId: spacecraft.noradCatalogId,
    format: "OMM_JSON",
    elements: parsed,
    epoch: normalizeEpoch(parsed.EPOCH),
    fetchedAt: options.fetchedAt ?? "2026-01-17T00:00:00.000Z",
    source: {
      provider: "CelesTrak",
      url: `${options.baseUrl ?? "https://fixtures.example/gp.php"}?CATNR=${spacecraft.noradCatalogId}&FORMAT=JSON`,
    },
    schemaVersion: 1,
  };
}
