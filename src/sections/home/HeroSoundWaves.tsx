import { createContext, useContext, useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./HeroSoundWaves.module.css";
export const WaveMotionContext = createContext(false);
/** One continuous sideways equalizer along the left edge of the homepage. */
export function HeroSoundWaves() {
  const enabled = useContext(WaveMotionContext);
  const root = useRef<HTMLDivElement>(null);
  const pulse = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(240);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const resize = new ResizeObserver(() => {
      const step = parseFloat(getComputedStyle(element).getPropertyValue('--tile-step')) || 22;
      setRows(Math.ceil(element.clientHeight / step));
    });
    resize.observe(element);
    const update = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => { resize.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  useEffect(() => {
    let animation: Animation | undefined;
    const respond = (event: Event) => {
      if (!enabled || document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !root.current || !pulse.current) return;
      const { y, color } = (event as CustomEvent<{y:number;color:string}>).detail;
      const top = y - root.current.getBoundingClientRect().top - 120;
      pulse.current.style.top = `${Math.max(0, top)}px`;
      pulse.current.style.setProperty('--pulse-color', color);
      animation?.cancel();
      animation = pulse.current.animate([{opacity:0,transform:'scaleX(.65)'},{opacity:.34,transform:'scaleX(1)',offset:.35},{opacity:0,transform:'scaleX(1.08)'}],{duration:620,easing:'ease-out'});
    };
    window.addEventListener('idance:deck-interaction', respond);
    return () => { animation?.cancel(); window.removeEventListener('idance:deck-interaction', respond); };
  }, [enabled]);
  return <div ref={root} className={styles.equalizer} data-sound-waves data-equalizer data-running={enabled && visible} aria-hidden="true">
    <div ref={pulse} className={styles.interactionPulse} data-eq-pulse aria-hidden="true"/>
    {Array.from({length:rows},(_,row)=><div className={styles.row} key={row} style={{'--duration':`${3.4+(row%5)*.55}s`,'--delay':`${-row*.47}s`,'--level':`${18+(row*17)%57}%`} as CSSProperties}>
      <div className={styles.base}/><div className={styles.lit} data-eq-column/>
    </div>)}
  </div>;
}
