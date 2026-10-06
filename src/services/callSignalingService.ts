import { doc, updateDoc, setDoc, getDoc, onSnapshot, collection } from 'firebase/firestore';
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
  status: 'ringing' | 'connecting' | 'connected' | 'ended' | 'declined';
  startedAt: string;
  answeredAt?: string;
  endedAt?: string;
  duration?: number;
}

const CHATS_COLLECTION = 'chats';

export const DEFAULT_DOCTOR_AVATAR =
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';
export const DEFAULT_PATIENT_AVATAR =
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

// Check if a call is stale (older than 45 seconds without being answered)
export function isCallStale(call: ActiveCallData | null | undefined): boolean {
  if (!call || !call.startedAt) return true;
  if (call.status !== 'ringing') return false;
  const started = new Date(call.startedAt).getTime();
  const now = Date.now();
  return isNaN(started) || now - started > 45000;
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
    // Read current document first to preserve all activeCall properties
    const snap = await getDoc(chatDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const currentCall = data.activeCall;
      if (currentCall) {
        await setDoc(
          chatDocRef,
          {
            activeCall: {
              ...currentCall,
              status: 'connected',
              answeredAt: now,
            },
            updatedAt: now,
          },
          { merge: true }
        );
        return;
      }
    }

    // Fallback: direct update
    await updateDoc(
      chatDocRef,
      sanitizeCallData({
        'activeCall.status': 'connected',
        'activeCall.answeredAt': now,
        updatedAt: now,
      })
    );
  } catch (err) {
    console.error('Error answering call:', err);
  }
}

// Decline incoming call
export async function declineCall(chatId: string, callId: string): Promise<void> {
  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  const now = new Date().toISOString();

  try {
    const snap = await getDoc(chatDocRef);
    if (snap.exists()) {
      const currentCall = snap.data().activeCall;
      if (currentCall) {
        await setDoc(
          chatDocRef,
          {
            activeCall: {
              ...currentCall,
              status: 'declined',
              endedAt: now,
            },
            updatedAt: now,
          },
          { merge: true }
        );
      }
    }
  } catch {
    try {
      await updateDoc(
        chatDocRef,
        sanitizeCallData({
          'activeCall.status': 'declined',
          'activeCall.endedAt': now,
          updatedAt: now,
        })
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
  }, 3500);
}

// End ongoing call
export async function endCall(chatId: string, callId: string, durationSeconds = 0): Promise<void> {
  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  const now = new Date().toISOString();

  try {
    const snap = await getDoc(chatDocRef);
    if (snap.exists()) {
      const currentCall = snap.data().activeCall;
      if (currentCall) {
        await setDoc(
          chatDocRef,
          {
            activeCall: {
              ...currentCall,
              status: 'ended',
              duration: durationSeconds,
              endedAt: now,
            },
            updatedAt: now,
          },
          { merge: true }
        );
      }
    }
  } catch {
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
  }, 3500);
}

// Simulator Helper: Patient answers call from Dra. Valéria
export async function simulatePatientAnswer(chatId: string, callId: string): Promise<void> {
  await answerCall(chatId, callId);
}

// Simulator Helper: Patient declines call from Dra. Valéria
export async function simulatePatientDecline(chatId: string, callId: string): Promise<void> {
  await declineCall(chatId, callId);
}

// Simulator Helper: Dra. Valéria answers call from Patient
export async function simulateDoctorAnswer(chatId: string, callId: string): Promise<void> {
  await answerCall(chatId, callId);
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
      if (activeCall && isCallStale(activeCall)) {
        onCallUpdate(null);
        return;
      }
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
          call.receiver === 'admin' &&
          !isCallStale(call)
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
