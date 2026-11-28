import type { OmmRecord } from "../../core/orbital/omm";

interface Spacecraft {
  id: string;
  name: string;
  color: string;
  source: string;
  elements: OmmRecord;
}

// Archived Space-Track GP records published by Orbinauts. Keep the epochs
// alongside the original elements so replay never implies live tracking.
export const spacecraft: Spacecraft[] = [
  {
    id: "sentinel-2b",
    name: "Sentinel-2B",
    color: "#58b6fa",
    source: "https://orbinauts.com/satellites/sentinel-2b#data-and-api",
    elements: {
      OBJECT_NAME: "SENTINEL 2B",
      OBJECT_ID: "2017-013A",
      EPOCH: "2026-11-27T23:36:37.397088",
      MEAN_MOTION: 14.30815293,
      ECCENTRICITY: 0.00011542,
      INCLINATION: 98.5706,
      RA_OF_ASC_NODE: 44.4232,
      ARG_OF_PERICENTER: 91.347,
      MEAN_ANOMALY: 268.7846,
      EPHEMERIS_TYPE: 0,
      CLASSIFICATION_TYPE: "U",
      NORAD_CAT_ID: 42063,
      ELEMENT_SET_NO: 999,
      REV_AT_EPOCH: 50806,
      BSTAR: -0.000052009873,
      MEAN_MOTION_DOT: -0.0000018,
      MEAN_MOTION_DDOT: 0,
    },
  },
  {
    id: "sentinel-2c",
    name: "Sentinel-2C",
    color: "#d2e9ff",
    source: "https://orbinauts.com/satellites/sentinel-2c#data-and-api",
    elements: {
      OBJECT_NAME: "SENTINEL-2C",
      OBJECT_ID: "2024-157A",
      EPOCH: "2026-11-23T11:21:27.691488",
      MEAN_MOTION: 14.30816191,
      ECCENTRICITY: 0.00009526,
      INCLINATION: 98.5723,
      RA_OF_ASC_NODE: 39.9725,
      ARG_OF_PERICENTER: 108.7722,
      MEAN_ANOMALY: 251.3564,
      EPHEMERIS_TYPE: 0,
      CLASSIFICATION_TYPE: "U",
      NORAD_CAT_ID: 60989,
      ELEMENT_SET_NO: 999,
      REV_AT_EPOCH: 11576,
      BSTAR: 0.000044235249,
      MEAN_MOTION_DOT: 7.2e-7,
      MEAN_MOTION_DDOT: 0,
    },
  },
];
