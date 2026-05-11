import { useEffect, useRef, useState } from 'react';

export function Timer({ totalSeconds, paused = false, onElapsed }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const startRef = useRef(Date.now());
  const baseRef = useRef(totalSeconds);

  useEffect(() => {
    setRemaining(totalSeconds);
    startRef.current = Date.now();
    baseRef.current = totalSeconds;
  }, [totalSeconds]);

  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const next = Math.max(0, baseRef.current - elapsed);
      setRemaining(next);
      if (next <= 0) {
        clearInterval(id);
        onElapsed && onElapsed();
      }
    }, 200);
    return () => clearInterval(id);
  }, [paused, onElapsed]);

  const minutes = Math.floor(remaining / 60);
  const seconds = Math.floor(remaining % 60);
  const pct = baseRef.current > 0 ? 1 - remaining / baseRef.current : 1;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-44 h-44">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#2F2F31" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="46" fill="none"
            stroke="#E8843A" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 46}
            strokeDashoffset={(1 - pct) * 2 * Math.PI * 46}
            className="transition-[stroke-dashoffset] duration-200"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-display text-5xl text-ink-100">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="label mt-1">{paused ? 'Paused' : 'Practicing'}</div>
        </div>
      </div>
    </div>
  );
}
