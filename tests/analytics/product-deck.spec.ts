import { expect, test, type Page } from "@playwright/test";

type Event = [string, string, { item_list_id?: string; items?: { item_id: string; item_category: string; index: number }[]; method?: string }];
const events = (page: Page) => page.evaluate(() =>
  (window.dataLayer || []).map(entry => Array.from(entry as ArrayLike<unknown>))
    .filter(entry => entry[0] === "event")) as Promise<Event[]>;
const deckEvents = async (page: Page) => (await events(page)).filter(entry =>
  entry[2].item_list_id?.startsWith("home_products_"));

test.beforeEach(async ({ page }) => {
  await page.route("**/*googletagmanager.com/**", route => route.fulfill({
    contentType: "application/javascript", body: "/* fake GA; no collection */",
  }));
  await page.route("**/*google-analytics.com/**", route => route.abort());
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("visible cards only, consent late acceptance, dedupe, tab and selection context", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/"); await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click(); await page.locator(".intro-screen").waitFor({ state: "detached" });
  const rail = page.getByRole("tabpanel");
  await rail.scrollIntoViewIfNeeded();
  await expect(rail.locator("a").first()).toBeInViewport({ ratio: .5 });
  expect(await deckEvents(page)).toHaveLength(0);
  await page.getByRole("button", { name: "Accept analytics" }).click();
  await expect.poll(async () => (await deckEvents(page)).filter(e => e[1] === "view_item_list").length).toBe(1);
  const first = (await deckEvents(page))[0];
  expect(first[2]).toMatchObject({ item_list_id: "home_products_popular", items: [
    { item_id: "mix", item_category: "Demo product concepts", index: 0 },
  ] });
  // An ordinary scroll/resize is not an intentional carousel interaction.
  await page.setViewportSize({ width: 391, height: 844 });
  await page.waitForTimeout(150);
  expect(await deckEvents(page)).toHaveLength(1);
  await page.getByRole("button", { name: "Next products" }).click();
  await expect.poll(async () => (await deckEvents(page)).filter(e => e[1] === "view_item_list").flatMap(e => e[2].items || []).map(i => i.item_id)).toEqual(["mix", "party"]);
  expect((await deckEvents(page)).filter(e => e[1] === "product_carousel_interaction").map(e => e[2].method)).toEqual(["button"]);
  await page.getByRole("button", { name: "Previous products" }).click();
  await page.waitForTimeout(150);
  expect((await deckEvents(page)).filter(e => e[1] === "view_item_list").length).toBe(2);
  await page.getByRole("tab", { name: "New Releases" }).click();
  await expect.poll(async () => (await deckEvents(page)).filter(e => e[1] === "view_item_list").length).toBe(3);
  await page.getByRole("tab", { name: "New Releases" }).click();
  expect((await deckEvents(page)).filter(e => e[1] === "product_collection_change")).toHaveLength(1);
  await rail.locator("a").first().click();
  expect((await deckEvents(page)).find(e => e[1] === "select_item")?.[2]).toMatchObject({
    item_list_id: "home_products_new", items: [{ item_id: "studio", index: 0, item_category: "Demo product concepts" }],
  });
});

test("offscreen acceptance, rejection, and withdrawal never replay past interactions", async ({ page }) => {
  await page.goto("/"); await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click(); await page.locator(".intro-screen").waitFor({ state: "detached" });
  await page.getByRole("button", { name: "Accept analytics" }).click();
  await page.waitForTimeout(200);
  expect(await deckEvents(page)).toHaveLength(0);
  await page.getByRole("tabpanel").scrollIntoViewIfNeeded();
  await expect.poll(async () => (await deckEvents(page)).length).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Cookie settings" }).click();
  await page.getByRole("button", { name: "Reject analytics" }).click();
  const count = (await events(page)).length;
  await page.getByRole("tab", { name: "New Releases" }).click();
  await page.getByRole("button", { name: "Next products" }).click();
  await page.waitForTimeout(150);
  expect((await events(page)).length).toBe(count);
  await page.reload();
  await page.getByRole("tabpanel").scrollIntoViewIfNeeded();
  await page.getByRole("tab", { name: "New Releases" }).click();
  expect(await events(page)).toHaveLength(0);
});

test("keyboard, slider, and completed drag count once without accidental selection", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/"); await page.getByRole("button", { name: "Stop intro and enter iDance homepage" }).click(); await page.locator(".intro-screen").waitFor({ state: "detached" });
  await page.getByRole("button", { name: "Accept analytics" }).click();
  const rail = page.getByRole("tabpanel");
  await rail.scrollIntoViewIfNeeded();
  await rail.focus();
  await rail.press("ArrowRight");
  await expect.poll(async () => (await deckEvents(page)).filter(e => e[1] === "product_carousel_interaction").length).toBe(1);
  const slider = page.getByRole("slider", { name: "Slide through products" });
  await slider.focus();
  await slider.press("End");
  await expect.poll(async () => (await deckEvents(page)).filter(e => e[1] === "product_carousel_interaction").length).toBe(2);
  await rail.scrollIntoViewIfNeeded();
  const box = await rail.boundingBox();
  if (!box) throw new Error("Missing carousel bounds");
  await page.mouse.move(box.x + 40, box.y + 80);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 30, box.y + 80, { steps: 10 });
  await page.mouse.up();
  await expect.poll(async () => (await deckEvents(page)).filter(e => e[1] === "product_carousel_interaction").map(e => e[2].method)).toEqual(["keyboard", "slider", "drag"]);
  expect((await deckEvents(page)).filter(e => e[1] === "select_item")).toHaveLength(0);
  await expect(page).toHaveURL(/\/$/);
});
