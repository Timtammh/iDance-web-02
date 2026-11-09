import { test, expect } from "@playwright/test";
import { demoContent } from "../../src/data/demo";

const picture = { _type: "image", asset: { _type: "reference", _ref: "image-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-800x700-png" }, alt: "Published artwork" };
function fixture(overrides = true) {
  return {
    ...demoContent,
    products: demoContent.products.map(p => ({ ...p, demo: false, images: [picture] })),
    news: demoContent.news.map(p => ({ ...p, demo: false, cover: picture })),
    useCases: demoContent.useCases.map(p => ({ ...p, image: picture })),
    videos: demoContent.videos.map(p => ({ ...p, thumbnail: picture })),
    home: {
      ...demoContent.home, heroImage: picture,
      featuredProducts: [...demoContent.products].reverse().map(p => p.id),
      ...(overrides ? {
        heroVideo: "/media/editorial-video.mp4", heroPoster: picture, heroVideoLabel: "Published hero film",
        spotlight: { title: "Published spotlight", eyebrow: "EDITOR’S PICK", description: "Verified editorial copy", features: ["Verified feature"], image: picture, ctaLabel: "Meet the product" },
        newsHeading: "Latest stories", newsIntro: "Our published updates", featuredNews: [demoContent.news[1].id],
      } : {}),
    },
  };
}
for (const overrides of [true, false]) {
  test(`homepage CMS ${overrides ? "editorial overrides" : "optional field fallbacks"}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    const content = fixture(overrides);
    await page.route("**/*sanity.io/**", route => route.request().url().includes("/data/query/")
      ? route.fulfill({ contentType: "application/json", body: JSON.stringify({ result: content }) })
      : route.fulfill({ contentType: "image/svg+xml", path: "public/assets/speaker.svg" }));
    await page.route("**/media/editorial-video.mp4", route => route.abort());
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/"); await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click(); await page.locator(".intro-screen").waitFor({ state: "detached" });
    await page.getByRole("button", { name: "Reject analytics" }).click();
    const selected = demoContent.products.at(-1)!;
    const spotlight = page.locator("[data-featured]");
    await expect(spotlight.getByRole("heading")).toHaveText(overrides ? "Published spotlight" : selected.name);
    await expect(spotlight.getByRole("link")).toHaveAttribute("href", `/products/${selected.slug}`);
    await expect(spotlight.locator("img")).toHaveAttribute("src", /cdn.sanity.io/);
    await expect(page.locator("#news")).not.toContainText("PLACEHOLDER");
    await expect(page.locator("#news")).not.toContainText("DEMO");
    if (overrides) {
      await expect(page.locator("[data-hero] video")).toHaveAttribute("src", "/media/editorial-video.mp4");
      await expect(page.locator("[data-hero] img")).toHaveAttribute("alt", "Published hero film");
      await expect(page.locator("#news article")).toHaveCount(1);
      await expect(page.locator("#news h3 a")).toHaveAttribute("href", `/news/${demoContent.news[1].slug}`);
      await expect(page.getByRole("heading", { name: "Latest stories" })).toBeVisible();
    } else {
      await expect(page.locator("[data-hero] video")).toHaveAttribute("src", "/media/DJX101EV2-10MB.mp4");
      await expect(page.locator("#news article")).toHaveCount(Math.min(3, demoContent.news.length));
    }
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.getByRole("link", { name: "About", exact: true }).click();
    await page.getByRole("link", { name: "iDance home" }).click();
    await expect(spotlight.getByRole("heading")).toHaveText(overrides ? "Published spotlight" : selected.name);
    expect(errors).toEqual([]);
  });
}
