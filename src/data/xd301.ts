import type { Category, Product } from "../types/content";

// Verified against the supplied XD301(BK) giftbox artwork, revision16-07-2026.
// Uses the existing Sanity product/category shape; no invented commercial data.
export const djStationCategory: Category = { id: "dj-station", slug: "dj-station", name: "DJ Station" };
export const xd301: Product = {
  id: "xd301", name: "XD301", slug: "xd301", category: djStationCategory,
  summary: "Your mix. Your moment. Mix, scratch and play with the iDance XD301 portable DJ station.",
  productVideo: "/media/XD301_EN_10MB.mp4", itemNumber: "XD301(BK)", colour: "Black",
  campaignImage: { url: "/media/xd301-colour-hero.png", alt: "Supplied XD301 close-up campaign image with pink and blue lighting on a dark textured background" },
  images: [
    { url: "/media/xd301-angled-preview.png", alt: "Angled preview rendering of the iDance XD301 portable DJ station" },
    { url: "/media/xd301-original.jpg", alt: "Original supplied XD301 product image showing both turntables, sound pads and controls" },
  ],
  description: [{ _type: "block", _key: "xd301-intro", style: "normal", markDefs: [], children: [
    { _type: "span", _key: "text", text: "Take control with dual turntables, a crossfader and pitch controls. Trigger LED sound pads, add effects with Space Control and make the mix your own.", marks: [] },
  ] }],
  features: [
    "Dual turntables",
    "16 LED sound pads",
    "Gesture-controlled Space Control",
    "Crossfader",
    "Rechargeable battery",
    "Pitch bend",
  ],
  specifications: [
    { label: "Model", value: "XD301(BK)" },
    { label: "Product type", value: "Portable DJ station" },
    { label: "Playback", value: "Bluetooth · USB/MP3" },
    { label: "Audio connections", value: "Microphone / AUX input · Headphone connection" },
    { label: "Power", value: "Rechargeable battery" },
  ],
  isPopular: false, isNew: false,
  seo: { title: "XD301 Portable DJ Station", description: "Meet the iDance XD301: dual turntables,16 LED sound pads, Space Control and a rechargeable battery. Explore features and enquire." },
};
