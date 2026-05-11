// A-minor pentatonic — the canonical starting key for blues/rock learners.
// Notes: A C D E G. Root = A.
//
// Each box is a list of [stringIndex, fret, isRoot]. String indexing is 1..6
// where 1 = high E, 6 = low E (matching standard tab notation conventions).
// fingerHint is optional — index/middle/ring/pinky → 1..4.

export const TUNING = ['E', 'B', 'G', 'D', 'A', 'E']; // index 0=high E .. 5=low E

export const STRING_NAMES = ['high E', 'B', 'G', 'D', 'A', 'low E'];

// Standard MIDI numbers for open strings, high E first.
export const OPEN_MIDI = [64, 59, 55, 50, 45, 40];

export const KEY = 'A minor pentatonic';
export const ROOT_NOTE = 'A';
export const SCALE_NOTES = ['A', 'C', 'D', 'E', 'G'];

// Boxes are listed low-to-high pitch within each box, in the order a player
// would ascend them. This matters for the FretboardTrainer playback order.
function asc(positions) {
  // Sort by string from low (6) to high (1), then by fret ascending.
  return [...positions].sort((a, b) => (b.string - a.string) || (a.fret - b.fret));
}

function p(string, fret, opts = {}) {
  return { string, fret, isRoot: !!opts.root, finger: opts.finger };
}

export const BOXES = {
  box1: {
    id: 'box1',
    name: 'Box 1',
    fretWindow: [4, 9],
    notes: asc([
      p(6, 5, { root: true, finger: 1 }), p(6, 8, { finger: 4 }),
      p(5, 5, { finger: 1 }),               p(5, 7, { finger: 3 }),
      p(4, 5, { finger: 1 }),               p(4, 7, { root: true, finger: 3 }),
      p(3, 5, { finger: 1 }),               p(3, 7, { finger: 3 }),
      p(2, 5, { finger: 1 }),               p(2, 8, { finger: 4 }),
      p(1, 5, { root: true, finger: 1 }), p(1, 8, { finger: 4 }),
    ]),
  },
  box2: {
    id: 'box2',
    name: 'Box 2',
    fretWindow: [6, 11],
    notes: asc([
      p(6, 8, { finger: 1 }),               p(6, 10, { finger: 3 }),
      p(5, 7, { finger: 1 }),               p(5, 10, { finger: 4 }),
      p(4, 7, { root: true, finger: 1 }), p(4, 10, { finger: 4 }),
      p(3, 7, { finger: 1 }),               p(3, 9, { finger: 3 }),
      p(2, 8, { finger: 1 }),               p(2, 10, { root: true, finger: 3 }),
      p(1, 8, { finger: 1 }),               p(1, 10, { finger: 3 }),
    ]),
  },
  box3: {
    id: 'box3',
    name: 'Box 3',
    fretWindow: [9, 14],
    notes: asc([
      p(6, 10, { finger: 1 }),              p(6, 12, { finger: 3 }),
      p(5, 10, { finger: 1 }),              p(5, 12, { root: true, finger: 3 }),
      p(4, 10, { finger: 1 }),              p(4, 12, { finger: 3 }),
      p(3, 9,  { finger: 1 }),              p(3, 12, { finger: 4 }),
      p(2, 10, { root: true, finger: 1 }), p(2, 13, { finger: 4 }),
      p(1, 10, { finger: 1 }),              p(1, 12, { finger: 3 }),
    ]),
  },
  box4: {
    id: 'box4',
    name: 'Box 4',
    fretWindow: [11, 16],
    notes: asc([
      p(6, 12, { finger: 1 }),              p(6, 15, { finger: 4 }),
      p(5, 12, { root: true, finger: 1 }), p(5, 15, { finger: 4 }),
      p(4, 12, { finger: 1 }),              p(4, 14, { finger: 3 }),
      p(3, 12, { finger: 1 }),              p(3, 14, { root: true, finger: 3 }),
      p(2, 13, { finger: 1 }),              p(2, 15, { finger: 3 }),
      p(1, 12, { finger: 1 }),              p(1, 15, { finger: 4 }),
    ]),
  },
  box5: {
    id: 'box5',
    name: 'Box 5',
    fretWindow: [13, 18],
    notes: asc([
      p(6, 15, { finger: 1 }),              p(6, 17, { root: true, finger: 3 }),
      p(5, 15, { finger: 1 }),              p(5, 17, { finger: 3 }),
      p(4, 14, { finger: 1 }),              p(4, 17, { finger: 4 }),
      p(3, 14, { root: true, finger: 1 }), p(3, 17, { finger: 4 }),
      p(2, 15, { finger: 1 }),              p(2, 17, { finger: 3 }),
      p(1, 15, { finger: 1 }),              p(1, 17, { root: true, finger: 3 }),
    ]),
  },
};

export const ALL_BOXES = ['box1', 'box2', 'box3', 'box4', 'box5'];

// MIDI for a (string, fret) — used by the synth.
export function midiAt(string, fret) {
  return OPEN_MIDI[string - 1] + fret;
}

// Sequence helpers used by the Sequencer primitive.
export function ascendingNotes(boxId) {
  return BOXES[boxId].notes;
}

export function descendingNotes(boxId) {
  return [...BOXES[boxId].notes].reverse();
}

// Sequence in groups of N (e.g. 1-2-3, 2-3-4, 3-4-5...).
export function sequenceInGroups(boxId, group = 3) {
  const notes = ascendingNotes(boxId);
  const out = [];
  for (let i = 0; i + group <= notes.length; i++) {
    for (let j = 0; j < group; j++) out.push(notes[i + j]);
  }
  return out;
}

// Three classic Box-1 licks for the Lick Player. Each is a list of
// { string, fret, durationBeats, technique? }. Technique tags:
// 'bend-half' | 'bend-full' | 'hammer' | 'pull' | 'slide'.
export const BOX1_LICKS = [
  {
    id: 'lick-bb',
    name: 'B.B. King box opener',
    description: 'A classic phrase using the B-string root and a half-step bend.',
    notes: [
      { string: 2, fret: 8, durationBeats: 1 },
      { string: 2, fret: 8, durationBeats: 1, technique: 'bend-half' },
      { string: 1, fret: 5, durationBeats: 1 },
      { string: 2, fret: 8, durationBeats: 2 },
    ],
  },
  {
    id: 'lick-blues-1',
    name: 'Blues phrase #1',
    description: 'Uses a hammer-on into the root, then resolves on the 5th.',
    notes: [
      { string: 3, fret: 5, durationBeats: 0.5 },
      { string: 3, fret: 7, durationBeats: 0.5, technique: 'hammer' },
      { string: 2, fret: 5, durationBeats: 1 },
      { string: 2, fret: 8, durationBeats: 2 },
    ],
  },
  {
    id: 'lick-blues-2',
    name: 'Hendrix-style descending',
    description: 'Descending pull-off run from the high root.',
    notes: [
      { string: 1, fret: 8, durationBeats: 0.5 },
      { string: 1, fret: 5, durationBeats: 0.5, technique: 'pull' },
      { string: 2, fret: 8, durationBeats: 0.5 },
      { string: 2, fret: 5, durationBeats: 0.5, technique: 'pull' },
      { string: 3, fret: 7, durationBeats: 0.5 },
      { string: 3, fret: 5, durationBeats: 1.5, technique: 'pull' },
    ],
  },
];
