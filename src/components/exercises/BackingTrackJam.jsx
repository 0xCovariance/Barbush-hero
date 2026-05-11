// Backing track for improvisation. Tries to load a real MP3 from /audio/{id}.mp3
// first; falls back to the procedural Web Audio backing track if absent.
// A faded fretboard shows the box for reference.

import { useEffect, useRef, useState } from 'react';
import { Fretboard } from '../fretboard/Fretboard.jsx';
import { BOXES } from '../../data/scales.js';
import { Button } from '../ui/Button.jsx';
import { BackingTrack, listTracks } from '../../audio/backingTrack.js';
import { ensureRunning, wireUnlock } from '../../audio/engine.js';

export function BackingTrackJam({ config, instruction }) {
  const { boxId = 'box1', defaultTrackId = 'Am-slow' } = config;
  const box = BOXES[boxId];
  const [trackId, setTrackId] = useState(defaultTrackId);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState('idle'); // 'idle' | 'mp3' | 'procedural'
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const procRef = useRef(null);

  useEffect(() => { wireUnlock(); }, []);
  useEffect(() => () => stop(), []);

  async function start() {
    setError(null);
    await ensureRunning();
    // Try the MP3 first.
    try {
      const url = `/audio/${trackId}.mp3`;
      const head = await fetch(url, { method: 'HEAD' });
      if (head.ok) {
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0.7;
        await audio.play();
        audioRef.current = audio;
        setMode('mp3');
        setRunning(true);
        return;
      }
    } catch { /* fall through */ }
    // Procedural fallback.
    const track = listTracks().find((t) => t.id === trackId) || listTracks()[0];
    const t = new BackingTrack({ key: track.key, tempo: track.tempo });
    await t.start();
    procRef.current = t;
    setMode('procedural');
    setRunning(true);
  }

  function stop() {
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch { /* noop */ }
      audioRef.current = null;
    }
    procRef.current?.stop();
    procRef.current = null;
    setRunning(false);
    setMode('idle');
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-200 leading-relaxed">{instruction}</p>

      <div className="bg-ink-800 rounded-2xl p-3">
        <div className="opacity-70">
          <Fretboard
            fretWindow={box.fretWindow}
            notes={box.notes}
            ariaLabel={`${box.name} reference for jamming`}
          />
        </div>
        <div className="text-xs text-ink-400 mt-2 text-center">
          {box.name} reference — improvise freely
        </div>
      </div>

      <div className="card-tight">
        <p className="label">Backing track</p>
        <select
          value={trackId}
          onChange={(e) => { stop(); setTrackId(e.target.value); }}
          disabled={running}
          className="w-full mt-2 bg-ink-700 border border-ink-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
        >
          {listTracks().map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
        <Button onClick={running ? stop : start} className="w-full mt-3">
          {running ? 'Stop track' : 'Play track'}
        </Button>
        <p className="text-[11px] text-ink-400 mt-2">
          {mode === 'procedural' && 'Playing a synthesized backing — drop MP3s in /public/audio/ to use real recordings.'}
          {mode === 'mp3' && 'Playing recorded backing track.'}
          {mode === 'idle' && 'Tip: keep your phrases short. Leave space.'}
        </p>
        {error && <p className="text-xs text-red-300 mt-1">{error}</p>}
      </div>
    </div>
  );
}
