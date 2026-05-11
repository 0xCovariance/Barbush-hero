// Phase 2 stub. In Phase 2 this will support Google Calendar (OAuth),
// Apple Calendar (CalDAV), and generic ICS export. For Phase 1 the function
// exists so callers can be wired without conditional logic, but it does nothing.

export async function addEvent(/* { title, start, durationMinutes, reminderMinutesBefore } */) {
  // Phase 2: implement OAuth + provider-specific event creation here.
  return null;
}

export async function removeEvent(/* eventId */) {
  // Phase 2: implement provider-specific event removal here.
  return null;
}

export function isCalendarConnected() {
  return false;
}
