"use client";

import { useState, useTransition } from "react";
import { generatePractice, type PracticeQuestion } from "@/app/actions/learning";

const TOPICS = [
  "Reading P&IDs", "Isometric drawings", "MTR / EN 10204 certificates", "WPS, PQR and welder qualification",
  "Weld defects", "NDT method selection (MT/PT/UT/RT)", "ASME B31.3 basics", "API 1104 / CSA Z662 pipeline welding",
  "H2S and confined space safety", "Fall protection and rope access", "Coating inspection basics", "Hazard assessment (FLHA/JSA)",
];

export default function PracticeClient() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [custom, setCustom] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [provider, setProvider] = useState<"auto" | "anthropic" | "openai">("auto");
  const [qs, setQs] = useState<PracticeQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function generate() {
    setError(null);
    setQs(null);
    setAnswers({});
    start(async () => {
      const res = await generatePractice(custom.trim() || topic, difficulty, provider === "auto" ? undefined : provider);
      if (res.error) setError(res.error);
      else setQs(res.questions ?? null);
    });
  }

  const answered = Object.keys(answers).length;
  const correct = qs ? qs.filter((q, i) => answers[i] === q.correct).length : 0;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Topic</label>
            <select className="input" value={topic} onChange={(e) => setTopic(e.target.value)}>
              {TOPICS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">…or type your own</label>
            <input className="input" value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={120} placeholder="e.g. Hydrotest pressure calculations" />
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="label">AI</label>
            <select className="input" value={provider} onChange={(e) => setProvider(e.target.value as typeof provider)}>
              <option value="auto">Auto</option><option value="anthropic">Claude</option><option value="openai">OpenAI</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary mt-5" disabled={pending} onClick={generate}>{pending ? "Generating…" : "Generate 5 questions"}</button>
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {pending && <div className="card p-8 text-center text-ink/60 anim-fade-in">Writing your questions…</div>}

      {qs && (
        <div className="space-y-4 stagger">
          {qs.map((q, i) => {
            const a = answers[i];
            const done = a !== undefined;
            return (
              <div key={i} className="card p-5">
                <p className="mb-3 font-bold">{i + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((o, idx) => (
                    <button
                      key={idx}
                      disabled={done}
                      onClick={() => setAnswers((p) => ({ ...p, [i]: idx }))}
                      className={`block w-full rounded-[15px] border-2 px-4 py-2 text-left text-sm transition ${
                        done && idx === q.correct ? "border-green-500 bg-green-50" : done && a === idx ? "border-red-400 bg-red-50" : "border-transparent bg-surface hover:border-brand"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
                {done && <p className="alert alert-info mt-3 anim-fade-up">{q.explanation}</p>}
              </div>
            );
          })}
          {answered === qs.length && (
            <div className="card-accent p-6 text-center anim-pop">
              <p className="text-3xl font-extrabold text-brand">{correct}/{qs.length}</p>
              <button className="btn btn-primary mt-3" onClick={generate}>Another set</button>
            </div>
          )}
          <p className="hint text-center">AI-written questions can contain mistakes. Check codes and your company procedures for anything you will rely on.</p>
        </div>
      )}
    </div>
  );
}
