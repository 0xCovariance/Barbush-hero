import { openDB } from 'idb';

const DB_NAME = 'barbush-hero';
const STORE = 'sessions';
const VERSION = 1;

let dbPromise = null;
function db() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, VERSION, {
      upgrade(d) {
        if (!d.objectStoreNames.contains(STORE)) {
          const store = d.createObjectStore(STORE, { keyPath: 'sessionId' });
          store.createIndex('byDate', 'date');
          store.createIndex('byModule', 'moduleId');
        }
      },
    });
  }
  return dbPromise;
}

export async function recordSession(session) {
  const d = await db();
  await d.put(STORE, session);
  return session;
}

export async function listSessions() {
  const d = await db();
  return d.getAll(STORE);
}

export async function sessionsForModule(moduleId) {
  const d = await db();
  return d.getAllFromIndex(STORE, 'byModule', moduleId);
}

export async function clearAllSessions() {
  const d = await db();
  await d.clear(STORE);
}
