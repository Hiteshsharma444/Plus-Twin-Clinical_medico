/**
 * Realistic ICU Monitor Web Audio Synthesizer
 * Features:
 * - Authentic SpO2-pitch-modulated pulse oximeter beeps (440Hz - 880Hz)
 * - Soft critical alarm chimes
 * - Auto audio context resume on user interaction
 */

class TelemetryAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // muted by default for comfortable initial browsing
  private volume: number = 0.2;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!muted) {
      this.initContext();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public playPulseBeep(spo2: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Clinical SpO2 tone scaling:
      // 100% SpO2 -> ~880 Hz (A5)
      // 90% SpO2  -> ~587 Hz (D5)
      // 80% SpO2  -> ~440 Hz (A4)
      const clampedSpo2 = Math.max(70, Math.min(100, spo2));
      const freq = 440 + (clampedSpo2 - 80) * 22; // approx 440 to 880 Hz

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Short medical monitor blip: 80ms decay
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio safety fallback
    }
  }

  public playAlarmChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [880, 784, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.2);
      });
    } catch {
      // Audio safety fallback
    }
  }
}

export const telemetryAudio = new TelemetryAudioEngine();
