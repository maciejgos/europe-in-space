import { expect, test } from '@playwright/test';

test.use({
  viewport: { width: 1440, height: 1000 },
  launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
});

test('the desktop globe renders, rotates, zooms and resets using only local resources', async ({ page, context, baseURL }) => {
  const urls = new Set<string>();
  const failures: string[] = [];
  context.on('request', (request) => urls.add(request.url()));
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text());
  });
  page.on('response', (response) => {
    if (!response.ok() && response.status() !== 304) failures.push(response.url());
  });

  await page.goto('/');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Satellites' }).click();
  await expect(page).toHaveURL('/satellites/');
  await expect(page).toHaveTitle('Explore Orbits | Europe in Space');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Explore Orbits');
  await expect(page.getByRole('button', { name: 'Search Europe in Space' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Made with Natural Earth' })).toBeVisible();

  const canvas = page.locator('earth-globe canvas');
  await expect(canvas).toBeVisible({ timeout: 20_000 });
  const box = (await canvas.boundingBox())!;
  // The desktop canvas now extends behind the controls. Exclude their focus rings.
  const captureGlobe = () => page.screenshot({
    clip: { x: box.x + box.width * 0.25, y: box.y, width: box.width * 0.5, height: box.height },
  });
  const initial = await captureGlobe();
  const rotate = page.getByRole('button', { name: 'Rotate right' });
  await rotate.focus();
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await captureGlobe()).equals(initial)).toBe(false);
  const rotated = await captureGlobe();

  await page.getByRole('button', { name: 'Zoom in' }).press('Space');
  await expect.poll(async () => (await captureGlobe()).equals(rotated)).toBe(false);
  await page.getByRole('button', { name: 'Reset to Europe' }).press('Enter');
  await expect.poll(async () => (await captureGlobe()).equals(initial)).toBe(true);

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect.poll(async () => (await captureGlobe()).equals(initial)).toBe(false);
  const dragged = await captureGlobe();
  await page.mouse.wheel(0, -120);
  await expect.poll(async () => (await captureGlobe()).equals(dragged)).toBe(false);

  expect(failures).toEqual([]);
  expect([...urls].filter((url) => /^https?:/.test(url) && new URL(url).origin !== baseURL)).toEqual([]);
  expect([...urls].some((url) => url.endsWith('/maps/natural-earth-ii.jpg'))).toBe(true);
  expect([...urls].some((url) => url.includes('/cesium/Workers/createVerticesFromHeightmap.js'))).toBe(true);
  expect([...urls].some((url) => url.endsWith('/cesium/Assets/approximateTerrainHeights.json'))).toBe(true);
  expect([...urls].some((url) => url.includes('/cesium/Assets/IAU2006_XYS/'))).toBe(true);
});

test('unrelated pages do not request globe code, workers or imagery', async ({ page }) => {
  const urls: string[] = [];
  page.on('request', (request) => urls.push(request.url()));
  for (const path of ['/', '/missions/', '/missions/sentinel-2/', '/observatories/']) {
    await page.goto(path);
    await expect(page.locator('earth-globe')).toHaveCount(0);
  }
  expect(urls.filter((url) => /\/cesium\/|\/maps\/natural-earth-ii|\/(cesium-engine|EarthGlobe)[.-]/i.test(url))).toEqual([]);
});

test.describe('mobile globe', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });

  test('touch drag and pinch change the globe, and controls fit the viewport', async ({ page, context }) => {
    await page.goto('/satellites/');
    const canvas = page.locator('earth-globe canvas');
    await expect(canvas).toBeVisible({ timeout: 20_000 });
    const initial = await canvas.screenshot();
    const box = (await canvas.boundingBox())!;
    const x = Math.round(box.x + box.width / 2);
    const y = Math.round(box.y + box.height / 2);
    const cdp = await context.newCDPSession(page);
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', ...touchPoints: { x: number; y: number; id: number }[]) =>
      cdp.send('Input.dispatchTouchEvent', { type, touchPoints });

    await touch('touchStart', { x, y, id: 1 });
    await touch('touchMove', { x: x + 42, y, id: 1 });
    await touch('touchEnd');
    await expect.poll(async () => (await canvas.screenshot()).equals(initial)).toBe(false);
    const rotated = await canvas.screenshot();

    await touch('touchStart', { x: x - 20, y, id: 1 }, { x: x + 20, y, id: 2 });
    await touch('touchMove', { x: x - 60, y, id: 1 }, { x: x + 60, y, id: 2 });
    await touch('touchEnd');
    await expect.poll(async () => (await canvas.screenshot()).equals(rotated)).toBe(false);
    await page.getByRole('button', { name: 'Reset to Europe' }).tap();
    await expect.poll(async () => (await canvas.screenshot()).equals(initial)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});

test('renders the usable static map when JavaScript is disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/satellites/');
    await expect(page.getByText('Static world map')).toBeVisible();
    await expect(page.getByRole('img', { name: /World physical map/ })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Globe controls' })).toBeHidden();
  } finally {
    await context.close();
  }
});

test('renders the static map without WebGL', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      return type.startsWith('webgl') ? null : Reflect.apply(getContext, this, [type, ...args]);
    } as typeof getContext;
  });
  await page.goto('/satellites/');
  await expect(page.getByRole('status').filter({ hasText: 'interactive globe is unavailable' })).toBeVisible();
  await expect(page.getByRole('img', { name: /World physical map/ })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Globe controls' })).toBeHidden();
});

test('renders the static map when the globe module fails to load', async ({ page }) => {
  await page.route(/\/cesium-engine[.-].+\.js$/, (route) => route.abort());
  await page.goto('/satellites/');
  await expect(page.getByRole('status').filter({ hasText: 'interactive globe is unavailable' })).toBeVisible();
  await expect(page.getByRole('img', { name: /World physical map/ })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Globe controls' })).toBeHidden();
});

test('explores Sentinel-2 spacecraft and replays archived positions on the same globe', async ({ page }) => {
  await page.goto('/satellites/');
  const canvas = page.locator('earth-globe canvas');
  await expect(canvas).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('heading', { name: 'Sentinel-2B' })).toBeVisible();
  await page.getByText('Mission browser', { exact: true }).click();
  const search = page.getByRole('searchbox', { name: 'Find spacecraft' });
  await search.fill('missing');
  await expect(page.getByText('No spacecraft match your search.')).toBeVisible();
  await search.fill('60989');
  await expect(page.getByRole('button', { name: /Sentinel-2B/ })).toBeHidden();
  await page.getByRole('button', { name: /Sentinel-2C/ }).click();
  await expect(page.getByRole('heading', { name: 'Sentinel-2C' })).toBeVisible();
  await expect(page.locator('[data-atlas-epoch]')).toHaveAttribute('datetime', /^2026-11-23/);
  await expect(page.getByRole('link', { name: 'Space-Track via Orbinauts' })).toHaveAttribute('href', /sentinel-2c/);
  await page.getByRole('checkbox', { name: 'Show only selected spacecraft' }).check();
  await page.getByText('Mission browser', { exact: true }).click();

  const clock = page.locator('[data-atlas-clock]');
  const initialTime = await clock.getAttribute('datetime');
  await page.getByRole('slider', { name: 'Orbit replay time' }).press('End');
  await expect(clock).not.toHaveAttribute('datetime', initialTime!);
  const endTime = await clock.getAttribute('datetime');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(clock).not.toHaveAttribute('datetime', endTime!);
  await page.getByRole('button', { name: 'Pause' }).click();

  await page.getByRole('button', { name: 'Guided story' }).click();
  await expect(page.getByRole('heading', { name: 'Two spacecraft, one mission' })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Keeping the record going' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sentinel-2C' })).toBeVisible();
  await expect(canvas).toBeVisible();
  await expect(page).toHaveURL('/satellites/');
});
