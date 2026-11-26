import { expect } from '@playwright/test';
import {test} from './fixtures'

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Myst Market/);
});

test('server connected', async ({ page, request }) => {
  await page.goto('/');
  const response = await request.get("/health");
  expect(response.ok()).toBeTruthy();
});
