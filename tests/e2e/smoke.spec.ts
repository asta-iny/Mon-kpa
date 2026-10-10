import { expect, test } from '@playwright/test';

const apiBaseUrl =
  process.env.API_BASE_URL ?? `http://127.0.0.1:${process.env.API_PORT ?? '3001'}/api/v1`;

test('foundation home page loads', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /foundation shell/i })).toBeVisible();
  await expect(page.getByText(/LibFind/i).first()).toBeVisible();
});

test('API health returns ok', async ({ request }) => {
  const res = await request.get(`${apiBaseUrl}/health`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.status).toBe('ok');
  expect(body.requestId).toBeTruthy();
});
