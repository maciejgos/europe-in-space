# ADR-010: OMM JSON as the Preferred Orbital Data Format

- **Status:** Accepted
- **Date:** 2026-11-15
- **Decision owners:** Project maintainer
- **Scope:** Europe in Space / First Orbit

## Context

Europe in Space needs General Perturbations orbital elements suitable for SGP4 propagation. CelesTrak provides GP data in several formats, including two-line elements (TLE) and CCSDS Orbit Mean-Elements Message (OMM) JSON. A consistent internal ingestion format reduces parsing ambiguity and makes provenance easier to preserve.

## Decision

Prefer **CelesTrak GP data in CCSDS OMM JSON** for initial orbital ingestion. Request the format explicitly, validate its fields, preserve relevant source values and metadata, and convert it into the input expected by a verified version of `satellite.js`.

- Query a verified NORAD catalog identifier using a documented CelesTrak endpoint with `FORMAT=JSON`.
- Validate identifier, epoch, required mean elements, numeric ranges, and supported metadata.
- Treat third-party payloads as untrusted and reject malformed or incompatible records.
- Preserve the original validated element set and its provider provenance; do not replace it with calculated positions as the source of truth.
- Keep the parsing and conversion implementation behind an `OrbitalDataProvider`/orbital-parser boundary.
- Document supported SGP4 model assumptions, reference frames, and units.

This choice concerns **GP orbital-element exchange**, not deep-space precise ephemerides, raw telemetry, or every future provider's native format.

## Rationale

OMM JSON provides named fields and an extensible structured representation, avoiding legacy TLE field-width and identifier limitations. It aligns with machine-to-machine ingestion and can be validated using schemas.

## Consequences

### Positive
- Structured, inspectable fields and straightforward schema validation.
- Better extensibility for new spacecraft and metadata.
- Retained source provenance for reproducible propagation tests.

### Negative / trade-offs
- Library support and input field conventions must be verified against the pinned `satellite.js` release.
- OMM does not make SGP4 predictions intrinsically more accurate than equivalent valid elements in TLE format.
- Some public sources or examples are TLE-only, requiring a future adapter.

## Alternatives Considered

1. **TLE as canonical format** — widely supported, concise, and acceptable for initial experiments, but legacy formatting and identifier constraints are undesirable long-term.
2. **Provider-specific raw JSON without canonical validation** — less initial work, but couples internal logic to a remote response shape.
3. **Computed positions as the canonical dataset** — unsuitable because it loses general propagation capability and source fidelity.
4. **Precise ephemeris formats** — appropriate for some future mission classes, not needed for First Orbit SGP4 tracking.

## Validation Before Release

- Retrieve a real, verified Sentinel spacecraft OMM record.
- Confirm parsing and propagation with the pinned `satellite.js` version.
- Validate known test epochs and coordinates using an independent reference.
- Test invalid dates, missing fields, mismatched catalog IDs, and empty responses.

## Revisit When

A new source only supports TLE, a mission requires precise ephemerides, or the propagation library changes its supported formats.
