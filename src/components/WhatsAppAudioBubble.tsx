import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';
import { formatAudioDuration } from '../utils/audioUtils';

interface WhatsAppAudioBubbleProps {
  audioUrl: string;
  duration?: number;
  isAdmin?: boolean;
}

export const WhatsAppAudioBubble: React.FC<WhatsAppAudioBubbleProps> = ({
  audioUrl,
  duration = 0,
  isAdmin = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.playbackRate = playbackRate;
      if (audio.ended || (audio.duration && audio.currentTime >= audio.duration)) {
        audio.currentTime = 0;
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((e) => {
            console.warn('Playback error, reloading buffer:', e);
            audio.load();
            audio.play().then(() => {
              setIsPlaying(true);
            }).catch((e2) => {
              console.error('Unable to play audio:', e2);
            });
          });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextTime = Number(e.target.value);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const cyclePlaybackRate = () => {
    const nextRate: 1 | 1.5 | 2 = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 py-1 px-1 min-w-[240px] sm:min-w-[280px]">
      <audio ref={audioRef} src={audioUrl} preload="auto" playsInline />

      {/* WhatsApp Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-xs cursor-pointer ${
          isAdmin
            ? 'bg-[#00a884] text-white hover:bg-[#008069]'
            : 'bg-[#00a884] text-white hover:bg-[#008069]'
        }`}
        title={isPlaying ? 'Pausar áudio' : 'Ouvir áudio'}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform / Progress Slider */}
      <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
        <div className="relative flex items-center w-full h-5">
          {/* Animated waveform bars background */}
          <div className="absolute inset-0 flex items-center justify-between gap-0.5 pointer-events-none opacity-40 px-0.5">
            {[40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 35, 75, 50, 85, 65, 40, 90, 70, 50, 80].map((h, i) => {
              const barProgress = (i / 20) * 100;
              const isPast = progressPercent >= barProgress;
              return (
                <span
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`w-1 rounded-full transition-colors ${
                    isPast
                      ? 'bg-[#00a884]'
                      : isAdmin
                      ? 'bg-emerald-950/20'
                      : 'bg-slate-400'
                  } ${isPlaying && isPast ? 'animate-pulse' : ''}`}
                />
              );
            })}
          </div>

          {/* Interactive Range Input */}
          <input
            type="range"
            min={0}
            max={totalDuration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 appearance-none bg-transparent cursor-pointer z-10 opacity-0"
            title="Avançar ou retroceder áudio"
          />
        </div>

        {/* Time and Speed Controls */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>{formatAudioDuration(currentTime > 0 ? currentTime : totalDuration)}</span>

          <div className="flex items-center gap-2">
            {/* Speed Toggle (1x, 1.5x, 2x) */}
            <button
              type="button"
              onClick={cyclePlaybackRate}
              className="px-1.5 py-0.5 rounded-md bg-black/5 hover:bg-black/10 font-sans font-bold text-[10px] text-slate-700 transition-colors cursor-pointer"
              title="Velocidade de reprodução"
            >
              {playbackRate}x
            </button>

            <Mic className="w-3.5 h-3.5 text-[#00a884]" />
          </div>
        </div>
      </div>
    </div>
  );
};
