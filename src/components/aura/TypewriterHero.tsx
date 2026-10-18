import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ArrowRight, Activity, AlertTriangle } from 'lucide-react';
import { AppleButton, gradientStyle } from './Primitives.js';

export function useTypewriter(text: string, speed = 36, startDelay = 500) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let charIndex = 0;

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        if (charIndex < text.length) {
          charIndex++;
          setDisplayed(text.slice(0, charIndex));
        } else {
          setDone(true);
          if (interval) clearInterval(interval);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

interface TypewriterHeroProps {
  onTriggerCrisis?: (crisisType: 'crash' | 'fluid-challenge' | 'antibiotic' | 'normalize') => void;
  onOpenTelemetry?: () => void;
}

const SCENARIOS = [
  { id: 'crash', label: 'Septic Shock Crash' },
  { id: 'fluid-challenge', label: 'Fluid Challenge (+500mL)' },
  { id: 'antibiotic', label: 'Antibiotic 1-Hr Bundle' },
  { id: 'normalize', label: 'Normalize Perfusion' },
];

export function TypewriterHero({ onTriggerCrisis, onOpenTelemetry }: TypewriterHeroProps) {
  const { displayed, done } = useTypewriter('clinical digital twin\nready for telemetry!', 36, 500);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['crash']);

  const toggleScenario = (id: string) => {
    const next = selectedScenarios.includes(id)
      ? selectedScenarios.filter((s) => s !== id)
      : [...selectedScenarios, id];
    setSelectedScenarios(next);

    if (onTriggerCrisis) {
      if (id === 'crash') onTriggerCrisis('crash');
      else if (id === 'fluid-challenge') onTriggerCrisis('fluid-challenge');
      else if (id === 'antibiotic') onTriggerCrisis('antibiotic');
      else if (id === 'normalize') onTriggerCrisis('normalize');
    }
  };

  return (
    <section className="relative z-10 pt-16 md:pt-28 pb-20 text-center flex flex-col items-center max-w-4xl mx-auto px-6">
      {/* Typewriter intro headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full"
      >
        <h1 className="text-4xl md:text-7xl font-semibold tracking-tight leading-[0.9] mb-8 select-none w-full whitespace-pre-wrap">
          <span className="block text-white">Twin-PULSE</span>
          <span className="block animate-shiny" style={gradientStyle}>
            Revitalized
          </span>
          {!done && (
            <span className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px] animate-blink" />
          )}
        </h1>

        {/* Dynamic typewriter prompt */}
        <div className="min-h-[2.5rem] text-sm md:text-base font-mono text-cyan-300/80 mb-2">
          {displayed}
          {!done && <span className="inline-block w-1.5 h-3.5 bg-cyan-400 ml-1 animate-blink" />}
        </div>
      </motion.div>

      {/* Pulse-Twin Omni AI Core Value Proposition */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-6 text-white/60 max-w-xl text-base leading-[1.6]"
      >
        Pulse-Twin Omni AI is the premier clinical digital twin &amp; ICU telemetry cockpit. It
        leverages multiorgan biophysical simulation, real-time arterial waveforms, and predictive
        Sepsis-3 intelligence into total clarity.
      </motion.div>

      {/* Hero CTA & Platform note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-8 flex flex-col items-center gap-3"
      >
        <AppleButton
          onClick={onOpenTelemetry}
          label="Launch Telemetry Monitor"
          className="shadow-[0_0_24px_rgba(0,210,255,0.25)]"
        />
        <span className="text-xs text-white/40 font-mono">
          Surviving Sepsis Campaign 2026 • Sepsis-3 &amp; SOFA Scoring Compliant
        </span>
      </motion.div>

      {/* Interactive Service Pills Section (Adapted to Acute Clinical Scenarios) */}
      <div className="mt-16 w-full max-w-xl flex flex-col items-center">
        <h3 className="text-2xl font-medium tracking-tight mb-2 text-white">
          Simulate acute ICU scenario?
        </h3>
        <p className="opacity-85 text-white/60 mb-8 text-sm">
          Select all that apply to trigger real-time patient physiological changes
        </p>

        {/* Pill buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {SCENARIOS.map((scenario) => {
            const isSelected = selectedScenarios.includes(scenario.id);
            return (
              <motion.button
                key={scenario.id}
                type="button"
                onClick={() => toggleScenario(scenario.id)}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black shadow-md transform'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Check className="w-4 h-4 text-black stroke-[2.5]" />
                  </motion.span>
                )}
                <span>{scenario.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Dynamic confirmation state with AnimatePresence */}
        <div className="w-full min-h-[48px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {selectedScenarios.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="opacity-50 italic text-xs text-white/50"
              >
                Please click to trigger clinical scenarios above.
              </motion.p>
            ) : (
              <motion.div
                key="selected"
                initial={{ opacity: 0, y: 8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="w-full bg-white/[0.03] border border-cyan-500/20 rounded-2xl px-5 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2 text-xs text-white/80 truncate text-left">
                  <Activity className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
                  <span className="truncate">
                    Active physiological load:{' '}
                    <strong className="text-cyan-300 font-semibold font-mono">
                      {selectedScenarios
                        .map((s) => SCENARIOS.find((item) => item.id === s)?.label)
                        .filter(Boolean)
                        .join(' + ')}
                    </strong>
                  </span>
                </div>
                <a
                  href="#cockpit-window"
                  onClick={onOpenTelemetry}
                  className="inline-flex items-center gap-1.5 text-[#A4F4FD] uppercase text-xs font-semibold hover:text-white transition-colors shrink-0 group cursor-pointer"
                >
                  <span>View Telemetry</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
