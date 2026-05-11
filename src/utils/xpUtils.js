// Level thresholds: XP required to reach a given level. Level 1 starts at 0.
// Curve is gentle early and steepens — Duolingo-ish.
export const LEVEL_THRESHOLDS = (() => {
  const levels = [0];
  for (let lvl = 2; lvl <= 20; lvl++) {
    levels.push(Math.round(50 * Math.pow(lvl - 1, 1.55)));
  }
  return levels;
})();

export function levelForXP(totalXP) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return Math.min(level, 20);
}

export function levelProgress(totalXP) {
  const lvl = levelForXP(totalXP);
  const lo = LEVEL_THRESHOLDS[lvl - 1] ?? 0;
  const hi = LEVEL_THRESHOLDS[lvl] ?? lo + 100;
  if (lvl >= 20) return { level: 20, into: 1, lo, hi: lo };
  return { level: lvl, into: (totalXP - lo) / (hi - lo), lo, hi };
}
