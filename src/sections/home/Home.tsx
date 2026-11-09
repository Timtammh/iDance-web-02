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
  return (<div className={styles.soundDivider} aria-hidden="true" data-sound-divider>
          <svg viewBox="0 0 600 44" focusable="false">
            {Array.from({length:49},(_,i) => {
              const envelope = Math.sin(Math.PI * (i + 1) / 50);
              const height = 4 + envelope * (9 + ((i * 13) % 27));
              return <rect key={i} x={i * 12 + 9} y={(44-height)/2} width="4" height={height} rx="2"/>;
            })}
          </svg>
        </div>);
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
    data.products.find((p) => data.home.featuredProducts?.includes(p.id)) ||
    data.products[0];
  usePage(
    data.settings.seo?.title || "Bring Your Sound to Life",
    data.settings.seo?.description,
    data.home.heroImage?.url,
  );
  useHomeMotion(root);
  return (
    <WaveMotionContext.Provider value={motion}>
    <div ref={root} className={styles.home} data-scene-motion={motion && !reduced}>
      <HeroSoundWaves />
      <button className={styles.motionControl} onClick={() => setMotion(value => !value)} aria-pressed={motion} title={reduced ? "Reduced motion is on. Play to opt in to background animation." : "Control decorative background motion"}>
        {motion ? "Pause equalizer" : "Play equalizer"}
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
              <h2>Find your sound.</h2>
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
        <section className={`section light ${styles.featured} ${styles.withParticleBackdrop}`} data-featured>
          <Light variant="refraction" color="#d9f4ff" intensity={0.3} />
          <div className={`container ${styles.featuredInner}`} data-reveal>
            <div className={styles.featuredImage}>
              <div className={styles.featureCircle} data-feature-depth />
              <div className={styles.featureProduct} data-feature-product>
                <img src="/assets/mixer.svg" alt="Illustrative graphite DJ mixer with channel faders, knobs and illuminated performance pads" width={800} height={700} style={{ width:"100%",height:"100%",objectFit:"contain" }} />
              </div>
              <span>01 / THE SPOTLIGHT</span>
            </div>
            <div className={styles.featuredCopy}>
              <span className="eyebrow muted">TURN UP THE MOMENT</span>
              <h2>
                A little louder.
                <br />A little closer.
              </h2>
              <p>
                An illustrative mixer concept. Explore the controls, shape your sound, and bring your next set to life.
              </p>
              <ul>
                {["Mixer concept illustration", "Channel faders and performance pads", "Demo design, not product specifications"].map((f) => (
                  <li key={f}>
                    <AudioLines size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                className="button dark-button"
                to="/products"
              >
                Explore products <ArrowUpRight size={17} />
              </Link>
              {featured.demo && (
                <small className="demo-label">
                  Illustrative concept. Official product details to follow.
                </small>
              )}
            </div>
          </div>
        <SoundDivider />
      </section>
      )}
      <section className={`section dark ${styles.experience} ${styles.withParticleBackdrop}`}>
        <Light variant="spotlight" color="#9c85dd" intensity={0.5} animated />
        <div className="container" data-reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPERIENCE iDANCE</span>
              <h2>{data.home.videosHeading}</h2>
            </div>
            <Link className="text-link" to="/tv">
              Explore iDance TV <ArrowUpRight size={18} />
            </Link>
          </div>
          <VideoGrid
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
          <div className="section-heading"><div><span className="eyebrow muted">WHAT’S NEXT</span><h2 id="news-title">News</h2></div><span className={styles.newsBadge}>DEMO · CONTENT COMING SOON</span></div>
          <p className={styles.newsIntro}>A place for future iDance updates. These are layout placeholders, not published company news.</p>
          <div className={styles.newsList}>
            {[['01','Product updates','New releases and product announcements will appear here.'],['02','Events & community','Upcoming events and community stories will appear here.'],['03','Behind the sound','Brand stories and creative inspiration will appear here.']].map(([n,title,description]) => <article key={n}><span>{n}</span><div><small>PLACEHOLDER</small><h3>{title}</h3><p>{description}</p></div><span className={styles.newsSoon}>Coming soon</span></article>)}
          </div>
        </div>
        <SoundDivider />
      </section>
      <section className={`${styles.brandCta} ${styles.withParticleBackdrop}`} data-brand-cta>
        <span className="eyebrow" data-cta-reveal>GOOD MOMENTS START WITH SOUND</span>
        <h2 data-cta-reveal>{data.home.cta}</h2>
        <div className="button-row">
          <Link className="button" to="/products" data-cta-reveal data-cta-link="products">
            Explore products <ArrowRight size={18} />
          </Link>
          <Link
            className="text-link"
            data-cta-reveal
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
