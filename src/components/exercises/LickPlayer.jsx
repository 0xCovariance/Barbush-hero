// Animated lick player. Shows the lick on the fretboard with technique badges
// and steps through it note-by-note at user-controlled speed.

import { useEffect, useRef, useState } from 'react';
import { Fretboard } from '../fretboard/Fretboard.jsx';
import { BOX1_LICKS, midiAt } from '../../data/scales.js';
import { Button } from '../ui/Button.jsx';
import { wireUnlock } from '../../audio/engine.js';
import { pluck } from '../../audio/pluck.js';

const TECHNIQUE_LABEL = {
  hammer: 'H',
  pull: 'P',
  slide: '/',
  'bend-half': 'b½',
  'bend-full': 'b',
};

export function LickPlayer({ config, instruction }) {
  const { lickIds = ['lick-bb', 'lick-blues-1', 'lick-blues-2'], bpm = 60 } = config;
  const licks = lickIds.map((id) => BOX1_LICKS.find((l) => l.id === id)).filter(Boolean);
  const [tempo, setTempo] = useState(bpm);
  const [lickIndex, setLickIndex] = useState(0);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  const lick = licks[lickIndex];

  useEffect(() => { wireUnlock(); }, []);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (!playing) {
      clearTimeout(timerRef.current);
      setStep(-1);
      return undefined;
    }
    let i = 0;
    setStep(0);
    pluck(midiAt(lick.notes[0].string, lick.notes[0].fret));
    const next = () => {
      const beats = lick.notes[i].durationBeats;
      const ms = (60_000 / tempo) * beats;
      timerRef.current = setTimeout(() => {
        i += 1;
        if (i >= lick.notes.length) {
          setPlaying(false);
          setStep(-1);
          return;
        }
        setStep(i);
        pluck(midiAt(lick.notes[i].string, lick.notes[i].fret));
        next();
      }, ms);
    };
    next();
    return () => clearTimeout(timerRef.current);
  }, [playing, tempo, lickIndex]);

  const fretWindow = [4, 9];
  // Build fretboard notes: all lick notes shown, with index labels.
  const notes = lick.notes.map((n, i) => ({
    string: n.string, fret: n.fret,
    isRoot: false,
  }));
  const highlightIds = step >= 0 ? [`${lick.notes[step].string}-${lick.notes[step].fret}`] : [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-200 leading-relaxed">{instruction}</p>

      <div className="card-tight">
        <p className="label">Lick</p>
        <select
          value={lickIndex}
          onChange={(e) => { setPlaying(false); setLickIndex(parseInt(e.target.value, 10)); }}
          className="w-full mt-2 bg-ink-700 border border-ink-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
        >
          {licks.map((l, i) => <option key={l.id} value={i}>{l.name}</option>)}
        </select>
        <p className="text-xs text-ink-300 mt-2">{lick.description}</p>
      </div>

      <div className="bg-ink-800 rounded-2xl p-3">
        <Fretboard
          fretWindow={fretWindow}
          notes={notes}
          highlightIds={highlightIds}
          ariaLabel={`Lick: ${lick.name}`}
        />
      </div>

      {/* Tab strip */}
      <div className="card-tight">
        <p className="label mb-2">Tab</p>
        <div className="font-mono text-sm text-ink-200 space-y-0.5 leading-tight">
          {[1,2,3,4,5,6].map((s) => (
            <div key={s} className="flex items-center">
              <span className="w-6 text-ink-400">{['e','B','G','D','A','E'][s - 1]}|</span>
              <span className="flex-1 truncate tracking-wider">
                {lick.notes.map((n, i) => {
                  const isThisString = n.string === s;
                  const isCurrent = i === step;
                  if (!isThisString) {
                    const dashes = String(n.fret).length === 2 ? '——' : '—';
                    return <span key={i} className="text-ink-600">{dashes}–</span>;
                  }
                  const tag = n.technique ? TECHNIQUE_LABEL[n.technique] : '';
                  return (
                    <span key={i} className={isCurrent ? 'text-amber-400 font-bold' : 'text-amber-200'}>
                      {n.fret}{tag}–
                    </span>
                  );
                })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-tight">
        <div className="flex items-center justify-between">
          <span className="label">Tempo</span>
          <span className="font-display">{tempo} BPM</span>
        </div>
        <input
          type="range" min="30" max="120" step="2" value={tempo}
          onChange={(e) => setTempo(parseInt(e.target.value, 10))}
          className="w-full mt-2 accent-amber-400"
        />
      </div>

      <Button onClick={() => setPlaying((p) => !p)} className="w-full">
        {playing ? 'Stop' : 'Play lick'}
      </Button>
    </div>
  );
}
