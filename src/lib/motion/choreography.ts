import { gsap, ScrollTrigger } from "./gsap";

// The page is visible before JS, while waiting for its trigger, and on setup failure.
// Keyboard focus finishes a reveal immediately rather than moving a focused control.
export function reveal(
  trigger: Element,
  targets: gsap.TweenTarget,
  from: gsap.TweenVars = {},
  mobile = false,
) {
  const animation = gsap.from(targets, {
    opacity: 0.3,
    y: mobile ? 30 : 68,
    duration: mobile ? 0.65 : 1.05,
    stagger: mobile ? 0.07 : 0.12,
    ease: "power3.out",
    ...from,
    immediateRender: false,
    clearProps: "opacity,transform,transformOrigin",
    scrollTrigger: {
      trigger,
      start: "top 88%",
      once: true,
      fastScrollEnd: true,
    },
  });
  const finish = () => {
    animation.progress(1);
    animation.scrollTrigger?.kill(false);
  };
  trigger.addEventListener("focusin", finish);
  return () => trigger.removeEventListener("focusin", finish);
}

export function watchMotionLayout(container: Element) {
  let disposed = false;
  let timer: ReturnType<typeof setTimeout>;
  const refresh = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { if (!disposed) ScrollTrigger.refresh(); }, 120);
  };
  container.addEventListener("load", refresh, true);
  container.addEventListener("error", refresh, true);
  const resize = new ResizeObserver(refresh);
  resize.observe(container);
  void document.fonts.ready.then(() => { if (!disposed) refresh(); });
  refresh();
  return () => {
    disposed = true;
    clearTimeout(timer);
    resize.disconnect();
    container.removeEventListener("load", refresh, true);
    container.removeEventListener("error", refresh, true);
  };
}

// Only called inside a fine-pointer matchMedia context. All tweens are created
// here, not in event callbacks; the surrounding GSAP context owns their cleanup.
export function cardInteraction(
  card: HTMLElement,
  surface: HTMLElement,
  image: Element | null,
  icon: Element | null,
) {
  gsap.set(surface, { transformPerspective: 900, transformOrigin: "50% 55%", transition: "none" });
  if (image) gsap.set(image, { transition: "none" });
  const hover = gsap.timeline({ paused: true, defaults: { duration: 0.45, ease: "power3.out" } })
    .to(surface, { y: -9, scale: 1.015 }, 0);
  if (image) hover.to(image, { scale: 1.09 }, 0);
  if (icon) hover.to(icon, { x: 5, y: -5 }, 0);
  const tiltX = gsap.quickTo(surface, "rotationX", { duration: 0.5, ease: "power3.out" });
  const tiltY = gsap.quickTo(surface, "rotationY", { duration: 0.5, ease: "power3.out" });
  let pointing = false;
  let dragging = false;
  let rect: DOMRect | undefined;
  const sync = () => {
    if (!dragging && (pointing || card.matches(":focus-visible"))) hover.play();
    else hover.reverse();
  };
  const resetTilt = () => { tiltX(0); tiltY(0); };
  const enter = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    pointing = true;
    rect = card.getBoundingClientRect();
    sync();
  };
  const move = (event: PointerEvent) => {
    if (!pointing || dragging || !rect || event.buttons) return;
    tiltX(gsap.utils.clamp(-4, 4, (0.5 - (event.clientY - rect.top) / rect.height) * 8));
    tiltY(gsap.utils.clamp(-5, 5, ((event.clientX - rect.left) / rect.width - 0.5) * 10));
  };
  const leave = () => { pointing = false; dragging = false; resetTilt(); sync(); };
  const down = () => { dragging = true; resetTilt(); sync(); };
  const up = () => { dragging = false; sync(); };
  const focus = () => { resetTilt(); sync(); };
  const blur = () => { hover.reverse(); resetTilt(); };
  card.addEventListener("pointerenter", enter);
  card.addEventListener("pointermove", move);
  card.addEventListener("pointerleave", leave);
  card.addEventListener("pointerdown", down);
  card.addEventListener("pointerup", up);
  card.addEventListener("pointercancel", leave);
  card.addEventListener("focus", focus);
  card.addEventListener("blur", blur);
  return () => {
    card.removeEventListener("pointerenter", enter);
    card.removeEventListener("pointermove", move);
    card.removeEventListener("pointerleave", leave);
    card.removeEventListener("pointerdown", down);
    card.removeEventListener("pointerup", up);
    card.removeEventListener("pointercancel", leave);
    card.removeEventListener("focus", focus);
    card.removeEventListener("blur", blur);
  };
}

export function arrowInteraction(link: HTMLElement) {
  const arrow = link.querySelector("svg");
  if (!arrow) return () => {};
  const hover = gsap.to(arrow, { x: 6, y: -4, duration: 0.35, ease: "power3.out", paused: true });
  const enter = (event: PointerEvent) => { if (event.pointerType === "mouse") hover.play(); };
  const leave = () => { if (!link.matches(":focus-visible")) hover.reverse(); };
  const focus = () => { if (link.matches(":focus-visible")) hover.play(); };
  const blur = () => hover.reverse();
  link.addEventListener("pointerenter", enter);
  link.addEventListener("pointerleave", leave);
  link.addEventListener("focus", focus);
  link.addEventListener("blur", blur);
  return () => {
    link.removeEventListener("pointerenter", enter);
    link.removeEventListener("pointerleave", leave);
    link.removeEventListener("focus", focus);
    link.removeEventListener("blur", blur);
  };
}
