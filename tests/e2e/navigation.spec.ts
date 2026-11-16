import { test, expect } from '@playwright/test';

test('visitors can navigate the static site', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Europe');
  await page.getByRole('link', { name: 'Data sources' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Data sources');
});
