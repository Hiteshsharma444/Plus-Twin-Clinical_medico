import React from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { AppleLogo } from './Primitives.js';

const ICU_MENU_ITEMS = ['File', 'Patient', 'Telemetry', 'Biomarkers', 'Interventions', 'Protocols', 'Help'];

export function MacOSMenuBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
      className="h-10 bg-black/40 backdrop-blur-md border-t border-b border-white/10 relative z-20"
    >
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between text-xs">
        {/* Left: Apple mark + Pulse-Twin Omni + Menu items */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <AppleLogo className="w-3.5 h-3.5 text-white/90" />
            <span className="font-bold text-white tracking-tight font-mono">Pulse-Twin Omni</span>
          </div>

          <div className="flex items-center gap-4 text-white/70">
            {ICU_MENU_ITEMS.map((item, idx) => {
              const hideClass =
                idx > 4 ? 'hidden md:inline' : idx > 2 ? 'hidden sm:inline' : 'inline';
              return (
                <span
                  key={item}
                  className={`hover:text-white cursor-pointer transition-colors ${hideClass}`}
                >
                  {item}
                </span>
              );
            })}
          </div>
        </div>

        {/* Right: Search icon + clock */}
        <div className="flex items-center gap-4 text-white/70">
          <button
            type="button"
            className="hover:text-white transition-colors"
            aria-label="Search telemetry"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] tabular-nums text-cyan-300/90 select-none flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ICU Telemetry Online</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
