# Synced musical mixer demo

Scope: existing private review Site only. No production website, GitHub repository or Sanity data changes.

- Four CC0 music stems plus four original accents, all equal-length decoded buffers.
- All eight loop sources start at one AudioContext timestamp. Pad changes adjust gain without restarting files, so late-added layers stay on the shared timeline.
- Pitch and tempo are coupled (108–215 BPM, default 152). The same automation is applied to all sources.
- WAV avoids MP3 delay/padding and OGG compatibility issues on older iOS.
- AudioContext is created/resumed directly from a tap before asynchronous file loading. Loading has a cancellable Stop control. Failed downloads may be retried. Request generations prevent a stopped or superseded load from starting playback.
- Existing hidden-page, pagehide, offscreen and unmount cleanup remains in place. No autoplay or microphone access.

Verification: TypeScript check and production build passed. Focused ESLint: no errors, one pre-existing ProductDeck effect-dependency warning. Node transport test passed gesture-resume ordering, asset dimensions, synchronized start, late layering without restart, identical rate automation, stop, restart and disposal. WAV numeric analysis: nonzero signal in all stems; combined unprocessed peak 0.8912, RMS 0.1687. Gain staging and compressor remain active.

Browser: cloud Chromium showed successful four-stem layering, all eight pads active, tempo update to 215 BPM, and Stop clearing pad state. Physical iPhone/Safari and subjective listening are not verified in this environment. The existing Playwright suite was updated for renamed pads but not run; browser checks used the supported preview browser instead.

Re-run transport test from checkout: `node tests/audio/transport.mjs`.
