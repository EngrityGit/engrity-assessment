export interface TrueFalse { s: string; a: boolean; why: string }

// Speed Round bank — statements that are true or false under common industry practice.
export const SPEED_BANK: TrueFalse[] = [
  { s: "A P&ID is drawn to scale.", a: false, why: "P&IDs are schematic and not to scale." },
  { s: "In ISA tags, the first letter 'F' means flow.", a: true, why: "F = flow, T = temperature, P = pressure, L = level." },
  { s: "A gate valve is ideal for throttling flow.", a: false, why: "Gate valves are for isolation; globe valves throttle." },
  { s: "A check valve allows flow in one direction only.", a: true, why: "It prevents backflow." },
  { s: "An isometric drawing should be scaled with a ruler for lengths.", a: false, why: "Isometrics are not to scale — use dimensions." },
  { s: "A 6\" long-radius 90° elbow has a centre-to-end take-out of 9\".", a: true, why: "1.5 × NPS." },
  { s: "A PQR is the written procedure given to the welder to follow.", a: false, why: "That is the WPS; the PQR records the qualification test." },
  { s: "A welder's qualification is tied to process, position and material range.", a: true, why: "It only covers the tested ranges." },
  { s: "Cracks are acceptable in a weld if they are very small.", a: false, why: "Cracks are rejected under all common codes." },
  { s: "MT can be used on austenitic stainless steel.", a: false, why: "Austenitic stainless is non-magnetic." },
  { s: "PT can find surface-breaking flaws on non-porous materials.", a: true, why: "That is exactly what liquid penetrant testing is for." },
  { s: "Radiography is the best method for detecting tight planar flaws in any orientation.", a: false, why: "RT can miss planar flaws not aligned with the beam; UT is better." },
  { s: "A 3.2 certificate is validated by the purchaser's or a third-party inspector.", a: true, why: "EN 10204 3.2 adds independent validation." },
  { s: "The heat number links a pipe to its MTR.", a: true, why: "It gives material traceability." },
  { s: "E7018 is a cellulosic electrode.", a: false, why: "E7018 is low-hydrogen." },
  { s: "6G is a pipe test position fixed at 45°.", a: true, why: "6G = inclined 45° fixed." },
  { s: "Smell is a reliable way to detect H2S at any concentration.", a: false, why: "H2S can deaden the sense of smell." },
  { s: "PPE is the most effective level of the hierarchy of controls.", a: false, why: "Elimination is the most effective; PPE is last." },
  { s: "Low-hydrogen electrodes should be kept in a heated holding oven.", a: true, why: "Moisture pickup raises cracking risk." },
  { s: "A spool is a prefabricated section of piping.", a: true, why: "Spools are fabricated in shop and installed in the field." },
  { s: "'FC' on a control valve means fail closed.", a: true, why: "FC = fail closed." },
  { s: "A higher carbon equivalent generally makes steel easier to weld without preheat.", a: false, why: "Higher CE means higher hardenability and cracking risk." },
  { s: "Visual inspection is normally done before other NDE methods.", a: true, why: "VT is the first and always-required step." },
  { s: "A confined space entry needs a standby attendant and rescue plan.", a: true, why: "These are core controls." },
  { s: "Undercut is a groove melted into the base metal at the weld toe.", a: true, why: "That is the definition." },
  { s: "Lock-out is complete once the lock is on — no need to test.", a: false, why: "Always try to start to verify zero energy." },
  { s: "Eccentric reducers on pump suction are usually installed flat-on-top.", a: true, why: "Avoids air pockets." },
  { s: "An MTR altered with overwritten numbers should be accepted if the heat number matches.", a: false, why: "Altered certificates must be rejected and raised as an NCR." },
  { s: "Interpass temperature is the temperature of the weld area before the next pass.", a: true, why: "It is controlled by the WPS." },
  { s: "A hazard assessment never needs to be reviewed once written.", a: false, why: "Review when conditions change." },
];

export interface ErrorScenario {
  title: string;
  doc: string; // heading shown above the document
  lines: string[];
  errorIndex: number;
  why: string;
}

export const ERROR_SCENARIOS: ErrorScenario[] = [
  {
    title: "Mill Test Report",
    doc: "MTR — Seamless pipe, PO 7741",
    lines: [
      "Heat No.: 4X1234 — matches pipe marking",
      "Specification: ASTM A106 Gr B",
      "Yield strength: 310 MPa",
      "Tensile strength: 395 MPa",
      "Elongation: 28 %",
    ],
    errorIndex: 3,
    why: "A106 Gr B requires a minimum tensile strength of about 415 MPa (60 ksi). 395 MPa fails.",
  },
  {
    title: "Isometric cut length",
    doc: "ISO 4\"-P-2001-A1A — spool SP-03",
    lines: [
      "Pipe: 4\" NPS, Sch 40, A106 Gr B",
      "Elbow: 4\" LR 90° BW — take-out used: 4\" (101.6 mm)",
      "Flange: 4\" 150# RF WN",
      "Centre-to-centre dimension: 1500 mm",
      "Root gap allowance: 2 mm per joint",
    ],
    errorIndex: 1,
    why: "A 4\" long-radius 90° elbow has a take-out of 1.5 × 4\" = 6\" (152 mm), not 4\".",
  },
  {
    title: "Welding procedure",
    doc: "WPS-014 — Pipe groove, carbon steel",
    lines: [
      "Process: GTAW (141) root, SMAW (111) fill and cap",
      "Base metal: P-No. 1 to P-No. 1",
      "Root filler: E7018",
      "Fill / cap filler: E7018",
      "Preheat: 50 °C minimum",
    ],
    errorIndex: 2,
    why: "E7018 is a covered stick electrode. A GTAW root needs a bare wire such as ER70S-2.",
  },
  {
    title: "P&ID tag list",
    doc: "P&ID 1002 — instrument index extract",
    lines: [
      "FIC-203 — Flow indicating controller",
      "PIT-101 — Pressure indicating transmitter",
      "LIT-220 — Flow indicating transmitter",
      "TE-415 — Temperature element",
      "PSV-110 — Pressure safety valve",
    ],
    errorIndex: 2,
    why: "L = level. LIT-220 is a level indicating transmitter, not flow.",
  },
  {
    title: "Welder qualification",
    doc: "Welder card W-117 vs production joint",
    lines: [
      "Welder ID: W-117",
      "Qualified process: GTAW",
      "Qualified position: 6G",
      "Material group: P-No. 1",
      "Production joint: SMAW, pipe in 5G position, P-No. 1",
    ],
    errorIndex: 4,
    why: "The welder is qualified for GTAW only; the production joint uses SMAW, which is not covered.",
  },
  {
    title: "NDT report",
    doc: "NDT-221 — weld inspection summary",
    lines: [
      "Method: Magnetic particle (yoke, AC)",
      "Material: ASTM A312 TP316L stainless, 6\" Sch 10S",
      "Acceptance criteria: per project specification",
      "Inspector: Level II, certificate valid",
      "Visual inspection completed before MT",
    ],
    errorIndex: 1,
    why: "MT only works on ferromagnetic materials. Austenitic 316L is non-magnetic — use PT instead.",
  },
];
