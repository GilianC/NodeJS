// Test E2E Playwright
import { test, expect } from '@playwright/test';

test('chat flow', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.fill('input[name="pseudo"]', 'Alice');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/chat/);
  await page.fill('#input', 'Hello world');
  await page.click('button:has-text("Envoyer")');
  await expect(page.locator('#chat')).toContainText('Hello world');
});
