import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore.js';
import { buildPlan, variantForMinutes, exercisesForSession } from '../services/planService.js';
import { DAYS, DAY_LABELS, startOfWeekKey } from '../utils/dateUtils.js';
import { getModule } from '../data/modules.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { addEvent as calendarAddEvent } from '../services/calendarService.js';

const MINUTES = [10, 20, 30, 45, 60];

export function WeeklyPlan() {
  const navigate = useNavigate();
  const user = useUserStore();
  const [dailyMinutes, setDailyMinutes] = useState(user.dailyMinutes);
  const [practiceDays, setPracticeDays] = useState(user.practiceDays);
  const [step, setStep] = useState(0);

  const preview = buildPlan({
    practiceDays,
    dailyMinutes,
    completedModuleIds: user.completedModuleIds,
  });
  const variant = variantForMinutes(dailyMinutes);
  const previewModule = preview.moduleId ? getModule(preview.moduleId) : null;
  const previewExercises = preview.moduleId
    ? exercisesForSession(preview.moduleId, dailyMinutes)
    : [];

  function toggleDay(d) {
    setPracticeDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  }

  async function confirm() {
    user.updateSettings({ dailyMinutes, practiceDays });
    user.savePlan({
      planId: crypto.randomUUID(),
      weekStartDate: startOfWeekKey(),
      ...preview,
      calendarEventIds: [],
    });
    // Phase 2 hook — calendar integration. Returns null in Phase 1.
    await calendarAddEvent();
    navigate('/');
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="label">Plan</p>
          <h1 className="text-2xl font-display">Weekly plan</h1>
        </div>
        <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
      </header>

      {step === 0 && (
        <Card>
          <h2 className="font-display text-lg">Daily time</h2>
          <p className="text-sm text-ink-300 mb-3">How long per practice day?</p>
          <div className="grid grid-cols-3 gap-2">
            {MINUTES.map((m) => (
              <button
                key={m}
                onClick={() => setDailyMinutes(m)}
                className={`card-tight text-center transition ${dailyMinutes === m ? 'border-amber-400 ring-2 ring-amber-400/40' : ''}`}
              >
                <div className="font-display text-2xl">{m}</div>
                <div className="label">min</div>
              </button>
            ))}
          </div>
          <Button className="w-full mt-5" onClick={() => setStep(1)}>Next</Button>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <h2 className="font-display text-lg">Practice days</h2>
          <p className="text-sm text-ink-300 mb-3">Pick which days you'll show up.</p>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((d) => {
              const active = practiceDays.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`py-3 rounded-xl font-semibold transition ${active ? 'bg-amber-400 text-ink-900' : 'bg-ink-700 text-ink-200 border border-ink-600'}`}
                >
                  {DAY_LABELS[d][0]}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 mt-5">
            <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
            <div className="flex-1" />
            <Button onClick={() => setStep(2)} disabled={practiceDays.length === 0}>
              Preview
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h2 className="font-display text-lg">Preview</h2>
          <p className="text-sm text-ink-300 mb-3">Here's your week.</p>

          {previewModule ? (
            <>
              <div className="rounded-xl bg-ink-800 p-4">
                <div className="label">Active module</div>
                <div className="font-display text-lg mt-1">{previewModule.title}</div>
                <div className="text-xs text-ink-300 mt-1">
                  {previewExercises.length} exercises · {variant} variant
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mt-4">
                {DAYS.map((d) => {
                  const scheduled = practiceDays.includes(d);
                  return (
                    <div
                      key={d}
                      className={`text-center text-xs py-3 rounded-lg ${scheduled ? 'bg-amber-400/20 text-amber-200' : 'bg-ink-700 text-ink-400'}`}
                    >
                      <div className="font-semibold">{DAY_LABELS[d][0]}</div>
                      {scheduled && <div className="text-[10px] mt-1">{dailyMinutes}m</div>}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-300">You've finished all modules — Module Builder unlocks soon.</p>
          )}

          <div className="flex gap-2 mt-5">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <div className="flex-1" />
            <Button onClick={confirm}>Confirm plan</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
