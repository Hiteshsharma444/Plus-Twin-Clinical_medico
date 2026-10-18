# Widescreen Organ Viewport — Multi-Channel Oscilloscope Integration

Add a dedicated **Oscilloscope** view mode option to the widescreen landscape organ viewport toolbar alongside Unified Dual View, Heart Focus, and Lungs Focus. In Oscilloscope mode, the widescreen viewport renders the full multi-channel bedside oscilloscope with continuous real-time ECG Lead II, Arterial Blood Pressure (A-Line), Plethysmography (SpO2), and Capnography (EtCO2), including freeze-frame, audio pacing, and sweep speed controls.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during Phase 1 clarification:
> - **Toolbar Integration**: Add an `"Oscilloscope"` mode toggle button alongside `"Unified Dual View"`, `"Heart Focus"`, and `"Lungs Focus"` inside the widescreen organ viewport control dock.
> - **Channel Coverage**: Render the complete multi-channel ICU oscilloscope (`WaveformMonitor`) spanning the full widescreen viewport (`h-[560px]`), featuring:
>   - Channel 1: ECG Lead II rhythm strip with QRS detection and heart rate tagging
>   - Channel 2: Arterial Blood Pressure (ABP) with systolic/diastolic markers and dicrotic notch
>   - Channel 3: Plethysmogram (Pleth) pulse volume curve
>   - Channel 4: Capnography (EtCO2) rectangular alveolar ventilation curve
> - **Controls & Interactivity**: Seamless switching with working sound toggle (telemetry audio synthesizers), waveform freeze-frame, and critical alarm threshold highlighting.

---

## 1. Overview & Core Concept

- **What It Does**: Enables intensivists to switch the full-width widescreen landscape viewport between 3D cardiopulmonary anatomical structures and 100Hz high-fidelity physiological waveforms at the click of a button.
- **Target Persona**: ICU attending physicians, cardiologists, and respiratory therapists who need to correlate spatial myocardial anatomy with real-time electrical conduction and arterial pulsatile pressures.
- **Key Value**: Provides an uncompressed, widescreen diagnostic oscilloscope with expansive horizontal sweep resolution ($>1100\text{px}$) for detecting arrhythmias, pulsus paradoxus, and alveolar gas trapping.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Mode Selection**: Clinicians click `"Oscilloscope"` in the widescreen viewport toolbar (`LandscapeHologramSection.tsx`).
2. **Widescreen Waveform Display**:
   - The viewport smoothly transitions from 3D models to the dark oscilloscope grid (`#050c14` with `#0e2238` grid lines).
   - High-contrast multi-channel traces glide smoothly at 60fps across the screen.
   - Channel labels and real-time numeric readouts (`HR`, `BP`, `MAP`, `SpO2`, `EtCO2`) remain pinned on the right margin with tabular numerals.
3. **Interactive Audio & Freeze Controls**:
   - Clinicians can toggle heart tone beeps via Web Audio API.
   - Clinicians can freeze the waveform to measure intervals (PR, QRS, QT).

### Visual Identity & Theme
- **Color Palette**:
  - Background Canvas: `#050c14` (dark phosphor oscilloscope grid)
  - Grid lines: `#0e2238` hairline grid ($24\text{px}$ divisions)
  - ECG Trace: `#10b981` (emerald green)
  - Arterial Pressure Trace: `#f43f5e` (arterial red/rose)
  - Pleth Trace: `#00d2ff` (cyan)
  - Capnography Trace: `#f59e0b` (amber)
- **Container Styling**: Integrated seamlessly into the existing `liquid-glass rounded-2xl border border-white/10 shadow-2xl` container.

---

## 3. Key Product Decisions & Trade-Offs

- **View Mode Integration**:
  - *Chosen Approach*: Extended `viewMode: 'unified' | 'heart-focus' | 'lungs-focus' | 'oscilloscope'` state in `LandscapeHologramSection.tsx`.
  - *Why*: Intuitive segmented button pattern matching the existing 3D viewport controls without cluttering the screen or requiring separate popups.
- **Widescreen Canvas Scaling**:
  - *Chosen Approach*: Full responsive canvas scaling adapting to device pixel ratio ($dpr \le 2$) and dynamic container width.
  - *Why*: Guarantees crisp, anti-aliased trace lines on high-DPI displays.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│              Landscape Viewport Toolbar (Mode Switcher)                │
│ [Unified Dual View] [Heart Focus] [Lungs Focus] [★ Oscilloscope ★]    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────────┐       ┌──────────────────────────────────┐
│   viewMode !== 'oscilloscope'   │       │    viewMode === 'oscilloscope'   │
│ ├─ 3D Heart Mesh / Bio-HUD      │       │ ├─ Channel 1: ECG Lead II        │
│ └─ 3D Lungs Mesh / Alveoli      │       │ ├─ Channel 2: Arterial Pressure  │
│                                 │       │ ├─ Channel 3: Plethysmogram      │
│                                 │       │ └─ Channel 4: Capnography        │
└─────────────────────────────────┘       └──────────────────────────────────┘
```

### Component & State Mapping
- `src/components/aura/LandscapeHologramSection.tsx`:
  - Extend state: `viewMode` to include `'oscilloscope'`
  - Add button in toolbar: `<Activity className="w-3.5 h-3.5 text-emerald-400" /> Oscilloscope`
  - In render block: When `viewMode === 'oscilloscope'`, render `<WaveformMonitor vitals={vitals} alarmActive={scores.riskCategory === 'critical'} />` in the full widescreen container (`h-[560px]`).
