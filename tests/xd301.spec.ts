import { test, expect } from "@playwright/test";

test("XD301 catalogue, gallery and enquiry route", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products?category=dj-mixer");
  const intro = page.getByRole("button", { name: "Stop intro and enter iDance homepage" });
  if (await intro.isVisible()) await intro.click();
  await expect(page.locator(".result-count")).toHaveText("1 product");
  await page.locator(".product-card").click();
  await expect(page).toHaveURL(/\/products\/xd301$/);
  await expect(page.getByRole("heading", { name: "XD301", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "View image 2", exact: true }).click();
  await expect(page.locator("#ProductImage img").first()).toHaveAttribute("src", "/media/xd301-original.jpg");
  await page.getByRole("link", { name: "Enquire about this product" }).click();
  await expect(page.getByLabel("Subject", { exact: true })).toHaveValue("Product enquiry: XD301");
});
