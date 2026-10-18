import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  Activity,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';

interface ClinicalIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'sepsis-analysis' | 'simulation-critique' | 'sbar-handover';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  isLoading: boolean;
  patientName: string;
}

export const ClinicalIntelligenceModal: React.FC<ClinicalIntelligenceModalProps> = ({
  isOpen,
  onClose,
  type,
  data,
  isLoading,
  patientName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySbar = () => {
    const textToCopy =
      typeof data?.clinicalSBAR === 'string'
        ? data.clinicalSBAR
        : data?.situation
        ? `SITUATION:\n${data.situation}\n\nBACKGROUND:\n${data.background}\n\nASSESSMENT:\n${data.assessment}\n\nRECOMMENDATION:\n${data.recommendation}`
        : JSON.stringify(data, null, 2);

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>
                  {type === 'sepsis-analysis'
                    ? 'GEMINI 3.8 FLASH • CLINICAL SEPSIS REASONING'
                    : type === 'simulation-critique'
                    ? 'AI COUNTERFACTUAL SIMULATION EVALUATION'
                    : 'ICU SBAR CLINICAL HANDOVER SCRIBE'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                  SERVER-SIDE API
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Patient: {patientName} • Surviving Sepsis 2021/2026 Core Protocols</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
              <div className="text-sm font-semibold text-cyan-300">
                Running Multi-Agent Clinical Intelligence Models...
              </div>
              <div className="text-[11px] text-slate-500 max-w-sm text-center">
                Evaluating hemodynamic stability, microvascular lactate kinetics, and Surviving Sepsis Campaign bundle compliance.
              </div>
            </div>
          ) : data ? (
            <>
              {/* Type 1: Sepsis Analysis */}
              {type === 'sepsis-analysis' && (
                <div className="space-y-4">
                  {/* Synthesis Callout */}
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-cyan-800/60">
                    <div className="font-bold text-cyan-300 text-xs mb-1 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-cyan-400" />
                      <span>DIAGNOSTIC SYNTHESIS & PHENOTYPE</span>
                    </div>
                    <div className="text-slate-200 leading-relaxed text-xs">
                      {data.diagnosticSynthesis || data.sepsisPhenotype}
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-slate-400">
                      Classification:{' '}
                      <span className="text-amber-400">{data.sepsisPhenotype}</span>
                    </div>
                  </div>

                  {/* Top Differential Diagnoses */}
                  {data.topDifferential && (
                    <div className="space-y-2">
                      <div className="font-bold text-slate-300 flex items-center gap-1.5 text-xs">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        <span>DIFFERENTIAL DIAGNOSIS PROBABILITIES</span>
                      </div>
                      <div className="space-y-1.5">
                        {data.topDifferential.map(
                          (item: { condition: string; probability: number; rationale: string }, idx: number) => (
                            <div
                              key={idx}
                              className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col justify-between"
                            >
                              <div className="flex items-center justify-between font-bold text-slate-200">
                                <span>{item.condition}</span>
                                <span className="text-cyan-400">{item.probability}%</span>
                              </div>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full my-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-cyan-500 rounded-full"
                                  style={{ width: `${item.probability}%` }}
                                />
                              </div>
                              <div className="text-[10px] text-slate-400">{item.rationale}</div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Surviving Sepsis Campaign Compliance */}
                  {data.sscCompliance && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                      <div className="font-bold text-slate-300 flex items-center gap-1.5 text-xs">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>SURVIVING SEPSIS CAMPAIGN (SSC) 1-HOUR BUNDLE ADHERENCE</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-slate-950 rounded border border-slate-800">
                          <span className="font-semibold text-slate-300">Blood Cultures: </span>
                          <span className="text-slate-400">{data.sscCompliance.bloodCulturesStatus}</span>
                        </div>
                        <div className="p-2 bg-slate-950 rounded border border-slate-800">
                          <span className="font-semibold text-slate-300">Fluid Bolus: </span>
                          <span className="text-slate-400">{data.sscCompliance.fluidResuscitationStatus}</span>
                        </div>
                        <div className="p-2 bg-slate-950 rounded border border-slate-800">
                          <span className="font-semibold text-slate-300">Vasopressors: </span>
                          <span className="text-slate-400">{data.sscCompliance.vasopressorStatus}</span>
                        </div>
                        <div className="p-2 bg-slate-950 rounded border border-slate-800">
                          <span className="font-semibold text-slate-300">Lactate Clearance: </span>
                          <span className="text-slate-400">{data.sscCompliance.repeatLactateStatus}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Priority Clinical Interventions */}
                  {data.priorityInterventions && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-300 text-xs">
                        PRIORITY ATTENDING RECOMMENDATIONS
                      </div>
                      {data.priorityInterventions.map((rec: string, i: number) => (
                        <div
                          key={i}
                          className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center gap-2 text-slate-300"
                        >
                          <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {i + 1}
                          </span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Clinical SBAR Transfer Summary */}
                  {data.clinicalSBAR && (
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-cyan-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          <span>STRUCTURED SBAR CLINICAL HANDOVER SUMMARY</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleCopySbar}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors"
                        >
                          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? 'COPIED!' : 'COPY SBAR'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800 leading-relaxed whitespace-pre-wrap">
                        {data.clinicalSBAR}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Type 2: Simulation Critique */}
              {type === 'simulation-critique' && (
                <div className="space-y-4">
                  {/* Safety Rating Badge */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">SAFETY & EFFICACY VERDICT</div>
                      <div className="text-xl font-bold flex items-center gap-2 mt-0.5">
                        {data.safetyRating === 'Optimal' ? (
                          <span className="text-emerald-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-5 h-5" />
                            OPTIMAL CLINICAL PROFILE
                          </span>
                        ) : data.safetyRating === 'Dangerous' ? (
                          <span className="text-red-400 flex items-center gap-1.5">
                            <ShieldAlert className="w-5 h-5" />
                            DANGEROUS / HIGH RISK
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-5 h-5" />
                            PROCEED WITH CAUTION
                          </span>
                        )}
                      </div>
                    </div>
                    {data.guidelineAlignmentScore && (
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">GUIDELINE ALIGNMENT</div>
                        <div className="text-2xl font-black text-cyan-400">{data.guidelineAlignmentScore}%</div>
                      </div>
                    )}
                  </div>

                  {/* Pharmacodynamic Critique */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>PHARMACODYNAMIC & RECEPTOR CRITIQUE</span>
                    </div>
                    <div className="text-slate-300 text-xs leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
                      {data.pharmacodynamicCritique}
                    </div>
                  </div>

                  {/* Fluid Balance Evaluation */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                      <Activity className="w-3.5 h-3.5 text-sky-400" />
                      <span>FLUID KINETICS & PULMONARY TRANSUDATION</span>
                    </div>
                    <div className="text-slate-300 text-xs leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
                      {data.fluidBalanceEvaluation}
                    </div>
                  </div>

                  {/* Bundle Recommendations */}
                  {data.bundleRecommendations && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-300 text-xs">
                        DIGITAL TWIN BUNDLE REFINEMENTS
                      </div>
                      {data.bundleRecommendations.map((bRec: string, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-slate-900/70 border border-slate-800 text-slate-300 text-[11px] flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                          <span>{bRec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Type 3: SBAR Handover Note */}
              {type === 'sbar-handover' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-slate-200">ICU SBAR HANDOVER / EHR RECORD</span>
                    <button
                      type="button"
                      onClick={handleCopySbar}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY RECORD'}</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="font-bold text-cyan-300 mb-1">S - SITUATION</div>
                      <div className="text-slate-300 leading-relaxed">{data.situation}</div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="font-bold text-cyan-300 mb-1">B - BACKGROUND</div>
                      <div className="text-slate-300 leading-relaxed">{data.background}</div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="font-bold text-cyan-300 mb-1">A - ASSESSMENT</div>
                      <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {data.assessment}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="font-bold text-cyan-300 mb-1">R - RECOMMENDATION</div>
                      <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {data.recommendation}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">No clinical data available.</div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[10px] text-slate-500">
            Pulse-Twin Omni AI • Clinical Decision Support System (CDSS)
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
