# Visual Testing with Playwright MCP Server

## Overview

This project uses the **Playwright MCP Server** instead of traditional Playwright test files for visual verification. This allows AI agents (like Claude Code) to directly interact with and verify the running application.

## Why MCP Over Test Files?

**Traditional Playwright Tests:**
- Static test files that need to be written and maintained
- Run in CI/CD pipelines
- Require updates when UI changes
- Limited to predefined test scenarios

**Playwright MCP Server:**
- **Dynamic interaction**: AI agents can explore and verify UI on-the-fly
- **Real-time feedback**: See what you're building as you build it
- **Flexible verification**: No need to write test files for every scenario
- **Faster development**: Verify UI immediately after code changes
- **Better debugging**: Take screenshots and inspect elements interactively

## Setup

The Playwright MCP server is already configured for this project:

```bash
# Configuration was added with:
claude mcp add playwright npx @playwright/mcp@latest
```

No additional setup needed - it's ready to use!

## How to Use

### 1. Start the Development Server

```bash
npm run dev
```

The app runs on http://localhost:5173 (fixed port).

### 2. Use MCP Commands

AI agents can now use Playwright tools directly:

**Navigate to the app:**
```typescript
await browser_navigate({ url: "http://localhost:5173" });
```

**Take screenshots:**
```typescript
await browser_take_screenshot({ filename: "homepage.png" });
```

**Get page structure:**
```typescript
await browser_snapshot();
```

**Interact with elements:**
```typescript
await browser_click({ element: "FAB menu button", ref: "..." });
await browser_type({ element: "Input field", ref: "...", text: "Hello" });
```

**Verify touch targets:**
```typescript
await browser_evaluate({
  function: `() => {
    const button = document.querySelector('.new-button');
    const rect = button.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }`
});
```

## Common Visual Verification Workflows

### Verifying a New Component

```typescript
// 1. Navigate to the page
await browser_navigate({ url: "http://localhost:5173/new-feature" });

// 2. Take a screenshot
await browser_take_screenshot({ filename: "new-feature.png" });

// 3. Get accessibility snapshot
await browser_snapshot();

// 4. Verify interactive elements work
await browser_click({ element: "Submit button", ref: "..." });
await browser_take_screenshot({ filename: "after-submit.png" });
```

### Checking Responsive Design

```typescript
// Desktop view
await browser_resize({ width: 1920, height: 1080 });
await browser_take_screenshot({ filename: "desktop.png" });

// Tablet view (Surface Pro)
await browser_resize({ width: 1280, height: 800 });
await browser_take_screenshot({ filename: "tablet.png" });

// Mobile view
await browser_resize({ width: 375, height: 667 });
await browser_take_screenshot({ filename: "mobile.png" });
```

### Verifying Touch Targets

```typescript
await browser_evaluate({
  function: `() => {
    const buttons = document.querySelectorAll('button');
    return Array.from(buttons).map(btn => ({
      text: btn.textContent?.trim(),
      width: btn.offsetWidth,
      height: btn.offsetHeight,
      passes: btn.offsetWidth >= 44 && btn.offsetHeight >= 44
    }));
  }`
});
```

## Available MCP Tools

### Navigation
- `browser_navigate` - Go to a URL
- `browser_navigate_back` - Go back to previous page

### Inspection
- `browser_snapshot` - Get accessibility tree (structured page content)
- `browser_take_screenshot` - Capture visual state
- `browser_console_messages` - Get console logs
- `browser_network_requests` - View network activity

### Interaction
- `browser_click` - Click elements
- `browser_type` - Type text
- `browser_hover` - Hover over elements
- `browser_select_option` - Select dropdown options
- `browser_press_key` - Press keyboard keys
- `browser_drag` - Drag and drop

### Evaluation
- `browser_evaluate` - Run JavaScript in page context
- `browser_run_code` - Execute Playwright code snippets

### Window Management
- `browser_resize` - Change viewport size
- `browser_tabs` - Manage browser tabs
- `browser_close` - Close the browser

## Best Practices

### ✅ DO

- **Start dev server first**: Always have `npm run dev` running
- **Take screenshots at key steps**: Document the visual journey
- **Use descriptive filenames**: `fab-menu-open.png` not `test1.png`
- **Verify touch targets**: Ensure buttons are ≥ 44x44px
- **Test multiple viewports**: Desktop, tablet, and mobile
- **Check accessibility**: Use `browser_snapshot` for semantic structure
- **Verify user flows**: Not just static states

### ❌ DON'T

- **Don't make UI changes blind**: Always verify visually
- **Don't assume**: Just because code compiles doesn't mean UI looks right
- **Don't skip tablet testing**: This is a Surface-optimized app
- **Don't forget error states**: Test failures, not just happy paths
- **Don't leave debug screenshots**: Clean up after testing

## Example: Full Feature Verification

```typescript
// Feature: FAB Menu Navigation
// Goal: Verify menu opens, items are clickable, and navigation works

// 1. Start at homepage
await browser_navigate({ url: "http://localhost:5173" });
await browser_take_screenshot({ filename: "1-homepage.png" });

// 2. Verify FAB button exists and is visible
const snapshot = await browser_snapshot();
// Check snapshot contains FAB menu button

// 3. Click FAB button to open menu
await browser_click({ element: "FAB menu button", ref: "[class*='fixed'][class*='bottom']" });
await browser_take_screenshot({ filename: "2-menu-open.png" });

// 4. Verify all menu items are present
const menuSnapshot = await browser_snapshot();
// Check for Calendar, Photos, Meals, Tasks, Settings

// 5. Verify touch target sizes
const sizes = await browser_evaluate({
  function: `() => {
    const menuItems = document.querySelectorAll('[class*="fab-menu"] button');
    return Array.from(menuItems).map(btn => {
      const rect = btn.getBoundingClientRect();
      return {
        label: btn.textContent?.trim(),
        width: rect.width,
        height: rect.height,
        passesTouchTest: rect.width >= 44 && rect.height >= 44
      };
    });
  }`
});
// Verify all items pass touch test

// 6. Click Calendar menu item
await browser_click({ element: "Calendar menu item", ref: "..." });
await browser_take_screenshot({ filename: "3-calendar-page.png" });

// 7. Verify navigation occurred
const currentUrl = await browser_evaluate({ function: `() => window.location.pathname` });
// Should be /calendar

// 8. Verify calendar view loaded
await browser_snapshot({ filename: "calendar-structure.md" });
```

## Comparison to Traditional Tests

### Traditional Playwright Test
```typescript
// e2e/fab-menu.spec.ts
test('FAB menu should open and navigate', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('.fab-button')).toBeVisible();
  await page.click('.fab-button');
  await expect(page.locator('.fab-menu')).toBeVisible();
  await page.click('text=Calendar');
  await expect(page).toHaveURL(/\/calendar/);
});
```

**Issues:**
- Static test that needs maintenance
- Doesn't provide visual feedback during development
- Requires running test suite to verify
- Limited to predefined scenarios

### With MCP Server
```typescript
// AI agent dynamically verifies during development
await browser_navigate({ url: "http://localhost:5173" });
await browser_take_screenshot({ filename: "check-fab.png" });
await browser_click({ element: "FAB button", ref: "..." });
await browser_take_screenshot({ filename: "menu-opened.png" });
// Immediately see results, adjust as needed
```

**Benefits:**
- Visual feedback in real-time
- No test maintenance overhead
- Flexible, ad-hoc verification
- Perfect for iterative development

## When to Use Traditional Tests vs MCP

### Use MCP Server (Recommended for Development)
- Building new features
- Iterating on UI design
- Debugging visual issues
- Quick verification of changes
- Exploring the application

### Use Traditional Tests (Optional for CI/CD)
- Automated regression testing
- Critical user flow validation
- Pre-deployment verification
- Long-term maintenance checks

For this project, **MCP Server is the primary approach** for visual verification during development. Traditional Playwright tests in the `e2e/` directory are optional and can be used for CI/CD if needed.

## Troubleshooting

### MCP Server Not Responding

```bash
# Check if MCP is configured
cat ~/.claude.json

# Should show:
# {
#   "mcpServers": {
#     "playwright": {
#       "command": "npx",
#       "args": ["@playwright/mcp@latest"]
#     }
#   }
# }
```

### Browser Not Opening

The MCP server runs in headed mode by default. You should see a browser window open when you use MCP commands. If not:

1. Check that dev server is running (`npm run dev`)
2. Verify port 5173 is accessible
3. Check browser console for errors

### Screenshots Not Saving

Screenshots are saved relative to the output directory. Check the working directory and ensure you have write permissions.

## More Information

- **Full Documentation**: See [AGENTS.md](../AGENTS.md) - AI Agent Development Best Practices section
- **Playwright MCP Server**: https://github.com/microsoft/playwright-mcp
- **MCP Protocol**: https://modelcontextprotocol.io

---

**Remember**: The goal is to see what you're building. Use MCP to verify every UI change!
