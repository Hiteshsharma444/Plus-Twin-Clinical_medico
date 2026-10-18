import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Wind,
  Activity,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  ShieldAlert,
  Zap,
  Gauge,
  Sliders,
  Droplets,
  Eye,
  Radio,
} from 'lucide-react';
import type {
  ClinicalScores,
  LabPanel,
  OrganTwinStatus,
  PatientProfile,
  TelemetryVitals,
} from '../../types/clinical.js';

interface HolographicOrganViewportProps {
  patient: PatientProfile;
  vitals: TelemetryVitals;
  labs: LabPanel;
  scores: ClinicalScores;
  organs: OrganTwinStatus[];
  onSelectOrgan?: (id: string | null) => void;
  selectedOrganId?: string | null;
}

export type ViewportMode = 'unified' | 'heart-focus' | 'lungs-focus';
export type RenderMode = 'sketchfab' | 'bio-canvas';

export const HolographicOrganViewport: React.FC<HolographicOrganViewportProps> = ({
  patient,
  vitals,
  labs,
  scores,
  organs,
  onSelectOrgan,
  selectedOrganId,
}) => {
  const [mode, setMode] = useState<ViewportMode>('unified');
  const [renderMode, setRenderMode] = useState<RenderMode>('sketchfab');
  const [scanlinesActive, setScanlinesActive] = useState(true);
  const [pulseGlow, setPulseGlow] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Real-time mini airflow wave state
  const airflowCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ecgMiniCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bioHeartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bioLungsCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sketchfab Embed URLs with clean embed parameters
  const heartEmbedUrl =
    'https://sketchfab.com/models/1582359649694207a2ad6bd0ebd0606a/embed?autostart=1&internal=1&tracking=0&ui_infos=0&ui_watermark_link=0&ui_watermark=0&ui_hint=0&ui_theme=dark&preload=1&transparent=1';
  const lungsEmbedUrl =
    'https://sketchfab.com/models/b11586862e4c4b28af6289aeea104d9c/embed?autostart=1&internal=1&tracking=0&ui_infos=0&ui_watermark_link=0&ui_watermark=0&ui_hint=0&ui_theme=dark&preload=1&transparent=1';

  // Heartbeat pulse flash effect synchronized with patient's HR
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

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < width; x += 2) {
        const sampleT = t + (x / width) * 4;
        const cycle = (sampleT * freq) % (Math.PI * 2);
        // Realistic asymmetric respiratory flow: rapid inspiratory peak, longer expiratory runoff
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

  // Mini live ECG Lead II rhythm strip for the heart viewport
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

      const hr = vitals.heartRate;
      const freq = (hr / 60) * Math.PI * 2;

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.8;
      ctx.beginPath();

      for (let x = 0; x < width; x += 2) {
        const sampleT = t + (x / width) * 3;
        const cycle = (sampleT * freq) % (Math.PI * 2);
        let ecg = 0;
        if (cycle > 0.8 && cycle < 1.2) {
          // P wave
          ecg = Math.sin((cycle - 0.8) / 0.4 * Math.PI) * 5;
        } else if (cycle >= 1.3 && cycle < 1.4) {
          // Q dip
          ecg = -4;
        } else if (cycle >= 1.4 && cycle < 1.55) {
          // R spike
          ecg = 24;
        } else if (cycle >= 1.55 && cycle < 1.65) {
          // S dip
          ecg = -8;
        } else if (cycle >= 1.9 && cycle < 2.5) {
          // T wave
          ecg = Math.sin((cycle - 1.9) / 0.6 * Math.PI) * 7;
        }

        const y = height / 2 - ecg;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(renderEcg);
    };

    renderEcg();
    return () => cancelAnimationFrame(animId);
  }, [vitals.heartRate]);

  // Animated Holographic Bio-Canvas for Heart (Beating myocardial chambers and coronary vessels)
  useEffect(() => {
    if (renderMode !== 'bio-canvas') return;
    const canvas = bioHeartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const renderBioHeart = () => {
      t += 0.03;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const hr = vitals.heartRate;
      const freq = (hr / 60) * Math.PI * 2;
      const pulse = Math.pow(Math.sin(t * freq), 8); // sharp systolic beat
      const scale = 1.0 + pulse * 0.15;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      // Background Hologram Radiance
      const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 90);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 90, 0, Math.PI * 2);
      ctx.fill();

      // Ventricular Myocardial Body
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      // Heart contour
      ctx.moveTo(0, 45);
      ctx.bezierCurveTo(-55, 10, -65, -40, -25, -60);
      ctx.bezierCurveTo(0, -65, 0, -45, 0, -35);
      ctx.bezierCurveTo(0, -45, 0, -65, 25, -60);
      ctx.bezierCurveTo(65, -40, 55, 10, 0, 45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Aortic Arch & Vena Cava
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-8, -65, 14, Math.PI, 0);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#fca5a5';
      ctx.stroke();

      // Pulsing Coronary Arteries (Cyan/Crimson grid)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-5, -30);
      ctx.lineTo(-20, 5);
      ctx.lineTo(-12, 28);
      ctx.moveTo(-5, -15);
      ctx.lineTo(15, 10);
      ctx.lineTo(8, 30);
      ctx.stroke();

      // Holographic targeting reticle ring
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
      animId = requestAnimationFrame(renderBioHeart);
    };

    renderBioHeart();
    return () => cancelAnimationFrame(animId);
  }, [renderMode, vitals.heartRate]);

  // Animated Holographic Bio-Canvas for Smoker's Lungs (Alveolar expansion & anthracotic nodes)
  useEffect(() => {
    if (renderMode !== 'bio-canvas') return;
    const canvas = bioLungsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const renderBioLungs = () => {
      t += 0.02;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const rr = vitals.respRate;
      const freq = (rr / 60) * Math.PI * 2;
      const expansion = Math.sin(t * freq) * 0.12;
      const scaleX = 1.0 + expansion;
      const scaleY = 1.0 + expansion * 0.8;

      ctx.save();
      ctx.translate(cx, cy);

      // Trachea (Windpipe)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, -75);
      ctx.lineTo(0, -40);
      ctx.stroke();

      // Mainstem Bronchi
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -40);
      ctx.lineTo(-25, -20);
      ctx.moveTo(0, -40);
      ctx.lineTo(25, -20);
      ctx.stroke();

      // Left Lung (Viewer Right)
      ctx.save();
      ctx.translate(32, 5);
      ctx.scale(scaleX, scaleY);
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -35);
      ctx.bezierCurveTo(45, -30, 45, 45, 10, 50);
      ctx.bezierCurveTo(-15, 45, -10, 0, 0, -35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Smoker anthracotic pigmentation nodes (dark soot spots)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(18, -10, 4, 0, Math.PI * 2);
      ctx.arc(26, 12, 5, 0, Math.PI * 2);
      ctx.arc(12, 22, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Right Lung (Viewer Left)
      ctx.save();
      ctx.translate(-32, 5);
      ctx.scale(scaleX, scaleY);
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -35);
      ctx.bezierCurveTo(-45, -30, -45, 45, -10, 50);
      ctx.bezierCurveTo(15, 45, 10, 0, 0, -35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Smoker anthracotic pigmentation nodes (dark soot spots)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-18, -10, 4, 0, Math.PI * 2);
      ctx.arc(-26, 12, 5, 0, Math.PI * 2);
      ctx.arc(-12, 22, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Holographic coordinate reticle
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
      animId = requestAnimationFrame(renderBioLungs);
    };

    renderBioLungs();
    return () => cancelAnimationFrame(animId);
  }, [renderMode, vitals.respRate]);

  const heartOrgan = organs.find((o) => o.id === 'heart');
  const lungOrgan = organs.find((o) => o.id === 'lungs');
  const pfRatio = Math.round(labs.pao2 / Math.max(0.21, labs.fio2));

  return (
    <div
      className={`relative flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isExpanded ? 'fixed inset-3 z-50 bg-slate-950/98' : 'h-full min-h-[460px]'
      }`}
    >
      {/* Sci-Fi Hologram Header Controls */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono select-none z-20 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-bold">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>HOLOGRAPHIC BIO-TWIN COCKPIT</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>CARDIO-PULMONARY SYNC ACTIVE</span>
          </div>
        </div>

        {/* Viewport Mode Toggles: Unified, Heart Focus, Lungs Focus */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('unified')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              mode === 'unified'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>UNIFIED DUAL TWIN</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('heart-focus')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              mode === 'heart-focus'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3 h-3" />
            <span>HEART FOCUS</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('lungs-focus')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              mode === 'lungs-focus'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3 h-3" />
            <span>LUNGS FOCUS</span>
          </button>
        </div>

        {/* Engine Switcher: 3D Embed vs Holographic Bio-Canvas */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded border border-slate-800">
          <button
            type="button"
            onClick={() => setRenderMode('sketchfab')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
              renderMode === 'sketchfab'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="3D Model Embeds via Sketchfab"
          >
            3D Embed
          </button>
          <button
            type="button"
            onClick={() => setRenderMode('bio-canvas')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
              renderMode === 'bio-canvas'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Interactive Holographic Bio-Shader Canvas"
          >
            Bio-Canvas
          </button>
        </div>

        {/* Utility Toggles: Scanlines & Fullscreen */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => setScanlinesActive(!scanlinesActive)}
            className={`px-2 py-1 rounded text-[10px] border transition-colors ${
              scanlinesActive
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
            }`}
            title="Toggle Sci-Fi CRT scanlines & holographic grain"
          >
            SCANLINES {scanlinesActive ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Minimize' : 'Expand full viewport'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Hologram Stage Container */}
      <div className="relative flex-1 min-h-[380px] bg-[#020617] overflow-hidden flex flex-col justify-between">
        {/* Futuristic Sci-Fi Corner Brackets */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-500/80 z-20 pointer-events-none" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-500/80 z-20 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-500/80 z-20 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-500/80 z-20 pointer-events-none" />

        {/* Holographic Scanline Overlay */}
        {scanlinesActive && (
          <div
            className="absolute inset-0 z-10 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.25) 2px, rgba(6, 182, 212, 0.25) 4px)',
            }}
          />
        )}

        {/* Ambient Heartbeat Pulse Border Glow */}
        <div
          className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-150 ${
            pulseGlow ? 'opacity-100 shadow-[inset_0_0_50px_rgba(239,68,68,0.25)]' : 'opacity-0'
          }`}
        />

        {/* Organ Viewports Layout */}
        <div className="relative flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-3 p-3 z-0">
          {/* 1. ANIMATED HEART MODEL CONTAINER */}
          {(mode === 'unified' || mode === 'heart-focus') && (
            <div
              className={`relative rounded-xl overflow-hidden border border-rose-900/60 bg-gradient-to-b from-rose-950/20 to-slate-950/80 shadow-2xl flex flex-col ${
                mode === 'heart-focus' ? 'md:col-span-2 min-h-[420px]' : 'min-h-[300px]'
              }`}
            >
              {/* Heart Model Header HUD */}
              <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-rose-900/80 text-xs font-mono pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-bold text-rose-300">MYOCARDIAL DIGITAL TWIN</span>
                  <span className="text-[10px] text-slate-400 ml-1">Heart Animated 3D</span>
                </div>

                <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 pointer-events-auto flex items-center gap-2">
                  <span className="text-rose-400 font-bold">{vitals.heartRate} BPM</span>
                  <span className="text-slate-600">•</span>
                  <span>MAP: <span className="font-bold text-slate-100">{vitals.map}</span> mmHg</span>
                </div>
              </div>

              {/* Heart Viewport Body (Embed vs Bio-Canvas) */}
              <div className="relative w-full flex-1 min-h-[260px] bg-black/40 flex items-center justify-center">
                {renderMode === 'sketchfab' ? (
                  <iframe
                    title="Heart Animated"
                    src={heartEmbedUrl}
                    className="w-full h-full border-0 absolute inset-0"
                    allow="autoplay; fullscreen; xr-spatial-tracking; accelerometer; gyroscope"
                    allowFullScreen
                  />
                ) : (
                  <canvas ref={bioHeartCanvasRef} width={400} height={260} className="w-full h-full block" />
                )}
              </div>

              {/* Heart Telemetry Bottom Overlay HUD */}
              <div className="relative z-20 p-2.5 bg-slate-950/90 backdrop-blur-md border-t border-rose-900/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono select-none">
                {/* Mini Live ECG Strip */}
                <div className="col-span-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 mb-0.5">
                    <span>LIVE ECG LEAD II</span>
                    <span>{vitals.heartRate > 100 ? 'TACHYCARDIA' : 'NSR'}</span>
                  </div>
                  <canvas ref={ecgMiniCanvasRef} width={260} height={32} className="w-full h-8 block" />
                </div>

                {/* Sepsis Risk Factor */}
                <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <div className="text-[10px] text-slate-400">SEPSIS IMPACT</div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-lg font-bold ${
                        scores.sepsisRiskScore >= 70
                          ? 'text-red-400'
                          : scores.sepsisRiskScore >= 40
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {scores.sepsisRiskScore}%
                    </span>
                    <span className="text-[10px] text-slate-400">Risk</span>
                  </div>
                </div>

                {/* Hemodynamic Perfusion */}
                <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <div className="text-[10px] text-slate-400">CARDIAC OUTPUT</div>
                  <div className="text-lg font-bold text-sky-400">
                    {vitals.cardiacOutput} <span className="text-[10px] text-slate-500">L/min</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. ANIMATED LUNGS MODEL CONTAINER */}
          {(mode === 'unified' || mode === 'lungs-focus') && (
            <div
              className={`relative rounded-xl overflow-hidden border border-cyan-900/60 bg-gradient-to-b from-cyan-950/20 to-slate-950/80 shadow-2xl flex flex-col ${
                mode === 'lungs-focus' ? 'md:col-span-2 min-h-[420px]' : 'min-h-[300px]'
              }`}
            >
              {/* Lungs Model Header HUD */}
              <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-900/80 text-xs font-mono pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-bold text-cyan-300">PULMONARY DIGITAL TWIN</span>
                  <span className="text-[10px] text-slate-400 ml-1">Smoker's Lungs 3D</span>
                </div>

                <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 pointer-events-auto flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">SpO2: {vitals.spo2}%</span>
                  <span className="text-slate-600">•</span>
                  <span>RR: <span className="font-bold text-slate-100">{vitals.respRate}</span> /min</span>
                </div>
              </div>

              {/* Lungs Viewport Body (Embed vs Bio-Canvas) */}
              <div className="relative w-full flex-1 min-h-[260px] bg-black/40 flex items-center justify-center">
                {renderMode === 'sketchfab' ? (
                  <iframe
                    title="Smoker's Lungs (animated)"
                    src={lungsEmbedUrl}
                    className="w-full h-full border-0 absolute inset-0"
                    allow="autoplay; fullscreen; xr-spatial-tracking; accelerometer; gyroscope"
                    allowFullScreen
                  />
                ) : (
                  <canvas ref={bioLungsCanvasRef} width={400} height={260} className="w-full h-full block" />
                )}
              </div>

              {/* Lungs Telemetry Bottom Overlay HUD */}
              <div className="relative z-20 p-2.5 bg-slate-950/90 backdrop-blur-md border-t border-cyan-900/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono select-none">
                {/* Airflow / Tidal Volume Dynamic Graph */}
                <div className="col-span-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-cyan-400 mb-0.5">
                    <span>DYNAMIC AIRFLOW / TIDAL WAVE</span>
                    <span>V_T ~ 480 mL</span>
                  </div>
                  <canvas ref={airflowCanvasRef} width={260} height={32} className="w-full h-8 block" />
                </div>

                {/* PaO2 / FiO2 Ratio */}
                <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <div className="text-[10px] text-slate-400">P/F RATIO</div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-lg font-bold ${
                        pfRatio < 200 ? 'text-red-400' : pfRatio < 300 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {pfRatio}
                    </span>
                    <span className="text-[10px] text-slate-400">mmHg</span>
                  </div>
                </div>

                {/* Ventilation Mechanics */}
                <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <div className="text-[10px] text-slate-400">O2 THERAPY</div>
                  <div className="text-sm font-bold text-cyan-300 truncate">
                    FiO2 {(labs.fio2 * 100).toFixed(0)}%
                  </div>
                  <div className="text-[9px] text-slate-500">EtCO2: {vitals.etco2} mmHg</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Sci-Fi Hologram Status Footer Bar */}
        <div className="relative z-20 px-4 py-2 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] font-mono select-none">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">VIRTUAL THORACIC SPACE:</span>
            <span className="text-cyan-300 font-bold">
              {patient.name} ({patient.age}y {patient.gender}) • Bed {patient.bedNumber}
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">
              CARDIAC PERFUSION: <span className="text-emerald-400 font-bold">{heartOrgan?.perfusionIndex ?? 82}%</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">
              PULMONARY COMPLIANCE: <span className="text-cyan-400 font-bold">{lungOrgan?.perfusionIndex ?? 78}%</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 ml-auto">
            <span className="flex items-center gap-1 text-cyan-400">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>LIVE TELEMETRY STREAMING</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
