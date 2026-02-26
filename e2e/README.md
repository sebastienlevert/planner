# E2E Testing with Playwright

This directory contains end-to-end tests for the Family Planner application using Playwright.

## Setup

Playwright is already installed. To install browsers:

```bash
npx playwright install
```

## Running Tests

### Headless Mode (CI/Default)
```bash
npm test
```

### Interactive UI Mode (Recommended for Development)
```bash
npm run test:ui
```

This opens Playwright's UI where you can:
- See all tests
- Run tests selectively
- Watch tests in real-time
- View screenshots and traces
- Time-travel debug failed tests

### Headed Mode (See Browser)
```bash
npm run test:headed
```

### Debug Mode (Step Through Tests)
```bash
npm run test:debug
```

### View Last Test Report
```bash
npm run test:report
```

## Test Structure

### `app.spec.ts`
Basic smoke tests for the application:
- Homepage loads correctly
- UI components are visible
- Navigation works
- FAB menu interactions

### Visual Regression Tests
- Compares screenshots to baseline
- Detects unintended UI changes
- Runs on both desktop and tablet viewports

### Touch Interaction Tests
- Verifies 44x44px minimum touch targets
- Tests tablet-optimized UI

## Adding New Tests

Create new `.spec.ts` files in the `e2e/` directory:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    // ... test logic
  });
});
```

## Screenshots

Screenshots are saved to `e2e/screenshots/` during test execution. They are gitignored to keep the repository clean.

## Best Practices

1. **Use AI Agent Visual Testing**: When implementing UI features, run Playwright tests to automatically verify visual output
2. **Test on Tablet Viewport**: Use the 'tablet' project to test Surface-optimized layout
3. **Take Screenshots**: Use `await page.screenshot()` to capture visual state
4. **Visual Regression**: Update baseline screenshots when intentional UI changes are made
5. **Touch Targets**: Always verify buttons/links meet 44x44px minimum

## Updating Baseline Screenshots

When you make intentional UI changes:

```bash
# Run tests and update baselines
npm test -- --update-snapshots
```

## Debugging Failed Tests

1. Run with UI mode: `npm run test:ui`
2. Click on failed test to see:
   - Screenshots at each step
   - Network requests
   - Console logs
   - DOM snapshots
3. Use time-travel debugging to inspect state

## CI Integration

Tests run automatically in CI with:
- Retry on failure (2 retries)
- Screenshots on failure
- HTML report generation
- Video recording on failure

## Configuration

See `playwright.config.ts` in the project root for configuration options.
