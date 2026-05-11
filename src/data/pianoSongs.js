// Kid-friendly piano songs. Each note is { midi, beats } where 1 beat = quarter note.
// MIDI reference: C4 = 60, D4 = 62, E4 = 64, F4 = 65, G4 = 67, A4 = 69, B4 = 71, C5 = 72.
// Songs are kept in C major / simple ranges so kids can play with one hand.

const G3 = 55, A3 = 57, B3 = 59;
const C4 = 60, D4 = 62, Eb4 = 63, E4 = 64, F4 = 65, Gb4 = 66, G4 = 67, Ab4 = 68, A4 = 69, Bb4 = 70, B4 = 71;
const C5 = 72, D5 = 74, E5 = 76, F5 = 77, G5 = 79, A5 = 81;

export const SONGS = [
  {
    songId: 'pink-panther',
    title: 'The Pink Panther',
    emoji: '🐈',
    difficulty: 3,
    category: 'featured',
    bpm: 110,
    description: "Henry Mancini's sneaky, jazzy classic.",
    notes: [
      // "Dum di… dum di… dum di-dum di-dum-dum"
      { midi: E4, beats: 0.5 }, { midi: G4, beats: 0.5 },
      { rest: true, beats: 0.5 },
      { midi: E4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: Ab4, beats: 0.5 },
      { midi: A4, beats: 0.5 }, { midi: C5, beats: 0.5 }, { midi: B4, beats: 1.5 },
      { rest: true, beats: 1 },
      // Repeat phrase, descending tail
      { midi: E4, beats: 0.5 }, { midi: G4, beats: 0.5 },
      { rest: true, beats: 0.5 },
      { midi: E4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: Ab4, beats: 0.5 },
      { midi: A4, beats: 0.5 }, { midi: C5, beats: 0.5 }, { midi: B4, beats: 0.5 },
      { midi: A4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: E4, beats: 2 },
    ],
  },
  {
    songId: 'twinkle',
    title: 'Twinkle, Twinkle, Little Star',
    emoji: '⭐',
    difficulty: 1,
    category: 'classical-kids',
    bpm: 90,
    description: 'The classic nursery rhyme — perfect first song.',
    notes: [
      { midi: C4, beats: 1 }, { midi: C4, beats: 1 }, { midi: G4, beats: 1 }, { midi: G4, beats: 1 },
      { midi: A4, beats: 1 }, { midi: A4, beats: 1 }, { midi: G4, beats: 2 },
      { midi: F4, beats: 1 }, { midi: F4, beats: 1 }, { midi: E4, beats: 1 }, { midi: E4, beats: 1 },
      { midi: D4, beats: 1 }, { midi: D4, beats: 1 }, { midi: C4, beats: 2 },
    ],
  },
  {
    songId: 'mary-lamb',
    title: 'Mary Had a Little Lamb',
    emoji: '🐑',
    difficulty: 1,
    category: 'classical-kids',
    bpm: 100,
    description: 'Only three notes — easy peasy.',
    notes: [
      { midi: E4, beats: 1 }, { midi: D4, beats: 1 }, { midi: C4, beats: 1 }, { midi: D4, beats: 1 },
      { midi: E4, beats: 1 }, { midi: E4, beats: 1 }, { midi: E4, beats: 2 },
      { midi: D4, beats: 1 }, { midi: D4, beats: 1 }, { midi: D4, beats: 2 },
      { midi: E4, beats: 1 }, { midi: G4, beats: 1 }, { midi: G4, beats: 2 },
    ],
  },
  {
    songId: 'hot-cross-buns',
    title: 'Hot Cross Buns',
    emoji: '🥯',
    difficulty: 1,
    category: 'classical-kids',
    bpm: 100,
    description: 'Three notes, simple rhythm.',
    notes: [
      { midi: E4, beats: 1 }, { midi: D4, beats: 1 }, { midi: C4, beats: 2 },
      { midi: E4, beats: 1 }, { midi: D4, beats: 1 }, { midi: C4, beats: 2 },
      { midi: C4, beats: 0.5 }, { midi: C4, beats: 0.5 }, { midi: C4, beats: 0.5 }, { midi: C4, beats: 0.5 },
      { midi: D4, beats: 0.5 }, { midi: D4, beats: 0.5 }, { midi: D4, beats: 0.5 }, { midi: D4, beats: 0.5 },
      { midi: E4, beats: 1 }, { midi: D4, beats: 1 }, { midi: C4, beats: 2 },
    ],
  },
  {
    songId: 'old-macdonald',
    title: 'Old MacDonald',
    emoji: '🐮',
    difficulty: 2,
    category: 'classical-kids',
    bpm: 110,
    description: 'E-I-E-I-O. Sing while you play.',
    notes: [
      { midi: G4, beats: 1 }, { midi: G4, beats: 1 }, { midi: G4, beats: 1 }, { midi: D4, beats: 1 },
      { midi: E4, beats: 1 }, { midi: E4, beats: 1 }, { midi: D4, beats: 2 },
      { midi: B4, beats: 1 }, { midi: B4, beats: 1 }, { midi: A4, beats: 1 }, { midi: A4, beats: 1 },
      { midi: G4, beats: 2 }, { midi: D4, beats: 2 },
      { midi: G4, beats: 1 }, { midi: G4, beats: 1 }, { midi: G4, beats: 1 }, { midi: D4, beats: 1 },
      { midi: E4, beats: 1 }, { midi: E4, beats: 1 }, { midi: D4, beats: 2 },
    ],
  },
  {
    songId: 'row-boat',
    title: 'Row, Row, Row Your Boat',
    emoji: '🚣',
    difficulty: 1,
    category: 'classical-kids',
    bpm: 95,
    description: 'Gently down the stream.',
    notes: [
      { midi: C4, beats: 1 }, { midi: C4, beats: 1 }, { midi: C4, beats: 0.75 }, { midi: D4, beats: 0.25 },
      { midi: E4, beats: 2 },
      { midi: E4, beats: 0.75 }, { midi: D4, beats: 0.25 }, { midi: E4, beats: 0.75 }, { midi: F4, beats: 0.25 },
      { midi: G4, beats: 2 },
      { midi: C5, beats: 0.5 }, { midi: C5, beats: 0.5 }, { midi: C5, beats: 0.5 },
      { midi: G4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: G4, beats: 0.5 },
      { midi: E4, beats: 0.5 }, { midi: E4, beats: 0.5 }, { midi: E4, beats: 0.5 },
      { midi: C4, beats: 0.5 }, { midi: C4, beats: 0.5 }, { midi: C4, beats: 0.5 },
      { midi: G4, beats: 0.75 }, { midi: F4, beats: 0.25 }, { midi: E4, beats: 0.75 }, { midi: D4, beats: 0.25 },
      { midi: C4, beats: 2 },
    ],
  },
  {
    songId: 'frere-jacques',
    title: 'Frère Jacques',
    emoji: '🔔',
    difficulty: 2,
    category: 'classical-kids',
    bpm: 100,
    description: 'A round you can sing with friends.',
    notes: [
      { midi: C4, beats: 1 }, { midi: D4, beats: 1 }, { midi: E4, beats: 1 }, { midi: C4, beats: 1 },
      { midi: C4, beats: 1 }, { midi: D4, beats: 1 }, { midi: E4, beats: 1 }, { midi: C4, beats: 1 },
      { midi: E4, beats: 1 }, { midi: F4, beats: 1 }, { midi: G4, beats: 2 },
      { midi: E4, beats: 1 }, { midi: F4, beats: 1 }, { midi: G4, beats: 2 },
      { midi: G4, beats: 0.5 }, { midi: A4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: F4, beats: 0.5 },
      { midi: E4, beats: 1 }, { midi: C4, beats: 1 },
      { midi: G4, beats: 0.5 }, { midi: A4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: F4, beats: 0.5 },
      { midi: E4, beats: 1 }, { midi: C4, beats: 1 },
      { midi: C4, beats: 1 }, { midi: G3, beats: 1 }, { midi: C4, beats: 2 },
    ],
  },
  {
    songId: 'jingle-bells',
    title: 'Jingle Bells',
    emoji: '🔔',
    difficulty: 2,
    category: 'popular-kids',
    bpm: 120,
    description: 'Dashing through the snow.',
    notes: [
      { midi: E4, beats: 1 }, { midi: E4, beats: 1 }, { midi: E4, beats: 2 },
      { midi: E4, beats: 1 }, { midi: E4, beats: 1 }, { midi: E4, beats: 2 },
      { midi: E4, beats: 1 }, { midi: G4, beats: 1 }, { midi: C4, beats: 1 }, { midi: D4, beats: 1 },
      { midi: E4, beats: 4 },
      { midi: F4, beats: 1 }, { midi: F4, beats: 1 }, { midi: F4, beats: 1 }, { midi: F4, beats: 1 },
      { midi: F4, beats: 1 }, { midi: E4, beats: 1 }, { midi: E4, beats: 1 }, { midi: E4, beats: 0.5 }, { midi: E4, beats: 0.5 },
      { midi: E4, beats: 1 }, { midi: D4, beats: 1 }, { midi: D4, beats: 1 }, { midi: E4, beats: 1 },
      { midi: D4, beats: 2 }, { midi: G4, beats: 2 },
    ],
  },
  {
    songId: 'happy-birthday',
    title: 'Happy Birthday',
    emoji: '🎂',
    difficulty: 2,
    category: 'popular-kids',
    bpm: 100,
    description: 'For the next birthday party.',
    notes: [
      { midi: C4, beats: 0.75 }, { midi: C4, beats: 0.25 }, { midi: D4, beats: 1 }, { midi: C4, beats: 1 }, { midi: F4, beats: 1 },
      { midi: E4, beats: 2 },
      { midi: C4, beats: 0.75 }, { midi: C4, beats: 0.25 }, { midi: D4, beats: 1 }, { midi: C4, beats: 1 }, { midi: G4, beats: 1 },
      { midi: F4, beats: 2 },
      { midi: C4, beats: 0.75 }, { midi: C4, beats: 0.25 }, { midi: C5, beats: 1 }, { midi: A4, beats: 1 }, { midi: F4, beats: 1 },
      { midi: E4, beats: 1 }, { midi: D4, beats: 1 },
      { midi: A4, beats: 0.75 }, { midi: A4, beats: 0.25 }, { midi: G4, beats: 1 }, { midi: F4, beats: 1 }, { midi: G4, beats: 1 },
      { midi: F4, beats: 2 },
    ],
  },
  {
    songId: 'ode-to-joy',
    title: 'Ode to Joy',
    emoji: '🎉',
    difficulty: 3,
    category: 'classical',
    bpm: 100,
    description: "Beethoven's famous melody.",
    notes: [
      { midi: E4, beats: 1 }, { midi: E4, beats: 1 }, { midi: F4, beats: 1 }, { midi: G4, beats: 1 },
      { midi: G4, beats: 1 }, { midi: F4, beats: 1 }, { midi: E4, beats: 1 }, { midi: D4, beats: 1 },
      { midi: C4, beats: 1 }, { midi: C4, beats: 1 }, { midi: D4, beats: 1 }, { midi: E4, beats: 1 },
      { midi: E4, beats: 1.5 }, { midi: D4, beats: 0.5 }, { midi: D4, beats: 2 },
      { midi: E4, beats: 1 }, { midi: E4, beats: 1 }, { midi: F4, beats: 1 }, { midi: G4, beats: 1 },
      { midi: G4, beats: 1 }, { midi: F4, beats: 1 }, { midi: E4, beats: 1 }, { midi: D4, beats: 1 },
      { midi: C4, beats: 1 }, { midi: C4, beats: 1 }, { midi: D4, beats: 1 }, { midi: E4, beats: 1 },
      { midi: D4, beats: 1.5 }, { midi: C4, beats: 0.5 }, { midi: C4, beats: 2 },
    ],
  },
  {
    songId: 'london-bridge',
    title: 'London Bridge',
    emoji: '🌉',
    difficulty: 2,
    category: 'classical-kids',
    bpm: 110,
    description: 'Is falling down, falling down…',
    notes: [
      { midi: G4, beats: 0.75 }, { midi: A4, beats: 0.25 }, { midi: G4, beats: 1 }, { midi: F4, beats: 0.5 }, { midi: E4, beats: 0.5 },
      { midi: F4, beats: 0.5 }, { midi: G4, beats: 0.5 },
      { midi: D4, beats: 1 }, { midi: E4, beats: 1 }, { midi: F4, beats: 2 },
      { midi: E4, beats: 0.5 }, { midi: F4, beats: 0.5 }, { midi: G4, beats: 2 },
      { midi: G4, beats: 0.75 }, { midi: A4, beats: 0.25 }, { midi: G4, beats: 1 }, { midi: F4, beats: 0.5 }, { midi: E4, beats: 0.5 },
      { midi: F4, beats: 0.5 }, { midi: G4, beats: 0.5 },
      { midi: D4, beats: 1 }, { midi: G4, beats: 1 }, { midi: E4, beats: 1 }, { midi: C4, beats: 2 },
    ],
  },
  {
    songId: 'itsy-bitsy',
    title: 'Itsy Bitsy Spider',
    emoji: '🕷️',
    difficulty: 2,
    category: 'classical-kids',
    bpm: 110,
    description: 'Climbing up the water spout.',
    notes: [
      { midi: C4, beats: 0.5 }, { midi: C4, beats: 0.5 }, { midi: C4, beats: 0.5 }, { midi: D4, beats: 0.5 }, { midi: E4, beats: 0.5 },
      { midi: E4, beats: 0.5 }, { midi: E4, beats: 0.5 }, { midi: D4, beats: 0.5 }, { midi: C4, beats: 0.5 }, { midi: D4, beats: 0.5 }, { midi: E4, beats: 0.5 }, { midi: C4, beats: 1 },
      { midi: E4, beats: 0.5 }, { midi: E4, beats: 0.5 }, { midi: F4, beats: 0.5 }, { midi: G4, beats: 1 },
      { midi: G4, beats: 0.5 }, { midi: F4, beats: 0.5 }, { midi: E4, beats: 0.5 }, { midi: F4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: E4, beats: 1 },
      { midi: G4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: A4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: F4, beats: 1 },
      { midi: E4, beats: 0.5 }, { midi: F4, beats: 0.5 }, { midi: G4, beats: 1 }, { midi: E4, beats: 0.5 },
      { midi: C4, beats: 0.5 }, { midi: C4, beats: 0.5 }, { midi: D4, beats: 0.5 }, { midi: E4, beats: 0.5 },
      { midi: E4, beats: 0.5 }, { midi: D4, beats: 0.5 }, { midi: C4, beats: 0.5 }, { midi: D4, beats: 0.5 }, { midi: E4, beats: 0.5 }, { midi: C4, beats: 1 },
    ],
  },
  {
    songId: 'baby-shark',
    title: 'Baby Shark',
    emoji: '🦈',
    difficulty: 2,
    category: 'popular-kids',
    bpm: 120,
    description: 'Doo doo doo doo doo doo.',
    notes: [
      { midi: D4, beats: 0.5 }, { midi: E4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: G4, beats: 0.5 },
      { midi: G4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: G4, beats: 1 },
      { midi: D4, beats: 0.5 }, { midi: E4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: G4, beats: 0.5 },
      { midi: G4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: G4, beats: 1 },
      { midi: D4, beats: 0.5 }, { midi: E4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: G4, beats: 0.5 },
      { midi: G4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: G4, beats: 0.5 }, { midi: G4, beats: 0.5 },
      { midi: G4, beats: 1 }, { midi: G4, beats: 1 },
    ],
  },
];

export const SONG_CATEGORIES = [
  { id: 'featured', label: 'Featured', emoji: '⭐' },
  { id: 'classical-kids', label: 'Classic kids songs', emoji: '🎵' },
  { id: 'popular-kids', label: 'Songs kids love', emoji: '🌟' },
  { id: 'classical', label: 'Famous classical', emoji: '🎼' },
];

export function getSong(songId) {
  return SONGS.find((s) => s.songId === songId);
}

export function songsByCategory(categoryId) {
  return SONGS.filter((s) => s.category === categoryId);
}

export function songDurationSeconds(song) {
  const totalBeats = song.notes.reduce((a, n) => a + n.beats, 0);
  return (totalBeats / song.bpm) * 60;
}
