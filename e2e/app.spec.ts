import { test, expect } from '@playwright/test';

/**
 * Basic smoke tests for Family Planner application
 */
test.describe('Family Planner App', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await page.waitForLoadState('networkidle');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Family Planner/i);
  });

  test('should display the header', async ({ page }) => {
    await page.goto('/');

    // Check for header element
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should show FAB menu button', async ({ page }) => {
    await page.goto('/');

    // FAB menu button should be visible
    const fabButton = page.locator('button').filter({ hasText: /menu|☰/i }).last();
    await expect(fabButton).toBeVisible();

    // Take a screenshot of the initial state
    await page.screenshot({ path: 'e2e/screenshots/homepage.png', fullPage: true });
  });

  test('should open FAB menu on click', async ({ page }) => {
    await page.goto('/');

    // Find and click the FAB button (the fixed bottom-right button)
    const fabButton = page.locator('button[class*="fixed"][class*="bottom"]').last();
    await fabButton.click();

    // Wait for menu to expand
    await page.waitForTimeout(300);

    // Take screenshot of expanded menu
    await page.screenshot({ path: 'e2e/screenshots/fab-menu-open.png', fullPage: true });

    // Menu items should be visible
    await expect(page.locator('text=/Calendar|Photos|Meals|Tasks|Settings/i').first()).toBeVisible();
  });

  test('should navigate to Settings page', async ({ page }) => {
    await page.goto('/');

    // Click FAB menu
    const fabButton = page.locator('button[class*="fixed"][class*="bottom"]').last();
    await fabButton.click();
    await page.waitForTimeout(300);

    // Click Settings
    await page.locator('text=/Settings/i').first().click();

    // Should navigate to settings
    await expect(page).toHaveURL(/\/settings/);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/settings-page.png', fullPage: true });
  });
});

/**
 * Visual regression tests for key UI components
 */
test.describe('Visual Regression', () => {
  test('should match homepage snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take full-page screenshot for visual comparison
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100, // Allow small differences
    });
  });

  test('should match tablet layout', async ({ page, viewport }) => {
    // This test runs in the 'tablet' project with Surface Pro dimensions
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify viewport is tablet-sized
    expect(viewport?.width).toBeGreaterThanOrEqual(1024);

    // Take screenshot
    await expect(page).toHaveScreenshot('tablet-view.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });
});

/**
 * Touch interaction tests for tablet optimization
 */
test.describe('Touch Interactions', () => {
  test('should have touch-friendly button sizes', async ({ page }) => {
    await page.goto('/');

    // Open FAB menu
    const fabButton = page.locator('button[class*="fixed"][class*="bottom"]').last();
    await fabButton.click();
    await page.waitForTimeout(300);

    // Get all menu buttons
    const menuButtons = page.locator('button').filter({ hasText: /Calendar|Photos|Meals|Tasks|Settings/i });

    // Check that buttons meet minimum touch target size (44x44px)
    const count = await menuButtons.count();
    for (let i = 0; i < count; i++) {
      const button = menuButtons.nth(i);
      const box = await button.boundingBox();

      if (box) {
        // Verify minimum 44px touch target
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
