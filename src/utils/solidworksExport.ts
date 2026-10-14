import { StructuralInputs, LiftingInputs, ProjectMetadata, StructuralResults, LiftingResults, SteelSection } from '../types';
import { STEEL_GRADES, STANDARD_SECTIONS } from '../data/steelSections';

/**
 * Downloads a string as a text file in the user's browser
 */
export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Resolves current beam dimensions from standard or custom sections
 */
function getBeamDimensions(structuralInputs: StructuralInputs, customSections: SteelSection[]) {
  let section: SteelSection | undefined;
  if (structuralInputs.sectionId === 'custom') {
    section = structuralInputs.customSection;
  } else {
    section = customSections.find(s => s.id === structuralInputs.sectionId) ||
      STANDARD_SECTIONS.find(s => s.id === structuralInputs.sectionId) ||
      STANDARD_SECTIONS[0];
  }
  return section;
}

/**
 * Generates SolidWorks Equations text file (.txt)
 * Compatible with SolidWorks: Tools > Equations > Import...
 */
export function generateSolidWorksEquations(
  structuralInputs: StructuralInputs,
  liftingInputs: LiftingInputs,
  customSections: SteelSection[]
): string {
  const section = getBeamDimensions(structuralInputs, customSections);
  const spanMm = (structuralInputs.spanMeters * 1000).toFixed(1);
  const depthMm = section.depth.toFixed(1);
  const widthMm = section.width.toFixed(1);
  const tfMm = section.flangeThickness.toFixed(1);
  const twMm = section.webThickness.toFixed(1);
  const slingLenMm = (liftingInputs.slingLengthMeters * 1000).toFixed(1);
  const slingSpacingMm = (liftingInputs.pickupPointsSpacingMeters * 1000).toFixed(1);

  return `"****************************************************************"
"* SOLIDWORKS EQUATIONS FILE - EUROSTRUCT 1090 AUTOMATION        *"
"* Standard: EN 1090-2 / Eurocode 3 / EN 13155 Lifting Rigging  *"
"* Generated for Component: ${structuralInputs.sectionId}        *"
"****************************************************************"

"Beam_Depth" = ${depthMm}
"Beam_Width" = ${widthMm}
"Flange_Thickness" = ${tfMm}
"Web_Thickness" = ${twMm}
"Beam_Span_Length" = ${spanMm}
"Fillet_Radius_r" = 10.0

"Sling_Rated_WLL_Tonnes" = ${liftingInputs.userSlingWllTonnes.toFixed(2)}
"Sling_Leg_Length" = ${slingLenMm}
"Sling_Pickup_Spacing" = ${slingSpacingMm}
"Sling_Angle_To_Vertical_Deg" = ${liftingInputs.slingAngleToVerticalDeg.toFixed(1)}

"Lug_Plate_Thickness" = ${liftingInputs.lugThicknessMm.toFixed(1)}
"Lug_Hole_Diameter" = ${liftingInputs.lugHoleDiameterMm.toFixed(1)}
"Lug_Outer_Radius" = ${liftingInputs.lugHoleRadiusMm.toFixed(1)}
"Lug_Height_From_Base" = ${liftingInputs.lugHeightFromBaseMm.toFixed(1)}
"Lug_Weld_Length" = ${liftingInputs.lugWeldLengthMm.toFixed(1)}
"Lug_Weld_Fillet_Throat" = ${liftingInputs.lugWeldThroatMm.toFixed(1)}
"Shackle_WLL_Tonnes" = ${liftingInputs.shackleWllTonnes.toFixed(2)}

"Forklift_Capacity_Tonnes" = ${liftingInputs.forkliftRatedCapacityTonnes.toFixed(2)}
"Forklift_Actual_Load_Center_mm" = ${liftingInputs.actualLoadCenterMm.toFixed(1)}
`;
}

/**
 * Generates complete SolidWorks VBA Macro (.swp / .bas)
 * Run in SolidWorks via: Tools > Macro > Run or New Macro Editor
 */
export function generateSolidWorksMacro(
  structuralInputs: StructuralInputs,
  liftingInputs: LiftingInputs,
  metadata: ProjectMetadata,
  customSections: SteelSection[]
): string {
  const section = getBeamDimensions(structuralInputs, customSections);
  const spanM = structuralInputs.spanMeters;
  const spanMm = spanM * 1000;
  const isHollow = section.category === 'SHS' || section.category === 'RHS' || section.category === 'CHS';
  const gradeInfo = STEEL_GRADES[structuralInputs.steelGrade];

  return `' ******************************************************************************
' SolidWorks VBA Macro: Automatic Structural Beam & Lifting Modeling
' EuroStruct 1090 Automation - Compliant with EN 1090-2 & Eurocode 3
' Component Mark: ${metadata.componentMark || 'BM-101'}
' Section: ${section.designation} (${structuralInputs.steelGrade})
' Rigging Method: ${liftingInputs.riggingMethod}
' ******************************************************************************

Option Explicit

Dim swApp As Object
Dim swModel As Object
Dim swPart As Object
Dim swSketchMgr As Object
Dim swFeatMgr As Object
Dim swCustPropMgr As Object
Dim boolstatus As Boolean
Dim longstatus As Long

Const BEAM_SPAN_MM As Double = ${spanMm.toFixed(1)}
Const BEAM_DEPTH_MM As Double = ${section.depth.toFixed(1)}
Const BEAM_WIDTH_MM As Double = ${section.width.toFixed(1)}
Const WEB_THICK_MM As Double = ${section.webThickness.toFixed(1)}
Const FLANGE_THICK_MM As Double = ${section.flangeThickness.toFixed(1)}

' Safe Lifting Rigging Dimensions
Const SLING_WLL_TONNES As Double = ${liftingInputs.userSlingWllTonnes.toFixed(2)}
Const SLING_LENGTH_MM As Double = ${(liftingInputs.slingLengthMeters * 1000).toFixed(1)}
Const SLING_SPACING_MM As Double = ${(liftingInputs.pickupPointsSpacingMeters * 1000).toFixed(1)}
Const LUG_THICKNESS_MM As Double = ${liftingInputs.lugThicknessMm.toFixed(1)}
Const LUG_HOLE_DIA_MM As Double = ${liftingInputs.lugHoleDiameterMm.toFixed(1)}
Const LUG_RADIUS_MM As Double = ${liftingInputs.lugHoleRadiusMm.toFixed(1)}
Const LUG_WELD_THROAT_MM As Double = ${liftingInputs.lugWeldThroatMm.toFixed(1)}

Sub main()
    Set swApp = Application.SldWorks
    
    ' Create a new Part document (meters/kg/sec internally)
    Set swModel = swApp.NewDocument(swApp.GetUserPreferenceStringValue(1), 0, 0, 0)
    If swModel Is Nothing Then
        MsgBox "Failed to create new SolidWorks document. Check default Part template settings.", vbCritical, "EuroStruct 1090"
        Exit Sub
    End If
    
    Set swPart = swModel
    Set swSketchMgr = swModel.SketchManager
    Set swFeatMgr = swModel.FeatureManager
    
    ' Select Front Plane for Cross-Section Sketch
    boolstatus = swModel.Extension.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0)
    swSketchMgr.InsertSketch True
    
    Dim dM As Double, wM As Double, tfM As Double, twM As Double, spanM As Double
    dM = BEAM_DEPTH_MM / 1000#
    wM = BEAM_WIDTH_MM / 1000#
    tfM = FLANGE_THICK_MM / 1000#
    twM = WEB_THICK_MM / 1000#
    spanM = BEAM_SPAN_MM / 1000#

    ${isHollow ? `' --- Hollow Structural Section (SHS / RHS) Profile ---
    ' Outer rectangle centered at origin
    swSketchMgr.CreateCenterRectangle 0, 0, 0, wM / 2, dM / 2, 0
    ' Inner hollow core rectangle
    swSketchMgr.CreateCenterRectangle 0, 0, 0, (wM / 2) - twM, (dM / 2) - tfM, 0
    ` : `' --- I-Beam (UB / UC / IPE / HEB) Profile ---
    ' Symmetric I-beam outline centered around origin
    Dim x1 As Double, x2 As Double, y1 As Double, y2 As Double, y3 As Double
    x1 = wM / 2
    x2 = twM / 2
    y1 = dM / 2
    y2 = (dM / 2) - tfM
    
    ' Top Flange
    swSketchMgr.CreateLine -x1, y1, 0, x1, y1, 0
    swSketchMgr.CreateLine x1, y1, 0, x1, y2, 0
    swSketchMgr.CreateLine x1, y2, 0, x2, y2, 0
    
    ' Web Right
    swSketchMgr.CreateLine x2, y2, 0, x2, -y2, 0
    
    ' Bottom Flange Right
    swSketchMgr.CreateLine x2, -y2, 0, x1, -y2, 0
    swSketchMgr.CreateLine x1, -y2, 0, x1, -y1, 0
    swSketchMgr.CreateLine x1, -y1, 0, -x1, -y1, 0
    
    ' Bottom Flange Left
    swSketchMgr.CreateLine -x1, -y1, 0, -x1, -y2, 0
    swSketchMgr.CreateLine -x1, -y2, 0, -x2, -y2, 0
    
    ' Web Left
    swSketchMgr.CreateLine -x2, -y2, 0, -x2, y2, 0
    
    ' Top Flange Left
    swSketchMgr.CreateLine -x2, y2, 0, -x1, y2, 0
    swSketchMgr.CreateLine -x1, y2, 0, -x1, y1, 0
    `}
    
    ' Close sketch and Extrude Beam along length
    swSketchMgr.InsertSketch True
    swModel.ClearSelection2 True
    
    ' Extrude Boss/Base feature
    Dim myFeature As Object
    Set myFeature = swFeatMgr.FeatureExtrusion2(True, False, False, 0, 0, spanM, 0, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False)
    
    ' --------------------------------------------------------------------------
    ' Safe Lifting / Rigging Features in SolidWorks
    ' --------------------------------------------------------------------------
    ${liftingInputs.riggingMethod === 'crane_padeyes' ? `' Add Welded Lifting Pad-Eyes on Top Flange
    Dim halfSpacingM As Double
    halfSpacingM = (SLING_SPACING_MM / 2#) / 1000#
    
    ' Add Reference Planes at Pad-Eye Locations
    swModel.ClearSelection2 True
    boolstatus = swModel.Extension.SelectByID2("Top Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0)
    
    ' Create Reference Axis & Lifting Points
    swModel.InsertRefPlane 8, dM / 2#, 0, 0, 0, 0
    
    MsgBox "SolidWorks Beam Generated with Welded Pad-Eye mounting provisions!" & vbCrLf & _
           "Component: ${metadata.componentMark} (${section.designation})" & vbCrLf & _
           "Lug Thickness: " & LUG_THICKNESS_MM & "mm, Hole: ⌀" & LUG_HOLE_DIA_MM & "mm" & vbCrLf & _
           "Fillet Weld: a=" & LUG_WELD_THROAT_MM & "mm", vbInformation, "EuroStruct 1090"
    ` : `' Add Sling Wrap Reference Planes for "Slings Only Around Beam"
    Dim halfSpacingM As Double
    halfSpacingM = (SLING_SPACING_MM / 2#) / 1000#
    
    ' Left Sling Choke Plane
    swModel.ClearSelection2 True
    boolstatus = swModel.Extension.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0)
    swModel.InsertRefPlane 8, (spanM / 2#) - halfSpacingM, 0, 0, 0, 0
    
    ' Right Sling Choke Plane
    swModel.ClearSelection2 True
    boolstatus = swModel.Extension.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0)
    swModel.InsertRefPlane 8, (spanM / 2#) + halfSpacingM, 0, 0, 0, 0
    
    MsgBox "SolidWorks Beam Generated with Rigging Sling Wrap Planes!" & vbCrLf & _
           "Component: ${metadata.componentMark} (${section.designation})" & vbCrLf & _
           "Rigging Mode: Slings Only Around Beam (Choker/Basket)" & vbCrLf & _
           "Sling Leg Length: " & (SLING_LENGTH_MM / 1000#) & "m | WLL: " & SLING_WLL_TONNES & "t" & vbCrLf & _
           "Pickup Spacing: " & (SLING_SPACING_MM / 1000#) & "m", vbInformation, "EuroStruct 1090"
    `}

    ' --------------------------------------------------------------------------
    ' Set EN 1090 & Eurocode Custom File Properties for BOM & PDM
    ' --------------------------------------------------------------------------
    Set swCustPropMgr = swModel.Extension.CustomPropertyManager("")
    swCustPropMgr.Add3 "EN1090_ExecutionClass", 30, "${metadata.executionClass}", 1
    swCustPropMgr.Add3 "Steel_Grade", 30, "${structuralInputs.steelGrade} (EN 10025-2)", 1
    swCustPropMgr.Add3 "Yield_Strength_MPa", 30, "${gradeInfo.fy} MPa", 1
    swCustPropMgr.Add3 "Component_Mark", 30, "${metadata.componentMark}", 1
    swCustPropMgr.Add3 "Rigging_Method", 30, "${liftingInputs.riggingMethod}", 1
    swCustPropMgr.Add3 "Sling_Capacity_WLL_t", 30, "${liftingInputs.userSlingWllTonnes}t", 1
    swCustPropMgr.Add3 "Sling_Leg_Length_m", 30, "${liftingInputs.slingLengthMeters}m", 1
    swCustPropMgr.Add3 "FPC_Certificate", 30, "${metadata.fpcCertificateNumber}", 1
    swCustPropMgr.Add3 "Fabricator", 30, "${metadata.fabricatorName}", 1
    
    ' Zoom to Fit
    swModel.ViewZoomtofit2
    swModel.ForceRebuild3 True
End Sub
`;
}

/**
 * Generates SolidWorks Simulation / FEA setup parameters and load cases
 */
export function generateSolidWorksSimulationGuide(
  structuralInputs: StructuralInputs,
  liftingInputs: LiftingInputs,
  structuralResults: StructuralResults,
  liftingResults: LiftingResults,
  metadata: ProjectMetadata,
  customSections: SteelSection[]
): string {
  const section = getBeamDimensions(structuralInputs, customSections);
  const gradeInfo = STEEL_GRADES[structuralInputs.steelGrade];
  const dynamicLiftForceN = Math.round(liftingResults.factoredDynamicLiftLoadKn * 1000);
  const slingTensionN = Math.round(liftingResults.slingTensionPerLegKn * 1000);
  const thetaDeg = liftingResults.calculatedSlingAngleDeg;
  const vertForceN = Math.round(slingTensionN * Math.cos((thetaDeg * Math.PI) / 180));
  const horizForceN = Math.round(slingTensionN * Math.sin((thetaDeg * Math.PI) / 180));

  return `================================================================================
SOLIDWORKS SIMULATION (FEA) STUDY SETUP GUIDE - EUROSTRUCT 1090
Standard: Eurocode 3 (EN 1993-1-1 / EN 1993-1-8) & Safe Lifting (EN 13155)
Component: ${metadata.componentMark || 'BM-101'} | Profile: ${section.designation}
================================================================================

1. STUDY DEFINITION
--------------------------------------------------------------------------------
- Study Type: Static (Linear Stress Analysis)
- Solver: FFEPlus or Direct Sparse
- Large Displacement: OFF (Small deformation under Eurocode elastic limits)

2. MATERIAL ASSIGNMENT (EN 10025-2 Steel: ${structuralInputs.steelGrade})
--------------------------------------------------------------------------------
- Material Model: Linear Elastic Isotropic
- Elastic Modulus (E): 210,000 MPa (2.1 x 10^11 N/m^2)
- Poisson's Ratio (ν): 0.30
- Mass Density (ρ): 7,850 kg/m^3
- Yield Strength (fy): ${gradeInfo.fy} MPa
- Ultimate Tensile Strength (fu): ${gradeInfo.fu} MPa
- Eurocode Allowable Von Mises Limit: ${gradeInfo.fy} MPa (with γ_M0 = 1.00)

3. FIXTURES & BOUNDARY CONDITIONS
--------------------------------------------------------------------------------
${liftingInputs.riggingMethod === 'crane_slings_only' ? `- Condition: Free lifting during rigging.
- Soft Springs: Enable in Study Properties (avoids rigid body motion singularity).
- Inertia Relief: Turn ON if solving purely balanced dynamic lift forces.
- Contact / Sling Interaction: Remote Displacements or Virtual Rigging lines.` : `- Pad-Eye Boundary: Rigid Pin Connector at shackle pin location.
- Axial translation: FREE / Retained as per bow shackle jaw pin.`}

4. APPLIED LOADS & LIFTING CONDITIONS
--------------------------------------------------------------------------------
- Gravity: 9.81 m/s^2 (Downward in -Y)
- Component Static Tare Weight: ${liftingInputs.tareWeightKg} kg (${liftingResults.grossStaticWeightKn} kN)
- Dynamic Amplification Factor (DAF): ${liftingInputs.dynamicAmplificationFactor}
- Center of Gravity Factor (k_CoG): ${liftingInputs.centerOfGravityFactor}
- Consequence Factor (γ_lift): ${liftingInputs.consequenceFactor}
- TOTAL FACTORED DYNAMIC LIFT LOAD: ${liftingResults.factoredDynamicLiftLoadKn} kN (${dynamicLiftForceN} N)

Rigging Vectors Per Lifting Leg (${liftingInputs.slingConfiguration}):
- Tension Along Sling Line: ${liftingResults.slingTensionPerLegTonnes} tonnes (${slingTensionN} N)
- Angle to Vertical (θ): ${thetaDeg}°
- Vertical Component (Fy): +${vertForceN} N (Upward)
- Horizontal In-Plane Component (Fx): ${horizForceN} N (Inward towards center)
- Accidental Out-of-Plane Lateral Force (Fz, 5% per EN 13155): ${(slingTensionN * 0.05).toFixed(0)} N

5. SOLIDWORKS CONNECTORS DEFINITION
--------------------------------------------------------------------------------
${liftingInputs.riggingMethod === 'crane_padeyes' ? `A) Pin Connector:
   - Pin Diameter: ${liftingResults.recommendedShackle.pinDiameterMm} mm
   - Lug Hole Diameter: ${liftingInputs.lugHoleDiameterMm} mm
   - Material: High-Tensile Alloy Grade 6/8
   - Allowable Bearing Stress: ${liftingResults.allowablePinBearingStressMpa} MPa

B) Edge Weld Connector (SolidWorks Weldment / Simulation):
   - Weld Type: Double Continuous Fillet Weld
   - Specified Throat (a): ${liftingInputs.lugWeldThroatMm} mm (Min Recommended: ${liftingResults.detailedWeldCheck?.recommendedMinimumThroatMm ?? 8} mm)
   - Specified Weld Length (Lw): ${liftingInputs.lugWeldLengthMm} mm (Effective Area Aw: ${liftingResults.detailedWeldCheck?.totalThroatAreaMm2} mm²)
   - Direct Tension Stress (σ_dir): ${liftingResults.detailedWeldCheck?.directTensionStressMpa} MPa
   - In-Plane Bending Stress (σ_bend): ${liftingResults.detailedWeldCheck?.inPlaneBendingStressMpa} MPa (Mip = ${liftingResults.detailedWeldCheck?.inPlaneBendingMomentKnM} kNm)
   - Total Tension Stress (σ_ten): ${liftingResults.detailedWeldCheck?.totalTensionStressMpa} MPa
   - Resultant Shear Stress (τ_res): ${liftingResults.detailedWeldCheck?.resultantShearStressMpa} MPa (with 5% accidental lateral load)
   - Equivalent von Mises Stress (σ_vm): ${liftingResults.detailedWeldCheck?.vonMisesStressMpa} MPa
   - Design Weld Resistance (fw,Rd): ${liftingResults.detailedWeldCheck?.designWeldStrengthFwRdMpa} MPa
   - Eurocode 3 Shear/Tension Interaction Index: ${liftingResults.detailedWeldCheck?.interactionIndex} <= 1.0 (${liftingResults.detailedWeldCheck?.isWeldPass ? 'PASS' : 'FAIL'})
   - Electrode Material: E7018 / EN ISO 2560-A (fw,Rd = ${liftingResults.allowableWeldStressMpa} MPa)` : `A) Sling Choke Contact:
   - Sling Type: ${liftingInputs.hitchType.toUpperCase()} HITCH
   - Specified Sling WLL: ${liftingInputs.userSlingWllTonnes} tonnes
   - Sling Leg Length: ${liftingInputs.slingLengthMeters} m
   - Pickup Wrap Points Spacing: ${liftingInputs.pickupPointsSpacingMeters} m
   - Corner Softeners / Wear Sleeves: ${liftingInputs.edgeProtection === 'softeners_fitted' ? 'FITTED (Safe)' : 'BARE STEEL (Warning: Corner radius deration applies)'}
   - Local Flange Contact Pressure: Uniform contact distribution over flange width (${section.width} mm)`}

6. MESH & RESULT EVALUATION
--------------------------------------------------------------------------------
- Mesh: Solid Curvature-Based Mesh (element size 5mm - 12mm around connection)
- Factor of Safety Plot (FOS): Min FOS >= 1.00 relative to ${gradeInfo.fy} MPa
- Eurocode 3 Status: ${liftingResults.overallLiftingStatus} (Max Stress < Allowable)
`;
}

/**
 * Generates 2D DXF Format (ASCII R12) for CNC laser cutting or SolidWorks 2D Sketch Import
 */
export function generateSolidWorksDxf(
  structuralInputs: StructuralInputs,
  liftingInputs: LiftingInputs,
  customSections: SteelSection[]
): string {
  const section = getBeamDimensions(structuralInputs, customSections);
  const w = section.width;
  const d = section.depth;
  const tf = section.flangeThickness;
  const tw = section.webThickness;

  // Simple ASCII DXF R12 Header & Entities for Beam Cross-Section
  return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1009
0
ENDSEC
0
SECTION
2
ENTITIES
0
LINE
8
BEAM_PROFILE
10
${-w / 2}
20
${d / 2}
30
0.0
11
${w / 2}
21
${d / 2}
31
0.0
0
LINE
8
BEAM_PROFILE
10
${w / 2}
20
${d / 2}
30
0.0
11
${w / 2}
21
${d / 2 - tf}
31
0.0
0
LINE
8
BEAM_PROFILE
10
${w / 2}
20
${d / 2 - tf}
30
0.0
11
${tw / 2}
21
${d / 2 - tf}
31
0.0
0
LINE
8
BEAM_PROFILE
10
${tw / 2}
20
${d / 2 - tf}
30
0.0
11
${tw / 2}
21
${-d / 2 + tf}
31
0.0
0
LINE
8
BEAM_PROFILE
10
${tw / 2}
20
${-d / 2 + tf}
30
0.0
11
${w / 2}
21
${-d / 2 + tf}
31
0.0
0
LINE
8
BEAM_PROFILE
10
${w / 2}
20
${-d / 2 + tf}
30
0.0
11
${w / 2}
21
${-d / 2}
31
0.0
0
LINE
8
BEAM_PROFILE
10
${w / 2}
20
${-d / 2}
30
0.0
11
${-w / 2}
21
${-d / 2}
31
0.0
0
LINE
8
BEAM_PROFILE
10
${-w / 2}
20
${-d / 2}
30
0.0
11
${-w / 2}
21
${-d / 2 + tf}
31
0.0
0
LINE
8
BEAM_PROFILE
10
${-w / 2}
20
${-d / 2 + tf}
30
0.0
11
${-tw / 2}
21
${-d / 2 + tf}
31
0.0
0
LINE
8
BEAM_PROFILE
10
${-tw / 2}
20
${-d / 2 + tf}
30
0.0
11
${-tw / 2}
21
${d / 2 - tf}
31
0.0
0
LINE
8
BEAM_PROFILE
10
${-tw / 2}
20
${d / 2 - tf}
30
0.0
11
${-w / 2}
21
${d / 2 - tf}
31
0.0
0
LINE
8
BEAM_PROFILE
10
${-w / 2}
20
${d / 2 - tf}
30
0.0
11
${-w / 2}
21
${d / 2}
31
0.0
0
ENDSEC
0
EOF
`;
}
