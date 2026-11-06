export type MemoryStimulus = { shape: string; color: string };

const SHAPES = ["circle", "square", "triangle", "pentagon", "hexagon", "star"];
const COLORS = ["0b2545", "1c7293", "b85042", "2c5f2d", "6d2e46", "134074"];

// 30 distinct shape+color combinations — a fixed, deterministic palette so
// every candidate sees the same visual set (only the sequence/order differs).
export const PALETTE: MemoryStimulus[] = SHAPES.flatMap((shape) =>
  COLORS.map((color) => ({ shape, color }))
).slice(0, 30);

export function stimulusSpec(s: MemoryStimulus, scale = 1): string {
  return `SHAPE:${s.shape}:${s.color}:0:${scale}`;
}

export type MemoryTrial = {
  index: number;
  stimulus: MemoryStimulus;
  isRepeat: boolean;
  lag: number | null;
};

export const TOTAL_TRIALS = 36;
export const REPEAT_FRACTION = 0.33;
export const MIN_LAG = 1;
export const MAX_LAG = 8;
export const TRIAL_DURATION_MS = 2200;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateSequence(): MemoryTrial[] {
  const freshPool = shuffle(PALETTE);
  let freshIndex = 0;
  const trials: MemoryTrial[] = [];

  for (let i = 0; i < TOTAL_TRIALS; i++) {
    const canRepeat = i >= MIN_LAG;
    const shouldRepeat = canRepeat && Math.random() < REPEAT_FRACTION;

    if (shouldRepeat) {
      const maxLag = Math.min(MAX_LAG, i);
      const lag = MIN_LAG + Math.floor(Math.random() * (maxLag - MIN_LAG + 1));
      const source = trials[i - lag];
      trials.push({ index: i, stimulus: source.stimulus, isRepeat: true, lag });
    } else {
      const stimulus = freshPool[freshIndex % freshPool.length];
      freshIndex += 1;
      trials.push({ index: i, stimulus, isRepeat: false, lag: null });
    }
  }

  return trials;
}

export type MemoryTrialResult = {
  index: number;
  isRepeat: boolean;
  respondedSeen: boolean;
  correct: boolean;
  reactionMs: number | null;
};

export function summarizeMemoryResults(results: MemoryTrialResult[]) {
  const hits = results.filter((r) => r.isRepeat && r.respondedSeen).length;
  const correctRejections = results.filter((r) => !r.isRepeat && !r.respondedSeen).length;
  const total = results.length;
  const accuracyPct = total > 0 ? Math.round(((hits + correctRejections) / total) * 100) : 0;

  const hitReactionTimes = results
    .filter((r) => r.isRepeat && r.respondedSeen && r.reactionMs !== null)
    .map((r) => r.reactionMs as number);
  const avgReactionMs =
    hitReactionTimes.length > 0
      ? Math.round(hitReactionTimes.reduce((a, b) => a + b, 0) / hitReactionTimes.length)
      : null;

  return { accuracyPct, avgReactionMs };
}
