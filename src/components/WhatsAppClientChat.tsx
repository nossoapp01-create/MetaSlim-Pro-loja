import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import {
  getOrCreateChat,
  subscribeToChatMessages,
  sendChatMessage,
  markChatAsRead,
  playChatNotificationSound,
  playIncomingWhatsAppChime,
} from '../services/chatService';
import { ChatMessage, ChatConversation } from '../types';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import {
  MessageSquare,
  Send,
  ArrowLeft,
  ShieldCheck,
  CheckCheck,
  Clock,
  Phone,
  Video,
  Bell,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Copy,
  Check,
  Sparkles,
  User,
  ShoppingBag,
  ExternalLink,
  Info,
  Dna,
  Trash2,
} from 'lucide-react';
import { WhatsAppAudioBubble } from './WhatsAppAudioBubble';
import { WhatsAppAttachmentView } from './WhatsAppAttachmentView';
import { WhatsAppCallModal } from './WhatsAppCallModal';
import { WhatsAppCallBubble } from './WhatsAppCallBubble';
import { WhatsAppIncomingCallModal } from './WhatsAppIncomingCallModal';
import {
  initiateCall,
  answerCall,
  declineCall,
  endCall,
  subscribeToChatCall,
  ActiveCallData,
} from '../services/callSignalingService';
import { processFileAttachment } from '../utils/fileUtils';
import {
  startAudioRecording,
  AudioRecordingSession,
  formatAudioDuration,
} from '../utils/audioUtils';
import { getDoctorValeriaResponse } from '../services/doctorValeriaService';

const STORAGE_CLIENT_IDENTITY = 'metaslim_client_chat_identity';

export const WhatsAppClientChat: React.FC = () => {
  const { setActiveTab, showToast, settings } = useStore();

  const [clientIdentity, setClientIdentity] = useState<{
    name: string;
    contact: string;
    chatId: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CLIENT_IDENTITY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Form states for onboarding
  const [inputName, setInputName] = useState('');
  const [inputContact, setInputContact] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);

  // Chat conversation states
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isDoctorTyping, setIsDoctorTyping] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingSessionRef = useRef<AudioRecordingSession | null>(null);
  const recordingTimerRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // If client identity exists, load or subscribe to the chat
  useEffect(() => {
    if (!clientIdentity) return;

    let isMounted = true;
    getOrCreateChat(clientIdentity.name, clientIdentity.contact).then((conv) => {
      if (isMounted) {
        setConversation(conv);
      }
    });

    const prevCountRef = { current: 0 };
    const unsubscribe = subscribeToChatMessages(clientIdentity.chatId, (updated) => {
      if (isMounted) {
        if (prevCountRef.current > 0 && updated.length > prevCountRef.current) {
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.sender === 'admin') {
            playIncomingWhatsAppChime();
          }
        }
        prevCountRef.current = updated.length;
        setMessages(updated);
        markChatAsRead(clientIdentity.chatId, 'customer');
        setTimeout(() => scrollToBottom(true), 100);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [clientIdentity]);

  // Handle onboarding form submit
  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) {
      showToast('Por favor, informe seu nome.');
      return;
    }
    if (!inputContact.trim()) {
      showToast('Por favor, informe seu WhatsApp ou E-mail.');
      return;
    }

    setIsInitializing(true);
    try {
      const conv = await getOrCreateChat(inputName, inputContact);
      const identity = {
        name: conv.customerName,
        contact: conv.customerContact,
        chatId: conv.id,
      };
      localStorage.setItem(STORAGE_CLIENT_IDENTITY, JSON.stringify(identity));
      setClientIdentity(identity);
      setConversation(conv);
      showToast('Conectado ao atendimento VIP com sucesso!');
    } catch (err) {
      console.error('Erro ao iniciar atendimento:', err);
      showToast('Não foi possível iniciar o chat. Tente novamente.');
    } finally {
      setIsInitializing(false);
    }
  };

  // Trigger Dra. Valéria Prado automated clinical response
  const triggerDoctorAutoReply = (latestMsgs: ChatMessage[]) => {
    const isAutoReplyOn = typeof window !== 'undefined' && localStorage.getItem('metaslim_valeria_autoreply') !== 'false';
    if (!isAutoReplyOn || !clientIdentity) return;

    setIsDoctorTyping(true);
    setTimeout(async () => {
      try {
        const valeriaRes = await getDoctorValeriaResponse(
          latestMsgs,
          clientIdentity.name,
          clientIdentity.contact
        );

        if (valeriaRes?.text) {
          await sendChatMessage(
            clientIdentity.chatId,
            'admin',
            'Dra. Valéria Prado',
            valeriaRes.text
          );
        }
      } catch (err) {
        console.error('Error getting Dra. Valéria response:', err);
      } finally {
        setIsDoctorTyping(false);
        setTimeout(() => scrollToBottom(true), 60);
      }
    }, 2400);
  };

  // Handle message sending
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || newMessage).trim();
    if (!text || !clientIdentity) return;

    setIsSending(true);
    setNewMessage('');
    setShowEmojiPicker(false);

    try {
      const sentMsg = await sendChatMessage(clientIdentity.chatId, 'customer', clientIdentity.name, text);
      setTimeout(() => scrollToBottom(true), 50);

      // Trigger Dra. Valéria AI auto consultation response
      triggerDoctorAutoReply([...messages, sentMsg]);
    } catch (e) {
      console.error('Erro ao enviar mensagem:', e);
      showToast('Erro ao enviar mensagem. Verifique sua conexão.');
    } finally {
      setIsSending(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      const session = await startAudioRecording();
      recordingSessionRef.current = session;
      setIsRecordingAudio(true);
      setRecordingDuration(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (e: any) {
      console.warn('Microphone permission error:', e);
      showToast('Permissão de microfone não concedida no navegador.');
    }
  };

  const handleStopAndSendRecording = async () => {
    if (!recordingSessionRef.current || !clientIdentity) return;
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    try {
      setIsSending(true);
      const { dataUrl, duration } = await recordingSessionRef.current.stop();
      setIsRecordingAudio(false);
      recordingSessionRef.current = null;

      const sentMsg = await sendChatMessage(
        clientIdentity.chatId,
        'customer',
        clientIdentity.name,
        '',
        {
          audioUrl: dataUrl,
          audioDuration: duration,
          messageType: 'audio',
        }
      );
      showToast('Áudio de voz enviado!');
      setTimeout(() => scrollToBottom(true), 50);
      triggerDoctorAutoReply([...messages, sentMsg]);
    } catch (e) {
      console.error('Error sending audio:', e);
      showToast('Erro ao processar gravação de áudio.');
    } finally {
      setIsSending(false);
      setIsRecordingAudio(false);
      setRecordingDuration(0);
    }
  };

  const handleCancelRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (recordingSessionRef.current) {
      recordingSessionRef.current.cancel();
      recordingSessionRef.current = null;
    }
    setIsRecordingAudio(false);
    setRecordingDuration(0);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clientIdentity) return;

    // Reset value so user can pick the same file again
    e.target.value = '';

    setIsUploadingFile(true);
    const caption = newMessage.trim();
    setNewMessage('');

    try {
      showToast('Processando e anexando arquivo...');
      const processed = await processFileAttachment(file);

      const sentMsg = await sendChatMessage(
        clientIdentity.chatId,
        'customer',
        clientIdentity.name,
        caption,
        {
          attachmentUrl: processed.attachmentUrl,
          attachmentName: processed.attachmentName,
          attachmentType: processed.attachmentType,
          attachmentSize: processed.attachmentSize,
          messageType: processed.messageType,
        }
      );

      const typeLabel = processed.attachmentType === 'image' ? 'Foto enviada' : 'PDF enviado';
      showToast(`${typeLabel} com sucesso!`);
      setTimeout(() => scrollToBottom(true), 50);
      triggerDoctorAutoReply([...messages, sentMsg]);
    } catch (err: any) {
      console.error('File upload error:', err);
      showToast(err.message || 'Erro ao processar arquivo.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Call Handlers for Voice and Video
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [activeCallType, setActiveCallType] = useState<'voice' | 'video'>('voice');
  const [isCallInitiator, setIsCallInitiator] = useState<boolean>(true);
  const [incomingCall, setIncomingCall] = useState<ActiveCallData | null>(null);
  const [activeCallSession, setActiveCallSession] = useState<ActiveCallData | null>(null);

  // Subscribe to real-time call events on this client's conversation
  useEffect(() => {
    if (!clientIdentity?.chatId) return;

    const unsubscribe = subscribeToChatCall(clientIdentity.chatId, (call) => {
      setActiveCallSession(call);

      // If doctor is calling this patient and call is ringing
      if (call && call.receiver === 'customer' && call.status === 'ringing') {
        setIncomingCall(call);
      } else {
        setIncomingCall(null);
      }
    });

    return () => unsubscribe();
  }, [clientIdentity?.chatId]);

  // Handle patient answering call from Dra. Valéria Prado
  const handleAcceptIncomingCall = async () => {
    if (!incomingCall || !clientIdentity) return;
    const callToAccept = incomingCall;
    setIncomingCall(null);

    setActiveCallType(callToAccept.callType);
    setIsCallInitiator(false);
    setActiveCallSession(callToAccept);
    setIsCallModalOpen(true);

    try {
      await answerCall(clientIdentity.chatId, callToAccept.callId);
    } catch (e) {
      console.error('Error answering call:', e);
    }
  };

  // Handle patient declining incoming call
  const handleDeclineIncomingCall = async () => {
    if (!incomingCall || !clientIdentity) return;
    const callToDecline = incomingCall;
    setIncomingCall(null);

    try {
      await declineCall(clientIdentity.chatId, callToDecline.callId);
      await sendChatMessage(
        clientIdentity.chatId,
        'admin',
        'Dra. Valéria Prado',
        '',
        {
          messageType: 'call',
          callType: callToDecline.callType,
          callDuration: 0,
          callStatus: 'declined',
        }
      );
    } catch (e) {
      console.error('Error declining call:', e);
    }
  };

  // When patient initiates a call to Dra. Valéria Prado
  const handleStartCall = async (type: 'voice' | 'video') => {
    if (!clientIdentity) return;
    setActiveCallType(type);
    setIsCallInitiator(true);
    setIsCallModalOpen(true);

    try {
      const callData = await initiateCall(
        clientIdentity.chatId,
        'customer',
        clientIdentity.name,
        clientIdentity.contact,
        'admin',
        'Dra. Valéria Prado',
        type
      );
      setActiveCallSession(callData);
    } catch (err: any) {
      console.error('Error initiating call:', err);
      showToast('Erro ao iniciar chamada.');
    }
  };

  const handleCallEnded = async (
    durationSeconds: number,
    type: 'voice' | 'video',
    status: 'completed' | 'missed'
  ) => {
    setIsCallModalOpen(false);
    if (!clientIdentity) return;

    if (activeCallSession) {
      endCall(clientIdentity.chatId, activeCallSession.callId, durationSeconds);
    }

    try {
      await sendChatMessage(
        clientIdentity.chatId,
        'customer',
        clientIdentity.name,
        '',
        {
          messageType: 'call',
          callType: type,
          callDuration: durationSeconds,
          callStatus: status,
        }
      );
      setTimeout(() => scrollToBottom(true), 50);
    } catch (e) {
      console.error('Error logging call from client:', e);
    }
  };

  const handleCopyChatLink = () => {
    const directUrl = `${window.location.origin}${window.location.pathname}?chat=1`;
    navigator.clipboard.writeText(directUrl);
    setCopiedLink(true);
    showToast('Link do WhatsApp de Atendimento copiado!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleResetIdentity = () => {
    if (window.confirm('Deseja sair deste atendimento ou entrar com outro contato?')) {
      localStorage.removeItem(STORAGE_CLIENT_IDENTITY);
      setClientIdentity(null);
      setConversation(null);
      setMessages([]);
    }
  };

  // ----------------------------------------------------
  // ONBOARDING SCREEN (If no user identity registered yet)
  // ----------------------------------------------------
  if (!clientIdentity) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-[#eae6df] flex flex-col items-center justify-center p-4 z-50 overflow-y-auto">
        {/* WhatsApp Signature Top Green Header */}
        <div className="fixed top-0 left-0 right-0 h-44 bg-[#00a884] shadow-md z-0" />

        <div className="relative z-10 max-w-md w-full my-auto p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border border-slate-200/80 font-sans animate-in zoom-in-95 duration-200">
          {/* Header Icon & Branding */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#008069] flex items-center justify-center text-white shadow-lg shadow-emerald-800/30 mb-3 relative">
              <MessageSquare className="w-8 h-8" />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              </span>
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp VIP • Canal Direto
            </span>

            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Dra. Valéria Prado
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Informe seu nome e WhatsApp ou e-mail para conectar ao seu atendimento médico individual.
            </p>
          </div>

          {/* Quick PWA App Installation Option for Client Phone */}
          <PWAInstallPrompt variant="banner" className="mt-4" />

          {/* Form to enter Name + Phone/Email */}
          <form onSubmit={handleStartChat} className="mt-5 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Seu Nome Completo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Ex: Mariana Silva"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Seu WhatsApp ou E-mail *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={inputContact}
                  onChange={(e) => setInputContact(e.target.value)}
                  placeholder="Ex: +55 11 98765-4321 ou seu@email.com"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Usaremos este contato para identificar seu histórico único e enviar respostas.
              </p>
            </div>

            <button
              type="submit"
              disabled={isInitializing}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#008069] to-[#00a884] hover:from-[#006e5a] hover:to-[#009677] text-white font-bold text-sm shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isInitializing ? 'Iniciando canal...' : 'Entrar no WhatsApp de Atendimento'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inicio')}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar à Loja de Peptídeos</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sigilo médico e farmacêutico garantido</span>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ACTIVE WHATSAPP INTERFACE (PURE FULL-SCREEN WHATSAPP WEB)
  // ----------------------------------------------------
  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#efeae2] flex flex-col font-sans z-50 overflow-hidden select-none">
      {/* 1. WHATSAPP WEB TOP BAR */}
      <header className="bg-[#008069] text-white px-3 sm:px-6 py-2.5 sm:py-3 shadow-md shrink-0 select-none border-b border-emerald-800/40">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('inicio')}
              className="p-1.5 -ml-1 text-emerald-100 hover:text-white hover:bg-emerald-700/60 rounded-full transition-colors cursor-pointer flex items-center gap-1.5"
              title="Voltar para o catálogo da loja"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-semibold">Loja</span>
            </button>

            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 p-0.5 border border-white/40 overflow-hidden flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
                  alt="Dra. Valéria Prado"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#008069] rounded-full" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base leading-tight">
                  Dra. Valéria Prado
                </span>
                <span className="bg-[#25d366] text-[#003816] text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  CRM
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <span>online • Atendimento VIP MetaSlim Pro</span>
              </div>
            </div>
          </div>

          {/* Action controls */}
          <div className="flex items-center gap-1 sm:gap-2 text-emerald-100">
            {/* Video Call Button */}
            <button
              type="button"
              onClick={() => handleStartCall('video')}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-400/50 text-white rounded-full sm:rounded-xl font-bold text-xs flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Iniciar Chamada de Vídeo com a Dra. Valéria"
            >
              <Video className="w-4 h-4 text-emerald-100" />
              <span className="hidden md:inline text-[11px]">Vídeo</span>
            </button>

            {/* Voice Call Button */}
            <button
              type="button"
              onClick={() => handleStartCall('voice')}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-400/50 text-white rounded-full sm:rounded-xl font-bold text-xs flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Iniciar Chamada de Voz com a Dra. Valéria"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-100" />
              <span className="hidden md:inline text-[11px]">Voz</span>
            </button>

            {/* Switch to Doctor Mode on this phone */}
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('metaslim_device_mode', 'doctor');
                window.dispatchEvent(new Event('device-mode-changed'));
                showToast('Modo Consultório da Dra. Valéria ativado! Este celular receberá todas as chamadas.');
                setTimeout(() => window.location.reload(), 400);
              }}
              className="px-2 sm:px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-[10px] font-bold text-emerald-100 border border-emerald-400/50 rounded-full flex items-center gap-1 cursor-pointer transition-transform active:scale-95 shadow-xs"
              title="Ativar modo consultório da Dra. Valéria neste aparelho para receber chamadas"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Modo Dra. Valéria</span>
              <span className="sm:hidden">Dra. Valéria</span>
            </button>

            {/* Test Simulation Button: allows user to test the phone ringing and vibration! */}
            <button
              type="button"
              onClick={() => {
                if ((window as any).simulateIncomingCall) {
                  (window as any).simulateIncomingCall('video');
                  showToast('Simulando chamada da Dra. Valéria Prado...');
                }
              }}
              className="px-2 sm:px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-900 text-[10px] font-bold text-emerald-200 border border-emerald-400/40 rounded-full flex items-center gap-1 cursor-pointer transition-transform active:scale-95 shadow-xs"
              title="Testar como a chamada toca no seu celular"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span className="hidden sm:inline">Testar Toque</span>
            </button>

            <PWAInstallPrompt title="Baixar App" variant="button" />

            <button
              onClick={handleCopyChatLink}
              className="hidden sm:flex px-3 py-1.5 hover:bg-emerald-700/60 rounded-full transition-colors text-xs items-center gap-1.5 text-white bg-emerald-700/40 border border-emerald-500/40 cursor-pointer"
              title="Copiar link permanente deste atendimento"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              <span className="text-[11px] font-semibold">
                {copiedLink ? 'Copiado!' : 'Copiar Link'}
              </span>
            </button>

            <button
              onClick={handleResetIdentity}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-700/60 rounded-full transition-colors cursor-pointer"
              title="Sair ou trocar de contato"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. SUB-HEADER / CLIENT CONTACT INFO BANNER */}
      <div className="bg-[#f0f2f5] border-b border-slate-200/70 px-4 sm:px-6 py-1.5 shrink-0">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-slate-800 truncate">
              {clientIdentity.name}
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-slate-500 truncate">
              {clientIdentity.contact}
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full shrink-0">
            ID: {clientIdentity.chatId.replace('chat_', '').slice(0, 14)}
          </span>
        </div>
      </div>

      {/* 3. CHAT MESSAGES BODY WITH AUTHENTIC WHATSAPP WALLPAPER */}
      <div
        className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col relative"
        style={{
          backgroundColor: '#efeae2',
          backgroundImage:
            'radial-gradient(#d3cbbd 0.75px, transparent 0.75px), radial-gradient(#d3cbbd 0.75px, #efeae2 0.75px)',
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 15px 15px',
        }}
      >
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-3 flex-1">
          {/* WhatsApp End-to-End Encryption Notice */}
          <div className="mx-auto my-1 max-w-md bg-[#ffeecd] text-[#54656f] text-[11px] rounded-xl px-3.5 py-2 text-center shadow-xs border border-amber-200/60 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="leading-snug">
              Canal de atendimento direto e confidencial com a <strong>Dra. Valéria Prado</strong>. Suas perguntas e condutas são respondidas individualmente.
            </span>
          </div>

          {/* Message Bubbles */}
          {messages.map((msg) => {
            const isCustomer = msg.sender === 'customer';
            const time = new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-sm shadow-xs relative leading-relaxed ${
                    isCustomer
                      ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-xs border border-emerald-200/40'
                      : 'bg-white text-[#111b21] rounded-tl-xs border border-slate-200/70'
                  }`}
                >
                  {!isCustomer && (
                    <div className="text-[11px] font-bold text-[#008069] mb-0.5 flex items-center gap-1">
                      <span>{msg.senderName || 'Dra. Valéria Prado'}</span>
                      <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-1 rounded">
                        Médica
                      </span>
                    </div>
                  )}

                  {/* Attachment (Image, Photo, or PDF) */}
                  {msg.attachmentUrl && (
                    <WhatsAppAttachmentView
                      attachmentUrl={msg.attachmentUrl}
                      attachmentName={msg.attachmentName}
                      attachmentType={msg.attachmentType}
                      attachmentSize={msg.attachmentSize}
                      isAdmin={!isCustomer}
                    />
                  )}

                  {/* Call Log Bubble (Voice or Video) */}
                  {msg.messageType === 'call' ? (
                    <WhatsAppCallBubble
                      callType={msg.callType}
                      callDuration={msg.callDuration}
                      callStatus={msg.callStatus}
                      timestamp={time}
                      isCurrentUser={isCustomer}
                      onCallBack={(type) => handleStartCall(type)}
                    />
                  ) : msg.audioUrl ? (
                    <div className="my-0.5">
                      <WhatsAppAudioBubble
                        audioUrl={msg.audioUrl}
                        duration={msg.audioDuration}
                        isAdmin={!isCustomer}
                      />
                      {msg.text && !msg.text.startsWith('🎙️') && (
                        <p className="mt-1 text-xs text-slate-700 whitespace-pre-wrap">{msg.text}</p>
                      )}
                    </div>
                  ) : (
                    msg.text && !msg.text.startsWith('📷 Foto') && !msg.text.startsWith('📄 Documento') ? (
                      <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                    ) : !msg.attachmentUrl ? (
                      <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                    ) : null
                  )}

                  <div className="flex items-center justify-end gap-1 mt-1 select-none">
                    <span className="text-[10px] text-slate-500 font-sans">{time}</span>
                    {isCustomer && (
                      <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Doctor Typing Indicator */}
          {isDoctorTyping && (
            <div className="flex flex-col items-start animate-in fade-in duration-150">
              <div className="bg-white text-[#111b21] rounded-2xl rounded-tl-xs px-3.5 py-2 text-sm shadow-xs border border-slate-200/70 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-xs font-semibold text-emerald-800">Dra. Valéria Prado está digitando...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 5. EMOJI BAR (TOGGLED) */}
      {showEmojiPicker && (
        <div className="bg-white border-t border-slate-200 px-4 py-2 shrink-0">
          <div className="max-w-4xl mx-auto w-full flex flex-wrap gap-2 text-lg">
            {['👋', '💉', '🧪', '💊', '🩺', '📦', '👍', '❤️', '🙏', '😊', '✅', '⭐'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => setNewMessage((prev) => prev + emoji)}
                className="p-1 hover:scale-125 transition-transform cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. WHATSAPP INPUT BAR WITH MICROPHONE AUDIO */}
      <footer className="bg-[#f0f2f5] px-3 sm:px-6 py-2.5 border-t border-slate-200/80 shrink-0">
        {isRecordingAudio ? (
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 w-full bg-red-50 border border-red-300 px-3 sm:px-4 py-2 rounded-2xl shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping shrink-0" />
              <span className="text-xs font-bold text-red-700 whitespace-nowrap">Gravando áudio...</span>
              <span className="text-xs font-mono font-bold text-red-900 bg-white px-2 py-0.5 rounded-full border border-red-200 shrink-0">
                {formatAudioDuration(recordingDuration)}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCancelRecording}
                className="px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-100 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Cancelar gravação"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Cancelar</span>
              </button>

              <button
                type="button"
                onClick={handleStopAndSendRecording}
                disabled={isSending}
                className="px-3.5 py-1.5 rounded-xl bg-[#00a884] hover:bg-[#008069] text-white font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 shadow-md cursor-pointer disabled:opacity-50"
                title="Enviar áudio"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Áudio</span>
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="max-w-4xl mx-auto w-full flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-slate-500 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Inserir emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Hidden File Picker for Images and PDFs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,application/pdf"
              className="hidden"
            />

            <button
              type="button"
              onClick={handleTriggerFileSelect}
              disabled={isUploadingFile}
              className={`text-slate-500 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer ${
                isUploadingFile ? 'opacity-50 animate-spin' : ''
              }`}
              title="Anexar imagem, foto ou documento PDF"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mensagem ou grave um áudio..."
              className="flex-1 bg-white border border-transparent focus:border-emerald-500 text-slate-800 text-sm px-4 py-2.5 rounded-2xl focus:outline-none shadow-xs"
            />

            {newMessage.trim() ? (
              <button
                type="submit"
                disabled={isSending}
                className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008069] text-white flex items-center justify-center transition-transform active:scale-90 shadow-md cursor-pointer shrink-0"
                title="Enviar mensagem"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartRecording}
                className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008069] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md cursor-pointer shrink-0"
                title="Gravar áudio de voz"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </form>
        )}
      </footer>

      {/* 6. INCOMING CALL MODAL (RINGS & VIBRATES WHEN DRA. VALÉRIA CALLS) */}
      <WhatsAppIncomingCallModal
        call={incomingCall}
        onAccept={handleAcceptIncomingCall}
        onDecline={handleDeclineIncomingCall}
      />

      {/* 7. ACTIVE REALTIME WHATSAPP CALL MODAL */}
      <WhatsAppCallModal
        isOpen={isCallModalOpen}
        callType={activeCallType}
        contactName="Dra. Valéria Prado"
        contactRole="Médica Endocrinologista • CRM 62.180-SP"
        caller="customer"
        isInitiator={isCallInitiator}
        activeChatId={clientIdentity?.chatId}
        activeCallId={activeCallSession?.callId}
        callStatusSync={activeCallSession?.status}
        onClose={handleCallEnded}
      />
    </div>
  );
};
