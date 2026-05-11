// Metronome + fretboard reference. User picks a BPM, hits play, follows the
// click, and self-reports when the requested number of passes is done.

import { useEffect, useRef, useState } from 'react';
import { Fretboard, noteId } from '../fretboard/Fretboard.jsx';
import { BOXES } from '../../data/scales.js';
import { Button } from '../ui/Button.jsx';
import { Metronome } from '../../audio/metronome.js';
import { wireUnlock } from '../../audio/engine.js';

export function MetronomeDrill({ config, instruction }) {
  const { boxId = 'box1', startBpm = 60, targetBpm = 80, passes = 4 } = config;
  const box = BOXES[boxId];
  const [bpm, setBpm] = useState(startBpm);
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(-1);
  const [completedPasses, setCompletedPasses] = useState(0);
  const metroRef = useRef(null);
  const seq = box.notes;
  const beatsPerPass = seq.length;

  useEffect(() => { wireUnlock(); }, []);

  useEffect(() => () => metroRef.current?.stop(), []);

  useEffect(() => {
    metroRef.current?.setBpm(bpm);
  }, [bpm]);

  function toggle() {
    if (running) {
      metroRef.current?.stop();
      metroRef.current = null;
      setRunning(false);
      setBeat(-1);
      return;
    }
    setBeat(-1);
    setCompletedPasses(0);
    const m = new Metronome({
      bpm, beatsPerBar: 4,
      onBeat: (b) => {
        setBeat(b);
        const completed = Math.floor((b + 1) / beatsPerPass);
        setCompletedPasses(completed);
      },
    });
    metroRef.current = m;
    setRunning(true);
    m.start();
  }

  // Highlight the note we'd be on if playing one note per click.
  const highlightedNote = running && beat >= 0 ? seq[beat % seq.length] : null;
  const highlightIds = highlightedNote ? [noteId(highlightedNote)] : [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-200 leading-relaxed">{instruction}</p>

      <div className="bg-ink-800 rounded-2xl p-3">
        <Fretboard
          fretWindow={box.fretWindow}
          notes={box.notes}
          highlightIds={highlightIds}
          showFingers={false}
          ariaLabel={`${box.name} for metronome drill`}
        />
      </div>

      <div className="card-tight">
        <div className="flex items-center justify-between">
          <span className="label">Tempo</span>
          <span className="font-display text-3xl">{bpm}</span>
        </div>
        <input
          type="range" min="40" max="160" step="2" value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value, 10))}
          className="w-full mt-2 accent-amber-400"
        />
        <div className="flex justify-between text-xs text-ink-400 mt-1">
          <span>Start: {startBpm}</span>
          <span>Goal: {targetBpm}</span>
        </div>
      </div>

      <div className="card-tight flex items-center justify-between">
        <div>
          <p className="label">Passes</p>
          <p className="font-display text-xl">{completedPasses} / {passes}</p>
        </div>
        <Button onClick={toggle} className="min-w-[120px]">
          {running ? 'Stop' : 'Start'}
        </Button>
      </div>

      {/* Beat dots */}
      <div className="flex justify-center gap-2">
        {[0,1,2,3].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition ${
              running && (beat % 4) === i
                ? i === 0 ? 'bg-amber-400 scale-125' : 'bg-amber-200 scale-110'
                : 'bg-ink-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
