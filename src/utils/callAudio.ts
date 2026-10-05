// Web Audio API Synthesizer for Authentic WhatsApp Call Tones

class WhatsAppCallToneGenerator {
  private audioCtx: AudioContext | null = null;
  private ringIntervalId: any = null;
  private incomingIntervalId: any = null;
  private vibrateIntervalId: any = null;
  private isOutgoingRinging = false;
  private isIncomingRinging = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch (e) {
      return null;
    }
  }

  // Play outgoing ringing tone (authentic dual-frequency UK/WhatsApp phone tone 400Hz + 450Hz)
  startOutgoingRinging() {
    if (this.isOutgoingRinging) return;
    this.stopAll();
    this.isOutgoingRinging = true;

    const playPulse = () => {
      if (!this.isOutgoingRinging) return;
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
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gainNode.gain.setValueAtTime(0.08, now + 0.85);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.95);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.0);
        osc2.stop(now + 1.0);
      } catch (e) {}
    };

    playPulse();
    this.ringIntervalId = setInterval(() => {
      if (this.isOutgoingRinging) {
        playPulse();
      }
    }, 3000);
  }

  // Play incoming ringtone (authentic rhythmic musical WhatsApp ring pattern)
  startIncomingRingtone() {
    if (this.isIncomingRinging) return;
    this.stopAll();
    this.isIncomingRinging = true;

    // Physical device vibration on mobile
    const triggerVibrate = () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([600, 300, 600, 300, 900]);
        }
      } catch (e) {}
    };

    const playMelody = () => {
      if (!this.isIncomingRinging) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        // Melodic notes: E5, G#5, B5, E6, B5, G#5
        const notes = [
          { freq: 659.25, time: 0.0, dur: 0.16 }, // E5
          { freq: 830.61, time: 0.18, dur: 0.16 }, // G#5
          { freq: 987.77, time: 0.36, dur: 0.18 }, // B5
          { freq: 1318.51, time: 0.56, dur: 0.28 }, // E6
          { freq: 987.77, time: 0.88, dur: 0.18 }, // B5
          { freq: 830.61, time: 1.08, dur: 0.24 }, // G#5
        ];

        notes.forEach(({ freq, time, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle'; // Clear marimba/chime timber
          osc.frequency.setValueAtTime(freq, now + time);

          gain.gain.setValueAtTime(0, now + time);
          gain.gain.linearRampToValueAtTime(0.18, now + time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + time);
          osc.stop(now + time + dur + 0.05);
        });
      } catch (e) {}
    };

    triggerVibrate();
    playMelody();

    this.incomingIntervalId = setInterval(() => {
      if (this.isIncomingRinging) {
        triggerVibrate();
        playMelody();
      }
    }, 2400);
  }

  // Stop incoming ringtone & cancel vibration
  stopIncomingRingtone() {
    this.isIncomingRinging = false;
    if (this.incomingIntervalId) {
      clearInterval(this.incomingIntervalId);
      this.incomingIntervalId = null;
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(0);
      }
    } catch (e) {}
  }

  // Stop outgoing ringing
  stopRinging() {
    this.isOutgoingRinging = false;
    if (this.ringIntervalId) {
      clearInterval(this.ringIntervalId);
      this.ringIntervalId = null;
    }
  }

  // Stop all tones
  stopAll() {
    this.stopRinging();
    this.stopIncomingRingtone();
  }

  // Play connection chime (call answered)
  playCallConnectedChime() {
    this.stopAll();
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
    this.stopAll();
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
