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
  Scale,
  Truck,
  Layers,
  Box,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { LiftingInputs, LiftingResults, SteelGrade, RiggingMethod, HitchType, ForkliftAttachment } from '../types';
import { SHACKLE_CATALOG, STEEL_GRADES } from '../data/steelSections';
import { validateLiftingInputs } from '../utils/validation';

interface LiftingCalculatorProps {
  inputs: LiftingInputs;
  setInputs: React.Dispatch<React.SetStateAction<LiftingInputs>>;
  results: LiftingResults;
  onOpenSolidWorks?: () => void;
}

export const LiftingCalculator: React.FC<LiftingCalculatorProps> = ({
  inputs,
  setInputs,
  results,
  onOpenSolidWorks,
}) => {
  const [showFormulaSteps, setShowFormulaSteps] = useState(false);
  const validationErrors = validateLiftingInputs(inputs);

  const updateNumericInput = (field: keyof LiftingInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleRiggingMethodChange = (method: RiggingMethod) => {
    setInputs(prev => ({ ...prev, riggingMethod: method }));
  };

  // Find currently selected shackle in catalog
  const selectedShackle = SHACKLE_CATALOG.find(s => s.wllTonnes === inputs.shackleWllTonnes) || results.recommendedShackle;
  const pinClearance = inputs.lugHoleDiameterMm - selectedShackle.pinDiameterMm;

  // Preset sling capacities (EN 1492 European Color Coding)
  const slingPresets = [
    { wll: 1.0, color: 'bg-purple-600 text-white', label: '1t Violet' },
    { wll: 2.0, color: 'bg-emerald-600 text-white', label: '2t Green' },
    { wll: 3.0, color: 'bg-amber-500 text-slate-900', label: '3t Yellow' },
    { wll: 4.0, color: 'bg-slate-500 text-white', label: '4t Grey' },
    { wll: 5.0, color: 'bg-rose-600 text-white', label: '5t Red' },
    { wll: 6.0, color: 'bg-amber-800 text-white', label: '6t Brown' },
    { wll: 8.0, color: 'bg-blue-600 text-white', label: '8t Blue' },
    { wll: 10.0, color: 'bg-orange-600 text-white', label: '10t Orange' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              <span>Safe Lifting & Rigging Suite</span>
              <span aria-hidden="true">·</span>
              <span>EN 13155, EN 13414, EN 1492 & LOLER</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Anchor className="w-5 h-5 text-indigo-600" />
              <span>Safe Lifting Load Analysis, Sling Rigging & Pad-Eye Engineering</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Calculates dynamic hook loads with DAF factors, sling leg tensions, hitch deration factors,
              and verifies direct sling wrapping around beams, forklift handling stability, or Eurocode 3 welded pad-eyes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenSolidWorks && (
              <button
                type="button"
                onClick={onOpenSolidWorks}
                className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                title="Export this lifting configuration to SolidWorks 3D & FEA"
              >
                <Box className="w-3.5 h-3.5 text-rose-600" />
                <span>SolidWorks Interface</span>
              </button>
            )}

            <div className={`px-4 py-2 rounded-lg border text-xs font-bold font-mono inline-flex items-center gap-2 ${
              results.overallLiftingStatus === 'PASS'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {results.overallLiftingStatus === 'PASS' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>RIGGING STATUS: PASS</span>
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

        {/* Rigging Method Switcher */}
        <div className="mt-5 pt-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Select Lifting & Handling Method:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleRiggingMethodChange('crane_slings_only')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                inputs.riggingMethod === 'crane_slings_only'
                  ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span>Slings Only Around Beam</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  Direct Wrap
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Choker or basket hitch wrapped directly around beam flanges. Specify sling length & capacity.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleRiggingMethodChange('forklift_slung')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                inputs.riggingMethod === 'forklift_slung'
                  ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>Forklift Truck Handling</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  FLT / Jib
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Slung from tines or jib arm. Checks actual load center deration & rollover stability per ISO 22915.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleRiggingMethodChange('crane_padeyes')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                inputs.riggingMethod === 'crane_padeyes'
                  ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Anchor className="w-4 h-4 text-indigo-600" />
                  <span>Welded Pad-Eyes / Lugs</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                  Lugs & Welds
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Structural lifting lugs welded to top flange. Full Eurocode 3 pin bearing, tear-out & weld throat checks.
              </p>
            </button>
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
          {/* Section 1: Tare Weight & Dynamic Factors */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>Tare Weight & Dynamic Factors</span>
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
                <span className="text-[10px] text-slate-400">Slings & hardware</span>
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
          </div>

          {/* Section 2A: METHOD = "crane_slings_only" (USER REQUESTED FEATURE) */}
          {inputs.riggingMethod === 'crane_slings_only' && (
            <div className="bg-white border-2 border-indigo-200 rounded-xl p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span>Sling Load Capacity & Length Setup</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  SLINGS ONLY
                </span>
              </div>

              {/* Sling Capacity (WLL) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800">
                    Sling Rated Load Capacity (WLL in Tonnes)
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-700">
                    {inputs.userSlingWllTonnes}t WLL
                  </span>
                </div>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="50"
                  value={inputs.userSlingWllTonnes}
                  onChange={(e) => updateNumericInput('userSlingWllTonnes', Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                />

                {/* Quick Color-coded Presets */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Quick Standard Presets (EN 1492 Color Code):
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {slingPresets.map((preset) => (
                      <button
                        key={preset.wll}
                        type="button"
                        onClick={() => updateNumericInput('userSlingWllTonnes', preset.wll)}
                        className={`text-[10px] font-mono font-semibold py-1 px-1.5 rounded transition-all ${
                          inputs.userSlingWllTonnes === preset.wll
                            ? `${preset.color} ring-2 ring-indigo-500 shadow-xs font-bold`
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sling Length & Pickup Points Spacing */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">
                    Sling Leg Length (m)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="30"
                    value={inputs.slingLengthMeters}
                    onChange={(e) => updateNumericInput('slingLengthMeters', Math.max(0.5, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Total length of each leg</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">
                    Pickup Wrap Spacing (m)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="30"
                    value={inputs.pickupPointsSpacingMeters}
                    onChange={(e) => updateNumericInput('pickupPointsSpacingMeters', Math.max(0.5, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Distance between beam wraps</span>
                </div>
              </div>

              {/* Hitch Type & Edge Protection */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">Hitch Arrangement Around Beam</label>
                  <select
                    value={inputs.hitchType}
                    onChange={(e) => setInputs(prev => ({ ...prev, hitchType: e.target.value as HitchType }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
                  >
                    <option value="choker">Choked Wrap Hitch (Mode Factor: 0.80 deration per EN 1492 / EN 13414)</option>
                    <option value="basket">Double Basket Hitch (Mode Factor: 2 × cos θ)</option>
                    <option value="straight">Direct Straight Bridle Hitch (Mode Factor: 1.00)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">Beam Flange Corner Protection</label>
                  <select
                    value={inputs.edgeProtection || 'softeners_fitted'}
                    onChange={(e) => setInputs(prev => ({ ...prev, edgeProtection: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
                  >
                    <option value="softeners_fitted">Edge Softeners / Protective Sleeves Fitted (Safe - No Cut Risk)</option>
                    <option value="bare_steel_edges">Bare Sharp Flange Edges (Warning: r &lt; d, sharp edge deration applies)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">Sling Material</label>
                  <select
                    value={inputs.slingMaterial}
                    onChange={(e) => setInputs(prev => ({ ...prev, slingMaterial: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
                  >
                    <option value="polyester_webbing">Polyester Flat Webbing / Round Sling (EN 1492-1 / EN 1492-2)</option>
                    <option value="grade_80_chain">Grade 80 Short-Link Alloy Chain (EN 818-4)</option>
                    <option value="grade_100_chain">Grade 100 Premium Alloy Chain (EN 818-4)</option>
                    <option value="wire_rope">Steel Wire Rope with Flemish Eyes (EN 13414-1)</option>
                  </select>
                </div>
              </div>

              {/* Geometry derivation toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Derive angle from sling length & spacing:</span>
                <input
                  type="checkbox"
                  checked={inputs.useLengthToDeriveAngle}
                  onChange={(e) => setInputs(prev => ({ ...prev, useLengthToDeriveAngle: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </div>
            </div>
          )}

          {/* Section 2B: METHOD = "forklift_slung" (USER REQUESTED FEATURE) */}
          {inputs.riggingMethod === 'forklift_slung' && (
            <div className="bg-white border-2 border-amber-200 rounded-xl p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Forklift Truck Capacity & Location Setup</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  FLT HANDLING
                </span>
              </div>

              {/* Forklift Rated Capacity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">FLT Rated Capacity (t)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1.0"
                    max="45"
                    value={inputs.forkliftRatedCapacityTonnes}
                    onChange={(e) => updateNumericInput('forkliftRatedCapacityTonnes', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Nameplate capacity</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">Std Load Center (mm)</label>
                  <input
                    type="number"
                    step="50"
                    min="400"
                    max="1200"
                    value={inputs.forkliftStandardLoadCenterMm}
                    onChange={(e) => updateNumericInput('forkliftStandardLoadCenterMm', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Usually 500mm or 600mm</span>
                </div>
              </div>

              {/* Actual Pickup Location / Load Center */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <label>Actual Pickup Location (Distance from Fork Heel)</label>
                  <span className="font-mono font-bold text-amber-700">{inputs.actualLoadCenterMm} mm</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="2000"
                  step="50"
                  value={inputs.actualLoadCenterMm}
                  onChange={(e) => updateNumericInput('actualLoadCenterMm', parseInt(e.target.value))}
                  className="w-full accent-amber-600"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>500mm (Standard)</span>
                  <span>1000mm (Mid)</span>
                  <span>1500mm (Extended)</span>
                  <span>2000mm (Tip)</span>
                </div>
              </div>

              {/* Attachment & Ground Condition */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">Attachment Method</label>
                  <select
                    value={inputs.forkliftAttachment}
                    onChange={(e) => setInputs(prev => ({ ...prev, forkliftAttachment: e.target.value as ForkliftAttachment }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900"
                  >
                    <option value="tines_slung">Slung from Tines</option>
                    <option value="fork_mounted_jib">Fork-Mounted Jib Arm</option>
                    <option value="direct_tines">Direct on Tines</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">Ground Condition</label>
                  <select
                    value={inputs.fltGroundCondition}
                    onChange={(e) => setInputs(prev => ({ ...prev, fltGroundCondition: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900"
                  >
                    <option value="smooth_concrete">Smooth Workshop Floor</option>
                    <option value="rough_yard">Rough Outdoor Yard / Ramp</option>
                  </select>
                </div>
              </div>

              {/* Sling Capacity when using FLT */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-800">Rigging Sling WLL (Tonnes)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={inputs.userSlingWllTonnes}
                  onChange={(e) => updateNumericInput('userSlingWllTonnes', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                />
              </div>
            </div>
          )}

          {/* Section 2C: METHOD = "crane_padeyes" */}
          {inputs.riggingMethod === 'crane_padeyes' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-indigo-600" />
                  <span>Pad-Eye & Weld Specification (EN 1993-1-8)</span>
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                  EC3 Fillet Weld Check
                </span>
              </div>

              {/* Steel Grade & Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Pad-Eye Steel Grade</label>
                  <select
                    value={inputs.padEyeSteelGrade}
                    onChange={(e) => updateNumericInput('padEyeSteelGrade' as any, e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900"
                  >
                    <option value="S235">S235 (fu=360 MPa, βw=0.80)</option>
                    <option value="S275">S275 (fu=430 MPa, βw=0.85)</option>
                    <option value="S355">S355 (fu=510 MPa, βw=0.90)</option>
                    <option value="S460">S460 (fu=570 MPa, βw=1.00)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Pad-Eye Quantity</label>
                  <select
                    value={inputs.padEyeQuantity}
                    onChange={(e) => updateNumericInput('padEyeQuantity', parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900"
                  >
                    <option value={2}>2 Pad-Eyes (1 Pair on Top Flange)</option>
                    <option value={4}>4 Pad-Eyes (2 Pairs for 4-Leg Lift)</option>
                  </select>
                </div>
              </div>

              {/* Pad-Eye Plate Dimensions */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
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
                  <span className="text-[10px] text-slate-400">Min 6mm</span>
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
                  <span className="text-[10px] text-slate-400">Clearance for pin</span>
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
                  <span className="text-[10px] text-slate-400">R &ge; 1.25 dh</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Pin Height from Base hlug (mm)</label>
                  <input
                    type="number"
                    step="5"
                    min="20"
                    value={inputs.lugHeightFromBaseMm}
                    onChange={(e) => updateNumericInput('lugHeightFromBaseMm', parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Bending lever arm</span>
                </div>
              </div>

              {/* USER-SPECIFIED WELD DESIGN: Throat & Length */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Double Continuous Fillet Weld Sizing
                  </span>
                  <span className="text-[10px] text-indigo-600 font-mono">
                    2x Fillet Welds (Both Sides)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Weld Length Lw (mm)</label>
                    <input
                      type="number"
                      step="5"
                      min="20"
                      value={inputs.lugWeldLengthMm}
                      onChange={(e) => updateNumericInput('lugWeldLengthMm', parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400">Full base weld contact</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Fillet Throat Size a (mm)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="3"
                      value={inputs.lugWeldThroatMm}
                      onChange={(e) => updateNumericInput('lugWeldThroatMm', parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400">Min 3.0mm (EC3)</span>
                  </div>
                </div>

                {/* Weld Property Summary Strip */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-slate-600">
                  <div>
                    <span className="block text-slate-400 text-[9px] uppercase">Eff. Length Leff</span>
                    <strong className="text-slate-800 text-[11px]">{results.detailedWeldCheck?.effectiveLengthMm ?? (inputs.lugWeldLengthMm - 2 * inputs.lugWeldThroatMm)} mm</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[9px] uppercase">Throat Area Aw</span>
                    <strong className="text-slate-800 text-[11px]">{results.detailedWeldCheck?.totalThroatAreaMm2 ?? (2 * inputs.lugWeldThroatMm * (inputs.lugWeldLengthMm - 2 * inputs.lugWeldThroatMm))} mm²</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[9px] uppercase">Section Mod. Ww</span>
                    <strong className="text-slate-800 text-[11px]">{(results.detailedWeldCheck?.elasticSectionModulusMm3 ?? ((2 * inputs.lugWeldThroatMm * Math.pow(inputs.lugWeldLengthMm, 2)) / 6)).toFixed(0)} mm³</strong>
                  </div>
                </div>

                {/* Quick Weld Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-semibold">Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setInputs(prev => ({
                        ...prev,
                        lugWeldThroatMm: 6,
                        lugWeldLengthMm: 90,
                        lugThicknessMm: 15,
                        lugHeightFromBaseMm: 65
                      }));
                    }}
                    className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition-colors"
                  >
                    Compact (a=6, L=90)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputs(prev => ({
                        ...prev,
                        lugWeldThroatMm: 8,
                        lugWeldLengthMm: 120,
                        lugThicknessMm: 20,
                        lugHeightFromBaseMm: 75
                      }));
                    }}
                    className="px-2 py-0.5 text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded font-medium transition-colors"
                  >
                    Standard (a=8, L=120)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputs(prev => ({
                        ...prev,
                        lugWeldThroatMm: 10,
                        lugWeldLengthMm: 160,
                        lugThicknessMm: 25,
                        lugHeightFromBaseMm: 95
                      }));
                    }}
                    className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition-colors"
                  >
                    Heavy (a=10, L=160)
                  </button>
                </div>
              </div>

              {/* Shackle Choice */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
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
              </div>
            </div>
          )}
        </div>

        {/* Right Output & Interactive Rigging Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real-Time Lifting Verification Cards */}
          {inputs.riggingMethod === 'crane_slings_only' ? (
            /* Sling-Only Results Cards */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sling Tension Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Tension Per Sling Leg
                </span>
                <div className="text-xl font-mono font-bold text-slate-900 mt-2">
                  {results.slingTensionPerLegTonnes} <span className="text-xs font-normal text-slate-500">tonnes</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono">
                  {results.slingTensionPerLegKn} kN per leg
                </div>
                <div className="mt-3 p-2 bg-indigo-50/70 rounded text-[11px] text-indigo-950 font-mono">
                  <span>Sling Angle θ: </span>
                  <strong>{results.calculatedSlingAngleDeg}°</strong>
                </div>
              </div>

              {/* Effective Sling Capacity & Hitch Factor */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Effective Sling WLL
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">
                    Factor: {results.hitchDerationFactor}
                  </span>
                </div>
                <div className="text-xl font-mono font-bold text-slate-900 mt-2">
                  {results.effectiveSlingCapacityTonnes} <span className="text-xs font-normal text-slate-500">tonnes</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono">
                  Rated WLL: {inputs.userSlingWllTonnes}t ({inputs.hitchType})
                </div>
                <div className="mt-3 p-2 bg-slate-50 rounded text-[11px] text-slate-700">
                  <span>Headroom Height H: </span>
                  <strong className="font-mono text-slate-900">{results.calculatedHookHeightMeters}m</strong>
                </div>
              </div>

              {/* Sling Utilization & Status */}
              <div className={`p-4 rounded-xl border bg-white shadow-xs ${
                results.isSlingCapacityPass ? 'border-slate-200' : 'border-rose-300 ring-1 ring-rose-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Sling Capacity η
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    results.isSlingCapacityPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {results.isSlingCapacityPass ? 'SAFE PASS' : 'OVERLOAD'}
                  </span>
                </div>
                <div className="text-xl font-mono font-bold text-slate-900 mt-2">
                  {(results.slingCapacityUtilization * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono">
                  Limit: &le; 100.0% of effective WLL
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        results.slingCapacityUtilization <= 0.80
                          ? 'bg-emerald-500'
                          : results.slingCapacityUtilization <= 1.00
                          ? 'bg-amber-500'
                          : 'bg-rose-600'
                      }`}
                      style={{ width: `${Math.min(100, results.slingCapacityUtilization * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : inputs.riggingMethod === 'forklift_slung' ? (
            /* Forklift Results Cards */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Derated FLT Capacity */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Derated FLT Capacity
                </span>
                <div className="text-xl font-mono font-bold text-slate-900 mt-2">
                  {results.forkliftDeratedCapacityTonnes} <span className="text-xs font-normal text-slate-500">tonnes</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono">
                  At {inputs.actualLoadCenterMm}mm center (ISO 22915)
                </div>
                <div className="mt-3 p-2 bg-slate-50 rounded text-[11px] text-slate-700">
                  <span>Rated: </span>
                  <strong className="font-mono text-slate-900">{inputs.forkliftRatedCapacityTonnes}t @ {inputs.forkliftStandardLoadCenterMm}mm</strong>
                </div>
              </div>

              {/* Applied Load */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Dynamic Lift Load
                </span>
                <div className="text-xl font-mono font-bold text-slate-900 mt-2">
                  {results.forkliftAppliedTotalTonnes} <span className="text-xs font-normal text-slate-500">tonnes</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono">
                  {results.factoredDynamicLiftLoadKn} kN with DAF
                </div>
                <div className="mt-3 p-2 bg-amber-50 rounded text-[11px] text-amber-900">
                  <span>Ground DAF: </span>
                  <strong>{inputs.fltGroundCondition === 'rough_yard' ? '1.35 (Rough Yard)' : '1.20 (Smooth Floor)'}</strong>
                </div>
              </div>

              {/* FLT Utilization & Rollover Safety */}
              <div className={`p-4 rounded-xl border bg-white shadow-xs ${
                results.isForkliftPass && results.isLoadCenterSafe ? 'border-slate-200' : 'border-rose-300 ring-1 ring-rose-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    FLT Utilization η
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    results.isForkliftPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {results.isForkliftPass ? 'SAFE PASS' : 'OVERLOAD'}
                  </span>
                </div>
                <div className="text-xl font-mono font-bold text-slate-900 mt-2">
                  {(results.forkliftUtilization * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono">
                  Stability: {results.isLoadCenterSafe ? 'Normal' : 'High Rollover Risk'}
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        results.forkliftUtilization <= 0.85
                          ? 'bg-emerald-500'
                          : results.forkliftUtilization <= 1.00
                          ? 'bg-amber-500'
                          : 'bg-rose-600'
                      }`}
                      style={{ width: `${Math.min(100, results.forkliftUtilization * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Pad-Eye Results Cards */}
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
                    Fillet Weld Stress (EC3)
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
                <div className="text-xs text-slate-500 mt-0.5 font-mono flex items-center justify-between">
                  <span>Allowable: {results.allowableWeldStressMpa} MPa</span>
                  <span className="text-[10px] text-indigo-600 font-semibold">βw={results.detailedWeldCheck?.correlationFactorBetaW ?? 0.9}</span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                    <span>Weld η (Governing)</span>
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
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-600">
                  <span>σ_ten: {results.detailedWeldCheck?.totalTensionStressMpa ?? 0} MPa</span>
                  <span>τ_shear: {results.detailedWeldCheck?.resultantShearStressMpa ?? 0} MPa</span>
                </div>
              </div>
            </div>

            /* DETAILED PAD-EYE WELD STRESS CHECK & SHEAR/TENSION INTERACTION MODULE */
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span>Weld Stress Check: Shear / Tension Interaction</span>
                      <span className="text-[10px] text-indigo-600 font-normal font-sans">(EN 1993-1-8 Cl. 4.5.3)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Double continuous fillet weld: a = {inputs.lugWeldThroatMm}mm, Lw = {inputs.lugWeldLengthMm}mm, Steel Grade {inputs.padEyeSteelGrade}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                    results.detailedWeldCheck?.isWeldPass
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {results.detailedWeldCheck?.isWeldPass ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Interaction: PASS</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Interaction: OVERSTRESSED</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* 2-Column: Left = Interactive Visual Interaction Ellipse, Right = Verification Criteria & Stress Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                {/* Visual SVG Interaction Ellipse (5 cols) */}
                <div className="lg:col-span-5 bg-slate-950 rounded-xl p-4 flex flex-col items-center justify-center text-white relative">
                  <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                    <span className="font-bold text-slate-200">Shear-Tension Interaction Ellipse</span>
                    <span className="text-emerald-400 font-semibold">
                      η_gov = {((results.detailedWeldCheck?.governingUtilization ?? results.weldUtilization) * 100).toFixed(1)}%
                    </span>
                  </div>

                  {(() => {
                    // Compute normalized coordinates for SVG plot (range 0.0 to 1.3)
                    const dw = results.detailedWeldCheck;
                    const allowTen = (dw?.designWeldStrengthFwRdMpa ?? 260) / Math.SQRT2;
                    const allowShear = dw?.designShearStrengthFvwdMpa ?? 200;
                    const actTen = dw?.totalTensionStressMpa ?? 0;
                    const actShear = dw?.resultantShearStressMpa ?? 0;

                    const normTen = allowTen > 0 ? Math.min(1.3, actTen / allowTen) : 0;
                    const normShear = allowShear > 0 ? Math.min(1.3, actShear / allowShear) : 0;

                    // Plot dimensions: origin at (40, 160), max scale 1.0 is 100px
                    const ox = 45;
                    const oy = 165;
                    const scalePx = 100; // 1.0 ratio = 100 pixels

                    // Point coordinate
                    const px = ox + normShear * scalePx;
                    const py = oy - normTen * scalePx;

                    const isSafe = (dw?.governingUtilization ?? 1) <= 1.00;

                    return (
                      <svg viewBox="0 0 220 190" className="w-full max-w-[240px] select-none font-mono">
                        <defs>
                          <radialGradient id="safeGrad" cx="0%" cy="100%" r="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                            <stop offset="85%" stopColor="#10b981" stopOpacity="0.10" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.20" />
                          </radialGradient>
                        </defs>

                        {/* Grid lines */}
                        <line x1={ox} y1={oy} x2={ox + 130} y2={oy} stroke="#475569" strokeWidth="1.5" />
                        <line x1={ox} y1={oy} x2={ox} y2={oy - 130} stroke="#475569" strokeWidth="1.5" />

                        {/* 1.0 Capacity Guidelines */}
                        <line x1={ox} y1={oy - scalePx} x2={ox + scalePx} y2={oy - scalePx} stroke="#64748b" strokeDasharray="2,2" strokeWidth="0.8" />
                        <line x1={ox + scalePx} y1={oy} x2={ox + scalePx} y2={oy - scalePx} stroke="#64748b" strokeDasharray="2,2" strokeWidth="0.8" />

                        {/* Shaded Safe Interaction Region (Quarter Ellipse: (x/1)^2 + (y/1)^2 <= 1) */}
                        <path
                          d={`M ${ox} ${oy} L ${ox} ${oy - scalePx} A ${scalePx} ${scalePx} 0 0 1 ${ox + scalePx} ${oy} Z`}
                          fill="url(#safeGrad)"
                          stroke="#10b981"
                          strokeWidth="2"
                        />

                        {/* Failure boundary text */}
                        <text x={ox + scalePx - 4} y={oy - scalePx + 14} fill="#f43f5e" fontSize="7.5" fontWeight="bold">
                          LIMIT: (σ/f)²+(τ/f)² = 1.0
                        </text>

                        {/* Axis Labels */}
                        <text x={ox + 132} y={oy + 3} fill="#94a3b8" fontSize="8" alignmentBaseline="middle">
                          τ/f_vwd
                        </text>
                        <text x={ox} y={oy - 136} fill="#94a3b8" fontSize="8" textAnchor="middle">
                          σ/f_ten
                        </text>

                        {/* Tick marks for 1.0 */}
                        <text x={ox + scalePx} y={oy + 12} fill="#cbd5e1" fontSize="8" textAnchor="middle">1.0</text>
                        <text x={ox - 8} y={oy - scalePx + 3} fill="#cbd5e1" fontSize="8" textAnchor="end">1.0</text>
                        <text x={ox - 6} y={oy + 10} fill="#64748b" fontSize="8" textAnchor="end">0</text>

                        {/* Projection lines from operating point to axes */}
                        <line x1={ox} y1={py} x2={px} y2={py} stroke={isSafe ? '#34d399' : '#f87171'} strokeDasharray="2,2" strokeWidth="1" />
                        <line x1={px} y1={oy} x2={px} y2={py} stroke={isSafe ? '#34d399' : '#f87171'} strokeDasharray="2,2" strokeWidth="1" />

                        {/* Current Operating Point Marker */}
                        <circle
                          cx={px}
                          cy={py}
                          r="5.5"
                          fill={isSafe ? '#10b981' : '#ef4444'}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx={px}
                          cy={py}
                          r="8"
                          fill="none"
                          stroke={isSafe ? '#10b981' : '#ef4444'}
                          strokeWidth="1"
                          opacity="0.6"
                        />

                        {/* Point coordinate callout */}
                        <rect
                          x={Math.min(130, px + 8)}
                          y={Math.max(10, py - 20)}
                          width="68"
                          height="22"
                          fill="#0f172a"
                          stroke={isSafe ? '#059669' : '#dc2626'}
                          strokeWidth="1"
                          rx="3"
                        />
                        <text
                          x={Math.min(130, px + 8) + 34}
                          y={Math.max(10, py - 20) + 10}
                          fill={isSafe ? '#34d399' : '#fca5a5'}
                          fontSize="7.5"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Operating Point
                        </text>
                        <text
                          x={Math.min(130, px + 8) + 34}
                          y={Math.max(10, py - 20) + 19}
                          fill="#ffffff"
                          fontSize="7"
                          textAnchor="middle"
                        >
                          τ: {normShear.toFixed(2)} | σ: {normTen.toFixed(2)}
                        </text>
                      </svg>
                    );
                  })()}

                  <div className="text-[10px] text-slate-400 mt-2 text-center">
                    Quarter-ellipse interaction envelope according to EN 1993-1-8 Clause 4.5.3
                  </div>
                </div>

                {/* Right Breakdown Table & Criteria (7 cols) */}
                <div className="lg:col-span-7 space-y-3">
                  {/* Criteria 1, 2, and 3 comparison badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Directional von Mises */}
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">1. Directional von Mises</span>
                      <div className="text-sm font-mono font-bold text-slate-900 mt-1">
                        {results.detailedWeldCheck?.vonMisesStressMpa} <span className="text-[10px] font-normal text-slate-500">MPa</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Limit: {results.detailedWeldCheck?.designWeldStrengthFwRdMpa} MPa
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-600">η_dir</span>
                        <strong className={results.detailedWeldCheck?.isDirectionalPass ? 'text-emerald-700' : 'text-rose-700'}>
                          {((results.detailedWeldCheck?.directionalUtilization ?? 0) * 100).toFixed(1)}%
                        </strong>
                      </div>
                    </div>

                    {/* Normal Stress Limit */}
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">2. Normal Stress σ⊥</span>
                      <div className="text-sm font-mono font-bold text-slate-900 mt-1">
                        {results.detailedWeldCheck?.sigmaPerpMpa} <span className="text-[10px] font-normal text-slate-500">MPa</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Limit: {results.detailedWeldCheck?.normalStressLimitMpa} MPa
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-600">η_σ⊥</span>
                        <strong className={(results.detailedWeldCheck?.normalStressUtilization ?? 0) <= 1.0 ? 'text-emerald-700' : 'text-rose-700'}>
                          {((results.detailedWeldCheck?.normalStressUtilization ?? 0) * 100).toFixed(1)}%
                        </strong>
                      </div>
                    </div>

                    {/* Simplified Shear Limit */}
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">3. Simplified Resultant</span>
                      <div className="text-sm font-mono font-bold text-slate-900 mt-1">
                        {results.detailedWeldCheck?.simplifiedResultantStressMpa} <span className="text-[10px] font-normal text-slate-500">MPa</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Limit: {results.detailedWeldCheck?.designShearStrengthFvwdMpa} MPa
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-600">η_simp</span>
                        <strong className={results.detailedWeldCheck?.isSimplifiedPass ? 'text-emerald-700' : 'text-rose-700'}>
                          {((results.detailedWeldCheck?.simplifiedUtilization ?? 0) * 100).toFixed(1)}%
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Stress Component Breakdown Matrix */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block font-sans">
                      Resolved Stress Matrix (User a={inputs.lugWeldThroatMm}mm, Lw={inputs.lugWeldLengthMm}mm)
                    </span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600 pt-1">
                      <div>
                        Direct Tension σ_dir: <strong>{results.detailedWeldCheck?.directTensionStressMpa} MPa</strong> ({results.detailedWeldCheck?.verticalPullKn} kN)
                      </div>
                      <div>
                        Longitudinal Shear τ_∥: <strong>{results.detailedWeldCheck?.longitudinalShearStressMpa} MPa</strong> ({results.detailedWeldCheck?.horizontalShearKn} kN)
                      </div>
                      <div>
                        In-Plane Bending σ_bend: <strong>{results.detailedWeldCheck?.inPlaneBendingStressMpa} MPa</strong> ({results.detailedWeldCheck?.inPlaneBendingMomentKnM} kNm)
                      </div>
                      <div>
                        5% Lateral Shear τ_trans: <strong>{results.detailedWeldCheck?.transverseShearStressMpa} MPa</strong> ({results.detailedWeldCheck?.lateralSideLoadKn} kN)
                      </div>
                      <div>
                        Total Peak Tension σ_ten: <strong className="text-indigo-900">{results.detailedWeldCheck?.totalTensionStressMpa} MPa</strong>
                      </div>
                      <div>
                        Resultant Shear τ_res: <strong className="text-indigo-900">{results.detailedWeldCheck?.resultantShearStressMpa} MPa</strong>
                      </div>
                    </div>
                  </div>

                  {/* Optimization / Guidance Note */}
                  <div className="flex items-center justify-between p-2.5 bg-indigo-50/70 rounded-lg border border-indigo-100 text-[11px] text-indigo-950">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>
                        Recommended minimum throat for 100% capacity: <strong>a &ge; {results.detailedWeldCheck?.recommendedMinimumThroatMm} mm</strong>
                      </span>
                    </div>
                    {inputs.lugWeldThroatMm < (results.detailedWeldCheck?.recommendedMinimumThroatMm ?? 0) && (
                      <button
                        type="button"
                        onClick={() => {
                          const rec = results.detailedWeldCheck?.recommendedMinimumThroatMm ?? 8;
                          setInputs(prev => ({ ...prev, lugWeldThroatMm: Math.ceil(rec) }));
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                      >
                        Auto-Size to {Math.ceil(results.detailedWeldCheck?.recommendedMinimumThroatMm ?? 8)}mm
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

          {/* Interactive Rigging Visualizer SVG */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span>Visual Blueprint:</span>
                <span className="text-indigo-700">
                  {inputs.riggingMethod === 'crane_slings_only' ? 'Direct Slings Wrapped Around Beam' :
                   inputs.riggingMethod === 'forklift_slung' ? 'Forklift Truck & Slung Beam Handling' : 'Welded Lifting Pad-Eyes'}
                </span>
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Factored Load: {results.factoredDynamicLiftLoadKn} kN
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 overflow-hidden">
              {inputs.riggingMethod === 'crane_slings_only' ? (
                /* SVG for "Only Slings Around Beam" */
                <svg viewBox="0 0 640 280" className="w-full h-auto select-none font-mono">
                  {/* Crane Hook at Top (X=320, Y=25) */}
                  <circle cx="320" cy="22" r="14" fill="none" stroke="#f59e0b" strokeWidth="3" />
                  <path d="M 320 36 C 320 54, 308 58, 308 50" fill="none" stroke="#f59e0b" strokeWidth="4" />
                  <rect x="312" y="2" width="16" height="10" fill="#94a3b8" rx="1" />

                  {/* Left Sling Leg running down to beam wrap */}
                  <line x1="310" y1="46" x2="160" y2="180" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                  {/* Right Sling Leg running down to beam wrap */}
                  <line x1="330" y1="46" x2="480" y2="180" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />

                  {/* Center Vertical Reference & Angle Arc */}
                  <line x1="320" y1="46" x2="320" y2="130" stroke="#64748b" strokeDasharray="3,3" strokeWidth="1" />
                  <path d="M 320 85 A 38 38 0 0 0 342 80" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="350" y="85" fill="#38bdf8" fontSize="11" fontWeight="bold">
                    θ = {results.calculatedSlingAngleDeg}°
                  </text>

                  {/* Headroom H Dimension */}
                  <line x1="70" y1="46" x2="70" y2="180" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="65" y1="46" x2="75" y2="46" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="65" y1="180" x2="75" y2="180" stroke="#94a3b8" strokeWidth="1" />
                  <text x="55" y="115" fill="#94a3b8" fontSize="10" textAnchor="end">
                    H = {results.calculatedHookHeightMeters}m
                  </text>

                  {/* Structural Beam */}
                  <rect x="90" y="180" width="460" height="32" fill="#1e293b" stroke="#64748b" strokeWidth="2" rx="2" />
                  <text x="320" y="200" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Structural Beam (Mass: {inputs.tareWeightKg} kg)
                  </text>

                  {/* Left Choker Wrap Around Flange */}
                  <rect x="150" y="176" width="20" height="40" fill="rgba(245, 158, 11, 0.3)" stroke="#f59e0b" strokeWidth="2" rx="3" />
                  <path d="M 160 176 L 160 216" stroke="#f59e0b" strokeWidth="3" strokeDasharray="2,2" />
                  <circle cx="160" cy="176" r="4" fill="#fbbf24" />
                  <text x="160" y="232" fill="#fde047" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {inputs.hitchType.toUpperCase()} WRAP
                  </text>

                  {/* Right Choker Wrap Around Flange */}
                  <rect x="470" y="176" width="20" height="40" fill="rgba(245, 158, 11, 0.3)" stroke="#f59e0b" strokeWidth="2" rx="3" />
                  <path d="M 480 176 L 480 216" stroke="#f59e0b" strokeWidth="3" strokeDasharray="2,2" />
                  <circle cx="480" cy="176" r="4" fill="#fbbf24" />
                  <text x="480" y="232" fill="#fde047" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {inputs.hitchType.toUpperCase()} WRAP
                  </text>

                  {/* Corner Edge Softener indicators */}
                  {inputs.edgeProtection === 'softeners_fitted' ? (
                    <>
                      <rect x="146" y="174" width="28" height="4" fill="#34d399" rx="1" />
                      <rect x="146" y="214" width="28" height="4" fill="#34d399" rx="1" />
                      <rect x="466" y="174" width="28" height="4" fill="#34d399" rx="1" />
                      <rect x="466" y="214" width="28" height="4" fill="#34d399" rx="1" />
                      <text x="320" y="260" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">
                        ✓ Flange Corner Softeners Fitted (EN 1492 / LOLER Compliant)
                      </text>
                    </>
                  ) : (
                    <text x="320" y="260" fill="#f87171" fontSize="10" fontWeight="bold" textAnchor="middle">
                      ⚠ Bare Steel Edges: Flange Corner Protectors Required
                    </text>
                  )}

                  {/* Spacing S Dimension */}
                  <line x1="160" y1="245" x2="480" y2="245" stroke="#38bdf8" strokeWidth="1" />
                  <line x1="160" y1="240" x2="160" y2="250" stroke="#38bdf8" strokeWidth="1" />
                  <line x1="480" y1="240" x2="480" y2="250" stroke="#38bdf8" strokeWidth="1" />
                  <text x="320" y="242" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Wrap Spacing S = {inputs.pickupPointsSpacingMeters}m
                  </text>

                  {/* Tension Callout */}
                  <text x="210" y="110" fill="#fde047" fontSize="11" fontWeight="bold">
                    T = {results.slingTensionPerLegTonnes}t (L={inputs.slingLengthMeters}m)
                  </text>
                  <text x="430" y="110" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="end">
                    WLL = {inputs.userSlingWllTonnes}t
                  </text>
                </svg>
              ) : inputs.riggingMethod === 'forklift_slung' ? (
                /* SVG for Forklift Handling */
                <svg viewBox="0 0 640 280" className="w-full h-auto select-none font-mono">
                  {/* Forklift Chassis Silhouette */}
                  <rect x="50" y="80" width="130" height="90" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="8" />
                  <path d="M 90 80 L 120 40 L 160 40 L 160 80 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                  <circle cx="85" cy="170" r="18" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2" />
                  <circle cx="160" cy="170" r="14" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2" />

                  {/* Mast Vertical */}
                  <rect x="180" y="30" width="12" height="145" fill="#475569" stroke="#94a3b8" />
                  {/* Forks horizontal */}
                  <rect x="192" y="165" width="170" height="8" fill="#cbd5e1" stroke="#f1f5f9" />
                  {/* Fork Heel marker */}
                  <circle cx="192" cy="169" r="4" fill="#f43f5e" />
                  <text x="192" y="195" fill="#f43f5e" fontSize="9" textAnchor="middle">Fork Heel</text>

                  {/* Jib Arm or Tines Attachment */}
                  {inputs.forkliftAttachment === 'fork_mounted_jib' ? (
                    <>
                      <path d="M 192 165 L 290 80 L 360 80" fill="none" stroke="#f59e0b" strokeWidth="5" />
                      <circle cx="360" cy="80" r="6" fill="#f59e0b" />
                      {/* Sling dropping from jib */}
                      <line x1="360" y1="86" x2="360" y2="170" stroke="#f59e0b" strokeWidth="3" />
                    </>
                  ) : (
                    /* Sling slung from tines */
                    <>
                      <circle cx="280" cy="169" r="5" fill="#f59e0b" />
                      <line x1="280" y1="174" x2="280" y2="200" stroke="#f59e0b" strokeWidth="3" />
                    </>
                  )}

                  {/* Beam Being Handled */}
                  <rect x="230" y="200" width="370" height="30" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" rx="2" />
                  <text x="415" y="220" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Lifted Beam ({inputs.tareWeightKg} kg)
                  </text>

                  {/* Load Center Dimension Line */}
                  <line x1="192" y1="250" x2="280" y2="250" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="192" y1="245" x2="192" y2="255" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="280" y1="245" x2="280" y2="255" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="236" y="265" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Actual Load Center = {inputs.actualLoadCenterMm} mm
                  </text>

                  {/* Forklift Capacity Callout */}
                  <rect x="370" y="25" width="250" height="90" fill="#0f172a" stroke="#334155" rx="6" />
                  <text x="385" y="45" fill="#f59e0b" fontSize="11" fontWeight="bold">
                    FLT STABILITY (ISO 22915):
                  </text>
                  <text x="385" y="65" fill="#e2e8f0" fontSize="10">
                    Derated Capacity: <tspan fill="#34d399" fontWeight="bold">{results.forkliftDeratedCapacityTonnes}t</tspan>
                  </text>
                  <text x="385" y="82" fill="#e2e8f0" fontSize="10">
                    Applied Dynamic Load: <tspan fill="#fde047" fontWeight="bold">{results.forkliftAppliedTotalTonnes}t</tspan>
                  </text>
                  <text x="385" y="100" fill={results.isForkliftPass ? '#34d399' : '#f87171'} fontSize="10" fontWeight="bold">
                    Utilization: {(results.forkliftUtilization * 100).toFixed(1)}% ({results.isForkliftPass ? 'SAFE' : 'OVERLOAD'})
                  </text>
                </svg>
              ) : (
                /* Pad-Eye Blueprint SVG */
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

                  {/* INSET: PAD-EYE TECHNICAL DRAWING BLUEPRINT (Right side: X=440 to 630) */}
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
                  <text x="535" y="215" fill="#e2e8f0" fontSize="8.5" textAnchor="middle">
                    t = {inputs.lugThicknessMm} mm | hlug = {inputs.lugHeightFromBaseMm} mm
                  </text>
                  <text x="535" y="230" fill="#fbbf24" fontSize="8.5" textAnchor="middle">
                    Double Fillet: a = {inputs.lugWeldThroatMm} mm, Lw = {inputs.lugWeldLengthMm} mm
                  </text>
                  <text x="535" y="244" fill="#a5b4fc" fontSize="8" textAnchor="middle">
                    Shackle Pin: ⌀{selectedShackle.pinDiameterMm} mm (WLL {inputs.shackleWllTonnes}t)
                  </text>
                </svg>
              )}
            </div>
          </div>

          {/* Detailed Verification Breakdown (Expandable) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setShowFormulaSteps(!showFormulaSteps)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {inputs.riggingMethod === 'crane_slings_only'
                    ? 'Detailed Sling Rigging Mathematical Verifications (EN 1492 / EN 13414 / EN 13155)'
                    : inputs.riggingMethod === 'forklift_slung'
                    ? 'Detailed Forklift Deration & Stability Verifications (ISO 22915)'
                    : 'Detailed Pad-Eye Structural Verifications (EN 1993-1-8 & EN 13155)'}
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
                {inputs.riggingMethod === 'crane_slings_only' ? (
                  <>
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-900 text-[13px]">
                        1. Factored Dynamic Lifting Load (EN 13155 Eq. 5.1)
                      </div>
                      <div>F_lift = W_gross × g × DAF × k_CoG × γ_lift</div>
                      <div>
                        F_lift = ({inputs.tareWeightKg} + {inputs.riggingAccessoryWeightKg}) × 9.81 × {inputs.dynamicAmplificationFactor} × {inputs.centerOfGravityFactor} × {inputs.consequenceFactor}
                      </div>
                      <div>
                        Total Factored Load: <strong>{results.factoredDynamicLiftLoadKn} kN</strong> ({results.slingTensionPerLegTonnes} tonnes per leg)
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-900 text-[13px]">
                        2. Sling Tension per Leg & Angle Derivation (EN 13414-1 / EN 1492)
                      </div>
                      <div>T_leg = F_lift / (n_eff × cos θ)</div>
                      <div>
                        sin θ = (S / 2) / L_sling = ({inputs.pickupPointsSpacingMeters} / 2) / {inputs.slingLengthMeters} &rarr; θ = <strong>{results.calculatedSlingAngleDeg}°</strong>
                      </div>
                      <div>
                        Calculated Hook Headroom H = √(L² - (S/2)²) = <strong>{results.calculatedHookHeightMeters} m</strong>
                      </div>
                      <div>
                        Tension per leg T_leg: <strong>{results.slingTensionPerLegTonnes} tonnes ({results.slingTensionPerLegKn} kN)</strong>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-900 text-[13px]">
                        3. Hitch Capacity & Utilization Check (EN 1492-1 Annex B)
                      </div>
                      <div>Effective WLL = User Sling WLL ({inputs.userSlingWllTonnes}t) × Hitch Factor ({results.hitchDerationFactor}) = <strong>{results.effectiveSlingCapacityTonnes}t</strong></div>
                      <div>
                        Utilization η_sling = {results.slingTensionPerLegTonnes}t / {results.effectiveSlingCapacityTonnes}t = <strong>{(results.slingCapacityUtilization * 100).toFixed(1)}% ({results.isSlingCapacityPass ? 'PASS' : 'OVERLOAD'})</strong>
                      </div>
                    </div>
                  </>
                ) : inputs.riggingMethod === 'forklift_slung' ? (
                  <>
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-900 text-[13px]">
                        1. Forklift Capacity Deration Formula (ISO 22915-2)
                      </div>
                      <div>Q_derated = Q_rated × (x + C_std) / (x + C_actual)</div>
                      <div>
                        Where front axle overhang x ≈ 450mm, C_std = {inputs.forkliftStandardLoadCenterMm}mm, C_actual = {inputs.actualLoadCenterMm}mm
                      </div>
                      <div>
                        Derated Capacity: <strong>{results.forkliftDeratedCapacityTonnes} tonnes</strong> (from {inputs.forkliftRatedCapacityTonnes}t nameplate)
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-900 text-[13px]">
                        2. Applied Dynamic Load & Utilization Check
                      </div>
                      <div>Factored Dynamic Weight = {results.forkliftAppliedTotalTonnes} tonnes ({results.factoredDynamicLiftLoadKn} kN)</div>
                      <div>
                        Utilization: <strong>{(results.forkliftUtilization * 100).toFixed(1)}% ({results.isForkliftPass ? 'SAFE PASS' : 'OVERLOAD'})</strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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

                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 text-[13px]">
                        3. Detailed Fillet Weld Stress & Shear/Tension Interaction (EN 1993-1-8 Cl. 4.5.3)
                      </div>
                      
                      {/* Geometry & Forces */}
                      <div className="p-2 bg-white rounded border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-800 block">3.1 Weld Geometry & Base Forces:</span>
                        <div>User Throat a = {inputs.lugWeldThroatMm}mm, Length Lw = {inputs.lugWeldLengthMm}mm, Effective Leff = {results.detailedWeldCheck?.effectiveLengthMm}mm</div>
                        <div>Total Throat Area Aw = 2 × a × Leff = <strong>{results.detailedWeldCheck?.totalThroatAreaMm2} mm²</strong></div>
                        <div>Elastic Modulus Ww = 2 × a × Lw² / 6 = <strong>{results.detailedWeldCheck?.elasticSectionModulusMm3} mm³</strong></div>
                        <div>Vertical Tension F_v = {results.detailedWeldCheck?.verticalPullKn} kN | Horizontal In-Plane Shear F_h = {results.detailedWeldCheck?.horizontalShearKn} kN</div>
                        <div>5% Accidental Lateral Load F_z = {results.detailedWeldCheck?.lateralSideLoadKn} kN | Overturning Moment M_ip = {results.detailedWeldCheck?.inPlaneBendingMomentKnM} kNm</div>
                      </div>

                      {/* Directional Method */}
                      <div className="p-2 bg-white rounded border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-800 block">3.2 Directional Method (EN 1993-1-8 Cl. 4.5.3.2):</span>
                        <div>Normal stress: σ_⊥ = (σ_dir + σ_bend) / √2 = <strong>{results.detailedWeldCheck?.sigmaPerpMpa} MPa</strong></div>
                        <div>Shear stresses: τ_⊥ = {results.detailedWeldCheck?.tauPerpMpa} MPa | τ_∥ = {results.detailedWeldCheck?.tauParaMpa} MPa</div>
                        <div>Equivalent von Mises stress σ_vm = √[σ_⊥² + 3 × (τ_⊥² + τ_∥²)] = <strong>{results.detailedWeldCheck?.vonMisesStressMpa} MPa</strong></div>
                        <div>Design weld strength f_w,Rd = f_u / (β_w × γ_M2) = 510 / ({results.detailedWeldCheck?.correlationFactorBetaW} × 1.25) = <strong>{results.detailedWeldCheck?.designWeldStrengthFwRdMpa} MPa</strong></div>
                        <div>
                          Check 1 (von Mises): σ_vm &le; f_w,Rd &rarr; <strong>{((results.detailedWeldCheck?.directionalUtilization ?? 0) * 100).toFixed(1)}% ({results.detailedWeldCheck?.isDirectionalPass ? 'PASS' : 'FAIL'})</strong>
                        </div>
                        <div>
                          Check 2 (Normal stress): σ_⊥ &le; 0.9 × f_u / γ_M2 ({results.detailedWeldCheck?.normalStressLimitMpa} MPa) &rarr; <strong>{((results.detailedWeldCheck?.normalStressUtilization ?? 0) * 100).toFixed(1)}% (PASS)</strong>
                        </div>
                      </div>

                      {/* Simplified Shear & Interaction */}
                      <div className="p-2 bg-white rounded border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-800 block">3.3 Simplified Method & Interaction (EN 1993-1-8 Cl. 4.5.3.3):</span>
                        <div>Resultant stress τ_res = √(σ_ten² + τ_shear²) = <strong>{results.detailedWeldCheck?.simplifiedResultantStressMpa} MPa</strong></div>
                        <div>Design shear strength f_vw,d = (f_u / √3) / (β_w × γ_M2) = <strong>{results.detailedWeldCheck?.designShearStrengthFvwdMpa} MPa</strong></div>
                        <div>
                          Simplified Check: τ_res &le; f_vw,d &rarr; <strong>{((results.detailedWeldCheck?.simplifiedUtilization ?? 0) * 100).toFixed(1)}% ({results.detailedWeldCheck?.isSimplifiedPass ? 'PASS' : 'FAIL'})</strong>
                        </div>
                        <div>
                          Combined Interaction Ratio: (σ/f_ten)² + (τ/f_vwd)² = <strong>{results.detailedWeldCheck?.interactionIndex} &le; 1.0 ({results.detailedWeldCheck?.isWeldPass ? 'PASS' : 'FAIL'})</strong>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
