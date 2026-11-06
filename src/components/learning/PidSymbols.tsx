import type { ReactNode } from "react";

export interface PidSymbol {
  id: string;
  name: string;
  desc: string;
  draw: ReactNode;
}

const S = { stroke: "#1b1b1b", strokeWidth: 2, fill: "none", strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const Line = () => <path d="M2 25h12M66 25h12" {...S} />;
const Bow = () => (
  <>
    <Line />
    <path d="M14 10 L40 25 L14 40 Z M66 10 L40 25 L66 40 Z" {...S} />
  </>
);

// Typical symbols. Real projects publish their own legend — the lesson says so too.
export const PID_SYMBOLS: PidSymbol[] = [
  { id: "gate", name: "Gate valve", desc: "Isolation — fully open or fully closed, not for throttling", draw: <Bow /> },
  {
    id: "globe",
    name: "Globe valve",
    desc: "Throttling / flow regulation",
    draw: (<><Bow /><circle cx="40" cy="25" r="5.5" fill="#1b1b1b" /></>),
  },
  {
    id: "ball",
    name: "Ball valve",
    desc: "Quarter-turn quick isolation",
    draw: (<><Bow /><circle cx="40" cy="25" r="7" fill="#fff" stroke="#1b1b1b" strokeWidth="2" /></>),
  },
  {
    id: "butterfly",
    name: "Butterfly valve",
    desc: "Quarter-turn disc, compact large-diameter isolation",
    draw: (<><Bow /><path d="M40 8v34" {...S} /></>),
  },
  {
    id: "check",
    name: "Check valve",
    desc: "Allows flow in one direction only (prevents backflow)",
    draw: (<><Line /><path d="M14 25h12M26 12 L52 25 L26 38 Z M52 12v26M52 25h14" {...S} /></>),
  },
  {
    id: "control",
    name: "Control valve",
    desc: "Actuated valve that modulates flow (diaphragm actuator on top)",
    draw: (<><Bow /><path d="M40 25V13M28 13a12 9 0 0 1 24 0Z" {...S} /></>),
  },
  {
    id: "psv",
    name: "Pressure safety valve (PSV)",
    desc: "Opens to relieve overpressure and protect equipment",
    draw: (<><path d="M40 48V36M26 36h28L40 20Z M40 20l-4-3 8-3-8-3 4-3M40 28h22" {...S} /></>),
  },
  {
    id: "pump",
    name: "Centrifugal pump",
    desc: "Moves liquid; discharge shown at the top",
    draw: (<><circle cx="40" cy="28" r="17" {...S} /><path d="M40 11V4h24M32 20l16 8-16 8Z" {...S} /></>),
  },
  {
    id: "bubble",
    name: "Instrument (control room)",
    desc: "Solid line = operator-accessible; no line = field-mounted",
    draw: (
      <>
        <circle cx="40" cy="25" r="19" {...S} />
        <path d="M21 25h38" {...S} />
        <text x="40" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1b1b1b">FIC</text>
        <text x="40" y="37" textAnchor="middle" fontSize="10" fill="#1b1b1b">101</text>
      </>
    ),
  },
  {
    id: "vessel",
    name: "Pressure vessel",
    desc: "Process equipment with dished heads, nozzles on the shell",
    draw: (<><rect x="22" y="6" width="36" height="38" rx="14" {...S} /><path d="M2 20h20M58 34h20" {...S} /></>),
  },
];

export function PidSymbolSvg({ id, size = 96 }: { id: string; size?: number }) {
  const sym = PID_SYMBOLS.find((s) => s.id === id);
  if (!sym) return null;
  return (
    <svg viewBox="0 0 80 50" width={size} height={(size * 50) / 80} role="img" aria-label={sym.name}>
      {sym.draw}
    </svg>
  );
}

export function PidSymbolChart() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 stagger">
      {PID_SYMBOLS.map((s) => (
        <div key={s.id} className="card-soft flex flex-col items-center p-3 text-center">
          <PidSymbolSvg id={s.id} size={104} />
          <p className="mt-1 text-xs font-extrabold">{s.name}</p>
          <p className="text-[11px] text-ink/60">{s.desc}</p>
        </div>
      ))}
      <p className="col-span-full text-xs text-ink/60">Typical symbols only — always check the project legend sheet.</p>
    </div>
  );
}
