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
import { sendChatMessage, ensureClientIdentity } from '../services/chatService';

const STORAGE_DEVICE_MODE = 'metaslim_device_mode';

export const GlobalCallManager: React.FC = () => {
  const { isTenantAdmin, isSuperAdmin, isAdminUser, activeTab } = useStore();

  const [deviceMode, setDeviceMode] = useState<'customer' | 'doctor'>(() => {
    try {
      return (localStorage.getItem(STORAGE_DEVICE_MODE) as any) || 'customer';
    } catch {
      return 'customer';
    }
  });

  const isDoctor = Boolean(isTenantAdmin || isSuperAdmin || isAdminUser || deviceMode === 'doctor');

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
      const identity = ensureClientIdentity();
      if (identity?.chatId) {
        setClientChatId(identity.chatId);
      }
      const savedMode = localStorage.getItem(STORAGE_DEVICE_MODE);
      if (savedMode === 'doctor' || savedMode === 'customer') {
        setDeviceMode(savedMode);
      }
    } catch {}
  }, [activeTab]);

  // Listen to custom event for device mode toggle
  useEffect(() => {
    const handleModeChange = () => {
      try {
        const m = (localStorage.getItem(STORAGE_DEVICE_MODE) as any) || 'customer';
        setDeviceMode(m);
      } catch {}
    };
    window.addEventListener('storage', handleModeChange);
    window.addEventListener('device-mode-changed', handleModeChange);
    return () => {
      window.removeEventListener('storage', handleModeChange);
      window.removeEventListener('device-mode-changed', handleModeChange);
    };
  }, []);

  // 1. GLOBAL LISTENER FOR DOCTOR / ADMIN (RECEIVE CALLS DESTINED FOR DRA. VALÉRIA)
  useEffect(() => {
    if (!isDoctor) return;

    const unsubscribe = subscribeToAdminIncomingCalls((call) => {
      if (call && call.status === 'ringing') {
        setIncomingCall(call);
      } else {
        setIncomingCall(null);
      }
    });

    return () => unsubscribe();
  }, [isDoctor]);

  // 2. GLOBAL LISTENER FOR PATIENT / CLIENT (RECEIVE CALLS FROM DRA. VALÉRIA)
  useEffect(() => {
    if (!clientChatId) return;

    const unsubscribe = subscribeToChatCall(clientChatId, (call) => {
      // If doctor is calling client and call is currently ringing
      if (call && call.receiver === 'customer' && call.status === 'ringing') {
        setIncomingCall(call);
      } else if (!call || call.status === 'ended' || call.status === 'declined') {
        setIncomingCall(null);
      }
    });

    return () => unsubscribe();
  }, [clientChatId]);

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

  // Expose test helper on window
  useEffect(() => {
    (window as any).simulateIncomingCall = (type: 'voice' | 'video' = 'voice') => {
      const mockCall: ActiveCallData = {
        callId: `call_test_${Date.now()}`,
        chatId: clientChatId || 'chat_test',
        caller: isDoctor ? 'customer' : 'admin',
        callerName: isDoctor ? 'Paciente VIP (Teste)' : 'Dra. Valéria Prado',
        callerAvatar: isDoctor
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
          : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
        receiver: isDoctor ? 'admin' : 'customer',
        receiverName: isDoctor ? 'Dra. Valéria Prado' : 'Você (Paciente)',
        callType: type,
        status: 'ringing',
        startedAt: new Date().toISOString(),
      };
      setIncomingCall(mockCall);
    };

    return () => {
      delete (window as any).simulateIncomingCall;
    };
  }, [clientChatId, isDoctor]);

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
        caller={isDoctor ? 'admin' : 'customer'}
        isInitiator={false}
        activeChatId={activeCallSession?.chatId || undefined}
        activeCallId={activeCallSession?.callId || undefined}
        callStatusSync={activeCallSession?.status}
        onClose={handleEndLiveCall}
      />
    </>
  );
};
