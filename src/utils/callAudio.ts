// All call and mobile audio silenced per user preference

class SilentCallToneGenerator {
  public isAutoplayBlocked = false;

  public onAutoplayBlockedChange(_cb: (blocked: boolean) => void): () => void {
    return () => {};
  }

  public getAudioContext(): null {
    return null;
  }

  public unlock(): void {
    // Audio completely silenced
  }

  public forceUnlockAndPlay(): void {
    // Audio completely silenced
  }

  public startOutgoingRinging(): void {
    // Audio completely silenced
  }

  public startIncomingRingtone(): void {
    // Audio completely silenced
  }

  public stopIncomingRingtone(): void {
    // Audio completely silenced
  }

  public stopRinging(): void {
    // Audio completely silenced
  }

  public stopAll(): void {
    // Audio completely silenced
  }

  public playCallConnectedChime(): void {
    // Audio completely silenced
  }

  public playHangupTone(): void {
    // Audio completely silenced
  }
}

export const callAudio = new SilentCallToneGenerator();
