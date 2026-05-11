// Tiny Karplus-Strong-ish pluck for previewing notes on the fretboard.
// Not high-fidelity — it's a "this is roughly the pitch you should hear" cue.

import { getCtx, ensureRunning, midiToFreq } from './engine.js';

export async function pluck(midi, { duration = 0.8, gain = 0.3 } = {}) {
  const ctx = await ensureRunning();
  if (!ctx) return;
  const t = ctx.currentTime;
  const freq = midiToFreq(midi);

  // Two saw oscillators slightly detuned + a lowpass to soften.
  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  const lp = ctx.createBiquadFilter();
  const g = ctx.createGain();
  o1.type = 'triangle';
  o2.type = 'sawtooth';
  o1.frequency.value = freq;
  o2.frequency.value = freq * 1.005;
  lp.type = 'lowpass';
  lp.frequency.value = Math.min(8000, freq * 6);
  lp.Q.value = 0.5;

  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  o1.connect(g);
  o2.connect(g);
  g.connect(lp).connect(ctx.destination);

  o1.start(t);
  o2.start(t);
  o1.stop(t + duration + 0.05);
  o2.stop(t + duration + 0.05);
}
