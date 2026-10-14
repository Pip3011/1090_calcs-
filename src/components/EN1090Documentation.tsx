import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Check,
  Download,
  Upload,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Anchor,
  FileCheck,
  ChevronRight,
  PenTool,
  Lock,
  Stamp
} from 'lucide-react';
import {
  ProjectMetadata,
  StructuralInputs,
  StructuralResults,
  LiftingInputs,
  LiftingResults
} from '../types';
import { STANDARD_SECTIONS, STEEL_GRADES, SHACKLE_CATALOG } from '../data/steelSections';
import { SignatureModal } from './SignatureModal';

interface EN1090DocumentationProps {
  metadata: ProjectMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<ProjectMetadata>>;
  structuralInputs: StructuralInputs;
  structuralResults: StructuralResults;
  liftingInputs: LiftingInputs;
  liftingResults: LiftingResults;
}

export const EN1090Documentation: React.FC<EN1090DocumentationProps> = ({
  metadata,
  setMetadata,
  structuralInputs,
  structuralResults,
  liftingInputs,
  liftingResults,
}) => {
  const [activeDocTab, setActiveDocTab] = useState<'dop' | 'ce_mark' | 'itp' | 'structural_sheet' | 'lifting_plan'>('dop');
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const selectedSection = structuralInputs.sectionId === 'custom'
    ? structuralInputs.customSection
    : (STANDARD_SECTIONS.find(s => s.id === structuralInputs.sectionId) || STANDARD_SECTIONS[0]);

  const selectedShackle = SHACKLE_CATALOG.find(s => s.wllTonnes === liftingInputs.shackleWllTonnes) || liftingResults.recommendedShackle;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textDossier = `
============================================================
EUROCODE & EN 1090 COMPLIANCE DOSSIER
Project: ${metadata.projectName} (${metadata.projectNumber})
Client: ${metadata.clientName}
Fabricator: ${metadata.fabricatorName}
Execution Class: ${metadata.executionClass} | Standard: ${metadata.executionStandard}
RWC: ${metadata.responsibleWeldingCoordinator}
FPC Certificate: ${metadata.fpcCertificateNumber} (Notified Body: ${metadata.notifiedBodyNumber})
============================================================

1. DECLARATION OF PERFORMANCE (DoP)
- Component Mark: ${metadata.componentMark}
- Steel Grade: ${structuralInputs.steelGrade} per EN 10025-2
- Intended Use: ${metadata.intendedUse}
- Geometric Tolerances: EN 1090-2 Class 1
- Weldability: Qualified to ISO 15614-1 & ISO 9606-1
- Fracture Toughness: 27J at -20°C (Charpy V-Notch)
- Load-bearing Capacity: Verified to EN 1993-1-1 & EN 1990

2. STRUCTURAL VERIFICATION (EN 1993-1-1)
- Section: ${selectedSection.designation} (Span: ${structuralInputs.spanMeters}m)
- Loads: Gk=${structuralInputs.deadLoadGk} kN/m, Qk=${structuralInputs.liveLoadQk} kN/m, Fk=${structuralInputs.pointLoadFk} kN
- ULS Factored Total Load: ${structuralResults.totalUlsLoad} kN/m
- Design Moment Med: ${structuralResults.designBendingMomentMed} kNm (Capacity Mc,Rd: ${structuralResults.plasticMomentResistanceMcRd} kNm, η=${(structuralResults.bendingUtilization*100).toFixed(1)}% - ${structuralResults.isBendingPass ? 'PASS' : 'FAIL'})
- Design Shear Ved: ${structuralResults.designShearForceVed} kN (Capacity Vc,Rd: ${structuralResults.shearResistanceVcRd} kN, η=${(structuralResults.shearUtilization*100).toFixed(1)}% - ${structuralResults.isShearPass ? 'PASS' : 'FAIL'})
- Deflection SLS: ${structuralResults.actualDeflectionMm} mm (Allowable: ${structuralResults.allowableDeflectionMm} mm - ${structuralResults.isDeflectionPass ? 'PASS' : 'FAIL'})

3. SAFE LIFTING & RIGGING PLAN (EN 13155 & LOLER)
- Tare Mass: ${liftingInputs.tareWeightKg} kg | DAF: ${liftingInputs.dynamicAmplificationFactor} | k_CoG: ${liftingInputs.centerOfGravityFactor}
- Total Dynamic Lift Load: ${liftingResults.factoredDynamicLiftLoadKn} kN
- Sling Configuration: ${liftingInputs.slingConfiguration} at ${liftingInputs.slingAngleToVerticalDeg}° to vertical
- Leg Tension: ${liftingResults.slingTensionPerLegTonnes} tonnes (${liftingResults.slingTensionPerLegKn} kN)
- Recommended Sling: Minimum WLL ${liftingResults.recommendedMinimumSlingWllTonnes} tonnes
- Certified Bow Shackle: WLL ${selectedShackle.wllTonnes}t (Pin ⌀${selectedShackle.pinDiameterMm}mm)
- Pad-Eye Checks: Bearing η=${(liftingResults.bearingUtilization*100).toFixed(1)}%, Tear-Out η=${(liftingResults.tearOutUtilization*100).toFixed(1)}%, Weld η=${(liftingResults.weldUtilization*100).toFixed(1)}% - ${liftingResults.overallLiftingStatus}
============================================================
    `.trim();

    navigator.clipboard.writeText(textDossier);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  const handleExportJson = () => {
    const payload = {
      metadata,
      structuralInputs,
      structuralResults,
      liftingInputs,
      liftingResults,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EN1090_Dossier_${metadata.projectNumber || 'Project'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Controls & Metadata Editor */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              <span>EN 1090 Compliance Pack</span>
              <span aria-hidden="true">·</span>
              <span>CPR 305/2011 & UKCA / CE Marking</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Automated Technical Dossier & Documentation Module
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Automatically compiles all required documentation for Factory Production Control (FPC),
              CE / UKCA Marking, Declaration of Performance (DoP), and Safe Rigging Method Statements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsSignatureModalOpen(true)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs ${
                metadata.isDocumentSigned
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  : 'bg-indigo-700 hover:bg-indigo-800 text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{metadata.isDocumentSigned ? 'Signed: ' + (metadata.signatoryName || 'Approved') : 'Sign Documents with Name'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              {copiedDoc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedDoc ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Digital Signature Status Banner */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          metadata.isDocumentSigned
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-start sm:items-center gap-3">
            {metadata.isDocumentSigned ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
            ) : (
              <PenTool className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            )}
            <div>
              {metadata.isDocumentSigned ? (
                <>
                  <span className="font-bold block">Document Officially Signed & Certified</span>
                  <span className="text-emerald-800">
                    Signed by <strong>{metadata.signatoryName}</strong> ({metadata.signatoryRole}) on <strong>{metadata.signatureDate}</strong>. Registration: <code>{metadata.signatoryRegistrationNo || 'Verified'}</code>
                  </span>
                </>
              ) : (
                <>
                  <span className="font-bold block">Document Signature Required</span>
                  <span className="text-amber-800">
                    Add your name, role, and digital signature to authenticate the Declaration of Performance (DoP) and CE mark.
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSignatureModalOpen(true)}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors self-start sm:self-auto shrink-0 ${
              metadata.isDocumentSigned
                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {metadata.isDocumentSigned ? 'Edit / Re-Sign' : 'Sign Documents Now'}
          </button>
        </div>

        {/* Project Metadata Fields */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Project & Factory Production Control (FPC) Credentials
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block">Project Name</label>
              <input
                type="text"
                value={metadata.projectName}
                onChange={(e) => setMetadata(prev => ({ ...prev, projectName: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block">Project / Job No.</label>
              <input
                type="text"
                value={metadata.projectNumber}
                onChange={(e) => setMetadata(prev => ({ ...prev, projectNumber: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block">Client / Erection Site</label>
              <input
                type="text"
                value={metadata.clientName}
                onChange={(e) => setMetadata(prev => ({ ...prev, clientName: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block">Fabricator Name</label>
              <input
                type="text"
                value={metadata.fabricatorName}
                onChange={(e) => setMetadata(prev => ({ ...prev, fabricatorName: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block">Responsible Welding Coordinator (RWC)</label>
              <input
                type="text"
                value={metadata.responsibleWeldingCoordinator}
                onChange={(e) => setMetadata(prev => ({ ...prev, responsibleWeldingCoordinator: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block">FPC Certificate No.</label>
              <input
                type="text"
                value={metadata.fpcCertificateNumber}
                onChange={(e) => setMetadata(prev => ({ ...prev, fpcCertificateNumber: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block">Notified Body No.</label>
              <input
                type="text"
                value={metadata.notifiedBodyNumber}
                onChange={(e) => setMetadata(prev => ({ ...prev, notifiedBodyNumber: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block">Component Mark / ID</label>
              <input
                type="text"
                value={metadata.componentMark}
                onChange={(e) => setMetadata(prev => ({ ...prev, componentMark: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Document Selection Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveDocTab('dop')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeDocTab === 'dop'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Declaration of Performance (DoP)
          </button>
          <button
            type="button"
            onClick={() => setActiveDocTab('ce_mark')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeDocTab === 'ce_mark'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            2. CE / UKCA Marking Label (Annex ZA)
          </button>
          <button
            type="button"
            onClick={() => setActiveDocTab('itp')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeDocTab === 'itp'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Inspection & Test Plan (ITP Matrix)
          </button>
          <button
            type="button"
            onClick={() => setActiveDocTab('structural_sheet')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeDocTab === 'structural_sheet'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Eurocode Structural Calculation Sheet
          </button>
          <button
            type="button"
            onClick={() => setActiveDocTab('lifting_plan')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeDocTab === 'lifting_plan'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            5. Safe Lifting & Rigging Procedure
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER (Engineered for on-screen elegance and crisp A4 printing) */}
      <div className="bg-white border border-slate-300 rounded-xl p-8 lg:p-12 shadow-sm text-slate-900 max-w-4xl mx-auto space-y-8 print:border-none print:p-0 print:shadow-none print:max-w-none">
        
        {/* DOCUMENT 1: DECLARATION OF PERFORMANCE (DoP) */}
        {(activeDocTab === 'dop' || true) && (
          <div className={`${activeDocTab !== 'dop' ? 'hidden print:block print-page-break' : ''} space-y-6`}>
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                  Declaration of Performance (DoP)
                </h1>
                <p className="text-xs text-slate-600">
                  In accordance with Construction Products Regulation (EU) No 305/2011 / UK CPR
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 block">DoP Reference No.</span>
                <span className="font-mono font-bold text-sm text-slate-900">
                  DoP-{metadata.projectNumber || '2026-001'}-{metadata.componentMark}
                </span>
              </div>
            </div>

            {/* General Administrative Items */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-800">1. Unique Identification Code:</span>
                <p className="font-mono text-slate-700">{metadata.componentMark} ({selectedSection.designation})</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-800">2. Type / Batch Serial Number:</span>
                <p className="font-mono text-slate-700">Batch-{metadata.declarationDate}-{metadata.executionClass}</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-800">3. Intended Use of Construction Product:</span>
                <p className="text-slate-700">{metadata.intendedUse}</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-800">4. Manufacturer Details:</span>
                <p className="text-slate-700 font-semibold">{metadata.fabricatorName}</p>
                <p className="text-slate-500 text-[11px]">Factory Production Control Certified Facility</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-800">5. System of AVCP:</span>
                <p className="text-slate-700">System 2+ (Harmonised standard EN 1090-1:2009+A1:2011)</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-800">6. Notified Body & FPC Certificate:</span>
                <p className="text-slate-700">
                  Notified Body No. <strong>{metadata.notifiedBodyNumber}</strong> performed initial inspection & continuous FPC surveillance. Certificate: <strong>{metadata.fpcCertificateNumber}</strong>
                </p>
              </div>
            </div>

            {/* Declared Essential Characteristics Table */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                7. Declared Essential Characteristics (EN 1090-1 Table ZA.1)
              </span>
              <table className="w-full text-xs border border-slate-300 divide-y divide-slate-200">
                <thead className="bg-slate-100 text-slate-800 font-bold">
                  <tr>
                    <th className="px-3 py-2 text-left border-r border-slate-300">Essential Characteristic</th>
                    <th className="px-3 py-2 text-left border-r border-slate-300">Performance Declared</th>
                    <th className="px-3 py-2 text-left">Harmonised Technical Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="px-3 py-2 border-r border-slate-300 font-semibold">Tolerances on dimensions and shape</td>
                    <td className="px-3 py-2 border-r border-slate-300 font-mono">EN 1090-2:2018 Tolerance Class 1</td>
                    <td className="px-3 py-2">EN 1090-1:2009+A1:2011</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-r border-slate-300 font-semibold">Weldability</td>
                    <td className="px-3 py-2 border-r border-slate-300 font-mono">{structuralInputs.steelGrade} (EN 10025-2)</td>
                    <td className="px-3 py-2">EN 1090-1:2009+A1:2011</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-r border-slate-300 font-semibold">Fracture toughness / impact resistance</td>
                    <td className="px-3 py-2 border-r border-slate-300 font-mono">27 Joules at -20°C (Charpy V-Notch J2)</td>
                    <td className="px-3 py-2">EN 10025-2</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-r border-slate-300 font-semibold">Load-bearing capacity</td>
                    <td className="px-3 py-2 border-r border-slate-300 font-mono">
                      Design verified to EN 1993-1-1 & EN 1990 (Med={structuralResults.designBendingMomentMed} kNm, Ved={structuralResults.designShearForceVed} kN)
                    </td>
                    <td className="px-3 py-2">EN 1993-1-1 / EN 1090-2</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-r border-slate-300 font-semibold">Deformation at serviceability limit</td>
                    <td className="px-3 py-2 border-r border-slate-300 font-mono">
                      δ_actual = {structuralResults.actualDeflectionMm} mm &le; L/{structuralInputs.deflectionLimitRatio} ({structuralResults.allowableDeflectionMm} mm)
                    </td>
                    <td className="px-3 py-2">EN 1993-1-1 Cl. 7.2.1</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-r border-slate-300 font-semibold">Fatigue strength & Service Category</td>
                    <td className="px-3 py-2 border-r border-slate-300 font-mono">{metadata.serviceCategory}</td>
                    <td className="px-3 py-2">EN 1090-2 Table B.1</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-r border-slate-300 font-semibold">Execution Class</td>
                    <td className="px-3 py-2 border-r border-slate-300 font-mono font-bold text-slate-900">{metadata.executionClass}</td>
                    <td className="px-3 py-2">EN 1090-2 Annex B</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-r border-slate-300 font-semibold">Reaction to fire</td>
                    <td className="px-3 py-2 border-r border-slate-300 font-mono">Class A1 (Steel is non-combustible)</td>
                    <td className="px-3 py-2">EN 13501-1</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-r border-slate-300 font-semibold">Durability (Corrosion protection)</td>
                    <td className="px-3 py-2 border-r border-slate-300 font-mono">Shotblast to ISO 8501-1 Sa 2.5, C3 Environment</td>
                    <td className="px-3 py-2">EN ISO 12944</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Declaration signatory */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
              <div>
                <p className="text-slate-600 leading-relaxed">
                  The performance of the structural component identified above is in conformity with the declared set of performance characteristics.
                  This declaration of performance is issued under the sole responsibility of the manufacturer identified above.
                </p>
                <div className="mt-4">
                  <span className="text-slate-500 block">Date of Issue:</span>
                  <span className="font-mono font-bold text-slate-800">{metadata.signatureDate || metadata.declarationDate}</span>
                </div>
              </div>
              <div className="text-right space-y-2">
                <span className="text-slate-500 block">Signed for and on behalf of manufacturer by:</span>
                {metadata.isDocumentSigned ? (
                  <div className="space-y-1 inline-block text-right">
                    {metadata.signatureDataUrl ? (
                      <div className="flex justify-end">
                        <img
                          src={metadata.signatureDataUrl}
                          alt={`Signature of ${metadata.signatoryName}`}
                          className="h-14 max-w-[200px] object-contain border-b border-slate-900 pb-1"
                        />
                      </div>
                    ) : (
                      <div className="font-serif italic text-lg text-indigo-950 font-bold border-b border-slate-900 pb-1">
                        {metadata.signatoryName}
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">{metadata.signatoryName}</span>
                      <span className="text-slate-600 text-[11px] block">{metadata.signatoryRole}</span>
                      {metadata.signatoryRegistrationNo && (
                        <span className="text-indigo-800 font-mono text-[10px] block">Reg: {metadata.signatoryRegistrationNo}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="h-12 border-b border-dashed border-slate-400 inline-block w-48"></div>
                    <div>
                      <span className="font-bold text-slate-900 block">{metadata.responsibleWeldingCoordinator}</span>
                      <span className="text-slate-500 block">Responsible Welding Coordinator / Quality Manager</span>
                      <button
                        type="button"
                        onClick={() => setIsSignatureModalOpen(true)}
                        className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold underline mt-1 no-print inline-flex items-center gap-1"
                      >
                        <PenTool className="w-3 h-3" />
                        <span>Sign document with name</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT 2: CE / UKCA MARKING LABEL (ANNEX ZA) */}
        {(activeDocTab === 'ce_mark' || true) && (
          <div className={`${activeDocTab !== 'ce_mark' ? 'hidden print:block print-page-break' : ''} space-y-6`}>
            <div className="border-b-2 border-slate-900 pb-3">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 uppercase">
                Official CE / UKCA Marking Plate (EN 1090-1 Annex ZA)
              </h2>
              <p className="text-xs text-slate-500">
                To be physically affixed or accompanied with delivery dispatch documentation
              </p>
            </div>

            {/* Official Label Card */}
            <div className="border-2 border-slate-900 p-6 max-w-md mx-auto space-y-3 font-sans text-xs bg-white shadow-xs">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                <div className="text-2xl font-black tracking-tighter">CE / UKCA</div>
                <div className="font-mono font-bold text-sm">{metadata.notifiedBodyNumber}</div>
              </div>

              <div className="text-center font-bold text-xs uppercase tracking-wide">
                {metadata.fabricatorName}
              </div>

              <div className="text-center font-mono text-[11px] text-slate-600">
                {metadata.declarationDate.split('-')[0]}
              </div>

              <div className="text-center font-mono text-[11px]">
                Certificate: {metadata.fpcCertificateNumber}
              </div>

              <div className="text-center font-bold text-xs border-y border-slate-300 py-1.5">
                EN 1090-1:2009+A1:2011
              </div>

              <div className="space-y-1 pt-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Structural steel component:</span>
                  <span className="font-bold font-mono">{metadata.componentMark}</span>
                </div>
                <div className="flex justify-between">
                  <span>Execution Class:</span>
                  <span className="font-bold font-mono text-slate-900">{metadata.executionClass}</span>
                </div>
                <div className="flex justify-between">
                  <span>Execution Standard:</span>
                  <span className="font-mono">EN 1090-2:2018</span>
                </div>
                <div className="flex justify-between">
                  <span>Geometrical Tolerances:</span>
                  <span className="font-mono">Class 1</span>
                </div>
                <div className="flex justify-between">
                  <span>Material / Weldability:</span>
                  <span className="font-bold font-mono">{structuralInputs.steelGrade}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fracture Toughness:</span>
                  <span className="font-mono">27 J at -20°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Load-bearing capacity:</span>
                  <span className="font-mono">EN 1993-1-1 ULS/SLS</span>
                </div>
                <div className="flex justify-between">
                  <span>Safe Lifting WLL:</span>
                  <span className="font-mono font-bold text-indigo-900">{liftingResults.slingTensionPerLegTonnes}t / leg</span>
                </div>
                <div className="flex justify-between">
                  <span>Reaction to fire:</span>
                  <span className="font-mono">Class A1</span>
                </div>
              </div>

              <div className="border-t border-slate-300 pt-2 text-[10px] text-slate-500 text-center font-mono">
                DoP Ref: DoP-{metadata.projectNumber}-{metadata.componentMark}
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT 3: INSPECTION & TEST PLAN (ITP MATRIX) */}
        {(activeDocTab === 'itp' || true) && (
          <div className={`${activeDocTab !== 'itp' ? 'hidden print:block print-page-break' : ''} space-y-6`}>
            <div className="border-b-2 border-slate-900 pb-3">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 uppercase">
                Inspection & Test Plan (ITP) & Quality Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Quality gate control for {metadata.executionClass} structural steelwork per EN 1090-2 Clause 12 & Table 24
              </p>
            </div>

            <table className="w-full text-xs border border-slate-300 divide-y divide-slate-200">
              <thead className="bg-slate-100 text-slate-800 font-bold">
                <tr>
                  <th className="px-3 py-2 text-left border-r border-slate-300">Phase & Operation</th>
                  <th className="px-3 py-2 text-left border-r border-slate-300">Inspection Standard</th>
                  <th className="px-3 py-2 text-left border-r border-slate-300">Extent / Frequency</th>
                  <th className="px-3 py-2 text-left border-r border-slate-300">Acceptance Criteria</th>
                  <th className="px-3 py-2 text-left">Quality Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="px-3 py-2 border-r border-slate-300 font-semibold">1. Material Receiving</td>
                  <td className="px-3 py-2 border-r border-slate-300">EN 10204 / EN 10025</td>
                  <td className="px-3 py-2 border-r border-slate-300">100% of cast heats</td>
                  <td className="px-3 py-2 border-r border-slate-300">Grade {structuralInputs.steelGrade}, chemical & yield cert</td>
                  <td className="px-3 py-2 font-mono">3.1 Mill Certificate</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border-r border-slate-300 font-semibold">2. Cutting & Prep</td>
                  <td className="px-3 py-2 border-r border-slate-300">EN 1090-2 Cl. 6.4</td>
                  <td className="px-3 py-2 border-r border-slate-300">Sample checks</td>
                  <td className="px-3 py-2 border-r border-slate-300">ISO 9013 Range 4 cut quality, hardness &le; 380 HV10</td>
                  <td className="px-3 py-2 font-mono">Dimensional Log</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border-r border-slate-300 font-semibold">3. Fit-Up & Tack Welds</td>
                  <td className="px-3 py-2 border-r border-slate-300">EN 1090-2 Cl. 7.3</td>
                  <td className="px-3 py-2 border-r border-slate-300">100% joints</td>
                  <td className="px-3 py-2 border-r border-slate-300">Root gap 1.5–3mm, alignment within Class 1 tolerances</td>
                  <td className="px-3 py-2 font-mono">Fit-Up Sheet</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border-r border-slate-300 font-semibold">4. Production Welding</td>
                  <td className="px-3 py-2 border-r border-slate-300">ISO 15614-1 / ISO 9606</td>
                  <td className="px-3 py-2 border-r border-slate-300">Continuous by RWC</td>
                  <td className="px-3 py-2 border-r border-slate-300">WPS parameters, preheat per EN 1011-2</td>
                  <td className="px-3 py-2 font-mono">WPS & Welder Registry</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border-r border-slate-300 font-semibold">5. Visual Testing (VT)</td>
                  <td className="px-3 py-2 border-r border-slate-300">ISO 17637 / ISO 5817</td>
                  <td className="px-3 py-2 border-r border-slate-300 font-bold text-slate-900">100% of all welds</td>
                  <td className="px-3 py-2 border-r border-slate-300">Quality Level {metadata.executionClass === 'EXC3' ? 'B' : 'C'}</td>
                  <td className="px-3 py-2 font-mono">VT Report</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border-r border-slate-300 font-semibold">6. Supplementary NDT (MT/UT)</td>
                  <td className="px-3 py-2 border-r border-slate-300">EN 1090-2 Table 24</td>
                  <td className="px-3 py-2 border-r border-slate-300 font-mono font-bold">
                    {metadata.executionClass === 'EXC1' ? '0%' : metadata.executionClass === 'EXC2' ? '10% MT on fillet welds' : '20% MT + 20% UT'}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-300">No linear surface cracks or lack of fusion</td>
                  <td className="px-3 py-2 font-mono">NDT Inspection Log</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border-r border-slate-300 font-semibold">7. Lifting Pad-Eye Integrity</td>
                  <td className="px-3 py-2 border-r border-slate-300">EN 13155 / EN 1993-1-8</td>
                  <td className="px-3 py-2 border-r border-slate-300 font-bold">100% of lifting points</td>
                  <td className="px-3 py-2 border-r border-slate-300">Hole ⌀{liftingInputs.lugHoleDiameterMm}mm, 100% MT on fillet welds</td>
                  <td className="px-3 py-2 font-mono">Rigging Sign-Off</td>
                </tr>
              </tbody>
            </table>

            {/* ITP Quality Gate Sign-Off */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div className="text-slate-600">
                <span className="font-bold block text-slate-800">Quality Inspection Release Gate:</span>
                <span>All operations and Table 24 NDT verified satisfactory for Execution Class {metadata.executionClass}.</span>
              </div>
              <div className="text-right">
                {metadata.isDocumentSigned ? (
                  <div className="inline-block text-right">
                    <span className="text-[11px] text-emerald-800 font-bold block">✓ Approved & Released for Erection</span>
                    <span className="font-mono text-xs font-bold text-slate-900">{metadata.signatoryName}</span>
                    <span className="text-[10px] text-slate-500 block">{metadata.signatoryRole} · {metadata.signatureDate}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSignatureModalOpen(true)}
                    className="text-xs font-bold text-indigo-700 underline no-print inline-flex items-center gap-1"
                  >
                    <PenTool className="w-3 h-3" />
                    <span>Sign inspection release</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT 4: STRUCTURAL CALCULATION RECORD (EUROCODE 3) */}
        {(activeDocTab === 'structural_sheet' || true) && (
          <div className={`${activeDocTab !== 'structural_sheet' ? 'hidden print:block print-page-break' : ''} space-y-6`}>
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 uppercase">
                  Eurocode 3 Structural Calculation Record
                </h2>
                <p className="text-xs text-slate-500">
                  EN 1993-1-1:2005 & EN 1990:2002 ULS/SLS Verification Sheet
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 text-xs font-bold font-mono rounded ${
                  structuralResults.overallStatus === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  STATUS: {structuralResults.overallStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-50 p-4 rounded border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[11px]">Profile / Section:</span>
                <span className="font-bold text-slate-900">{selectedSection.designation}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Steel Grade:</span>
                <span className="font-bold text-slate-900">{structuralInputs.steelGrade} (fy = {structuralResults.yieldStrengthFy} MPa)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Effective Span:</span>
                <span className="font-bold text-slate-900">{structuralInputs.spanMeters} m</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Partial Load Factors:</span>
                <span className="font-bold text-slate-900">γG = 1.35, γQ = 1.50 (γM0 = 1.00)</span>
              </div>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 block text-xs">A. Ultimate Limit State (ULS) Flexural Resistance:</span>
                <div className="text-slate-600 mt-1">
                  Design Bending Moment Med = {structuralResults.designBendingMomentMed} kNm
                </div>
                <div className="text-slate-600">
                  Plastic Moment Resistance Mc,Rd = (Wpl,y × fy) / γM0 = {structuralResults.plasticMomentResistanceMcRd} kNm
                </div>
                <div className="font-bold mt-1 text-slate-900">
                  Utilization: Med / Mc,Rd = {(structuralResults.bendingUtilization * 100).toFixed(1)}% &le; 100% ({structuralResults.isBendingPass ? 'PASS' : 'FAIL'}) [EN 1993-1-1 Cl. 6.2.5]
                </div>
              </div>

              <div className="border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 block text-xs">B. Ultimate Limit State (ULS) Shear Resistance:</span>
                <div className="text-slate-600 mt-1">
                  Design Shear Force Ved = {structuralResults.designShearForceVed} kN
                </div>
                <div className="text-slate-600">
                  Plastic Shear Resistance Vc,Rd = Av × (fy / √3) / γM0 = {structuralResults.shearResistanceVcRd} kN
                </div>
                <div className="font-bold mt-1 text-slate-900">
                  Utilization: Ved / Vc,Rd = {(structuralResults.shearUtilization * 100).toFixed(1)}% &le; 100% ({structuralResults.isShearPass ? 'PASS' : 'FAIL'}) [EN 1993-1-1 Cl. 6.2.6]
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block text-xs">C. Serviceability Limit State (SLS) Deflection:</span>
                <div className="text-slate-600 mt-1">
                  Actual Midspan Deflection δ_act = {structuralResults.actualDeflectionMm} mm
                </div>
                <div className="text-slate-600">
                  Allowable Deflection Limit δ_lim = L / {structuralInputs.deflectionLimitRatio} = {structuralResults.allowableDeflectionMm} mm
                </div>
                <div className="font-bold mt-1 text-slate-900">
                  Status: {structuralResults.actualDeflectionMm} mm &le; {structuralResults.allowableDeflectionMm} mm ({structuralResults.isDeflectionPass ? 'PASS' : 'FAIL'}) [EN 1993-1-1 Cl. 7.2.1]
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT 5: SAFE LIFTING & RIGGING PROCEDURE */}
        {(activeDocTab === 'lifting_plan' || true) && (
          <div className={`${activeDocTab !== 'lifting_plan' ? 'hidden print:block print-page-break' : ''} space-y-6`}>
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 uppercase">
                  Safe Lifting Plan & Pad-Eye Method Statement
                </h2>
                <p className="text-xs text-slate-500">
                  EN 13155, EN 13414 & Lifting Operations and Lifting Equipment Regulations (LOLER)
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 text-xs font-bold font-mono rounded ${
                  liftingResults.overallLiftingStatus === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  LIFT VERDICT: {liftingResults.overallLiftingStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[11px]">Tare Mass:</span>
                <span className="font-bold font-mono text-slate-900">{liftingInputs.tareWeightKg} kg</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Crane DAF Factor:</span>
                <span className="font-bold font-mono text-slate-900">{liftingInputs.dynamicAmplificationFactor}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">CoG Shift Factor:</span>
                <span className="font-bold font-mono text-slate-900">{liftingInputs.centerOfGravityFactor}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Total Dynamic Hook Load:</span>
                <span className="font-bold font-mono text-slate-900">{liftingResults.factoredDynamicLiftLoadKn} kN</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider block">
                Rigging Hardware Specifications & Verifications ({
                  liftingInputs.riggingMethod === 'crane_slings_only' ? 'Direct Slings Wrapped Around Beam' :
                  liftingInputs.riggingMethod === 'forklift_slung' ? 'Forklift Truck Handling & Stability' :
                  'Welded Lifting Pad-Eyes & Bow Shackles'
                })
              </span>
              <table className="w-full text-xs border border-slate-300 divide-y divide-slate-200">
                <thead className="bg-slate-100 text-slate-800 font-bold">
                  <tr>
                    <th className="px-3 py-2 text-left border-r border-slate-300">Rigging Element</th>
                    <th className="px-3 py-2 text-left border-r border-slate-300">Specification & Dimension</th>
                    <th className="px-3 py-2 text-left border-r border-slate-300">Safety Check / Stress</th>
                    <th className="px-3 py-2 text-left">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 font-mono">
                  {liftingInputs.riggingMethod === 'crane_slings_only' ? (
                    <>
                      <tr>
                        <td className="px-3 py-2 border-r border-slate-300 font-sans font-semibold">Sling Rigging Geometry</td>
                        <td className="px-3 py-2 border-r border-slate-300">Length L={liftingInputs.slingLengthMeters}m | Wrap Spacing S={liftingInputs.pickupPointsSpacingMeters}m</td>
                        <td className="px-3 py-2 border-r border-slate-300">θ = {liftingResults.calculatedSlingAngleDeg}° | Hook Height H={liftingResults.calculatedHookHeightMeters}m</td>
                        <td className="px-3 py-2 font-bold text-emerald-700">GEOMETRY OK</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 border-r border-slate-300 font-sans font-semibold">Sling Tension Per Leg</td>
                        <td className="px-3 py-2 border-r border-slate-300">{liftingInputs.slingConfiguration} ({liftingInputs.slingMaterial.replace('_', ' ')})</td>
                        <td className="px-3 py-2 border-r border-slate-300">T_leg = {liftingResults.slingTensionPerLegTonnes} tonnes ({liftingResults.slingTensionPerLegKn} kN)</td>
                        <td className="px-3 py-2 font-bold text-slate-900">{liftingResults.slingTensionPerLegTonnes}t / leg</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 border-r border-slate-300 font-sans font-semibold">User Sling Rated WLL</td>
                        <td className="px-3 py-2 border-r border-slate-300">Rated WLL {liftingInputs.userSlingWllTonnes}t ({liftingInputs.hitchType} hitch factor: {liftingResults.hitchDerationFactor})</td>
                        <td className="px-3 py-2 border-r border-slate-300">Effective WLL = {liftingResults.effectiveSlingCapacityTonnes}t &ge; {liftingResults.slingTensionPerLegTonnes}t</td>
                        <td className={`px-3 py-2 font-bold ${liftingResults.isSlingCapacityPass ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {liftingResults.isSlingCapacityPass ? `PASS (${(liftingResults.slingCapacityUtilization * 100).toFixed(1)}%)` : 'OVERLOAD'}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 border-r border-slate-300 font-sans font-semibold">Beam Flange Corner Protection</td>
                        <td className="px-3 py-2 border-r border-slate-300">{liftingInputs.edgeProtection === 'softeners_fitted' ? 'Corner Softeners / Protective Sleeves Fitted' : 'Bare Sharp Steel Flange'}</td>
                        <td className="px-3 py-2 border-r border-slate-300">EN 1492 / EN 13414 corner radius cut prevention</td>
                        <td className={`px-3 py-2 font-bold ${liftingInputs.edgeProtection === 'softeners_fitted' ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {liftingInputs.edgeProtection === 'softeners_fitted' ? 'COMPLIANT' : 'SOFTENERS REQ.'}
                        </td>
                      </tr>
                    </>
                  ) : liftingInputs.riggingMethod === 'forklift_slung' ? (
                    <>
                      <tr>
                        <td className="px-3 py-2 border-r border-slate-300 font-sans font-semibold">Forklift Rated Capacity</td>
                        <td className="px-3 py-2 border-r border-slate-300">{liftingInputs.forkliftRatedCapacityTonnes}t @ {liftingInputs.forkliftStandardLoadCenterMm}mm center</td>
                        <td className="px-3 py-2 border-r border-slate-300">Standard nameplate rating</td>
                        <td className="px-3 py-2 font-bold text-slate-900">{liftingInputs.forkliftRatedCapacityTonnes}t WLL</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 border-r border-slate-300 font-sans font-semibold">Actual Load Center Deration</td>
                        <td className="px-3 py-2 border-r border-slate-300">Pickup Location: {liftingInputs.actualLoadCenterMm}mm from fork heel</td>
                        <td className="px-3 py-2 border-r border-slate-300">Derated Capacity = {liftingResults.forkliftDeratedCapacityTonnes}t (ISO 22915)</td>
                        <td className="px-3 py-2 font-bold text-emerald-700">DERATED OK</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 border-r border-slate-300 font-sans font-semibold">Forklift Stability & Load Check</td>
                        <td className="px-3 py-2 border-r border-slate-300">Applied Dynamic Load: {liftingResults.forkliftAppliedTotalTonnes}t ({liftingResults.factoredDynamicLiftLoadKn} kN)</td>
                        <td className="px-3 py-2 border-r border-slate-300">Utilization = {(liftingResults.forkliftUtilization * 100).toFixed(1)}% &le; 100%</td>
                        <td className={`px-3 py-2 font-bold ${liftingResults.isForkliftPass ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {liftingResults.isForkliftPass ? 'SAFE PASS' : 'OVERLOAD'}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr>
                        <td className="px-3 py-2 border-r border-slate-300 font-sans font-semibold">Sling Leg Bridle</td>
                        <td className="px-3 py-2 border-r border-slate-300">{liftingInputs.slingConfiguration} at {liftingInputs.slingAngleToVerticalDeg}° to vertical</td>
                        <td className="px-3 py-2 border-r border-slate-300">Tension = {liftingResults.slingTensionPerLegTonnes}t / leg</td>
                        <td className="px-3 py-2 font-bold text-emerald-700">WLL &ge; {liftingResults.recommendedMinimumSlingWllTonnes}t</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 border-r border-slate-300 font-sans font-semibold">Certified Bow Shackle</td>
                        <td className="px-3 py-2 border-r border-slate-300">WLL {selectedShackle.wllTonnes}t (Pin ⌀{selectedShackle.pinDiameterMm}mm)</td>
                        <td className="px-3 py-2 border-r border-slate-300">Clearance = {liftingInputs.lugHoleDiameterMm - selectedShackle.pinDiameterMm}mm</td>
                        <td className="px-3 py-2 font-bold text-emerald-700">PASS</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 border-r border-slate-300 font-sans font-semibold">Pad-Eye Pin Bearing</td>
                        <td className="px-3 py-2 border-r border-slate-300">Plate t={liftingInputs.lugThicknessMm}mm, Grade {liftingInputs.padEyeSteelGrade}</td>
                        <td className="px-3 py-2 border-r border-slate-300">σ_b = {liftingResults.pinBearingStressMpa} MPa &le; {liftingResults.allowablePinBearingStressMpa} MPa</td>
                        <td className="px-3 py-2 font-bold text-emerald-700">{liftingResults.isBearingPass ? 'PASS' : 'FAIL'}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 border-r border-slate-300 font-sans font-semibold">Pad-Eye Tear-Out</td>
                        <td className="px-3 py-2 border-r border-slate-300">Outer R={liftingInputs.lugHoleRadiusMm}mm (dh={liftingInputs.lugHoleDiameterMm}mm)</td>
                        <td className="px-3 py-2 border-r border-slate-300">Capacity = {liftingResults.tearOutResistanceKn} kN</td>
                        <td className="px-3 py-2 font-bold text-emerald-700">{liftingResults.isTearOutPass ? 'PASS' : 'FAIL'}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 border-r border-slate-300 font-sans font-semibold">Pad-Eye Fillet Weld (EC3)</td>
                        <td className="px-3 py-2 border-r border-slate-300">
                          Double Fillet: a={liftingInputs.lugWeldThroatMm}mm, Lw={liftingInputs.lugWeldLengthMm}mm (Aw={liftingResults.detailedWeldCheck?.totalThroatAreaMm2}mm²)
                        </td>
                        <td className="px-3 py-2 border-r border-slate-300">
                          σ_vm = {liftingResults.detailedWeldCheck?.vonMisesStressMpa} MPa &le; {liftingResults.detailedWeldCheck?.designWeldStrengthFwRdMpa} MPa | τ_res = {liftingResults.detailedWeldCheck?.simplifiedResultantStressMpa} MPa
                        </td>
                        <td className={`px-3 py-2 font-bold ${liftingResults.detailedWeldCheck?.isWeldPass ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {liftingResults.detailedWeldCheck?.isWeldPass ? `PASS (${((liftingResults.detailedWeldCheck?.governingUtilization ?? 0) * 100).toFixed(1)}%)` : 'OVERSTRESSED'}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 border-r border-slate-300 font-sans font-semibold">Shear / Tension Interaction</td>
                        <td className="px-3 py-2 border-r border-slate-300">
                          σ_ten={liftingResults.detailedWeldCheck?.totalTensionStressMpa} MPa, τ_shear={liftingResults.detailedWeldCheck?.resultantShearStressMpa} MPa (5% lateral)
                        </td>
                        <td className="px-3 py-2 border-r border-slate-300">
                          (σ/f_ten)² + (τ/f_vwd)² = {liftingResults.detailedWeldCheck?.interactionIndex} &le; 1.00 (EN 1993-1-8 Cl. 4.5.3)
                        </td>
                        <td className={`px-3 py-2 font-bold ${liftingResults.detailedWeldCheck?.isWeldPass ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {liftingResults.detailedWeldCheck?.isWeldPass ? 'COMPLIANT' : 'NON-COMPLIANT'}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">LOLER Safe Rigging Operational Requirements:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>All lifting accessories (shackles, slings) must possess valid 6-monthly Thorough Examination reports.</li>
                <li>Tag lines must be attached to prevent uncontrolled rotation during transit.</li>
                <li>Sling angle from vertical must not exceed 60° (calculated: {liftingResults.calculatedSlingAngleDeg}°) under any hoisting condition.</li>
              </ul>
            </div>

            {/* Lifting Sign-Off */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div className="text-slate-600">
                <span className="font-bold block text-slate-800">Lifting Appointed Person / RWC Authorization:</span>
                <span>Rigging configuration and pad-eye capacity verified compliant with EN 13155 and LOLER.</span>
              </div>
              <div className="text-right">
                {metadata.isDocumentSigned ? (
                  <div className="inline-block text-right">
                    <span className="text-[11px] text-emerald-800 font-bold block">✓ Lift Plan Certified</span>
                    <span className="font-mono text-xs font-bold text-slate-900">{metadata.signatoryName}</span>
                    <span className="text-[10px] text-slate-500 block">{metadata.signatureDate}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSignatureModalOpen(true)}
                    className="text-xs font-bold text-indigo-700 underline no-print inline-flex items-center gap-1"
                  >
                    <PenTool className="w-3 h-3" />
                    <span>Sign lifting method statement</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Digital Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        metadata={metadata}
        onSaveSignature={(updated) => {
          setMetadata(prev => ({ ...prev, ...updated }));
        }}
      />
    </div>
  );
};

function inputsSlingAngleDeg(deg: number) {
  return `${deg}°`;
}
