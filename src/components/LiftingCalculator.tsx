import React, { useState } from 'react';
import {
  Anchor,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Settings,
  Scale
} from 'lucide-react';
import { LiftingInputs, LiftingResults, SteelGrade } from '../types';
import { SHACKLE_CATALOG, STEEL_GRADES } from '../data/steelSections';
import { validateLiftingInputs } from '../utils/validation';

interface LiftingCalculatorProps {
  inputs: LiftingInputs;
  setInputs: React.Dispatch<React.SetStateAction<LiftingInputs>>;
  results: LiftingResults;
}

export const LiftingCalculator: React.FC<LiftingCalculatorProps> = ({
  inputs,
  setInputs,
  results,
}) => {
  const [showFormulaSteps, setShowFormulaSteps] = useState(false);
  const validationErrors = validateLiftingInputs(inputs);

  const updateNumericInput = (field: keyof LiftingInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Find currently selected shackle in catalog
  const selectedShackle = SHACKLE_CATALOG.find(s => s.wllTonnes === inputs.shackleWllTonnes) || results.recommendedShackle;
  const pinClearance = inputs.lugHoleDiameterMm - selectedShackle.pinDiameterMm;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              <span>Safe Lifting & Rigging Suite</span>
              <span aria-hidden="true">·</span>
              <span>EN 13155, EN 13414 & LOLER</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Lifting Load Analysis, Sling Tension & Pad-Eye Engineering
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Computes dynamic hook loads with DAF factors, multi-leg sling angles, certified shackle sizing,
              and full Eurocode 3 pad-eye pin bearing, tear-out, and weld throat verifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg border text-xs font-bold font-mono inline-flex items-center gap-2 ${
              results.overallLiftingStatus === 'PASS'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {results.overallLiftingStatus === 'PASS' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>RIGGING & PAD-EYE PASS</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>RIGGING CAPACITY EXCEEDED (FAIL)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Validation Errors & Warnings */}
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
          {/* Rigging Loads & Safety Factors */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Anchor className="w-4 h-4 text-indigo-600" />
              <span>Rigging Geometry & Safety Factors</span>
            </h3>

            {/* Tare Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tare Weight (kg)</label>
                <input
                  type="number"
                  step="50"
                  min="10"
                  value={inputs.tareWeightKg}
                  onChange={(e) => updateNumericInput('tareWeightKg', Math.max(10, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                />
                <span className="text-[10px] text-slate-400">Component mass</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Gear Allowance (kg)</label>
                <input
                  type="number"
                  step="10"
                  min="0"
                  value={inputs.riggingAccessoryWeightKg}
                  onChange={(e) => updateNumericInput('riggingAccessoryWeightKg', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                />
                <span className="text-[10px] text-slate-400">Shackles & spreaders</span>
              </div>
            </div>

            {/* DAF & CoG Factors */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700" title="Dynamic Amplification Factor">
                  DAF Factor
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="2.5"
                  value={inputs.dynamicAmplificationFactor}
                  onChange={(e) => updateNumericInput('dynamicAmplificationFactor', parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono font-medium text-slate-900"
                />
                <span className="text-[10px] text-slate-400">1.15–1.50</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700" title="Center of Gravity Shift Factor">
                  k_CoG Factor
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="1.5"
                  value={inputs.centerOfGravityFactor}
                  onChange={(e) => updateNumericInput('centerOfGravityFactor', parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono font-medium text-slate-900"
                />
                <span className="text-[10px] text-slate-400">1.10–1.25</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700" title="EN 13155 Lift Consequence Factor">
                  γ_lift Factor
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="2.0"
                  value={inputs.consequenceFactor}
                  onChange={(e) => updateNumericInput('consequenceFactor', parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono font-medium text-slate-900"
                />
                <span className="text-[10px] text-slate-400">1.30 standard</span>
              </div>
            </div>

            {/* Sling Arrangement & Included Angle */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Sling Configuration</label>
                <select
                  value={inputs.slingConfiguration}
                  onChange={(e) => setInputs(prev => ({ ...prev, slingConfiguration: e.target.value as any }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
                >
                  <option value="2-leg">2-Leg Bridle Sling (2 effective legs)</option>
                  <option value="4-leg">4-Leg Bridle Sling (2 effective legs per LOLER rigid frame rule)</option>
                  <option value="3-leg">3-Leg Bridle Sling (2.5 effective legs)</option>
                  <option value="1-leg">Single Vertical Leg / Choker</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <label htmlFor="slingAngleInput">Sling Angle to Vertical (θ)</label>
                  <span className={`font-mono font-bold ${
                    inputs.slingAngleToVerticalDeg > 45 ? 'text-amber-600' : 'text-indigo-700'
                  }`}>
                    {inputs.slingAngleToVerticalDeg}°
                  </span>
                </div>
                <input
                  id="slingAngleInput"
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={inputs.slingAngleToVerticalDeg}
                  onChange={(e) => updateNumericInput('slingAngleToVerticalDeg', parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>0° (Vertical)</span>
                  <span>30° (Nominal)</span>
                  <span>45° (Standard)</span>
                  <span>60° (Max legal)</span>
                </div>
              </div>
            </div>

            {/* Pad-Eye Dimensions */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pad-Eye / Lifting Lug Geometry (mm)
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Plate Thickness t (mm)</label>
                  <input
                    type="number"
                    step="1"
                    min="6"
                    value={inputs.lugThicknessMm}
                    onChange={(e) => updateNumericInput('lugThicknessMm', parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Hole Diameter dh (mm)</label>
                  <input
                    type="number"
                    step="1"
                    min="10"
                    value={inputs.lugHoleDiameterMm}
                    onChange={(e) => updateNumericInput('lugHoleDiameterMm', parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Outer Radius R (mm)</label>
                  <input
                    type="number"
                    step="1"
                    min="15"
                    value={inputs.lugHoleRadiusMm}
                    onChange={(e) => updateNumericInput('lugHoleRadiusMm', parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">R &ge; 1.25 dh required</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Fillet Weld Throat a (mm)</label>
                  <input
                    type="number"
                    step="1"
                    min="3"
                    value={inputs.lugWeldThroatMm}
                    onChange={(e) => updateNumericInput('lugWeldThroatMm', parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Min 3.0mm</span>
                </div>
              </div>

              {/* Shackle Choice */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Certified Bow Shackle Selection</span>
                  <span className={`font-mono text-xs font-bold ${
                    pinClearance < 1 || pinClearance > 6 ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    Clearance: {pinClearance} mm
                  </span>
                </label>
                <select
                  value={inputs.shackleWllTonnes}
                  onChange={(e) => updateNumericInput('shackleWllTonnes', parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
                >
                  {SHACKLE_CATALOG.map((s) => (
                    <option key={s.wllTonnes} value={s.wllTonnes}>
                      WLL {s.wllTonnes}t (Pin: ⌀{s.pinDiameterMm}mm, Jaw: {s.jawWidthMm}mm, Size: {s.nominalSizeInch})
                    </option>
                  ))}
                </select>
                {pinClearance < 1 && (
                  <p className="text-[11px] text-rose-600">
                    Shackle pin (⌀{selectedShackle.pinDiameterMm}mm) will not fit hole (⌀{inputs.lugHoleDiameterMm}mm)!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Output & Interactive Rigging Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real-Time Lifting Verification Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sling Tension Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Sling Tension / Leg
              </span>
              <div className="text-xl font-mono font-bold text-slate-900 mt-2">
                {results.slingTensionPerLegTonnes} <span className="text-xs font-normal text-slate-500">tonnes</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-mono">
                {results.slingTensionPerLegKn} kN per leg
              </div>
              <div className="mt-3 p-2 bg-slate-50 rounded text-[11px] text-slate-700">
                <span>Min Recommended Sling:</span>{' '}
                <strong className="font-mono text-indigo-700">WLL {results.recommendedMinimumSlingWllTonnes}t</strong>
              </div>
            </div>

            {/* Pad-Eye Bearing Card */}
            <div className={`p-4 rounded-xl border bg-white ${
              results.isBearingPass ? 'border-slate-200' : 'border-rose-300 ring-1 ring-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Pin Bearing Check
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  results.isBearingPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {results.isBearingPass ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="text-xl font-mono font-bold text-slate-900 mt-2">
                {results.pinBearingStressMpa} <span className="text-xs font-normal text-slate-500">MPa</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-mono">
                Allowable: {results.allowablePinBearingStressMpa} MPa
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                  <span>Bearing η</span>
                  <span className="font-bold">{(results.bearingUtilization * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      results.bearingUtilization <= 0.85
                        ? 'bg-emerald-500'
                        : results.bearingUtilization <= 1.00
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                    }`}
                    style={{ width: `${Math.min(100, results.bearingUtilization * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Weld Stress Card */}
            <div className={`p-4 rounded-xl border bg-white ${
              results.isWeldPass ? 'border-slate-200' : 'border-rose-300 ring-1 ring-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Fillet Weld Stress
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  results.isWeldPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {results.isWeldPass ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="text-xl font-mono font-bold text-slate-900 mt-2">
                {results.weldStressMpa} <span className="text-xs font-normal text-slate-500">MPa</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-mono">
                Allowable: {results.allowableWeldStressMpa} MPa
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                  <span>Weld η</span>
                  <span className="font-bold">{(results.weldUtilization * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      results.weldUtilization <= 0.85
                        ? 'bg-emerald-500'
                        : results.weldUtilization <= 1.00
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                    }`}
                    style={{ width: `${Math.min(100, results.weldUtilization * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Rigging & Pad-Eye Blueprint Visualizer */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Rigging Arrangement & Pad-Eye Blueprint
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Total Dynamic Rigging Load: {results.factoredDynamicLiftLoadKn} kN
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 overflow-hidden">
              <svg viewBox="0 0 640 280" className="w-full h-auto select-none font-mono">
                {/* Crane Hook at Top (X=240, Y=30) */}
                <circle cx="240" cy="25" r="14" fill="none" stroke="#f59e0b" strokeWidth="3" />
                <path d="M 240 39 C 240 60, 225 65, 225 55" fill="none" stroke="#f59e0b" strokeWidth="4" />
                <rect x="232" y="2" width="16" height="10" fill="#94a3b8" rx="1" />

                {/* Left Sling Leg */}
                <line x1="230" y1="50" x2="120" y2="180" stroke="#eab308" strokeWidth="3" />
                {/* Right Sling Leg */}
                <line x1="250" y1="50" x2="360" y2="180" stroke="#eab308" strokeWidth="3" />

                {/* Angle θ Arc */}
                <line x1="240" y1="50" x2="240" y2="120" stroke="#64748b" strokeDasharray="3,3" strokeWidth="1" />
                <path d="M 240 85 A 35 35 0 0 0 256 81" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="262" y="88" fill="#38bdf8" fontSize="11" fontWeight="bold">
                  θ = {inputs.slingAngleToVerticalDeg}°
                </text>

                {/* Structural Beam Being Lifted */}
                <rect x="80" y="185" width="320" height="24" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" rx="1" />
                <text x="240" y="201" fill="#cbd5e1" fontSize="10" textAnchor="middle">
                  Tare W = {inputs.tareWeightKg} kg
                </text>

                {/* Center of Gravity (CoG) Marker */}
                <circle cx="240" cy="197" r="6" fill="#f43f5e" />
                <line x1="230" y1="197" x2="250" y2="197" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="240" y1="187" x2="240" y2="207" stroke="#ffffff" strokeWidth="1.5" />
                <text x="240" y="225" fill="#f43f5e" fontSize="10" fontWeight="bold" textAnchor="middle">
                  CoG (k_CoG = {inputs.centerOfGravityFactor})
                </text>

                {/* Left Pad-eye on Beam */}
                <polygon points="120,185 110,165 130,165" fill="#64748b" stroke="#cbd5e1" />
                <circle cx="120" cy="165" r="4" fill="#0f172a" stroke="#e2e8f0" />

                {/* Right Pad-eye on Beam */}
                <polygon points="360,185 350,165 370,165" fill="#64748b" stroke="#cbd5e1" />
                <circle cx="360" cy="165" r="4" fill="#0f172a" stroke="#e2e8f0" />

                {/* Tension Callout */}
                <text x="145" y="110" fill="#fde047" fontSize="11" fontWeight="bold">
                  T = {results.slingTensionPerLegTonnes}t
                </text>
                <text x="325" y="110" fill="#fde047" fontSize="11" fontWeight="bold">
                  T = {results.slingTensionPerLegTonnes}t
                </text>

                {/* INSET: PAD-EYE TECHNICAL DRAWING BLUEPRINT (Right side: X=450 to 620) */}
                <rect x="440" y="15" width="190" height="250" fill="#020617" stroke="#334155" strokeWidth="1" rx="8" />
                <text x="535" y="35" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                  PAD-EYE BLUEPRINT
                </text>

                {/* Pad-eye plate drawing */}
                <path
                  d="M 495 190 L 495 110 A 40 40 0 0 1 575 110 L 575 190 Z"
                  fill="#1e293b"
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
                {/* Host flange base plate */}
                <rect x="470" y="190" width="130" height="12" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                {/* Fillet weld beads */}
                <polygon points="495,190 487,190 495,178" fill="#fbbf24" />
                <polygon points="575,190 583,190 575,178" fill="#fbbf24" />
                <text x="460" y="180" fill="#fbbf24" fontSize="9">a={inputs.lugWeldThroatMm}</text>

                {/* Hole */}
                <circle cx="535" cy="110" r="16" fill="#020617" stroke="#38bdf8" strokeWidth="2" />
                {/* Shackle Pin inside hole */}
                <circle cx="535" cy="110" r="13" fill="rgba(245, 158, 11, 0.4)" stroke="#f59e0b" strokeWidth="1.5" />

                {/* Blueprint Dimension annotations */}
                <text x="535" y="114" fill="#38bdf8" fontSize="9" textAnchor="middle">
                  ⌀{inputs.lugHoleDiameterMm}
                </text>
                <text x="535" y="80" fill="#94a3b8" fontSize="9" textAnchor="middle">
                  R = {inputs.lugHoleRadiusMm} mm
                </text>
                <text x="535" y="225" fill="#e2e8f0" fontSize="9" textAnchor="middle">
                  Thickness t = {inputs.lugThicknessMm} mm
                </text>
                <text x="535" y="240" fill="#a5b4fc" fontSize="9" textAnchor="middle">
                  Shackle Pin: ⌀{selectedShackle.pinDiameterMm} mm
                </text>
              </svg>
            </div>
          </div>

          {/* Pad-Eye Detailed Verification Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setShowFormulaSteps(!showFormulaSteps)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Detailed Pad-Eye Structural Verifications (EN 1993-1-8 & EN 13155)
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
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 text-[13px]">
                    1. Hole Tear-Out / Shear Resistance (EN 1993-1-8 Table 3.9)
                  </div>
                  <div>V_tear,Rd = 2 × e_net × t × (f_y / √3) / γ_M0</div>
                  <div>
                    Capacity: <strong>{results.tearOutResistanceKn} kN</strong> | Applied: {results.appliedTensionPerPadEyeKn} kN
                  </div>
                  <div>
                    Utilization: <strong>{(results.tearOutUtilization * 100).toFixed(1)}% ({results.isTearOutPass ? 'OK' : 'FAIL'})</strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 text-[13px]">
                    2. Net Cross-Section Tension (EN 1993-1-8)
                  </div>
                  <div>N_net,Rd = (2 × R - d_h) × t × f_y / γ_M0</div>
                  <div>
                    Capacity: <strong>{results.netTensionResistanceKn} kN</strong> | Applied: {results.appliedTensionPerPadEyeKn} kN
                  </div>
                  <div>
                    Utilization: <strong>{(results.netTensionUtilization * 100).toFixed(1)}% ({results.isNetTensionPass ? 'OK' : 'FAIL'})</strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 text-[13px]">
                    3. Double Fillet Weld Stress with 5% Side-Load (EN 1993-1-8 Cl. 4.5.3)
                  </div>
                  <div>Von Mises throat stress = √[σ_⊥² + 3 × (τ_⊥² + τ_∥²)]</div>
                  <div>
                    Calculated Throat Stress: <strong>{results.weldStressMpa} MPa</strong> | Allowable f_w,Rd: {results.allowableWeldStressMpa} MPa
                  </div>
                  <div>
                    Utilization: <strong>{(results.weldUtilization * 100).toFixed(1)}% ({results.isWeldPass ? 'OK' : 'FAIL'})</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
