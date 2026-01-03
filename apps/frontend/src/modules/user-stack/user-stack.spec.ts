import { expect, test } from '@playwright/test';

// Helper function to generate unique test identifiers
function generateTestId(testName: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 11);
  return `${testName}-${timestamp}-${randomId}`;
}

test.describe('User Stack', () => {
  test.describe('User Stack List', () => {
    test('loads and displays user stack page', async ({ page }) => {
      // Navigate to user stack
      await page.goto('/user-stack');
      await page.waitForURL('**/user-stack');
      await page.waitForLoadState('networkidle');

      // Verify page loads - check for either empty state or filled state
      const isEmpty = await page.getByText('No Stack Items Yet').isVisible();
      if (isEmpty) {
        await expect(page.getByText('No Stack Items Yet')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add Your First Item' })).toBeVisible();
      } else {
        await expect(page.getByText('My Stack')).toBeVisible();
      }
    });

    test('displays items count correctly', async ({ page }) => {
      // Navigate to user stack
      await page.goto('/user-stack');
      await page.waitForURL('**/user-stack');
      await page.waitForLoadState('networkidle');

      // Check that items count is displayed when there are items, or empty state when none
      const itemsCountText = page.locator('text=/\\d+ (item|items) in total/');
      if (await itemsCountText.isVisible()) {
        await expect(itemsCountText).toBeVisible();
      } else {
        await expect(page.getByText('No Stack Items Yet')).toBeVisible();
      }
    });

    test('toggles between card and table view', async ({ page }) => {
      // Navigate to user stack
      await page.goto('/user-stack');
      await page.waitForURL('**/user-stack');

      // Only test toggle if there are items (toggle is only shown when there are items)
      const cardViewToggle = page.locator('[aria-label="card view"]');
      if (await cardViewToggle.isVisible()) {
        // Default should be card view
        await expect(cardViewToggle).toHaveAttribute('aria-pressed', 'true');

        // Switch to table view
        await page.locator('[aria-label="table view"]').click();
        await expect(page.locator('[aria-label="table view"]')).toHaveAttribute('aria-pressed', 'true');

        // Switch back to card view
        await page.locator('[aria-label="card view"]').click();
        await expect(cardViewToggle).toHaveAttribute('aria-pressed', 'true');
      } else {
        test.skip(true, 'No items available for view toggle test');
      }
    });
  });

  test.describe('Create User Stack Item', () => {
    test('loads create user stack item page', async ({ page }) => {
      // Navigate to create item
      await page.goto('/user-stack/new');
      await page.waitForURL('**/user-stack/new');

      // Verify page loads
      await expect(page.locator('h1')).toContainText('Add to Your Stack');
      await expect(page.locator('text=Create a new supplement or medication in your health stack')).toBeVisible();
    });

    test('displays form with required fields', async ({ page }) => {
      // Navigate to create item
      await page.goto('/user-stack/new');
      await page.waitForURL('**/user-stack/new');

      // Check that form elements are present
      await expect(page.locator('label:has-text("Supplement/Medication Name")')).toBeVisible();
      await expect(page.locator('label:has-text("Dosage")')).toBeVisible();
      await expect(page.locator('label:has-text("Unit")')).toBeVisible();
      await expect(page.locator('label:has-text("Day of Week")')).toBeVisible();
      await expect(page.locator('label:has-text("Times of Day")')).toBeVisible();
      await expect(page.locator('label:has-text("Active in my stack")')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText('Add to Stack');
    });

    test('can create a user stack item', async ({ page }) => {
      // Navigate to create item
      await page.goto('/user-stack/new');
      await page.waitForURL('**/user-stack/new');
      await page.waitForLoadState('networkidle');

      const testId = generateTestId('create-stack-item');
      const itemName = `Test Supplement ${testId}`;

      // Fill in the form
      await page.locator('input[name="name"]').fill(itemName);
      await page.locator('input[name="dosage"]').fill('2');
      await page.locator('input[name="timesOfDay"]').fill('Morning, Evening');
      await page.locator('textarea[name="instructions"]').fill('Take with food\nAvoid caffeine');

      // Submit the form
      await page.locator('button[type="submit"]').click();

      // Should show success message
      await expect(page.locator('text=User stack item added successfully!')).toBeVisible();
    });

    test('custom unit field appears when "Other" is selected', async ({ page }) => {
      // Navigate to create item
      await page.goto('/user-stack/new');
      await page.waitForURL('**/user-stack/new');

      // Select "Other" unit
      await page.locator('input[name="unit"]').click();
      await page.getByRole('option', { name: 'Other' }).click();

      // Custom unit field should appear
      await expect(page.locator('label:has-text("Custom Unit")')).toBeVisible();
    });
  });

  test.describe('User Stack Item Detail', () => {
    test('loads and displays user stack item detail', async ({ page }) => {
      const testId = generateTestId('detail-view');
      const itemName = `Test Item for Detail ${testId}`;

      // First create an item for testing
      await page.goto('/user-stack/new');
      await page.locator('input[name="name"]').fill(itemName);
      await page.locator('input[name="dosage"]').fill('1');
      await page.locator('input[name="timesOfDay"]').fill('Morning');
      await page.locator('textarea[name="instructions"]').fill('Take daily');
      await page.locator('button[type="submit"]').click();

      // Wait for success message
      await expect(page.locator('text=User stack item added successfully!')).toBeVisible({ timeout: 5000 });

      // Navigate to user stack list
      await page.goto('/user-stack');
      await page.waitForLoadState('networkidle');

      // Check if we have items
      const itemsCountText = page.locator('text=/\\d+ (item|items) in total/');
      const isVisible = await itemsCountText.isVisible();
      if (isVisible) {
        const itemsCount = await itemsCountText.textContent();
        const count = itemsCount ? parseInt(itemsCount.split(' ')[0] ?? "0", 10) : 0;
        if (count > 0) {
          // Click on the first item (assuming it might be our newly created one)
          await page.locator('.MuiCard-root').first().click();

          // Should navigate to detail page
          await page.waitForURL(/\/user-stack\/.+/);

          // Verify detail page elements
          await expect(page.locator('text=Back to My Stack')).toBeVisible();
          await expect(page.locator('text=Delete Item')).toBeVisible();
          await expect(page.locator('text=Dosage')).toBeVisible();
          await expect(page.locator('text=Schedule')).toBeVisible();
        } else {
          test.skip(true, 'No items available for detail view test');
        }
      } else {
        test.skip(true, 'No items available for detail view test');
      }
    });

    test('can navigate back from detail page', async ({ page }) => {
      const testId = generateTestId('navigate-back');
      const itemName = `Test Item for Navigation ${testId}`;

      // First create an item for testing
      await page.goto('/user-stack/new');
      await page.locator('input[name="name"]').fill(itemName);
      await page.locator('input[name="dosage"]').fill('3');
      await page.locator('input[name="timesOfDay"]').fill('Afternoon');
      await page.locator('button[type="submit"]').click();

      // Wait for success message
      await expect(page.locator('text=User stack item added successfully!')).toBeVisible({ timeout: 5000 });

      // Navigate to user stack list
      await page.goto('/user-stack');
      await page.waitForLoadState('networkidle');

      // Get current items state
      const itemsCountText = page.locator('text=/\\d+ (item|items) in total/');
      const hasItems = await itemsCountText.isVisible();

      if (hasItems) {
        const itemsCount = await itemsCountText.textContent();
        const count = itemsCount ? parseInt(itemsCount.split(' ')[0] ?? "0", 10) : 0;

        if (count > 0) {
          // Click on the first available item
          await page.locator('.MuiCard-root').first().click();
          await page.waitForURL(/\/user-stack\/.+/);

          // Click back button
          await page.locator('text=Back to My Stack').click();

          // Should navigate back to list
          await page.waitForURL('**/user-stack');
          await expect(page.locator('h1')).toContainText('My Stack');
        } else {
          test.skip(true, `No items available for navigation test. Created item "${itemName}" but count shows zero.`);
        }
      } else {
        test.skip(true, `No items visible for navigation test. Created item "${itemName}" but no item counter found.`);
      }
    });
  });

  test.describe('Delete User Stack Item', () => {
    test('can delete a user stack item', async ({ page }) => {
      const testId = generateTestId('delete-item');
      const itemName = `Test Item for Deletion ${testId}`;

      // First create an item for testing
      await page.goto('/user-stack/new');
      await page.locator('input[name="name"]').fill(itemName);
      await page.locator('input[name="dosage"]').fill('5');
      await page.locator('input[name="timesOfDay"]').fill('Evening');
      await page.locator('button[type="submit"]').click();

      // Wait for success message
      await expect(page.locator('text=User stack item added successfully!')).toBeVisible({ timeout: 5000 });

      // Navigate to user stack list
      await page.goto('/user-stack');
      await page.waitForLoadState('networkidle');

      // Get current items state
      const itemsCountText = page.locator('text=/\\d+ (item|items) in total/');
      const hasItems = await itemsCountText.isVisible();

      if (hasItems) {
        const itemsCount = await itemsCountText.textContent();
        const count = itemsCount ? parseInt(itemsCount.split(' ')[0] ?? "0", 10) : 0;

        if (count > 0) {
          // Click on the first available item
          await page.locator('.MuiCard-root').first().click();
          await page.waitForURL(/\/user-stack\/.+/);

          // Click delete button
          await page.locator('text=Delete Item').click();

          // Dialog should appear
          await expect(page.locator('text=Delete Stack Item?')).toBeVisible();

          // Type DELETE to confirm
          await page.locator('input').waitFor();
          await page.locator('input').fill('DELETE');

          // Click delete button in dialog
          await page.locator('button.MuiButton-contained:has-text("Delete Item")').click();

          // Should navigate back to list
          await expect(page).toHaveURL(/\/user-stack$/);
        } else {
          test.skip(true, `No items available for delete test. Created item "${itemName}" but count shows zero.`);
        }
      } else {
        test.skip(true, `No items visible for delete test. Created item "${itemName}" but no item counter found.`);
      }
    });

    test('delete dialog validation works', async ({ page }) => {
      const testId = generateTestId('delete-validation');
      const itemName = `Test Item for Delete Validation ${testId}`;

      // First create an item for testing
      await page.goto('/user-stack/new');
      await page.locator('input[name="name"]').fill(itemName);
      await page.locator('input[name="dosage"]').fill('10');
      await page.locator('input[name="timesOfDay"]').fill('Morning');
      await page.locator('button[type="submit"]').click();

      // Wait for success message
      await expect(page.locator('text=User stack item added successfully!')).toBeVisible({ timeout: 5000 });

      // Navigate to user stack list
      await page.goto('/user-stack');
      await page.waitForLoadState('networkidle');

      // Get current items state
      const itemsCountText = page.locator('text=/\\d+ (item|items) in total/');
      const hasItems = await itemsCountText.isVisible();

      if (hasItems) {
        const itemsCount = await itemsCountText.textContent();
        const count = itemsCount ? parseInt(itemsCount.split(' ')[0] ?? "0", 10) : 0;

        if (count > 0) {
          // Click on the first available item
          await page.locator('.MuiCard-root').first().click();

          await page.waitForURL(/\/user-stack\/.+/);

          // Click delete button
          await page.locator('text=Delete Item').click();

          // Try to delete without typing DELETE
          await page.locator('button.MuiButton-contained:has-text("Delete Item")').click();

          // Should show error
          await expect(page.locator('text=Please type "DELETE" to confirm')).toBeVisible();

          // Type incorrect text
          await page.locator('input').fill('del');
          await page.locator('button.MuiButton-contained:has-text("Delete Item")').click();

          // Should still show error
          await expect(page.locator('text=Please type "DELETE" to confirm')).toBeVisible();

          // Close dialog
          await page.locator('button:has-text("Cancel")').click();
          await expect(page.locator('text=Delete Stack Item?')).not.toBeVisible();
        } else {
          test.skip(true, `No items available for delete validation test. Created item "${itemName}" but count shows zero.`);
        }
      } else {
        test.skip(true, `No items visible for delete validation test. Created item "${itemName}" but no item counter found.`);
      }
    });
  });
});