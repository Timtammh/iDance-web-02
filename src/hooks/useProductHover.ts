import type { RefObject } from "react";
import { gsap, useGSAP, safelyAnimate } from "../lib/motion/gsap";
import { cardInteraction } from "../lib/motion/choreography";

export function useProductHover(root: RefObject<HTMLAnchorElement | null>) {
  useGSAP(() => {
    const mm = gsap.matchMedia(root);
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const card = root.current;
      const surface = card?.querySelector<HTMLElement>(".product-image");
      if (!card || !surface) return;
      let dispose = () => {};
      const revert = safelyAnimate(() => {
        dispose = cardInteraction(card, surface, surface.querySelector("img"), card.querySelector(".card-arrow"));
      });
      return () => { dispose(); revert(); };
    });
    return () => mm.revert();
  }, { scope: root });
}
