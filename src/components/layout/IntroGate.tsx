import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "../../lib/motion/gsap";
import introVideo from "../../video/intro.mp4";

export function IntroGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"intro" | "entering" | "entered">("intro");
  const [blocked, setBlocked] = useState(false);
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
    else void video.current?.play().catch(() => setBlocked(true));
    return () => document.removeEventListener("keydown", onKey);
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
      <video ref={video} src={introVideo} muted playsInline preload="auto" onEnded={enter} onError={enter} aria-hidden="true" />
      <button ref={enterButton} type="button" className="intro-enter" onClick={enter} disabled={phase === "entering"} aria-label="Stop intro and enter iDance homepage">
        <span>{phase === "entering" ? "Welcome to iDance" : "Click or tap to enter"} <span aria-hidden="true">↑</span><small>{blocked ? "Ready when you are · Enter or Esc" : "Skip intro · Enter or Esc"}</small></span>
      </button>
    </div>}
    {phase !== "intro" && <div ref={site} className={`intro-site ${phase === "entering" ? "intro-site-entering" : ""}`} tabIndex={-1} inert={phase === "entering"} aria-label="iDance website">{children}</div>}
  </>;
}
