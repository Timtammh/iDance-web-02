import { useEffect, useRef, useState } from "react";
import { AudioLines, Pause, Play, Square, Volume2, VolumeX } from "lucide-react";
import styles from "./HomeAudio.module.css";

export function HomeAudio() {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(.5);
  const [muted, setMuted] = useState(false);
  const [notice, setNotice] = useState("");
  const [deviceVolume, setDeviceVolume] = useState(false);
  useEffect(() => {
    const media = audio.current;
    if (!media) return;
    media.volume = .5;
    if (Math.abs(media.volume - .5) > .01) setDeviceVolume(true);
    return () => { media.pause(); };
  }, []);
  const toggle = async () => {
    const media = audio.current;
    if (!media) return;
    if (!media.paused) { media.pause(); return; }
    setNotice("");
    try { await media.play(); if (!media.isConnected) media.pause(); } catch { if (media.isConnected) setNotice("Playback couldn’t start. Please press Play again."); }
  };
  const stop = () => { const media = audio.current; if (!media) return; media.pause(); media.currentTime = 0; };
  const changeVolume = (value: number) => {
    const media = audio.current;
    if (!media) return;
    media.volume = value;
    setVolume(value);
    if (Math.abs(media.volume - value) > .01) setDeviceVolume(true);
  };
  return <section className={styles.player} aria-label="Drums audio player" data-home-audio>
    <audio ref={audio} src="/media/drums.mp3" preload="metadata"
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
      onError={() => setNotice("Audio is unavailable. Please try again later.")} />
    <div className={styles.track}><AudioLines size={21} aria-hidden="true"/><div><strong>Drums</strong><span>{playing ? "Now playing" : "Press play to feel the rhythm"}</span></div></div>
    <div className={styles.controls}>
      <button className={styles.play} onClick={() => void toggle()} aria-label={playing ? "Pause Drums" : "Play Drums"}>{playing ? <Pause size={18}/> : <Play size={18}/>}</button>
      <button onClick={stop} aria-label="Stop Drums and return to start"><Square size={16}/></button>
      <button onClick={() => { const next = !muted; setMuted(next); if (audio.current) audio.current.muted = next; }} aria-label={muted ? "Unmute Drums" : "Mute Drums"} aria-pressed={muted}>{muted ? <VolumeX size={18}/> : <Volume2 size={18}/>}</button>
      <label className={styles.volume}><input aria-label="Drums volume" type="range" min="0" max="1" step="0.05" value={volume} disabled={deviceVolume} onChange={event => changeVolume(Number(event.target.value))} title="Volume. Some phones use the device volume buttons." aria-valuetext={`${Math.round(volume * 100)} percent`} /></label>
    </div>
    <p className={styles.notice} role="status">{notice || (deviceVolume ? "Use your device’s volume buttons." : "")}</p>
  </section>;
}
