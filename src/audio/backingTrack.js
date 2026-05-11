// Procedural 12-bar blues backing track. Plays kick + snare + hi-hat + walking
// bass over a I-IV-V progression. Synthy by design — see /public/audio/README.md
// for how to drop in real CC-licensed MP3 loops to replace this.

import { getCtx, ensureRunning, midiToFreq } from './engine.js';

const KEYS = {
  Am: { name: 'A minor blues', I: 45, IV: 50, V: 52 }, // A2, D3, E3 bass roots
  Em: { name: 'E minor blues', I: 40, IV: 45, V: 47 },
};

export class BackingTrack {
  constructor({ key = 'Am', tempo = 'slow' } = {}) {
    this.key = key;
    this.bpm = tempo === 'fast' ? 110 : tempo === 'medium' ? 88 : 70;
    this.next = 0;
    this.bar = 0;
    this.beat = 0;
    this.timer = null;
    this.master = null;
  }

  setVolume(v) {
    if (this.master) this.master.gain.value = v;
  }

  async start() {
    const ctx = await ensureRunning();
    if (!ctx) return;
    this.master = ctx.createGain();
    this.master.gain.value = 0.6;
    this.master.connect(ctx.destination);
    this.next = ctx.currentTime + 0.1;
    this.bar = 0;
    this.beat = 0;
    this.tick();
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.master) {
      try { this.master.disconnect(); } catch { /* noop */ }
      this.master = null;
    }
  }

  // 12-bar blues chord at bar index (0..11).
  chordAt(bar) {
    const k = KEYS[this.key];
    // I I I I  IV IV I I  V IV I V
    const seq = [k.I, k.I, k.I, k.I, k.IV, k.IV, k.I, k.I, k.V, k.IV, k.I, k.V];
    return seq[bar % 12];
  }

  tick = () => {
    const ctx = getCtx();
    if (!ctx || !this.master) return;
    const lookAhead = 0.15;
    while (this.next < ctx.currentTime + lookAhead) {
      const beatTime = this.next;
      const inBar = this.beat;
      const root = this.chordAt(this.bar);

      this.scheduleDrum(beatTime, inBar);
      this.scheduleBass(beatTime, inBar, root);

      this.next += 60.0 / this.bpm;
      this.beat++;
      if (this.beat >= 4) {
        this.beat = 0;
        this.bar++;
      }
    }
    this.timer = setTimeout(this.tick, 25);
  };

  scheduleDrum(t, beat) {
    const ctx = getCtx();
    // Kick on 1 and 3, snare on 2 and 4, hi-hat on every 8th.
    if (beat === 0 || beat === 2) this.kick(t);
    if (beat === 1 || beat === 3) this.snare(t);
    this.hat(t);
    this.hat(t + 30 / this.bpm); // off-beat eighth
  }

  scheduleBass(t, beat, rootMidi) {
    // Walking bass: root, fifth, root, fifth (simple).
    const note = beat % 2 === 0 ? rootMidi : rootMidi + 7;
    this.bassNote(t, note);
  }

  kick(t) {
    const ctx = getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 0.2);
  }

  snare(t) {
    const ctx = getCtx();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1500;
    const g = ctx.createGain();
    g.gain.value = 0.4;
    src.connect(hp).connect(g).connect(this.master);
    src.start(t);
  }

  hat(t) {
    const ctx = getCtx();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.012));
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6000;
    const g = ctx.createGain();
    g.gain.value = 0.15;
    src.connect(hp).connect(g).connect(this.master);
    src.start(t);
  }

  bassNote(t, midi) {
    const ctx = getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    o.type = 'triangle';
    o.frequency.value = midiToFreq(midi);
    lp.type = 'lowpass';
    lp.frequency.value = 600;
    const dur = 60 / this.bpm * 0.8;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.45, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(lp).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
}

export function listTracks() {
  return [
    { id: 'Am-slow',   key: 'Am', tempo: 'slow',   label: 'A minor — slow blues (70 BPM)' },
    { id: 'Am-medium', key: 'Am', tempo: 'medium', label: 'A minor — medium blues (88 BPM)' },
    { id: 'Em-slow',   key: 'Em', tempo: 'slow',   label: 'E minor — slow blues (70 BPM)' },
    { id: 'Em-medium', key: 'Em', tempo: 'medium', label: 'E minor — medium blues (88 BPM)' },
  ];
}
