import type { Content, Product } from "../types/content";

export type MenuEntry = { label: string; unconfirmed?: boolean };
export type ProductTopic = { id: string; label: string; children: MenuEntry[] };

// These labels describe the confirmed navigation, not additional products.
// Unreadable handwritten labels remain nonclickable until they are confirmed.
export const productTopics: ProductTopic[] = [
  { id: "karaoke", label: "Karaoke", children: [
    { label: "Party Mic" }, { label: "Trolley" }, { label: "Category to confirm", unconfirmed: true },
  ] },
  { id: "ds", label: "DJ", children: [
    { label: "DJ Mixer" },
    { label: "Category to confirm", unconfirmed: true },
    { label: "Disco Lighting" },
    { label: "DEEJAY Mini Verse" },
    { label: "Pocket" },
    { label: "Lighting" },
  ] },
  { id: "musical-instruments", label: "Musical Instruments", children: [
    { label: "Guitar" }, { label: "Keyboard" }, { label: "Pocket" },
  ] },
  { id: "interactive-board", label: "Interactive Board", children: [
    { label: "My Stage" }, { label: "GrooveBrix" }, { label: "DEEJAY Mini Verse" },
  ] },
  { id: "apps", label: "Apps", children: [
    { label: "Super Rocker" }, { label: "PLAYnJAM" }, { label: "X808" },
    { label: "iKey Station" }, { label: "LIVEJAM" }, { label: "JAM HERO" },
  ] },
];

export function slugifyTopic(label: string) {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function topicHref(topicId: string) {
  return `/products?topic=${encodeURIComponent(topicId)}`;
}

export function subcategoryHref(topicId: string, label: string) {
  return `/products/category/${encodeURIComponent(topicId)}/${slugifyTopic(label)}`;
}

const normalize = (value: string) => value.trim().toLowerCase().replace(/[\s_-]+/g, " ");
type Catalogue = Pick<Content, "categories" | "products">;

/**
 * Resolve only an unambiguous category already present in the loaded content.
 * Do not guess from a product name or assign an unrelated/demo product to a
 * new branch. The parent topic only determines which confirmed labels to use.
 */
export function getTopicProducts(data: Catalogue, topic: ProductTopic, entry?: MenuEntry): Product[] {
  if (entry && (entry.unconfirmed || !topic.children.some(child => !child.unconfirmed && child.label === entry.label))) return [];
  const labels = entry ? [entry.label] : [topic.label, ...topic.children.filter(child => !child.unconfirmed).map(child => child.label)];
  const categoryIds = new Set<string>();
  for (const label of labels) {
    const name = normalize(label);
    const matches = data.categories.filter(category => normalize(category.name) === name || normalize(category.slug) === name);
    if (matches.length === 1) categoryIds.add(matches[0].id);
  }
  return data.products.filter(product => !product.demo && categoryIds.has(product.category.id));
}
