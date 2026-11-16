# ADR-003: Provenance-first data model

- **Status:** Accepted
- **Date:** 2026-11-15
- **Project:** Europe in Space
- **Scope:** First Orbit and relevant subsequent features

## Context
Europe in Space combines information from multiple space agencies and external datasets. Some data are estimates; other data are historical, delayed, or subject to usage conditions. Users must be able to distinguish source information from calculated output.

## Decision
Store and expose relevant provenance alongside externally sourced records: provider, source URL or identifier, source epoch/observation/publication timestamp where applicable, retrieval or verification timestamp, license or usage terms when relevant, and processing method or limitations. Predicted satellite positions must be labeled as predictions rather than live telemetry.

## Rationale
- Enable scientific transparency and debugging.
- Support attribution and licensing compliance.
- Make stale and incomplete records recognizable.
- Allow data connectors to evolve without losing traceability.

## Consequences
- Schemas and UI components need provenance fields and clear missing-data states.
- Ingestion must preserve original identifiers and time semantics.
- Attribution must remain associated with image assets as well as metadata.
- The application must never fabricate unavailable values.

## Alternatives considered
- **Only store normalized data fields:** rejected because it removes auditability and context.
- **Link to provider homepages without record-level references:** insufficient for reliable verification.

## References
- [Project architecture](../../ARCHITECTURE.md)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
