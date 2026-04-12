import { test, expect } from "@playwright/test";

/**
 * Network is mocked so this never writes to site-content.ts or disk.
 * Validates the guided wizard UX for regressions (steps, publish, hero guidance).
 */
test.describe("Admin project wizard", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/admin/content/projects", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            project: { slug: "e2e-wizard-slug" },
          }),
        });
        return;
      }
      await route.continue();
    });
  });

  test("walks basics → case study → publish without 500s", async ({ page }) => {
    await page.goto("/admin/projects/new");

    await page.locator('input[name="slug"]').fill("e2e-wizard-slug");
    await page.locator('input[name="title"]').fill("E2E Title");
    await page.locator('input[name="tag"]').fill("Tag");
    await page
      .locator('textarea[name="blurb"]')
      .fill(
        "Blurb text long enough for the form and under two hundred chars total for validation rules in the app.",
      );

    await page.getByRole("button", { name: /continue/i }).click();

    await page.locator('input[name="subtitle"]').fill("Sub");
    await page.locator('textarea[name="problem"]').fill("P");
    await page.locator('textarea[name="approach"]').fill("A");
    await page.locator('textarea[name="constraints"]').fill("C");
    await page.locator('textarea[name="outcome"]').fill("O");

    await page.getByRole("button", { name: /continue/i }).click();

    await page.getByRole("button", { name: /publish project/i }).click();

    await expect(
      page.getByText(/Project and case study are saved/i),
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page.getByRole("heading", { name: /hero image/i }),
    ).toBeVisible();
  });
});
