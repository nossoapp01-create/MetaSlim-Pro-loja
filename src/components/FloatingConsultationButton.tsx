import React, { useState, useEffect } from 'react';
import { Stethoscope, Sparkles, X, ArrowUpRight } from 'lucide-react';

interface FloatingConsultationButtonProps {
  consultationUrl?: string;
}

export const FloatingConsultationButton: React.FC<FloatingConsultationButtonProps> = ({
  consultationUrl = 'https://consulta.metaslim-pro.shop/',
}) => {
  const [isClosed, setIsClosed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('metaslim_hide_consultation_btn') === 'true';
    } catch {
      return false;
    }
  });

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsClosed(true);
    try {
      sessionStorage.setItem('metaslim_hide_consultation_btn', 'true');
    } catch {
      // ignore
    }
  };

  if (isClosed) {
    return null;
  }

  return (
    <aside
      aria-label="Consulta Médica Online Gratuita"
      className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-[60] select-none animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="relative group">
        {/* Glow ambient background aura */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-[#006750] rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse pointer-events-none" />

        {/* Card Container */}
        <div className="relative flex items-center bg-gradient-to-r from-[#004234] via-[#005240] to-[#006750] text-white rounded-2xl p-2 sm:p-2.5 shadow-[0_10px_35px_rgba(0,40,30,0.45)] border border-emerald-300/40 hover:border-emerald-200 transition-all duration-200 hover:-translate-y-1">
          {/* Main Clickable Area Redirecting to Consultation App */}
          <a
            href={consultationUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="btn-flutuante-consulta-gratis"
            className="flex items-center gap-3 pr-2 text-left cursor-pointer group/link"
            title="Clique para iniciar sua consulta médica gratuita com a Dra. Valéria Prado"
          >
            {/* Medical Icon with pulsing indicator */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-950/80 border border-[#71face]/50 flex items-center justify-center shrink-0 shadow-inner group-hover/link:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6 text-[#71face]" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-[#004234]"></span>
              </span>
            </div>

            {/* Typography & Badges */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-300 bg-amber-950/70 border border-amber-400/50 px-2 py-0.5 rounded-full shadow-2xs">
                  100% Grátis
                </span>
                <span className="text-[10px] text-emerald-200 font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  Online Agora
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight leading-snug group-hover/link:text-[#93f5d4] transition-colors">
                  Faça sua consulta grátis
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#93f5d4] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform shrink-0" />
              </div>

              <span className="text-[10px] sm:text-[11px] text-emerald-100/90 font-medium leading-tight">
                Dra. Valéria Prado • Endocrinologia
              </span>
            </div>
          </a>

          {/* Explicit Visible Close "X" Button */}
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-black/25 hover:bg-red-600/90 text-white/80 hover:text-white flex items-center justify-center transition-all duration-150 ml-1.5 border border-white/10 hover:border-red-400/50 cursor-pointer shrink-0"
            title="Fechar aviso de consulta"
            aria-label="Fechar aviso de consulta"
            id="btn-fechar-consulta-flutuante"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </aside>
  );
};
