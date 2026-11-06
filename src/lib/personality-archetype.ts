// A deterministic, no-AI-key-required "what type are you" headline result —
// picks the highest-scoring of the 5 PersonalityTrait dimensions and maps it
// to a named archetype, in the spirit of a 16Personalities-style type result.
// This sits alongside (not instead of) the free-text AI narrative in
// src/lib/ai.ts, which stays null until ANTHROPIC_API_KEY is configured.

export interface PersonalityArchetype {
  name: string;
  tagline: string;
  description: string;
  idealEnvironment: string;
  dominantTrait: string;
  dominantScore: number;
}

const ARCHETYPES: Record<string, Omit<PersonalityArchetype, "dominantTrait" | "dominantScore">> = {
  TEAMWORK: {
    name: "The Collaborator",
    tagline: "Builds trust and gets things done through people",
    description:
      "This candidate is oriented toward working with others — they look for ways to support colleagues, share information openly, and see group success as personal success. They're likely to be an easy, dependable presence on a crew or in a team-based workflow.",
    idealEnvironment:
      "Thrives in crew-based or team-dependent roles where coordination and mutual reliance matter more than solo output.",
  },
  CONSCIENTIOUSNESS: {
    name: "The Steady Executor",
    tagline: "Reliable, detail-focused, and follows through",
    description:
      "This candidate is careful and dependable — they double-check their own work, keep commitments, and are unlikely to cut corners under pressure. They tend to be the person others trust to close out a task properly without needing to be chased.",
    idealEnvironment:
      "Thrives in roles with clear procedures, compliance requirements, or quality standards where precision and follow-through are non-negotiable.",
  },
  STRESS_TOLERANCE: {
    name: "The Calm Operator",
    tagline: "Keeps a level head when things go sideways",
    description:
      "This candidate holds up well under pressure — unexpected problems, tight deadlines, and high-stakes situations don't visibly rattle them. They're likely to stay functional and clear-headed exactly when a team most needs someone to be.",
    idealEnvironment:
      "Thrives in high-pressure, safety-critical, or unpredictable field environments where composure under stress is a real operational asset.",
  },
  ADAPTABILITY: {
    name: "The Versatile Problem-Solver",
    tagline: "Comfortable with change and new approaches",
    description:
      "This candidate adjusts quickly when plans shift and is open to new tools or methods rather than defaulting to \"the way it's always been done.\" They're likely to handle scope changes, new sites, or shifting priorities without losing momentum.",
    idealEnvironment:
      "Thrives in fast-moving or varied-assignment roles where conditions change site to site or project to project.",
  },
  LEADERSHIP: {
    name: "The Natural Leader",
    tagline: "Steps up and provides direction",
    description:
      "This candidate is comfortable taking charge when a group lacks direction, and others tend to seek them out for guidance. They're likely to informally set the tone on a job even without a formal title, and to speak up rather than defer when they disagree.",
    idealEnvironment:
      "Thrives in roles with growth toward crew lead, supervisor, or client-facing responsibility, where initiative is expected rather than discouraged.",
  },
};

export function derivePersonalityArchetype(
  traitScores: Record<string, number>
): PersonalityArchetype | null {
  const entries = Object.entries(traitScores).filter(([, v]) => typeof v === "number");
  if (entries.length === 0) return null;

  const [dominantTrait, dominantScore] = entries.reduce((best, current) =>
    current[1] > best[1] ? current : best
  );

  const archetype = ARCHETYPES[dominantTrait];
  if (!archetype) return null;

  return { ...archetype, dominantTrait, dominantScore };
}
