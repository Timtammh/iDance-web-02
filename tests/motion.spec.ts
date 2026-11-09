import { test, expect, type Page } from "@playwright/test";

async function openHome(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click();
  await expect(page.locator(".intro-screen")).toHaveCount(0);
  await page.getByRole("button", { name: "Reject analytics" }).click();
  await expect(page.locator("[data-hero]")).toBeVisible();
}

async function motionState(page: Page) {
  return page.evaluate(async () => {
    const path = "/src/lib/motion/gsap.ts";
    const { gsap, ScrollTrigger } = await import(/* @vite-ignore */ path);
    const loops = gsap.globalTimeline.getChildren(true, true, true)
      .filter((a: { repeat: () => number }) => a.repeat() === -1);
    return {
      triggers: ScrollTrigger.getAll().length,
      scrubs: ScrollTrigger.getAll().filter((s: { vars: { scrub?: unknown } }) => s.vars.scrub).length,
      loops: loops.length,
      playing: loops.filter((a: { paused: () => boolean }) => !a.paused()).length,
      detached: ScrollTrigger.getAll().filter((s: { trigger?: Element }) => s.trigger && !s.trigger.isConnected).length,
    };
  });
}

test("current homepage choreography has real targets and cleans up on route and tab changes", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", e => problems.push(e.message));
  page.on("console", m => { if (m.type() === "warning") problems.push(m.text()); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  const baseline = await motionState(page);
  expect(baseline.scrubs).toBeGreaterThan(0);
  expect(baseline.detached).toBe(0);
  expect(await page.locator("[data-scene]").count()).toBeGreaterThan(0);
  expect(await page.locator("#home-products [data-product-index]").count()).toBeGreaterThan(0);

  await page.locator(".video-grid").scrollIntoViewIfNeeded();
  await expect.poll(async () => (await motionState(page)).playing).toBeGreaterThan(0);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(async () => (await motionState(page)).playing).toBe(0);
  await page.evaluate(() => {
    delete (document as unknown as { hidden?: boolean }).hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(async () => (await motionState(page)).playing).toBeGreaterThan(0);
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await expect.poll(async () => (await motionState(page)).playing).toBe(0);

  for (let i = 0; i < 3; i++) {
    await page.getByRole("link", { name: "About", exact: true }).click();
    await expect(page.locator(".page h1")).toBeVisible();
    await expect.poll(async () => (await motionState(page)).scrubs).toBe(0);
    expect((await motionState(page)).loops).toBe(0);
    expect((await motionState(page)).detached).toBe(0);
    await page.getByRole("link", { name: "iDance home" }).click();
    await expect.poll(async () => (await motionState(page)).scrubs).toBeGreaterThan(0);
    expect((await motionState(page)).triggers).toBeLessThanOrEqual(baseline.triggers);
    expect((await motionState(page)).loops).toBe(baseline.loops);
  }
  for (let i = 0; i < 6; i++) {
    await page.getByRole("tab", { name: i % 2 ? "Popular" : "New Releases", exact: true }).click();
    expect((await motionState(page)).detached).toBe(0);
    expect((await motionState(page)).triggers).toBeLessThanOrEqual(baseline.triggers);
  }
  expect(problems).toEqual([]);
});

test("mobile and reduced motion keep hero and all controls readable without continuous effects", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openHome(page);
  expect((await motionState(page)).loops).toBe(0);
  expect((await motionState(page)).scrubs).toBe(0);
  await expect(page.locator("[data-mobile-hero] img")).toHaveCount(8);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(async () => (await motionState(page)).triggers).toBe(0);
  expect((await motionState(page)).loops).toBe(0);
  await expect(page.locator("[data-scene]").first()).toHaveCSS("opacity", "1");
  await page.getByRole("tab", { name: "New Releases" }).click();
  await expect(page.locator("#home-products [data-product-index]").first()).toContainText("Sing Creator Studio");
  await expect(page.locator("#home-products [data-product-index]").first()).toHaveCSS("transform", "none");
  await page.setViewportSize({ width: 1440, height: 900 });
  expect((await motionState(page)).scrubs).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(async () => (await motionState(page)).scrubs).toBeGreaterThan(0);
  const frame = await page.locator("[data-hero]").boundingBox();
  expect(frame!.width / frame!.height).toBeCloseTo(16 / 9, 2);
});

test("mixer cards lift, follow pointer, reset on leave, and support focus during entrance", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  const card = page.locator("#home-products [data-product-index]").first();
  await card.focus();
  await expect(card).toHaveCSS("opacity", "1");
  await expect(card).toHaveCSS("transform", "none");
  await card.hover();
  const hoverState = () => page.evaluate(async () => {
    const path = "/src/lib/motion/gsap.ts";
    const { gsap } = await import(/* @vite-ignore */ path);
    const card = document.querySelector("#home-products [data-product-index]")!;
    return {
      y: Number(gsap.getProperty(card.firstElementChild, "y")),
      scale: Number(gsap.getProperty(card.querySelector("img"), "scaleX")),
      tilt: Number(gsap.getProperty(card.firstElementChild, "rotationY")),
    };
  });
  await expect.poll(async () => (await hoverState()).y).toBeCloseTo(-9, 1);
  await expect.poll(async () => (await hoverState()).scale).toBeCloseTo(1.09, 2);
  const rect = await card.boundingBox();
  await page.mouse.move(rect!.x + rect!.width * 0.8, rect!.y + rect!.height * 0.3);
  await expect.poll(async () => Math.abs((await hoverState()).tilt)).toBeGreaterThan(0.5);
  await page.locator("#tab-popular").focus();
  await page.mouse.move(10, 100);
  await expect.poll(async () => (await hoverState()).y).toBeCloseTo(0, 1);
  await expect.poll(async () => (await hoverState()).tilt).toBeCloseTo(0, 1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(card.locator(":scope > div")).toHaveCSS("transform", "none");
});

test("partial animation setup failure restores visible scene cards and working links", async ({ page }) => {
  const warnings: string[] = [];
  page.on("console", m => { if (m.type() === "warning") warnings.push(m.text()); });
  await page.route("**/src/hooks/useHomeMotion.ts*", async route => {
    const response = await route.fetch();
    const source = await response.text();
    expect(source).toContain("const featured =");
    await route.fulfill({ response, body: source.replace("const featured =", 'throw new Error("Injected animation setup failure");\nconst featured =') });
  });
  await openHome(page);
  expect(warnings.some(w => w.includes("Motion unavailable"))).toBe(true);
  const scene = page.locator("[data-scene]").first();
  await expect(scene).toHaveCSS("opacity", "1");
  await expect(scene).toHaveCSS("transform", "none");
  await scene.click();
  await expect(page).toHaveURL(/\/products\?category=/);
});

test("interior pages keep focused fields still and fast navigation leaves no stale motion", async ({ page }) => {
  await openHome(page);
  await page.getByRole("link", { name: "Contact", exact: true }).click();
  const name = page.getByLabel("Your name");
  await name.focus();
  await expect(page.locator("form .field").first()).toHaveCSS("opacity", "1");
  await expect(page.locator("form .field").first()).toHaveCSS("transform", "none");
  await name.fill("Test visitor");
  await page.getByRole("link", { name: "Products", exact: true }).click();
  await expect(page.locator(".product-card").first()).toBeVisible();
  await page.getByRole("link", { name: "TV", exact: true }).click();
  await expect(page.locator(".page h1")).toContainText("See it.");
  expect((await motionState(page)).scrubs).toBe(0);
  expect((await motionState(page)).detached).toBe(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(async () => (await motionState(page)).triggers).toBe(0);
});
