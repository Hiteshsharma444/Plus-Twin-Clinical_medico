import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Activity,
  Heart,
  Droplets,
  Wind,
  ShieldAlert,
  Search,
  FileText,
  Sliders,
  RefreshCw,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type {
  ClinicalScores,
  LabPanel,
  OrganTwinStatus,
  PatientProfile,
  TelemetryVitals,
} from '../../types/clinical.js';
import type { PatientTwinState } from '../../data/mockPatients.js';
import { HolographicOrganViewport } from '../digitaltwin/HolographicOrganViewport.js';
import { WaveformMonitor } from '../telemetry/WaveformMonitor.js';

interface InboxMockupProps {
  patient: PatientProfile;
  vitals: TelemetryVitals;
  labs: LabPanel;
  scores: ClinicalScores;
  organs: OrganTwinStatus[];
  patients: PatientTwinState[];
  currentPatientId: string;
  onSelectPatient: (id: string) => void;
  onRequestAiConsult: () => void;
  onOpenSimulator: () => void;
}

export function InboxMockup({
  patient,
  vitals,
  labs,
  scores,
  organs,
  patients,
  currentPatientId,
  onSelectPatient,
  onRequestAiConsult,
  onOpenSimulator,
}: InboxMockupProps) {
  const [activeViewportMode, setActiveViewportMode] = useState<'hologram' | 'waveform' | 'ai-summary'>('hologram');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleFetchAiSummary = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/clinical/sepsis-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient, vitals, labs, scores, organs }),
      });
      const data = await res.json();
      if (data?.data?.diagnosticSynthesis) {
        setAiSummary(data.data.diagnosticSynthesis);
      }
    } catch (err) {
      console.warn('AI consult fetch failed:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const defaultSynthesis = `${patient.name} (${patient.age}yo) demonstrates ${
    scores.riskCategory.toUpperCase()
  } sepsis risk (${scores.sepsisRiskScore}%). Shock Index of ${scores.shockIndex} and serum lactate (${
    labs.lactate
  } mmol/L) indicate systemic microcirculatory hypoperfusion requiring aggressive hemodynamic bundle resuscitation.`;

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24" id="cockpit-window">
      {/* Outer macOS Cockpit Mockup Window */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8, ease: 'easeOut' }}
        className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0e1014]/90 backdrop-blur-2xl shadow-2xl"
      >
        {/* Title Bar with Traffic Lights */}
        <div className="h-10 px-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57] inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e] inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#28c840] inline-block shadow-sm" />
          </div>
          <span className="text-xs text-white/50 font-medium font-mono">
            Pulse-Twin Omni — Bed {patient.bedNumber}: {patient.name} ({scores.riskCategory.toUpperCase()} RISK)
          </span>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="hidden sm:inline">LIVE 100Hz</span>
          </div>
        </div>

        {/* 12-Column ICU Cockpit Body */}
        <div className="grid grid-cols-12 h-[580px]">
          {/* Sidebar: Patient Bed Switcher & Organ Systems (col-span-3) */}
          <div className="col-span-3 border-r border-white/10 bg-black/30 p-4 flex flex-col justify-between hidden sm:flex">
            <div>
              {/* AI Sepsis Consult Action Button */}
              <button
                type="button"
                onClick={onRequestAiConsult}
                className="w-full rounded-lg bg-white text-black text-xs font-semibold px-3 py-2 flex items-center justify-center gap-2 shadow-sm hover:bg-white/90 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#3D81E3]" />
                <span>AI Sepsis Consult</span>
              </button>

              {/* Patient Bed Selectors */}
              <div className="mt-5 space-y-1 text-xs">
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold block mb-2 px-1">
                  Active ICU Beds
                </span>
                {patients.map((p) => {
                  const isActive = p.profile.id === currentPatientId;
                  return (
                    <button
                      key={p.profile.id}
                      type="button"
                      onClick={() => onSelectPatient(p.profile.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                        isActive
                          ? 'bg-white/10 text-white font-medium border border-cyan-500/30'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-semibold text-xs text-white">
                          Bed {p.profile.bedNumber}: {p.profile.name}
                        </div>
                        <div className="text-[10px] text-white/50 truncate">
                          {p.profile.admissionDiagnosis}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          p.vitals.map < 65
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-emerald-950 text-emerald-300'
                        }`}
                      >
                        {p.vitals.map < 65 ? 'SHOCK' : 'STABLE'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Organ System Perfusion Status */}
            <div className="pt-4 border-t border-white/10">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold block mb-2 px-1">
                Organ Twin Status
              </span>
              <div className="space-y-1.5 text-xs text-white/60 px-1">
                {organs.map((organ) => (
                  <div key={organ.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            organ.stressLevel === 'critical'
                              ? '#ef4444'
                              : organ.stressLevel === 'failing'
                              ? '#00d2ff'
                              : organ.stressLevel === 'compensated'
                              ? '#f59e0b'
                              : '#10b981',
                        }}
                      />
                      <span>{organ.name}</span>
                    </div>
                    <span className="font-mono text-[10px] tabular-nums text-white/50">
                      {organ.perfusionIndex}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Telemetry Vitals & Biomarkers Stream (col-span-4) */}
          <div className="col-span-12 sm:col-span-4 border-r border-white/10 flex flex-col bg-black/20">
            {/* Search Header */}
            <div className="p-3 border-b border-white/10 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter vitals & biomarkers..."
                className="w-full bg-transparent text-xs text-white placeholder-white/40 outline-none font-mono"
              />
            </div>

            {/* Vitals Telemetry List */}
            <div className="overflow-y-auto divide-y divide-white/5 flex-1 p-2 space-y-2">
              {/* HR Card */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    <span className="text-xs text-white/70">Heart Rate</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">Sinus Rhythm</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-white tabular-nums">
                    {vitals.heartRate}
                  </span>
                  <span className="text-xs font-mono text-white/40">bpm</span>
                </div>
              </div>

              {/* BP & MAP Card */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs text-white/70">Arterial BP &amp; MAP</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      vitals.map < 65 ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'
                    }`}
                  >
                    MAP {vitals.map} mmHg
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-white tabular-nums">
                    {vitals.systolicBP}/{vitals.diastolicBP}
                  </span>
                  <span className="text-xs font-mono text-white/40">
                    SI: {scores.shockIndex}
                  </span>
                </div>
              </div>

              {/* Oxygenation Card */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Wind className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-xs text-white/70">SpO2 / Respiration</span>
                  </div>
                  <span className="text-[11px] font-mono text-white/40">
                    {vitals.respRate} bpm
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-white tabular-nums">
                    {vitals.spo2}%
                  </span>
                  <span className="text-xs font-mono text-white/40">
                    FiO2 {(labs.fio2 * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Serum Lactate Card */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs text-white/70">Serum Lactate</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400/90">
                    Normal &lt; 2.0
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span
                    className={`text-xl font-bold font-mono tabular-nums ${
                      labs.lactate > 2 ? 'text-amber-300' : 'text-white'
                    }`}
                  >
                    {labs.lactate}
                  </span>
                  <span className="text-xs font-mono text-white/40">mmol/L</span>
                </div>
              </div>

              {/* Sepsis Risk Probability */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs text-white/70">Sepsis-3 SOFA</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40">
                    qSOFA: {scores.qSOFA}/3
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-cyan-300 tabular-nums">
                    {scores.sofa} / 24
                  </span>
                  <span className="text-xs font-mono text-rose-400 font-semibold">
                    {scores.sepsisRiskScore}% PROBABILITY
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reader / Viewport & Clinical Reasoning Pane (col-span-5) */}
          <div className="hidden sm:flex col-span-5 flex-col justify-between p-5 bg-black/10 overflow-y-auto">
            <div>
              {/* Toolbar: Viewport selection */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveViewportMode('hologram')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      activeViewportMode === 'hologram'
                        ? 'bg-white text-black font-semibold'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    3D Hologram HUD
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveViewportMode('waveform')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      activeViewportMode === 'waveform'
                        ? 'bg-white text-black font-semibold'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Oscilloscope
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveViewportMode('ai-summary')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      activeViewportMode === 'ai-summary'
                        ? 'bg-white text-black font-semibold'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    AI Reasoning
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onOpenSimulator}
                  className="px-2.5 py-1 rounded-md border border-cyan-500/30 text-cyan-300 text-xs font-mono hover:bg-cyan-950/40 transition-colors flex items-center gap-1"
                  title="Open Counterfactual Simulator"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Simulator</span>
                </button>
              </div>

              {/* Viewport Content */}
              {activeViewportMode === 'hologram' ? (
                <div className="rounded-xl overflow-hidden border border-white/10 h-[340px] bg-slate-950/80">
                  <HolographicOrganViewport
                    patient={patient}
                    vitals={vitals}
                    labs={labs}
                    scores={scores}
                    organs={organs}
                  />
                </div>
              ) : activeViewportMode === 'waveform' ? (
                <div className="rounded-xl overflow-hidden border border-white/10 h-[340px] bg-slate-950/90">
                  <WaveformMonitor
                    vitals={vitals}
                    alarmActive={scores.riskCategory === 'critical'}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#A4F4FD]" />
                        <span className="text-xs font-semibold text-[#A4F4FD]">
                          Summary by Pulse-Twin AI
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleFetchAiSummary}
                        disabled={isAiLoading}
                        className="text-[10px] inline-flex items-center gap-1 text-white/50 hover:text-white transition-colors"
                      >
                        <RefreshCw className={`w-3 h-3 ${isAiLoading ? 'animate-spin' : ''}`} />
                        <span>{isAiLoading ? 'Consulting Gemini...' : 'Refresh AI'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed">
                      {aiSummary || defaultSynthesis}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-xs space-y-2 text-white/70">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Surviving Sepsis 1-Hour Protocol Checklist</span>
                    </div>
                    <ul className="space-y-1 pl-4 list-disc text-white/60">
                      <li>Measure serum lactate level (Current: {labs.lactate} mmol/L)</li>
                      <li>Obtain blood cultures prior to administration of antibiotics</li>
                      <li>Administer broad-spectrum empiric antimicrobials</li>
                      <li>Administer 30 mL/kg crystalloids for hypotension (MAP &lt; 65)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Quick-Launch Bar */}
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <a
                href="#hologram-landscape"
                className="text-cyan-400 hover:text-cyan-300 font-mono font-medium flex items-center gap-1 group cursor-pointer"
              >
                <span>Full Landscape 3D Viewport</span>
                <span className="transition-transform duration-200 group-hover:translate-y-0.5">↓</span>
              </a>
              <button
                type="button"
                onClick={onRequestAiConsult}
                className="text-white/70 hover:text-white font-mono font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>AI Consult Report</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
