// Sample-accurate metronome using Web Audio scheduling.
// Schedules 25 ms ahead in 25 ms intervals — standard pattern from
// Chris Wilson's "A Tale of Two Clocks".

import { getCtx, ensureRunning } from './engine.js';

const LOOKAHEAD = 25;        // ms: how often the scheduler runs
const SCHEDULE_AHEAD = 0.1;  // s: how far ahead we schedule clicks

export class Metronome {
  constructor({ bpm = 60, beatsPerBar = 4, onBeat } = {}) {
    this.bpm = bpm;
    this.beatsPerBar = beatsPerBar;
    this.onBeat = onBeat;
    this.next = 0;
    this.beat = 0;
    this.timer = null;
  }

  setBpm(bpm) {
    this.bpm = Math.max(20, Math.min(300, bpm));
  }

  async start() {
    const ctx = await ensureRunning();
    if (!ctx) return;
    this.next = ctx.currentTime + 0.05;
    this.beat = 0;
    this.tick();
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  tick = () => {
    const ctx = getCtx();
    if (!ctx) return;
    while (this.next < ctx.currentTime + SCHEDULE_AHEAD) {
      this.scheduleClick(this.next, this.beat % this.beatsPerBar === 0);
      const beatIndex = this.beat;
      const at = this.next;
      if (this.onBeat) {
        const delay = Math.max(0, (at - ctx.currentTime) * 1000);
        setTimeout(() => this.onBeat(beatIndex), delay);
      }
      this.next += 60.0 / this.bpm;
      this.beat++;
    }
    this.timer = setTimeout(this.tick, LOOKAHEAD);
  };

  scheduleClick(time, accent) {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = accent ? 1600 : 1000;
    osc.type = 'square';
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(accent ? 0.25 : 0.15, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);
    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.08);
  }
}
