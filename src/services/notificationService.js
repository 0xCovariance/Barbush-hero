// Phase 1: Web Notifications API. Reminders are scheduled via setTimeout for
// the current day; on app load we re-arm for today if the reminder time has not
// yet passed. Phase 2 will replace this with backend-driven Web Push / FCM.

let armedTimer = null;

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestPermission() {
  if (!notificationsSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function permissionState() {
  if (!notificationsSupported()) return 'unsupported';
  return Notification.permission;
}

function buildNextFire(timeHHMM) {
  const [h, m] = timeHHMM.split(':').map((n) => parseInt(n, 10));
  const now = new Date();
  const fire = new Date();
  fire.setHours(h, m, 0, 0);
  if (fire.getTime() <= now.getTime()) {
    fire.setDate(fire.getDate() + 1);
  }
  return fire;
}

export function clearScheduled() {
  if (armedTimer) {
    clearTimeout(armedTimer);
    armedTimer = null;
  }
}

// Phase 1: schedule a local timer that fires once for the next occurrence of
// reminderTime. Caller should re-arm on app start or after settings change.
// Phase 2: replace with server-driven push via FCM/Web Push.
export function scheduleReminder({ reminderTime, moduleTitle, practiceToday }) {
  clearScheduled();
  if (!notificationsSupported() || Notification.permission !== 'granted') return null;
  if (!practiceToday) return null;
  if (!reminderTime) return null;

  const fire = buildNextFire(reminderTime);
  const delay = fire.getTime() - Date.now();
  if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return null;

  armedTimer = setTimeout(() => {
    try {
      new Notification('Time to practice 🎸', {
        body: `Your ${moduleTitle || 'Barbush Hero'} session is waiting.`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      });
    } catch {
      // Notification API may throw on some platforms.
    }
  }, delay);

  return fire.toISOString();
}
