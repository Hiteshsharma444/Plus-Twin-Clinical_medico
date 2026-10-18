import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, BellOff, Activity, Heart, Wind, Droplets } from 'lucide-react';
import type { TelemetryVitals } from '../../types/clinical.js';
import { telemetryAudio } from '../../utils/telemetryAudio.js';

interface WaveformMonitorProps {
  vitals: TelemetryVitals;
  alarmActive?: boolean;
}

export const WaveformMonitor: React.FC<WaveformMonitorProps> = ({ vitals, alarmActive = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isFrozen, setIsFrozen] = useState(false);
  const [alarmSilenced, setAlarmSilenced] = useState(false);

  // Store references for the animation frame loop to avoid recreation on every vitals tick
  const vitalsRef = useRef(vitals);
  useEffect(() => {
    vitalsRef.current = vitals;
  }, [vitals]);

  const isFrozenRef = useRef(isFrozen);
  useEffect(() => {
    isFrozenRef.current = isFrozen;
  }, [isFrozen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let sweepX = 0;
    const sweepSpeed = 2.2; // pixels per frame
    let lastBeatTime = performance.now();

    // Resize handler
    const updateCanvasDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);

    // Initial clear with dark oscilloscope grid
    const drawGrid = (width: number, height: number) => {
      ctx.fillStyle = '#050c14';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#0e2238';
      ctx.lineWidth = 1;
      const gridSize = 24;

      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    };

    const rect = canvas.getBoundingClientRect();
    drawGrid(rect.width, rect.height);

    let prevEcgY = 0;
    let prevAbpY = 0;
    let prevSpo2Y = 0;
    let prevRespY = 0;

    const render = (time: number) => {
      if (!isFrozenRef.current) {
        const { width, height } = canvas.getBoundingClientRect();
        const hr = vitalsRef.current.heartRate;
        const rr = vitalsRef.current.respRate;
        const beatIntervalMs = (60 / Math.max(30, hr)) * 1000;

        // Channel heights (split into 4 waveform lanes)
        const laneHeight = height / 4;
        const ecgMidY = laneHeight * 0.5;
        const abpMidY = laneHeight * 1.5;
        const spo2MidY = laneHeight * 2.5;
        const respMidY = laneHeight * 3.5;

        // Eraser bar ahead of the sweep
        const eraseWidth = 14;
        ctx.fillStyle = '#050c14';
        ctx.fillRect(sweepX, 0, eraseWidth, height);

        // Subtle background grid re-draw in erased area
        ctx.strokeStyle = '#0e2238';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let y = 0; y < height; y += 24) {
          ctx.moveTo(sweepX, y);
          ctx.lineTo(sweepX + eraseWidth, y);
        }
        ctx.stroke();

        // Waveform calculation phase
        const beatProgress = ((time - lastBeatTime) % beatIntervalMs) / beatIntervalMs;
        if (time - lastBeatTime >= beatIntervalMs) {
          lastBeatTime = time;
          // Trigger realistic pitch-modulated pulse oximeter beep
          telemetryAudio.playPulseBeep(vitalsRef.current.spo2);
        }

        // 1. ECG Lead II Synthesizer (P-Q-R-S-T)
        let ecgVal = 0;
        if (beatProgress < 0.12) {
          // P-wave
          ecgVal = Math.sin((beatProgress / 0.12) * Math.PI) * 12;
        } else if (beatProgress >= 0.16 && beatProgress < 0.19) {
          // Q-wave
          ecgVal = -((beatProgress - 0.16) / 0.03) * 10;
        } else if (beatProgress >= 0.19 && beatProgress < 0.23) {
          // R-spike
          const rProg = (beatProgress - 0.19) / 0.04;
          ecgVal = rProg < 0.5 ? -10 + rProg * 2 * 65 : 55 - (rProg - 0.5) * 2 * 75;
        } else if (beatProgress >= 0.23 && beatProgress < 0.27) {
          // S-dip
          const sProg = (beatProgress - 0.23) / 0.04;
          ecgVal = -20 + sProg * 20;
        } else if (beatProgress >= 0.35 && beatProgress < 0.55) {
          // T-wave
          const tProg = (beatProgress - 0.35) / 0.2;
          ecgVal = Math.sin(tProg * Math.PI) * 16;
        }
        // Baseline telemetry micro-noise
        const ecgNoise = (Math.random() - 0.5) * 1.5;
        const currentEcgY = ecgMidY - ecgVal + ecgNoise;

        // 2. Arterial Line (ABP) Waveform (Systolic rapid rise + dicrotic notch)
        let abpVal = 0;
        if (beatProgress < 0.18) {
          // Anacrotic systolic rapid upstroke
          const upProg = beatProgress / 0.18;
          abpVal = Math.sin(upProg * (Math.PI / 2)) * 32;
        } else if (beatProgress < 0.34) {
          // Systolic peak runoff
          const runProg = (beatProgress - 0.18) / 0.16;
          abpVal = 32 - runProg * 12;
        } else if (beatProgress < 0.42) {
          // Dicrotic notch & wave (aortic closure)
          const dicProg = (beatProgress - 0.34) / 0.08;
          abpVal = 20 + Math.sin(dicProg * Math.PI) * 6;
        } else {
          // Diastolic runoff
          const diastProg = (beatProgress - 0.42) / 0.58;
          abpVal = 20 * Math.exp(-diastProg * 2.8);
        }
        const currentAbpY = abpMidY - abpVal + (Math.random() - 0.5) * 1.2;

        // 3. SpO2 Plethysmogram Waveform
        let plethVal = 0;
        const plethShift = (beatProgress + 0.12) % 1.0; // SpO2 is slightly delayed after ECG R wave
        if (plethShift < 0.25) {
          plethVal = Math.sin((plethShift / 0.25) * (Math.PI / 2)) * 28;
        } else if (plethShift < 0.45) {
          plethVal = 28 - ((plethShift - 0.25) / 0.2) * 10;
        } else if (plethShift < 0.6) {
          plethVal = 18 + Math.sin(((plethShift - 0.45) / 0.15) * Math.PI) * 4;
        } else {
          plethVal = 18 * Math.exp(-((plethShift - 0.6) / 0.4) * 2.5);
        }
        const currentSpo2Y = spo2MidY - plethVal;

        // 4. Respiration / Capnography Waveform (breaths per min)
        const respCycleMs = (60 / Math.max(8, rr)) * 1000;
        const respProg = (time % respCycleMs) / respCycleMs;
        let respVal = 0;
        if (respProg < 0.5) {
          // Inhalation / Exhalation sinusoidal curve
          respVal = Math.sin(respProg * 2 * Math.PI) * 18;
        }
        const currentRespY = respMidY - respVal;

        // Draw segments from previous X to current X
        const nextX = (sweepX + sweepSpeed) % width;
        const isWrapping = nextX < sweepX;

        if (!isWrapping && sweepX > 0) {
          // ECG: Crisp medical green
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(sweepX, prevEcgY || currentEcgY);
          ctx.lineTo(nextX, currentEcgY);
          ctx.stroke();

          // Arterial Line: Vivid scarlet red
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(sweepX, prevAbpY || currentAbpY);
          ctx.lineTo(nextX, currentAbpY);
          ctx.stroke();

          // SpO2: Cyan
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(sweepX, prevSpo2Y || currentSpo2Y);
          ctx.lineTo(nextX, currentSpo2Y);
          ctx.stroke();

          // Respiration: Amber yellow
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(sweepX, prevRespY || currentRespY);
          ctx.lineTo(nextX, currentRespY);
          ctx.stroke();
        }

        prevEcgY = currentEcgY;
        prevAbpY = currentAbpY;
        prevSpo2Y = currentSpo2Y;
        prevRespY = currentRespY;

        sweepX = nextX;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, []);

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    telemetryAudio.setMuted(nextState);
  };

  const toggleAlarmSilence = () => {
    setAlarmSilenced(!alarmSilenced);
  };

  return (
    <div className="relative flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Telemetry Header Controls */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-xs select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono font-semibold tracking-wider text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PULSE-WAVE 4-LEAD</span>
          </div>
          <span className="text-slate-500 font-mono">25 mm/s | 10 mm/mV</span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono text-[10px]">
            {vitals.heartRate > 100 ? 'SINUS TACHYCARDIA' : 'NORMAL SINUS RHYTHM'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFrozen(!isFrozen)}
            className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors border ${
              isFrozen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {isFrozen ? 'RESUME' : 'FREEZE'}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute telemetry beeps' : 'Mute telemetry beeps'}
            className={`p-1.5 rounded transition-colors border ${
              !isMuted
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
            }`}
            title={isMuted ? 'Telemetry sound muted (Click to enable pulse beeps)' : 'Telemetry sound active'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={toggleAlarmSilence}
            aria-label="Silence telemetry alarms"
            className={`p-1.5 rounded transition-colors border ${
              alarmSilenced
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
            }`}
            title="Silence alarms"
          >
            <BellOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Oscilloscope & Live Numeric Readout Panel */}
      <div className="relative flex-1 grid grid-cols-1 md:grid-cols-12 min-h-[290px]">
        {/* Oscilloscope Canvas (75% width on desktop) */}
        <div className="md:col-span-9 relative bg-[#050c14] overflow-hidden min-h-[260px]">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Left lane labels */}
          <div className="absolute left-2 top-2 text-[10px] font-mono font-bold text-emerald-400 bg-slate-950/80 px-1 rounded border border-emerald-900/40">
            ECG LEAD II
          </div>
          <div className="absolute left-2 top-[26%] text-[10px] font-mono font-bold text-red-400 bg-slate-950/80 px-1 rounded border border-red-900/40">
            ART LINE (ABP)
          </div>
          <div className="absolute left-2 top-[51%] text-[10px] font-mono font-bold text-cyan-400 bg-slate-950/80 px-1 rounded border border-cyan-900/40">
            PLETH (SpO2)
          </div>
          <div className="absolute left-2 top-[76%] text-[10px] font-mono font-bold text-yellow-400 bg-slate-950/80 px-1 rounded border border-yellow-900/40">
            RESP (CO2)
          </div>

          {alarmActive && !alarmSilenced && (
            <div className="absolute top-2 right-2 bg-red-600/90 text-white font-mono text-xs px-2.5 py-1 rounded-md animate-pulse shadow-lg flex items-center gap-1.5 border border-red-400">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>CRITICAL PERFUSION ALERT: MAP &lt; 65</span>
            </div>
          )}
        </div>

        {/* Telemetry Numeric Parameters HUD (25% width on desktop) */}
        <div className="md:col-span-3 bg-slate-950 p-2.5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 text-xs font-mono select-none">
          {/* Heart Rate / Pulse */}
          <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/40 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                <Heart className="w-3.5 h-3.5 fill-emerald-500/20" />
                <span>HR / PULSE</span>
              </div>
              <div className="text-[10px] text-slate-400">Target 60-100</div>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-bold tracking-tight ${vitals.heartRate > 105 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {vitals.heartRate}
              </span>
              <span className="text-[10px] text-slate-500 ml-1">bpm</span>
            </div>
          </div>

          {/* Blood Pressure & MAP */}
          <div className="p-2 rounded-lg bg-red-950/20 border border-red-800/40 flex items-center justify-between mt-1.5">
            <div>
              <div className="flex items-center gap-1 text-red-400 text-[11px] font-semibold">
                <Activity className="w-3.5 h-3.5" />
                <span>ABP / NIBP</span>
              </div>
              <div className="text-[10px] text-slate-400">
                MAP <span className={`font-bold ${vitals.map < 65 ? 'text-red-400 underline' : 'text-slate-200'}`}>({vitals.map})</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-red-400 leading-tight">
                {vitals.systolicBP}/{vitals.diastolicBP}
              </div>
              <div className="text-[10px] text-slate-500">mmHg</div>
            </div>
          </div>

          {/* SpO2 */}
          <div className="p-2 rounded-lg bg-cyan-950/20 border border-cyan-800/40 flex items-center justify-between mt-1.5">
            <div>
              <div className="flex items-center gap-1 text-cyan-400 text-[11px] font-semibold">
                <Droplets className="w-3.5 h-3.5" />
                <span>SpO2 %</span>
              </div>
              <div className="text-[10px] text-slate-400">Target &ge; 92%</div>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-bold tracking-tight ${vitals.spo2 < 92 ? 'text-amber-400' : 'text-cyan-400'}`}>
                {vitals.spo2}
              </span>
              <span className="text-[10px] text-slate-500 ml-1">%</span>
            </div>
          </div>

          {/* Respiration & EtCO2 */}
          <div className="p-2 rounded-lg bg-yellow-950/20 border border-yellow-800/40 flex items-center justify-between mt-1.5">
            <div>
              <div className="flex items-center gap-1 text-yellow-400 text-[11px] font-semibold">
                <Wind className="w-3.5 h-3.5" />
                <span>RESP / EtCO2</span>
              </div>
              <div className="text-[10px] text-slate-400">RR {vitals.respRate} /min</div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-yellow-400">{vitals.etco2}</span>
              <span className="text-[10px] text-slate-500 ml-1">mmHg</span>
            </div>
          </div>

          {/* Hemodynamics: CO & CVP */}
          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
            <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">CVP</div>
              <div className="text-sm font-bold text-purple-400">{vitals.cvp} <span className="text-[9px] text-slate-500">mmHg</span></div>
            </div>
            <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">CARDIAC OP</div>
              <div className="text-sm font-bold text-sky-400">{vitals.cardiacOutput} <span className="text-[9px] text-slate-500">L/m</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
