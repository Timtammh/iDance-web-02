# TV library redesign

The TV route now uses `TVLibrary.tsx`, leaving the homepage `VideoGrid` layout and pitch-control implementation unchanged.

- YouTube-style dark library with 16:9 thumbnail grid and titles below each image.
- Home, Videos and Shorts route views, category filters, search, empty results and clear filters.
- Home includes a featured video row, a portrait Shorts section and the remaining films.
- Local thumbnail files; third-party players connect only when selected.
- Existing English company films and local XD301 / DJX101E films retained. Titles naming another language are excluded.
- No invented views, upload dates, duration, popularity or subscription figures.

## Verified Short

On 11 November 2026, the live public company channel https://www.youtube.com/@idanceaudiocom/shorts listed **Power Space shoot** and linked to https://www.youtube.com/shorts/ygumqbd69B8. Its actual portrait thumbnail was retrieved from the channel's displayed image and saved locally as `public/media/tv/ygumqbd69B8.jpg` (converted from the delivered AVIF encoding to JPEG). Only this verified Short is included. The player supports the `/shorts/` URL format, an external YouTube fallback and a portrait dialog.

## Validation

- TypeScript and production build passed. Eight video URL parser assertions passed (Shorts, watch, youtu.be, invalid/external URLs).
- Final ESLint run passed with one existing hook dependency warning in `ProductDeck.tsx`.
- Added `tests/tv-library.spec.ts` covering navigation, filtering, empty state, no YouTube requests before interaction, local and YouTube players, repeated open/close, focus restoration, history, refresh and mobile/tablet/desktop overflow.
- Focused regression command: `npx playwright test --config playwright.tv.config.ts`.
- Browser tests could not execute in this container: Chromium process launch fails because the environment denies `socket()`; the reviewed escalated run had the same error. The cloud browser cannot connect to this container's loopback preview. Browser checks remain unverified, not passed.
- No deployment or remote push performed.
