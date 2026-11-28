# CelesTrak fixtures

These fixtures replicate the exact shape of the official CelesTrak GP endpoint
(`https://celestrak.org/NORAD/elements/gp.php?CATNR={id}&FORMAT=JSON`, OMM JSON
per CCSDS 502.0-B-3) as verified on 2026-11-27, but **all element values and
epochs are synthetic**.

Real CelesTrak orbital elements are deliberately not committed: TDD §8.1
step 2 requires confirming retrieval, attribution, and redistribution terms for
the exact feed before committing real orbital elements to the repository
(CelesTrak usage policy: <https://celestrak.org/usage-policy.php>). Until that
confirmation is recorded, tests use these synthetic records and live responses
are only exercised manually against local `wrangler dev`.

Files:

- `sentinel-2a.omm.json` / `sentinel-2b.omm.json` / `sentinel-2c.omm.json` — valid single-record OMM arrays (40697 / 42063 / 60989).
- `sentinel-2a-newer.omm.json`, `sentinel-2a-older.omm.json` — same spacecraft with later/earlier epochs, for conditional-publication tests.
- `wrong-catalog-id.json` — valid record for 42063, used when requesting 40697.
- `missing-fields.json`, `wrong-shape.json` — schema-invalid payloads.
- `empty-array.json` — empty element set (client maps to no-data).
- `malformed-json.txt` — non-JSON body.
- `no-gp-data.txt` — CelesTrak's HTTP 404 plain-text body.
