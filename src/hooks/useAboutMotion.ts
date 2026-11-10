import { useEffect, type RefObject } from "react";

/** One-shot compositor-only reveals. Content stays readable before JS and on failure. */
export function useAboutMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const page = root.current;
    if (!page || !("IntersectionObserver" in window)) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const targets = Array.from(page.querySelectorAll<HTMLElement>("[data-about-reveal]"));
    let observer: IntersectionObserver | undefined;
    const stop = () => {
      observer?.disconnect();
      targets.forEach(target => target.removeAttribute("data-about-entered"));
    };
    const setup = () => {
      stop();
      if (reduce.matches) return;
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-about-entered", "true");
          observer?.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      targets.forEach(target => observer?.observe(target));
    };
    const focus = (event: FocusEvent) => {
      const section = (event.target as Element).closest<HTMLElement>("[data-about-reveal]");
      if (section) { section.removeAttribute("data-about-entered"); observer?.unobserve(section); }
    };
    setup();
    reduce.addEventListener("change", setup);
    page.addEventListener("focusin", focus);
    return () => { stop(); reduce.removeEventListener("change", setup); page.removeEventListener("focusin", focus); };
  }, [root]);
}
