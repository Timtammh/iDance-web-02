# iDance motion system

GSAP + ScrollTrigger + @gsap/react coordinate the site choreography. Static content is visible without GSAP. There is no pinned section, scroll hijacking, per-frame React state or permanent `will-change` layer.

## Current choreography

- `src/components/layout/IntroGate.tsx`: short local intro film with click, tap, Enter and Escape skip. The main site rises into place over 1.15 seconds, then ScrollTrigger refreshes. Reduced motion skips the lift. The intro owns this transition separately from section motion.
- `src/hooks/useHomeMotion.ts`: section headings arrive in a 0.1-second stagger; scene cards rise 76px from opposing 56px directions with 1.5-degree rotation and a small scale change. Their captions enter separately, and desktop photography travels inside an overscanned image frame. Spotlight artwork and copy enter from opposite sides, then its product and light depth move in opposing directions as the reader scrolls. Video cards cascade into view; news rows slide horizontally; divider lines expand from the center; the closing CTA lifts and scales into place.
- `src/hooks/useDeckMotion.ts`: the actual mixer shell lifts 90px with a seven-degree perspective tilt. Hardware controls settle in separately. Product cards arrive in a 0.13-second stagger with alternating two-degree rotations. Changing a tab immediately changes the data and starts a fresh card entrance, without replaying the whole mixer.
- `src/hooks/useProductHover.ts` and `src/lib/motion/choreography.ts`: fine-pointer product surfaces lift 9px, product images scale to 1.09, arrows travel diagonally, and surfaces track pointer position with up to four/five degrees of tilt. Keyboard focus receives the lift without pointer tilt. Pressing to drag resets tilt so the carousel stays direct.
- `src/hooks/usePageMotion.ts`, integrated by `usePage.ts`: heading entrances, grid arrivals, prose/features/specification staggers, detail-image arrivals and contact-field entrances on interior routes. No metadata or analytics behavior changes.

The desktop hero remains an unchanged full 16:9 video frame. No GSAP zoom, crop, or parallax is applied to that video. The mobile hero remains its existing eight-image slideshow. The decorative glass artwork and its pause control remain independently owned by `HeroSoundWaves`.

## Accessibility and lifecycle

- `reveal()` in `src/lib/motion/choreography.ts` creates scroll-triggered arrivals with `immediateRender:false`. Waiting content stays in its normal visible state; in-progress arrivals retain at least 0.3 opacity. Complete reveals clear their temporary transform/opacity styles.
- Keyboard focus immediately completes the containing reveal. Form fields, tabs, links and cards never wait for choreography before they work.
- `prefers-reduced-motion:reduce` removes section reveals, GSAP hover/tilt, image parallax and decorative GSAP loops. Match-media changes revert animation-owned inline styles in place.
- Below 768px there is no scroll scrub or GSAP repeating motion. Mobile entrances use smaller 22–38px distances, shorter 0.6–0.8-second timing and no perspective tilt.
- Card entrance and hover use different elements. Spotlight entrance and parallax use different elements. The image-parallax and product-hover surfaces explicitly disable competing CSS transform transitions in their scoped context; reverting restores CSS defaults.
- The remaining repeating spotlight drift pauses offscreen and whenever the tab is hidden.
- `useGSAP`, scoped `gsap.matchMedia`, explicit event cleanup and `revertOnUpdate` remove old route/collection motion. `safelyAnimate` reverts partial setup if animation initialization fails.
- Debounced load/error, fonts-ready and ResizeObserver checks refresh trigger geometry after actual layout changes. All observers, listeners and timers are removed on unmount.

## Verification

TypeScript and production build checks are required after edits:

```sh
npm run typecheck
npm run build
npm run lint
```

The current-selector `tests/motion.spec.ts` covers desktop route/tab cleanup, actual mixer/scene targets, offscreen and visibility pausing, mobile/reduced-motion behavior, the eight-image mobile hero and 16:9 desktop frame, hover/tilt reset, focus during an entrance, partial-setup rollback, interior-field focus and rapid navigation.

```sh
npx playwright test tests/motion.spec.ts --workers=1
```

This suite replaces historical tests that referenced the removed hero-copy/product wrappers and old home product grid. A supported local Chrome/Chromium Playwright installation is needed to execute it. The current implementation was additionally checked in the managed browser: visible scene-card transforms and image parallax, changing spotlight depth with scroll, interior-route navigation, and 375px mobile arrivals without overflow or GSAP image scrub. This is not a substitute for real-phone performance testing or live Sanity production-content validation.
