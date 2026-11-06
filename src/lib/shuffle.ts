// Deterministic per-attempt shuffling: every candidate sees a different order,
// but the server can always reproduce it to map a clicked option back to the
// real one. Nothing about the "truth" is ever sent to the browser.

function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededPermutation(seed: string, n: number): number[] {
  const rand = mulberry32(xmur3(seed)());
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

export function seededOrder<T>(seed: string, items: T[]): T[] {
  return seededPermutation(seed, items.length).map((i) => items[i]);
}

/** Options as shown to this candidate for this question. */
export function shuffledOptions(attemptId: string, questionId: string, options: string[]): string[] {
  return seededPermutation(`${attemptId}:${questionId}`, options.length).map((i) => options[i]);
}

/** Map the index the candidate clicked back to the original option index. */
export function originalIndex(attemptId: string, questionId: string, optionCount: number, displayed: number | null): number | null {
  if (displayed === null || displayed < 0 || displayed >= optionCount) return null;
  return seededPermutation(`${attemptId}:${questionId}`, optionCount)[displayed];
}
