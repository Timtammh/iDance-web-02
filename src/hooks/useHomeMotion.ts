import type { RefObject } from "react";
import { conditions, gsap, safelyAnimate, useGSAP, visiblePlayback } from "../lib/motion/gsap";
import { arrowInteraction, reveal, watchMotionLayout } from "../lib/motion/choreography";
import styles from "../sections/home/Home.module.css";

export function useHomeMotion(root: RefObject<HTMLDivElement | null>) {
  useGSAP(() => {
    const container = root.current;
    if (!container) return;
    const mm = gsap.matchMedia(root);
    mm.add(conditions, ({ conditions: media }) => {
      if (media?.reduce) return;
      const mobile = !media?.desktop;
      const disposers: Array<() => void> = [];
      const revert = safelyAnimate(() => {
        const select = <T extends HTMLElement = HTMLElement>(selector: string) => Array.from(container.querySelectorAll<T>(selector));
        // Keep the entire desktop video frame untouched: no zoom, crop or scrub.
        // Hero media swaps at the mobile breakpoint, so all choreography below is
        // attached to stable sections rather than to removed hero-copy wrappers.
        select(".section-heading").forEach(heading => {
          const copy = heading.querySelectorAll(":scope > div > *, :scope > p, :scope > a, :scope > span");
          if (copy.length) disposers.push(reveal(heading, copy, { y: mobile ? 30 : 58, stagger: 0.1 }, mobile));
        });

        const scenes = select("[data-scene]");
        scenes.forEach((card, index) => {
          disposers.push(reveal(card, card, {
            x: mobile ? 0 : (index % 2 ? 56 : -56),
            y: mobile ? 36 : 76,
            rotation: mobile ? 0 : (index % 2 ? 1.5 : -1.5),
            scale: 0.94,
          }, mobile));
          const caption = card.querySelector(":scope > div");
          if (caption) disposers.push(reveal(card, caption, { y: mobile ? 16 : 38, delay: 0.1 }, mobile));
          disposers.push(arrowInteraction(card));
          const photo = card.querySelector("img");
          if (!mobile && photo) {
            // Overscan stays inside the image card; CSS hover no longer competes
            // with the same transform. The card's text and hit area do not scrub.
            gsap.set(photo, { transition: "none" });
            gsap.fromTo(photo, { yPercent: -5, scale: 1.14 }, {
              yPercent: 5, scale: 1.14, ease: "none",
              scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 0.8 },
            });
          }
        });

        const featured = container.querySelector<HTMLElement>("[data-featured]");
        if (featured) {
          const art = featured.querySelector(`.${styles.featuredImage}`);
          const copy = featured.querySelector(`.${styles.featuredCopy}`);
          if (art) disposers.push(reveal(art, art, { x: mobile ? 0 : -72, force3D: false }, mobile));
          if (copy) disposers.push(reveal(copy, copy.children, { x: mobile ? 0 : 42, y: mobile ? 28 : 32, stagger: 0.11 }, mobile));
          if (!mobile) {
            const product = featured.querySelector("[data-feature-product]");
            const depth = featured.querySelector("[data-feature-depth]");
            if (product) gsap.fromTo(product, { y: 56 }, {
              y: -56, force3D: false, snap: { y: 1 }, ease: "none",
              scrollTrigger: { trigger: featured, start: "top bottom", end: "bottom top", scrub: 1 },
            });
            if (depth) gsap.fromTo(depth, { y: -32, scale: 0.94 }, {
              y: 32, scale: 1.06, ease: "none",
              scrollTrigger: { trigger: featured, start: "top bottom", end: "bottom top", scrub: 1.2 },
            });
          }
        }

        select(".video-grid").forEach(grid => {
          const cards = grid.querySelectorAll(".video-card");
          if (cards.length) disposers.push(reveal(grid, cards, {
            y: mobile ? 38 : 84, scale: 0.94, rotation: mobile ? 0 : -1.5, stagger: mobile ? 0.09 : 0.17,
          }, mobile));
        });
        select(".video-card").forEach(card => disposers.push(arrowInteraction(card)));
        select("#news article").forEach((row, index) => {
          disposers.push(reveal(row, row, { x: mobile ? 22 : 64, y: 0, delay: mobile ? 0 : index * 0.05 }, mobile));
        });
        const intro = container.querySelector(`.${styles.newsIntro}`);
        if (intro) disposers.push(reveal(intro, intro, {}, mobile));

        const cta = container.querySelector<HTMLElement>("[data-brand-cta]");
        if (cta) {
          const targets = cta.querySelectorAll("[data-cta-reveal]");
          if (targets.length) disposers.push(reveal(cta, targets, {
            y: mobile ? 38 : 86, scale: 0.94, duration: mobile ? 0.8 : 1.3, stagger: 0.14,
          }, mobile));
          cta.querySelectorAll<HTMLElement>("[data-cta-link]").forEach(link => disposers.push(arrowInteraction(link)));
        }

        select("[data-sound-divider]").forEach(divider => {
          const line = divider.querySelector("i");
          if (line) disposers.push(reveal(divider, line, {
            y: 0, opacity: 0.5, scaleX: 0.04, transformOrigin: "50% 50%", duration: mobile ? 0.7 : 1.2, ease: "expo.out",
          }, mobile));
        });
        select("section [data-light]").forEach(light => {
          const layer = light.querySelector(".light-layer");
          const section = light.closest("section");
          if (!layer || !section) return;
          if (light.dataset.light === "refraction") {
            gsap.fromTo(layer, { x: -100, opacity: 0.15 }, {
              x: 100, opacity: 1, duration: mobile ? 1.2 : 2, ease: "sine.inOut", immediateRender: false,
              scrollTrigger: { trigger: section, start: "top 85%", once: true, fastScrollEnd: true },
            });
          } else if (!mobile && light.hasAttribute("data-light-animated")) {
            const drift = gsap.to(layer, { x: 24, y: 12, duration: 6, ease: "sine.inOut", repeat: -1, yoyo: true, paused: true });
            const playback = visiblePlayback(section, [drift]);
            disposers.push(playback.dispose);
          }
        });
      });
      return () => { disposers.forEach(dispose => dispose()); revert(); };
    });
    const stopWatching = watchMotionLayout(container);
    return () => { stopWatching(); mm.revert(); };
  }, { scope: root });
}

// Retained for collection consumers with dedicated reveal wrappers.
export function useProductReveal(root: RefObject<HTMLDivElement | null>, key: string) {
  useGSAP(() => {
    const mm = gsap.matchMedia(root);
    mm.add(conditions, ({ conditions: media }) => {
      if (media?.reduce || !root.current) return;
      let dispose = () => {};
      const revert = safelyAnimate(() => {
        const cards = root.current!.querySelectorAll("[data-card-reveal]");
        if (cards.length) dispose = reveal(root.current!, cards, { scale: 0.94, stagger: 0.13 }, !media?.desktop);
      });
      return () => { dispose(); revert(); };
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [key], revertOnUpdate: true });
}
