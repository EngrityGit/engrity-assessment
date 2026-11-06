import { NextResponse } from "next/server";
import { getOpenInterview } from "@/lib/interview-access";
import { openaiApiKey } from "@/lib/llm";
import type { TranscriptEntry } from "@/lib/interview";

export const maxDuration = 60;

const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

// Speech-to-text for the candidate's spoken answer. Only allowed while the
// interviewer is waiting for an answer.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await getOpenInterview(id);
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  if (!openaiApiKey) return NextResponse.json({ error: "STT not configured" }, { status: 501 });

  const transcript = (guard.interview.transcript as unknown as TranscriptEntry[]) ?? [];
  if (transcript[transcript.length - 1]?.role !== "ai") return NextResponse.json({ error: "Not expecting an answer." }, { status: 409 });

  const form = await req.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!(audio instanceof File) || audio.size === 0 || audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "Invalid audio" }, { status: 400 });
  }

  const out = new FormData();
  out.append("file", audio, audio.name || "answer.webm");
  out.append("model", process.env.OPENAI_STT_MODEL ?? "gpt-4o-mini-transcribe");
  out.append("language", "en");
  out.append("prompt", "Technical interview. Terms: NDT, MTR, WPS, PQR, WPQ, P&ID, isometric, UT, MT, PT, RT, PAUT, TOFD, ASME B31.3, ASME IX, API 1104, CSA Z662, CWB, H2S Alive, CSTS, IRATA, SPRAT, ITP, NCR.");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiApiKey}` },
    body: out,
  });
  if (!res.ok) return NextResponse.json({ error: "Transcription failed" }, { status: 502 });
  const json = await res.json();
  return NextResponse.json({ text: String(json.text ?? "").trim() });
}
