// Simple, transparent XP: reading and quizzes earn most; games add a little.
export function computeXp(
  progress: { completedAt: Date | null; quizScore: number | null }[],
  bestGameScores: number[]
) {
  const lessons = progress.filter((p) => p.completedAt).length;
  const quiz = progress.reduce((a, p) => a + (p.quizScore ?? 0), 0);
  const games = bestGameScores.reduce((a, s) => a + Math.floor(s / 10), 0);
  const xp = lessons * 50 + quiz * 10 + games;
  const level = Math.floor(xp / 200) + 1;
  return { xp, level, intoLevel: xp % 200, perLevel: 200 };
}
