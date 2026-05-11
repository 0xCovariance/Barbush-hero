import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore.js';
import { useUserStore } from '../store/userStore.js';
import { getModule } from '../data/modules.js';
import { activeModuleId, moduleProgress } from '../services/planService.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Confetti } from '../components/ui/Confetti.jsx';
import { ExerciseRenderer } from '../components/exercises/ExerciseRenderer.jsx';
import { todayKey } from '../utils/dateUtils.js';

export function ActiveSession() {
  const navigate = useNavigate();
  const active = useSessionStore((s) => s.active);
  const lastSummary = useSessionStore((s) => s.lastSummary);
  const clearSummary = useSessionStore((s) => s.clearSummary);
  const startSession = useSessionStore((s) => s.startSession);
  const recordResult = useSessionStore((s) => s.recordResult);
  const advance = useSessionStore((s) => s.advance);
  const finishSession = useSessionStore((s) => s.finishSession);
  const cancelSession = useSessionStore((s) => s.cancelSession);
  const recordSessionCompletion = useUserStore((s) => s.recordSessionCompletion);
  const dailyMinutes = useUserStore((s) => s.dailyMinutes);
  const completedExerciseIds = useUserStore((s) => s.completedExerciseIds);
  const completedModuleIds = useUserStore((s) => s.completedModuleIds);

  const [exerciseStartedAt, setExerciseStartedAt] = useState(Date.now());

  useEffect(() => {
    setExerciseStartedAt(Date.now());
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
        onPracticeMore={() => {
          clearSummary();
          const nextModuleId = activeModuleId(completedModuleIds);
          if (!nextModuleId) {
            navigate('/', { replace: true });
            return;
          }
          startSession({
            moduleId: nextModuleId,
            dailyMinutes,
            completedExerciseIds,
          });
        }}
      />
    );
  }

  if (!active) return null;

  const exercise = active.exercises[active.index];
  const mod = getModule(active.moduleId);
  const variant = active.variant;
  const elapsedSec = Math.round((Date.now() - exerciseStartedAt) / 1000);
  const progress = moduleProgress(active.moduleId, completedExerciseIds);

  function handleOutcome(outcome) {
    const actual = Math.round((Date.now() - exerciseStartedAt) / 1000);
    recordResult({ outcome, actualDurationSeconds: actual });
    const moved = advance();
    if (!moved) finishAndAward();
  }

  async function finishAndAward() {
    const summary = await finishSession();
    if (summary) {
      const result = recordSessionCompletion({
        xpEarned: summary.xpEarned,
        moduleId: summary.moduleId,
        completedExerciseIds: summary.completedExerciseIds,
        todayKey: todayKey(),
      });
      // Attach the freshly-computed module-completion flag so the
      // CompletionScreen can show the badge if the module just finished.
      summary.finishedModule = !!result?.finishedModule;
    }
  }

  function cancelAll() {
    cancelSession();
    navigate('/');
  }

  return (
    <div className="space-y-5 pb-2">
      <header className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="label truncate">{mod?.title} · {progress.done} / {progress.total} done</p>
          <h1 className="font-display text-lg">
            Exercise {active.index + 1} of {active.exercises.length}
          </h1>
        </div>
        <Button variant="ghost" onClick={cancelAll}>Quit</Button>
      </header>

      <ProgressDots
        total={active.exercises.length}
        current={active.index}
      />

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-2xl truncate">{exercise.title}</h2>
          <span className="chip shrink-0">{exercise.xpReward[variant]} XP</span>
        </div>
        <ExerciseRenderer exercise={exercise} variant={variant} />
      </Card>

      <Card>
        <p className="text-sm text-ink-300 text-center">Done with this exercise?</p>
        <div className="flex gap-2 mt-3">
          <Button onClick={() => handleOutcome('completed')} className="flex-1">
            Got it ✓
          </Button>
          <Button variant="secondary" onClick={() => handleOutcome('requeued')} className="flex-1">
            Need more time ↩
          </Button>
        </div>
        <p className="text-[10px] text-ink-400 text-center mt-2">
          {Math.floor(elapsedSec / 60)}m {elapsedSec % 60}s on this exercise
        </p>
      </Card>
    </div>
  );
}

function ProgressDots({ total, current }) {
  return (
    <div className="flex items-center gap-1 px-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-1.5 rounded-full ${
            i < current ? 'bg-amber-400'
            : i === current ? 'bg-amber-400/60'
            : 'bg-ink-600'
          }`}
        />
      ))}
    </div>
  );
}

function CompletionScreen({ summary, onDismiss, onPracticeMore }) {
  const completedExerciseIds = useUserStore((s) => s.completedExerciseIds);
  const completedModuleIds = useUserStore((s) => s.completedModuleIds);
  const nextModuleId = activeModuleId(completedModuleIds);
  const nextProgress = nextModuleId
    ? moduleProgress(nextModuleId, completedExerciseIds)
    : null;
  const moreRemaining = nextProgress ? nextProgress.total - nextProgress.done : 0;

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

      {moreRemaining > 0 && (
        <Button onClick={onPracticeMore} className="w-full">
          Practice more ({moreRemaining} left in module)
        </Button>
      )}
      <Button variant="secondary" className="w-full" onClick={onDismiss}>
        Back home
      </Button>
    </div>
  );
}
