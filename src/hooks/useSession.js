import { useSessionStore } from '../store/sessionStore.js';

export function useSession() {
  const active = useSessionStore((s) => s.active);
  const lastSummary = useSessionStore((s) => s.lastSummary);
  return { active, lastSummary };
}
