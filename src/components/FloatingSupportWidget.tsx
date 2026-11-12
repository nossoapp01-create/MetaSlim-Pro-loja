import React, { useState } from 'react';
import { MessageCircle, Stethoscope, ArrowUpRight, X, Headset } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FloatingSupportWidgetProps {
  channelUrl?: string;
  consultationUrl?: string;
}

export const FloatingSupportWidget: React.FC<FloatingSupportWidgetProps> = ({
  channelUrl = 'https://whatsapp.com/channel/0029Vb8pU6X6buMQBQJOX13N',
  consultationUrl = 'https://consulta.metaslim-pro.shop/',
}) => {
  const { language } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const copy = {
    pt: {
      launcher: 'Atendimento',
      title: 'Canais Oficiais MetaSlim Pro',
      subtitle: 'Escolha como deseja ser atendido agora',
      waTitle: 'Fale com um vendedor agora',
      waSub: 'Canal oficial WhatsApp • Pedidos e dúvidas',
      consultTitle: 'Faça sua consulta grátis',
      consultSub: 'Dra. Valéria Prado • Endocrinologia',
      close: 'Fechar menu de atendimento',
    },
    es: {
      launcher: 'Soporte',
      title: 'Canales Oficiales MetaSlim Pro',
      subtitle: 'Elige cómo deseas ser atendido ahora',
      waTitle: 'Habla con un vendedor ahora',
      waSub: 'Canal oficial WhatsApp • Pedidos y dudas',
      consultTitle: 'Haz tu consulta gratis',
      consultSub: 'Dra. Valéria Prado • Endocrinología',
      close: 'Cerrar menú de soporte',
    },
    en: {
      launcher: 'Support',
      title: 'MetaSlim Pro Official Channels',
      subtitle: 'Choose how you would like assistance',
      waTitle: 'Talk to a salesperson now',
      waSub: 'Official WhatsApp channel • Orders & help',
      consultTitle: 'Start your free consultation',
      consultSub: 'Dr. Valéria Prado • Endocrinology',
      close: 'Close support menu',
    },
  }[language];

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-[58] flex flex-col items-end gap-2 pointer-events-none">
      {isOpen && (
        <div
          className="pointer-events-auto w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200"
          role="dialog"
          aria-label={copy.title}
        >
          <div className="flex items-start justify-between gap-2 px-1 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-extrabold text-[#131b2e]">{copy.title}</h3>
              <p className="text-[11px] text-slate-500">{copy.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              aria-label={copy.close}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="btn-flutuante-whatsapp-vendedor"
            className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#006750] text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-[#131b2e] group-hover:text-[#006750] truncate">
                  {copy.waTitle}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#006750] shrink-0" />
              </div>
              <span className="text-[11px] text-slate-600 block truncate">{copy.waSub}</span>
            </div>
          </a>

          <a
            href={consultationUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="btn-flutuante-consulta-gratis"
            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#131b2e] text-[#71face] flex items-center justify-center shrink-0">
              <Stethoscope className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-[#131b2e] group-hover:text-[#006750] truncate">
                  {copy.consultTitle}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#006750] shrink-0" />
              </div>
              <span className="text-[11px] text-slate-600 block truncate">{copy.consultSub}</span>
            </div>
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        id="floating-support-launcher"
        className="pointer-events-auto h-10 sm:h-11 px-3.5 sm:px-4 rounded-full bg-[#006750] hover:bg-[#005240] text-white font-bold text-xs shadow-lg shadow-emerald-950/25 border border-emerald-400/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
      >
        {isOpen ? (
          <X className="w-4 h-4 text-[#93f5d4]" />
        ) : (
          <Headset className="w-4 h-4 text-[#93f5d4]" />
        )}
        <span>{copy.launcher}</span>
      </button>
    </div>
  );
};
