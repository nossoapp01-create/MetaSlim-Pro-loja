import { doc, updateDoc, setDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
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
    callerName,
    callerContact,
    callerAvatar:
      caller === 'admin'
        ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
        : undefined,
    receiver,
    receiverName,
    callType,
    status: 'ringing',
    startedAt: now,
  };

  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  await setDoc(
    chatDocRef,
    {
      id: chatId,
      activeCall: callData,
      updatedAt: now,
    },
    { merge: true }
  );

  return callData;
}

// Answer incoming call
export async function answerCall(chatId: string, callId: string): Promise<void> {
  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  await setDoc(
    chatDocRef,
    {
      id: chatId,
      'activeCall.status': 'connected',
      'activeCall.answeredAt': new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

// Decline incoming call
export async function declineCall(chatId: string, callId: string): Promise<void> {
  const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
  await setDoc(
    chatDocRef,
    {
      id: chatId,
      'activeCall.status': 'declined',
      'activeCall.endedAt': new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

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
  try {
    await setDoc(
      chatDocRef,
      {
        id: chatId,
        'activeCall.status': 'ended',
        'activeCall.duration': durationSeconds,
        'activeCall.endedAt': new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch {}

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
        if (
          data?.activeCall &&
          data.activeCall.status === 'ringing' &&
          data.activeCall.receiver === 'admin'
        ) {
          ringingCall = data.activeCall as ActiveCallData;
        }
      });
      onIncomingCall(ringingCall);
    },
    (err) => {
      console.warn('Admin incoming calls subscription warning:', err);
    }
  );
}
