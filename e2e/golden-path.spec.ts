import { test, expect } from '@playwright/test';

test('cadastrar, marcar presença, sortear e importar/exportar', async ({ page }) => {
  await page.goto('/app/');

  for (const name of ['Dudu', 'Caio', 'Gui', 'Rafa']) {
    await page.getByRole('button', { name: 'Novo jogador' }).click();
    await page.getByLabel('Nome ou apelido').fill(name);
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  }
  await expect(page.getByText('4 jogadores · 0 mensalistas')).toBeVisible();

  // addPlayer marks each new player present automatically, so all 4 are
  // already checked in when we land on Presença.
  await page.getByRole('button', { name: /Presença/ }).click();
  await expect(page.getByRole('button', { name: 'Sortear 4 jogadores' })).toBeEnabled();
  await page.getByRole('button', { name: 'Sortear 4 jogadores' }).click();

  await expect(page.getByText('Gol:')).toBeVisible();
  await expect(page.getByText('Anúncio', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /Elenco/ }).click();
  await page.getByRole('button', { name: 'Importar/Exportar' }).click();
  await expect(page.getByText(/"app": "tira-times"/)).toBeVisible();
  await page.getByRole('button', { name: 'Voltar' }).click();
  await expect(page.getByText('Elenco').first()).toBeVisible();

  // Dados sobrevivem a fechar e reabrir: reload the page and confirm the
  // roster (persisted in localStorage) is still there.
  await page.reload();
  await expect(page.getByText('4 jogadores · 0 mensalistas')).toBeVisible();
});
