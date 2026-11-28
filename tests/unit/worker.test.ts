import { describe, expect, it, vi } from 'vitest';
import worker from '../../worker/index';
import type { Env } from '../../worker/env';
import { createD1OrbitalRepository } from '../../worker/storage/d1-orbital-repository';
import { TRACKED_SPACECRAFT } from '../../src/config/spacecraft';
import { createLocalD1 } from '../helpers/sqlite-d1';
import { datasetFromFixture, fixtureText, okJsonResponse } from '../helpers/datasets';

const assetEnv = () => {
  const fetch = vi.fn(async () => new Response('asset'));
  const env = { ASSETS: { fetch } } as unknown as Env;
  return { env, fetch };
};

describe('worker routing', () => {
  it('reserves API routes and serves other requests as assets', async () => {
    const { env, fetch } = assetEnv();
    const api = await worker.fetch(new Request('https://example.com/api/orbits'), env);
    expect(api.status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
    const page = await worker.fetch(new Request('https://example.com/'), env);
    expect(await page.text()).toBe('asset');
  });
});

describe('orbital elements API', () => {
  const envWith = (db: D1Database) =>
    ({ ASSETS: { fetch: vi.fn() }, DB: db, CELESTRAK_BASE_URL: 'https://fixtures.example/gp.php' }) as unknown as Env;

  it('rejects POST on the orbital elements route', async () => {
    const res = await worker.fetch(
      new Request('https://example.com/api/satellites/40697/orbital-elements', { method: 'POST' }),
      envWith(createLocalD1()),
    );
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('GET');
  });

  it('returns 400 for an invalid identifier', async () => {
    const res = await worker.fetch(
      new Request('https://example.com/api/satellites/abc/orbital-elements'),
      envWith(createLocalD1()),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('INVALID_IDENTIFIER');
  });

  it('returns 404 for a spacecraft outside the allowlist', async () => {
    const res = await worker.fetch(
      new Request('https://example.com/api/satellites/99999/orbital-elements'),
      envWith(createLocalD1()),
    );
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('UNKNOWN_SPACECRAFT');
  });

  it('returns 503 for an allowlisted spacecraft without a stored dataset', async () => {
    const res = await worker.fetch(
      new Request('https://example.com/api/satellites/40697/orbital-elements'),
      envWith(createLocalD1()),
    );
    expect(res.status).toBe(503);
    expect((await res.json()).error.code).toBe('ORBITAL_DATA_UNAVAILABLE');
  });

  it('serves a stored dataset with provenance and cache headers', async () => {
    const db = createLocalD1();
    const repo = createD1OrbitalRepository(db);
    await repo.publishIfNewer(
      datasetFromFixture(TRACKED_SPACECRAFT[0], 'sentinel-2a.omm.json', {
        fetchedAt: '2026-01-17T03:00:00.000Z',
      }),
    );
    const res = await worker.fetch(
      new Request('https://example.com/api/satellites/40697/orbital-elements'),
      envWith(db),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('public, max-age=300');
    const body = await res.json();
    expect(body).toMatchObject({
      spacecraftId: 'sentinel-2a',
      noradCatalogId: 40697,
      format: 'OMM_JSON',
      epoch: '2026-01-15T10:00:00.000Z',
      fetchedAt: '2026-01-17T03:00:00.000Z',
      schemaVersion: 1,
      source: {
        provider: 'CelesTrak',
        url: 'https://fixtures.example/gp.php?CATNR=40697&FORMAT=JSON',
      },
    });
    expect(body.elements.OBJECT_NAME).toBe('SENTINEL-2A');
  });

  it('returns 404 for unknown /api routes', async () => {
    const res = await worker.fetch(new Request('https://example.com/api/nope'), envWith(createLocalD1()));
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('NOT_FOUND');
  });
});

describe('scheduled ingestion handler', () => {
  it('ingests via the cron handler into D1 and serves the result through the API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const catnr = new URL(String(input)).searchParams.get('CATNR');
        if (catnr === '40697') return okJsonResponse('sentinel-2a.omm.json');
        if (catnr === '42063') return okJsonResponse('sentinel-2b.omm.json');
        return new Response(fixtureText('no-gp-data.txt'), { status: 404 });
      }),
    );
    try {
      const env = {
        ASSETS: { fetch: vi.fn() },
        DB: createLocalD1(),
        CELESTRAK_BASE_URL: 'https://fixtures.example/gp.php',
      } as unknown as Env;

      let pending: Promise<unknown> | undefined;
      const ctx = {
        waitUntil(p: Promise<unknown>) {
          pending = p;
        },
      } as unknown as ExecutionContext;
      await worker.scheduled({ cron: '0 3 * * *' } as ScheduledController, env, ctx);
      await pending;

      const res = await worker.fetch(
        new Request('https://example.com/api/satellites/40697/orbital-elements'),
        env,
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.elements.NORAD_CAT_ID).toBe(40697);
      expect(body.source.url).toContain('fixtures.example');

      const missing = await worker.fetch(
        new Request('https://example.com/api/satellites/60989/orbital-elements'),
        env,
      );
      expect(missing.status).toBe(503);

      const { results } = await env.DB
        .prepare('SELECT outcome FROM ingestion_runs ORDER BY norad_catalog_id')
        .bind()
        .all<{ outcome: string }>();
      expect(results.map((r) => r.outcome)).toEqual(['published', 'published', 'no_data']);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
