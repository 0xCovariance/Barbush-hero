import { MODULES, getModule } from '../data/modules.js';
import { DAYS } from '../utils/dateUtils.js';

export function variantForMinutes(minutes) {
  if (minutes <= 10) return 'short';
  if (minutes < 45) return 'medium';
  return 'long';
}

export function exerciseCountForBudget(minutes, totalExercises) {
  if (minutes <= 10) return Math.min(2, totalExercises);
  if (minutes >= 30) return totalExercises;
  return Math.min(totalExercises, Math.max(2, Math.ceil(minutes / 6)));
}

// Find the next module the user should be working on.
// A module is "active" if it is unlocked (its prereq is in completedModuleIds)
// and it itself is not yet completed.
export function activeModuleId(completedModuleIds = []) {
  for (const m of MODULES) {
    if (completedModuleIds.includes(m.moduleId)) continue;
    if (m.prerequisiteModuleId && !completedModuleIds.includes(m.prerequisiteModuleId)) continue;
    return m.moduleId;
  }
  return null;
}

export function isModuleUnlocked(moduleId, completedModuleIds = []) {
  const m = getModule(moduleId);
  if (!m) return false;
  if (!m.prerequisiteModuleId) return true;
  return completedModuleIds.includes(m.prerequisiteModuleId);
}

// Build a weekly plan. Each scheduled day gets the user's active module
// and the variant matching their daily-minute budget.
export function buildPlan({ practiceDays, dailyMinutes, completedModuleIds = [] }) {
  const variant = variantForMinutes(dailyMinutes);
  const moduleId = activeModuleId(completedModuleIds);
  if (!moduleId) return { scheduledSessions: [], variant, moduleId: null };
  const scheduledSessions = DAYS
    .filter((d) => practiceDays.includes(d))
    .map((day) => ({ day, moduleId, durationVariant: variant }));
  return { scheduledSessions, variant, moduleId };
}

// Pick which exercises to include in a session given the budget.
export function exercisesForSession(moduleId, dailyMinutes) {
  const m = getModule(moduleId);
  if (!m) return [];
  const n = exerciseCountForBudget(dailyMinutes, m.exercises.length);
  return m.exercises.slice(0, n);
}

// True when the plan calendar includes today.
export function isPracticeToday(plan, day) {
  if (!plan || !plan.scheduledSessions) return false;
  return plan.scheduledSessions.some((s) => s.day === day);
}
