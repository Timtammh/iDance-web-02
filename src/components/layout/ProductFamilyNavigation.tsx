import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Grid2X2, Disc3, Music2, Radio, Lightbulb } from "lucide-react";
import { useContent } from "../../hooks/useContent";
import { getTopicProducts, productTopics, subcategoryHref, topicHref } from "../../data/productTopics";
import type { Product } from "../../types/content";
import styles from "./ProductFamilyNavigation.module.css";

// Presentation labels can differ from catalogue names without changing routes.
const djNavigation = [
  { label: "All", entry: undefined, icon: Grid2X2 },
  { label: "Mixer", entry: "DJ Mixer", icon: Disc3 },
  { label: "DEEJAY Mini Verse", entry: "DEEJAY Mini Verse", icon: Music2 },
  { label: "Pocket", entry: "Pocket", icon: Radio },
  { label: "Lighting", entry: "Lighting", icon: Lightbulb },
];

export function ProductFamilyNavigation({ product, topicId = "ds", activeEntry }: { product?: Product; topicId?: string; activeEntry?: string }) {
  const data = useContent();
  const [params] = useSearchParams();
  const allSelected = params.get("collection") === "all" && params.get("topic") === topicId;
  const topic = productTopics.find(item => item.id === topicId)!;
  const selected = allSelected ? undefined : activeEntry ?? (product ? "DJ Mixer" : undefined);
  const entry = topic.children.find(item => !item.unconfirmed && item.label === selected);
  const products = getTopicProducts(data, topic, entry);
  // A product detail supplies its current product; category pages never borrow it.
  const siblings = product && !activeEntry && !products.some(item => item.id === product.id) ? [product, ...products] : products;
  const navigation = topic.id === "ds" ? [...djNavigation.slice(0, 2), { label: "Disco Lighting", entry: "Disco Lighting", icon: Lightbulb }, ...djNavigation.slice(2)] : [{ label: "All", entry: undefined, icon: Grid2X2 }, ...topic.children.filter(item => !item.unconfirmed).map(item => ({label: item.label, entry: item.label, icon: Music2}))];
  return <section className={styles.navigator} aria-labelledby="product-family-title">
    <div className={styles.heading}><span className={styles.eyebrow}>EXPLORE THE COLLECTION</span><h2 id="product-family-title" className={styles.title}>{topic.id === "ds" ? <>DEEJAY <span>|</span> DJ</> : topic.label}</h2></div>
    <nav aria-label={`${topic.label} product categories`} className={styles.categories}>
      {navigation.map(item => <Link key={item.label} className={styles.categoryTile} data-active={item.entry === selected}
        aria-current={item.entry === selected ? "page" : undefined} to={item.entry ? subcategoryHref(topic.id, item.entry) : topicHref(topic.id)}><item.icon size={24} strokeWidth={1.4} aria-hidden="true"/><span>{item.label}</span><ArrowUpRight className={styles.categoryArrow} size={15} aria-hidden="true"/></Link>)}
    </nav>
    {siblings.length > 0 && <nav aria-label={`${topic.label} products`} className={styles.products}>
      {siblings.map(item => <Link key={item.id} to={`/products/${encodeURIComponent(item.slug)}${allSelected ? `?topic=${encodeURIComponent(topicId)}&collection=all` : ""}`}
        className={styles.productTile} aria-current={item.id === product?.id ? "page" : undefined}>{item.images[0] && <img src={item.images[0].url} alt="" width={110} height={80} loading="eager"/>}<span className={styles.productLabel}><strong>{item.name}</strong><span className={styles.productAction}>View product <ArrowUpRight size={14} aria-hidden="true"/></span></span></Link>)}
    </nav>}
    {siblings.length === 0 && <div className={styles.pendingProducts}><span>{selected || topic.label}</span><p>Coming Soon</p></div>}
  </section>;
}
