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

// Subtle WhatsApp-style audio chime using Web Audio API
export function playChatNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // WhatsApp-like double-tone "ping"
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    // Audio context may require user interaction first
  }
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
    customerEmail: isEmail ? customerContact.trim() : undefined,
    customerPhone: !isEmail ? customerContact.trim() : undefined,
    lastMessage: 'Atendimento individual iniciado com Dra. Valéria Prado.',
    lastMessageAt: now,
    unreadByAdmin: 1,
    unreadByCustomer: 0,
    createdAt: now,
    updatedAt: now,
    tenantId: tenantId || 'metaslim-pro-official',
  };

  // 1. Save locally first
  saveChatToLocal(chatData);

  // 2. Sync to Firestore
  try {
    const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
    const existing = await getDoc(chatDocRef);
    if (!existing.exists()) {
      await setDoc(chatDocRef, chatData);

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
      await setDoc(msgDocRef, welcomeMsg);
      saveMessageToLocal(chatId, welcomeMsg);
    } else {
      const data = existing.data() as ChatConversation;
      // Update contact name if changed
      if (data.customerName !== customerName || data.customerContact !== customerContact) {
        await updateDoc(chatDocRef, {
          customerName: customerName.trim(),
          customerContact: customerContact.trim(),
          updatedAt: now,
        });
      }
      return { ...data, ...chatData, createdAt: data.createdAt || now };
    }
  } catch (err) {
    console.warn('Firestore chat sync offline, running with local storage fallback:', err);
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

        if (msgs.length > 0) {
          // Cache to local storage
          try {
            localStorage.setItem(
              `${LOCAL_STORAGE_CHATS_PREFIX}messages_${chatId}`,
              JSON.stringify(msgs)
            );
          } catch {}
          onUpdate(msgs);
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
    await setDoc(msgDocRef, message);

    const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
    const updates: Record<string, any> = {
      lastMessage: text.trim().slice(0, 150),
      lastMessageAt: now,
      updatedAt: now,
    };

    if (sender === 'customer') {
      updates.unreadByAdmin = increment(1);
    } else {
      updates.unreadByCustomer = increment(1);
    }

    await updateDoc(chatDocRef, updates);
  } catch (err) {
    console.warn('Error saving message to Firestore, kept in local state:', err);
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

        // Sort descending by last message
        chats.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

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
      await updateDoc(chatDocRef, { unreadByAdmin: 0 });
    } else {
      await updateDoc(chatDocRef, { unreadByCustomer: 0 });
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
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveChatToLocal(chat: ChatConversation) {
  try {
    const all = getAllLocalChats();
    const idx = all.findIndex((c) => c.id === chat.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...chat };
    } else {
      all.unshift(chat);
    }
    localStorage.setItem(LOCAL_STORAGE_ALL_CHATS, JSON.stringify(all));
    localStorage.setItem(`${LOCAL_STORAGE_CHATS_PREFIX}info_${chat.id}`, JSON.stringify(chat));
  } catch {}
}

function updateLocalChatMeta(chatId: string, partial: Partial<ChatConversation>) {
  try {
    const all = getAllLocalChats();
    const idx = all.findIndex((c) => c.id === chatId);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...partial };
      localStorage.setItem(LOCAL_STORAGE_ALL_CHATS, JSON.stringify(all));
    }
  } catch {}
}
