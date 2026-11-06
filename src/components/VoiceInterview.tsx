"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { recordInterviewIntegrity } from "@/app/actions/interview";
import type { IntegrityEventType } from "@/generated/prisma/client";

type Phase = "setup" | "loading" | "speaking" | "listening" | "processing" | "done" | "closed" | "error";
type Mode = "server" | "browser" | "text";

const SILENCE_HINT_MS = 15000;

export default function VoiceInterview({
  interviewId,
  title,
  firstName,
  serverTts,
  serverStt,
}: {
  interviewId: string;
  title: string;
  firstName: string;
  serverTts: boolean;
  serverStt: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [question, setQuestion] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [total, setTotal] = useState(12);
  const [mode, setMode] = useState<Mode>("text");
  const [micOk, setMicOk] = useState<boolean | null>(null);
  const [agree, setAgree] = useState(false);
  const [live, setLive] = useState("");
  const [typed, setTyped] = useState("");
  const [level, setLevel] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [warn, setWarn] = useState<{ n: number; max: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needTap, setNeedTap] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recogRef = useRef<any>(null);
  const finalTextRef = useRef("");
  const listenStartRef = useRef(0);
  const firstSoundRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const activeRef = useRef(false);

  const SR: any = typeof window !== "undefined" ? (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition : null;

  // ── Integrity: tab switches, focus loss, clipboard ───────────────────────
  useEffect(() => {
    activeRef.current = phase !== "setup" && phase !== "done" && phase !== "closed";
  }, [phase]);

  useEffect(() => {
    const last: Partial<Record<IntegrityEventType, number>> = {};
    function fire(type: IntegrityEventType) {
      if (!activeRef.current) return;
      const now = Date.now();
      if (now - (last[type] ?? 0) < 3000) return;
      last[type] = now;
      recordInterviewIntegrity(interviewId, type)
        .then((r) => {
          if (r.status === "terminated") setPhase("closed");
          else if (r.status === "warned") setWarn({ n: r.violations, max: r.max });
        })
        .catch(() => {});
    }
    const vis = () => document.hidden && fire("TAB_HIDDEN");
    const blur = () => fire("WINDOW_BLUR");
    const block = (t: IntegrityEventType) => (e: Event) => { e.preventDefault(); fire(t); };
    const copy = block("COPY"), cut = block("CUT"), paste = block("PASTE"), ctx = block("CONTEXT_MENU");
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("blur", blur);
    document.addEventListener("copy", copy);
    document.addEventListener("cut", cut);
    document.addEventListener("paste", paste);
    document.addEventListener("contextmenu", ctx);
    return () => {
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("blur", blur);
      document.removeEventListener("copy", copy);
      document.removeEventListener("cut", cut);
      document.removeEventListener("paste", paste);
      document.removeEventListener("contextmenu", ctx);
    };
  }, [interviewId]);

  // ── Microphone ───────────────────────────────────────────────────────────
  async function testMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = stream;
      setMicOk(true);
      setMode(serverStt && typeof MediaRecorder !== "undefined" ? "server" : SR ? "browser" : "text");
    } catch {
      setMicOk(false);
      setMode("text");
    }
  }

  const stopMeter = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    setLevel(0);
  }, []);

  function startMeter() {
    if (!streamRef.current) return;
    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(streamRef.current).connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / buf.length);
        setLevel(Math.min(1, rms * 6));
        if (rms > 0.03 && firstSoundRef.current === null) firstSoundRef.current = Date.now();
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {}
  }

  // ── Interviewer speech ───────────────────────────────────────────────────
  const browserSpeak = useCallback((text: string, onEnd: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return onEnd();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-CA";
    u.rate = 1;
    u.onend = onEnd;
    u.onerror = onEnd;
    window.speechSynthesis.speak(u);
  }, []);

  const startListening = useCallback(() => {
    setPhase("listening");
    setLive("");
    setTyped("");
    setHint(null);
    setElapsed(0);
    finalTextRef.current = "";
    firstSoundRef.current = null;
    listenStartRef.current = Date.now();
    startMeter();

    if (mode === "server" && streamRef.current) {
      chunksRef.current = [];
      const rec = new MediaRecorder(streamRef.current);
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.start(1000);
      recorderRef.current = rec;
    } else if (mode === "browser" && SR) {
      const r = new SR();
      r.lang = "en-CA";
      r.continuous = true;
      r.interimResults = true;
      r.onspeechstart = () => { if (firstSoundRef.current === null) firstSoundRef.current = Date.now(); };
      r.onresult = (e: any) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) finalTextRef.current += res[0].transcript + " ";
          else interim += res[0].transcript;
        }
        setLive((finalTextRef.current + interim).trim());
      };
      r.onend = () => { if (recogRef.current === r && activeRef.current && listenStartRef.current) { try { r.start(); } catch {} } };
      try { r.start(); } catch {}
      recogRef.current = r;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const speak = useCallback(
    async (text: string, index: number) => {
      setPhase("speaking");
      setNeedTap(false);
      const done = () => startListening();
      if (serverTts) {
        try {
          const res = await fetch(`/api/interview/${interviewId}/speak`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ index }),
          });
          if (res.ok) {
            const url = URL.createObjectURL(await res.blob());
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = done;
            try {
              await audio.play();
              return;
            } catch {
              setNeedTap(true); // autoplay blocked — let the candidate tap to hear it
              return;
            }
          }
        } catch {}
      }
      browserSpeak(text, done);
    },
    [serverTts, interviewId, browserSpeak, startListening]
  );

  async function turn(answer?: string, meta?: { mode: "voice" | "text"; delayMs?: number; durationMs?: number }) {
    setPhase(answer ? "processing" : "loading");
    try {
      const res = await fetch(`/api/interview/${interviewId}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, meta }),
      });
      const json = await res.json();
      if (res.status === 409 && json.error === "This interview is closed.") return setPhase("closed");
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      if (json.done) {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        return setPhase("done");
      }
      setQuestion(json.question);
      setQIndex(json.index);
      setTotal(json.total);
      speak(json.question, json.index);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection problem.");
      setPhase("error");
    }
  }

  // timers while listening
  useEffect(() => {
    if (phase !== "listening") return;
    const t = setInterval(() => {
      const s = Math.floor((Date.now() - listenStartRef.current) / 1000);
      setElapsed(s);
      if (firstSoundRef.current === null && mode !== "text" && Date.now() - listenStartRef.current > SILENCE_HINT_MS) {
        setHint("We can't hear you yet — check your microphone, or switch to typing.");
      }
    }, 500);
    return () => clearInterval(t);
  }, [phase, mode]);

  useEffect(() => () => {
    stopMeter();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
  }, [stopMeter]);

  async function finishAnswer() {
    const durationMs = Date.now() - listenStartRef.current;
    const delayMs = firstSoundRef.current ? firstSoundRef.current - listenStartRef.current : durationMs;
    stopMeter();
    setPhase("processing");

    let text = "";
    let used: "voice" | "text" = "voice";
    if (mode === "text") {
      text = typed.trim();
      used = "text";
    } else if (mode === "browser") {
      const r = recogRef.current;
      recogRef.current = null;
      try { r?.stop(); } catch {}
      await new Promise((res) => setTimeout(res, 350));
      text = (finalTextRef.current || live).trim();
    } else {
      const rec = recorderRef.current;
      const blob: Blob = await new Promise((resolve) => {
        if (!rec || rec.state === "inactive") return resolve(new Blob(chunksRef.current));
        rec.onstop = () => resolve(new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" }));
        rec.stop();
      });
      if (blob.size < 1500) {
        setHint("That was too short to hear. Please answer again.");
        return startListening();
      }
      const form = new FormData();
      form.append("audio", blob, blob.type.includes("mp4") ? "answer.mp4" : "answer.webm");
      try {
        const res = await fetch(`/api/interview/${interviewId}/transcribe`, { method: "POST", body: form });
        const json = await res.json();
        if (!res.ok) throw new Error();
        text = String(json.text ?? "").trim();
      } catch {
        setHint("We couldn't process that recording — please try once more.");
        return startListening();
      }
    }

    if (text.split(/\s+/).filter(Boolean).length < 2) {
      setHint("We didn't catch an answer. Please try again.");
      return startListening();
    }
    setLive(text);
    turn(text, { mode: used, delayMs, durationMs });
  }

  const pct = Math.round(((qIndex + (phase === "processing" ? 1 : 0)) / total) * 100);

  // ── Screens ──────────────────────────────────────────────────────────────
  if (phase === "closed") {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center anim-pop">
        <h1 className="text-xl font-extrabold">Interview closed</h1>
        <p className="mt-2 text-sm text-ink/70">This interview was closed after repeated rule violations (switching tabs or windows, or copying/pasting). Engrity has been notified.</p>
        <Link href="/dashboard" className="btn btn-primary mt-5">Back to dashboard</Link>
      </div>
    );
  }
  if (phase === "done") {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center anim-pop">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-brand">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
        </div>
        <h1 className="text-xl font-extrabold">Interview complete</h1>
        <p className="mt-2 text-sm text-ink/70">Thank you, {firstName}. Your answers have been recorded and will be reviewed by the Engrity team. You don&rsquo;t need to do anything else.</p>
        <Link href="/dashboard" className="btn btn-primary mt-5">Back to dashboard</Link>
      </div>
    );
  }

  if (phase === "setup") {
    return (
      <div className="card mx-auto max-w-xl overflow-hidden anim-fade-up">
        <div className="bg-brand px-8 py-7 text-white">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">AI voice interview</p>
          <h1 className="mt-1 text-2xl font-extrabold">{title}</h1>
          <p className="mt-1 text-sm opacity-90">About 15–20 minutes · {total} questions</p>
        </div>
        <div className="space-y-5 p-8">
          <ul className="space-y-2 text-sm">
            {[
              "You'll talk with “Aura”, Engrity's AI interviewer. It asks one question at a time and listens to your spoken answer.",
              "It will ask about your experience, how you rate your own skills, your expectations (pay, start date, travel), technical questions for your role and a safety scenario.",
              "Answer in your own words, from real experience. Reading from notes, AI tools or another person is not allowed and is monitored.",
              "Stay on this tab. Switching tabs or windows, or copying/pasting, gives warnings and a fourth ends the interview.",
              "Find a quiet place. Your answers are transcribed and rated by AI against role criteria; a person reviews the result.",
            ].map((t) => <li key={t} className="flex gap-3 rounded-[15px] bg-surface px-4 py-2.5"><span className="text-brand">●</span>{t}</li>)}
          </ul>

          <div className="card-accent p-4">
            <p className="text-sm font-bold">Step 1 — check your microphone</p>
            <button className="btn btn-primary btn-sm mt-2" onClick={testMic}>{micOk ? "Microphone ready ✓" : "Test microphone"}</button>
            {micOk === false && <p className="mt-2 text-xs font-semibold text-red-700">Microphone blocked or unavailable. You can still do the interview by typing your answers (pasting is disabled).</p>}
            {micOk && <p className="mt-2 text-xs text-ink/70">Mode: {mode === "server" ? "high-accuracy voice transcription" : mode === "browser" ? "browser speech recognition" : "typing"}</p>}
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#0071fe]" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            I agree to take this interview alone, without AI tools or help, and consent to my answers being transcribed, analysed by AI and reviewed by Engrity.
          </label>
          <button className="btn btn-primary w-full !py-3" disabled={!agree || micOk === null} onClick={() => turn()}>
            Begin interview
          </button>
          {micOk === null && <p className="hint text-center">Test your microphone (or choose to type) before starting.</p>}
          {micOk === null && <button className="block w-full text-center text-xs font-bold text-brand hover:underline" onClick={() => { setMicOk(false); setMode("text"); }}>I&rsquo;ll type my answers instead</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="exam-locked mx-auto max-w-2xl">
      {warn && (
        <div className="alert alert-error mb-4 flex items-center justify-between anim-shake">
          <span><strong>Warning {warn.n} of {warn.max}:</strong> leaving this tab or copying/pasting is not allowed. One more and the interview ends.</span>
          <button className="btn btn-danger btn-sm" onClick={() => setWarn(null)}>OK</button>
        </div>
      )}
      <div className="mb-3 flex items-center justify-between text-xs font-bold text-ink/60">
        <span>Question {Math.min(qIndex + 1, total)} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-accent"><div className="h-full rounded-full bg-brand transition-all duration-700" style={{ width: `${pct}%` }} /></div>

      <div className="card p-8 text-center">
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-accent">
          {phase === "speaking" ? (
            <div className="flex items-center gap-1">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="wave-bar" style={{ animationDelay: `${i * 0.12}s` }} />)}</div>
          ) : phase === "listening" ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white" style={{ boxShadow: `0 0 0 ${6 + level * 26}px rgb(0 113 254 / 0.18)`, transition: "box-shadow .1s" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
            </div>
          ) : (
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          )}
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand">
          {phase === "speaking" ? "Aura is speaking" : phase === "listening" ? (mode === "text" ? "Type your answer" : "Your turn — speak now") : phase === "processing" ? "Thinking…" : "Preparing…"}
        </p>
        <p key={question} className="mt-3 text-lg font-bold leading-snug anim-fade-up">{question || "…"}</p>

        {needTap && (
          <button className="btn btn-soft mt-4" onClick={() => { setNeedTap(false); audioRef.current?.play().catch(() => browserSpeak(question, startListening)); }}>▶ Tap to hear the question</button>
        )}

        {phase === "listening" && (
          <div className="mt-6 space-y-3 text-left">
            {mode === "text" ? (
              <textarea
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                rows={5}
                maxLength={3000}
                autoComplete="off"
                spellCheck={false}
                placeholder="Type your answer in your own words…"
                className="input"
                autoFocus
              />
            ) : (
              <div className="min-h-[3.5rem] rounded-[15px] bg-surface px-4 py-3 text-sm text-ink/70">
                {mode === "browser" ? live || <span className="text-ink/40">Listening… your words appear here.</span> : <span className="text-ink/50">Recording… press “Done answering” when you finish.</span>}
              </div>
            )}
            {hint && <p className="alert alert-info">{hint}</p>}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-ink/50">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</span>
              <div className="flex gap-2">
                {mode !== "text" && <button className="btn btn-ghost btn-sm" onClick={() => { stopMeter(); try { recogRef.current?.stop(); } catch {} recogRef.current = null; if (recorderRef.current?.state === "recording") recorderRef.current.stop(); setMode("text"); setLive(""); setTyped(""); setHint(null); }}>Type instead</button>}
                <button className="btn btn-primary" onClick={finishAnswer} disabled={mode === "text" && typed.trim().length < 3}>Done answering</button>
              </div>
            </div>
          </div>
        )}
        {phase === "error" && (
          <div className="mt-5">
            <p className="alert alert-error">{error}</p>
            <button className="btn btn-primary mt-3" onClick={() => turn()}>Try again</button>
          </div>
        )}
      </div>
    </div>
  );
}
