import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { chat, configuredProviders, type ChatMessage, type Provider } from "@/lib/llm";
import { candidateIsInExam, consumeAiQuota } from "@/lib/ai-guard";

export const maxDuration = 60;

const CANDIDATE_SYSTEM = `You are "Engrity Coach", the AI study assistant inside the Engrity talent platform for inspection, NDT, welding, QA/QC, coating, civil, rope-access and corporate staff in Western Canada.

You help people LEARN: reading P&IDs and isometric drawings, Material Test Reports (MTR / EN 10204 certificates), WPS / PQR / welder qualifications, weld defects and NDT methods (VT, MT, PT, UT, RT), codes (ASME B31.3, ASME IX, API 1104, CSA Z662, CSA W47.1/W59), safety (hazard assessments, LOTO, H2S, confined space, fall protection), certifications and safety tickets, and how to use this platform.

Style: friendly, practical, concise (under ~250 words unless asked for more). Teach with a short explanation, a field example, then one check question for the learner. Use plain text with short lists; no markdown headings.
Rules:
- Never help with a live assessment or interview question, never write answers for a test. If asked, decline kindly and offer to teach the underlying concept instead.
- Safety-critical or code-governed answers: remind the learner that the governing code, client specification and site procedures always take priority, and say when something varies by edition or jurisdiction.
- If unsure, say so rather than guessing.`;

const ADMIN_SYSTEM = `You are "Engrity Assistant" for Engrity administrators and hiring managers. Help with: drafting invitation or follow-up emails, designing interview criteria and rubrics, interpreting assessment scores fairly, planning training for gaps, organising certification/safety-ticket compliance, and using this platform. You cannot see candidate data in this chat unless the admin pastes it. Be concise and practical. Remind users that AI scores are advisory input for a human decision and that hiring decisions must follow employment and privacy law.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  if (session.user.role === "CANDIDATE" && (await candidateIsInExam(session.user.candidateId))) {
    return NextResponse.json(
      { error: "The AI assistant is disabled while an assessment or interview is in progress." },
      { status: 403 }
    );
  }

  let body: { messages?: ChatMessage[]; provider?: Provider | "auto"; page?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 3000) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
  }

  if (configuredProviders().length === 0) {
    return NextResponse.json({ error: "AI is not configured yet. Ask an admin to add an API key." }, { status: 503 });
  }

  if (!(await consumeAiQuota(session.user.id, "assistant"))) {
    return NextResponse.json({ error: "You've reached the hourly AI limit. Try again a little later." }, { status: 429 });
  }

  const preferred = body.provider === "anthropic" || body.provider === "openai" ? body.provider : undefined;
  const system =
    (session.user.role === "ADMIN" ? ADMIN_SYSTEM : CANDIDATE_SYSTEM) +
    (body.page ? `\n\nThe user is currently on the page: ${String(body.page).slice(0, 120)}.` : "");

  const result = await chat({ system, messages, fast: true }, preferred);
  if (!result) return NextResponse.json({ error: "The AI is unavailable right now. Please try again." }, { status: 502 });
  return NextResponse.json({ reply: result.text, provider: result.provider });
}
