import { test, expect } from '@playwright/test';

// Force desktop viewport
test.use({ viewport: { width: 1280, height: 720 } });

test.describe('ArgProp Final Sanity Check', () => {

    test('Main Pages Load Successfully', async ({ page }) => {
        // 1. Home
        await page.goto('/');
        await expect(page).toHaveTitle(/ArgProp/);

        // 2. Search
        await page.goto('/search');
        await expect(page).toHaveURL(/.*\/search/);

        // 3. Login
        await page.goto('/login');
        await expect(page).toHaveURL(/.*\/login/);
    });

    test('Navigation from Home to Search', async ({ page }) => {
        await page.goto('/');
        // Click the first big button we find
        await page.locator('a[href*="/search"]').first().click();
        await expect(page).toHaveURL(/.*\/search/);
    });

});
