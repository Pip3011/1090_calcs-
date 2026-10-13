export interface EurocodeClause {
  id: string;
  codeStandard: string;
  clauseNumber: string;
  title: string;
  category: 'Execution Class & Compliance' | 'Structural Verification' | 'Connections & Welds' | 'Lifting & Rigging' | 'Quality & Testing';
  summary: string;
  keyFormulas?: string[];
  normativeRequirements: string[];
  practicalApplication: string;
  tags: string[];
}

export const EUROCODE_LIBRARY: EurocodeClause[] = [
  {
    id: 'en-1090-2-exc-matrix',
    codeStandard: 'EN 1090-2:2018',
    clauseNumber: 'Annex B (B.1–B.3)',
    title: 'Execution Class (EXC) Determination Matrix',
    category: 'Execution Class & Compliance',
    summary: 'Specifies the selection of Execution Class (EXC1 to EXC4) based on Consequence Classes (CC1–CC3 per EN 1990), Service Categories (SC1 quasi-static vs SC2 dynamic/fatigue), and Production Categories (PC1 simple non-welded vs PC2 welded high-strength/site assembly).',
    normativeRequirements: [
      'EXC1: Agricultural buildings, simple single-story storage sheds with CC1.',
      'EXC2: Default class for typical commercial, residential, retail, and industrial buildings (CC2 + SC1 + PC1/PC2).',
      'EXC3: Critical structures, bridges, crane girders, grandstands, high-cycle fatigue, or CC3 consequence.',
      'EXC4: Extreme consequence structures (e.g. nuclear containment, major long-span suspension bridges).'
    ],
    practicalApplication: 'Determines the entire quality regimen: inspection frequency, welder certification level, and Factory Production Control (FPC) audit depth.',
    tags: ['EXC', 'Execution Class', 'EN 1090-2', 'Consequence Class', 'FPC', 'Annex B']
  },
  {
    id: 'en-1090-1-cpr-dop',
    codeStandard: 'EN 1090-1:2009+A1:2011',
    clauseNumber: 'Clause 6 & Annex ZA',
    title: 'Declaration of Performance (DoP) and CE / UKCA Marking',
    category: 'Execution Class & Compliance',
    summary: 'Mandates that structural steel components placed on the EU/UK market must bear a CE / UKCA mark accompanied by a valid Declaration of Performance (DoP) in accordance with CPR 305/2011.',
    normativeRequirements: [
      'Manufacturer must possess an active Factory Production Control (FPC) certificate issued by a Notified Body (AVCP System 2+).',
      'DoP must state component identification, Execution Class, EN 1090-2 reference, tolerances class, material specifications, and declared structural characteristics.',
      'Labeling must follow Annex ZA format with Notified Body ID, year of marking, and DoP reference.'
    ],
    practicalApplication: 'Legally required for fabrication handover. Structural steel cannot be erected on public or commercial sites without a valid DoP.',
    tags: ['DoP', 'CE Mark', 'UKCA', 'CPR', 'Declaration of Performance', 'Annex ZA', 'FPC']
  },
  {
    id: 'en-1090-2-ndt-table24',
    codeStandard: 'EN 1090-2:2018',
    clauseNumber: 'Clause 12.4 & Table 24',
    title: 'Non-Destructive Testing (NDT) Extent and Acceptance',
    category: 'Quality & Testing',
    summary: 'Specifies the mandatory scope and percentages for routine Non-Destructive Testing (VT, MT/PT, UT/RT) on welds according to Execution Class.',
    normativeRequirements: [
      'Visual Testing (VT): 100% of all welds across all execution classes (EXC1–EXC4).',
      'EXC1: No mandatory supplementary NDT unless specified in execution specification.',
      'EXC2: 0% to 10% supplementary NDT (MT/PT for surface, UT for full-penetration butt welds subject to tension).',
      'EXC3: 10% to 20% supplementary MT/PT and 10% to 20% UT for butt welds and heavily loaded fillet welds.',
      'EXC4: 100% VT + up to 50%–100% supplementary volumetric and surface NDT.'
    ],
    practicalApplication: 'Inspection & Test Plans (ITP) must explicitly cite Table 24 test scopes prior to starting arc welding.',
    tags: ['NDT', 'Table 24', 'Welding Inspection', 'VT', 'MT', 'UT', 'Quality Plan']
  },
  {
    id: 'en-1090-2-weld-coordination',
    codeStandard: 'EN 1090-2:2018 / ISO 14731',
    clauseNumber: 'Clause 7.4.3 & Table 14/15',
    title: 'Responsible Welding Coordinator (RWC) Competence',
    category: 'Quality & Testing',
    summary: 'Defines the mandatory technical knowledge levels (Basic, Specific, Comprehensive) required for the Responsible Welding Coordinator depending on steel grade, thickness, and Execution Class.',
    normativeRequirements: [
      'EXC1: Basic technical knowledge for steels <= S275.',
      'EXC2: Basic for <= S275 up to 25mm thickness; Specific knowledge for S355 or thickness > 25mm.',
      'EXC3: Comprehensive technical knowledge required for S355 and above; Specific for S275.',
      'All welding procedures must be qualified to ISO 15614-1 (WPQR) or ISO 15613 with valid WPS written records.'
    ],
    practicalApplication: 'Required for FPC audit approval. Welder approvals to ISO 9606-1 must be maintained within valid validity dates.',
    tags: ['RWC', 'Welding Coordinator', 'ISO 14731', 'ISO 9606-1', 'ISO 15614-1', 'WPS']
  },
  {
    id: 'en-1990-uls-combinations',
    codeStandard: 'EN 1990:2002+A1:2005',
    clauseNumber: 'Clause 6.4.3.2 & Table A1.2(B)',
    title: 'Ultimate Limit State (ULS) Fundamental Combinations',
    category: 'Structural Verification',
    summary: 'Governs design combinations of actions for permanent (dead) and variable (live) loads using Eurocode partial load safety factors.',
    keyFormulas: [
      'ULS (Eq. 6.10): E_d = γ_G * G_k + γ_Q * Q_k',
      'Standard partial factors: γ_G = 1.35 (Unfavourable dead load), γ_Q = 1.50 (Unfavourable variable load)',
      'SLS (Characteristic): E_d = 1.0 * G_k + 1.0 * Q_k'
    ],
    normativeRequirements: [
      'Dead load factor γ_G = 1.35 applies to member self-weight, permanent cladding, and fixed fixtures.',
      'Variable load factor γ_Q = 1.50 applies to occupancy, storage, maintenance, and traffic.',
      'Consequence modifier K_FI: 0.9 for CC1, 1.0 for CC2, 1.1 for CC3.'
    ],
    practicalApplication: 'All structural beam and connection capacity checks must be evaluated under the factored ULS envelope.',
    tags: ['EN 1990', 'ULS', 'SLS', 'Load Factors', 'Dead Load', 'Live Load', 'Combinations']
  },
  {
    id: 'en-1993-1-1-bending',
    codeStandard: 'EN 1993-1-1:2005',
    clauseNumber: 'Clause 6.2.5',
    title: 'Cross-Section Bending Resistance (M_c,Rd)',
    category: 'Structural Verification',
    summary: 'Specifies the design resistance of cross-sections for bending about the major principal axis (y-y).',
    keyFormulas: [
      'Class 1 & 2 (Plastic): M_c,Rd = W_pl,y * f_y / γ_M0',
      'Class 3 (Elastic): M_c,Rd = W_el,y * f_y / γ_M0',
      'Partial factor for cross-section resistance: γ_M0 = 1.00',
      'Verification criterion: M_Ed / M_c,Rd <= 1.00'
    ],
    normativeRequirements: [
      'Hot-rolled Universal Beams (UB) in S275/S355 are Class 1 or 2 under pure bending.',
      'Yield strength f_y must account for flange thickness reductions (e.g. S355 is 355 MPa for t <= 16mm, 345 MPa for 16mm < t <= 40mm).',
      'Compression flange must have lateral restraint or lateral-torsional buckling (Cl. 6.3.2) must be evaluated.'
    ],
    practicalApplication: 'Verifies flexural strength of beams under floor, roof, or crane loadings.',
    tags: ['Bending Moment', 'M_c,Rd', 'EN 1993-1-1', 'Flexure', 'Section Modulus', 'W_pl']
  },
  {
    id: 'en-1993-1-1-shear',
    codeStandard: 'EN 1993-1-1:2005',
    clauseNumber: 'Clause 6.2.6 & 6.2.8',
    title: 'Shear Resistance & Combined Bending-Shear Interaction',
    category: 'Structural Verification',
    summary: 'Formulates the plastic shear resistance of structural steel webs and defines the threshold for bending-shear interaction.',
    keyFormulas: [
      'Plastic Shear Resistance: V_pl,Rd = A_v * (f_y / √3) / γ_M0',
      'Shear Area (rolled I-sections): A_v ≈ A - 2*b*t_f + (t_w + 2*r)*t_f >= η * h_w * t_w',
      'High Shear Criterion: If V_Ed > 0.50 * V_pl,Rd, reduced plastic moment resistance M_y,V,Rd must be used.',
      'Verification criterion: V_Ed / V_c,Rd <= 1.00'
    ],
    normativeRequirements: [
      'For V_Ed <= 0.50 * V_c,Rd, no reduction in moment resistance is required.',
      'Web shear buckling check (EN 1993-1-5) is required if h_w / t_w > 72 * ε / η.'
    ],
    practicalApplication: 'Governs beam supports and heavily loaded point loads near columns or pad-eye lifting brackets.',
    tags: ['Shear Force', 'V_c,Rd', 'Bending Shear Interaction', 'EN 1993-1-1', 'Web Capacity']
  },
  {
    id: 'en-1993-1-1-deflection',
    codeStandard: 'EN 1993-1-1:2005 / National Annex',
    clauseNumber: 'Clause 7.2.1',
    title: 'Serviceability Limit State (SLS) Vertical Deflection Limits',
    category: 'Structural Verification',
    summary: 'Provides standard recommended vertical deflection limits for beams to ensure aesthetic comfort, prevent plaster cracking, and avoid ponding.',
    keyFormulas: [
      'Midspan Deflection: δ_max = (5 * w_SLS * L^4) / (384 * E * I_y)',
      'Recommended Total Load Limit: δ_tot <= L / 250 (general flooring) or L / 200 (roof purlins)',
      'Recommended Live Load Limit: δ_live <= L / 360 (office/commercial floors) or L / 500 (brittle finishes)'
    ],
    normativeRequirements: [
      'Steel Young\'s Modulus: E = 210,000 N/mm² (MPa).',
      'SLS load combination is evaluated with unfactored characteristic loads (γ_G = 1.0, γ_Q = 1.0).'
    ],
    practicalApplication: 'Critical for long-span steel members where flexural stiffness governs over ultimate strength.',
    tags: ['Deflection', 'SLS', 'L/360', 'Serviceability', 'Stiffness', 'Young Modulus']
  },
  {
    id: 'en-13155-lifting-daf',
    codeStandard: 'EN 13155:2020 / LOLER 1998',
    clauseNumber: 'Clause 5.1.1 & 5.1.2',
    title: 'Safe Lifting Loads & Dynamic Amplification Factor (DAF)',
    category: 'Lifting & Rigging',
    summary: 'Specifies design principles for non-fixed load lifting attachments, dynamic hoisting factors, and Center of Gravity (CoG) uncertainty.',
    keyFormulas: [
      'Total Factored Rigging Load: F_lift = W_gross * g * DAF * k_CoG * γ_lift',
      'Standard onshore workshop crane DAF: 1.15 to 1.30',
      'Mobile / outdoor crane hoisting DAF: 1.30 to 1.50',
      'Center of gravity shift factor k_CoG: 1.10 to 1.25',
      'Consequence factor γ_lift: 1.30 to 1.50 per EN 13155'
    ],
    normativeRequirements: [
      'Lifting gear must be proof-tested or verified to minimum ultimate load factors (usually 3.0x to 4.0x for steel attachments).',
      'Lifting accessories must be clearly marked with their Safe Working Load (SWL/WLL) and tare weight.',
      'Sling angles from vertical should not exceed 45° (or absolute limit of 60°).'
    ],
    practicalApplication: 'Forms the baseline load for sizing lifting pad-eyes, spreader beams, and sling tension calculations.',
    tags: ['DAF', 'Lifting Load', 'EN 13155', 'SWL', 'WLL', 'LOLER', 'CoG']
  },
  {
    id: 'en-13414-sling-geometry',
    codeStandard: 'EN 13414-1:2003 / ISO 4778',
    clauseNumber: 'Clause 4 & Table 3',
    title: 'Multi-Leg Sling Tension & Angle Reduction Factors',
    category: 'Lifting & Rigging',
    summary: 'Governs tension distribution in multi-leg wire rope and chain slings as a function of the sling angle to the vertical.',
    keyFormulas: [
      'Tension per Leg: T_leg = F_lift / (n_eff * cos θ)',
      'For 2-leg sling: n_eff = 2.0',
      'For 4-leg sling on rigid structures: n_eff = 2.0 (only 2 diagonally opposite legs carry load unless turnbuckles equalize tension!)',
      'For 4-leg sling on flexible load: n_eff = 3.0'
    ],
    normativeRequirements: [
      'As sling angle θ from vertical increases from 0° to 45°, tension increases by 41% (cos 45° = 0.707).',
      'At 60° from vertical, tension doubles (cos 60° = 0.50). Angles > 60° are prohibited by UK/EU rigging regulations.',
      'Safety factor on wire rope slings must be >= 5:1; grade 80/100 chain >= 4:1; synthetic webbing >= 7:1.'
    ],
    practicalApplication: 'Ensures correct sling selection and crane hook height clearance on fabrication lifting drawings.',
    tags: ['Sling Tension', 'Multi-Leg Slings', 'Sling Angle', 'Rigging', 'EN 13414', 'Chain Slings']
  },
  {
    id: 'en-1993-1-8-pad-eye',
    codeStandard: 'EN 1993-1-8:2005 / DNV-GL-ST-N001',
    clauseNumber: 'Clause 3.13 & Table 3.9',
    title: 'Pad-Eye / Pin Connection Design Verifications',
    category: 'Connections & Welds',
    summary: 'Sets out verification criteria for pin-connected plates (pad-eyes and lifting lugs) subject to concentrated shackle pin forces.',
    keyFormulas: [
      'Pin Hole Bearing Resistance: F_b,Rd = 1.5 * t * d_p * f_y / γ_M0',
      'Hole Edge Tear-Out: F_v,Rd = 2 * e_2,net * t * (f_y / √3) / γ_M0',
      'Hole Net Tension: F_t,Rd = (2 * R - d_h) * t * f_y / γ_M0',
      'Pin Clearance: d_h - d_p should be 1.0mm to 3.0mm to prevent concentrated point bearing',
      'Out-of-Plane Load: Design for minimum 5% lateral side load (EN 13155).'
    ],
    normativeRequirements: [
      'Pad-eye hole edge distance e_2 >= 1.5 * d_h (or R >= 1.5 * d_h) to avoid brittle shear fracture.',
      'Pin hole diameter d_h must provide smooth bearing contact with shackle pin.',
      'Cheek / doubler plates must be stitch-welded or continuous welded if added to increase thickness.'
    ],
    practicalApplication: 'Prevents pad-eye rupture during crane handling and transport.',
    tags: ['Pad-Eye', 'Lifting Lug', 'Bearing Stress', 'Tear Out', 'EN 1993-1-8', 'Pin Connection']
  },
  {
    id: 'en-1993-1-8-fillet-welds',
    codeStandard: 'EN 1993-1-8:2005',
    clauseNumber: 'Clause 4.5.3',
    title: 'Directional Method for Fillet Weld Resistance',
    category: 'Connections & Welds',
    summary: 'Specifies the design resistance of fillet welds attaching pad-eyes or structural gusset plates to parent steel.',
    keyFormulas: [
      'Von Mises Throat Stress: √[σ_⊥² + 3*(τ_⊥² + τ_∥²)] <= f_u / (β_w * γ_M2)',
      'Normal Stress Limit: σ_⊥ <= 0.90 * f_u / γ_M2',
      'Correlation factor β_w: 0.80 for S235, 0.85 for S275, 0.90 for S355, 1.00 for S460',
      'Partial factor γ_M2 = 1.25'
    ],
    normativeRequirements: [
      'Minimum effective throat thickness a >= 3mm and a <= 0.7 * t_min.',
      'Weld starts and stops must be cleanly executed without crater defects.',
      'Preheating may be required per EN 1011-2 for thick plates (t >= 25mm) in S355.'
    ],
    practicalApplication: 'Sizes the double fillet weld attaching the lifting lug to the structural beam top flange.',
    tags: ['Fillet Welds', 'Throat Thickness', 'Weld Resistance', 'EN 1993-1-8', 'ISO 5817']
  }
];
