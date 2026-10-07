import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import {
  subscribeToAllConversations,
  playIncomingWhatsAppChime,
  flashPageTitle,
  showSystemNotification,
  requestNotificationPermission,
} from '../services/chatService';
import { ChatConversation } from '../types';
import { MessageSquare, Bell, ArrowRight, X, Volume2, ShieldCheck } from 'lucide-react';

export const GlobalChatNotifier: React.FC = () => {
  const { isAdminUser, isSuperAdmin, setActiveTab } = useStore();
  const [activeAlert, setActiveAlert] = useState<{
    conversation: ChatConversation;
    snippet: string;
  } | null>(null);

  const prevLastMessagesRef = useRef<{ [chatId: string]: string }>({});
  const isInitialLoadRef = useRef(true);

  // Auto-request notification permission on admin interaction
  useEffect(() => {
    if (isAdminUser || isSuperAdmin) {
      requestNotificationPermission().catch(() => {});
    }
  }, [isAdminUser, isSuperAdmin]);

  useEffect(() => {
    const unsubscribe = subscribeToAllConversations((conversations) => {
      // On initial load, record all existing messages without firing sound
      if (isInitialLoadRef.current) {
        conversations.forEach((c) => {
          prevLastMessagesRef.current[c.id] = c.lastMessage || '';
        });
        isInitialLoadRef.current = false;
        return;
      }

      // Check for incoming customer messages
      for (const conv of conversations) {
        const prevMsg = prevLastMessagesRef.current[conv.id];
        const currentMsg = conv.lastMessage;

        // If message changed and has unread for admin
        if (currentMsg && prevMsg !== currentMsg && (conv.unreadByAdmin || 0) > 0) {
          prevLastMessagesRef.current[conv.id] = currentMsg;

          // 1. Play authentic WhatsApp Chime Sound
          playIncomingWhatsAppChime();

          // 2. Trigger browser title flash
          flashPageTitle(
            `🔔 (1) Mensagem de ${conv.customerName}!`,
            'MetaSlim-Pro-loja'
          );

          // 3. Trigger Desktop Notification
          showSystemNotification(
            `💬 Nova mensagem de ${conv.customerName}`,
            currentMsg.slice(0, 100),
            () => {
              setActiveTab('admin');
            }
          );

          // 4. Show In-App Visual Alert Banner
          setActiveAlert({
            conversation: conv,
            snippet: currentMsg,
          });

          // Auto-dismiss alert after 10 seconds
          setTimeout(() => {
            setActiveAlert((curr) => (curr?.conversation.id === conv.id ? null : curr));
          }, 10000);

          break;
        } else {
          prevLastMessagesRef.current[conv.id] = currentMsg || '';
        }
      }
    });

    return () => unsubscribe();
  }, [setActiveTab]);

  if (!activeAlert) return null;

  return (
    <aside
      aria-label="Alerta de Nova Mensagem de Atendimento"
      className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-[999] animate-in slide-in-from-top-4 duration-300 select-none"
    >
      <div className="bg-[#111b21] text-white p-4 rounded-2xl shadow-2xl border-2 border-[#00a884] flex flex-col gap-2.5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-md animate-bounce">
              <MessageSquare className="w-4 h-4" />
            </span>
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-[#25d366] bg-[#00a884]/20 px-2 py-0.5 rounded-full">
                Chat VIP • Nova Mensagem
              </span>
              <h4 className="text-xs font-bold text-white mt-0.5 truncate max-w-[200px]">
                {activeAlert.conversation.customerName}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => playIncomingWhatsAppChime()}
              className="p-1.5 text-slate-400 hover:text-[#25d366] rounded-lg transition-colors cursor-pointer"
              title="Testar som"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveAlert(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Dispensar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message preview snippet */}
        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 text-xs text-slate-200 line-clamp-2 leading-relaxed">
          &ldquo;{activeAlert.snippet}&rdquo;
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-400 font-mono">
            {activeAlert.conversation.customerContact}
          </span>

          <button
            onClick={() => {
              setActiveAlert(null);
              setActiveTab('admin');
            }}
            className="px-3 py-1.5 rounded-xl bg-[#00a884] hover:bg-[#008069] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Responder no Painel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
