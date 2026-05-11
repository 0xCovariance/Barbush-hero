import { Link } from 'react-router-dom';
import { SONGS, SONG_CATEGORIES, songsByCategory } from '../data/pianoSongs.js';
import { usePianoStore, xpProgress } from '../store/pianoStore.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { StarRating } from '../components/piano/StarRating.jsx';
import { PlayerSwitcher } from '../components/piano/PlayerSwitcher.jsx';
import { FamilyLeaderboard } from '../components/piano/FamilyLeaderboard.jsx';
import { DailyQuest } from '../components/piano/DailyQuest.jsx';

export function PianoHome() {
  const member = usePianoStore((s) => s.activeMember());
  const members = usePianoStore((s) => s.members);
  const familyName = usePianoStore((s) => s.familyName);

  const progress = member ? xpProgress(member.xp) : null;

  return (
    <div className="space-y-5 pb-6">
      <header className="flex items-center justify-between">
        <div>
          <Link to="/" className="text-xs text-ink-400 hover:text-ink-200">‹ Back</Link>
          <h1 className="text-2xl font-display mt-1">🎹 Piano Kids</h1>
          <p className="text-xs text-ink-300">{familyName}</p>
        </div>
        <Link to="/piano/family" className="btn-ghost px-3 py-2 min-h-0 text-xs">
          👨‍👩‍👧 Family
        </Link>
      </header>

      {members.length === 0 ? (
        <Card>
          <h2 className="text-lg font-display">Welcome! 🎉</h2>
          <p className="text-sm text-ink-200 mt-2">
            Add the kids (and grown-ups!) to your family. Each player gets their
            own XP, streak, and stars. Compete on the family leaderboard.
          </p>
          <Link to="/piano/family" className="mt-4 inline-block">
            <Button>+ Add players</Button>
          </Link>
        </Card>
      ) : (
        <>
          <PlayerSwitcher />

          {member && (
            <Card>
              <div className="flex items-center gap-3">
                <div className="text-4xl">{member.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-xl font-display">{member.name}</h2>
                    <span className="chip">Lvl {progress.level}</span>
                  </div>
                  <div className="text-xs text-ink-300 mt-1">
                    🔥 {member.currentStreak}d streak · ⭐ {Object.values(member.songStars).reduce((a, s) => a + s, 0)} stars · {member.xp} XP
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-ink-700 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-[width] duration-500"
                      style={{ width: `${(progress.currentLevelXP / progress.nextLevelXP) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-ink-400 mt-1">
                    {progress.currentLevelXP} / {progress.nextLevelXP} to next level
                  </div>
                </div>
              </div>
            </Card>
          )}

          <DailyQuest />
        </>
      )}

      {SONG_CATEGORIES.map((cat) => {
        const songs = songsByCategory(cat.id);
        if (songs.length === 0) return null;
        return (
          <section key={cat.id}>
            <h3 className="font-display text-lg mb-3 px-1">
              <span aria-hidden className="mr-2">{cat.emoji}</span>
              {cat.label}
            </h3>
            <div className="space-y-2">
              {songs.map((song) => {
                const stars = member?.songStars[song.songId] || 0;
                const plays = member?.songPlays[song.songId] || 0;
                return (
                  <Link
                    key={song.songId}
                    to={`/piano/song/${song.songId}`}
                    className="block p-4 rounded-2xl bg-ink-700/70 border border-ink-600 hover:bg-ink-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{song.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{song.title}</div>
                        <div className="text-xs text-ink-300 mt-0.5 truncate">
                          {song.description}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <StarRating value={stars} />
                          <span className="text-[10px] text-ink-400">
                            {'•'.repeat(song.difficulty)}{'○'.repeat(3 - song.difficulty)}
                          </span>
                          {plays > 0 && (
                            <span className="text-[10px] text-ink-400">· {plays} {plays === 1 ? 'play' : 'plays'}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-ink-300 text-xl">›</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {members.length > 0 && (
        <Card>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-display text-lg">🏆 Family Leaderboard</h3>
            <Link to="/piano/family" className="text-xs text-ink-300 hover:text-ink-100">Manage ›</Link>
          </div>
          <FamilyLeaderboard />
        </Card>
      )}
    </div>
  );
}
