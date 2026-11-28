import { z } from "zod";

export class OmmValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OmmValidationError";
  }
}

/**
 * CelesTrak GP OMM JSON flavor: CCSDS 502.0-B-3 Table 4-1 keywords.
 * Unknown keys are preserved so raw source fields survive a round trip.
 */
export const ommRecordSchema = z.looseObject({
  OBJECT_NAME: z.string().min(1),
  OBJECT_ID: z.string().min(1),
  EPOCH: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?$/, "invalid OMM EPOCH"),
  MEAN_MOTION: z.number().positive(),
  ECCENTRICITY: z.number().min(0).lt(1),
  INCLINATION: z.number().min(0).max(180),
  RA_OF_ASC_NODE: z.number().min(0).max(360),
  ARG_OF_PERICENTER: z.number().min(0).max(360),
  MEAN_ANOMALY: z.number().min(0).max(360),
  EPHEMERIS_TYPE: z.number().int().min(0),
  CLASSIFICATION_TYPE: z.string().regex(/^[A-Z]$/),
  NORAD_CAT_ID: z.number().int().positive(),
  ELEMENT_SET_NO: z.number().int().min(0),
  REV_AT_EPOCH: z.number().int().min(0),
  BSTAR: z.number(),
  MEAN_MOTION_DOT: z.number(),
  MEAN_MOTION_DDOT: z.number(),
});

export type OmmRecord = z.infer<typeof ommRecordSchema>;

const EPOCH_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?$/;

/**
 * Normalize a CelesTrak OMM EPOCH (UTC, no zone suffix) to a fixed-width UTC
 * ISO-8601 string with millisecond precision, e.g. "2026-11-26T22:36:14.588Z".
 * Fixed width makes lexicographic order equal to chronological order, which the
 * D1 conditional publication relies on.
 */
export function normalizeEpoch(epoch: string): string {
  const match = EPOCH_PATTERN.exec(epoch);
  if (!match) {
    throw new OmmValidationError(`Invalid OMM EPOCH: ${JSON.stringify(epoch)}`);
  }
  const [, year, month, day, hour, minute, second, fraction] = match;
  const millis = Number((fraction ?? "0").padEnd(3, "0").slice(0, 3));
  const ms = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    millis,
  );
  if (Number.isNaN(ms)) {
    throw new OmmValidationError(`Invalid OMM EPOCH: ${JSON.stringify(epoch)}`);
  }
  const date = new Date(ms);
  // Reject impossible calendar components (e.g. month 13, second 60).
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day) ||
    date.getUTCHours() !== Number(hour) ||
    date.getUTCMinutes() !== Number(minute) ||
    date.getUTCSeconds() !== Number(second)
  ) {
    throw new OmmValidationError(`Invalid OMM EPOCH: ${JSON.stringify(epoch)}`);
  }
  return date.toISOString();
}
