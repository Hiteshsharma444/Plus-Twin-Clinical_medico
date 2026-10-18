import React from 'react';
import { TestTube2, AlertTriangle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import type { LabPanel } from '../../types/clinical.js';

interface LabTelemetryPanelProps {
  labs: LabPanel;
}

export const LabTelemetryPanel: React.FC<LabTelemetryPanelProps> = ({ labs }) => {
  const pfRatio = Math.round(labs.pao2 / Math.max(0.21, labs.fio2));

  const labItems = [
    {
      name: 'Serum Lactate',
      value: labs.lactate,
      unit: 'mmol/L',
      refRange: '< 2.0',
      status: labs.lactate >= 4.0 ? 'critical' : labs.lactate >= 2.0 ? 'high' : 'normal',
      note: labs.lactate >= 2.0 ? 'Tissue hypoperfusion marker' : 'Normal clearance',
    },
    {
      name: 'Procalcitonin',
      value: labs.procalcitonin,
      unit: 'ng/mL',
      refRange: '< 0.5',
      status: labs.procalcitonin >= 2.0 ? 'critical' : labs.procalcitonin >= 0.5 ? 'high' : 'normal',
      note: labs.procalcitonin >= 2.0 ? 'High probability severe bacterial sepsis' : 'Low risk',
    },
    {
      name: 'WBC Count',
      value: labs.wbc,
      unit: 'x10³/µL',
      refRange: '4.5 - 11.0',
      status: labs.wbc >= 15.0 || labs.wbc <= 4.0 ? 'high' : 'normal',
      note: labs.wbc >= 15 ? 'Leukocytosis (SIRS)' : 'Within range',
    },
    {
      name: 'Serum Creatinine',
      value: labs.creatinine,
      unit: 'mg/dL',
      refRange: '0.7 - 1.3',
      status: labs.creatinine >= 2.0 ? 'critical' : labs.creatinine > 1.3 ? 'high' : 'normal',
      note: labs.creatinine >= 2.0 ? 'Acute Kidney Injury (KDIGO Stage 2+)' : 'Stable baseline',
    },
    {
      name: 'Platelet Count',
      value: labs.platelets,
      unit: 'x10³/µL',
      refRange: '150 - 450',
      status: labs.platelets < 100 ? 'critical' : labs.platelets < 150 ? 'high' : 'normal',
      note: labs.platelets < 100 ? 'Thrombocytopenia (DIC risk)' : 'Acceptable hemostasis',
    },
    {
      name: 'Total Bilirubin',
      value: labs.bilirubin,
      unit: 'mg/dL',
      refRange: '0.2 - 1.2',
      status: labs.bilirubin >= 2.0 ? 'critical' : labs.bilirubin > 1.2 ? 'high' : 'normal',
      note: labs.bilirubin > 1.2 ? 'Hepatic dysfunction' : 'Normal excretion',
    },
    {
      name: 'Arterial pH',
      value: labs.ph,
      unit: 'pH',
      refRange: '7.35 - 7.45',
      status: labs.ph < 7.30 ? 'critical' : labs.ph < 7.35 ? 'high' : 'normal',
      note: labs.ph < 7.30 ? 'Severe Metabolic Acidosis' : 'Acid-base balanced',
    },
    {
      name: 'PaO2 / FiO2 Ratio',
      value: pfRatio,
      unit: 'ratio',
      refRange: '> 400',
      status: pfRatio < 200 ? 'critical' : pfRatio < 300 ? 'high' : 'normal',
      note: pfRatio < 200 ? 'Moderate/Severe ARDS' : pfRatio < 300 ? 'Mild ARDS' : 'Preserved gas exchange',
    },
  ];

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs select-none shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <TestTube2 className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">POINT-OF-CARE ICU BIOMARKERS & LAB PANEL</span>
        </div>
        <span className="text-[10px] text-slate-400">STAT LABS • SYMEX / ABL90</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {labItems.map((item, idx) => {
          const isCritical = item.status === 'critical';
          const isHigh = item.status === 'high';

          return (
            <div
              key={idx}
              className={`p-2 rounded-lg border flex flex-col justify-between ${
                isCritical
                  ? 'bg-red-950/30 border-red-800/80 text-red-200'
                  : isHigh
                  ? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
                  : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate">{item.name}</span>
                {isCritical ? (
                  <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                ) : isHigh ? (
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                )}
              </div>

              <div className="my-1 flex items-baseline gap-1">
                <span
                  className={`text-lg font-bold ${
                    isCritical ? 'text-red-400' : isHigh ? 'text-amber-400' : 'text-slate-100'
                  }`}
                >
                  {item.value}
                </span>
                <span className="text-[10px] text-slate-400">{item.unit}</span>
              </div>

              <div className="text-[9px] text-slate-400 truncate">Ref: {item.refRange}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
