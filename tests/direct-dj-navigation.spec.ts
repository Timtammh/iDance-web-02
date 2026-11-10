import { test, expect } from "@playwright/test";

test("DJ Mixer bypasses its former listing and preserves other categories", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click();
  await page.getByRole("button", { name: "Products", exact: true }).press("ArrowDown");
  await page.locator('[aria-label="Product categories"]').getByRole("link", { name: "DJ Mixer", exact: true }).click();
  await expect(page).toHaveURL(/\/products\/xd301$/);
  await expect(page.getByRole("heading", { name: "DEEJAY | DJ", exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "DJ product categories" }).getByRole("link", { name: "DJ", exact: true })).toHaveAttribute("href", "/products/xd301");
  await expect(page.getByRole("navigation", { name: "DJ product categories" }).getByRole("link", { name: "Pocket", exact: true })).toHaveAttribute("href", "/products/category/ds/pocket");
  await page.goto("/products/category/ds/dj-mixer");
  await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click();
  await expect(page).toHaveURL(/\/products\/xd301$/);
});
