// Visual "complete the pattern" puzzles live in the same Question table as
// every other multiple-choice question, encoded as strings:
//
//   prompt  = "MATRIX|<instruction text>|<cell1>|...|<cell8>"   (the 3x3 grid in
//             row-major order, the 9th cell is the blank the candidate fills)
//   options = ["CELL:...", ...]
//   cell    = "CELL:<shape>:<color hex>:<s|o>:<count>:<rotation>:<scale>"
//             s = solid, o = outline

export type CellAttrs = {
  shape: string;
  color: string;
  fill: "s" | "o";
  count: number;
  rot: number;
  scale: number;
};

export function isCellSpec(value: string): boolean {
  return value.startsWith("CELL:");
}

export function isMatrixPrompt(prompt: string): boolean {
  return prompt.startsWith("MATRIX|");
}

export function cellToSpec(c: CellAttrs): string {
  return `CELL:${c.shape}:${c.color}:${c.fill}:${c.count}:${c.rot}:${c.scale}`;
}

export function parseCellSpec(spec: string): CellAttrs {
  const [, shape, color, fill, count, rot, scale] = spec.split(":");
  return {
    shape: shape || "circle",
    color: color || "1c7293",
    fill: fill === "o" ? "o" : "s",
    count: Math.max(1, Math.min(4, Number(count) || 1)),
    rot: Number(rot) || 0,
    scale: Number(scale) || 1,
  };
}

export function parseMatrixPrompt(prompt: string): { text: string; cells: string[] } {
  const [, text, ...cells] = prompt.split("|");
  return { text: text ?? "Which option completes the pattern?", cells };
}

// Readable stand-in for places that can only show text (PDF, AI analysis).
export function promptLabel(prompt: string): string {
  if (!isMatrixPrompt(prompt)) return prompt;
  const { text } = parseMatrixPrompt(prompt);
  return `[Visual pattern puzzle] ${text}`;
}
