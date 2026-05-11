import { useUserStore } from '../store/userStore.js';
import { activeModuleId, isPracticeToday } from '../services/planService.js';
import { dayOfWeek } from '../utils/dateUtils.js';

export function usePlan() {
  const plan = useUserStore((s) => s.plan);
  const completedModuleIds = useUserStore((s) => s.completedModuleIds);
  const dailyMinutes = useUserStore((s) => s.dailyMinutes);
  const activeId = activeModuleId(completedModuleIds);
  return {
    plan,
    activeModuleId: activeId,
    practiceToday: isPracticeToday(plan, dayOfWeek()),
    dailyMinutes,
  };
}
