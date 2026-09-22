import React, { useState } from 'react';
import { Stethoscope, Sparkles, ExternalLink, X, ArrowUpRight } from 'lucide-react';

interface FloatingConsultationButtonProps {
  consultationUrl?: string;
}

export const FloatingConsultationButton: React.FC<FloatingConsultationButtonProps> = ({
  consultationUrl = 'https://consulta.metaslim-pro.shop/',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    // Minimized icon pill that allows the user to re-open anytime
    return (
      <aside aria-label="Consulta Médica Online">
        <button
          onClick={() => setIsDismissed(false)}
          className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-40 bg-[#006750] text-white p-3 rounded-full shadow-xl hover:bg-[#005240] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-emerald-300/40 cursor-pointer group flex items-center justify-center"
          title="Abrir Consulta Grátis"
          id="btn-reopen-consulta"
        >
          <span className="relative flex h-2.5 w-2.5 absolute -top-1 -right-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
          </span>
          <Stethoscope className="w-5 h-5 text-[#93f5d4] group-hover:scale-110 transition-transform" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Consulta Médica Online Gratuita"
      className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-40 flex items-center select-none"
    >
      <div className="relative group">
        {/* Glow pulsing ring around the button */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-[#006750] rounded-2xl sm:rounded-full blur-xs opacity-70 group-hover:opacity-100 transition duration-300 group-hover:duration-200 animate-pulse pointer-events-none" />

        {/* Main interactive button card */}
        <div className="relative flex items-center bg-gradient-to-r from-[#004838] via-[#005a46] to-[#006750] text-white rounded-2xl sm:rounded-full p-1.5 sm:pr-4 shadow-[0_8px_30px_rgb(0,0,0,0.25)] border border-emerald-300/30 hover:border-emerald-200/60 transition-all duration-200 hover:-translate-y-0.5">
          {/* Action Link to Consultation App */}
          <a
            href={consultationUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="btn-flutuante-consulta-gratis"
            className="flex items-center gap-2.5 sm:gap-3 py-1 px-2 text-left cursor-pointer group/link"
            title="Faça sua consulta grátis com a Dra. Valéria Prado"
          >
            {/* Medical Icon with animated status indicator */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-950/70 border border-[#71face]/40 flex items-center justify-center shrink-0 shadow-inner group-hover/link:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-[#71face]" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-[#004838]"></span>
              </span>
            </div>

            {/* Text and badges */}
            <div className="flex flex-col pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-400/40 px-1.5 py-0.2 rounded-full">
                  100% Grátis
                </span>
                <span className="text-[10px] text-emerald-200/90 font-medium hidden sm:inline flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  Online Agora
                </span>
              </div>

              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight leading-snug group-hover/link:text-[#93f5d4] transition-colors">
                  Faça sua consulta grátis
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#93f5d4] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform shrink-0" />
              </div>

              <span className="text-[10px] text-slate-200/80 font-normal leading-tight hidden xs:block sm:block">
                Dra. Valéria Prado • Endocrinologia
              </span>
            </div>
          </a>

          {/* Dismiss button to minimize if user prefers */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="p-1 text-emerald-300/60 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-1 cursor-pointer"
            title="Minimizar botão de consulta"
            aria-label="Minimizar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
