import type { Env } from "../env";
import { createD1OrbitalRepository } from "../storage/d1-orbital-repository";
import { errorResponse, handleOrbitalElementsRequest } from "./orbital";

export async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url);
  if (pathname.startsWith("/api/satellites/")) {
    const repository = createD1OrbitalRepository(env.DB);
    return handleOrbitalElementsRequest(pathname, request.method, repository);
  }
  return errorResponse(404, "NOT_FOUND", "Unknown API route.");
}
