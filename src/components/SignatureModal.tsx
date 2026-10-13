import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  RotateCcw,
  Check,
  X,
  ShieldCheck,
  Type,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { ProjectMetadata } from '../types';

interface SignatureModalProps {
  metadata: ProjectMetadata;
  onSaveSignature: (updatedMeta: Partial<ProjectMetadata>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  metadata,
  onSaveSignature,
  isOpen,
  onClose,
}) => {
  const [signMode, setSignMode] = useState<'draw' | 'type'>('draw');
  const [name, setName] = useState(metadata.signatoryName || metadata.responsibleWeldingCoordinator || '');
  const [role, setRole] = useState(metadata.signatoryRole || 'Responsible Welding Coordinator (ISO 14731 / RWC)');
  const [company, setCompany] = useState(metadata.signatoryCompany || metadata.fabricatorName || '');
  const [registrationNo, setRegistrationNo] = useState(metadata.signatoryRegistrationNo || 'RWC-CERT-1090-FPC');
  const [signDate, setSignDate] = useState(metadata.signatureDate || new Date().toISOString().split('T')[0]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (isOpen && signMode === 'draw') {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
          }
        }
      }, 50);
    }
  }, [isOpen, signMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleApplySignature = () => {
    let signatureUrl = metadata.signatureDataUrl || '';

    if (signMode === 'draw' && canvasRef.current && hasDrawn) {
      signatureUrl = canvasRef.current.toDataURL('image/png');
    } else if (signMode === 'type' || !hasDrawn) {
      // Create SVG styled signature data URL
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'italic bold 32px Georgia, serif';
        ctx.fillStyle = '#1e1b4b';
        ctx.fillText(name || 'Signatory', 40, 70);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`Verified EN 1090 Sign-Off · ${signDate}`, 40, 100);
        signatureUrl = canvas.toDataURL('image/png');
      }
    }

    onSaveSignature({
      signatoryName: name,
      signatoryRole: role,
      signatoryCompany: company,
      signatoryRegistrationNo: registrationNo,
      signatureDate: signDate,
      signatureDataUrl: signatureUrl,
      isDocumentSigned: true,
      responsibleWeldingCoordinator: name,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Digital Authorization & Sign-Off</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Sign & Certify EN 1090 Documentation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Applies official digital signature and credentials to DoP, CE marking, ITP, and lifting sheets.
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

        <div className="p-6 space-y-5">
          {/* Signatory Information Fields */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              1. Signatory Credentials & Competence
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Davies or Pip Shepherd"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Signing Date *</label>
                <input
                  type="date"
                  value={signDate}
                  onChange={(e) => setSignDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-600">Professional Role / Title *</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Responsible Welding Coordinator (ISO 14731) / Structural Engineer"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Company / Organization</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. EuroSteel Fabrication Works Ltd"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Competence / Registration No.</label>
                <input
                  type="text"
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  placeholder="e.g. IWE/EWE-UK-4892"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Signature Capture Area */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Capture Signature
              </span>

              {/* Mode switch */}
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSignMode('draw')}
                  className={`px-2.5 py-1 rounded-md font-medium inline-flex items-center gap-1 transition-colors ${
                    signMode === 'draw' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PenTool className="w-3 h-3" />
                  <span>Draw</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSignMode('type')}
                  className={`px-2.5 py-1 rounded-md font-medium inline-flex items-center gap-1 transition-colors ${
                    signMode === 'type' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Type className="w-3 h-3" />
                  <span>Type</span>
                </button>
              </div>
            </div>

            {signMode === 'draw' ? (
              <div className="space-y-2">
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden cursor-crosshair">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={150}
                    className="w-full h-36 touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {!hasDrawn && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-slate-400">
                      Sign here using your mouse or finger...
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Sign inside the box</span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-rose-600 font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear Canvas</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 text-center space-y-2">
                <div className="text-2xl font-serif italic text-indigo-950 tracking-wider">
                  {name || 'Your Full Name'}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Certified Electronic Sign-off · {company} · {signDate}
                </div>
              </div>
            )}
          </div>

          {/* Legal Compliance Attestation */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200/60 rounded-xl text-xs text-slate-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-950">
              <FileCheck className="w-4 h-4 text-indigo-700" />
              <span>Legal Regulatory Attestation (CPR 305/2011 Annex III)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              By applying this signature, I certify that the structural calculations (EN 1993),
              safe lifting parameters (EN 13155), Execution Class ({metadata.executionClass}),
              and welding quality controls have been examined and are certified for CE/UKCA marking.
            </p>
          </div>
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
            disabled={!name.trim()}
            onClick={handleApplySignature}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs inline-flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Apply Signature to All Documents</span>
          </button>
        </div>
      </div>
    </div>
  );
};
