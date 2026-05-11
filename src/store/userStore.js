import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { levelForXP } from '../utils/xpUtils.js';
import { applyCompletionToStreak } from '../services/streakService.js';

const initialUser = {
  userId: null,
  createdAt: null,
  onboardingComplete: false,
  goal: null,                  // 'consistency' | 'skill' | 'creative'
  dailyMinutes: 20,
  practiceDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  reminderTime: '18:30',
  level: 1,
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  streakGraceUsed: false,
  streakGraceWeek: null,
  lastCompletionDate: null,
  completedModuleIds: [],
  earnedBadgeIds: [],
  plan: null,                  // { planId, weekStartDate, scheduledSessions, calendarEventIds }
  lastBonusDate: null,         // for "first session of day" bonus
};

export const useUserStore = create(
  persist(
    (set, get) => ({
      ...initialUser,

      completeOnboarding(profile) {
        set({
          ...profile,
          userId: get().userId || crypto.randomUUID(),
          createdAt: get().createdAt || new Date().toISOString(),
          onboardingComplete: true,
        });
      },

      updateSettings(partial) {
        set((s) => ({ ...s, ...partial }));
      },

      savePlan(plan) {
        set({ plan });
      },

      awardXP(amount) {
        const total = get().totalXP + amount;
        set({ totalXP: total, level: levelForXP(total) });
      },

      recordSessionCompletion({ xpEarned, moduleId, finishedModule, todayKey }) {
        const state = get();
        const firstOfDay = state.lastBonusDate !== todayKey;
        const dailyBonus = firstOfDay ? 5 : 0;
        const moduleBonus = finishedModule ? 50 : 0;
        const total = xpEarned + dailyBonus + moduleBonus;

        const streakNext = applyCompletionToStreak(state, todayKey);
        const reached7 = streakNext.currentStreak === 7 && state.currentStreak !== 7;
        const streakBonus = reached7 ? 25 : 0;

        const newTotal = state.totalXP + total + streakBonus;
        const completed = finishedModule && !state.completedModuleIds.includes(moduleId)
          ? [...state.completedModuleIds, moduleId]
          : state.completedModuleIds;
        const badges = finishedModule && !state.earnedBadgeIds.includes(moduleId)
          ? [...state.earnedBadgeIds, moduleId]
          : state.earnedBadgeIds;

        set({
          ...streakNext,
          totalXP: newTotal,
          level: levelForXP(newTotal),
          completedModuleIds: completed,
          earnedBadgeIds: badges,
          lastBonusDate: todayKey,
        });

        return { dailyBonus, moduleBonus, streakBonus, totalAwarded: total + streakBonus };
      },

      resetAll() {
        set({ ...initialUser });
      },
    }),
    {
      name: 'barbush-hero-user',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
