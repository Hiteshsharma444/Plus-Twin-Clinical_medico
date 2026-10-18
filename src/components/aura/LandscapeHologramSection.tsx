import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Wind,
  Activity,
  Maximize2,
  Minimize2,
  Sparkles,
  Zap,
  Gauge,
  Radio,
  Eye,
  Sliders,
  Droplets,
  Layers,
} from 'lucide-react';
import { SectionEyebrow } from './Primitives.js';
import type {
  ClinicalScores,
  LabPanel,
  OrganTwinStatus,
  PatientProfile,
  TelemetryVitals,
} from '../../types/clinical.js';

interface LandscapeHologramSectionProps {
  patient: PatientProfile;
  vitals: TelemetryVitals;
  labs: LabPanel;
  scores: ClinicalScores;
  organs: OrganTwinStatus[];
}

export function LandscapeHologramSection({
  patient,
  vitals,
  labs,
  scores,
  organs,
}: LandscapeHologramSectionProps) {
  const [viewMode, setViewMode] = useState<'unified' | 'heart-focus' | 'lungs-focus'>('unified');
  const [renderMode, setRenderMode] = useState<'sketchfab' | 'bio-canvas'>('sketchfab');
  const [scanlinesActive, setScanlinesActive] = useState(true);
  const [pulseGlow, setPulseGlow] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Canvas references for live waveforms
  const airflowCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ecgMiniCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bioHeartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bioLungsCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sketchfab 3D Embed URLs with clean UI parameters
  const heartEmbedUrl =
    'https://sketchfab.com/models/1582359649694207a2ad6bd0ebd0606a/embed?autostart=1&internal=1&tracking=0&ui_infos=0&ui_watermark_link=0&ui_watermark=0&ui_hint=0&ui_theme=dark&preload=1&transparent=1';
  const lungsEmbedUrl =
    'https://sketchfab.com/models/b11586862e4c4b28af6289aeea104d9c/embed?autostart=1&internal=1&tracking=0&ui_infos=0&ui_watermark_link=0&ui_watermark=0&ui_hint=0&ui_theme=dark&preload=1&transparent=1';

  // Heartbeat pulse flash synchronized with patient's HR
  useEffect(() => {
    const intervalMs = (60 / Math.max(40, vitals.heartRate)) * 1000;
    const timer = setInterval(() => {
      setPulseGlow(true);
      setTimeout(() => setPulseGlow(false), 140);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [vitals.heartRate]);

  // Animated Real-Time Airflow Graph (Inspiratory vs Expiratory Flow)
  useEffect(() => {
    const canvas = airflowCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const renderAirflow = () => {
      t += 0.05;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Grid line
      ctx.strokeStyle = '#0e2238';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Flow curve: Inhalation (positive flow) followed by passive exhalation
      const rr = vitals.respRate;
      const freq = (rr / 60) * Math.PI * 2;

      ctx.strokeStyle = '#00d2ff';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < width; x += 2) {
        const sampleT = t + (x / width) * 4;
        const cycle = (sampleT * freq) % (Math.PI * 2);
        const flow =
          cycle < Math.PI * 0.7
            ? Math.sin(cycle * (Math.PI / (Math.PI * 0.7))) * (height * 0.42)
            : -Math.sin((cycle - Math.PI * 0.7) * (Math.PI / (Math.PI * 1.3))) * (height * 0.28);

        const y = height / 2 - flow;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(renderAirflow);
    };

    renderAirflow();
    return () => cancelAnimationFrame(animId);
  }, [vitals.respRate]);

  // Mini live ECG rhythm strip
  useEffect(() => {
    const canvas = ecgMiniCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const renderEcg = () => {
      t += 0.04;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = '#0e2238';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const hr = vitals.heartRate;
      const freq = (hr / 60) * Math.PI * 2;

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < width; x += 2) {
        const sampleT = t + (x / width) * 4;
        const phase = (sampleT * freq) % (Math.PI * 2);

        let ecgVal = 0;
        if (phase > 0.8 && phase < 1.0) {
          // P wave
          ecgVal = Math.sin((phase - 0.8) * Math.PI * 5) * (height * 0.15);
        } else if (phase >= 1.0 && phase < 1.1) {
          // Q drop
          ecgVal = -0.2 * height;
        } else if (phase >= 1.1 && phase < 1.25) {
          // R peak
          ecgVal = 0.85 * height;
        } else if (phase >= 1.25 && phase < 1.35) {
          // S drop
          ecgVal = -0.35 * height;
        } else if (phase > 1.6 && phase < 2.0) {
          // T wave
          ecgVal = Math.sin((phase - 1.6) * Math.PI * 2.5) * (height * 0.22);
        }

        const y = height / 2 - ecgVal;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(renderEcg);
    };

    renderEcg();
    return () => cancelAnimationFrame(animId);
  }, [vitals.heartRate]);

  // Bio-canvas fallback rendering for heart
  useEffect(() => {
    if (renderMode !== 'bio-canvas') return;
    const canvas = bioHeartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const drawHeart = () => {
      angle += 0.02;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) / 38;

      ctx.save();
      ctx.translate(cx, cy);

      // Pulse scaling
      const pulse = 1 + (pulseGlow ? 0.08 : 0);
      ctx.scale(scale * pulse, -scale * pulse);

      ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 2; t += 0.05) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
      animId = requestAnimationFrame(drawHeart);
    };

    drawHeart();
    return () => cancelAnimationFrame(animId);
  }, [renderMode, pulseGlow]);

  const pfRatio = Math.round(labs.pao2 / Math.max(0.21, labs.fio2));
  const heartOrgan = organs.find((o) => o.id === 'heart');
  const lungsOrgan = organs.find((o) => o.id === 'lungs');

  return (
    <section
      className={`relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-16 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#0c0c0c] max-w-none p-6 overflow-y-auto' : ''
      }`}
      id="hologram-landscape"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <SectionEyebrow label="Cardiopulmonary Digital Twin" tag="Full Landscape 3D" />
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.05] text-white">
            Widescreen Organ Viewport
          </h2>
          <p className="mt-2 text-white/60 text-sm md:text-base max-w-xl">
            Simultaneous biophysical inspection of myocardial contractility, ventricular wall stress,
            and alveolar gas diffusion in landscape format.
          </p>
        </div>

        {/* Viewport Control Dock */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'unified'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Unified Dual View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('heart-focus')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'heart-focus'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Heart Focus</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('lungs-focus')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'lungs-focus'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lungs Focus</span>
            </button>
          </div>

          {/* Render Mode Toggle (3D Embed vs Bio-Canvas) */}
          <button
            type="button"
            onClick={() => setRenderMode(renderMode === 'sketchfab' ? 'bio-canvas' : 'sketchfab')}
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5"
            title="Switch between 3D Mesh and Bio-Canvas HUD"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>{renderMode === 'sketchfab' ? '3D Mesh' : 'Bio-HUD'}</span>
          </button>

          {/* Fullscreen Expand */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Landscape Viewport Container */}
      <motion.div
        layout
        className={`liquid-glass rounded-2xl border border-white/10 shadow-2xl p-4 md:p-6 transition-all duration-300 relative ${
          pulseGlow ? 'border-cyan-400/50 shadow-[0_0_40px_rgba(0,210,255,0.2)]' : ''
        }`}
      >
        {/* Holographic Scanline Overlay */}
        {scanlinesActive && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl z-20 opacity-15"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0, 210, 255, 0.15) 0px, transparent 1px, transparent 3px)',
            }}
          />
        )}

        {/* Viewport Content Grid */}
        <div
          className={`grid gap-6 ${
            viewMode === 'unified'
              ? 'grid-cols-1 md:grid-cols-2 min-h-[520px]'
              : 'grid-cols-1 min-h-[560px]'
          }`}
        >
          {/* Cardiopulmonary Chamber 1: 3D Heart */}
          {(viewMode === 'unified' || viewMode === 'heart-focus') && (
            <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950/80 flex flex-col relative group">
              {/* Header HUD */}
              <div className="h-10 px-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Heart
                    className={`w-4 h-4 text-rose-400 ${
                      pulseGlow ? 'scale-125' : 'scale-100'
                    } transition-transform duration-100`}
                  />
                  <span className="text-xs font-semibold text-white tracking-wide">
                    Cardiovascular Twin • Ventricular Sync
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-rose-400 font-bold tabular-nums">{vitals.heartRate} bpm</span>
                  <span className="text-white/40">|</span>
                  <span className="text-cyan-300 font-bold tabular-nums">MAP {vitals.map} mmHg</span>
                </div>
              </div>

              {/* 3D Model Embed or Bio Canvas */}
              <div className="flex-1 relative min-h-[380px] bg-black/40">
                {renderMode === 'sketchfab' ? (
                  <iframe
                    title="3D Heart Model"
                    className="w-full h-full border-0 absolute inset-0"
                    src={heartEmbedUrl}
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                  />
                ) : (
                  <canvas ref={bioHeartCanvasRef} className="w-full h-full absolute inset-0" />
                )}
              </div>

              {/* Bottom Telemetry HUD with mini ECG */}
              <div className="p-3 bg-black/50 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 z-10 text-xs font-mono">
                <div className="flex items-center gap-4 text-white/70">
                  <div>
                    <span className="text-white/40 text-[10px] block">CARDIAC OUTPUT</span>
                    <span className="text-cyan-300 font-bold tabular-nums">
                      {vitals.cardiacOutput} L/min
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] block">SVR</span>
                    <span className="text-white font-bold tabular-nums">{vitals.svr} dyn·s·cm⁻⁵</span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] block">CVP</span>
                    <span className="text-amber-300 font-bold tabular-nums">{vitals.cvp} mmHg</span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] block">PERFUSION</span>
                    <span className="text-emerald-300 font-bold tabular-nums">
                      {heartOrgan?.perfusionIndex || 85}%
                    </span>
                  </div>
                </div>

                {/* Live mini ECG strip */}
                <div className="w-full sm:w-48 h-8 rounded border border-white/10 bg-slate-950 p-0.5">
                  <canvas ref={ecgMiniCanvasRef} width={180} height={28} className="w-full h-full" />
                </div>
              </div>
            </div>
          )}

          {/* Cardiopulmonary Chamber 2: 3D Lungs */}
          {(viewMode === 'unified' || viewMode === 'lungs-focus') && (
            <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950/80 flex flex-col relative group">
              {/* Header HUD */}
              <div className="h-10 px-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-white tracking-wide">
                    Pulmonary Twin • Alveolar Gas Exchange
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-cyan-300 font-bold tabular-nums">{vitals.spo2}% SpO2</span>
                  <span className="text-white/40">|</span>
                  <span className="text-white/70 tabular-nums">
                    FiO2 {(labs.fio2 * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* 3D Model Embed */}
              <div className="flex-1 relative min-h-[380px] bg-black/40">
                <iframe
                  title="3D Lungs Model"
                  className="w-full h-full border-0 absolute inset-0"
                  src={lungsEmbedUrl}
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                />
              </div>

              {/* Bottom Telemetry HUD with live airflow wave */}
              <div className="p-3 bg-black/50 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 z-10 text-xs font-mono">
                <div className="flex items-center gap-4 text-white/70">
                  <div>
                    <span className="text-white/40 text-[10px] block">RESP RATE</span>
                    <span className="text-cyan-300 font-bold tabular-nums">
                      {vitals.respRate} breaths/min
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] block">P/F RATIO</span>
                    <span
                      className={`font-bold tabular-nums ${
                        pfRatio < 200 ? 'text-amber-400' : 'text-emerald-300'
                      }`}
                    >
                      {pfRatio}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] block">PaO2</span>
                    <span className="text-white font-bold tabular-nums">{labs.pao2} mmHg</span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] block">LUNG PERFUSION</span>
                    <span className="text-emerald-300 font-bold tabular-nums">
                      {lungsOrgan?.perfusionIndex || 78}%
                    </span>
                  </div>
                </div>

                {/* Live Airflow Curve Canvas */}
                <div className="w-full sm:w-48 h-8 rounded border border-white/10 bg-slate-950 p-0.5">
                  <canvas ref={airflowCanvasRef} width={180} height={28} className="w-full h-full" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Bottom Landscape Telemetry Status Ribbon */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-white/60">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Biophysical Coupling: Active</span>
            </span>
            <span className="hidden sm:inline">
              Arterial Pulse Wave Delay: <strong className="text-white">180ms</strong>
            </span>
            <span className="hidden sm:inline">
              Venous Return Compliance: <strong className="text-white">Optimal</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-white/40">Patient: {patient.name}</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px]">
              Bed {patient.bedNumber}
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
