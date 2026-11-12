/** Arcade stems: Colorosse, CC0. See public/audio/arcade/LICENSE.txt.
 * Four original accent loops are generated locally. All eight share one transport. */
export const PAD_NAMES = ['Drums', 'Clap', 'Hi-hat', 'Perc', 'Bass', 'Chords', 'Lead', 'Spark'] as const;
export type MixerSettings = { tone: number; echo: number; pitch: number; balance: number; left: number; right: number };
export const DEFAULT_MIXER: MixerSettings = { tone: 65, echo: 25, pitch: 50, balance: 50, left: 65, right: 65 };
export const DEMO_BPM = 60 * 16 / (278528 / 44100);
export const playbackRate = (pitch: number) => Math.pow(2, (pitch - 50) / 100);

export class DeckAudio {
  readonly context: AudioContext;
  private master: GainNode;
  private channels: GainNode[];
  private filter: BiquadFilterNode;
  private pan: StereoPannerNode;
  private wet: GainNode;
  private delay: DelayNode;
  private buffers: AudioBuffer[] = [];
  private sources: AudioBufferSourceNode[] = [];
  private gates: GainNode[] = [];
  private loading: Promise<void> | undefined;
  private settings = DEFAULT_MIXER;
  constructor() {
    const Context = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Context) throw new Error('Web Audio unavailable');
    this.context = new Context();
    const c = this.context;
    this.master = c.createGain(); this.master.gain.value = 0;
    const limiter = c.createDynamicsCompressor();
    limiter.threshold.value = -12; limiter.ratio.value = 8;
    this.filter = c.createBiquadFilter(); this.filter.type = 'lowpass';
    this.pan = c.createStereoPanner();
    this.channels = [c.createGain(), c.createGain()];
    this.channels.forEach(channel => channel.connect(this.filter));
    this.filter.connect(this.pan); this.pan.connect(this.master);
    this.delay = c.createDelay(2);
    const feedback = c.createGain(); feedback.gain.value = .22;
    this.wet = c.createGain();
    this.pan.connect(this.delay); this.delay.connect(feedback); feedback.connect(this.delay);
    this.delay.connect(this.wet); this.wet.connect(this.master);
    this.master.connect(limiter); limiter.connect(c.destination);
    this.update(DEFAULT_MIXER);
  }
  update(settings: MixerSettings) {
    this.settings = settings;
    const t = this.context.currentTime, rate = playbackRate(settings.pitch);
    this.filter.frequency.setTargetAtTime(180 * Math.pow(100, settings.tone / 100), t, .03);
    this.pan.pan.setTargetAtTime((settings.balance - 50) / 50, t, .03);
    this.wet.gain.setTargetAtTime(settings.echo / 100 * .5, t, .03);
    this.channels[0].gain.setTargetAtTime(settings.left / 100, t, .03);
    this.channels[1].gain.setTargetAtTime(settings.right / 100, t, .03);
    // Identical rate automation preserves phase between every recorded stem and accent.
    this.sources.forEach(source => source.playbackRate.setTargetAtTime(rate, t, .03));
    this.delay.delayTime.setTargetAtTime(60 / DEMO_BPM * .75 / rate, t, .03);
  }
  async resume() {
    // Resume synchronously in the tap handler before any network/decode await (iOS).
    await this.context.resume();
    if (this.context.state !== 'running') throw new Error('Audio suspended');
    this.loading ??= this.load().catch(error => { this.loading = undefined; throw error; });
    await this.loading;
    if (this.context.state !== 'running') throw new Error('Audio interrupted');
  }
  private async load() {
    const stems = await Promise.all(['drums', 'bass', 'chords', 'lead'].map(async name => {
      const response = await fetch(`/audio/arcade/stem-${name}.wav`);
      if (!response.ok) throw new Error('Stem download failed');
      return this.context.decodeAudioData(await response.arrayBuffer());
    }));
    if (stems.some(stem => stem.length !== stems[0].length || stem.sampleRate !== stems[0].sampleRate)) throw new Error('Stems do not align');
    this.buffers = [stems[0], this.accent(1, stems[0]), this.accent(2, stems[0]), this.accent(3, stems[0]), stems[1], stems[2], stems[3], this.accent(7, stems[0])];
  }
  private accent(pad: number, reference: AudioBuffer) {
    const buffer = this.context.createBuffer(1, reference.length, reference.sampleRate);
    const data = buffer.getChannelData(0), sr = buffer.sampleRate, stepLength = buffer.length / 64;
    let seed = 19;
    for (let step = 0; step < 64; step++) {
      const hit = pad === 1 ? step % 8 === 4 : pad === 2 ? step % 4 === 2 : pad === 3 ? step % 8 === 7 : step % 16 === 14;
      if (!hit) continue;
      const start = Math.round(step * stepLength), duration = pad === 7 ? .22 : pad === 1 ? .12 : .07;
      for (let i = 0; i < duration * sr; i++) {
        const t = i / sr;
        seed = (1664525 * seed + 1013904223) >>> 0;
        const noise = seed / 2147483648 - 1;
        const wave = pad === 7 ? Math.sin(2 * Math.PI * 880 * t) * .16 : pad === 3 ? Math.sin(2 * Math.PI * (260 * t - 450 * t * t)) * .22 : noise * (pad === 1 ? .18 : .07);
        data[(start + i) % data.length] += wave * Math.min(1, t / .002) * Math.exp(-t * (pad === 7 ? 24 : 55));
      }
    }
    return buffer;
  }
  setPads(pads: number[]) {
    if (!pads.length) { this.stop(); return; }
    const c = this.context, now = c.currentTime;
    if (!this.sources.length) {
      if (this.buffers.length !== 8) throw new Error('Stems not ready');
      // Start even muted stems at precisely the same sample. Adding/removing pads
      // only changes gain, never restarts a file at a different beat.
      const start = now + .03;
      this.sources = this.buffers.map((buffer, i) => {
        const source = c.createBufferSource(), gate = c.createGain();
        source.buffer = buffer; source.loop = true;
        source.playbackRate.value = playbackRate(this.settings.pitch);
        gate.gain.value = 0; source.connect(gate); gate.connect(this.channels[i < 4 ? 0 : 1]);
        this.gates.push(gate); source.start(start); return source;
      });
    }
    this.gates.forEach((gate, i) => {
      gate.gain.cancelScheduledValues(now);
      gate.gain.setTargetAtTime(pads.includes(i) ? 1 : 0, now, .012);
    });
    this.master.gain.setTargetAtTime(.55, now, .015);
  }
  stop() {
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(0, now, .006);
    const gates = this.gates;
    gates.forEach(gate => { gate.gain.cancelScheduledValues(now); gate.gain.setTargetAtTime(0, now, .006); });
    this.sources.forEach((source, i) => {
      source.stop(now + .05);
      source.onended = () => { source.disconnect(); gates[i].disconnect(); };
    });
    this.sources = []; this.gates = [];
  }
  dispose() { this.stop(); void this.context.close().catch(() => {}); }
}
