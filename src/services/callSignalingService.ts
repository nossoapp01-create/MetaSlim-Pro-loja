import { doc, updateDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase';

export interface ActiveCallData {
  callId: string;
  chatId: string;
  caller: 'customer' | 'admin';
  callerName: string;
  callerContact?: string;
  callerAvatar?: string;
  receiver: 'customer' | 'admin';
  receiverName: string;
  callType: 'voice' | 'video';
  status: 'ringing' | 'connected' | 'ended' | 'declined';
  startedAt: string;
  answeredAt?: string;
  endedAt?: string;
  duration?: number;
}

const CHATS_COLLECTION = 'chats';

const DEFAULT_DOCTOR_AVATAR =
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';
const DEFAULT_PATIENT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';

function sanitizeCallData<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = sanitizeCallData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}

// Start a new call in Firestore
export async function initiateCall(
  chatId: string,
  caller: 'customer' | 'admin',
  callerName: string,
  callerContact: string,
  receiver: 'customer' | 'admin',
  receiverName: string,
  callType: 'voice' | 'video'
): Promise<ActiveCallData> {
  const now = new Date().toISOString();
  const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const callData: ActiveCallData = {
    callId,
    chatId,
    caller,
    callerName: callerName || (caller === 'admin' ? 'Dra. Valéria Prado' : 'Paciente VIP'),
    callerContact: callerContact || (caller === 'admin' ? 'CRM 62.180-SP' : 'Paciente Conectado'),
    callerAvatar: caller === 'admin' ? DEFAULT_DOCTOR_AVATAR : DEFAULT_PATIENT_AVATAR,
    receiver,
    receiverName: receiverName || (receiver === 'admin' ? 'Dra. Valéria Prado' : 'Paciente VIP'),
    callType,
    status: 'ringing',
    startedAt: now,
  };

  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);

  try {
    await setDoc(
      chatDocRef,
      sanitizeCallData({
        id: chatId,
        activeCall: callData,
        updatedAt: now,
      }),
      { merge: true }
    );
  } catch (err) {
    console.error('Error initiating call in Firestore:', err);
  }

  return callData;
}

// Answer incoming call
export async function answerCall(chatId: string, callId: string): Promise<void> {
  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  const now = new Date().toISOString();
  try {
    await updateDoc(
      chatDocRef,
      sanitizeCallData({
        'activeCall.status': 'connected',
        'activeCall.answeredAt': now,
        updatedAt: now,
      })
    );
  } catch {
    try {
      await setDoc(
        chatDocRef,
        sanitizeCallData({
          id: chatId,
          activeCall: {
            status: 'connected',
            answeredAt: now,
          },
          updatedAt: now,
        }),
        { merge: true }
      );
    } catch (e) {
      console.error('Error answering call:', e);
    }
  }
}

// Decline incoming call
export async function declineCall(chatId: string, callId: string): Promise<void> {
  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  const now = new Date().toISOString();
  try {
    await updateDoc(
      chatDocRef,
      sanitizeCallData({
        'activeCall.status': 'declined',
        'activeCall.endedAt': now,
        updatedAt: now,
      })
    );
  } catch {
    try {
      await setDoc(
        chatDocRef,
        sanitizeCallData({
          id: chatId,
          activeCall: {
            status: 'declined',
            endedAt: now,
          },
          updatedAt: now,
        }),
        { merge: true }
      );
    } catch (e) {
      console.error('Error declining call:', e);
    }
  }

  // Clear active call state after brief cooldown
  setTimeout(async () => {
    try {
      await updateDoc(chatDocRef, {
        activeCall: null,
      });
    } catch {}
  }, 2500);
}

// End ongoing call
export async function endCall(chatId: string, callId: string, durationSeconds = 0): Promise<void> {
  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  const now = new Date().toISOString();
  try {
    await updateDoc(
      chatDocRef,
      sanitizeCallData({
        'activeCall.status': 'ended',
        'activeCall.duration': durationSeconds,
        'activeCall.endedAt': now,
        updatedAt: now,
      })
    );
  } catch {
    try {
      await setDoc(
        chatDocRef,
        sanitizeCallData({
          id: chatId,
          activeCall: {
            status: 'ended',
            duration: durationSeconds,
            endedAt: now,
          },
          updatedAt: now,
        }),
        { merge: true }
      );
    } catch (e) {
      console.error('Error ending call:', e);
    }
  }

  // Clear active call state
  setTimeout(async () => {
    try {
      await updateDoc(chatDocRef, {
        activeCall: null,
      });
    } catch {}
  }, 2500);
}

// Listen to call events on a single chat (for client or active admin conversation)
export function subscribeToChatCall(
  chatId: string,
  onCallUpdate: (call: ActiveCallData | null) => void
): () => void {
  if (!chatId) return () => {};
  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  return onSnapshot(
    chatDocRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onCallUpdate(null);
        return;
      }
      const data = snapshot.data();
      const activeCall = (data?.activeCall as ActiveCallData) || null;
      onCallUpdate(activeCall);
    },
    (err) => {
      console.warn('Call subscription warning:', err);
    }
  );
}

// Listen to all incoming calls destined for admin across any conversation
export function subscribeToAdminIncomingCalls(
  onIncomingCall: (call: ActiveCallData | null) => void
): () => void {
  const chatsRef = collection(db, CHATS_COLLECTION);
  return onSnapshot(
    chatsRef,
    (snapshot) => {
      let ringingCall: ActiveCallData | null = null;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const call = data?.activeCall;
        if (
          call &&
          call.status === 'ringing' &&
          call.receiver === 'admin'
        ) {
          ringingCall = call as ActiveCallData;
        }
      });
      onIncomingCall(ringingCall);
    },
    (err) => {
      console.warn('Admin incoming calls subscription warning:', err);
    }
  );
}
