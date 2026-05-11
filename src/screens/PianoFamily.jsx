import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePianoStore, AVATARS, COLORS } from '../store/pianoStore.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { FamilyLeaderboard } from '../components/piano/FamilyLeaderboard.jsx';

export function PianoFamily() {
  const members = usePianoStore((s) => s.members);
  const familyName = usePianoStore((s) => s.familyName);
  const setFamilyName = usePianoStore((s) => s.setFamilyName);
  const addMember = usePianoStore((s) => s.addMember);
  const removeMember = usePianoStore((s) => s.removeMember);
  const renameMember = usePianoStore((s) => s.renameMember);
  const resetMemberProgress = usePianoStore((s) => s.resetMemberProgress);

  const [newName, setNewName] = useState('');
  const [pickedAvatar, setPickedAvatar] = useState(AVATARS[0]);
  const [pickedColor, setPickedColor] = useState(COLORS[0]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    addMember({ name: newName, avatar: pickedAvatar, color: pickedColor });
    setNewName('');
    setPickedAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  }

  return (
    <div className="space-y-5 pb-6">
      <header>
        <Link to="/piano" className="text-xs text-ink-400 hover:text-ink-200">‹ Back to piano</Link>
        <h1 className="text-2xl font-display mt-1">👨‍👩‍👧 Family</h1>
        <p className="text-xs text-ink-300">Set up players and see who's winning this week.</p>
      </header>

      <Card>
        <p className="label mb-2">Family name</p>
        <input
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          className="w-full bg-ink-800 border border-ink-600 rounded-lg px-3 py-2 text-sm"
          placeholder="The Smiths"
        />
      </Card>

      <Card>
        <h2 className="font-display text-lg mb-3">Add a player</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Player's name (e.g. Maya)"
            className="w-full bg-ink-800 border border-ink-600 rounded-lg px-3 py-3 text-base"
            maxLength={20}
          />

          <div>
            <p className="label mb-2">Pick an avatar</p>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setPickedAvatar(a)}
                  className={`text-2xl p-2 rounded-lg border ${
                    pickedAvatar === a
                      ? 'border-amber-400 bg-amber-400/20'
                      : 'border-ink-600 bg-ink-700/50'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label mb-2">Pick a color</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setPickedColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    pickedColor === c ? 'border-white' : 'border-transparent'
                  }`}
                  style={{ background: c }}
                  aria-label={`Pick color ${c}`}
                />
              ))}
            </div>
          </div>

          <Button type="submit" disabled={!newName.trim()} className="w-full">
            + Add player
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-lg mb-3">Players ({members.length})</h2>
        {members.length === 0 ? (
          <p className="text-sm text-ink-300">No players yet.</p>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => (
              <li key={m.memberId} className="p-3 rounded-xl bg-ink-700/60 border border-ink-600">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{m.avatar}</div>
                  <div className="flex-1 min-w-0">
                    {editingId === m.memberId ? (
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => {
                          if (editingName.trim()) renameMember(m.memberId, editingName.trim());
                          setEditingId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editingName.trim()) renameMember(m.memberId, editingName.trim());
                            setEditingId(null);
                          }
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-full bg-ink-800 border border-ink-600 rounded-lg px-2 py-1 text-sm"
                      />
                    ) : (
                      <button
                        onClick={() => { setEditingId(m.memberId); setEditingName(m.name); }}
                        className="font-semibold truncate text-left"
                      >
                        {m.name}
                      </button>
                    )}
                    <div className="text-xs text-ink-300">
                      {m.xp} XP · 🔥 {m.currentStreak}d · ⭐ {Object.values(m.songStars).reduce((a, s) => a + s, 0)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        if (confirm(`Reset ${m.name}'s progress?`)) resetMemberProgress(m.memberId);
                      }}
                      className="text-[10px] text-ink-400 hover:text-ink-200"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${m.name}?`)) removeMember(m.memberId);
                      }}
                      className="text-[10px] text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {members.length > 1 && (
        <Card>
          <h2 className="font-display text-lg mb-3">🏆 Leaderboard</h2>
          <FamilyLeaderboard />
        </Card>
      )}
    </div>
  );
}
