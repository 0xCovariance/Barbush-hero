import { FretboardTrainer } from './FretboardTrainer.jsx';
import { MetronomeDrill } from './MetronomeDrill.jsx';
import { Sequencer } from './Sequencer.jsx';
import { BendCoach } from './BendCoach.jsx';
import { PositionConnector } from './PositionConnector.jsx';
import { RootFinder } from './RootFinder.jsx';
import { BackingTrackJam } from './BackingTrackJam.jsx';
import { LickPlayer } from './LickPlayer.jsx';
import { LegatoDrill } from './LegatoDrill.jsx';

const REGISTRY = {
  'fretboard-trainer': FretboardTrainer,
  'metronome-drill': MetronomeDrill,
  'sequencer': Sequencer,
  'bend-coach': BendCoach,
  'position-connector': PositionConnector,
  'root-finder': RootFinder,
  'backing-track-jam': BackingTrackJam,
  'lick-player': LickPlayer,
  'legato-drill': LegatoDrill,
};

export function ExerciseRenderer({ exercise, variant }) {
  const Cmp = REGISTRY[exercise.kind];
  if (!Cmp) {
    return (
      <div className="card-tight text-sm text-ink-300">
        Unknown exercise type: {exercise.kind}
      </div>
    );
  }
  return (
    <Cmp
      key={exercise.exerciseId}
      config={exercise.config || {}}
      instruction={exercise.instructions[variant]}
    />
  );
}
