import React, { useState } from 'react';
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Sliders,
  Scale,
  Plus
} from 'lucide-react';
import { StructuralInputs, StructuralResults, SteelGrade, SteelSection } from '../types';
import { STANDARD_SECTIONS, STEEL_GRADES } from '../data/steelSections';
import { validateStructuralInputs } from '../utils/validation';
import { CustomBeamBuilder } from './CustomBeamBuilder';

interface StructuralCalculatorProps {
  inputs: StructuralInputs;
  setInputs: React.Dispatch<React.SetStateAction<StructuralInputs>>;
  results: StructuralResults;
  customSections: SteelSection[];
  onAddCustomSection: (section: SteelSection) => void;
  onDeleteCustomSection: (id: string) => void;
}

export const StructuralCalculator: React.FC<StructuralCalculatorProps> = ({
  inputs,
  setInputs,
  results,
  customSections,
  onAddCustomSection,
  onDeleteCustomSection,
}) => {
  const [activeDiagram, setActiveDiagram] = useState<'loads' | 'bmd' | 'sfd' | 'deflection'>('loads');
  const [showFormulaSteps, setShowFormulaSteps] = useState(false);
  const [isCustomBeamModalOpen, setIsCustomBeamModalOpen] = useState(false);

  const validationErrors = validateStructuralInputs(inputs);
  const allAvailableSections = [...STANDARD_SECTIONS, ...customSections];
  const selectedSection = inputs.sectionId === 'custom'
    ? inputs.customSection
    : (allAvailableSections.find(s => s.id === inputs.sectionId) || STANDARD_SECTIONS[0]);

  const updateNumericInput = (field: keyof StructuralInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              <span>Eurocode 3 Design Engine</span>
              <span aria-hidden="true">·</span>
              <span>EN 1993-1-1 & EN 1990</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Structural Steel Beam Verifications & Load Combinations
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Validates Ultimate Limit State (ULS) flexural and shear capacities alongside Serviceability Limit State (SLS) deflections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg border text-xs font-bold font-mono inline-flex items-center gap-2 ${
              results.overallStatus === 'PASS'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {results.overallStatus === 'PASS' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>EUROCODE ULS/SLS PASS</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>CAPACITY EXCEEDED (FAIL)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Validation alerts if any */}
        {validationErrors.length > 0 && (
          <div className="mt-4 space-y-2">
            {validationErrors.map((err, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-xs flex items-start gap-2.5 ${
                  err.severity === 'error'
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-amber-50 border border-amber-200 text-amber-800'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">{err.severity === 'error' ? 'Validation Error: ' : 'Warning: '}</span>
                  <span>{err.message}</span>
                  {err.standardClause && (
                    <span className="font-mono ml-2 text-[11px] opacity-80">[{err.standardClause}]</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Section & Material Selection</span>
            </h3>

            {/* Steel Grade */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Steel Grade (EN 10025)</span>
                <span className="font-mono text-slate-500">fy = {results.yieldStrengthFy} N/mm²</span>
              </label>
              <select
                value={inputs.steelGrade}
                onChange={(e) => setInputs(prev => ({ ...prev, steelGrade: e.target.value as SteelGrade }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(STEEL_GRADES).map(([code, g]) => (
                  <option key={code} value={code}>
                    {g.name} — Yield fy = {g.fy} MPa
                  </option>
                ))}
              </select>
            </div>

            {/* Section Picker with Custom Beam Button */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <span>Member Profile</span>
                  <button
                    type="button"
                    onClick={() => setIsCustomBeamModalOpen(true)}
                    className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 transition-colors inline-flex items-center gap-1"
                    title="Add your own custom beam (e.g. SHS 200 x 200 x 5)"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Custom Beam</span>
                  </button>
                </div>
                <span className="font-mono text-slate-500">{selectedSection.massPerMeter} kg/m</span>
              </div>
              <select
                value={inputs.sectionId}
                onChange={(e) => setInputs(prev => ({ ...prev, sectionId: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {customSections.length > 0 && (
                  <optgroup label="Custom User Beams">
                    {customSections.map(s => (
                      <option key={s.id} value={s.id}>
                        ★ {s.designation} (Wpl={s.plasticSectionModulusY} cm³, {s.massPerMeter} kg/m)
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Square & Rectangular Hollow Sections (SHS/RHS/CHS)">
                  {STANDARD_SECTIONS.filter(s => ['SHS', 'RHS', 'CHS'].includes(s.category)).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.designation} (Wpl={s.plasticSectionModulusY} cm³, {s.massPerMeter} kg/m)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Universal Beams (UB)">
                  {STANDARD_SECTIONS.filter(s => s.category === 'UB').map(s => (
                    <option key={s.id} value={s.id}>
                      {s.designation} (Wpl={s.plasticSectionModulusY} cm³, Iy={s.secondMomentOfAreaY} cm⁴)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Universal Columns (UC)">
                  {STANDARD_SECTIONS.filter(s => s.category === 'UC').map(s => (
                    <option key={s.id} value={s.id}>
                      {s.designation} (Wpl={s.plasticSectionModulusY} cm³)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Geometry Details */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-xs font-mono border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[11px]">Depth h:</span>
                <span className="font-bold text-slate-800">{selectedSection.depth} mm</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Width b:</span>
                <span className="font-bold text-slate-800">{selectedSection.width} mm</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Web tw:</span>
                <span className="font-bold text-slate-800">{selectedSection.webThickness} mm</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Flange tf:</span>
                <span className="font-bold text-slate-800">{selectedSection.flangeThickness} mm</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Plastic Modulus Wpl,y:</span>
                <span className="font-bold text-slate-800">{selectedSection.plasticSectionModulusY} cm³</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Moment of Inertia Iy:</span>
                <span className="font-bold text-slate-800">{selectedSection.secondMomentOfAreaY} cm⁴</span>
              </div>
            </div>

            {/* Span & Restraint */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <label htmlFor="spanInput">Effective Span Length (L)</label>
                  <span className="font-mono text-indigo-700 font-bold">{inputs.spanMeters} m</span>
                </div>
                <input
                  id="spanInput"
                  type="range"
                  min="1"
                  max="20"
                  step="0.25"
                  value={inputs.spanMeters}
                  onChange={(e) => updateNumericInput('spanMeters', parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>1.0 m</span>
                  <span>10.0 m</span>
                  <span>20.0 m</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Lateral Buckling Restraint</label>
                <select
                  value={inputs.lateralRestraint}
                  onChange={(e) => setInputs(prev => ({ ...prev, lateralRestraint: e.target.value as any }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
                >
                  <option value="continuous">Continuous Restraint (Concrete slab / composite deck - No LTB)</option>
                  <option value="intermediate_halves">Intermediate Bracing at Midspan</option>
                  <option value="ends_only">Restrained at Supports Only</option>
                </select>
              </div>
            </div>

            {/* Eurocode Actions */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Eurocode Load Schedule
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">
                    Dead Load Gk (kN/m)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={inputs.deadLoadGk}
                    onChange={(e) => updateNumericInput('deadLoadGk', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">γG = 1.35 factor</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">
                    Live Load Qk (kN/m)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={inputs.liveLoadQk}
                    onChange={(e) => updateNumericInput('liveLoadQk', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">γQ = 1.50 factor</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Midspan Point Load Fk (kN)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={inputs.pointLoadFk}
                  onChange={(e) => updateNumericInput('pointLoadFk', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="includeSelfWeight"
                  checked={inputs.includeSelfWeight}
                  onChange={(e) => setInputs(prev => ({ ...prev, includeSelfWeight: e.target.checked }))}
                  className="rounded border-slate-300 text-indigo-600 accent-indigo-600"
                />
                <label htmlFor="includeSelfWeight" className="text-xs text-slate-700 cursor-pointer">
                  Include steel self-weight ({((selectedSection.massPerMeter * 9.81) / 1000).toFixed(2)} kN/m)
                </label>
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>SLS Deflection Limit</span>
                  <span className="font-mono text-slate-800">L / {inputs.deflectionLimitRatio}</span>
                </div>
                <select
                  value={inputs.deflectionLimitRatio}
                  onChange={(e) => updateNumericInput('deflectionLimitRatio', parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
                >
                  <option value={200}>L / 200 (Roofs & purlins without ceilings)</option>
                  <option value={250}>L / 250 (General Eurocode floor total load)</option>
                  <option value={360}>L / 360 (Standard commercial / office floors)</option>
                  <option value={500}>L / 500 (Brittle finishes / sensitive partitions)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output & Interactive Diagram Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real-time Eurocode Verification Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bending Card */}
            <div className={`p-4 rounded-xl border bg-white ${
              results.isBendingPass ? 'border-slate-200' : 'border-rose-300 ring-1 ring-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Bending (M_Ed)
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  results.isBendingPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {results.isBendingPass ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-mono font-bold text-slate-900">
                  {results.designBendingMomentMed} <span className="text-xs font-normal text-slate-500">kNm</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Cap: <span className="font-mono font-semibold">{results.plasticMomentResistanceMcRd} kNm</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                  <span>Utilization η</span>
                  <span className="font-bold">{(results.bendingUtilization * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      results.bendingUtilization <= 0.85
                        ? 'bg-emerald-500'
                        : results.bendingUtilization <= 1.00
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                    }`}
                    style={{ width: `${Math.min(100, results.bendingUtilization * 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 font-mono">
                EN 1993-1-1 Cl. 6.2.5
              </div>
            </div>

            {/* Shear Card */}
            <div className={`p-4 rounded-xl border bg-white ${
              results.isShearPass ? 'border-slate-200' : 'border-rose-300 ring-1 ring-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Shear (V_Ed)
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  results.isShearPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {results.isShearPass ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-mono font-bold text-slate-900">
                  {results.designShearForceVed} <span className="text-xs font-normal text-slate-500">kN</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Cap: <span className="font-mono font-semibold">{results.shearResistanceVcRd} kN</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                  <span>Utilization η</span>
                  <span className="font-bold">{(results.shearUtilization * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      results.shearUtilization <= 0.85
                        ? 'bg-emerald-500'
                        : results.shearUtilization <= 1.00
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                    }`}
                    style={{ width: `${Math.min(100, results.shearUtilization * 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 font-mono">
                EN 1993-1-1 Cl. 6.2.6
              </div>
            </div>

            {/* Deflection Card */}
            <div className={`p-4 rounded-xl border bg-white ${
              results.isDeflectionPass ? 'border-slate-200' : 'border-rose-300 ring-1 ring-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Deflection (SLS)
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  results.isDeflectionPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {results.isDeflectionPass ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-mono font-bold text-slate-900">
                  {results.actualDeflectionMm} <span className="text-xs font-normal text-slate-500">mm</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Limit: <span className="font-mono font-semibold">{results.allowableDeflectionMm} mm</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                  <span>Utilization η</span>
                  <span className="font-bold">{(results.deflectionUtilization * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      results.deflectionUtilization <= 0.85
                        ? 'bg-emerald-500'
                        : results.deflectionUtilization <= 1.00
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                    }`}
                    style={{ width: `${Math.min(100, results.deflectionUtilization * 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 font-mono">
                EN 1993-1-1 Cl. 7.2.1
              </div>
            </div>
          </div>

          {/* Interactive Structural Diagram Visualizer */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Engineering Visualizer & Diagram
              </span>

              {/* Segmented control for diagram mode */}
              <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveDiagram('loads')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    activeDiagram === 'loads' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Load Diagram
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDiagram('bmd')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    activeDiagram === 'bmd' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bending Moment (BMD)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDiagram('sfd')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    activeDiagram === 'sfd' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Shear Force (SFD)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDiagram('deflection')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    activeDiagram === 'deflection' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Deflected Shape
                </button>
              </div>
            </div>

            {/* SVG Engineering Canvas */}
            <div className="bg-slate-950 rounded-xl p-4 overflow-hidden relative">
              <svg viewBox="0 0 600 240" className="w-full h-auto select-none font-mono">
                {/* Background technical grid lines */}
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="600" height="240" fill="url(#grid)" />

                {/* Coordinate space: Beam from X=80 to X=520, Y=140 */}
                {/* Dimension Line */}
                <line x1="80" y1="215" x2="520" y2="215" stroke="#64748b" strokeWidth="1" />
                <line x1="80" y1="208" x2="80" y2="222" stroke="#64748b" strokeWidth="1" />
                <line x1="520" y1="208" x2="520" y2="222" stroke="#64748b" strokeWidth="1" />
                <text x="300" y="228" fill="#94a3b8" fontSize="11" textAnchor="middle">
                  L = {inputs.spanMeters.toFixed(2)} m
                </text>

                {/* Supports */}
                {/* Pin support Left (X=80, Y=140) */}
                <polygon points="80,140 70,165 90,165" fill="#3b82f6" />
                <line x1="65" y1="167" x2="95" y2="167" stroke="#94a3b8" strokeWidth="2" />
                {/* Roller support Right (X=520, Y=140) */}
                <polygon points="520,140 510,160 530,160" fill="#3b82f6" />
                <circle cx="514" cy="165" r="3" fill="#94a3b8" />
                <circle cx="526" cy="165" r="3" fill="#94a3b8" />
                <line x1="505" y1="170" x2="535" y2="170" stroke="#94a3b8" strokeWidth="2" />

                {/* Neutral axis */}
                <line x1="80" y1="140" x2="520" y2="140" stroke="#475569" strokeDasharray="3,3" strokeWidth="1" />

                {/* DIAGRAM VIEW 1: LOADS */}
                {activeDiagram === 'loads' && (
                  <g>
                    {/* Beam element */}
                    <rect x="80" y="132" width="440" height="16" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" rx="2" />
                    
                    {/* Distributed Load arrows (UDL) */}
                    {Array.from({ length: 11 }).map((_, i) => {
                      const x = 90 + i * 42;
                      return (
                        <g key={i}>
                          <line x1={x} y1="75" x2={x} y2="128" stroke="#38bdf8" strokeWidth="1.5" />
                          <polygon points={`${x},130 ${x - 3},120 ${x + 3},120`} fill="#38bdf8" />
                        </g>
                      );
                    })}
                    <line x1="90" y1="75" x2="510" y2="75" stroke="#38bdf8" strokeWidth="2" />
                    <text x="300" y="60" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                      w_ULS = {results.totalUlsLoad} kN/m (1.35 Gk + 1.50 Qk)
                    </text>

                    {/* Point load arrow if > 0 */}
                    {inputs.pointLoadFk > 0 && (
                      <g>
                        <line x1="300" y1="20" x2="300" y2="128" stroke="#f43f5e" strokeWidth="2.5" />
                        <polygon points="300,130 294,115 306,115" fill="#f43f5e" />
                        <text x="300" y="15" fill="#f43f5e" fontSize="12" fontWeight="bold" textAnchor="middle">
                          F_ULS = {(1.5 * inputs.pointLoadFk).toFixed(1)} kN
                        </text>
                      </g>
                    )}
                  </g>
                )}

                {/* DIAGRAM VIEW 2: BENDING MOMENT (BMD) */}
                {activeDiagram === 'bmd' && (
                  <g>
                    {/* Baseline */}
                    <line x1="80" y1="140" x2="520" y2="140" stroke="#64748b" strokeWidth="1.5" />
                    {/* Parabolic moment curve (drawn downwards positive in Eurocode convention) */}
                    <path
                      d="M 80 140 Q 300 40 520 140 Z"
                      fill="rgba(99, 102, 241, 0.25)"
                      stroke="#818cf8"
                      strokeWidth="2.5"
                    />
                    <circle cx="300" cy="90" r="4" fill="#c7d2fe" />
                    <text x="300" y="70" fill="#a5b4fc" fontSize="13" fontWeight="bold" textAnchor="middle">
                      M_Ed,max = {results.designBendingMomentMed} kNm
                    </text>
                    <text x="300" y="165" fill="#94a3b8" fontSize="11" textAnchor="middle">
                      Midspan Maximum Flexural Moment (Parabolic Envelope)
                    </text>
                  </g>
                )}

                {/* DIAGRAM VIEW 3: SHEAR FORCE (SFD) */}
                {activeDiagram === 'sfd' && (
                  <g>
                    {/* Baseline */}
                    <line x1="80" y1="140" x2="520" y2="140" stroke="#64748b" strokeWidth="1.5" />
                    {/* Linear shear profile */}
                    <polygon
                      points={`80,140 80,70 300,140 80,140`}
                      fill="rgba(16, 185, 129, 0.25)"
                      stroke="#34d399"
                      strokeWidth="2"
                    />
                    <polygon
                      points={`300,140 520,210 520,140 300,140`}
                      fill="rgba(16, 185, 129, 0.25)"
                      stroke="#34d399"
                      strokeWidth="2"
                    />
                    <text x="85" y="60" fill="#34d399" fontSize="12" fontWeight="bold" textAnchor="start">
                      +V_Ed = {results.designShearForceVed} kN
                    </text>
                    <text x="515" y="225" fill="#34d399" fontSize="12" fontWeight="bold" textAnchor="end">
                      -V_Ed = -{results.designShearForceVed} kN
                    </text>
                  </g>
                )}

                {/* DIAGRAM VIEW 4: DEFLECTION CURVE */}
                {activeDiagram === 'deflection' && (
                  <g>
                    {/* Straight undeformed axis */}
                    <line x1="80" y1="140" x2="520" y2="140" stroke="#475569" strokeDasharray="4,4" strokeWidth="1" />
                    {/* Exaggerated curved beam */}
                    <path
                      d="M 80 140 Q 300 210 520 140"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                    />
                    {/* Max deflection arrow */}
                    <line x1="300" y1="140" x2="300" y2="175" stroke="#f59e0b" strokeWidth="1.5" />
                    <polygon points="300,175 296,167 304,167" fill="#f59e0b" />
                    <text x="315" y="162" fill="#fbbf24" fontSize="12" fontWeight="bold">
                      δ_act = {results.actualDeflectionMm} mm
                    </text>
                    <text x="300" y="205" fill="#94a3b8" fontSize="11" textAnchor="middle">
                      Allowable limit δ_lim = {results.allowableDeflectionMm} mm (L / {inputs.deflectionLimitRatio})
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Mathematical Step-by-Step Derivation Expander */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setShowFormulaSteps(!showFormulaSteps)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Auditable Mathematical Calculations & Eurocode Clauses
                </span>
              </div>
              {showFormulaSteps ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showFormulaSteps && (
              <div className="px-5 pb-5 pt-2 border-t border-slate-100 text-xs font-mono text-slate-700 space-y-4">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 text-[13px]">
                    1. ULS Load Combination (EN 1990 Eq. 6.10)
                  </div>
                  <div>w_ULS = 1.35 × G_k + 1.50 × Q_k</div>
                  <div>
                    w_ULS = 1.35 × {inputs.deadLoadGk + (inputs.includeSelfWeight ? (selectedSection.massPerMeter * 9.81) / 1000 : 0)} + 1.50 × {inputs.liveLoadQk} = <strong>{results.totalUlsLoad} kN/m</strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 text-[13px]">
                    2. Design Bending Resistance (EN 1993-1-1 Cl. 6.2.5)
                  </div>
                  <div>M_Ed = (w_ULS × L²) / 8 + (F_ULS × L) / 4 = <strong>{results.designBendingMomentMed} kNm</strong></div>
                  <div>M_c,Rd = (W_pl,y × f_y) / γ_M0</div>
                  <div>
                    M_c,Rd = ({selectedSection.plasticSectionModulusY} × 10³ mm³ × {results.yieldStrengthFy} N/mm² × 10⁻⁶) / 1.00 = <strong>{results.plasticMomentResistanceMcRd} kNm</strong>
                  </div>
                  <div>
                    Unity check: M_Ed / M_c,Rd = {results.designBendingMomentMed} / {results.plasticMomentResistanceMcRd} = <strong>{(results.bendingUtilization * 100).toFixed(1)}% ({results.isBendingPass ? 'OK' : 'FAIL'})</strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 text-[13px]">
                    3. Shear Resistance (EN 1993-1-1 Cl. 6.2.6)
                  </div>
                  <div>V_Ed = (w_ULS × L) / 2 + F_ULS / 2 = <strong>{results.designShearForceVed} kN</strong></div>
                  <div>V_pl,Rd = A_v × (f_y / √3) / γ_M0 = <strong>{results.shearResistanceVcRd} kN</strong></div>
                  <div>
                    Unity check: V_Ed / V_c,Rd = {results.designShearForceVed} / {results.shearResistanceVcRd} = <strong>{(results.shearUtilization * 100).toFixed(1)}% ({results.isShearPass ? 'OK' : 'FAIL'})</strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 text-[13px]">
                    4. Serviceability Deflection (EN 1993-1-1 Cl. 7.2.1)
                  </div>
                  <div>δ_max = (5 × w_SLS × L⁴) / (384 × E × I_y) = <strong>{results.actualDeflectionMm} mm</strong></div>
                  <div>δ_lim = (L × 1000) / {inputs.deflectionLimitRatio} = <strong>{results.allowableDeflectionMm} mm</strong></div>
                  <div>
                    Status: {results.actualDeflectionMm} mm &le; {results.allowableDeflectionMm} mm ({results.isDeflectionPass ? 'Satisfied' : 'Excessive Deflection'})
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Beam Modal */}
      <CustomBeamBuilder
        isOpen={isCustomBeamModalOpen}
        onClose={() => setIsCustomBeamModalOpen(false)}
        customSections={customSections}
        onDeleteSection={onDeleteCustomSection}
        onAddSection={(newSection) => {
          onAddCustomSection(newSection);
          setInputs(prev => ({
            ...prev,
            sectionId: newSection.id,
            customSection: newSection,
          }));
        }}
      />
    </div>
  );
};

