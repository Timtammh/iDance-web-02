import { test, expect } from "@playwright/test";

test("left-column category names navigate to all five major pages", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products/xd301");
  await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click();
  for (const name of ["Karaoke", "DJ", "Musical Instruments", "Interactive Board", "Apps"]) {
    await page.getByRole("button", { name: "Products", exact: true }).click();
    await page.locator('[aria-label="Product topics"]').getByRole("link", { name, exact: true }).click();
    await expect(page.getByRole("heading", { name, exact: true, level: 1 })).toBeVisible();
    await expect(page.locator('[data-category-hero]')).toBeVisible();
  }
});

test("product hero retains full width at 40 percent of its width", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/products/xd301");
    await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click();
    const box = await page.locator('article > div').first().boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs(box!.height / box!.width - 0.4)).toBeLessThan(0.002);
  }
});
