// Legato drill — show hammer-on / pull-off pairs across the box. The
// fretboard renders the box and the instructions below indicate the H/P
// pattern to repeat.

import { useState } from 'react';
import { Fretboard } from '../fretboard/Fretboard.jsx';
import { BOXES } from '../../data/scales.js';

export function LegatoDrill({ config, instruction }) {
  const { boxId = 'box1' } = config;
  const box = BOXES[boxId];

  // For each string in the box, show hammer-on between the lower and higher fret.
  const pairs = [];
  for (const s of [6,5,4,3,2,1]) {
    const onString = box.notes.filter((n) => n.string === s).sort((a,b) => a.fret - b.fret);
    if (onString.length >= 2) {
      pairs.push({ string: s, lo: onString[0].fret, hi: onString[1].fret });
    }
  }

  const [showFingers, setShowFingers] = useState(true);

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-200 leading-relaxed">{instruction}</p>

      <div className="bg-ink-800 rounded-2xl p-3">
        <Fretboard
          fretWindow={box.fretWindow}
          notes={box.notes}
          showFingers={showFingers}
          ariaLabel={`${box.name} legato drill`}
        />
        <div className="text-xs text-ink-400 mt-2 px-1 text-center">
          For each string: pick the lower note, then hammer-on to the higher one. Reverse for pull-offs.
        </div>
      </div>

      <div className="card-tight">
        <p className="label mb-2">Hammer-on pairs</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {pairs.map((p) => (
            <div key={p.string} className="bg-ink-800 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-ink-400 text-xs">String {p.string}</span>
              <span className="font-display">{p.lo} <span className="text-amber-400">H</span> {p.hi}</span>
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-ink-300">
        <input
          type="checkbox" checked={showFingers}
          onChange={(e) => setShowFingers(e.target.checked)}
          className="accent-amber-400"
        />
        Show finger numbers
      </label>
    </div>
  );
}
