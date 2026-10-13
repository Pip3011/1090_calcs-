import React, { useState } from 'react';
import {
  Download,
  Laptop,
  Smartphone,
  HardDrive,
  Check,
  X,
  ShieldCheck,
  WifiOff,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';
import { ProjectMetadata, StructuralInputs, StructuralResults, LiftingInputs, LiftingResults, SteelSection } from '../types';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ProjectMetadata;
  structuralInputs: StructuralInputs;
  structuralResults: StructuralResults;
  liftingInputs: LiftingInputs;
  liftingResults: LiftingResults;
  customSections: SteelSection[];
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  metadata,
  structuralInputs,
  structuralResults,
  liftingInputs,
  liftingResults,
  customSections,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Download Standalone Offline HTML File
  const handleDownloadStandaloneHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EuroStruct 1090 - Offline Structural & Lifting Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
    .container { max-width: 900px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0; }
    h1 { color: #1e1b4b; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-top: 0; font-size: 24px; text-transform: uppercase; }
    h2 { color: #334155; margin-top: 28px; font-size: 16px; text-transform: uppercase; border-left: 4px solid #4338ca; padding-left: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    .badge-pass { background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
    .badge-fail { background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
    .signature-box { margin-top: 24px; padding: 16px; border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 8px; }
    .mono { font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <h1>EuroStruct 1090 · Offline Compliance Dossier</h1>
    <p>Project: <strong>${metadata.projectName}</strong> (${metadata.projectNumber}) | Client: <strong>${metadata.clientName}</strong> | Date: <strong>${metadata.declarationDate}</strong></p>
    <p>Fabricator: <strong>${metadata.fabricatorName}</strong> | Execution Class: <strong>${metadata.executionClass}</strong> (${metadata.executionStandard})</p>

    <h2>1. Structural Member Verification (EN 1993-1-1)</h2>
    <table>
      <tr><th>Member Profile</th><td class="mono font-bold">${structuralInputs.customSection?.designation || structuralInputs.sectionId}</td></tr>
      <tr><th>Steel Grade</th><td class="mono">${structuralInputs.steelGrade} (fy = ${structuralResults.yieldStrengthFy} MPa)</td></tr>
      <tr><th>Effective Span</th><td class="mono">${structuralInputs.spanMeters} m</td></tr>
      <tr><th>Total ULS Factored Action</th><td class="mono">${structuralResults.totalUlsLoad} kN/m</td></tr>
      <tr><th>Design Bending Moment Med</th><td class="mono">${structuralResults.designBendingMomentMed} kNm (Resistance Mc,Rd: ${structuralResults.plasticMomentResistanceMcRd} kNm)</td></tr>
      <tr><th>Bending Utilization</th><td><span class="${structuralResults.isBendingPass ? 'badge-pass' : 'badge-fail'}">${(structuralResults.bendingUtilization * 100).toFixed(1)}% - ${structuralResults.isBendingPass ? 'PASS' : 'FAIL'}</span></td></tr>
      <tr><th>Design Shear Ved</th><td class="mono">${structuralResults.designShearForceVed} kN (Resistance Vc,Rd: ${structuralResults.shearResistanceVcRd} kN)</td></tr>
      <tr><th>Shear Utilization</th><td><span class="${structuralResults.isShearPass ? 'badge-pass' : 'badge-fail'}">${(structuralResults.shearUtilization * 100).toFixed(1)}% - ${structuralResults.isShearPass ? 'PASS' : 'FAIL'}</span></td></tr>
      <tr><th>Actual Midspan Deflection</th><td class="mono">${structuralResults.actualDeflectionMm} mm (Allowable: ${structuralResults.allowableDeflectionMm} mm)</td></tr>
    </table>

    <h2>2. Safe Lifting & Rigging Verification (EN 13155 & LOLER)</h2>
    <table>
      <tr><th>Component Tare Mass</th><td class="mono">${liftingInputs.tareWeightKg} kg</td></tr>
      <tr><th>Dynamic Amplification Factor (DAF)</th><td class="mono">${liftingInputs.dynamicAmplificationFactor}</td></tr>
      <tr><th>Center of Gravity Factor (k_CoG)</th><td class="mono">${liftingInputs.centerOfGravityFactor}</td></tr>
      <tr><th>Total Dynamic Hook Load</th><td class="mono">${liftingResults.factoredDynamicLiftLoadKn} kN</td></tr>
      <tr><th>Sling Configuration</th><td class="mono">${liftingInputs.slingConfiguration} at ${liftingInputs.slingAngleToVerticalDeg}° from vertical</td></tr>
      <tr><th>Tension per Sling Leg</th><td class="mono font-bold">${liftingResults.slingTensionPerLegTonnes} tonnes (${liftingResults.slingTensionPerLegKn} kN)</td></tr>
      <tr><th>Recommended Sling WLL</th><td class="mono">${liftingResults.recommendedMinimumSlingWllTonnes} tonnes</td></tr>
      <tr><th>Pad-Eye Bearing Check</th><td><span class="${liftingResults.isBearingPass ? 'badge-pass' : 'badge-fail'}">${liftingResults.pinBearingStressMpa} MPa &le; ${liftingResults.allowablePinBearingStressMpa} MPa (${(liftingResults.bearingUtilization * 100).toFixed(1)}%)</span></td></tr>
      <tr><th>Pad-Eye Fillet Weld Check</th><td><span class="${liftingResults.isWeldPass ? 'badge-pass' : 'badge-fail'}">${liftingResults.weldStressMpa} MPa &le; ${liftingResults.allowableWeldStressMpa} MPa</span></td></tr>
    </table>

    <div class="signature-box">
      <h3>Declaration Authorization & Sign-Off</h3>
      <p>Signed by: <strong>${metadata.signatoryName || metadata.responsibleWeldingCoordinator}</strong></p>
      <p>Role: ${metadata.signatoryRole || 'Responsible Welding Coordinator (ISO 14731)'}</p>
      <p>Date: ${metadata.signatureDate || metadata.declarationDate}</p>
      ${metadata.signatoryRegistrationNo ? `<p>Registration / Stamp: <span class="mono">${metadata.signatoryRegistrationNo}</span></p>` : ''}
      ${metadata.signatureDataUrl ? `<img src="${metadata.signatureDataUrl}" style="height: 50px; border-bottom: 1px solid #333;" alt="Signature" />` : ''}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EuroStruct_1090_Offline_${metadata.projectNumber || 'Dossier'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess('Offline standalone HTML report downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Handle Download Project JSON
  const handleDownloadJson = () => {
    const payload = {
      app: 'EuroStruct 1090',
      version: '2026.1',
      exportedAt: new Date().toISOString(),
      metadata,
      structuralInputs,
      structuralResults,
      liftingInputs,
      liftingResults,
      customSections,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EuroStruct_1090_${metadata.projectNumber || 'Project'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess('Complete project data JSON downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Downloadable Interface & Offline Access</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Download EuroStruct 1090 Application
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Install directly to your desktop/mobile or download standalone offline packages.
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
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Option 1: Native App Install (PWA) */}
          <div className="p-5 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-900 text-white rounded-xl shadow-xs">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Option 1: Install as Desktop / Mobile App (PWA)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Installs EuroStruct directly to your computer taskbar or phone home screen.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              {isInstalled ? (
                <div className="p-3 bg-emerald-100/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>App is already installed and running in standalone mode!</span>
                </div>
              ) : isInstallable ? (
                <button
                  type="button"
                  onClick={async () => {
                    await install();
                  }}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg transition-colors shadow-xs inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App on this Device</span>
                </button>
              ) : isIOS ? (
                <div className="p-3 bg-white border border-indigo-200 rounded-lg text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-indigo-950 block">iOS Safari Installation:</span>
                  <p className="text-[11px] leading-relaxed">
                    1. Tap the <strong>Share</strong> button in the Safari toolbar.<br />
                    2. Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Browser Installation Available:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Click the <strong>Install App icon (⊕ or computer monitor)</strong> located in your browser address bar (Chrome, Edge, or Brave) to pin EuroStruct to your desktop.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-indigo-600" />
                Works 100% Offline on site
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-indigo-600" />
                Instant desktop window launch
              </span>
            </div>
          </div>

          {/* Option 2: Download Standalone Offline App (.html bundle) */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                  <HardDrive className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Option 2: Download Portable Offline App (.html)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Single-file offline report & calculations app you can copy to a USB stick, email to clients, or open anywhere without server/internet.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadStandaloneHtml}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Standalone Offline HTML File</span>
            </button>
          </div>

          {/* Option 3: Download Complete Project JSON Data */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                  <Layers className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Option 3: Download Project Database (.json)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Exports full structured calculation records, custom beam definitions, and digital signatures for backup.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Project JSON Backup</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-2xl text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{isOnline ? 'Online mode active' : 'Offline mode active'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
