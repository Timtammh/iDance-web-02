import type { RefObject } from "react";
import { conditions, gsap, safelyAnimate, useGSAP } from "../lib/motion/gsap";
import { cardInteraction, reveal } from "../lib/motion/choreography";
import styles from "../sections/home/ProductDeck.module.css";

export function useDeckMotion(root: RefObject<HTMLElement | null>, collection: string) {
  useGSAP(() => {
    const mm = gsap.matchMedia(root);
    mm.add(conditions, ({ conditions: media }) => {
      if (media?.reduce || !root.current) return;
      const mobile = !media?.desktop;
      const disposers: Array<() => void> = [];
      const revert = safelyAnimate(() => {
        const section = root.current!;
        const heading = section.querySelector(`.${styles.heading}`);
        const deck = section.querySelector(`.${styles.deck}`);
        if (heading) disposers.push(reveal(heading, heading.querySelectorAll(":scope > div > *, :scope > a"), { y: mobile ? 30 : 58, stagger: 0.12 }, mobile));
        if (deck) disposers.push(reveal(deck, deck, {
          y: mobile ? 38 : 90, scale: mobile ? 0.97 : 0.94, rotationX: mobile ? 0 : 7,
          transformPerspective: 1400, transformOrigin: "50% 100%", duration: mobile ? 0.75 : 1.25,
        }, mobile));
        const controls = section.querySelectorAll(`.${styles.top} > .${styles.knobControl}, .${styles.controls}, .${styles.pads}`);
        if (controls.length && deck && !mobile) disposers.push(reveal(deck, controls, { y: 20, scale: 0.8, stagger: 0.06, delay: 0.2, duration: 0.85 }, mobile));
      });
      return () => { disposers.forEach(dispose => dispose()); revert(); };
    });
    return () => mm.revert();
  }, { scope: root });

  // React changes the collection immediately. Only the new visual cards enter;
  // old listeners/tweens are reverted before each tab's replacement is mounted.
  useGSAP(() => {
    const mm = gsap.matchMedia(root);
    mm.add({ ...conditions, fine: "(hover: hover) and (pointer: fine)" }, ({ conditions: media }) => {
      if (media?.reduce || !root.current) return;
      const disposers: Array<() => void> = [];
      const revert = safelyAnimate(() => {
        const cards = root.current!.querySelectorAll<HTMLElement>("[data-product-index]");
        const rail = root.current!.querySelector("[role='tabpanel']");
        if (cards.length && rail) disposers.push(reveal(rail, cards, {
          y: media?.desktop ? 60 : 30, scale: 0.94, rotation: (index: number) => media?.desktop ? (index % 2 ? 2 : -2) : 0,
          stagger: media?.desktop ? 0.13 : 0.06, duration: media?.desktop ? 1 : 0.6,
        }, !media?.desktop));
        if (media?.fine) cards.forEach(card => {
          const surface = card.querySelector<HTMLElement>(`.${styles.disc}`);
          if (surface) disposers.push(cardInteraction(card, surface, surface.querySelector("img"), card.querySelector("svg")));
        });
      });
      return () => { disposers.forEach(dispose => dispose()); revert(); };
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [collection], revertOnUpdate: true });
}
