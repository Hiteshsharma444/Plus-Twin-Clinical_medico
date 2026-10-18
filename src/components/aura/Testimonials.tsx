import React from 'react';
import { motion } from 'motion/react';

const CLINICAL_TESTIMONIALS = [
  {
    quote:
      '“Pulse-Twin gave our intensivist team four hours of lead time before septic shock decompensation. It reads like ICU medicine from the future.”',
    author: 'Dr. Parker Wilf, MD',
    role: 'Chief of Critical Care Medicine',
    company: 'MERCURY HEALTH ICU',
  },
  {
    quote:
      '“The multiorgan 3D digital twin and counterfactual simulator have completely transformed how our team processes telemetry during morning rounds.”',
    author: 'Dr. Andrew von Rosenbach, MD, PhD',
    role: 'Senior Neuro-Intensivist',
    company: 'COHERE CLINICAL',
  },
  {
    quote:
      '“Triage that actually understands microvascular perfusion kinetics. Our ICU reduced time-to-antibiotics and shock reversal to under 45 minutes.”',
    author: 'Dr. Mathies Christensen, MD',
    role: 'Lead Sepsis Clinical Investigator',
    company: 'LUNAR HEALTHCARE',
  },
];

export function Testimonials() {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28 border-t border-white/10">
      <div className="grid md:grid-cols-3 gap-6">
        {CLINICAL_TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.author}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="liquid-glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between"
          >
            <blockquote className="text-sm text-white/80 leading-[1.6]">
              {t.quote}
            </blockquote>
            <figcaption className="mt-6 pt-5 border-t border-white/10">
              <div className="text-sm font-semibold text-white">{t.author}</div>
              <div className="text-xs text-white/50">{t.role}</div>
              <div className="mt-1 text-xs text-cyan-400 font-semibold tracking-wide uppercase font-mono">
                {t.company}
              </div>
            </figcaption>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
