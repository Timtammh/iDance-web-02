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

function HeroMedia({ source: originalSource, poster: originalPoster, label: originalLabel, demo }: { source: string; poster: string; label: string; demo: boolean }) {
  const [activeClip, setActiveClip] = useState(0);
  const mountedAt = useRef(performance.now());
  const clips = [
    { source: "/media/xd301-home-silent.mp4", poster: "/media/xd301-colour-hero.png", label: "iDance XD301 portable DJ station", name: "XD301" },
    { source: originalSource, poster: originalPoster, label: originalLabel, name: "DJX101E" },
  ];
  const { source, label } = clips[activeClip];
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const userPaused = useRef(false);
  const explicitPlay = useRef(false);
  const syncPlayback = useRef(() => {});
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    let cancelled = false;
    setFailed(false);
    setBlocked(false);
    const rect = root.current?.getBoundingClientRect();
    let onscreen = !!rect && rect.bottom > 0 && rect.top < window.innerHeight;
    const apply = () => {
      const currentRect = root.current?.getBoundingClientRect();
      onscreen = !!currentRect && currentRect.bottom > 0 && currentRect.top < window.innerHeight;
      if (!onscreen || document.hidden || !!document.querySelector("[data-intro-phase]") || userPaused.current) {
        el.pause();
        return;
      }
      el.muted = true;
      el.defaultMuted = true;
      el.playsInline = true;
      void el.play().catch((error: DOMException) => {
        if (!cancelled && error.name !== "AbortError") { setPlaying(false); setBlocked(true); }
      });
    };
    syncPlayback.current = apply;
    const observer = new IntersectionObserver(([entry]) => { onscreen = entry.isIntersecting; apply(); });
    observer.observe(root.current || el);
    window.addEventListener("idance:entered", apply);
    window.addEventListener("pageshow", apply);
    document.addEventListener("visibilitychange", apply);
    el.addEventListener("loadeddata", apply);
    el.addEventListener("canplay", apply);
    // Some browsers report visibility before the entrance animation settles.
    const retry = window.setInterval(() => { if (el.paused && !userPaused.current) apply(); }, 1500);
    apply();
    return () => {
      cancelled = true;
      window.clearInterval(retry);
      observer.disconnect();
      window.removeEventListener("idance:entered", apply);
      window.removeEventListener("pageshow", apply);
      document.removeEventListener("visibilitychange", apply);
      el.removeEventListener("loadeddata", apply);
      el.removeEventListener("canplay", apply);
      syncPlayback.current = () => {};
      el.pause();
    };
  }, [source]);
  const play = () => {
    const el = video.current;
    if (!el) return;
    userPaused.current = false;
    explicitPlay.current = true;
    setBlocked(false);
    if (failed) { setFailed(false); el.load(); }
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    // Call directly in the click gesture, rather than waiting for an observer.
    void el.play().catch((error: DOMException) => { if (error.name !== "AbortError") setBlocked(true); });
  };
  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (!el.paused) { userPaused.current = true; el.pause(); }
    else play();
  };
  const selectClip = (index: number) => {
    userPaused.current = false;
    explicitPlay.current = true;
    if (index === activeClip) { play(); return; }
    setPlaying(false);
    setFailed(false);
    setBlocked(false);
    setActiveClip(index);
  };
  return <section ref={root} className={styles.cinematicHero} data-hero data-mounted-ms={Math.round(mountedAt.current)} aria-label={demo ? "iDance product video" : label}>
    <video ref={video} className={styles.backgroundVideo} data-square-pixels={source === "/media/DJX101EV2-10MB.mp4" || undefined} src={source} muted playsInline autoPlay preload="auto" data-hero-clip={activeClip} aria-label={label}
      onEnded={() => setActiveClip(index => (index + 1) % clips.length)}
      onLoadedData={event => { event.currentTarget.dataset.loadedMs = String(Math.round(performance.now())); }}
      onPlaying={event => { event.currentTarget.dataset.playingMs ||= String(Math.round(performance.now())); setPlaying(true); setBlocked(false); setFailed(false); }} onPause={() => setPlaying(false)} onError={() => { setFailed(true); setPlaying(false); }} style={failed ? {visibility:"hidden"} : undefined} />

    {!playing && !userPaused.current && <div className={styles.playFallback}>
      <button onClick={play}><Play size={19} aria-hidden="true"/>{failed ? "Retry video" : "Play video"}</button>
      {(blocked || failed) && <span role="status">{failed ? "Video could not load. Retry or choose another video." : "Tap play to start this video."}</span>}
    </div>}
    <div className={styles.videoToolbar}>
      <button className={styles.playbackButton} onClick={toggle} aria-label={playing ? "Pause background video" : "Play background video"} title={playing ? "Pause" : "Play"}>{playing ? <Pause size={15} aria-hidden="true"/> : <Play size={15} aria-hidden="true"/>}</button>
      <div className={styles.videoChoices} role="group" aria-label="Choose homepage video">{clips.map((clip,index) => <button key={clip.source} onClick={() => selectClip(index)} aria-label={`Play ${clip.name} video`} title={clip.name} aria-pressed={activeClip === index}><span className={styles.videoDot} aria-hidden="true"/></button>)}</div>
    </div>
  </section>;
}

function MobileHero() {
  const [active, setActive] = useState(0);
  const [displayed, setDisplayed] = useState(0);
  const [auto, setAuto] = useState(true);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
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
  // Keep the previous frame visible while a directly selected image downloads.
  useEffect(() => {
    if (loaded.has(active)) setDisplayed(active);
  }, [active, loaded]);
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
      {mobileHeroImages.map((picture, index) => <img key={picture.src} src={index === active || loaded.has(index) || (onscreen && loaded.has(active) && index === (active + 1) % mobileHeroImages.length) ? picture.src : undefined} alt={picture.alt} width={picture.width} height={picture.height} className={styles.mobileImage} data-active={index === displayed} aria-hidden={index !== displayed} loading={index === active ? "eager" : "lazy"} fetchPriority={index === active ? "high" : "low"} decoding="async" draggable={false}
        onLoad={() => setLoaded(previous => previous.has(index) ? previous : new Set(previous).add(index))}
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
