import { useMemo } from 'react';
import { isBlackKey, midiToName } from '../../services/pianoAudio.js';

// Mobile-first horizontal keyboard. White keys take equal width; black keys
// overlay on top at the proper position. Range is configurable per song.

export function PianoKeyboard({
  lowestMidi = 60,
  highestMidi = 84,
  highlightedMidi = null,
  hintMidi = null,
  onKeyDown,
  onKeyUp,
  pressedKeys = new Set(),
  showLabels = true,
  noteColor = '#E8843A',
}) {
  const { whiteKeys, blackKeys } = useMemo(() => {
    const whites = [];
    const blacks = [];
    for (let m = lowestMidi; m <= highestMidi; m += 1) {
      if (isBlackKey(m)) blacks.push(m);
      else whites.push(m);
    }
    return { whiteKeys: whites, blackKeys: blacks };
  }, [lowestMidi, highestMidi]);

  const whiteCount = whiteKeys.length;
  const whiteWidthPct = 100 / whiteCount;

  function whiteIndexBefore(midi) {
    // Returns the white-key index immediately to the left of a black key.
    let count = 0;
    for (let m = lowestMidi; m < midi; m += 1) {
      if (!isBlackKey(m)) count += 1;
    }
    return count - 1; // index of the white key on its left
  }

  function handleDown(e, midi) {
    e.preventDefault();
    onKeyDown?.(midi);
  }
  function handleUp(e, midi) {
    e.preventDefault();
    onKeyUp?.(midi);
  }

  return (
    <div className="relative w-full select-none touch-none" style={{ aspectRatio: `${whiteCount * 0.45} / 1`, minHeight: 120 }}>
      {/* white keys */}
      <div className="absolute inset-0 flex">
        {whiteKeys.map((midi) => {
          const isHighlighted = highlightedMidi === midi;
          const isHint = hintMidi === midi;
          const isPressed = pressedKeys.has(midi);
          const isC = midi % 12 === 0;
          return (
            <button
              key={midi}
              onPointerDown={(e) => handleDown(e, midi)}
              onPointerUp={(e) => handleUp(e, midi)}
              onPointerLeave={(e) => handleUp(e, midi)}
              onPointerCancel={(e) => handleUp(e, midi)}
              className={`relative border border-ink-300/60 rounded-b-xl transition-all duration-75 flex flex-col justify-end items-center pb-2 ${
                isPressed || isHighlighted
                  ? 'shadow-inner'
                  : 'bg-white hover:bg-ink-100'
              }`}
              style={{
                width: `${whiteWidthPct}%`,
                background:
                  isPressed || isHighlighted
                    ? noteColor
                    : isHint
                      ? 'rgba(232,132,58,0.18)'
                      : undefined,
                color: isPressed || isHighlighted ? '#0F0F10' : '#3D3D40',
              }}
            >
              {showLabels && (
                <span className={`text-[10px] font-semibold ${isC ? 'opacity-100' : 'opacity-60'}`}>
                  {midiToName(midi).replace(/\d/g, isC ? '' : '')}
                  {isC && <sub className="text-[8px]">{Math.floor(midi / 12) - 1}</sub>}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* black keys overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {blackKeys.map((midi) => {
          const leftIdx = whiteIndexBefore(midi);
          const left = (leftIdx + 1) * whiteWidthPct;
          const width = whiteWidthPct * 0.6;
          const offset = width / 2;
          const isHighlighted = highlightedMidi === midi;
          const isHint = hintMidi === midi;
          const isPressed = pressedKeys.has(midi);
          return (
            <button
              key={midi}
              onPointerDown={(e) => handleDown(e, midi)}
              onPointerUp={(e) => handleUp(e, midi)}
              onPointerLeave={(e) => handleUp(e, midi)}
              onPointerCancel={(e) => handleUp(e, midi)}
              className="absolute pointer-events-auto rounded-b-lg transition-all duration-75"
              style={{
                top: 0,
                height: '62%',
                left: `calc(${left}% - ${offset}%)`,
                width: `${width}%`,
                background:
                  isPressed || isHighlighted
                    ? noteColor
                    : isHint
                      ? '#5C3E22'
                      : '#1A1A1A',
                border: '1px solid #0F0F10',
                boxShadow: isPressed || isHighlighted ? 'inset 0 -2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.5)',
              }}
              aria-label={midiToName(midi)}
            />
          );
        })}
      </div>
    </div>
  );
}
