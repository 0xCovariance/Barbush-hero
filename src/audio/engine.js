// Shared AudioContext. Created lazily on first user gesture so iOS doesn't
// block playback. All audio modules import getCtx() rather than constructing
// their own contexts.

let ctx = null;
let unlockBound = false;
const unlockHandlers = new Set();

export function getCtx() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C({ latencyHint: 'interactive' });
  }
  return ctx;
}

export async function ensureRunning() {
  const c = getCtx();
  if (!c) return null;
  if (c.state === 'suspended') {
    try { await c.resume(); } catch { /* noop */ }
  }
  return c;
}

// Wire a one-time unlock on the first touch/click so iOS Safari starts the
// graph. Components that need audio call this in a useEffect.
export function wireUnlock() {
  if (unlockBound) return;
  unlockBound = true;
  const handler = async () => {
    await ensureRunning();
    unlockHandlers.forEach((fn) => fn());
    window.removeEventListener('pointerdown', handler);
    window.removeEventListener('keydown', handler);
  };
  window.addEventListener('pointerdown', handler, { once: true });
  window.addEventListener('keydown', handler, { once: true });
}

export function onUnlock(fn) {
  unlockHandlers.add(fn);
  return () => unlockHandlers.delete(fn);
}

// MIDI → frequency in Hz.
export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
