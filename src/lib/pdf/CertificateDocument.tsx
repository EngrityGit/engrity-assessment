import fs from "fs";
import path from "path";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import {
  TRAIT_LABELS,
  PERSONALITY_TRAITS,
  JOB_ROLE_LABELS,
} from "@/lib/quiz";
import { INTEGRITY_LABELS, CT_DIMENSION_LABELS, type AttemptReportData } from "@/lib/report-data";
import { isShapeSpec } from "@/components/ShapeIcon";
import { isCellSpec, promptLabel } from "@/lib/matrix";

const BRAND = "#0071FE";

const logoBuffer = fs.readFileSync(path.join(process.cwd(), "public", "engrity-logo.png"));

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, color: "#1f2937", fontFamily: "Helvetica" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  logo: { width: 40, height: 40, marginRight: 12, borderRadius: 4 },
  h1: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  kicker: { fontSize: 9, fontWeight: 700, color: BRAND, letterSpacing: 1 },
  subtle: { fontSize: 9, color: "#6b7280", marginBottom: 2 },
  section: { marginTop: 14, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 4, padding: 12 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#111827" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  scoreHeadline: { fontSize: 20, fontWeight: 700, color: BRAND },
  label: { fontSize: 9, color: "#6b7280" },
  value: { fontSize: 11, fontWeight: 700, color: "#111827" },
  barTrack: { height: 6, backgroundColor: "#f3f4f6", borderRadius: 3, marginTop: 2, marginBottom: 8 },
  barFill: { height: 6, backgroundColor: BRAND, borderRadius: 3 },
  question: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 3, padding: 6, marginBottom: 6 },
  correct: { color: "#16a34a", fontWeight: 700, fontSize: 8 },
  incorrect: { color: "#dc2626", fontWeight: 700, fontSize: 8 },
  optionCorrect: { backgroundColor: "#f0fdf4", color: "#166534", padding: 2, fontSize: 9 },
  optionSelected: { backgroundColor: "#fef2f2", color: "#991b1b", padding: 2, fontSize: 9 },
  optionNeutral: { color: "#4b5563", padding: 2, fontSize: 9 },
  bold: { fontWeight: 700 },
  paragraph: { marginBottom: 6, lineHeight: 1.4 },
  bullet: { flexDirection: "row", marginBottom: 2 },
  footer: { position: "absolute", bottom: 20, left: 32, right: 32, fontSize: 8, color: "#9ca3af", textAlign: "center" },
  verdictBanner: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: BRAND,
    backgroundColor: "#eff6ff",
    borderRadius: 4,
    padding: 12,
  },
  verdictLabel: { fontSize: 16, fontWeight: 700, color: BRAND, marginBottom: 2 },
  archetypeName: { fontSize: 14, fontWeight: 700, color: "#111827" },
  archetypeTagline: { fontSize: 10, fontStyle: "italic", color: "#4b5563", marginBottom: 6 },
  topicHeading: { fontSize: 9, fontWeight: 700, color: BRAND, marginTop: 8, marginBottom: 4, textTransform: "uppercase" },
  refAnswer: { fontSize: 8, color: "#6b7280", marginTop: 2 },
});

function ScoreBarPdf({ label, score }: { label: string; score: number }) {
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{score.toFixed(1)} / 10</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, (score / 10) * 100))}%` }]} />
      </View>
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={{ marginBottom: 6 }}>
      {items.map((item, i) => (
        <View key={i} style={styles.bullet}>
          <Text>{"• "}</Text>
          <Text style={{ flex: 1 }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function McqReviewPdf({
  title,
  score,
  max,
  answers,
}: {
  title: string;
  score: number | null;
  max: number | null;
  answers: AttemptReportData["mathAnswers"];
}) {
  const sorted = [...answers].sort((a, b) => a.question.order - b.question.order);
  return (
    <View style={styles.section} wrap>
      <View style={styles.row}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.value}>
          {score ?? "—"}
          {max ? ` / ${max}` : ""}
        </Text>
      </View>
      {sorted.length === 0 && <Text style={{ color: "#9ca3af" }}>Not reached yet.</Text>}
      {sorted.map((ans) => (
        <View key={ans.id} style={styles.question} wrap={false}>
          <Text style={ans.isCorrect ? styles.correct : styles.incorrect}>
            {ans.isCorrect ? "Correct" : "Incorrect"}
          </Text>
          <Text style={{ marginTop: 2, marginBottom: 3, fontWeight: 700 }}>{promptLabel(ans.question.prompt)}</Text>
          {ans.question.options.map((opt, i) => {
            const display = isShapeSpec(opt) || isCellSpec(opt) ? `Pattern option ${i + 1}` : opt;
            const style =
              i === ans.question.correctIndex
                ? styles.optionCorrect
                : i === ans.selectedIndex
                  ? styles.optionSelected
                  : styles.optionNeutral;
            return (
              <Text key={i} style={style}>
                {display}
                {i === ans.selectedIndex ? " (candidate's answer)" : ""}
                {i === ans.question.correctIndex ? " (correct)" : ""}
              </Text>
            );
          })}
          {ans.selectedIndex === null && (
            <Text style={{ color: "#9ca3af", fontSize: 8, marginTop: 2 }}>No answer selected.</Text>
          )}
        </View>
      ))}
    </View>
  );
}

export function CertificateDocument({ data }: { data: AttemptReportData }) {
  const {
    attempt,
    integrityCounts,
    mathAnswers,
    iqAnswers,
    traitScores,
    personalitySummary,
    iqSummary,
    interviewQuestions,
    technicalScreeningQuestions,
    technicalScreeningScore,
    overallScore,
    iqIndex,
    personalityArchetype,
    fitVerdict,
    memoryStats,
  } = data;

  return (
    <Document
      title={`${attempt.candidate.fullName} — Engrity Assessment Certificate`}
      author="Engrity"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.headerRow}>
          <Image src={{ data: logoBuffer, format: "png" }} style={styles.logo} />
          <View>
            <Text style={styles.kicker}>ENGRITY ASSESSMENT CERTIFICATE</Text>
            <Text style={styles.h1}>{attempt.candidate.fullName}</Text>
            <Text style={styles.subtle}>{attempt.candidate.email}</Text>
          </View>
        </View>
        {attempt.candidate.targetRole && (
          <Text style={styles.subtle}>
            Target role: {JOB_ROLE_LABELS[attempt.candidate.targetRole] ?? attempt.candidate.targetRole}
          </Text>
        )}
        <Text style={styles.subtle}>
          Started {attempt.startedAt.toLocaleString()}
          {attempt.submittedAt ? ` · Submitted ${attempt.submittedAt.toLocaleString()}` : ""}
          {" · "}
          {attempt.status === "SUBMITTED" ? "Submitted" : `In progress (${attempt.currentRound})`}
        </Text>

        {fitVerdict && overallScore && (
          <View style={styles.verdictBanner}>
            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Overall Fit Verdict</Text>
                <Text style={styles.verdictLabel}>{fitVerdict.label}</Text>
              </View>
              <Text style={styles.scoreHeadline}>{overallScore.overall.toFixed(1)} / 10</Text>
            </View>
            <Text style={styles.subtle}>{fitVerdict.description}</Text>
            <Text style={[styles.subtle, { marginTop: 4 }]}>
              Computed directly from the scores below — not AI-generated. This is
              advisory input for a human reviewer, not an automated pass/fail decision.
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <View>
                <Text style={styles.label}>Cognitive Ability</Text>
                <Text style={styles.value}>{overallScore.cognitiveAbility.toFixed(1)}/10</Text>
              </View>
              <View>
                <Text style={styles.label}>Memory</Text>
                <Text style={styles.value}>{overallScore.memory.toFixed(1)}/10</Text>
              </View>
              <View>
                <Text style={styles.label}>Personality Fit</Text>
                <Text style={styles.value}>{overallScore.personalityFit.toFixed(1)}/10</Text>
              </View>
              <View>
                <Text style={styles.label}>Critical Thinking</Text>
                <Text style={styles.value}>{overallScore.criticalThinking.toFixed(1)}/10</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integrity</Text>
          {attempt.integrityEvents.length === 0 ? (
            <Text style={{ color: "#6b7280" }}>No focus or clipboard events recorded.</Text>
          ) : (
            <>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 6 }}>
                {Object.entries(integrityCounts).map(([type, count]) => (
                  <Text
                    key={type}
                    style={{
                      backgroundColor: "#fef3c7",
                      color: "#92400e",
                      fontSize: 8,
                      fontWeight: 700,
                      borderRadius: 8,
                      paddingVertical: 3,
                      paddingHorizontal: 6,
                      marginRight: 6,
                      marginBottom: 4,
                    }}
                  >
                    {INTEGRITY_LABELS[type] ?? type}: {count}
                  </Text>
                ))}
              </View>
              <Text style={styles.subtle}>
                Most recent: {attempt.integrityEvents[0].occurredAt.toLocaleString()}. Informational
                only — no automatic action is taken on an assessment based on these events.
              </Text>
            </>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>IQ Point</Text>
            <Text style={styles.value}>
              {attempt.iqScore ?? "—"}
              {attempt.iqMax ? ` / ${attempt.iqMax}` : ""}
            </Text>
          </View>
          {iqIndex ? (
            <>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                <View>
                  <Text style={styles.label}>IQ Index</Text>
                  <Text style={styles.scoreHeadline}>{iqIndex.index}</Text>
                </View>
                <View>
                  <Text style={styles.label}>% of 110 Benchmark</Text>
                  <Text style={styles.value}>{iqIndex.benchmarkPct}%</Text>
                </View>
                <View>
                  <Text style={styles.label}>Rating</Text>
                  <Text style={styles.value}>{iqIndex.label}</Text>
                </View>
              </View>
              <Text style={styles.subtle}>
                A presentation-friendly index derived from this round&apos;s percentage correct
                (not a clinical IQ score), benchmarked against 110 — a commonly used
                &ldquo;above average&rdquo; reference point.
              </Text>
            </>
          ) : (
            <Text style={{ color: "#9ca3af" }}>Not reached yet.</Text>
          )}
        </View>

        <View style={styles.section} wrap>
          <Text style={styles.sectionTitle}>Cognitive Analysis (AI-Generated)</Text>
          {iqSummary ? (
            <View>
              <Text style={styles.bold}>Cognitive Strengths</Text>
              <BulletList items={iqSummary.cognitiveStrengths} />
              <Text style={styles.bold}>Areas for Improvement</Text>
              <BulletList items={iqSummary.areasForImprovement} />
              <Text style={styles.bold}>Reasoning Style</Text>
              <Text style={styles.paragraph}>{iqSummary.reasoningStyle}</Text>
              <Text style={styles.bold}>Performance Analysis</Text>
              <Text style={styles.paragraph}>{iqSummary.performanceAnalysis}</Text>
            </View>
          ) : (
            <Text style={{ fontStyle: "italic", color: "#9ca3af" }}>Not yet analyzed.</Text>
          )}
        </View>

        <McqReviewPdf title="IQ Test — Question Review" score={attempt.iqScore} max={attempt.iqMax} answers={iqAnswers} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personality Type</Text>
          {personalityArchetype ? (
            <>
              <Text style={styles.archetypeName}>{personalityArchetype.name}</Text>
              <Text style={styles.archetypeTagline}>{personalityArchetype.tagline}</Text>
              <Text style={styles.paragraph}>{personalityArchetype.description}</Text>
              <Text style={styles.bold}>Ideal Environment</Text>
              <Text style={styles.paragraph}>{personalityArchetype.idealEnvironment}</Text>
            </>
          ) : (
            <Text style={{ color: "#9ca3af" }}>Not reached yet.</Text>
          )}
          {Object.keys(traitScores).length > 0 && (
            <View style={{ marginTop: 4 }}>
              {PERSONALITY_TRAITS.map((trait) => {
                const score = traitScores[trait];
                if (score === undefined) return null;
                return <ScoreBarPdf key={trait} label={TRAIT_LABELS[trait]} score={score} />;
              })}
            </View>
          )}
        </View>

        <View style={styles.section} wrap>
          <Text style={styles.sectionTitle}>Personality Profile (AI-Generated)</Text>
          {personalitySummary ? (
            <View>
              <Text style={styles.paragraph}>{personalitySummary.generalCharacteristics}</Text>
              <Text style={styles.bold}>Communication Style</Text>
              <Text style={styles.paragraph}>{personalitySummary.communicationStyle}</Text>
              <Text style={styles.bold}>Leadership Style</Text>
              <Text style={styles.paragraph}>{personalitySummary.leadershipStyle}</Text>
              <Text style={styles.bold}>Strengths</Text>
              <BulletList items={personalitySummary.strengths} />
              <Text style={styles.bold}>Areas for Development</Text>
              <BulletList items={personalitySummary.weaknesses} />
              <Text style={styles.bold}>Work Preferences</Text>
              <Text style={styles.paragraph}>{personalitySummary.workPreferences}</Text>
              <Text style={styles.bold}>Suitable Roles</Text>
              <BulletList items={personalitySummary.suitableRoles} />
              <Text style={styles.bold}>Potential Challenges</Text>
              <BulletList items={personalitySummary.potentialChallenges} />
            </View>
          ) : (
            <Text style={{ fontStyle: "italic", color: "#9ca3af" }}>Not yet analyzed.</Text>
          )}
        </View>

        <McqReviewPdf title="Math Test" score={attempt.mathScore} max={attempt.mathMax} answers={mathAnswers} />

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>Memory Test</Text>
            <Text style={styles.value}>
              {attempt.memoryAccuracyPct !== null ? `${attempt.memoryAccuracyPct}%` : "—"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={styles.label}>Hits</Text>
              <Text style={styles.value}>{memoryStats.hits}</Text>
            </View>
            <View>
              <Text style={styles.label}>Misses</Text>
              <Text style={styles.value}>{memoryStats.misses}</Text>
            </View>
            <View>
              <Text style={styles.label}>False Alarms</Text>
              <Text style={styles.value}>{memoryStats.falseAlarms}</Text>
            </View>
            <View>
              <Text style={styles.label}>Correct Rejections</Text>
              <Text style={styles.value}>{memoryStats.correctRejections}</Text>
            </View>
          </View>
          <Text style={[styles.label, { marginTop: 8 }]}>Avg. Reaction Time (on hits)</Text>
          <Text style={styles.value}>
            {attempt.memoryAvgReactionMs !== null ? `${attempt.memoryAvgReactionMs} ms` : "—"}
          </Text>
        </View>

        <View style={styles.section} wrap>
          <Text style={styles.sectionTitle}>Interview Questions (Critical Thinking)</Text>
          {interviewQuestions.length === 0 && (
            <Text style={{ color: "#9ca3af" }}>Not reached yet.</Text>
          )}
          {interviewQuestions.map((q, i) => (
            <View key={q.scenarioId} style={styles.question} wrap={false}>
              <Text style={[styles.label, styles.bold, { marginBottom: 2 }]}>
                Question {i + 1}
              </Text>
              <Text style={{ marginBottom: 6 }}>{q.prompt}</Text>
              {q.response ? (
                <>
                  <Text style={[styles.label, styles.bold, { marginBottom: 2 }]}>
                    Candidate&rsquo;s Response
                  </Text>
                  <Text style={{ marginBottom: 6 }}>{q.response}</Text>
                </>
              ) : (
                <Text style={{ color: "#9ca3af", marginBottom: 6 }}>Not reached yet.</Text>
              )}
              {q.scores ? (
                <View style={{ marginBottom: 6 }}>
                  {Object.entries(CT_DIMENSION_LABELS).map(([key, label]) => {
                    const score = q.scores?.[key];
                    if (score === undefined) return null;
                    return <ScoreBarPdf key={key} label={label} score={score} />;
                  })}
                </View>
              ) : q.response ? (
                <Text style={{ fontStyle: "italic", color: "#9ca3af", marginBottom: 6 }}>Not yet analyzed.</Text>
              ) : null}
              {q.summary && (
                <>
                  <Text style={[styles.label, styles.bold, { marginBottom: 2 }]}>AI Grading Summary</Text>
                  <Text>{q.summary}</Text>
                </>
              )}
            </View>
          ))}
        </View>

        {technicalScreeningQuestions.length > 0 && (
          <View style={styles.section} wrap>
            <View style={styles.row}>
              <Text style={styles.sectionTitle}>Technical Screening</Text>
              {technicalScreeningScore && (
                <Text style={styles.value}>
                  {technicalScreeningScore.pointsAwarded} / {technicalScreeningScore.maxPoints} (
                  {technicalScreeningScore.pct}%)
                </Text>
              )}
            </View>
            {Array.from(new Set(technicalScreeningQuestions.map((q) => q.topic))).map((topic) => (
              <View key={topic}>
                <Text style={styles.topicHeading}>{topic}</Text>
                {technicalScreeningQuestions
                  .filter((q) => q.topic === topic)
                  .map((q) => (
                    <View key={q.questionId} style={styles.question} wrap={false}>
                      <View style={styles.row}>
                        <Text style={[styles.bold, { flex: 1 }]}>{q.prompt}</Text>
                        <Text style={styles.label}>
                          {q.maxPoints === 0 ? "Not scored" : `${q.pointsAwarded ?? "—"} / ${q.maxPoints} pts`}
                        </Text>
                      </View>
                      {q.options.length > 0 ? (
                        <View style={{ marginTop: 2 }}>
                          {q.options.map((opt, i) => {
                            const style =
                              i === q.correctIndex
                                ? styles.optionCorrect
                                : i === q.selectedIndex
                                  ? styles.optionSelected
                                  : styles.optionNeutral;
                            return (
                              <Text key={i} style={style}>
                                {opt}
                                {i === q.selectedIndex ? " (candidate's answer)" : ""}
                                {i === q.correctIndex ? " (correct)" : ""}
                              </Text>
                            );
                          })}
                          {q.selectedIndex === null && (
                            <Text style={{ color: "#9ca3af", fontSize: 8, marginTop: 2 }}>
                              No answer selected.
                            </Text>
                          )}
                        </View>
                      ) : (
                        <>
                          <Text style={{ marginTop: 2 }}>{q.response || "Not answered."}</Text>
                          <Text style={styles.refAnswer}>Reference: {q.referenceAnswer}</Text>
                          {q.feedback && <Text style={styles.refAnswer}>{q.feedback}</Text>}
                        </>
                      )}
                    </View>
                  ))}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer} fixed>
          Engrity — Assessment Certificate — Generated {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  );
}
