import React, { useState } from 'react';
import { MessageCircle, ArrowUpRight, X, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FloatingWhatsAppButtonProps {
  channelUrl?: string;
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({
  channelUrl = 'https://whatsapp.com/channel/0029Vb8pU6X6buMQBQJOX13N',
}) => {
  const { language } = useStore();
  const [isClosed, setIsClosed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('metaslim_hide_whatsapp_sales_btn') === 'true';
    } catch {
      return false;
    }
  });

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsClosed(true);
    try {
      sessionStorage.setItem('metaslim_hide_whatsapp_sales_btn', 'true');
    } catch {
      // ignore
    }
  };

  if (isClosed) {
    return null;
  }

  const copy = {
    pt: {
      badge: 'WhatsApp Oficial',
      online: 'Online Agora',
      cta: 'Fale com um vendedor agora',
      sub: 'Canal VIP • Dúvidas e Pedidos',
      closeLabel: 'Fechar botão do vendedor',
    },
    es: {
      badge: 'WhatsApp Oficial',
      online: 'En Línea Ahora',
      cta: 'Habla con un vendedor ahora',
      sub: 'Canal VIP • Dudas y Pedidos',
      closeLabel: 'Cerrar botón de vendedor',
    },
    en: {
      badge: 'Official WhatsApp',
      online: 'Online Now',
      cta: 'Talk to a salesperson now',
      sub: 'VIP Channel • Orders & Support',
      closeLabel: 'Close salesperson button',
    },
  }[language];

  return (
    <div
      aria-label={copy.cta}
      className="pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="relative group">
        {/* Glow ambient background aura */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#25D366] via-emerald-400 to-[#128C7E] rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse pointer-events-none" />

        {/* Card Container */}
        <div className="relative flex items-center bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#1aa34a] text-white rounded-2xl p-2 sm:p-2.5 shadow-[0_10px_35px_rgba(7,94,84,0.45)] border border-[#25D366]/60 hover:border-white/80 transition-all duration-200 hover:-translate-y-1">
          {/* Main Clickable Area Redirecting to WhatsApp Channel */}
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="btn-flutuante-whatsapp-vendedor"
            className="flex items-center gap-3 pr-2 text-left cursor-pointer group/link"
            title={copy.cta}
          >
            {/* WhatsApp Icon with pulsing indicator */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#25D366] border border-white/40 flex items-center justify-center shrink-0 shadow-inner group-hover/link:scale-105 transition-transform">
              <MessageCircle className="w-6 h-6 text-white fill-white/20" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#25D366] border-2 border-white"></span>
              </span>
            </div>

            {/* Typography & Badges */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-950 bg-[#25D366] px-2 py-0.5 rounded-full shadow-2xs">
                  {copy.badge}
                </span>
                <span className="text-[10px] text-emerald-100 font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
                  {copy.online}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight leading-snug group-hover/link:text-yellow-200 transition-colors">
                  {copy.cta}
                </span>
                <ArrowUpRight className="w-4 h-4 text-white group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform shrink-0" />
              </div>

              <span className="text-[10px] sm:text-[11px] text-emerald-50/90 font-medium leading-tight">
                {copy.sub}
              </span>
            </div>
          </a>

          {/* Explicit Visible Close "X" Button */}
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-black/25 hover:bg-red-600/90 text-white/80 hover:text-white flex items-center justify-center transition-all duration-150 ml-1.5 border border-white/10 hover:border-red-400/50 cursor-pointer shrink-0"
            title={copy.closeLabel}
            aria-label={copy.closeLabel}
            id="btn-fechar-whatsapp-vendedor"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
