import { useEffect, useState } from 'react';

const COLORS = ['#E8843A', '#F2B783', '#EFEFF2', '#A8551B'];

export function Confetti({ show, count = 36 }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!show) return undefined;
    const items = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 200,
      duration: 900 + Math.random() * 700,
      rotate: Math.random() * 360,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 6,
    }));
    setPieces(items);
    const t = setTimeout(() => setPieces([]), 1800);
    return () => clearTimeout(t);
  }, [show, count]);

  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-20px] block rounded-sm"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `fall ${p.duration}ms ${p.delay}ms ease-in forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
