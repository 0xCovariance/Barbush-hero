import { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore.js';
import { listSessions } from '../services/sessionService.js';
import { MODULES, getModule } from '../data/modules.js';
import { Card } from '../components/ui/Card.jsx';
import { XPBar } from '../components/gamification/XPBar.jsx';
import { streakMilestone } from '../services/streakService.js';
import { isLysiAvailable } from '../services/lysiService.js';

export function Progress() {
  const totalXP = useUserStore((s) => s.totalXP);
  const currentStreak = useUserStore((s) => s.currentStreak);
  const longestStreak = useUserStore((s) => s.longestStreak);
  const completedModuleIds = useUserStore((s) => s.completedModuleIds);
  const earnedBadgeIds = useUserStore((s) => s.earnedBadgeIds);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    listSessions().then((rows) => {
      rows.sort((a, b) => (a.date < b.date ? 1 : -1));
      setSessions(rows);
    });
  }, []);

  const milestone = streakMilestone(currentStreak);

  return (
    <div className="space-y-5">
      <header>
        <p className="label">Progress</p>
        <h1 className="text-2xl font-display">Your journey</h1>
      </header>

      <Card>
        <XPBar totalXP={totalXP} />
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="label">Current streak</p>
            <div className="font-display text-4xl mt-1">{currentStreak}</div>
            {milestone && <p className="text-xs text-amber-200 mt-1">{milestone.icon} {milestone.label}</p>}
          </div>
          <div className="text-right">
            <p className="label">Longest</p>
            <div className="font-display text-2xl mt-1">{longestStreak}</div>
          </div>
        </div>
      </Card>

      <Card>
        <p className="label">Modules</p>
        <div className="mt-3 space-y-2">
          {MODULES.map((m) => {
            const done = completedModuleIds.includes(m.moduleId);
            return (
              <div key={m.moduleId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{done ? '✅' : '⚪'}</span>
                  <span className="text-sm">{m.title}</span>
                </div>
                {done && <span className="chip bg-amber-400 text-ink-900">Done</span>}
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <p className="label">Badges</p>
        {earnedBadgeIds.length === 0 ? (
          <p className="text-sm text-ink-300 mt-2">Complete a module to earn your first badge.</p>
        ) : (
          <div className="flex flex-wrap gap-3 mt-3">
            {earnedBadgeIds.map((id) => {
              const m = getModule(id);
              return (
                <div key={id} className="card-tight flex items-center gap-2">
                  <span className="text-2xl">🏅</span>
                  <span className="text-sm">{m?.title}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <p className="label">Recent sessions</p>
        {sessions.length === 0 ? (
          <p className="text-sm text-ink-300 mt-2">No sessions yet. Start your first practice.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {sessions.slice(0, 10).map((s) => {
              const m = getModule(s.moduleId);
              return (
                <div key={s.sessionId} className="flex items-center justify-between text-sm">
                  <div>
                    <div>{m?.title || 'Practice'}</div>
                    <div className="text-xs text-ink-400">{s.date} · {s.durationVariant}</div>
                  </div>
                  <div className="text-amber-300 font-semibold">+{s.totalXP}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Phase 3 placeholder. Lysi will render insights here. */}
      {isLysiAvailable() && (
        <Card>
          <p className="label">Lysi insights</p>
          <p className="text-sm text-ink-300 mt-2">Coming soon.</p>
        </Card>
      )}
    </div>
  );
}
