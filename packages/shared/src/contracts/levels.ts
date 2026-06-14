// Level system constants and utilities
// Formula: xpForLevel(n) = 50 * n * (n - 1)  (quadratic curve)
// This gives: L1=0, L2=100, L3=300, L4=600, L5=1000, ...

export const LEVEL_COEFFICIENT = 50;
export const MAX_LEVEL = 30;

export interface LevelInfo {
  level: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

/** XP threshold required to reach a given level. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return LEVEL_COEFFICIENT * level * (level - 1);
}

/** Compute the current level from total XP. */
export function levelFromXp(totalXp: number): number {
  const xp = Math.max(0, totalXp);
  if (xp === 0) return 1;
  const raw = Math.floor(
    (1 + Math.sqrt(1 + (4 * xp) / LEVEL_COEFFICIENT)) / 2
  );
  return Math.min(raw, MAX_LEVEL);
}

/** Progress within the current level. */
export function xpProgressInLevel(totalXp: number): {
  current: number;
  required: number;
  percent: number;
} {
  const xp = Math.max(0, totalXp);
  const level = levelFromXp(xp);
  if (level >= MAX_LEVEL) {
    return { current: 0, required: 0, percent: 100 };
  }
  const currentThreshold = xpForLevel(level);
  const nextThreshold = xpForLevel(level + 1);
  const required = nextThreshold - currentThreshold;
  const current = xp - currentThreshold;
  const percent = required > 0 ? Math.round((current / required) * 100) : 100;
  return { current, required, percent };
}

/** All-in-one level info from total XP. */
export function getLevelInfo(totalXp: number): LevelInfo {
  const xp = Math.max(0, totalXp);
  const level = levelFromXp(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp =
    level >= MAX_LEVEL ? currentLevelXp : xpForLevel(level + 1);
  const progress = xpProgressInLevel(xp);
  return {
    level,
    totalXp: xp,
    currentLevelXp,
    nextLevelXp,
    progressPercent: progress.percent,
  };
}
