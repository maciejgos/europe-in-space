import { describe, expect, it, vi } from "vitest";
import { handleOrbitalElementsRequest } from "../../worker/api/orbital";
import type { Env } from "../../worker/env";
import { runScheduledIngestion } from "../../worker/ingestion/scheduled";
import { createD1OrbitalRepository } from "../../worker/storage/d1-orbital-repository";
import { createLocalD1 } from "../helpers/sqlite-d1";
import { fixtureText, okJsonResponse } from "../helpers/datasets";

const FIXTURE_BASE = "https://fixtures.example/gp.php";
const now = () => new Date("2026-01-17T03:00:00.000Z");

function fetchServing(map: Record<string, () => Response>): typeof fetch {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const catnr = new URL(url).searchParams.get("CATNR");
    const handler = catnr ? map[catnr] : undefined;
    if (!handler) return new Response(fixtureText("no-gp-data.txt"), { status: 404 });
    return handler();
  }) as unknown as typeof fetch;
}

function makeEnv(db: D1Database): Env {
  return { ASSETS: { fetch: async () => new Response("asset") }, DB: db, CELESTRAK_BASE_URL: FIXTURE_BASE } as unknown as Env;
}

describe("scheduled ingestion pipeline (local D1 + fixture upstream)", () => {
  it("ingests allowlisted spacecraft, then serves them through the read API with provenance", async () => {
    const env = makeEnv(createLocalD1());
    const fetchImpl = fetchServing({
      "40697": () => okJsonResponse("sentinel-2a.omm.json"),
      "42063": () => okJsonResponse("sentinel-2b.omm.json"),
      "60989": () => new Response(fixtureText("no-gp-data.txt"), { status: 404 }),
    });

    const summary = await runScheduledIngestion(env, { fetchImpl, now });
    expect(summary.runs.map((r) => [r.spacecraftId, r.outcome])).toEqual([
      ["sentinel-2a", "published"],
      ["sentinel-2b", "published"],
      ["sentinel-2c", "no_data"],
    ]);

    const repo = createD1OrbitalRepository(env.DB);

    const ok = await handleOrbitalElementsRequest("/api/satellites/40697/orbital-elements", "GET", repo);
    expect(ok.status).toBe(200);
    expect(ok.headers.get("cache-control")).toBe("public, max-age=300");
    const body = await ok.json();
    expect(body).toMatchObject({
      spacecraftId: "sentinel-2a",
      noradCatalogId: 40697,
      format: "OMM_JSON",
      epoch: "2026-01-15T10:00:00.000Z",
      fetchedAt: "2026-01-17T03:00:00.000Z",
      source: { provider: "CelesTrak", url: `${FIXTURE_BASE}?CATNR=40697&FORMAT=JSON` },
      schemaVersion: 1,
    });
    expect(body.elements.NORAD_CAT_ID).toBe(40697);

    const unavailable = await handleOrbitalElementsRequest(
      "/api/satellites/60989/orbital-elements",
      "GET",
      repo,
    );
    expect(unavailable.status).toBe(503);
    expect((await unavailable.json()).error.code).toBe("ORBITAL_DATA_UNAVAILABLE");
  });

  it("preserves the last valid dataset when a later run fails upstream", async () => {
    const env = makeEnv(createLocalD1());
    const goodFetch = fetchServing({ "40697": () => okJsonResponse("sentinel-2a.omm.json") });
    await runScheduledIngestion(env, { fetchImpl: goodFetch, now });

    const failingFetch = fetchServing({ "40697": () => new Response("boom", { status: 500 }) });
    const summary = await runScheduledIngestion(env, {
      fetchImpl: failingFetch,
      now: () => new Date("2026-01-18T03:00:00.000Z"),
    });
    expect(summary.runs.find((r) => r.noradCatalogId === 40697)?.outcome).toBe("upstream_error");

    const repo = createD1OrbitalRepository(env.DB);
    const stored = await repo.findLatest(40697);
    expect(stored?.epoch).toBe("2026-01-15T10:00:00.000Z"); // unchanged
    expect(stored?.fetchedAt).toBe("2026-01-17T03:00:00.000Z"); // retrieval timestamp preserved
  });

  it("skips an older epoch arriving after a newer one", async () => {
    const env = makeEnv(createLocalD1());
    await runScheduledIngestion(env, {
      fetchImpl: fetchServing({ "40697": () => okJsonResponse("sentinel-2a-newer.omm.json") }),
      now,
    });
    const summary = await runScheduledIngestion(env, {
      fetchImpl: fetchServing({ "40697": () => okJsonResponse("sentinel-2a-older.omm.json") }),
      now: () => new Date("2026-01-18T03:00:00.000Z"),
    });
    expect(summary.runs.find((r) => r.noradCatalogId === 40697)?.outcome).toBe("skipped");

    const stored = await createD1OrbitalRepository(env.DB).findLatest(40697);
    expect(stored?.epoch).toBe("2026-01-16T10:00:00.000Z");
  });

  it("records ingestion health in D1 for every spacecraft", async () => {
    const env = makeEnv(createLocalD1());
    await runScheduledIngestion(env, {
      fetchImpl: fetchServing({
        "40697": () => okJsonResponse("sentinel-2a.omm.json"),
        "42063": () => okJsonResponse("sentinel-2b.omm.json"),
        "60989": () => new Response(fixtureText("no-gp-data.txt"), { status: 404 }),
      }),
      now,
    });
    const { results } = await env.DB
      .prepare("SELECT spacecraft_id, outcome FROM ingestion_runs ORDER BY norad_catalog_id")
      .bind()
      .all<{ spacecraft_id: string; outcome: string }>();
    expect(results).toEqual([
      { spacecraft_id: "sentinel-2a", outcome: "published" },
      { spacecraft_id: "sentinel-2b", outcome: "published" },
      { spacecraft_id: "sentinel-2c", outcome: "no_data" },
    ]);
  });
});
