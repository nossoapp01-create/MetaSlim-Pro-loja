import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { WhatsAppIncomingCallModal } from './WhatsAppIncomingCallModal';
import { WhatsAppCallModal } from './WhatsAppCallModal';
import {
  subscribeToAdminIncomingCalls,
  subscribeToChatCall,
  answerCall,
  declineCall,
  endCall,
  ActiveCallData,
} from '../services/callSignalingService';
import { sendChatMessage } from '../services/chatService';

const STORAGE_CLIENT_IDENTITY = 'metaslim_client_chat_identity';

export const GlobalCallManager: React.FC = () => {
  const { isTenantAdmin, isSuperAdmin, isAdminUser, setActiveTab, activeTab } = useStore();

  const isDoctorAdmin = Boolean(isTenantAdmin || isSuperAdmin || isAdminUser);

  const [incomingCall, setIncomingCall] = useState<ActiveCallData | null>(null);
  const [activeCallSession, setActiveCallSession] = useState<ActiveCallData | null>(null);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [liveCallType, setLiveCallType] = useState<'voice' | 'video'>('voice');
  const [liveCallContact, setLiveCallContact] = useState<{ name: string; role: string; avatar?: string }>({
    name: 'Dra. Valéria Prado',
    role: 'Médica Endocrinologista • CRM 62.180-SP',
  });

  // Client identity from storage
  const [clientChatId, setClientChatId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CLIENT_IDENTITY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.chatId) {
          setClientChatId(parsed.chatId);
        }
      }
    } catch {}
  }, [activeTab]);

  // 1. GLOBAL LISTENER FOR DOCTOR / ADMIN
  useEffect(() => {
    if (!isDoctorAdmin) return;

    const unsubscribe = subscribeToAdminIncomingCalls((call) => {
      if (call && call.status === 'ringing') {
        setIncomingCall(call);
      } else {
        setIncomingCall(null);
      }
    });

    return () => unsubscribe();
  }, [isDoctorAdmin]);

  // 2. GLOBAL LISTENER FOR PATIENT / CLIENT (ON MOBILE PWA OR DESKTOP)
  useEffect(() => {
    if (!clientChatId || isDoctorAdmin) return;

    const unsubscribe = subscribeToChatCall(clientChatId, (call) => {
      // If doctor is calling client and call is currently ringing
      if (call && call.receiver === 'customer' && call.status === 'ringing') {
        setIncomingCall(call);
      } else if (!call || call.status === 'ended' || call.status === 'declined') {
        setIncomingCall(null);
      }
    });

    return () => unsubscribe();
  }, [clientChatId, isDoctorAdmin]);

  // 3. LISTEN TO ACTIVE CALL STATUS WHEN IN CALL
  useEffect(() => {
    const activeChatId = activeCallSession?.chatId;
    if (!activeChatId || !isLiveCallOpen) return;

    const unsubscribe = subscribeToChatCall(activeChatId, (call) => {
      if (!call || call.status === 'ended' || call.status === 'declined') {
        // Other party hung up
        setIsLiveCallOpen(false);
        setActiveCallSession(null);
      } else {
        setActiveCallSession(call);
      }
    });

    return () => unsubscribe();
  }, [activeCallSession?.chatId, isLiveCallOpen]);

  // Handle Accepting Incoming Call
  const handleAcceptIncomingCall = async () => {
    if (!incomingCall) return;
    const call = incomingCall;
    setIncomingCall(null);

    // Prepare active call modal
    setLiveCallType(call.callType);
    setLiveCallContact({
      name: call.callerName,
      role:
        call.caller === 'admin'
          ? 'Médica Endocrinologista • CRM 62.180-SP'
          : `Paciente VIP • ${call.callerContact || ''}`,
      avatar: call.callerAvatar,
    });
    setActiveCallSession(call);
    setIsLiveCallOpen(true);

    // Switch view to chat
    setActiveTab('chat');

    try {
      await answerCall(call.chatId, call.callId);
    } catch (e) {
      console.error('Error answering call:', e);
    }
  };

  // Handle Declining Incoming Call
  const handleDeclineIncomingCall = async () => {
    if (!incomingCall) return;
    const call = incomingCall;
    setIncomingCall(null);

    try {
      await declineCall(call.chatId, call.callId);
      await sendChatMessage(
        call.chatId,
        call.receiver,
        call.receiverName,
        '',
        {
          messageType: 'call',
          callType: call.callType,
          callDuration: 0,
          callStatus: 'declined',
        }
      );
    } catch (e) {
      console.error('Error declining call:', e);
    }
  };

  // Handle Ending Active Live Call
  const handleEndLiveCall = async (
    durationSeconds: number,
    callType: 'voice' | 'video',
    status: 'completed' | 'missed'
  ) => {
    setIsLiveCallOpen(false);
    const session = activeCallSession;
    setActiveCallSession(null);

    if (session) {
      try {
        await endCall(session.chatId, session.callId, durationSeconds);
        await sendChatMessage(
          session.chatId,
          session.receiver,
          session.receiverName,
          '',
          {
            messageType: 'call',
            callType,
            callDuration: durationSeconds,
            callStatus: status,
          }
        );
      } catch (e) {
        console.error('Error ending live call:', e);
      }
    }
  };

  // Expose global test trigger on window for easy testing
  useEffect(() => {
    (window as any).simulateIncomingCall = (type: 'voice' | 'video' = 'voice') => {
      const mockCall: ActiveCallData = {
        callId: `call_test_${Date.now()}`,
        chatId: clientChatId || 'chat_test',
        caller: 'admin',
        callerName: 'Dra. Valéria Prado',
        callerAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
        receiver: 'customer',
        receiverName: 'Você (Paciente)',
        callType: type,
        status: 'ringing',
        startedAt: new Date().toISOString(),
      };
      setIncomingCall(mockCall);
    };

    return () => {
      delete (window as any).simulateIncomingCall;
    };
  }, [clientChatId]);

  return (
    <>
      {/* GLOBAL INCOMING CALL SCREEN (RINGS & VIBRATES DEVICE) */}
      <WhatsAppIncomingCallModal
        call={incomingCall}
        onAccept={handleAcceptIncomingCall}
        onDecline={handleDeclineIncomingCall}
      />

      {/* ACTIVE CALL OVERLAY */}
      <WhatsAppCallModal
        isOpen={isLiveCallOpen}
        callType={liveCallType}
        contactName={liveCallContact.name}
        contactRole={liveCallContact.role}
        contactAvatar={liveCallContact.avatar}
        caller={isDoctorAdmin ? 'admin' : 'customer'}
        isInitiator={false}
        callStatusSync={activeCallSession?.status}
        onClose={handleEndLiveCall}
      />
    </>
  );
};
