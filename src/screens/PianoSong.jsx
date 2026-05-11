import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getSong } from '../data/pianoSongs.js';
import { usePianoStore } from '../store/pianoStore.js';
import { playNote, unlockAudio, midiToName } from '../services/pianoAudio.js';
import { PianoKeyboard } from '../components/piano/PianoKeyboard.jsx';
import { FallingNotes } from '../components/piano/FallingNotes.jsx';
import { StarRating } from '../components/piano/StarRating.jsx';
import { Button } from '../components/ui/Button.jsx';

// Mode A (default): "Practice" — the song waits for the correct key. Forgiving, kid mode.
// Mode B: "Play along" — auto-scrolls in real time; you tap to play notes when they hit the line.

const MODES = {
  practice: { label: 'Wait for me', description: 'Pauses until you press the right key.' },
  playalong: { label: 'Play along', description: 'Notes flow in time — tap when they reach the line.' },
};

function rangeFromNotes(notes, pad = 2) {
  const midis = notes.map((n) => n.midi);
  let low = Math.min(...midis) - pad;
  let high = Math.max(...midis) + pad;
  // Clamp & ensure at least an octave visible.
  if (high - low < 12) high = low + 12;
  if (low < 36) low = 36;
  if (high > 96) high = 96;
  return { low, high };
}

function withStartBeats(notes) {
  let t = 0;
  return notes.map((n) => {
    const out = { ...n, startBeat: t };
    t += n.beats;
    return out;
  });
}

function computeStars(score) {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  if (score >= 40) return 1;
  return 0;
}

export function PianoSong() {
  const { songId } = useParams();
  const song = getSong(songId);
  const navigate = useNavigate();

  const member = usePianoStore((s) => s.activeMember());
  const recordResult = usePianoStore((s) => s.recordSongResult);

  const [mode, setMode] = useState('practice');
  const [phase, setPhase] = useState('ready'); // ready | playing | done
  const [activeIdx, setActiveIdx] = useState(0);
  const [hitResults, setHitResults] = useState({}); // idx -> 'hit' | 'miss'
  const hitResultsRef = useRef({});
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [currentBeats, setCurrentBeats] = useState(-4); // count-in space
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [finalSummary, setFinalSummary] = useState(null);

  const timedNotes = useMemo(() => (song ? withStartBeats(song.notes) : []), [song]);
  const range = useMemo(() => (song ? rangeFromNotes(song.notes) : { low: 60, high: 84 }), [song]);

  // Play-along mode uses a RAF-driven playhead. Practice mode is fully event-driven —
  // currentBeats stays parked at the active note's startBeat until the kid hits the right key.
  const rafRef = useRef();
  const startTsRef = useRef(0);
  const startBeatsRef = useRef(0);
  const beatsPerSecond = song ? song.bpm / 60 : 1;
  const finishedRef = useRef(false);

  useEffect(() => {
    if (phase !== 'playing' || mode !== 'playalong') return;
    finishedRef.current = false;
    startTsRef.current = performance.now();
    startBeatsRef.current = currentBeats;

    function tick(now) {
      const elapsedSec = (now - startTsRef.current) / 1000;
      const t = startBeatsRef.current + elapsedSec * beatsPerSecond;
      setCurrentBeats(t);

      // Mark a note as miss when it has clearly passed the line without a hit.
      setHitResults((prev) => {
        let changed = false;
        const next = { ...prev };
        for (let i = 0; i < timedNotes.length; i += 1) {
          if (next[i]) continue;
          if (t > timedNotes[i].startBeat + 0.5) {
            next[i] = 'miss';
            changed = true;
          }
        }
        if (changed) hitResultsRef.current = next;
        return changed ? next : prev;
      });

      const lastNote = timedNotes[timedNotes.length - 1];
      const songEndBeat = lastNote.startBeat + lastNote.beats + 1;
      if (t >= songEndBeat && !finishedRef.current) {
        finishedRef.current = true;
        cancelAnimationFrame(rafRef.current);
        finishSong();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode, timedNotes, beatsPerSecond]);

  function start() {
    if (!song) return;
    unlockAudio();
    setActiveIdx(0);
    setHitResults({});
    hitResultsRef.current = {};
    setCombo(0);
    setBestCombo(0);
    finishedRef.current = false;
    if (mode === 'practice') {
      // Park the playhead exactly on the first note so it sits at the line, ready to hit.
      setCurrentBeats(timedNotes[0].startBeat);
    } else {
      setCurrentBeats(-3); // count-in space
    }
    setPhase('playing');
  }

  function finishSong() {
    cancelAnimationFrame(rafRef.current);
    const total = timedNotes.length;
    const finalResults = hitResultsRef.current;
    const hits = Object.values(finalResults).filter((r) => r === 'hit').length;
    const score = Math.round((hits / Math.max(1, total)) * 100);
    const stars = computeStars(score);
    const rewards = member
      ? recordResult({ songId: song.songId, score, stars })
      : null;
    setFinalSummary({ score, stars, hits, total, bestCombo: Math.max(bestCombo, combo), rewards });
    setPhase('done');
  }

  function handleKeyDown(midi) {
    unlockAudio();
    playNote(midi, 0.6);
    setPressedKeys((p) => new Set([...p, midi]));

    if (phase !== 'playing') return;
    const idx = activeIdx;
    if (idx >= timedNotes.length) return;
    const target = timedNotes[idx];

    if (mode === 'practice') {
      // The next note is the target. If correct, advance.
      if (target.midi === midi) {
        const updated = { ...hitResultsRef.current, [idx]: 'hit' };
        hitResultsRef.current = updated;
        setHitResults(updated);
        setActiveIdx(idx + 1);
        setCombo((c) => {
          const next = c + 1;
          setBestCombo((b) => Math.max(b, next));
          return next;
        });
        const nextStart = timedNotes[idx + 1]?.startBeat ?? (target.startBeat + target.beats);
        setCurrentBeats(nextStart);

        if (idx + 1 >= timedNotes.length) {
          // small delay so the last note hit registers visually
          setTimeout(finishSong, 250);
        }
      } else {
        // Wrong key — light shake; don't penalize harshly in kid practice mode.
        setCombo(0);
      }
      return;
    }

    // play-along mode: find a near-by un-hit note for this midi
    const tolerance = 0.6; // beats
    let bestIdx = -1;
    for (let i = 0; i < timedNotes.length; i += 1) {
      if (hitResults[i]) continue;
      const n = timedNotes[i];
      if (n.midi !== midi) continue;
      const dist = Math.abs(currentBeats - n.startBeat);
      if (dist <= tolerance && (bestIdx === -1 || dist < Math.abs(currentBeats - timedNotes[bestIdx].startBeat))) {
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) {
      const updated = { ...hitResultsRef.current, [bestIdx]: 'hit' };
      hitResultsRef.current = updated;
      setHitResults(updated);
      if (bestIdx === activeIdx) setActiveIdx(activeIdx + 1);
      setCombo((c) => {
        const next = c + 1;
        setBestCombo((b) => Math.max(b, next));
        return next;
      });
    } else {
      setCombo(0);
    }
  }

  function handleKeyUp(midi) {
    setPressedKeys((p) => {
      const next = new Set(p);
      next.delete(midi);
      return next;
    });
  }

  if (!song) {
    return (
      <div className="space-y-4">
        <p>Song not found.</p>
        <Link to="/piano" className="btn-secondary inline-flex">Back to songs</Link>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="space-y-4">
        <p>Pick a player first.</p>
        <Link to="/piano/family" className="btn-primary inline-flex">Add a player</Link>
      </div>
    );
  }

  const total = timedNotes.length;
  const hits = Object.values(hitResults).filter((r) => r === 'hit').length;
  const liveScore = Math.round((hits / Math.max(1, total)) * 100);
  const nextNote = timedNotes[activeIdx];

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <Link to="/piano" className="text-xs text-ink-400 hover:text-ink-200">‹ Back</Link>
        <div className="text-center">
          <h1 className="text-lg font-display flex items-center gap-2 justify-center">
            <span aria-hidden>{song.emoji}</span>
            {song.title}
          </h1>
          <p className="text-[10px] text-ink-400">{song.bpm} BPM</p>
        </div>
        <div className="text-2xl" aria-hidden>{member.avatar}</div>
      </header>

      {phase === 'ready' && (
        <div className="space-y-4">
          <div className="card">
            <p className="text-sm text-ink-200">{song.description}</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {Object.entries(MODES).map(([key, m]) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`p-3 rounded-xl border text-left transition ${
                    mode === key
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-ink-600 bg-ink-700/50'
                  }`}
                >
                  <div className="font-semibold text-sm">{m.label}</div>
                  <div className="text-[11px] text-ink-300 mt-1">{m.description}</div>
                </button>
              ))}
            </div>
            <Button onClick={start} className="w-full mt-4">
              Start playing 🎹
            </Button>
          </div>

          <div className="card-tight">
            <p className="text-xs text-ink-400 mb-2">Tap any key to hear it</p>
            <PianoKeyboard
              lowestMidi={range.low}
              highestMidi={range.high}
              hintMidi={song.notes[0]?.midi}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              pressedKeys={pressedKeys}
            />
          </div>
        </div>
      )}

      {phase === 'playing' && (
        <>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="chip">🎯 {hits}/{total}</span>
              <span className="chip">⚡ x{combo}</span>
            </div>
            <div className="font-display text-amber-300 text-base">{liveScore}%</div>
          </div>

          <FallingNotes
            notes={timedNotes}
            lowestMidi={range.low}
            highestMidi={range.high}
            currentTimeBeats={currentBeats}
            activeNoteIdx={activeIdx}
            hitResults={hitResults}
            height={280}
            pxPerBeat={70}
          />

          <PianoKeyboard
            lowestMidi={range.low}
            highestMidi={range.high}
            hintMidi={mode === 'practice' ? nextNote?.midi : null}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            pressedKeys={pressedKeys}
          />

          {nextNote && mode === 'practice' && (
            <p className="text-center text-xs text-ink-300">
              Next: <span className="text-amber-300 font-semibold">{midiToName(nextNote.midi)}</span>
            </p>
          )}

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { cancelAnimationFrame(rafRef.current); navigate('/piano'); }} className="flex-1">
              Quit
            </Button>
            <Button variant="secondary" onClick={() => { cancelAnimationFrame(rafRef.current); setPhase('ready'); }} className="flex-1">
              Restart
            </Button>
          </div>
        </>
      )}

      {phase === 'done' && finalSummary && (
        <div className="card space-y-4 text-center animate-burst">
          <div className="text-5xl">{finalSummary.stars === 3 ? '🏆' : finalSummary.stars === 2 ? '🌟' : finalSummary.stars === 1 ? '🎉' : '💪'}</div>
          <h2 className="text-2xl font-display">
            {finalSummary.stars === 3 ? 'Amazing!' : finalSummary.stars >= 1 ? 'Nice job!' : 'Keep practicing!'}
          </h2>

          <div className="flex justify-center">
            <StarRating value={finalSummary.stars} size="lg" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="card-tight">
              <div className="label">Score</div>
              <div className="font-display text-xl text-amber-300">{finalSummary.score}%</div>
            </div>
            <div className="card-tight">
              <div className="label">Hits</div>
              <div className="font-display text-xl">{finalSummary.hits}/{finalSummary.total}</div>
            </div>
            <div className="card-tight">
              <div className="label">Combo</div>
              <div className="font-display text-xl">x{finalSummary.bestCombo}</div>
            </div>
          </div>

          {finalSummary.rewards && (
            <div className="text-sm text-ink-200">
              <p className="text-amber-300 font-semibold">+{finalSummary.rewards.xpEarned} XP</p>
              <p className="text-xs text-ink-400 mt-1">
                🔥 {finalSummary.rewards.streak}-day streak
                {finalSummary.rewards.newBest > 0 && ` · best ${finalSummary.rewards.newBest}%`}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setPhase('ready')} className="flex-1">
              Play again
            </Button>
            <Link to="/piano" className="btn-primary flex-1 justify-center">
              Pick another
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
