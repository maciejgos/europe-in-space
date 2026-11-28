import type { OmmRecord } from "./omm";

export const ORBITAL_SCHEMA_VERSION = 1;

export interface OrbitalDatasetSource {
  provider: "CelesTrak";
  /** Exact request URL used for retrieval (provenance). */
  url: string;
}

/**
 * One validated orbital dataset for a tracked spacecraft.
 * Mirrors TDD §6.3; the epoch is normalized to a fixed-width UTC ISO-8601
 * string so lexicographic comparison matches chronological order.
 */
export interface OrbitalDataset {
  spacecraftId: string;
  noradCatalogId: number;
  format: "OMM_JSON";
  /** Complete validated OMM record; raw source fields are preserved. */
  elements: OmmRecord;
  /** Orbital element epoch, normalized UTC ISO-8601 (e.g. 2026-11-26T22:36:14.588Z). */
  epoch: string;
  /** Retrieval timestamp, UTC ISO-8601. */
  fetchedAt: string;
  source: OrbitalDatasetSource;
  schemaVersion: number;
}

/** Provider-neutral persistence contract (TDD §9.2, ARCHITECTURE §9.5). */
export interface OrbitalDatasetRepository {
  findLatest(noradCatalogId: number): Promise<OrbitalDataset | null>;
  /**
   * Insert the dataset, or replace the stored one only when the candidate
   * epoch is strictly newer. Resolves to "skipped" for older/equal epochs.
   */
  publishIfNewer(dataset: OrbitalDataset): Promise<"published" | "skipped">;
}

/** Provider-neutral orbital data contract (TDD §8.3). */
export interface OrbitalDataProvider {
  getOrbitalElements(noradCatalogId: number): Promise<OrbitalDataset>;
}

/** ARCHITECTURE §12 response body for the orbital-elements endpoint. */
export type OrbitalApiResponse = OrbitalDataset;

export interface ApiErrorBody {
  error: { code: string; message: string };
}
