import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore.js';
import { usePianoStore } from '../store/pianoStore.js';

export function ModeChooser() {
  const guitarLevel = useUserStore((s) => s.level);
  const guitarStreak = useUserStore((s) => s.currentStreak);
  const members = usePianoStore((s) => s.members);
  const familyName = usePianoStore((s) => s.familyName);

  return (
    <div className="space-y-6 pt-4">
      <header className="text-center">
        <h1 className="text-3xl font-display">What do you want to play?</h1>
        <p className="text-sm text-ink-300 mt-2">Pick your instrument to get started.</p>
      </header>

      <Link
        to="/guitar"
        className="block rounded-3xl p-6 bg-gradient-to-br from-amber-400/30 via-amber-400/10 to-ink-700 border border-amber-400/30 hover:from-amber-400/40 transition shadow-glow"
      >
        <div className="flex items-center gap-4">
          <div className="text-5xl" aria-hidden>🎸</div>
          <div className="flex-1">
            <h2 className="font-display text-2xl">Guitar</h2>
            <p className="text-xs text-ink-200 mt-1">
              Pentatonic modules · streaks · daily plan
            </p>
            <div className="text-[11px] text-ink-300 mt-2">
              Level {guitarLevel} · 🔥 {guitarStreak}-day streak
            </div>
          </div>
          <div className="text-ink-200 text-2xl">›</div>
        </div>
      </Link>

      <Link
        to="/piano"
        className="block rounded-3xl p-6 bg-gradient-to-br from-sky-400/25 via-sky-400/5 to-ink-700 border border-sky-400/30 hover:from-sky-400/40 transition"
      >
        <div className="flex items-center gap-4">
          <div className="text-5xl" aria-hidden>🎹</div>
          <div className="flex-1">
            <h2 className="font-display text-2xl">Piano Kids</h2>
            <p className="text-xs text-ink-200 mt-1">
              Songs they love · family leaderboard · daily quests
            </p>
            <div className="text-[11px] text-ink-300 mt-2">
              {members.length === 0
                ? 'Add the first family player'
                : `${familyName} · ${members.length} ${members.length === 1 ? 'player' : 'players'}`}
            </div>
          </div>
          <div className="text-ink-200 text-2xl">›</div>
        </div>
      </Link>

      <p className="text-center text-[11px] text-ink-400 pt-4">
        You can switch any time from the home screen.
      </p>
    </div>
  );
}
