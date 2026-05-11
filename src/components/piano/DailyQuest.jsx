import { usePianoStore, DAILY_QUEST_GOAL, todayKey } from '../../store/pianoStore.js';

export function DailyQuest() {
  const member = usePianoStore((s) => s.activeMember());
  if (!member) return null;

  const today = todayKey();
  const progress = member.dailyQuestDate === today ? member.dailyQuestProgress : 0;
  const done = progress >= DAILY_QUEST_GOAL;

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-400/20 to-ink-700 border border-amber-400/30">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="label text-amber-300">Today's quest</p>
          <p className="text-sm text-ink-100 mt-1">
            {done ? '🎉 Quest complete! +20 XP bonus earned.' : `Play ${DAILY_QUEST_GOAL} songs today`}
          </p>
        </div>
        <div className="text-2xl">{done ? '🏆' : '🎯'}</div>
      </div>
      <div className="flex gap-1 mt-2">
        {Array.from({ length: DAILY_QUEST_GOAL }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-full ${i < progress ? 'bg-amber-400' : 'bg-ink-600'}`}
          />
        ))}
      </div>
    </div>
  );
}
