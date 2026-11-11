import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight, MoveHorizontal } from "lucide-react";
import styles from "./ProductAngleViewer.module.css";

const frames = Array.from({ length: 8 }, (_, index) => `/media/xd301-angles/frame-${String(index + 1).padStart(2, "0")}.png`);
const wrap = (value: number) => ((value % frames.length) + frames.length) % frames.length;

export function ProductAngleViewer() {
  const root = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; frame: number; pointer: number } | null>(null);
  const [nearby, setNearby] = useState(false);
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNearby(true); observer.disconnect(); }
    }, { rootMargin: "250px" });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  const move = (delta: number) => setActive(index => wrap(index + delta));
  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); }
    else if (event.key === "Home" || event.key === "End") { event.preventDefault(); setActive(event.key === "Home" ? 0 : frames.length - 1); }
  }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    drag.current = { x: event.clientX, frame: active, pointer: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || drag.current.pointer !== event.pointerId) return;
    const step = Math.max(30, event.currentTarget.clientWidth / 10);
    setActive(wrap(drag.current.frame + Math.round((drag.current.x - event.clientX) / step)));
  }
  function pointerUp() { drag.current = null; }
  return <div ref={root} className={styles.viewer}>
    <div className={styles.stage} role="slider" tabIndex={0} aria-label="XD301 viewing angle" aria-valuemin={1} aria-valuemax={8} aria-valuenow={active + 1} aria-valuetext={`View ${active + 1} of 8`} aria-describedby="xd301-angle-help" onKeyDown={onKey} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onLostPointerCapture={pointerUp}>
      {nearby && frames.map((src, index) => <img key={src} src={src} alt={active === index ? `XD301 product visual, angle ${index + 1} of 8` : ""} aria-hidden={active !== index} width={1536} height={1024} draggable={false} decoding="async" loading={index === 0 ? "lazy" : "eager"} className={styles.frame} data-active={active === index} onLoad={() => setLoaded(previous => new Set(previous).add(index))} onError={() => setFailed(previous => new Set(previous).add(index))}/>)}
      {!loaded.has(active) && <span className={styles.status} role="status">{failed.has(active) ? "This angle could not load. Choose another view." : "Loading product view…"}</span>}
      <span className={styles.hint} aria-hidden="true"><MoveHorizontal size={17}/> Drag to explore</span>
    </div>
    <div className={styles.controls}>
      <button type="button" onClick={() => move(-1)} aria-label="Previous product angle"><ArrowLeft size={18}/></button>
      <label className={styles.scrubber}><input type="range" min={0} max={7} step={1} value={active} aria-label="Choose product angle" aria-valuetext={`View ${active + 1} of 8`} onChange={event => setActive(Number(event.target.value))}/><span aria-hidden="true">360°</span></label>
      <button type="button" onClick={() => move(1)} aria-label="Next product angle"><ArrowRight size={18}/></button>
    </div>
    <p id="xd301-angle-help" className={styles.help}>Drag, swipe or use the arrow keys to explore 8 product views.</p>
    <p className={styles.note}>Multi-angle visual preview · Demo visuals, final 3D to follow</p>
  </div>;
}
