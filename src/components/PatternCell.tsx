import { parseCellSpec, parseMatrixPrompt } from "@/lib/matrix";

function polygon(cx: number, cy: number, r: number, sides: number): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (Math.PI * 2 * i) / sides - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return pts.join(" ");
}

function star(cx: number, cy: number, ro: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? ro : ro / 2;
    const a = (Math.PI * i) / 5 - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return pts.join(" ");
}

function Item({
  shape,
  cx,
  cy,
  r,
  rot,
  color,
  outline,
}: {
  shape: string;
  cx: number;
  cy: number;
  r: number;
  rot: number;
  color: string;
  outline: boolean;
}) {
  const paint = outline
    ? { fill: "none", stroke: color, strokeWidth: 2.5 }
    : { fill: color, stroke: color, strokeWidth: 1 };
  let el: React.ReactNode;
  switch (shape) {
    case "square":
      el = <rect x={cx - r * 0.8} y={cy - r * 0.8} width={r * 1.6} height={r * 1.6} {...paint} />;
      break;
    case "triangle":
      el = <polygon points={`${cx},${cy - r} ${cx + r},${cy + r * 0.8} ${cx - r},${cy + r * 0.8}`} {...paint} />;
      break;
    case "diamond":
      el = <polygon points={`${cx},${cy - r} ${cx + r * 0.8},${cy} ${cx},${cy + r} ${cx - r * 0.8},${cy}`} {...paint} />;
      break;
    case "cross":
      el = (
        <polygon
          points={`${cx - r * 0.3},${cy - r} ${cx + r * 0.3},${cy - r} ${cx + r * 0.3},${cy - r * 0.3} ${cx + r},${cy - r * 0.3} ${cx + r},${cy + r * 0.3} ${cx + r * 0.3},${cy + r * 0.3} ${cx + r * 0.3},${cy + r} ${cx - r * 0.3},${cy + r} ${cx - r * 0.3},${cy + r * 0.3} ${cx - r},${cy + r * 0.3} ${cx - r},${cy - r * 0.3} ${cx - r * 0.3},${cy - r * 0.3}`}
          {...paint}
        />
      );
      break;
    case "arrow":
      el = (
        <polygon
          points={`${cx + r},${cy} ${cx},${cy - r * 0.9} ${cx},${cy - r * 0.35} ${cx - r},${cy - r * 0.35} ${cx - r},${cy + r * 0.35} ${cx},${cy + r * 0.35} ${cx},${cy + r * 0.9}`}
          {...paint}
        />
      );
      break;
    case "hexagon":
      el = <polygon points={polygon(cx, cy, r, 6)} {...paint} />;
      break;
    case "star":
      el = <polygon points={star(cx, cy, r)} {...paint} />;
      break;
    default:
      el = <circle cx={cx} cy={cy} r={r * 0.9} {...paint} />;
  }
  return <g transform={`rotate(${rot} ${cx} ${cy})`}>{el}</g>;
}

export default function PatternCell({ spec, size = 72 }: { spec: string; size?: number }) {
  const c = parseCellSpec(spec);
  const color = `#${c.color}`;
  const base = c.count === 1 ? 20 : c.count === 2 ? 14 : 10;
  const r = base * c.scale;
  const gap = r * 2.3;
  const startX = 32 - ((c.count - 1) * gap) / 2;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="pattern cell">
      {Array.from({ length: c.count }).map((_, i) => (
        <Item
          key={i}
          shape={c.shape}
          cx={startX + i * gap}
          cy={32}
          r={r}
          rot={c.rot}
          color={color}
          outline={c.fill === "o"}
        />
      ))}
    </svg>
  );
}

export function MatrixPuzzle({ prompt, cellSize = 84 }: { prompt: string; cellSize?: number }) {
  const { text, cells } = parseMatrixPrompt(prompt);
  return (
    <div>
      <p className="mb-4 text-lg font-medium text-ink">{text}</p>
      <div
        className="mx-auto grid w-fit grid-cols-3 gap-2 rounded-[15px] border border-accent bg-surface p-2"
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-[10px] border border-accent bg-white"
            style={{ width: cellSize, height: cellSize }}
          >
            {i < 8 && cells[i] ? (
              <PatternCell spec={cells[i]} size={cellSize - 8} />
            ) : (
              <span className="text-3xl font-bold text-[#0071FE]">?</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
