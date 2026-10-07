import React from 'react';
import { Phone, Video, PhoneOff, ShieldCheck } from 'lucide-react';
import { ActiveCallData } from '../services/callSignalingService';

interface WhatsAppIncomingCallModalProps {
  call: ActiveCallData | null;
  onAccept: () => void;
  onDecline: () => void;
}

export const WhatsAppIncomingCallModal: React.FC<WhatsAppIncomingCallModalProps> = ({
  call,
  onAccept,
  onDecline,
}) => {
  if (!call || call.status !== 'ringing') return null;

  const isVideo = call.callType === 'video';
  const defaultAvatar =
    call.caller === 'admin'
      ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
      : undefined;

  const avatarUrl = call.callerAvatar || defaultAvatar;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0b141a]/95 backdrop-blur-md text-white flex flex-col justify-between p-6 animate-in fade-in zoom-in-95 duration-200 select-none"
    >
      {/* 1. TOP ENCRYPTION BADGE */}
      <div className="flex flex-col items-center gap-2 mx-auto max-w-sm w-full">
        <div className="flex items-center justify-center gap-1.5 text-xs text-white/70 bg-black/40 py-1.5 px-4 rounded-full border border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Chamada Segura Criptografada</span>
        </div>
      </div>

      {/* 2. CALLER INFORMATION & PULSING AVATAR */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        <div className="relative flex items-center justify-center mb-6">
          {/* Animated Green Rings */}
          <div className="absolute w-44 h-44 rounded-full bg-emerald-500/20 animate-ping duration-1000" />
          <div className="absolute w-56 h-56 rounded-full bg-emerald-500/10 animate-pulse duration-700" />

          {/* Profile Photo */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 border-4 border-emerald-400 overflow-hidden shadow-2xl relative z-10 bg-slate-800">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={call.callerName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-emerald-700 flex items-center justify-center text-white text-3xl font-black">
                {call.callerName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {call.callerName}
        </h2>

        {call.callerContact && (
          <p className="text-xs text-slate-400 mt-1 font-mono">{call.callerContact}</p>
        )}

        <div className="mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-pulse">
          {isVideo ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
          <span>
            {isVideo ? 'Chamada de vídeo recebida...' : 'Chamada de voz recebida...'}
          </span>
        </div>
      </div>

      {/* 3. BOTTOM ACCEPT / DECLINE ACTIONS */}
      <div className="flex items-center justify-around max-w-sm mx-auto w-full pb-6 pt-4">
        {/* DECLINE BUTTON */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDecline();
            }}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl transition-transform active:scale-90 cursor-pointer ring-4 ring-red-500/30"
            title="Recusar Chamada"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
          <span className="text-xs font-semibold text-red-300">Recusar</span>
        </div>

        {/* ACCEPT BUTTON */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAccept();
            }}
            className="w-16 h-16 rounded-full bg-[#00a884] hover:bg-[#008069] text-white flex items-center justify-center shadow-2xl transition-transform active:scale-90 cursor-pointer ring-4 ring-emerald-400/40 animate-bounce duration-1000"
            title="Atender Chamada"
          >
            {isVideo ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
          </button>
          <span className="text-xs font-semibold text-emerald-300">Atender</span>
        </div>
      </div>
    </div>
  );
};
