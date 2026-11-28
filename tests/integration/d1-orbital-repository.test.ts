import { describe, expect, it } from "vitest";
import { TRACKED_SPACECRAFT } from "../../src/config/spacecraft";
import {
  createD1OrbitalRepository,
  recordIngestionRun,
} from "../../worker/storage/d1-orbital-repository";
import { createLocalD1 } from "../helpers/sqlite-d1";
import { datasetFromFixture } from "../helpers/datasets";

const [sentinel2a] = TRACKED_SPACECRAFT;

describe("D1 orbital repository (real migration + SQL on local SQLite)", () => {
  it("publishes a first record and reads it back with provenance", async () => {
    const db = createLocalD1();
    const repo = createD1OrbitalRepository(db);

    const dataset = datasetFromFixture(sentinel2a, "sentinel-2a.omm.json", {
      fetchedAt: "2026-01-17T00:00:00.000Z",
    });
    await expect(repo.publishIfNewer(dataset)).resolves.toBe("published");

    const stored = await repo.findLatest(40697);
    expect(stored).toMatchObject({
      spacecraftId: "sentinel-2a",
      noradCatalogId: 40697,
      format: "OMM_JSON",
      epoch: "2026-01-15T10:00:00.000Z",
      fetchedAt: "2026-01-17T00:00:00.000Z",
      source: {
        provider: "CelesTrak",
        url: "https://fixtures.example/gp.php?CATNR=40697&FORMAT=JSON",
      },
      schemaVersion: 1,
    });
    expect(stored?.elements.OBJECT_NAME).toBe("SENTINEL-2A");
    expect(stored?.elements.CCSDS_OMM_VERS).toBe("3.0");
  });

  it("replaces the record only when the candidate epoch is strictly newer", async () => {
    const db = createLocalD1();
    const repo = createD1OrbitalRepository(db);

    await repo.publishIfNewer(
      datasetFromFixture(sentinel2a, "sentinel-2a.omm.json", { fetchedAt: "2026-01-17T00:00:00.000Z" }),
    );
    await expect(
      repo.publishIfNewer(
        datasetFromFixture(sentinel2a, "sentinel-2a-newer.omm.json", { fetchedAt: "2026-01-18T00:00:00.000Z" }),
      ),
    ).resolves.toBe("published");
    let stored = await repo.findLatest(40697);
    expect(stored?.epoch).toBe("2026-01-16T10:00:00.000Z");
    expect(stored?.fetchedAt).toBe("2026-01-18T00:00:00.000Z");

    // Equal epoch replay: skipped, published record untouched.
    await expect(
      repo.publishIfNewer(
        datasetFromFixture(sentinel2a, "sentinel-2a-newer.omm.json", { fetchedAt: "2026-01-19T00:00:00.000Z" }),
      ),
    ).resolves.toBe("skipped");
    stored = await repo.findLatest(40697);
    expect(stored?.fetchedAt).toBe("2026-01-18T00:00:00.000Z");
  });

  it("never lets an older run finishing after a newer one regress the dataset", async () => {
    const db = createLocalD1();
    const repo = createD1OrbitalRepository(db);

    await repo.publishIfNewer(datasetFromFixture(sentinel2a, "sentinel-2a-newer.omm.json"));
    // Late-arriving older candidate (e.g. delayed/overlapping run).
    await expect(
      repo.publishIfNewer(
        datasetFromFixture(sentinel2a, "sentinel-2a-older.omm.json", { fetchedAt: "2026-01-20T00:00:00.000Z" }),
      ),
    ).resolves.toBe("skipped");

    const stored = await repo.findLatest(40697);
    expect(stored?.epoch).toBe("2026-01-16T10:00:00.000Z");
    expect(stored?.elements.MEAN_ANOMALY).toBe(12.3333);
  });

  it("returns null for unknown catalog IDs", async () => {
    const repo = createD1OrbitalRepository(createLocalD1());
    await expect(repo.findLatest(99999)).resolves.toBeNull();
  });

  it("records ingestion health rows separately from datasets", async () => {
    const db = createLocalD1();
    await recordIngestionRun(db, {
      noradCatalogId: 40697,
      spacecraftId: "sentinel-2a",
      startedAt: "2026-01-17T03:00:00.000Z",
      finishedAt: "2026-01-17T03:00:01.000Z",
      outcome: "published",
      epoch: "2026-01-15T10:00:00.000Z",
    });
    await recordIngestionRun(db, {
      noradCatalogId: 60989,
      spacecraftId: "sentinel-2c",
      startedAt: "2026-01-17T03:00:01.000Z",
      finishedAt: "2026-01-17T03:00:02.000Z",
      outcome: "no_data",
      detail: "CelesTrak returned 404",
    });
    const { results } = await db
      .prepare("SELECT norad_catalog_id, outcome FROM ingestion_runs ORDER BY id")
      .bind()
      .all<{ norad_catalog_id: number; outcome: string }>();
    expect(results).toEqual([
      { norad_catalog_id: 40697, outcome: "published" },
      { norad_catalog_id: 60989, outcome: "no_data" },
    ]);
  });
});
