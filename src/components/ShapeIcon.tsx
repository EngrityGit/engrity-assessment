// Encodes a simple shape as a compact string so it can live in the same
// `options: String[]` column as plain-text answers: "SHAPE:<shape>:<color>:<rotateDeg>:<scale>"
// e.g. "SHAPE:triangle:1c7293:90:1.4"
export function isShapeSpec(value: string): boolean {
  return value.startsWith("SHAPE:");
}

function parseShapeSpec(value: string) {
  const [, shape, color, rotate, scale] = value.split(":");
  return {
    shape,
    color: color ? `#${color}` : "#1c7293",
    rotate: rotate ? Number(rotate) : 0,
    scale: scale ? Number(scale) : 1,
  };
}

export default function ShapeIcon({ spec, size = 48 }: { spec: string; size?: number }) {
  const { shape, color, rotate, scale } = parseShapeSpec(spec);
  const s = size * scale;
  const half = size / 2;

  let inner: React.ReactNode;
  switch (shape) {
    case "circle":
      inner = <circle cx={half} cy={half} r={s / 2.4} fill={color} />;
      break;
    case "square":
      inner = (
        <rect
          x={half - s / 2.6}
          y={half - s / 2.6}
          width={s / 1.3}
          height={s / 1.3}
          fill={color}
        />
      );
      break;
    case "triangle":
      inner = (
        <polygon
          points={`${half},${half - s / 2.3} ${half + s / 2.3},${half + s / 2.6} ${half - s / 2.3},${half + s / 2.6}`}
          fill={color}
        />
      );
      break;
    case "pentagon":
      inner = <polygon points={polygonPoints(half, half, s / 2.3, 5)} fill={color} />;
      break;
    case "hexagon":
      inner = <polygon points={polygonPoints(half, half, s / 2.3, 6)} fill={color} />;
      break;
    case "star":
      inner = <polygon points={starPoints(half, half, s / 2.2, s / 4.4, 5)} fill={color} />;
      break;
    default:
      inner = <circle cx={half} cy={half} r={s / 2.4} fill={color} />;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(${rotate} ${half} ${half})`}>{inner}</g>
    </svg>
  );
}

function polygonPoints(cx: number, cy: number, r: number, sides: number): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(" ");
}

function starPoints(cx: number, cy: number, rOuter: number, rInner: number, points: number): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const angle = (Math.PI * i) / points - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(" ");
}
