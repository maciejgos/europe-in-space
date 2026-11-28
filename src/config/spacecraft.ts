export interface TrackedSpacecraft {
  /** Editorial spacecraft ID from the mission content collection. */
  spacecraftId: string;
  name: string;
  missionId: string;
  /** NORAD catalog ID; primary key for CelesTrak GP data and D1 storage. */
  noradCatalogId: number;
  /** International designator (CelesTrak OBJECT_ID), verified against the mapping. */
  internationalDesignator: string;
}

/**
 * Explicit Sentinel-2 spacecraft mapping (TDD §8.1 candidate table).
 *
 * IDs and designators were verified against the live CelesTrak endpoint
 * `gp.php?NAME=SENTINEL-2&FORMAT=JSON` on 2026-11-27 (OBJECT_NAME, OBJECT_ID and
 * NORAD_CAT_ID matched). Re-verify before release; never guess catalog
 * identifiers from spacecraft names.
 */
export const TRACKED_SPACECRAFT: readonly TrackedSpacecraft[] = [
  {
    spacecraftId: "sentinel-2a",
    name: "Sentinel-2A",
    missionId: "sentinel-2",
    noradCatalogId: 40697,
    internationalDesignator: "2015-028A",
  },
  {
    spacecraftId: "sentinel-2b",
    name: "Sentinel-2B",
    missionId: "sentinel-2",
    noradCatalogId: 42063,
    internationalDesignator: "2017-013A",
  },
  {
    spacecraftId: "sentinel-2c",
    name: "Sentinel-2C",
    missionId: "sentinel-2",
    noradCatalogId: 60989,
    internationalDesignator: "2024-157A",
  },
];

export const trackedSpacecraftByNoradId: ReadonlyMap<number, TrackedSpacecraft> = new Map(
  TRACKED_SPACECRAFT.map((spacecraft) => [spacecraft.noradCatalogId, spacecraft]),
);
