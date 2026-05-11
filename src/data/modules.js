// Static definitions for the four pentatonic modules shipped with Barbush Hero.
// Each exercise declares a `kind` (which interactive primitive renders it) and
// a `config` (primitive-specific settings). The instructions text is shown
// inside the primitive and adapts to the user's daily-time variant.

const xp = { short: 10, medium: 20, long: 35 };
const dur = { short: 3, medium: 5, long: 10 };

function ex({ id, title, kind, config = {}, instructions }) {
  return {
    exerciseId: id,
    title,
    kind,
    config,
    instructions,
    durationMinutes: dur,
    xpReward: xp,
  };
}

export const MODULES = [
  {
    moduleId: 'm1-box1',
    title: 'The Minor Pentatonic — Box 1',
    description: 'Memorize the first-position minor pentatonic scale shape.',
    difficulty: 'beginner',
    prerequisiteModuleId: null,
    isUserCreated: false,
    exercises: [
      ex({
        id: 'm1-e1',
        title: 'Learn the shape',
        kind: 'fretboard-trainer',
        config: { boxId: 'box1', autoPlayBpm: 50 },
        instructions: {
          short: 'Play the shape ascending once, slowly, naming the strings as you go.',
          medium: 'Play through the shape twice in each direction. Watch the fretboard light up — match each note.',
          long: 'Four passes ascending and descending. Halfway through, close your eyes and visualize the shape between reps.',
        },
      }),
      ex({
        id: 'm1-e2',
        title: 'Lock the timing — metronome',
        kind: 'metronome-drill',
        config: { boxId: 'box1', startBpm: 60, targetBpm: 80, passes: 4 },
        instructions: {
          short: 'Two passes at 60 BPM, one note per click.',
          medium: 'Four passes — start slow and bump 2 BPM each pass.',
          long: 'Eight passes. Push toward 80 BPM and stay relaxed in the fretting hand.',
        },
      }),
      ex({
        id: 'm1-e3',
        title: 'Sequencing in 3s',
        kind: 'sequencer',
        config: { boxId: 'box1', group: 3, bpm: 70 },
        instructions: {
          short: 'Run the sequence ascending once. Solid orange = play now, faded = next.',
          medium: 'Two passes ascending, two descending. Watch the next-note hints.',
          long: 'Switch between groups of 3 and groups of 4. Bump tempo every two passes.',
        },
      }),
      ex({
        id: 'm1-e4',
        title: 'Jam over slow blues',
        kind: 'backing-track-jam',
        config: { boxId: 'box1', defaultTrackId: 'Am-slow' },
        instructions: {
          short: 'Play Box 1 along to the slow blues backing for 60 seconds.',
          medium: 'Jam Box 1 for 3 minutes — stay in the box, repeat short 3-note phrases.',
          long: 'Jam for 6 minutes. Try repeating short phrases instead of running the scale.',
        },
      }),
    ],
  },

  {
    moduleId: 'm2-licks',
    title: 'Box 1 Licks & Phrasing',
    description: 'Make Box 1 musical: phrases, bends, and expressive notes.',
    difficulty: 'beginner',
    prerequisiteModuleId: 'm1-box1',
    isUserCreated: false,
    exercises: [
      ex({
        id: 'm2-e1',
        title: 'Three classic Box-1 licks',
        kind: 'lick-player',
        config: { lickIds: ['lick-bb', 'lick-blues-1', 'lick-blues-2'], bpm: 60 },
        instructions: {
          short: 'Pick one lick. Watch it play, then loop it eight times.',
          medium: 'Learn two of the three licks. Alternate between them.',
          long: 'Learn all three. Chain them into a 30-second mini-solo.',
        },
      }),
      ex({
        id: 'm2-e2',
        title: 'Bending the G string',
        kind: 'bend-coach',
        config: { string: 3, fromFret: 7, toFret: 9, bendType: 'full', fretWindow: [4, 11] },
        instructions: {
          short: 'Half-step bends first, then full-step. Match the target pitch.',
          medium: 'Full-step bends at fret 7. Use the pitch coach if you can.',
          long: 'Bend, release, and pre-bend drills. Slow and in tune is better than fast and sharp.',
        },
      }),
      ex({
        id: 'm2-e3',
        title: 'Hammer-ons and pull-offs',
        kind: 'legato-drill',
        config: { boxId: 'box1' },
        instructions: {
          short: 'Hammer-on pairs on one string of your choice.',
          medium: 'Hammer/pull pairs across all six strings of Box 1.',
          long: 'Legato runs across the whole box with hammer/pull only — minimal picking.',
        },
      }),
      ex({
        id: 'm2-e4',
        title: 'Improvise over a 12-bar blues',
        kind: 'backing-track-jam',
        config: { boxId: 'box1', defaultTrackId: 'Am-medium' },
        instructions: {
          short: 'Improvise freely in Box 1 for 60 seconds.',
          medium: 'Improvise for 3 minutes. Use space — leave gaps between phrases.',
          long: 'Improvise for 6 minutes. Try recording yourself and listening back.',
        },
      }),
    ],
  },

  {
    moduleId: 'm3-positions',
    title: 'The Five Positions',
    description: 'Learn all five pentatonic boxes across the neck.',
    difficulty: 'intermediate',
    prerequisiteModuleId: 'm2-licks',
    isUserCreated: false,
    exercises: [
      ex({
        id: 'm3-e1',
        title: 'Box 2',
        kind: 'fretboard-trainer',
        config: { boxId: 'box2', autoPlayBpm: 55 },
        instructions: {
          short: 'Play Box 2 ascending once. Find the root.',
          medium: 'Two passes each direction. Compare the shape to Box 1 in your head.',
          long: 'Four passes. Then play it from memory with the fretboard hidden (look away).',
        },
      }),
      ex({
        id: 'm3-e2',
        title: 'Box 3',
        kind: 'fretboard-trainer',
        config: { boxId: 'box3', autoPlayBpm: 55 },
        instructions: {
          short: 'Play Box 3 ascending once. Note the root on string 5.',
          medium: 'Two passes each direction. Add some hammer-ons.',
          long: 'Four passes. Try sequencing in 3s once you have the shape.',
        },
      }),
      ex({
        id: 'm3-e3',
        title: 'Boxes 4 and 5',
        kind: 'fretboard-trainer',
        config: { boxId: 'box4', autoPlayBpm: 55 },
        instructions: {
          short: 'Run Box 4 ascending. Then peek up the neck at Box 5.',
          medium: 'Two passes Box 4, then come back later for Box 5 separately.',
          long: 'Four passes Box 4. Notice where it overlaps with Box 5 and Box 3.',
        },
      }),
      ex({
        id: 'm3-e4',
        title: 'Connect Box 1 to Box 2',
        kind: 'position-connector',
        config: { fromBoxId: 'box1', toBoxId: 'box2', shiftString: 3, bpm: 65 },
        instructions: {
          short: 'Slide between Box 1 and Box 2 on string 3 four times.',
          medium: 'Smooth ascending: Box 1 → slide → Box 2, both directions.',
          long: 'Full slide transitions Box 1 ↔ 2 ↔ 3 — connect three positions in a row.',
        },
      }),
      ex({
        id: 'm3-e5',
        title: 'Root finder quiz',
        kind: 'root-finder',
        config: { rounds: 5, fretWindow: [0, 14], targetString: 6 },
        instructions: {
          short: 'Five rounds. Tap the root of each named key on the low E.',
          medium: 'Five rounds. After each, visualize Box 1 starting from that root.',
          long: 'Play two full rounds. Then quiz yourself on string 5 too (mentally).',
        },
      }),
    ],
  },

  {
    moduleId: 'm4-connect',
    title: 'Connecting the Neck',
    description: 'Move fluidly across all five positions in a real musical context.',
    difficulty: 'intermediate',
    prerequisiteModuleId: 'm3-positions',
    isUserCreated: false,
    exercises: [
      ex({
        id: 'm4-e1',
        title: 'Slide-shift Box 1 ↔ 2',
        kind: 'position-connector',
        config: { fromBoxId: 'box1', toBoxId: 'box2', shiftString: 3, bpm: 70 },
        instructions: {
          short: 'Demo the shift. Repeat eight times, both directions.',
          medium: 'Three minutes of clean shifts. Vary which string you shift on.',
          long: 'Five minutes. Shift on different strings each pass — find what feels best.',
        },
      }),
      ex({
        id: 'm4-e2',
        title: 'Connect upper positions (3 ↔ 4)',
        kind: 'position-connector',
        config: { fromBoxId: 'box3', toBoxId: 'box4', shiftString: 3, bpm: 70 },
        instructions: {
          short: 'Demo and repeat eight times.',
          medium: 'Three minutes. Pay attention to keeping the shift in time.',
          long: 'Five minutes. Add hammer-ons after the shift — keep the line flowing.',
        },
      }),
      ex({
        id: 'm4-e3',
        title: 'Full-neck run (4 ↔ 5)',
        kind: 'position-connector',
        config: { fromBoxId: 'box4', toBoxId: 'box5', shiftString: 3, bpm: 70 },
        instructions: {
          short: 'One pass connecting Box 4 to Box 5.',
          medium: 'Three minutes — reach the highest pentatonic note and come back.',
          long: 'Five minutes. Then try connecting all five boxes in a single run.',
        },
      }),
      ex({
        id: 'm4-e4',
        title: 'Solo across the neck',
        kind: 'backing-track-jam',
        config: { boxId: 'box3', defaultTrackId: 'Am-medium' },
        instructions: {
          short: 'Solo for 60 seconds. Use at least 2 boxes.',
          medium: 'Solo for 3 minutes. Move boxes every 8 bars.',
          long: 'Solo for 6 minutes. Build dynamics — start low and quiet, peak high and loud.',
        },
      }),
    ],
  },
];

export function getModule(moduleId) {
  return MODULES.find((m) => m.moduleId === moduleId) || null;
}

export function getModuleIndex(moduleId) {
  return MODULES.findIndex((m) => m.moduleId === moduleId);
}
