import { WaveMotionContext } from "./HeroSoundWaves";
import { useContext, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useContent } from "../../hooks/useContent";
import styles from "./ProductDeck.module.css";
import mixer from "../../productShot/iDance Pocket Mix DJ Mixer Box.png";
import speaker from "../../productShot/Rainbow LED Party Speaker and Microphone.png";
import brick from "../../productShot/SURF ROCK Speaker Brick Packaging.png";
import studio from "../../productShot/iDance Sing Creator Studio Set.png";
import party from "../../productShot/RGB Party Speaker with Four Microphones2.png";

function MixerKnob({ label }: { label: string }) {
  const [value, setValue] = useState(50);
  const start = useRef<{ y: number; value: number } | null>(null);
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  return <div className={styles.knobControl} role="slider" tabIndex={0} aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}
    onPointerDown={e => { if (e.button !== 0) return; e.currentTarget.focus(); start.current = { y: e.clientY, value }; e.currentTarget.setPointerCapture(e.pointerId); }}
    onPointerMove={e => { if (start.current) setValue(clamp(Math.round(start.current.value + (start.current.y - e.clientY) * .7))); }}
    onPointerUp={() => { start.current = null; }} onPointerCancel={() => { start.current = null; }} onLostPointerCapture={() => { start.current = null; }}
    onDoubleClick={() => setValue(50)}
    onKeyDown={e => { if (["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft", "Home", "End"].includes(e.key)) { e.preventDefault(); setValue(e.key === "Home" ? 0 : e.key === "End" ? 100 : clamp(value + (["ArrowUp", "ArrowRight"].includes(e.key) ? 5 : -5))); } }}>
    <i className={styles.knob} style={{ transform: `rotate(${(value - 50) * 2.7}deg)` }} aria-hidden="true" />
  </div>;
}
function MixerPads({ side, onColor }: { side: string; onColor: (color: string) => void }) {
  const [active, setActive] = useState<number[]>([]);
  return <div className={styles.pads} aria-label={`${side} light pads`}>{[0,1,2,3].map(i => <button key={i} aria-label={`${side} light pad ${i + 1}`} aria-pressed={active.includes(i)} style={{ "--pad-color": ["#64dcff", "#b49aff", "#ffadcb", "#91e7c0"][i] } as CSSProperties} onClick={() => { setActive(current => current.includes(i) ? current.filter(n => n !== i) : [...current, i]); onColor(["#64dcff", "#b49aff", "#ffadcb", "#91e7c0"][i]); }}/>)}</div>;
}
function MixerFader({ side }: { side: "left" | "right" }) {
  const [value, setValue] = useState(50);
  return <div className={`${styles.sideFader} ${styles[side]}`}><input type="range" min="0" max="100" value={value} aria-label={`${side} mixer fader`} onChange={e => setValue(Number(e.target.value))}/></div>;
}

const shots = [
  { id: "mix", name: "Pocket Mix", image: mixer },
  { id: "party", name: "Rainbow Party Speaker", image: speaker },
  { id: "brick", name: "SURF ROCK", image: brick },
  { id: "studio", name: "Sing Creator Studio", image: studio },
  { id: "rgb", name: "RGB Party Speaker", image: party },
];
export function ProductDeck() {
  const data = useContent();
  const motionEnabled = useContext(WaveMotionContext);
  const [lightColor, setLightColor] = useState("#64dcff");
  const [cue, setCue] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const cuePlayed = useRef(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const lightsMove = motionEnabled && !reduced;
  const [tab, setTab] = useState("popular");
  const [position, setPosition] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const drag = useRef({ x: 0, y: 0, scroll: 0, active: false, moved: false });
  const animation = useRef(0);
  const isPhone = () => window.matchMedia("(max-width: 767px)").matches;
  const stopMotion = () => cancelAnimationFrame(animation.current);
  const scrollTo = (left: number, smooth = false) => {
    const el = rail.current;
    if (!el) return;
    stopMotion();
    const target = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, left));
    if (!smooth || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.scrollLeft = target; return; }
    const from = el.scrollLeft, start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 520);
      el.scrollLeft = from + (target - from) * (1 - Math.pow(1 - progress, 3));
      if (progress < 1) animation.current = requestAnimationFrame(tick);
    };
    animation.current = requestAnimationFrame(tick);
  };
  const stepSize = () => {
    const el = rail.current;
    return el ? (el.firstElementChild?.getBoundingClientRect().width || el.clientWidth) + parseFloat(getComputedStyle(el).columnGap || "0") : 0;
  };
  const finishDrag = (cancelled = false) => {
    const d = drag.current, el = rail.current;
    if (!d.active) return;
    d.active = false;
    if (!cancelled && d.moved && el && isPhone()) {
      const step = stepSize(), delta = el.scrollLeft - d.scroll;
      const index = Math.abs(delta) > Math.min(55, step * .18)
        ? Math.round(d.scroll / step) + Math.sign(delta) : Math.round(el.scrollLeft / step);
      scrollTo(index * step, true);
    }
  };
  const startDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.pointerType !== "mouse" && !isPhone())) return;
    stopMotion();
    drag.current = { x: e.clientX, y: e.clientY, scroll: e.currentTarget.scrollLeft, active: true, moved: false };
  };
  const updateDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) { d.active = false; return; }
    if (Math.abs(dx) > 5 || d.moved) {
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.scrollLeft = d.scroll - dx;
    }
  };
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    preference.addEventListener("change", stopMotion);
    return () => { stopMotion(); preference.removeEventListener("change", stopMotion); };
  }, []);
  const products = data.demo
    ? (tab === "popular" ? shots : [...shots.slice(3), ...shots.slice(0, 3)]).map(p => ({ ...p, href: "/products" }))
    : data.products.filter(p => tab === "popular" ? p.isPopular : p.isNew).map(p => ({ id: p.id, name: p.name, image: p.images[0]?.url, href: `/products/${p.slug}` }));
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    stopMotion();
    el.scrollLeft = 0;
    const sync = () => {
      const max = el.scrollWidth - el.clientWidth;
      setCanScroll(max > 1);
      setPosition(max > 0 ? el.scrollLeft / max * 100 : 0);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    el.addEventListener("scroll", sync);
    return () => { observer.disconnect(); el.removeEventListener("scroll", sync); };
  }, [tab, data]);
  useEffect(() => {
    const el = section.current;
    if (!el || cuePlayed.current || !lightsMove) return;
    let timer: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      cuePlayed.current = true;
      observer.disconnect();
      setCue(true);
      timer = setTimeout(() => setCue(false), 1150);
    }, { threshold: .2 });
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(timer); setCue(false); };
  }, [lightsMove]);
  const lastPulseIndex = useRef(0);
  const pulseEqualizer = (color: string) => {
    if (!lightsMove || !rail.current) return;
    const rect = rail.current.getBoundingClientRect();
    const y = Math.max(120, Math.min(window.innerHeight - 100, rect.top + rect.height / 2));
    window.dispatchEvent(new CustomEvent('idance:deck-interaction', {detail:{y,color}}));
  };
  useEffect(() => {
    const index = Math.round(position / 100 * Math.max(1, products.length - 1));
    if (index !== lastPulseIndex.current) { lastPulseIndex.current = index; pulseEqualizer(lightColor); }
  }, [position]);
  const changeLight = (color: string) => { setLightColor(color); pulseEqualizer(color); };
  const move = (value: number, smooth = false) => {
    const el = rail.current;
    if (el) scrollTo(value / 100 * (el.scrollWidth - el.clientWidth), smooth);
  };
  return <section ref={section} id="products" className={styles.section} aria-label="Product collection">
    <div className={styles.heading}><div><span>FIND YOUR NEXT SOUND</span><h2>Products</h2></div><Link to="/products">View all products <ArrowUpRight size={18} /></Link></div>
    <div className={styles.deck} data-cue={cue && lightsMove} data-light-motion={lightsMove} style={{"--deck-accent":lightColor,"--light-x":`${lightsMove ? position : 50}%`} as CSSProperties}>
      <div className={styles.deckGlow} aria-hidden="true"/>
      <div className={styles.cueEdge} aria-hidden="true"/>
      <div className={styles.levelLeds} aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} data-lit={i <= (lightsMove ? Math.round(position / 100 * 11) : 5)} style={{"--led-delay":`${i * 45}ms`} as CSSProperties}/>)}</div>
      <div className={styles.top}>
        <MixerKnob label="Channel tone" />
        <div role="tablist" aria-label="Product collections" className={styles.tabGroup}>{["popular", "new"].map((t, i) => <button key={t} role="tab" id={`tab-${t}`} aria-controls="home-products" aria-selected={tab === t} tabIndex={tab === t ? 0 : -1} onClick={() => setTab(t)} onKeyDown={e => {
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
            e.preventDefault(); const next = e.key === "Home" ? "popular" : e.key === "End" ? "new" : i ? "popular" : "new";
            setTab(next); document.getElementById(`tab-${next}`)?.focus();
          }
        }}>{t === "popular" ? "Popular" : "New Releases"}</button>)}</div>
        <div className={styles.controls}><MixerKnob label="Left effect" /><span aria-hidden="true">▪ ▪ ▪</span><MixerKnob label="Right effect" /></div>
        <MixerKnob label="Channel balance" />
      </div>
      <div ref={rail} className={styles.rail} id="home-products" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0}
        onPointerDown={startDrag} onPointerMove={updateDrag}
        onPointerUp={() => finishDrag()} onPointerCancel={() => finishDrag(true)}
        onLostPointerCapture={() => finishDrag()}
        onKeyDown={e => { if (["ArrowLeft", "ArrowRight"].includes(e.key)) { e.preventDefault(); scrollTo(e.currentTarget.scrollLeft + (e.key === "ArrowRight" ? 1 : -1) * stepSize(), true); } }}
        onClickCapture={e => { if (drag.current.moved) { e.preventDefault(); drag.current.moved = false; } }}
        onDragStart={e => e.preventDefault()}>
        {products.map(p => <Link to={p.href} className={styles.product} key={p.id} draggable={false}><div className={styles.disc}><img src={p.image} alt={p.name} loading="lazy" decoding="async" width={640} height={640} draggable={false} /></div><span>{p.name}<ArrowUpRight size={15} /></span></Link>)}
        {!products.length && <p>No products in this collection yet.</p>}
      </div>
      <div className={styles.bottom}>
        <MixerPads side="Left" onColor={changeLight} />
        <div className={styles.faderGroup}><div className={styles.fader}><button aria-label="Previous products" disabled={!canScroll || position < 1} onClick={() => isPhone() ? scrollTo((rail.current?.scrollLeft || 0) - stepSize(), true) : move(Math.max(0, position - 50), true)}><ChevronLeft size={20}/></button><input aria-label="Slide through products" type="range" min="0" max="100" step="0.1" value={position} disabled={!canScroll} onChange={e => move(Number(e.target.value))}/><button aria-label="Next products" disabled={!canScroll || position > 99} onClick={() => isPhone() ? scrollTo((rail.current?.scrollLeft || 0) + stepSize(), true) : move(Math.min(100, position + 50), true)}><ChevronRight size={20}/></button></div><span>DRAG TO DISCOVER</span></div>
        <MixerPads side="Right" onColor={changeLight} />
      </div>
      <MixerFader side="left"/><MixerFader side="right"/>
    </div>
  </section>;
}
