import type { LearningModule } from "./types";

export const MTR_MODULE: LearningModule = {
  slug: "mtr",
  title: "Material Test Reports (MTR)",
  icon: "📄",
  blurb: "Read and verify mill test reports and EN 10204 certificates: chemistry, mechanicals, traceability and red flags.",
  roles: ["QC_INSPECTION", "WELDING", "NDT", "PROJECT_MANAGEMENT", "OPERATIONS"],
  lessons: [
    {
      slug: "mtr-anatomy",
      title: "Anatomy of an MTR",
      minutes: 9,
      summary: "What an MTR proves, the certificate types, and each block you will read.",
      sections: [
        {
          heading: "What an MTR is for",
          paragraphs: [
            "A Material Test Report (also called mill test report, MTC or CMTR) is the manufacturer's record that a specific heat/lot of material was tested and meets the specification. It is the link between a physical pipe, plate or fitting and its proven properties — the basis of material traceability.",
          ],
        },
        {
          heading: "Certificate types (EN 10204)",
          paragraphs: ["European-style certificates are widely requested on North American projects:"],
          bullets: [
            "2.1 — declaration of compliance (no test results).",
            "2.2 — test report with results from non-specific testing (not on your actual product).",
            "3.1 — inspection certificate with results from specific testing of your product, validated by the manufacturer's authorised representative who is independent of the production department. The most common requirement for pressure piping.",
            "3.2 — like 3.1 but also validated by the purchaser's inspector or a third party.",
          ],
        },
        {
          heading: "Blocks on the report",
          paragraphs: [],
          bullets: [
            "Identification: manufacturer, heat/cast number, lot, size, quantity, purchase order, specification and grade (e.g. ASTM A106 Gr B, A516 Gr 70, API 5L X52 PSL2).",
            "Chemical analysis (heat and sometimes product): C, Mn, P, S, Si, Cr, Mo, Ni, Cu, V, Nb, Ti and the carbon equivalent.",
            "Mechanical properties: yield strength, tensile strength, elongation, hardness, and impact (Charpy V-notch: test temperature, specimen size, energy in joules).",
            "Heat treatment (e.g. normalised, quenched & tempered), NDE/hydrotest where required, and the authorised signature/stamp and date.",
          ],
        },
      ],
      tips: [
        "The heat number is the golden thread: it must appear on the MTR and on the physical marking of the material.",
        "Check units — MPa vs psi, J vs ft-lbf — before comparing to the spec.",
      ],
      terms: [
        { term: "Heat number", def: "Identifier of the single molten batch of steel the material came from." },
        { term: "YS / UTS", def: "Yield strength / ultimate tensile strength." },
        { term: "CVN", def: "Charpy V-notch impact test (toughness)." },
        { term: "CE (IIW)", def: "Carbon equivalent = C + Mn/6 + (Cr+Mo+V)/5 + (Ni+Cu)/15; indicates weldability/hardenability." },
      ],
      quiz: [
        {
          q: "Which EN 10204 type is validated by the purchaser's inspector or a third party as well?",
          options: ["2.1", "2.2", "3.1", "3.2"],
          correct: 3,
          why: "3.2 adds validation by the purchaser's representative or a third party.",
        },
        {
          q: "The key identifier linking a physical pipe to its MTR is the:",
          options: ["Invoice number", "Heat number", "Truck number", "Paint colour"],
          correct: 1,
          why: "Heat number provides traceability between material marking and certificate.",
        },
        {
          q: "A higher carbon equivalent generally means:",
          options: ["Easier to weld", "More care with preheat / hardenability", "Better corrosion resistance", "Lower strength"],
          correct: 1,
          why: "Higher CE increases the risk of hard, crack-prone heat-affected zones, so preheat and procedure control matter more.",
        },
      ],
    },
    {
      slug: "mtr-verify",
      title: "Verifying an MTR and spotting red flags",
      minutes: 9,
      summary: "A step-by-step review against the PO and spec, plus common traps and PMI.",
      sections: [
        {
          heading: "Review sequence",
          paragraphs: [],
          bullets: [
            "1. Match: heat number, size and quantity on the MTR vs the physical marking and packing list.",
            "2. Specification: grade, product form and edition match the PO / piping class (e.g. A106 Gr B, not A53).",
            "3. Chemistry: every element within the spec's limits; CE within project limits.",
            "4. Mechanicals: yield, tensile and elongation meet the minimum. Example minimums: A106 Gr B yield 35 ksi (240 MPa), tensile 60 ksi (415 MPa); API 5L X52 yield 52 ksi (360 MPa).",
            "5. Impact: required? Test temperature must be at or below the design minimum temperature; individual and average energy must meet the minimum.",
            "6. Heat treatment, supplementary requirements (e.g. sour service) and hardness. For carbon steel in sour service the NACE MR0175 / ISO 15156 limit is 22 HRC.",
            "7. Signature, stamp, date and lab accreditation are present and nothing has been altered.",
          ],
        },
        {
          heading: "Red flags",
          paragraphs: [],
          bullets: [
            "Photocopy with different fonts or overwritten numbers; missing signature or date.",
            "Heat number on the MTR not found on the material, or the same MTR used for several heats.",
            "Impact test done at a warmer temperature than required, or missing when required.",
            "Wrong grade or an older spec edition than the PO demands.",
          ],
        },
        {
          heading: "PMI for alloys",
          paragraphs: [
            "For alloy materials (e.g. 304 vs 316L stainless) positive material identification with XRF verifies the actual chemistry on site. Standard XRF cannot reliably measure carbon, so it does not replace the MTR.",
          ],
        },
      ],
      tips: [
        "Quarantine suspect material immediately and tag it — don't let it reach the welding bay.",
        "Always compare against the governing specification in the PO, not memory.",
      ],
      terms: [
        { term: "PMI", def: "Positive Material Identification (usually XRF or OES) to confirm alloy grade." },
        { term: "NCR", def: "Non-Conformance Report." },
        { term: "Sour service", def: "Environment containing H2S where hardness limits apply." },
      ],
      quiz: [
        {
          q: "The Charpy test temperature on the MTR is warmer than the design minimum temperature. You should:",
          options: ["Accept it", "Reject / raise an NCR", "Ignore impact tests", "Re-stamp the MTR"],
          correct: 1,
          why: "Impact tests must demonstrate toughness at or below the minimum design temperature.",
        },
        {
          q: "A PMI XRF gun can NOT reliably tell you the material's:",
          options: ["Chromium", "Molybdenum", "Carbon content", "Nickel"],
          correct: 2,
          why: "Standard XRF cannot measure carbon reliably (light element).",
        },
        {
          q: "NACE MR0175 / ISO 15156 typically limits carbon steel hardness in sour service to:",
          options: ["10 HRC", "22 HRC", "40 HRC", "No limit"],
          correct: 1,
          why: "22 HRC maximum for carbon and low-alloy steel in sour service (confirm the current edition).",
        },
      ],
    },
  ],
};

export const WPS_MODULE: LearningModule = {
  slug: "wps",
  title: "WPS, PQR & Welder Qualification",
  icon: "🔥",
  blurb: "How welding procedures and welder qualifications fit together — and what an inspector verifies before and during welding.",
  roles: ["WELDING", "QC_INSPECTION", "NDT", "PROJECT_MANAGEMENT"],
  lessons: [
    {
      slug: "wps-pqr-wpq",
      title: "WPS, PQR and WPQ — how they fit together",
      minutes: 10,
      diagram: "wps-flow",
      summary: "The three documents, what each proves, and which codes you meet in Western Canada.",
      sections: [
        {
          heading: "Three documents, three jobs",
          paragraphs: [],
          bullets: [
            "WPS (Welding Procedure Specification): the 'recipe' given to the welder — process, materials, thickness range, filler, preheat, interpass, heat input range, position, PWHT, shielding gas.",
            "PQR (Procedure Qualification Record): the 'proof' — the actual values used on a test weld and the test results (tensile, bend, impact, macro) that back the WPS.",
            "WPQ / welder qualification: proves a specific welder can produce sound welds with a given process, position, material group and thickness/diameter range.",
          ],
        },
        {
          heading: "Which code applies?",
          paragraphs: [
            "The governing code depends on what is being built. Common ones: ASME B31.3 (process piping) with ASME IX for qualification; CSA Z662 and API 1104 for pipelines; CSA W47.1 (company certification by CWB) with CSA W59 for structural steel; AWS D1.1 for structural welding. The project specification states which edition applies.",
          ],
        },
        {
          heading: "Process shorthand",
          paragraphs: [],
          bullets: [
            "SMAW (stick), GTAW (TIG), GMAW (MIG/MAG), FCAW (flux-cored), SAW (submerged arc).",
            "E7018: 70 ksi tensile, all-position, low-hydrogen. ER70S-2: common GTAW/GMAW filler. E6010: cellulosic electrode widely used for pipeline root passes.",
          ],
        },
      ],
      tips: [
        "A WPS is only valid if a PQR (or a prequalified provision of the code) supports it.",
        "Qualifying a welder does not qualify the procedure, and vice versa — you need both.",
      ],
      terms: [
        { term: "Essential variable", def: "A change in this variable requires the procedure to be requalified." },
        { term: "Heat input", def: "(Volts × Amps × 60) ÷ (travel speed mm/min × 1000) = kJ/mm." },
        { term: "CWB", def: "Canadian Welding Bureau — certifies welding companies and welders under CSA standards." },
        { term: "P-number / F-number", def: "ASME IX groupings of base metals / filler metals." },
      ],
      quiz: [
        {
          q: "Which document records the actual test-weld values and test results?",
          options: ["WPS", "PQR", "ITP", "BOM"],
          correct: 1,
          why: "The PQR is the proof that backs the WPS.",
        },
        {
          q: "Heat input in kJ/mm for 24 V, 200 A at 240 mm/min travel is:",
          options: ["0.6", "1.0", "1.2", "2.4"],
          correct: 2,
          why: "(24 × 200 × 60) ÷ (240 × 1000) = 288,000 ÷ 240,000 = 1.2 kJ/mm.",
        },
        {
          q: "E7018 is best described as:",
          options: ["Cellulosic root electrode", "Low-hydrogen all-position electrode", "TIG filler wire", "Flux-cored wire"],
          correct: 1,
          why: "E70 = 70 ksi, 1 = all positions, 18 = low-hydrogen iron-powder coating.",
        },
      ],
    },
    {
      slug: "wps-positions-variables",
      title: "Positions, variables and qualification limits",
      minutes: 9,
      summary: "Test positions (1G–6G), essential variables and when qualification lapses.",
      sections: [
        {
          heading: "Test positions",
          paragraphs: [],
          bullets: [
            "Plate groove: 1G flat, 2G horizontal, 3G vertical, 4G overhead.",
            "Pipe groove: 1G rolled (pipe turned, welded flat), 2G pipe vertical axis (horizontal weld), 5G pipe horizontal and fixed, 6G pipe fixed at 45° — the most demanding test, usually qualifying all positions for groove welds.",
          ],
        },
        {
          heading: "Variables that matter",
          paragraphs: [
            "Under ASME IX variables are grouped as essential, supplementary essential (when toughness is required) and non-essential. Typical essential changes: process, base-metal P-number group, filler F-number, thickness range, preheat decrease, PWHT, shielding gas and current type/polarity.",
          ],
        },
        {
          heading: "Keeping a welder qualified",
          paragraphs: [
            "A welder's qualification for a process is generally maintained by using that process at least once every six months (ASME IX continuity). Longer gaps require re-qualification. Always check the specific code and CWB rules, which can differ.",
          ],
        },
      ],
      tips: [
        "Check the welder's qualified range covers the actual production joint: process, position, material, thickness/diameter.",
        "Write down the welder's ID and the WPS number on the weld record — never assume.",
      ],
      terms: [
        { term: "6G", def: "Pipe fixed at 45° — most severe position test." },
        { term: "Continuity", def: "Evidence the welder used the process within the allowed period." },
        { term: "Interpass temperature", def: "Temperature of the weld area before the next pass." },
      ],
      quiz: [
        {
          q: "Which pipe test position is fixed at 45°?",
          options: ["1G", "2G", "5G", "6G"],
          correct: 3,
          why: "6G = pipe inclined 45° and fixed.",
        },
        {
          q: "Under ASME IX, welder qualification for a process is typically maintained if the process is used at least:",
          options: ["Weekly", "Monthly", "Every 6 months", "Every 5 years"],
          correct: 2,
          why: "Six-month continuity is the common rule; check the exact code.",
        },
        {
          q: "A change in which of these normally requires WPS requalification?",
          options: ["Welder's shirt colour", "Welding process", "Pencil used to record data", "Time of day"],
          correct: 1,
          why: "The welding process is an essential variable.",
        },
      ],
    },
    {
      slug: "wps-qc-checks",
      title: "What inspectors verify before, during and after welding",
      minutes: 8,
      summary: "A practical inspection flow from documents to final visual.",
      sections: [
        {
          heading: "Before welding",
          paragraphs: [],
          bullets: [
            "Approved WPS available at the workface; welder's qualification covers the joint.",
            "Material and filler traceable (MTR / batch); electrodes stored and handled per procedure (low-hydrogen rods in heated holding ovens).",
            "Fit-up: bevel angle, root face/gap, alignment, cleanliness; preheat applied and measured.",
          ],
        },
        {
          heading: "During welding",
          paragraphs: [],
          bullets: [
            "Interpass temperature, travel speed/heat input, shielding gas flow, wind protection.",
            "Interpass cleaning and root/hot-pass inspection where required; stop and correct, don't bury a defect.",
          ],
        },
        {
          heading: "After welding",
          paragraphs: [],
          bullets: [
            "Final visual (VT): profile, reinforcement, undercut, cracks, surface porosity, arc strikes, spatter.",
            "NDE at the required extent; PWHT and hardness testing if specified; marking, record sign-off and weld map update.",
          ],
        },
      ],
      tips: [
        "Hold points exist for a reason — never let work continue past one without sign-off.",
        "Cracks are rejected under every common code, regardless of size.",
      ],
      terms: [
        { term: "Hold point", def: "Stage where work stops until the inspector signs off." },
        { term: "Preheat", def: "Heating base metal before welding to slow cooling and reduce cracking risk." },
        { term: "PWHT", def: "Post-weld heat treatment." },
      ],
      quiz: [
        {
          q: "Low-hydrogen electrodes should be:",
          options: ["Left in the rain", "Kept in a heated holding oven per procedure", "Soaked in water", "Stored in a toolbox"],
          correct: 1,
          why: "Moisture introduces hydrogen, a cause of cold cracking.",
        },
        {
          q: "Which is acceptable under common welding codes?",
          options: ["A small crack", "A short crack at the toe", "No cracks of any size", "A crack if repaired later"],
          correct: 2,
          why: "Cracks are unacceptable in all common codes.",
        },
        {
          q: "When should the welder's qualification be checked?",
          options: ["Before welding starts", "After NDE", "At project closeout", "Only on request"],
          correct: 0,
          why: "Verify qualification and WPS before production welding.",
        },
      ],
    },
  ],
};

export const NDT_MODULE: LearningModule = {
  slug: "defects-ndt",
  title: "Weld Defects & NDT Methods",
  icon: "🔍",
  blurb: "Recognise common weld imperfections and choose the right NDT method for the job.",
  roles: ["NDT", "QC_INSPECTION", "WELDING"],
  lessons: [
    {
      slug: "weld-defects",
      title: "Common weld imperfections",
      minutes: 8,
      summary: "What each defect looks like, why it happens and how it is found.",
      sections: [
        {
          heading: "Surface-breaking (found by VT, MT, PT)",
          paragraphs: [],
          bullets: [
            "Undercut: groove melted into the base metal at the toe — travel speed/current too high or poor technique.",
            "Overlap: weld metal rolled over base metal without fusing.",
            "Surface porosity and arc strikes; excessive reinforcement or concavity (suck-back).",
            "Cracks: hot cracks (during solidification) and hydrogen/cold cracks (after cooling, often delayed in the HAZ).",
          ],
        },
        {
          heading: "Internal (found by RT, UT, PAUT/TOFD)",
          paragraphs: [],
          bullets: [
            "Porosity (gas pockets) and slag inclusions — volumetric defects.",
            "Lack of fusion (LOF): weld metal not fused to base metal or previous pass — planar and serious.",
            "Incomplete penetration (IP/LOP): weld root not fully penetrated.",
            "Burn-through and internal misalignment (hi-low).",
          ],
        },
        {
          heading: "Why they happen",
          paragraphs: [
            "Most defects trace back to a handful of causes: poor fit-up or cleaning, moisture/contamination, wrong parameters, insufficient preheat, poor technique, or damaged/wet consumables.",
          ],
        },
      ],
      tips: [
        "Planar defects (cracks, LOF) are more dangerous than rounded ones; acceptance criteria are stricter for them.",
        "Always determine the cause, not just the repair — otherwise the defect repeats.",
      ],
      terms: [
        { term: "HAZ", def: "Heat-affected zone — base metal altered by welding heat." },
        { term: "LOF", def: "Lack of fusion." },
        { term: "IP", def: "Incomplete penetration." },
      ],
      quiz: [
        {
          q: "Delayed cracking in the HAZ is usually linked to:",
          options: ["Hydrogen, hardness and stress", "Wrong paint", "Too much shielding gas only", "Pipe colour"],
          correct: 0,
          why: "Cold/hydrogen cracking needs hydrogen, a susceptible hard microstructure and stress.",
        },
        {
          q: "Which defect is a planar flaw between weld and base metal?",
          options: ["Porosity", "Slag", "Lack of fusion", "Spatter"],
          correct: 2,
          why: "LOF is planar — weld metal not fused to the surface it should join.",
        },
        {
          q: "Undercut is a groove at the:",
          options: ["Centre of the root", "Weld toe in the base metal", "Pipe ID only", "Backing ring"],
          correct: 1,
          why: "It is melted-away base metal along the toe of the weld.",
        },
      ],
    },
    {
      slug: "ndt-methods",
      title: "Choosing an NDT method",
      minutes: 10,
      summary: "VT, MT, PT, UT and RT — what each finds, limits, and basic safety.",
      sections: [
        {
          heading: "The main methods",
          paragraphs: [],
          bullets: [
            "VT (visual): always first. Surface only; needs good light, access and a gauge for sizing.",
            "MT (magnetic particle): surface and slightly sub-surface flaws in ferromagnetic materials only — not austenitic stainless.",
            "PT (liquid penetrant): surface-breaking flaws on non-porous materials; controlled cleaning, dwell time and developer.",
            "UT (ultrasonic): volumetric; strong for planar flaws such as LOF and cracks; PAUT and TOFD provide recorded imaging.",
            "RT (radiography): volumetric; good for porosity and slag; gives a permanent film/digital record; poor for planar flaws not aligned with the beam. Uses X-ray or gamma sources (e.g. Ir-192, Se-75).",
          ],
        },
        {
          heading: "Radiation safety",
          paragraphs: [
            "Radiography work follows ALARA: minimise time, maximise distance and use shielding. Only certified personnel and licensed sources are allowed; boundaries, warning signs and dosimetry are mandatory.",
          ],
        },
        {
          heading: "Personnel qualification",
          paragraphs: [
            "NDT personnel are certified to levels I–III (e.g. CGSB 48.9712 / ISO 9712 in Canada) with employer-based practices such as SNT-TC-1A where applicable. Reports must show method, procedure, equipment calibration, acceptance criteria and inspector certification.",
          ],
        },
      ],
      tips: [
        "Match the method to the defect type and orientation, not to personal preference.",
        "Calibration and procedure compliance are as important as the test itself.",
      ],
      terms: [
        { term: "TOFD", def: "Time-of-Flight Diffraction ultrasonic technique." },
        { term: "PAUT", def: "Phased-array ultrasonic testing." },
        { term: "ALARA", def: "As Low As Reasonably Achievable (radiation exposure)." },
      ],
      quiz: [
        {
          q: "Which method can NOT be used on austenitic stainless steel because it needs magnetism?",
          options: ["MT", "PT", "UT", "VT"],
          correct: 0,
          why: "MT requires ferromagnetic material; austenitic stainless is non-magnetic.",
        },
        {
          q: "Which method is generally best for finding planar flaws like lack of fusion?",
          options: ["UT / TOFD", "Visual only", "Colour matching", "Weighing"],
          correct: 0,
          why: "Ultrasonic methods are sensitive to planar flaws.",
        },
        {
          q: "ALARA means:",
          options: ["Always Look At Radiation Alarms", "As Low As Reasonably Achievable", "All Lines Are Rejected Always", "Approved Level Of Radiation Allowed"],
          correct: 1,
          why: "Keep radiation exposure as low as reasonably achievable using time, distance and shielding.",
        },
      ],
    },
  ],
};

export const SAFETY_MODULE: LearningModule = {
  slug: "safety",
  title: "Field Safety Essentials",
  icon: "🦺",
  blurb: "Hazard assessment, hierarchy of controls, lockout, H2S and confined space — the core of a safe site.",
  roles: ["NDT", "ROPE_ACCESS", "QC_INSPECTION", "CIVIL", "WELDING", "COATING", "OPERATIONS", "GEOTECHNICAL"],
  lessons: [
    {
      slug: "hazard-hierarchy",
      title: "Hazard assessment and the hierarchy of controls",
      minutes: 8,
      summary: "Spot hazards, rank controls, use stop-work authority.",
      sections: [
        {
          heading: "Finding hazards",
          paragraphs: [
            "Before starting work, assess the task, the place and the people. In Alberta the OHS Code requires employers to assess and control worksite hazards and to review the assessment when conditions change. A field-level hazard assessment (FLHA/JSA) turns that into a short, written, shared plan.",
          ],
          bullets: [
            "Break the job into steps; list hazards for each (energy, height, atmosphere, moving equipment, weather, ergonomics).",
            "Choose controls, assign who does what, and re-check when conditions change.",
          ],
        },
        {
          heading: "Hierarchy of controls (best to worst)",
          paragraphs: [],
          bullets: [
            "Elimination — remove the hazard.",
            "Substitution — replace it with something less hazardous.",
            "Engineering controls — guards, ventilation, barriers.",
            "Administrative controls — procedures, permits, training, signage.",
            "PPE — the last line of defence, not the first.",
          ],
        },
        {
          heading: "Stop-work authority",
          paragraphs: ["Everyone has the right and duty to stop work that looks unsafe. Report near misses — they are free lessons."],
        },
      ],
      tips: [
        "If a control depends only on someone remembering, it is weak — look for a higher level of control.",
        "Re-do the hazard assessment when anything changes: weather, scope, crew, location.",
      ],
      terms: [
        { term: "FLHA / JSA", def: "Field Level Hazard Assessment / Job Safety Analysis." },
        { term: "Near miss", def: "Event that could have caused harm but did not." },
        { term: "LOTO", def: "Lockout/Tagout — isolating and locking energy sources." },
      ],
      quiz: [
        {
          q: "Which is the MOST effective control?",
          options: ["PPE", "Warning sign", "Eliminating the hazard", "A procedure"],
          correct: 2,
          why: "Elimination sits at the top of the hierarchy.",
        },
        {
          q: "Conditions change mid-job (new weather, new scope). You should:",
          options: ["Carry on", "Reassess the hazards", "Finish quickly", "Ask for PPE only"],
          correct: 1,
          why: "Hazard assessments must be reviewed when conditions change.",
        },
        {
          q: "PPE is best described as:",
          options: ["The first control", "The last line of defence", "Unnecessary", "A substitute for training"],
          correct: 1,
          why: "PPE protects only the wearer and fails silently — use higher controls first.",
        },
      ],
    },
    {
      slug: "field-hazards",
      title: "H2S, confined space, lockout and heights",
      minutes: 10,
      summary: "High-consequence hazards and the safety tickets that go with them.",
      sections: [
        {
          heading: "Hydrogen sulphide (H2S)",
          paragraphs: [
            "H2S is toxic and flammable. It smells like rotten eggs at low concentrations, but at higher levels it deadens the sense of smell — so smell is never a safe way to detect it. It is heavier than air and collects in low areas. Always use calibrated personal gas monitors and follow your H2S Alive training. Alberta occupational exposure limits are low (10 ppm over eight hours, with a short-term limit above that) — confirm current values in the OHS Code.",
          ],
        },
        {
          heading: "Confined space",
          paragraphs: [
            "Confined spaces need a written hazard assessment, an entry permit, atmospheric testing before entry (oxygen, flammables, toxics — commonly 19.5–23% oxygen), a trained standby attendant outside and a rescue plan that does not rely on an untrained 'hero'. Never enter to rescue someone without proper equipment and training.",
          ],
        },
        {
          heading: "Lockout / isolation and heights",
          paragraphs: [
            "Lockout: isolate, lock, tag, release stored energy and TRY to start it to prove zero energy. Each worker uses their own lock. For heights, Alberta requires a fall protection plan above 3 m; inspect harnesses and anchors before each use and never work alone on rope access — always follow the two-rope principle.",
          ],
        },
        {
          heading: "Common tickets in Western Canada",
          paragraphs: ["Many sites ask for: CSTS (Construction Safety Training System), H2S Alive, Standard First Aid/CPR, WHMIS, Ground Disturbance, Fall Protection, Confined Space Entry, TDG and (for rope access) IRATA or SPRAT. Track their expiry dates in your Credentials page."],
        },
      ],
      tips: [
        "Wearing a monitor you don't trust (uncalibrated or never bump-tested) is worse than none.",
        "Renew tickets before they expire — expired tickets can mean being sent home.",
      ],
      terms: [
        { term: "IDLH", def: "Immediately Dangerous to Life or Health concentration." },
        { term: "Standby attendant", def: "Person outside a confined space monitoring and ready to call rescue." },
        { term: "Zero energy state", def: "All hazardous energy isolated/released and verified." },
      ],
      quiz: [
        {
          q: "Why can't you rely on smell to detect H2S?",
          options: ["It has no smell", "It can deaden your sense of smell at higher levels", "Only dogs smell it", "It smells like flowers"],
          correct: 1,
          why: "Olfactory fatigue means the smell may disappear as concentration increases.",
        },
        {
          q: "After applying locks and releasing stored energy, the last step is to:",
          options: ["Walk away", "Try to start the equipment to verify zero energy", "Remove your lock", "Tag it twice"],
          correct: 1,
          why: "Try-out verification proves the isolation worked.",
        },
        {
          q: "A confined space entry needs:",
          options: ["Nothing if short", "Permit, atmospheric testing, standby attendant and rescue plan", "A phone call", "Just a rope"],
          correct: 1,
          why: "These are the core controls for confined space entry.",
        },
      ],
    },
  ],
};
