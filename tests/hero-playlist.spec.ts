import { test, expect } from "@playwright/test";

test("original intro is separate from the homepage XD301-first playlist", async ({ page }) => {
  await page.goto("/");
  const intro = page.locator(".intro-screen video");
  await expect.poll(() => intro.evaluate((v: HTMLVideoElement) => v.currentSrc)).toMatch(/\/intro(?:-|\.mp4)/);
  await expect(intro.locator("source")).toHaveCount(2);
  await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click();
  await expect(page.locator(".intro-screen")).toHaveCount(0);
  const hero = page.locator("[data-hero] video");
  await expect(hero).toHaveAttribute("src", "/media/XD301_EN_10MB.mp4");
  await expect.poll(() => hero.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Play DJX101E video" }).click();
  await expect(hero).toHaveAttribute("src", "/media/DJX101EV2-10MB.mp4");
  await page.getByRole("button", { name: "Pause background video", exact: true }).click();
  await expect.poll(() => hero.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.getByRole("button", { name: "Play background video", exact: true }).click();
  await hero.dispatchEvent("ended");
  await expect(hero).toHaveAttribute("src", "/media/XD301_EN_10MB.mp4");
});

test("mobile preserves original mobile intro and product image carousel", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect.poll(() => page.locator(".intro-screen video").evaluate((v: HTMLVideoElement) => v.currentSrc)).toContain("intro-mobile");
  await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click();
  await expect(page.locator("[data-mobile-hero]")).toBeVisible();
  await expect(page.locator("[data-hero] video")).toHaveCount(0);
});
