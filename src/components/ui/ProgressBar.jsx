export function ProgressBar({ value, max = 1, className = '', tone = 'amber' }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const fill = tone === 'amber' ? 'bg-amber-400' : 'bg-ink-200';
  return (
    <div className={`w-full h-2 rounded-full bg-ink-600 overflow-hidden ${className}`}>
      <div
        className={`h-full ${fill} transition-[width] duration-500 ease-out`}
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}
