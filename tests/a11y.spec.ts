import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

test.describe('Page Studio E2E and Accessibility Gates', () => {
  
  test('should load preview page, render hero, and run accessibility audit', async ({ page, context }) => {
    // Set simulated cookie for editor role to pass auth middleware
    await context.addCookies([
      {
        name: 'user-role',
        value: 'editor',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // 1. Visit preview page
    await page.goto('/preview/home');
    
    // 2. Validate essential elements exist
    await expect(page.locator('header h1')).toContainText('Page Studio Preview');
    
    // Verify hero section is rendered from registry
    const heroTitle = page.locator('h1#hero-1-title');
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText('Create Beautiful Pages Instantly');

    // 3. Verify role switcher functions correctly
    const roleSelect = page.locator('select#role-select');
    await expect(roleSelect).toBeVisible();
    
    // Switch to viewer and check if studio link is disabled/locked
    await roleSelect.selectOption('viewer');
    await expect(page.locator('text=Studio Locked')).toBeVisible();

    // Switch back to editor
    await roleSelect.selectOption('editor');
    await expect(page.locator('header').locator('text=Open Studio')).toBeVisible();

    // 4. Run Axe accessibility audit
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    // 5. Save Axe report artifact
    const reportPath = path.join(process.cwd(), 'a11y-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(accessibilityScanResults, null, 2), 'utf-8');
    console.log(`Accessibility report generated at: ${reportPath}`);

    // 6. Enforce zero critical/serious violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (criticalViolations.length > 0) {
      console.error('CRITICAL ACCESSIBILITY VIOLATIONS FOUND:', JSON.stringify(criticalViolations, null, 2));
    }

    expect(criticalViolations.length).toBe(0);
  });

  test('should block viewer role from accessing studio route', async ({ page, context }) => {
    // Set simulated cookie for viewer role
    await context.addCookies([
      {
        name: 'user-role',
        value: 'viewer',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Attempt to navigate to /studio/home
    await page.goto('/studio/home');

    // Should be redirected back to preview page due to middleware
    await page.waitForURL('**/preview/home?error=unauthorized');
    
    // Verify alert message is displayed
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });

  test('should allow editor/publisher to access studio and modify hero title', async ({ page, context }) => {
    // Set simulated cookie for editor role
    await context.addCookies([
      {
        name: 'user-role',
        value: 'editor',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Go to studio
    await page.goto('/studio/home');
    await page.waitForURL('**/studio/home');

    // Click on the Hero section in preview pane to select it
    await page.locator('text=Create Beautiful Pages Instantly').first().click();

    // Verify properties panel updates
    const titleInput = page.locator('input#hero-title');
    await expect(titleInput).toBeVisible();
    
    // Type in new title and verify live preview updates
    await titleInput.fill('Revolutionary Studio');
    await expect(page.locator('text=Revolutionary Studio').first()).toBeVisible();
  });

  test('should fail login with non-gmail address', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input#email-input').fill('user@yahoo.com');
    await page.locator('input#password-input').fill('secret');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Must be a valid Gmail address')).toBeVisible();
  });

  test('should succeed login with gmail and redirect to preview', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input#email-input').fill('user@gmail.com');
    await page.locator('input#password-input').fill('secret123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/preview/home');
  });
});
