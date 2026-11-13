import { createPortal } from "react-dom";
import { useState, type MouseEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUp, ArrowUpRight, Store, FileText, SlidersHorizontal, Download, CircleHelp, Grid3X3, Hand, Mic, Speaker, Battery, Music2, Bluetooth, AudioLines } from "lucide-react";
import { pendingProducts, type PendingProduct } from "../data/pendingProductLists";
import { productTopics, slugifyTopic } from "../data/productTopics";
import { ProductFamilyNavigation } from "../components/layout/ProductFamilyNavigation";
import styles from "./XD301Product.module.css";
import story from "./XD301FeatureStory.module.css";
import local from "./BeatboxProduct.module.css";

// Facts transcribed from owner-supplied BEAT BOX gift box, 31 July 2025.
// Panel counts conflict (15/16 samplers, 22/27 drums); do not publish these counts.
const features = [
  { Icon:Grid3X3, title:"4 engines with 64 sound pads" },
  { Icon:Hand, title:"Hands-free Space Control" },
  { Icon:Mic, title:"Record vocals and beatbox samples" },
  { Icon:SlidersHorizontal, title:"Bass, treble and master controls" },
  { Icon:Speaker, title:"2 speakers and wired microphone included" },
  { Icon:Battery, title:"Rechargeable battery, 4–8 hours of playback" },
];
const galleryImages = ["/media/beatbox/left.png", "/media/beatbox/top.png", "/media/beatbox/front.png"];
const summary = "Create your own mix with four sound engines, vocal sampling and hands-free Space Control.";
const specifications = [
  ["Sound pads", "64 pads"], ["Audio engines", "Sampler, effects, acapellas and drums"],
  ["Effects", "36 effects"], ["Acapellas", "24 acapellas"],
  ["Sampling", "Record vocals and beatbox samples on the fly, with pitch control and DJ effects"],
  ["Space Control", "Hand-motion control for audio effects and playback"],
  ["Equalizer", "2-band EQ: bass and treble"], ["Level controls", "XXL master level and independent microphone volume"],
  ["Connectivity", "BT wireless"], ["Included accessories", "2 speakers and 1 wired vocal microphone"],
  ["Power", "Rechargeable lithium battery"], ["Playback time", "4–8 hours"],
];
export function BeatboxProduct({ product }: { product: PendingProduct }) {
  const [params] = useSearchParams();
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
      <img src="/media/beatbox/hero-studio-v2.webp" alt="Beat Box sampler station in blue and amber studio lighting" width={1984} height={800} fetchPriority="high"/>
      <div className={styles.campaignCopy}><h1><img className={local.logo} src="/media/beatbox/logo.png" alt="Beat Box" width={818} height={189}/></h1><p>Sampler Station + Interactive Looper</p><a className={styles.heroBuy} href="#WhereToBuy" onClick={scrollToSection}>Where to Buy<ArrowUpRight size={16} aria-hidden="true"/></a></div>
    </div>
    <nav className={styles.sectionNav} aria-label="Beat Box page sections" onClick={scrollToSection}><strong>BEAT BOX</strong><a href="#Features">Features</a><a href="#Video">Video</a><a href="#ThreeSixty">360°</a><a href="#Specifications">Specifications</a><a href="#Support">Support</a></nav>
    <section tabIndex={-1} id="Features" className={`${styles.section} ${styles.features}`} aria-labelledby="features-heading">
      <span className="eyebrow">MAKE THE BEAT YOURS</span><h2 id="features-heading">Sample, Loop, Create</h2><p className={styles.lead}>{summary}</p>
      <ul className={styles.featureGrid}>{features.map(({Icon,title}) => <li key={title}><Icon className={styles.featureIcon} size={32} strokeWidth={1.4} aria-hidden="true"/><h3>{title}</h3></li>)}</ul>
    </section>
    <section tabIndex={-1} id="Video" className={`${styles.section} ${styles.videoStage}`} aria-label="Beat Box product video"><div className={`${local.placeholder} ${local.videoPlaceholder}`}><p>Product video coming soon.</p></div></section>
    <section className={`${story.story} ${local.story}`} aria-labelledby="discover-heading">
      <div className={story.intro}><div className={story.copy}><span className={story.eyebrow}>BRING YOUR OWN SOUND</span><h2 id="discover-heading">Your voice,<br/>Your next beat</h2><h3><Mic size={24} aria-hidden="true"/>Turn your voice into a sample</h3><p>Record vocals and beatbox samples with the included microphone, then add pitch changes and DJ effects to your performance.</p></div></div>
      <div className={story.cards}>
        <article><div className={story.illustration} aria-hidden="true"><Music2/><span className={story.genre}>SAMPLER · FX · ACAPELLAS · DRUMS</span></div><h3>Build your own groove</h3><p>Combine four audio engines and layer sounds, acapellas and drum loops into your music.</p></article>
        <article><div className={story.illustration} aria-hidden="true"><AudioLines/><span className={story.genre}>DRUM SLICER</span></div><h3>Reshape the rhythm</h3><p>Play and slice drum patterns in real time to add your own rhythm to the mix.</p></article>
        <article><div className={story.illustration} aria-hidden="true"><Bluetooth/><span className={story.genre}>BT WIRELESS · MIC</span></div><h3>Connect and perform</h3><p>Connect your smart device via BT wireless and sing along through the included wired microphone.</p></article>
      </div>
    </section>
    <section className={`${styles.section} ${styles.controlsOverview}`} aria-label="Beat Box controls overview"><div className={local.placeholder}><p>Controls diagram coming soon.</p></div></section>
    <section tabIndex={-1} id="ThreeSixty" className={`${styles.section} ${styles.threeSixty}`} aria-labelledby="three-sixty-heading"><span className="eyebrow">EVERY ANGLE</span><h2 id="three-sixty-heading">360°</h2><div className={local.placeholder}><p>360° product view coming soon.</p></div></section>
    <section tabIndex={-1} id="Specifications" className={styles.section} aria-labelledby="specifications-heading"><div className={styles.specLayout}>
      <div id="ProductImage" className={styles.specImages}><h2 id="specifications-heading">Specifications</h2><div className={styles.gallery}><img src={galleryImages[selected]} alt={`Beat Box product view ${selected+1}`} width={2048} height={1536} loading="lazy"/></div><div className={styles.thumbnails} aria-label="Choose product image">{galleryImages.map((url,index) => <button key={url} type="button" aria-label={`View image ${index+1}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><img src={url} alt="" width={112} height={84} loading="lazy"/></button>)}</div></div>
      <div className={styles.specContent}>
        <details open><summary><span><FileText size={20} aria-hidden="true"/>Product details</span></summary><dl className={styles.specifications}><div><dt>Category</dt><dd>{topic.label} / {entry?.displayLabel ?? entry?.label}</dd></div><div><dt>Item number</dt><dd>BEAT BOX</dd></div><div><dt>Item name</dt><dd>Beat Box Sampler Station + Interactive Looper</dd></div><div><dt>Description</dt><dd>{summary}</dd></div><div><dt>Colour</dt><dd>Black</dd></div></dl></details>
        <details open><summary><span><SlidersHorizontal size={20} aria-hidden="true"/>Specifications</span></summary><dl className={styles.specifications}>{specifications.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></details>
        <details id="WhereToBuy" open className={styles.whereToBuy}><summary><span><Store size={20} aria-hidden="true"/>Where to Buy</span></summary><div className={styles.retailerRows}>{["France","Germany","Italy","Spain"].map(country => <div className={styles.retailerRow} key={country}><span>{country}</span><div className={styles.retailerSpace} aria-label={`Retailer logos for ${country}, coming soon`}/></div>)}</div></details>
        <details><summary><span><Download size={20} aria-hidden="true"/>Downloads</span></summary><p>Product manual coming soon.</p></details>
        <details><summary><span><CircleHelp size={20} aria-hidden="true"/>FAQs</span></summary><p>Product FAQs coming soon.</p></details>
      </div>
    </div></section>
    <section className={styles.productScene} aria-label="Beat Box product showcase"><img src={galleryImages[2]} alt="Beat Box with its included microphone and two speakers" width={2048} height={1079} loading="lazy"/></section>
    <section tabIndex={-1} id="Support" className={`${styles.section} ${styles.support}`} aria-labelledby="support-heading"><div><span className="eyebrow">LET’S TALK SOUND</span><h2 id="support-heading">More about Beat Box</h2><p>Questions about Beat Box? Get in touch.</p></div><Link className="button dark-button" to="/contact?product=beatbox">Enquire about this product<ArrowUpRight size={18}/></Link></section>
    {createPortal(<button type="button" className={styles.backToTop} aria-label="Back to top of product page" title="Back to top" onClick={() => window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"})}><ArrowUp size={18} aria-hidden="true"/></button>,document.body)}
  </article>;
}
