import {
  ConsequenceClass,
  ServiceCategory,
  ProductionCategory,
  ExecutionClass,
  StructuralInputs,
  StructuralResults,
  LiftingInputs,
  LiftingResults,
  DetailedWeldStressCheck,
  SteelSection
} from '../types';
import { STEEL_GRADES, STANDARD_SECTIONS, SHACKLE_CATALOG } from '../data/steelSections';

export function determineExecutionClass(
  cc: ConsequenceClass,
  sc: ServiceCategory,
  pc: ProductionCategory
): { executionClass: ExecutionClass; rationale: string } {
  if (cc === 'CC1') {
    if (sc === 'SC1' && pc === 'PC1') {
      return { executionClass: 'EXC1', rationale: 'Low consequence (CC1), quasi-static service (SC1), and standard non-welded or simple steel (PC1).' };
    }
    return { executionClass: 'EXC2', rationale: 'Low consequence (CC1) with dynamic actions (SC2) or welded fabrication (PC2).' };
  }

  if (cc === 'CC2') {
    if (sc === 'SC1') {
      return { executionClass: 'EXC2', rationale: 'Medium consequence (CC2) and quasi-static service (SC1). Standard commercial/residential building baseline.' };
    }
    return { executionClass: 'EXC3', rationale: 'Medium consequence (CC2) with fatigue/dynamic service (SC2 e.g. crane girders, moving loads).' };
  }

  // CC3
  if (sc === 'SC2' && pc === 'PC2') {
    return { executionClass: 'EXC4', rationale: 'High consequence (CC3), high-cycle fatigue/dynamic service (SC2), and welded execution (PC2). Extreme quality tier.' };
  }
  return { executionClass: 'EXC3', rationale: 'High consequence (CC3) with standard service/production. Bridges, grandstands, public infrastructure.' };
}

export function calculateStructuralBeam(inputs: StructuralInputs, customSectionsList: SteelSection[] = []): StructuralResults {
  const allSections = [...STANDARD_SECTIONS, ...customSectionsList];
  const section: SteelSection =
    allSections.find(s => s.id === inputs.sectionId) ||
    inputs.customSection ||
    STANDARD_SECTIONS[0];

  const gradeInfo = STEEL_GRADES[inputs.steelGrade];
  // Yield strength reduction for thickness > 16mm per EN 10025-2
  let fy = gradeInfo.fy;
  if (section.flangeThickness > 16 && section.flangeThickness <= 40) {
    fy = Math.max(215, fy - 10);
  } else if (section.flangeThickness > 40) {
    fy = Math.max(205, fy - 20);
  }

  const span = Math.max(0.1, inputs.spanMeters);
  const selfWeightKnPerM = inputs.includeSelfWeight ? (section.massPerMeter * 9.81) / 1000 : 0;

  // Eurocode EN 1990 ULS combination: 1.35 Gk + 1.50 Qk
  const totalDeadLoad = inputs.deadLoadGk + selfWeightKnPerM;
  const factoredDeadLoad = 1.35 * totalDeadLoad;
  const factoredLiveLoad = 1.50 * inputs.liveLoadQk;
  const totalUlsLoad = factoredDeadLoad + factoredLiveLoad; // kN/m
  const factoredPointLoad = 1.50 * inputs.pointLoadFk; // kN

  // Eurocode SLS combination: 1.00 Gk + 1.00 Qk
  const totalSlsLoad = totalDeadLoad + inputs.liveLoadQk;

  // Point load position (distance from left support A)
  const a = inputs.pointLoadPositionMeters !== undefined && inputs.pointLoadPositionMeters >= 0 && inputs.pointLoadPositionMeters <= span
    ? inputs.pointLoadPositionMeters
    : span / 2;
  const b = span - a;

  // Support Reactions at ULS (EN 1990 Eq. 6.10)
  // Reaction at Left Support A:
  const raUdl = (totalUlsLoad * span) / 2;
  const raPoint = span > 0 ? (factoredPointLoad * b) / span : 0;
  const reactionRa = raUdl + raPoint; // kN

  // Reaction at Right Support B:
  const rbUdl = (totalUlsLoad * span) / 2;
  const rbPoint = span > 0 ? (factoredPointLoad * a) / span : 0;
  const reactionRb = rbUdl + rbPoint; // kN

  const totalFactoredLoadKn = totalUlsLoad * span + factoredPointLoad;

  // Maximum design shear force Ved = max(Ra, Rb)
  const designShearForceVed = Math.max(reactionRa, reactionRb);

  // Maximum design bending moment Med at ULS
  const medUdl = (totalUlsLoad * span * span) / 8;
  const medPoint = span > 0 ? (factoredPointLoad * a * b) / span : 0;
  const designBendingMomentMed = medUdl + medPoint; // kNm

  // Eurocode EN 1993-1-1 Partial Safety Factors (gamma_M0, gamma_M1, gamma_M2)
  const psf = inputs.partialSafetyFactors;
  const gammaM0 = Math.max(0.5, psf?.gammaM0 ?? 1.00);
  const gammaM1 = Math.max(0.5, psf?.gammaM1 ?? 1.00);
  const gammaM2 = Math.max(0.5, psf?.gammaM2 ?? 1.25);
  const isCustomSafetyFactorsActive = !!psf?.isCustomOverride;

  // Cross-section yielding plastic moment resistance: Mc,Rd = (Wpl,y * fy) / gammaM0
  // Wpl,y in cm3 -> Wpl,y * 10^3 mm3 * fy N/mm2 * 10^-6 = Wpl,y * fy * 1e-3 kNm
  const plasticMomentResistanceMcRd = (section.plasticSectionModulusY * fy * 1e-3) / gammaM0;

  // Shear area Av (approximate for rolled I-section per Cl. 6.2.6)
  // Av = A - 2*b*tf + (tw + 2*r)*tf >= hw * tw
  const areaMm2 = section.area * 100;
  const bMm = section.width;
  const tfMm = section.flangeThickness;
  const twMm = section.webThickness;
  const hMm = section.depth;
  const hwMm = Math.max(10, hMm - 2 * tfMm);
  
  let shearAreaAvMm2 = areaMm2 - 2 * bMm * tfMm + (twMm + 2 * tfMm) * tfMm;
  if (shearAreaAvMm2 < hwMm * twMm || isNaN(shearAreaAvMm2)) {
    shearAreaAvMm2 = hwMm * twMm * 1.05;
  }
  
  // Vc,Rd = Av * (fy / sqrt(3)) / gammaM0
  const shearResistanceVcRd = (shearAreaAvMm2 * (fy / Math.sqrt(3))) / (gammaM0 * 1000); // kN

  const bendingUtilization = plasticMomentResistanceMcRd > 0 ? designBendingMomentMed / plasticMomentResistanceMcRd : 999;
  const shearUtilization = shearResistanceVcRd > 0 ? designShearForceVed / shearResistanceVcRd : 999;

  // High shear check (EN 1993-1-1 Cl. 6.2.8)
  const highShearInteraction = designShearForceVed > 0.50 * shearResistanceVcRd;
  let reducedMomentResistance: number | undefined = undefined;
  if (highShearInteraction && shearResistanceVcRd > 0) {
    const rho = Math.pow((2 * designShearForceVed) / shearResistanceVcRd - 1, 2);
    // reduced plastic moment
    reducedMomentResistance = plasticMomentResistanceMcRd * (1 - rho * 0.15);
  }

  // Member Buckling Resistance Mb,Rd with gammaM1 (EN 1993-1-1 Cl. 6.3.2 Lateral Torsional Buckling)
  let bucklingMomentResistanceMbRd: number | undefined = undefined;
  let bucklingUtilization: number | undefined = undefined;
  let isBucklingPass: boolean = true;

  if (inputs.lateralRestraint === 'continuous') {
    bucklingMomentResistanceMbRd = plasticMomentResistanceMcRd;
    bucklingUtilization = bendingUtilization;
    isBucklingPass = bendingUtilization <= 1.00;
  } else {
    // Unrestrained length L_cr
    const lCrMeters = inputs.lateralRestraint === 'intermediate_halves' ? span / 2 : span;
    const lCrMm = lCrMeters * 1000;
    
    // Approximate critical elastic moment Mcr for simply supported rolled beam with uniform load
    // Mcr ≈ (pi^2 * E * Iz / L_cr^2) * sqrt(Iw / Iz + L_cr^2 * G * It / (pi^2 * E * Iz))
    // We approximate standard reduction factor chi_LT per EN 1993-1-1 Cl. 6.3.2.3:
    const E = 210000; // N/mm2
    const izMm4 = (section.secondMomentOfAreaY * 1e4) * 0.12; // approximate weak-axis Iz ≈ 0.12 * Iy
    const itMm4 = 2 * section.width * Math.pow(section.flangeThickness, 3) / 3;
    const iwMm6 = (izMm4 * Math.pow(hMm, 2)) / 4;
    const G = 81000;

    const term1 = (Math.PI * Math.PI * E * izMm4) / Math.pow(lCrMm, 2);
    const term2 = Math.sqrt((iwMm6 / Math.max(1, izMm4)) + (Math.pow(lCrMm, 2) * G * itMm4) / Math.max(1, Math.PI * Math.PI * E * izMm4));
    const mcrNmm = term1 * term2;
    const mcrKnm = mcrNmm * 1e-6;

    const lambdaLt = Math.sqrt(Math.max(0.1, (section.plasticSectionModulusY * fy * 1e-3) / Math.max(0.1, mcrKnm)));
    // Imperfection factor alpha_LT (Curve a=0.21, b=0.34, c=0.49, d=0.76)
    const alphaLt = (hMm / bMm) > 1.2 ? 0.34 : 0.49;
    const phiLt = 0.5 * (1 + alphaLt * (lambdaLt - 0.2) + Math.pow(lambdaLt, 2));
    const chiLt = Math.min(1.0, 1.0 / (phiLt + Math.sqrt(Math.max(0.01, Math.pow(phiLt, 2) - Math.pow(lambdaLt, 2)))));

    // Mb,Rd = chi_LT * Wpl,y * fy / gammaM1
    bucklingMomentResistanceMbRd = Number(((chiLt * section.plasticSectionModulusY * fy * 1e-3) / gammaM1).toFixed(2));
    bucklingUtilization = Number((designBendingMomentMed / Math.max(0.1, bucklingMomentResistanceMbRd)).toFixed(3));
    isBucklingPass = bucklingUtilization <= 1.00;
  }

  // Deflection at SLS
  // delta = (5 * w_SLS * L^4) / (384 * E * Iy) + (F_SLS * L^3) / (48 * E * Iy)
  // E = 210,000 N/mm2. L in mm = span * 1000. Iy in mm4 = section.secondMomentOfAreaY * 1e4.
  // w in N/mm = totalSlsLoad in kN/m
  const E = 210000; // N/mm2
  const spanMm = span * 1000;
  const iyMm4 = section.secondMomentOfAreaY * 1e4;
  const wSlsNPerMm = totalSlsLoad; // 1 kN/m = 1 N/mm
  const fSlsN = inputs.pointLoadFk * 1000;

  const deltaUdl = (5 * wSlsNPerMm * Math.pow(spanMm, 4)) / (384 * E * iyMm4);
  const deltaPoint = (fSlsN * Math.pow(spanMm, 3)) / (48 * E * iyMm4);
  const actualDeflectionMm = deltaUdl + deltaPoint;

  const allowableDeflectionMm = spanMm / Math.max(10, inputs.deflectionLimitRatio);
  const deflectionUtilization = allowableDeflectionMm > 0 ? actualDeflectionMm / allowableDeflectionMm : 999;

  const isBendingPass = highShearInteraction && reducedMomentResistance
    ? designBendingMomentMed <= reducedMomentResistance
    : bendingUtilization <= 1.00;
  const isShearPass = shearUtilization <= 1.00;
  const isDeflectionPass = deflectionUtilization <= 1.00;

  return {
    factoredDeadLoad: Number(factoredDeadLoad.toFixed(2)),
    factoredLiveLoad: Number(factoredLiveLoad.toFixed(2)),
    totalUlsLoad: Number(totalUlsLoad.toFixed(2)),
    totalSlsLoad: Number(totalSlsLoad.toFixed(2)),
    designBendingMomentMed: Number(designBendingMomentMed.toFixed(2)),
    designShearForceVed: Number(designShearForceVed.toFixed(2)),
    reactionRa: Number(reactionRa.toFixed(2)),
    reactionRb: Number(reactionRb.toFixed(2)),
    pointLoadLocationA: Number(a.toFixed(2)),
    totalFactoredLoadKn: Number(totalFactoredLoadKn.toFixed(2)),
    yieldStrengthFy: fy,
    plasticMomentResistanceMcRd: Number(plasticMomentResistanceMcRd.toFixed(2)),
    shearResistanceVcRd: Number(shearResistanceVcRd.toFixed(2)),
    bendingUtilization: Number(bendingUtilization.toFixed(3)),
    shearUtilization: Number(shearUtilization.toFixed(3)),
    highShearInteraction,
    reducedMomentResistance: reducedMomentResistance ? Number(reducedMomentResistance.toFixed(2)) : undefined,
    actualDeflectionMm: Number(actualDeflectionMm.toFixed(2)),
    allowableDeflectionMm: Number(allowableDeflectionMm.toFixed(2)),
    deflectionUtilization: Number(deflectionUtilization.toFixed(3)),
    isBendingPass,
    isShearPass,
    isDeflectionPass,
    appliedGammaM0: gammaM0,
    appliedGammaM1: gammaM1,
    appliedGammaM2: gammaM2,
    isCustomSafetyFactorsActive,
    bucklingMomentResistanceMbRd,
    bucklingUtilization,
    isBucklingPass,
    overallStatus: isBendingPass && isShearPass && isDeflectionPass && isBucklingPass ? 'PASS' : 'FAIL',
  };
}

export function calculateSafeLifting(
  inputs: LiftingInputs,
  partialFactors?: { gammaM0?: number; gammaM2?: number }
): LiftingResults {
  const grossStaticWeightKg = inputs.tareWeightKg + inputs.riggingAccessoryWeightKg;
  const grossStaticWeightKn = (grossStaticWeightKg * 9.81) / 1000;

  // Geometry calculation from sling length and pickup point spacing
  let calculatedSlingAngleDeg = inputs.slingAngleToVerticalDeg;
  let calculatedHookHeightMeters = 0;
  const halfSpacing = Math.max(0.1, inputs.pickupPointsSpacingMeters / 2);

  if (inputs.useLengthToDeriveAngle && inputs.slingLengthMeters > 0) {
    // sin(theta) = halfSpacing / slingLength
    if (inputs.slingLengthMeters > halfSpacing) {
      const ratio = Math.min(0.999, halfSpacing / inputs.slingLengthMeters);
      calculatedSlingAngleDeg = Math.asin(ratio) * (180 / Math.PI);
      calculatedHookHeightMeters = Math.sqrt(Math.max(0, Math.pow(inputs.slingLengthMeters, 2) - Math.pow(halfSpacing, 2)));
    } else {
      calculatedSlingAngleDeg = 65; // Geometry invalid: sling too short for spacing
      calculatedHookHeightMeters = 0;
    }
  } else {
    calculatedSlingAngleDeg = inputs.slingAngleToVerticalDeg;
    const thetaR = (calculatedSlingAngleDeg * Math.PI) / 180;
    calculatedHookHeightMeters = thetaR > 0 ? halfSpacing / Math.tan(thetaR) : inputs.slingLengthMeters;
  }

  // Adjust DAF for forklift transport if chosen
  let dynamicFactor = inputs.dynamicAmplificationFactor;
  if (inputs.riggingMethod === 'forklift_slung' && inputs.fltGroundCondition === 'rough_yard') {
    dynamicFactor = Math.max(dynamicFactor, 1.30);
  }

  // Factored dynamic lift load (EN 13155)
  // F_lift = W * g * DAF * k_CoG * gamma_lift
  const factoredDynamicLiftLoadKn =
    grossStaticWeightKn *
    dynamicFactor *
    inputs.centerOfGravityFactor *
    inputs.consequenceFactor;

  // Effective load-bearing legs (EN 13414 / LOLER)
  let effectiveLegs = 2.0;
  if (inputs.slingConfiguration === '1-leg') effectiveLegs = 1.0;
  else if (inputs.slingConfiguration === '2-leg') effectiveLegs = 2.0;
  else if (inputs.slingConfiguration === '3-leg') effectiveLegs = 2.5;
  else if (inputs.slingConfiguration === '4-leg') effectiveLegs = 2.0; // Rigid 4-leg rule: 2 diagonally opposite legs carry load

  const thetaRad = (calculatedSlingAngleDeg * Math.PI) / 180;
  const cosTheta = Math.max(0.2, Math.cos(thetaRad));

  // Tension per sling leg
  const slingTensionPerLegKn = factoredDynamicLiftLoadKn / (effectiveLegs * cosTheta);
  const slingTensionPerLegTonnes = slingTensionPerLegKn / 9.81;

  // Recommend sling WLL with industry factor
  const recommendedMinimumSlingWllTonnes = Number((slingTensionPerLegTonnes * 1.05).toFixed(2));

  // Hitch factor deration (EN 1492 / EN 13414)
  let hitchDerationFactor = 1.00;
  if (inputs.hitchType === 'choker') {
    hitchDerationFactor = 0.80; // Choker hitch derated by 20%
  } else if (inputs.hitchType === 'basket') {
    hitchDerationFactor = Number((2.0 * cosTheta).toFixed(2)); // Basket hitch multiplies capacity by 2*cos(theta)
  }

  // Effective user sling capacity check
  const effectiveSlingCapacityTonnes = Number((inputs.userSlingWllTonnes * hitchDerationFactor).toFixed(2));
  const slingCapacityUtilization = effectiveSlingCapacityTonnes > 0
    ? Number((slingTensionPerLegTonnes / effectiveSlingCapacityTonnes).toFixed(3))
    : 999;
  const isSlingCapacityPass = slingCapacityUtilization <= 1.00;

  // Forklift calculations
  // Derated capacity based on load center (ISO 22915 standard formula)
  // Q_derated = Q_rated * (x + C_std) / (x + max(C_std, C_actual)) where x ≈ 450mm
  const xAxleMm = 450;
  const cStd = Math.max(100, inputs.forkliftStandardLoadCenterMm);
  const cAct = Math.max(cStd, inputs.actualLoadCenterMm);
  const fltDerationRatio = (xAxleMm + cStd) / (xAxleMm + cAct);
  const forkliftDeratedCapacityTonnes = Number((inputs.forkliftRatedCapacityTonnes * fltDerationRatio).toFixed(2));
  const forkliftAppliedTotalTonnes = Number((factoredDynamicLiftLoadKn / 9.81).toFixed(2));
  const forkliftUtilization = forkliftDeratedCapacityTonnes > 0
    ? Number((forkliftAppliedTotalTonnes / forkliftDeratedCapacityTonnes).toFixed(3))
    : 999;
  const isForkliftPass = forkliftUtilization <= 1.00;
  const isLoadCenterSafe = inputs.actualLoadCenterMm <= cStd * 2.2;

  // Pick suitable shackle from certified catalog
  let recommendedShackle = SHACKLE_CATALOG.find(
    s => s.wllTonnes >= slingTensionPerLegTonnes && s.jawWidthMm >= inputs.lugThicknessMm + 3
  );
  if (!recommendedShackle) {
    recommendedShackle = SHACKLE_CATALOG[SHACKLE_CATALOG.length - 1];
  }

  // Selected or assigned shackle pin diameter
  const selectedShackle = SHACKLE_CATALOG.find(s => s.wllTonnes === inputs.shackleWllTonnes) || recommendedShackle;
  const pinDiameter = selectedShackle.pinDiameterMm;

  // Pad-eye force per lifting point
  const padEyeCount = Math.max(1, inputs.padEyeQuantity);
  const appliedTensionPerPadEyeKn = factoredDynamicLiftLoadKn / (padEyeCount * cosTheta);

  const lugGradeInfo = STEEL_GRADES[inputs.padEyeSteelGrade];
  const fyLug = lugGradeInfo.fy;
  const fuLug = lugGradeInfo.fu;
  const gammaM0 = Math.max(0.5, partialFactors?.gammaM0 ?? 1.00);
  const gammaM2 = Math.max(0.5, partialFactors?.gammaM2 ?? 1.25);

  // 1. Shackle Pin Bearing Stress Check (EN 1993-1-8 Cl. 3.13)
  const pinContactAreaMm2 = pinDiameter * inputs.lugThicknessMm;
  const pinBearingStressMpa = (appliedTensionPerPadEyeKn * 1000) / pinContactAreaMm2;
  const allowablePinBearingStressMpa = (1.5 * fyLug) / gammaM0;
  const bearingUtilization = allowablePinBearingStressMpa > 0 ? pinBearingStressMpa / allowablePinBearingStressMpa : 999;
  const isBearingPass = bearingUtilization <= 1.00;

  // 2. Tear-out / Shear Pull-out Resistance (EN 1993-1-8 Cl. 3.13)
  const eNetMm = Math.max(2, inputs.lugHoleRadiusMm - inputs.lugHoleDiameterMm / 2);
  const tearOutResistanceKn =
    (2 * eNetMm * inputs.lugThicknessMm * (fyLug / Math.sqrt(3))) / (gammaM0 * 1000);
  const tearOutUtilization = tearOutResistanceKn > 0 ? appliedTensionPerPadEyeKn / tearOutResistanceKn : 999;
  const isTearOutPass = tearOutUtilization <= 1.00;

  // 3. Net Tension Cross-Section Resistance (EN 1993-1-8)
  const netTensionWidthMm = Math.max(2, 2 * inputs.lugHoleRadiusMm - inputs.lugHoleDiameterMm);
  const netTensionAreaMm2 = netTensionWidthMm * inputs.lugThicknessMm;
  const netTensionResistanceKn = (netTensionAreaMm2 * fyLug) / (gammaM0 * 1000);
  const netTensionUtilization = netTensionResistanceKn > 0 ? appliedTensionPerPadEyeKn / netTensionResistanceKn : 999;
  const isNetTensionPass = netTensionUtilization <= 1.00;

  // 4. Detailed Double Fillet Weld Stress Check & Interaction (EN 1993-1-8 Cl. 4.5.3)
  const weldThroat = Math.max(1, inputs.lugWeldThroatMm);
  const weldLength = Math.max(10, inputs.lugWeldLengthMm);
  const lugHeight = Math.max(10, inputs.lugHeightFromBaseMm);
  const lugThickness = Math.max(4, inputs.lugThicknessMm);
  
  // Effective length per run accounting for end craters: Leff = max(10, Lw - 2a) (EN 1993-1-8 Cl. 4.5.1)
  const effectiveLengthMm = Math.max(10, weldLength - 2 * weldThroat);
  const totalThroatAreaMm2 = 2 * weldThroat * effectiveLengthMm;
  const elasticSectionModulusMm3 = (2 * weldThroat * Math.pow(weldLength, 2)) / 6;
  const elasticSectionModulusOpMm3 = Math.max(100, 2 * (weldThroat * effectiveLengthMm) * (lugThickness / 2));

  // Resolved dynamic forces at base of pad-eye
  const verticalPullKn = appliedTensionPerPadEyeKn * cosTheta;
  const horizontalShearKn = appliedTensionPerPadEyeKn * Math.sin(thetaRad);
  const lateralSideLoadKn = 0.05 * appliedTensionPerPadEyeKn; // 5% accidental lateral load (DNV-ST-N001 / Eurocode)
  const inPlaneBendingMomentKnM = (horizontalShearKn * lugHeight) / 1000; // kN·m
  const outOfPlaneBendingMomentKnM = (lateralSideLoadKn * lugHeight) / 1000; // kN·m

  // Stresses on throat plane (MPa)
  const directTensionStressMpa = (verticalPullKn * 1000) / totalThroatAreaMm2;
  const inPlaneBendingStressMpa = (inPlaneBendingMomentKnM * 1e6) / elasticSectionModulusMm3;
  const outOfPlaneBendingStressMpa = (outOfPlaneBendingMomentKnM * 1e6) / elasticSectionModulusOpMm3;
  const totalTensionStressMpa = directTensionStressMpa + inPlaneBendingStressMpa + outOfPlaneBendingStressMpa;

  const longitudinalShearStressMpa = (horizontalShearKn * 1000) / totalThroatAreaMm2;
  const transverseShearStressMpa = (lateralSideLoadKn * 1000) / totalThroatAreaMm2;
  const resultantShearStressMpa = Math.sqrt(
    Math.pow(longitudinalShearStressMpa, 2) + Math.pow(transverseShearStressMpa, 2)
  );

  // Correlation factor beta_w (EN 1993-1-8 Table 4.1)
  let betaW = 0.85;
  if (inputs.padEyeSteelGrade === 'S235') betaW = 0.80;
  else if (inputs.padEyeSteelGrade === 'S275') betaW = 0.85;
  else if (inputs.padEyeSteelGrade === 'S355') betaW = 0.90;
  else if (inputs.padEyeSteelGrade === 'S460') betaW = 1.00;

  // A. Directional Method (EN 1993-1-8 Cl. 4.5.3.2)
  const sigmaPerpMpa = totalTensionStressMpa / Math.SQRT2;
  const tauPerpMpa = totalTensionStressMpa / Math.SQRT2;
  const tauParaMpa = resultantShearStressMpa;
  const vonMisesStressMpa = Math.sqrt(
    Math.pow(sigmaPerpMpa, 2) + 3 * (Math.pow(tauPerpMpa, 2) + Math.pow(tauParaMpa, 2))
  );
  const designWeldStrengthFwRdMpa = fuLug / (betaW * gammaM2);
  const directionalUtilization = designWeldStrengthFwRdMpa > 0 ? vonMisesStressMpa / designWeldStrengthFwRdMpa : 999;
  
  const normalStressLimitMpa = (0.9 * fuLug) / gammaM2;
  const normalStressUtilization = normalStressLimitMpa > 0 ? sigmaPerpMpa / normalStressLimitMpa : 999;
  const isDirectionalPass = directionalUtilization <= 1.00 && normalStressUtilization <= 1.00;

  // B. Simplified Method (EN 1993-1-8 Cl. 4.5.3.3)
  const designShearStrengthFvwdMpa = (fuLug / Math.sqrt(3)) / (betaW * gammaM2);
  const simplifiedResultantStressMpa = Math.sqrt(
    Math.pow(totalTensionStressMpa, 2) + Math.pow(resultantShearStressMpa, 2)
  );
  const simplifiedUtilization = designShearStrengthFvwdMpa > 0
    ? simplifiedResultantStressMpa / designShearStrengthFvwdMpa
    : 999;
  const isSimplifiedPass = simplifiedUtilization <= 1.00;

  // C. Combined Shear/Tension Interaction Check
  const allowableTension = designWeldStrengthFwRdMpa / Math.SQRT2;
  const interactionIndex =
    Math.pow(totalTensionStressMpa / Math.max(1, allowableTension), 2) +
    Math.pow(resultantShearStressMpa / Math.max(1, designShearStrengthFvwdMpa), 2);

  const governingUtilization = Math.max(directionalUtilization, normalStressUtilization, simplifiedUtilization);
  const isWeldPass = governingUtilization <= 1.00;

  // Recommended minimum throat size to satisfy 100% capacity
  const recommendedMinimumThroatMm = Math.max(
    3.0,
    Number((weldThroat * Math.sqrt(governingUtilization)).toFixed(1))
  );

  const detailedWeldCheck: DetailedWeldStressCheck = {
    weldLengthMm: weldLength,
    weldThroatMm: weldThroat,
    effectiveLengthMm: Number(effectiveLengthMm.toFixed(1)),
    totalThroatAreaMm2: Number(totalThroatAreaMm2.toFixed(1)),
    elasticSectionModulusMm3: Number(elasticSectionModulusMm3.toFixed(1)),
    verticalPullKn: Number(verticalPullKn.toFixed(2)),
    horizontalShearKn: Number(horizontalShearKn.toFixed(2)),
    lateralSideLoadKn: Number(lateralSideLoadKn.toFixed(2)),
    inPlaneBendingMomentKnM: Number(inPlaneBendingMomentKnM.toFixed(3)),
    outOfPlaneBendingMomentKnM: Number(outOfPlaneBendingMomentKnM.toFixed(3)),
    directTensionStressMpa: Number(directTensionStressMpa.toFixed(1)),
    inPlaneBendingStressMpa: Number(inPlaneBendingStressMpa.toFixed(1)),
    outOfPlaneBendingStressMpa: Number(outOfPlaneBendingStressMpa.toFixed(1)),
    totalTensionStressMpa: Number(totalTensionStressMpa.toFixed(1)),
    longitudinalShearStressMpa: Number(longitudinalShearStressMpa.toFixed(1)),
    transverseShearStressMpa: Number(transverseShearStressMpa.toFixed(1)),
    resultantShearStressMpa: Number(resultantShearStressMpa.toFixed(1)),
    sigmaPerpMpa: Number(sigmaPerpMpa.toFixed(1)),
    tauPerpMpa: Number(tauPerpMpa.toFixed(1)),
    tauParaMpa: Number(tauParaMpa.toFixed(1)),
    vonMisesStressMpa: Number(vonMisesStressMpa.toFixed(1)),
    designWeldStrengthFwRdMpa: Number(designWeldStrengthFwRdMpa.toFixed(1)),
    directionalUtilization: Number(directionalUtilization.toFixed(3)),
    normalStressLimitMpa: Number(normalStressLimitMpa.toFixed(1)),
    normalStressUtilization: Number(normalStressUtilization.toFixed(3)),
    isDirectionalPass,
    designShearStrengthFvwdMpa: Number(designShearStrengthFvwdMpa.toFixed(1)),
    simplifiedResultantStressMpa: Number(simplifiedResultantStressMpa.toFixed(1)),
    simplifiedUtilization: Number(simplifiedUtilization.toFixed(3)),
    isSimplifiedPass,
    interactionIndex: Number(interactionIndex.toFixed(3)),
    governingUtilization: Number(governingUtilization.toFixed(3)),
    isWeldPass,
    correlationFactorBetaW: betaW,
    recommendedMinimumThroatMm,
  };

  // Determine Overall Status based on active rigging method
  let overallLiftingStatus: 'PASS' | 'FAIL' = 'PASS';
  if (inputs.riggingMethod === 'crane_slings_only') {
    overallLiftingStatus = isSlingCapacityPass ? 'PASS' : 'FAIL';
  } else if (inputs.riggingMethod === 'forklift_slung') {
    overallLiftingStatus = isForkliftPass && isSlingCapacityPass ? 'PASS' : 'FAIL';
  } else {
    // crane_padeyes
    overallLiftingStatus = isBearingPass && isTearOutPass && isNetTensionPass && isWeldPass ? 'PASS' : 'FAIL';
  }

  return {
    grossStaticWeightKn: Number(grossStaticWeightKn.toFixed(2)),
    factoredDynamicLiftLoadKn: Number(factoredDynamicLiftLoadKn.toFixed(2)),
    effectiveLegs,
    slingTensionPerLegKn: Number(slingTensionPerLegKn.toFixed(2)),
    slingTensionPerLegTonnes: Number(slingTensionPerLegTonnes.toFixed(2)),
    recommendedMinimumSlingWllTonnes,
    recommendedShackle,
    calculatedSlingAngleDeg: Number(calculatedSlingAngleDeg.toFixed(1)),
    calculatedHookHeightMeters: Number(calculatedHookHeightMeters.toFixed(2)),
    hitchDerationFactor,
    effectiveSlingCapacityTonnes,
    slingCapacityUtilization,
    isSlingCapacityPass,
    forkliftDeratedCapacityTonnes,
    forkliftAppliedTotalTonnes,
    forkliftUtilization,
    isForkliftPass,
    isLoadCenterSafe,
    appliedTensionPerPadEyeKn: Number(appliedTensionPerPadEyeKn.toFixed(2)),
    pinBearingStressMpa: Number(pinBearingStressMpa.toFixed(1)),
    allowablePinBearingStressMpa: Number(allowablePinBearingStressMpa.toFixed(1)),
    bearingUtilization: Number(bearingUtilization.toFixed(3)),
    isBearingPass,
    tearOutResistanceKn: Number(tearOutResistanceKn.toFixed(2)),
    tearOutUtilization: Number(tearOutUtilization.toFixed(3)),
    isTearOutPass,
    netTensionResistanceKn: Number(netTensionResistanceKn.toFixed(2)),
    netTensionUtilization: Number(netTensionUtilization.toFixed(3)),
    isNetTensionPass,
    weldStressMpa: detailedWeldCheck.vonMisesStressMpa,
    allowableWeldStressMpa: detailedWeldCheck.designWeldStrengthFwRdMpa,
    weldUtilization: detailedWeldCheck.governingUtilization,
    isWeldPass: detailedWeldCheck.isWeldPass,
    detailedWeldCheck,
    overallLiftingStatus,
  };
}
