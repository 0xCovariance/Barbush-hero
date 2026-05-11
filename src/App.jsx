import { useEffect } from 'react';
import {
  HashRouter, Routes, Route, NavLink, Navigate, useLocation,
} from 'react-router-dom';
import { useUserStore } from './store/userStore.js';
import { Onboarding } from './screens/Onboarding.jsx';
import { Home } from './screens/Home.jsx';
import { ModulesLibrary } from './screens/ModulesLibrary.jsx';
import { WeeklyPlan } from './screens/WeeklyPlan.jsx';
import { ActiveSession } from './screens/ActiveSession.jsx';
import { Progress } from './screens/Progress.jsx';
import { Settings } from './screens/Settings.jsx';
import { ModuleBuilder } from './screens/ModuleBuilder.jsx';
import { PianoHome } from './screens/PianoHome.jsx';
import { PianoSong } from './screens/PianoSong.jsx';
import { PianoFamily } from './screens/PianoFamily.jsx';
import { LysiBubble } from './components/lysi/LysiBubble.jsx';
import { scheduleReminder, permissionState } from './services/notificationService.js';
import { activeModuleId, isPracticeToday } from './services/planService.js';
import { dayOfWeek } from './utils/dateUtils.js';
import { getModule } from './data/modules.js';

function RequireOnboarding({ children }) {
  const done = useUserStore((s) => s.onboardingComplete);
  if (!done) return <Navigate to="/welcome" replace />;
  return children;
}

function ReminderArmer() {
  const reminderTime = useUserStore((s) => s.reminderTime);
  const plan = useUserStore((s) => s.plan);
  const completedModuleIds = useUserStore((s) => s.completedModuleIds);
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);

  useEffect(() => {
    if (!onboardingComplete) return;
    if (permissionState() !== 'granted') return;
    const modId = activeModuleId(completedModuleIds);
    const mod = modId ? getModule(modId) : null;
    scheduleReminder({
      reminderTime,
      moduleTitle: mod?.title,
      practiceToday: isPracticeToday(plan, dayOfWeek()),
    });
  }, [reminderTime, plan, completedModuleIds, onboardingComplete]);

  return null;
}

const NAV = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/modules', label: 'Modules', icon: '🎼' },
  { to: '/plan', label: 'Plan', icon: '📅' },
  { to: '/progress', label: 'Stats', icon: '📈' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

function TabBar() {
  const loc = useLocation();
  if (loc.pathname === '/session' || loc.pathname === '/welcome') return null;
  if (loc.pathname.startsWith('/piano')) return null;
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-ink-900/95 backdrop-blur border-t border-ink-700 z-30">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 text-[10px] min-h-[56px] justify-center gap-1 ${
                isActive ? 'text-amber-400' : 'text-ink-300'
              }`
            }
          >
            <span className="text-lg">{n.icon}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        {children}
      </div>
      <TabBar />
      <LysiBubble />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ReminderArmer />
      <Routes>
        <Route path="/welcome" element={<Onboarding />} />
        <Route
          path="/"
          element={
            <RequireOnboarding>
              <Shell><Home /></Shell>
            </RequireOnboarding>
          }
        />
        <Route
          path="/modules"
          element={
            <RequireOnboarding>
              <Shell><ModulesLibrary /></Shell>
            </RequireOnboarding>
          }
        />
        <Route
          path="/plan"
          element={
            <RequireOnboarding>
              <Shell><WeeklyPlan /></Shell>
            </RequireOnboarding>
          }
        />
        <Route
          path="/session"
          element={
            <RequireOnboarding>
              <Shell><ActiveSession /></Shell>
            </RequireOnboarding>
          }
        />
        <Route
          path="/progress"
          element={
            <RequireOnboarding>
              <Shell><Progress /></Shell>
            </RequireOnboarding>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireOnboarding>
              <Shell><Settings /></Shell>
            </RequireOnboarding>
          }
        />
        <Route
          path="/module-builder"
          element={
            <RequireOnboarding>
              <Shell><ModuleBuilder /></Shell>
            </RequireOnboarding>
          }
        />
        <Route
          path="/piano"
          element={
            <RequireOnboarding>
              <Shell><PianoHome /></Shell>
            </RequireOnboarding>
          }
        />
        <Route
          path="/piano/family"
          element={
            <RequireOnboarding>
              <Shell><PianoFamily /></Shell>
            </RequireOnboarding>
          }
        />
        <Route
          path="/piano/song/:songId"
          element={
            <RequireOnboarding>
              <Shell><PianoSong /></Shell>
            </RequireOnboarding>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
