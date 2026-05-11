import { dateKey, daysBetween, startOfWeekKey, todayKey } from '../utils/dateUtils.js';

// Update streak when a session completes today. Returns the updated fields.
// Grace: at most one missed scheduled day per ISO week is forgiven.
export function applyCompletionToStreak(user, completionDateKey = todayKey()) {
  const { lastCompletionDate, currentStreak = 0, longestStreak = 0 } = user;
  const graceWeek = user.streakGraceWeek || null;
  let streakGraceUsed = user.streakGraceUsed || false;

  // Reset grace at week boundary.
  const thisWeek = startOfWeekKey(new Date(completionDateKey + 'T00:00:00'));
  if (graceWeek !== thisWeek) {
    streakGraceUsed = false;
  }

  let newStreak = currentStreak;
  if (!lastCompletionDate) {
    newStreak = 1;
  } else if (lastCompletionDate === completionDateKey) {
    // Already counted today — no change.
    return { ...user };
  } else {
    const gap = daysBetween(lastCompletionDate, completionDateKey);
    if (gap === 1) {
      newStreak = currentStreak + 1;
    } else if (gap === 2 && !streakGraceUsed) {
      newStreak = currentStreak + 1;
      streakGraceUsed = true;
    } else {
      newStreak = 1;
    }
  }

  return {
    ...user,
    currentStreak: newStreak,
    longestStreak: Math.max(longestStreak, newStreak),
    lastCompletionDate: completionDateKey,
    streakGraceUsed,
    streakGraceWeek: thisWeek,
  };
}

export function streakMilestone(streak) {
  if (streak >= 30) return { icon: '🏆', label: '30-day legend' };
  if (streak >= 14) return { icon: '⚡', label: '14-day spark' };
  if (streak >= 7) return { icon: '🎸', label: '7-day groove' };
  if (streak >= 3) return { icon: '🔥', label: '3-day fire' };
  return null;
}
