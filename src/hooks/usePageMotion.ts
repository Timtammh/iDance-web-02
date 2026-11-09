import { conditions, gsap, safelyAnimate, useGSAP } from "../lib/motion/gsap";
import { arrowInteraction, reveal, watchMotionLayout } from "../lib/motion/choreography";

export function usePageMotion(pathname: string) {
  useGSAP(() => {
    if (pathname === "/") return;
    const page = document.querySelector<HTMLElement>("#main > .page");
    if (!page) return;
    const mm = gsap.matchMedia(page);
    mm.add(conditions, ({ conditions: media }) => {
      if (media?.reduce) return;
      const mobile = !media?.desktop;
      const disposers: Array<() => void> = [];
      const revert = safelyAnimate(() => {
        const heading = page.querySelector("h1");
        if (heading) {
          const copy = heading.parentElement!.querySelectorAll(":scope > .eyebrow, :scope > h1, :scope > .intro");
          disposers.push(reveal(heading.parentElement!, copy, { y: mobile ? 30 : 58, stagger: 0.12 }, mobile));
        }
        page.querySelectorAll<HTMLElement>(".product-grid, .news-grid, .video-grid").forEach(grid => {
          // Product hover owns its inner image surface. Grid reveal owns its
          // parent, leaving filtering and individual card controls immediate.
          disposers.push(reveal(grid, grid, { y: mobile ? 35 : 70, duration: 1 }, mobile));
        });
        page.querySelectorAll<HTMLElement>(".prose, .feature-list, .specifications").forEach(group => {
          if (group.children.length) disposers.push(reveal(group, group.children, { y: mobile ? 22 : 38, stagger: 0.07 }, mobile));
        });
        page.querySelectorAll<HTMLElement>(".detail-image, .article-cover").forEach(image => {
          disposers.push(reveal(image, image, { scale: 0.92, y: mobile ? 30 : 64, rotation: mobile ? 0 : -2 }, mobile));
        });
        const form = page.querySelector("form");
        if (form) disposers.push(reveal(form, form.children, { x: mobile ? 0 : 38, y: mobile ? 24 : 0, stagger: 0.08 }, mobile));
        page.querySelectorAll<HTMLElement>(".video-card, .news-card").forEach(card => disposers.push(arrowInteraction(card)));
      });
      return () => { disposers.forEach(dispose => dispose()); revert(); };
    });
    const stopWatching = watchMotionLayout(page);
    return () => { stopWatching(); mm.revert(); };
  }, { dependencies: [pathname], revertOnUpdate: true });
}
