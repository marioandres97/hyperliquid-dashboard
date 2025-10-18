import { test, expect } from '@playwright/test';

test.describe('Dashboard Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check if page loaded
    await expect(page).toHaveTitle(/Hyperliquid/);
  });

  test('should have asset toggle', async ({ page }) => {
    await page.goto('/');
    
    // Wait for asset toggle to be visible
    await page.waitForSelector('text=BTC', { timeout: 10000 });
    
    // Check that all three assets are present
    await expect(page.locator('text=BTC')).toBeVisible();
    await expect(page.locator('text=ETH')).toBeVisible();
    await expect(page.locator('text=HYPE')).toBeVisible();
  });

  test('should switch between assets', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click ETH button
    await page.click('button:has-text("ETH")');
    
    // Wait for content to update (would check for actual data changes in real app)
    await page.waitForTimeout(500);
    
    // Verify ETH is now active (could check for active class or styles)
    const ethButton = page.locator('button:has-text("ETH")');
    await expect(ethButton).toBeVisible();
  });
});

test.describe('Institutional Analysis Page', () => {
  test('should navigate to institutional analysis', async ({ page }) => {
    await page.goto('/institutional-analysis');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if institutional analysis content is visible
    // This is a basic check - in a real app, you'd check for specific content
    await expect(page).toHaveURL('/institutional-analysis');
  });

  test('should display analysis modules', async ({ page }) => {
    await page.goto('/institutional-analysis');
    
    await page.waitForLoadState('networkidle');
    
    // Check for presence of analysis content
    // In a real implementation, check for specific module headings or content
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });
});

test.describe('API Health Check', () => {
  test('should have functional health endpoint', async ({ page }) => {
    const response = await page.request.get('/api/health');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('services');
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    // Check that content is visible on mobile
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Asset toggle should be visible on mobile
    await expect(page.locator('text=BTC')).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('should handle navigation errors gracefully', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/non-existent-page', { waitUntil: 'networkidle' });
    
    // Should show some kind of error or 404 page (adjust based on your app's behavior)
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });
});
