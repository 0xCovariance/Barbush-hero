// Static definitions for the four pentatonic modules shipped with Barbush Hero.
// Each exercise carries short / medium / long variants so the plan builder can
// fit any time budget. Variant values are minutes; XP scales with duration.

const xp = { short: 10, medium: 20, long: 35 };
const dur = { short: 3, medium: 5, long: 10 };

function ex(id, title, instructions) {
  return {
    exerciseId: id,
    title,
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
      ex('m1-e1', 'Learn the shape', {
        short: 'Play Box 1 ascending once, slowly, naming the strings as you go.',
        medium: 'Play Box 1 ascending and descending twice. Focus on clean fretting.',
        long: 'Ascend and descend Box 1 four times. Halfway through, close your eyes and visualize the shape between reps.',
      }),
      ex('m1-e2', 'Slow metronome (60 BPM)', {
        short: 'Two passes ascending at 60 BPM. One note per click.',
        medium: 'Four passes ascending and descending at 60 BPM. Lock to the click.',
        long: 'Eight passes at 60 BPM, then push to 72 BPM for the last two. Stay relaxed.',
      }),
      ex('m1-e3', 'String-skipping drill', {
        short: 'Play strings 6 → 4 → 5 → 3 within Box 1, once.',
        medium: 'Two cycles of 6→4→5→3→4→2→3→1 within Box 1.',
        long: 'Four cycles of string-skipping patterns. Reverse direction every other cycle.',
      }),
      ex('m1-e4', 'Backing track jam', {
        short: 'Play Box 1 along to a slow blues backing for 60 seconds.',
        medium: 'Jam Box 1 over a slow blues backing for 3 minutes — stay in the box.',
        long: 'Jam Box 1 for 6 minutes. Try repeating short 3-note phrases instead of running the scale.',
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
      ex('m2-e1', '3-note phrase drill', {
        short: 'Learn one classic 3-note lick from Box 1. Play it 8 times.',
        medium: 'Learn two classic 3-note licks. Alternate them over a backing.',
        long: 'Learn three licks, then chain them into a 30-second mini-solo.',
      }),
      ex('m2-e2', 'Bending intro', {
        short: 'Practice half-step bends on string 3, fret 7. Match the target pitch.',
        medium: 'Half-step and whole-step bends on strings 3 and 2. Use the target-pitch trick.',
        long: 'Bend, release, and pre-bend drills across strings 3, 2, and 1. Slow and in tune.',
      }),
      ex('m2-e3', 'Hammer-ons & pull-offs', {
        short: 'Hammer-on and pull-off pairs inside Box 1, one string.',
        medium: 'Hammer/pull patterns across all six strings of Box 1.',
        long: 'Legato runs across Box 1 with hammer/pull only — minimal picking.',
      }),
      ex('m2-e4', 'Improvise over 12-bar blues', {
        short: 'Improvise freely in Box 1 over a 12-bar blues for 60 seconds.',
        medium: 'Improvise for 3 minutes. Use space — leave gaps between phrases.',
        long: 'Improvise for 6 minutes. Record yourself and listen back.',
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
      ex('m3-e1', 'Learn Box 2', {
        short: 'Play Box 2 ascending once. Name the root.',
        medium: 'Ascending and descending Box 2, twice. Identify the root on string 6.',
        long: 'Box 2 four times each direction. Compare its shape to Box 1.',
      }),
      ex('m3-e2', 'Learn Box 3', {
        short: 'Play Box 3 ascending once. Find the root.',
        medium: 'Box 3 ascending and descending twice. Lock the shape in.',
        long: 'Box 3 four passes. Add hammer-ons and pull-offs.',
      }),
      ex('m3-e3', 'Learn Boxes 4 and 5', {
        short: 'One pass of Box 4 and Box 5 each.',
        medium: 'Two passes of Boxes 4 and 5. Note where they overlap.',
        long: 'Four passes each. Switch between Box 4 and Box 5 without stopping.',
      }),
      ex('m3-e4', 'Connect 3 positions', {
        short: 'Play Box 1 → Box 2 → Box 3 in one breath, ascending only.',
        medium: 'Box 1 → 2 → 3 → 2 → 1, smooth transitions, both directions.',
        long: 'Run all five boxes back-to-back, four times. No stops between boxes.',
      }),
      ex('m3-e5', 'Find the root', {
        short: 'Locate the root note in each box. Say the note out loud.',
        medium: 'Find every A note across all five boxes. Then try a different root.',
        long: 'Pick three different roots. Map each across all five boxes.',
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
      ex('m4-e1', 'Position shifting drill', {
        short: 'Slide between Box 1 and Box 2 on string 3, four times.',
        medium: 'Sliding transitions Box 1 ↔ 2 ↔ 3, both directions.',
        long: 'Full slide transitions across all five boxes, ascending and descending.',
      }),
      ex('m4-e2', 'One-string improv', {
        short: 'Improvise on string 3 across all boxes for 60 seconds.',
        medium: 'Improvise on string 3 for 3 minutes — cover the full neck.',
        long: 'Pick two strings. Six minutes of improv each, full neck.',
      }),
      ex('m4-e3', 'Full-neck pentatonic run', {
        short: 'Box 1 to Box 5 ascending, once.',
        medium: 'Box 1 → 5 and back, three times, smooth.',
        long: 'Full-neck run six times. Vary rhythm: triplets, eighths, sixteenths.',
      }),
      ex('m4-e4', 'Solo over medium blues', {
        short: 'Solo for 60 seconds using at least 2 boxes.',
        medium: 'Solo for 3 minutes using all 5 boxes. Move every 8 bars.',
        long: 'Solo for 6 minutes. Build dynamics — start low and quiet, peak high and loud.',
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
