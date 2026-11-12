import { AllProductCatalogue } from "../components/layout/AllProductCatalogue";
import { pendingProducts } from "../data/pendingProductLists";
import { PendingProductDetail } from "./Categories";
import { useAboutMotion } from "../hooks/useAboutMotion";
import aboutStyles from "./About.module.css";
import { ProductFamilyNavigation } from "../components/layout/ProductFamilyNavigation";
import { getTopicProducts, productTopics } from "../data/productTopics";
import { XD301Product } from "./XD301Product";
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { PortableText } from "@portabletext/react";
import { ArrowUpRight, Download, Check } from "lucide-react";
import { useContent } from "../hooks/useContent";
import { usePage } from "../hooks/usePage";
import {
  PictureView,
  ProductCard,
  NewsCard,
} from "../components/ui/ContentCards";
import { TVLibrary } from "../components/ui/TVLibrary";
import { item, track } from "../lib/analytics";
export function Products() {
  const data = useContent();
  const [params] = useSearchParams();
  const topic = productTopics.find(item => item.id === params.get("topic"));
  usePage("Explore Products");
  if (!topic) return <AllProductCatalogue />;
  const firstProduct = getTopicProducts(data, topic)[0];
  const firstPending = pendingProducts.find(product => product.topicId === topic.id);
  const slug = firstProduct?.slug ?? firstPending?.slug;
  if (slug) return <Navigate to={`/products/${encodeURIComponent(slug)}?topic=${encodeURIComponent(topic.id)}&collection=all`} replace />;
  return <ProductFamilyNavigation topicId={topic.id} />;
}

export function ProductDetail() {
  const { slug } = useParams();
  const data = useContent();
  const p = data.products.find((p) => p.slug === slug);
  const pending = pendingProducts.find(product => product.slug === slug);
  const [selected, setSelected] = useState(0);
  const seen = useRef("");
  usePage(
    p?.seo?.title || p?.name || pending?.name || "Product not found",
    p?.seo?.description || p?.summary || (pending ? `Product details for ${pending.name} are coming soon.` : undefined),
    p?.images[0]?.url,
  );
  useEffect(() => {
    setSelected(0);
    if (p && seen.current !== p.id) {
      seen.current = p.id;
      track("view_item", { items: [item(p)] });
    }
  }, [p]);
  useEffect(() => {
    if (!p || p.demo) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: p.summary,
      image: p.images.map((i) => i.url),
      category: p.category.name,
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [p]);
  if (!p && pending) return <PendingProductDetail product={pending} />;
  if (!p) return <NotFound />;
  if (p.slug === "xd301") return <XD301Product key={p.id} product={p} />;
  const related = data.products
    .filter(
      (r) =>
        r.id !== p.id &&
        (p.relatedProducts?.length
          ? p.relatedProducts.includes(r.id)
          : r.category.id === p.category.id),
    )
    .slice(0, 3);
  return (
    <section className="page light product-detail-page" data-product={p.slug}>
      <div className="container">
        <Link className="text-link" to={`/products?category=${encodeURIComponent(p.category.slug)}`}>
          ← Back to collection
        </Link>
        <div className="detail-grid">
          <div>
            <div className="detail-image" data-image-index={selected}>
              <PictureView
                picture={p.images[selected] || p.images[0]}
                priority
              />
            </div>
            {p.slug === "xd301" && <p className="product-image-caption">{selected === 0 ? "Product visualisation. See the original product image for printed details." : "Original supplied product image."}</p>}
            {p.images.length > 1 && (
              <div className="thumbnails">
                {p.images.map((img, i) => (
                  <button
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={selected === i}
                    key={img.url}
                    onClick={() => setSelected(i)}
                  >
                    <PictureView picture={img} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <span className="eyebrow muted">{p.slug === "xd301" ? "DJ / DJ MIXER / PORTABLE DJ STATION" : p.category.name}</span>
            <h1>{p.name}</h1>
            <p className="intro">{p.summary}</p>
            {p.demo && (
              <p className="demo-notice">
                Demo product. This concept is not an official iDance product
                listing.
              </p>
            )}
            {p.description && <PortableText value={p.description} />}
            <ul className="feature-list">
              {p.features.map((f) => (
                <li key={f}>
                  <Check size={18} />
                  {f}
                </li>
              ))}
            </ul>
            {!!p.specifications?.length && (
              <dl className="specifications">
                {p.specifications.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <Link
              className="button dark-button"
              to={`/contact?product=${encodeURIComponent(p.slug)}`}
              onClick={() => track("contact_click", { source: "product" })}
            >
              Enquire about this product <ArrowUpRight size={18} />
            </Link>
            {p.manual && (
              <a
                className="text-link manual"
                href={p.manual}
                target="_blank"
                rel="noreferrer"
                onClick={() => track("file_download", { item_id: p.id })}
              >
                <Download size={18} />
                Download manual
              </a>
            )}
          </div>
        </div>
        {related.length > 0 && (
          <>
            <h2>More to discover</h2>
            <div className="product-grid">
              {related.map((r) => (
                <ProductCard product={r} key={r.id} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
export function About() {
  const { about } = useContent();
  const aboutRoot = useRef<HTMLElement>(null);
  useAboutMotion(aboutRoot);
  usePage("Our Story");
  return (
    <section ref={aboutRoot} className={`page dark ${aboutStyles.page}`}>
      <div className="container">
        <header className={aboutStyles.intro} data-about-reveal>
          <span className="eyebrow">OUR WORLD OF SOUND</span>
          <h1>{about.headline}</h1>
          <div className="prose"><PortableText value={about.body} /></div>
        </header>
        <dl className={aboutStyles.facts} data-about-reveal>
          <div><dt>Founded</dt><dd>2008</dd></div>
          <div><dt>Headquarters</dt><dd>Hong Kong</dd></div>
          <div><dt>Our approach</dt><dd>Design, Build, Distribute</dd></div>
        </dl>
        <div className={aboutStyles.stories}>
          <section data-about-reveal>
            <span className={aboutStyles.number} aria-hidden="true">01</span>
            <div><h2>More ways to make music</h2><p>Our range brings together speakers, karaoke, microphones, party lighting, musical instruments and DJ products. Sound, light and interactive play create opportunities to sing, experiment and enjoy music together.</p></div>
          </section>
          <section data-about-reveal>
            <span className={aboutStyles.number} aria-hidden="true">02</span>
            <div><h2>Designed in Hong Kong, Shared worldwide</h2><p>Our Hong Kong sales, design and creative team works alongside iDance Europe and iDance UK. With China-origin supply and warehouse support in Belgium, we serve distributors and retailers across international markets.</p></div>
          </section>
          <section data-about-reveal>
            <span className={aboutStyles.number} aria-hidden="true">03</span>
            <div><h2>Supporting our retail partners</h2><p>We support product launches and retail presentation with product photography, lifestyle imagery, localized packaging and in-store displays. Our digital music experiences extend the possibilities for karaoke, keyboards, drums, mixing and creative play.</p></div>
          </section>
        </div>
        <div className={aboutStyles.actions} data-about-reveal>
          <Link className="button" to="/products">Find your sound <ArrowUpRight size={18} /></Link>
          <Link className={aboutStyles.contact} to="/contact">Talk to our team <ArrowUpRight size={18} /></Link>
        </div>
      </div>
    </section>
  );
}
export function TV() {
  const { videos } = useContent();
  usePage("iDance TV");
  return <TVLibrary videos={videos} />;
}
export function News() {
  const { news } = useContent();
  usePage("News & Stories");
  return (
    <section className="page light">
      <div className="container">
        <span className="eyebrow muted">FROM OUR WORLD</span>
        <h1>Stories worth sharing</h1>
        <div className="news-grid">
          {news.map((n) => (
            <NewsCard key={n.id} post={n} />
          ))}
        </div>
        {!news.length && <p>Stories are coming soon.</p>}
      </div>
    </section>
  );
}
export function NewsDetail() {
  const { slug } = useParams();
  const { news } = useContent();
  const p = news.find((n) => n.slug === slug);
  usePage(
    p?.seo?.title || p?.title || "Story not found",
    p?.seo?.description || p?.excerpt,
    p?.cover.url,
  );
  if (!p) return <NotFound />;
  return (
    <article className="page light">
      <div className="container narrow">
        <Link className="text-link" to="/news">
          ← All stories
        </Link>
        <p className="eyebrow muted">
          {p.category} / {p.date}
        </p>
        <h1>{p.title}</h1>
        {p.demo && (
          <p className="demo-notice">
            Sample story — not an official brand announcement.
          </p>
        )}
        <PictureView className="article-cover" picture={p.cover} priority />
        <div className="prose">
          <PortableText value={p.body} />
        </div>
      </div>
    </article>
  );
}
export function Contact() {
  const { settings, products } = useContent();
  const [params] = useSearchParams();
  const product = products.find((p) => p.slug === params.get("product"));
  const [feedback, setFeedback] = useState(false);
  usePage("Contact");
  return (
    <section className="page light">
      <div className="container contact-grid">
        <div>
          <span className="eyebrow muted">LET’S TALK SOUND</span>
          <h1>Start a conversation</h1>
          <p className="intro">
            Have a product question or an idea to share? We’d love to connect.
          </p>
          {settings.email && (
            <a className="text-link" href={`mailto:${settings.email}`}>
              {settings.email}
            </a>
          )}
          {settings.phone && <p>{settings.phone}</p>}
          <p className="demo-notice">
            Demo form — submission is not configured. No information is sent or
            saved.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFeedback(true);
          }}
        >
          <label className="field">
            Your name
            <input name="name" autoComplete="name" required maxLength={100} />
          </label>
          <label className="field">
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          <label className="field">
            Subject
            <input
              name="subject"
              required
              defaultValue={product ? `Product enquiry: ${product.name}` : ""}
              maxLength={200}
            />
          </label>
          <label className="field">
            Your message
            <textarea name="message" required rows={5} maxLength={5000} />
          </label>
          <button className="button dark-button" type="submit">
            Check enquiry <ArrowUpRight size={18} />
          </button>
          {feedback && (
            <p role="status" className="demo-notice">
              Your fields are valid. Nothing has been sent: this demo has no
              submission service connected.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
export function Privacy() {
  usePage("Privacy information");
  return (
    <section className="page light">
      <div className="container narrow">
        <h1>Privacy information</h1>
        <p className="intro">
          The formal privacy and cookie policies are pending.
        </p>
        <p>
          Optional analytics is off until you accept it. You can change your
          choice using Cookie settings in the footer. This preview does not
          submit contact forms.
        </p>
        <p>
          This page is a configuration notice, not a published legal policy.
        </p>
      </div>
    </section>
  );
}
export function NotFound() {
  usePage("Page not found");
  return (
    <section className="page light">
      <div className="container narrow">
        <span className="eyebrow muted">404 / LOST THE RHYTHM?</span>
        <h1>Let’s find your way back</h1>
        <p>The page or product you’re looking for isn’t here.</p>
        <Link className="button dark-button" to="/">
          Back to iDance <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}
