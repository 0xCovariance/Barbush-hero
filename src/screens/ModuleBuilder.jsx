// Phase 2 stub. Gated behind isModuleBuilderUnlocked(). Renders a "Coming Soon"
// state in Phase 1 even when route is hit directly.
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card.jsx';
import { useUserStore } from '../store/userStore.js';

export function isModuleBuilderUnlocked(completedModuleIds = []) {
  // Phase 2: return completedModuleIds.length >= 4;
  return false;
}

export function ModuleBuilder() {
  const completed = useUserStore((s) => s.completedModuleIds);
  const unlocked = isModuleBuilderUnlocked(completed);
  return (
    <div className="space-y-5">
      <header>
        <p className="label">Coming soon</p>
        <h1 className="text-2xl font-display">Module Builder</h1>
      </header>
      <Card>
        <p className="text-sm text-ink-200">
          Build your own practice modules. {unlocked ? 'Unlocked — Phase 2 will activate this screen.' : `Finish all 4 pre-built modules first (${completed.length}/4).`}
        </p>
        <Link to="/guitar" className="btn-secondary w-full mt-4 inline-flex justify-center">
          Back home
        </Link>
      </Card>
    </div>
  );
}
