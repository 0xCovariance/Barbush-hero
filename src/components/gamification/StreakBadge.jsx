import { streakMilestone } from '../../services/streakService.js';

export function StreakBadge({ streak, compact = false }) {
  const milestone = streakMilestone(streak);
  const icon = milestone?.icon || '🔥';
  return (
    <div className={`inline-flex items-center gap-2 ${compact ? '' : 'text-lg'}`}>
      <span className={compact ? 'text-base' : 'text-2xl'}>{icon}</span>
      <div className="leading-tight">
        <div className="font-display text-amber-200 font-semibold">{streak}</div>
        {!compact && <div className="label">day streak</div>}
      </div>
    </div>
  );
}
