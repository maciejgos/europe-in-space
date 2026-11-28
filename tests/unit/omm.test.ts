import { describe, expect, it } from "vitest";
import { normalizeEpoch, OmmValidationError, parseOmmArray } from "../../src/core/orbital/omm";
import { fixtureJson } from "../helpers/datasets";

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

describe("parseOmmArray", () => {
  it("parses a valid record and preserves unknown keys", () => {
    const [record] = parseOmmArray(fixtureJson("sentinel-2a.omm.json"));
    expect(record.NORAD_CAT_ID).toBe(40697);
    expect(record.OBJECT_ID).toBe("2015-028A");
    expect(record.CCSDS_OMM_VERS).toBe("3.0");
  });

  it("accepts an empty array (the client maps it to no-data)", () => {
    expect(parseOmmArray(fixtureJson("empty-array.json"))).toEqual([]);
  });

  it("rejects non-arrays and missing required fields", () => {
    expect(() => parseOmmArray(fixtureJson("wrong-shape.json"))).toThrow(OmmValidationError);
    expect(() => parseOmmArray(fixtureJson("missing-fields.json"))).toThrow(OmmValidationError);
    expect(() => parseOmmArray(null)).toThrow(OmmValidationError);
  });

  it("rejects out-of-range or mistyped elements", () => {
    const base = fixtureJson("sentinel-2a.omm.json")[0];
    expect(() => parseOmmArray([{ ...base, ECCENTRICITY: 1.5 }])).toThrow(OmmValidationError);
    expect(() => parseOmmArray([{ ...base, INCLINATION: 200 }])).toThrow(OmmValidationError);
    expect(() => parseOmmArray([{ ...base, MEAN_MOTION: 0 }])).toThrow(OmmValidationError);
    expect(() => parseOmmArray([{ ...base, NORAD_CAT_ID: -1 }])).toThrow(OmmValidationError);
    expect(() => parseOmmArray([{ ...base, EPOCH: "not-a-date" }])).toThrow(OmmValidationError);
    expect(() => parseOmmArray([{ ...base, CLASSIFICATION_TYPE: "u" }])).toThrow(OmmValidationError);
  });
});
