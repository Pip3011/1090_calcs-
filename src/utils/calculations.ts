import {
  ConsequenceClass,
  ServiceCategory,
  ProductionCategory,
  ExecutionClass,
  StructuralInputs,
  StructuralResults,
  LiftingInputs,
  LiftingResults,
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

  // Design internal actions at ULS
  const medUdl = (totalUlsLoad * span * span) / 8;
  const medPoint = (factoredPointLoad * span) / 4;
  const designBendingMomentMed = medUdl + medPoint; // kNm

  const vedUdl = (totalUlsLoad * span) / 2;
  const vedPoint = factoredPointLoad / 2;
  const designShearForceVed = vedUdl + vedPoint; // kN

  // Eurocode EN 1993-1-1 Cross-section resistance (gamma_M0 = 1.0)
  const gammaM0 = 1.00;
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
    overallStatus: isBendingPass && isShearPass && isDeflectionPass ? 'PASS' : 'FAIL',
  };
}

export function calculateSafeLifting(inputs: LiftingInputs): LiftingResults {
  const grossStaticWeightKg = inputs.tareWeightKg + inputs.riggingAccessoryWeightKg;
  const grossStaticWeightKn = (grossStaticWeightKg * 9.81) / 1000;

  // Factored dynamic lift load (EN 13155)
  // F_lift = W * g * DAF * k_CoG * gamma_lift
  const factoredDynamicLiftLoadKn =
    grossStaticWeightKn *
    inputs.dynamicAmplificationFactor *
    inputs.centerOfGravityFactor *
    inputs.consequenceFactor;

  // Effective load-bearing legs (EN 13414 / LOLER)
  let effectiveLegs = 2.0;
  if (inputs.slingConfiguration === '1-leg') effectiveLegs = 1.0;
  else if (inputs.slingConfiguration === '2-leg') effectiveLegs = 2.0;
  else if (inputs.slingConfiguration === '3-leg') effectiveLegs = 2.5;
  else if (inputs.slingConfiguration === '4-leg') effectiveLegs = 2.0; // Rigid 4-leg rule: 2 diagonally opposite legs carry load

  const thetaRad = (inputs.slingAngleToVerticalDeg * Math.PI) / 180;
  const cosTheta = Math.max(0.2, Math.cos(thetaRad));

  // Tension per sling leg
  const slingTensionPerLegKn = factoredDynamicLiftLoadKn / (effectiveLegs * cosTheta);
  const slingTensionPerLegTonnes = slingTensionPerLegKn / 9.81;

  // Recommend sling WLL with industry factor
  const recommendedMinimumSlingWllTonnes = Number((slingTensionPerLegTonnes * 1.05).toFixed(2));

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
  const gammaM0 = 1.00;
  const gammaM2 = 1.25;

  // 1. Shackle Pin Bearing Stress Check (EN 1993-1-8 Cl. 3.13)
  // sigma_b = F / (d_pin * t_lug)
  const pinContactAreaMm2 = pinDiameter * inputs.lugThicknessMm;
  const pinBearingStressMpa = (appliedTensionPerPadEyeKn * 1000) / pinContactAreaMm2;
  const allowablePinBearingStressMpa = (1.5 * fyLug) / gammaM0;
  const bearingUtilization = allowablePinBearingStressMpa > 0 ? pinBearingStressMpa / allowablePinBearingStressMpa : 999;
  const isBearingPass = bearingUtilization <= 1.00;

  // 2. Tear-out / Shear Pull-out Resistance (EN 1993-1-8 Cl. 3.13)
  // e_net = R - dh / 2
  const eNetMm = Math.max(2, inputs.lugHoleRadiusMm - inputs.lugHoleDiameterMm / 2);
  // Shear capacity along 2 failure planes
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

  // 4. Double Fillet Weld Stress Check (EN 1993-1-8 Cl. 4.5.3)
  // Two fillet welds of throat a, length Lw
  const weldThroat = Math.max(2, inputs.lugWeldThroatMm);
  const weldLength = Math.max(10, inputs.lugWeldLengthMm);
  const totalWeldAreaMm2 = 2 * weldLength * weldThroat;
  const weldSectionModulusMm3 = (2 * weldThroat * Math.pow(weldLength, 2)) / 6;

  // Vertical tension component + horizontal pull component + 5% lateral side-load (EN 13155)
  const verticalPullKn = appliedTensionPerPadEyeKn * cosTheta;
  const horizontalPullKn = appliedTensionPerPadEyeKn * Math.sin(thetaRad);
  const outOfPlaneLateralKn = 0.05 * appliedTensionPerPadEyeKn; // 5% lateral load

  const directTensionStressMpa = (verticalPullKn * 1000) / totalWeldAreaMm2;
  const bendingMomentKnMm = horizontalPullKn * inputs.lugHeightFromBaseMm;
  const inPlaneBendingStressMpa = (bendingMomentKnMm * 1000) / weldSectionModulusMm3;
  const directShearStressMpa = (horizontalPullKn * 1000) / totalWeldAreaMm2;
  const outOfPlaneShearMpa = (outOfPlaneLateralKn * 1000) / totalWeldAreaMm2;

  // Combined von Mises weld throat stress
  const sigmaPerp = (directTensionStressMpa + inPlaneBendingStressMpa) / Math.SQRT2;
  const tauPerp = sigmaPerp;
  const tauPara = Math.sqrt(Math.pow(directShearStressMpa, 2) + Math.pow(outOfPlaneShearMpa, 2));

  const weldStressMpa = Math.sqrt(Math.pow(sigmaPerp, 2) + 3 * (Math.pow(tauPerp, 2) + Math.pow(tauPara, 2)));

  // Beta_w correlation factor
  let betaW = 0.85;
  if (inputs.padEyeSteelGrade === 'S235') betaW = 0.80;
  else if (inputs.padEyeSteelGrade === 'S275') betaW = 0.85;
  else if (inputs.padEyeSteelGrade === 'S355') betaW = 0.90;
  else if (inputs.padEyeSteelGrade === 'S460') betaW = 1.00;

  const allowableWeldStressMpa = fuLug / (betaW * gammaM2);
  const weldUtilization = allowableWeldStressMpa > 0 ? weldStressMpa / allowableWeldStressMpa : 999;
  const isWeldPass = weldUtilization <= 1.00;

  const overallLiftingStatus = isBearingPass && isTearOutPass && isNetTensionPass && isWeldPass ? 'PASS' : 'FAIL';

  return {
    grossStaticWeightKn: Number(grossStaticWeightKn.toFixed(2)),
    factoredDynamicLiftLoadKn: Number(factoredDynamicLiftLoadKn.toFixed(2)),
    effectiveLegs,
    slingTensionPerLegKn: Number(slingTensionPerLegKn.toFixed(2)),
    slingTensionPerLegTonnes: Number(slingTensionPerLegTonnes.toFixed(2)),
    recommendedMinimumSlingWllTonnes,
    recommendedShackle,
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
    weldStressMpa: Number(weldStressMpa.toFixed(1)),
    allowableWeldStressMpa: Number(allowableWeldStressMpa.toFixed(1)),
    weldUtilization: Number(weldUtilization.toFixed(3)),
    isWeldPass,
    overallLiftingStatus,
  };
}
