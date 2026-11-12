// Owner-supplied names in their supplied order. Photos and product details are pending.
export const pendingProductLists: Record<string, readonly string[]> = {
  "karaoke/party-mic": ["PM10KPOP", "PM15L", "PM21", "PM6", "PM8KPOP", "STAGE-DEEJAY-DJ1", "PM22"],
  "karaoke/party-ball": ["BB10KW", "BB10K2"],
  "karaoke/portable": ["9M7", "K10-1W", "CYCLONE-400X", "IAMTHESTAR K3"],
  "karaoke/trolley": ["PARTYGROOVE3MK4", "PARTY-GROOVE", "PARTY-GROOVE X1", "PARTY GROOVE 3", "PARTY GROOVE X2"],
  "karaoke/boombox": ["BOOMBOX2", "BOOMBOX", "9M16"],
  "karaoke/pedestal": ["K200-W2"],
  "karaoke/high-power": ["DJX502W4"],
  "karaoke/video-projector": ["KPP-1"],
  "ds/dj-station": ["XD301LA", "XD92", "DEEJAYONE", "REMIX", "BEATMIX303", "DJ303", "STAGE-DEEJAY-DJ1"],
  "ds/sound-pads": ["BEATBOX", "STARPADS 36PACK", "STARPADS 20PACK2", "STARPADS 20E", "STARPADS S9X"],
  "ds/master-mix": ["MASTERMIX", "MASTERMIX INTRO"],
  "ds/ipad-controller": ["RM808"],
  "ds/turntable": ["POCKET VINYL"],
  "ds/disco-lighting": ["DL6-OCTO", "DL-B4", "DL-LB1"],
  "musical-instruments/guitar": ["JAMHERO1", "JAMHERO2", "JAMHERO2E", "JAMHERO3"],
  "musical-instruments/keyboard": ["K-SYNTH", "FP-50BT", "FP-50", "G-600-PACK", "G-600LA", "G-600L-PACK", "G-900 PACK", "KEYLOOP-25", "VL1-X", "VL-2X", "PSX-F80", "Musika Beat Station Pack", "Musika Piano Pack"],
  "musical-instruments/pocket": ["POCKET DJ", "POCKET SOLO", "POCKET CHORD", "POCKET PADS", "POCKET VINYL"],
  "musical-instruments/drums": ["STAGE ROCKER 2 PACK", "STAGE ROCKER 2 DJ", "Silent Drum-S100N", "FREEDOMS SOLO", "STAGE PAD"],
  "ds/deejay-mini-verse": ["DEEJAY mini VERSE"],
  "interactive-board/deejay-mini-verse": ["DEEJAY mini VERSE"],
  "interactive-board/playcube": ["PLAYCUBE"],
  "interactive-board/my-stage": ["MYSTAGE"],
  "interactive-board/groovebrix": ["GBS"],
  "k-pop/all": ["KHP", "SONIC", "VS-1", "XD93", "POCKET DJ", "PM8KPOP", "PM10KPOP"],
  "apps/ikey-station": ["iKey Station"],
  "apps/jam-hero": ["JAM HERO"],
  "apps/livejam": ["LIVEJAM"],
  "apps/playnjam": ["PLAYnJAM"],
  "apps/super-rocker": ["Super Rocker"],
  "apps/x808": ["X808"],
};

export const pendingProducts = Object.entries(pendingProductLists).flatMap(([collection, names]) => {
  const [topicId, subcategoryId] = collection.split("/");
  return names.map(name => ({ name, topicId, subcategoryId, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }));
});
export type PendingProduct = typeof pendingProducts[number];
export const pendingProductHref = (name: string) => `/products/${pendingProducts.find(product => product.name === name)!.slug}`;
