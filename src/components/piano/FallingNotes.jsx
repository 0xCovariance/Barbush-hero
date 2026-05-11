import { useMemo } from 'react';
import { isBlackKey, midiToName } from '../../services/pianoAudio.js';

// Renders falling note blocks above the keyboard. The "playhead" is a horizontal
// line near the bottom; notes start at the top and descend until they hit it.
// `currentTimeBeats` is the playhead in beats. Each note's vertical position is
// `(note.startBeat - currentTimeBeats) * pxPerBeat` from the playhead.

export function FallingNotes({
  notes,                 // [{ midi, startBeat, beats }]
  lowestMidi,
  highestMidi,
  currentTimeBeats,
  pxPerBeat = 80,
  height = 280,
  activeNoteIdx = 0,
  hitResults = {},       // index -> 'hit' | 'miss'
  noteColor = '#E8843A',
}) {
  const whiteCount = useMemo(() => {
    let c = 0;
    for (let m = lowestMidi; m <= highestMidi; m += 1) if (!isBlackKey(m)) c += 1;
    return c;
  }, [lowestMidi, highestMidi]);

  const whiteWidthPct = 100 / whiteCount;

  function xPositionPct(midi) {
    // Center of the key, in percent.
    let whiteIdx = 0;
    for (let m = lowestMidi; m < midi; m += 1) {
      if (!isBlackKey(m)) whiteIdx += 1;
    }
    if (isBlackKey(midi)) {
      // Sits between whiteIdx-1 and whiteIdx
      return whiteIdx * whiteWidthPct;
    }
    return whiteIdx * whiteWidthPct + whiteWidthPct / 2;
  }

  const playheadY = height - 20;

  return (
    <div
      className="relative w-full overflow-hidden rounded-t-2xl bg-gradient-to-b from-ink-900 to-ink-800 border border-ink-700"
      style={{ height }}
    >
      {/* faint vertical guide lines for octave Cs */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: highestMidi - lowestMidi + 1 }, (_, i) => lowestMidi + i)
          .filter((m) => m % 12 === 0)
          .map((m) => (
            <div
              key={m}
              className="absolute top-0 bottom-0 border-l border-ink-600/40"
              style={{ left: `${xPositionPct(m) - whiteWidthPct / 2}%` }}
            />
          ))}
      </div>

      {/* notes */}
      {notes.map((n, idx) => {
        const relativeBeat = n.startBeat - currentTimeBeats;
        const noteHeight = n.beats * pxPerBeat;
        const top = playheadY - (relativeBeat * pxPerBeat) - noteHeight;
        if (top + noteHeight < 0) return null;
        if (top > height) return null;
        const isActive = idx === activeNoteIdx;
        const result = hitResults[idx];
        const black = isBlackKey(n.midi);
        const widthPct = black ? whiteWidthPct * 0.6 : whiteWidthPct * 0.85;
        const leftPct = xPositionPct(n.midi) - widthPct / 2;

        let bg = noteColor;
        if (result === 'hit') bg = '#9BC53D';
        else if (result === 'miss') bg = '#6B6B70';
        else if (isActive) bg = '#FFD23F';

        return (
          <div
            key={`${idx}-${n.midi}`}
            className="absolute rounded-md flex items-end justify-center text-[10px] font-bold text-ink-900 transition-colors"
            style={{
              top,
              height: Math.max(28, noteHeight - 4),
              left: `${leftPct}%`,
              width: `${widthPct}%`,
              background: bg,
              boxShadow: isActive ? '0 0 16px rgba(255,210,63,0.6)' : '0 2px 6px rgba(0,0,0,0.3)',
              opacity: result === 'miss' ? 0.5 : 1,
            }}
          >
            <span className="pb-1">{midiToName(n.midi).replace(/\d/g, '')}</span>
          </div>
        );
      })}

      {/* playhead */}
      <div
        className="absolute left-0 right-0 border-t-2 border-amber-400"
        style={{ top: playheadY }}
      >
        <div className="absolute -top-1 left-0 right-0 h-2 bg-gradient-to-b from-transparent to-amber-400/30" />
      </div>
    </div>
  );
}
