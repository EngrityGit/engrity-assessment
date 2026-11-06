// The core, always-shown sequence — advertised on the landing page and
// dashboard for every candidate regardless of role.
export const ROUND_ORDER = ["MATH", "PERSONALITY", "MEMORY", "IQ", "CRITICAL_THINKING"] as const;

// "TECHNICAL_SCREENING" is an additional round some candidates get, based on
// their targetRole having content for them (see
// pickTechnicalScreeningQuestions in src/app/actions/attempt.ts) — kept out
// of ROUND_ORDER so the "standard" assessment description shown
// pre-role-assignment doesn't change.
export type RoundName = (typeof ROUND_ORDER)[number] | "TECHNICAL_SCREENING";

export const ROUND_TIME_LIMIT_MINUTES: Record<RoundName, number> = {
  MATH: 8,
  PERSONALITY: 8,
  MEMORY: 5,
  IQ: 20,
  CRITICAL_THINKING: 20,
  TECHNICAL_SCREENING: 90,
};

export const ROUND_LABELS: Record<RoundName, string> = {
  MATH: "Math Test",
  PERSONALITY: "Personality Test",
  MEMORY: "Memory Test",
  IQ: "IQ Test",
  CRITICAL_THINKING: "Critical Thinking",
  TECHNICAL_SCREENING: "Technical Screening",
};

// Sum of only the core rounds (ROUND_ORDER) — the conditional
// TECHNICAL_SCREENING round is intentionally excluded so the landing page's
// "standard assessment" time estimate doesn't change for anyone.
export const TOTAL_TIME_MINUTES = ROUND_ORDER.reduce(
  (a, r) => a + ROUND_TIME_LIMIT_MINUTES[r],
  0
);

export function nextRound(round: (typeof ROUND_ORDER)[number]): RoundName | null {
  const i = ROUND_ORDER.indexOf(round);
  return i >= 0 && i < ROUND_ORDER.length - 1 ? ROUND_ORDER[i + 1] : null;
}

// A grace period on top of the nominal time limit, so a slow network
// round-trip on the final submit doesn't get rejected as "expired" right at
// the boundary.
const EXPIRY_GRACE_MS = 15_000;

export function isRoundExpired(roundStartedAt: Date, round: RoundName): boolean {
  const deadline = roundStartedAt.getTime() + ROUND_TIME_LIMIT_MINUTES[round] * 60 * 1000;
  return Date.now() > deadline + EXPIRY_GRACE_MS;
}

export const TRAIT_LABELS: Record<string, string> = {
  TEAMWORK: "Teamwork",
  CONSCIENTIOUSNESS: "Conscientiousness",
  STRESS_TOLERANCE: "Stress Tolerance",
  ADAPTABILITY: "Adaptability",
  LEADERSHIP: "Leadership",
};

export const PERSONALITY_TRAITS = Object.keys(TRAIT_LABELS);

export const JOB_ROLE_LABELS: Record<string, string> = {
  NDT: "NDT",
  ROPE_ACCESS: "Rope Access",
  QC_INSPECTION: "QC Inspection",
  CIVIL: "Civil",
  WELDING: "Welding",
  COATING: "Coating",
  ELECTRICAL_INSTRUMENTATION: "Electrical & Instrumentation",
  PROJECT_MANAGEMENT: "Project Management",
  GEOTECHNICAL: "Geotechnical",
  ACCOUNTS: "Accounts",
  HR: "HR",
  SALES: "Sales",
  OPERATIONS: "Operations",
  DIGITAL_MARKETING: "Digital Marketing",
};

export interface OverallScore {
  overall: number;
  cognitiveAbility: number;
  memory: number;
  personalityFit: number;
  criticalThinking: number;
}

type CriticalThinkingScores = {
  decisionMaking: number;
  safetyAwareness: number;
  riskAssessment: number;
  communication: number;
  problemSolving: number;
};

// Computed deterministically from data already on the Attempt — never an AI
// call — so it stays cheap, consistent, and always available once every
// round has been scored (unlike the AI narrative fields, which can be null).
export function computeOverallScore(attempt: {
  mathScore: number | null;
  mathMax: number | null;
  iqScore: number | null;
  iqMax: number | null;
  memoryAccuracyPct: number | null;
  personalityTraits: unknown;
  criticalThinkingScores: unknown;
}): OverallScore | null {
  const { mathScore, mathMax, iqScore, iqMax, memoryAccuracyPct } = attempt;
  if (mathScore === null || mathMax === null || iqMax === 0 || mathMax === 0) return null;
  if (iqScore === null || iqMax === null) return null;
  if (memoryAccuracyPct === null) return null;

  const traits = attempt.personalityTraits as Record<string, number> | null;
  if (!traits || Object.keys(traits).length === 0) return null;

  const ctScores = attempt.criticalThinkingScores as CriticalThinkingScores | null;
  if (!ctScores) return null;

  const cognitiveAbility =
    ((mathScore / mathMax + iqScore / iqMax) / 2) * 10;
  const memory = (memoryAccuracyPct / 100) * 10;
  const traitValues = Object.values(traits);
  const personalityFit = traitValues.reduce((a, b) => a + b, 0) / traitValues.length;
  const ctValues = Object.values(ctScores);
  const criticalThinking = ctValues.reduce((a, b) => a + b, 0) / ctValues.length;

  const overall = (cognitiveAbility + memory + personalityFit + criticalThinking) / 4;

  const round1 = (n: number) => Math.round(n * 10) / 10;
  return {
    overall: round1(overall),
    cognitiveAbility: round1(cognitiveAbility),
    memory: round1(memory),
    personalityFit: round1(personalityFit),
    criticalThinking: round1(criticalThinking),
  };
}

export interface IQIndexResult {
  index: number; // scaled IQ-style score, ~100 average
  benchmarkPct: number; // index expressed as a % of the 110 "above average" benchmark
  label: string;
}

// Not a validated psychometric IQ score — a presentation-friendly mapping of
// the round's percentage-correct onto a familiar IQ-like scale (50% correct
// ≈ 100, the population average), so a reviewer has an intuitive number to
// anchor on instead of a raw "7/12".
export function computeIQIndex(score: number | null, max: number | null): IQIndexResult | null {
  if (score === null || max === null || max === 0) return null;
  const pct = Math.max(0, Math.min(1, score / max));
  const index = Math.round(70 + pct * 60);
  const benchmarkPct = Math.round((index / 110) * 100);
  const label =
    index >= 120 ? "Superior" : index >= 110 ? "Above Average" : index >= 90 ? "Average" : "Below Average";
  return { index, benchmarkPct, label };
}

export interface FitVerdict {
  label: string;
  description: string;
}

// Deterministic, not AI-generated — same "advisory input, not a pass/fail
// decision" framing as computeOverallScore above.
export function deriveFitVerdict(overall: number | null): FitVerdict | null {
  if (overall === null) return null;
  if (overall >= 8) {
    return {
      label: "Excellent Fit",
      description:
        "Consistently strong performance across cognitive, memory, personality, and critical thinking measures.",
    };
  }
  if (overall >= 6.5) {
    return {
      label: "Strong Fit",
      description: "Solid performance overall, with results that support moving forward confidently.",
    };
  }
  if (overall >= 5) {
    return {
      label: "Moderate Fit — Review Recommended",
      description: "Mixed results — worth a closer look at the individual round breakdowns before deciding.",
    };
  }
  return {
    label: "Not Recommended",
    description: "Results fell short across multiple measures — recommend against proceeding without further review.",
  };
}

// URL segment for a round's page, e.g. CRITICAL_THINKING -> "critical-thinking".
// (Page folders use hyphens; a plain toLowerCase() leaves underscores and 404s.)
export function roundPath(round: RoundName): string {
  return round.toLowerCase().replace(/_/g, "-");
}
