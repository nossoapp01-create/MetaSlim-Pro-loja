// Universal Audio Recording and WAV Encoding for WhatsApp VIP
// Produces 100% cross-platform standard 16-bit PCM WAV that plays on iOS Safari, Android Chrome, and Desktop browsers.

export interface AudioRecordingSession {
  stop: () => Promise<{ dataUrl: string; duration: number }>;
  cancel: () => void;
}

// Convert Blob to Base64 Data URL
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Format seconds into mm:ss
export function formatAudioDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Encodes raw Float32Array PCM samples into a standard 16-bit PCM WAV Blob
export function encodePcmToWavBlob(samples: Float32Array, sampleRate = 16000): Blob {
  const numChannels = 1;
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // 1. RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');

  // 2. fmt chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, numChannels * 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16-bit)

  // 3. data chunk
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // 4. Write 16-bit signed PCM samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    // Gentle clamp
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

// Record live microphone audio using AudioContext for universal cross-platform compatibility
export async function startAudioRecording(): Promise<AudioRecordingSession> {
  if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Navegador não suporta gravação de áudio.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('AudioContext não disponível.');
  }

  const audioCtx = new AudioContextClass();
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume().catch(() => {});
  }

  const source = audioCtx.createMediaStreamSource(stream);
  // ScriptProcessor buffer size: 4096 gives smooth capture
  const processor = audioCtx.createScriptProcessor(4096, 1, 1);
  const recordedBuffers: Float32Array[] = [];
  const startTime = Date.now();

  processor.onaudioprocess = (e) => {
    const input = e.inputBuffer.getChannelData(0);
    recordedBuffers.push(new Float32Array(input));
  };

  source.connect(processor);
  processor.connect(audioCtx.destination);

  let isStopped = false;

  return {
    stop: async () => {
      if (isStopped) {
        throw new Error('Gravação já finalizada.');
      }
      isStopped = true;

      // Disconnect audio nodes
      try {
        processor.disconnect();
        source.disconnect();
      } catch {}

      // Stop all mic tracks
      stream.getTracks().forEach((track) => track.stop());

      const durationSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const sourceSampleRate = audioCtx.sampleRate;

      // Close AudioContext
      try {
        if (audioCtx.state !== 'closed') {
          await audioCtx.close();
        }
      } catch {}

      // Concatenate all recorded buffers
      const totalLength = recordedBuffers.reduce((acc, b) => acc + b.length, 0);
      const fullBuffer = new Float32Array(totalLength);
      let offset = 0;
      for (const buf of recordedBuffers) {
        fullBuffer.set(buf, offset);
        offset += buf.length;
      }

      // Downsample to 16,000 Hz for voice (optimal crisp voice clarity and compact payload size)
      const targetSampleRate = 16000;
      let finalSamples: Float32Array;
      if (sourceSampleRate === targetSampleRate) {
        finalSamples = fullBuffer;
      } else {
        const ratio = sourceSampleRate / targetSampleRate;
        const newLength = Math.round(fullBuffer.length / ratio);
        finalSamples = new Float32Array(newLength);
        for (let i = 0; i < newLength; i++) {
          finalSamples[i] = fullBuffer[Math.min(fullBuffer.length - 1, Math.round(i * ratio))];
        }
      }

      // Encode into universal WAV
      const wavBlob = encodePcmToWavBlob(finalSamples, targetSampleRate);
      const dataUrl = await blobToBase64(wavBlob);

      return {
        dataUrl,
        duration: durationSec,
      };
    },
    cancel: () => {
      if (isStopped) return;
      isStopped = true;
      try {
        processor.disconnect();
        source.disconnect();
        stream.getTracks().forEach((track) => track.stop());
        if (audioCtx.state !== 'closed') {
          audioCtx.close().catch(() => {});
        }
      } catch {}
    },
  };
}
