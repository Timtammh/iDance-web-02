# Local verification — 6 November 2026

## Passed

- Root `npm run build`, `npm run typecheck`, `npm run lint`.
- Studio `npm run typecheck` and local `sanity build` using non-production project ID `localtest`. This checks bundling only; no remote project was created/read/written.
- Playwright / local Google Chrome: 375, 768, 1024, 1440 px viewport checks with no horizontal overflow.
- Actual product tab changes, query-backed category/name filters, empty results and clear filters.
- Valid product slug, invalid slug not found, direct route refresh in Vite.
- Search no-results and Escape focus restoration; video unavailable dialog and focus restoration.
- Mobile navigation Tab focus loop, Escape and aria-expanded; keyboard product tabs.
- All rendered images loaded with non-zero natural dimensions in reduced-motion run (local fallback protects failed remote images).
- Contact required validation and explicit no-submission feedback; sample article labels.
- No uncaught page errors in the main interaction flow.
- No GA request before choice or after rejection in normal demo run.
- Separate production-bundle test with fake `G-LOCALTEST` ID and intercepted Google script: script loaded once only after accept, one initial page_view, one route page_view, no filter/query page_view, no private query in page_view payload, and no later events after consent withdrawal. **No real GA data was transmitted.** Normal production build restored without the fake test ID afterward.

## Not verified / remaining

- Real Sanity dataset content, project permissions and CORS (account/project ID not supplied).
- Real GA4 Realtime/DebugView receipt (measurement ID/property not supplied).
- Real video playback (URLs not supplied); absent-video handling is tested.
- Contact delivery (backend intentionally absent).
- Production host rewrites, HTTP status, performance on real mobile hardware, prerender/SSR and social previews.
- Final brand artwork/content rights, formal legal/privacy policy, production accessibility audit.

## Dependency audit

Compatible `npm audit fix` was attempted. Root reported 7 moderate findings in the development TypeScript ESLint/minimatch chain. Studio, after moving to the current stable release, reported 20 transitive findings (17 moderate, 3 high), including CLI tooling dependencies js-yaml, smol-toml and undici. These are unresolved; this is not a clean security audit. The package manager suggests disruptive downgrade/major changes for some entries. Do not deploy Studio publicly before reviewing and resolving applicable advisories. No broad forced dependency override was applied without compatibility evidence.

Commands for later recheck:

```sh
npm audit
npm --prefix studio audit
npx playwright test
npx playwright test --config playwright.analytics.config.ts
npm run build
```

The analytics test temporarily builds with a fake measurement ID; rebuild normally afterwards. Tests use the installed Google Chrome channel. Screenshots from the UI suite are in `test-results/home-{width}.png` (ignored by git).

## GSAP animation update

- Added @gsap/react 2.1.2 and replaced the old Home useEffect animation setup with scoped useGSAP/matchMedia.
- Build, lint and root typecheck passed after the implementation change.
- Existing functional and accessibility tests passed with the new card wrappers and animation behavior.
- Five dedicated motion tests passed: desktop lifecycle/rapid scrolling/route cleanup; mobile and reduced-motion; delayed provider content and failed product images; partial Hero initialization failure with static rollback; measured card hover and tab indicator interpolation.
- Normal desktop motion test: no page errors or console warnings, zero ScrollTriggers/repeating tweens after navigating to About, no count growth across three return trips or repeated tabs.
- Inactive-tab gating tested via simulated document.hidden + visibilitychange; offscreen gating tested via actual scrolling and IntersectionObserver.
- Live Sanity content was not queried. Delayed demo loading exercises the shared asynchronous ContentProvider mounting path; actual CMS asset changes still need validation with the real dataset.
- Local Chrome desktop frame sample during programmatic native scrolling: 119 measured frames, p95 17.6 ms, max 18.4 ms, zero frames over 50 ms. This is a local diagnostic, not a cross-device performance guarantee.
- Motion configuration and ownership are documented in MOTION.md.

### Additional Sanity adapter verification

The dedicated Sanity-mode browser suite passed with network interception. It covers actual client/query/image-builder execution, delayed response, error/retry with no silent demo fallback, valid generated image loading, and product-grid trigger geometry after 375/768/1440px resizing (within 2px). Route cleanup and CMS product rendering also passed. This uses fixtures, not a live remote Sanity dataset. Hero headline now retains a word separator across its visual line break for text reading/accessibility.

## Homepage GA4 / Sanity preparation — 2026-11-09

Base: GitHub `main` commit `1f98084bb36d9442381d27af0923e24f7fe50c2a`, freshly cloned and rechecked after implementation. Work is local on `prepare/ga4-sanity-home`; no push, deployment, production credential or remote CMS mutation.

Passed:
- Frontend `npm run typecheck` and `npm run build`.
- `npm run lint`: zero errors; one existing ProductDeck motion dependency warning, also reproduced on pristine base.
- Studio `npm --prefix studio run typecheck` and build with a fake `localtest` project ID.
- New CMS/analytics Playwright test TypeScript compilation.
- `node tests/analytics-runtime.js`: isolated real analytics module checks for consent/withdrawal gating, payloads, page-view deduplication, reacceptance/script singleton, listener cleanup, missing/invalid measurement ID and development no-op. No network requests.
- `git diff --check`.

Blocked, not passed:
- Chromium cannot launch in this cloud runtime (`socket() failed: Operation not permitted`), including an approved escalated attempt. The two new CMS tests and all four production analytics tests stop before browser assertions. Responsive appearance, gestures, live browser consent/visibility behavior and screenshot equivalence are not verified here.
- Real Sanity publish/fetch and GA4 receipt remain untested without configured accounts.

The new CMS tests cover optional-field fallback, ordered spotlight selection, editorial overrides, hero failure poster, published news, widths 375/768/1440 and route remounts. The three new carousel tests cover late consent, visibility/dedupe, withdrawal and navigation/selection. Legacy homepage tests predate the cinematic design and still contain old heading/tab/card expectations; they need alignment with current UI before they can be considered a full regression gate.

Normal frontend build was restored after the fake-ID analytics build. No CSS, media or asset files changed.

## Frosted glass design trial — 2026-11-09

Replaced full-page equalizer with six translucent curved edge pieces on a pearl-white gradient. Blue/lavender refraction is kept at the edges, outside the central reading column. Lower audio-bar dividers became fine refracted seams. Shared motion control pauses/resumes glass; pieces pause offscreen and when the document is hidden. Mobile and reduced-motion styles are static. Previous GA4/CMS preparation and 10% desktop-menu increase are retained.

Frontend typecheck/build pass; lint has only the existing ProductDeck motion warning. Managed cloud-browser preview visually reviewed at 1180px: no horizontal overflow, six glass pieces, zero equalizer layers, two visible animations running and four offscreen animations paused. Pause stopped all six; resume worked. Text/card readability inspected. Mobile and reduced-motion CSS were reviewed but not runtime-emulated. Neither GitHub nor the existing hosted Site was changed.

## Animation, navigation and supplied hero film — 2026-11-09

Glass movement increased to 10–15-second alternating paths, with a negative start offset and larger drift/rotation. Mobile now uses a smaller animated path instead of the earlier static treatment; reduced-motion still disables decorative animation. Header desktop/mobile menus show Products, About, TV, Contact only. Find Your Sound and News sections remain, including their anchor targets; footer links are unchanged.

Managed-browser checks: desktop glass moved about 60px vertically over 8.56 seconds; mobile-frame transforms changed over time at a 375px content viewport with no horizontal overflow. Opened mobile menu and verified four links, closed it and verified both scroll sections still present. Pause stopped all six animations; resumed. Reduced-motion rule reviewed, not runtime-emulated.

New hero uses the user's original `public/media/DJX101EV2-10MB.mp4` unchanged (8,378,149 bytes, 34.736 seconds, H.264/AAC), plus a poster extracted at 3 seconds. SHA-256: `0bb141c7338a85d8789e6f59f815bcccef8b856d2c1ccd9b12a1f52cd833e725`. Under GitHub's 100MB file limit. Actual browser playback verified with advancing currentTime, muted/loop/playsinline enabled and object-fit cover. No GitHub push or hosted Site deployment.

## Responsive hero: desktop film and mobile images
- Desktop hero is an exact 16:9 container with `object-fit: contain`; verified in the managed browser at 1165 × 655.3125, with original 1920 × 1080 film playing and full frame visible.
- Mobile (below 768px) mounts eight supplied original PNG images instead of a video element. Images are centered and contained, never additionally cropped. Source images 2–3 are inherently close-ups.
- Slideshow advances every six seconds with a 550ms crossfade. Arrows, image dots, horizontal swipes, and pause/play are available. Manual selection or keyboard focus pauses rotation. Hidden/offscreen slideshows stop timers. Reduced-motion disables rotation and transitions but leaves manual selection enabled.
- Browser checks at 375px content width: all eight images loaded, no video element, no horizontal overflow; full Pocket Cube image including bottom caption visibly verified. Auto advanced 4→5; pause held 5; next/previous changed 5→6→5. Reduced-motion implementation reviewed in code; real mobile device/touch gestures and reduced-motion OS setting not runtime tested.
- `npm run typecheck`, `npm run build`, `npm run lint`: passed; lint has only the previously verified preexisting ProductDeck hook warning.
- Original film and all eight original image files included unchanged. No GitHub push or hosted-site replacement.

## Intro film and slide-up entry
- Uploaded original intro.mp4 verified byte-for-byte (838,737 bytes, H.264 High, 2560×1440, 24fps, 6.583s). SHA256 c76dfe52e7ca218c8d410014c3dbd82df8dc0d69fcaf3745cfd43aec81b41369. Existing repository clip was identical; its formerly unused IntroGate is now connected to the app.
- Muted inline autoplay on opening; whole-screen accessible entry button and Enter/Space/Escape skip. Natural ending enters automatically, playback failure also safely enters, autoplay rejection retains a clear entry prompt.
- Main website mounts behind an inert transition surface and rises from bottom over 1.15 seconds. Intro drifts slightly upwards beneath it. Completion restores document scrolling and moves keyboard focus to the website. Repeated entry calls are guarded. Direct deep links are preserved.
- Reduced-motion keeps intro still and enters without the travel animation. Browser manually verified desktop autoplay, click transition (751px translation sampled during travel), natural ending, Escape, restored scrolling/focus, mobile click, and About deep-link preservation. OS reduced-motion and actual physical touch were not available for runtime testing.
- New tests/intro.spec.ts covers entry and reduced-motion; existing E2E flows skip intro explicitly. Specs supplied but not executed because standalone browser runner is restricted in this environment.
- Final managed-browser motion QA: directional scene transforms sampled during arrival (x ±18.9px, y25.6px, scale .98 and rotation), image parallax changed with scroll; spotlight moved from y29.7px to −12.5px with rotation. Mobile arrivals sampled at375px, no horizontal overflow; About route loaded correctly after fresh reload. HMR hook-order warning during live source editing disappeared after fresh navigation.
- Final frontend typecheck/build/lint passed; only unchanged ProductDeck hook-dependency warning. New motion adds about2KB gzipped JS over prior build. No source image/video compression or appearance alterations.

## Centered half-width intro
- Intro video now uses 50vw width, intrinsic 16:9 aspect ratio and exact viewport centering on black. Fullscreen click/tap entry and slide-up transition are unchanged.
- Browser measurements: desktop viewport1180×757 → film590×331.875 at295,212.5625; mobile iframe390×844 → film195×109.6875 at97.5,367.15625. Both are exactly50% viewport width and centered, with no cropping.

## Products mega menu
- Bose-reference three-column white dropdown: five topic selectors at left, corresponding subtopics in the middle and an empty neutral image placeholder at right. No reference branding or imagery copied.
- Desktop mouse entry opens; click/touch toggles; arrows/Home/End navigate topics, right arrow enters content, Escape closes and restores trigger focus, focus/outside exit and route changes close. Mobile uses the existing modal and expandable topic groups; Apps has no subtopics.
- Confirmed category labels include Party Mic and provisional Trolley under Karaoke, DEEJAY Mini Verse under DS and Interactive Board, plus requested instrument/board topics. Ambiguous handwriting stays Category to confirm. Links resolve only against exact existing catalogue categories/products; unmatched labels show Pending rather than fabricated destinations.
- Managed-browser verification: desktop panel screenshot, keyboard Karaoke→DS, Escape close/focus restore, Search closes menu, Browse Karaoke routes to /products?category=karaoke and closes. Mobile dialog and Interactive Board expansion visibly verified. Mouse-hover automation and real physical touch not run through this browser API; handlers reviewed and five Playwright cases supplied. Standalone Chromium launch remains blocked by socket permissions before assertions.
- Typecheck/build/lint passed, with only existing ProductDeck hook warning. Previous intro50vw, motion, responsive hero, media, GA4/CMS and glass remain intact.

## Supplied Bestigia headings
- Original supplied Bestigia-Regular.ttf (67,860 bytes) stored locally under public/fonts. Metadata: Bestigia Regular, weight400, Ronny Studio/Rony Rizki Jaya, ©2021 all rights reserved,268 mapped glyphs, OS/2 fsType0. File does not contain explicit web/commercial licensing terms; rights must be confirmed before public use.
- Main page h1/h2 headings use Bestigia400 with font-display:swap and Parkinsans/Arial/sans-serif fallback. Navigation, body, subtopics and product-card h3 labels retain original fonts. No synthetic bold or external font service.
- Browser desktop/mobile screenshots visibly verified new heading design; About h1 uses Bestigia; mobile375px has no overflow. Typecheck and production build passed.

## Final full-project handoff
- Latest remote main rechecked unchanged at1f98084bb36d9442381d27af0923e24f7fe50c2a. No tracked deletions/renames and no push.
- Latest refinements included: compact animated mega menu, All-category entries, no Pending labels, single hover underline, supplied Bestigia headings at.01em tracking; original Drums MP3 with persistent scaled bottom-right dock, no time display; intro prompt70% text size. All supplied media/fonts remain byte-identical.
- See UPDATE-INSTRUCTIONS.md for non-deleting rsync merge preserving .git/.env and local work. Desktop means browser preview here; no build on the user's Mac was performed.
