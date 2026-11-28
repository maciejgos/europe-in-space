import { eciToEcf, gstime, json2satrec, radiansToDegrees, sgp4 } from "satellite.js";
import type { SatRec } from "satellite.js";
import { normalizeEpoch, ommRecordSchema } from "./omm";
import type { OrbitalDataset } from "./types";

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;
const UNIX_EPOCH_JD = 2440587.5;
const METERS_PER_KILOMETER = 1000;
const WGS84_A_KM = 6378.137;
const WGS84_F = 1 / 298.257223563;
const WGS84_E2 = WGS84_F * (2 - WGS84_F);
const MAX_PATH_POINTS = 512;
const MAX_RESONANT_MINUTES = 10 * 366 * 1440;

type OrbitErrorCode =
  | "INVALID_ELEMENTS"
  | "INVALID_TIMESTAMP"
  | "INITIALIZATION_FAILED"
  | "PROPAGATION_FAILED"
  | "INVALID_SAMPLING";

export class OrbitCalculationError extends Error {
  constructor(readonly code: OrbitErrorCode, message: string) {
    super(message);
    this.name = "OrbitCalculationError";
  }
}

interface Cartesian {
  x: number;
  y: number;
  z: number;
}

export interface SatellitePosition {
  spacecraftId: string;
  timestamp: string;
  positionTemeKm: Cartesian;
  /** PEF approximation for Earth-fixed visualization. */
  positionEarthFixedM: Cartesian;
  latitudeDeg: number;
  longitudeDeg: number;
  /** Height above the WGS84 ellipsoid. */
  altitudeKm: number;
}

export interface InitializedOrbit {
  calculatePosition(time: Date): SatellitePosition;
  /** Samples forward from start. Both ends are included, with at most 512 points. */
  sampleOrbit(start: Date, intervalSeconds?: number): SatellitePosition[];
}

function timestampMs(time: Date): number {
  if (!(time instanceof Date) || !Number.isFinite(time.getTime())) {
    throw new OrbitCalculationError("INVALID_TIMESTAMP", "Expected a valid Date for prediction time.");
  }
  return time.getTime();
}

function finitePosition(rec: SatRec, minutes: number, code: "INITIALIZATION_FAILED" | "PROPAGATION_FAILED") {
  const state = sgp4(rec, minutes);
  const position = state?.position;
  if (rec.error || !position || ![position.x, position.y, position.z].every(Number.isFinite)) {
    throw new OrbitCalculationError(code, `SGP4 did not produce a finite position (status ${rec.error}).`);
  }
  return position;
}

function geodeticFromFixedKm({ x, y, z }: Cartesian) {
  const radius = Math.hypot(x, y);
  const longitude = Math.atan2(y, x);
  let latitude = Math.atan2(z, radius * (1 - WGS84_E2));
  // Solve the ellipsoid normal latitude by fixed-point iteration.
  for (let step = 0; step < 10; step++) {
    const sinLatitude = Math.sin(latitude);
    const normal = WGS84_A_KM / Math.sqrt(1 - WGS84_E2 * sinLatitude ** 2);
    const next = Math.atan2(z + WGS84_E2 * normal * sinLatitude, radius);
    const converged = Math.abs(next - latitude) < 1e-12;
    latitude = next;
    if (converged) break;
  }
  const sinLatitude = Math.sin(latitude);
  // Project onto the surface normal to avoid dividing by cos(latitude) at the poles.
  const height = radius * Math.cos(latitude) + z * sinLatitude
    - WGS84_A_KM * Math.sqrt(1 - WGS84_E2 * sinLatitude ** 2);
  return { latitude, longitude, height };
}

/** Initialize once per element set. The returned calculations use only explicit UTC instants. */
export function initializeOrbit(dataset: Pick<OrbitalDataset, "spacecraftId" | "elements">): InitializedOrbit {
  const parsed = ommRecordSchema.safeParse(dataset.elements);
  if (!parsed.success) {
    if (parsed.error.issues.some((issue) => issue.path[0] === "EPOCH")) {
      throw new OrbitCalculationError("INVALID_TIMESTAMP", "The OMM epoch is not a valid UTC timestamp.");
    }
    throw new OrbitCalculationError("INVALID_ELEMENTS", "Expected a valid CelesTrak OMM record.");
  }

  const elements = parsed.data;
  if (
    elements.EPHEMERIS_TYPE !== 0 ||
    (elements.CENTER_NAME !== undefined && elements.CENTER_NAME !== "EARTH") ||
    (elements.TIME_SYSTEM !== undefined && elements.TIME_SYSTEM !== "UTC") ||
    (elements.REF_FRAME !== undefined && elements.REF_FRAME !== "TEME") ||
    (elements.MEAN_ELEMENT_THEORY !== undefined && elements.MEAN_ELEMENT_THEORY !== "SGP4")
  ) {
    throw new OrbitCalculationError("INVALID_ELEMENTS", "Unsupported OMM propagation metadata.");
  }

  let normalizedEpoch: string;
  try {
    normalizedEpoch = normalizeEpoch(elements.EPOCH);
  } catch {
    throw new OrbitCalculationError("INVALID_TIMESTAMP", "The OMM epoch is not a valid UTC timestamp.");
  }

  // Pass the library only the fields it uses in SGP4 initialization.
  const rec = json2satrec({
    OBJECT_NAME: elements.OBJECT_NAME,
    OBJECT_ID: elements.OBJECT_ID,
    EPOCH: normalizedEpoch,
    NORAD_CAT_ID: elements.NORAD_CAT_ID,
    ELEMENT_SET_NO: elements.ELEMENT_SET_NO,
    MEAN_MOTION: elements.MEAN_MOTION,
    MEAN_MOTION_DOT: elements.MEAN_MOTION_DOT,
    MEAN_MOTION_DDOT: elements.MEAN_MOTION_DDOT,
    ECCENTRICITY: elements.ECCENTRICITY,
    INCLINATION: elements.INCLINATION,
    RA_OF_ASC_NODE: elements.RA_OF_ASC_NODE,
    ARG_OF_PERICENTER: elements.ARG_OF_PERICENTER,
    MEAN_ANOMALY: elements.MEAN_ANOMALY,
    BSTAR: elements.BSTAR,
  });
  const epochMs = Date.parse(normalizedEpoch);
  const subMillisecondDigits = elements.EPOCH.split(".")[1]?.slice(3);
  const subMillisecond = subMillisecondDigits ? Number(`0.${subMillisecondDigits}`) : 0;
  const periodMs = DAY_MS / elements.MEAN_MOTION;
  const expectedEpochJd = UNIX_EPOCH_JD + epochMs / DAY_MS;
  if (
    !Number.isFinite(rec.jdsatepoch) ||
    Math.abs(rec.jdsatepoch - expectedEpochJd) > 1 / DAY_MS ||
    !Number.isFinite(periodMs) ||
    periodMs < 1
  ) {
    throw new OrbitCalculationError("INITIALIZATION_FAILED", "SGP4 requires a supported epoch and finite orbital period.");
  }
  finitePosition(rec, 0, "INITIALIZATION_FAILED");

  const { spacecraftId } = dataset;
  function calculatePosition(time: Date): SatellitePosition {
    const timeMs = timestampMs(time);
    const jd = UNIX_EPOCH_JD + timeMs / DAY_MS;
    const minutes = (timeMs - epochMs - subMillisecond) / MINUTE_MS;
    if (rec.irez && Math.abs(minutes) > MAX_RESONANT_MINUTES) {
      throw new OrbitCalculationError("PROPAGATION_FAILED", "Prediction exceeds the resonant SGP4 time limit.");
    }
    const positionTemeKm = finitePosition(rec, minutes, "PROPAGATION_FAILED");

    // GMST82 with UT1 approximated by UTC and zero polar motion.
    const fixed = eciToEcf(positionTemeKm, gstime(jd));
    const geo = geodeticFromFixedKm(fixed);
    const positionEarthFixedM = {
      x: fixed.x * METERS_PER_KILOMETER,
      y: fixed.y * METERS_PER_KILOMETER,
      z: fixed.z * METERS_PER_KILOMETER,
    };
    const latitudeDeg = radiansToDegrees(geo.latitude);
    const longitudeDeg = radiansToDegrees(geo.longitude);
    if (![...Object.values(positionEarthFixedM), latitudeDeg, longitudeDeg, geo.height].every(Number.isFinite)) {
      throw new OrbitCalculationError("PROPAGATION_FAILED", "Coordinate conversion did not produce finite values.");
    }

    return {
      spacecraftId,
      timestamp: time.toISOString(),
      positionTemeKm,
      positionEarthFixedM,
      latitudeDeg,
      longitudeDeg,
      altitudeKm: geo.height,
    };
  }

  function sampleOrbit(start: Date, intervalSeconds = 60): SatellitePosition[] {
    const startMs = timestampMs(start);
    const intervalMs = intervalSeconds * 1000;
    if (!Number.isFinite(intervalMs) || intervalMs < 1) {
      throw new OrbitCalculationError("INVALID_SAMPLING", "Sampling interval must be finite and at least one millisecond.");
    }
    const segments = Math.min(MAX_PATH_POINTS - 1, Math.ceil(periodMs / intervalMs));
    // Distribute points evenly so the final segment has the same spacing as the rest.
    return Array.from({ length: segments + 1 }, (_, index) =>
      calculatePosition(new Date(startMs + Math.round(periodMs * index / segments))),
    );
  }

  return { calculatePosition, sampleOrbit };
}
