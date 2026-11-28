import type { OrbitalDataset, OrbitalDatasetRepository } from "../../src/core/orbital/types";

export type IngestionOutcome =
  | "published"
  | "skipped"
  | "no_data"
  | "upstream_error"
  | "validation_error"
  | "storage_error"
  | "error";

export interface IngestionRunRecord {
  noradCatalogId: number;
  spacecraftId: string;
  startedAt: string;
  finishedAt: string;
  outcome: IngestionOutcome;
  detail?: string;
  epoch?: string;
}

interface OrbitalDatasetRow {
  norad_catalog_id: number;
  spacecraft_id: string;
  object_name: string;
  international_designator: string;
  epoch: string;
  fetched_at: string;
  format: string;
  elements: string;
  source_url: string;
  schema_version: number;
}

/**
 * Atomic conditional publication (ADR-016, TDD §9.3): insert on first sight,
 * otherwise update only when the candidate epoch is strictly newer. Older and
 * equal epochs leave the stored row — including its retrieval timestamp —
 * unchanged, so a late or overlapping run can never regress the dataset.
 * Epochs are normalized fixed-width UTC ISO strings, so text comparison is
 * chronological.
 */
export const PUBLISH_IF_NEWER_SQL = `
INSERT INTO orbital_datasets
  (norad_catalog_id, spacecraft_id, object_name, international_designator,
   epoch, fetched_at, format, elements, source_url, schema_version)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(norad_catalog_id) DO UPDATE SET
  spacecraft_id = excluded.spacecraft_id,
  object_name = excluded.object_name,
  international_designator = excluded.international_designator,
  epoch = excluded.epoch,
  fetched_at = excluded.fetched_at,
  format = excluded.format,
  elements = excluded.elements,
  source_url = excluded.source_url,
  schema_version = excluded.schema_version
WHERE excluded.epoch > orbital_datasets.epoch;
`;

export const FIND_LATEST_SQL = `
SELECT norad_catalog_id, spacecraft_id, object_name, international_designator,
       epoch, fetched_at, format, elements, source_url, schema_version
FROM orbital_datasets
WHERE norad_catalog_id = ?;
`;

export const INSERT_RUN_SQL = `
INSERT INTO ingestion_runs
  (norad_catalog_id, spacecraft_id, started_at, finished_at, outcome, detail, epoch)
VALUES (?, ?, ?, ?, ?, ?, ?);
`;

function rowToDataset(row: OrbitalDatasetRow): OrbitalDataset {
  return {
    spacecraftId: row.spacecraft_id,
    noradCatalogId: row.norad_catalog_id,
    format: "OMM_JSON",
    elements: JSON.parse(row.elements),
    epoch: row.epoch,
    fetchedAt: row.fetched_at,
    source: { provider: "CelesTrak", url: row.source_url },
    schemaVersion: row.schema_version,
  };
}

/** Cloudflare D1 adapter for the provider-neutral OrbitalDatasetRepository contract. */
export function createD1OrbitalRepository(db: D1Database): OrbitalDatasetRepository {
  return {
    async findLatest(noradCatalogId) {
      const row = await db
        .prepare(FIND_LATEST_SQL)
        .bind(noradCatalogId)
        .first<OrbitalDatasetRow>();
      return row ? rowToDataset(row) : null;
    },

    async publishIfNewer(dataset) {
      const result = await db
        .prepare(PUBLISH_IF_NEWER_SQL)
        .bind(
          dataset.noradCatalogId,
          dataset.spacecraftId,
          dataset.elements.OBJECT_NAME,
          dataset.elements.OBJECT_ID,
          dataset.epoch,
          dataset.fetchedAt,
          dataset.format,
          JSON.stringify(dataset.elements),
          dataset.source.url,
          dataset.schemaVersion,
        )
        .run();
      return (result.meta.changes ?? 0) > 0 ? "published" : "skipped";
    },
  };
}

/** Record ingestion health separately from the dataset (ARCHITECTURE §9.4). */
export async function recordIngestionRun(db: D1Database, run: IngestionRunRecord): Promise<void> {
  await db
    .prepare(INSERT_RUN_SQL)
    .bind(
      run.noradCatalogId,
      run.spacecraftId,
      run.startedAt,
      run.finishedAt,
      run.outcome,
      run.detail ?? null,
      run.epoch ?? null,
    )
    .run();
}
