import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import {
  subscribeToAllConversations,
  subscribeToChatMessages,
  sendChatMessage,
  markChatAsRead,
  deleteChat,
  generateChatId,
  playIncomingWhatsAppChime,
  getChatSortTime,
} from '../services/chatService';
import { ChatConversation, ChatMessage } from '../types';
import {
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  Clock,
  Phone,
  Mail,
  User,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Plus,
  Dna,
  Package,
  CreditCard,
  Building2,
  Smile,
  Volume2,
  VolumeX,
  Bell,
  MoreVertical,
  MessageSquarePlus,
  ChevronDown,
  Pin,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { PWAInstallPrompt } from './PWAInstallPrompt';

export const WhatsAppAdminDashboard: React.FC = () => {
  const { showToast, setActiveTab, settings } = useStore();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');
  const [isSending, setIsSending] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAdminLink, setCopiedAdminLink] = useState(false);

  const handleCopyAdminLink = () => {
    const link = `${window.location.origin}/?admin_whatsapp=1`;
    navigator.clipboard.writeText(link);
    setCopiedAdminLink(true);
    showToast('Link do WhatsApp do Administrador copiado! Use para abrir ou instalar no seu celular.');
    setTimeout(() => setCopiedAdminLink(false), 3000);
  };

  const handleCopyClientLink = () => {
    const link = `${window.location.origin}/?chat=1`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showToast('Link de Atendimento para Clientes copiado com sucesso!');
    setTimeout(() => setCopiedLink(false), 3000);
  };
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientContact, setNewClientContact] = useState('');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  // Sound alert settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('metaslim_whatsapp_sound') !== 'false';
    } catch {
      return true;
    }
  });

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem('metaslim_whatsapp_sound', String(next));
    } catch {}
    if (next) {
      playIncomingWhatsAppChime();
      showToast('Som de alerta do WhatsApp ativado!');
    } else {
      showToast('Som de alerta desativado.');
    }
  };

  const handleTestSound = () => {
    playIncomingWhatsAppChime();
    showToast('Reproduzindo toque de mensagem do WhatsApp...');
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // 1. Subscribe to all client conversations
  useEffect(() => {
    const unsubscribe = subscribeToAllConversations((updated) => {
      setConversations(updated);
      setSelectedChatId((curr) => {
        if (curr && updated.some((c) => c.id === curr)) return curr;
        return updated.length > 0 ? updated[0].id : null;
      });
    });

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to messages of active conversation
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    markChatAsRead(selectedChatId, 'admin');

    const unsubscribe = subscribeToChatMessages(selectedChatId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => scrollToBottom(false), 50);
    });

    return () => unsubscribe();
  }, [selectedChatId]);

  const activeConversation = conversations.find((c) => c.id === selectedChatId) || null;

  // Filter and strictly sort conversations by latest message timestamp descending
  const filteredConversations = conversations
    .filter((c) => {
      const matchesSearch =
        !searchTerm ||
        c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterType === 'all' || (filterType === 'unread' && (c.unreadByAdmin || 0) > 0);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => getChatSortTime(b) - getChatSortTime(a));

  const totalUnreadCount = conversations.reduce((acc, c) => acc + (c.unreadByAdmin || 0), 0);

  // Send admin response to the active client
  const handleSendReply = async (textToSend?: string) => {
    const text = (textToSend || replyText).trim();
    if (!text || !selectedChatId) return;

    setIsSending(true);
    setReplyText('');

    try {
      await sendChatMessage(selectedChatId, 'admin', 'Dra. Valéria Prado', text);
      markChatAsRead(selectedChatId, 'admin');

      // Update conversations locally and bring replied chat to top
      setConversations((prev) => {
        const now = new Date().toISOString();
        const updated = prev.map((c) =>
          c.id === selectedChatId
            ? { ...c, unreadByAdmin: 0, lastMessage: text, lastMessageAt: now }
            : c
        );
        return updated.sort((a, b) => getChatSortTime(b) - getChatSortTime(a));
      });

      setTimeout(() => scrollToBottom(true), 50);
    } catch (e) {
      console.error('Erro ao enviar resposta do admin:', e);
      showToast('Erro ao enviar resposta.');
    } finally {
      setIsSending(false);
    }
  };

  // Quick Clinical Macros
  const clinicalMacros = [
    {
      title: 'Boas-vindas',
      text: `Olá ${activeConversation?.customerName || ''}! Sou a Dra. Valéria Prado. Recebi sua mensagem e estou à sua disposição. Qual seu objetivo principal de emagrecimento para este mês?`,
    },
    {
      title: 'Reconstituição BAC',
      text: 'Para a reconstituição do peptídeo liofilizado, utilize 2ml de Água Bacteriostática estéril (BAC water). Injete lentamente pelas paredes do frasco e nunca agite bruscamente. Mantenha em refrigeração de 2°C a 8°C.',
    },
    {
      title: 'Envio Isotérmico',
      text: 'Seu pedido é enviado em embalagem isotérmica selada com controle térmico. O prazo médio de entrega para Portugal e Espanha é de 24 a 48 horas úteis, com código de rastreamento enviado por aqui.',
    },
    {
      title: 'MB WAY / PIX',
      text: 'Você pode concluir seu pedido via MB WAY ou PIX para liberação prioritária do lote. Por favor envie o comprovante por aqui assim que concluir.',
    },
  ];

  const handleDeleteConversation = async (chatId: string, name: string) => {
    if (window.confirm(`Deseja realmente apagar todo o histórico de conversa com ${name}?`)) {
      await deleteChat(chatId);
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
      showToast('Conversa removida.');
    }
  };

  const handleCreateNewManualChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientContact.trim()) return;

    try {
      const { getOrCreateChat } = await import('../services/chatService');
      const conv = await getOrCreateChat(newClientName, newClientContact);
      setSelectedChatId(conv.id);
      setShowNewChatModal(false);
      setNewClientName('');
      setNewClientContact('');
      showToast(`Conversa iniciada para ${conv.customerName}!`);
    } catch (e) {
      showToast('Erro ao criar conversa.');
    }
  };

  const formatChatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full w-full font-sans overflow-hidden bg-white select-none">
      {/* 1. SLIM TOP UTILITY & ACTION BAR (ONLY 46px, NO OVERSIZED CARDS) */}
      <header className="bg-[#008069] text-white px-3 sm:px-4 py-2 flex items-center justify-between shadow-xs shrink-0 z-20">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-full bg-white/20 p-0.5 border border-white/40 overflow-hidden flex items-center justify-center shrink-0">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
              alt="Dra. Valéria"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-sm leading-tight text-white truncate">
              WhatsApp VIP • Dra. Valéria Prado
            </span>
            <span className="hidden md:inline-block text-[10px] bg-emerald-950/40 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-mono uppercase">
              Admin
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* PWA Install Button for Admin Phone */}
          <PWAInstallPrompt title="Baixar App" variant="pill" />

          {/* Copy Admin Link */}
          <button
            onClick={handleCopyAdminLink}
            className="px-2.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Copiar link direto para abrir ou instalar o WhatsApp do Administrador"
          >
            {copiedAdminLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedAdminLink ? 'Copiado!' : 'Link Admin'}</span>
          </button>

          {/* Copy Client Link */}
          <button
            onClick={handleCopyClientLink}
            className="px-2.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Copiar o link direto para enviar para clientes"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Users className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copiado!' : 'Link Clientes'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Silenciar alertas' : 'Ativar som de mensagens'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-red-300" />}
          </button>

          {/* Return to Store */}
          <button
            onClick={() => setActiveTab('inicio')}
            className="px-3 py-1.5 rounded-full bg-white text-[#008069] hover:bg-emerald-50 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
            title="Voltar para a loja de peptídeos"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Loja</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WHATSAPP WEB TWO-COLUMN BATE-PAPO (100% OF VIEWPORT) */}
      <div className="flex-1 w-full flex flex-col md:flex-row overflow-hidden bg-white relative">
        {/* LEFT COLUMN: CLIENT LIST (WHATSAPP AUTHENTIC STRUCTURE) */}
        <div
          className={`w-full md:w-84 lg:w-96 border-r border-slate-200 flex flex-col shrink-0 bg-white ${
            mobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Authentic WhatsApp Top Header */}
          <div className="px-4 py-3 bg-white flex items-center justify-between border-b border-slate-100">
            <h1 className="text-xl font-black text-slate-900 tracking-tight font-sans">
              WhatsApp
            </h1>

            <div className="flex items-center gap-1 text-slate-600">
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-700"
                title="Criar nova conversa"
              >
                <MessageSquarePlus className="w-5 h-5" />
              </button>

              <button
                onClick={handleCopyClientLink}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-700"
                title="Mais opções e links"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Authentic Search Bar */}
          <div className="px-3 py-2 bg-white">
            <div className="relative flex items-center bg-[#f0f2f5] rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Procurar ou criar uma nova conversa"
                className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Filter Pills Row (Tudo, Não lidas, Favoritos, Grupos) */}
          <div className="px-3 pb-2.5 pt-0.5 bg-white flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-slate-100">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#e7fce3] text-[#008069] border border-[#25d366]/40'
                  : 'bg-[#f0f2f5] text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Tudo
            </button>

            <button
              onClick={() => setFilterType('unread')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterType === 'unread'
                  ? 'bg-[#e7fce3] text-[#008069] border border-[#25d366]/40'
                  : 'bg-[#f0f2f5] text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>Não lidas</span>
              {totalUnreadCount > 0 && (
                <span className="min-w-4 h-4 px-1 rounded-full bg-[#25d366] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalUnreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => showToast('Filtro de Favoritos')}
              className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-[#f0f2f5] text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              Favoritos
            </button>

            <button
              onClick={() => showToast('Grupos clínicos')}
              className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-[#f0f2f5] text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Grupos</span>
            </button>

            <span className="text-slate-400 p-1">
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">Nenhuma conversa encontrada</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  Compartilhe o link de atendimento com seus clientes para que eles iniciem as conversas.
                </p>
                <button
                  onClick={handleCopyClientLink}
                  className="mt-3 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Copiar Link de Atendimento
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedChatId;
                const hasUnread = (conv.unreadByAdmin || 0) > 0;
                const initials = conv.customerName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedChatId(conv.id);
                      setMobileChatOpen(true);
                      markChatAsRead(conv.id, 'admin');
                      setConversations((prev) =>
                        prev.map((c) => (c.id === conv.id ? { ...c, unreadByAdmin: 0 } : c))
                      );
                    }}
                    className={`px-3 py-3 flex items-center gap-3 cursor-pointer transition-colors relative border-b border-slate-50 ${
                      isSelected
                        ? 'bg-[#f0f2f5]'
                        : 'hover:bg-[#f5f6f6] bg-white'
                    }`}
                  >
                    {/* Customer Round Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00a884] to-[#25d366] text-white font-bold text-sm flex items-center justify-center shadow-xs overflow-hidden">
                        {initials || <User className="w-5 h-5" />}
                      </div>
                    </div>

                    {/* Chat Center Info */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className={`text-sm truncate ${
                              hasUnread ? 'font-black text-slate-900' : 'font-semibold text-slate-800'
                            }`}
                          >
                            {conv.customerName}
                          </span>
                          {/* Green indicator dot when message is received */}
                          {hasUnread && (
                            <span
                              className="w-2.5 h-2.5 rounded-full bg-[#25d366] shrink-0"
                              title="Nova mensagem recebida"
                            />
                          )}
                        </div>

                        {/* Timestamp: Green if unread, gray if read */}
                        <span
                          className={`text-xs shrink-0 font-sans ml-1.5 ${
                            hasUnread ? 'text-[#25d366] font-bold' : 'text-slate-400'
                          }`}
                        >
                          {formatChatTime(conv.lastMessageAt)}
                        </span>
                      </div>

                      {/* Snippet preview */}
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs truncate ${
                            hasUnread ? 'font-bold text-slate-900' : 'text-slate-500'
                          }`}
                        >
                          {conv.lastMessage || 'Conversa iniciada'}
                        </p>

                        {/* WhatsApp Green Circle Unread Badge: Disappears on click or reply */}
                        {hasUnread && (
                          <span
                            className="min-w-5 h-5 px-1.5 rounded-full bg-[#25d366] text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs"
                            title={`${conv.unreadByAdmin} mensagens não lidas`}
                          >
                            {conv.unreadByAdmin}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete button (subtle) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id, conv.customerName);
                      }}
                      className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100"
                      title="Excluir conversa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CONVERSATION MESSAGES & REPLY */}
        <div
          className={`flex-1 flex flex-col bg-[#efeae2] relative ${
            !mobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Active Conversation Top Bar */}
              <div className="p-3 bg-[#f0f2f5] border-b border-slate-200/80 flex items-center justify-between shadow-2xs shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setMobileChatOpen(false)}
                    className="md:hidden p-1.5 -ml-1 text-slate-700 hover:bg-slate-200/80 rounded-full transition-colors cursor-pointer"
                    title="Voltar à lista de conversas"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {activeConversation.customerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">
                        {activeConversation.customerName}
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full font-bold">
                        Cliente Individual
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{activeConversation.customerContact}</span>
                      {!activeConversation.customerContact.includes('@') && (
                        <a
                          href={`https://wa.me/${activeConversation.customerContact.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-semibold"
                          title="Abrir no aplicativo WhatsApp oficial"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>WhatsApp Web</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteConversation(activeConversation.id, activeConversation.customerName)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200/60 transition-colors"
                    title="Excluir esta conversa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div
                className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5"
                style={{
                  backgroundColor: '#efeae2',
                  backgroundImage:
                    'radial-gradient(#d3cbbd 0.75px, transparent 0.75px), radial-gradient(#d3cbbd 0.75px, #efeae2 0.75px)',
                  backgroundSize: '30px 30px',
                  backgroundPosition: '0 0, 15px 15px',
                }}
              >
                {/* Security info banner */}
                <div className="mx-auto my-1 max-w-sm bg-[#ffeecd] text-[#54656f] text-[11px] rounded-xl px-3 py-1.5 text-center shadow-xs border border-amber-200/60 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Você está respondendo como <strong>Dra. Valéria Prado</strong> neste chat exclusivo.</span>
                </div>

                {messages.map((msg) => {
                  const isAdmin = msg.sender === 'admin';
                  const time = new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} animate-in fade-in duration-100`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-xs relative leading-relaxed ${
                          isAdmin
                            ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-xs border border-emerald-200/50'
                            : 'bg-white text-[#111b21] rounded-tl-xs border border-slate-200/70'
                        }`}
                      >
                        <div className="text-[10px] font-bold mb-0.5 text-slate-500">
                          {isAdmin ? 'Você (Dra. Valéria Prado)' : msg.senderName || activeConversation.customerName}
                        </div>

                        <div className="whitespace-pre-wrap break-words">{msg.text}</div>

                        <div className="flex items-center justify-end gap-1 mt-1 select-none">
                          <span className="text-[10px] text-slate-500">{time}</span>
                          {isAdmin && (
                            <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Macro Suggestions Bar */}
              <div className="bg-[#f0f2f5] border-t border-slate-200/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Macros Médicas Rápidas:
                </span>
                {clinicalMacros.map((macro, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendReply(macro.text)}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 hover:border-emerald-400 border border-slate-200 text-slate-700 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
                    title={macro.text}
                  >
                    {macro.title}
                  </button>
                ))}
              </div>

              {/* Admin Input Bar */}
              <footer className="bg-[#f0f2f5] px-3 sm:px-4 py-2.5 border-t border-slate-200/80 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendReply();
                  }}
                  className="flex items-center gap-2 w-full"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      activeConversation
                        ? `Responder para ${activeConversation.customerName}...`
                        : 'Digite sua mensagem de resposta...'
                    }
                    className="flex-1 bg-white border border-transparent focus:border-emerald-500 text-slate-800 text-sm px-4 py-2.5 rounded-2xl focus:outline-none shadow-xs"
                  />

                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008069] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md disabled:opacity-40 cursor-pointer shrink-0"
                    title="Enviar resposta"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-slate-200/80 flex items-center justify-center text-slate-400 mb-3">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-slate-700">Selecione uma conversa</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Escolha um cliente na coluna à esquerda para ver o histórico e responder individualmente.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. MODAL FOR NEW MANUAL CLIENT ENTRY */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Iniciar Atendimento com Novo Cliente
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Cadastre o nome e WhatsApp ou E-mail do cliente para abrir uma linha direta de atendimento.
            </p>

            <form onSubmit={handleCreateNewManualChat} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp ou E-mail
                </label>
                <input
                  type="text"
                  required
                  value={newClientContact}
                  onChange={(e) => setNewClientContact(e.target.value)}
                  placeholder="Ex: +55 11 99999-8888 ou cliente@email.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                >
                  Criar Conversa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
