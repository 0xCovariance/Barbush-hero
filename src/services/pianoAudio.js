// Lightweight piano-ish synth using Web Audio. No samples needed.
// Each note uses a triangle wave + a softer sine sub, with a quick ADSR envelope.

let ctx = null;
let masterGain = null;

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.35;
  masterGain.connect(ctx.destination);
  return ctx;
}

export function unlockAudio() {
  const c = ensureCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
}

export function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToName(midi) {
  const name = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

export function isBlackKey(midi) {
  return [1, 3, 6, 8, 10].includes(midi % 12);
}

export function playNote(midi, duration = 0.6, velocity = 1) {
  const c = ensureCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();

  const freq = midiToFrequency(midi);
  const t0 = c.currentTime;

  const osc1 = c.createOscillator();
  osc1.type = 'triangle';
  osc1.frequency.value = freq;

  const osc2 = c.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = freq * 2; // overtone

  const g = c.createGain();
  const peak = 0.22 * velocity;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(peak * 0.4, t0 + 0.15);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  const g2 = c.createGain();
  g2.gain.value = 0.25;

  osc2.connect(g2);
  g2.connect(g);
  osc1.connect(g);
  g.connect(masterGain);

  osc1.start(t0);
  osc2.start(t0);
  osc1.stop(t0 + duration + 0.05);
  osc2.stop(t0 + duration + 0.05);
}
