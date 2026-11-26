import { test, expect } from '@playwright/test';

test('visitors can navigate the static site', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Europe');
  await page.getByRole('link', { name: 'Data sources' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Data sources');
});

test('the homepage feature opens the Sentinel-2 mission', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Featured mission Sentinel-2/ }).click();
  await expect(page).toHaveURL('/missions/sentinel-2/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sentinel-2');
});

test('the catalog filters, resets, and opens the Sentinel-2 mission', async ({ page }) => {
  await page.goto('/missions/');
  const mission = page.getByRole('link', { name: /^Sentinel-2/ });
  const query = page.getByRole('searchbox', { name: 'Search missions' });
  const count = page.locator('#mission-count');

  await page.getByRole('button', { name: 'Earth observation' }).click();
  await expect(mission).toBeVisible();
  await expect(count).toHaveText('1 mission');
  await query.fill('copernicus');
  await expect(mission).toBeVisible();
  await query.fill('no such mission');
  await expect(mission).toBeHidden();
  await expect(count).toHaveText('0 missions');
  await expect(page.getByRole('heading', { name: 'No matching missions' })).toBeVisible();
  await page.getByRole('button', { name: 'Show all missions' }).click();
  await expect(query).toHaveValue('');
  await expect(page.getByRole('button', { name: 'All missions' })).toBeFocused();

  await page.getByRole('button', { name: 'Science' }).click();
  await expect(mission).toBeHidden();
  await page.getByRole('button', { name: 'Show all missions' }).click();
  await mission.click();
  await expect(page).toHaveURL('/missions/sentinel-2/');
});

test('site search opens the Sentinel-2 mission', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search Europe in Space' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('searchbox').fill('nearshore waters');
  await expect(dialog.getByRole('status')).toHaveText('1 result');
  await dialog.getByRole('link', { name: /^Sentinel-2/ }).click();
  await expect(page).toHaveURL('/missions/sentinel-2/');
});

test.describe('static Sentinel-2 mission content', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } });

  test('publishes the overview, spacecraft and official sources with keyboard navigation', async ({ page }) => {
    await page.goto('/missions/sentinel-2/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sentinel-2');
    await expect(page.getByText('AI-generated illustration.')).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Mission sections' });
    for (const [name, id] of [['Overview', 'overview'], ['Spacecraft', 'spacecraft'], ['Sources', 'sources']]) {
      const link = nav.getByRole('link', { name });
      await link.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.locator(`#${id}`)).toBeFocused();
    }
    await expect(page.locator('#overview')).toContainText('13 bands');

    const craft = page.locator('#spacecraft');
    for (const name of ['Sentinel-2A', 'Sentinel-2B', 'Sentinel-2C']) {
      await expect(craft.getByRole('heading', { name })).toBeVisible();
    }

    const sources = page.locator('#sources');
    await expect(sources.getByRole('link', { name: 'Sentinel-2 mission overview' }))
      .toHaveAttribute('href', /^https:\/\/www\.esa\.int\//);
    await expect(sources.getByRole('link', { name: 'Sentinel-2 mission documentation' }))
      .toHaveAttribute('href', 'https://sentiwiki.copernicus.eu/web/s2-mission');
    await expect(sources.locator('time[datetime="2025-01-21"]')).toBeVisible();
    await expect(sources.locator('time[datetime="2025-01-17"]')).toBeVisible();
    await expect(sources.locator('#source-esa-overview')).toContainText('Official mission page');
    await expect(sources.locator('#source-extension')).toHaveCount(0);

    const statements = craft.locator('[data-spacecraft-statement]');
    await expect(craft.locator('#sentinel-2a')).toContainText('Po Valley');
    await expect(craft.locator('#sentinel-2b')).toContainText('from 10 days to five');
    await expect(craft.locator('#sentinel-2c')).toContainText('compare and calibrate');
    await expect(craft.locator('#sentinel-2a [data-spacecraft-statement]').filter({ hasText: 'March 2025' })
      .locator('a[href="#source-copernicus-mission"]')).toBeVisible();
    for (const container of [page.locator('[data-mission-overview]'), ...await statements.all()]) {
      const citations = container.locator('a[href^="#source-"]');
      await expect(citations.first()).toBeVisible();
      for (const citation of await citations.all()) {
        const target = await citation.getAttribute('href');
        expect(target).toMatch(/^#source-/);
        await expect(page.locator(target!)).toHaveCount(1);
        await expect(sources.locator(`[data-source-entry]${target}`)).toBeVisible();
      }
    }
    await expect(craft.locator('[data-spacecraft-status]')).toHaveCount(0);
    await expect(page.getByRole('main').getByRole('link', { name: /orbit|tracker/i })).toHaveCount(0);
    expect(await page.locator('html').evaluate((html) => html.scrollWidth)).toBe(320);
  });
});
