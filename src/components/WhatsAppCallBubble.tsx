import React from 'react';
import { Phone, Video, PhoneIncoming, PhoneMissed, PhoneForwarded } from 'lucide-react';

interface WhatsAppCallBubbleProps {
  callType?: 'voice' | 'video';
  callDuration?: number;
  callStatus?: 'completed' | 'missed' | 'declined';
  timestamp?: string;
  isCurrentUser: boolean;
  onCallBack?: (callType: 'voice' | 'video') => void;
}

export const WhatsAppCallBubble: React.FC<WhatsAppCallBubbleProps> = ({
  callType = 'voice',
  callDuration = 0,
  callStatus = 'completed',
  isCurrentUser,
  onCallBack,
}) => {
  const isVideo = callType === 'video';
  const isMissed = callStatus === 'missed' || callStatus === 'declined' || callDuration <= 0;

  // Format MM:SS
  const formatDuration = (sec: number) => {
    if (sec <= 0) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0) return `${m} min ${s > 0 ? `${s}s` : ''}`;
    return `${s} segundos`;
  };

  const durationStr = formatDuration(callDuration);

  return (
    <div className="my-1 max-w-xs">
      <div
        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-2xs ${
          isCurrentUser
            ? 'bg-[#d9fdd3]/80 border-emerald-300/80 text-emerald-950'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Icon Badge */}
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              isMissed ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-[#008069]'
            }`}
          >
            {isVideo ? (
              <Video className="w-4 h-4" />
            ) : isMissed ? (
              <PhoneMissed className="w-4 h-4" />
            ) : (
              <Phone className="w-4 h-4" />
            )}
          </div>

          {/* Call Information */}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold truncate">
              {isVideo
                ? isMissed
                  ? 'Chamada de vídeo perdida'
                  : 'Chamada de vídeo finalizada'
                : isMissed
                ? 'Chamada de voz perdida'
                : 'Chamada de voz finalizada'}
            </span>

            <span className="text-[10px] text-slate-500 font-mono">
              {!isMissed && durationStr ? `Duração: ${durationStr}` : 'Sem resposta'}
            </span>
          </div>
        </div>

        {/* Call Back Button */}
        {onCallBack && (
          <button
            type="button"
            onClick={() => onCallBack(callType)}
            className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] whitespace-nowrap transition-transform active:scale-95 cursor-pointer shadow-xs shrink-0"
            title={isVideo ? 'Retornar chamada de vídeo' : 'Retornar chamada de voz'}
          >
            Ligar de volta
          </button>
        )}
      </div>
    </div>
  );
};
