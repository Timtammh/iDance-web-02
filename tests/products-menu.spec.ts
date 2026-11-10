import { test, expect, type Page } from "@playwright/test";

async function openSite(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click();
  await expect(page.locator(".intro-screen")).toHaveCount(0);
  await page.getByRole("button", { name: "Reject analytics" }).click();
}

test("desktop hover opens the full-width menu, switches all five topics and closes on leave", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openSite(page);
  const trigger = page.getByRole("button", { name: "Products", exact: true });
  await trigger.hover();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const panel = page.locator('[aria-label="Product categories"]');
  const bounds = await panel.boundingBox();
  const header = await page.locator(".header").boundingBox();
  expect(bounds!.x).toBe(0);
  expect(bounds!.width).toBe(1440);
  expect(bounds!.y).toBe(header!.y + header!.height);
  await expect(page.getByRole("region", { name: "Karaoke", exact: true })).toContainText("Party Mic");
  await expect(page.getByRole("region", { name: "Karaoke", exact: true })).toContainText("Trolley");
  await expect(page.getByRole("region", { name: "Karaoke", exact: true })).toContainText("Category to confirm");
  for (const [topic, children] of [
    ["DJ", ["Category to confirm", "Disco Lighting", "DEEJAY Mini Verse", "Pocket", "Lighting"]],
    ["Musical Instruments", ["Guitar", "Keyboard", "Pocket"]],
    ["Interactive Board", ["My Stage", "GrooveBrix", "DEEJAY Mini Verse"]],
    ["Apps", ["Page pending."]],
  ] as const) {
    await page.getByRole("button", { name: topic, exact: true }).hover();
    const region = page.getByRole("region", { name: topic, exact: true });
    await expect(region).toBeVisible();
    for (const child of children) await expect(region).toContainText(child);
    await expect(region.getByRole("link")).toHaveCount(0);
  }
  await expect(panel.getByText("Headphone", { exact: true })).toHaveCount(0);
  await expect(panel.locator("[data-product-image-placeholder]")).toBeEmpty();
  await expect(panel.locator("img")).toHaveCount(0);
  await page.mouse.move(1400, 800);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toBeHidden();
});

test("desktop click toggle, keyboard arrows, Escape, focus exit and interruption work repeatedly", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openSite(page);
  const trigger = page.getByRole("button", { name: "Products", exact: true });
  for (let pass = 0; pass < 2; pass++) {
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  }
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("button", { name: "Karaoke", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("button", { name: "DJ", exact: true })).toBeFocused();
  await expect(page.getByRole("region", { name: "DJ", exact: true })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("region", { name: "DJ", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("button", { name: "DJ", exact: true })).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("button", { name: "Apps", exact: true })).toBeFocused();
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("link", { name: "All Karaoke" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "About", exact: true })).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.focus();
  await page.keyboard.press("ArrowUp");
  await expect(page.getByRole("button", { name: "Apps", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await page.locator("[data-product-image-placeholder]").click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.locator(".header .wordmark").click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await page.getByRole("button", { name: "Search products", exact: true }).click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await trigger.click();
  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.goBack();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("only existing catalogue destinations are linked and submenu navigation closes the panel", async ({ page }) => {
  await openSite(page);
  const trigger = page.getByRole("button", { name: "Products", exact: true });
  await trigger.click();
  const panel = page.locator('[aria-label="Product categories"]');
  await expect(panel.getByRole("link")).toHaveCount(2);
  await expect(panel.getByRole("link", { name: "All Karaoke" })).toHaveAttribute("href", "/products?category=karaoke");
  await panel.getByRole("link", { name: "All Karaoke" }).click();
  await expect(page).toHaveURL(/\/products\?category=karaoke$/);
  await expect(page.getByText("1 products", { exact: true })).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await panel.getByRole("link", { name: "All products", exact: true }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByText("4 products", { exact: true })).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("mobile accordion retains the modal focus trap, pending labels and valid category navigation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openSite(page);
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.click();
  const dialog = page.getByRole("dialog");
  const products = dialog.getByRole("button", { name: "Products", exact: true });
  await products.click();
  await expect(products).toHaveAttribute("aria-expanded", "true");
  await dialog.getByRole("button", { name: "DJ", exact: true }).click();
  const dsContent = dialog.locator('[id$="-ds"]');
  await expect(dsContent.getByText("Category to confirm", { exact: false })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Pocket", exact: true })).toHaveCount(0);
  await dialog.getByRole("button", { name: "Musical Instruments", exact: true }).click();
  await expect(dialog.getByText("Guitar", { exact: false })).toBeVisible();
  await expect(dsContent.getByText("Category to confirm", { exact: false })).toBeHidden();
  await expect(dialog.getByRole("button", { name: "Apps", exact: true })).toHaveCount(0);
  await expect(dialog.getByText("Apps", { exact: false })).toBeVisible();
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  }
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await menu.click();
  await expect(products).toHaveAttribute("aria-expanded", "false");
  await products.click();
  await dialog.getByRole("button", { name: "Karaoke", exact: true }).click();
  await expect(dialog.getByText("Trolley", { exact: false })).toBeVisible();
  await dialog.getByRole("link", { name: "All Karaoke" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/products\?category=karaoke$/);
  await expect(page.getByText("1 products", { exact: true })).toBeVisible();
});

test("desktop resize closes the hidden panel and compact tablet widths do not overflow", async ({ page }) => {
  await openSite(page);
  const trigger = page.getByRole("button", { name: "Products", exact: true });
  for (const width of [768, 1024, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.keyboard.press("Escape");
  }
  await trigger.click();
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(trigger).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});
