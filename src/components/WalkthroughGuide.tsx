import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Shield,
  Layers,
  Anchor,
  FileCheck2,
  Wrench,
  Sparkles
} from 'lucide-react';
import {
  ProjectMetadata,
  StructuralInputs,
  LiftingInputs,
  ConsequenceClass,
  ServiceCategory,
  ProductionCategory
} from '../types';
import { evaluateMissingInformation } from '../utils/validation';

interface WalkthroughGuideProps {
  metadata: ProjectMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<ProjectMetadata>>;
  structuralInputs: StructuralInputs;
  setStructuralInputs: React.Dispatch<React.SetStateAction<StructuralInputs>>;
  liftingInputs: LiftingInputs;
  setLiftingInputs: React.Dispatch<React.SetStateAction<LiftingInputs>>;
  onNavigateToTab: (tab: 'walkthrough' | 'structural' | 'lifting' | 'compliance' | 'library') => void;
  onApplyPreset: (presetKey: 'mezzanine' | 'crane_girder' | 'canopy') => void;
}

export const WalkthroughGuide: React.FC<WalkthroughGuideProps> = ({
  metadata,
  setMetadata,
  structuralInputs,
  liftingInputs,
  onNavigateToTab,
  onApplyPreset,
}) => {
  const missingItems = evaluateMissingInformation(metadata, structuralInputs, liftingInputs);
  const completedCount = missingItems.filter(i => i.status === 'complete').length;
  const completionPercentage = Math.round((completedCount / missingItems.length) * 100);

  return (
    <div className="space-y-8">
      {/* Hero Intro with real technical context */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="text-slate-900 font-semibold">EN 1090-2:2018</span>
              <span aria-hidden="true">·</span>
              <span>EN 1993 Eurocode 3</span>
              <span aria-hidden="true">·</span>
              <span>EN 13155 & LOLER Lifting Standards</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Structural Calculations & Safe Lifting Documentation Roadmap
            </h1>
            <p className="text-sm lg:text-base text-slate-600 leading-relaxed max-w-3xl">
              To fabricate, lift, and CE/UKCA mark structural steel under EN 1090, engineers and fabricators
              must assemble five synchronized categories of technical data: Execution Class classification,
              Eurocode load actions, rigging geometry, pad-eye connection proofs, and Factory Production Control (FPC) quality records.
            </p>

            {/* Quick Scenario Preset Triggers */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Presets:</span>
              <button
                type="button"
                onClick={() => onApplyPreset('mezzanine')}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Heavy Mezzanine Beam (EXC2)
              </button>
              <button
                type="button"
                onClick={() => onApplyPreset('crane_girder')}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Crane Girder & High Fatigue Frame (EXC3)
              </button>
              <button
                type="button"
                onClick={() => onApplyPreset('canopy')}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Secondary Canopy Roof (EXC1)
              </button>
            </div>
          </div>

          {/* Readiness gauge card */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                1090 Technical Dossier Readiness
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {completedCount} / {missingItems.length} Complete
              </span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  completionPercentage === 100
                    ? 'bg-emerald-600'
                    : completionPercentage > 60
                    ? 'bg-indigo-600'
                    : 'bg-amber-600'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Current Execution Class:</span>
                <span className="font-bold text-slate-900">{metadata.executionClass}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Standard:</span>
                <span className="font-mono text-slate-700">{metadata.executionStandard}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab('compliance')}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>View Generated 1090 Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Step 1: Execution Class Determination Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              <span>Step 1 of 5</span>
              <span aria-hidden="true">·</span>
              <span>Mandatory Legal Baseline</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Determine Execution Class (EXC1, EXC2, EXC3, EXC4)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Governed by EN 1990 Consequence Class, EN 1090-2 Service Category, and Production Category.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 block">Current Result</span>
            <span className="text-xl font-mono font-bold text-indigo-700">{metadata.executionClass}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Consequence Class */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Consequence Class (EN 1990)
            </label>
            <select
              value={metadata.consequenceClass}
              onChange={(e) => setMetadata(prev => ({ ...prev, consequenceClass: e.target.value as ConsequenceClass }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="CC1">CC1: Low (Agricultural sheds, storage buildings)</option>
              <option value="CC2">CC2: Medium (Residential, offices, commercial floors)</option>
              <option value="CC3">CC3: High (Bridges, grandstands, hospitals, critical plants)</option>
            </select>
            <p className="text-[11px] text-slate-500 leading-normal">
              Determines social/economic consequences of structural collapse.
            </p>
          </div>

          {/* Service Category */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Service Category (EN 1090-2)
            </label>
            <select
              value={metadata.serviceCategory}
              onChange={(e) => setMetadata(prev => ({ ...prev, serviceCategory: e.target.value as ServiceCategory }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="SC1">SC1: Quasi-static actions only (no severe fatigue)</option>
              <option value="SC2">SC2: Dynamic / fatigue actions (crane runways, bridges)</option>
            </select>
            <p className="text-[11px] text-slate-500 leading-normal">
              SC2 mandates increased NDT surface & volumetric weld inspections (Table 24).
            </p>
          </div>

          {/* Production Category */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Production Category (EN 1090-2)
            </label>
            <select
              value={metadata.productionCategory}
              onChange={(e) => setMetadata(prev => ({ ...prev, productionCategory: e.target.value as ProductionCategory }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PC1">PC1: Non-welded or standard steel grades &le; S275</option>
              <option value="PC2">PC2: Welded components, steels &ge; S355, site welded</option>
            </select>
            <p className="text-[11px] text-slate-500 leading-normal">
              PC2 requires qualified Welding Procedure Specifications (WPS/WPQR).
            </p>
          </div>
        </div>

        {/* Dynamic Class Impact Summary */}
        <div className="bg-indigo-50/70 border border-indigo-200/60 rounded-lg p-4 text-xs text-slate-700 space-y-2">
          <div className="flex items-center gap-2 font-bold text-indigo-950">
            <Shield className="w-4 h-4 text-indigo-700" />
            <span>EN 1090 Compliance Mandate for {metadata.executionClass}:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
            <div className="bg-white/80 p-2.5 rounded border border-indigo-100">
              <span className="font-semibold text-slate-900 block">Material Certs:</span>
              <span className="text-slate-600">
                {metadata.executionClass === 'EXC1' ? 'EN 10204 Type 2.2' : 'EN 10204 Type 3.1 Mill Certs required'}
              </span>
            </div>
            <div className="bg-white/80 p-2.5 rounded border border-indigo-100">
              <span className="font-semibold text-slate-900 block">WPS / Welder Approval:</span>
              <span className="text-slate-600">
                {metadata.executionClass === 'EXC1' ? 'Standard shop practice' : 'ISO 15614-1 & ISO 9606-1 required'}
              </span>
            </div>
            <div className="bg-white/80 p-2.5 rounded border border-indigo-100">
              <span className="font-semibold text-slate-900 block">Welding Coordinator:</span>
              <span className="text-slate-600">
                {metadata.executionClass === 'EXC1' ? 'Basic knowledge' : metadata.executionClass === 'EXC2' ? 'Specific / ISO 14731' : 'Comprehensive / ISO 14731'}
              </span>
            </div>
            <div className="bg-white/80 p-2.5 rounded border border-indigo-100">
              <span className="font-semibold text-slate-900 block">NDT Weld Scope:</span>
              <span className="text-slate-600">
                {metadata.executionClass === 'EXC1' ? '100% VT only' : metadata.executionClass === 'EXC2' ? '100% VT + 0-10% MT/UT' : '100% VT + 10-20% MT/UT'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Category Information Requirements Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            What Technical Information Is Required For Your Dossier?
          </h2>
          <span className="text-xs text-slate-500">
            Complete each section to generate compliant Eurocode calculations & DoP
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Section 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700">
                <Layers className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">1. Structural Member</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('structural')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                <span>Edit</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">·</span>
                <span><strong>Section Designation:</strong> UB/UC/RHS profile with geometric properties (Wpl, Iy, Av, tf, tw).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">·</span>
                <span><strong>Span & Restraints:</strong> Effective center-to-center span length (m) and lateral buckling restraint.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">·</span>
                <span><strong>Steel Grade:</strong> EN 10025-2 S275 / S355 with sub-zero impact toughness (JR, J0, J2).</span>
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">2. Eurocode Actions</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('structural')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                <span>Edit</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">·</span>
                <span><strong>Dead Load Gk:</strong> Permanent cladding, self-weight, secondary steel (factored by 1.35).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">·</span>
                <span><strong>Live Load Qk:</strong> Imposed variable floor/roof loads (factored by 1.50 per EN 1990).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">·</span>
                <span><strong>SLS Deflection Criteria:</strong> Maximum allowed deflection (e.g. L/360 for live, L/250 for total).</span>
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700">
                <Anchor className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">3. Safe Lifting & DAF</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('lifting')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                <span>Edit</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">·</span>
                <span><strong>Gross Tare Weight:</strong> Accurate assembly mass + rigging gear allowance (kg).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">·</span>
                <span><strong>DAF & CoG Factors:</strong> Dynamic factor (1.15–1.50) and center-of-gravity uncertainty k_CoG.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">·</span>
                <span><strong>Sling Leg Angles:</strong> Max angle from vertical &le; 45° (&le; 60° absolute ceiling per LOLER).</span>
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700">
                <Wrench className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">4. Pad-Eye Connections</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('lifting')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                <span>Edit</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">·</span>
                <span><strong>Pin Clearance:</strong> Shackle pin diameter dp vs lug hole dh (clearance 1mm–3mm).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">·</span>
                <span><strong>Plate Geometry:</strong> Thickness t, radius R &ge; 1.25 dh to prevent hole tear-out.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">·</span>
                <span><strong>Fillet Weld Throat:</strong> Throat thickness 'a' verified against von Mises & 5% lateral side-load.</span>
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 md:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700">
                <FileCheck2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">5. EN 1090 Quality & DoP Package</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('compliance')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                <span>View Full Pack</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-800 block">Factory Production Control (FPC):</span>
                <span>Valid certificate from Notified Body (AVCP 2+) authorizing CE/UKCA marking for {metadata.executionClass}.</span>
              </div>
              <div>
                <span className="font-semibold text-slate-800 block">Welding Coordination & NDT:</span>
                <span>Designated RWC (ISO 14731), WPS (ISO 15614-1), and Inspection & Test Plan (ITP) citing Table 24.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Readiness Audit Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Information Readiness & Compliance Audit
            </h3>
            <p className="text-xs text-slate-500">
              Live status of required technical parameters against EN 1090 and Eurocode 3
            </p>
          </div>
          <span className="text-xs font-medium text-slate-600">
            {completedCount} of {missingItems.length} Requirements Satisfied
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Required Parameter</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Current Entry</th>
                <th className="px-5 py-3">Why Eurocode / 1090 Needs This</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {missingItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-500">{item.category}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">{item.field}</td>
                  <td className="px-5 py-3.5">
                    {item.status === 'complete' ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Complete
                      </span>
                    ) : item.status === 'warning' ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Incomplete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-800">{item.description}</td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-sm">{item.whyNeeded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
