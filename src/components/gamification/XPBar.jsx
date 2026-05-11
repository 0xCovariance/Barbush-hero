import { levelProgress } from '../../utils/xpUtils.js';
import { ProgressBar } from '../ui/ProgressBar.jsx';

export function XPBar({ totalXP }) {
  const { level, into, lo, hi } = levelProgress(totalXP);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎸</span>
          <span className="font-display text-lg">Level {level}</span>
        </div>
        <div className="text-xs text-ink-300">
          {totalXP - lo} / {Math.max(0, hi - lo)} XP
        </div>
      </div>
      <ProgressBar value={into} />
    </div>
  );
}
