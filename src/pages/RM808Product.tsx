import { createPortal } from "react-dom";
import { useState, type MouseEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUp, ArrowUpRight, Store, FileText, SlidersHorizontal, Download, CircleHelp, Grid3X3, Tablet, Battery, Music2, Bluetooth, AudioLines, WandSparkles } from "lucide-react";
import { pendingProducts, type PendingProduct } from "../data/pendingProductLists";
import { productTopics, slugifyTopic } from "../data/productTopics";
import { ProductFamilyNavigation } from "../components/layout/ProductFamilyNavigation";
import styles from "./XD301Product.module.css";
import story from "./XD301FeatureStory.module.css";
import local from "./RM808Product.module.css";

// Facts from owner-supplied RM-808 English giftbox, 13 March 2023.
// The controller requires an iPad/X808 app; iPad is not included.
const features = [
  { Icon:Tablet, title:"Groove box controller for iPad" },
  { Icon:Bluetooth, title:"BT wireless control for the X808 app" },
  { Icon:Grid3X3, title:"Beat steps and synth bass" },
  { Icon:SlidersHorizontal, title:"Hands-on mixer controls" },
  { Icon:WandSparkles, title:"Effects for bass and drums" },
  { Icon:Battery, title:"Rechargeable battery" },
];
const galleryImages = ["/media/rm808/angle.png", "/media/rm808/front.png"];
const summary = "Build beats, shape synth bass and control your mix with RM-808 and the X808 app on your iPad.";
const specifications = [
  ["Product type", "Groove box controller for iPad"],
  ["Companion app", "X808"], ["Compatibility", "iPad only; iPadOS 12.0 or later"],
  ["Connection", "BT wireless control"], ["Beat creation", "Beat steps"],
  ["Sound controls", "Synth bass and effects; controller mixer"],
  ["Effects", "Effects for bass and drums"], ["Power", "Rechargeable battery"],
  ["Please note", "iPad not included"],
];
export function RM808Product({ product }: { product: PendingProduct }) {
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
      <img src="/media/rm808/hero-studio-v2.webp" alt="RM-808 groove box controller, angled view" width={2048} height={1536} fetchPriority="high"/>
      <div className={styles.campaignCopy}><h1>RM-808</h1><p>Groove Box Controller for iPad</p><a className={styles.heroBuy} href="#WhereToBuy" onClick={scrollToSection}>Where to Buy<ArrowUpRight size={16} aria-hidden="true"/></a></div>
    </div>
    <nav className={styles.sectionNav} aria-label="RM-808 page sections" onClick={scrollToSection}><strong>RM-808</strong><a href="#Features">Features</a><a href="#Video">Video</a><a href="#ThreeSixty">360°</a><a href="#Specifications">Specifications</a><a href="#Support">Support</a></nav>
    <section tabIndex={-1} id="Features" className={`${styles.section} ${styles.features}`} aria-labelledby="features-heading">
      <span className="eyebrow">YOUR IPAD, YOUR GROOVE</span><h2 id="features-heading">Step, Shape, Mix</h2><p className={styles.lead}>{summary}</p>
      <ul className={styles.featureGrid}>{features.map(({Icon,title}) => <li key={title}><Icon className={styles.featureIcon} size={32} strokeWidth={1.4} aria-hidden="true"/><h3>{title}</h3></li>)}</ul>
    </section>
    <section tabIndex={-1} id="Video" className={`${styles.section} ${styles.videoStage}`} aria-label="RM-808 product video"><div className={`${local.placeholder} ${local.videoPlaceholder}`}><p>Product video coming soon.</p></div></section>
    <section className={`${story.story} ${local.story}`} aria-labelledby="discover-heading">
      <div className={story.intro}><div className={story.copy}><span className={story.eyebrow}>TAKE CONTROL OF YOUR SOUND</span><h2 id="discover-heading">Your beats,<br/>Your hands-on control</h2><h3><Bluetooth size={24} aria-hidden="true"/>Connect without the cable</h3><p>Connect RM-808 to your iPad via BT wireless and control the X808 app directly from the controller.</p></div></div>
      <div className={story.cards}>
        <article><div className={story.illustration} aria-hidden="true"><Grid3X3/><span className={story.genre}>BEAT STEPS</span></div><h3>Start with a rhythm</h3><p>Work with beat steps in the X808 app using RM-808’s hands-on controls.</p></article>
        <article><div className={story.illustration} aria-hidden="true"><Music2/><span className={story.genre}>SYNTH BASS · EFFECTS</span></div><h3>Shape your sound</h3><p>Explore synth bass and effects, then use effects for bass and drums to change the character of your groove.</p></article>
        <article><div className={story.illustration} aria-hidden="true"><AudioLines/><span className={story.genre}>CONTROLLER MIXER</span></div><h3>Bring it into the mix</h3><p>Use the controller mixer to work with the sounds from your iPad.</p><p className={story.note}>Requires an iPad with iPadOS 12.0 or later and the X808 app. iPad not included.</p></article>
      </div>
    </section>
    <section className={`${styles.section} ${styles.controlsOverview}`} aria-label="RM-808 controls overview"><div className={local.placeholder}><p>Controls diagram coming soon.</p></div></section>
    <section tabIndex={-1} id="ThreeSixty" className={`${styles.section} ${styles.threeSixty}`} aria-labelledby="three-sixty-heading"><span className="eyebrow">EVERY ANGLE</span><h2 id="three-sixty-heading">360°</h2><div className={local.placeholder}><p>360° product view coming soon.</p></div></section>
    <section tabIndex={-1} id="Specifications" className={styles.section} aria-labelledby="specifications-heading"><div className={styles.specLayout}>
      <div id="ProductImage" className={styles.specImages}><h2 id="specifications-heading">Specifications</h2><div className={styles.gallery}><img src={galleryImages[selected]} alt={`RM-808 product view ${selected+1}`} width={2048} height={1536} loading="lazy"/></div><div className={styles.thumbnails} aria-label="Choose product image">{galleryImages.map((url,index) => <button key={url} type="button" aria-label={`View image ${index+1}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><img src={url} alt="" width={112} height={84} loading="lazy"/></button>)}</div></div>
      <div className={styles.specContent}>
        <details open><summary><span><FileText size={20} aria-hidden="true"/>Product details</span></summary><dl className={styles.specifications}><div><dt>Category</dt><dd>{topic.label} / {entry?.displayLabel ?? entry?.label}</dd></div><div><dt>Item number</dt><dd>RM-808</dd></div><div><dt>Item name</dt><dd>RM-808 Groove Box Controller for iPad</dd></div><div><dt>Description</dt><dd>{summary}</dd></div><div><dt>Colour</dt><dd>Black</dd></div></dl></details>
        <details open><summary><span><SlidersHorizontal size={20} aria-hidden="true"/>Specifications</span></summary><dl className={styles.specifications}>{specifications.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></details>
        <details id="WhereToBuy" open className={styles.whereToBuy}><summary><span><Store size={20} aria-hidden="true"/>Where to Buy</span></summary><div className={styles.retailerRows}>{["France","Germany","Italy","Spain"].map(country => <div className={styles.retailerRow} key={country}><span>{country}</span><div className={styles.retailerSpace} aria-label={`Retailer logos for ${country}, coming soon`}/></div>)}</div></details>
        <details><summary><span><Download size={20} aria-hidden="true"/>Downloads</span></summary><p>Product manual coming soon.</p></details>
        <details><summary><span><CircleHelp size={20} aria-hidden="true"/>FAQs</span></summary><p>Product FAQs coming soon.</p></details>
      </div>
    </div></section>
    <section className={styles.productScene} aria-label="RM-808 product showcase"><img src={galleryImages[1]} alt="RM-808 groove box controller, front view" width={2048} height={1079} loading="lazy"/></section>
    <section tabIndex={-1} id="Support" className={`${styles.section} ${styles.support}`} aria-labelledby="support-heading"><div><span className="eyebrow">LET’S TALK SOUND</span><h2 id="support-heading">More about RM-808</h2><p>Questions about RM-808? Get in touch.</p></div><Link className="button dark-button" to="/contact?product=rm808">Enquire about this product<ArrowUpRight size={18}/></Link></section>
    {createPortal(<button type="button" className={styles.backToTop} aria-label="Back to top of product page" title="Back to top" onClick={() => window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"})}><ArrowUp size={18} aria-hidden="true"/></button>,document.body)}
  </article>;
}
