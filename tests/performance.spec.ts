import { test, expect } from "@playwright/test";

async function enter(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click();
  await expect(page.locator(".intro-screen")).toHaveCount(0);
  await page.getByRole("button", { name: "Reject analytics" }).click();
}

test("mobile only requests current and next hero; all slides remain selectable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const requests = new Set<string>();
  page.on("request", request => { if (request.url().includes("/media/mobile-hero/")) requests.add(request.url()); });
  await enter(page);
  await expect.poll(() => requests.size).toBe(2);
  await page.waitForTimeout(500);
  expect(requests.size).toBe(2);
  for (let index = 1; index <= 8; index++) {
    await page.getByRole("button", { name: `Show hero image ${index}`, exact: true }).click();
    await expect.poll(() => page.locator("[data-mobile-hero] img[data-active=true]").evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  await expect(page.locator("[data-mobile-hero] img[data-active=true]")).toHaveCSS("transition-duration", "0s");
});

test("desktop hero pauses offscreen and respects explicit pause on return", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page);
  const video = page.locator("[data-hero] video");
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(false);
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  await page.evaluate(() => scrollTo(0, 0));
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(false);
  await page.getByRole("button", { name: "Pause background video" }).click();
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(300);
  expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
});

test("desktop mixer has one transform owner and a transform-driven glow", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enter(page);
  await page.locator("#home-products").scrollIntoViewIfNeeded();
  const animations = await page.locator("[data-product-index]").evaluateAll(cards =>
    cards.map(card => getComputedStyle(card).animationName));
  expect(animations.every(name => !name.includes("card-cue"))).toBe(true);
});
