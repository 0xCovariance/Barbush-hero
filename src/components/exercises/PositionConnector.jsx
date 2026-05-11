// Two adjacent boxes side-by-side. The user practices sliding from a note in
// box A to a note in box B. Animation traces the slide path.

import { useEffect, useRef, useState } from 'react';
import { Fretboard, noteId } from '../fretboard/Fretboard.jsx';
import { BOXES, midiAt } from '../../data/scales.js';
import { Button } from '../ui/Button.jsx';
import { wireUnlock } from '../../audio/engine.js';
import { pluck } from '../../audio/pluck.js';

export function PositionConnector({ config, instruction }) {
  const { fromBoxId = 'box1', toBoxId = 'box2', shiftString = 3, bpm = 70 } = config;
  const a = BOXES[fromBoxId];
  const b = BOXES[toBoxId];

  // Find the highest fret in box A on the shift string, then the lowest fret in box B on that string.
  const aNote = [...a.notes].filter((n) => n.string === shiftString).sort((x, y) => y.fret - x.fret)[0];
  const bNote = [...b.notes].filter((n) => n.string === shiftString).sort((x, y) => x.fret - y.fret)[0];

  const [stage, setStage] = useState(0); // 0 idle, 1 box A, 2 slide, 3 box B
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);
  const fretWindow = [Math.min(a.fretWindow[0], b.fretWindow[0]), Math.max(a.fretWindow[1], b.fretWindow[1])];

  useEffect(() => { wireUnlock(); }, []);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (!playing) {
      clearTimeout(timerRef.current);
      setStage(0);
      return undefined;
    }
    const stepMs = 60_000 / bpm;
    setStage(1);
    if (aNote) pluck(midiAt(aNote.string, aNote.fret));
    timerRef.current = setTimeout(() => {
      setStage(2);
      timerRef.current = setTimeout(() => {
        setStage(3);
        if (bNote) pluck(midiAt(bNote.string, bNote.fret));
        timerRef.current = setTimeout(() => {
          setPlaying(false);
          setStage(0);
        }, stepMs);
      }, stepMs);
    }, stepMs);
    return () => clearTimeout(timerRef.current);
  }, [playing, bpm]);

  const allNotes = [
    ...a.notes.map((n) => ({ ...n, _box: 'a' })),
    ...b.notes.map((n) => ({ ...n, _box: 'b' })),
  ];
  // Dedup overlaps (same string/fret in both boxes — keep both visually).
  const dedup = [];
  const seen = new Set();
  for (const n of allNotes) {
    const id = `${n.string}-${n.fret}`;
    if (!seen.has(id)) { seen.add(id); dedup.push(n); }
  }
  const ghostIds = stage === 1
    ? b.notes.map(noteId)
    : stage === 3 ? a.notes.map(noteId)
    : [];
  const highlightIds =
    stage === 1 && aNote ? [noteId(aNote)] :
    stage === 3 && bNote ? [noteId(bNote)] :
    [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-200 leading-relaxed">{instruction}</p>

      <div className="bg-ink-800 rounded-2xl p-3">
        <Fretboard
          fretWindow={fretWindow}
          notes={dedup}
          highlightIds={highlightIds}
          ghostIds={ghostIds}
          ariaLabel={`${a.name} connecting to ${b.name}`}
        />
        <div className="flex items-center justify-between mt-2 text-xs text-ink-400 px-1">
          <span>{a.name}</span>
          <span className={stage === 2 ? 'text-amber-300 font-semibold' : ''}>↔ slide on string {shiftString}</span>
          <span>{b.name}</span>
        </div>
      </div>

      <Button onClick={() => setPlaying((p) => !p)} className="w-full">
        {playing ? 'Stop' : 'Demo the shift'}
      </Button>

      <div className="card-tight text-xs text-ink-300">
        <strong>Drill:</strong> play {a.name} ascending, slide on string {shiftString} from fret {aNote?.fret} to fret {bNote?.fret}, continue ascending in {b.name}. Then descend back.
      </div>
    </div>
  );
}
