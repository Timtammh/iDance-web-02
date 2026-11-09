import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./ProductHero.module.css";

export function ProductHero() {
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
  return <section className={styles.cinematicHero} data-hero aria-label="DJ mixing video demo">
    <video ref={video} className={styles.backgroundVideo} src="/media/mixer-hero-v2.mp4" poster="/media/mixer-hero-v2-poster.jpg" muted loop playsInline preload="auto" aria-label="Close-up of DJ mixing equipment under colored lights" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setFailed(true); setPlaying(false); }} style={failed ? {visibility:"hidden"} : undefined} />
    {!failed && <button className={styles.videoMotion} onClick={toggle} aria-label={playing ? "Pause background video" : "Play background video"} title={playing ? "Pause background video" : "Play background video"}>{playing ? <Pause size={16}/> : <Play size={16}/>}</button>}
  </section>;
}
