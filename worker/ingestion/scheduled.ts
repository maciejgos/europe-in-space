import { TRACKED_SPACECRAFT } from "../../src/config/spacecraft";
import {
  CELESTRAK_GP_ENDPOINT,
  CelesTrakNoDataError,
  CelesTrakUpstreamError,
  createCelesTrakProvider,
  OmmValidationError,
} from "../../src/integrations/celestrak/client";
import { initializeOrbit, OrbitCalculationError } from "../../src/core/orbital/calculation";
import type { OrbitalDataProvider, OrbitalDatasetRepository } from "../../src/core/orbital/types";
import type { Env } from "../env";
import {
  createD1OrbitalRepository,
  recordIngestionRun,
  type IngestionOutcome,
  type IngestionRunRecord,
} from "../storage/d1-orbital-repository";

export interface IngestionDeps {
  provider: OrbitalDataProvider;
  repository: OrbitalDatasetRepository;
  recordRun: (run: IngestionRunRecord) => Promise<void>;
  now?: () => Date;
}

export interface IngestionSummary {
  runs: IngestionRunRecord[];
}

function classify(error: unknown): { outcome: IngestionOutcome; detail: string } {
  if (error instanceof CelesTrakNoDataError) return { outcome: "no_data", detail: error.message };
  if (error instanceof CelesTrakUpstreamError) {
    return { outcome: "upstream_error", detail: error.message };
  }
  if (error instanceof OmmValidationError || error instanceof OrbitCalculationError) {
    return { outcome: "validation_error", detail: error.message };
  }
  return {
    outcome: "error",
    detail: error instanceof Error ? error.message : String(error),
  };
}

/**
 * Ingest every allowlisted spacecraft exactly once (no retries; CelesTrak's
 * usage policy requires stopping on HTTP errors). Preserve previously published
 * datasets and record failures before ending the run.
 */
export async function ingestTrackedSpacecraft(deps: IngestionDeps): Promise<IngestionSummary> {
  const now = deps.now ?? (() => new Date());
  const runs: IngestionRunRecord[] = [];

  for (const spacecraft of TRACKED_SPACECRAFT) {
    const startedAt = now().toISOString();
    let outcome: IngestionOutcome;
    let detail: string | undefined;
    let epoch: string | undefined;

    try {
      const dataset = await deps.provider.getOrbitalElements(spacecraft.noradCatalogId);
      if (dataset.elements.OBJECT_ID !== spacecraft.internationalDesignator) {
        throw new OmmValidationError(
          `OBJECT_ID ${JSON.stringify(dataset.elements.OBJECT_ID)} does not match expected ` +
            `designator ${JSON.stringify(spacecraft.internationalDesignator)} for ${spacecraft.spacecraftId}.`,
        );
      }
      epoch = dataset.epoch;
      initializeOrbit(dataset);
      try {
        outcome = await deps.repository.publishIfNewer(dataset);
      } catch (error) {
        outcome = "storage_error";
        detail = error instanceof Error ? error.message : String(error);
      }
    } catch (error) {
      const classified = classify(error);
      outcome = classified.outcome;
      detail = classified.detail;
    }

    const run: IngestionRunRecord = {
      noradCatalogId: spacecraft.noradCatalogId,
      spacecraftId: spacecraft.spacecraftId,
      startedAt,
      finishedAt: now().toISOString(),
      outcome,
      detail,
      epoch,
    };
    runs.push(run);
    await deps.recordRun(run);
    if (outcome === "upstream_error" || outcome === "no_data") {
      console.warn("CelesTrak ingestion stopped", { noradCatalogId: run.noradCatalogId, outcome, detail });
      break;
    }
  }

  return { runs };
}

export interface RunOverrides {
  fetchImpl?: typeof fetch;
  now?: () => Date;
}

/** Scheduled-handler entry point: build real adapters from the Worker env. */
export async function runScheduledIngestion(
  env: Env,
  overrides: RunOverrides = {},
): Promise<IngestionSummary> {
  const provider = createCelesTrakProvider({
    baseUrl: env.CELESTRAK_BASE_URL ?? CELESTRAK_GP_ENDPOINT,
    fetchImpl: overrides.fetchImpl,
    now: overrides.now,
  });
  const repository = createD1OrbitalRepository(env.DB);
  return ingestTrackedSpacecraft({
    provider,
    repository,
    recordRun: (run) => recordIngestionRun(env.DB, run),
    now: overrides.now,
  });
}
