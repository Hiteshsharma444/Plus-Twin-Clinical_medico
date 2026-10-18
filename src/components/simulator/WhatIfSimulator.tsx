import React, { useState, useId } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Droplet,
  Pill,
  Wind,
  Layers,
  HeartPulse,
  Activity,
} from 'lucide-react';
import type {
  InterventionsState,
  LabPanel,
  PatientProfile,
  SimulatedOutcome,
  TelemetryVitals,
} from '../../types/clinical.js';
import { simulateInterventions } from '../../utils/clinicalCalculators.js';

interface WhatIfSimulatorProps {
  patient: PatientProfile;
  vitals: TelemetryVitals;
  labs: LabPanel;
  currentInterventions: InterventionsState;
  onApplyInterventionsToTwin: (
    newVitals: TelemetryVitals,
    newLabs: LabPanel,
    appliedInterventions: InterventionsState
  ) => void;
  onResetToBaseline: () => void;
  onRequestSimulationAiCritique: (outcome: SimulatedOutcome, plan: InterventionsState) => void;
  isAiCritiqueLoading: boolean;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  patient,
  vitals,
  labs,
  currentInterventions,
  onApplyInterventionsToTwin,
  onResetToBaseline,
  onRequestSimulationAiCritique,
  isAiCritiqueLoading,
}) => {
  const [interventions, setInterventions] = useState<InterventionsState>({ ...currentInterventions });
  const [timeHorizon, setTimeHorizon] = useState<number>(4);

  // Form input element unique IDs for accessibility
  const fluidId = useId();
  const norepiId = useId();
  const dobutamineId = useId();
  const fio2Id = useId();
  const peepId = useId();

  // Run dynamic simulation model whenever interventions or horizon change
  const outcome: SimulatedOutcome = simulateInterventions(
    vitals,
    labs,
    interventions,
    patient,
    timeHorizon
  );

  const recommended30ml = Math.round(patient.weightKg * 30);

  const handleFluidChange = (val: number) => {
    setInterventions((prev) => ({ ...prev, crystalloidBolusMl: val }));
  };

  const handleNorepiChange = (val: number) => {
    setInterventions((prev) => ({ ...prev, norepinephrineMcgKgMin: Number(val.toFixed(2)) }));
  };

  const handleVasopressinToggle = () => {
    setInterventions((prev) => ({
      ...prev,
      vasopressinUnitsMin: prev.vasopressinUnitsMin > 0 ? 0 : 0.03,
    }));
  };

  const handleDobutamineChange = (val: number) => {
    setInterventions((prev) => ({ ...prev, dobutamineMcgKgMin: val }));
  };

  const handleAntibioticsToggle = () => {
    setInterventions((prev) => ({ ...prev, antibioticsActive: !prev.antibioticsActive }));
  };

  const handleSteroidsToggle = () => {
    setInterventions((prev) => ({ ...prev, hydrocortisoneActive: !prev.hydrocortisoneActive }));
  };

  const handleFio2Change = (val: number) => {
    setInterventions((prev) => ({ ...prev, fio2Percent: val }));
  };

  const handlePeepChange = (val: number) => {
    setInterventions((prev) => ({ ...prev, peepCmH2O: val }));
  };

  // Quick Preset Handlers
  const applyPresetSSCBundle = () => {
    setInterventions({
      crystalloidBolusMl: recommended30ml,
      norepinephrineMcgKgMin: 0.14,
      vasopressinUnitsMin: 0,
      dobutamineMcgKgMin: 0,
      antibioticsActive: true,
      o2DeliveryType: 'High Flow Nasal Cannula',
      fio2Percent: 50,
      peepCmH2O: 6,
      hydrocortisoneActive: false,
    });
  };

  const applyPresetRefractoryShock = () => {
    setInterventions({
      crystalloidBolusMl: recommended30ml,
      norepinephrineMcgKgMin: 0.35,
      vasopressinUnitsMin: 0.03,
      dobutamineMcgKgMin: 5,
      antibioticsActive: true,
      o2DeliveryType: 'Mechanical Ventilation',
      fio2Percent: 70,
      peepCmH2O: 10,
      hydrocortisoneActive: true,
    });
  };

  return (
    <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-4 font-mono text-xs select-none space-y-4">
      {/* Top Simulator Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/50 border border-cyan-800/60 text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>COUNTERFACTUAL &quot;WHAT-IF&quot; TREATMENT SIMULATOR</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                PHYSIO-MODEL
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Frank-Starling Hemodynamics • V1/Alpha-1 Adrenergic Tone • Lactate Clearance
            </div>
          </div>
        </div>

        {/* Time Horizon Selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 px-1.5 font-semibold">HORIZON:</span>
          {[1, 4, 12, 24].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setTimeHorizon(h)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                timeHorizon === h
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {/* Preset Quick Bundles */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800/80">
        <span className="text-[10px] text-slate-400 font-semibold">QUICK BUNDLE PRESETS:</span>
        <button
          type="button"
          onClick={applyPresetSSCBundle}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/50 text-[11px] transition-colors"
        >
          SSC 1-Hr Sepsis Bundle (30 mL/kg + Norepi)
        </button>
        <button
          type="button"
          onClick={applyPresetRefractoryShock}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-800/50 text-[11px] transition-colors"
        >
          Refractory Shock (Dual Vaso + Stress Steroids)
        </button>
        <button
          type="button"
          onClick={onResetToBaseline}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-[11px] ml-auto flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Baseline</span>
        </button>
      </div>

      {/* Intervention Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. IV Crystalloid Resuscitation */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-sky-400" />
                <label htmlFor={fluidId} className="cursor-pointer">IV Crystalloid Bolus</label>
              </span>
              <span className="font-bold text-sky-400 text-xs">
                {interventions.crystalloidBolusMl} mL
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mb-2">
              SSC Target (30 mL/kg): <span className="text-slate-200 font-semibold">{recommended30ml} mL</span>
            </div>
            <input
              id={fluidId}
              type="range"
              min={0}
              max={3000}
              step={250}
              value={interventions.crystalloidBolusMl}
              onChange={(e) => handleFluidChange(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 pt-1">
            <span>0 mL</span>
            <span>1500 mL</span>
            <span>3000 mL</span>
          </div>
        </div>

        {/* 2. Norepinephrine (Levophed) Infusion */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <label htmlFor={norepiId} className="cursor-pointer">Norepinephrine (1st Line)</label>
              </span>
              <span className="font-bold text-rose-400 text-xs">
                {interventions.norepinephrineMcgKgMin} mcg/kg/min
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mb-2">Alpha-1 vasoconstriction to target MAP &ge; 65</div>
            <input
              id={norepiId}
              type="range"
              min={0}
              max={0.8}
              step={0.02}
              value={interventions.norepinephrineMcgKgMin}
              onChange={(e) => handleNorepiChange(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 pt-1">
            <span>0.00</span>
            <span>0.25 (Mod)</span>
            <span>0.80 (High)</span>
          </div>
        </div>

        {/* 3. Vasopressin & Dobutamine */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-200 font-bold flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-purple-400" />
              <span>Vasopressin (0.03 U/min)</span>
            </span>
            <button
              type="button"
              onClick={handleVasopressinToggle}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all border ${
                interventions.vasopressinUnitsMin > 0
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {interventions.vasopressinUnitsMin > 0 ? 'ACTIVE (0.03)' : 'OFF'}
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-300">
                <label htmlFor={dobutamineId} className="cursor-pointer">Dobutamine Inotrope:</label>
              </span>
              <span className="font-bold text-purple-400">{interventions.dobutamineMcgKgMin} mcg/kg/min</span>
            </div>
            <input
              id={dobutamineId}
              type="range"
              min={0}
              max={20}
              step={2.5}
              value={interventions.dobutamineMcgKgMin}
              onChange={(e) => handleDobutamineChange(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 4. Broad-Spectrum Antibiotics (1-Hour Bundle) */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-emerald-400" />
              <span>Empiric Antimicrobials</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Cefepime + Vancomycin within 1-hr bundle
            </div>
          </div>
          <button
            type="button"
            onClick={handleAntibioticsToggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              interventions.antibioticsActive
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {interventions.antibioticsActive ? 'INFUSING' : 'NOT GIVEN'}
          </button>
        </div>

        {/* 5. Ventilator / Oxygenation Support */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>Oxygenation</span>
            </span>
            <span className="text-cyan-300 text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
              {interventions.o2DeliveryType}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">
              <label htmlFor={fio2Id} className="cursor-pointer">FiO2:</label>
            </span>
            <span className="font-bold text-cyan-300">{interventions.fio2Percent}%</span>
            <input
              id={fio2Id}
              type="range"
              min={21}
              max={100}
              step={5}
              value={interventions.fio2Percent}
              onChange={(e) => handleFio2Change(Number(e.target.value))}
              className="w-24 accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">
              <label htmlFor={peepId} className="cursor-pointer">PEEP:</label>
            </span>
            <span className="font-bold text-cyan-300">{interventions.peepCmH2O} cmH2O</span>
            <input
              id={peepId}
              type="range"
              min={5}
              max={18}
              step={1}
              value={interventions.peepCmH2O}
              onChange={(e) => handlePeepChange(Number(e.target.value))}
              className="w-24 accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 6. Stress Dose Corticosteroids */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Hydrocortisone 200mg</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Indicated for vasopressor-refractory shock
            </div>
          </div>
          <button
            type="button"
            onClick={handleSteroidsToggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              interventions.hydrocortisoneActive
                ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {interventions.hydrocortisoneActive ? 'ORDERED' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Simulated Outcomes Dashboard Banner */}
      <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>PROJECTED TRAJECTORY AFTER {timeHorizon} HOURS</span>
          </span>
          <span className="text-[10px] text-slate-400">Deterministic Frank-Starling Model</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Projected MAP */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">PROJECTED MAP</div>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span
                className={`text-xl font-bold ${
                  outcome.predictedVitals.map >= 65 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {outcome.predictedVitals.map}
              </span>
              <span className="text-[10px] text-slate-400">mmHg</span>
              <span
                className={`text-xs font-bold ml-auto ${
                  outcome.deltaMap > 0 ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {outcome.deltaMap > 0 ? `+${outcome.deltaMap}` : outcome.deltaMap}
              </span>
            </div>
            <div className="text-[9px] text-slate-400">
              {outcome.predictedVitals.map >= 65 ? 'Target Reached (>=65)' : 'Hypoperfusion Alert'}
            </div>
          </div>

          {/* Projected Lactate */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">SERUM LACTATE</div>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span
                className={`text-xl font-bold ${
                  outcome.predictedLabs.lactate <= 2.0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {outcome.predictedLabs.lactate}
              </span>
              <span className="text-[10px] text-slate-400">mmol/L</span>
              <span
                className={`text-xs font-bold ml-auto ${
                  outcome.deltaLactate < 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {outcome.deltaLactate > 0 ? `+${outcome.deltaLactate}` : outcome.deltaLactate}
              </span>
            </div>
            <div className="text-[9px] text-slate-400">
              {outcome.deltaLactate < 0 ? 'Clearance Active' : 'Stagnant kinetics'}
            </div>
          </div>

          {/* Projected Sepsis Risk */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">SEPSIS RISK SCORE</div>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span className="text-xl font-bold text-slate-100">
                {outcome.predictedScores.sepsisRiskScore}%
              </span>
              <span
                className={`text-xs font-bold ml-auto ${
                  outcome.deltaRiskScore < 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {outcome.deltaRiskScore > 0
                  ? `+${outcome.deltaRiskScore}%`
                  : `${outcome.deltaRiskScore}%`}
              </span>
            </div>
            <div className="text-[9px] text-slate-400 uppercase">
              {outcome.predictedScores.riskCategory} Risk Tier
            </div>
          </div>

          {/* Fluid Overload & Pulmonary Edema Risk */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">FLUID EXTRAVASATION</div>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span
                className={`text-sm font-bold uppercase ${
                  outcome.fluidOverloadRisk === 'high'
                    ? 'text-red-400'
                    : outcome.fluidOverloadRisk === 'moderate'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {outcome.fluidOverloadRisk} RISK
              </span>
              <span className="text-[9px] text-slate-400 ml-auto">
                {outcome.pulmonaryEdemaProbability}% Edema
              </span>
            </div>
            <div className="text-[9px] text-slate-400">
              CVP: {outcome.predictedVitals.cvp} mmHg
            </div>
          </div>
        </div>

        {/* Clinical Insights List */}
        <div className="mt-3 space-y-1">
          {outcome.clinicalInsights.map((insight, idx) => (
            <div
              key={idx}
              className={`text-[11px] p-1.5 rounded flex items-start gap-1.5 ${
                insight.includes('WARNING') || insight.includes('ALERT') || insight.includes('CRITICAL')
                  ? 'bg-red-950/40 text-red-300 border border-red-900/40'
                  : 'bg-slate-950 text-slate-300 border border-slate-800/60'
              }`}
            >
              {insight.includes('WARNING') || insight.includes('ALERT') || insight.includes('CRITICAL') ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Simulator Execution Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => onRequestSimulationAiCritique(outcome, interventions)}
          disabled={isAiCritiqueLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/60 text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAiCritiqueLoading ? 'animate-spin' : ''}`} />
          <span>{isAiCritiqueLoading ? 'AI VALIDATING...' : 'AI CRITIQUE SIMULATION PLAN'}</span>
        </button>

        <button
          type="button"
          onClick={() =>
            onApplyInterventionsToTwin(outcome.predictedVitals, outcome.predictedLabs, interventions)
          }
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition-all ml-auto"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>APPLY SIMULATION TO LIVE DIGITAL TWIN</span>
        </button>
      </div>
    </div>
  );
};
