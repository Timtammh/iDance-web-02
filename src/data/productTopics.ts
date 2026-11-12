import type { Content, Product } from "../types/content";

export type MenuEntry = { label: string; displayLabel?: string; unconfirmed?: boolean };
export type ProductTopic = { id: string; label: string; catalogueLabels?: string[]; children: MenuEntry[] };

// Navigation labels follow the supplied taxonomy; display labels preserve its casing.
export const productTopics: ProductTopic[] = [
  { id: "karaoke", label: "Karaoke", children: [
    { label: "Party Mic", displayLabel: "PARTY MIC" },
    { label: "Party Ball", displayLabel: "PARTY BALL" },
    { label: "Portable", displayLabel: "PORTABLE" },
    { label: "Trolley", displayLabel: "TROLLEY" },
    { label: "Boombox", displayLabel: "BOOMBOX" },
    { label: "Pedestal", displayLabel: "PEDESTAL" },
    { label: "High Power", displayLabel: "HIGH POWER" },
    { label: "Video Projector", displayLabel: "VIDEO PROJECTOR" },
  ] },
  { id: "ds", label: "DJ", children: [
    { label: "DJ Station", displayLabel: "DJ STATION" },
    { label: "Sound Pads", displayLabel: "SOUNDPADS" },
    { label: "Master Mix", displayLabel: "MASTER MIX" },
    { label: "iPAD CONTROLLER" },
    { label: "Turntable", displayLabel: "TURNTABLE" },
    { label: "DEEJAY Mini Verse", displayLabel: "DEEJAY mini VERSE" },
    { label: "Disco Lighting", displayLabel: "DISCO LIGHTING" },
  ] },
  { id: "musical-instruments", label: "Musical Instruments", children: [
    { label: "Guitar", displayLabel: "GUITAR" },
    { label: "Keyboard", displayLabel: "KEYBOARD" },
    { label: "Pocket", displayLabel: "POCKET" },
    { label: "Drums", displayLabel: "DRUMS" },
  ] },
  { id: "interactive-board", label: "Interactive Board", children: [
    { label: "My Stage", displayLabel: "mySTAGE" },
    { label: "GrooveBrix" },
    { label: "DEEJAY Mini Verse", displayLabel: "DEEJAY mini VERSE" },
    { label: "PLAYCUBE" },
  ] },
  { id: "k-pop", label: "K-POP", children: [] },
  { id: "apps", label: "Apps", children: [
    { label: "iKey Station" }, { label: "JAM HERO" }, { label: "LIVEJAM" },
    { label: "PLAYnJAM" }, { label: "Super Rocker" }, { label: "X808" },
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
  const labels = entry ? [entry.label] : [topic.label, ...(topic.catalogueLabels ?? []), ...topic.children.filter(child => !child.unconfirmed).map(child => child.label)];
  const categoryIds = new Set<string>();
  for (const label of labels) {
    const name = normalize(label);
    const matches = data.categories.filter(category => normalize(category.name) === name || normalize(category.slug) === name);
    if (matches.length === 1) categoryIds.add(matches[0].id);
  }
  return data.products.filter(product => !product.demo && categoryIds.has(product.category.id));
}
