import { cellToSpec, type CellAttrs } from "../src/lib/matrix";

// --- Original IQ questions, added in a second batch ---------------------------
// 10 visual "complete the pattern" puzzles (built from rules so the answer and
// distractors are computed, not hand-typed) interleaved with 9 original
// numeric / verbal / logic questions, easy to hard. Together with the first 11
// questions above the IQ round has 30 questions.
type PuzzleAttr = keyof CellAttrs;
const S3 = ["circle", "square", "triangle"];
const S3_ALT = ["hexagon", "star", "cross"];
const PUZZLE_COLORS = ["1c7293", "d1495b", "2f9e44"];
const CELL_BASE: CellAttrs = { shape: "circle", color: "1c7293", fill: "s", count: 1, rot: 0, scale: 1 };

function mutateCell(a: CellAttrs, attr: PuzzleAttr, shapes: string[]): CellAttrs[] {
  switch (attr) {
    case "shape":
      return shapes.filter((s) => s !== a.shape).map((shape) => ({ ...a, shape }));
    case "count":
      return [1, 2, 3].filter((n) => n !== a.count).map((count) => ({ ...a, count }));
    case "fill":
      return [{ ...a, fill: a.fill === "s" ? "o" : "s" }];
    case "rot":
      return [90, 180, 270].map((d) => ({ ...a, rot: (a.rot + d) % 360 }));
    case "color":
      return PUZZLE_COLORS.filter((c) => c !== a.color).map((color) => ({ ...a, color }));
    case "scale":
      return [0.6, 0.85, 1.1].filter((s) => s !== a.scale).map((scale) => ({ ...a, scale }));
  }
}

function buildMatrixQuestion(
  n: number,
  f: (r: number, c: number) => Partial<CellAttrs>,
  distractOn: PuzzleAttr[],
  shapes: string[]
) {
  const cell = (r: number, c: number): CellAttrs => ({ ...CELL_BASE, ...f(r, c) });
  const cells: string[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!(r === 2 && c === 2)) cells.push(cellToSpec(cell(r, c)));
    }
  }
  const answer = cell(2, 2);
  const candidates: CellAttrs[] = [];
  const perAttr = distractOn.map((a) => mutateCell(answer, a, shapes));
  for (let k = 0; k < 4; k++) for (const list of perAttr) if (list[k]) candidates.push(list[k]);
  candidates.push(cell(2, 1), cell(1, 2), cell(1, 1), cell(0, 2));
  for (const a of distractOn) {
    for (const m of mutateCell(answer, a, shapes)) {
      for (const b of distractOn) {
        if (b !== a) candidates.push(...mutateCell(m, b, shapes));
      }
    }
  }
  const seen = new Set([cellToSpec(answer)]);
  const wrong: string[] = [];
  for (const c of candidates) {
    const spec = cellToSpec(c);
    if (!seen.has(spec)) {
      seen.add(spec);
      wrong.push(spec);
      if (wrong.length === 5) break;
    }
  }
  if (wrong.length < 5) throw new Error(`Matrix puzzle ${n}: could not build 5 distinct wrong options`);
  const correctIndex = (n * 2 + 1) % 6;
  const options = [...wrong];
  options.splice(correctIndex, 0, cellToSpec(answer));
  return {
    prompt: `MATRIX|Which option completes the pattern?|${cells.join("|")}`,
    options,
    correctIndex,
  };
}

const matrixPuzzles = [
  buildMatrixQuestion(1, (r, c) => ({ shape: S3[r], count: c + 1 }), ["shape", "count", "fill"], S3),
  buildMatrixQuestion(2, (r, c) => ({ shape: S3[(r + c) % 3] }), ["shape", "fill", "count"], S3),
  buildMatrixQuestion(3, (r, c) => ({ shape: ["circle", "square", "diamond"][c], scale: [0.6, 0.85, 1.1][r] }), ["shape", "scale", "count"], ["circle", "square", "diamond"]),
  buildMatrixQuestion(4, (r, c) => ({ shape: "arrow", rot: 90 * c, color: PUZZLE_COLORS[r] }), ["rot", "color", "fill"], ["arrow"]),
  buildMatrixQuestion(5, (r, c) => ({ shape: S3[(r + c) % 3], count: r + 1 }), ["shape", "count", "fill"], S3),
  buildMatrixQuestion(6, (r, c) => ({ shape: S3[(r + c) % 3], fill: c === 1 ? "o" : "s" }), ["shape", "fill", "count"], S3),
  buildMatrixQuestion(7, (r, c) => ({ shape: "arrow", rot: (90 * (r + c)) % 360, color: PUZZLE_COLORS[(r + c) % 3] }), ["rot", "color", "count"], ["arrow"]),
  buildMatrixQuestion(8, (r, c) => ({ shape: S3[(r + c) % 3], count: c + 1, fill: r === 1 ? "o" : "s" }), ["shape", "count", "fill"], S3),
  buildMatrixQuestion(9, (r, c) => ({ shape: S3[r], count: ((r + c) % 3) + 1, color: PUZZLE_COLORS[c] }), ["count", "shape", "color"], S3),
  buildMatrixQuestion(10, (r, c) => ({ shape: S3_ALT[(r + c) % 3], count: ((r + 2 * c) % 3) + 1, fill: r === c ? "o" : "s" }), ["shape", "count", "fill"], S3_ALT),
];

const extraIqText = [
  { prompt: "Complete the sequence: 2, 6, 12, 20, 30, ?", options: ["38", "40", "42", "44"], correctIndex: 2 },
  { prompt: "Anchor is to ship as stake is to ?", options: ["Hammer", "Tent", "Rope", "Ground"], correctIndex: 1 },
  { prompt: "Complete the sequence: 1, 2, 4, 7, 11, 16, ?", options: ["20", "21", "22", "23"], correctIndex: 2 },
  {
    prompt: "All florists are gardeners. No gardener is a pilot. Which statement must be true?",
    options: ["Some pilots are florists.", "No florist is a pilot.", "All gardeners are florists.", "Some florists are pilots."],
    correctIndex: 1,
  },
  { prompt: "Complete the sequence: 5, 10, 8, 16, 14, 28, ?", options: ["24", "26", "30", "56"], correctIndex: 1 },
  {
    prompt: "Maya is taller than Noor. Noor is taller than Omar. Pia is shorter than Omar. Who is the second tallest?",
    options: ["Maya", "Noor", "Omar", "Pia"],
    correctIndex: 1,
  },
  { prompt: "Complete the sequence: 3, 5, 9, 17, 33, ?", options: ["49", "57", "65", "66"], correctIndex: 2 },
  { prompt: "Complete the letter series: B, D, G, K, P, ?", options: ["T", "U", "V", "W"], correctIndex: 2 },
  { prompt: "Complete the sequence: 2, 3, 5, 7, 11, 13, ?", options: ["15", "17", "19", "21"], correctIndex: 1 },
];

// Interleave so difficulty rises through the test (the first 11 questions
// above are the easier ones).
const interleaved = [
  extraIqText[0], matrixPuzzles[0], matrixPuzzles[1], extraIqText[1], matrixPuzzles[2], matrixPuzzles[3],
  extraIqText[2], matrixPuzzles[4], extraIqText[3], matrixPuzzles[5], extraIqText[4], matrixPuzzles[6],
  extraIqText[5], matrixPuzzles[7], extraIqText[6], matrixPuzzles[8], extraIqText[7], matrixPuzzles[9],
  extraIqText[8],
];
export const extraIqQuestions = interleaved;
