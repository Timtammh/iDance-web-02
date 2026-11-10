import { test, expect } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`CTA entrance has one transform owner at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click();
    await page.getByRole("button", { name: "Reject analytics" }).click();
    const cta = page.locator("[data-brand-cta]");
    await expect(cta.locator("[data-cta-reveal]")).toHaveCount(3);
    await expect(cta.locator("a[data-cta-reveal]")).toHaveCount(0);
    const state = await page.evaluate(async () => {
      const path = "/src/lib/motion/gsap.ts";
      const { ScrollTrigger } = await import(/* @vite-ignore */ path);
      const cta = document.querySelector("[data-brand-cta]");
      const trigger = ScrollTrigger.getAll().find((t: { trigger: Element }) => t.trigger === cta);
      const animation = trigger.animation;
      animation.pause().progress(0.4);
      const headline = cta!.querySelector("h2")!;
      const matrix = new DOMMatrixReadOnly(getComputedStyle(headline).transform);
      return {
        scaleX: matrix.a,
        scaleY: matrix.d,
        linkTransforms: Array.from(cta!.querySelectorAll("a")).map(a => a.style.transform),
        targets: Array.from(cta!.querySelectorAll("[data-cta-reveal]")).map(el => getComputedStyle(el).transitionProperty),
      };
    });
    expect(state.scaleX).toBe(1);
    expect(state.scaleY).toBe(1);
    expect(state.linkTransforms).toEqual(["", ""]);
    expect(state.targets.every(property => property !== "transform")).toBe(true);
    // Focus ends the entrance so the control never moves away from keyboard users.
    await cta.getByRole("link", { name: "Explore products" }).focus();
    await expect(cta.locator(".button-row")).toHaveCSS("transform", "none");
    await expect(cta.locator("h2")).toHaveCSS("opacity", "1");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(cta.locator("h2")).toHaveCSS("transform", "none");
    await expect(cta.locator(".button-row")).toHaveCSS("transform", "none");
    await expect(cta.getByRole("link", { name: "Explore products" })).toHaveAttribute("href", "/products");
    await expect(cta.getByRole("link", { name: "Let’s talk" })).toHaveAttribute("href", "/contact");
  });
}
