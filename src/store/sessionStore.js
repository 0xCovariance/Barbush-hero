import { create } from 'zustand';
import { exercisesForSession, variantForMinutes } from '../services/planService.js';
import { recordSession } from '../services/sessionService.js';
import { getModule } from '../data/modules.js';
import { todayKey } from '../utils/dateUtils.js';

// Ephemeral state for the currently-running practice session.
// Not persisted: if the app reloads mid-session, the session is dropped.
export const useSessionStore = create((set, get) => ({
  active: null,   // { moduleId, variant, exercises[], index, results[], startedAt }
  lastSummary: null,

  startSession({ moduleId, dailyMinutes, completedExerciseIds = [] }) {
    const exercises = exercisesForSession(moduleId, dailyMinutes, completedExerciseIds);
    const variant = variantForMinutes(dailyMinutes);
    set({
      active: {
        moduleId,
        variant,
        exercises,
        index: 0,
        results: [],
        startedAt: Date.now(),
      },
      lastSummary: null,
    });
  },

  recordResult({ outcome, actualDurationSeconds }) {
    const a = get().active;
    if (!a) return;
    const ex = a.exercises[a.index];
    const results = [...a.results, {
      exerciseId: ex.exerciseId,
      outcome,
      actualDurationSeconds,
    }];
    set({ active: { ...a, results } });
  },

  advance() {
    const a = get().active;
    if (!a) return false;
    if (a.index + 1 >= a.exercises.length) return false;
    set({ active: { ...a, index: a.index + 1 } });
    return true;
  },

  async finishSession() {
    const a = get().active;
    if (!a) return null;
    const mod = getModule(a.moduleId);
    const xpEarned = a.results.reduce((sum, r, i) => {
      if (r.outcome !== 'completed') return sum;
      return sum + (a.exercises[i].xpReward[a.variant] || 0);
    }, 0);
    const completedThisSession = a.results
      .filter((r) => r.outcome === 'completed')
      .map((r) => r.exerciseId);

    const session = {
      sessionId: crypto.randomUUID(),
      moduleId: a.moduleId,
      date: todayKey(),
      durationVariant: a.variant,
      exercisesCompleted: a.results,
      totalXP: xpEarned,
      streakContributed: true,
    };
    await recordSession(session);

    const summary = {
      moduleId: a.moduleId,
      moduleTitle: mod?.title || 'Practice',
      xpEarned,
      completedExerciseIds: completedThisSession,
      results: a.results,
    };
    set({ active: null, lastSummary: summary });
    return summary;
  },

  cancelSession() {
    set({ active: null });
  },

  clearSummary() {
    set({ lastSummary: null });
  },
}));
