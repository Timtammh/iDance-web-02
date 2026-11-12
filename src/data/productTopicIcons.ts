import { AudioLines, AudioWaveform, Blocks, BoomBox, Box, CircleDot, CirclePlay, Disc3, Drum, Gamepad2, Grid2X2, Guitar, Headphones, KeyboardMusic, Lightbulb, MicVocal, MonitorPlay, Piano, Projector, Radio, SlidersHorizontal, Tablet, createLucideIcon, type LucideIcon } from "lucide-react";

// Portable karaoke speaker and microphone, matching the supplied reference.
const PortableKaraoke = createLucideIcon("PortableKaraoke", [
  ["rect", { x: "7", y: "5.5", width: "14", height: "17", rx: "3", key: "speaker" }],
  ["path", { d: "M9 5.5V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.5", key: "handle" }],
  ["circle", { cx: "14", cy: "10", r: "2", key: "tweeter" }],
  ["circle", { cx: "14", cy: "17", r: "4", key: "woofer" }],
  ["circle", { cx: "14", cy: "10", r: ".35", fill: "currentColor", stroke: "none", key: "tweeter-center" }],
  ["circle", { cx: "14", cy: "17", r: ".5", fill: "currentColor", stroke: "none", key: "woofer-center" }],
  ["rect", { x: "2", y: "12.5", width: "3", height: "3.5", rx: "1.5", key: "microphone" }],
  ["path", { d: "M2.3 15h2.4M2.5 16l.2 5.2a.8.8 0 0 0 1.6 0l.2-5.2", key: "microphone-handle" }],
]);

const PedestalKaraoke = createLucideIcon("PedestalKaraoke", [
  ["path", { d: "M10 3V2.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V3", key: "handle" }],
  ["path", { d: "M8 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2l-1 3a1.5 1.5 0 0 1-1.5 1h-3A1.5 1.5 0 0 1 9 8zM8.2 5h7.6", key: "console" }],
  ["path", { d: "M10.5 6.5h3M11 8h2M10.5 9v11.5M13.5 9v11.5", key: "column" }],
  ["path", { d: "M9 20.5h6l1 2H8z", key: "base" }],
  ["rect", { x: "7.5", y: "10", width: "1.8", height: "2", rx: ".9", key: "left-mic" }],
  ["rect", { x: "14.7", y: "10", width: "1.8", height: "2", rx: ".9", key: "right-mic" }],
  ["path", { d: "M8 12v2h.8v-2M15.2 12v2h.8v-2M7.5 12h3M13.5 12h3", key: "mic-holders" }],
]);

const TrolleyKaraoke = createLucideIcon("TrolleyKaraoke", [
  ["rect", { x: "6.5", y: "5", width: "11", height: "17.5", rx: "2", key: "body" }],
  ["path", { d: "M8.5 5a3.5 3.5 0 0 1 7 0", key: "handle" }],
  ["rect", { x: "8", y: "6.5", width: "8", height: "2.5", rx: ".6", key: "controls" }],
  ["path", { d: "M10.5 7.75h.01M13.5 7.75h.01", key: "buttons" }],
  ...[11,14.5,18].flatMap((y, row) => [8,11,14].map((x, col) => ["rect", { x: String(x), y: String(y), width: "2", height: "2.5", rx: ".4", key: `pad-${row}-${col}` }] as ["rect", Record<string, string>])),
  ["rect", { x: "2.5", y: "4.5", width: "3", height: "3.5", rx: "1.5", key: "left-mic" }],
  ["rect", { x: "18.5", y: "4.5", width: "3", height: "3.5", rx: "1.5", key: "right-mic" }],
  ["path", { d: "M2.5 6.5h3M18.5 6.5h3M3.2 8l.2 6h1.2l.2-6M19.2 8l.2 6h1.2l.2-6M2.7 10h3.8M17.5 10h3.8", key: "mic-handles" }],
]);

const DjStation = createLucideIcon("DjStation", [
  ["rect", { x: "1", y: "6.5", width: "22", height: "11", rx: "1.5", key: "deck" }],
  ["circle", { cx: "6", cy: "11", r: "3", key: "left-deck" }],
  ["circle", { cx: "18", cy: "11", r: "3", key: "right-deck" }],
  ["circle", { cx: "6", cy: "11", r: ".8", key: "left-hub" }],
  ["circle", { cx: "18", cy: "11", r: ".8", key: "right-hub" }],
  ["path", { d: "M11 8.5v5M13 8.5v5M10.5 11h1M12.5 11h1M10.5 16h3M12 15.5v1", key: "faders" }],
  ...[3,4.7,6.4,8.1,14.5,16.2,17.9,19.6].map((x, i) => ["rect", { x: String(x), y: "15.2", width: "1.1", height: "1.1", rx: ".15", key: `pad-${i}` }] as ["rect", Record<string, string>]),
]);

const IpadController = createLucideIcon("IpadController", [
  ["rect", { x: "1", y: "7", width: "22", height: "10", rx: "1.5", key: "body" }],
  ...[3.5,5.7,7.9,10.1,12.3,14.5,16.7,18.9].map((cx, i) => ["circle", { cx: String(cx), cy: "9", r: ".5", key: `knob-${i}` }] as ["circle", Record<string, string>]),
  ...[4,7,10,13,16,19].map((x, i) => ["path", { d: `M${x} 10.7v2.8M${x-.5} ${12+(i%2)*.5}h1`, key: `fader-${i}` }] as ["path", Record<string, string>]),
  ...Array.from({length:12},(_,i) => ["rect", { x: String(2.8+i*1.4), y: "15", width: ".7", height: "1", rx: ".1", key: `pad-${i}` }] as ["rect", Record<string, string>]),
  ["path", { d: "M20.5 10.5v5.5M21.5 11.5h.5M21.5 13h.5", key: "side-controls" }],
]);
const DeejayMiniVerse = createLucideIcon("DeejayMiniVerse", [
  ["path", { d: "M4 2h16v17M4 2v17M12 2v2M4 19h16l2 3H2zM3 20.5h18M9 19l-1 3M15 19l1 3", key: "stage" }],
  ["circle", { cx: "12", cy: "6.5", r: "2.5", key: "disco-ball" }],
  ["path", { d: "M9.7 5.7h4.6M9.7 7.3h4.6M12 4c-1.3 1.3-1.3 3.7 0 5M12 4c1.3 1.3 1.3 3.7 0 5", key: "ball-lines" }],
  ["circle", { cx: "8", cy: "11.5", r: "1", key: "left-head" }],
  ["circle", { cx: "16", cy: "11.5", r: "1", key: "right-head" }],
  ["path", { d: "M5.5 10.5l-.5 2 3 1 2.5-1v-1.5M8 13.5v2L6 18M8 15.5l2 2.5M18.5 10l1 2-3.5 1.5-2.5-1V11M16 13.5v2L14 18M16 15.5l2 2.5", key: "dancers" }],
]);

const PocketPlayer = createLucideIcon("PocketPlayer", [
  ["rect", { x: "5", y: "1.5", width: "14", height: "21", rx: "1.5", key: "body" }],
  ["rect", { x: "6.5", y: "3", width: "11", height: "4", rx: ".5", key: "display" }],
  ["path", { d: "M9 5v.5M10.5 4.5v1M12 4v1.5M13.5 4.5v1M15 5v.5", key: "levels" }],
  ["circle", { cx: "11", cy: "12", r: "4", key: "wheel" }],
  ["circle", { cx: "11", cy: "12", r: "1.2", key: "hub" }],
  ["path", { d: "M17 9v6M16.5 12h1M6.7 17.8l2 1.5-2 1.5z", key: "controls" }],
  ...[17.5,20].flatMap((y,row)=>[10,12.5,15].map((x,col)=>["rect",{x:String(x),y:String(y),width:"1.5",height:"1.5",rx:".2",key:`pad-${row}-${col}`}] as ["rect",Record<string,string>])),
]);

const MyStage = createLucideIcon("MyStage", [
  ["path", { d: "M4 12h16l3 5v2H1v-2zM1 17h22", key: "stage" }],
  ["rect", { x: "4.5", y: "8", width: "2", height: "3.5", rx: ".4", key: "phone" }],
  ["path", { d: "M5.3 10.7h.4M4 12h3", key: "phone-base" }],
  ...[9,13,17].map((cx,i)=>["circle", {cx:String(cx),cy:"7",r:".8",key:`head-${i}`}] as ["circle",Record<string,string>]),
  ["path", { d: "M7.5 7l.4 1.4H9l-.5 1.6-1 1 1 1M9.5 9l1 1-.5 2M11.5 8l.7 1H13v1l-1 1 .5 1M13 9l1.5-1.5M13.5 10l-.3 1 1 1M18.5 7.5L18 8.5h-1v1.5l.5 1-1 1M16.5 8.5L15.5 9l1 .5M16 10l-1 2", key: "dancers" }],
  ["path", { d: "M5 13.3h4l-.3 1.1H4.3zM10 13.3h4v1.1h-4zM15 13.3h4l.7 1.1h-4.4zM4 15h4.5l-.3 1.1H3.3zM9.7 15h4.6v1.1H9.5zM15.5 15H20l.7 1.1h-5z", key: "pads" }],
]);

const categoryIcons: Record<string, LucideIcon> = {
  "Party Mic": MicVocal, "Party Ball": CircleDot, "Portable": PortableKaraoke, "Trolley": TrolleyKaraoke,
  "Boombox": BoomBox, "Pedestal": PedestalKaraoke, "High Power": AudioLines, "Video Projector": Projector,
  "DJ Station": DjStation, "Sound Pads": KeyboardMusic, "Master Mix": SlidersHorizontal,
  "iPAD CONTROLLER": IpadController, "Turntable": Disc3, "DEEJAY Mini Verse": DeejayMiniVerse, "Disco Lighting": Lightbulb,
  "Guitar": Guitar, "Keyboard": Piano, "Pocket": PocketPlayer, "Drums": Drum,
  "My Stage": MyStage, "GrooveBrix": Blocks, "PLAYCUBE": Box,
  "iKey Station": KeyboardMusic, "JAM HERO": Guitar, "LIVEJAM": Radio,
  "PLAYnJAM": Gamepad2, "Super Rocker": Headphones, "X808": CirclePlay,
};
const familyIcons: Record<string, LucideIcon> = {
  "karaoke": MicVocal, "ds": SlidersHorizontal, "musical-instruments": Guitar,
  "interactive-board": MonitorPlay, "k-pop": AudioWaveform, "apps": Tablet,
};
export function productCategoryIcon(topicId: string, label: string) {
  return categoryIcons[label] ?? familyIcons[topicId] ?? Grid2X2;
}
