import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MODULES } from '../data/modules.js';
import { useUserStore } from '../store/userStore.js';
import { useSessionStore } from '../store/sessionStore.js';
import { isModuleUnlocked, variantForMinutes } from '../services/planService.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';

export function ModulesLibrary() {
  const navigate = useNavigate();
  const completedModuleIds = useUserStore((s) => s.completedModuleIds);
  const completedExerciseIds = useUserStore((s) => s.completedExerciseIds);
  const dailyMinutes = useUserStore((s) => s.dailyMinutes);
  const startSession = useSessionStore((s) => s.startSession);
  const [expanded, setExpanded] = useState(null);
  const variant = variantForMinutes(dailyMinutes);

  function start(moduleId) {
    startSession({ moduleId, dailyMinutes, completedExerciseIds });
    navigate('/session');
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-display">Modules</h1>
        <p className="text-sm text-ink-300">Pentatonic scale, four steps. Linear unlock.</p>
      </header>

      <div className="space-y-3">
        {MODULES.map((m, i) => {
          const unlocked = isModuleUnlocked(m.moduleId, completedModuleIds);
          const done = completedModuleIds.includes(m.moduleId);
          const open = expanded === m.moduleId;
          return (
            <Card key={m.moduleId} className={!unlocked ? 'opacity-60' : ''}>
              <button
                onClick={() => setExpanded(open ? null : m.moduleId)}
                className="w-full text-left flex items-start gap-3"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-lg shrink-0
                  ${done ? 'bg-amber-400 text-ink-900' : unlocked ? 'bg-ink-600' : 'bg-ink-700'}`}>
                  {done ? '✓' : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display text-lg">{m.title}</h2>
                    {done && <span className="chip bg-amber-400 text-ink-900">Done</span>}
                    {!unlocked && <span className="chip">🔒 Locked</span>}
                  </div>
                  <p className="text-sm text-ink-300 mt-1">{m.description}</p>
                </div>
                <div className="text-ink-300">{open ? '▾' : '›'}</div>
              </button>
              {open && (
                <div className="mt-4 pt-4 border-t border-ink-600 space-y-2 animate-fadeIn">
                  {m.exercises.map((e, idx) => (
                    <div key={e.exerciseId} className="flex items-start gap-3">
                      <div className="text-xs text-ink-400 mt-1 w-5">{idx + 1}.</div>
                      <div className="flex-1">
                        <div className="font-semibold">{e.title}</div>
                        <div className="text-xs text-ink-300">{e.instructions[variant]}</div>
                        <div className="text-xs text-ink-400 mt-1">
                          {e.durationMinutes[variant]} min · {e.xpReward[variant]} XP
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={() => start(m.moduleId)}
                    disabled={!unlocked}
                    className={`w-full mt-4 ${!unlocked ? 'opacity-40' : ''}`}
                  >
                    {done ? 'Practice again' : 'Start module'}
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
