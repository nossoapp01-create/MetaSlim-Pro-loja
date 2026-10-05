// Web Audio API Synthesizer for Authentic WhatsApp Call Tones

class WhatsAppCallToneGenerator {
  private audioCtx: AudioContext | null = null;
  private ringIntervalId: any = null;
  private isRinging = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch (e) {
      return null;
    }
  }

  // Play outgoing ringing tone (authentic dual-frequency UK/WhatsApp phone tone 400Hz + 450Hz)
  startOutgoingRinging() {
    if (this.isRinging) return;
    this.isRinging = true;

    const playPulse = () => {
      if (!this.isRinging) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(425, now);
        osc2.frequency.setValueAtTime(450, now);

        gainNode.gain.setValueAtTime(0, now);
        // Soft ramp up
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gainNode.gain.setValueAtTime(0.08, now + 0.85);
        // Soft ramp down
        gainNode.gain.linearRampToValueAtTime(0, now + 0.95);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.0);
        osc2.stop(now + 1.0);
      } catch (e) {
        // Audio error handling
      }
    };

    // First pulse immediately
    playPulse();
    // Repeating ring pattern (1s sound, 2s pause = 3s cycle)
    this.ringIntervalId = setInterval(() => {
      if (this.isRinging) {
        playPulse();
      }
    }, 3000);
  }

  // Stop ringing
  stopRinging() {
    this.isRinging = false;
    if (this.ringIntervalId) {
      clearInterval(this.ringIntervalId);
      this.ringIntervalId = null;
    }
  }

  // Play connection chime (call answered)
  playCallConnectedChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  // Play hangup tone (call ended)
  playHangupTone() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.16, 0.32].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now + offset);

        gain.gain.setValueAtTime(0.09, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.11);
      });
    } catch {}
  }
}

export const callAudio = new WhatsAppCallToneGenerator();
