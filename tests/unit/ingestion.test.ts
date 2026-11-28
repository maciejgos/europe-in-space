import { describe, expect, it, vi } from "vitest";
import { TRACKED_SPACECRAFT } from "../../src/config/spacecraft";
import {
  CelesTrakNoDataError,
  CelesTrakUpstreamError,
  OmmValidationError,
} from "../../src/integrations/celestrak/client";
import type { OrbitalDataset, OrbitalDatasetRepository } from "../../src/core/orbital/types";
import { ingestTrackedSpacecraft } from "../../worker/ingestion/scheduled";
import type { IngestionRunRecord } from "../../worker/storage/d1-orbital-repository";
import { datasetFromFixture } from "../helpers/datasets";

const FIXTURE_BY_ID: Record<number, string> = {
  40697: "sentinel-2a.omm.json",
  42063: "sentinel-2b.omm.json",
  60989: "sentinel-2c.omm.json",
};

function makeDeps(options: {
  failFor?: Record<number, Error>;
  publishErrorFor?: Record<number, Error>;
  overrideDataset?: (dataset: OrbitalDataset) => OrbitalDataset;
}) {
  const store = new Map<number, OrbitalDataset>();
  const runs: IngestionRunRecord[] = [];
  const calls: number[] = [];
  const repository: OrbitalDatasetRepository = {
    async findLatest(noradCatalogId) {
      return store.get(noradCatalogId) ?? null;
    },
    async publishIfNewer(dataset) {
      const error = options.publishErrorFor?.[dataset.noradCatalogId];
      if (error) throw error;
      const existing = store.get(dataset.noradCatalogId);
      if (existing && existing.epoch >= dataset.epoch) return "skipped";
      store.set(dataset.noradCatalogId, dataset);
      return "published";
    },
  };
  const provider = {
    async getOrbitalElements(noradCatalogId: number) {
      calls.push(noradCatalogId);
      const failure = options.failFor?.[noradCatalogId];
      if (failure) throw failure;
      const spacecraft = TRACKED_SPACECRAFT.find((c) => c.noradCatalogId === noradCatalogId)!;
      let dataset = datasetFromFixture(spacecraft, FIXTURE_BY_ID[noradCatalogId]);
      if (options.overrideDataset) dataset = options.overrideDataset(dataset);
      return dataset;
    },
  };
  return {
    deps: {
      provider,
      repository,
      recordRun: async (run: IngestionRunRecord) => {
        runs.push(run);
      },
      now: () => new Date("2026-01-17T00:00:00.000Z"),
    },
    store,
    runs,
    calls,
  };
}

describe("ingestTrackedSpacecraft", () => {
  it("publishes every allowlisted spacecraft and records health", async () => {
    const { deps, store, runs, calls } = makeDeps({});
    const summary = await ingestTrackedSpacecraft(deps);

    expect(calls).toEqual([40697, 42063, 60989]); // exactly one attempt per spacecraft
    expect(store.size).toBe(3);
    expect(summary.runs.map((r) => r.outcome)).toEqual(["published", "published", "published"]);
    expect(runs).toHaveLength(3);
    expect(runs[0]).toMatchObject({
      noradCatalogId: 40697,
      spacecraftId: "sentinel-2a",
      outcome: "published",
      epoch: "2026-01-15T10:00:00.000Z",
    });
  });

  it("records upstream errors, preserves stored data, and stops querying", async () => {
    const { deps, store, runs } = makeDeps({
      failFor: { 42063: new CelesTrakUpstreamError(500, "HTTP 500") },
    });
    // Pre-seed a valid record for the failing spacecraft.
    await deps.repository.publishIfNewer(
      datasetFromFixture(TRACKED_SPACECRAFT[1], "sentinel-2b.omm.json", { fetchedAt: "2026-01-16T00:00:00.000Z" }),
    );
    const before = store.get(42063);

    const summary = await ingestTrackedSpacecraft(deps);

    expect(summary.runs.map((r) => r.outcome)).toEqual([
      "published",
      "upstream_error",
    ]);
    expect(store.get(42063)).toBe(before); // last valid record preserved
    expect(runs.find((r) => r.noradCatalogId === 42063)?.detail).toContain("HTTP 500");
  });

  it("records no_data when CelesTrak has no GP data for a spacecraft", async () => {
    const { deps, runs } = makeDeps({ failFor: { 60989: new CelesTrakNoDataError("404") } });
    const summary = await ingestTrackedSpacecraft(deps);
    expect(summary.runs.find((r) => r.noradCatalogId === 60989)?.outcome).toBe("no_data");
    expect(runs.filter((r) => r.outcome === "no_data")).toHaveLength(1);
  });

  it("records validation_error on an international-designator mismatch", async () => {
    const { deps, runs, store } = makeDeps({
      overrideDataset: (dataset) =>
        dataset.noradCatalogId === 40697
          ? { ...dataset, elements: { ...dataset.elements, OBJECT_ID: "1999-999Z" } }
          : dataset,
    });
    const summary = await ingestTrackedSpacecraft(deps);
    const run = summary.runs.find((r) => r.noradCatalogId === 40697);
    expect(run?.outcome).toBe("validation_error");
    expect(store.has(40697)).toBe(false); // rejected, nothing stored
    expect(runs).toHaveLength(3);
  });

  it("records storage_error when publication fails and does not abort the run", async () => {
    const { deps, runs } = makeDeps({
      publishErrorFor: { 42063: new Error("D1 unavailable") },
    });
    const summary = await ingestTrackedSpacecraft(deps);
    expect(summary.runs.map((r) => r.outcome)).toEqual([
      "published",
      "storage_error",
      "published",
    ]);
    expect(runs.find((r) => r.noradCatalogId === 42063)?.detail).toContain("D1 unavailable");
  });

  it("classifies unexpected errors as error without throwing", async () => {
    const { deps, runs } = makeDeps({ failFor: { 40697: new OmmValidationError("bad payload") } });
    const summary = await ingestTrackedSpacecraft(deps);
    expect(summary.runs[0].outcome).toBe("validation_error");
    expect(runs.every((r) => r.finishedAt >= r.startedAt)).toBe(true);
  });
});
