-- First Orbit orbital persistence (ADR-016, TDD §9.1).
-- One latest validated orbital dataset per spacecraft, keyed by the verified
-- NORAD catalog identifier, plus separate ingestion health tracking.

CREATE TABLE IF NOT EXISTS orbital_datasets (
  norad_catalog_id INTEGER PRIMARY KEY,
  spacecraft_id TEXT NOT NULL,
  object_name TEXT NOT NULL,
  international_designator TEXT NOT NULL,
  -- Normalized fixed-width UTC ISO-8601; lexicographic order == chronological order.
  epoch TEXT NOT NULL,
  -- Retrieval timestamp, UTC ISO-8601.
  fetched_at TEXT NOT NULL,
  format TEXT NOT NULL,
  -- Complete validated OMM JSON record (raw source fields preserved).
  elements TEXT NOT NULL,
  source_url TEXT NOT NULL,
  schema_version INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ingestion_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  norad_catalog_id INTEGER NOT NULL,
  spacecraft_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (
    outcome IN ('published', 'skipped', 'no_data', 'upstream_error', 'validation_error', 'storage_error', 'error')
  ),
  detail TEXT,
  epoch TEXT
);

CREATE INDEX IF NOT EXISTS idx_ingestion_runs_catalog ON ingestion_runs (norad_catalog_id, finished_at);
