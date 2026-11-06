import type { LearningModule } from "./types";

export const PID_MODULE: LearningModule = {
  slug: "pid",
  title: "Reading P&IDs",
  icon: "🧭",
  blurb: "Understand piping and instrumentation diagrams: line numbers, valves, instruments and how QC uses them.",
  roles: ["QC_INSPECTION", "NDT", "WELDING", "ELECTRICAL_INSTRUMENTATION", "OPERATIONS", "PROJECT_MANAGEMENT"],
  lessons: [
    {
      slug: "pid-basics",
      title: "What a P&ID is and how to read the flow",
      minutes: 8,
      summary: "The purpose of a P&ID, how it differs from a PFD and an isometric, and a simple method to trace a system.",
      sections: [
        {
          heading: "What it shows — and what it doesn't",
          paragraphs: [
            "A Piping and Instrumentation Diagram (P&ID) is the 'map' of a process system. It shows equipment (vessels, pumps, exchangers, tanks), every pipeline with its identification, valves, instruments and the control loops that connect them.",
            "It is a schematic. It is not drawn to scale and it does not show how pipe physically runs in 3D, exact lengths or elevations. That information lives on plot plans, general arrangement drawings and piping isometrics.",
          ],
          bullets: [
            "PFD (Process Flow Diagram): the big picture — major equipment and main flows, few details.",
            "P&ID: every line, valve and instrument needed to build, operate and test the system.",
            "Isometric: one pipeline drawn in 3D for fabrication and installation.",
          ],
        },
        {
          heading: "A reliable way to trace a system",
          paragraphs: [
            "Read the title block and legend first (drawing number, revision, symbols and abbreviations used by this client). Then pick a starting piece of equipment and follow the flow arrows along one line at a time.",
          ],
          bullets: [
            "Identify the line number and note its size, service and piping class.",
            "Follow flow arrows; note every valve, reducer, spec break and instrument on the way.",
            "Note where the line connects to another drawing (off-page connector, e.g. 'To P&ID 1002').",
            "Check vents, drains and low/high points — you will need them for flushing and hydrotesting.",
          ],
        },
      ],
      tips: [
        "Always read the legend sheet: symbols differ slightly between companies and standards.",
        "Highlight one line at a time with a coloured marker when you trace it.",
        "Check the revision. Working from a superseded drawing is a classic QC non-conformance.",
      ],
      terms: [
        { term: "PFD", def: "Process Flow Diagram — high-level overview of a process." },
        { term: "Off-page connector", def: "Symbol showing a line continues on another drawing." },
        { term: "Tie-in", def: "Point where new piping connects to existing piping." },
        { term: "Legend", def: "Sheet explaining the symbols, line types and abbreviations used." },
      ],
      quiz: [
        {
          q: "Which drawing shows one pipeline in 3D with dimensions for fabrication?",
          options: ["PFD", "P&ID", "Piping isometric", "Plot plan"],
          correct: 2,
          why: "Isometrics are the fabrication/installation drawings. P&IDs are schematic and not to scale.",
        },
        {
          q: "A P&ID is normally:",
          options: ["Drawn to scale", "Schematic and not to scale", "A 3D model", "Only used by operators"],
          correct: 1,
          why: "P&IDs show connectivity and control, not physical dimensions.",
        },
        {
          q: "What should you check first before relying on a P&ID?",
          options: ["The paper colour", "Its revision and legend", "The scale bar", "The weld numbers"],
          correct: 1,
          why: "Revision control and the legend determine whether you are reading the right information correctly.",
        },
      ],
    },
    {
      slug: "pid-lines-tags",
      title: "Line numbers and instrument tags (ISA 5.1)",
      minutes: 10,
      diagram: "line-number",
      summary: "Decode a line number and read instrument bubbles like FIC-101 or LAHH-301.",
      sections: [
        {
          heading: "Anatomy of a line number",
          paragraphs: [
            "Every pipeline has a unique line number. The exact format is set by the project, but a very common pattern is: size – service – sequence number – piping class – insulation/other.",
            "Example: 6\"-PW-1001-A1A-IH means 6-inch NPS, process water service, line sequence 1001, piping class A1A (which defines material, rating, wall thickness, gaskets, valves) and 'IH' for heat-conservation insulation. The piping class is the key link to materials and welding requirements.",
          ],
        },
        {
          heading: "Instrument tags and bubbles",
          paragraphs: [
            "Instrument identification follows ISA 5.1. The first letter is the measured or initiating variable; the following letters describe the function.",
          ],
          bullets: [
            "First letter: F = flow, T = temperature, P = pressure, L = level, A = analysis, S = speed, Z = position.",
            "Succeeding letters: I = indicator, C = controller, T = transmitter, E = primary element, S = switch, V = valve/damper, A = alarm, H/L = high/low.",
            "Examples: PIT-101 = pressure indicating transmitter; FIC-203 = flow indicating controller; LAHH-301 = level alarm high-high; FV-203 = flow control valve.",
            "Bubble line: no line = field mounted; solid line = main control room/operator accessible; dashed line = behind a panel or not accessible to the operator.",
          ],
        },
      ],
      tips: [
        "Learn the first-letter list by heart — it unlocks 90% of tags.",
        "The piping class code is your bridge from the drawing to the piping material specification.",
        "Loop numbers tie instruments together: FE-203, FT-203 and FV-203 belong to the same flow loop.",
      ],
      terms: [
        { term: "NPS", def: "Nominal Pipe Size, in inches (not the real outside diameter for small sizes)." },
        { term: "Piping class", def: "Code that defines material, pressure rating, wall thickness, fittings and valves for a line." },
        { term: "ISA 5.1", def: "Instrumentation symbols and identification standard." },
        { term: "Loop", def: "A group of instruments working together to measure/control one variable." },
      ],
      quiz: [
        {
          q: "In the tag LAHH-301, what does it indicate?",
          options: ["Level alarm, high-high", "Flow alarm, high-high", "Level controller", "Pressure alarm"],
          correct: 0,
          why: "L = level, A = alarm, HH = high-high.",
        },
        {
          q: "In 6\"-PW-1001-A1A-IH, what does 'A1A' most likely define?",
          options: ["Line size", "Service fluid", "Piping class", "Insulation thickness"],
          correct: 2,
          why: "The piping class defines material, rating, wall thickness and component specs.",
        },
        {
          q: "An instrument bubble with a dashed horizontal line is typically:",
          options: ["Field mounted", "In the main control room, accessible", "Behind a panel / not normally accessible", "A software function"],
          correct: 2,
          why: "Dashed = behind panel or not normally accessible; solid = operator accessible; no line = field.",
        },
      ],
    },
    {
      slug: "pid-symbols-qc",
      title: "Valve & equipment symbols — and how QC uses the P&ID",
      minutes: 10,
      diagram: "pid-symbols",
      summary: "Common symbols, valve failure positions, and the P&ID checks an inspector makes.",
      sections: [
        {
          heading: "Symbols you will see every day",
          paragraphs: [
            "Most P&ID legends show valves as two triangles meeting at a point (a 'bow-tie') with a different mark for each type. Always confirm against the project legend — conventions vary between companies.",
          ],
          bullets: [
            "Gate valve: plain bow-tie (isolation, fully open or closed).",
            "Globe valve: bow-tie with a solid circle (throttling).",
            "Ball valve: bow-tie with a circle (quick quarter-turn isolation).",
            "Check valve: allows flow in one direction only — the arrow tells you which.",
            "Control valve: valve body with an actuator on top; tag usually FV/PV/LV/TV.",
            "PSV: pressure safety valve — protects equipment from overpressure.",
          ],
        },
        {
          heading: "Fail position and special items",
          paragraphs: [
            "Control and shutdown valves show a fail position: FC (fail closed), FO (fail open) or FL (fail last). Spectacle blinds, line blinds and spec breaks (where the piping class changes) also appear and matter for testing and isolation.",
          ],
        },
        {
          heading: "How a QC inspector uses the P&ID",
          paragraphs: ["The P&ID is the reference you compare the built system against."],
          bullets: [
            "Check installed valve types, flow direction and tag numbers match the drawing.",
            "Confirm the correct piping class on each segment (and at spec breaks).",
            "Define hydrotest packs and isolation points; confirm vents and drains exist at high and low points.",
            "Identify items on HOLD and mark red-line changes for as-built updates.",
          ],
        },
      ],
      tips: [
        "Flow direction on check valves and control valves is a frequent installation error — always verify against the drawing.",
        "If the drawing and the field disagree, don't 'fix' it — raise it through the project's change/NCR process.",
      ],
      terms: [
        { term: "PSV", def: "Pressure Safety Valve." },
        { term: "FC / FO / FL", def: "Fail Closed / Fail Open / Fail Last position of an actuated valve." },
        { term: "Spec break", def: "Point where piping class changes along a line." },
        { term: "Red-line", def: "Mark-up showing as-built changes to a drawing." },
      ],
      quiz: [
        {
          q: "A control valve is marked 'FC'. What happens on loss of air/power?",
          options: ["It opens", "It closes", "It stays in its last position", "It vents to atmosphere only"],
          correct: 1,
          why: "FC = fail closed.",
        },
        {
          q: "What is the safest action if the installed valve differs from the P&ID?",
          options: ["Swap it quietly", "Ignore it", "Raise an NCR / change request", "Repaint the tag"],
          correct: 2,
          why: "Deviations are controlled through the project's non-conformance or change process.",
        },
        {
          q: "Why do inspectors look for vents and drains on the P&ID?",
          options: ["Decoration", "They're needed for hydrotest filling and draining", "They show weld numbers", "They indicate insulation"],
          correct: 1,
          why: "Vents are required to purge air at high points and drains to empty low points during testing.",
        },
      ],
    },
  ],
};

export const ISO_MODULE: LearningModule = {
  slug: "iso",
  title: "Isometric Drawings",
  icon: "📐",
  blurb: "Read piping isometrics: dimensions, welds, fittings, bills of material and what to inspect.",
  roles: ["QC_INSPECTION", "WELDING", "NDT", "PROJECT_MANAGEMENT", "OPERATIONS"],
  lessons: [
    {
      slug: "iso-basics",
      title: "How an isometric is laid out",
      minutes: 9,
      diagram: "iso-example",
      summary: "Axes, north arrow, dimensions, elevations and the information blocks on an iso.",
      sections: [
        {
          heading: "Drawing in 3D on a flat sheet",
          paragraphs: [
            "An isometric drawing shows a single pipeline in 3D using three axes: one vertical and two at 30° to the horizontal. Vertical pipe is drawn vertical; pipe running along the two plan directions is drawn along the 30° axes. It is not to scale — dimensions govern.",
          ],
        },
        {
          heading: "What's on the sheet",
          paragraphs: [],
          bullets: [
            "Line number, piping class, fluid, design/test pressure and temperature, NDE percentage, PWHT, insulation and paint codes.",
            "North arrow to orient the drawing to the plant.",
            "Bill of materials (BOM) and cut list — every component with size, rating, material and quantity.",
            "Weld numbers, shop vs field welds, spool numbers, supports, slopes and flow arrows.",
            "Dimensions: centre-line to centre-line, face-to-face for valves/flanges; elevations shown as EL +100.500 style values.",
          ],
        },
        {
          heading: "Working out a pipe cut length",
          paragraphs: [
            "Cut length = centre-to-centre dimension − take-outs of the fittings at each end − root gaps. For a long-radius 90° elbow, the centre-to-end take-out is 1.5 × NPS (in inches): a 4\" LR elbow is 6\" (about 152 mm); a 6\" LR elbow is 9\" (about 229 mm).",
          ],
        },
      ],
      tips: [
        "Never scale an isometric — use the dimensions.",
        "Read the notes block first; special requirements (PWHT, NDE %, slope) are easy to miss.",
        "Use the North arrow to sanity-check the orientation against the plot plan.",
      ],
      terms: [
        { term: "EL", def: "Elevation (height) relative to the project datum." },
        { term: "Spool", def: "A prefabricated section of pipe with fittings, delivered as one piece." },
        { term: "Take-out", def: "Distance from a fitting's centre to its welding end." },
        { term: "BOM", def: "Bill of materials for the line/spool." },
      ],
      quiz: [
        {
          q: "An isometric drawing is:",
          options: ["Drawn to scale", "Not to scale — use the dimensions", "A plan view only", "Only for instruments"],
          correct: 1,
          why: "Isometrics are not scaled; dimensions control.",
        },
        {
          q: "Centre-to-end take-out of a 4\" long-radius 90° elbow is about:",
          options: ["4\"", "5\"", "6\"", "8\""],
          correct: 2,
          why: "LR elbow take-out = 1.5 × NPS, so 1.5 × 4 = 6\".",
        },
        {
          q: "Which is NOT normally found on an isometric?",
          options: ["Weld numbers", "Bill of materials", "North arrow", "Control logic code"],
          correct: 3,
          why: "Control logic lives on P&IDs and instrument documents.",
        },
      ],
    },
    {
      slug: "iso-fittings-welds",
      title: "Fittings, flanges, branches and weld symbols",
      minutes: 9,
      summary: "Recognise common fittings and understand shop/field weld marking.",
      sections: [
        {
          heading: "Fittings and their pitfalls",
          paragraphs: [],
          bullets: [
            "Elbows: 90° and 45°, long radius (LR) unless 'SR' (short radius) is stated.",
            "Reducers: concentric or eccentric. Eccentric reducers are marked FOT (flat on top) or FOB (flat on bottom); pump suction lines usually use FOT to avoid air pockets.",
            "Tees and olets: weldolet, sockolet and threadolet are branch connections welded onto the run pipe; check if a reinforcement pad is required.",
            "Flanges: weld neck (WN), slip-on (SO), socket weld (SW), blind; check rating (150#, 300#, 600#) and facing (RF = raised face).",
          ],
        },
        {
          heading: "Welds on the iso",
          paragraphs: [
            "Each weld carries a number so it can be traced to a welder, WPS and NDE result. Shop welds are done in the fabrication shop; field welds (FW) are made on site. 'Field fit weld' (FFW) means the spool is left long and cut to fit at installation. The marking symbols vary by project — check the legend.",
          ],
        },
      ],
      tips: [
        "Orientation of eccentric reducers and flange facing are easy fabrication errors — check them before welding.",
        "Weld numbers must match the weld map and NDE reports 1:1.",
      ],
      terms: [
        { term: "FOT / FOB", def: "Flat on Top / Flat on Bottom (eccentric reducer orientation)." },
        { term: "WN / SO", def: "Weld Neck / Slip-On flange." },
        { term: "FW / FFW", def: "Field Weld / Field Fit Weld." },
        { term: "Olet", def: "Forged branch fitting welded to the run pipe." },
      ],
      quiz: [
        {
          q: "An eccentric reducer on a pump suction is usually installed:",
          options: ["Flat on bottom", "Flat on top", "Concentric only", "Any way"],
          correct: 1,
          why: "Flat on top avoids trapping air/vapour at the pump inlet.",
        },
        {
          q: "'FFW' on an isometric means:",
          options: ["Final finish weld", "Field fit weld — cut to fit on site", "Flange face weld", "Fully fused weld"],
          correct: 1,
          why: "Left long and trimmed at installation to fit actual field conditions.",
        },
        {
          q: "Why does each weld have a unique number?",
          options: ["For painting", "To trace welder, WPS and NDE results", "To order materials", "To set the slope"],
          correct: 1,
          why: "Traceability from weld → welder → procedure → inspection result.",
        },
      ],
    },
    {
      slug: "iso-qc-check",
      title: "Inspecting a spool against its isometric",
      minutes: 8,
      summary: "A practical checklist to verify materials, dimensions, welds and documentation.",
      sections: [
        {
          heading: "The walk-around checklist",
          paragraphs: [],
          bullets: [
            "Drawing revision and line number match the spool tag and traveller/ITP.",
            "Every component matches the BOM: size, schedule/wall, rating, grade; heat numbers traceable to MTRs.",
            "Overall and branch dimensions within the project tolerance (commonly around ±3 mm unless the spec says otherwise).",
            "Fit-up: correct bevel, root gap, alignment/hi-low within the WPS and code limits.",
            "Weld ID, welder ID and WPS number recorded for each weld; visual inspection complete before NDE.",
            "NDE selected and extent met as per the iso notes; PWHT/hardness done if required.",
            "Cleanliness, end protection and correct marking before release.",
          ],
        },
      ],
      tips: [
        "Verify traceability before welding, not after — a wrong heat number is expensive to fix later.",
        "Record what you actually measured, not just 'OK'.",
      ],
      terms: [
        { term: "ITP", def: "Inspection and Test Plan." },
        { term: "Traveller", def: "Record that follows a spool through fabrication stages." },
        { term: "Hi-low", def: "Radial misalignment between two pipe ends at a joint." },
      ],
      quiz: [
        {
          q: "Best time to confirm component heat numbers against MTRs is:",
          options: ["After NDE", "Before welding / at fit-up", "At final painting", "Never"],
          correct: 1,
          why: "Fixing the wrong material after welding means cutting out welds.",
        },
        {
          q: "Where do you find the required NDE percentage for a line?",
          options: ["Only the weather report", "The iso notes / ITP / project spec", "The valve tag", "The flange face"],
          correct: 1,
          why: "Typically shown in iso notes and governed by the ITP and project specification.",
        },
        {
          q: "Which should be completed before NDE of a weld?",
          options: ["Painting", "Visual inspection", "Hydrotest", "Insulation"],
          correct: 1,
          why: "Visual inspection comes first; unacceptable surface conditions can invalidate other methods.",
        },
      ],
    },
  ],
};
