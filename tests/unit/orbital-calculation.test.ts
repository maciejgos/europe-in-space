import { describe, expect, it } from "vitest";
import { initializeOrbit, OrbitCalculationError } from "../../src/core/orbital/calculation";
import type { OmmRecord } from "../../src/core/orbital/omm";

// Vallado et al. Rev. 2, Appendix D, case 00005. See orbital-calculations.md.
const elements: OmmRecord = {
  OBJECT_NAME: "VANGUARD 1",
  OBJECT_ID: "1958-002B",
  EPOCH: "2000-06-27T18:50:19.733568",
  MEAN_MOTION: 10.82419157,
  ECCENTRICITY: 0.1859667,
  INCLINATION: 34.2682,
  RA_OF_ASC_NODE: 348.7242,
  ARG_OF_PERICENTER: 331.7664,
  MEAN_ANOMALY: 19.3264,
  EPHEMERIS_TYPE: 0,
  CLASSIFICATION_TYPE: "U",
  NORAD_CAT_ID: 5,
  ELEMENT_SET_NO: 475,
  REV_AT_EPOCH: 41366,
  BSTAR: 0.000028098,
  MEAN_MOTION_DOT: 0.00000023,
  MEAN_MOTION_DDOT: 0,
};

const dataset = { spacecraftId: "vanguard-1", elements };
const epoch = new Date("2000-06-27T18:50:19.734Z");
const later = new Date("2000-06-28T00:50:19.734Z");

function expectWithin(actual: number[], reference: number[], tolerance: number) {
  expect(actual).toHaveLength(reference.length);
  reference.forEach((value, index) => {
    expect(Math.abs(actual[index] - value)).toBeLessThan(tolerance);
  });
}

describe("browser orbital calculations", () => {
  // TEME from Appendix E. Earth-fixed and geodetic references from PyERFA.
  it.each([
    {
      time: epoch,
      teme: [7022.46529266, -1400.08296755, 0.03995155],
      fixed: [-6198557.555039185, 3585126.9628152014, 39.95155],
      geo: [0.0003215879230126366, 149.95573398531965, 782.536928077134],
    },
    {
      time: later,
      teme: [-7154.03120202, -3783.17682504, -3536.19412294],
      fixed: [1245797.3857799098, -7996285.275212447, -3536194.12294],
      geo: [-23.70534683765669, -81.14467812093152, 2456.906201602145],
    },
  ])("matches independent TEME, Earth-fixed and geodetic references at $time", ({ time, teme, fixed, geo }) => {
    const p = initializeOrbit(dataset).calculatePosition(time);
    expect(p.timestamp).toBe(time.toISOString());
    expect(p.spacecraftId).toBe(dataset.spacecraftId);
    expectWithin([p.positionTemeKm.x, p.positionTemeKm.y, p.positionTemeKm.z], teme, 0.01);
    expectWithin([p.positionEarthFixedM.x, p.positionEarthFixedM.y, p.positionEarthFixedM.z], fixed, 10);
    expectWithin([p.latitudeDeg, p.longitudeDeg], geo.slice(0, 2), 0.0001);
    expectWithin([p.altitudeKm], [geo[2]], 0.01);
  });

  it("samples one period in timestamp order with bounded work and per-sample rotation", () => {
    const orbit = initializeOrbit(dataset);
    const path = orbit.sampleOrbit(epoch, 120);
    const periodMs = Math.round(86_400_000 / elements.MEAN_MOTION);
    expect(path).toHaveLength(Math.ceil(periodMs / 120_000) + 1);
    expect(path[0]).toEqual(orbit.calculatePosition(epoch));
    expect(path.at(-1)).toEqual(orbit.calculatePosition(new Date(+epoch + periodMs)));
    expect(orbit.sampleOrbit(epoch)).toHaveLength(Math.ceil(periodMs / 60_000) + 1);
    const dense = orbit.sampleOrbit(epoch, 0.001);
    expect(dense).toHaveLength(512);
    expect(dense.at(-1)).toEqual(path.at(-1));
    for (let i = 1; i < path.length; i++) {
      const step = Date.parse(path[i].timestamp) - Date.parse(path[i - 1].timestamp);
      expect(step).toBeGreaterThan(0);
      expect(step).toBeLessThanOrEqual(120_000);
    }

    const middle = path[Math.floor(path.length / 2)];
    expect(middle).toEqual(orbit.calculatePosition(new Date(middle.timestamp)));
    expect(orbit.calculatePosition(epoch)).toEqual(path[0]);
  });

  it("rejects invalid elements, incompatible metadata and impossible epochs", () => {
    for (const input of [{ MEAN_MOTION: 0 }, { TIME_SYSTEM: "TAI" }, { REF_FRAME: "GCRF" }]) {
      expect(() => initializeOrbit({ ...dataset, elements: { ...elements, ...input } }))
        .toThrow(expect.objectContaining({ code: "INVALID_ELEMENTS" }));
    }
    for (const EPOCH of ["2000-02-30T00:00:00", "invalid"]) {
      expect(() => initializeOrbit({ ...dataset, elements: { ...elements, EPOCH } }))
        .toThrow(expect.objectContaining({ code: "INVALID_TIMESTAMP" }));
    }
    expect(() => initializeOrbit({ ...dataset, elements: { ...elements, MEAN_MOTION: 25 } }))
      .toThrow(expect.objectContaining({ code: "INITIALIZATION_FAILED" }));
  });

  it("reports invalid requested timestamps, intervals and failed propagation", () => {
    const orbit = initializeOrbit(dataset);
    expect(() => orbit.calculatePosition(new Date(NaN))).toThrow(OrbitCalculationError);
    expect(() => orbit.calculatePosition(new Date(NaN))).toThrow(expect.objectContaining({ code: "INVALID_TIMESTAMP" }));
    expect(() => orbit.sampleOrbit(new Date(NaN))).toThrow(expect.objectContaining({ code: "INVALID_TIMESTAMP" }));
    for (const interval of [NaN, Infinity, 0, -1, 0.0001]) {
      expect(() => orbit.sampleOrbit(epoch, interval)).toThrow(expect.objectContaining({ code: "INVALID_SAMPLING" }));
    }

    const dragOrbit = initializeOrbit({ ...dataset, elements: { ...elements, BSTAR: 1 } });
    const valid = dragOrbit.calculatePosition(epoch);
    expect(() => dragOrbit.calculatePosition(new Date("2100-01-01T00:00:00Z")))
      .toThrow(expect.objectContaining({ code: "PROPAGATION_FAILED" }));
    expect(dragOrbit.calculatePosition(epoch)).toEqual(valid);
  });
});
