import { pendingProductLists, pendingProducts, type PendingProduct } from "../data/pendingProductLists";
import { ProductFamilyNavigation } from "../components/layout/ProductFamilyNavigation";
import { useEffect, useRef } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PictureView } from "../components/ui/ContentCards";
import { useContent } from "../hooks/useContent";
import { usePage } from "../hooks/usePage";
import {
  getTopicProducts,
  productTopics,
  slugifyTopic,
  topicHref,
} from "../data/productTopics";
import { item, track } from "../lib/analytics";
import type { Product } from "../types/content";
import styles from "./Categories.module.css";

function ColourDots({ products }: { products: Product[] }) {
  const colours = [...new Set(products.map(product => product.colour?.trim()).filter((colour): colour is string => !!colour))];
  const palette: Record<string, string> = { black: "#111", white: "#fff", red: "#c53737", blue: "#306bc0", pink: "#e66ea5", silver: "#b9bec5", grey: "#858585", gray: "#858585" };
  return <div className={styles.colourDots} aria-label={colours.length ? `Colours: ${colours.join(", ")}` : "Colour details coming soon"}>
    {colours.length ? colours.map(colour => <span key={colour} className={styles.colourDot} style={{ backgroundColor: palette[colour.toLowerCase()] || "#ddd" }} title={colour} />) :
      <span className={`${styles.colourDot} ${styles.colourPending}`} title="Colour details coming soon" />}
  </div>;
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

// Old bookmarks skip the removed category-card landing pages.
export function MajorCategory() {
  const { topic } = useParams();
  return <Navigate to={topic && productTopics.some(item => item.id === topic) ? topicHref(topic) : "/products"} replace />;
}

export function Subcategory() {
  const { topic: topicId, subcategory: subcategoryId } = useParams();
  const data = useContent();
  const topic = productTopics.find(candidate => candidate.id === topicId);
  const entry = topic?.children.find(candidate => !candidate.unconfirmed && slugifyTopic(candidate.label) === subcategoryId);
  usePage(entry && topic ? `${entry.displayLabel ?? entry.label} | ${topic.label}` : "Category not found", entry && topic ? `Explore ${entry.label} in the iDance ${topic.label} collection.` : undefined);
  if (!topic || !entry) return <MissingCategory />;
  const products = getTopicProducts(data, topic, entry);
  const pendingNames = pendingProductLists[`${topic.id}/${subcategoryId}`];
  const firstPending = pendingNames?.length ? pendingProducts.find(product => product.name === pendingNames[0]) : undefined;
  const firstSlug = products[0]?.slug ?? firstPending?.slug;
  if (firstSlug) return <Navigate to={`/products/${encodeURIComponent(firstSlug)}?topic=${encodeURIComponent(topic.id)}&category=${encodeURIComponent(subcategoryId!)}`} replace />;
  return <><ProductFamilyNavigation topicId={topic.id} activeEntry={entry.label} /><section className={`page light ${styles.page}`} data-category-page="subcategory" data-product-topic={topic.id} data-subcategory={subcategoryId}>
    <div className={`container ${styles.container}`}>
      <h1 className="sr-only">{entry.displayLabel ?? entry.label}</h1>
      {products.length > 0 ? <ProductGrid products={products} listId={`category-${topic.id}-${subcategoryId}`} /> : <ComingSoon />}
    </div>
  </section></>;
}

export function PendingProductDetail({ product }: { product: PendingProduct }) {
  const [params] = useSearchParams();
  const contextualProduct = pendingProducts.find(item => item.name === product.name && item.topicId === params.get("topic") && (!params.get("category") || item.subcategoryId === params.get("category"))) ?? product;
  const topic = productTopics.find(item => item.id === contextualProduct.topicId)!;
  const entry = topic.children.find(item => slugifyTopic(item.label) === contextualProduct.subcategoryId)!;
  return <>
    <ProductFamilyNavigation topicId={topic.id} activeEntry={entry?.label} activeProductName={product.name} hideEmptyState />
    <section className={`page light ${styles.page}`} aria-label={`${product.name} product details`}>
      <div className={`container ${styles.container}`}>
        <h1 className="sr-only">{product.name}</h1>
        <ComingSoon />
      </div>
    </section>
  </>;
}
