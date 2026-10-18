import React, { useState } from 'react';
import { HeroBackgroundVideo } from './HeroBackgroundVideo.js';
import { Navbar } from './Navbar.js';
import { TypewriterHero } from './TypewriterHero.js';
import { MacOSMenuBar } from './MacOSMenuBar.js';
import { InboxMockup } from './InboxMockup.js';
import { LandscapeHologramSection } from './LandscapeHologramSection.js';
import { FeatureTriage } from './FeatureTriage.js';
import { LogoCloud } from './LogoCloud.js';
import { Testimonials } from './Testimonials.js';
import { PricingSection } from './PricingSection.js';
import { FinalCTA } from './FinalCTA.js';
import { LogoMark, SectionEyebrow } from './Primitives.js';
import { WhatIfSimulator } from '../simulator/WhatIfSimulator.js';
import type {
  ClinicalScores,
  InterventionsState,
  LabPanel,
  OrganTwinStatus,
  PatientProfile,
  SimulatedOutcome,
  TelemetryVitals,
} from '../../types/clinical.js';
import type { PatientTwinState } from '../../data/mockPatients.js';

interface AuraLandingProps {
  patients: PatientTwinState[];
  currentPatientId: string;
  onSelectPatient: (id: string) => void;
  patient: PatientProfile;
  vitals: TelemetryVitals;
  labs: LabPanel;
  scores: ClinicalScores;
  organs: OrganTwinStatus[];
  currentInterventions: InterventionsState;
  onTriggerCrisis: (type: 'crash' | 'fluid-challenge' | 'antibiotic' | 'normalize') => void;
  onRequestAiSepsisAnalysis: () => void;
  onRequestSimulationCritique: (outcome: SimulatedOutcome, plan: InterventionsState) => void;
  onApplySimulation: (
    newVitals: TelemetryVitals,
    newLabs: LabPanel,
    appliedInterventions: InterventionsState
  ) => void;
  onResetToBaseline: () => void;
  isAiLoading: boolean;
}

export function AuraLanding({
  patients,
  currentPatientId,
  onSelectPatient,
  patient,
  vitals,
  labs,
  scores,
  organs,
  currentInterventions,
  onTriggerCrisis,
  onRequestAiSepsisAnalysis,
  onRequestSimulationCritique,
  onApplySimulation,
  onResetToBaseline,
  isAiLoading,
}: AuraLandingProps) {
  const [notification, setNotification] = useState<string | null>(null);

  const handleShowNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const scrollToCockpit = () => {
    document.getElementById('cockpit-window')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white font-sans selection:bg-[#00d2ff]/30 antialiased flex flex-col lg:block">
      {/* Root-Level Subtle Grain SVG Noise Filter */}
      <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <filter id="c3-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0"
          />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
      </svg>

      {/* Interactive Video Background Layer */}
      <HeroBackgroundVideo />

      {/* Main Content Sections */}
      <div className="relative z-10 flex flex-col">
        {/* Section 1: Navigation */}
        <Navbar
          currentBed={patient.bedNumber}
          onSelectBed={onSelectPatient}
          onRequestAiConsult={onRequestAiSepsisAnalysis}
          onNavigateSection={(id) => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Section 2: Interactive Typewriter Hero & Crisis Pills */}
        <TypewriterHero
          onTriggerCrisis={onTriggerCrisis}
          onOpenTelemetry={scrollToCockpit}
        />

        {/* Section 3: macOS Menu Bar Strip */}
        <MacOSMenuBar />

        {/* Section 4: 12-Column ICU Cockpit Window Mockup */}
        <InboxMockup
          patient={patient}
          vitals={vitals}
          labs={labs}
          scores={scores}
          organs={organs}
          patients={patients}
          currentPatientId={currentPatientId}
          onSelectPatient={onSelectPatient}
          onRequestAiConsult={onRequestAiSepsisAnalysis}
          onOpenSimulator={() => {
            document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Dedicated Full-Width Landscape 3D Cardiopulmonary Hologram Viewport */}
        <LandscapeHologramSection
          patient={patient}
          vitals={vitals}
          labs={labs}
          scores={scores}
          organs={organs}
        />

        {/* Section 5: AI Multiorgan Sepsis Triage */}
        <FeatureTriage />

        {/* Interactive What-If Counterfactual Simulator Section */}
        <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24" id="simulator">
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <SectionEyebrow label="Counterfactual Simulation" tag="Biophysical Model" />
            <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.05] text-white">
              What-If Resuscitation Engine
            </h2>
            <p className="mt-3 text-white/60 text-sm md:text-base leading-relaxed">
              Titrate inotropes, crystalloids, and mechanical ventilation parameters to project 4-hour
              hemodynamic trajectories before infusing medications at bedside.
            </p>
          </div>

          <div className="liquid-glass rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl">
            <WhatIfSimulator
              patient={patient}
              vitals={vitals}
              labs={labs}
              currentInterventions={currentInterventions}
              onApplyInterventionsToTwin={onApplySimulation}
              onResetToBaseline={onResetToBaseline}
              onRequestSimulationAiCritique={onRequestSimulationCritique}
              isAiCritiqueLoading={isAiLoading}
            />
          </div>
        </section>

        {/* Section 6: Clinical Research Guidelines & Centers */}
        <LogoCloud />

        {/* Section 7: Verified Intensivist Testimonials */}
        <Testimonials />

        {/* Section 8: Watermark Custom Hospital Deployment Tiers */}
        <PricingSection />

        {/* Section 9: Final Call to Action */}
        <FinalCTA
          onOpenCockpit={scrollToCockpit}
          onRequestTrial={() => {
            handleShowNotification('Hospital Clinical Trial Request submitted. Clinical engineering will contact you.');
          }}
        />

        {/* Quiet Clinical Footer */}
        <footer className="relative z-10 max-w-6xl mx-auto px-6 py-12 border-t border-white/10 w-full flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-white/50">
          <div className="flex items-center gap-3">
            <LogoMark className="w-5 h-5 text-cyan-400" />
            <span>
              © {new Date().getFullYear()} Pulse-Twin Omni AI • Surviving Sepsis Campaign Compliant
            </span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <a href="#cockpit-window" className="hover:text-white transition-colors">
              Telemetry
            </a>
            <a href="#triage" className="hover:text-white transition-colors">
              Sepsis Triage
            </a>
            <a href="#simulator" className="hover:text-white transition-colors">
              What-If Simulator
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              ICU Deployment
            </a>
          </div>
        </footer>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0e1014] border border-cyan-500/40 text-cyan-300 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-medium">{notification}</span>
        </div>
      )}
    </div>
  );
}
