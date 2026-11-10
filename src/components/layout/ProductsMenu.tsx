import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronDown, ChevronRight } from "lucide-react";
import type { Content } from "../../types/content";
import styles from "./ProductsMenu.module.css";

import { productTopics, topicHref, subcategoryHref, getTopicProducts, type MenuEntry, type ProductTopic } from "../../data/productTopics";
export { productTopics } from "../../data/productTopics";

const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/[\s_-]+/g, " ");

// Link only an unambiguous, exact name/slug in the loaded catalogue. In
// particular, don't invent query-string categories that silently show no items.
export function productMenuHref(entry: MenuEntry, data: Pick<Content, "categories" | "products">) {
  if (entry.unconfirmed) return undefined;
  const label = normalize(entry.label);
  const categories = data.categories.filter(category => normalize(category.name) === label || normalize(category.slug) === label);
  if (categories.length === 1) return `/products?category=${encodeURIComponent(categories[0].slug)}`;
  if (categories.length > 1) return undefined;
  const products = data.products.filter(product => normalize(product.name) === label || normalize(product.slug) === label);
  return products.length === 1 ? `/products/${encodeURIComponent(products[0].slug)}` : undefined;
}

type Catalogue = Pick<Content, "categories" | "products">;

function TopicContent({ topic, data, onNavigate, onEntry, activeEntry }: { topic: ProductTopic; data: Catalogue; onNavigate: () => void; onEntry?: (entry: MenuEntry) => void; activeEntry?: string }) {
  return <>
    <Link className={styles.collectionLink} to={topicHref(topic.id)} onClick={onNavigate}>All {topic.label} <ArrowUpRight size={15} aria-hidden="true" /></Link>
    <ul className={styles.subtopics}>
      {topic.children.filter(entry => !entry.unconfirmed).map(entry => <li key={entry.label}>
        {entry.unconfirmed ? <span className={styles.pendingItem}>{entry.label}</span> : onEntry ?
          <div className={styles.subtopicRow} data-active={entry.label === activeEntry} onPointerEnter={e => { if(e.pointerType === "mouse") onEntry(entry); }} onFocus={() => onEntry(entry)}>
            <Link className={styles.subtopicLink} to={subcategoryHref(topic.id, entry.label)} onClick={onNavigate}>{entry.label}</Link>
            <button className={styles.productDisclosure} aria-label={`Show ${entry.label} products`} aria-controls="desktop-product-list" aria-expanded={entry.label === activeEntry} onKeyDown={event => { if(event.key === "ArrowRight") { event.preventDefault(); document.querySelector<HTMLElement>("#desktop-product-list a")?.focus(); } }} onClick={() => onEntry(entry)}><ChevronRight size={16}/></button>
          </div> :
          <details className={styles.mobileSubcategory}><summary>{entry.label}<ChevronDown size={15}/></summary>
            <Link to={subcategoryHref(topic.id, entry.label)} onClick={onNavigate}>All {entry.label} <ArrowUpRight size={15}/></Link>
            {getTopicProducts(data, topic, entry).map(product => <Link key={product.id} to={`/products/${product.slug}`} onClick={onNavigate}>{product.name}<ArrowUpRight size={15}/></Link>)}
            {!getTopicProducts(data, topic, entry).length && <p className={styles.emptyNote}>Product details coming soon.</p>}
          </details>}
      </li>)}
    </ul>
  </>;
}

export function ProductsMenu({ data, label = "Products" }: { data: Catalogue; label?: string }) {
  const location = useLocation();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const topicButtons = useRef<(HTMLAnchorElement | null)[]>([]);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pointerWithin = useRef(false);
  const mode = useRef<"hover" | "click" | "keyboard">("hover");
  const [open, setOpen] = useState(false);
  const [activeTopic, setTopicIndex] = useState(0);
  const [activeEntry, setActiveEntry] = useState<MenuEntry | undefined>(productTopics[0].children.find(entry => !entry.unconfirmed));
  const [direction, setDirection] = useState("forward");
  const setActiveTopic = (index: number) => { setDirection(index >= activeTopic ? "forward" : "backward"); setTopicIndex(index); if(index !== activeTopic) setActiveEntry(productTopics[index].children.find(entry => !entry.unconfirmed)); };

  const cancelClose = useCallback(() => { clearTimeout(closeTimer.current); }, []);
  const close = useCallback(() => { cancelClose(); setOpen(false); mode.current = "hover"; }, [cancelClose]);
  const focusTopic = (index: number) => {
    setActiveTopic(index);
    topicButtons.current[index]?.focus();
  };

  useEffect(() => close(), [location.key, close]);
  useEffect(() => () => cancelClose(), [cancelClose]);
  useEffect(() => {
    if (!open) return;
    const onOutside = (event: PointerEvent) => {
      pointerWithin.current = event.target instanceof Node && !!root.current?.contains(event.target);
      if (!pointerWithin.current) close();
    };
    const onPointerEnd = () => { pointerWithin.current = false; };
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
      trigger.current?.focus();
    };
    const narrow = window.matchMedia("(max-width: 767px)");
    const onNarrow = () => { if (narrow.matches) close(); };
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("pointerup", onPointerEnd);
    document.addEventListener("pointercancel", onPointerEnd);
    document.addEventListener("keydown", onEscape);
    window.addEventListener("blur", close);
    narrow.addEventListener("change", onNarrow);
    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("pointerup", onPointerEnd);
      document.removeEventListener("pointercancel", onPointerEnd);
      document.removeEventListener("keydown", onEscape);
      window.removeEventListener("blur", close);
      pointerWithin.current = false;
      narrow.removeEventListener("change", onNarrow);
    };
  }, [open, close]);

  const onTopicKey = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    const next = event.key === "ArrowDown" ? (index + 1) % productTopics.length
      : event.key === "ArrowUp" ? (index - 1 + productTopics.length) % productTopics.length
      : event.key === "Home" ? 0 : event.key === "End" ? productTopics.length - 1 : null;
    if (next !== null) { event.preventDefault(); focusTopic(next); }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      panels.current[index]?.querySelector<HTMLElement>("a[href]")?.focus();
      if (document.activeElement === event.currentTarget) panels.current[index]?.focus();
    }
    if (event.key === "ArrowLeft") { event.preventDefault(); trigger.current?.focus(); }
  };

  return <div ref={root} className={styles.root}
    onPointerEnter={event => {
      cancelClose();
      if (event.pointerType === "mouse" && !open) { mode.current = "hover"; setOpen(true); }
    }}
    onPointerLeave={event => {
      if (event.pointerType !== "mouse" || mode.current !== "hover") return;
      cancelClose();
      closeTimer.current = setTimeout(() => {
        if (!root.current?.contains(document.activeElement)) close();
      }, 160);
    }}
    onBlur={event => {
      // Clicking the intentionally blank image area does not focus an element.
      // Keep that internal pointer interaction open; actual focus exits close.
      if (!event.relatedTarget && pointerWithin.current) return;
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
    }}>
    <button ref={trigger} type="button" className={`${styles.trigger} ${location.pathname.startsWith("/products") ? styles.current : ""}`}
      aria-expanded={open} aria-controls={`${id}-products`}
      onClick={() => {
        cancelClose();
        if (open && mode.current !== "hover") close();
        else { mode.current = "click"; setOpen(true); }
      }}
      onKeyDown={event => {
        if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
        event.preventDefault();
        cancelClose();
        mode.current = "keyboard";
        setOpen(true);
        const index = event.key === "ArrowUp" ? productTopics.length - 1 : 0;
        setActiveTopic(index);
        requestAnimationFrame(() => topicButtons.current[index]?.focus());
      }}>
      {label}<ChevronDown size={13} aria-hidden="true" />
    </button>
    <div id={`${id}-products`} className={styles.panel} data-open={open} data-direction={direction} aria-hidden={!open} inert={!open} aria-label="Product categories">
      <div className={styles.topicsColumn}>
        <ul className={styles.topics} aria-label="Product topics">
          {productTopics.map((topic, index) => <li key={topic.id}>
            <Link ref={element => { topicButtons.current[index] = element; }} to={topicHref(topic.id)} className={styles.topic}
              id={`${id}-${topic.id}-trigger`} aria-expanded={activeTopic === index} aria-controls={`${id}-${topic.id}-content`}
              onPointerEnter={event => { if (event.pointerType === "mouse") setActiveTopic(index); }}
              onFocus={() => setActiveTopic(index)} onClick={close} onKeyDown={event => onTopicKey(event, index)}>
              <span>{topic.label}</span>
            </Link>
          </li>)}
        </ul>
        <Link className={styles.allProducts} to="/products" onClick={close}>All products <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
      <div className={styles.subtopicsColumn}>
        {productTopics.map((topic, index) => <div key={topic.id} ref={element => { panels.current[index] = element; }}
          id={`${id}-${topic.id}-content`} data-active={activeTopic === index} aria-hidden={activeTopic !== index} inert={activeTopic !== index} className={styles.topicPanel} tabIndex={-1}
          role="region" aria-labelledby={`${id}-${topic.id}-trigger`}
          onKeyDown={event => { if (event.key === "ArrowLeft") { event.preventDefault(); focusTopic(index); } }}>
          <p className={styles.topicHeading}>{topic.label}</p>
          <TopicContent topic={topic} data={data} onNavigate={close} onEntry={setActiveEntry} activeEntry={activeEntry?.label} />
        </div>)}
      </div>
      <div id="desktop-product-list" className={styles.productColumn} role="region" aria-label="Products in selected subcategory" onKeyDown={event => { if(event.key === "ArrowLeft") { event.preventDefault(); root.current?.querySelector<HTMLElement>(`button[aria-label="Show ${activeEntry?.label} products"]`)?.focus(); } }}>
        <p className={styles.topicHeading}>{activeEntry?.label || productTopics[activeTopic].label}</p>
        {getTopicProducts(data, productTopics[activeTopic], activeEntry).map(product => <Link className={styles.menuProduct} key={product.id} to={`/products/${product.slug}`} onClick={close}>
          <span>{product.name}<ArrowUpRight size={16}/></span>
        </Link>)}
        {!getTopicProducts(data, productTopics[activeTopic], activeEntry).length && <p className={styles.emptyNote}>Product details coming soon.</p>}
      </div>
    </div>
  </div>;
}

export function MobileProductsMenu({ data, onNavigate, label = "Products" }: { data: Catalogue; onNavigate: () => void; label?: string }) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);
  return <div className={styles.mobileProducts}>
    <button className={styles.mobileToggle} type="button" aria-expanded={expanded} aria-controls={`${id}-mobile-products`}
      onClick={() => setExpanded(value => !value)}>{label}<ChevronDown size={20} aria-hidden="true" /></button>
    <div id={`${id}-mobile-products`} data-open={expanded} aria-hidden={!expanded} inert={!expanded} className={styles.disclosure}><div className={styles.disclosureInner}><div className={styles.mobileTree}>
      <Link className={styles.mobileAllProducts} to="/products" onClick={onNavigate}>All products <ArrowUpRight size={16} aria-hidden="true" /></Link>
      {productTopics.map(item => item.children.length === 0
        ? <div key={item.id} className={styles.mobileTopic}>
          {topicHref(item.id)
            ? <Link className={styles.mobileTopicToggle} to={topicHref(item.id)} onClick={onNavigate}>{item.label}<ArrowUpRight size={16} aria-hidden="true" /></Link>
            : <span className={styles.mobilePendingTopic}>{item.label}</span>}
        </div>
        : <div key={item.id} className={styles.mobileTopic}>
        <button type="button" className={styles.mobileTopicToggle} aria-expanded={topic === item.id} aria-controls={`${id}-${item.id}`}
          onClick={() => setTopic(value => value === item.id ? null : item.id)}>{item.label}<ChevronRight size={17} aria-hidden="true" /></button>
        <div id={`${id}-${item.id}`} data-open={topic === item.id} aria-hidden={topic !== item.id} inert={topic !== item.id} className={styles.disclosure}><div className={styles.disclosureInner}><div className={styles.mobileTopicContent}>
          <TopicContent topic={item} data={data} onNavigate={onNavigate} />
        </div></div></div>
      </div>)}
    </div></div></div>
  </div>;
}
