import { describe, expect, it, vi } from 'vitest';
import worker from '../../worker/index';

describe('worker routing', () => {
  it('reserves API routes and serves other requests as assets', async () => {
    const fetch = vi.fn(async () => new Response('asset'));
    const env = { ASSETS: { fetch } } as unknown as Parameters<typeof worker.fetch>[1];
    const api = await worker.fetch(new Request('https://example.com/api/orbits'), env);
    expect(api.status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
    const page = await worker.fetch(new Request('https://example.com/'), env);
    expect(await page.text()).toBe('asset');
  });
});
