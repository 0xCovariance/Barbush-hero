import { usePianoStore, xpProgress } from '../../store/pianoStore.js';
import { StarRating } from './StarRating.jsx';

export function FamilyLeaderboard({ compact = false }) {
  const members = usePianoStore((s) => s.members);

  if (members.length === 0) {
    return (
      <div className="text-sm text-ink-300">
        No players yet. Add family members to start the leaderboard.
      </div>
    );
  }

  const ranked = [...members].sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    return b.currentStreak - a.currentStreak;
  });

  return (
    <ol className="space-y-2">
      {ranked.map((m, idx) => {
        const totalStars = Object.values(m.songStars).reduce((a, s) => a + s, 0);
        const { level } = xpProgress(m.xp);
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
        return (
          <li
            key={m.memberId}
            className="flex items-center gap-3 p-3 rounded-xl bg-ink-700/60 border border-ink-600"
          >
            <div className="w-8 text-center font-display text-lg">{medal}</div>
            <div className="text-2xl" aria-hidden>{m.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{m.name}</div>
              {!compact && (
                <div className="text-xs text-ink-300 flex items-center gap-2">
                  <span>Lvl {level}</span>
                  <span>·</span>
                  <span>🔥 {m.currentStreak}d</span>
                  <span>·</span>
                  <StarRating value={Math.min(3, Math.round(totalStars / Math.max(1, Object.keys(m.songStars).length)))} />
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="font-display text-lg text-amber-300">{m.xp}</div>
              <div className="text-[10px] uppercase tracking-wider text-ink-400">XP</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
