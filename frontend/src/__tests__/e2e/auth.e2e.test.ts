import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
    test('debe permitir el inicio de sesión y redireccionar al dashboard', async ({ page }) => {
        await page.goto('/login');
        
        // Llenar formulario
        await page.fill('[name="username"]', 'admin');
        await page.fill('[name="password"]', 'admin123');
        await page.click('button[type="submit"]');

        // Verificar redirección
        await expect(page).toHaveURL('/dashboard');
        await expect(page.locator('h1')).toContainText('Panel de Control');
    });

    test('debe mostrar error con credenciales inválidas', async ({ page }) => {
        await page.goto('/login');
        
        await page.fill('[name="username"]', 'wrong');
        await page.fill('[name="password"]', 'wrong');
        await page.click('button[type="submit"]');

        await expect(page.locator('.error-message')).toBeVisible();
        await expect(page.locator('.error-message')).toContainText('Credenciales inválidas');
    });
}); 