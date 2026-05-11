import { Link } from 'react-router-dom';
import { usePianoStore } from '../../store/pianoStore.js';

export function PlayerSwitcher() {
  const members = usePianoStore((s) => s.members);
  const activeId = usePianoStore((s) => s.activeMemberId);
  const setActive = usePianoStore((s) => s.setActiveMember);

  if (members.length === 0) {
    return (
      <Link
        to="/piano/family"
        className="flex items-center gap-2 text-sm text-amber-300 underline underline-offset-4"
      >
        + Add the first family player
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1">
      {members.map((m) => {
        const isActive = m.memberId === activeId;
        return (
          <button
            key={m.memberId}
            onClick={() => setActive(m.memberId)}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full border transition ${
              isActive
                ? 'bg-amber-400 text-ink-900 border-amber-400'
                : 'bg-ink-700 text-ink-200 border-ink-600 hover:bg-ink-600'
            }`}
          >
            <span className="text-lg" aria-hidden>{m.avatar}</span>
            <span className="text-sm font-semibold whitespace-nowrap">{m.name}</span>
          </button>
        );
      })}
      <Link
        to="/piano/family"
        className="flex-shrink-0 px-3 py-2 rounded-full border border-dashed border-ink-500 text-ink-300 text-sm hover:bg-ink-700"
      >
        + Add
      </Link>
    </div>
  );
}
