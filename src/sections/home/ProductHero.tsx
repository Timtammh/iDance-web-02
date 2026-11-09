import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useContent } from "../../hooks/useContent";
import { mobileHeroImages } from "./mobileHeroImages";
import styles from "./ProductHero.module.css";

export function ProductHero() {
  const { home, demo } = useContent();
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const source = home.heroVideo || "/media/DJX101EV2-10MB.mp4";
  const poster = home.heroPoster?.url || "/media/djx101ev2-poster.jpg";
  const label = home.heroVideoLabel || "iDance DJX101E portable karaoke party system";
  if (mobile) return <MobileHero />;
  return <HeroMedia key={source + poster} source={source} poster={poster} label={label} demo={demo} />;
}

function HeroMedia({ source, poster, label, demo }: { source: string; poster: string; label: string; demo: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (preference.matches) { el.pause(); setPlaying(false); }
      else { el.muted = true; void el.play().catch(() => setPlaying(false)); }
    };
    apply();
    preference.addEventListener("change", apply);
    return () => { preference.removeEventListener("change", apply); el.pause(); };
  }, []);
  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => setPlaying(false));
    else el.pause();
  };
  return <section className={styles.cinematicHero} data-hero aria-label={demo ? "iDance product video" : label}>
    <video ref={video} className={styles.backgroundVideo} src={source} poster={poster} muted loop playsInline preload="auto" aria-label={label} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setFailed(true); setPlaying(false); }} style={failed ? {visibility:"hidden"} : undefined} />
    {failed && <img className={styles.backgroundVideo} src={poster} alt={label} onError={e => { if (!e.currentTarget.src.endsWith("/assets/fallback.svg")) e.currentTarget.src = "/assets/fallback.svg"; }} />}
    {!failed && <button className={styles.videoMotion} onClick={toggle} aria-label={playing ? "Pause background video" : "Play background video"} title={playing ? "Pause background video" : "Play background video"}>{playing ? <Pause size={16}/> : <Play size={16}/>}</button>}
  </section>;
}

function MobileHero() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [visible, setVisible] = useState(() => !document.hidden);
  const [onscreen, setOnscreen] = useState(true);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const root = useRef<HTMLElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setReduced(media.matches);
    const visibility = () => setVisible(!document.hidden);
    media.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) => setOnscreen(entry.isIntersecting), { threshold: .2 });
    if (root.current) observer.observe(root.current);
    return () => { media.removeEventListener("change", preference); document.removeEventListener("visibilitychange", visibility); observer.disconnect(); };
  }, []);
  const running = auto && !reduced;
  useEffect(() => {
    if (!running || !visible || !onscreen) return;
    const timer = window.setInterval(() => setActive(index => (index + 1) % mobileHeroImages.length), 6000);
    return () => window.clearInterval(timer);
  }, [running, visible, onscreen]);
  const select = (index: number) => { setAuto(false); setActive((index + mobileHeroImages.length) % mobileHeroImages.length); };
  return <section ref={root} className={styles.mobileHero} data-hero data-mobile-hero onFocusCapture={event => { if (!(event.target as HTMLElement).closest("[data-slideshow-toggle]")) setAuto(false); }} aria-label="iDance product images" aria-roledescription="carousel">
    <div className={styles.mobileImageStage}
      onPointerDown={event => { start.current = { x: event.clientX, y: event.clientY }; }}
      onPointerUp={event => { const from = start.current; start.current = null; if (!from) return; const dx = event.clientX - from.x, dy = event.clientY - from.y; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) select(active + (dx < 0 ? 1 : -1)); }}
      onPointerCancel={() => { start.current = null; }}>
      {mobileHeroImages.map((picture, index) => <img key={picture.src} src={picture.src} alt={picture.alt} width={picture.width} height={picture.height} className={styles.mobileImage} data-active={index === active} aria-hidden={index !== active} loading={index === 0 ? "eager" : "lazy"} decoding="async" draggable={false}
        onError={event => { if (!event.currentTarget.src.endsWith("/assets/fallback.svg")) event.currentTarget.src = "/assets/fallback.svg"; }} />)}
    </div>
    <div className={styles.mobileHeroControls}>
      <button aria-label="Previous hero image" onClick={() => select(active - 1)}><ArrowLeft size={18}/></button>
      <div className={styles.heroDots} aria-label="Choose product image">
        {mobileHeroImages.map((picture, index) => <button key={picture.src} aria-label={`Show hero image ${index + 1}`} aria-current={index === active ? "true" : undefined} onClick={() => select(index)} />)}
      </div>
      <button aria-label="Next hero image" onClick={() => select(active + 1)}><ArrowRight size={18}/></button>
      <button data-slideshow-toggle aria-label={running ? "Pause image slideshow" : "Play image slideshow"} disabled={reduced} title={reduced ? "Slideshow stays still with reduced motion. Use arrows to browse." : undefined} onClick={() => setAuto(value => !value)}>{running ? <Pause size={15}/> : <Play size={15}/>}</button>
    </div>
    <span className={styles.heroImageCount} aria-live={running ? "off" : "polite"}>{active + 1} / {mobileHeroImages.length}</span>
  </section>;
}
