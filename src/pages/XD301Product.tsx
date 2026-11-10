import { createPortal } from "react-dom";
import { useRef, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ArrowUpRight, Store, FileText, SlidersHorizontal, Download, CircleHelp } from "lucide-react";
import type { Product } from "../types/content";
import { track } from "../lib/analytics";
import styles from "./XD301Product.module.css";
import { ProductFamilyNavigation } from "../components/layout/ProductFamilyNavigation";
import { XD301FeatureStory } from "./XD301FeatureStory";

function FeatureIcon({ feature }: { feature: string }) {
  const label = feature.toLowerCase();
  const artwork = label.includes("turntable") ? <><rect x="2" y="8" width="28" height="17" rx="3"/><circle cx="10" cy="16.5" r="5"/><circle cx="22" cy="16.5" r="5"/><circle cx="10" cy="16.5" r="1"/><circle cx="22" cy="16.5" r="1"/></>
    : label.includes("pads") ? <>{Array.from({length:16}, (_, i) => <rect key={i} x={4+(i%4)*6.5} y={4+Math.floor(i/4)*6.5} width="4" height="4" rx=".8"/>)}</>
    : label.includes("space control") ? <><path d="M8 22v-9a2 2 0 0 1 4 0v5-11a2 2 0 0 1 4 0v10-8a2 2 0 0 1 4 0v9-5a2 2 0 0 1 4 0v9c0 5-3 7-8 7s-8-2-8-7Z"/><path d="M3 13a13 13 0 0 1 2-7m22 0a13 13 0 0 1 2 7"/></>
    : label.includes("crossfader") ? <><path d="M3 16h9m8 0h9M4 11v10m24-10v10"/><rect x="12" y="8" width="8" height="16" rx="2"/><path d="M16 12v8"/></>
    : label.includes("battery") ? <><rect x="3" y="9" width="24" height="14" rx="3"/><path d="M29 13v6m-11-7-5 6h5l-3 5"/></>
    : <><path d="M7 5v22m18-22v22M3 9h8m10 14h8M16 6v20m-3-17 3-3 3 3m-6 14 3 3 3-3"/><rect x="3" y="15" width="8" height="4" rx="1"/><rect x="21" y="11" width="8" height="4" rx="1"/></>;
  return <svg className={styles.featureIcon} viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{artwork}</svg>;
}

export function XD301Product({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [watching, setWatching] = useState(false);
  const [paused, setPaused] = useState(true);
  const [reduceMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function scrollToSection(event: MouseEvent<HTMLElement>) {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    window.history.pushState(null, "", link.hash);
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    target.focus({ preventScroll: true });
  }
  function watchVideo() {
    const video = videoRef.current;
    if (!video) return;
    setWatching(true);
    video.currentTime = 0;
    video.muted = false;
    void video.play().catch(() => { /* Native controls remain available when playback is blocked. */ });
  }
  const image = product.images[selected] || product.images[0];
  return <article className={styles.page}>
    <ProductFamilyNavigation product={product} />
    <div className={styles.campaign}>
      <img src={product.campaignImage?.url || product.images[0]?.url} alt={product.campaignImage?.alt || "XD301 portable DJ station"} width={1774} height={887} fetchPriority="high" />
      <div className={styles.campaignCopy}><h1>{product.name}</h1><p>Portable DJ Station</p><a className={styles.heroBuy} href="#WhereToBuy" onClick={event => { event.preventDefault(); const target = document.getElementById("WhereToBuy") as HTMLDetailsElement | null; if (!target) return; target.open = true; target.querySelector<HTMLElement>("summary")?.focus({ preventScroll:true }); target.scrollIntoView({ behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block:"start" }); }}>Where to Buy<ArrowUpRight size={16} aria-hidden="true"/></a></div>
    </div>
    <nav className={styles.sectionNav} aria-label="XD301 page sections" onClick={scrollToSection}>
      <strong>{product.name}</strong><a href="#Features">Features</a><a href="#Video">Video</a><a href="#ThreeSixty">3D / 360°</a><a href="#Specifications">Specifications</a><a href="#Support">Support</a>
    </nav>
    <section tabIndex={-1} id="Features" className={`${styles.section} ${styles.features}`} aria-labelledby="features-heading">
      <span className="eyebrow">MAKE THE MIX YOURS</span><h2 id="features-heading">Mix, Scratch, Play</h2><p className={styles.lead}>{product.summary}</p>
      <ul className={styles.featureGrid}>{product.features.map(feature => <li key={feature}><FeatureIcon feature={feature}/><h3>{feature}</h3></li>)}</ul>
    </section>
    <section tabIndex={-1} id="Video" className={`${styles.section} ${styles.videoStage}`} aria-labelledby="video-heading">
      <video ref={videoRef} className={styles.video} autoPlay={!reduceMotion} muted={!watching} loop={!watching} controls={watching} playsInline preload="metadata" poster={product.campaignImage?.url || product.images[0]?.url} onPlay={() => setPaused(false)} onPause={() => setPaused(true)} aria-label="XD301 product demonstration"><source src={product.productVideo} type="video/mp4"/>Your browser does not support this video.</video>
      {!watching && <><div className={styles.videoActions}><button type="button" onClick={watchVideo}><span aria-hidden="true">▶</span> Watch Video</button><button type="button" aria-label={paused ? "Play video preview" : "Pause video preview"} onClick={() => { const video = videoRef.current; if (!video) return; if (video.paused) void video.play().catch(() => {}); else video.pause(); }}>{paused ? "Play preview" : "Pause preview"}</button></div></>}
      <h2 id="video-heading" className={styles.visuallyHidden}>XD301 product demonstration</h2>
    </section>
    <XD301FeatureStory/>
    <section tabIndex={-1} id="ThreeSixty" className={`${styles.section} ${styles.threeSixty}`} aria-labelledby="three-sixty-heading">
      <span className="eyebrow">EVERY ANGLE</span><h2 id="three-sixty-heading">3D / 360°</h2>
      <div className={styles.viewerPlaceholder}><span aria-hidden="true">360°</span><p>3D / 360° view coming soon.</p></div>
    </section>
    <section tabIndex={-1} id="Specifications" className={styles.section} aria-labelledby="specifications-heading">
      <div className={styles.specLayout}>
        <div id="ProductImage" className={styles.specImages}>
          <h2 id="specifications-heading">Specifications</h2>
          <div className={styles.gallery}><img src={image?.url} alt={image?.alt} width={1536} height={1024} loading="lazy"/></div>
          <div className={styles.thumbnails} aria-label="Choose product image">{product.images.map((item,index) => <button key={item.url} aria-label={`View image ${index+1}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><img src={item.url} alt="" width={112} height={84} loading="lazy"/></button>)}</div>
          <p className={styles.caption}>{selected === 0 ? "Product visualisation. See the original product image for printed details." : "Original supplied product image."}</p>
        </div>
        <div className={styles.specContent}>
          <details open><summary><span><FileText size={20} aria-hidden="true"/>Product details</span></summary><dl className={styles.specifications}>
            <div><dt>Category</dt><dd><Link to="/products/category/ds/dj-mixer">DJ / DJ Mixer</Link></dd></div>
            <div><dt>Item number</dt><dd>{product.itemNumber || "Details coming soon"}</dd></div>
            <div><dt>Item name</dt><dd>{product.name} Portable DJ Station</dd></div>
            <div><dt>Description</dt><dd>{product.summary}</dd></div>
            <div><dt>Colour</dt><dd>{product.colour || "Details coming soon"}</dd></div>
          </dl></details>
          <details open><summary><span><SlidersHorizontal size={20} aria-hidden="true"/>Specifications</span></summary><dl className={styles.specifications}>{product.specifications?.filter(spec => spec.label !== "Model").map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl></details>
          <details id="WhereToBuy" open className={styles.whereToBuy}><summary><span><Store size={20} aria-hidden="true"/>Where to Buy</span></summary>
            <div className={styles.retailerRows}>{["France", "Germany", "Italy", "Spain"].map(country => <div className={styles.retailerRow} key={country}><span>{country}</span><div className={styles.retailerSpace} aria-label={`Retailer logos for ${country}, coming soon`}/></div>)}</div>
          </details>
          <details><summary><span><Download size={20} aria-hidden="true"/>Downloads</span></summary><p>{product.manual ? <a href={product.manual}>Download product manual</a> : "Product manual coming soon."}</p></details>
          <details><summary><span><CircleHelp size={20} aria-hidden="true"/>FAQs</span></summary><p>Product FAQs coming soon.</p></details>
        </div>
      </div>
    </section>
    <section className={styles.productScene} aria-label="XD301 product showcase"><img src="/media/xd301-showcase-accessories.png" alt="XD301 DJ station on a dark surface with two speakers, headphones, a game controller and a miniature skateboard" width={1774} height={887} loading="lazy"/></section>
    <section tabIndex={-1} id="Support" className={`${styles.section} ${styles.support}`} aria-labelledby="support-heading"><div><span className="eyebrow">LET’S TALK SOUND</span><h2 id="support-heading">More about XD301</h2><p>Questions about the XD301? Get in touch.</p></div><Link className="button dark-button" to="/contact?product=xd301" onClick={() => track("contact_click",{source:"product"})}>Enquire about this product<ArrowUpRight size={18}/></Link></section>
    {createPortal(<button type="button" className={styles.backToTop} aria-label="Back to top of product page" title="Back to top" onClick={() => { window.scrollTo({ top:0, behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); }}><ArrowUp size={18} aria-hidden="true" /></button>, document.body)}
  </article>;
}
