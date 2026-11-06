"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Msg = { role: "user" | "assistant"; content: string };

const CANDIDATE_CHIPS = [
  "Explain how to read a line number on a P&ID",
  "What's the difference between a WPS and a PQR?",
  "What should I check on an MTR?",
];
const ADMIN_CHIPS = [
  "Draft an invitation email for a new NDT hire",
  "Suggest interview criteria for a welding inspector",
  "How should I read a low authenticity score?",
];

export default function AssistantWidget({ role }: { role: "ADMIN" | "CANDIDATE" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState<"auto" | "anthropic" | "openai">("auto");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, provider, page: pathname }),
      });
      const json = await res.json();
      setMessages([
        ...next,
        { role: "assistant", content: res.ok ? json.reply : json.error ?? "Something went wrong." },
      ]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  const chips = role === "ADMIN" ? ADMIN_CHIPS : CANDIDATE_CHIPS;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI assistant"
        className={`fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-xl transition hover:scale-105 ${
          open ? "" : "anim-pulse-ring"
        }`}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" /></svg>
        )}
      </button>

      {open && (
        <div className="card fixed bottom-24 right-5 z-50 flex h-[min(34rem,calc(100vh-8rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden anim-pop">
          <div className="flex items-center justify-between bg-brand px-4 py-3 text-white">
            <div>
              <p className="text-sm font-extrabold">{role === "ADMIN" ? "Engrity Assistant" : "Engrity Coach"}</p>
              <p className="text-[11px] opacity-80">Powered by Claude &amp; OpenAI</p>
            </div>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as typeof provider)}
              className="rounded-[10px] bg-white/20 px-2 py-1 text-xs font-semibold text-white outline-none"
              aria-label="AI model"
            >
              <option value="auto" className="text-ink">Auto</option>
              <option value="anthropic" className="text-ink">Claude</option>
              <option value="openai" className="text-ink">OpenAI</option>
            </select>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-surface p-4">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-ink/70">
                  {role === "ADMIN"
                    ? "Ask me to draft messages, design interview rubrics or interpret results."
                    : "Ask me anything about your trade, drawings, codes or this platform. I teach — I won't answer live test questions."}
                </p>
                {chips.map((c) => (
                  <button key={c} type="button" onClick={() => send(c)} className="block w-full rounded-[15px] bg-white px-3 py-2 text-left text-xs font-semibold text-brand-dark transition hover:bg-accent">
                    {c}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} anim-fade-up`}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-[15px] px-3 py-2 text-sm ${m.role === "user" ? "bg-brand text-white" : "bg-white text-ink"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex gap-1 px-2">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 rounded-full bg-brand anim-float" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="flex gap-2 border-t border-accent bg-white p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Type your question…"
              maxLength={1500}
              className="input !py-2 text-sm"
            />
            <button type="button" onClick={() => send(input)} disabled={busy || !input.trim()} className="btn btn-primary !px-4">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
