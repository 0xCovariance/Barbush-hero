import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore.js';
import { useUserStore } from '../store/userStore.js';
import { getModule } from '../data/modules.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Timer } from '../components/ui/Timer.jsx';
import { Confetti } from '../components/ui/Confetti.jsx';
import { todayKey } from '../utils/dateUtils.js';

export function ActiveSession() {
  const navigate = useNavigate();
  const active = useSessionStore((s) => s.active);
  const lastSummary = useSessionStore((s) => s.lastSummary);
  const clearSummary = useSessionStore((s) => s.clearSummary);
  const recordResult = useSessionStore((s) => s.recordResult);
  const advance = useSessionStore((s) => s.advance);
  const finishSession = useSessionStore((s) => s.finishSession);
  const cancelSession = useSessionStore((s) => s.cancelSession);
  const recordSessionCompletion = useUserStore((s) => s.recordSessionCompletion);

  const [paused, setPaused] = useState(false);
  const [askingOutcome, setAskingOutcome] = useState(false);
  const [exerciseStartedAt, setExerciseStartedAt] = useState(Date.now());

  useEffect(() => {
    setExerciseStartedAt(Date.now());
    setAskingOutcome(false);
    setPaused(false);
  }, [active?.index]);

  useEffect(() => {
    if (!active && !lastSummary) navigate('/', { replace: true });
  }, [active, lastSummary, navigate]);

  if (lastSummary) {
    return (
      <CompletionScreen
        summary={lastSummary}
        onDismiss={() => {
          clearSummary();
          navigate('/', { replace: true });
        }}
      />
    );
  }

  if (!active) return null;

  const exercise = active.exercises[active.index];
  const mod = getModule(active.moduleId);
  const variant = active.variant;
  const totalSeconds = exercise.durationMinutes[variant] * 60;

  function handleOutcome(outcome) {
    const actual = Math.round((Date.now() - exerciseStartedAt) / 1000);
    recordResult({ outcome, actualDurationSeconds: actual });
    const moved = advance();
    if (!moved) {
      finishAndAward();
    } else {
      setAskingOutcome(false);
    }
  }

  async function finishAndAward() {
    const summary = await finishSession();
    if (summary) {
      recordSessionCompletion({
        xpEarned: summary.xpEarned,
        moduleId: summary.moduleId,
        finishedModule: summary.finishedModule,
        todayKey: todayKey(),
      });
    }
  }

  function doneEarly() {
    setPaused(true);
    setAskingOutcome(true);
  }

  function cancelAll() {
    cancelSession();
    navigate('/');
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="label">{mod?.title}</p>
          <h1 className="font-display text-lg">
            Exercise {active.index + 1} of {active.exercises.length}
          </h1>
        </div>
        <Button variant="ghost" onClick={cancelAll}>Quit</Button>
      </header>

      <Card>
        <h2 className="font-display text-2xl">{exercise.title}</h2>
        <p className="text-sm text-ink-200 mt-2 leading-relaxed">{exercise.instructions[variant]}</p>
        <div className="mt-2 flex gap-2 text-xs">
          <span className="chip">{exercise.durationMinutes[variant]} min</span>
          <span className="chip">{exercise.xpReward[variant]} XP</span>
        </div>
      </Card>

      <div className="flex justify-center py-2">
        <Timer
          totalSeconds={totalSeconds}
          paused={paused || askingOutcome}
          onElapsed={() => setAskingOutcome(true)}
        />
      </div>

      {!askingOutcome ? (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setPaused((p) => !p)}
            className="flex-1"
          >
            {paused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="secondary" onClick={doneEarly} className="flex-1">
            Done early
          </Button>
        </div>
      ) : (
        <Card>
          <p className="font-display text-lg text-center">How did it go?</p>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => handleOutcome('completed')} className="flex-1">
              Got it ✓
            </Button>
            <Button variant="secondary" onClick={() => handleOutcome('requeued')} className="flex-1">
              Need more time ↩
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function CompletionScreen({ summary, onDismiss }) {
  return (
    <div className="space-y-5">
      <Confetti show count={48} />
      <div className="text-center pt-4 animate-burst">
        <div className="text-6xl mb-3">🎸</div>
        <h1 className="font-display text-3xl">Session complete</h1>
        <p className="text-sm text-ink-300 mt-1">{summary.moduleTitle}</p>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="label">XP earned</p>
            <div className="font-display text-4xl mt-1">+{summary.xpEarned}</div>
          </div>
          <div className="text-5xl">⭐</div>
        </div>
      </Card>

      {summary.finishedModule && (
        <Card className="border-amber-400">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏅</span>
            <div>
              <p className="label">New badge</p>
              <p className="font-display text-lg">Module completed</p>
              <p className="text-xs text-ink-300">+50 XP module bonus</p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {summary.results.map((r, i) => (
          <div key={i} className="flex items-center justify-between text-sm card-tight">
            <span>Exercise {i + 1}</span>
            <span className={r.outcome === 'completed' ? 'text-amber-300' : 'text-ink-400'}>
              {r.outcome === 'completed' ? 'Got it ✓' : 'Re-queued ↩'}
            </span>
          </div>
        ))}
      </div>

      <Button className="w-full" onClick={onDismiss}>Back home</Button>
    </div>
  );
}
