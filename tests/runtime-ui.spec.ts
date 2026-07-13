import { test, expect } from '@playwright/test';

const password = 'Test1234';
const unique = Date.now();
const email = `ui.${unique}@pebcrm.test`;

test.describe('PEB CRM runtime UI', () => {
  test('register → verify OTP → login → open leads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'PEB CRM' })).toBeVisible();
    await expect(page.getByText('Create your account')).toBeVisible();

    await page.getByPlaceholder('John Doe').fill('UI Test User');
    await page.getByPlaceholder('Acme Corp').fill('UI Test Company');
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('Min 8 chars, upper+lower+number').fill(password);
    await page.getByPlaceholder('Re-enter password').fill(password);
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText('Verify your email')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(email)).toBeVisible();

    const devOtp = page.locator('.font-mono.tracking-widest');
    await expect(devOtp).toBeVisible({ timeout: 10_000 });
    const otp = (await devOtp.textContent())?.trim() || '';
    expect(otp).toMatch(/^[A-F0-9]{6}$/i);

    await page.getByPlaceholder('Enter 6-digit OTP').fill(otp);
    await page.getByRole('button', { name: 'Verify Email' }).click();

    await page.waitForURL('**/dashboard**', { timeout: 20_000 });
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/dashboard/leads');
    await expect(page).toHaveURL(/\/dashboard\/leads/);
    await expect(page.locator('body')).not.toContainText('Internal server error');
  });

  test('login page loads and links work', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'PEB CRM' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await page.getByRole('link', { name: 'Create one' }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('API proxy health responds', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data?.details?.database?.status).toBe('up');
  });
});
