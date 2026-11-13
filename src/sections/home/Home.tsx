import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
} from "lucide-react";
import { useHomeMotion } from "../../hooks/useHomeMotion";
import { HeroSoundWaves, WaveMotionContext } from "./HeroSoundWaves";
import { ProductHero } from "./ProductHero";
import { ProductDeck } from "./ProductDeck";
import { useContent } from "../../hooks/useContent";
import { usePage } from "../../hooks/usePage";
import { LightAtmosphere as Light } from "../../components/effects/LightAtmosphere";
import {
  PictureView,
} from "../../components/ui/ContentCards";
import { VideoGrid } from "../../components/ui/VideoGrid";
import { track } from "../../lib/analytics";
import styles from "./Home.module.css";

function SoundDivider() {
  return <div className={styles.soundDivider} aria-hidden="true" data-sound-divider><i /></div>;
}

export function Home() {
  const data = useContent();
  const [motion, setMotion] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { setReduced(preference.matches); setMotion(!preference.matches); };
    sync(); preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  const root = useRef<HTMLDivElement>(null);
  const featured =
    data.home.featuredProducts?.map(id => data.products.find(p => p.id === id)).find(Boolean) ||
    data.products[0];
  const spotlight = data.home.spotlight;
  const news = (data.home.featuredNews?.length
    ? data.home.featuredNews.map(id => data.news.find(post => post.id === id)).filter(post => !!post)
    : data.news).slice(0, 3);
  usePage(
    "iDance",
    data.settings.seo?.description,
    data.home.heroImage?.url,
  );
  useHomeMotion(root);
  return (
    <WaveMotionContext.Provider value={motion}>
    <div ref={root} className={styles.home} data-scene-motion={motion && !reduced}>
      <HeroSoundWaves />
      <button className={styles.motionControl} onClick={() => setMotion(value => !value)} aria-pressed={motion} title={reduced ? "Reduced motion is on. Decorative glass stays still." : "Control decorative background motion"}>
        {motion ? "Pause glass motion" : "Play glass motion"}
      </button>
      <ProductHero />
      <ProductDeck />
      <section
        id="find-your-sound"
        className={`section dark ${styles.useCases} ${styles.withParticleBackdrop}`}
      >
        <SoundDivider />
        <div className="container" data-reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow">A SOUND FOR EVERY SIDE OF YOU</span>
              <h2>Find your sound</h2>
            </div>
            <p>
              Big nights. Small moments.
              <br />
              Make them yours.
            </p>
          </div>
          <div className={styles.useGrid}>
            {data.useCases.map((u, i) => (
              <Link
                className={styles.useCard}
                data-scene={["karaoke", "party", "family", "creative"][i % 4]}
                key={u.id}
                to={`/products?category=${u.categories[0] || ""}`}
              >
                <PictureView picture={u.image} />
                <span className={styles.useIndex}>0{i + 1}</span>
                <div>
                  <span className="eyebrow">{u.description}</span>
                  <h3>{u.title}</h3>
                </div>
                <ArrowUpRight />
              </Link>
            ))}
          </div>
        </div>
      </section>
      {featured && (
        <section id="spotlight" className={`section light ${styles.featured} ${styles.withParticleBackdrop}`} data-featured>
          <Light variant="refraction" color="#d9f4ff" intensity={0.3} />
          <div className={`container ${styles.featuredInner}`} data-reveal>
            <div className={styles.featuredImage}>
              <div className={styles.featureCircle} data-feature-depth />
              <div className={styles.featureProduct} data-feature-product>
                {data.demo ? <img src="/media/xd301-angled-preview.png" alt="Angled preview rendering of the iDance XD301 portable DJ station with dual turntables and illuminated sound pads" width={1536} height={1024} style={{ width:"100%",height:"100%",objectFit:"contain" }} /> : <PictureView picture={spotlight?.image || featured.images[0]} />}
              </div>
              <span>01 / THE SPOTLIGHT</span>
            </div>
            <div className={styles.featuredCopy}>
              <span className="eyebrow muted">{spotlight?.eyebrow || "MEET THE XD301"}</span>
              <h2>
                {data.demo ? <>Your mix,<br />Your moment</> : spotlight?.title || featured.name}
              </h2>
              <p>
                {data.demo ? "Mix, scratch and play with the iDance XD301 portable DJ station." : spotlight?.description || featured.summary}
              </p>
              <ul>
                {(data.demo ? ["Dual turntables and 16 LED sound pads", "Gesture-controlled Space Control", "Rechargeable battery for portable play"] : spotlight?.features || featured.features).map((f) => (
                  <li key={f}>
                    <AudioLines size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                className="button dark-button"
                to={data.demo ? "/products/xd301" : `/products/${featured.slug}`}
              >
                {data.demo ? "Explore XD301" : spotlight?.ctaLabel || "Explore product"} <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        <SoundDivider />
      </section>
      )}
      <section className={`section light ${styles.experience} ${styles.homeTV}`}>
        <div className="container" data-reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPERIENCE iDANCE</span>
              <h2 className="sound-video-heading">{data.home.videosHeading}</h2>
            </div>
            <Link className="text-link" to="/tv">
              Explore iDance TV <ArrowUpRight size={18} />
            </Link>
          </div>
          <VideoGrid
            variant="home"
            videos={(data.home.featuredVideos?.length
              ? data.videos.filter((v) =>
                  data.home.featuredVideos.includes(v.id),
                )
              : data.videos
            ).slice(0, 3)}
          />
        </div>
        <SoundDivider />
      </section>
      <section id="news" className={`section light ${styles.newsSection} ${styles.withParticleBackdrop}`} aria-labelledby="news-title">
        <div className="container">
          <div className="section-heading"><div><span className="eyebrow muted">WHAT’S NEXT</span><h2 id="news-title">{data.home.newsHeading || "News"}</h2></div>{data.demo && <span className={styles.newsBadge}>DEMO · CONTENT COMING SOON</span>}</div>
          {(data.demo || data.home.newsIntro) && <p className={styles.newsIntro}>{data.demo ? "A place for future iDance updates. These are layout placeholders, not published company news." : data.home.newsIntro}</p>}
          <div className={styles.newsList}>
            {data.demo ? [['01','Product updates','New releases and product announcements will appear here.'],['02','Events & community','Upcoming events and community stories will appear here.'],['03','Behind the sound','Brand stories and creative inspiration will appear here.']].map(([n,title,description]) => <article key={n}><span>{n}</span><div><small>PLACEHOLDER</small><h3>{title}</h3><p>{description}</p></div><span className={styles.newsSoon}>Coming soon</span></article>) : news.map((post, index) => <article key={post.id}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{post.category}</small><h3><Link to={`/news/${post.slug}`}>{post.title}</Link></h3><p>{post.excerpt}</p></div><Link className={styles.newsSoon} to={`/news/${post.slug}`} aria-label={`Read ${post.title}`}>Read story <ArrowUpRight size={15} /></Link></article>)}
            {!data.demo && !news.length && <p>No news published yet.</p>}
          </div>
        </div>
        <SoundDivider />
      </section>
      <section className={`${styles.brandCta} ${styles.withParticleBackdrop}`} data-brand-cta>
        <span className="eyebrow" data-cta-reveal>GOOD MOMENTS START WITH SOUND</span>
        <h2 data-cta-reveal>{data.home.cta}</h2>
        <div className="button-row" data-cta-reveal>
          <Link className="button" to="/products" data-cta-link="products">
            Explore products <ArrowRight size={18} />
          </Link>
          <Link
            className="text-link"
            data-cta-link="contact"
            to="/contact"
            onClick={() => track("contact_click", { source: "home_cta" })}
          >
            Let’s talk <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </div>
    </WaveMotionContext.Provider>
  );
}
