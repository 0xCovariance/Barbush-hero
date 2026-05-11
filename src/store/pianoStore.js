import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const AVATARS = ['🐶', '🦁', '🐼', '🐯', '🐸', '🦊', '🐵', '🐰', '🐨', '🐧', '🦄', '🐙'];
const COLORS = ['#E8843A', '#5BC0EB', '#9BC53D', '#E55934', '#FA7921', '#C589E8', '#FFD23F', '#06D6A0'];

function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

function levelForXP(xp) {
  // Level n requires sum of n*50 XP. Cheap, kid-friendly curve.
  let level = 1;
  let needed = 50;
  let acc = 0;
  while (xp >= acc + needed) {
    acc += needed;
    level += 1;
    needed = level * 50;
  }
  return level;
}

function xpProgress(xp) {
  let level = 1;
  let needed = 50;
  let acc = 0;
  while (xp >= acc + needed) {
    acc += needed;
    level += 1;
    needed = level * 50;
  }
  return { level, currentLevelXP: xp - acc, nextLevelXP: needed };
}

function newMember({ name, avatar, color }) {
  return {
    memberId: crypto.randomUUID(),
    name: name.trim() || 'Player',
    avatar: avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
    color: color || COLORS[Math.floor(Math.random() * COLORS.length)],
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedDate: null,
    songStars: {},       // songId -> 0-3
    songBestScores: {},  // songId -> 0-100
    songPlays: {},       // songId -> count
    badgeIds: [],        // strings like 'first-song', 'streak-7', 'song-twinkle'
    dailyQuestDate: null,
    dailyQuestProgress: 0,
    createdAt: new Date().toISOString(),
  };
}

const DAILY_QUEST_GOAL = 3; // play 3 songs in a day = daily quest done

export const usePianoStore = create(
  persist(
    (set, get) => ({
      members: [],
      activeMemberId: null,
      familyName: 'Our Family',

      addMember({ name, avatar, color }) {
        const m = newMember({ name, avatar, color });
        set((s) => ({
          members: [...s.members, m],
          activeMemberId: s.activeMemberId || m.memberId,
        }));
        return m.memberId;
      },

      removeMember(memberId) {
        set((s) => {
          const members = s.members.filter((m) => m.memberId !== memberId);
          const activeMemberId = s.activeMemberId === memberId
            ? (members[0]?.memberId || null)
            : s.activeMemberId;
          return { members, activeMemberId };
        });
      },

      renameMember(memberId, name) {
        set((s) => ({
          members: s.members.map((m) => (m.memberId === memberId ? { ...m, name } : m)),
        }));
      },

      setActiveMember(memberId) {
        set({ activeMemberId: memberId });
      },

      setFamilyName(name) {
        set({ familyName: name });
      },

      activeMember() {
        const { members, activeMemberId } = get();
        return members.find((m) => m.memberId === activeMemberId) || null;
      },

      recordSongResult({ songId, score, stars }) {
        const state = get();
        const memberId = state.activeMemberId;
        if (!memberId) return null;

        const today = todayKey();
        const yest = yesterdayKey();

        set((s) => ({
          members: s.members.map((m) => {
            if (m.memberId !== memberId) return m;

            // Streak: increment if first play today and last play was yesterday or today;
            // reset to 1 if first play today after a gap.
            let currentStreak = m.currentStreak;
            if (m.lastPlayedDate !== today) {
              if (m.lastPlayedDate === yest) currentStreak += 1;
              else currentStreak = 1;
            }
            const longestStreak = Math.max(m.longestStreak, currentStreak);

            const prevStars = m.songStars[songId] || 0;
            const newStars = Math.max(prevStars, stars);
            const prevBest = m.songBestScores[songId] || 0;
            const newBest = Math.max(prevBest, score);
            const plays = (m.songPlays[songId] || 0) + 1;

            // XP: 10 per star earned this run + 5 bonus if first-ever play of song
            // + 5 daily bonus if first play of day. Capped to keep it kid-friendly.
            const firstPlayOfSong = (m.songPlays[songId] || 0) === 0;
            const firstOfDay = m.lastPlayedDate !== today;
            const xpEarned = (stars * 10) + (firstPlayOfSong ? 5 : 0) + (firstOfDay ? 5 : 0);

            // Daily quest tracking
            let dailyQuestProgress = m.dailyQuestProgress || 0;
            let dailyQuestDate = m.dailyQuestDate;
            if (dailyQuestDate !== today) {
              dailyQuestProgress = 0;
              dailyQuestDate = today;
            }
            dailyQuestProgress = Math.min(DAILY_QUEST_GOAL, dailyQuestProgress + 1);
            const justFinishedQuest = dailyQuestProgress === DAILY_QUEST_GOAL
              && (m.dailyQuestProgress || 0) < DAILY_QUEST_GOAL;
            const questBonus = justFinishedQuest ? 20 : 0;

            // Badges
            const badges = new Set(m.badgeIds);
            if (firstPlayOfSong && plays === 1 && Object.keys(m.songPlays).length === 0) {
              badges.add('first-song');
            }
            if (newStars === 3) badges.add(`song-${songId}`);
            if (currentStreak >= 7) badges.add('streak-7');
            if (currentStreak >= 30) badges.add('streak-30');
            if (justFinishedQuest) badges.add('daily-quest');

            return {
              ...m,
              xp: m.xp + xpEarned + questBonus,
              currentStreak,
              longestStreak,
              lastPlayedDate: today,
              songStars: { ...m.songStars, [songId]: newStars },
              songBestScores: { ...m.songBestScores, [songId]: newBest },
              songPlays: { ...m.songPlays, [songId]: plays },
              badgeIds: [...badges],
              dailyQuestDate,
              dailyQuestProgress,
            };
          }),
        }));

        const updated = get().members.find((m) => m.memberId === memberId);
        return {
          xpEarned: (updated.xp - (state.members.find((m) => m.memberId === memberId)?.xp || 0)),
          streak: updated.currentStreak,
          stars: updated.songStars[songId],
          newBest: updated.songBestScores[songId],
        };
      },

      resetMemberProgress(memberId) {
        set((s) => ({
          members: s.members.map((m) =>
            m.memberId === memberId
              ? {
                  ...m,
                  xp: 0,
                  currentStreak: 0,
                  longestStreak: 0,
                  lastPlayedDate: null,
                  songStars: {},
                  songBestScores: {},
                  songPlays: {},
                  badgeIds: [],
                  dailyQuestDate: null,
                  dailyQuestProgress: 0,
                }
              : m,
          ),
        }));
      },

      resetAll() {
        set({ members: [], activeMemberId: null, familyName: 'Our Family' });
      },
    }),
    {
      name: 'barbush-piano',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export { AVATARS, COLORS, todayKey, levelForXP, xpProgress, DAILY_QUEST_GOAL };
