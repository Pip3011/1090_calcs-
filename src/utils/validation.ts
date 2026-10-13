import { StructuralInputs, LiftingInputs, ProjectMetadata, MissingInfoItem } from '../types';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  standardClause?: string;
}

export function validateStructuralInputs(inputs: StructuralInputs): ValidationError[] {
  const errors: ValidationError[] = [];

  // Span validation
  if (!inputs.spanMeters || inputs.spanMeters <= 0) {
    errors.push({
      field: 'spanMeters',
      message: 'Span length must be greater than 0 meters.',
      severity: 'error',
      standardClause: 'EN 1993-1-1 Cl. 5.1'
    });
  } else if (inputs.spanMeters < 0.5) {
    errors.push({
      field: 'spanMeters',
      message: 'Span is unusually short (< 0.5m). Verify dimensions.',
      severity: 'warning',
      standardClause: 'EN 1993-1-1'
    });
  } else if (inputs.spanMeters > 35) {
    errors.push({
      field: 'spanMeters',
      message: 'Long span (> 35m) typically requires cambering or truss design.',
      severity: 'warning',
      standardClause: 'EN 1993-1-1 Cl. 7.2'
    });
  }

  // Loading validation
  if (inputs.deadLoadGk < 0) {
    errors.push({
      field: 'deadLoadGk',
      message: 'Permanent dead load Gk cannot be negative.',
      severity: 'error',
      standardClause: 'EN 1990 Cl. 4.1.1'
    });
  }

  if (inputs.liveLoadQk < 0) {
    errors.push({
      field: 'liveLoadQk',
      message: 'Variable live load Qk cannot be negative.',
      severity: 'error',
      standardClause: 'EN 1991-1-1'
    });
  }

  if (inputs.pointLoadFk < 0) {
    errors.push({
      field: 'pointLoadFk',
      message: 'Point load Fk cannot be negative.',
      severity: 'error'
    });
  }

  if (inputs.deadLoadGk === 0 && inputs.liveLoadQk === 0 && inputs.pointLoadFk === 0 && !inputs.includeSelfWeight) {
    errors.push({
      field: 'totalLoad',
      message: 'At least one positive load or member self-weight must be applied.',
      severity: 'error',
      standardClause: 'EN 1990 Eq. 6.10'
    });
  }

  // Deflection limit ratio
  if (!inputs.deflectionLimitRatio || inputs.deflectionLimitRatio < 100 || inputs.deflectionLimitRatio > 1000) {
    errors.push({
      field: 'deflectionLimitRatio',
      message: 'Deflection span ratio must be between 100 and 1000 (typical: L/250 to L/360).',
      severity: 'warning',
      standardClause: 'EN 1993-1-1 Cl. 7.2.1'
    });
  }

  // Custom section geometry
  if (inputs.sectionId === 'custom') {
    const s = inputs.customSection;
    if (s.depth <= 20 || s.width <= 20) {
      errors.push({
        field: 'customSectionDimensions',
        message: 'Beam depth and width must be at least 20mm.',
        severity: 'error'
      });
    }
    if (s.webThickness <= 1 || s.flangeThickness <= 1) {
      errors.push({
        field: 'customSectionThickness',
        message: 'Web and flange thickness must be greater than 1mm.',
        severity: 'error'
      });
    }
    if (s.plasticSectionModulusY <= 0 || s.secondMomentOfAreaY <= 0) {
      errors.push({
        field: 'customSectionProperties',
        message: 'Section modulus (Wpl) and inertia (Iy) must be positive values.',
        severity: 'error',
        standardClause: 'EN 1993-1-1 Cl. 6.2'
      });
    }
  }

  return errors;
}

export function validateLiftingInputs(inputs: LiftingInputs): ValidationError[] {
  const errors: ValidationError[] = [];

  // Tare weight
  if (!inputs.tareWeightKg || inputs.tareWeightKg <= 0) {
    errors.push({
      field: 'tareWeightKg',
      message: 'Gross component weight must be greater than 0 kg.',
      severity: 'error',
      standardClause: 'EN 13155 Cl. 5.1'
    });
  } else if (inputs.tareWeightKg < 10) {
    errors.push({
      field: 'tareWeightKg',
      message: 'Component weight < 10 kg does not typically require engineered lifting lugs.',
      severity: 'warning'
    });
  }

  // Dynamic Amplification Factor
  if (inputs.dynamicAmplificationFactor < 1.0) {
    errors.push({
      field: 'dynamicAmplificationFactor',
      message: 'DAF cannot be less than 1.00.',
      severity: 'error'
    });
  } else if (inputs.dynamicAmplificationFactor < 1.15) {
    errors.push({
      field: 'dynamicAmplificationFactor',
      message: 'EN 13155 requires minimum DAF of 1.15 for smooth workshop cranes; 1.30–1.50 for mobile/site cranes.',
      severity: 'warning',
      standardClause: 'EN 13155 Cl. 5.1.1'
    });
  }

  // Sling angle to vertical
  if (inputs.slingAngleToVerticalDeg < 0) {
    errors.push({
      field: 'slingAngleToVerticalDeg',
      message: 'Sling angle cannot be negative.',
      severity: 'error'
    });
  } else if (inputs.slingAngleToVerticalDeg > 60) {
    errors.push({
      field: 'slingAngleToVerticalDeg',
      message: 'CRITICAL: Sling angle > 60° from vertical is strictly prohibited under EN 13414 / LOLER due to excessive horizontal tension.',
      severity: 'error',
      standardClause: 'EN 13414-1 & LOLER'
    });
  } else if (inputs.slingAngleToVerticalDeg > 45) {
    errors.push({
      field: 'slingAngleToVerticalDeg',
      message: 'Sling angle exceeds recommended 45° limit. Sling tension increases dramatically by 41% or more.',
      severity: 'warning',
      standardClause: 'EN 13414 Table 3'
    });
  }

  // Pad-eye geometry vs Shackle
  if (inputs.lugHoleDiameterMm <= 0) {
    errors.push({
      field: 'lugHoleDiameterMm',
      message: 'Lug hole diameter must be greater than 0 mm.',
      severity: 'error'
    });
  }

  if (inputs.lugThicknessMm < 6) {
    errors.push({
      field: 'lugThicknessMm',
      message: 'Minimum recommended lifting lug thickness is 6mm to prevent out-of-plane buckling.',
      severity: 'warning',
      standardClause: 'EN 1993-1-8 Cl. 3.13'
    });
  }

  // Edge distance
  if (inputs.lugHoleRadiusMm < inputs.lugHoleDiameterMm * 1.0) {
    errors.push({
      field: 'lugHoleRadiusMm',
      message: 'CRITICAL: Pad-eye outer radius R must be at least 1.25x hole diameter to prevent shear tear-out.',
      severity: 'error',
      standardClause: 'EN 1993-1-8 Table 3.9'
    });
  } else if (inputs.lugHoleRadiusMm < inputs.lugHoleDiameterMm * 1.25) {
    errors.push({
      field: 'lugHoleRadiusMm',
      message: 'Recommended edge distance R >= 1.50 * dh for ductile failure mode.',
      severity: 'warning',
      standardClause: 'EN 1993-1-8'
    });
  }

  // Weld throat
  if (inputs.lugWeldThroatMm < 3) {
    errors.push({
      field: 'lugWeldThroatMm',
      message: 'Minimum structural fillet weld throat thickness is 3.0mm.',
      severity: 'error',
      standardClause: 'EN 1993-1-8 Cl. 4.5.2'
    });
  } else if (inputs.lugWeldThroatMm > inputs.lugThicknessMm) {
    errors.push({
      field: 'lugWeldThroatMm',
      message: 'Fillet weld throat (a) typically should not exceed parent plate thickness.',
      severity: 'warning',
      standardClause: 'EN 1993-1-8 Cl. 4.5.1'
    });
  }

  return errors;
}

export function evaluateMissingInformation(
  meta: ProjectMetadata,
  structural: StructuralInputs,
  lifting: LiftingInputs
): MissingInfoItem[] {
  const items: MissingInfoItem[] = [
    {
      id: 'info-1',
      category: 'Classification',
      field: 'Execution Class (EXC)',
      status: meta.executionClass ? 'complete' : 'missing',
      importance: 'Mandatory for EN 1090',
      description: `Determined as ${meta.executionClass} based on ${meta.consequenceClass}, ${meta.serviceCategory}, and ${meta.productionCategory}.`,
      whyNeeded: 'Governs required welder approvals, NDT testing percentages (Table 24), and factory production control audits.'
    },
    {
      id: 'info-2',
      category: 'Classification',
      field: 'Responsible Welding Coordinator (RWC)',
      status: meta.responsibleWeldingCoordinator && meta.responsibleWeldingCoordinator.trim().length > 1 ? 'complete' : 'missing',
      importance: 'Mandatory for EN 1090',
      description: meta.responsibleWeldingCoordinator ? `Assigned to: ${meta.responsibleWeldingCoordinator}` : 'Missing designated coordinator.',
      whyNeeded: 'EN 1090-2 Cl. 7.4.3 & ISO 14731 require a named RWC with qualified technical knowledge.'
    },
    {
      id: 'info-3',
      category: 'Classification',
      field: 'Factory Production Control (FPC) Cert & Notified Body',
      status: meta.fpcCertificateNumber && meta.notifiedBodyNumber ? 'complete' : 'warning',
      importance: 'Mandatory for EN 1090',
      description: meta.fpcCertificateNumber ? `FPC: ${meta.fpcCertificateNumber} (NB: ${meta.notifiedBodyNumber})` : 'FPC Certificate number required for CE/UKCA marking.',
      whyNeeded: 'A CPR 305/2011 Declaration of Performance cannot be legally signed without an active FPC certificate.'
    },
    {
      id: 'info-4',
      category: 'Structural',
      field: 'Eurocode Characteristic Loading (Gk, Qk)',
      status: (structural.deadLoadGk > 0 || structural.liveLoadQk > 0 || structural.pointLoadFk > 0) ? 'complete' : 'missing',
      importance: 'Required for Eurocode Calcs',
      description: `Gk=${structural.deadLoadGk} kN/m, Qk=${structural.liveLoadQk} kN/m, Fk=${structural.pointLoadFk} kN.`,
      whyNeeded: 'EN 1990 Eq. 6.10 mandates factored actions (1.35 Gk + 1.50 Qk) for Ultimate Limit State (ULS).'
    },
    {
      id: 'info-5',
      category: 'Structural',
      field: 'Steel Grade & 3.1 Mill Certificate Spec',
      status: structural.steelGrade ? 'complete' : 'missing',
      importance: 'Mandatory for EN 1090',
      description: `Specified grade: ${structural.steelGrade} (EN 10025-2). 3.1 inspection certificate required.`,
      whyNeeded: 'EN 1090-2 Cl. 5 requires full material traceability and 3.1 test certificates from the steel mill.'
    },
    {
      id: 'info-6',
      category: 'Lifting',
      field: 'Tare Weight & Dynamic Factors (DAF & CoG)',
      status: lifting.tareWeightKg > 0 ? 'complete' : 'missing',
      importance: 'Safety Critical (LOLER/EN 13155)',
      description: `Weight=${lifting.tareWeightKg} kg, DAF=${lifting.dynamicAmplificationFactor}, k_CoG=${lifting.centerOfGravityFactor}.`,
      whyNeeded: 'EN 13155 requires dynamic amplification and center of gravity uncertainty factors for crane hoisting.'
    },
    {
      id: 'info-7',
      category: 'Lifting',
      field: 'Rigging Sling Geometry & Included Angle',
      status: lifting.slingAngleToVerticalDeg <= 60 ? 'complete' : 'missing',
      importance: 'Safety Critical (LOLER/EN 13155)',
      description: `${lifting.slingConfiguration} sling at ${lifting.slingAngleToVerticalDeg}° to vertical.`,
      whyNeeded: 'Tension increases as 1/cos(θ). Angles exceeding 60° are illegal under LOLER / EN 13414.'
    },
    {
      id: 'info-8',
      category: 'Fabrication & Welding',
      field: 'Welding Procedure Specifications (WPS / WPQR)',
      status: 'complete',
      importance: 'Mandatory for EN 1090',
      description: `WPS qualified according to ISO 15614-1 for fillet welds (throat a=${lifting.lugWeldThroatMm}mm).`,
      whyNeeded: 'EN 1090-2 Cl. 7.4.1 mandates written WPS records for all structural and lifting attachment welds.'
    },
    {
      id: 'info-9',
      category: 'Fabrication & Welding',
      field: 'Non-Destructive Testing (NDT) Schedule',
      status: 'complete',
      importance: 'Mandatory for EN 1090',
      description: `100% Visual Testing (VT) + supplementary MT/PT based on ${meta.executionClass} (Table 24).`,
      whyNeeded: 'EN 1090-2 Table 24 specifies mandatory test percentages prior to dispatch.'
    }
  ];

  return items;
}
