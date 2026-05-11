import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore.js';
import { buildPlan } from '../services/planService.js';
import { requestPermission, scheduleReminder, permissionState } from '../services/notificationService.js';
import { DAYS, DAY_LABELS, startOfWeekKey } from '../utils/dateUtils.js';
import { getModule, MODULES } from '../data/modules.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';

const GOALS = [
  { id: 'consistency', label: 'Build consistency', emoji: '📅', blurb: 'Show up every day, even briefly.' },
  { id: 'skill', label: 'Learn the pentatonic scale', emoji: '🎯', blurb: 'Master the five boxes across the neck.' },
  { id: 'creative', label: 'Improvise freely', emoji: '🎼', blurb: 'Solo confidently over any blues.' },
];

const MINUTES = [10, 20, 30, 45, 60];

export function Onboarding() {
  const navigate = useNavigate();
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const savePlan = useUserStore((s) => s.savePlan);
  const completedModuleIds = useUserStore((s) => s.completedModuleIds);

  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState(['consistency']);
  const [dailyMinutes, setDailyMinutes] = useState(20);
  const [practiceDays, setPracticeDays] = useState(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [reminderTime, setReminderTime] = useState('18:30');
  const [showInstall, setShowInstall] = useState(false);

  function toggleDay(d) {
    setPracticeDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  }

  function toggleGoal(id) {
    setGoals((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  async function finish() {
    completeOnboarding({ goals, dailyMinutes, practiceDays, reminderTime });
    const plan = buildPlan({ practiceDays, dailyMinutes, completedModuleIds });
    savePlan({
      planId: crypto.randomUUID(),
      weekStartDate: startOfWeekKey(),
      ...plan,
      calendarEventIds: [],
    });

    const perm = await requestPermission();
    if (perm === 'granted') {
      const mod = getModule(plan.moduleId) || MODULES[0];
      scheduleReminder({
        reminderTime,
        moduleTitle: mod?.title,
        practiceToday: true,
      });
    }
    setShowInstall(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-md animate-fadeIn">
        <header className="mb-6 text-center">
          <div className="text-5xl mb-3">🎸</div>
          <h1 className="text-3xl font-display">Barbush Hero</h1>
          <p className="text-ink-300 text-sm mt-1">Become the guitar hero you were born to be.</p>
        </header>

        {step === 0 && (
          <Step title="What are your goals?" subtitle="Pick one or more — we'll shape your weekly plan around them.">
            <div className="flex flex-col gap-3">
              {GOALS.map((g) => {
                const selected = goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    aria-pressed={selected}
                    className={`text-left card-tight transition ${selected ? 'border-amber-400 ring-2 ring-amber-400/40' : 'hover:border-ink-500'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{g.emoji}</span>
                      <div className="flex-1">
                        <div className="font-semibold">{g.label}</div>
                        <div className="text-xs text-ink-300">{g.blurb}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs ${selected ? 'border-amber-400 bg-amber-400 text-ink-900' : 'border-ink-500'}`}>
                        {selected ? '✓' : ''}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-ink-400 mt-3">{goals.length || 0} selected</p>
            <NextBar onNext={() => setStep(1)} nextDisabled={goals.length === 0} />
          </Step>
        )}

        {step === 1 && (
          <Step title="How much time per day?" subtitle="You can change this anytime.">
            <div className="grid grid-cols-3 gap-3">
              {MINUTES.map((m) => (
                <button
                  key={m}
                  onClick={() => setDailyMinutes(m)}
                  className={`card-tight text-center transition ${dailyMinutes === m ? 'border-amber-400 ring-2 ring-amber-400/40' : 'hover:border-ink-500'}`}
                >
                  <div className="font-display text-2xl">{m}</div>
                  <div className="label">min</div>
                </button>
              ))}
            </div>
            <NextBar onBack={() => setStep(0)} onNext={() => setStep(2)} />
          </Step>
        )}

        {step === 2 && (
          <Step title="Which days will you practice?" subtitle="Tap to toggle.">
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
            <p className="text-xs text-ink-400 mt-3">{practiceDays.length || 0} days selected</p>
            <NextBar
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              nextDisabled={practiceDays.length === 0}
            />
          </Step>
        )}

        {step === 3 && (
          <Step title="When should we remind you?" subtitle="A nudge at the right time goes a long way.">
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-4 text-2xl font-display text-center focus:outline-none focus:border-amber-400"
            />
            <p className="text-xs text-ink-400 mt-3">
              {permissionState() === 'unsupported'
                ? "Your browser doesn't support notifications — that's OK, you can still practice."
                : 'We\'ll ask for notification permission next.'}
            </p>
            <NextBar onBack={() => setStep(2)} onNext={finish} nextLabel="Finish" />
          </Step>
        )}

        {showInstall && <InstallPrompt onDone={() => navigate('/', { replace: true })} />}
      </div>
    </div>
  );
}

function Step({ title, subtitle, children }) {
  return (
    <Card className="animate-fadeIn">
      <h2 className="text-xl font-display mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-ink-300 mb-4">{subtitle}</p>}
      {children}
    </Card>
  );
}

function NextBar({ onBack, onNext, nextDisabled, nextLabel = 'Continue' }) {
  return (
    <div className="flex gap-3 mt-6">
      {onBack && <Button variant="ghost" onClick={onBack}>Back</Button>}
      <div className="flex-1" />
      <Button onClick={onNext} disabled={nextDisabled} className={nextDisabled ? 'opacity-40' : ''}>
        {nextLabel}
      </Button>
    </div>
  );
}

function InstallPrompt({ onDone }) {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e) {
      e.preventDefault();
      setDeferred(e);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  async function install() {
    if (!deferred) {
      setInstalled(true);
      return;
    }
    deferred.prompt();
    await deferred.userChoice;
    setInstalled(true);
  }

  return (
    <div className="fixed inset-0 bg-ink-900/80 z-40 flex items-end sm:items-center justify-center p-5 animate-fadeIn">
      <Card className="w-full max-w-md">
        <div className="text-center">
          <div className="text-4xl mb-2">📱</div>
          <h3 className="font-display text-xl">Add Barbush Hero to your home screen</h3>
          <p className="text-sm text-ink-300 mt-2">
            Install it like an app so it's there every time you pick up the guitar.
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          {deferred && !installed && <Button onClick={install}>Install</Button>}
          {!deferred && (
            <div className="text-xs text-ink-300 text-center">
              On iOS: tap <strong>Share</strong> → <strong>Add to Home Screen</strong>.<br />
              On Android: open the browser menu → <strong>Install app</strong>.
            </div>
          )}
          <Button variant="ghost" onClick={onDone}>{installed || !deferred ? 'Continue' : 'Skip for now'}</Button>
        </div>
      </Card>
    </div>
  );
}
