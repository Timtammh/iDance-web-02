import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { PictureView } from "../components/ui/ContentCards";
import { useContent } from "../hooks/useContent";
import { usePage } from "../hooks/usePage";
import {
  getTopicProducts,
  productTopics,
  slugifyTopic,
  subcategoryHref,
  topicHref,
  type MenuEntry,
  type ProductTopic,
} from "../data/productTopics";
import { item, track } from "../lib/analytics";
import type { Product } from "../types/content";
import styles from "./Categories.module.css";

// Existing campaign artwork only: these banners do not add catalogue products.
const categoryArtwork: Record<string, { url: string; alt: string; contain?: boolean }> = {
  karaoke: { url: "/media/mobile-hero/01-speaker-and-microphone.webp", alt: "iDance karaoke speaker and microphone", contain: true },
  ds: { url: "/media/mixer-hero-v2-poster.jpg", alt: "Close-up of an illuminated iDance DJ mixer" },
  "musical-instruments": { url: "/media/mobile-hero/08-pocket-chord.webp", alt: "iDance Pocket Chord musical instrument", contain: true },
};

function CategoryHero({ topic }: { topic: ProductTopic }) {
  const artwork = categoryArtwork[topic.id];
  return <div className={`${styles.hero} ${artwork?.contain ? styles.heroContained : ""}`} data-category-hero>
    {artwork ? <PictureView picture={artwork} priority /> :
      <img src="/assets/equalizer-texture.svg" alt="" width="960" height="380" className={styles.heroTexture} />}
  </div>;
}

function Breadcrumbs({ topic, entry }: { topic: ProductTopic; entry?: MenuEntry }) {
  return <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
    <ol>
      <li><Link to="/products">Products</Link></li>
      <li><ChevronRight size={13} aria-hidden="true" />{entry
        ? <Link to={topicHref(topic.id)}>{topic.label}</Link>
        : <span aria-current="page">{topic.label}</span>}</li>
      {entry && <li><ChevronRight size={13} aria-hidden="true" /><span aria-current="page">{entry.label}</span></li>}
    </ol>
  </nav>;
}

function ColourDots({ products }: { products: Product[] }) {
  const colours = [...new Set(products.map(product => product.colour?.trim()).filter((colour): colour is string => !!colour))];
  const palette: Record<string, string> = { black: "#111", white: "#fff", red: "#c53737", blue: "#306bc0", pink: "#e66ea5", silver: "#b9bec5", grey: "#858585", gray: "#858585" };
  return <div className={styles.colourDots} aria-label={colours.length ? `Colours: ${colours.join(", ")}` : "Colour details coming soon"}>
    {colours.length ? colours.map(colour => <span key={colour} className={styles.colourDot} style={{ backgroundColor: palette[colour.toLowerCase()] || "#ddd" }} title={colour} />) :
      <span className={`${styles.colourDot} ${styles.colourPending}`} title="Colour details coming soon" />}
  </div>;
}

function CategoryCard({ topic, entry, products }: { topic: ProductTopic; entry: MenuEntry; products: Product[] }) {
  const picture = products.find(product => product.images.length > 0)?.images[0];
  const content = <>
    <div className={styles.cardImage}>
      {picture ? <PictureView picture={picture} /> : <div className={styles.placeholder} aria-hidden="true">
        <span className={styles.placeholderEyebrow}>{topic.label}</span>
        <span className={styles.placeholderTitle}>{entry.label}</span>
      </div>}
    </div>
    <ColourDots products={products} />
    <p className={styles.productCategory}>{topic.label}</p>
    <div className={styles.cardHeading}>
      <h2 className={styles.cardTitle}>{entry.label}</h2>
      {!entry.unconfirmed && <ArrowRight size={20} aria-hidden="true" />}
    </div>
    <p className={styles.cardCaption}>{entry.unconfirmed
      ? "Category name awaiting confirmation"
      : products.length ? `${products.length} ${products.length === 1 ? "product" : "products"}`
        : "Product details coming soon"}</p>
  </>;
  return <li>{entry.unconfirmed
    ? <div className={`${styles.card} ${styles.pendingCard}`} aria-disabled="true">{content}</div>
    : <Link className={styles.card} to={subcategoryHref(topic.id, entry.label)}>{content}</Link>}
  </li>;
}

function ProductTile({ product, listId }: { product: Product; listId: string }) {
  return <li><Link className={styles.card} to={`/products/${encodeURIComponent(product.slug)}`}
    onClick={() => track("select_item", { item_list_id: listId, items: [item(product)] })}>
    <div className={styles.cardImage}>
      {product.images[0] ? <PictureView picture={product.images[0]} /> : <div className={styles.placeholder}>
        <span className={styles.placeholderTitle}>Image coming soon</span>
      </div>}
    </div>
    <ColourDots products={[product]} />
    <p className={styles.productCategory}>{product.category.name}</p>
    <h2 className={styles.cardTitle}>{product.name}</h2>
    <p className={styles.cardCaption}>{product.summary}</p>
  </Link></li>;
}

function ProductGrid({ products, listId }: { products: Product[]; listId: string }) {
  const seen = useRef("");
  useEffect(() => {
    const key = `${listId}:${products.map(product => product.id).join(",")}`;
    if (!products.length || seen.current === key) return;
    seen.current = key;
    track("view_item_list", { item_list_id: listId, items: products.map(item) });
  }, [listId, products]);
  return <>
    <p className={styles.resultCount}>{products.length} {products.length === 1 ? "product" : "products"}</p>
    <ul className={styles.grid} aria-label="Products">
      {products.map(product => <ProductTile key={product.id} product={product} listId={listId} />)}
    </ul>
  </>;
}

function ComingSoon() {
  return <div className={styles.empty}>
    <h2>Product details coming soon</h2>
    <p>Explore the other categories while we prepare this collection.</p>
    <Link className={styles.backLink} to="/products">Explore all categories <ArrowRight size={17} aria-hidden="true" /></Link>
  </div>;
}

function MissingCategory() {
  return <section className={`page light ${styles.page}`}>
    <div className={`container ${styles.container}`}>
      <h1>Category not found</h1>
      <p className={styles.description}>Choose a category from the product collection.</p>
      <Link className={styles.backLink} to="/products">Explore all categories <ArrowRight size={17} aria-hidden="true" /></Link>
    </div>
  </section>;
}

export function MajorCategory() {
  const { topic: topicId } = useParams();
  const data = useContent();
  const topic = productTopics.find(candidate => candidate.id === topicId);
  usePage(topic ? `${topic.label} Products` : "Category not found", topic ? `Explore the iDance ${topic.label} collection and its product categories.` : undefined);
  if (!topic) return <MissingCategory />;
  const products = getTopicProducts(data, topic);
  return <section className={`page light ${styles.page} ${styles.majorPage}`} data-category-page="major" data-product-topic={topic.id}>
    <CategoryHero topic={topic} />
    <div className={`container ${styles.container} ${styles.majorContent}`}>
      <Breadcrumbs topic={topic} />
      <header className={styles.header}>
        <span className={`eyebrow muted ${styles.eyebrow}`}>PRODUCT COLLECTION</span>
        <h1>{topic.label}</h1>
        {topic.children.length > 0 && <p className={styles.description}>Explore the {topic.label} categories.</p>}
      </header>
      {topic.children.length > 0 ? <ul className={styles.grid} aria-label={`${topic.label} categories`}>
        {topic.children.map(entry => <CategoryCard key={entry.label} topic={topic} entry={entry} products={getTopicProducts(data, topic, entry)} />)}
      </ul> : products.length > 0 ? <ProductGrid products={products} listId={`category-${topic.id}`} /> : <ComingSoon />}
    </div>
  </section>;
}

export function Subcategory() {
  const { topic: topicId, subcategory: subcategoryId } = useParams();
  const data = useContent();
  const topic = productTopics.find(candidate => candidate.id === topicId);
  const entry = topic?.children.find(candidate => !candidate.unconfirmed && slugifyTopic(candidate.label) === subcategoryId);
  usePage(entry && topic ? `${entry.label} | ${topic.label}` : "Category not found", entry && topic ? `Explore ${entry.label} in the iDance ${topic.label} collection.` : undefined);
  if (!topic || !entry) return <MissingCategory />;
  const products = getTopicProducts(data, topic, entry);
  return <section className={`page light ${styles.page}`} data-category-page="subcategory" data-product-topic={topic.id} data-subcategory={subcategoryId}>
    <div className={`container ${styles.container}`}>
      <Breadcrumbs topic={topic} entry={entry} />
      <header className={styles.header}>
        <span className={`eyebrow muted ${styles.eyebrow}`}>{topic.label.toUpperCase()}</span>
        <h1>{entry.label}</h1>
      </header>
      {products.length > 0 ? <ProductGrid products={products} listId={`category-${topic.id}-${subcategoryId}`} /> : <ComingSoon />}
    </div>
  </section>;
}
