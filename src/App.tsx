import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Compass,
  Layers,
  Anchor,
  BookOpen,
  ShieldCheck,
  Download
} from 'lucide-react';
import {
  ProjectMetadata,
  StructuralInputs,
  LiftingInputs,
  SteelSection,
} from './types';
import { STANDARD_SECTIONS } from './data/steelSections';
import {
  determineExecutionClass,
  calculateStructuralBeam,
  calculateSafeLifting
} from './utils/calculations';
import { WalkthroughGuide } from './components/WalkthroughGuide';
import { StructuralCalculator } from './components/StructuralCalculator';
import { LiftingCalculator } from './components/LiftingCalculator';
import { EN1090Documentation } from './components/EN1090Documentation';
import { EurocodeLibraryViewer } from './components/EurocodeLibraryViewer';
import { DownloadAppModal } from './components/DownloadAppModal';
import { useOnlineStatus } from './hooks/usePWAInstall';

export default function App() {
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'structural' | 'lifting' | 'compliance' | 'library'>('walkthrough');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const isOnline = useOnlineStatus();

  // Project Metadata State
  const [metadata, setMetadata] = useState<ProjectMetadata>({
    projectName: 'Commercial Distribution Centre Frame',
    projectNumber: 'PRJ-2026-1090',
    clientName: 'Apex Logistics Infrastructure',
    fabricatorName: 'EuroSteel Engineering Works Ltd',
    responsibleWeldingCoordinator: 'John Davies (IWE / RWC)',
    fpcCertificateNumber: '0086-CPR-654321',
    notifiedBodyNumber: '0086',
    consequenceClass: 'CC2',
    serviceCategory: 'SC1',
    productionCategory: 'PC2',
    executionClass: 'EXC2',
    executionStandard: 'EN 1090-2:2018',
    declarationDate: '2026-10-15',
    componentMark: 'BM-101',
    intendedUse: 'Load-bearing roof and floor framing steelwork',
    signatoryName: 'John Davies',
    signatoryRole: 'Responsible Welding Coordinator (ISO 14731 / RWC)',
    signatoryCompany: 'EuroSteel Engineering Works Ltd',
    signatoryRegistrationNo: 'IWE-UK-4892',
    signatureDate: '2026-10-15',
    signatureDataUrl: '',
    isDocumentSigned: false,
  });

  // Custom User Beams Library (e.g. SHS 200 x 200 x 5)
  const [customSections, setCustomSections] = useState<SteelSection[]>([
    {
      id: 'custom-shs-200-200-5',
      designation: 'SHS 200 × 200 × 5.0 (User Profile)',
      category: 'SHS',
      depth: 200,
      width: 200,
      webThickness: 5.0,
      flangeThickness: 5.0,
      massPerMeter: 30.1,
      area: 38.4,
      secondMomentOfAreaY: 2473,
      plasticSectionModulusY: 285,
      elasticSectionModulusY: 247,
    },
  ]);

  const handleAddCustomSection = (newSec: SteelSection) => {
    setCustomSections(prev => [newSec, ...prev.filter(s => s.id !== newSec.id)]);
  };

  const handleDeleteCustomSection = (id: string) => {
    setCustomSections(prev => prev.filter(s => s.id !== id));
  };

  // Structural Calculation Inputs
  const [structuralInputs, setStructuralInputs] = useState<StructuralInputs>({
    sectionId: 'ub-406-178-54',
    customSection: STANDARD_SECTIONS[0],
    steelGrade: 'S355',
    spanMeters: 6.0,
    deadLoadGk: 4.5,
    liveLoadQk: 6.0,
    pointLoadFk: 0,
    includeSelfWeight: true,
    deflectionLimitRatio: 360,
    lateralRestraint: 'continuous',
  });

  // Lifting Calculation Inputs
  const [liftingInputs, setLiftingInputs] = useState<LiftingInputs>({
    tareWeightKg: 2400,
    riggingAccessoryWeightKg: 120,
    dynamicAmplificationFactor: 1.20,
    centerOfGravityFactor: 1.15,
    consequenceFactor: 1.30,
    slingConfiguration: '2-leg',
    slingAngleToVerticalDeg: 30,
    slingMaterial: 'grade_80_chain',
    padEyeQuantity: 2,
    padEyeSteelGrade: 'S355',
    lugThicknessMm: 20,
    lugHoleDiameterMm: 28,
    lugHoleRadiusMm: 45,
    lugHeightFromBaseMm: 75,
    lugWeldLengthMm: 120,
    lugWeldThroatMm: 8,
    shackleWllTonnes: 4.75,
  });

  // Dynamically update Execution Class whenever CC, SC, or PC changes
  React.useEffect(() => {
    const { executionClass } = determineExecutionClass(
      metadata.consequenceClass,
      metadata.serviceCategory,
      metadata.productionCategory
    );
    if (metadata.executionClass !== executionClass) {
      setMetadata(prev => ({ ...prev, executionClass }));
    }
  }, [metadata.consequenceClass, metadata.serviceCategory, metadata.productionCategory, metadata.executionClass]);

  // Real-time calculations
  const structuralResults = calculateStructuralBeam(structuralInputs, customSections);
  const liftingResults = calculateSafeLifting(liftingInputs);

  // Quick Preset Handler
  const handleApplyPreset = (presetKey: 'mezzanine' | 'crane_girder' | 'canopy') => {
    if (presetKey === 'mezzanine') {
      setMetadata(prev => ({
        ...prev,
        projectName: 'Heavy Industrial Mezzanine Platform',
        projectNumber: 'MEZZ-2026-08',
        consequenceClass: 'CC2',
        serviceCategory: 'SC1',
        productionCategory: 'PC2',
        componentMark: 'MB-01',
      }));
      setStructuralInputs({
        sectionId: 'ub-406-178-54',
        customSection: STANDARD_SECTIONS[0],
        steelGrade: 'S355',
        spanMeters: 6.5,
        deadLoadGk: 5.0,
        liveLoadQk: 7.5,
        pointLoadFk: 0,
        includeSelfWeight: true,
        deflectionLimitRatio: 360,
        lateralRestraint: 'continuous',
      });
      setLiftingInputs(prev => ({
        ...prev,
        tareWeightKg: 2800,
        slingConfiguration: '2-leg',
        slingAngleToVerticalDeg: 30,
        lugThicknessMm: 20,
        lugHoleDiameterMm: 30,
        lugHoleRadiusMm: 50,
        lugWeldThroatMm: 8,
      }));
    } else if (presetKey === 'crane_girder') {
      setMetadata(prev => ({
        ...prev,
        projectName: 'Overhead Gantry Crane Runway Girder',
        projectNumber: 'CRN-2026-44',
        consequenceClass: 'CC2',
        serviceCategory: 'SC2',
        productionCategory: 'PC2',
        componentMark: 'CG-01',
      }));
      setStructuralInputs({
        sectionId: 'ub-457-191-67',
        customSection: STANDARD_SECTIONS[0],
        steelGrade: 'S355',
        spanMeters: 7.5,
        deadLoadGk: 6.0,
        liveLoadQk: 12.0,
        pointLoadFk: 35.0,
        includeSelfWeight: true,
        deflectionLimitRatio: 500,
        lateralRestraint: 'intermediate_halves',
      });
      setLiftingInputs(prev => ({
        ...prev,
        tareWeightKg: 4600,
        dynamicAmplificationFactor: 1.30,
        centerOfGravityFactor: 1.20,
        slingConfiguration: '4-leg',
        slingAngleToVerticalDeg: 35,
        lugThicknessMm: 25,
        lugHoleDiameterMm: 35,
        lugHoleRadiusMm: 60,
        lugWeldThroatMm: 10,
        shackleWllTonnes: 6.5,
      }));
    } else if (presetKey === 'canopy') {
      setMetadata(prev => ({
        ...prev,
        projectName: 'External Canopy Cantilever Roof',
        projectNumber: 'CNP-2026-02',
        consequenceClass: 'CC1',
        serviceCategory: 'SC1',
        productionCategory: 'PC1',
        componentMark: 'CP-12',
      }));
      setStructuralInputs({
        sectionId: 'ub-203-133-25',
        customSection: STANDARD_SECTIONS[0],
        steelGrade: 'S275',
        spanMeters: 4.0,
        deadLoadGk: 1.5,
        liveLoadQk: 1.8,
        pointLoadFk: 0,
        includeSelfWeight: true,
        deflectionLimitRatio: 250,
        lateralRestraint: 'ends_only',
      });
      setLiftingInputs(prev => ({
        ...prev,
        tareWeightKg: 850,
        slingConfiguration: '2-leg',
        slingAngleToVerticalDeg: 25,
        lugThicknessMm: 12,
        lugHoleDiameterMm: 22,
        lugHoleRadiusMm: 35,
        lugWeldThroatMm: 6,
        shackleWllTonnes: 3.25,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 3-ZONE TOP BAR CONTRACT */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-8 no-print sticky top-0 z-40">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#/"
          onClick={(e) => { e.preventDefault(); setActiveTab('walkthrough'); }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 inline-flex items-center gap-2"
        >
          <span className="text-indigo-900 font-extrabold">EuroStruct 1090</span>
          <span className="text-xs text-slate-500 font-normal hidden sm:inline">· Eurocode & Lifting Suite</span>
        </a>

        {/* Zone 2: 4–5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('walkthrough')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'walkthrough' ? 'text-indigo-950 font-bold border-b-2 border-indigo-900 pb-0.5' : 'hover:text-slate-900'
            }`}
          >
            Information Guide
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('structural')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'structural' ? 'text-indigo-950 font-bold border-b-2 border-indigo-900 pb-0.5' : 'hover:text-slate-900'
            }`}
          >
            Structural Calcs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lifting')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'lifting' ? 'text-indigo-950 font-bold border-b-2 border-indigo-900 pb-0.5' : 'hover:text-slate-900'
            }`}
          >
            Safe Lifting
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compliance')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'compliance' ? 'text-indigo-950 font-bold border-b-2 border-indigo-900 pb-0.5' : 'hover:text-slate-900'
            }`}
          >
            1090 Documentation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'library' ? 'text-indigo-950 font-bold border-b-2 border-indigo-900 pb-0.5' : 'hover:text-slate-900'
            }`}
          >
            Eurocode Library
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsDownloadModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 shadow-xs"
            title="Download App / Install on Desktop or Phone"
          >
            <Download className="w-3.5 h-3.5 text-indigo-700" />
            <span>Download App</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('compliance');
              setTimeout(() => window.print(), 100);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-900 rounded-lg hover:bg-indigo-800 transition-colors whitespace-nowrap shrink-0 shadow-xs inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </header>

      {/* Offline Alert Strip if disconnected */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold py-2 px-6 text-center no-print flex items-center justify-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <span>Offline Mode Active: All Eurocode structural calculations, beam libraries, and document generation continue to operate 100% offline.</span>
        </div>
      )}

      {/* Mobile Tab Navigation */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between overflow-x-auto gap-3 text-xs font-semibold no-print">
        <button
          type="button"
          onClick={() => setActiveTab('walkthrough')}
          className={`whitespace-nowrap py-1 ${activeTab === 'walkthrough' ? 'text-indigo-900 font-bold' : 'text-slate-600'}`}
        >
          Guide
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('structural')}
          className={`whitespace-nowrap py-1 ${activeTab === 'structural' ? 'text-indigo-900 font-bold' : 'text-slate-600'}`}
        >
          Structural
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('lifting')}
          className={`whitespace-nowrap py-1 ${activeTab === 'lifting' ? 'text-indigo-900 font-bold' : 'text-slate-600'}`}
        >
          Lifting
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('compliance')}
          className={`whitespace-nowrap py-1 ${activeTab === 'compliance' ? 'text-indigo-900 font-bold' : 'text-slate-600'}`}
        >
          1090 Dossier
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`whitespace-nowrap py-1 ${activeTab === 'library' ? 'text-indigo-900 font-bold' : 'text-slate-600'}`}
        >
          Library
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'walkthrough' && (
          <WalkthroughGuide
            metadata={metadata}
            setMetadata={setMetadata}
            structuralInputs={structuralInputs}
            setStructuralInputs={setStructuralInputs}
            liftingInputs={liftingInputs}
            setLiftingInputs={setLiftingInputs}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onApplyPreset={handleApplyPreset}
          />
        )}

        {activeTab === 'structural' && (
          <StructuralCalculator
            inputs={structuralInputs}
            setInputs={setStructuralInputs}
            results={structuralResults}
            customSections={customSections}
            onAddCustomSection={handleAddCustomSection}
            onDeleteCustomSection={handleDeleteCustomSection}
          />
        )}

        {activeTab === 'lifting' && (
          <LiftingCalculator
            inputs={liftingInputs}
            setInputs={setLiftingInputs}
            results={liftingResults}
          />
        )}

        {activeTab === 'compliance' && (
          <EN1090Documentation
            metadata={metadata}
            setMetadata={setMetadata}
            structuralInputs={structuralInputs}
            structuralResults={structuralResults}
            liftingInputs={liftingInputs}
            liftingResults={liftingResults}
          />
        )}

        {activeTab === 'library' && (
          <EurocodeLibraryViewer />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-500 no-print mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">EuroStruct 1090</span>
            <span aria-hidden="true">·</span>
            <span>Compliance with EN 1090-1, EN 1090-2, EN 1993-1-1, and EN 13155</span>
          </div>
          <div className="text-slate-400">
            Certified calculation formulas for European & UK structural steel fabrication
          </div>
        </div>
      </footer>

      {/* Downloadable Interface Modal */}
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        metadata={metadata}
        structuralInputs={structuralInputs}
        structuralResults={structuralResults}
        liftingInputs={liftingInputs}
        liftingResults={liftingResults}
        customSections={customSections}
      />
    </div>
  );
}
