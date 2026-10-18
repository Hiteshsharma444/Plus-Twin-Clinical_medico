import React from 'react';
import {
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Gauge,
  BarChart2,
  Clock,
  Sparkles,
} from 'lucide-react';
import type {
  ClinicalScores,
  HistoricalDataPoint,
  LabPanel,
  TelemetryVitals,
} from '../../types/clinical.js';

interface SepsisRiskPanelProps {
  scores: ClinicalScores;
  vitals: TelemetryVitals;
  labs: LabPanel;
  historyTimeline: HistoricalDataPoint[];
  onRequestAiConsult: () => void;
  isAiLoading: boolean;
}

export const SepsisRiskPanel: React.FC<SepsisRiskPanelProps> = ({
  scores,
  vitals,
  labs,
  historyTimeline,
  onRequestAiConsult,
  isAiLoading,
}) => {
  const { sepsisRiskScore, riskCategory, sofa, sofaSubscores, qSOFA, qSOFACriteria, news2, shockIndex } =
    scores;

  const categoryColor =
    riskCategory === 'critical'
      ? 'text-red-400 bg-red-950/40 border-red-800'
      : riskCategory === 'high'
      ? 'text-orange-400 bg-orange-950/40 border-orange-800'
      : riskCategory === 'moderate'
      ? 'text-amber-400 bg-amber-950/40 border-amber-800'
      : 'text-emerald-400 bg-emerald-950/40 border-emerald-800';

  const riskGradient =
    riskCategory === 'critical'
      ? 'from-red-500 to-rose-600'
      : riskCategory === 'high'
      ? 'from-orange-500 to-amber-600'
      : riskCategory === 'moderate'
      ? 'from-amber-400 to-yellow-500'
      : 'from-emerald-400 to-teal-500';

  return (
    <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-4 font-mono text-xs select-none space-y-4">
      {/* Sepsis Predictive Engine Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-950/50 border border-red-800/60 text-red-400">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>PREDICTIVE SEPSIS RISK ENGINE</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                OMNI-V2.6
              </span>
            </div>
            <div className="text-[10px] text-slate-400">SIRS • Lactate Kinetics • Delta-SOFA Algorithm</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onRequestAiConsult}
          disabled={isAiLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-950/50 transition-all text-xs disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
          <span>{isAiLoading ? 'REASONING...' : 'AI CLINICAL REASONING'}</span>
        </button>
      </div>

      {/* Main Scoring Cockpit: Gauge & Critical Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
        {/* Risk Probability Meter (col-span-5) */}
        <div className={`md:col-span-5 rounded-xl border p-3 flex flex-col justify-between ${categoryColor}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              <span>Sepsis Risk Probability</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-black/40">
              {riskCategory} RISK
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black tracking-tight">{sepsisRiskScore}%</span>
            <span className="text-xs text-slate-300">shock conversion risk</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden mb-2">
            <div className={`h-full bg-gradient-to-r ${riskGradient}`} style={{ width: `${sepsisRiskScore}%` }} />
          </div>

          <div className="text-[10px] text-slate-300/90 leading-tight">
            {riskCategory === 'critical' && (
              <span className="flex items-center gap-1 text-red-300 font-semibold">
                <AlertCircle className="w-3 h-3 shrink-0" />
                CRITICAL: MAP &lt; 65 mmHg with severe hyperlactatemia. High mortality risk.
              </span>
            )}
            {riskCategory === 'high' && (
              <span className="flex items-center gap-1 text-orange-300 font-semibold">
                <ShieldAlert className="w-3 h-3 shrink-0" />
                HIGH RISK: Rapid multi-organ decompensation warning in progress.
              </span>
            )}
            {riskCategory === 'moderate' && (
              <span className="flex items-center gap-1 text-amber-300">
                <ShieldAlert className="w-3 h-3 shrink-0" />
                MODERATE: Compensated systemic inflammatory response with tissue stress.
              </span>
            )}
            {riskCategory === 'low' && (
              <span className="flex items-center gap-1 text-emerald-300">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                LOW RISK: Organ perfusion stabilized post-resuscitation.
              </span>
            )}
          </div>
        </div>

        {/* Quick Scores Matrix: qSOFA, NEWS2, Shock Index, SOFA (col-span-7) */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Full SOFA Score */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 font-semibold">SOFA SCORE</div>
            <div className="text-2xl font-bold text-slate-100 my-0.5">
              {sofa} <span className="text-xs text-slate-500">/ 24</span>
            </div>
            <div className="text-[9px] text-slate-400">
              {sofa >= 6 ? 'Severe Organ Failure' : sofa >= 2 ? 'Sepsis Criterion' : 'Baseline normal'}
            </div>
          </div>

          {/* qSOFA Score */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 font-semibold">qSOFA SCORE</div>
            <div className={`text-2xl font-bold my-0.5 ${qSOFA >= 2 ? 'text-red-400' : 'text-slate-100'}`}>
              {qSOFA} <span className="text-xs text-slate-500">/ 3</span>
            </div>
            <div className="text-[9px] text-slate-400">
              {qSOFA >= 2 ? 'Positive (&ge; 2 criteria)' : 'Low bedside risk'}
            </div>
          </div>

          {/* NEWS2 Score */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 font-semibold">NEWS2 SCORE</div>
            <div className={`text-2xl font-bold my-0.5 ${news2 >= 7 ? 'text-red-400' : news2 >= 5 ? 'text-amber-400' : 'text-slate-100'}`}>
              {news2}
            </div>
            <div className="text-[9px] text-slate-400">
              {news2 >= 7 ? 'Emergency ICU' : news2 >= 5 ? 'Urgent Review' : 'Ward routine'}
            </div>
          </div>

          {/* Shock Index */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 font-semibold">SHOCK INDEX</div>
            <div className={`text-2xl font-bold my-0.5 ${shockIndex > 0.9 ? 'text-red-400' : 'text-slate-100'}`}>
              {shockIndex}
            </div>
            <div className="text-[9px] text-slate-400">
              {shockIndex > 0.9 ? 'Occult Shock (&gt;0.9)' : 'Normal (0.5-0.7)'}
            </div>
          </div>
        </div>
      </div>

      {/* SOFA Organ Subscores Breakdown */}
      <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-300 flex items-center gap-1.5 text-xs">
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>SOFA 6-ORGAN DYSFUNCTION SUB-SCORES</span>
          </span>
          <span className="text-[10px] text-slate-500">Surviving Sepsis Vincent Scale (0-4 pts/organ)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {/* Respiration */}
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-slate-400">RESP</span>
              <span className={`font-bold ${sofaSubscores.respiration > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {sofaSubscores.respiration} / 4
              </span>
            </div>
            <div className="text-[9px] text-slate-400 truncate">P/F {Math.round(labs.pao2 / Math.max(0.21, labs.fio2))}</div>
          </div>

          {/* Coagulation */}
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-slate-400">COAG</span>
              <span className={`font-bold ${sofaSubscores.coagulation > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {sofaSubscores.coagulation} / 4
              </span>
            </div>
            <div className="text-[9px] text-slate-400 truncate">Plt {labs.platelets}k</div>
          </div>

          {/* Liver */}
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-slate-400">LIVER</span>
              <span className={`font-bold ${sofaSubscores.liver > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {sofaSubscores.liver} / 4
              </span>
            </div>
            <div className="text-[9px] text-slate-400 truncate">Bili {labs.bilirubin} mg</div>
          </div>

          {/* Cardiovascular */}
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-slate-400">CARDIO</span>
              <span className={`font-bold ${sofaSubscores.cardiovascular > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {sofaSubscores.cardiovascular} / 4
              </span>
            </div>
            <div className="text-[9px] text-slate-400 truncate">MAP {vitals.map} mmHg</div>
          </div>

          {/* CNS */}
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-slate-400">CNS</span>
              <span className={`font-bold ${sofaSubscores.cns > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {sofaSubscores.cns} / 4
              </span>
            </div>
            <div className="text-[9px] text-slate-400 truncate">
              {qSOFACriteria.alteredMentalState ? 'Altered' : 'Alert'}
            </div>
          </div>

          {/* Renal */}
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-slate-400">RENAL</span>
              <span className={`font-bold ${sofaSubscores.renal > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {sofaSubscores.renal} / 4
              </span>
            </div>
            <div className="text-[9px] text-slate-400 truncate">Cr {labs.creatinine} mg</div>
          </div>
        </div>
      </div>

      {/* Historical Telemetry Trajectory Chart (Recharts) */}
      <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold text-slate-300 flex items-center gap-1.5 text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>12-HOUR CLINICAL TRAJECTORY (MAP vs LACTATE vs RISK %)</span>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-red-500" />
              <span className="text-red-400">Sepsis Risk (%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-cyan-400" />
              <span className="text-cyan-300">MAP (mmHg)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-amber-400" />
              <span className="text-amber-300">Lactate (mmol/L &times;10)</span>
            </div>
          </div>
        </div>

        <div className="h-44 w-full relative">
          <svg viewBox="0 0 600 160" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="mapGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines & Y Axis Labels */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = 140 - (val / 100) * 125;
              return (
                <g key={val}>
                  <line x1="40" y1={y} x2="580" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                  <text x="32" y={y + 3} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Plotting Areas & Lines */}
            {(() => {
              const count = historyTimeline.length;
              if (count === 0) return null;
              const getX = (idx: number) => 40 + (idx / Math.max(1, count - 1)) * 540;
              const getY = (val: number) => 140 - (Math.max(0, Math.min(100, val)) / 100) * 125;

              // Generate Path strings
              const riskPoints = historyTimeline.map((d, i) => `${getX(i)},${getY(d.sepsisRisk)}`);
              const riskAreaPath = `M ${getX(0)},140 L ${riskPoints.join(' L ')} L ${getX(count - 1)},140 Z`;
              const riskLinePath = `M ${riskPoints.join(' L ')}`;

              const mapPoints = historyTimeline.map((d, i) => `${getX(i)},${getY(d.map)}`);
              const mapAreaPath = `M ${getX(0)},140 L ${mapPoints.join(' L ')} L ${getX(count - 1)},140 Z`;
              const mapLinePath = `M ${mapPoints.join(' L ')}`;

              const lactatePoints = historyTimeline.map((d, i) => `${getX(i)},${getY(d.lactate * 10)}`);
              const lactateLinePath = `M ${lactatePoints.join(' L ')}`;

              return (
                <>
                  {/* Sepsis Risk Area & Line */}
                  <path d={riskAreaPath} fill="url(#riskGradient)" />
                  <path d={riskLinePath} fill="none" stroke="#ef4444" strokeWidth="2.5" />

                  {/* MAP Area & Line */}
                  <path d={mapAreaPath} fill="url(#mapGradient)" />
                  <path d={mapLinePath} fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 2" />

                  {/* Lactate Line */}
                  <path d={lactateLinePath} fill="none" stroke="#f59e0b" strokeWidth="1.8" />

                  {/* Point circles & X labels */}
                  {historyTimeline.map((d, i) => {
                    const x = getX(i);
                    const yRisk = getY(d.sepsisRisk);
                    const yMap = getY(d.map);
                    return (
                      <g key={i} className="group cursor-pointer">
                        <circle cx={x} cy={yRisk} r="3.5" fill="#ef4444" stroke="#030712" strokeWidth="1.5" />
                        <circle cx={x} cy={yMap} r="3" fill="#06b6d4" stroke="#030712" strokeWidth="1.5" />
                        <text x={x} y="154" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
                          {d.timestamp}
                        </text>
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>
      </div>
    </div>
  );
};
