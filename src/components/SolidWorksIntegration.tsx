import React, { useState } from 'react';
import {
  Box,
  Download,
  Copy,
  Check,
  Code2,
  FileSpreadsheet,
  Cpu,
  Layers,
  ExternalLink,
  Info,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  StructuralInputs,
  LiftingInputs,
  ProjectMetadata,
  StructuralResults,
  LiftingResults,
  SteelSection
} from '../types';
import {
  generateSolidWorksMacro,
  generateSolidWorksEquations,
  generateSolidWorksSimulationGuide,
  generateSolidWorksDxf,
  downloadTextFile
} from '../utils/solidworksExport';

interface SolidWorksIntegrationProps {
  structuralInputs: StructuralInputs;
  liftingInputs: LiftingInputs;
  metadata: ProjectMetadata;
  structuralResults: StructuralResults;
  liftingResults: LiftingResults;
  customSections: SteelSection[];
  onNavigateToTab?: (tab: any) => void;
}

export const SolidWorksIntegration: React.FC<SolidWorksIntegrationProps> = ({
  structuralInputs,
  liftingInputs,
  metadata,
  structuralResults,
  liftingResults,
  customSections,
  onNavigateToTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'macro' | 'equations' | 'fea' | 'dxf'>('macro');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const macroCode = generateSolidWorksMacro(structuralInputs, liftingInputs, metadata, customSections);
  const equationsText = generateSolidWorksEquations(structuralInputs, liftingInputs, customSections);
  const simulationText = generateSolidWorksSimulationGuide(
    structuralInputs,
    liftingInputs,
    structuralResults,
    liftingResults,
    metadata,
    customSections
  );
  const dxfContent = generateSolidWorksDxf(structuralInputs, liftingInputs, customSections);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownload = (type: 'macro' | 'equations' | 'fea' | 'dxf') => {
    const mark = metadata.componentMark ? metadata.componentMark.replace(/[^a-zA-Z0-9_-]/g, '_') : 'BEAM';
    if (type === 'macro') {
      downloadTextFile(`${mark}_SolidWorks_Macro.bas`, macroCode, 'text/plain;charset=utf-8');
    } else if (type === 'equations') {
      downloadTextFile(`${mark}_SolidWorks_Equations.txt`, equationsText, 'text/plain;charset=utf-8');
    } else if (type === 'fea') {
      downloadTextFile(`${mark}_SolidWorks_FEA_Setup.txt`, simulationText, 'text/plain;charset=utf-8');
    } else if (type === 'dxf') {
      downloadTextFile(`${mark}_Section_Profile.dxf`, dxfContent, 'application/dxf;charset=utf-8');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 uppercase tracking-wider">
              <span>SolidWorks CAD & FEA Interface</span>
              <span aria-hidden="true">·</span>
              <span>Parametric 3D Automation & Simulation</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Box className="w-5 h-5 text-rose-600" />
              <span>SolidWorks 3D Modeling & FEA Load Case Bridge</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Directly generates runnable SolidWorks VBA macros, parametric equations files (Global Variables),
              FEA simulation boundary load cases, and 2D DXF sketch profiles for your Eurocode beam and safe lifting rigging setup.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleDownload('macro')}
              className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .BAS Macro</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownload('equations')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              <span>Equations .TXT</span>
            </button>
          </div>
        </div>

        {/* Quick Config Overview */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Component Mark</span>
            <span className="font-bold text-slate-900 font-mono">{metadata.componentMark || 'BM-101'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Steel Grade & EXC</span>
            <span className="font-bold text-slate-900 font-mono">{structuralInputs.steelGrade} ({metadata.executionClass})</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Rigging Method</span>
            <span className="font-bold text-indigo-700 font-mono">
              {liftingInputs.riggingMethod === 'crane_slings_only' ? 'Slings Only (Beam Wrap)' :
               liftingInputs.riggingMethod === 'forklift_slung' ? 'Forklift Truck Slung' : 'Welded Pad-Eyes'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Factored Dynamic Lift</span>
            <span className="font-bold text-slate-900 font-mono">{liftingResults.factoredDynamicLiftLoadKn} kN</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('macro')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors inline-flex items-center gap-2 border-b-2 ${
            activeSubTab === 'macro'
              ? 'border-rose-600 text-rose-700 bg-rose-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>VBA 3D Macro (.BAS)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('equations')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors inline-flex items-center gap-2 border-b-2 ${
            activeSubTab === 'equations'
              ? 'border-rose-600 text-rose-700 bg-rose-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Parametric Equations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('fea')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors inline-flex items-center gap-2 border-b-2 ${
            activeSubTab === 'fea'
              ? 'border-rose-600 text-rose-700 bg-rose-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>FEA Simulation Study Setup</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('dxf')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors inline-flex items-center gap-2 border-b-2 ${
            activeSubTab === 'dxf'
              ? 'border-rose-600 text-rose-700 bg-rose-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2D Profile (.DXF)</span>
        </button>
      </div>

      {/* Content for Sub-Tabs */}
      <div className="bg-white border border-slate-200 rounded-b-xl p-6 shadow-xs -mt-6">
        {/* TAB 1: VBA MACRO */}
        {activeSubTab === 'macro' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-50/60 p-4 rounded-xl border border-rose-100">
              <div className="text-xs text-rose-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-rose-800">
                  <Sparkles className="w-4 h-4" />
                  How to run this in SolidWorks in under 30 seconds:
                </span>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-700 text-[11px] pt-1">
                  <li>In SolidWorks, go to top menu: <strong>Tools &gt; Macro &gt; New...</strong> (or Edit).</li>
                  <li>Paste this VBA code and click the green <strong>Run (F5)</strong> button.</li>
                  <li>SolidWorks automatically builds the beam 3D solid, extrudes the span, adds sling reference planes / pad-eyes, and injects EN 1090 custom properties!</li>
                </ol>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy('macro', macroCode)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  {copiedKey === 'macro' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Macro</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('macro')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .BAS</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-xl overflow-x-auto max-h-[500px] leading-relaxed border border-slate-800">
                {macroCode}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 2: EQUATIONS */}
        {activeSubTab === 'equations' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block">SolidWorks External Equations File:</span>
                <p className="text-[11px] text-slate-500">
                  Import this file into any existing SolidWorks part via <strong>Tools &gt; Equations &gt; Import...</strong> or check "Link to external file" for 100% parametric synchronization.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy('equations', equationsText)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  {copiedKey === 'equations' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('equations')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Equations</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="bg-slate-950 text-amber-300 font-mono text-xs p-4 rounded-xl overflow-x-auto max-h-[500px] leading-relaxed border border-slate-800">
                {equationsText}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: FEA SIMULATION */}
        {activeSubTab === 'fea' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
              <div className="text-xs text-indigo-950 space-y-1">
                <span className="font-bold text-indigo-900 block">SolidWorks Simulation (FEA) Load Definition:</span>
                <p className="text-[11px] text-slate-600">
                  Ready-to-enter engineering values for setting up your Static FEA study in SolidWorks Simulation, verifying allowable Von Mises stresses against Eurocode 3.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy('fea', simulationText)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  {copiedKey === 'fea' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Guide</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('fea')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download FEA Card</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="bg-slate-950 text-cyan-300 font-mono text-xs p-4 rounded-xl overflow-x-auto max-h-[500px] leading-relaxed border border-slate-800">
                {simulationText}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: DXF PROFILE */}
        {activeSubTab === 'dxf' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block">2D DXF Cross-Section Profile:</span>
                <p className="text-[11px] text-slate-500">
                  Directly insert into SolidWorks drawing or sketch via <strong>Insert &gt; DXF/DWG...</strong> or use for CNC laser cutting of end plates and profiles.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownload('dxf')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .DXF</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="bg-slate-950 text-slate-400 font-mono text-xs p-4 rounded-xl overflow-x-auto max-h-[400px] leading-relaxed border border-slate-800">
                {dxfContent}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
