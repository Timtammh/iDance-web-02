import { ProductThumbnail } from "./ProductThumbnail";
import { productThumbnailImages } from "../../data/productThumbnailImages";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Grid2X2, Image } from "lucide-react";
import { pendingProductHref, pendingProductLists } from "../../data/pendingProductLists";
import { productCategoryIcon } from "../../data/productTopicIcons";
import { useContent } from "../../hooks/useContent";
import { getTopicProducts, productTopics, slugifyTopic, subcategoryHref, topicHref } from "../../data/productTopics";
import type { Product } from "../../types/content";
import styles from "./ProductFamilyNavigation.module.css";

export function ProductFamilyNavigation({ product, topicId = "ds", activeEntry, activeProductName, hideEmptyState = false }: { product?: Product; topicId?: string; activeEntry?: string; activeProductName?: string; hideEmptyState?: boolean }) {
  const data = useContent();
  const [params] = useSearchParams();
  const allSelected = topicId === "apps" || params.get("collection") === "all" && params.get("topic") === topicId;
  const topic = productTopics.find(item => item.id === topicId)!;
  const selected = allSelected ? undefined : activeEntry ?? (product ? "DJ Station" : undefined);
  const entry = topic.children.find(item => !item.unconfirmed && item.label === selected);
  const products = getTopicProducts(data, topic, entry);
  const pendingNames = [...new Set(entry ? pendingProductLists[`${topic.id}/${slugifyTopic(entry.label)}`] ?? [] : Object.entries(pendingProductLists).filter(([collection]) => collection.startsWith(`${topic.id}/`)).flatMap(([, names]) => names))];
  // A product detail supplies its current product; category pages never borrow it.
  const siblings = product && !activeEntry && !products.some(item => item.id === product.id) ? [product, ...products] : products;
  const navigation = [...(topic.id === "apps" ? [] : topic.children).filter(item => !item.unconfirmed).map(item => ({label: item.displayLabel ?? item.label, entry: item.label as string | undefined, icon: productCategoryIcon(topic.id, item.label)})), { label: "All", entry: undefined, icon: Grid2X2 }];
  return <section className={styles.navigator} aria-labelledby="product-family-title">
    <div className={styles.heading}><span className={styles.eyebrow}>EXPLORE THE COLLECTION</span><h2 id="product-family-title" className={styles.title}>{topic.id === "ds" ? <>DEEJAY <span className={styles.topicDivider}>|</span> DJ</> : topic.label}</h2></div>
    <nav aria-label={`${topic.label} product categories`} className={styles.categories}>
      {navigation.map(item => <Link key={item.label} className={styles.categoryTile} data-active={item.entry === selected}
        aria-current={item.entry === selected ? "page" : undefined} to={item.entry ? subcategoryHref(topic.id, item.entry) : topicHref(topic.id)}><item.icon size={24} strokeWidth={1.4} aria-hidden="true"/><span>{item.label}</span><ArrowUpRight className={styles.categoryArrow} size={15} aria-hidden="true"/></Link>)}
    </nav>
    {(siblings.length > 0 || pendingNames.length > 0) && <nav aria-label={`${entry?.displayLabel ?? topic.label} product thumbnails`} className={styles.products}>
      {siblings.map(item => <Link key={item.id} to={`/products/${encodeURIComponent(item.slug)}${allSelected ? `?topic=${encodeURIComponent(topicId)}&collection=all` : ""}`}
        className={styles.productTile} aria-current={item.id === product?.id ? "page" : undefined}>{item.images[0] && <ProductThumbnail src={productThumbnailImages[item.name] ?? item.images[0].url} loading="eager" />}<span className={styles.productLabel}><strong>{item.name}</strong><span className={styles.productAction}>View product <ArrowUpRight size={14} aria-hidden="true"/></span></span></Link>)}
      {pendingNames.map(name => name === "MASTERMIX INTRO" ? <div key={name} role="link" aria-disabled="true" aria-current={name === activeProductName ? "page" : undefined} className={styles.productTile} data-coming-soon="true"><span className={styles.productLabel}><strong>{name}</strong><span className={styles.productAction}>Coming soon</span></span></div> : <Link key={name} to={`${pendingProductHref(name)}?topic=${topic.id}${allSelected ? "&collection=all" : entry ? `&category=${slugifyTopic(entry.label)}` : ""}`} aria-current={name === activeProductName ? "page" : undefined} className={styles.productTile} data-coming-soon={name === "MASTERMIX INTRO" || undefined}>
        {name === "MASTERMIX INTRO" ? null : productThumbnailImages[name] ? <ProductThumbnail src={productThumbnailImages[name]} loading="lazy" /> : <span className={styles.pendingThumbnail} role="img" aria-label={`${name}: photo pending`}><Image size={24} strokeWidth={1.4} aria-hidden="true"/></span>}
        <span className={styles.productLabel}><strong>{name === "PARTYGROOVE3MK4" ? <>PARTY GROOVE3<br />MK4</> : name}</strong><span className={styles.productAction}>{name === "MASTERMIX INTRO" ? "Coming soon" : <>View product <ArrowUpRight size={14} aria-hidden="true"/></>}</span></span>
      </Link>)}
    </nav>}
    {siblings.length === 0 && pendingNames.length === 0 && !hideEmptyState && <div className={styles.pendingProducts}><span>{entry?.displayLabel ?? selected ?? topic.label}</span><p>Coming Soon</p></div>}
  </section>;
}
