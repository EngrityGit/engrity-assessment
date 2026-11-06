import type { RoundName } from "@/lib/quiz";

export interface PracticeItem {
  question: string;
  options: string[];
  correct: number;
  explain: string;
}

export interface RoundGuide {
  headline: string;
  measures: string;
  howItWorks: string[];
  tips: string[];
  practice: PracticeItem;
  /** Optional example of what a strong answer looks like (written rounds). */
  modelOutline?: { title: string; steps: string[] };
}

export const ROUND_GUIDES: Record<RoundName, RoundGuide> = {
  MATH: {
    headline: "Numbers under time pressure",
    measures: "Practical arithmetic and quantitative reasoning — the kind used for measurements, tolerances, rates and unit conversions on site.",
    howItWorks: [
      "Each question has one correct answer out of several options.",
      "Move forward and back freely; your answers are saved as you click.",
      "Unanswered questions score zero, so guess if you are running out of time — there is no negative marking.",
      "Options appear in a different order for every candidate.",
    ],
    tips: [
      "Skim all questions first and answer the quick ones before the slow ones.",
      "Write rough working in your head or on paper beside you — paper and a basic pen are fine; phones, calculators and other devices are not.",
      "Check units (mm vs m, psi vs kPa) before choosing an option.",
      "Eliminate clearly wrong options first; it doubles your odds when you must guess.",
    ],
    practice: {
      question: "A 6 m pipe spool is cut into pieces of 750 mm. How many full pieces can be cut?",
      options: ["6", "7", "8", "9"],
      correct: 2,
      explain: "6 m = 6000 mm. 6000 ÷ 750 = 8 exactly, so 8 pieces. Converting units first is the key step.",
    },
  },
  PERSONALITY: {
    headline: "How you naturally work",
    measures: "Five work-style traits: teamwork, conscientiousness, stress tolerance, adaptability and leadership. There are no right or wrong answers.",
    howItWorks: [
      "You rate how much you agree with each statement from Strongly Disagree to Strongly Agree.",
      "Some statements are worded in reverse on purpose to check consistency.",
      "Your profile is summarised for the hiring team — it is not a pass/fail score on its own.",
    ],
    tips: [
      "Answer how you actually behave at work, not how you think we want you to be.",
      "Go with your first instinct; over-thinking rarely helps.",
      "Avoid choosing 'Neutral' for everything — it tells us nothing about you.",
    ],
    practice: {
      question: "Statement: “I double-check my work before I hand it over.” What is the best way to answer?",
      options: [
        "Pick whatever sounds most impressive",
        "Pick the option that honestly matches your usual behaviour",
        "Always pick Neutral to be safe",
        "Think about it for several minutes",
      ],
      correct: 1,
      explain: "Honest answers give an accurate profile, which also helps you land in a role that suits you.",
    },
  },
  MEMORY: {
    headline: "Spot the repeat",
    measures: "Short-term visual memory and reaction speed — useful for noticing repeated indications, labels and details.",
    howItWorks: [
      "Shapes appear one at a time for about two seconds each.",
      "If a shape is one you have already seen earlier in the sequence, press “Seen it!” straight away.",
      "If it is new, do nothing — it moves on by itself.",
      "Accuracy matters more than speed, but both are recorded.",
    ],
    tips: [
      "Say each new shape + colour silently to yourself to lock it in.",
      "Don't press if you aren't sure it's a repeat — false alarms count against you.",
      "Stay relaxed; the sequence has no tricks beyond repeats at varying gaps.",
    ],
    practice: {
      question: "You see: red circle → blue square → red circle. What should you do on the third shape?",
      options: ["Do nothing", "Press “Seen it!”", "Wait and press on the next shape", "Refresh the page"],
      correct: 1,
      explain: "The third shape repeats the first, so press “Seen it!” immediately.",
    },
  },
  IQ: {
    headline: "Patterns and logic",
    measures: "Abstract reasoning — spotting rules in sequences, shapes and matrices.",
    howItWorks: [
      "Questions get harder as you go. Some show shape grids where one cell is missing.",
      "Pick the option that completes the pattern by following the rule across rows and columns.",
      "You can revisit earlier questions before submitting.",
    ],
    tips: [
      "Look for what changes (size, count, position, colour) and what stays the same.",
      "In grids, check each row, then each column, then diagonals.",
      "If you're stuck after about a minute, move on and come back.",
    ],
    practice: {
      question: "What comes next?  3, 6, 12, 24, ?",
      options: ["30", "36", "48", "60"],
      correct: 2,
      explain: "Each number doubles the previous one: 24 × 2 = 48.",
    },
  },
  CRITICAL_THINKING: {
    headline: "Show how you think on site",
    measures: "Decision-making, safety awareness, risk assessment, communication and problem-solving, judged from short written scenario answers.",
    howItWorks: [
      "You get several workplace scenarios and write your response in your own words.",
      "There is no single correct answer — we read your reasoning.",
      "Each answer needs at least a few sentences. Longer is not automatically better; specific is better.",
      "Pasting, dictating or auto-completing text is blocked and logged, and answers are screened for AI-written text.",
    ],
    tips: [
      "Lead with safety: stop, make the situation safe, then think.",
      "Name concrete actions, who you would tell, and what you would document.",
      "Mention what you would NOT do and why. Trade-offs show judgement.",
      "Use your real experience — first-hand details are the strongest signal.",
    ],
    practice: {
      question: "Which opening to a scenario answer is strongest?",
      options: [
        "“I would just continue as the schedule is tight.”",
        "“I would stop work, secure the area, notify my supervisor and record what I saw before deciding next steps.”",
        "“It depends.”",
        "“I would ask a colleague what to do.”",
      ],
      correct: 1,
      explain: "It puts safety first, escalates correctly and mentions documentation — concrete, ordered and specific.",
    },
    modelOutline: {
      title: "A simple structure that works",
      steps: ["Make it safe (stop / isolate / warn others)", "Assess the facts and risks", "Decide and act within your authority", "Escalate and communicate", "Document and follow up"],
    },
  },
  TECHNICAL_SCREENING: {
    headline: "Your trade knowledge",
    measures: "Role-specific technical knowledge from your own experience — codes, procedures, drawings, equipment and good practice.",
    howItWorks: [
      "Questions are grouped by topic. Some are multiple choice, others are short written answers.",
      "Written answers are graded against a reference answer — partial credit is given.",
      "You must answer every question before you can submit.",
      "This is a long round, so watch the clock and pace yourself.",
    ],
    tips: [
      "Short and specific beats long and vague — you don't need full sentences.",
      "Cite the code, clause, instrument or procedure by name when you know it.",
      "If you don't know, write what you would check and where you would find it — honest partial answers earn partial credit.",
      "Don't search online or ask anyone — it is monitored, and being found out costs far more than a wrong answer.",
    ],
    practice: {
      question: "Which written answer to “What do you check on an MTR?” would earn the most credit?",
      options: [
        "“Everything looks fine.”",
        "“Heat number matches the pipe, grade and spec match the PO, chemistry and mechanicals meet the spec, signed and dated.”",
        "“I ask the supervisor.”",
        "“I don't remember.”",
      ],
      correct: 1,
      explain: "It's specific, ordered and names the key checks — exactly what a reference answer looks for.",
    },
  },
};

export const RULES = [
  "I will complete this round on my own, without AI tools, search engines, notes from other people or other devices.",
  "I understand that switching tabs, leaving full screen, copying or pasting give warnings, and that a fourth warning closes my test automatically.",
  "I understand my typing and focus activity are recorded and my written answers are screened for AI-generated text.",
];
