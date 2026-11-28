import { trackedSpacecraftByNoradId } from "../../config/spacecraft";
import { normalizeEpoch, OmmValidationError, parseOmmArray } from "../../core/orbital/omm";

export { OmmValidationError } from "../../core/orbital/omm";
import {
  ORBITAL_SCHEMA_VERSION,
  type OrbitalDataProvider,
  type OrbitalDataset,
} from "../../core/orbital/types";

/** Official CelesTrak GP endpoint (verified 2026-11-27; see docs/designs/celestrak-orbital-ingestion.md). */
export const CELESTRAK_GP_ENDPOINT = "https://celestrak.org/NORAD/elements/gp.php";

export const DEFAULT_TIMEOUT_MS = 15_000;

/** CelesTrak has no current GP element set for the requested catalog number (HTTP 404 "No GP data found", or an empty array). */
export class CelesTrakNoDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CelesTrakNoDataError";
  }
}

/** CelesTrak returned a non-200 response or the request failed. Never retried: CelesTrak's usage policy blocks IPs that repeat non-200 requests. */
export class CelesTrakUpstreamError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "CelesTrakUpstreamError";
  }
}

export interface CelesTrakProviderOptions {
  /** Overridable for local fixture servers; defaults to the official endpoint. */
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  now?: () => Date;
  timeoutMs?: number;
}

/**
 * CelesTrak implementation of the OrbitalDataProvider contract (TDD §8.3).
 * Issues exactly one GET per call: `{base}?CATNR={id}&FORMAT=JSON`.
 */
export function createCelesTrakProvider(options: CelesTrakProviderOptions = {}): OrbitalDataProvider {
  const baseUrl = options.baseUrl ?? CELESTRAK_GP_ENDPOINT;
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? (() => new Date());
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    async getOrbitalElements(noradCatalogId: number): Promise<OrbitalDataset> {
      const spacecraft = trackedSpacecraftByNoradId.get(noradCatalogId);
      if (!spacecraft) {
        throw new OmmValidationError(
          `NORAD catalog ID ${noradCatalogId} is not in the tracked spacecraft allowlist.`,
        );
      }

      const url = `${baseUrl}?CATNR=${noradCatalogId}&FORMAT=JSON`;
      let response: Response;
      try {
        response = await fetchImpl(url, {
          headers: {
            accept: "application/json",
            "accept-encoding": "gzip, br",
          },
          signal: AbortSignal.timeout(timeoutMs),
          redirect: "manual",
        });
      } catch (error) {
        throw new CelesTrakUpstreamError(
          0,
          `Request to CelesTrak failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      if (response.status === 404) {
        throw new CelesTrakNoDataError(
          `CelesTrak returned 404 (no GP data) for CATNR=${noradCatalogId}.`,
        );
      }
      if (response.status !== 200) {
        // Stop on any non-200 and report; do not retry (CelesTrak usage policy).
        throw new CelesTrakUpstreamError(
          response.status,
          `CelesTrak returned HTTP ${response.status} for CATNR=${noradCatalogId}.`,
        );
      }

      const text = await response.text();
      let raw: unknown;
      try {
        raw = JSON.parse(text);
      } catch {
        throw new OmmValidationError("CelesTrak response is not valid JSON.");
      }

      const records = parseOmmArray(raw);
      const record = records.find((entry) => entry.NORAD_CAT_ID === noradCatalogId);
      if (!record) {
        if (records.length === 0) {
          throw new CelesTrakNoDataError(
            `CelesTrak returned an empty element set for CATNR=${noradCatalogId}.`,
          );
        }
        throw new OmmValidationError(
          `No OMM record with NORAD_CAT_ID ${noradCatalogId} in the CelesTrak response.`,
        );
      }

      return {
        spacecraftId: spacecraft.spacecraftId,
        noradCatalogId,
        format: "OMM_JSON",
        elements: record,
        epoch: normalizeEpoch(record.EPOCH),
        fetchedAt: now().toISOString(),
        source: { provider: "CelesTrak", url },
        schemaVersion: ORBITAL_SCHEMA_VERSION,
      };
    },
  };
}
