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

export interface StructuralInputs {
  sectionId: string;
  customSection: SteelSection;
  steelGrade: SteelGrade;
  spanMeters: number;
  deadLoadGk: number; // kN/m (permanent action)
  liveLoadQk: number; // kN/m (variable action)
  pointLoadFk: number; // kN at midspan
  includeSelfWeight: boolean;
  deflectionLimitRatio: number; // e.g. 360 for L/360
  lateralRestraint: 'continuous' | 'ends_only' | 'intermediate_halves';
}

export interface StructuralResults {
  factoredDeadLoad: number; // kN/m
  factoredLiveLoad: number; // kN/m
  totalUlsLoad: number; // kN/m
  totalSlsLoad: number; // kN/m
  designBendingMomentMed: number; // kNm
  designShearForceVed: number; // kN
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
  overallStatus: 'PASS' | 'FAIL';
}

export interface LiftingInputs {
  tareWeightKg: number; // Structural component weight
  riggingAccessoryWeightKg: number; // shackles, spreader, hooks
  dynamicAmplificationFactor: number; // DAF (1.15 to 1.50)
  centerOfGravityFactor: number; // k_CoG (1.10 to 1.25)
  consequenceFactor: number; // gamma_lift (1.20 to 1.50 per EN 13155 / Eurocode)
  slingConfiguration: '1-leg' | '2-leg' | '3-leg' | '4-leg';
  slingAngleToVerticalDeg: number; // theta (deg)
  slingMaterial: 'wire_rope' | 'grade_80_chain' | 'grade_100_chain' | 'polyester_webbing';
  
  // Pad-Eye / Lifting Lug details
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

export interface LiftingResults {
  grossStaticWeightKn: number;
  factoredDynamicLiftLoadKn: number;
  effectiveLegs: number;
  slingTensionPerLegKn: number;
  slingTensionPerLegTonnes: number;
  recommendedMinimumSlingWllTonnes: number;
  recommendedShackle: ShackleRating;
  
  // Pad-eye checks
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
