import React from 'react';
import { motion } from 'motion/react';
import { SectionEyebrow } from './Primitives.js';

const CHIPS = [
  'Lactate Kinetics',
  'Fluid Responsiveness',
  'Vasopressor Titration',
  'Microvascular Perfusion',
];

const CLINICAL_TRIAGE_GROUPS = [
  {
    category: 'Priority',
    count: 1,
    color: '#ffffff',
    subtitle: 'Vasoplegic Septic Shock',
    items: [
      'Bed 04: Marcus Vance — MAP 58 mmHg (Target ≥ 65)',
      'Action: Titrate Norepinephrine + 500 mL crystalloid bolus',
    ],
  },
  {
    category: 'Follow-up',
    count: 2,
    color: '#e5e5e5',
    subtitle: 'Acute Renal Hypoperfusion',
    items: [
      'Bed 02: Elena Rostova — Creatinine 2.4 mg/dL',
      'Action: Oliguria protocol evaluation & Renal Resistive Index',
    ],
  },
  {
    category: 'Updates',
    count: 3,
    color: '#a3a3a3',
    subtitle: 'Gas Exchange & ARDS Risk',
    items: [
      'Bed 08: Arthur Pendelton — PaO2/FiO2 ratio 188 (Moderate)',
      'Action: Lung protective ventilation (6 mL/kg PBW, PEEP 10)',
    ],
  },
  {
    category: 'Stabilized',
    count: 4,
    color: '#525252',
    subtitle: 'Resolved Microcirculatory Debt',
    items: [
      'Bed 01: Rachel Kim — Lactate cleared from 4.2 to 1.1 mmol/L',
      'Action: Weaning vasopressor infusion in progress',
    ],
  },
];

export function FeatureTriage() {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28" id="triage">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* Left Column Motion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionEyebrow label="Triage" tag="AI-native" />
          <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02] text-white">
            Detect organ dysfunction
            <br />
            in a single pass.
          </h2>
          <p className="mt-6 text-white/60 text-base leading-[1.6] max-w-md">
            Pulse-Twin reads continuous ICU telemetry, arterial wave dynamics, and metabolic biomarkers
            to route clinicians straight to the high-yield interventions before irreversible tissue
            ischemia sets in.
          </p>

          {/* Action Chips */}
          <div className="mt-8 flex flex-wrap gap-2.5">
            {CHIPS.map((chip) => (
              <span
                key={chip}
                className="text-xs text-white/70 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03]"
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Liquid-glass container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="liquid-glass rounded-2xl p-5 border border-white/10 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <span className="text-xs font-mono text-cyan-300 tracking-wider uppercase">
              Today · 4 ICU Beds Triaged
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>

          <div className="space-y-3">
            {CLINICAL_TRIAGE_GROUPS.map((group) => (
              <div
                key={group.category}
                className="liquid-glass rounded-lg p-3.5 border border-white/5 transition-all hover:border-white/20"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: group.color }}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: group.color }}
                    >
                      {group.category}
                    </span>
                    <span className="text-[11px] text-white/40">· {group.subtitle}</span>
                  </div>
                  <span className="text-[11px] font-mono text-white/40 tabular-nums">
                    ({group.count})
                  </span>
                </div>

                <div className="space-y-1 pl-4 text-xs text-white/70 font-mono">
                  {group.items.map((item, i) => (
                    <div key={i} className="truncate">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
