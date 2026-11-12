import { useCallback, useEffect, useRef, useState } from 'react';
import { DeckAudio, DEFAULT_MIXER, type MixerSettings } from '../lib/audio/deckAudio';

export function useDeckAudio() {
  const engine = useRef<DeckAudio | null>(null);
  const pads = useRef<number[]>([]);
  const settingsRef = useRef(DEFAULT_MIXER);
  const generation = useRef(0);
  const [active, setActive] = useState<number[]>([]);
  const [settings, setSettings] = useState(DEFAULT_MIXER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const stop = useCallback(() => {
    generation.current++;
    engine.current?.stop(); pads.current = []; setActive([]); setLoading(false);
  }, []);
  const toggle = async (pad: number) => {
    // Mutate intent before resume resolves so rapid taps cannot resurrect a stopped loop.
    const next = pads.current.includes(pad) ? pads.current.filter(n => n !== pad) : [...pads.current, pad];
    pads.current = next;
    const request = ++generation.current;
    if (!next.length) { stop(); return; }
    try {
      setLoading(true); setError('');
      engine.current ??= new DeckAudio();
      engine.current.update(settingsRef.current);
      await engine.current.resume();
      if (request !== generation.current) return;
      engine.current.setPads(next); setActive(next); setError(''); setLoading(false);
    } catch {
      if (request !== generation.current) return;
      stop(); setError('Sound could not start. Tap a pad to try again.');
    }
  };
  const update = (key: keyof MixerSettings, value: number) => {
    const next = { ...settingsRef.current, [key]: value };
    settingsRef.current = next; setSettings(next); engine.current?.update(next);
  };
  useEffect(() => {
    const lifecycle = generation;
    const hide = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', hide);
    window.addEventListener('pagehide', stop);
    return () => {
      lifecycle.current++; engine.current?.dispose(); engine.current = null;
      document.removeEventListener('visibilitychange', hide); window.removeEventListener('pagehide', stop);
    };
  }, [stop]);
  return { active, settings, error, loading, toggle, update, stop };
}
