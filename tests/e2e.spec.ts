import { test, expect } from '@playwright/test';

// Force desktop viewport
test.use({ viewport: { width: 1280, height: 720 } });

test.describe('ArgProp UI Verification', () => {

    test('Home Page Loads', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/ArgProp/);
        await expect(page.getByText('Tu lugar en la playa')).toBeVisible();
        await expect(page.getByText('Buscar Alquiler')).toBeVisible();
    });

    test('Search Page Loads', async ({ page }) => {
        await page.goto('/search');
        await expect(page.getByRole('heading', { name: 'Explorar Propiedades' })).toBeVisible();

        // Check for either properties OR empty state
        const cards = page.locator('a[href^="/property/"]');
        const emptyState = page.getByText('No encontramos propiedades');

        // Wait for loading to finish (skeleton to disappear)
        // We can wait for the text "Cargando..." to detach, or just wait for one of the states
        await expect(cards.first().or(emptyState)).toBeVisible({ timeout: 10000 });
    });

    test('Login Page Loads', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByRole('heading', { name: 'Bienvenido a ArgProp' })).toBeVisible();
    });

    test('Navigation Works', async ({ page }) => {
        await page.goto('/');
        await page.getByText('Buscar Alquiler').click();
        await expect(page).toHaveURL(/.*\/search/);
    });

});
