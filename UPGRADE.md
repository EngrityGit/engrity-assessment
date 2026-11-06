# Engrity platform upgrade — what changed & how to deploy

## 1. Deploy steps
1. Copy `.env.example` → your real env (keep your existing values) and add the new ones:
   `NEXT_PUBLIC_APP_URL`, `OPENAI_API_KEY` (alongside `ANTHROPIC_API_KEY`), optionally `ALLOW_OPEN_SIGNUP`, `ADMIN_NOTIFY_EMAIL`.
2. `npm install`
3. `npx prisma migrate deploy`   ← applies `20261103180000_invites_interviews_learning_docs`
4. `npx prisma generate` (runs automatically on `npm install`)
5. `npm run build` / deploy.
6. Set model names if the defaults don't match your accounts: `ANTHROPIC_MODEL`, `OPENAI_MODEL`.

The migration is additive (new tables/columns/enum values). Attempts that were already mid-round keep running
(they are marked "ready"); new rounds start with the guided wizard.

## 2. New features
| Area | What | Where |
|---|---|---|
| Brand | #0071fe / #1b1b1b / white, cards #cee7ff + #ecf0f8, 15–20 px radius, Plus Jakarta Sans (self-hosted via `@fontsource-variable`), entrance/hover/progress animations, reduced-motion safe | `globals.css`, `components/ui/*` |
| Auth | Sign-up, login, forgot/reset password, **email invitations**, **shareable invite links** (multi-use, expiry, caps, auto-assign test/group), **access requests** with admin approve/decline | `/signup /login /forgot-password /request-access /invite/[token] /admin/invitations` |
| AI (Claude + OpenAI) | One provider layer (`lib/llm.ts`). Grading runs on **both** models and averages (consensus); either one alone works as fallback. AI Coach/Assistant chat, AI practice questions, interview engine | `lib/llm.ts, lib/ai.ts, api/ai/assistant` |
| Test wizards | Every round opens with 5 steps: overview → how it works → practice question → tips → rules + Start. **The timer starts only when Start is pressed** | `components/RoundWizard.tsx, lib/round-guides.ts` |
| Anti-cheat | See §3 | `lib/useIntegrityMonitor.ts, ExamGuard, TrackedTextarea` |
| AI voice interview | Admin assigns; AI "Aura" speaks and listens; always asks self-rating (1–10) + expectations (pay, start date, travel, tickets), adaptive technical questions, safety + behavioural scenario; scores per criterion with evidence, overall, recommendation, self-rating check, authenticity score, suggested follow-ups, full transcript | `/interview, /admin/interviews` |
| Learning hub | 6 modules / 15 lessons: **P&ID, isometrics, MTR, WPS/PQR/WPQ, weld defects & NDT, field safety**; quizzes, SVG diagrams, XP/levels, AI practice, 3 mini-games (Symbol Match, Speed Round, Error Hunt) with leaderboards | `/learn, /learn/games` |
| Compliance | Certifications & safety tickets with expiry tracking (60-day warning), optional file copy; admin compliance overview | `/credentials, /admin/credentials` |
| Documents | Upload (PDF/PNG/JPG/WEBP/DOCX ≤ 4 MB, magic-byte checked); candidates share with all admins or specific admins; admins share with specific users; every download is access-checked | `/documents, /admin/documents` |
| Reports | Rebuilt admin report with integrity-risk score, AI-authenticity badges and typing telemetry; PDF route restored | `/admin/attempts/[id]` |

## 3. Anti-cheating — what it does and its limits
Per round: forced full-screen (blurred/blocked questions until restored), tab/window-switch detection, copy/cut/paste
blocked and logged, right-click and print blocked, text selection disabled on questions, shortcut blocking
(Ctrl/Cmd+C/V/X/A/P/S/F/U, F12, dev-tools combos, PrintScreen), paste/drag-drop/dictation/bulk-insert detection, a faint
per-candidate watermark (discourages screenshots/photos), per-candidate question order and option shuffling (server maps
answers back; correct answers and reference answers never reach the browser), a dev-tools/split-window heuristic,
typing telemetry (keystrokes vs characters), and an AI authenticity screen on every written answer. 3 warnings, the 4th
ends the attempt. The AI assistant, practice generator and games are **disabled server-side while an assessment or
interview is in progress**.

**Limits (be honest with your team):** a web page cannot see a second device, a phone next to the keyboard, another
person in the room, or other applications. These measures raise effort and risk and give you evidence; for high-stakes
hires, keep a human-reviewed technical interview or supervised/remote-proctored sitting.
Low-severity signals (right-click, shortcuts, dev-tools heuristic, bulk input) are logged and weighted in the
integrity-risk score but don't auto-terminate, because browsers can trigger them accidentally.

## 4. Things to know
- Voice: with `OPENAI_API_KEY` the interview uses OpenAI text-to-speech and transcription (best accuracy). Without it,
  it falls back to the browser's speech recognition / synthesis (Chrome, Edge, Safari) and finally to typing.
- Documents are stored in Postgres (≤ 4 MB each). If volume grows, move bytes to object storage (Vercel Blob/S3).
- AI output is advisory. Interview and test scores should inform, not replace, a human hiring decision — check your
  obligations under Canadian privacy and employment law (the sign-up consent text covers AI analysis).
- Learning content reflects common industry practice (ASME, API, CSA, ISA, EN 10204, Alberta OHS). Have a qualified
  person from your team review it before treating it as official training, especially numeric limits.
- Rotate any API keys/passwords that were in the `.env` files bundled with the zip you shared.
