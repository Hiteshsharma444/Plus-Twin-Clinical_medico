import React from 'react';
import {
  Users,
  AlertOctagon,
  Zap,
  Activity,
  HeartPulse,
  Syringe,
  CheckCircle,
} from 'lucide-react';
import type { PatientProfile, TelemetryVitals } from '../../types/clinical.js';
import type { PatientTwinState } from '../../data/mockPatients.js';

interface PatientHeaderProps {
  patients: PatientTwinState[];
  currentPatientId: string;
  onSelectPatient: (id: string) => void;
  patient: PatientProfile;
  vitals: TelemetryVitals;
  onTriggerCrisis: (crisisType: 'crash' | 'fluid-challenge' | 'antibiotic' | 'normalize') => void;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  patients,
  currentPatientId,
  onSelectPatient,
  patient,
  vitals,
  onTriggerCrisis,
}) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs select-none shadow-xl space-y-3">
      {/* Patient Bed Navigation Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800 pb-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/80 font-bold text-xs shrink-0">
            <Users className="w-3.5 h-3.5" />
            <span>ICU BEDS</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {patients.map((p) => {
              const isSelected = p.profile.id === currentPatientId;
              const hasCriticalVitals = p.vitals.map < 65 || p.labs.lactate >= 4.0;

              return (
                <button
                  key={p.profile.id}
                  type="button"
                  onClick={() => onSelectPatient(p.profile.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all border text-[11px] ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      hasCriticalVitals ? 'bg-red-500 animate-ping' : 'bg-emerald-400'
                    }`}
                  />
                  <span>{p.profile.bedNumber}: {p.profile.name.split(' ')[0]}</span>
                  {hasCriticalVitals && (
                    <span className="text-[9px] px-1 rounded bg-red-950 text-red-300 border border-red-800">
                      CRIT
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clinical Scenario Injection Suite */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[10px] text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>CRISIS:</span>
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onTriggerCrisis('crash')}
              className="flex items-center gap-1 px-2 py-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] font-semibold transition-colors shadow-sm"
              title="Simulate sudden septic vasoplegic crash (MAP dips to 48 mmHg)"
            >
              <AlertOctagon className="w-3 h-3 text-red-400" />
              <span>Crash</span>
            </button>

            <button
              type="button"
              onClick={() => onTriggerCrisis('fluid-challenge')}
              className="flex items-center gap-1 px-2 py-1 rounded bg-sky-950/60 hover:bg-sky-900 text-sky-300 border border-sky-800 text-[11px] font-semibold transition-colors shadow-sm"
              title="Inject rapid 500 mL crystalloid bolus challenge"
            >
              <Syringe className="w-3 h-3 text-sky-400" />
              <span>Fluid Bolus</span>
            </button>

            <button
              type="button"
              onClick={() => onTriggerCrisis('normalize')}
              className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-semibold transition-colors shadow-sm"
              title="Restore stable hemodynamics (MAP 75, Lactate 1.4)"
            >
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Stabilize</span>
            </button>
          </div>
        </div>
      </div>

      {/* Current Patient Clinical Meta Info Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 text-[11px]">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-slate-400">PATIENT: </span>
            <span className="font-bold text-slate-100 text-sm">{patient.name}</span>
            <span className="text-slate-400 ml-1.5">
              ({patient.age}y / {patient.gender} • {patient.weightKg} kg • {patient.heightCm} cm)
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div>
            <span className="text-slate-400">ADMISSION: </span>
            <span className="text-cyan-300 font-semibold">{patient.admissionDiagnosis}</span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div>
            <span className="text-slate-400">CODE: </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-bold text-[10px]">
              {patient.codeStatus}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <div>
            <span>ICU DAY: </span>
            <span className="text-slate-200 font-semibold">{patient.icuDay}</span>
          </div>
          <div>
            <span>ALLERGIES: </span>
            <span className="text-rose-400 font-semibold">{patient.allergies.join(', ') || 'NKDA'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
