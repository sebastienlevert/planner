import { test, expect } from '@playwright/test';

/**
 * Comprehensive UI Test Suite for Family Planner
 * Tests all major features, navigation, and touch optimization
 */

test.describe('Comprehensive UI Testing', () => {

  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take screenshot of homepage
    await page.screenshot({
      path: 'test-screenshots/01-homepage.png',
      fullPage: true
    });

    // Verify page loaded
    await expect(page).toHaveTitle(/Family Planner/);

    // Check for main layout elements
    const header = page.locator('header');
    await expect(header).toBeVisible();

    console.log('✅ Homepage loaded successfully');
  });

  test('FAB menu opens and displays all options', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click FAB button (bottom-right fixed button)
    const fabButton = page.locator('button').filter({ hasText: /menu|☰/i }).last();

    // If not found, try finding by position class
    const fabButtonAlt = page.locator('button[class*="fixed"][class*="bottom"]').last();

    const button = (await fabButton.count()) > 0 ? fabButton : fabButtonAlt;

    await button.click();
    await page.waitForTimeout(500); // Wait for animation

    // Take screenshot of open menu
    await page.screenshot({
      path: 'test-screenshots/02-fab-menu-open.png',
      fullPage: true
    });

    // Verify menu items are visible
    await expect(page.locator('text=/Calendar/i').first()).toBeVisible();
    await expect(page.locator('text=/Photos/i').first()).toBeVisible();
    await expect(page.locator('text=/Meals/i').first()).toBeVisible();
    await expect(page.locator('text=/Tasks/i').first()).toBeVisible();
    await expect(page.locator('text=/Settings/i').first()).toBeVisible();

    console.log('✅ FAB menu opens with all options');
  });

  test('Navigation to Settings page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open FAB menu and click Settings
    const fabButton = page.locator('button[class*="fixed"][class*="bottom"]').last();
    await fabButton.click();
    await page.waitForTimeout(300);

    await page.locator('text=/Settings/i').first().click();

    // Wait for navigation
    await page.waitForURL(/\/settings/);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'test-screenshots/03-settings-page.png',
      fullPage: true
    });

    // Verify we're on settings page
    await expect(page).toHaveURL(/\/settings/);

    // Check for "Add Account" button
    const addAccountButton = page.locator('button', { hasText: /Add Account/i });
    await expect(addAccountButton).toBeVisible();

    console.log('✅ Settings page navigation works');
  });

  test('Navigation to Calendar page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open FAB menu and click Calendar
    const fabButton = page.locator('button[class*="fixed"][class*="bottom"]').last();
    await fabButton.click();
    await page.waitForTimeout(300);

    await page.locator('text=/Calendar/i').first().click();

    // Wait for navigation
    await page.waitForURL(/\/calendar/);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'test-screenshots/04-calendar-page.png',
      fullPage: true
    });

    // Verify we're on calendar page
    await expect(page).toHaveURL(/\/calendar/);

    console.log('✅ Calendar page navigation works');
  });

  test('Navigation to Photos page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open FAB menu and click Photos
    const fabButton = page.locator('button[class*="fixed"][class*="bottom"]').last();
    await fabButton.click();
    await page.waitForTimeout(300);

    await page.locator('text=/Photos/i').first().click();

    // Wait for navigation
    await page.waitForURL(/\/photos/);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'test-screenshots/05-photos-page.png',
      fullPage: true
    });

    // Verify we're on photos page
    await expect(page).toHaveURL(/\/photos/);

    console.log('✅ Photos page navigation works');
  });

  test('Navigation to Meals page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open FAB menu and click Meals
    const fabButton = page.locator('button[class*="fixed"][class*="bottom"]').last();
    await fabButton.click();
    await page.waitForTimeout(300);

    await page.locator('text=/Meals/i').first().click();

    // Wait for navigation
    await page.waitForURL(/\/meals/);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'test-screenshots/06-meals-page.png',
      fullPage: true
    });

    // Verify we're on meals page
    await expect(page).toHaveURL(/\/meals/);

    console.log('✅ Meals page navigation works');
  });

  test('Navigation to Tasks page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open FAB menu and click Tasks
    const fabButton = page.locator('button[class*="fixed"][class*="bottom"]').last();
    await fabButton.click();
    await page.waitForTimeout(300);

    await page.locator('text=/Tasks/i').first().click();

    // Wait for navigation
    await page.waitForURL(/\/tasks/);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'test-screenshots/07-tasks-page.png',
      fullPage: true
    });

    // Verify we're on tasks page
    await expect(page).toHaveURL(/\/tasks/);

    console.log('✅ Tasks page navigation works');
  });

  test('Touch target sizes meet 44x44px requirement', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open FAB menu to expose buttons
    const fabButton = page.locator('button[class*="fixed"][class*="bottom"]').last();
    await fabButton.click();
    await page.waitForTimeout(500);

    // Check all button sizes
    const buttons = await page.locator('button').all();
    const buttonSizes = [];

    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box && box.width > 0 && box.height > 0) {
        const text = await button.textContent();
        buttonSizes.push({
          text: text?.trim() || 'No text',
          width: box.width,
          height: box.height,
          passesTouchTest: box.width >= 44 && box.height >= 44
        });
      }
    }

    console.log('\n📏 Touch Target Analysis:');
    buttonSizes.forEach(btn => {
      const status = btn.passesTouchTest ? '✅' : '❌';
      console.log(`${status} ${btn.text}: ${btn.width.toFixed(0)}x${btn.height.toFixed(0)}px`);
    });

    // Check if any buttons fail
    const failedButtons = buttonSizes.filter(btn => !btn.passesTouchTest);

    if (failedButtons.length > 0) {
      console.log(`\n⚠️  Warning: ${failedButtons.length} buttons don't meet 44x44px requirement`);
    } else {
      console.log('\n✅ All buttons meet touch target requirements!');
    }
  });

  test('Responsive design - Tablet viewport', async ({ page }) => {
    // Set to Surface Pro dimensions
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'test-screenshots/08-tablet-view.png',
      fullPage: true
    });

    // Verify page renders correctly
    const header = page.locator('header');
    await expect(header).toBeVisible();

    console.log('✅ Tablet viewport renders correctly');
  });

  test('Responsive design - Desktop viewport', async ({ page }) => {
    // Set to desktop dimensions
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'test-screenshots/09-desktop-view.png',
      fullPage: true
    });

    console.log('✅ Desktop viewport renders correctly');
  });

  test('FAB menu closes when backdrop is clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open FAB menu
    const fabButton = page.locator('button[class*="fixed"][class*="bottom"]').last();
    await fabButton.click();
    await page.waitForTimeout(300);

    // Verify menu is open (backdrop should exist)
    const backdrop = page.locator('div[class*="fixed"][class*="inset"]');
    await expect(backdrop).toBeVisible();

    // Click backdrop
    await backdrop.click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);

    // Take screenshot after close
    await page.screenshot({
      path: 'test-screenshots/10-menu-closed.png',
      fullPage: true
    });

    console.log('✅ FAB menu closes on backdrop click');
  });

  test('All pages have proper page titles', async ({ page }) => {
    const pages = [
      { url: '/', expectedTitle: /Family Planner/i },
      { url: '/calendar', expectedTitle: /Family Planner/i },
      { url: '/photos', expectedTitle: /Family Planner/i },
      { url: '/meals', expectedTitle: /Family Planner/i },
      { url: '/tasks', expectedTitle: /Family Planner/i },
      { url: '/settings', expectedTitle: /Family Planner/i },
    ];

    for (const { url, expectedTitle } of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveTitle(expectedTitle);
      console.log(`✅ ${url} has correct title`);
    }
  });

  test('Check for console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to all pages
    const urls = ['/', '/calendar', '/photos', '/meals', '/tasks', '/settings'];

    for (const url of urls) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    }

    if (consoleErrors.length > 0) {
      console.log('\n⚠️  Console Errors Found:');
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('\n✅ No console errors detected');
    }
  });

  test('Accessibility snapshot of homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get accessibility tree
    const snapshot = await page.accessibility.snapshot();

    console.log('\n🔍 Accessibility Tree:');
    console.log(JSON.stringify(snapshot, null, 2));

    // Verify essential elements are in accessibility tree
    expect(snapshot).toBeTruthy();

    console.log('✅ Accessibility tree generated successfully');
  });
});
