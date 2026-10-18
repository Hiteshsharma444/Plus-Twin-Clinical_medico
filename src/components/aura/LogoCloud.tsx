import React from 'react';
import { motion } from 'motion/react';

const CLINICAL_STANDARDS = [
  'Surviving Sepsis',
  'SCCM',
  'ESICM',
  'MIMIC-IV',
  'Mayo Clinic',
  'Johns Hopkins',
  'Charité Berlin',
  'Stanford Health',
];

export function LogoCloud() {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-20 text-center">
      <p className="text-xs uppercase tracking-widest text-cyan-300/60 font-mono">
        Validated against clinical benchmarks &amp; academic guidelines
      </p>

      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 items-center">
        {CLINICAL_STANDARDS.map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="text-sm font-semibold tracking-tight text-white/50 hover:text-white transition-colors cursor-default select-none py-2"
          >
            {name}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
