# Animation optimization review

Based on GitHub main c496fe700085a7aeb4017c4a4f39818bc9bedd69 (verified 9 November 2026). Every tracked source/asset matched its GitHub blob hash before edits. Original checkout untouched. No remote commit, push, or deployment.

## Changes
- Request the current mobile hero image first, then preload only the next. Previously eight opacity-hidden images occupied the same viewport, defeating normal lazy-loading deferral.
- Preserve the previous image until a newly selected slide loads.
- Use full-resolution, lossless WebP hero images. Decoded RGBA pixels verified identical to the original PNGs; originals retained.
- Pause desktop hero decoding offscreen and when the document is hidden. Resume only when appropriate, preserving manual pause and reduced-motion preferences. Manual play remains possible.
- Limit the upward intro transition's moving surface to one viewport while entering; restore the full page on completion.
- Ignore mobile browser toolbar resize noise in ScrollTrigger and request safe deferred refreshes after layout changes.
- Preserve glass artwork, choreography, timing, and reduced-motion CSS.

## Measured asset costs
Original eight PNGs: 17,594,920 bytes.
All eight lossless WebPs: 10,371,042 bytes (41.1% less).
First image plus next-image preload: 2,527,348 bytes (85.6% less than all original PNGs).
These are asset byte counts, not measured FPS or a guarantee of smoother scrolling.

## Verification
- TypeScript: passed.
- ESLint: no errors; existing ProductDeck.tsx line 216 exhaustive-deps warning remains.
- Production build: passed.
- git diff --check: passed.
- Managed Chrome browser preview: intro entry and navigation worked; desktop video played, paused offscreen, resumed onscreen, and remained paused after explicit manual pause.
- Managed Chrome at 390px iframe width: only first two image sources assigned initially (six remained without source/decoded width); all eight slides successfully selected and decoded. Final direct jump to slide eight verified after last code edit.
- Pixel equivalence: every WebP's decoded RGBA bytes matched its original PNG.
- Added tests/performance.spec.ts for mobile request gating, slide browsing/reduced motion, and desktop video pause behavior. Automated Playwright suite was NOT run: local browser launch cannot create required sockets in this container. Managed browser UI checks above ran separately.
- No real iPhone/Safari device profiling, FPS comparison, or hardware GPU trace was possible. Physical-device validation is still needed before calling the stutter resolved.

## Preview and apply
Internal QA runs using sites-preview against this checkout. Its localhost URL is internal, not a user-accessible hosted preview.
Review the included changes against the stated GitHub main commit before copying. Run npm run typecheck, npm run lint, npm run build, then the Playwright suites in a normal browser-capable environment. No package dependency changes.

## Desktop follow-up (user clarified desktop stutter)
- Removed the mixer CSS card-cue transform/opacity animation because it competed with GSAP on the same product nodes. GSAP's entrance and the surrounding LED/border cue remain.
- Changed the mixer moving glow from a left-position update to a transform, maintaining the same gradient size and placement.
- Glass already pauses outside the viewport. Its page-wide mask measured 1150 by 5325 CSS pixels. Kept the artwork unchanged; no unverified visual simplification was applied.
- Before/after used production builds in the same managed Chrome, 1165 by 745 CSS-pixel iframe, scripted 12-second scroll at 480px/s. Two runs per variant, not a physical-device/GPU benchmark:
  - Baseline: 573/575 sampled frames; 124/131 frame gaps over 25ms; 31/29 frames with simultaneous CSS card-cue and GSAP transform ownership; 488/492 frames with offscreen video still playing.
  - Optimized: 589/582 sampled frames; 119/127 frame gaps over 25ms; 0 conflicting animation frames; 9/9 offscreen-playing frames while the visibility observer caught up.
  - Median frame interval about 16.7ms and p95 about 33.4ms in all four runs. Overall timing improvement was small; do not claim the desktop stutter fully resolved or a dramatic FPS gain.
- Initial failed fixture runs displayed the 404 page and were discarded. The four reported runs were corrected homepage runs.
- Final managed-browser checks: mixer Next products completed at scrollLeft 316 of maximum 631; switching New Releases then Popular restored five product cards; card CSS animations are none; visual layout reviewed.
- Final typecheck/build/diff check passed. Lint remains zero errors with one existing ProductDeck warning. Temporary profiling build assets were moved outside the deployable checkout before final build.
- Desktop managed-browser handoff prepared, preview daemon left running. No commit/push/deployment.

## Blue header and video-edge revision
- Used the user's supplied logo.svg as the header mark; rendered in white with its vector geometry preserved. Footer logo unchanged.
- Added the reference cyan (#00aeef) masthead with a curved lower-right edge, darker blue edge, and gray remainder. Desktop height 104px; mobile height 88px. Navigation uses dark ink for text contrast; white logo kept on cyan.
- Removed backdrop blur from the now-opaque sticky header. Menu anchoring and maximum height follow the new header height.
- Managed Chrome visual checks at desktop and 390px mobile width passed. Desktop Products opens and Escape closes it; mobile navigation opens and Close dialog dismisses it.
- The hero has no CSS border. ffprobe found the bundled film is 1920x1080 with sample aspect ratio 383:384 (display ratio 383:216). Chrome reports intrinsic 1920x1083. That mismatch causes the thin side letterbox in a 16:9 contain box.
- Corrected only the known bundled film to fill its intended 16:9 pixel frame (about 0.26% aspect correction). No cropping, video re-encoding, or source-pixel deletion. Future CMS video sources retain object-fit:contain.
- Final typecheck and production build passed; lint retains the same existing warning only. No push or deployment.

## Compact cyan revision
User requested cyan only slightly beyond the logo. Cyan width now equals the content gutter plus logo width plus 42px desktop / 30px mobile; curved corner is 38px / 26px. White logo, header/menu sizing, and all performance/video fixes retained. Desktop and 390px mobile screenshots reviewed. Typecheck/build passed; same existing lint warning only.

## Solid-orange spotlight revision
User confirmed the entire “A little louder. A little closer.” section. Applied sampled #FF8646 / RGB(255,134,70) as an opaque solid section background, with no refraction/divider overlay. Matched the illustration's former pale circle fill to the orange; retained its subtle outline and mixer artwork.
All spotlight text/icons/labels use #251B15 (7.02:1 contrast on orange). CTA is dark #251B15 with white text (16.85:1), a distinct hover, and dark focus outline. Other sections and the compact cyan header remain unchanged.
Desktop and 390px mobile layout visually inspected; computed background verified exact RGB. CTA still navigates to /products. Typecheck/build passed; lint remains one pre-existing ProductDeck warning, no errors. Added #spotlight anchor for review navigation. No push/deploy.

## Wide desktop and News navigation
- Glass had a 540px width cap but unbounded negative percentage offsets, causing progressive clipping as the viewport grew. Capped offsets at their existing size-cap proportions. No extra layers, larger artwork, blur, or animation loops; observer pause and reduced-motion rule unchanged.
- Managed Chrome responsive iframe checks at 1920, 2560, 3440 CSS-pixel widths: glass remains partially within both edges; visible pieces running, offscreen pieces paused. Left piece remains x=-236,width=540 at all three sizes instead of retreating to x=-481.6 at 3440. Screenshots reviewed. These are responsive-layout tests, not physical-monitor frame-rate benchmarks.
- News inserted before Contact in shared desktop/mobile navigation, linking /#news. About → News verified, destination section top120px below header. News anchor offset accounts for desktop104px/mobile88px header.
- Mobile390 preview: About → menu → News closes menu, navigates /#news and positions News section at103.7px; inspected screenshot and correct menu order.

## XD301 spotlight, sweeping masthead and video edge follow-up
- Replaced illustrative mixer with requested generated XD301 preview PNG (1536×1024 alpha), object-fit contain. Accurate copy supplied by parent based on giftbox. CTA Explore XD301 links to existing /products catalogue; no dedicated XD301 detail exists. Desktop/mobile screenshots verified; CTA navigates correctly. AI-rendered tiny labels/icons are not pixel-exact to the real product; review asset, not approved production artwork.
- Replaced rounded corner and 3px outline with a stroke-free vector sweeping curve, compact at logo edge. Retained white supplied logo, accessibility and navigation.
- Video follow-up: browser reports matching container/video rectangles, zero border, no shadow or transform, fill at full16:9. Sampled all34 seconds at1fps. At about6–9 seconds the encoded image itself has a black top pixel row; subsequent rows contain image. Final white end-card also has dark top row. Earlier single-frame inspection missed this scene-specific edge. No cropping/reencoding applied to preserve full frame as requested. Removing encoded edge requires approval for a small crop or clean replacement video.

## XD301 sharpness, shadow and tighter spacing
- Original image retained untouched at1536×1024. Settled prior rendering had no blur/opacity filter; nested CSS−7° plus scroll GSAP±3° rotations resampled the bitmap. Removed both rotations and reveal scaling. Retained gentle vertical parallax with integer-pixel snap and force3D:false. This reduces avoidable browser resampling but cannot recover AI-generated fine text or improve a magnified screenshot.
- Added static alpha-shaped warm soft shadow (desktop0 14px 12px at28% opacity, mobile0 10px 9px). No animated blur.
- Spotlight vertical outer padding reduced exactly10%:112→100.8 desktop,88→79.2 tablet,68→61.2 mobile. Mobile inter-column vertical gap40→36px. Width and image size unchanged.
- Latest header request: increased curve bow using cubic controls88,52/42,100 with horizontal bottom tangent; same extent, cyan, no stroke, logo and menu unchanged.
- Additional requested10% reduction applied only to current vertical outer padding:100.8→90.72px desktop,79.2→71.28px tablet,61.2→55.08px mobile. All other dimensions/shadow/motion unchanged (81% of original outer padding).
- Latest screenshot targets Explore XD301 CTA only. Reduced typography, arrow, gap and padding20%; desktop measured181.22×54.19→145.27×43.75px (fractional border rounding). Mobile values scaled20% too. Transparent hit extension retained; no changes to product/section/header.

## XD301 product page and DS category
- Added DJ Mixer under DS, retaining all other menu entries. Added an XD301 product/category record using existing content models and existing dynamic route /products/xd301. Homepage Explore XD301 now points there; menu points to filtered /products?category=dj-mixer.
- Product page: responsive orange gallery, supplied original second image, caption identifying generated visualisation, giftbox-supported features/specs, product enquiry CTA. No price, output power, capacity/runtime, availability or packaging dimensions represented as product dimensions.
- Managed Chrome manual checks passed desktop and mobile DS→DJ Mixer→XD301, gallery second image, and enquiry route prefilled Subject=Product enquiry: XD301. Existing enquiry form is a non-sending demo, explicitly identified on Contact page. No CMS records published. CMS handover in XD301-CONTENT.md.
- Typecheck/build pass; lint only pre-existing ProductDeck dependency warning. Added tests/xd301.spec.ts for later automation; browser launch restriction still prevents executing Playwright locally.

## Three-level catalogue and reference-inspired product page
- Shared taxonomy:5 major pages,13 confirmed subcategory routes; unknown names remain nonclickable. Only exact existing catalogue category matches, excluding demo concepts, populate cards. No invented products/prices. DS→DJ Mixer→XD301 works via desktop three-column menu and mobile nested disclosures.
- Desktop keyboard checked Show DJ Mixer products→ArrowRight focuses XD301→Enter opens product. Escape/outside and existing major keyboard interactions retained. Mobile All DJ Mixer opens its own page, product tile opens XD301.
- Category pages use neutral square panels and responsive3/2/1 columns. Tested DS desktop, DJ Mixer mobile, and Disco Lighting empty state.
- XD301 page updated with amber generated campaign asset, sticky Product image/Features/Specifications/Support navigation, image chooser, supplied features/specs. Original product image remains available. Mobile campaign keeps full16:9; Specs anchor measured top160.375px, below both sticky bars. No third-party branding or price copied.
- Campaign image is optional CMS product field (schema/query/type/loader). Website typecheck, build and Studio typecheck pass; only pre-existing lint warning. No CMS publish or git push.
