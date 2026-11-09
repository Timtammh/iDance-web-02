import { createContext, useContext, useEffect, useRef, useState } from "react";
import styles from "./HeroSoundWaves.module.css";

// Retain the shared motion context for existing product-deck controls.
export const WaveMotionContext = createContext(false);

/** Pearl-white edge sculpture. Decorative only: never covers or captures content. */
export function HeroSoundWaves() {
  const enabled = useContext(WaveMotionContext);
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    // Pause each piece outside the viewport rather than animating the whole page.
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { (entry.target as HTMLElement).dataset.visible = String(entry.isIntersecting); });
    }, { rootMargin: "80px" });
    element.querySelectorAll("[data-glass-piece]").forEach(piece => observer.observe(piece));
    return () => observer.disconnect();
  }, []);
  return <div ref={root} className={styles.glassField} data-sound-waves data-glass-background data-running={enabled && visible} aria-hidden="true">
    {Array.from({ length: 6 }, (_, index) => <div key={index} className={`${styles.piece} ${styles[`piece${index + 1}`]}`} data-glass-piece>
      <div className={styles.sculpture}><i className={styles.outer}/><i className={styles.inner}/><i className={styles.refraction}/></div>
    </div>)}
  </div>;
}
