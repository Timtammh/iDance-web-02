import { test, expect } from "@playwright/test";

test("intro plays, slides main upward, and repeated skip stays safe", async ({ page }) => {
  await page.goto("/");
  const video = page.locator(".intro-screen video");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click();
  await expect(page.locator(".intro-site-entering")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".intro-screen")).toHaveCount(0);
  await expect(page.locator(".intro-site")).toBeFocused();
  await expect(page.locator("main")).toBeVisible();
});

test("reduced motion is still and keyboard entry preserves a deep link", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about");
  await expect.poll(() => page.locator(".intro-screen video").evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator(".intro-screen")).toHaveCount(0);
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator(".intro-site")).toHaveCSS("transform", "none");
});
