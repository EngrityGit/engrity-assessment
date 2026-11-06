import { PidSymbolChart } from "./PidSymbols";

function LineNumberDiagram() {
  const parts = [
    { v: '6"', l: "Size (NPS)" },
    { v: "PW", l: "Service: process water" },
    { v: "1001", l: "Line sequence" },
    { v: "A1A", l: "Piping class" },
    { v: "IH", l: "Insulation" },
  ];
  return (
    <div className="flex flex-wrap items-start justify-center gap-1 sm:gap-2">
      {parts.map((p, i) => (
        <div key={p.l} className="flex items-start gap-1 sm:gap-2">
          <div className="text-center">
            <div className="rounded-[12px] bg-brand px-3 py-2 text-base font-extrabold text-white anim-pop" style={{ animationDelay: `${i * 0.1}s` }}>{p.v}</div>
            <p className="mt-1 max-w-[5.5rem] text-[11px] font-semibold text-ink/70">{p.l}</p>
          </div>
          {i < parts.length - 1 && <span className="pt-2 text-xl font-bold text-ink/40">–</span>}
        </div>
      ))}
    </div>
  );
}

function IsoExample() {
  return (
    <svg viewBox="0 0 440 230" className="w-full max-w-xl" role="img" aria-label="Example isometric pipe run">
      <g stroke="#1b1b1b" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 190 L150 126.5 L150 66 L260 129.5 L340 175.7" />
      </g>
      {/* flange + valve */}
      <rect x="44" y="176" width="6" height="26" transform="rotate(-30 47 189)" fill="#0071fe" />
      <g transform="translate(96 158) rotate(-30)">
        <path d="M-12 -9 L0 0 L-12 9 Z M12 -9 L0 0 L12 9 Z" fill="#cee7ff" stroke="#1b1b1b" strokeWidth="2" />
      </g>
      {/* elbows & welds */}
      {[[150, 126.5, "W1"], [150, 66, "W2"], [200, 97, "FW3"]].map(([x, y, t]) => (
        <g key={String(t)}>
          <circle cx={Number(x)} cy={Number(y)} r="5" fill={String(t).startsWith("FW") ? "#fff" : "#0071fe"} stroke="#1b1b1b" strokeWidth="2" />
          <text x={Number(x) + 9} y={Number(y) - 7} fontSize="11" fontWeight="700" fill="#0071fe">{String(t)}</text>
        </g>
      ))}
      {/* dimensions */}
      <g fontSize="11" fontWeight="700" fill="#1b1b1b">
        <text x="52" y="132" transform="rotate(-30 52 132)">2400</text>
        <text x="156" y="100">1500</text>
        <text x="230" y="95" transform="rotate(30 230 95)">3000</text>
        <text x="300" y="168">EL +103.500</text>
      </g>
      {/* north arrow */}
      <g transform="translate(395 40)">
        <circle r="18" fill="#ecf0f8" stroke="#1b1b1b" strokeWidth="1.5" />
        <path d="M0 -14 L5 4 L0 0 L-5 4 Z" fill="#0071fe" />
        <text y="15" textAnchor="middle" fontSize="9" fontWeight="800">N</text>
      </g>
      <text x="14" y="18" fontSize="11" fontWeight="700" fill="#1b1b1b">LINE 6"-PW-1001-A1A-IH · NOT TO SCALE</text>
    </svg>
  );
}

function WpsFlow() {
  const steps = [
    { t: "PQR", d: "Test weld + lab results prove the procedure works" },
    { t: "WPS", d: "Approved recipe with allowed ranges" },
    { t: "Welder (WPQ)", d: "Qualified to use that process, position and material" },
    { t: "Production weld", d: "Welded exactly within the WPS ranges" },
    { t: "Inspection", d: "VT + NDE against code acceptance criteria" },
  ];
  return (
    <ol className="grid gap-2 sm:grid-cols-5">
      {steps.map((s, i) => (
        <li key={s.t} className="card-soft relative p-3 text-center anim-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
          <p className="text-sm font-extrabold text-brand">{s.t}</p>
          <p className="mt-1 text-[11px] text-ink/70">{s.d}</p>
          {i < steps.length - 1 && <span className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-brand sm:block">›</span>}
        </li>
      ))}
    </ol>
  );
}

export default function LessonDiagram({ kind }: { kind: "pid-symbols" | "iso-example" | "line-number" | "wps-flow" }) {
  return (
    <div className="card-accent mb-6 flex flex-col items-center p-5">
      {kind === "pid-symbols" && <PidSymbolChart />}
      {kind === "line-number" && <LineNumberDiagram />}
      {kind === "iso-example" && <IsoExample />}
      {kind === "wps-flow" && <WpsFlow />}
    </div>
  );
}
