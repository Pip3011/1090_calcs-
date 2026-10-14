export type ConsequenceClass = 'CC1' | 'CC2' | 'CC3';
export type ServiceCategory = 'SC1' | 'SC2';
export type ProductionCategory = 'PC1' | 'PC2';
export type ExecutionClass = 'EXC1' | 'EXC2' | 'EXC3' | 'EXC4';

export type SteelGrade = 'S235' | 'S275' | 'S355' | 'S460';

export interface SteelSection {
  id: string;
  designation: string;
  category: 'UB' | 'UC' | 'PFC' | 'RHS' | 'SHS' | 'CHS' | 'CUSTOM';
  depth: number; // h in mm
  width: number; // b in mm
  webThickness: number; // tw in mm
  flangeThickness: number; // tf in mm
  massPerMeter: number; // kg/m
  area: number; // cm2
  secondMomentOfAreaY: number; // Iy in cm4
  plasticSectionModulusY: number; // Wpl,y in cm3
  elasticSectionModulusY: number; // Wel,y in cm3
}

export interface ShackleRating {
  wllTonnes: number; // WLL in metric tonnes
  pinDiameterMm: number; // d_pin in mm
  jawWidthMm: number; // b_jaw in mm
  bowDiameterMm: number;
  nominalSizeInch: string;
}

export type PartialSafetyPreset =
  | 'eurocode_standard'
  | 'uk_national_annex'
  | 'stainless_steel_en1993_1_4'
  | 'reused_steel_sci_p427'
  | 'offshore_dnv'
  | 'custom_override';

export interface PartialSafetyFactors {
  gammaM0: number; // Resistance of cross-sections to yielding (default: 1.00 per EN 1993-1-1 Cl. 6.1)
  gammaM1: number; // Resistance of members to instability/buckling (default: 1.00 per EN 1993-1-1 Cl. 6.1)
  gammaM2: number; // Resistance of cross-sections in tension to fracture and joints/welds (default: 1.25 per EN 1993-1-1 / EN 1993-1-8)
  isCustomOverride: boolean;
  preset: PartialSafetyPreset;
  customRationale?: string;
}

export interface StructuralInputs {
  sectionId: string;
  customSection: SteelSection;
  steelGrade: SteelGrade;
  spanMeters: number;
  deadLoadGk: number; // kN/m (permanent action)
  liveLoadQk: number; // kN/m (variable action)
  pointLoadFk: number; // kN (concentrated load)
  pointLoadPositionMeters?: number; // Distance from left support A (m, defaults to span / 2)
  includeSelfWeight: boolean;
  deflectionLimitRatio: number; // e.g. 360 for L/360
  lateralRestraint: 'continuous' | 'ends_only' | 'intermediate_halves';
  partialSafetyFactors?: PartialSafetyFactors;
}

export interface StructuralResults {
  factoredDeadLoad: number; // kN/m
  factoredLiveLoad: number; // kN/m
  totalUlsLoad: number; // kN/m
  totalSlsLoad: number; // kN/m
  designBendingMomentMed: number; // kNm
  designShearForceVed: number; // kN
  reactionRa: number; // Left support vertical reaction (kN)
  reactionRb: number; // Right support vertical reaction (kN)
  pointLoadLocationA: number; // Distance of point load from left support A (m)
  totalFactoredLoadKn: number; // Total downward factored load on beam (kN)
  yieldStrengthFy: number; // N/mm2
  plasticMomentResistanceMcRd: number; // kNm
  shearResistanceVcRd: number; // kN
  bendingUtilization: number; // Med / McRd
  shearUtilization: number; // Ved / VcRd
  highShearInteraction: boolean; // Ved > 0.5 * VcRd
  reducedMomentResistance?: number;
  actualDeflectionMm: number; // SLS deflection
  allowableDeflectionMm: number; // L / ratio
  deflectionUtilization: number;
  isBendingPass: boolean;
  isShearPass: boolean;
  isDeflectionPass: boolean;
  
  // Partial Safety Factors applied
  appliedGammaM0: number;
  appliedGammaM1: number;
  appliedGammaM2: number;
  isCustomSafetyFactorsActive: boolean;
  bucklingMomentResistanceMbRd?: number;
  bucklingUtilization?: number;
  isBucklingPass?: boolean;

  overallStatus: 'PASS' | 'FAIL';
}

export type RiggingMethod = 'crane_padeyes' | 'crane_slings_only' | 'forklift_slung';
export type HitchType = 'straight' | 'choker' | 'basket';
export type ForkliftAttachment = 'fork_mounted_jib' | 'tines_slung' | 'direct_tines';

export interface LiftingInputs {
  riggingMethod: RiggingMethod;
  tareWeightKg: number; // Structural component weight
  riggingAccessoryWeightKg: number; // shackles, spreader, hooks
  dynamicAmplificationFactor: number; // DAF (1.15 to 1.50)
  centerOfGravityFactor: number; // k_CoG (1.10 to 1.25)
  consequenceFactor: number; // gamma_lift (1.20 to 1.50 per EN 13155 / Eurocode)
  slingConfiguration: '1-leg' | '2-leg' | '3-leg' | '4-leg';
  slingAngleToVerticalDeg: number; // theta (deg)
  slingMaterial: 'wire_rope' | 'grade_80_chain' | 'grade_100_chain' | 'polyester_webbing';
  
  // Direct Sling Only options
  userSlingWllTonnes: number; // Specified sling load capacity (e.g. 3.0t, 5.0t)
  slingLengthMeters: number; // Specified sling leg length (m)
  pickupPointsSpacingMeters: number; // Distance between sling wrap points on beam (m)
  hitchType: HitchType; // straight (1.0), choker (0.8), basket (1.4-2.0)
  useLengthToDeriveAngle: boolean;
  edgeProtection?: 'softeners_fitted' | 'bare_steel_edges';

  // Forklift Truck (FLT) options
  forkliftRatedCapacityTonnes: number; // e.g. 3.0t, 5.0t, 7.0t
  forkliftStandardLoadCenterMm: number; // standard manufacturer load center (typically 500mm or 600mm)
  actualLoadCenterMm: number; // actual pickup location distance from fork heel (mm)
  forkliftAttachment: ForkliftAttachment; // Jib arm vs Slung from tines vs Direct on tines
  pickupLocationFromCoGMm: number; // Offset from beam center of gravity (mm)
  fltGroundCondition: 'smooth_concrete' | 'rough_yard';

  // Pad-Eye / Lifting Lug details (for crane_padeyes mode)
  padEyeQuantity: number;
  padEyeSteelGrade: SteelGrade;
  lugThicknessMm: number; // t
  lugHoleDiameterMm: number; // dh
  lugHoleRadiusMm: number; // R (radius from hole center to edge)
  lugHeightFromBaseMm: number; // h_lug
  lugWeldLengthMm: number; // Lw
  lugWeldThroatMm: number; // a (fillet weld throat)
  shackleWllTonnes: number; // Selected shackle
}

export interface DetailedWeldStressCheck {
  weldLengthMm: number; // User-specified Lw
  weldThroatMm: number; // User-specified a
  effectiveLengthMm: number; // Lw_eff (e.g. accounting for craters or full nominal)
  totalThroatAreaMm2: number; // Aw = 2 * a * Lw_eff
  elasticSectionModulusMm3: number; // Ww = 2 * a * Lw^2 / 6
  
  // Forces acting at weld base (per pad-eye)
  verticalPullKn: number; // F_v = F_Ed * cos(theta) (direct tension)
  horizontalShearKn: number; // F_h = F_Ed * sin(theta) (longitudinal shear)
  lateralSideLoadKn: number; // F_z = 0.05 * F_Ed (accidental out-of-plane lateral)
  inPlaneBendingMomentKnM: number; // M_ip = F_h * h_lug
  outOfPlaneBendingMomentKnM: number; // M_op = F_z * h_lug

  // Throat plane stress components (MPa)
  directTensionStressMpa: number; // sigma_dir = F_v / Aw
  inPlaneBendingStressMpa: number; // sigma_bend_ip = M_ip / Ww
  outOfPlaneBendingStressMpa: number; // sigma_bend_op = M_op / Ww_op
  totalTensionStressMpa: number; // sigma_tension_max
  longitudinalShearStressMpa: number; // tau_parallel = F_h / Aw
  transverseShearStressMpa: number; // tau_transverse = F_z / Aw
  resultantShearStressMpa: number; // tau_shear = sqrt(tau_par^2 + tau_trans^2)

  // Eurocode 3 EN 1993-1-8 Cl. 4.5.3.2 Directional Method
  sigmaPerpMpa: number; // Normal stress perpendicular to throat plane
  tauPerpMpa: number; // Shear stress perpendicular to weld axis on throat
  tauParaMpa: number; // Shear stress parallel to weld axis on throat
  vonMisesStressMpa: number; // sqrt(sigma_perp^2 + 3 * (tau_perp^2 + tau_para^2))
  designWeldStrengthFwRdMpa: number; // fu / (beta_w * gamma_M2)
  directionalUtilization: number; // vonMises / FwRd
  normalStressLimitMpa: number; // 0.9 * fu / gamma_M2
  normalStressUtilization: number; // sigma_perp / (0.9 * fu / gamma_M2)
  isDirectionalPass: boolean;

  // Eurocode 3 EN 1993-1-8 Cl. 4.5.3.3 Simplified Method
  designShearStrengthFvwdMpa: number; // (fu / sqrt(3)) / (beta_w * gamma_M2)
  simplifiedResultantStressMpa: number; // sqrt(sigma_total^2 + tau_shear^2)
  simplifiedUtilization: number; // simplifiedResultantStress / Fvwd
  isSimplifiedPass: boolean;

  // Combined Interaction & Sizing Guidance
  interactionIndex: number; // (sigma_total / allowable_tension)^2 + (tau_shear / f_vwd)^2
  governingUtilization: number; // max(directional, normal, simplified)
  isWeldPass: boolean;
  correlationFactorBetaW: number;
  recommendedMinimumThroatMm: number; // Minimum recommended throat size for 100% capacity
}

export interface LiftingResults {
  grossStaticWeightKn: number;
  factoredDynamicLiftLoadKn: number;
  effectiveLegs: number;
  slingTensionPerLegKn: number;
  slingTensionPerLegTonnes: number;
  recommendedMinimumSlingWllTonnes: number;
  recommendedShackle: ShackleRating;
  
  // Geometry from sling length & spacing
  calculatedSlingAngleDeg: number;
  calculatedHookHeightMeters: number;
  hitchDerationFactor: number;
  effectiveSlingCapacityTonnes: number;
  slingCapacityUtilization: number;
  isSlingCapacityPass: boolean;

  // Forklift results
  forkliftDeratedCapacityTonnes: number;
  forkliftAppliedTotalTonnes: number;
  forkliftUtilization: number;
  isForkliftPass: boolean;
  isLoadCenterSafe: boolean;

  // Pad-eye checks (when in crane_padeyes mode)
  appliedTensionPerPadEyeKn: number;
  pinBearingStressMpa: number;
  allowablePinBearingStressMpa: number;
  bearingUtilization: number;
  isBearingPass: boolean;
  
  tearOutResistanceKn: number;
  tearOutUtilization: number;
  isTearOutPass: boolean;
  
  netTensionResistanceKn: number;
  netTensionUtilization: number;
  isNetTensionPass: boolean;
  
  weldStressMpa: number;
  allowableWeldStressMpa: number;
  weldUtilization: number;
  isWeldPass: boolean;

  // Detailed Weld Stress Check (Shear / Tension Interaction per EN 1993-1-8)
  detailedWeldCheck: DetailedWeldStressCheck;
  
  overallLiftingStatus: 'PASS' | 'FAIL';
}

export interface ProjectMetadata {
  projectName: string;
  projectNumber: string;
  clientName: string;
  fabricatorName: string;
  responsibleWeldingCoordinator: string;
  fpcCertificateNumber: string;
  notifiedBodyNumber: string;
  consequenceClass: ConsequenceClass;
  serviceCategory: ServiceCategory;
  productionCategory: ProductionCategory;
  executionClass: ExecutionClass;
  executionStandard: string; // 'EN 1090-2:2018'
  declarationDate: string;
  componentMark: string;
  intendedUse: string;

  // Digital Signature & Authorization
  signatoryName: string;
  signatoryRole: string;
  signatoryCompany: string;
  signatoryRegistrationNo?: string;
  signatureDate: string;
  signatureDataUrl?: string;
  isDocumentSigned: boolean;
}

export interface MissingInfoItem {
  id: string;
  category: 'Classification' | 'Structural' | 'Lifting' | 'Fabrication & Welding' | 'Documentation';
  field: string;
  status: 'complete' | 'missing' | 'warning';
  importance: 'Mandatory for EN 1090' | 'Required for Eurocode Calcs' | 'Safety Critical (LOLER/EN 13155)';
  description: string;
  whyNeeded: string;
}
