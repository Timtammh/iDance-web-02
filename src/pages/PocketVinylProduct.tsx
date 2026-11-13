import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUp, ArrowUpRight, Store, FileText, SlidersHorizontal, Download, CircleHelp, Bluetooth, Disc3, Speaker, Sparkles, Volume2, Battery, Music2, CircleDot } from "lucide-react";
import { pendingProducts, type PendingProduct } from "../data/pendingProductLists";
import { productTopics, slugifyTopic } from "../data/productTopics";
import { ProductFamilyNavigation } from "../components/layout/ProductFamilyNavigation";
import styles from "./PocketVinylProduct.module.css";
import storyStyles from "./XD301FeatureStory.module.css";
import xdStyles from "./XD301Product.module.css";

const heroPhotos = ["/media/pocket-vinyl-hero-textured.png", "/media/pocket-vinyl-hero-glass.png"];
// Product facts verified against owner-supplied gift-box artwork dated September 2026.
// Included-cartridge quantity conflicts between panels (1 vs 3), so remains unconfirmed.
const features = [
  { Icon:Bluetooth, title:"BT wireless audio", text:"Stream music wirelessly from your connected device." },
  { Icon:Disc3, title:"4 recordable songs", text:"Record your music to Pocket Vinyl." },
  { Icon:Speaker, title:"5W built-in speaker", text:"Play your music through the built-in speaker." },
  { Icon:Sparkles, title:"LED disco lights", text:"Bring colour to your music with LED disco lights." },
  { Icon:Volume2, title:"Volume control", text:"Adjust the listening level with the volume control." },
  { Icon:Battery, title:"Two power options", text:"USB-C powered or 2 AAA batteries. Batteries not included." },
];
const specifications = [["Speaker", "5W built-in speaker"], ["Connectivity", "BT wireless audio streaming"], ["Recording", "4 recordable songs"], ["Lights", "LED disco lights"], ["Volume", "Volume control"], ["Power", "USB-C powered or 2 AAA batteries (not included)"], ["Recommended age", "8+"], ["Included vinyl cartridges", "To be confirmed"]];
const photo = "/media/product-thumbnails/pocket-vinyl.png";
export function PocketVinylProduct({ product }: { product: PendingProduct }) {
  const [params] = useSearchParams();
  const [selected, setSelected] = useState(0);
  const galleryImages = [photo, ...heroPhotos];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [watching, setWatching] = useState(false);
  const [paused, setPaused] = useState(true);
  const [reduceMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function watchVideo() {
    const video = videoRef.current;
    if (!video) return;
    setWatching(true);
    video.currentTime = 0;
    video.muted = false;
    void video.play().catch(() => {});
  }
  const [heroIndex, setHeroIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const visibility = () => setPageVisible(!document.hidden);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduce = () => { if (motion.matches) setPlaying(false); };
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", reduce);
    return () => { document.removeEventListener("visibilitychange", visibility); motion.removeEventListener("change", reduce); };
  }, []);
  useEffect(() => {
    if (!playing || hovered || focusWithin || !pageVisible) return;
    const timer = window.setInterval(() => setHeroIndex(index => (index + 1) % heroPhotos.length), 6000);
    return () => window.clearInterval(timer);
  }, [playing, hovered, focusWithin, pageVisible]);
  const contextualProduct = pendingProducts.find(item => item.name === product.name && item.topicId === params.get("topic") && (!params.get("category") || item.subcategoryId === params.get("category"))) ?? product;
  const topic = productTopics.find(item => item.id === contextualProduct.topicId)!;
  const entry = topic.children.find(item => slugifyTopic(item.label) === contextualProduct.subcategoryId);
  function scrollToSection(event: MouseEvent<HTMLElement>) {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    if (target instanceof HTMLDetailsElement) target.open = true;
    window.history.pushState(null, "", link.hash);
    target.scrollIntoView({ behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block:"start" });
    (target.querySelector<HTMLElement>("summary") ?? target).focus({ preventScroll:true });
  }
  return <article className={styles.page}>
    <ProductFamilyNavigation topicId={topic.id} activeEntry={entry?.label} activeProductName={product.name} hideEmptyState />
    <div className={styles.campaign} data-second-image={heroIndex === 1 || undefined}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocusWithin(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusWithin(false); }}>
      <img id="pocket-vinyl-hero-image" src={heroPhotos[heroIndex]} alt={heroIndex === 0 ? "Pocket Vinyl" : "Pocket Vinyl in an illuminated glass display"} fetchPriority="high" />
      <div className={styles.campaignCopy}><h1><img className={styles.titleLogo} src="/media/pocket-vinyl-logo.png" alt="Pocket Vinyl" /></h1><p>Record your music wirelessly.</p><a className={styles.heroBuy} href="#WhereToBuy" onClick={scrollToSection}>Where to Buy<ArrowUpRight size={16} aria-hidden="true"/></a><div className={styles.heroControls} role="group" aria-label="Pocket Vinyl main pictures">{heroPhotos.map((_, index) => <button key={index} type="button" aria-label={`Show Pocket Vinyl main picture ${index + 1}`} aria-pressed={heroIndex === index} aria-controls="pocket-vinyl-hero-image" onClick={() => { setHeroIndex(index); }}><span aria-hidden="true" className={styles.heroDot}/></button>)}</div></div>
    </div>
    <nav className={styles.sectionNav} aria-label="Pocket Vinyl page sections" onClick={scrollToSection}><strong>Pocket Vinyl</strong><a href="#Features">Features</a><a href="#Video">Video</a><a href="#ThreeSixty">360°</a><a href="#Specifications">Specifications</a><a href="#Support">Support</a></nav>
    <section tabIndex={-1} id="Features" className={`${xdStyles.section} ${xdStyles.features}`} aria-labelledby="features-heading"><span className="eyebrow">YOUR MUSIC, YOUR VINYL</span><h2 id="features-heading">Record, Play, Light Up</h2><p className={xdStyles.lead}>Record your music wirelessly, play it through the built-in speaker and light it up with LED disco lights.</p><ul className={xdStyles.featureGrid}>{features.map(({Icon,title}) => <li key={title}><Icon className={xdStyles.featureIcon} size={32} strokeWidth={1.4} aria-hidden="true"/><h3>{title}</h3></li>)}</ul></section>
    <section tabIndex={-1} id="Video" className={`${styles.section} ${styles.videoStage}`} aria-label="Pocket Vinyl product video">
      <video ref={videoRef} className={styles.video} autoPlay={!reduceMotion} muted={!watching} loop={!watching} controls={watching} playsInline preload="metadata" poster={heroPhotos[0]} onPlay={() => setPaused(false)} onPause={() => setPaused(true)} aria-label="Pocket Vinyl product demonstration"><source src="/media/pocket-vinyl-video.mp4" type="video/mp4"/>Your browser does not support this video.</video>
      {!watching && <div className={styles.videoActions}><button type="button" onClick={watchVideo}><span aria-hidden="true">▶</span> Watch Video</button><button type="button" aria-label={paused ? "Play video preview" : "Pause video preview"} onClick={() => { const video = videoRef.current; if (!video) return; if (video.paused) void video.play().catch(() => {}); else video.pause(); }}>{paused ? "Play preview" : "Pause preview"}</button></div>}
    </section>
    <section className={`${storyStyles.story} ${styles.vinylStoryCloseup}`} style={{backgroundImage:"linear-gradient(to right,#000 0%,#0000 100%),url('/media/pocket-vinyl-discover-black.png')"}} aria-labelledby="discover-heading">
      <div className={storyStyles.intro}><div className={storyStyles.copy}><span className={storyStyles.eyebrow}>YOUR MUSIC, YOUR VINYL</span><h2 id="discover-heading">Discover<br/>Pocket Vinyl</h2><h3><Bluetooth size={24} aria-hidden="true"/>Play your own music</h3><p>Connect your device, play your favourite music and record it to Pocket Vinyl.</p></div></div>
      <div className={storyStyles.cards}>
        <article><div className={storyStyles.illustration} aria-hidden="true"><Bluetooth/><span className={storyStyles.genre}>BT WIRELESS</span></div><h3>Connect wirelessly</h3><p>Connect your device to Pocket Vinyl using BT wireless.</p></article>
        <article><div className={storyStyles.illustration} aria-hidden="true"><Music2/><span className={storyStyles.genre}>YOUR MUSIC APPS</span></div><h3>Play your music</h3><p>Play music from your favourite app on the connected device.</p></article>
        <article><div className={storyStyles.illustration} aria-hidden="true"><CircleDot/><span className={storyStyles.genre}>4 RECORDABLE SONGS</span></div><h3>Record your song</h3><p>Hold a SONG button for 2 seconds to record to Pocket Vinyl.</p></article>
      </div>
    </section>
    <section className={`${styles.section} ${styles.controlsOverview}`} aria-label="Pocket Vinyl controls overview"><div className={styles.assetPlaceholder}><p>Controls diagram coming soon.</p></div></section>
    <section tabIndex={-1} id="ThreeSixty" className={`${styles.section} ${styles.threeSixty}`} aria-labelledby="three-sixty-heading"><span className="eyebrow">EVERY ANGLE</span><h2 id="three-sixty-heading">360°</h2><div className={styles.assetPlaceholder}><p>360° product view coming soon.</p></div></section>
    <section tabIndex={-1} id="Specifications" className={styles.section} aria-labelledby="specifications-heading"><div className={styles.specLayout}>
      <div id="ProductImage" className={styles.specImages}><h2 id="specifications-heading">Specifications</h2><div className={styles.gallery}><img src={galleryImages[selected]} alt={`Pocket Vinyl product image ${selected + 1}`} loading="lazy"/></div><div className={styles.thumbnails} aria-label="Choose product image">{galleryImages.map((url,index) => <button key={url} type="button" aria-label={`View image ${index+1}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><img src={url} alt="" loading="lazy"/></button>)}</div></div>
      <div className={styles.specContent}>
        <details open><summary><span><FileText size={20} aria-hidden="true"/>Product details</span></summary><dl className={styles.specifications}><div><dt>Category</dt><dd>{topic.label} / {entry?.displayLabel ?? entry?.label}</dd></div><div><dt>Item number</dt><dd>Details coming soon</dd></div><div><dt>Item name</dt><dd>Pocket Vinyl</dd></div><div><dt>Description</dt><dd>Wireless audio streaming and recording with a 5W built-in speaker and LED disco lights.</dd></div><div><dt>Colour</dt><dd>Details coming soon</dd></div></dl></details>
        <details open><summary><span><SlidersHorizontal size={20} aria-hidden="true"/>Specifications</span></summary><dl className={styles.specifications}>{specifications.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></details>
        <details id="WhereToBuy" open className={styles.whereToBuy}><summary><span><Store size={20} aria-hidden="true"/>Where to Buy</span></summary><div className={styles.retailerRows}>{["France", "Germany", "Italy", "Spain"].map(country => <div className={styles.retailerRow} key={country}><span>{country}</span><div className={styles.retailerSpace} aria-label={`Retailer logos for ${country}, coming soon`}/></div>)}</div></details>
        <details><summary><span><Download size={20} aria-hidden="true"/>Downloads</span></summary><p>Product manual coming soon.</p></details>
        <details><summary><span><CircleHelp size={20} aria-hidden="true"/>FAQs</span></summary><h3>How do I record a song?</h3><p>Connect via BT wireless, play music from your app and hold a SONG button for 2 seconds.</p><h3>How is Pocket Vinyl powered?</h3><p>Use USB-C power or 2 AAA batteries. Batteries are not included.</p><h3>What age is it for?</h3><p>The packaging recommends ages 8 and over.</p></details>
      </div>
    </div></section>
    <section className={styles.productScene} aria-label="Pocket Vinyl product showcase"><img src="/media/pocket-vinyl-discover-black.png" alt="Pocket Vinyl" loading="lazy"/></section>
    <section tabIndex={-1} id="Support" className={`${styles.section} ${styles.support}`} aria-labelledby="support-heading"><div><span className="eyebrow">LET’S TALK SOUND</span><h2 id="support-heading">More about Pocket Vinyl</h2><p>Questions about Pocket Vinyl? Get in touch.</p></div><Link className="button dark-button" to="/contact?product=pocket-vinyl">Enquire about this product<ArrowUpRight size={18}/></Link></section>
    {createPortal(<button type="button" className={styles.backToTop} aria-label="Back to top of product page" title="Back to top" onClick={() => window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"})}><ArrowUp size={18} aria-hidden="true"/></button>,document.body)}
  </article>;
}
