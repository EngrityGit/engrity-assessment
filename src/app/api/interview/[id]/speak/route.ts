import { NextResponse } from "next/server";
import { getOpenInterview } from "@/lib/interview-access";
import { openaiApiKey } from "@/lib/llm";
import type { TranscriptEntry } from "@/lib/interview";

export const maxDuration = 60;

// Text-to-speech for the interviewer. Only speaks text that is already in this
// interview's transcript (never arbitrary text), so it can't be used as a free TTS API.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await getOpenInterview(id);
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  if (!openaiApiKey) return NextResponse.json({ error: "TTS not configured" }, { status: 501 });

  const { index } = (await req.json().catch(() => ({}))) as { index?: number };
  const transcript = (guard.interview.transcript as unknown as TranscriptEntry[]) ?? [];
  const aiLines = transcript.filter((e) => e.role === "ai");
  const entry = typeof index === "number" ? aiLines[index] : undefined;
  if (!entry) return NextResponse.json({ error: "No such question" }, { status: 404 });

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiApiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
      voice: process.env.OPENAI_TTS_VOICE ?? "alloy",
      input: entry.text,
      response_format: "mp3",
    }),
  });
  if (!res.ok) return NextResponse.json({ error: "TTS failed" }, { status: 502 });
  return new NextResponse(await res.arrayBuffer(), { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, no-store" } });
}
