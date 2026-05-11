import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { levelForXP } from '../utils/xpUtils.js';
import { applyCompletionToStreak } from '../services/streakService.js';
import { MODULES, getModule } from '../data/modules.js';

const initialUser = {
  userId: null,
  createdAt: null,
  onboardingComplete: false,
  goals: [],                   // array of 'consistency' | 'skill' | 'creative'
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
  completedExerciseIds: [],    // per-exercise "Got it" history across all sessions
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

      recordSessionCompletion({ xpEarned, moduleId, completedExerciseIds = [], todayKey }) {
        const state = get();
        const firstOfDay = state.lastBonusDate !== todayKey;
        const dailyBonus = firstOfDay ? 5 : 0;

        // Merge the newly-completed exercises into the cumulative set.
        const cumulative = new Set(state.completedExerciseIds);
        completedExerciseIds.forEach((id) => cumulative.add(id));
        const cumulativeArr = [...cumulative];

        // Did this session push the user across the module-completion line?
        const mod = getModule(moduleId);
        const wasComplete = state.completedModuleIds.includes(moduleId);
        const allDone = mod
          ? mod.exercises.every((e) => cumulative.has(e.exerciseId))
          : false;
        const finishedModule = allDone && !wasComplete;
        const moduleBonus = finishedModule ? 50 : 0;

        const total = xpEarned + dailyBonus + moduleBonus;

        const streakNext = applyCompletionToStreak(state, todayKey);
        const reached7 = streakNext.currentStreak === 7 && state.currentStreak !== 7;
        const streakBonus = reached7 ? 25 : 0;

        const newTotal = state.totalXP + total + streakBonus;
        const completedModules = finishedModule
          ? [...state.completedModuleIds, moduleId]
          : state.completedModuleIds;
        const badges = finishedModule && !state.earnedBadgeIds.includes(moduleId)
          ? [...state.earnedBadgeIds, moduleId]
          : state.earnedBadgeIds;

        set({
          ...streakNext,
          totalXP: newTotal,
          level: levelForXP(newTotal),
          completedExerciseIds: cumulativeArr,
          completedModuleIds: completedModules,
          earnedBadgeIds: badges,
          lastBonusDate: todayKey,
        });

        return { dailyBonus, moduleBonus, streakBonus, totalAwarded: total + streakBonus, finishedModule };
      },

      resetAll() {
        set({ ...initialUser });
      },
    }),
    {
      name: 'barbush-hero-user',
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persisted, version) => {
        if (persisted && version < 2) {
          if (typeof persisted.goal === 'string' && !Array.isArray(persisted.goals)) {
            persisted.goals = persisted.goal ? [persisted.goal] : [];
          }
          delete persisted.goal;
        }
        if (persisted && version < 3) {
          // Seed completedExerciseIds from already-completed modules: every
          // exercise inside a completed module is treated as completed.
          if (!Array.isArray(persisted.completedExerciseIds)) {
            const set = new Set();
            (persisted.completedModuleIds || []).forEach((modId) => {
              const m = MODULES.find((mm) => mm.moduleId === modId);
              if (m) m.exercises.forEach((e) => set.add(e.exerciseId));
            });
            persisted.completedExerciseIds = [...set];
          }
        }
        return persisted;
      },
    },
  ),
);
