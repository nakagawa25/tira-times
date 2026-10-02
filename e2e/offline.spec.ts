import { test, expect } from '@playwright/test';

test('the app works offline after the first visit', async ({ page, context }) => {
  await page.goto('/app/');
  await expect(page.getByText('Elenco').first()).toBeVisible();
  // Let the service worker finish installing and precaching before going offline.
  await page.waitForTimeout(1000);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Elenco').first()).toBeVisible();

  await context.setOffline(false);
});
