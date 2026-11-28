import { describe, expect, it } from "vitest";
import { normalizeEpoch, OmmValidationError } from "../../src/core/orbital/omm";

describe("normalizeEpoch", () => {
  it("normalizes fractional UTC epochs to fixed-width ISO-8601", () => {
    expect(normalizeEpoch("2026-11-26T22:36:14.588928")).toBe("2026-11-26T22:36:14.588Z");
    expect(normalizeEpoch("2026-01-15T10:00:00")).toBe("2026-01-15T10:00:00.000Z");
  });

  it("rejects impossible calendar components and bad formats", () => {
    expect(() => normalizeEpoch("2026-13-01T00:00:00")).toThrow(OmmValidationError);
    expect(() => normalizeEpoch("2026-01-32T00:00:00")).toThrow(OmmValidationError);
    expect(() => normalizeEpoch("2026-01-15T25:00:00")).toThrow(OmmValidationError);
    expect(() => normalizeEpoch("2026-01-15T10:00:60")).toThrow(OmmValidationError);
    expect(() => normalizeEpoch("2026-01-15 10:00:00")).toThrow(OmmValidationError);
    expect(() => normalizeEpoch("2026-01-15T10:00:00Z")).toThrow(OmmValidationError);
  });
});
