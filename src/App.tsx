import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Heart,
  Sliders,
  Sparkles,
  FileText,
  AlertTriangle,
  RefreshCw,
  Clock,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import type {
  ClinicalScores,
  InterventionsState,
  LabPanel,
  OrganTwinStatus,
  PatientProfile,
  SimulatedOutcome,
  TelemetryVitals,
} from './types/clinical.js';
import { INITIAL_PATIENTS, type PatientTwinState } from './data/mockPatients.js';
import {
  computeAllScores,
  deriveOrganTwinStatuses,
} from './utils/clinicalCalculators.js';
import { PatientHeader } from './components/cockpit/PatientHeader.js';
import { WaveformMonitor } from './components/telemetry/WaveformMonitor.js';
import { DigitalTwin3D } from './components/digitaltwin/DigitalTwin3D.js';
import { HolographicOrganViewport } from './components/digitaltwin/HolographicOrganViewport.js';
import { SepsisRiskPanel } from './components/cockpit/SepsisRiskPanel.js';
import { LabTelemetryPanel } from './components/cockpit/LabTelemetryPanel.js';
import { WhatIfSimulator } from './components/simulator/WhatIfSimulator.js';
import { ClinicalIntelligenceModal } from './components/cockpit/ClinicalIntelligenceModal.js';
import { AuraLanding } from './components/aura/AuraLanding.js';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'aura' | 'clinical'>('aura');
  const [patients, setPatients] = useState<PatientTwinState[]>(INITIAL_PATIENTS);
  const [currentPatientId, setCurrentPatientId] = useState<string>('bed-04');
  const [selectedOrganId, setSelectedOrganId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cockpit' | 'cardiopulmonary' | 'simulator'>('cockpit');
  const [cockpitTwinView, setCockpitTwinView] = useState<'hologram-organs' | 'whole-body'>('hologram-organs');

  // AI Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'sepsis-analysis' | 'simulation-critique' | 'sbar-handover'>('sepsis-analysis');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modalData, setModalData] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Time display
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Find active patient twin state
  const activeTwinState =
    patients.find((p) => p.profile.id === currentPatientId) || patients[0];

  const currentPatient = activeTwinState.profile;
  const currentVitals = activeTwinState.vitals;
  const currentLabs = activeTwinState.labs;
  const currentInterventions = activeTwinState.defaultInterventions;

  // Compute live scores and organ twin status
  const currentScores: ClinicalScores = computeAllScores(
    currentVitals,
    currentLabs,
    {
      norepinephrine: currentInterventions.norepinephrineMcgKgMin,
      dobutamine: currentInterventions.dobutamineMcgKgMin,
    },
    currentVitals.map < 65
  );

  const currentOrgans: OrganTwinStatus[] = deriveOrganTwinStatuses(
    currentVitals,
    currentLabs,
    currentScores.sofaSubscores
  );

  // Natural Physiological Micro-Fluctuations (Simulates living patient vitals variation)
  useEffect(() => {
    const interval = setInterval(() => {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.profile.id !== currentPatientId) return p;

          // Subtle physiological drift ±1 bpm, ±1 mmHg
          const hrJitter = (Math.random() - 0.5) * 1.5;
          const bpJitter = (Math.random() - 0.5) * 1.5;

          const newHr = Math.round(Math.max(45, Math.min(160, p.vitals.heartRate + hrJitter)));
          const newSbp = Math.round(Math.max(60, Math.min(200, p.vitals.systolicBP + bpJitter)));
          const newDbp = Math.round(Math.max(35, Math.min(110, p.vitals.diastolicBP + bpJitter * 0.6)));
          const newMap = Math.round(newDbp + (newSbp - newDbp) / 3);

          return {
            ...p,
            vitals: {
              ...p.vitals,
              heartRate: newHr,
              systolicBP: newSbp,
              diastolicBP: newDbp,
              map: newMap,
            },
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [currentPatientId]);

  // Handler: Clinical Crisis Scenarios
  const handleTriggerCrisis = (crisisType: 'crash' | 'fluid-challenge' | 'antibiotic' | 'normalize') => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.profile.id !== currentPatientId) return p;

        if (crisisType === 'crash') {
          // Vasoplegic septic shock collapse
          return {
            ...p,
            vitals: {
              ...p.vitals,
              heartRate: 136,
              systolicBP: 74,
              diastolicBP: 42,
              map: 52,
              spo2: 88,
              respRate: 30,
              cardiacOutput: 4.8,
              svr: 480,
              urineOutputPerHour: 8,
            },
            labs: {
              ...p.labs,
              lactate: 5.6,
              ph: 7.20,
              baseExcess: -9.5,
            },
          };
        } else if (crisisType === 'fluid-challenge') {
          // Rapid 500 mL test bolus
          return {
            ...p,
            vitals: {
              ...p.vitals,
              heartRate: Math.max(75, p.vitals.heartRate - 8),
              systolicBP: p.vitals.systolicBP + 12,
              map: p.vitals.map + 9,
              cvp: p.vitals.cvp + 2,
              cardiacOutput: Number((p.vitals.cardiacOutput + 0.6).toFixed(1)),
              urineOutputPerHour: p.vitals.urineOutputPerHour + 14,
            },
            defaultInterventions: {
              ...p.defaultInterventions,
              crystalloidBolusMl: p.defaultInterventions.crystalloidBolusMl + 500,
            },
          };
        } else if (crisisType === 'normalize') {
          // Return to safe hemodynamic baseline
          return {
            ...p,
            vitals: {
              ...p.vitals,
              heartRate: 78,
              systolicBP: 122,
              diastolicBP: 74,
              map: 90,
              spo2: 98,
              respRate: 16,
              temperatureC: 37.0,
              cvp: 7,
              etco2: 38,
              cardiacOutput: 5.6,
              svr: 1100,
              urineOutputPerHour: 60,
            },
            labs: {
              ...p.labs,
              lactate: 1.2,
              ph: 7.40,
              baseExcess: 0.2,
              wbc: 8.5,
              procalcitonin: 0.3,
            },
          };
        }
        return p;
      })
    );
  };

  // Handler: Apply Simulation to Live Twin
  const handleApplySimulation = (
    newVitals: TelemetryVitals,
    newLabs: LabPanel,
    appliedInterventions: InterventionsState
  ) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.profile.id !== currentPatientId) return p;
        return {
          ...p,
          vitals: newVitals,
          labs: newLabs,
          defaultInterventions: appliedInterventions,
        };
      })
    );
    setActiveTab('cockpit');
  };

  // Handler: Reset patient to original baseline
  const handleResetToBaseline = () => {
    const original = INITIAL_PATIENTS.find((p) => p.profile.id === currentPatientId);
    if (!original) return;
    setPatients((prev) =>
      prev.map((p) => (p.profile.id === currentPatientId ? { ...original } : p))
    );
  };

  // AI Endpoint Handlers
  const handleRequestAiSepsisAnalysis = async () => {
    setIsAiLoading(true);
    setModalType('sepsis-analysis');
    setIsModalOpen(true);
    try {
      const res = await fetch('/api/clinical/sepsis-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: currentPatient,
          vitals: currentVitals,
          labs: currentLabs,
          scores: currentScores,
          organs: currentOrgans,
        }),
      });
      const data = await res.json();
      setModalData(data.data);
    } catch (err) {
      console.error('Failed to call sepsis analysis API:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleRequestSimulationCritique = async (
    outcome: SimulatedOutcome,
    plan: InterventionsState
  ) => {
    setIsAiLoading(true);
    setModalType('simulation-critique');
    setIsModalOpen(true);
    try {
      const res = await fetch('/api/clinical/counterfactual-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: currentPatient,
          baselineVitals: currentVitals,
          baselineLabs: currentLabs,
          interventions: plan,
          simulatedOutcome: outcome,
        }),
      });
      const data = await res.json();
      setModalData(data.data);
    } catch (err) {
      console.error('Failed to call simulation critique API:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleRequestSbarHandover = async () => {
    setIsAiLoading(true);
    setModalType('sbar-handover');
    setIsModalOpen(true);
    try {
      const res = await fetch('/api/clinical/scribe-handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: currentPatient,
          vitals: currentVitals,
          labs: currentLabs,
          scores: currentScores,
          interventions: currentInterventions,
        }),
      });
      const data = await res.json();
      setModalData(data.data);
    } catch (err) {
      console.error('Failed to call SBAR scribe API:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <AuraLanding
        patients={patients}
        currentPatientId={currentPatientId}
        onSelectPatient={setCurrentPatientId}
        patient={currentPatient}
        vitals={currentVitals}
        labs={currentLabs}
        scores={currentScores}
        organs={currentOrgans}
        currentInterventions={currentInterventions}
        onTriggerCrisis={handleTriggerCrisis}
        onRequestAiSepsisAnalysis={handleRequestAiSepsisAnalysis}
        onRequestSimulationCritique={handleRequestSimulationCritique}
        onApplySimulation={handleApplySimulation}
        onResetToBaseline={handleResetToBaseline}
        isAiLoading={isAiLoading}
      />

      {/* AI Clinical Reasoning & Simulation Evaluation Modal */}
      <ClinicalIntelligenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        data={modalData}
        isLoading={isAiLoading}
        patientName={currentPatient.name}
      />
    </>
  );
}
