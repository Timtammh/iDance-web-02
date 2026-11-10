import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "../../lib/motion/gsap";
import introVideo from "../../video/intro.mp4";
import introMobileVideo from "../../video/intro-mobile.mp4";
import introPoster from "../../video/intro-poster.jpg";

export function IntroGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"intro" | "entering" | "entered">("intro");
  const [blocked, setBlocked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const site = useRef<HTMLDivElement>(null);
  const enterButton = useRef<HTMLButtonElement>(null);
  const entering = useRef(false);
  const enter = useCallback(() => {
    if (entering.current) return;
    entering.current = true;
    video.current?.pause();
    setPhase("entering");
  }, []);

  useEffect(() => {
    if (phase === "entered") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [phase]);

  useEffect(() => {
    if (phase !== "intro") return;
    enterButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (["Escape", "Enter", " "].includes(event.key)) { event.preventDefault(); enter(); }
    };
    document.addEventListener("keydown", onKey);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) { video.current?.pause(); setBlocked(true); }
    else {
      if (video.current) { video.current.muted = true; video.current.defaultMuted = true; }
      void video.current?.play().catch(() => setBlocked(true));
    }
    const safeguard = window.setTimeout(() => {
      if (!video.current || video.current.paused || video.current.readyState < 2) { setBlocked(true); setPlaying(false); }
    }, 5000);
    return () => { window.clearTimeout(safeguard); document.removeEventListener("keydown", onKey); };
  }, [phase, enter]);

  useLayoutEffect(() => {
    if (phase !== "entering") return;
    const finish = () => setPhase("entered");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { finish(); return; }
    const timeline = gsap.timeline({ onComplete: finish });
    timeline.fromTo(site.current, { y: "100svh" }, { y: 0, duration: 1.15, ease: "power3.inOut" }, 0)
      .to(screen.current, { y: "-18svh", opacity: .55, duration: 1.15, ease: "power3.inOut" }, 0);
    return () => { timeline.kill(); };
  }, [phase]);

  useEffect(() => {
    if (phase !== "entered") return;
    gsap.set(site.current, { clearProps: "transform" });
    site.current?.focus({ preventScroll: true });
    ScrollTrigger.refresh();
  }, [phase]);

  return <>
    {phase !== "entered" && <div ref={screen} className="intro-screen" data-intro-phase={phase}>
      <img className="intro-poster" src={introPoster} alt="" aria-hidden="true" />
      <video ref={video} style={{ opacity: playing ? 1 : 0 }} poster={introPoster} muted playsInline preload="auto" onPlaying={() => { setPlaying(true); setBlocked(false); }} onWaiting={() => setPlaying(false)} onEnded={enter} onError={() => { setBlocked(true); setPlaying(false); }} aria-hidden="true">
        <source src={introMobileVideo} media="(max-width: 767px)" type="video/mp4" />
        <source src={introVideo} type="video/mp4" />
      </video>
      <button ref={enterButton} type="button" className="intro-enter" onClick={enter} disabled={phase === "entering"} aria-label="Stop intro and enter iDance homepage">
        <span>{phase === "entering" ? "Welcome to iDance" : "Click or tap to enter"} <span aria-hidden="true">↑</span><small>{blocked ? "Ready when you are · Enter or Esc" : "Skip intro · Enter or Esc"}</small></span>
      </button>
    </div>}
    {phase !== "intro" && <div ref={site} className={`intro-site ${phase === "entering" ? "intro-site-entering" : ""}`} tabIndex={-1} inert={phase === "entering"} aria-label="iDance website">{children}</div>}
  </>;
}
