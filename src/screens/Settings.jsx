import { useState } from 'react';
import { useUserStore } from '../store/userStore.js';
import { requestPermission, scheduleReminder, permissionState } from '../services/notificationService.js';
import { getModule } from '../data/modules.js';
import { activeModuleId, isPracticeToday } from '../services/planService.js';
import { dayOfWeek } from '../utils/dateUtils.js';
import { isCalendarConnected } from '../services/calendarService.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';

export function Settings() {
  const user = useUserStore();
  const [reminder, setReminder] = useState(user.reminderTime);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const perm = permissionState();

  async function saveReminder() {
    setSaving(true);
    user.updateSettings({ reminderTime: reminder });
    if (perm !== 'granted') await requestPermission();
    const modId = activeModuleId(user.completedModuleIds);
    const mod = modId ? getModule(modId) : null;
    scheduleReminder({
      reminderTime: reminder,
      moduleTitle: mod?.title,
      practiceToday: isPracticeToday(user.plan, dayOfWeek()),
    });
    setSaving(false);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  }

  function resetEverything() {
    if (!window.confirm('Reset all progress, XP, streaks, and your plan? This cannot be undone.')) return;
    user.resetAll();
    window.location.href = '/';
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="label">Settings</p>
        <h1 className="text-2xl font-display">Preferences</h1>
      </header>

      <Card>
        <p className="label">Daily reminder</p>
        <div className="flex items-center gap-3 mt-3">
          <input
            type="time"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            className="flex-1 bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-lg font-display focus:outline-none focus:border-amber-400"
          />
          <Button onClick={saveReminder} disabled={saving}>{savedAt ? 'Saved ✓' : 'Save'}</Button>
        </div>
        <p className="text-xs text-ink-400 mt-2">
          {perm === 'granted' && 'Notifications enabled.'}
          {perm === 'denied' && 'Notifications blocked — enable them in your browser settings.'}
          {perm === 'default' && 'You will be asked for permission when you save.'}
          {perm === 'unsupported' && "Your browser doesn't support notifications."}
        </p>
      </Card>

      <Card>
        <p className="label">Calendar</p>
        <p className="text-sm text-ink-200 mt-2">
          {isCalendarConnected()
            ? 'Connected.'
            : 'Calendar sync is coming soon — practice events will appear on your Google or Apple calendar.'}
        </p>
        <Button variant="secondary" disabled className="mt-3 w-full opacity-60">
          Connect calendar (Phase 2)
        </Button>
      </Card>

      <Card>
        <p className="label">Lysi (AI companion)</p>
        <p className="text-sm text-ink-200 mt-2">
          Adaptive coaching is coming in Phase 3. Lysi will review your sessions and suggest what to focus on next.
        </p>
      </Card>

      <Card>
        <p className="label">Danger zone</p>
        <Button variant="ghost" onClick={resetEverything} className="mt-3 text-red-300 hover:bg-red-900/20">
          Reset all data
        </Button>
      </Card>
    </div>
  );
}
