import { describe, expect, it, vi } from "vitest";
import {
  CELESTRAK_GP_ENDPOINT,
  CelesTrakNoDataError,
  CelesTrakUpstreamError,
  createCelesTrakProvider,
  OmmValidationError,
} from "../../src/integrations/celestrak/client";
import { fixtureText, okJsonResponse } from "../helpers/datasets";

const FIXTURE_BASE = "https://fixtures.example/gp.php";
const now = () => new Date("2026-01-17T00:00:00.000Z");

function providerWith(fetchImpl: typeof fetch, baseUrl = FIXTURE_BASE) {
  return createCelesTrakProvider({ baseUrl, fetchImpl, now });
}

describe("createCelesTrakProvider", () => {
  it("requests the official endpoint pattern and returns a provenance-complete dataset", async () => {
    const fetchImpl = vi.fn(async () => okJsonResponse("sentinel-2a.omm.json")) as unknown as typeof fetch;
    const provider = providerWith(fetchImpl);
    const dataset = await provider.getOrbitalElements(40697);

    expect(fetchImpl).toHaveBeenCalledTimes(1); // single attempt, no retries
    const [url, init] = (fetchImpl as unknown as vi.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${FIXTURE_BASE}?CATNR=40697&FORMAT=JSON`);
    expect(init.redirect).toBe("manual");
    expect((init.headers as Record<string, string>)["accept-encoding"]).toContain("gzip");

    expect(dataset).toMatchObject({
      spacecraftId: "sentinel-2a",
      noradCatalogId: 40697,
      format: "OMM_JSON",
      epoch: "2026-01-15T10:00:00.000Z",
      fetchedAt: "2026-01-17T00:00:00.000Z",
      source: { provider: "CelesTrak", url: `${FIXTURE_BASE}?CATNR=40697&FORMAT=JSON` },
      schemaVersion: 1,
    });
    expect(dataset.elements.OBJECT_NAME).toBe("SENTINEL-2A");
    expect(dataset.elements.CCSDS_OMM_VERS).toBe("3.0"); // raw extra fields preserved
  });

  it("defaults to the official CelesTrak GP endpoint", async () => {
    const fetchImpl = vi.fn(async () => okJsonResponse("sentinel-2b.omm.json")) as unknown as typeof fetch;
    const provider = createCelesTrakProvider({ fetchImpl, now });
    await provider.getOrbitalElements(42063);
    const [url] = (fetchImpl as unknown as vi.Mock).mock.calls[0] as [string];
    expect(url).toBe(`${CELESTRAK_GP_ENDPOINT}?CATNR=42063&FORMAT=JSON`);
  });

  it("maps HTTP 404 (no GP data) to CelesTrakNoDataError", async () => {
    const fetchImpl = vi.fn(
      async () => new Response(fixtureText("no-gp-data.txt"), { status: 404 }),
    ) as unknown as typeof fetch;
    await expect(providerWith(fetchImpl).getOrbitalElements(60989)).rejects.toBeInstanceOf(
      CelesTrakNoDataError,
    );
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("maps other non-200 responses to CelesTrakUpstreamError and does not retry", async () => {
    const fetchImpl = vi.fn(async () => new Response("boom", { status: 500 })) as unknown as typeof fetch;
    const promise = providerWith(fetchImpl).getOrbitalElements(40697);
    await expect(promise).rejects.toMatchObject({ name: "CelesTrakUpstreamError", status: 500 });
    await expect(promise).rejects.toBeInstanceOf(CelesTrakUpstreamError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("maps network/timeout failure to an upstream error without retry", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    const promise = providerWith(fetchImpl).getOrbitalElements(40697);
    await expect(promise).rejects.toBeInstanceOf(CelesTrakUpstreamError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("rejects non-JSON bodies", async () => {
    const fetchImpl = vi.fn(
      async () => new Response(fixtureText("malformed-json.txt"), { status: 200 }),
    ) as unknown as typeof fetch;
    await expect(providerWith(fetchImpl).getOrbitalElements(40697)).rejects.toBeInstanceOf(
      OmmValidationError,
    );
  });

  it("rejects schema-invalid payloads", async () => {
    const fetchImpl = vi.fn(async () => okJsonResponse("missing-fields.json")) as unknown as typeof fetch;
    await expect(providerWith(fetchImpl).getOrbitalElements(40697)).rejects.toBeInstanceOf(
      OmmValidationError,
    );
  });

  it("rejects a payload that does not contain the requested catalog ID", async () => {
    const fetchImpl = vi.fn(async () => okJsonResponse("wrong-catalog-id.json")) as unknown as typeof fetch;
    await expect(providerWith(fetchImpl).getOrbitalElements(40697)).rejects.toBeInstanceOf(
      OmmValidationError,
    );
  });

  it("maps an empty element array to no-data", async () => {
    const fetchImpl = vi.fn(async () => okJsonResponse("empty-array.json")) as unknown as typeof fetch;
    await expect(providerWith(fetchImpl).getOrbitalElements(40697)).rejects.toBeInstanceOf(
      CelesTrakNoDataError,
    );
  });

  it("rejects identifiers outside the tracked allowlist without fetching", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    await expect(providerWith(fetchImpl).getOrbitalElements(12345)).rejects.toBeInstanceOf(
      OmmValidationError,
    );
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
