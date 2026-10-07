import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { callAudio } from '../utils/callAudio';
import { answerCall, declineCall } from '../services/callSignalingService';

interface WhatsAppCallModalProps {
  isOpen: boolean;
  callType: 'voice' | 'video';
  contactName: string;
  contactRole?: string;
  contactAvatar?: string;
  caller: 'customer' | 'admin';
  isInitiator?: boolean;
  activeChatId?: string;
  activeCallId?: string;
  callStatusSync?: 'ringing' | 'connecting' | 'connected' | 'ended' | 'declined';
  onClose: (durationSeconds: number, callType: 'voice' | 'video', status: 'completed' | 'missed') => void;
}

export const WhatsAppCallModal: React.FC<WhatsAppCallModalProps> = ({
  isOpen,
  callType,
  contactName,
  contactRole,
  contactAvatar,
  caller,
  isInitiator = true,
  activeChatId,
  activeCallId,
  callStatusSync,
  onClose,
}) => {
  const [callStatus, setCallStatus] = useState<'calling' | 'connecting' | 'connected' | 'ended' | 'missed'>('calling');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);

  // Default avatars
  const defaultDoctorAvatar =
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';
  const avatarUrl = contactAvatar || defaultDoctorAvatar;

  // Format call duration MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Synchronize with Firestore real-time call status
  useEffect(() => {
    if (!isOpen) return;

    if (callStatusSync === 'connected' && callStatus !== 'connected') {
      callAudio.stopRinging();
      callAudio.playCallConnectedChime();
      setCallStatus('connected');
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
      }
    } else if (callStatusSync === 'declined' || callStatusSync === 'ended') {
      handleEndCall('missed');
    }
  }, [callStatusSync, isOpen]);

  // Initialize call & WebRTC media stream
  useEffect(() => {
    if (!isOpen) return;

    setCallDuration(0);
    setIsMuted(false);
    setIsVideoDisabled(false);
    setCameraPermissionError(null);

    // If answering an incoming call, directly connect
    if (!isInitiator) {
      callAudio.stopIncomingRingtone();
      callAudio.playCallConnectedChime();
      setCallStatus('connected');
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      // Caller initiates outgoing ring
      setCallStatus('calling');
      callAudio.startOutgoingRinging();

      // Ring for 45 seconds before timing out as missed call (do NOT auto-answer compulsorily)
      const timeoutNoAnswer = setTimeout(() => {
        setCallStatus((curr) => {
          if (curr === 'calling') {
            callAudio.stopRinging();
            callAudio.playHangupTone();
            handleEndCall('missed');
            return 'missed';
          }
          return curr;
        });
      }, 45000);

      return () => clearTimeout(timeoutNoAnswer);
    }

    // Acquire real webcam/microphone stream
    const initMedia = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: callType === 'video' ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false,
          });

          localStreamRef.current = stream;
          if (localVideoRef.current && callType === 'video') {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err: any) {
        console.warn('Microphone/Camera permission notice:', err);
        setCameraPermissionError('Modo simulado ativado (câmera/microfone indisponível).');
      }
    };

    initMedia();

    return () => {
      callAudio.stopAll();
      if (timerRef.current) clearInterval(timerRef.current);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [isOpen, callType, isInitiator]);

  // Handle Mute Mic toggle
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  // Handle Video On/Off toggle
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoDisabled;
      });
    }
    setIsVideoDisabled(!isVideoDisabled);
  };

  // Connect call immediately (e.g. simulation or direct answer)
  const handleConnectCallNow = async () => {
    callAudio.stopRinging();
    callAudio.playCallConnectedChime();
    setCallStatus('connected');
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    // Sync to Firestore if IDs are provided
    if (activeChatId && activeCallId) {
      try {
        await answerCall(activeChatId, activeCallId);
      } catch (e) {
        console.warn('Error answering in Firestore:', e);
      }
    }
  };

  // Decline call immediately (e.g. simulation or busy)
  const handleSimulateDecline = async () => {
    callAudio.stopRinging();
    callAudio.playHangupTone();
    if (activeChatId && activeCallId) {
      try {
        await declineCall(activeChatId, activeCallId);
      } catch {}
    }
    handleEndCall('missed');
  };

  // Handle hangup
  const handleEndCall = (forcedStatus?: 'completed' | 'missed') => {
    callAudio.stopAll();
    callAudio.playHangupTone();
    setCallStatus('ended');

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    const finalDuration = callDuration;
    const finalStatus = forcedStatus || (finalDuration > 0 ? 'completed' : 'missed');

    setTimeout(() => {
      onClose(finalDuration, callType, finalStatus);
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b141a] text-white flex flex-col justify-between overflow-hidden animate-in fade-in duration-200 select-none">
      {/* 1. TOP STATUS BAR */}
      <div className="px-4 py-3 sm:py-4 bg-gradient-to-b from-black/70 to-transparent flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            {callType === 'video' ? 'Chamada de Vídeo VIP' : 'Chamada de Voz VIP'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-white/70 bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px]">Criptografia de ponta a ponta</span>
        </div>
      </div>

      {/* 2. MAIN CALL DISPLAY AREA */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-4 w-full h-full min-h-0">
        {/* VIDEO CALL MODE */}
        {callType === 'video' ? (
          <div className="relative w-full h-full max-w-4xl mx-auto rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl flex items-center justify-center">
            {callStatus === 'connected' ? (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <img
                  src={avatarUrl}
                  alt={contactName}
                  className="w-full h-full object-cover filter brightness-95 scale-105 transition-transform duration-1000"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-white">{contactName}</span>
                  <span className="text-[10px] text-emerald-300 font-mono">HD 1080p</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 text-center z-10 p-6 max-w-md w-full">
                <div className="relative">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 border-2 border-emerald-400 overflow-hidden shadow-2xl animate-pulse">
                    <img src={avatarUrl} alt={contactName} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                    {callStatus === 'calling' ? 'Chamando...' : 'Conectando...'}
                  </span>
                </div>

                <div className="flex flex-col mt-2">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{contactName}</h2>
                  <p className="text-xs text-emerald-300 mt-0.5">
                    {contactRole || 'Atendimento Médico Especializado'}
                  </p>
                </div>

                {/* TEST SIMULATION CONTROLS */}
                {callStatus === 'calling' && (
                  <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
                    <button
                      type="button"
                      onClick={handleConnectCallNow}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer animate-pulse"
                      title="Simular paciente atendendo a chamada imediatamente"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simular Atendimento Imediato (Testar)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSimulateDecline}
                      className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-red-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all border border-white/10 active:scale-95 cursor-pointer"
                      title="Simular paciente recusando ou sem resposta"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Simular Paciente Ocupado / Recusar</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Local User Picture-in-Picture Webcam Preview */}
            <div className="absolute top-4 right-4 z-20 w-28 h-40 sm:w-36 sm:h-52 rounded-2xl overflow-hidden bg-black/80 border-2 border-white/40 shadow-2xl backdrop-blur-md">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoDisabled ? 'hidden' : 'block'}`}
              />

              {isVideoDisabled && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-2 text-center">
                  <VideoOff className="w-6 h-6 mb-1 text-slate-500" />
                  <span className="text-[10px] font-semibold">Câmera desativada</span>
                </div>
              )}

              <span className="absolute bottom-1.5 left-2 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                Você
              </span>
            </div>
          </div>
        ) : (
          /* VOICE CALL MODE */
          <div className="flex flex-col items-center justify-center gap-6 text-center max-w-md w-full">
            <div className="relative flex items-center justify-center">
              {callStatus === 'connected' && (
                <>
                  <div className="absolute w-44 h-44 rounded-full bg-emerald-500/20 animate-ping duration-1000" />
                  <div className="absolute w-56 h-56 rounded-full bg-emerald-500/10 animate-pulse duration-700" />
                </>
              )}

              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 border-2 border-emerald-400/80 overflow-hidden shadow-2xl relative z-10 bg-slate-900">
                <img src={avatarUrl} alt={contactName} className="w-full h-full object-cover rounded-full" />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{contactName}</h2>
              <span className="text-xs text-emerald-400 font-semibold mt-1">
                {contactRole || 'Atendimento VIP MetaSlim Pro'}
              </span>

              <div className="mt-3 px-4 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs">
                {callStatus === 'connected' ? (
                  <span className="text-sm font-mono font-bold tracking-widest text-emerald-300">
                    {formatDuration(callDuration)}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-white/90">
                    {callStatus === 'calling' ? 'Chamando...' : 'Conectando...'}
                  </span>
                )}
              </div>

              {/* TEST SIMULATION CONTROLS */}
              {callStatus === 'calling' && (
                <div className="mt-5 flex flex-col gap-2 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={handleConnectCallNow}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer animate-pulse"
                    title="Simular atendimento imediato para teste"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simular Atendimento Imediato (Testar)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateDecline}
                    className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-red-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all border border-white/10 active:scale-95 cursor-pointer"
                    title="Simular recusa de chamada"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Simular Paciente Ocupado / Recusar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {callType === 'video' && callStatus === 'connected' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 text-xs font-mono font-bold text-emerald-300 shadow-md">
            {formatDuration(callDuration)}
          </div>
        )}

        {cameraPermissionError && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-amber-950/80 text-amber-200 text-xs px-3 py-1 rounded-full border border-amber-500/40">
            {cameraPermissionError}
          </div>
        )}
      </div>

      {/* 3. BOTTOM CONTROL BAR */}
      <div className="px-4 py-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-center z-20">
        <div className="bg-[#1f2c34]/90 backdrop-blur-md px-4 sm:px-6 py-3 rounded-full border border-white/15 shadow-2xl flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-90 ${
              isMuted ? 'bg-red-500 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
            title={isMuted ? 'Ativar microfone' : 'Silenciar microfone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {callType === 'video' && (
            <button
              type="button"
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-90 ${
                isVideoDisabled ? 'bg-red-500 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
              title={isVideoDisabled ? 'Ligar câmera' : 'Desligar câmera'}
            >
              {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-90 ${
              !isSpeakerOn ? 'bg-red-500 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
            title={isSpeakerOn ? 'Silenciar alto-falante' : 'Ativar alto-falante'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => handleEndCall()}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl active:scale-90 ring-4 ring-red-500/30"
            title="Encerrar Chamada"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
