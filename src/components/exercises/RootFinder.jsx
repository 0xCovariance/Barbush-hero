// Quiz: app names a key, user taps the root note on a blank fretboard.
// Builds the reflex of moving the box to a new key.

import { useEffect, useState } from 'react';
import { Note } from 'tonal';
import { Fretboard } from '../fretboard/Fretboard.jsx';
import { Button } from '../ui/Button.jsx';
import { OPEN_MIDI } from '../../data/scales.js';

const PROMPT_KEYS = ['A', 'D', 'E', 'G', 'C', 'F', 'B', 'F#', 'C#', 'Bb', 'Eb'];

function pickKey(prev) {
  let k;
  do { k = PROMPT_KEYS[Math.floor(Math.random() * PROMPT_KEYS.length)]; } while (k === prev);
  return k;
}

// Find all (string, fret) pairs on string 6 (low E) within window where the
// fret matches the requested root note. Used to validate a tap.
function rootFretsOnString(rootName, stringIndex, fretWindow) {
  const open = OPEN_MIDI[stringIndex - 1];
  const targetPc = Note.chroma(rootName);
  const out = [];
  for (let f = fretWindow[0]; f <= fretWindow[1]; f++) {
    if (((open + f) % 12) === targetPc) out.push(f);
  }
  return out;
}

export function RootFinder({ config, instruction }) {
  const { rounds = 5, fretWindow = [0, 14], targetString = 6 } = config;
  const [round, setRound] = useState(0);
  const [key, setKey] = useState('A');
  const [feedback, setFeedback] = useState(null); // { hit: bool, fret }
  const [score, setScore] = useState({ hit: 0, miss: 0 });

  useEffect(() => { setKey(pickKey(null)); }, []);

  function nextRound(success) {
    setScore((s) => ({ hit: s.hit + (success ? 1 : 0), miss: s.miss + (success ? 0 : 1) }));
    setFeedback(null);
    if (round + 1 >= rounds) {
      setRound(round + 1);
      return;
    }
    setRound(round + 1);
    setKey(pickKey(key));
  }

  function onTap({ string, fret }) {
    if (feedback || round >= rounds) return;
    if (string !== targetString) return;
    const correctFrets = rootFretsOnString(key, targetString, fretWindow);
    const hit = correctFrets.includes(fret);
    setFeedback({ hit, fret });
    setTimeout(() => nextRound(hit), 800);
  }

  const targetFrets = rootFretsOnString(key, targetString, fretWindow);
  const ghostIds = feedback && !feedback.hit
    ? targetFrets.map((f) => `${targetString}-${f}`)
    : [];
  const hitIds = feedback?.hit ? [`${targetString}-${feedback.fret}`] : [];
  const missIds = feedback && !feedback.hit ? [`${targetString}-${feedback.fret}`] : [];

  if (round >= rounds) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-ink-200">{instruction}</p>
        <div className="card">
          <p className="label">Result</p>
          <div className="font-display text-4xl mt-2">{score.hit} / {rounds}</div>
          <p className="text-xs text-ink-300 mt-1">{score.hit >= rounds - 1 ? 'Sharp ear and eyes 👀' : 'Try another round to lock it in.'}</p>
          <Button onClick={() => { setRound(0); setScore({ hit: 0, miss: 0 }); setKey(pickKey(key)); }} variant="secondary" className="mt-4 w-full">
            Play again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-200 leading-relaxed">{instruction}</p>

      <div className="card-tight text-center">
        <p className="label">Round {round + 1} of {rounds}</p>
        <p className="text-xs text-ink-300 mt-1">Tap the root of</p>
        <p className="font-display text-3xl mt-1">{key} minor</p>
        <p className="text-xs text-ink-400 mt-1">on the low E string (string 6)</p>
      </div>

      <div className="bg-ink-800 rounded-2xl p-3">
        <Fretboard
          fretWindow={fretWindow}
          notes={[]}
          ghostIds={ghostIds}
          hitIds={hitIds}
          missIds={missIds}
          onCellTap={onTap}
          ariaLabel={`Fretboard quiz — find the root of ${key} minor on string ${targetString}`}
        />
        {!feedback && <div className="text-xs text-ink-400 text-center mt-2">Tap a fret on string 6</div>}
        {feedback?.hit && <div className="text-xs text-emerald-300 text-center mt-2">✓ Correct</div>}
        {feedback && !feedback.hit && <div className="text-xs text-red-300 text-center mt-2">Almost — see the highlight</div>}
      </div>

      <div className="text-xs text-ink-400 text-center">Score: {score.hit} ✓ · {score.miss} ✗</div>
    </div>
  );
}
