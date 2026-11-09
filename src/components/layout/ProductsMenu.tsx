import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronDown, ChevronRight } from "lucide-react";
import type { Content } from "../../types/content";
import styles from "./ProductsMenu.module.css";

type MenuEntry = { label: string; unconfirmed?: boolean };
type ProductTopic = { id: string; label: string; children: MenuEntry[] };

// Navigation labels are editorial structure, not new catalogue data. Unreadable
// handwritten labels stay pending until confirmed; never infer product facts.
export const productTopics: ProductTopic[] = [
  { id: "karaoke", label: "Karaoke", children: [
    { label: "Party Mic" }, { label: "Trolley" }, { label: "Category to confirm", unconfirmed: true },
  ] },
  { id: "ds", label: "DS", children: [
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
  { id: "apps", label: "Apps", children: [] },
];

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

function TopicContent({ topic, data, onNavigate }: { topic: ProductTopic; data: Catalogue; onNavigate: () => void }) {
  const href = productMenuHref(topic, data);
  return <>
    {topic.children.length > 0 && (href
      ? <Link className={styles.collectionLink} to={href} onClick={onNavigate}>All {topic.label} <ArrowUpRight size={15} aria-hidden="true" /></Link>
      : <span className={styles.collectionLabel}>All {topic.label}</span>)}
    {topic.children.length > 0 ? <ul className={styles.subtopics}>
      {topic.children.map(entry => {
        const target = productMenuHref(entry, data);
        return <li key={entry.label}>{target
          ? <Link className={styles.subtopicLink} to={target} onClick={onNavigate}>{entry.label}<ArrowUpRight size={15} aria-hidden="true" /></Link>
          : <span className={styles.pendingItem}>{entry.label}</span>}
        </li>;
      })}
    </ul> : null}
  </>;
}

export function ProductsMenu({ data, label = "Products" }: { data: Catalogue; label?: string }) {
  const location = useLocation();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const topicButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pointerWithin = useRef(false);
  const mode = useRef<"hover" | "click" | "keyboard">("hover");
  const [open, setOpen] = useState(false);
  const [activeTopic, setTopicIndex] = useState(0);
  const [direction, setDirection] = useState("forward");
  const setActiveTopic = (index: number) => { setDirection(index >= activeTopic ? "forward" : "backward"); setTopicIndex(index); };

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

  const onTopicKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
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
            <button ref={element => { topicButtons.current[index] = element; }} type="button" className={styles.topic}
              id={`${id}-${topic.id}-trigger`} aria-expanded={activeTopic === index} aria-controls={`${id}-${topic.id}-content`}
              onPointerEnter={event => { if (event.pointerType === "mouse") setActiveTopic(index); }}
              onFocus={() => setActiveTopic(index)} onClick={() => setActiveTopic(index)} onKeyDown={event => onTopicKey(event, index)}>
              <span>{topic.label}</span>
            </button>
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
          <TopicContent topic={topic} data={data} onNavigate={close} />
        </div>)}
      </div>
      <div className={styles.imagePlaceholder} data-product-image-placeholder aria-hidden="true" />
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
          {productMenuHref(item, data)
            ? <Link className={styles.mobileTopicToggle} to={productMenuHref(item, data)!} onClick={onNavigate}>{item.label}<ArrowUpRight size={16} aria-hidden="true" /></Link>
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
