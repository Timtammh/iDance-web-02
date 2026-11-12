import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import type { Content } from "../../types/content";
import styles from "./ProductsMenu.module.css";

import { productTopics, topicHref, subcategoryHref, type MenuEntry } from "../../data/productTopics";
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

function MenuColumns({ onNavigate }: { onNavigate: () => void }) {
  return <div className={styles.columns}>
    {productTopics.map(topic => <section className={styles.column} key={topic.id} aria-label={topic.label}>
      <div className={styles.headingRow}><h3 className={styles.heading}>{topic.id === "ds" ? "DEEJAY | DJ" : topic.label}</h3>
        <Link className={styles.collectionLink} to={topicHref(topic.id)} onClick={onNavigate}>All</Link>
      </div>
      <div className={`${styles.card} ${topic.id === "apps" ? styles.apps : ""}`}>
        <ul className={styles.entries}>
          {topic.children.filter(entry => !entry.unconfirmed).map((entry, index) => <li key={entry.label}>
            <Link className={index === 0 && topic.id !== "apps" ? styles.featured : undefined} to={subcategoryHref(topic.id, entry.label)} onClick={onNavigate}>{entry.displayLabel ?? entry.label}</Link>
          </li>)}
        </ul>
      </div>
    </section>)}
  </div>;
}

export function ProductsMenu({ label = "Products" }: { data: Catalogue; label?: string }) {
  const location = useLocation();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mode = useRef<"hover" | "click" | "keyboard">("hover");
  const [open, setOpen] = useState(false);
  const cancelClose = useCallback(() => clearTimeout(closeTimer.current), []);
  const close = useCallback(() => { cancelClose(); setOpen(false); mode.current = "hover"; }, [cancelClose]);
  useEffect(() => close(), [location.key, close]);
  useEffect(() => () => cancelClose(), [cancelClose]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) close(); };
    const escape = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); close(); trigger.current?.focus(); } };
    const narrow = window.matchMedia("(max-width: 767px)");
    const resize = () => { if (narrow.matches) close(); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("blur", close);
    narrow.addEventListener("change", resize);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); window.removeEventListener("blur", close); narrow.removeEventListener("change", resize); };
  }, [open, close]);
  return <div ref={root} className={styles.root}
    onPointerEnter={event => { cancelClose(); if (event.pointerType === "mouse" && !open) { mode.current = "hover"; setOpen(true); } }}
    onPointerLeave={event => { if (event.pointerType === "mouse" && mode.current === "hover") { cancelClose(); closeTimer.current = setTimeout(() => { if (!root.current?.contains(document.activeElement)) close(); }, 180); } }}
    onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) close(); }}>
    <button ref={trigger} type="button" className={`${styles.trigger} ${location.pathname.startsWith("/products") ? styles.current : ""}`}
      aria-expanded={open} aria-controls={`${id}-products`}
      onClick={() => { cancelClose(); if (open && mode.current !== "hover") close(); else { mode.current = "click"; setOpen(true); } }}
      onKeyDown={event => {
        if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
        event.preventDefault(); cancelClose(); mode.current = "keyboard"; setOpen(true);
        requestAnimationFrame(() => { const links = root.current?.querySelectorAll<HTMLAnchorElement>(`.${styles.panel} a`); (event.key === "ArrowUp" ? links?.[links.length - 1] : links?.[0])?.focus(); });
      }}>{label}<ChevronDown size={13} aria-hidden="true" /></button>
    <div id={`${id}-products`} className={styles.panel} data-open={open} aria-hidden={!open} inert={!open} aria-label="Product categories">
      <MenuColumns onNavigate={close} />
      <Link className={styles.allProducts} to="/products" onClick={close}>All products <ArrowUpRight size={15} aria-hidden="true" /></Link>
    </div>
  </div>;
}

export function MobileProductsMenu({ onNavigate, label = "Products" }: { data: Catalogue; onNavigate: () => void; label?: string }) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  return <div className={styles.mobileProducts}>
    <button className={styles.mobileToggle} type="button" aria-expanded={expanded} aria-controls={`${id}-mobile-products`} onClick={() => setExpanded(value => !value)}>{label}<ChevronDown size={20} aria-hidden="true" /></button>
    <div id={`${id}-mobile-products`} data-open={expanded} aria-hidden={!expanded} inert={!expanded} className={styles.disclosure}><div className={styles.disclosureInner}>
      <MenuColumns onNavigate={onNavigate} />
      <Link className={styles.allProducts} to="/products" onClick={onNavigate}>All products <ArrowUpRight size={15} aria-hidden="true" /></Link>
    </div></div>
  </div>;
}
