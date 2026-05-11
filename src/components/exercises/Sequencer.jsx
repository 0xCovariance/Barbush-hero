// Plays the scale in groups of N notes (e.g. 1-2-3, 2-3-4...). Highlights the
// current note plus the next 2 ahead so the user can read forward like a tab.

import { useEffect, useRef, useState } from 'react';
import { Fretboard, noteId } from '../fretboard/Fretboard.jsx';
import { BOXES, sequenceInGroups, midiAt } from '../../data/scales.js';
import { Button } from '../ui/Button.jsx';
import { wireUnlock } from '../../audio/engine.js';
import { pluck } from '../../audio/pluck.js';

export function Sequencer({ config, instruction }) {
  const { boxId = 'box1', group = 3, bpm = 80 } = config;
  const box = BOXES[boxId];
  const sequence = sequenceInGroups(boxId, group);
  const [tempo, setTempo] = useState(bpm);
  const [groupSize, setGroupSize] = useState(group);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(-1);
  const timerRef = useRef(null);

  useEffect(() => { wireUnlock(); }, []);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const seq = sequenceInGroups(boxId, groupSize);

  useEffect(() => {
    if (!playing) {
      clearTimeout(timerRef.current);
      setIndex(-1);
      return undefined;
    }
    let i = 0;
    setIndex(0);
    pluck(midiAt(seq[0].string, seq[0].fret));
    const tick = () => {
      i += 1;
      if (i >= seq.length) {
        setPlaying(false);
        setIndex(-1);
        return;
      }
      setIndex(i);
      pluck(midiAt(seq[i].string, seq[i].fret));
      timerRef.current = setTimeout(tick, 60_000 / tempo);
    };
    timerRef.current = setTimeout(tick, 60_000 / tempo);
    return () => clearTimeout(timerRef.current);
  }, [playing, tempo, groupSize, boxId]);

  const highlightIds = index >= 0 ? [noteId(seq[index])] : [];
  const ghostIds = index >= 0
    ? [seq[index + 1], seq[index + 2]].filter(Boolean).map(noteId)
    : [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-200 leading-relaxed">{instruction}</p>

      <div className="bg-ink-800 rounded-2xl p-3">
        <Fretboard
          fretWindow={box.fretWindow}
          notes={box.notes}
          highlightIds={highlightIds}
          ghostIds={ghostIds}
          ariaLabel={`${box.name} sequencer in groups of ${groupSize}`}
        />
        <div className="text-xs text-ink-400 mt-2 px-1">
          Solid orange = play now · Faded = next two notes
        </div>
      </div>

      <div className="card-tight">
        <div className="flex items-center justify-between">
          <span className="label">Group size</span>
          <div className="flex gap-1">
            {[3, 4].map((g) => (
              <button
                key={g}
                onClick={() => setGroupSize(g)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  groupSize === g ? 'bg-amber-400 text-ink-900' : 'bg-ink-600 text-ink-200'
                }`}
              >
                {g}s
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="label">Tempo</span>
          <span className="font-display">{tempo} BPM</span>
        </div>
        <input
          type="range" min="40" max="140" step="2" value={tempo}
          onChange={(e) => setTempo(parseInt(e.target.value, 10))}
          className="w-full mt-2 accent-amber-400"
        />
      </div>

      <Button onClick={() => setPlaying((p) => !p)} className="w-full">
        {playing ? 'Stop' : 'Play sequence'}
      </Button>
    </div>
  );
}
