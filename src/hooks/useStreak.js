import { useUserStore } from '../store/userStore.js';
import { streakMilestone } from '../services/streakService.js';

export function useStreak() {
  const currentStreak = useUserStore((s) => s.currentStreak);
  const longestStreak = useUserStore((s) => s.longestStreak);
  return { currentStreak, longestStreak, milestone: streakMilestone(currentStreak) };
}
