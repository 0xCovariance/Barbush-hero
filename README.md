# Barbush Hero

Become the guitar hero you were born to be — a mobile-first PWA that turns daily guitar practice into a habit through structured pentatonic modules, streaks, and XP.

## v0 (Phase 1) scope

- Onboarding flow: goal, daily time budget, practice days, reminder time, PWA install
- 4 pre-built pentatonic modules (Box 1 → Licks → Five Positions → Connecting the Neck), linear unlock
- Weekly plan builder with calendar preview
- Active practice session: per-exercise timer, "Got it / Need more time", completion + XP
- Gamification: streaks (with 1 grace day/week), XP, levels 1–20, module-completion badges
- Web Notifications reminders, scheduled per-day
- PWA: installable, offline-capable (IndexedDB + localStorage)
- Phase 2/3 stubs wired in: `calendarService`, `notificationService` (server push), `ModuleBuilder` route, `LysiBubble`, `lysiService`

No backend in v0. Supabase to be added later.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the production bundle
```

## Stack

React 18 · Vite 5 · Tailwind CSS · Zustand · React Router v6 · idb · vite-plugin-pwa

## File map

```
src/
  data/modules.js           4 pentatonic modules with short/medium/long variants
  store/                    Zustand stores (user + active session)
  services/                 plan, streak, session (IndexedDB), notifications,
                            calendar (stub), lysi (stub)
  hooks/                    useStreak, usePlan, useSession
  utils/                    date and XP helpers
  components/               UI primitives, gamification, Lysi stub
  screens/                  Onboarding, Home, ModulesLibrary, WeeklyPlan,
                            ActiveSession, Progress, Settings, ModuleBuilder
  App.jsx                   Routing + shell + tab bar
  main.jsx                  Entry point, service worker registration
```

## Phase 2/3 roadmap

- **Phase 2:** calendar sync (Google/Apple/ICS), server-driven push notifications, user-created modules
- **Phase 3:** Lysi AI companion (Anthropic API + Open Claw) for adaptive coaching
