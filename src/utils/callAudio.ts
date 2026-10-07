// Web Audio API & HTML5 Audio Hybrid Synthesizer for Call Tones & Mobile Ringing

// Clean programmatic WAV base64 data URI for 100% reliable mobile browser audio playback
function generateRingtoneWavUri(): string {
  if (typeof window === 'undefined') return '';
  try {
    const sampleRate = 22050;
    const duration = 2.0; // 2 seconds pulse
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF header
    view.setUint32(0, 0x52494646, false); // 'RIFF'
    view.setUint32(4, 36 + numSamples * 2, true);
    view.setUint32(8, 0x57415645, false); // 'WAVE'
    // fmt subchunk
    view.setUint32(12, 0x666d7420, false); // 'fmt '
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    // data subchunk
    view.setUint32(36, 0x64617461, false); // 'data'
    view.setUint32(40, numSamples * 2, true);

    // Synthesize harmonic marimba ring melody (notes: E5, G#5, B5, E6, B5, G#5)
    const notes = [
      { freq: 659.25, start: 0.0, end: 0.22 },
      { freq: 830.61, start: 0.24, end: 0.46 },
      { freq: 987.77, start: 0.48, end: 0.70 },
      { freq: 1318.51, start: 0.72, end: 1.15 },
      { freq: 987.77, start: 1.18, end: 1.40 },
      { freq: 830.61, start: 1.42, end: 1.75 },
    ];

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      for (const note of notes) {
        if (t >= note.start && t < note.end) {
          const localT = t - note.start;
          const dur = note.end - note.start;
          const env = Math.exp(-localT * 3.8) * Math.sin((localT / dur) * Math.PI);
          sample += Math.sin(2 * Math.PI * note.freq * t) * env * 0.85;
        }
      }
      const val = Math.max(-1, Math.min(1, sample)) * 0x7fff;
      view.setInt16(44 + i * 2, val, true);
    }

    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'data:audio/wav;base64,' + (typeof btoa !== 'undefined' ? btoa(binary) : '');
  } catch (e) {
    console.warn('Could not generate WAV data URI:', e);
    return '';
  }
}

const ringtoneWavDataUri = generateRingtoneWavUri();

class WhatsAppCallToneGenerator {
  private audioCtx: AudioContext | null = null;
  private ringIntervalId: any = null;
  private incomingIntervalId: any = null;
  private audioElement: HTMLAudioElement | null = null;
  private isOutgoingRinging = false;
  private isIncomingRinging = false;
  private autoplayBlockedListeners: Array<(blocked: boolean) => void> = [];
  public isAutoplayBlocked = false;

  public onAutoplayBlockedChange(cb: (blocked: boolean) => void): () => void {
    this.autoplayBlockedListeners.push(cb);
    cb(this.isAutoplayBlocked);
    return () => {
      this.autoplayBlockedListeners = this.autoplayBlockedListeners.filter((l) => l !== cb);
    };
  }

  private notifyAutoplayBlocked(blocked: boolean) {
    this.isAutoplayBlocked = blocked;
    this.autoplayBlockedListeners.forEach((cb) => {
      try {
        cb(blocked);
      } catch {}
    });
  }

  public getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().then(() => {
          this.notifyAutoplayBlocked(false);
        }).catch(() => {
          this.notifyAutoplayBlocked(true);
        });
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  // Pre-unlock audio on mobile touch / click
  public unlock() {
    try {
      const ctx = this.getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().then(() => {
            this.notifyAutoplayBlocked(false);
          }).catch(() => {});
        }
        // Play tiny silent buffer
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      }

      // Pre-warm HTML5 Audio element
      if (!this.audioElement && typeof Audio !== 'undefined' && ringtoneWavDataUri) {
        this.audioElement = new Audio(ringtoneWavDataUri);
        this.audioElement.loop = true;
        this.audioElement.volume = 1.0;
        this.audioElement.setAttribute('playsinline', 'true');
      }

      if (this.audioElement && !this.isIncomingRinging) {
        // Silent play attempt to unlock on iOS / Android
        const promise = this.audioElement.play();
        if (promise !== undefined) {
          promise.then(() => {
            if (!this.isIncomingRinging) {
              this.audioElement?.pause();
              if (this.audioElement) this.audioElement.currentTime = 0;
            }
            this.notifyAutoplayBlocked(false);
          }).catch(() => {
            // Will unlock on next interaction
          });
        }
      }
    } catch {}
  }

  // Force unlock and start immediately (used when user taps modal or banner)
  public forceUnlockAndPlay() {
    this.notifyAutoplayBlocked(false);
    this.unlock();
    if (this.isIncomingRinging) {
      this.playIncomingSounds();
    }
  }

  // Play outgoing ringing tone (authentic dual-frequency UK/WhatsApp phone tone 425Hz + 450Hz)
  public startOutgoingRinging() {
    if (this.isOutgoingRinging) return;
    this.stopAll();
    this.unlock();
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
        gainNode.gain.linearRampToValueAtTime(0.20, now + 0.05);
        gainNode.gain.setValueAtTime(0.20, now + 0.85);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.95);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.0);
        osc2.stop(now + 1.0);
      } catch {}
    };

    playPulse();
    this.ringIntervalId = setInterval(() => {
      if (this.isOutgoingRinging) {
        playPulse();
      }
    }, 2800);
  }

  // Internal trigger for incoming sound and vibration
  private playIncomingSounds() {
    // 1. Physical vibration
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([1000, 400, 1000, 400, 1200]);
      }
    } catch {}

    // 2. HTML5 Audio element fallback (works in background / lockscreen)
    try {
      if (!this.audioElement && typeof Audio !== 'undefined' && ringtoneWavDataUri) {
        this.audioElement = new Audio(ringtoneWavDataUri);
        this.audioElement.loop = true;
        this.audioElement.volume = 1.0;
        this.audioElement.setAttribute('playsinline', 'true');
      }
      if (this.audioElement) {
        this.audioElement.currentTime = 0;
        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.notifyAutoplayBlocked(false);
          }).catch((err) => {
            console.warn('Autoplay blocked by browser policy:', err);
            this.notifyAutoplayBlocked(true);
          });
        }
      }
    } catch {}

    // 3. Web Audio synth melody
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {
          this.notifyAutoplayBlocked(true);
        });
      }

      const now = ctx.currentTime;
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

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(0.35, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.05);
      });
    } catch {}
  }

  // Play incoming ringtone (authentic rhythmic musical WhatsApp ring pattern)
  public startIncomingRingtone() {
    if (this.isIncomingRinging) return;
    this.stopAll();
    this.unlock();
    this.isIncomingRinging = true;

    this.playIncomingSounds();

    this.incomingIntervalId = setInterval(() => {
      if (this.isIncomingRinging) {
        this.playIncomingSounds();
      }
    }, 2400);
  }

  // Stop incoming ringtone & cancel vibration
  public stopIncomingRingtone() {
    this.isIncomingRinging = false;
    if (this.incomingIntervalId) {
      clearInterval(this.incomingIntervalId);
      this.incomingIntervalId = null;
    }
    try {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      }
    } catch {}
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(0);
      }
    } catch {}
    this.notifyAutoplayBlocked(false);
  }

  // Stop outgoing ringing
  public stopRinging() {
    this.isOutgoingRinging = false;
    if (this.ringIntervalId) {
      clearInterval(this.ringIntervalId);
      this.ringIntervalId = null;
    }
  }

  // Stop all tones
  public stopAll() {
    this.stopRinging();
    this.stopIncomingRingtone();
  }

  // Play connection chime (call answered)
  public playCallConnectedChime() {
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
      gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  // Play hangup tone (call ended)
  public playHangupTone() {
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

        gain.gain.setValueAtTime(0.20, now + offset);
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

// Global unlock on first user interaction for mobile browser compatibility
if (typeof window !== 'undefined') {
  const unlockListener = () => {
    callAudio.unlock();
  };
  window.addEventListener('click', unlockListener, { passive: true });
  window.addEventListener('touchstart', unlockListener, { passive: true });
  window.addEventListener('touchend', unlockListener, { passive: true });
  window.addEventListener('pointerdown', unlockListener, { passive: true });
}
