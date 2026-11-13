import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUp, ArrowUpRight, Store, FileText, SlidersHorizontal, Download, CircleHelp, Grid3X3, Mic, Speaker, Battery, Music2, Bluetooth, AudioLines, Disc3 } from "lucide-react";
import { pendingProducts, type PendingProduct } from "../data/pendingProductLists";
import { productTopics, slugifyTopic } from "../data/productTopics";
import { ProductFamilyNavigation } from "../components/layout/ProductFamilyNavigation";
import styles from "./XD301Product.module.css";
import story from "./XD301FeatureStory.module.css";
import local from "./MasterMixProduct.module.css";

gsap.registerPlugin(ScrollTrigger);

// Facts checked against owner-supplied MASTER MIX gift box, updated 3 March 2025.
// Giftbox dimensions are packaging dimensions, not product dimensions.
const features = [
  { Icon:Music2, title:"12 songs to start your mix" },
  { Icon:SlidersHorizontal, title:"4 independent track-volume faders" },
  { Icon:Grid3X3, title:"12 soundpads with 576 sounds" },
  { Icon:Disc3, title:"5 DJ effects to shape your performance" },
  { Icon:Speaker, title:"Built-in 20W speakers" },
  { Icon:Battery, title:"Rechargeable battery, 4–8 hours of playback" },
];
const galleryImages = ["/media/mastermix/front.png", "/media/mastermix/angle.png", "/media/mastermix/rear.png"];
const summary = "Mix four tracks, play 576 sounds and shape your performance with hands-on faders and DJ effects.";
const specifications = [
  ["Built-in songs", "12 songs"], ["Track mixer", "4 volume faders: kick/snare, hi-hat, bass and synth/guitars"],
  ["Soundpads", "12 pads with 576 sounds"],
  ["Pad categories", "Piano/strings, drums, DJ and acapellas"],
  ["DJ effects", "Repeater, delay, 2-band EQ, slicer and pitch control"],
  ["Equalizer", "Bass and treble controls"], ["Pitch control", "Separate controls for songs and pads"],
  ["Playback", "BT wireless streaming and USB MP3"], ["Speakers", "Built-in 20W speakers"],
  ["Microphone", "Microphone input"], ["Power", "Rechargeable lithium battery"], ["Playback time", "4–8 hours"],
];
export function MasterMixProduct({ product }: { product: PendingProduct }) {
  const [params] = useSearchParams();
  const storyRoot = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-story-reveal]").forEach(element => {
          gsap.from(element, { y:24, autoAlpha:0, duration:0.65, ease:"power2.out", scrollTrigger:{trigger:element,start:"top 92%",once:true}, clearProps:"transform,opacity,visibility" });
        });
      }, storyRoot);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  const [selected, setSelected] = useState(0);
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
    target.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",block:"start"});
    (target.querySelector<HTMLElement>("summary") ?? target).focus({preventScroll:true});
  }
  return <article className={styles.page}>
    <ProductFamilyNavigation topicId={topic.id} activeEntry={entry?.label} activeProductName={product.name} hideEmptyState />
    <div className={`${styles.campaign} ${local.hero}`}>
      <img src="/media/mastermix/hero-studio-v2.webp" alt="Master Mix portable interactive mixer and looper" width={2048} height={1333} fetchPriority="high"/>
      <div className={styles.campaignCopy}><h1><img className={local.logo} src="/media/mastermix/logo.png" alt="Master Mix" width={828} height={219}/></h1><p>Portable Interactive Mixer + Looper</p><a className={styles.heroBuy} href="#WhereToBuy" onClick={scrollToSection}>Where to Buy<ArrowUpRight size={16} aria-hidden="true"/></a></div>
    </div>
    <nav className={styles.sectionNav} aria-label="Master Mix page sections" onClick={scrollToSection}><strong>MASTER MIX</strong><a href="#Features">Features</a><a href="#Video">Video</a><a href="#ThreeSixty">360°</a><a href="#Specifications">Specifications</a><a href="#Support">Support</a></nav>
    <section tabIndex={-1} id="Features" className={`${styles.section} ${styles.features}`} aria-labelledby="features-heading">
      <span className="eyebrow">MAKE THE MIX YOURS</span><h2 id="features-heading">Mix, Loop, Perform</h2><p className={styles.lead}>{summary}</p>
      <ul className={styles.featureGrid}>{features.map(({Icon,title}) => <li key={title}><Icon className={styles.featureIcon} size={32} strokeWidth={1.4} aria-hidden="true"/><h3>{title}</h3></li>)}</ul>
    </section>
    <section tabIndex={-1} id="Video" className={`${styles.section} ${styles.videoStage}`} aria-label="Master Mix product video"><div className={`${local.placeholder} ${local.videoPlaceholder}`}><p>Product video coming soon.</p></div></section>
    <section ref={storyRoot} className={`${story.story} ${local.story}`} aria-labelledby="discover-heading">
      <div className={story.intro} data-story-reveal><div className={story.copy}><span className={story.eyebrow}>BRING YOUR MUSIC</span><h2 id="discover-heading">Your tracks,<br/>Your own mix</h2><h3><Bluetooth size={24} aria-hidden="true"/>Play your own tracks</h3><p>Stream music wirelessly over Bluetooth or play MP3 files from USB, then mix your music with Master Mix.</p></div></div>
      <div className={story.cards}>
        <article data-story-reveal><div className={story.illustration} aria-hidden="true"><Music2/><span className={story.genre}>HIP HOP · ELECTRO · HOUSE</span></div><h3>Find your starting groove</h3><p>Explore 12 built-in songs recorded with real musicians, with loops, riffs and licks to make your own mix.</p></article>
        <article data-story-reveal><div className={story.illustration} aria-hidden="true"><AudioLines/><span className={story.genre}>DJ SLICER · REPEATER</span></div><h3>Reshape the rhythm</h3><p>Loop songs in real time with the DJ slicer, or use the repeater effect to add movement to your soundpads.</p></article>
        <article data-story-reveal><div className={story.illustration} aria-hidden="true"><Mic/><span className={story.genre}>MIC INPUT</span></div><h3>Add your voice</h3><p>Connect a microphone to sing along with the integrated mixer or your Bluetooth music.</p></article>
      </div>
    </section>
    <section className={`${styles.section} ${styles.controlsOverview}`} aria-label="Master Mix controls overview"><div className={local.placeholder}><p>Controls diagram coming soon.</p></div></section>
    <section tabIndex={-1} id="ThreeSixty" className={`${styles.section} ${styles.threeSixty}`} aria-labelledby="three-sixty-heading"><span className="eyebrow">EVERY ANGLE</span><h2 id="three-sixty-heading">360°</h2><div className={local.placeholder}><p>360° product view coming soon.</p></div></section>
    <section tabIndex={-1} id="Specifications" className={styles.section} aria-labelledby="specifications-heading"><div className={styles.specLayout}>
      <div id="ProductImage" className={styles.specImages}><h2 id="specifications-heading">Specifications</h2><div className={styles.gallery}><img src={galleryImages[selected]} alt={`Master Mix product view ${selected+1}`} width={2048} height={1333} loading="lazy"/></div><div className={styles.thumbnails} aria-label="Choose product image">{galleryImages.map((url,index) => <button key={url} type="button" aria-label={`View image ${index+1}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><img src={url} alt="" width={112} height={84} loading="lazy"/></button>)}</div></div>
      <div className={styles.specContent}>
        <details open><summary><span><FileText size={20} aria-hidden="true"/>Product details</span></summary><dl className={styles.specifications}><div><dt>Category</dt><dd>{topic.label} / {entry?.displayLabel ?? entry?.label}</dd></div><div><dt>Item number</dt><dd>MASTER MIX</dd></div><div><dt>Item name</dt><dd>Master Mix Portable Interactive Mixer + Looper</dd></div><div><dt>Description</dt><dd>{summary}</dd></div><div><dt>Colour</dt><dd>Black</dd></div></dl></details>
        <details open><summary><span><SlidersHorizontal size={20} aria-hidden="true"/>Specifications</span></summary><dl className={styles.specifications}>{specifications.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></details>
        <details id="WhereToBuy" open className={styles.whereToBuy}><summary><span><Store size={20} aria-hidden="true"/>Where to Buy</span></summary><div className={styles.retailerRows}>{["France","Germany","Italy","Spain"].map(country => <div className={styles.retailerRow} key={country}><span>{country}</span><div className={styles.retailerSpace} aria-label={`Retailer logos for ${country}, coming soon`}/></div>)}</div></details>
        <details><summary><span><Download size={20} aria-hidden="true"/>Downloads</span></summary><p>Product manual coming soon.</p></details>
        <details><summary><span><CircleHelp size={20} aria-hidden="true"/>FAQs</span></summary><p>Product FAQs coming soon.</p></details>
      </div>
    </div></section>
    <section className={styles.productScene} aria-label="Master Mix product showcase"><img src={galleryImages[2]} alt="Master Mix rear-angle product view" width={2048} height={1333} loading="lazy"/></section>
    <section tabIndex={-1} id="Support" className={`${styles.section} ${styles.support}`} aria-labelledby="support-heading"><div><span className="eyebrow">LET’S TALK SOUND</span><h2 id="support-heading">More about Master Mix</h2><p>Questions about Master Mix? Get in touch.</p></div><Link className="button dark-button" to="/contact?product=mastermix">Enquire about this product<ArrowUpRight size={18}/></Link></section>
    {createPortal(<button type="button" className={styles.backToTop} aria-label="Back to top of product page" title="Back to top" onClick={() => window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"})}><ArrowUp size={18} aria-hidden="true"/></button>,document.body)}
  </article>;
}
