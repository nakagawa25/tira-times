import { test, expect } from '@playwright/test';

test('the app works offline after the first visit', async ({ page, context }) => {
  await page.goto('/app/');
  await expect(page.getByText('Elenco').first()).toBeVisible();
  // Wait deterministically for the service worker to finish installing and
  // precaching before going offline, instead of a fixed timeout.
  await page.evaluate(() => navigator.serviceWorker.ready);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Elenco').first()).toBeVisible();

  await context.setOffline(false);
});
