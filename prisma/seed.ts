import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { extraIqQuestions } from "./iq-extra";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const mathQuestions = [
  {
    prompt:
      "A store marks up an item by 40%, then later offers a 20% discount off the marked-up price. What is the net change from the original price?",
    options: ["+8%", "+12%", "+20%", "+28%"],
    correctIndex: 1,
  },
  {
    prompt:
      "Two pipes fill a tank in 6 hours and 8 hours on their own. Working together, how long will they take?",
    options: ["3.5 hours", "24/7 hours", "4 hours", "7 hours"],
    correctIndex: 1,
  },
  {
    prompt:
      "The ratio of boys to girls in a class is 3:5, and there are 40 students in total. How many girls are there?",
    options: ["15", "20", "24", "25"],
    correctIndex: 3,
  },
  {
    prompt:
      "A car depreciates 15% per year. If it is worth $20,000 now, what will it be worth after 2 years (to the nearest $100)?",
    options: ["$14,000", "$14,450", "$15,300", "$17,000"],
    correctIndex: 1,
  },
  {
    prompt: "Simplify: (3/4) ÷ (2/3)",
    options: ["1/2", "2", "8/9", "9/8"],
    correctIndex: 3,
  },
  {
    prompt:
      "A recipe needs 2.5 cups of flour for 20 cookies. How many cups of flour are needed for 32 cookies?",
    options: ["3.2", "4", "4.5", "5"],
    correctIndex: 1,
  },
  {
    prompt:
      "The average of 5 numbers is 18. After removing one number, the average of the remaining 4 is 20. What was the removed number?",
    options: ["8", "10", "12", "15"],
    correctIndex: 1,
  },
  {
    prompt: "What is 7² − 5²?",
    options: ["12", "14", "24", "49"],
    correctIndex: 2,
  },
  {
    prompt: "A train leaves at 2:15 PM and arrives at 5:48 PM. How long was the journey?",
    options: ["3h 23m", "3h 30m", "3h 33m", "3h 43m"],
    correctIndex: 2,
  },
  {
    prompt:
      "y is inversely proportional to x. When x = 4, y = 12. What is y when x = 6?",
    options: ["6", "8", "9", "18"],
    correctIndex: 1,
  },
];

const iqQuestions = [
  {
    prompt: "Complete the sequence: 1, 4, 9, 16, 25, ?",
    options: ["30", "32", "36", "49"],
    correctIndex: 2,
  },
  {
    prompt: "Complete the sequence: 3, 6, 11, 18, 27, ?",
    options: ["36", "37", "38", "40"],
    correctIndex: 2,
  },
  {
    prompt: "Book is to Library as Painting is to ?",
    options: ["Artist", "Frame", "Museum", "Wall"],
    correctIndex: 2,
  },
  {
    prompt: "Which one does not belong with the others?",
    options: ["Cod", "Dolphin", "Salmon", "Trout"],
    correctIndex: 1,
  },
  {
    prompt:
      "If FLOWER is coded as GMPXFS (each letter shifted forward by one in the alphabet), how is GARDEN coded the same way?",
    options: ["GBSEFO", "HBSEFO", "HBSFEO", "HCSEFO"],
    correctIndex: 1,
  },
  {
    prompt: "Complete the sequence: 2, 3, 5, 8, 13, ?",
    options: ["18", "20", "21", "24"],
    correctIndex: 2,
  },
  {
    prompt: "Which word does not belong with the others?",
    options: ["Chair", "Mumble", "Shout", "Whisper"],
    correctIndex: 0,
  },
  {
    prompt:
      "Some Zips are Bops. All Bops are Corns. Which statement must be true?",
    options: [
      "All Corns are Zips.",
      "All Zips are Corns.",
      "No Zips are Corns.",
      "Some Zips are Corns.",
    ],
    correctIndex: 3,
  },
  {
    prompt:
      "A shape pattern has 3 sides, then 4 sides, then 5 sides. Which shape below continues the pattern with 6 sides?",
    options: [
      "SHAPE:hexagon:0b2545:0",
      "SHAPE:circle:0b2545:0",
      "SHAPE:star:0b2545:0",
      "SHAPE:triangle:0b2545:0",
    ],
    correctIndex: 0,
  },
  {
    prompt:
      "A shape rotates 90° clockwise at each step: 0°, 90°, 180°, 270°, then the pattern repeats. Which rotation comes next?",
    options: [
      "SHAPE:triangle:1c7293:0",
      "SHAPE:triangle:1c7293:90",
      "SHAPE:triangle:1c7293:180",
      "SHAPE:triangle:1c7293:270",
    ],
    correctIndex: 0,
  },
  {
    prompt:
      "A shape grows steadily larger at each step: small, medium, large, then ? Which option shows the correct next size?",
    options: [
      "SHAPE:circle:134074:0:0.6",
      "SHAPE:circle:134074:0:1.0",
      "SHAPE:circle:134074:0:1.3",
      "SHAPE:circle:134074:0:1.7",
    ],
    correctIndex: 3,
  },
];

iqQuestions.push(...extraIqQuestions);

const personalityStatements: {
  statement: string;
  trait: "TEAMWORK" | "CONSCIENTIOUSNESS" | "STRESS_TOLERANCE" | "ADAPTABILITY" | "LEADERSHIP";
  reverseScored: boolean;
}[] = [
  { statement: "I prefer working as part of a team rather than alone.", trait: "TEAMWORK", reverseScored: false },
  { statement: "I find it difficult to trust colleagues with important tasks.", trait: "TEAMWORK", reverseScored: true },
  { statement: "I actively help coworkers who are struggling with their workload.", trait: "TEAMWORK", reverseScored: false },
  { statement: "I get more done when I work independently, without input from others.", trait: "TEAMWORK", reverseScored: true },

  { statement: "I double-check my work before considering it finished.", trait: "CONSCIENTIOUSNESS", reverseScored: false },
  { statement: "I often leave tasks unfinished when something more interesting comes up.", trait: "CONSCIENTIOUSNESS", reverseScored: true },
  { statement: "I keep my commitments even when it's inconvenient.", trait: "CONSCIENTIOUSNESS", reverseScored: false },
  { statement: "I tend to be careless with details when I'm under time pressure.", trait: "CONSCIENTIOUSNESS", reverseScored: true },

  { statement: "I stay calm when things don't go as planned.", trait: "STRESS_TOLERANCE", reverseScored: false },
  { statement: "Unexpected problems at work make me anxious for the rest of the day.", trait: "STRESS_TOLERANCE", reverseScored: true },
  { statement: "I can keep working effectively even during high-pressure situations.", trait: "STRESS_TOLERANCE", reverseScored: false },
  { statement: "Criticism from a supervisor tends to affect my mood for days.", trait: "STRESS_TOLERANCE", reverseScored: true },

  { statement: "I adjust quickly when priorities change at short notice.", trait: "ADAPTABILITY", reverseScored: false },
  { statement: "I get frustrated when a plan I'm following has to change.", trait: "ADAPTABILITY", reverseScored: true },
  { statement: "I enjoy learning new tools or methods, even if my current way works fine.", trait: "ADAPTABILITY", reverseScored: false },
  { statement: "I prefer sticking to familiar routines over trying new approaches.", trait: "ADAPTABILITY", reverseScored: true },

  { statement: "I'm comfortable taking charge when a group lacks direction.", trait: "LEADERSHIP", reverseScored: false },
  { statement: "I avoid speaking up even when I disagree with a decision.", trait: "LEADERSHIP", reverseScored: true },
  { statement: "Others often come to me for guidance on how to handle a problem.", trait: "LEADERSHIP", reverseScored: false },
  { statement: "I'd rather follow someone else's plan than propose my own.", trait: "LEADERSHIP", reverseScored: true },
];

const criticalThinkingScenarios: {
  role: "NDT" | "ROPE_ACCESS" | "QC_INSPECTION" | "CIVIL" | "WELDING" | "COATING" | "ELECTRICAL_INSTRUMENTATION" | "PROJECT_MANAGEMENT" | "GEOTECHNICAL" | "ACCOUNTS" | "HR" | "SALES" | "OPERATIONS" | "DIGITAL_MARKETING" | null;
  prompt: string;
}[] = [
  {
    role: null,
    prompt:
      "You're partway through a scheduled inspection when you realize the client gave you the wrong equipment specification sheet — the one you have doesn't match what's actually installed on site. The client's site contact is unavailable for the next two hours, and you're expected to report findings before the end of the day. Walk through how you would handle this situation, including what you would and would not do, and why.",
  },
  {
    role: null,
    prompt:
      "A coworker you're paired with on a job asks you to sign off on part of an inspection report for a section they didn't fully complete, saying it will 'probably be fine' and that they're confident in their assessment. Describe how you would respond and what factors would shape your decision.",
  },
  {
    role: "NDT",
    prompt:
      "During an ultrasonic thickness inspection on a pressure vessel, you detect a reading that suggests possible wall thinning beyond the acceptable threshold, but the reading is inconsistent with two adjacent measurement points that appear normal. The client's maintenance team is pushing to close out the inspection today so the vessel can be returned to service. Explain how you would proceed, what you would document, and how you would communicate your findings.",
  },
  {
    role: "ROPE_ACCESS",
    prompt:
      "You're rigged up and partway through a rope access descent to inspect a section of a wind turbine blade when you notice unexpected wear on a piece of your personal protective equipment that wasn't apparent during your pre-climb inspection. Weather conditions are still good, but a storm front is forecast to arrive in about 90 minutes. Describe your decision-making process and what you would do next.",
  },
  {
    role: "ACCOUNTS",
    prompt:
      "While reconciling invoices at month-end, you notice a paid vendor invoice is $4,000 higher than the corresponding purchase order, with no change order on file. The vendor is a long-standing supplier your company relies on, and your manager is on leave until next week. The finance books need to close in two days. Explain how you would investigate the discrepancy and what you would do before the books close.",
  },
  {
    role: "HR",
    prompt:
      "An employee comes to you privately and reports that a colleague has been making them uncomfortable with repeated comments, but asks you not to tell anyone or take any formal action because they're worried about workplace fallout. Walk through how you would handle this situation, including what you can and can't promise them, and what steps you would take next.",
  },
  {
    role: "SALES",
    prompt:
      "A prospective client says they'll sign a large contract today only if you verbally guarantee a delivery timeline that's faster than what operations has confirmed is realistic. Your quarterly target depends on closing this deal. Explain how you would handle the conversation and what you would and would not commit to.",
  },
  {
    role: "OPERATIONS",
    prompt:
      "Two field crews are scheduled for the same day, but you've just learned one crew is short two technicians due to last-minute illness. Both jobs have clients who were told their work is a priority. Explain how you would decide what to do, who you would communicate with, and in what order.",
  },
  {
    role: "DIGITAL_MARKETING",
    prompt:
      "A client asks you to keep running an ad campaign with a performance claim that recent data suggests is no longer accurate, arguing that pulling it now would hurt this month's numbers. The campaign is generating strong engagement. Explain how you would respond and what you would do next.",
  },
  {
    role: null,
    prompt:
      "You notice that a piece of equipment you're about to use for the day's work has a visible defect that isn't severe enough to obviously fail a quick visual check, but makes you unsure whether it's still within tolerance. The job is already running behind schedule and a spare isn't immediately available. Walk through how you would decide what to do.",
  },
  {
    role: null,
    prompt:
      "You're asked to take over a task partway through from a colleague who has gone on leave, but their notes are incomplete and you can't reach them. The deadline hasn't moved. Describe how you would approach picking up the work and what you would do about the gaps in the handover.",
  },
  {
    role: "QC_INSPECTION",
    prompt:
      "You're conducting a final quality check on a batch of components before they ship, and one unit fails on a minor dimensional tolerance while the rest pass cleanly. The production supervisor argues the failure is likely a measurement error and wants the batch released on schedule. Explain how you would handle the situation and what you would document.",
  },
  {
    role: "CIVIL",
    prompt:
      "During a routine site visit, you notice a section of formwork that appears to deviate slightly from the approved structural drawings, but the crew foreman insists it was cleared verbally by the site engineer, who is now off-site and unreachable. Concrete is scheduled to be poured within the hour. Walk through how you would handle this.",
  },
  {
    role: "WELDING",
    prompt:
      "You've just completed a weld and, on your own visual inspection, you notice a small area of undercut that's borderline against the acceptance criteria in the job spec. The next shift is waiting to move the piece forward in the line, and re-doing the weld would cause a delay. Explain what you would do and how you would communicate it.",
  },
  {
    role: "COATING",
    prompt:
      "You're applying a protective coating and partway through the job the weather shifts — humidity rises above the manufacturer's recommended application range, though it's not dramatically outside it. Halting now means falling behind schedule and possibly re-mobilizing later at extra cost. Describe how you would decide whether to continue, pause, or escalate.",
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION",
    prompt:
      "While calibrating an instrument loop, you get a reading that's inconsistent with the reference standard, but re-checking would mean pulling the system offline during a window the client specifically asked you to avoid. Explain how you would weigh the options and what you would do.",
  },
  {
    role: "PROJECT_MANAGEMENT",
    prompt:
      "Two weeks before a major deliverable is due, your lead technical resource tells you privately they don't think the current approach will meet the client's requirements, but the rest of the team is confident and morale is already fragile after a difficult few months. Describe how you would handle this information and what you would do next.",
  },
  {
    role: "GEOTECHNICAL",
    prompt:
      "Soil test results from a new borehole come back showing conditions notably different from the assumptions in the original site investigation report, which the design team has already built their foundation plan around. The client is eager to move to construction. Explain how you would handle communicating and acting on this finding.",
  },
  {
    role: "NDT",
    prompt:
      "You're the second inspector reviewing a colleague's radiographic film interpretation before sign-off, and you read one indication differently than they did — enough that it could change the accept/reject decision. Your colleague is confident in their read and has more years of experience than you. Explain how you would handle the disagreement.",
  },
  {
    role: "ROPE_ACCESS",
    prompt:
      "Midway through a multi-day rope access project, a new team member assigned to work with you seems to be cutting corners on their pre-use equipment checks when they think no one is watching. You don't have direct authority over their supervision. Describe how you would handle this.",
  },
  {
    role: "ACCOUNTS",
    prompt:
      "You discover that a recurring expense has been miscategorized in the books for the past several months in a way that makes departmental spending look better than it actually is. Correcting it will make a manager's budget numbers look worse right before a review. Explain how you would handle the correction and the conversation around it.",
  },
  {
    role: "HR",
    prompt:
      "You're finalizing a hiring decision and the hiring manager's top pick is a strong technical fit, but two people who interviewed the candidate independently flagged similar concerns about how they described handling a past workplace conflict. Explain how you would factor this into the process and what you would communicate to the hiring manager.",
  },
  {
    role: "SALES",
    prompt:
      "You're near the end of the quarter and a smaller, easier deal would guarantee you hit target, while a larger deal that's still in play could push you well past it but has a real chance of falling through in the next few days. Walk through how you would approach prioritizing your time between the two.",
  },
  {
    role: "OPERATIONS",
    prompt:
      "A supplier who has always delivered on time notifies you of a shipment delay that will affect a client commitment made publicly last week. You have a backup supplier, but they're notably more expensive and you'd need approval to use them. Explain how you would handle the next 24 hours.",
  },
  {
    role: "DIGITAL_MARKETING",
    prompt:
      "You're reviewing analytics ahead of a campaign report and notice a tracking configuration error that likely inflated last month's reported conversions — numbers that were already presented positively to the client. Explain how you would handle correcting this and communicating it.",
  },
];

// Transcribed from Engrity's internal phone-screening script
// ("Screen Script QC-EI-Coating.docx"), turned into individually gradable
// online exam questions. Each question is graded against its
// referenceAnswer via AI (src/lib/ai.ts:gradeTechnicalScreeningResponse),
// out of maxPoints. Role-conditional: only QC_INSPECTION and
// ELECTRICAL_INSTRUMENTATION candidates get this round for now (see
// pickTechnicalScreeningQuestions in src/app/actions/attempt.ts).
const technicalScreeningQuestions: {
  role: "QC_INSPECTION" | "ELECTRICAL_INSTRUMENTATION" | "NDT" | "COATING" | "CIVIL" | "ACCOUNTS" | "SALES" | "DIGITAL_MARKETING" | "GEOTECHNICAL";
  topic: string;
  prompt: string;
  referenceAnswer: string;
  maxPoints: number;
  options?: string[];
  correctIndex?: number;
}[] = [
  // --- QC / Piping technical proficiency ---
  {
    role: "QC_INSPECTION", topic: "Inspection Test Plan (ITP)",
    prompt: "What is your experience with Inspection Test Plans (ITPs) — have you created them, followed them, or both?",
    referenceAnswer: "Either creating or following ITPs counts.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Inspection Test Plan (ITP)",
    prompt: "What documents are required to create an ITP?",
    referenceAnswer: "PO, Scope of Work, Technical Specifications, Code of Construction.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Inspection Test Plan (ITP)",
    prompt: "If you've only followed an ITP (not created one), what information will there be on it?",
    referenceAnswer: "The different stages of the work/inspection.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Inspection Test Plan (ITP)",
    prompt: "What is the difference between a Hold Point and a Witness Point?",
    referenceAnswer: "Hold Point: work must not proceed without approval first. Witness Point: you inform the relevant party, and if they are unavailable you may proceed.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Drawings",
    prompt: "What types of drawings have you come across in your QC work?",
    referenceAnswer: "P&ID's, Isometrics, PV (Pressure Vessel) drawings, GA (General Arrangement), etc.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Drawings",
    prompt: "What information will you see on an Isometric Drawing?",
    referenceAnswer: "Bill of Materials, Engineer stamp, pipe dimensions, as-built stamp, line details.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Drawings",
    prompt: "What information will you see on a P&ID (Process Flow Drawing)?",
    referenceAnswer: "Pump numbers, line drawings, flow directions, instrument numbers.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Drawings",
    prompt: "Are you familiar with Structural Drawings? What do you typically see on them?",
    referenceAnswer: "Yes/No, and more sectional details compared to piping drawings.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Drawings",
    prompt: "What is CJP in a drawing?",
    referenceAnswer: "Complete Joint Penetration.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Codes",
    prompt: "What codes have you worked with in the past?",
    referenceAnswer: "Typically B31.3 (process piping) or W59 (structural welding).", maxPoints: 1,
  },
  {
    role: "QC_INSPECTION", topic: "Codes",
    prompt: "What is required if there is a repair on a weld for spot/random radiography as per B31.3, and what happens if a tracer fails?",
    referenceAnswer: "2 tracers are taken; if 1 tracer fails, 2 more tracers are taken; if 1 of those fails, you must RT all the joints in that lot/class and reshoot (not all joints in the entire project).", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Codes",
    prompt: "What is the weld reinforcement allowance for wall thickness 1/4\" to 1/2\" as per B31.3?",
    referenceAnswer: "1/8\" or 3mm (also called the weld cap or final pass).", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Codes",
    prompt: "What is the minimum gap requirement for socket welds as per B31.3?",
    referenceAnswer: "1.5mm or 1/16\".", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Codes",
    prompt: "What is the code for welder qualifications?",
    referenceAnswer: "ASME Section 9.", maxPoints: 1,
  },
  {
    role: "QC_INSPECTION", topic: "Material Receiving",
    prompt: "Do you have experience receiving materials on site?",
    referenceAnswer: "Yes.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Material Receiving",
    prompt: "When you receive material, how do you make sure it's the correct material?",
    referenceAnswer: "Check as per drawing, PO, and the MTR (Material Test Report), and confirm there is no damage. The MTR is the key document.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Material Receiving",
    prompt: "How do you make sure that the MTR you have is the correct one for the material?",
    referenceAnswer: "The heat number on the material matches the heat number on the MTR.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Material Receiving",
    prompt: "Which code do you refer to for ensuring the material grade is acceptable?",
    referenceAnswer: "ASME Section 2, which has 4 volumes: Part A (ferrous materials), Part B (non-ferrous materials), Part C (consumables), Part D (material properties/details of A & B).", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Material Receiving",
    prompt: "What piping material grades have you come across? (\"Stainless\" or \"carbon\" alone is not a sufficient answer.)",
    referenceAnswer: "Specific grades such as A106 or A333 for pipe, A105 or A350 for flanges, A234 or A420 for fittings — at least one specific grade expected.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "WPS/PQR/WQR",
    prompt: "What is your experience with WPS/PQR (Welding Procedure Specification / Procedure Qualification Record)? How do you confirm you have the correct WPS for a job?",
    referenceAnswer: "Follow, create, or both — and confirming the correct WPS means comparing the WPS to the scope of work.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "WPS/PQR/WQR",
    prompt: "If you create WPS/PQR documents, what documents do you need to create them?",
    referenceAnswer: "Scope of Work, Drawings, Code.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "WPS/PQR/WQR",
    prompt: "Can you name a few essential variables on a WPS for stick welding (SMAW — Shielded Metal Arc Welding)?",
    referenceAnswer: "Base materials, filler materials, rod/wire process, PWHT (yes/no). (Note: when an essential variable changes, a new WPS is required.)", maxPoints: 1,
  },
  {
    role: "QC_INSPECTION", topic: "WPS/PQR/WQR",
    prompt: "What is the F# (F-number) for E6010 and E7018 electrodes?",
    referenceAnswer: "F3 for E6010, F4 for E7018.", maxPoints: 1,
  },
  {
    role: "QC_INSPECTION", topic: "WPS/PQR/WQR",
    prompt: "When a welder arrives on site, how do you verify their qualifications for the work?",
    referenceAnswer: "WQR (Welder Qualification Record), B-Pressure Tickets (for piping), CWB tickets (for structural), JM ticket, job test tickets (essential variables are on the back of the tickets).", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "WPS/PQR/WQR",
    prompt: "Can you name a few of the essential variables listed on the back of welder test tickets?",
    referenceAnswer: "F#, P#, Pipe Diameter, Progression, Position, Backing (plate on the root), process, materials.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "In Progress Welding",
    prompt: "During welding, what do you inspect?",
    referenceAnswer: "Rod oven plugged in, preheat, heat input, interpass temperature, rods/electrodes.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "In Progress Welding",
    prompt: "What is the formula for heat input?",
    referenceAnswer: "Heat Input = (Voltage × Amperes) ÷ (Travel Speed × 60). Travel speed is the distance welded in one minute.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "In Progress Welding",
    prompt: "What is the holding temperature for E-7018 rods to maintain heat?",
    referenceAnswer: "About 100°C (roughly 50-250°F is also an accepted answer, per manufacturer recommendations).", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "In Progress Welding",
    prompt: "What is allowed in terms of fit-up overlap/misalignment?",
    referenceAnswer: "As per the WPS (Welding Procedure Specification).", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "In Progress Welding",
    prompt: "How do you avoid pipe distortion during the welding process?",
    referenceAnswer: "Welding techniques such as staggering the pass, or clamping to structure.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Final Weld Inspection",
    prompt: "What document would you refer to before doing a visual inspection of piping welds?",
    referenceAnswer: "The drawings and the code of construction (B31.3).", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Final Weld Inspection",
    prompt: "What table in the code (B31.3) do you refer to for visual weld acceptance criteria?",
    referenceAnswer: "Table 341.3.2.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Final Weld Inspection",
    prompt: "What is the maximum allowed height of the weld root for 1/4\" wall pipe and below?",
    referenceAnswer: "1/16\".", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Final Weld Inspection",
    prompt: "What size of porosity is allowed on a weld for process piping as per B31.3?",
    referenceAnswer: "Zero.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Final Weld Inspection",
    prompt: "What will you do if there is an undercut (a small cut into the original pipe) found on a weld?",
    referenceAnswer: "It needs to be ground smooth or filled.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "NDT (Review)",
    prompt: "Do you review RT (radiographic testing) films? If yes, as per which code?",
    referenceAnswer: "ASME Section 5.", maxPoints: 1,
  },
  {
    role: "QC_INSPECTION", topic: "NDT (Review)",
    prompt: "If you don't review RT films directly, do you review the RT reports? What do you check on them?",
    referenceAnswer: "ID of welder, joint number, Code of Construction (B31.3), results, technical qualifications.", maxPoints: 1,
  },
  {
    role: "QC_INSPECTION", topic: "NDT (Review)",
    prompt: "When you review an RT film, what do you check?",
    referenceAnswer: "Density (darkness) and the Image Quality Indicator (IQI, which measures the quality of the wires visible).", maxPoints: 1,
  },
  {
    role: "QC_INSPECTION", topic: "NDT (Review)",
    prompt: "How do you know how many wires need to be visible on an IQI?",
    referenceAnswer: "Refer to code ASME Section 5, Article 2.", maxPoints: 1,
  },
  {
    role: "QC_INSPECTION", topic: "NDT (Review)",
    prompt: "What experience do you have with UT (ultrasonic testing)? If you review UT reports, what do you check?",
    referenceAnswer: "Code of acceptance, UT machine calibration, technician qualifications, requests, and sign off.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "NDT (Review)",
    prompt: "What experience do you have with MT (magnetic particle testing)? What current is typically used?",
    referenceAnswer: "AC (alternating current).", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "NDT (Review)",
    prompt: "What experience do you have with PT (liquid penetrant testing)? If you see a PT report, what will you be checking?",
    referenceAnswer: "Type of consumables used and sign off.", maxPoints: 1,
  },
  {
    role: "QC_INSPECTION", topic: "NDT (Review)",
    prompt: "Which article in ASME Section 5 covers liquid penetrant testing?",
    referenceAnswer: "Article 6.", maxPoints: 1,
  },
  {
    role: "QC_INSPECTION", topic: "Hydro Testing",
    prompt: "If you are doing a pre-hydro walkdown, what do you check?",
    referenceAnswer: "That all welds are complete on the pressure boundary.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Hydro Testing",
    prompt: "How many pressure gauges do you need for a hydro test, and where are they located?",
    referenceAnswer: "Minimum 2 gauges, located at the low point and the high point.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Hydro Testing",
    prompt: "Which gauge shows the test pressure during a hydro test?",
    referenceAnswer: "The top gauge (high point).", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Hydro Testing",
    prompt: "What is the maximum range a hydro test pressure gauge should be rated for?",
    referenceAnswer: "About 4 times the test pressure (e.g. 0-400 psi for a 100 psi test).", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Hydro Testing",
    prompt: "Do you have experience making a hydro test package? What items are in it?",
    referenceAnswer: "A marked-up P&ID, pressure test report, pressure test release, and calibration records for the gauges.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Flange Face Inspection",
    prompt: "What code do you refer to if there is any damage on a flange face?",
    referenceAnswer: "B16.5 (not B31.3).", maxPoints: 5,
  },
  {
    role: "QC_INSPECTION", topic: "Torquing Bolts",
    prompt: "Have you witnessed bolt torquing? If so, how many passes are typically done in the process?",
    referenceAnswer: "3-4 passes (e.g. for a 100 ft-lb target: 30%, 60%, 100%, then a final full pass all around).", maxPoints: 5,
  },
  {
    role: "QC_INSPECTION", topic: "Final Walkdowns",
    prompt: "What do you check when you do a final walkdown or re-instatement?",
    referenceAnswer: "Ensure check valves are installed correctly with proper direction, flange connections are torqued, proper supports are in place, and overall completion.", maxPoints: 5,
  },
  {
    role: "QC_INSPECTION", topic: "AB Forms (AB83 / AB81 / AB40)",
    prompt: "Have you ever completed an AB83 (pressure piping)? What items are required on it?",
    referenceAnswer: "WPS, Code of Construction, line number, hydro test pressure, % of NDT, signed by contractor/owner/client.", maxPoints: 3,
  },
  {
    role: "QC_INSPECTION", topic: "AB Forms (AB83 / AB81 / AB40)",
    prompt: "Have you ever completed an AB81 (construction completion)? What items are required on it?",
    referenceAnswer: "Type and location of plant, description of the pressure piping system, designation registration number, ABSA tracking number, and engineer/contractor.", maxPoints: 3,
  },
  {
    role: "QC_INSPECTION", topic: "AB Forms (AB83 / AB81 / AB40)",
    prompt: "Have you ever completed an AB40 (pressure vessel repair)? What items are required on it?",
    referenceAnswer: "A-number, equipment number, original and new design conditions, boiler/pressure vessel description, location of installation, description of work performed, heat treatment, pressure test results, ABSO signature and date.", maxPoints: 3,
  },
  {
    role: "QC_INSPECTION", topic: "Turnover",
    prompt: "Have you handled Turnover documentation from start to finish?",
    referenceAnswer: "Yes.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Turnover",
    prompt: "What's your experience with weld mapping, and what software have you used for it?",
    referenceAnswer: "Weld mapping experience with software such as Blue Beam, Acorn, or Adobe Pro.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Turnover",
    prompt: "Have you created and maintained welding logs?",
    referenceAnswer: "Yes.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Turnover",
    prompt: "Have you created and completed statutory forms?",
    referenceAnswer: "Yes.", maxPoints: 2,
  },
  {
    role: "QC_INSPECTION", topic: "Turnover",
    prompt: "What is your experience with calibration logs?",
    referenceAnswer: "Experience maintaining/reviewing calibration logs for inspection equipment.", maxPoints: 2,
  },

  // --- E/I (Electrical & Instrumentation) Inspector screening ---
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Field Inspection",
    prompt: "Have you ever done inspections on cables, cable tray, terminations, equipment torquing, or junction box installations?",
    referenceAnswer: "Yes.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Field Inspection",
    prompt: "Can you read termination and wiring drawings with proficiency?",
    referenceAnswer: "Yes.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Field Inspection",
    prompt: "If there is a missing terminal strip block identifier in a junction box, what would you do?",
    referenceAnswer: "Make a deficiency item of it on the inspection record.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Field Inspection",
    prompt: "If you were creating an inspection package for a cable tray inspection, what paperwork would it include?",
    referenceAnswer: "A location layout, a list of the tray tags to be inspected and the inspection check sheets, any specifications or tray installation standards, and any RFIs or FCRs that may affect it.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Field Inspection",
    prompt: "If you were torquing a piece of equipment, how would you find out the correct torque value for it?",
    referenceAnswer: "Check the equipment itself first for a stamped value, then look for a manufacturer's manual with values, then consult the applicable code book.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Field Inspection",
    prompt: "What are a few examples of typical PPE (personal protective equipment) you would need in a Live (energized) MCC Building?",
    referenceAnswer: "Hard hat, safety glasses, steel-toed boots, FR-rated coveralls with stripes, arc flash clothing (may be required), gloves, gas monitor (may be required), intrinsically safe radios (may be required).", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Field Inspection",
    prompt: "If you were inspecting an electrical hand switch, what are some things you would look for during the inspection?",
    referenceAnswer: "Ensure grounding is complete, mechanisms are functioning properly, breakers/fuses are the proper size, check for cleanliness/damage, megger switch phase-to-phase and phase-to-ground with system devices open, verify torque setting of bolted connections per manufacturer values, ensure line is terminated on top and load on bottom, ensure lamacoid is installed with proper identification.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Field Inspection",
    prompt: "Do you have experience with multimeters and doing loop tests on circuits?",
    referenceAnswer: "Yes — should be proficient with a multimeter when doing inspections.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Field Inspection",
    prompt: "At what voltage would you typically megger a cable with an insulation rating of 600V?",
    referenceAnswer: "1000V typically, though this can vary by company standard — worth confirming when unsure.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Field Inspection",
    prompt: "If there is a long stretch of cable tray that you believe should have an expansion joint in it, how would you find out if it's required?",
    referenceAnswer: "Check the prints and any notes on the tray layout, check the standards and specs for the job, check the prints for any RFI or deviations, and check the manufacturer's installation standard for minimum requirements.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Technical & Codes",
    prompt: "What is an NCR, and provide an example of when we would make one?",
    referenceAnswer: "Non Compliance Report — a report outlining a deviation from product, process, procedure, or compliance specifications. Examples: something not built as per approved Design Drawings, not within the design tolerances, the approved Method Statement wasn't followed, or the approved ITP wasn't followed.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Technical & Codes",
    prompt: "What are the typical tests for power cables?",
    referenceAnswer: "Continuity test, insulation resistance test, and for shielded medium voltage cables (usually over 1000V) a Hi-Pot test (Di-Electric Test).", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Technical & Codes",
    prompt: "What is an RFI, and provide an example of when we would issue one?",
    referenceAnswer: "Request for Information — issued when we face a problem in construction activities that we need to make the client aware of, to get a solution.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Technical & Codes",
    prompt: "What is an ITP? Explain what it's used for.",
    referenceAnswer: "Inspection Test Plan — an electrical inspector should ensure the construction team is aware of the different steps of the ITP and follows them; QC inspectors should perform their inspections as per the ITP steps.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Technical & Codes",
    prompt: "What device do we use for insulation resistance testing, and what voltage do we apply to a 120V cable for that test?",
    referenceAnswer: "A Megger is the test device; normally 500V is applied to test cables with a voltage range below 500V, which includes 120V.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Technical & Codes",
    prompt: "At what stage of the cabling process do we conduct the Hi-Pot test, and for what cables?",
    referenceAnswer: "After installation of the cable connection kit and before termination (to test the connection kit as well). Applicable to shielded medium voltage cables.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Technical & Codes",
    prompt: "What are three usual tasks for an electrical inspector?",
    referenceAnswer: "Reading drawings, knowledge of the CEC (Canadian Electrical Code, at least Part 1), report writing, and familiarity with different tests and their acceptance criteria.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Technical & Codes",
    prompt: "What is the best reference for the proper torque value when tightening bolts?",
    referenceAnswer: "Torque should be done as per the manufacturer's specifications.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Technical & Codes",
    prompt: "What are two typical tests for C/Ts (Current Transformers) and P/Ts (Potential Transformers)?",
    referenceAnswer: "Ratio test and polarity test.", maxPoints: 5,
  },
  {
    role: "ELECTRICAL_INSTRUMENTATION", topic: "E/I Technical & Codes",
    prompt: "Have you red-lined or As-Built any drawings? If so, was it done manually or with software such as Blue Beam?",
    referenceAnswer: "Experience with redlining/as-built drawings, manually or via software such as Blue Beam.", maxPoints: 5,
  },

  // --- NDT Inspector multiple-choice screening ---
  // Auto-graded (deterministic, no AI needed) — options/correctIndex set,
  // unlike the free-text QC/E&I questions above.
  {
    role: "NDT", topic: "Magnetic Particle Testing (MT)",
    prompt: "Which of the following is not a property of magnetic lines of force?",
    options: [
      "They form closed loops which do not cross",
      "The density increases with distance from the poles of a permanent magnet",
      "They are considered to have direction",
      "They seek paths of least magnetic resistance or least reluctance",
    ],
    correctIndex: 1, referenceAnswer: "The density increases with distance from the poles of a permanent magnet", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Magnetic Particle Testing (MT)",
    prompt: "Surrounding an electromagnet, the magnetic field is strongest:",
    options: [
      "Immediately after the current ceases to flow",
      "While the magnetizing current ceases to flow",
      "At the time the magnetic particles are applied to the part",
      "Just prior to current reversal",
    ],
    correctIndex: 3, referenceAnswer: "Just prior to current reversal", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Magnetic Particle Testing (MT)",
    prompt: "An advantage of AC is that:",
    options: [
      "It is most readily available",
      "Equipment can be made lighter",
      "It leaves the part demagnetized",
      "All of the above",
    ],
    correctIndex: 3, referenceAnswer: "All of the above", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Magnetic Particle Testing (MT)",
    prompt: "Which type of magnetic field produces a readily detectable north and south pole in a part?",
    options: ["Circular", "Longitudinal", "Transverse", "Continuous"],
    correctIndex: 1, referenceAnswer: "Longitudinal", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Magnetic Particle Testing (MT)",
    prompt: "Subjecting the part to a magnetic field that is constantly reversing in polarity and gradually diminishing in strength accomplishes which of the following?",
    options: [
      "Soaks in the flux density",
      "Helps find deep-lying defects",
      "Magnetizes the part",
      "Removes residual field from the part",
    ],
    correctIndex: 3, referenceAnswer: "Removes residual field from the part", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Magnetic Particle Testing (MT)",
    prompt: "When the finely divided ferromagnetic particles are in oil suspension, the test method is called:",
    options: ["Oil and whiting technique", "Oil suspension technique", "Wet method", "Spray or dip method"],
    correctIndex: 2, referenceAnswer: "Wet method", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Magnetic Particle Testing (MT)",
    prompt: "The minimum light intensity required on the surface of a part to be examined under white light is:",
    options: [
      "100 Foot Candles (1000 Lx)",
      "1000 Foot Candles (100 Lx)",
      "10 Foot Candles (10 Lx)",
      "100 Lx (1000 Foot Candles)",
    ],
    correctIndex: 0, referenceAnswer: "100 Foot Candles (1000 Lx)", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Magnetic Particle Testing (MT)",
    prompt: "The Black light (UV) intensity at the surface shall be at least:",
    options: ["600 μW/cm²", "700 μW/cm²", "800 μW/cm²", "1000 μW/cm²"],
    correctIndex: 3, referenceAnswer: "1000 μW/cm²", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Magnetic Particle Testing (MT)",
    prompt: "The maximum intensity of ambient light in the darkened area for fluorescent MP inspection is:",
    options: ["2 Foot Candles", "20 Foot Candles", "1 Foot Candles", "100 Foot Candles"],
    correctIndex: 0, referenceAnswer: "2 Foot Candles", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Magnetic Particle Testing (MT)",
    prompt: "Alternating current electromagnetic yokes should give a lifting force of at least ___, and direct current electromagnetic yokes should have a lifting force of at least ___:",
    options: ["10 kg / 40 kg", "2.5 kg / 20 kg", "3.5 kg / 30 kg", "4.5 kg / 18 kg"],
    correctIndex: 3, referenceAnswer: "4.5 kg / 18 kg", maxPoints: 2,
  },

  {
    role: "NDT", topic: "Liquid Penetrant Testing (PT)",
    prompt: "The penetrant process best suited to use on parts with rough surfaces is:",
    options: ["Solvent removable", "Water washable", "Post emulsifiable", "Magnetic particle"],
    correctIndex: 1, referenceAnswer: "Water washable", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Liquid Penetrant Testing (PT)",
    prompt: "The penetrant process best suited for the detection of very fine discontinuities is:",
    options: ["Solvent removable", "Water washable", "Post emulsifiable", "Magnetic particle"],
    correctIndex: 2, referenceAnswer: "Post emulsifiable", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Liquid Penetrant Testing (PT)",
    prompt: "The penetrant process best suited for use on parts with keyways and threads is:",
    options: ["Solvent removable", "Water washable", "Post emulsifiable", "None of the above"],
    correctIndex: 2, referenceAnswer: "Post emulsifiable", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Liquid Penetrant Testing (PT)",
    prompt: "Indications which are caused by design or construction of the test piece are called?",
    options: ["Relevant", "Non-relevant", "False", "Real"],
    correctIndex: 1, referenceAnswer: "Non-relevant", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Liquid Penetrant Testing (PT)",
    prompt: "Which of the following discontinuities would you not expect to find in a casting?",
    options: ["Shrinkage cracks", "Incomplete penetration", "Cold shuts", "Porosity"],
    correctIndex: 1, referenceAnswer: "Incomplete penetration", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Liquid Penetrant Testing (PT)",
    prompt: "The temperature range of the part to be tested and the penetrant used shall not exceed:",
    options: ["-5°C min and +52°C max", "0°C min and 52°C max", "5°C min and 102°C max", "5°C min and 52°C max"],
    correctIndex: 3, referenceAnswer: "5°C min and 52°C max", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Liquid Penetrant Testing (PT)",
    prompt: "What is the maximum drying time after pre-cleaning prior to the application of the penetrant?",
    options: ["1 minute", "10 minutes", "20 minutes", "Not applicable"],
    correctIndex: 1, referenceAnswer: "10 minutes", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Liquid Penetrant Testing (PT)",
    prompt: "According to your company written procedure, penetrant can be applied by:",
    options: ["Brushing on", "Dipping the part", "Spraying", "All of the above"],
    correctIndex: 3, referenceAnswer: "All of the above", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Liquid Penetrant Testing (PT)",
    prompt: "What is the maximum dwell time for any penetrant?",
    options: ["1 minute", "10 minutes", "30 minutes", "Not applicable"],
    correctIndex: 2, referenceAnswer: "30 minutes", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Liquid Penetrant Testing (PT)",
    prompt: "Excess water washable penetrant can be removed by a water spray wherein the water pressure does not exceed ___ (kPa) and the water temp does not exceed ___ (°C).",
    options: ["0 and 10", "50 and 110", "Water spray cannot be used", "345 and 43"],
    correctIndex: 3, referenceAnswer: "345 and 43", maxPoints: 2,
  },

  {
    role: "NDT", topic: "Ultrasonic Testing (UT — Shear Wave)",
    prompt: "Most commercial ultrasonic testing is performed at frequencies between:",
    options: ["1 MHz and 10 MHz", "1 MHz and 100 MHz", "10 MHz and 50 MHz", "1 MHz and 25 MHz"],
    correctIndex: 0, referenceAnswer: "1 MHz and 10 MHz", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Ultrasonic Testing (UT — Shear Wave)",
    prompt: "Resolving power of a transducer is directly proportional to its:",
    options: ["Wavelength", "Crystal thickness", "Bandwidth", "Q"],
    correctIndex: 2, referenceAnswer: "Bandwidth", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Ultrasonic Testing (UT — Shear Wave)",
    prompt: "The term used to refer to the product of wave velocity and density is:",
    options: ["Acoustic impedance", "The velocity-density ratio", "Index of refraction", "Reflection coefficient"],
    correctIndex: 0, referenceAnswer: "Acoustic impedance", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Ultrasonic Testing (UT — Shear Wave)",
    prompt: "An ultrasonic data display which shows a plan view presentation of the data is called:",
    options: ["A scan", "B scan", "C scan", "Orthogonal view"],
    correctIndex: 2, referenceAnswer: "C scan", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Ultrasonic Testing (UT — Shear Wave)",
    prompt: "An ultrasonic display which shows a cross section of the test piece and any flaws which are found is called:",
    options: ["A scan", "B scan", "C scan", "Orthogonal view"],
    correctIndex: 1, referenceAnswer: "B scan", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Ultrasonic Testing (UT — Shear Wave)",
    prompt: "An ultrasonic display which shows echo locations and amplitude is called:",
    options: ["A scan", "B scan", "C scan", "Orthogonal view"],
    correctIndex: 0, referenceAnswer: "A scan", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Ultrasonic Testing (UT — Shear Wave)",
    prompt: "What is the main ASME document that sets out the guidelines for how UT shear wave inspection of welds is performed?",
    options: ["Article 7", "Article 4", "Appendix 6", "B31.3"],
    correctIndex: 1, referenceAnswer: "Article 4", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Ultrasonic Testing (UT — Shear Wave)",
    prompt: "What 2 tests are required by this procedure to prove the ultrasonic shear wave unit is calibrated?",
    options: [
      "Screen Control Linearity and Amplitude Control Linearity",
      "Calibration and Verification",
      "Technician competency and eye exam",
      "Screen Height Linearity and Amplitude Control Linearity",
    ],
    correctIndex: 3, referenceAnswer: "Screen Height Linearity and Amplitude Control Linearity", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Ultrasonic Testing (UT — Shear Wave)",
    prompt: "Ultrasonic examinations of high alloy steels, high nickel alloy weld deposits, and dissimilar metal welds between carbon steels and high alloy steels/high nickel alloys:",
    options: [
      "Are the same as carbon steel",
      "Are easier to do",
      "Require mock-ups of the welding procedure and reference reflectors in the welding deposit",
      "Require an additional certification",
    ],
    correctIndex: 2, referenceAnswer: "Require mock-ups of the welding procedure and reference reflectors in the welding deposit", maxPoints: 2,
  },
  {
    role: "NDT", topic: "Ultrasonic Testing (UT — Shear Wave)",
    prompt: "For materials of diameter greater than ___ mm, a block of the same curvature or a flat basic calibration block can be used for calibration purposes.",
    options: ["500", "400", "50", "200"],
    correctIndex: 0, referenceAnswer: "500", maxPoints: 2,
  },

  // --- Coating Inspector free-text screening ---
  {
    role: "COATING", topic: "Drawings",
    prompt: "Where can you find details for cut-back and transition on piping for coating application?",
    referenceAnswer: "The drawings.", maxPoints: 5,
  },
  {
    role: "COATING", topic: "Codes",
    prompt: "What coating standards are you familiar with?",
    referenceAnswer: "NACE, ISO, SSPC, ASTM, CSA.", maxPoints: 2,
  },
  {
    role: "COATING", topic: "Codes",
    prompt: "What standard is used for External Fusion Bond Epoxy Coating for Steel Pipe?",
    referenceAnswer: "CSA-Z245.20-02 / Z245.21-02.", maxPoints: 2,
  },
  {
    role: "COATING", topic: "Codes",
    prompt: "What is the standard test method for field measurement of surface profile of blast-cleaned steel?",
    referenceAnswer: "ASTM D4417-14.", maxPoints: 2,
  },
  {
    role: "COATING", topic: "Codes",
    prompt: "What does the SSPC-SP10 blast standard specify?",
    referenceAnswer: "Near-white metal blast.", maxPoints: 2,
  },
  {
    role: "COATING", topic: "Codes",
    prompt: "What is SSPC-PA2?",
    referenceAnswer: "The procedure for determining conformance to dry film thickness requirements — the dry film thickness standard.", maxPoints: 2,
  },
  {
    role: "COATING", topic: "Material Receiving",
    prompt: "How can you tell if the coating material received on site is acceptable?",
    referenceAnswer: "No damage on packaging, coating/paint can is sealed, all information and labels on the packaging/can are readable, and opening a can of base and hardener to confirm the coating material looks good and did not freeze during transport.", maxPoints: 3,
  },
  {
    role: "COATING", topic: "Material Receiving",
    prompt: "How can you tell if the coating material has not expired?",
    referenceAnswer: "By verifying the batch numbers.", maxPoints: 3,
  },
  {
    role: "COATING", topic: "Material Receiving",
    prompt: "Where can you find information about coating storage and shelf life?",
    referenceAnswer: "The product data sheet.", maxPoints: 3,
  },
  {
    role: "COATING", topic: "Procedures",
    prompt: "What is your experience with coating procedures and applicator qualification records — have you created them, followed them, or both? If you've created them, what documents do you need to create a procedure?",
    referenceAnswer: "Create, follow, or both; documents needed to create a procedure are the Scope of Work, Drawings, and Code.", maxPoints: 3,
  },
  {
    role: "COATING", topic: "Procedures",
    prompt: "When a coating crew comes to site, how do you verify their qualification?",
    referenceAnswer: "NACE or SSPC tickets, and applicator tickets related to the product being applied if applicable — verify ticket expiration dates.", maxPoints: 3,
  },
  {
    role: "COATING", topic: "Witnessing Coating",
    prompt: "What is the acceptable temperature difference between surface temperature and dew point for above- and below-ground coatings (in Celsius)?",
    referenceAnswer: "3 degrees Celsius.", maxPoints: 3,
  },
  {
    role: "COATING", topic: "Witnessing Coating",
    prompt: "What are the risks of improperly mixed coating?",
    referenceAnswer: "The coating never cures properly, and it loses its intended chemical purpose.", maxPoints: 3,
  },
  {
    role: "COATING", topic: "Witnessing Coating",
    prompt: "What is important to have on hand before and during coating application?",
    referenceAnswer: "The conditions required by the specification and the product data sheets.", maxPoints: 3,
  },
  {
    role: "COATING", topic: "Final Inspection",
    prompt: "What kind of holiday testing do you conduct for coating thickness under 20 mils dry film thickness?",
    referenceAnswer: "Low voltage holiday testing.", maxPoints: 3,
  },
  {
    role: "COATING", topic: "Final Inspection",
    prompt: "What is the voltage of a wet sponge holiday tester?",
    referenceAnswer: "67.5 volts.", maxPoints: 3,
  },
  {
    role: "COATING", topic: "Final Inspection",
    prompt: "The average dry film thickness of a below-ground coated pipe is 40 mils. What holiday testing equipment do you need?",
    referenceAnswer: "High voltage holiday testing equipment.", maxPoints: 3,
  },
  {
    role: "COATING", topic: "Coating Testing",
    prompt: "What is the purpose of an x-cut or a dolly pull test?",
    referenceAnswer: "An adhesion test.", maxPoints: 3,
  },
  {
    role: "COATING", topic: "Coating Testing",
    prompt: "What is a Shore D test?",
    referenceAnswer: "A hardness test.", maxPoints: 3,
  },
  {
    role: "COATING", topic: "Coating Testing",
    prompt: "How often do you calibrate your dry film thickness gauge prior to coating inspection?",
    referenceAnswer: "Daily.", maxPoints: 3,
  },
  {
    role: "COATING", topic: "Final Walkdowns",
    prompt: "What is really important to do prior to a final walkdown with the client?",
    referenceAnswer: "Ensure you did your own walkdown first and that all deficiencies are fixed before the final walkdown with the client.", maxPoints: 5,
  },
  {
    role: "COATING", topic: "Documentation",
    prompt: "Do you verify coating reports? What are some key points you check?",
    referenceAnswer: "Date, correct coating material, surface preparation and coating application conditions, and that all information follows specifications.", maxPoints: 5,
  },
  {
    role: "COATING", topic: "Documentation",
    prompt: "How do you verify that the coating contractor's inspection equipment is up to date?",
    referenceAnswer: "Verify the certification of calibration and keep a copy.", maxPoints: 5,
  },

  // --- Civil QC Inspector free-text screening ---
  {
    role: "CIVIL", topic: "ITP – Inspection & Test Plan",
    prompt: "What is an ITP?",
    referenceAnswer: "Inspection and Test Plan. It identifies the stages of work that require inspection, testing, documentation, hold points, witness points, and acceptance criteria.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "ITP – Inspection & Test Plan",
    prompt: "Have you created or followed ITPs?",
    referenceAnswer: "Either creating or following ITPs counts — the important thing is direct experience working with them.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "ITP – Inspection & Test Plan",
    prompt: "What documents would you review before creating an ITP?",
    referenceAnswer: "Scope of work, contract requirements, approved drawings, project specifications, applicable codes and standards, method statements, and client requirements.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "ITP – Inspection & Test Plan",
    prompt: "What is the difference between a Hold Point and a Witness Point?",
    referenceAnswer: "Hold Point: work cannot proceed until the required inspection/approval is completed. Witness Point: the inspector/client is notified and given the opportunity to witness; work may proceed if they do not attend, subject to the project procedure.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Civil Drawings",
    prompt: "What types of civil drawings have you worked with?",
    referenceAnswer: "Site plans, grading plans, foundation drawings, structural drawings, concrete drawings, rebar drawings, general arrangement drawings, sections/details, road drawings, underground utility drawings.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Civil Drawings",
    prompt: "What information do you look for on a foundation drawing?",
    referenceAnswer: "Foundation dimensions, elevations, reinforcement details, anchor bolts, concrete specification, footing/pedestal details, embedded items, location/grid coordinates, construction joints.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Civil Drawings",
    prompt: "What is a structural section/detail drawing used for?",
    referenceAnswer: "It provides additional information about the construction, dimensions, elevations, reinforcement, connections, and details that may not be clear on the plan view.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Civil Drawings",
    prompt: "What do you check before starting an inspection?",
    referenceAnswer: "Confirm that you are working from the latest approved/revision-controlled drawings and specifications.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Earthworks & Excavation",
    prompt: "What do you inspect before concrete is placed in a foundation excavation?",
    referenceAnswer: "Excavation dimensions, elevation/depth, soil/subgrade condition, bearing surface, compaction requirements, water/dewatering, cleanliness, formwork, rebar, anchor bolts/embeds, and approved drawings and ITP requirements.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Earthworks & Excavation",
    prompt: "How do you verify that the required elevation has been achieved?",
    referenceAnswer: "Survey equipment/approved survey records, such as a level, total station, or other approved surveying method, compared against the approved drawings.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Earthworks & Excavation",
    prompt: "What is compaction?",
    referenceAnswer: "The process of mechanically densifying soil/fill to achieve the specified density and stability.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Earthworks & Excavation",
    prompt: "How do you verify compaction?",
    referenceAnswer: "Review compaction testing performed by qualified personnel/laboratory and confirm the results meet the project specification.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Earthworks & Excavation",
    prompt: "What would you do if a compaction test fails?",
    referenceAnswer: "Identify the affected area, notify the appropriate construction/QC personnel, document the deficiency, determine the required corrective action, rework/recompact as required, and perform/review a retest before acceptance.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Concrete Inspection",
    prompt: "What do you check before a concrete pour?",
    referenceAnswer: "Approved drawings, formwork dimensions and condition, rebar size/spacing/placement, concrete cover, embedded items, anchor bolts, construction joints, cleanliness, elevations, access for concrete placement, approved mix/design, and required inspections and hold points.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Concrete Inspection",
    prompt: "What do you check when concrete arrives on site?",
    referenceAnswer: "Concrete ticket/batch ticket, mix/design identification, time batched, quantity, concrete temperature, slump, air content where applicable, strength requirements, water addition/unauthorized additions, and delivery time.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Concrete Inspection",
    prompt: "What is a slump test used for?",
    referenceAnswer: "To assess the consistency/workability of fresh concrete.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Concrete Inspection",
    prompt: "What is the purpose of concrete cylinders?",
    referenceAnswer: "To test the compressive strength of concrete at specified ages according to the project requirements.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Concrete Inspection",
    prompt: "What would you do if the concrete slump is outside the specified range?",
    referenceAnswer: "Stop/hold the affected placement as required, verify the specification and batch information, notify the responsible personnel, and determine the approved corrective action before proceeding.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Reinforcing Steel / Rebar",
    prompt: "What do you inspect when checking reinforcing steel?",
    referenceAnswer: "Bar size, grade, spacing, quantity, location, lap/splice requirements, development/anchorage, concrete cover, bar supports/chairs, ties, congestion, cleanliness, and placement against approved drawings.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Reinforcing Steel / Rebar",
    prompt: "How do you verify that the correct rebar has been installed?",
    referenceAnswer: "Compare the installed reinforcement with the approved rebar drawings, bar marks, schedules, specifications, and material documentation where applicable.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Reinforcing Steel / Rebar",
    prompt: "Why is concrete cover important?",
    referenceAnswer: "It protects reinforcing steel against environmental exposure/corrosion and helps achieve the required structural performance.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Reinforcing Steel / Rebar",
    prompt: "What would you do if you found rebar installed incorrectly immediately before a concrete pour?",
    referenceAnswer: "Identify and document the deficiency, notify construction, have the reinforcement corrected according to the approved drawings/specifications, and reinspect before releasing the pour.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Formwork",
    prompt: "What do you inspect on formwork?",
    referenceAnswer: "Dimensions, alignment, elevation, plumb, stability/support, cleanliness, release agent, openings, chamfers, embedded items, construction joints.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Formwork",
    prompt: "How do you verify dimensions and elevations?",
    referenceAnswer: "Approved drawings/specifications and appropriate survey or measuring equipment.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Formwork",
    prompt: "What can happen if formwork is not properly supported?",
    referenceAnswer: "Movement, deformation, dimensional problems, concrete defects, or potentially formwork failure.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Concrete Deficiencies",
    prompt: "What is honeycombing in concrete?",
    referenceAnswer: "Voids or exposed aggregate caused by inadequate consolidation, poor placement, segregation, or other concrete-placement issues.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Concrete Deficiencies",
    prompt: "What would you do if you found honeycombing after stripping forms?",
    referenceAnswer: "Document the condition, assess the extent, notify the responsible parties, and follow the approved repair procedure/engineering direction before repair and acceptance.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Concrete Deficiencies",
    prompt: "What is a cold joint?",
    referenceAnswer: "A discontinuity/interface that can occur when fresh concrete is placed against concrete that has already set beyond the allowable placement/working period.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Concrete Deficiencies",
    prompt: "What would you do if you found a crack in a concrete foundation?",
    referenceAnswer: "Document location, size and characteristics, notify the appropriate technical/QC personnel, compare against project acceptance criteria, and obtain engineering direction where required.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Survey / Elevation",
    prompt: "If the foundation elevation does not match the approved drawing, what would you do?",
    referenceAnswer: "Do not simply accept it — document the discrepancy, verify the measurement/survey information, notify the appropriate personnel, and obtain direction/correction before proceeding.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Survey / Elevation",
    prompt: "What is a benchmark?",
    referenceAnswer: "A known reference elevation used for establishing or checking elevations on a project.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Material Receiving",
    prompt: "What do you check when civil materials arrive?",
    referenceAnswer: "Correct material/type, quantity, damage, identification, manufacturer documentation, material certificates where required, approved submittal, project specification, and drawing requirements.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Material Receiving",
    prompt: "How do you verify that the material is the correct one?",
    referenceAnswer: "Compare material identification/documentation with the approved drawings, specifications, purchase documents, and applicable material certificates.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Codes & Standards",
    prompt: "What codes and standards have you worked with on civil projects?",
    referenceAnswer: "Depending on the project: CSA, ASTM, ACI, CSA A23.1/A23.2, CSA S6, CSA S16, project specifications, municipal/provincial standards, owner specifications.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Codes & Standards",
    prompt: "How do you determine which code or specification applies to a particular inspection?",
    referenceAnswer: "Review the contract/project specifications, approved drawings, ITP, applicable code/standard, and client requirements.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Testing",
    prompt: "What civil tests have you witnessed or reviewed?",
    referenceAnswer: "Concrete slump, concrete temperature, air content, concrete compressive strength, soil compaction, Proctor, density testing, aggregate testing, asphalt testing, rebar/material testing.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Testing",
    prompt: "What do you check on a test report?",
    referenceAnswer: "Correct project, location, date, test type, material identification, specification/acceptance criteria, test result, required strength/density, technician/laboratory information, and signatures/approval where required.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "NCR – Non-Conformance Report",
    prompt: "What is an NCR?",
    referenceAnswer: "Non-Conformance Report. It documents work, material, or a process that does not meet the approved drawings, specifications, codes, procedures, or other project requirements.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "NCR – Non-Conformance Report",
    prompt: "Give an example of when you would issue an NCR on a civil project.",
    referenceAnswer: "Incorrect concrete strength, failed compaction, incorrect rebar installation, foundation dimensions outside tolerance, incorrect material, work completed without required inspection, or work not constructed according to approved drawings.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "NCR – Non-Conformance Report",
    prompt: "What do you do after issuing an NCR?",
    referenceAnswer: "Document the deficiency, identify the required corrective action, track the correction, reinspect/verify the corrective action, and close the NCR once requirements are satisfied.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "RFI",
    prompt: "What is an RFI?",
    referenceAnswer: "Request for Information.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "RFI",
    prompt: "Give an example of when you would issue an RFI.",
    referenceAnswer: "When construction encounters unclear, missing, conflicting, or incomplete information in the drawings/specifications and clarification is required from engineering/client.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "RFI",
    prompt: "What is the difference between an NCR and an RFI?",
    referenceAnswer: "RFI: used to obtain clarification/information before or during construction. NCR: used to document non-conforming work/material/process.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Final Walkdown & Turnover",
    prompt: "What do you check during a civil final walkdown?",
    referenceAnswer: "Outstanding deficiencies, dimensions/elevations, concrete condition, rebar/embedded items where accessible, grouting, anchor bolts, foundations, drainage, access, housekeeping, required documentation, punch-list items.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Final Walkdown & Turnover",
    prompt: "What documentation would you expect in a civil turnover package?",
    referenceAnswer: "Inspection reports, concrete test reports, compaction reports, material certificates, survey reports, NCRs and closeouts, RFIs, as-built drawings, ITP records, calibration records, punch-list/deficiency closeouts.", maxPoints: 3,
  },
  {
    role: "CIVIL", topic: "Documentation / Computer Skills",
    prompt: "What software have you used for civil QC documentation (for example Excel, Bluebeam, or Adobe Acrobat)?",
    referenceAnswer: "Relevant experience with QC documentation software such as Excel, Bluebeam, or Adobe Acrobat.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Documentation / Computer Skills",
    prompt: "Have you worked with electronic inspection systems?",
    referenceAnswer: "Yes — direct experience using an electronic inspection system.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Documentation / Computer Skills",
    prompt: "Have you redlined drawings?",
    referenceAnswer: "Yes — experience marking up/redlining drawings, manually or with software.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Documentation / Computer Skills",
    prompt: "Have you maintained inspection logs and prepared daily QC reports?",
    referenceAnswer: "Yes — experience maintaining inspection logs and preparing daily QC reports.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Documentation / Computer Skills",
    prompt: "Have you maintained deficiency/punch lists?",
    referenceAnswer: "Yes — experience maintaining deficiency or punch lists.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Documentation / Computer Skills",
    prompt: "Have you completed as-built documentation?",
    referenceAnswer: "Yes — experience completing as-built documentation.", maxPoints: 2,
  },
  {
    role: "CIVIL", topic: "Practical Scenarios",
    prompt: "You arrive for a foundation concrete pour and discover that the rebar spacing does not match the approved drawing. What do you do?",
    referenceAnswer: "Identify the discrepancy, stop/hold the affected work as required, document it, inform construction, get it corrected, and reinspect before concrete placement.", maxPoints: 5,
  },
  {
    role: "CIVIL", topic: "Practical Scenarios",
    prompt: "A compaction test fails after the contractor has completed the area. What would you do?",
    referenceAnswer: "Identify the affected area, document it, notify the responsible parties, arrange corrective action/rework, retest, and confirm acceptance.", maxPoints: 5,
  },
  {
    role: "CIVIL", topic: "Practical Scenarios",
    prompt: "You discover the crew is building a foundation using an old drawing revision. What do you do?",
    referenceAnswer: "Stop/hold the affected work as appropriate, verify the current revision, notify construction/QC, assess the impact of work already completed, correct/rework as required, and document it.", maxPoints: 5,
  },
  {
    role: "CIVIL", topic: "Practical Scenarios",
    prompt: "The 28-day concrete compressive-strength test does not meet the specified requirement. What would you do?",
    referenceAnswer: "Verify the test/report/sample identification, notify responsible parties, review the specification/acceptance criteria, document it, obtain an engineering/client assessment, and take corrective action as directed.", maxPoints: 5,
  },
  {
    role: "CIVIL", topic: "Practical Scenarios",
    prompt: "The superintendent tells you to sign off an inspection even though you have identified a deficiency. What do you do?",
    referenceAnswer: "Maintain QC integrity — explain the deficiency, document it, follow the ITP/project procedure, escalate when necessary, and do not sign off work that cannot be verified as compliant.", maxPoints: 5,
  },

  // --- Accounts free-text screening ---
  {
    role: "ACCOUNTS", topic: "Invoice Processing",
    prompt: "Walk me through the process of receiving an invoice, verifying it, obtaining approval, and processing it for payment.",
    referenceAnswer: "Receipt and logging into the AP system; initial review for required elements (vendor, invoice number/date, PO number, itemized charges, tax, terms); 2-way or 3-way matching against the PO/receiving document; GL/cost-center coding; approval routing per the authorization matrix; discrepancy resolution before proceeding; entry/posting into the AP ledger with the correct due date; payment scheduling (capturing early-payment discounts, avoiding late fees); payment processing and closing out the invoice; and filing the invoice, approval trail, and proof of payment for audit purposes.", maxPoints: 5,
  },
  {
    role: "ACCOUNTS", topic: "AP & AR Fundamentals",
    prompt: "What is the difference between Accounts Payable (AP) and Accounts Receivable (AR)? What responsibilities have you handled in each?",
    referenceAnswer: "AP is money the company owes vendors/suppliers for goods and services received (cash going out) — invoice verification, approval routing, payment processing, vendor reconciliation. AR is money owed to the company by customers for goods/services already delivered (cash coming in) — invoicing customers, applying payments, aging analysis, and collections follow-up.", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Invoice Verification",
    prompt: "How do you verify an invoice before processing it? What information do you check?",
    referenceAnswer: "Vendor legitimacy, invoice details (number checked for duplicates, date, terms), PO match, quantity/pricing match against the PO or contracted rate, confirmation goods/services were received, correct tax calculation and valid vendor tax registration, math accuracy on subtotal/tax/total, correct GL coding, and that the invoice is routed to someone with the appropriate approval authority for that dollar amount.", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Invoice Verification",
    prompt: "How do you handle an invoice that does not match the purchase order, contract, or approved rate?",
    referenceAnswer: "Do not process it as-is — place it on hold. Identify the specific mismatch, contact the vendor to clarify, contact the internal requester/approver to confirm what was actually ordered/agreed, determine the resolution (corrected invoice/credit note, updated PO, or confirming a legitimate authorized rate change), document the discrepancy and resolution, and only process payment once it's corrected or formally approved.", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Bank Reconciliation",
    prompt: "What is a bank reconciliation, and how do you perform one?",
    referenceAnswer: "Comparing the GL cash account against the bank statement to confirm they agree and explain any differences: obtain both records, compare ending balances, identify reconciling items (outstanding cheques, deposits in transit, bank fees/interest, NSF items/errors), adjust the book balance for items the bank captured that the books haven't, adjust the comparison for items the books captured that the bank hasn't, confirm the adjusted balances match, and document/file the reconciliation. Typically performed monthly as part of month-end close.", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Bank Reconciliation",
    prompt: "If the bank balance does not match the accounting system, how would you investigate the discrepancy?",
    referenceAnswer: "Re-verify the statement period/beginning balance, check timing differences first (outstanding cheques, deposits in transit), review for unrecorded bank transactions (fees, interest, withdrawals, wires), check for data entry errors, look for unauthorized/unusual transactions, trace transactions line by line if needed, correct the books with a clear journal entry once the cause is found, and escalate if fraud or a system error is suspected — resolving the root cause rather than forcing an unexplained match.", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Payroll & Timesheets",
    prompt: "What experience do you have with processing employee or contractor timesheets and preparing information for payroll?",
    referenceAnswer: "Collect timesheets by the payroll cutoff, verify supervisor approval is present, check completeness/accuracy (regular time, overtime, leave), cross-reference against schedules or project codes for contractors, flag exceptions (missing approvals, unusually high hours) and follow up, compile and submit verified hours to payroll ahead of deadline, and reconcile after processing to confirm amounts paid match what was submitted. For contractors, also confirm hours/deliverables align with the signed contract or statement of work.", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Payroll & Timesheets",
    prompt: "How do you verify contractor invoices before submitting them for payment?",
    referenceAnswer: "Match against the contract/statement of work for rate and scope, verify hours or deliverables against approved timesheets/milestones/sign-off, confirm internal manager/project lead approval, check for supporting documentation (timesheets, receipts), verify tax treatment (GST/HST, tax registration number), check for duplicate submissions, and confirm payment terms and banking details are current before it moves into the standard AP process.", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Tax (GST/HST)",
    prompt: "What is your experience with GST/HST? How do you ensure the correct tax is applied to an invoice?",
    referenceAnswer: "Confirming which rate applies based on province of supply, verifying the vendor is registered for GST/HST (valid business number), confirming whether goods/services are taxable, zero-rated, or exempt, ensuring input tax credits are properly tracked for filings, confirming the tax was calculated correctly on the pre-tax subtotal and broken out clearly, keeping documentation organized for a CRA audit, and confirming with the accounting lead or current CRA guidance when uncertain rather than assuming.", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Accounting Concepts",
    prompt: "What is the difference between an expense, an accounts payable liability, and an accrued expense?",
    referenceAnswer: "An expense is a cost recognized on the income statement representing consumption of a resource, regardless of whether it's paid. An AP liability is a recorded obligation backed by a received invoice with known amount/due date. An accrued expense is a liability for a cost incurred but not yet invoiced/billed, recorded through an estimate/journal entry to keep financials accurate under accrual accounting, then reversed or adjusted once the actual invoice arrives.", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Month-End Close",
    prompt: "What is your experience with month-end closing? What tasks have you been responsible for?",
    referenceAnswer: "Ensuring all invoices for the period are received/processed/recorded or accrued, reconciling bank accounts, reconciling AP/AR sub-ledgers to the GL, recording accruals and prepaid amortization, reviewing/clearing suspense accounts, preparing and posting month-end journal entries, reviewing the trial balance and preliminary financials for anomalies, preparing supporting schedules (AP/AR aging, prepaid/accrual schedules), assisting with variance analysis, and closing the period once entries are finalized and reviewed — typically against a defined close checklist with target dates.", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Accounts Receivable & Collections",
    prompt: "How do you handle outstanding or overdue accounts receivable? What steps would you take to follow up with a customer?",
    referenceAnswer: "Monitor the AR aging report regularly, send a reminder as the due date approaches or passes, escalate follow-up communication if payment isn't received, investigate and resolve disputes promptly, offer a payment plan where appropriate and within policy, document all communication, escalate internally (credit manager/controller) for accounts unresolved beyond a defined threshold, and consider a credit hold or collections referral for significantly overdue accounts — balancing firm follow-up with the customer relationship.", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Accounts Receivable & Collections",
    prompt: "How do you reconcile customer or vendor accounts when the balances do not match?",
    referenceAnswer: "Obtain both records (their statement and the internal ledger), compare line by line, identify common causes (payments in transit, invoices not yet recorded on one side, disputed/short-paid invoices, misapplied payments, unreflected credit memos), investigate each discrepancy individually, correct internal errors via journal entries or payment reapplication, communicate with the vendor/customer to resolve issues on their side, and document the reconciliation with a clear explanation of every adjustment.", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Systems & Software",
    prompt: "What accounting software or ERP systems have you used? Which accounting functions did you perform in them?",
    referenceAnswer: "Common platforms include QuickBooks, Sage, Xero, NetSuite, SAP, Microsoft Dynamics 365, and Oracle. Typical functions: AP invoice entry/approval workflows/payment runs, AR customer invoicing/payment application/aging reports, bank reconciliation, GL journal entry posting and account reconciliations, reporting (trial balances, financial statements), fixed assets/depreciation tracking, payroll integration, and GST/HST tax reporting.", maxPoints: 2,
  },
  {
    role: "ACCOUNTS", topic: "Data Accuracy & Controls",
    prompt: "How do you ensure accuracy when entering a large number of invoices or financial transactions?",
    referenceAnswer: "Standardized templates/coding guides, batching and double-checking totals against a control total, leveraging system controls (three-way matching, duplicate detection, mandatory field validation), working methodically without multitasking, spot-checking/self-review, peer review or approval checkpoints on higher-value or unusual transactions, and reconciling sub-ledgers to the GL regularly to catch errors quickly.", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Data Accuracy & Controls",
    prompt: "How do you handle duplicate invoices or duplicate payments?",
    referenceAnswer: "Prevention via system-level duplicate detection and checking vendor payment history before manual entry. If caught before payment: flag/void the duplicate with a documented reason. If a duplicate payment already went out: confirm the duplication, contact the vendor immediately to request a refund or credit, document the error and resolution, investigate the root cause and address it, and notify a supervisor/controller, especially for higher-dollar-value duplicates.", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Audit & Documentation",
    prompt: "What documents and records should be maintained to support an accounting transaction during an audit?",
    referenceAnswer: "Source documents (invoices, POs, receiving reports, contracts), approval evidence, payment records (EFT confirmation, cheque copies, bank statements), supporting calculations for accruals/allocations/estimates, reconciliations, journal entry backup with approval, relevant correspondence, and underlying contracts/agreements for recurring transactions — kept organized and easily retrievable.", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Confidentiality & Controls",
    prompt: "How do you protect confidential financial information when handling invoices, payroll information, banking information, and employee records?",
    referenceAnswer: "Role-based access controls, secure storage (permission-restricted digital systems, locked physical storage), secure transmission (avoiding unencrypted email for banking/SIN/salary data), segregation of duties (e.g. separating who edits vendor banking details from who approves payments), independent verification of any request to change banking details before updating records, retention/secure disposal policies, and awareness of applicable privacy legislation (e.g. PIPEDA).", maxPoints: 3,
  },
  {
    role: "ACCOUNTS", topic: "Practical Scenarios",
    prompt: "You discover that a payment was made to the wrong vendor or for the wrong amount. What steps would you take?",
    referenceAnswer: "Confirm the error first, notify a supervisor/controller immediately, contact the bank promptly for an EFT/wire recall where applicable, contact the incorrect recipient to request return of funds, process the correct payment once the error is corrected internally, adjust accounting records to reverse/correct the entry and record the recovery or write-off, document the full incident, and review the root cause to recommend a process improvement.", maxPoints: 5,
  },
  {
    role: "ACCOUNTS", topic: "Practical Scenarios",
    prompt: "You have several invoices due today, a bank reconciliation that needs to be completed, a payroll deadline approaching, and a manager requesting a financial report. How would you prioritize your work?",
    referenceAnswer: "Identify true hard deadlines and consequences of delay (payroll is typically highest priority since it can't be pushed back once cutoff passes; genuinely same-day invoices next to avoid late fees/service interruption; bank reconciliation usually has more timing flexibility; the manager's report priority depends on their actual deadline). Communicate proactively with the manager about competing priorities. Sequence the work — payroll first, then firm-deadline invoices, then the report at the level of detail actually needed, then the reconciliation. Delegate or ask for support if the workload genuinely can't be completed solo, rather than risk missing a critical deadline.", maxPoints: 5,
  },

  // --- B2B Sales Manager free-text screening ---
  {
    role: "SALES", topic: "Sales Cycle & Pipeline",
    prompt: "Walk me through a typical B2B sales cycle from lead generation to closing. What are the key stages?",
    referenceAnswer: "Lead Generation (inbound, outbound, events, partners) → Lead Qualification (BANT/MEDDIC) → Discovery/Needs Analysis → Solution Presentation/Demo tied to uncovered pain points → Proposal/Quotation → Negotiation with the buying committee/procurement → Closing → Onboarding/Handoff to customer success or delivery. The cycle is rarely linear — deals often loop back to discovery or negotiation as new stakeholders join or requirements shift.", maxPoints: 5,
  },
  {
    role: "SALES", topic: "Sales Cycle & Pipeline",
    prompt: "Explain how you build and manage a sales pipeline. What stages do you normally use?",
    referenceAnswer: "Stages reflecting real, observable buyer behavior — Prospecting, Qualified, Discovery Completed, Solution/Demo Delivered, Proposal Sent, Negotiation, Closed-Won/Closed-Lost. Managing it means weekly review for stage movement and stalled deals, enforcing exit criteria per stage, keeping CRM data (close dates, deal values, next steps) current rather than aspirational, and regularly pruning stale or unqualified opportunities.", maxPoints: 3,
  },
  {
    role: "SALES", topic: "Lead Qualification",
    prompt: "How do you qualify a B2B lead? What information do you need before moving a prospect into your active pipeline?",
    referenceAnswer: "A framework like BANT (Budget, Authority, Need, Timeline) or, for more complex deals, MEDDIC (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion). A lead only moves into the active pipeline once most of these are answered with reasonable confidence, not guessed at.", maxPoints: 3,
  },
  {
    role: "SALES", topic: "Pipeline Coverage & Forecasting",
    prompt: "What is pipeline coverage, and how do you determine whether your pipeline is sufficient to meet your sales target?",
    referenceAnswer: "Pipeline Coverage Ratio = Total Open Pipeline Value ÷ Remaining Sales Target, typically targeted at 3x-5x depending on historical win rate, sales cycle length, and deal concentration risk. To determine sufficiency: compare the coverage ratio to the historical close-rate benchmark, apply stage-weighted probabilities for a realistic forecast, check deal velocity through stages, and weigh quality (not just quantity) of the pipeline — increasing prospecting immediately if coverage is short rather than waiting.", maxPoints: 3,
  },
  {
    role: "SALES", topic: "Pipeline Coverage & Forecasting",
    prompt: "How do you forecast sales? What factors do you consider before committing to a forecast?",
    referenceAnswer: "A blend of pipeline/stage-weighted forecasting, rep-level commit categories (Commit/Best Case/Pipeline), and historical trend analysis. Factors considered before committing a number: verified next steps and confirmed dates with the economic buyer, active internal champion, procurement/legal status, seasonality, deal concentration risk, and rep-level forecasting accuracy history — only committing a deal with verifiable evidence, not just rep confidence.", maxPoints: 3,
  },
  {
    role: "SALES", topic: "Sales KPIs",
    prompt: "What KPIs do you use to measure the performance of a B2B sales team?",
    referenceAnswer: "A mix of activity metrics (calls/emails/meetings booked, qualified opportunities created), pipeline metrics (coverage ratio, average deal size, sales cycle length, stage-conversion rates), outcome metrics (win rate, quota attainment, revenue growth, ASP trend), and efficiency/retention metrics (CAC, CAC payback, net revenue retention, forecast accuracy) — no single KPI tells the whole story on its own.", maxPoints: 3,
  },
  {
    role: "SALES", topic: "ROI & Value",
    prompt: "How do you calculate or evaluate the ROI of a product or service for a potential client?",
    referenceAnswer: "ROI (%) = [(Total Benefit − Total Cost) ÷ Total Cost] × 100, built collaboratively using the client's own numbers: quantify current-state costs, quantify expected benefits validated with client data, include total cost of ownership (not just license fees), calculate the payback period, and present a range (conservative/expected/best-case) rather than one optimistic figure — factoring intangible value separately.", maxPoints: 3,
  },
  {
    role: "SALES", topic: "Objection Handling & Pricing",
    prompt: "A client says, \"Your competitor is offering the same service for 20% less.\" How would you handle this objection?",
    referenceAnswer: "Acknowledge and probe what's actually included in that offer (often not apples-to-apples), reconfirm the specific value drivers the client cares about, quantify the value gap in dollar terms, ask about decision criteria to reveal whether price is the real blocker, and decide deliberately on flexibility — holding price with proof points if the value case holds, or adjusting non-price levers before touching the headline price.", maxPoints: 3,
  },
  {
    role: "SALES", topic: "Objection Handling & Pricing",
    prompt: "When would you offer a discount, and when would you protect the original price?",
    referenceAnswer: "Offer a discount when the client trades something of equal value (longer term, upfront payment, reference, expanded scope), it's tied to a specific time-bound business reason, or it protects margin on a high-lifetime-value account. Protect the original price when the value case is strong and well-quantified, nothing is being traded in return, it's early in the sales process, or discounting would set a bad precedent for renewal pricing or similar accounts.", maxPoints: 3,
  },
  {
    role: "SALES", topic: "Negotiation",
    prompt: "How do you negotiate with a procurement department that is primarily focused on reducing price?",
    referenceAnswer: "Stay connected to the business champion (procurement negotiates terms, the stakeholder validates value), reframe around Total Cost of Ownership rather than unit price, know walk-away points in advance, trade rather than concede (ask for something in return for a lower price), use data/benchmarks, and avoid negotiating against yourself by letting procurement make the first ask.", maxPoints: 3,
  },
  {
    role: "SALES", topic: "Contracts",
    prompt: "What commercial terms do you normally pay attention to before signing a B2B contract?",
    referenceAnswer: "Pricing structure, payment terms, contract length and renewal/auto-renewal terms, scope of work/deliverables, SLAs, termination clauses, liability and indemnification, data protection/confidentiality, IP ownership, and the change management/amendment process — involving legal and finance early rather than late.", maxPoints: 3,
  },
  {
    role: "SALES", topic: "CRM & Systems",
    prompt: "What CRM systems have you used, and how do you use CRM data for pipeline management and sales forecasting?",
    referenceAnswer: "Common platforms include Salesforce, HubSpot, Microsoft Dynamics 365, Pipedrive, and Zoho CRM. Use includes enforcing pipeline hygiene (mandatory fields), stage-conversion reporting to spot where deals stall, weighted forecasting from stage-based probabilities, correlating activity with win rates, cohort/trend analysis against prior quarters, and dashboards for 1:1s and QBRs — treating the CRM as the single source of truth.", maxPoints: 2,
  },
  {
    role: "SALES", topic: "Account Planning",
    prompt: "How do you develop an account plan for a high-value B2B customer?",
    referenceAnswer: "Account overview, stakeholder mapping (decision-makers, influencers, users, blockers), current state of the relationship, whitespace analysis for upsell/cross-sell, goals and objectives (client's and our own), an action plan and timeline with owners, risk assessment (renewal dates, competitive threats, champion turnover), and success metrics — revisited quarterly since stakeholder changes can date a plan quickly.", maxPoints: 3,
  },
  {
    role: "SALES", topic: "Practical Scenarios",
    prompt: "Your team is at 60% of its quarterly target with only 30 days remaining. How would you analyze the situation and create an action plan?",
    referenceAnswer: "Diagnose the gap (pipeline, conversion, or timing problem; break down by rep/segment/stage). Triage the existing pipeline (identify every realistically closeable deal with an owner and action, escalate deals stuck in procurement/legal, separate real late-stage deals from optimistic ones). Create targeted actions (daily pipeline reviews and coaching for reps behind target, executive-to-executive conversations for stalled deals, a focused prospecting sprint on warm relationships). Consider selective, time-bound incentives rather than straight discounts. Communicate an honest, data-backed projection to leadership with a specific plan and support needed.", maxPoints: 5,
  },
  {
    role: "SALES", topic: "Practical Scenarios",
    prompt: "You have a large prospect that has been in the pipeline for six months, but the decision-maker keeps saying, \"We'll get back to you.\" How would you determine whether the opportunity is still genuine?",
    referenceAnswer: "Re-verify the MEDDIC/BANT criteria for changes, test for a real compelling event, check champion strength, look for access to the full buying committee (not just one contact), ask a direct low-pressure qualifying question about priority, review competitive/status-quo risk, and propose a mutual close plan with specific dates. If there's still no clear timeline, budget confirmation, or stakeholder access, downgrade the deal's probability significantly or move it out of active/forecasted pipeline while keeping the door open.", maxPoints: 5,
  },

  // --- Digital Marketing free-text screening ---
  {
    role: "DIGITAL_MARKETING", topic: "Strategy & Audience",
    prompt: "Walk me through how you would develop a digital marketing strategy for a new product or service.",
    referenceAnswer: "Define measurable objectives tied to business priorities; research the market and audience; define the value proposition and positioning; select the right channels for the audience rather than defaulting to all of them; develop a content/creative plan across the funnel; set and allocate budget; define KPIs and tracking before launch; execute; monitor, analyze, and optimize continuously; and report and iterate.", maxPoints: 5,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Strategy & Audience",
    prompt: "How do you identify and define a target audience for a digital marketing campaign?",
    referenceAnswer: "Start with existing customer/analytics data, conduct market research, build audience personas (demographics, psychographics, behavior), segment by intent and funnel stage, validate assumptions with platform audience insights, and test/refine the definition over time rather than treating it as fixed.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "SEO",
    prompt: "What is SEO, and what are the main factors that influence organic search rankings?",
    referenceAnswer: "SEO is improving a website's visibility in organic search results. Main ranking factors: content quality/relevance, keyword optimization, backlink profile, technical SEO (speed, mobile-friendliness, crawlability, HTTPS), UX signals (Core Web Vitals), domain authority/trust, local SEO factors, and E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "SEO",
    prompt: "What is the difference between on-page SEO and off-page SEO?",
    referenceAnswer: "On-page SEO is optimization made directly on the website (title tags, meta descriptions, headers, keyword usage, internal linking, content quality, page speed) and is fully controlled by the site owner. Off-page SEO is signals occurring outside the website (backlinks, social signals, brand mentions, guest posting) built through external relationships. Both work together — on-page makes a page rankable, off-page builds the authority to rank it highly.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "SEO",
    prompt: "How would you conduct keyword research for a new website or campaign?",
    referenceAnswer: "Start with seed keywords, use keyword research tools (Google Keyword Planner, Ahrefs, SEMrush, Moz) to expand and gather volume/competition data, analyze search intent (informational, navigational, commercial, transactional), evaluate competition vs. opportunity (including long-tail terms), review competitor keywords, group into themes/clusters, prioritize by business relevance and feasibility, and revisit regularly.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Paid Advertising",
    prompt: "What is your experience with Google Ads or other paid advertising platforms? How do you structure a campaign?",
    referenceAnswer: "Platforms: Google Ads, Meta Ads, LinkedIn Ads, Microsoft Advertising, programmatic display. Structure: campaign-level objective/budget/bidding/targeting; ad-group-level organization by tightly themed keywords or audience segments; keyword/audience targeting; relevant ad creative; landing page alignment; conversion tracking set up before launch; an appropriate bid strategy; and ongoing optimization of search terms, bids, and creative.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Paid Advertising",
    prompt: "What is the difference between CPC, CPM, CTR, CPA, and ROAS?",
    referenceAnswer: "CPC (Cost Per Click) = Total Spend ÷ Total Clicks. CPM (Cost per 1,000 impressions) = (Total Spend ÷ Total Impressions) × 1,000, used for awareness. CTR (Click-Through Rate) = (Clicks ÷ Impressions) × 100, indicating ad relevance. CPA (Cost Per Acquisition) = Total Spend ÷ Total Conversions. ROAS (Return on Ad Spend) = Revenue from Ads ÷ Ad Spend. CPC/CPM describe cost of exposure, CTR describes appeal, CPA/ROAS describe how efficiently spend converts to business results.", maxPoints: 2,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Paid Advertising",
    prompt: "How do you determine whether a paid advertising campaign is performing successfully?",
    referenceAnswer: "Compare performance against the pre-defined goal's specific KPI (not generic clicks), evaluate cost efficiency (CPC/CPA relative to conversion value), assess conversion quality not just volume, review ROAS/ROI tying spend back to business value, benchmark against historical/industry performance, and consider the full funnel rather than one metric in isolation.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Paid Advertising",
    prompt: "A campaign is receiving many clicks but very few conversions. How would you investigate the problem?",
    referenceAnswer: "Check landing page relevance/speed/mobile experience and CTA clarity, review the offer's compellingness, verify tracking is set up correctly before assuming a real problem, analyze audience targeting, review keyword/ad-to-landing-page alignment, examine the conversion form for friction, check device/browser performance, review pricing/competitive positioning if applicable, and A/B test once a likely cause is identified.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Paid Advertising",
    prompt: "You have a campaign with a high cost per lead and low conversion rate. What steps would you take to improve its performance?",
    referenceAnswer: "Diagnose whether it's traffic quality, offer/message fit, or conversion friction. Review targeting against the ideal customer profile, audit ad creative/messaging, evaluate the landing page and offer, review keyword/placement performance, check the bidding strategy, test incremental changes rather than overhauling everything at once, reassess what counts as a qualified lead, and consider pausing/reallocating budget if it still underperforms after reasonable optimization.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Social Media",
    prompt: "What metrics do you monitor to measure social media performance?",
    referenceAnswer: "Reach/impressions, engagement rate, follower growth (organic vs. paid), click-through rate, conversion metrics (via UTM/analytics), video-specific metrics (views, watch time, completion rate), share of voice/sentiment, and cost metrics for paid social (CPC/CPM/CPA/ROAS) — prioritizing engagement and conversion over vanity metrics like raw follower count.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Social Media",
    prompt: "How do you develop a social media content strategy for a B2B company?",
    referenceAnswer: "Understand the audience's professional context, align content with the buyer's journey (awareness/consideration/decision), focus on value and credibility over overt promotion, leverage internal thought leadership, use a varied content mix, maintain a sustainable posting cadence, engage rather than just broadcast, and measure against business-relevant outcomes like traffic, leads, and pipeline influence.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Content Creation",
    prompt: "What is your experience creating and managing content such as blogs, landing pages, videos, email campaigns, and social media posts?",
    referenceAnswer: "Experience across blog content (SEO-optimized articles targeting keywords/pain points), landing pages (conversion-focused, clear CTAs, mobile-responsive), video content (platform-tailored short-form/product demos/explainers), email campaigns (nurture sequences, promotions, newsletters with segmentation and deliverability practices), and social posts (platform-appropriate format/tone/timing) — ideally connected to measurable outcomes achieved, not just content types produced.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Conversion Optimization",
    prompt: "How do you optimize a landing page to improve conversion rates?",
    referenceAnswer: "Clarify the value proposition above the fold, simplify design/messaging to one clear goal, strengthen the CTA, reduce form friction, build trust signals (testimonials, case studies, logos), improve page speed and mobile experience, ensure message match with the ad/link that drove the visit, A/B test key elements, and use analytics/heatmaps/session recordings to see where visitors hesitate or abandon.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Conversion Optimization",
    prompt: "What is A/B testing, and how would you use it in digital marketing?",
    referenceAnswer: "Comparing two versions of a marketing asset against similar audience segments to see which performs better on a defined metric. Use: identify a clear hypothesis, test one variable at a time, ensure a large enough sample size/duration for statistical significance, split traffic randomly and evenly, analyze against the defined success metric, and implement the winner while continuing to iterate. Common applications: subject lines, ad creative, landing page headlines/CTAs, pricing/offer presentation.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Analytics",
    prompt: "What analytics tools have you used, such as Google Analytics, Search Console, Meta Business Suite, or other platforms?",
    referenceAnswer: "Tools such as Google Analytics (GA4) for traffic/behavior/conversions, Google Search Console for organic performance and technical SEO issues, Google Tag Manager for tracking, Meta Business Suite/Ads Manager, LinkedIn Campaign Manager, Google Ads reporting, email platform analytics (Mailchimp, HubSpot, Klaviyo), CRM integration/reporting (HubSpot, Salesforce) to connect marketing to revenue, and heatmap/session recording tools (Hotjar, Microsoft Clarity).", maxPoints: 2,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Analytics",
    prompt: "How do you use website analytics to identify where potential customers are dropping out of the conversion process?",
    referenceAnswer: "Map out the intended conversion funnel, use funnel visualization reports to see drop-off between stages, segment the analysis by traffic source/device/audience, review page-level behavior metrics (bounce rate, time on page, exit rate), use heatmaps/session recordings to observe actual behavior, check for technical issues, review content/messaging at the drop-off point, and test targeted fixes rather than broad changes.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "ROI & Budget",
    prompt: "How do you measure the ROI of a digital marketing campaign?",
    referenceAnswer: "ROI (%) = [(Revenue Generated − Marketing Cost) ÷ Marketing Cost] × 100. Define what counts as directly attributable revenue with proper attribution, capture the full campaign cost (not just ad spend), choose and be transparent about the attribution model, account for sales cycle length in B2B, compare ROI across channels to inform budget allocation, and factor in customer lifetime value where relevant.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "ROI & Budget",
    prompt: "What is your experience with email marketing? How do you measure the performance of an email campaign?",
    referenceAnswer: "Experience building/segmenting lists, designing campaigns (promotional, nurture, newsletters, win-back), A/B testing subject lines/send times/content, ensuring anti-spam compliance (CASL/CAN-SPAM) and list hygiene, and setting up automation workflows. Key metrics: open rate (interpreted cautiously given privacy changes), click-through rate, conversion rate, bounce rate, unsubscribe rate, list growth rate, and revenue per email/ROI.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "ROI & Budget",
    prompt: "How do you manage a digital marketing budget and decide where to allocate advertising spend?",
    referenceAnswer: "Start from business objectives rather than spreading spend evenly, analyze historical performance data to weight proven channels while reserving testing budget, segment budget by funnel stage, consider channel-specific costs and audience fit, build in an experimentation budget, monitor pacing throughout the period and reallocate mid-period as needed, and report on allocation efficiency regularly.", maxPoints: 3,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Practical Scenarios",
    prompt: "A company's website receives 10,000 visitors per month but generates very few leads. What would you analyze first?",
    referenceAnswer: "Traffic quality/source alignment with the target audience, conversion funnel analysis to find exactly where visitors drop off, CTA visibility/clarity, the lead capture mechanism itself, value proposition/messaging clarity, page speed and mobile experience, and tracking accuracy (confirming leads from less obvious channels are actually captured) — only recommending specific fixes after this diagnostic review.", maxPoints: 5,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Practical Scenarios",
    prompt: "A competitor is ranking above your company on Google for important keywords. What would you do to improve your organic visibility?",
    referenceAnswer: "Conduct a competitive content gap analysis, audit our own content and technical SEO, review backlink profiles to see if it's an authority gap, improve/expand existing content for search intent (not just keyword insertion), build a link-earning strategy, improve technical SEO fundamentals, monitor rankings over time, and consider complementary paid search to maintain visibility while organic efforts build.", maxPoints: 5,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Practical Scenarios",
    prompt: "You launch a paid campaign and the budget is being spent quickly, but there are very few qualified leads. How would you troubleshoot it?",
    referenceAnswer: "Check targeting settings first for unintentional breadth, review the bidding strategy (an automated strategy still learning can spend fast at the expense of quality), examine search terms/placements for irrelevant spend, assess ad copy alignment, review the landing page/lead qualification criteria for a form that's too easy to submit, check daily budget/pacing settings, pause and reassess if spend is clearly outpacing return, and implement fixes incrementally while monitoring closely.", maxPoints: 5,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Practical Scenarios",
    prompt: "A social media post receives thousands of views but generates almost no website traffic or leads. How would you evaluate the campaign?",
    referenceAnswer: "Clarify the post's original goal (awareness vs. traffic), review whether there was a clear CTA/mechanism to click through, assess platform-specific friction (e.g. non-clickable links), evaluate audience-content fit, check tracking accuracy (UTM/link tracking), compare against similar past content, and reframe success metrics appropriately to the post's actual intended goal.", maxPoints: 5,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Practical Scenarios",
    prompt: "Management gives you a fixed marketing budget and asks you to generate as many qualified leads as possible. How would you plan and measure the campaign?",
    referenceAnswer: "Planning: clarify what qualifies as a \"qualified lead\" with management/sales upfront, identify the highest-intent cost-efficient channels from past data, allocate budget via a test-and-scale approach, build a strong conversion path before scaling spend, and set a target CPL. Measuring: track number of qualified leads and cost per qualified lead (not raw volume), compare channel-level performance, track funnel conversion rates, monitor pacing against budget, and report to management regularly so course corrections can happen mid-campaign.", maxPoints: 5,
  },

  // --- Geotechnical Technician free-text screening ---
  {
    role: "GEOTECHNICAL", topic: "Field & Lab Testing Methods",
    prompt: "What types of soil and aggregate field tests are you experienced in performing?",
    referenceAnswer: "Field density testing (nuclear gauge, sand cone, or balloon method), moisture content testing, Proctor testing support, sieve analysis (gradation), Atterberg limits testing, visual soil classification (e.g. USCS), subgrade/subbase inspection, and sampling of disturbed/undisturbed soil for lab analysis.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Sampling & Documentation",
    prompt: "Walk me through how you would collect and properly document a soil sample from a job site.",
    referenceAnswer: "Confirm the sampling location/purpose against the inspection plan, select the appropriate method (disturbed bulk vs. undisturbed), use clean uncontaminated equipment, collect a representative sample, label it immediately with project/sample ID/location/date/time/initials, seal it appropriately, record details in the field log, maintain chain of custody, and transport it promptly under proper conditions.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Sampling & Documentation",
    prompt: "How do you ensure proper identification and traceability of samples collected in the field?",
    referenceAnswer: "A unique, never-reused sample ID system tied to the project; complete field labeling at the moment of collection (not from memory); cross-referencing the sample ID in the field log/daily report; photographing the sample location where practical; chain-of-custody documentation from collection through lab receipt; secure contamination-free transport/storage; and confirming the lab logs the sample under the same field-assigned ID.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Proctor Testing",
    prompt: "What is a Proctor test, and what information does it provide?",
    referenceAnswer: "A laboratory compaction test determining the relationship between a soil's moisture content and the dry density achieved under a specified compactive effort. It provides Maximum Dry Density (MDD) and the Optimum Moisture Content (OMC) at which it occurs, from the peak of the compaction curve — this becomes the reference for comparing field compaction (expressed as a percent of Proctor).", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Proctor Testing",
    prompt: "What is the difference between Standard Proctor and Modified Proctor testing?",
    referenceAnswer: "Standard Proctor (ASTM D698/AASHTO T99) uses a lighter 5.5 lb hammer dropped 12 in over 3 layers, giving a lower MDD and higher OMC — used for lighter-duty applications. Modified Proctor (ASTM D1557/AASHTO T180) uses a heavier 10 lb hammer dropped 18 in over 5 layers, giving a higher MDD and lower OMC — used for higher-load applications like roadways and heavy structural fill. The project specification dictates which applies.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Proctor Testing",
    prompt: "Explain the relationship between Maximum Dry Density (MDD) and Optimum Moisture Content (OMC).",
    referenceAnswer: "As moisture is added to dry soil, it lubricates particles allowing closer packing, so dry density increases with moisture up to OMC, where maximum dry density is achieved. Beyond OMC, additional water displaces solid material and creates pore pressure that reduces dry density. This is why compacting close to OMC makes it far easier and more reliable to achieve target density.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Field Density Testing",
    prompt: "How do you perform a field density test? What methods or equipment have you used?",
    referenceAnswer: "Methods include the nuclear density gauge (gamma for density, neutron for moisture, ASTM D6938), sand cone method (ASTM D1556), and balloon method (ASTM D2167). General procedure: select a representative prepared location, perform equipment standardization checks, prepare the test surface, insert the probe/take the reading, record results including calculated dry density/moisture/percent compaction, and compare against the project's specified requirement.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Field Density Testing",
    prompt: "What is the purpose of a nuclear density gauge, and what checks must be completed before using it?",
    referenceAnswer: "It measures in-place wet density and moisture content via radioactive sources, allowing quick field calculation of dry density and percent compaction without lab sampling. Required checks: daily standardization count, battery/equipment functionality, current license and operator radiation safety certification, source leak-testing compliance, physical inspection of the gauge/probe, and compliant transport/storage — treated as strict prerequisites since the gauge contains radioactive sources.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Field Density Testing",
    prompt: "If the required compaction is 95% of Proctor and your field test shows 90%, what would you do?",
    referenceAnswer: "Verify the test result before reporting it as a failure (standardization, procedure, correct Proctor reference). Re-test at the same/adjacent location if there's a reasonable question about validity. If confirmed, document it and notify the contractor and engineer immediately — fill shouldn't proceed to the next lift. Do not let the contractor \"shop\" for a passing result by re-testing unchanged material; require corrective action (rework, moisture conditioning) first, then re-test only after that action is performed, documenting the full sequence.", maxPoints: 5,
  },
  {
    role: "GEOTECHNICAL", topic: "Field Density Testing",
    prompt: "What factors can affect the results of a field density test?",
    referenceAnswer: "Improper equipment standardization/calibration, poor surface preparation, moisture content variability relative to OMC, oversized particles/rock distorting volume-based methods, an incorrect Proctor reference curve, incorrect test depth/probe placement, environmental conditions (temperature, nearby metal/radioactive interference for nuclear gauges), and inconsistent operator technique.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Soil Classification",
    prompt: "What is the difference between cohesive and granular soils? How does this affect compaction and testing?",
    referenceAnswer: "Cohesive soils (clays, silts) are fine-grained with particle bonding, plastic/moldable when moist, have a narrower OMC range and a distinct compaction curve peak, and Atterberg limits testing is relevant. Granular soils (sands, gravels) have little cohesion, drain freely, compact well across a broader moisture range with a flatter curve, and sieve analysis/gradation matters more than plasticity. Cohesive soils need tighter moisture control; granular soils are more forgiving on compaction but more prone to segregation during placement.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Laboratory Testing",
    prompt: "What is your experience with sieve analysis, moisture content, Atterberg limits, or other laboratory soil tests?",
    referenceAnswer: "Sieve analysis (ASTM C136/D6913) for particle size distribution/gradation; moisture content testing (ASTM D2216) via oven-drying; Atterberg limits (ASTM D4318) — liquid limit, plastic limit, plasticity index for cohesive soils; and other tests such as specific gravity, organic content, or hydrometer analysis as the lab scope requires — ideally tied to the practical purpose each test served on a real project.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Specification Compliance",
    prompt: "How do you determine whether the soil or aggregate meets the project specification?",
    referenceAnswer: "Identify the governing specification (project-specific, DOT/provincial standard, or geotechnical report), compare relevant results directly against its limits (gradation band, plasticity index, percent of Proctor), confirm the correct reference/comparison basis (correct Proctor curve, material classification, specification section), account for stated tolerances, document the comparison clearly with a pass/fail determination, and escalate ambiguous or borderline results to the responsible engineer.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Concrete & Asphalt Testing",
    prompt: "What experience do you have with concrete testing, such as slump, temperature, air content, and concrete cylinders?",
    referenceAnswer: "Slump testing (ASTM C143) for workability, temperature testing (ASTM C1064), air content testing (ASTM C231/C173), concrete cylinder molding/curing/labeling (ASTM C31) for compressive strength at required ages, unit weight/density testing (ASTM C138) where required, and visual observation of placement for segregation or improper consolidation — with attention to proper sample handling and curing, since improperly cured cylinders commonly produce misleading strength results.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Concrete & Asphalt Testing",
    prompt: "What experience do you have with asphalt testing or inspection?",
    referenceAnswer: "In-place density testing (nuclear gauge or core sampling) against percent of maximum theoretical/reference density, temperature monitoring at delivery/placement/compaction, visual inspection for mix consistency/segregation/joint quality/lift thickness, sampling loose mix for gradation/asphalt content testing, core sampling to verify thickness and density, and documenting placement conditions and deficiencies.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Reporting & Documentation",
    prompt: "What information should be included in a daily field report or geotechnical inspection report?",
    referenceAnswer: "Project identification, personnel and weather/site conditions, work performed/observed, test results with location references and pass/fail status, sample information cross-referenced to the sampling log, material information, deficiencies/non-conformances and any corrective action, equipment used and its calibration status, photographs where useful, and technician/engineer sign-off — written so someone with no other context could understand exactly what happened.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Reporting & Documentation",
    prompt: "How do you document test results when the material does not meet the project specification?",
    referenceAnswer: "Record the actual result accurately and completely with no favorable rounding or omission, clearly flag it as a non-conformance referencing the specification value, document relevant context, notify the appropriate parties promptly, record any directed corrective action, follow up with re-test documentation referencing the original failing test, and avoid making engineering determinations beyond a technician's role — deferring disposition decisions to the responsible engineer.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Standards & Safety",
    prompt: "What standards, specifications, or testing procedures have you worked with?",
    referenceAnswer: "ASTM standards (e.g. D698/D1557 Proctor, D6938 nuclear density, D1556 sand cone, D2167 balloon, D2216 moisture, D4318 Atterberg limits, C136 sieve, C143 slump, C231 air content, C31 cylinders), AASHTO standards (e.g. T99/T180), provincial/state transportation specifications, project-specific geotechnical specifications, and CSA standards where applicable in a Canadian context.", maxPoints: 2,
  },
  {
    role: "GEOTECHNICAL", topic: "Standards & Safety",
    prompt: "What safety precautions do you take when working around excavations, heavy equipment, traffic, or active construction sites?",
    referenceAnswer: "PPE compliance, excavation safety (safe distance from edges, awareness of shoring/sloping, never entering unshored excavations), heavy equipment awareness (eye contact with operators, staying out of blind spots/swing radii), following traffic control plans, site-specific hazard orientation, continuous situational awareness, recognizing and using stop-work authority immediately when a hazard is identified, and coordinating testing activities with site personnel to avoid overlap with active operations.", maxPoints: 3,
  },
  {
    role: "GEOTECHNICAL", topic: "Practical Scenarios",
    prompt: "You perform a compaction test and the result is below the required specification. The contractor asks you to repeat the test until they get a passing result. What would you do?",
    referenceAnswer: "Explain that testing isn't performed to \"shop\" for a passing result — a valid test reflects actual conditions, and re-testing without corrective action undermines testing integrity. Clarify legitimate reasons a re-test could be appropriate (a genuinely different location, or after actual corrective action). Communicate professionally but firmly, document the original failing result regardless of the request, notify the responsible engineer/supervisor of both the result and the contractor's request, and offer a constructive path forward focused on resolving the actual compaction issue.", maxPoints: 5,
  },
  {
    role: "GEOTECHNICAL", topic: "Practical Scenarios",
    prompt: "You arrive on site and the soil conditions are different from what was expected in the geotechnical report. How would you handle the situation?",
    referenceAnswer: "Document the actual observed conditions thoroughly. Do not proceed with testing/inspection based on the outdated assumption if the discrepancy could affect test methods, acceptance criteria, or design assumptions. Notify the project/geotechnical engineer of record promptly and communicate with the site supervisor/contractor that a review is needed. Continue basic observation/testing where appropriate without representing it as confirming compliance with an outdated report, follow the engineer's direction once received, and document the full sequence of events.", maxPoints: 5,
  },
  {
    role: "GEOTECHNICAL", topic: "Practical Scenarios",
    prompt: "A contractor is placing fill material without requesting the required inspection. What would you do?",
    referenceAnswer: "Address it directly and promptly with the contractor, explaining inspection is required and asking them to pause placement. Assess what's already been placed and whether it can still be adequately verified. Notify a supervisor and the project engineer immediately as a compliance issue. Document the situation factually, perform required testing on the placed material as soon as possible (noting this doesn't fully substitute for proper-stage inspection), support the engineer's determination on how to proceed, and recommend a clear communication protocol going forward to prevent recurrence.", maxPoints: 5,
  },
  {
    role: "GEOTECHNICAL", topic: "Practical Scenarios",
    prompt: "Your field density results are inconsistent with the contractor's expectations. How would you investigate the discrepancy?",
    referenceAnswer: "Verify your own testing process first (standardization, procedure, correct Proctor reference, test location/depth). Re-test at the same or an adjacent location to rule out an anomaly. Discuss the contractor's basis for their expectation. Check field moisture against OMC and review the contractor's compaction equipment/method for common root causes (insufficient passes, wrong equipment, excessive lift thickness). Cross-check the reference standard used. Document the investigation and findings, and involve the engineer if the discrepancy remains unresolved.", maxPoints: 5,
  },
  {
    role: "GEOTECHNICAL", topic: "Practical Scenarios",
    prompt: "You are responsible for several active sites on the same day. How would you prioritize inspections, testing, samples, and reporting?",
    referenceAnswer: "Assess urgency and consequence of delay per site, sequencing sites where the contractor is paused pending your result ahead of routine observation visits. Communicate proactively with each site about realistic timing. Batch travel/testing logistically. Prioritize time-sensitive or perishable sampling needs (e.g. concrete cylinder break windows). Complete documentation promptly per site rather than reconstructing from memory later, and escalate to a supervisor early if the workload genuinely can't be covered safely and accurately in one day, rather than rushing and risking compromised accuracy or safety.", maxPoints: 5,
  },

  // --- Digital Marketing: general screening interview (original wording) ---
  // Behavioral questions with no single correct answer: referenceAnswer holds
  // what a strong answer shows, graded 0-5. maxPoints 0 = captured but not
  // scored (the AI grader is skipped for these, see submitTechnicalScreeningRound).
  {
    role: "DIGITAL_MARKETING", topic: "Screening Interview",
    prompt: "Tell us about your current role and where you want your career to go over the next few years.",
    referenceAnswer: "A clear, honest picture of what they do today and a realistic direction for growth that plausibly fits a marketing role at Engrity, rather than vague ambition or goals pointing somewhere else entirely.", maxPoints: 5,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Screening Interview",
    prompt: "What do you know about Engrity, and what value would you bring to our team?",
    referenceAnswer: "Evidence they researched the company (services, industries, audience, tone) and connect their own skills to something specific Engrity needs, rather than a generic statement about being a hard worker.", maxPoints: 5,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Screening Interview",
    prompt: "How would you describe your personality, and how would a close friend or colleague describe you?",
    referenceAnswer: "Self-awareness: the two descriptions are consistent but not identical, include specific traits with a brief example, and show some emotional intelligence about how they come across to others.", maxPoints: 5,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Screening Interview",
    prompt: "What are you really good at in your work? Give two or three strengths, each with a real example.",
    referenceAnswer: "Specific strengths relevant to digital marketing (for example analytics, content, paid media, SEO, email) backed by concrete examples with outcomes, not a list of buzzwords.", maxPoints: 5,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Screening Interview",
    prompt: "What are you not good at, or not interested in doing? Be honest.",
    referenceAnswer: "A genuine weakness or dislike named plainly, with some sign of how they manage it. Weak answers disguise a strength as a flaw (\"I work too hard\", \"I'm a perfectionist\") or claim to have none.", maxPoints: 5,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Screening Interview",
    prompt: "Describe a time you failed at work or a campaign went badly. What happened and what did you do about it?",
    referenceAnswer: "Takes ownership without blaming others, explains what went wrong clearly, and describes a concrete lesson and change in how they work afterwards.", maxPoints: 5,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Screening Interview",
    prompt: "Tell us about a time you worked harder than you ever have. What was the situation and how did you approach it?",
    referenceAnswer: "Persistence and drive described with energy and pride rather than complaint, a specific situation, and a clear outcome that came from the extra effort.", maxPoints: 5,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Screening Interview",
    prompt: "Why do you want this job at Engrity in particular?",
    referenceAnswer: "Reasons tied to the company and the role itself (its work, the audience, the type of marketing) rather than only salary or convenience, and a convincing case that they would be a good fit.", maxPoints: 5,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Screening Interview",
    prompt: "What are your compensation expectations?",
    referenceAnswer: "Not scored. Recorded so the hiring team can compare the stated figure against the role's budget. A specific, realistic number or range is a good sign.", maxPoints: 0,
  },
  {
    role: "DIGITAL_MARKETING", topic: "Screening Interview",
    prompt: "Do you have any questions for us at this stage?",
    referenceAnswer: "Not scored. Recorded so the hiring team can see what the candidate cares about and follow up in the next step.", maxPoints: 0,
  },
];

async function main() {
  for (let i = 0; i < mathQuestions.length; i++) {
    const q = mathQuestions[i];
    const existing = await prisma.question.findFirst({ where: { prompt: q.prompt } });
    if (!existing) {
      await prisma.question.create({ data: { ...q, round: "MATH", order: i } });
    }
  }

  for (let i = 0; i < iqQuestions.length; i++) {
    const q = iqQuestions[i];
    const existing = await prisma.question.findFirst({ where: { prompt: q.prompt } });
    if (!existing) {
      await prisma.question.create({ data: { ...q, round: "IQ", order: i } });
    }
  }

  for (let i = 0; i < personalityStatements.length; i++) {
    const s = personalityStatements[i];
    const existing = await prisma.personalityQuestion.findFirst({
      where: { statement: s.statement },
    });
    if (!existing) {
      await prisma.personalityQuestion.create({ data: { ...s, order: i } });
    }
  }

  for (let i = 0; i < criticalThinkingScenarios.length; i++) {
    const s = criticalThinkingScenarios[i];
    const existing = await prisma.criticalThinkingScenario.findFirst({
      where: { prompt: s.prompt },
    });
    if (!existing) {
      await prisma.criticalThinkingScenario.create({ data: { ...s, order: i } });
    }
  }

  for (let i = 0; i < technicalScreeningQuestions.length; i++) {
    const q = technicalScreeningQuestions[i];
    // Scoped by role as well as prompt — the same question text legitimately
    // recurs across roles (e.g. "Hold Point vs Witness Point" in both the QC
    // and Civil scripts), and each role needs its own bank entry.
    const existing = await prisma.technicalScreeningQuestion.findFirst({
      where: { prompt: q.prompt, role: q.role },
    });
    if (!existing) {
      await prisma.technicalScreeningQuestion.create({ data: { ...q, order: i } });
    }
  }

  console.log(
    `Seed complete. ${mathQuestions.length} math, ${iqQuestions.length} IQ, ${personalityStatements.length} personality statements, ${criticalThinkingScenarios.length} critical thinking scenarios, ${technicalScreeningQuestions.length} technical screening questions ensured.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
