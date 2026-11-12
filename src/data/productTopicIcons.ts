import { AudioLines, AudioWaveform, Blocks, BoomBox, Box, CircleDot, CirclePlay, Disc3, Drum, Gamepad2, Grid2X2, Guitar, Headphones, KeyboardMusic, Lightbulb, Luggage, MicVocal, MonitorPlay, Music4, PanelsTopLeft, PanelTop, Piano, Projector, Radio, SlidersHorizontal, Speaker, Tablet, type LucideIcon } from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  "Party Mic": MicVocal, "Party Ball": CircleDot, "Portable": Speaker, "Trolley": Luggage,
  "Boombox": BoomBox, "Pedestal": PanelTop, "High Power": AudioLines, "Video Projector": Projector,
  "DJ Station": PanelsTopLeft, "Sound Pads": Grid2X2, "Master Mix": SlidersHorizontal,
  "iPAD CONTROLLER": Tablet, "Turntable": Disc3, "DEEJAY Mini Verse": AudioWaveform, "Disco Lighting": Lightbulb,
  "Guitar": Guitar, "Keyboard": Piano, "Pocket": Music4, "Drums": Drum,
  "My Stage": MonitorPlay, "GrooveBrix": Blocks, "PLAYCUBE": Box,
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
