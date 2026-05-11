// Pure-SVG fretboard. Horizontal layout — frets along x, strings along y, low
// E on the bottom (matches how a right-handed player views their own neck).
// Designed mobile-first: scales down to ~330px wide, up to full container.

import { useMemo } from 'react';

const STRING_LABELS = ['1 (high E)', '2 (B)', '3 (G)', '4 (D)', '5 (A)', '6 (low E)'];
const FRET_MARKERS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_MARKERS = new Set([12, 24]);

export function Fretboard({
  fretWindow = [4, 9],
  notes = [],
  highlightIds = [],
  ghostIds = [],
  hitIds = [],
  missIds = [],
  showFingers = false,
  className = '',
  onCellTap,
  ariaLabel,
}) {
  const [fromFret, toFret] = fretWindow;
  const fretCount = toFret - fromFret + 1; // visible frets including both ends

  // Layout numbers, in viewBox units. Width-first sizing.
  const fretWidth = 60;
  const stringSpacing = 28;
  const padTop = 26;
  const padBottom = 30;
  const padLeft = 44;
  const padRight = 16;

  const boardWidth = fretCount * fretWidth;
  const boardHeight = 5 * stringSpacing;
  const totalWidth = padLeft + boardWidth + padRight;
  const totalHeight = padTop + boardHeight + padBottom;

  // Helper: x-coord for the *middle* of the fret slot (where the dot sits).
  const xForFret = (fret) => padLeft + (fret - fromFret + 0.5) * fretWidth;
  // y-coord for a string number 1..6 (1 = high E on top).
  const yForString = (s) => padTop + (s - 1) * stringSpacing;

  const noteIndex = useMemo(() => {
    const m = new Map();
    notes.forEach((n) => m.set(`${n.string}-${n.fret}`, n));
    return m;
  }, [notes]);

  function cellId(s, f) { return `${s}-${f}`; }

  function dotState(id) {
    if (hitIds.includes(id)) return 'hit';
    if (missIds.includes(id)) return 'miss';
    if (highlightIds.includes(id)) return 'active';
    if (ghostIds.includes(id)) return 'ghost';
    return 'default';
  }

  function dotFill(state, isRoot) {
    if (state === 'hit') return '#34d399';
    if (state === 'miss') return '#f87171';
    if (state === 'active') return '#E8843A';
    if (state === 'ghost') return 'rgba(232,132,58,0.25)';
    return isRoot ? '#F2B783' : '#3D3D40';
  }

  function dotStroke(state, isRoot) {
    if (state === 'active' || state === 'hit' || state === 'miss') return '#0F0F10';
    if (isRoot) return '#E8843A';
    return '#6B6B70';
  }

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto select-none"
        role="img"
        aria-label={ariaLabel || 'Guitar fretboard diagram'}
      >
        {/* Fret marker dots (between frets along the bottom) */}
        {Array.from({ length: fretCount }).map((_, i) => {
          const fret = fromFret + i;
          if (DOUBLE_MARKERS.has(fret)) {
            return (
              <g key={`mk-${fret}`}>
                <circle cx={xForFret(fret)} cy={padTop + boardHeight + 14} r={3} fill="#3D3D40" />
                <circle cx={xForFret(fret)} cy={padTop + boardHeight + 22} r={3} fill="#3D3D40" />
              </g>
            );
          }
          if (FRET_MARKERS.has(fret)) {
            return (
              <circle
                key={`mk-${fret}`}
                cx={xForFret(fret)} cy={padTop + boardHeight + 18} r={3} fill="#3D3D40"
              />
            );
          }
          return null;
        })}

        {/* Strings */}
        {[1,2,3,4,5,6].map((s) => (
          <line
            key={`str-${s}`}
            x1={padLeft} x2={padLeft + boardWidth}
            y1={yForString(s)} y2={yForString(s)}
            stroke="#9A9AA0" strokeWidth={s >= 4 ? 1.6 : 1} strokeLinecap="round"
          />
        ))}

        {/* Fret wires (at the right edge of each slot) */}
        {Array.from({ length: fretCount + 1 }).map((_, i) => {
          const fret = fromFret + i - 1;
          const x = padLeft + i * fretWidth;
          const isNut = fret === 0;
          return (
            <line
              key={`fr-${i}`}
              x1={x} x2={x}
              y1={padTop - 2} y2={padTop + boardHeight + 2}
              stroke={isNut ? '#EFEFF2' : '#6B6B70'}
              strokeWidth={isNut ? 4 : 1.5}
            />
          );
        })}

        {/* Fret numbers along the top */}
        {Array.from({ length: fretCount }).map((_, i) => {
          const fret = fromFret + i;
          return (
            <text
              key={`fn-${fret}`}
              x={xForFret(fret)} y={padTop - 10}
              fill="#6B6B70" fontSize="11" textAnchor="middle"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {fret}
            </text>
          );
        })}

        {/* Tap targets — full string-x-fret cells (only when onCellTap provided) */}
        {onCellTap && [1,2,3,4,5,6].map((s) =>
          Array.from({ length: fretCount }).map((_, i) => {
            const fret = fromFret + i;
            return (
              <rect
                key={`tap-${s}-${fret}`}
                x={padLeft + i * fretWidth}
                y={yForString(s) - stringSpacing / 2}
                width={fretWidth}
                height={stringSpacing}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onClick={() => onCellTap({ string: s, fret })}
              />
            );
          }),
        )}

        {/* Notes */}
        {notes.map((n) => {
          const id = cellId(n.string, n.fret);
          const state = dotState(id);
          const isActive = state === 'active' || state === 'hit';
          const r = isActive ? 12 : 10;
          const cx = xForFret(n.fret);
          const cy = yForString(n.string);
          return (
            <g key={`n-${id}`} className={isActive ? 'animate-burst' : ''}>
              {n.isRoot && (
                <rect
                  x={cx - r - 1} y={cy - r - 1}
                  width={(r + 1) * 2} height={(r + 1) * 2}
                  rx={3}
                  fill="none"
                  stroke={dotStroke(state, true)}
                  strokeWidth={1.5}
                  opacity={state === 'ghost' ? 0.4 : 1}
                />
              )}
              <circle
                cx={cx} cy={cy} r={r}
                fill={dotFill(state, n.isRoot)}
                stroke={dotStroke(state, n.isRoot)}
                strokeWidth={1.5}
                opacity={state === 'ghost' ? 0.5 : 1}
              />
              {showFingers && n.finger && state !== 'ghost' && (
                <text
                  x={cx} y={cy + 4}
                  fill={isActive ? '#0F0F10' : '#EFEFF2'}
                  fontSize="11" fontWeight="700"
                  textAnchor="middle"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {n.finger}
                </text>
              )}
            </g>
          );
        })}

        {/* String labels (left side) */}
        {[1,2,3,4,5,6].map((s) => (
          <text
            key={`sl-${s}`}
            x={padLeft - 8} y={yForString(s) + 3}
            fill="#6B6B70" fontSize="10" textAnchor="end"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {s}
          </text>
        ))}
      </svg>

      <div className="sr-only">
        Strings labeled 1 (high E) through 6 (low E). {STRING_LABELS.join(', ')}.
      </div>
    </div>
  );
}

export function noteId(n) {
  return `${n.string}-${n.fret}`;
}
