import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { AppleButton } from './Primitives.js';

interface FinalCTAProps {
  onOpenCockpit?: () => void;
  onRequestTrial?: () => void;
}

export function FinalCTA({ onOpenCockpit, onRequestTrial }: FinalCTAProps) {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-16 md:py-24 text-center border border-white/10"
      >
        {/* Radial glow overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(600px circle at 50% 0%, rgba(0,210,255,0.15), transparent 70%)',
            opacity: 0.35,
          }}
        />

        {/* Heading */}
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02] text-white">
          Close the sepsis window.
          <br />
          Open the recovery day.
        </h2>

        {/* Supporting Copy */}
        <p className="mt-6 text-white/60 max-w-md mx-auto text-sm leading-[1.6]">
          Join hundreds of intensivists, nurse specialists, and medical directors who treat ICU
          telemetry as an actionable multiorgan digital twin.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <AppleButton
            onClick={onOpenCockpit}
            label="Launch Bedside Cockpit"
            className="shadow-[0_0_24px_rgba(0,210,255,0.25)]"
          />
          <button
            type="button"
            onClick={onRequestTrial}
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/15 text-white text-sm font-medium px-5 py-3 hover:bg-white/5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Request Hospital Trial</span>
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[1px]" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
