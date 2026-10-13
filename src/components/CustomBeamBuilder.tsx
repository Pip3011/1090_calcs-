import React, { useState } from 'react';
import { Plus, Check, Sparkles, Trash2, X, Info, Ruler } from 'lucide-react';
import { SteelSection } from '../types';
import { calculateSectionProperties } from '../data/steelSections';

interface CustomBeamBuilderProps {
  onAddSection: (section: SteelSection) => void;
  customSections: SteelSection[];
  onDeleteSection?: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomBeamBuilder: React.FC<CustomBeamBuilderProps> = ({
  onAddSection,
  customSections,
  onDeleteSection,
  isOpen,
  onClose,
}) => {
  const [shape, setShape] = useState<'SHS' | 'RHS' | 'UB' | 'UC' | 'CHS' | 'CUSTOM'>('SHS');
  const [designation, setDesignation] = useState('SHS 200 × 200 × 5');
  const [depth, setDepth] = useState(200);
  const [width, setWidth] = useState(200);
  const [webThickness, setWebThickness] = useState(5);
  const [flangeThickness, setFlangeThickness] = useState(5);

  // Auto calculated properties
  const computed = calculateSectionProperties({
    designation,
    category: shape,
    depth,
    width,
    webThickness,
    flangeThickness: shape === 'SHS' || shape === 'RHS' || shape === 'CHS' ? webThickness : flangeThickness,
  });

  const handleApplyPreset = (preset: 'shs200' | 'rhs250' | 'plateGirder') => {
    if (preset === 'shs200') {
      setShape('SHS');
      setDesignation('SHS 200 × 200 × 5');
      setDepth(200);
      setWidth(200);
      setWebThickness(5);
      setFlangeThickness(5);
    } else if (preset === 'rhs250') {
      setShape('RHS');
      setDesignation('RHS 250 × 150 × 8');
      setDepth(250);
      setWidth(150);
      setWebThickness(8);
      setFlangeThickness(8);
    } else if (preset === 'plateGirder') {
      setShape('CUSTOM');
      setDesignation('Fabricated Girder 600 × 250 × 10/16');
      setDepth(600);
      setWidth(250);
      setWebThickness(10);
      setFlangeThickness(16);
    }
  };

  const handleSave = () => {
    onAddSection(computed);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              <span>Section Library Extension</span>
              <span aria-hidden="true">·</span>
              <span>Eurocode Geometric Properties</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Add Your Own Custom Beam Profile
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Input physical profile dimensions (e.g. SHS 200 × 200 × 5) and auto-derive Wpl, Iy, and mass.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Quick Templates:
            </span>
            <button
              type="button"
              onClick={() => handleApplyPreset('shs200')}
              className="px-2.5 py-1 text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md border border-indigo-200 transition-colors inline-flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>SHS 200 × 200 × 5 (Example)</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('rhs250')}
              className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            >
              RHS 250 × 150 × 8
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('plateGirder')}
              className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            >
              Plate Girder 600×250×10/16
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Inputs */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Cross-Section Shape</label>
                <select
                  value={shape}
                  onChange={(e) => {
                    const newShape = e.target.value as any;
                    setShape(newShape);
                    if (newShape === 'SHS') {
                      setWidth(depth);
                      setDesignation(`SHS ${depth} × ${depth} × ${webThickness}`);
                    } else if (newShape === 'RHS') {
                      setDesignation(`RHS ${depth} × ${width} × ${webThickness}`);
                    } else if (newShape === 'UB' || newShape === 'CUSTOM') {
                      setDesignation(`Custom Girder ${depth} × ${width} × ${webThickness}/${flangeThickness}`);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="SHS">SHS: Square Hollow Section</option>
                  <option value="RHS">RHS: Rectangular Hollow Section</option>
                  <option value="UB">UB / I-Beam: Hot-Rolled Universal Beam</option>
                  <option value="UC">UC / H-Beam: Column Profile</option>
                  <option value="CHS">CHS: Circular Hollow Tube</option>
                  <option value="CUSTOM">Welded Plate Girder / Box Girder</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Section Designation / Label</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. SHS 200 x 200 x 5"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Depth h (mm)</label>
                  <input
                    type="number"
                    min="20"
                    step="5"
                    value={depth}
                    onChange={(e) => {
                      const val = Math.max(20, parseFloat(e.target.value) || 0);
                      setDepth(val);
                      if (shape === 'SHS') setWidth(val);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Width b (mm)</label>
                  <input
                    type="number"
                    min="20"
                    step="5"
                    value={shape === 'SHS' ? depth : width}
                    disabled={shape === 'SHS'}
                    onChange={(e) => setWidth(Math.max(20, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900 disabled:bg-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">
                    {shape === 'SHS' || shape === 'RHS' || shape === 'CHS' ? 'Wall Thickness t (mm)' : 'Web Thickness tw (mm)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={webThickness}
                    onChange={(e) => {
                      const val = Math.max(1, parseFloat(e.target.value) || 0);
                      setWebThickness(val);
                      if (shape === 'SHS' || shape === 'RHS') setFlangeThickness(val);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                  />
                </div>

                {shape !== 'SHS' && shape !== 'RHS' && shape !== 'CHS' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Flange Thickness tf (mm)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={flangeThickness}
                      onChange={(e) => setFlangeThickness(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Preview & Geometric Calculations */}
            <div className="space-y-4">
              {/* SVG Cross-Section Blueprint Preview */}
              <div className="bg-slate-950 rounded-xl p-4 flex flex-col items-center justify-center min-h-[160px] border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider mb-2">
                  Cross-Section Blueprint Preview
                </span>
                <svg viewBox="0 0 160 120" className="w-36 h-28 font-mono select-none">
                  {shape === 'SHS' || shape === 'RHS' ? (
                    <g>
                      {/* Outer rectangle */}
                      <rect x="35" y="15" width="90" height="90" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" rx="4" />
                      {/* Inner hollow cutout */}
                      <rect x="42" y="22" width="76" height="76" fill="#020617" stroke="#38bdf8" strokeWidth="1" rx="2" />
                      {/* Dimension labels */}
                      <text x="80" y="65" fill="#e2e8f0" fontSize="9" textAnchor="middle">{depth}×{width}×{webThickness}</text>
                    </g>
                  ) : shape === 'CHS' ? (
                    <g>
                      <circle cx="80" cy="60" r="45" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="80" cy="60" r="38" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
                      <text x="80" y="63" fill="#e2e8f0" fontSize="9" textAnchor="middle">⌀{depth}×{webThickness}</text>
                    </g>
                  ) : (
                    <g>
                      {/* I-beam shape */}
                      {/* Top Flange */}
                      <rect x="35" y="15" width="90" height="15" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                      {/* Web */}
                      <rect x="74" y="30" width="12" height="60" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                      {/* Bottom Flange */}
                      <rect x="35" y="90" width="90" height="15" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x="80" y="63" fill="#e2e8f0" fontSize="9" textAnchor="middle">{depth}×{width}</text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Computed Properties Table */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs font-mono space-y-1.5">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-sans mb-1">
                  Derived Eurocode Properties:
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mass:</span>
                  <span className="font-bold text-slate-900">{computed.massPerMeter} kg/m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cross-Section Area (A):</span>
                  <span className="font-bold text-slate-900">{computed.area} cm²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Moment of Inertia (Iy):</span>
                  <span className="font-bold text-slate-900">{computed.secondMomentOfAreaY} cm⁴</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plastic Modulus (Wpl,y):</span>
                  <span className="font-bold text-indigo-700">{computed.plasticSectionModulusY} cm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Elastic Modulus (Wel,y):</span>
                  <span className="font-bold text-slate-900">{computed.elasticSectionModulusY} cm³</span>
                </div>
              </div>
            </div>
          </div>

          {/* Previously Added Custom Beams List */}
          {customSections.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Saved Project Beams ({customSections.length}):
              </span>
              <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {customSections.map((sec) => (
                  <div key={sec.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-900">{sec.designation}</span>
                      <span className="text-slate-500 ml-2 font-mono">
                        (Wpl={sec.plasticSectionModulusY} cm³, {sec.massPerMeter} kg/m)
                      </span>
                    </div>
                    {onDeleteSection && (
                      <button
                        type="button"
                        onClick={() => onDeleteSection(sec.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete custom beam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg transition-colors shadow-xs inline-flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save & Select Beam</span>
          </button>
        </div>
      </div>
    </div>
  );
};
