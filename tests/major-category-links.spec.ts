import { test, expect } from "@playwright/test";

test("major headings are text and old landing pages redirect", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products/xd301");
  await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click();
  await page.getByRole("button", { name: "Products", exact: true }).click();
  const menu = page.locator('[aria-label="Product categories"]');
  await expect(menu.locator("h3")).toHaveCount(5);
  await expect(menu.locator("h3 a")).toHaveCount(0);
  for (const topic of ["karaoke", "ds", "musical-instruments", "interactive-board", "apps"]) {
    await page.goto(`/products/category/${topic}`);
    await expect(page).toHaveURL(new RegExp(`products\\?topic=${topic}$`));
    await expect(page.locator('[data-category-page="major"]')).toHaveCount(0);
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
