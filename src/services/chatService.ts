import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { ChatMessage, ChatConversation } from '../types';

const CHATS_COLLECTION = 'chats';
const MESSAGES_SUBCOLLECTION = 'messages';
const LOCAL_STORAGE_CHATS_PREFIX = 'metaslim_chat_';
const LOCAL_STORAGE_ALL_CHATS = 'metaslim_all_cached_chats';

// Generate a clean valid Firestore document ID (<= 128 chars, matches ^[a-zA-Z0-9_\-]+$)
export function generateChatId(contact: string): string {
  const sanitized = contact
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 60);

  return `chat_${sanitized || Date.now().toString()}`;
}

// Authentic WhatsApp-style incoming message chime using Web Audio API
export function playIncomingWhatsAppChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;

    // Tone 1: High bell chime intro (880 Hz - A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, t);
    gain1.gain.setValueAtTime(0.28, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.12);

    // Tone 2: Bright harmonic chime peak (1318.5 Hz - E6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.5, t + 0.08);
    gain2.gain.setValueAtTime(0.32, t + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t + 0.08);
    osc2.stop(t + 0.45);

    // Tone 3: Sweet high overtone (1760 Hz - A6) for authentic crispness
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(1760, t + 0.09);
    gain3.gain.setValueAtTime(0.12, t + 0.09);
    gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(t + 0.09);
    osc3.stop(t + 0.35);
  } catch (e) {
    console.warn('Audio chime warning:', e);
  }
}

// Outgoing message sound (light click / pop)
export function playOutgoingWhatsAppTone() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.06);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  } catch (e) {}
}

export const playChatNotificationSound = playIncomingWhatsAppChime;

// Desktop Notification helper
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const res = await Notification.requestPermission();
    return res === 'granted';
  }
  return false;
}

export function showSystemNotification(title: string, body: string, onClick?: () => void) {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification(title, {
        body,
        icon: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=128',
      });
      if (onClick) {
        notif.onclick = () => {
          window.focus();
          onClick();
          notif.close();
        };
      }
    }
  } catch (e) {
    console.warn('Desktop notification error:', e);
  }
}

// Flash page title to alert user when tab is inactive
let titleFlashTimer: any = null;
export function flashPageTitle(alertText: string, originalTitle = 'MetaSlim-Pro-loja') {
  if (typeof document === 'undefined') return;
  if (titleFlashTimer) clearInterval(titleFlashTimer);

  let state = false;
  let count = 0;
  titleFlashTimer = setInterval(() => {
    document.title = state ? alertText : originalTitle;
    state = !state;
    count++;
    if (count > 16) {
      clearInterval(titleFlashTimer);
      document.title = originalTitle;
    }
  }, 900);
}

function cleanObject<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      result[key] = val;
    }
  }
  return result;
}

// Get or initialize a client conversation
export async function getOrCreateChat(
  customerName: string,
  customerContact: string,
  tenantId?: string
): Promise<ChatConversation> {
  const chatId = generateChatId(customerContact);
  const now = new Date().toISOString();

  const isEmail = customerContact.includes('@');
  const chatData: ChatConversation = {
    id: chatId,
    customerName: customerName.trim(),
    customerContact: customerContact.trim(),
    lastMessage: 'Atendimento individual iniciado com Dra. Valéria Prado.',
    lastMessageAt: now,
    unreadByAdmin: 1,
    unreadByCustomer: 0,
    createdAt: now,
    updatedAt: now,
    tenantId: tenantId || 'metaslim-pro-official',
  };

  if (isEmail) {
    chatData.customerEmail = customerContact.trim();
  } else {
    chatData.customerPhone = customerContact.trim();
  }

  // 1. Save locally first
  saveChatToLocal(chatData);

  // 2. Sync to Firestore
  try {
    const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
    const existing = await getDoc(chatDocRef);
    if (!existing.exists()) {
      await setDoc(chatDocRef, cleanObject(chatData));

      // Create initial welcoming message from Dra. Valéria Prado
      const welcomeMsg: ChatMessage = {
        id: `msg_welcome_${Date.now()}`,
        chatId,
        sender: 'admin',
        senderName: 'Dra. Valéria Prado',
        text: `Olá ${customerName}! Seja muito bem-vindo(a) ao Atendimento VIP Individual do MetaSlim Pro.\n\nSou a Dra. Valéria Prado (CRM 62.180-SP). Estou à sua disposição exclusiva para esclarecer dúvidas sobre protocolos de emagrecimento (Retatrutide, Tirzepatida, Semaglutida), reconstituição com água BAC ou acompanhar seu pedido.\n\nComo posso te orientar hoje?`,
        timestamp: new Date().toISOString(),
        status: 'delivered',
      };

      const msgDocRef = doc(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION, welcomeMsg.id);
      await setDoc(msgDocRef, cleanObject(welcomeMsg));
      saveMessageToLocal(chatId, welcomeMsg);
    } else {
      const data = existing.data() as ChatConversation;
      // Update contact name if changed
      if (data.customerName !== customerName || data.customerContact !== customerContact) {
        await updateDoc(chatDocRef, cleanObject({
          customerName: customerName.trim(),
          customerContact: customerContact.trim(),
          updatedAt: now,
        }));
      }
      return { ...data, ...chatData, createdAt: data.createdAt || now };
    }
  } catch (err) {
    console.error('Firestore chat initialization error:', err);
    // Ensure initial welcome message exists locally
    const localMsgs = getLocalMessages(chatId);
    if (localMsgs.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: `msg_welcome_${Date.now()}`,
        chatId,
        sender: 'admin',
        senderName: 'Dra. Valéria Prado',
        text: `Olá ${customerName}! Seja muito bem-vindo(a) ao Atendimento VIP Individual do MetaSlim Pro.\n\nSou a Dra. Valéria Prado (CRM 62.180-SP). Estou à sua disposição exclusiva para esclarecer dúvidas sobre protocolos de emagrecimento (Retatrutide, Tirzepatida, Semaglutida), reconstituição com água BAC ou acompanhar seu pedido.\n\nComo posso te orientar hoje?`,
        timestamp: new Date().toISOString(),
        status: 'delivered',
      };
      saveMessageToLocal(chatId, welcomeMsg);
    }
  }

  return chatData;
}

// Subscribe to messages in a specific chat
export function subscribeToChatMessages(
  chatId: string,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  // First emit local cached messages immediately
  const localCached = getLocalMessages(chatId);
  if (localCached.length > 0) {
    onUpdate(localCached);
  }

  try {
    const messagesRef = collection(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push(docSnap.data() as ChatMessage);
        });

        // Merge with local cached messages that may not be in Firestore snapshot yet
        const msgMap = new Map<string, ChatMessage>();
        localCached.forEach((m) => msgMap.set(m.id, m));
        msgs.forEach((m) => msgMap.set(m.id, m));

        const merged = Array.from(msgMap.values()).sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        if (merged.length > 0) {
          try {
            localStorage.setItem(
              `${LOCAL_STORAGE_CHATS_PREFIX}messages_${chatId}`,
              JSON.stringify(merged)
            );
          } catch {}
          onUpdate(merged);
        } else if (localCached.length > 0) {
          onUpdate(localCached);
        }
      },
      (error) => {
        console.warn('Messages snapshot error, using cached:', error);
        onUpdate(getLocalMessages(chatId));
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Could not setup Firestore onSnapshot:', error);
    return () => {};
  }
}

// Send a message
export async function sendChatMessage(
  chatId: string,
  sender: 'customer' | 'admin',
  senderName: string,
  text: string
): Promise<ChatMessage> {
  const now = new Date().toISOString();
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const message: ChatMessage = {
    id: messageId,
    chatId,
    sender,
    senderName,
    text: text.trim(),
    timestamp: now,
    status: 'sent',
  };

  // 1. Immediately store in local cache
  saveMessageToLocal(chatId, message);
  playChatNotificationSound();

  // 2. Persist to Firestore
  try {
    const msgDocRef = doc(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION, messageId);
    await setDoc(msgDocRef, cleanObject(message));

    const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
    const updates: Record<string, any> = {
      id: chatId,
      lastMessage: text.trim().slice(0, 150),
      lastMessageAt: now,
      updatedAt: now,
    };

    if (sender === 'customer') {
      updates.unreadByAdmin = increment(1);
    } else {
      updates.unreadByCustomer = increment(1);
    }

    // setDoc with merge: true ensures document is created if missing, or merged if present
    await setDoc(chatDocRef, updates, { merge: true });
  } catch (err) {
    console.error('Error saving message to Firestore:', err);
  }

  // Update local chat conversation meta
  updateLocalChatMeta(chatId, {
    lastMessage: text.trim().slice(0, 150),
    lastMessageAt: now,
    unreadByAdmin: sender === 'customer' ? 1 : 0,
    unreadByCustomer: sender === 'admin' ? 1 : 0,
  });

  return message;
}

export function getChatSortTime(c: Partial<ChatConversation>): number {
  const d = c.lastMessageAt || c.updatedAt || c.createdAt;
  if (!d) return 0;
  const t = new Date(d).getTime();
  return isNaN(t) ? 0 : t;
}

// Subscribe to all conversations for Admin
export function subscribeToAllConversations(
  onUpdate: (conversations: ChatConversation[]) => void
): () => void {
  // Emit local cached first
  const localChats = getAllLocalChats();
  if (localChats.length > 0) {
    onUpdate(localChats);
  }

  try {
    const chatsRef = collection(db, CHATS_COLLECTION);
    const q = query(chatsRef, orderBy('lastMessageAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chats: ChatConversation[] = [];
        snapshot.forEach((docSnap) => {
          chats.push(docSnap.data() as ChatConversation);
        });

        // Merge with any local-only chats that might not have synced yet
        const existingIds = new Set(chats.map((c) => c.id));
        localChats.forEach((lc) => {
          if (!existingIds.has(lc.id)) {
            chats.push(lc);
          }
        });

        // Sort descending by most recent message timestamp
        chats.sort((a, b) => getChatSortTime(b) - getChatSortTime(a));

        // Cache
        try {
          localStorage.setItem(LOCAL_STORAGE_ALL_CHATS, JSON.stringify(chats));
        } catch {}

        onUpdate(chats);
      },
      (error) => {
        console.warn('Chats snapshot error, using cached:', error);
        onUpdate(getAllLocalChats());
      }
    );

    return unsubscribe;
  } catch (e) {
    console.warn('Could not setup all chats subscription:', e);
    return () => {};
  }
}

// Mark messages as read
export async function markChatAsRead(chatId: string, by: 'customer' | 'admin'): Promise<void> {
  try {
    const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
    if (by === 'admin') {
      await setDoc(chatDocRef, { unreadByAdmin: 0 }, { merge: true });
    } else {
      await setDoc(chatDocRef, { unreadByCustomer: 0 }, { merge: true });
    }
  } catch (e) {
    // Ignore offline error
  }

  updateLocalChatMeta(chatId, by === 'admin' ? { unreadByAdmin: 0 } : { unreadByCustomer: 0 });
}

// Delete chat (Admin action)
export async function deleteChat(chatId: string): Promise<void> {
  try {
    const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
    await deleteDoc(chatDocRef);
  } catch (e) {
    console.warn('Could not delete chat from Firestore:', e);
  }

  try {
    localStorage.removeItem(`${LOCAL_STORAGE_CHATS_PREFIX}messages_${chatId}`);
    localStorage.removeItem(`${LOCAL_STORAGE_CHATS_PREFIX}info_${chatId}`);
    const all = getAllLocalChats().filter((c) => c.id !== chatId);
    localStorage.setItem(LOCAL_STORAGE_ALL_CHATS, JSON.stringify(all));
  } catch {}
}

// Local Storage Helpers
function getLocalMessages(chatId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_CHATS_PREFIX}messages_${chatId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveMessageToLocal(chatId: string, message: ChatMessage) {
  try {
    const msgs = getLocalMessages(chatId);
    if (!msgs.some((m) => m.id === message.id)) {
      msgs.push(message);
      localStorage.setItem(`${LOCAL_STORAGE_CHATS_PREFIX}messages_${chatId}`, JSON.stringify(msgs));
    }
  } catch {}
}

function getAllLocalChats(): ChatConversation[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ALL_CHATS);
    if (raw) {
      const parsed: ChatConversation[] = JSON.parse(raw);
      parsed.sort((a, b) => getChatSortTime(b) - getChatSortTime(a));
      return parsed;
    }
  } catch {}
  return [];
}

function saveChatToLocal(chat: ChatConversation) {
  try {
    let all = getAllLocalChats();
    const idx = all.findIndex((c) => c.id === chat.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...chat };
    } else {
      all.unshift(chat);
    }
    all.sort((a, b) => getChatSortTime(b) - getChatSortTime(a));
    localStorage.setItem(LOCAL_STORAGE_ALL_CHATS, JSON.stringify(all));
    localStorage.setItem(`${LOCAL_STORAGE_CHATS_PREFIX}info_${chat.id}`, JSON.stringify(chat));
  } catch {}
}

function updateLocalChatMeta(chatId: string, partial: Partial<ChatConversation>) {
  try {
    let all = getAllLocalChats();
    const idx = all.findIndex((c) => c.id === chatId);
    if (idx >= 0) {
      const updated = { ...all[idx], ...partial };
      all.splice(idx, 1);
      all.unshift(updated);
    } else {
      all.unshift({
        id: chatId,
        customerName: partial.customerName || 'Contato WhatsApp',
        customerContact: partial.customerContact || chatId.replace('chat_', ''),
        lastMessage: partial.lastMessage || '',
        lastMessageAt: partial.lastMessageAt || new Date().toISOString(),
        unreadByAdmin: partial.unreadByAdmin || 0,
        unreadByCustomer: partial.unreadByCustomer || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...partial,
      } as ChatConversation);
    }
    all.sort((a, b) => getChatSortTime(b) - getChatSortTime(a));
    localStorage.setItem(LOCAL_STORAGE_ALL_CHATS, JSON.stringify(all));
  } catch {}
}
