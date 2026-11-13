import { ProductThumbnail } from "./ProductThumbnail";
import { productThumbnailImages } from "../../data/productThumbnailImages";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Image } from "lucide-react";
import { useContent } from "../../hooks/useContent";
import { pendingProducts, pendingProductHref } from "../../data/pendingProductLists";
import { getTopicProducts, productTopics } from "../../data/productTopics";
import styles from "./ProductFamilyNavigation.module.css";

/** All-products uses the same compact tiles as the category collections. */
export function AllProductCatalogue() {
  const data = useContent();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const q = params.get("q") || "";
  const matches = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const groups = productTopics.filter(topic => !category || topic.id === category).map(topic => ({
    topic,
    products: getTopicProducts(data, topic).filter(product => matches(product.name)),
    pending: pendingProducts.filter(product => product.topicId === topic.id && matches(product.name)).filter((product, index, all) => all.findIndex(other => other.name === product.name) === index),
  }));
  const count = new Set(groups.flatMap(group => [...group.products.map(product => product.name), ...group.pending.map(product => product.name)])).size;
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: key === "q" });
  };
  return <section className="page light catalogue-page"><div className="container">
    <h1 className="sr-only">All products</h1>
    <div className="filters">
      <label className="field">Category<select aria-label="Category" value={category} onChange={event => update("category", event.target.value)}>
        <option value="">All products</option>
        {productTopics.map(topic => <option key={topic.id} value={topic.id}>{topic.id === "ds" ? "DEEJAY | DJ" : topic.label}</option>)}
      </select></label>
      <label className="field">Search products<input type="search" value={q} placeholder="Search by product name" onChange={event => update("q", event.target.value)} /></label>
    </div>
    <p aria-live="polite" className="result-count">{count} {count === 1 ? "product" : "products"}</p>
    {groups.filter(group => !q.trim() || group.products.length + group.pending.length > 0).map(({topic, products, pending}) => <section key={topic.id} className={styles.catalogueGroup} aria-labelledby={`catalogue-${topic.id}`}>
      <h2 id={`catalogue-${topic.id}`}>{topic.id === "ds" ? <>DEEJAY <span className={styles.topicDivider}>|</span> DJ</> : topic.label}</h2>
      {products.length + pending.length > 0 ? <nav aria-label={`${topic.label} product thumbnails`} className={styles.products}>
        {products.map(product => <Link key={product.id} to={`/products/${encodeURIComponent(product.slug)}`} className={styles.productTile}>
          {product.images[0] && <ProductThumbnail src={productThumbnailImages[product.name] ?? product.images[0].url} loading="lazy" />}
          <span className={styles.productLabel}><strong>{product.name}</strong><span className={styles.productAction}>View product <ArrowUpRight size={14} aria-hidden="true" /></span></span>
        </Link>)}
        {pending.map(product => product.name === "MASTERMIX INTRO" ? <div key={product.name} role="link" aria-disabled="true" className={styles.productTile} data-coming-soon="true"><span className={styles.productLabel}><strong>{product.name}</strong><span className={styles.productAction}>Coming soon</span></span></div> : <Link key={product.name} to={`${pendingProductHref(product.name)}?topic=${topic.id}&category=${product.subcategoryId}`} className={styles.productTile} data-coming-soon={product.name === "MASTERMIX INTRO" || undefined}>
          {product.name === "MASTERMIX INTRO" ? null : productThumbnailImages[product.name] ? <ProductThumbnail src={productThumbnailImages[product.name]} loading="lazy" /> : <span className={styles.pendingThumbnail} role="img" aria-label={`${product.name}: photo pending`}><Image size={24} strokeWidth={1.4} aria-hidden="true" /></span>}
          <span className={styles.productLabel}><strong>{product.name === "PARTYGROOVE3MK4" ? <>PARTY GROOVE3<br />MK4</> : product.name}</strong><span className={styles.productAction}>{product.name === "MASTERMIX INTRO" ? "Coming soon" : <>View product <ArrowUpRight size={14} aria-hidden="true" /></>}</span></span>
        </Link>)}
      </nav> : <div className={styles.pendingProducts}><p>Coming Soon</p></div>}
    </section>)}
    {!count && q.trim() && <div className="empty"><h2>No sound found, Yet</h2><p>Try a different name or category.</p><button className="button dark-button" onClick={() => setParams({})}>Clear filters</button></div>}
  </div></section>;
}
