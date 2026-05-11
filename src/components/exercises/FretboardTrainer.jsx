// "Watch and follow" — animates through the box one note at a time at a
// configurable BPM. The user plays along and self-reports.

import { useEffect, useRef, useState } from 'react';
import { Fretboard, noteId } from '../fretboard/Fretboard.jsx';
import { BOXES, midiAt } from '../../data/scales.js';
import { Button } from '../ui/Button.jsx';
import { wireUnlock } from '../../audio/engine.js';
import { pluck } from '../../audio/pluck.js';

export function FretboardTrainer({ config, instruction }) {
  const { boxId = 'box1', autoPlayBpm = 60 } = config;
  const box = BOXES[boxId];
  const [bpm, setBpm] = useState(autoPlayBpm);
  const [direction, setDirection] = useState('up');
  const [showFingers, setShowFingers] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  const ascending = box.notes;
  const descending = [...box.notes].reverse();
  const seq = direction === 'up' ? ascending : descending;

  useEffect(() => { wireUnlock(); }, []);

  useEffect(() => {
    if (!playing) {
      clearTimeout(timerRef.current);
      setActiveIndex(-1);
      return undefined;
    }
    let i = 0;
    setActiveIndex(0);
    pluck(midiAt(seq[0].string, seq[0].fret));
    const tick = () => {
      i += 1;
      if (i >= seq.length) {
        setPlaying(false);
        setActiveIndex(-1);
        return;
      }
      setActiveIndex(i);
      pluck(midiAt(seq[i].string, seq[i].fret));
      timerRef.current = setTimeout(tick, (60_000 / bpm));
    };
    timerRef.current = setTimeout(tick, (60_000 / bpm));
    return () => clearTimeout(timerRef.current);
  }, [playing, bpm, direction]);

  const highlightIds = activeIndex >= 0 ? [noteId(seq[activeIndex])] : [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-200 leading-relaxed">{instruction}</p>

      <div className="bg-ink-800 rounded-2xl p-3">
        <Fretboard
          fretWindow={box.fretWindow}
          notes={box.notes}
          highlightIds={highlightIds}
          showFingers={showFingers}
          ariaLabel={`${box.name} pentatonic shape`}
        />
        <div className="flex items-center justify-between mt-2 text-xs text-ink-400 px-1">
          <span>{box.name}</span>
          <span>Square = root · Number = finger</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={() => setPlaying((p) => !p)} className="flex-1">
          {playing ? 'Stop' : 'Play shape'}
        </Button>
        <Button variant="secondary" onClick={() => setDirection((d) => d === 'up' ? 'down' : 'up')}>
          {direction === 'up' ? '↑ Asc' : '↓ Desc'}
        </Button>
      </div>

      <div className="card-tight">
        <div className="flex items-center justify-between text-xs">
          <span className="label">Speed</span>
          <span className="text-ink-200 font-display">{bpm} BPM</span>
        </div>
        <input
          type="range" min="30" max="120" step="2" value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value, 10))}
          className="w-full mt-2 accent-amber-400"
        />
        <label className="flex items-center gap-2 text-xs text-ink-300 mt-3">
          <input
            type="checkbox" checked={showFingers}
            onChange={(e) => setShowFingers(e.target.checked)}
            className="accent-amber-400"
          />
          Show finger numbers
        </label>
      </div>
    </div>
  );
}
