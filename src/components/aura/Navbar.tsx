import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Activity, Sparkles, User } from 'lucide-react';
import { LogoMark, AppleButton } from './Primitives.js';

interface NavbarProps {
  currentBed: string;
  onSelectBed?: (bedId: string) => void;
  onRequestAiConsult?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

const NAV_LINKS = [
  { label: 'Telemetry', href: '#cockpit-window' },
  { label: 'Cardiopulmonary 3D', href: '#hologram-landscape' },
  { label: 'Sepsis Risk', href: '#triage' },
  { label: 'What-If Simulator', href: '#simulator' },
  { label: 'Deployment', href: '#pricing' },
];

export function Navbar({
  currentBed,
  onSelectBed,
  onRequestAiConsult,
  onNavigateSection,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative z-30 w-full pt-6 pb-4"
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Left: LogoMark only (No Aura wordmark) */}
        <a href="#" className="flex items-center gap-3 shrink-0 transition-opacity hover:opacity-85">
          <LogoMark className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_12px_rgba(0,210,255,0.4)]" />
        </a>

        {/* Center desktop links: Staggered entrance */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                if (onNavigateSection) {
                  e.preventDefault();
                  onNavigateSection(link.href.replace('#', ''));
                }
              }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              className="text-white/70 text-sm font-medium hover:text-white transition-colors cursor-pointer"
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        {/* Right desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Bed selector chip */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>BED {currentBed}</span>
          </div>

          <AppleButton
            onClick={onRequestAiConsult}
            label="AI Sepsis Consult"
            className="shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          />
        </div>

        {/* Mobile right menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onRequestAiConsult}
            className="p-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs"
            title="AI Consult"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-white/10 bg-[#0c0c0c]/95 backdrop-blur-xl px-6 py-6"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-cyan-300">
                <span>ICU BEDSIDE: BED {currentBed}</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>

              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigateSection) onNavigateSection(link.href.replace('#', ''));
                  }}
                  className="text-white/80 text-base font-medium hover:text-white py-1"
                >
                  {link.label}
                </a>
              ))}

              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <AppleButton full onClick={onRequestAiConsult} label="AI Sepsis Consult" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
