import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore.js';
import { useStreak } from '../hooks/useStreak.js';
import { usePlan } from '../hooks/usePlan.js';
import { getModule, MODULES } from '../data/modules.js';
import { exercisesForSession, variantForMinutes, moduleProgress } from '../services/planService.js';
import { useSessionStore } from '../store/sessionStore.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { StreakBadge } from '../components/gamification/StreakBadge.jsx';
import { XPBar } from '../components/gamification/XPBar.jsx';
import { DAY_LABELS, dayOfWeek } from '../utils/dateUtils.js';

export function Home() {
  const navigate = useNavigate();
  const totalXP = useUserStore((s) => s.totalXP);
  const dailyMinutes = useUserStore((s) => s.dailyMinutes);
  const completedExerciseIds = useUserStore((s) => s.completedExerciseIds);
  const { currentStreak } = useStreak();
  const { plan, activeModuleId, practiceToday } = usePlan();
  const startSession = useSessionStore((s) => s.startSession);

  const activeModule = activeModuleId ? getModule(activeModuleId) : null;
  const exercises = activeModule
    ? exercisesForSession(activeModuleId, dailyMinutes, completedExerciseIds)
    : [];
  const variant = variantForMinutes(dailyMinutes);
  const totalDuration = exercises.reduce((sum, e) => sum + e.durationMinutes[variant], 0);
  const progress = activeModuleId ? moduleProgress(activeModuleId, completedExerciseIds) : { done: 0, total: 0 };
  const isReviewMode = activeModule && progress.done >= progress.total;
  const firstExerciseTitle = exercises[0]?.title;

  function start() {
    if (!activeModuleId) return;
    startSession({ moduleId: activeModuleId, dailyMinutes, completedExerciseIds });
    navigate('/session');
  }

  return (
    <div className="space-y-5">
      <Link to="/" className="text-xs text-ink-400 hover:text-ink-200">‹ Switch instrument</Link>
      <header className="flex items-center justify-between">
        <div>
          <p className="label">Today · 🎸 Guitar</p>
          <h1 className="text-2xl font-display">{DAY_LABELS[dayOfWeek()]}, let's play</h1>
        </div>
        <StreakBadge streak={currentStreak} />
      </header>

      <Card>
        <XPBar totalXP={totalXP} />
      </Card>

      <Card>
        <div className="flex items-baseline justify-between">
          <p className="label">Today's session</p>
          {!practiceToday && <span className="chip">Rest day</span>}
        </div>
        {activeModule ? (
          <>
            <h2 className="text-xl font-display mt-2">{activeModule.title}</h2>
            <p className="text-sm text-ink-300 mt-1">
              {isReviewMode
                ? 'All exercises done — one more pass to lock it in, then the next module.'
                : `Up next: ${firstExerciseTitle}`}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-ink-300">Module progress</span>
              <span className="font-display text-ink-100">{progress.done} / {progress.total}</span>
              <div className="flex-1 h-1.5 rounded-full bg-ink-700 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-[width] duration-500"
                  style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="chip">{exercises.length} today</span>
              <span className="chip">~{totalDuration} min</span>
              <span className="chip">{variant}</span>
              {isReviewMode && <span className="chip bg-amber-400 text-ink-900">Review</span>}
            </div>
            <div className="mt-5">
              {practiceToday ? (
                <Button onClick={start} className="w-full">Start practice</Button>
              ) : (
                <Button variant="secondary" onClick={start} className="w-full">
                  Practice anyway
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="mt-3">
            <h2 className="text-xl font-display">All modules complete 🎉</h2>
            <p className="text-sm text-ink-300 mt-1">
              You've finished every pre-built module. The Module Builder will unlock soon.
            </p>
            <Link to="/progress" className="btn-secondary mt-4 w-full inline-flex justify-center">
              View progress
            </Link>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="label">Weekly plan</p>
            <p className="text-sm text-ink-200 mt-1">
              {plan?.scheduledSessions?.length || 0} sessions scheduled this week
            </p>
          </div>
          <Link to="/plan" className="btn-ghost px-3 py-2 min-h-0">Edit</Link>
        </div>
        <div className="grid grid-cols-7 gap-1 mt-4">
          {['mon','tue','wed','thu','fri','sat','sun'].map((d) => {
            const scheduled = plan?.scheduledSessions?.some((s) => s.day === d);
            const isToday = d === dayOfWeek();
            return (
              <div
                key={d}
                className={`text-center text-xs py-2 rounded-lg ${
                  scheduled
                    ? isToday ? 'bg-amber-400 text-ink-900 font-bold' : 'bg-amber-400/20 text-amber-200'
                    : 'bg-ink-700 text-ink-400'
                }`}
              >
                {DAY_LABELS[d][0]}
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <p className="label">Modules</p>
        <div className="mt-3 space-y-2">
          {MODULES.slice(0, 4).map((m, i) => (
            <Link
              key={m.moduleId}
              to="/modules"
              className="flex items-center justify-between p-3 rounded-xl bg-ink-800 hover:bg-ink-700 transition"
            >
              <div>
                <div className="text-xs text-ink-400">Module {i + 1}</div>
                <div className="font-semibold">{m.title}</div>
              </div>
              <div className="text-ink-300">›</div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
