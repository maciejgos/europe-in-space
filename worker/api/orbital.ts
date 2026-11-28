import { trackedSpacecraftByNoradId } from "../../src/config/spacecraft";
import type { ApiErrorBody, OrbitalDatasetRepository } from "../../src/core/orbital/types";

const ORBITAL_ELEMENTS_ROUTE = /^\/api\/satellites\/([^/]+)\/orbital-elements\/?$/;

export function errorResponse(status: number, code: string, message: string, headers?: HeadersInit): Response {
  const body: ApiErrorBody = { error: { code, message } };
  return Response.json(body, { status, headers });
}

/**
 * GET /api/satellites/{noradCatalogId}/orbital-elements (ARCHITECTURE §12).
 * Serves the cached D1 dataset with provenance; restricted to the configured
 * spacecraft allowlist; no proxying to CelesTrak.
 */
export async function handleOrbitalElementsRequest(
  pathname: string,
  method: string,
  repository: OrbitalDatasetRepository,
): Promise<Response> {
  const match = ORBITAL_ELEMENTS_ROUTE.exec(pathname);
  if (!match) {
    return errorResponse(404, "NOT_FOUND", "Unknown API route.");
  }
  if (method !== "GET") {
    return errorResponse(405, "METHOD_NOT_ALLOWED", "Use GET to read orbital elements.", { allow: "GET" });
  }

  const rawId = match[1];
  if (!/^\d{1,9}$/.test(rawId)) {
    return errorResponse(
      400,
      "INVALID_IDENTIFIER",
      "Catalog identifier must be a 1-9 digit NORAD catalog number.",
    );
  }
  const noradCatalogId = Number.parseInt(rawId, 10);

  if (!trackedSpacecraftByNoradId.has(noradCatalogId)) {
    return errorResponse(404, "UNKNOWN_SPACECRAFT", "No tracked spacecraft with this catalog identifier.");
  }

  let dataset;
  try {
    dataset = await repository.findLatest(noradCatalogId);
  } catch {
    return errorResponse(500, "STORAGE_ERROR", "Failed to read orbital data.");
  }

  if (!dataset) {
    return errorResponse(
      503,
      "ORBITAL_DATA_UNAVAILABLE",
      "Orbital data is temporarily unavailable for this spacecraft.",
    );
  }

  return Response.json(dataset, {
    status: 200,
    headers: { "cache-control": "public, max-age=300" },
  });
}
