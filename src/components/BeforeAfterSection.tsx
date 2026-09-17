import React, { useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Testimonial } from '../types';
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Maximize2,
  X,
  Sparkles,
} from 'lucide-react';

export const BeforeAfterSection: React.FC = () => {
  const { testimonials } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeModalItem, setActiveModalItem] = useState<Testimonial | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -310 : 310;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-6 flex flex-col gap-3" id="avaliacoes">
      {/* Section Header */}
      <div className="flex items-end justify-between px-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[#006750]">
            <Award className="w-4 h-4 text-[#006750]" />
            <span className="font-mono text-xs uppercase font-bold tracking-wider">
              Histórias Reais de Sucesso
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#131b2e] mt-0.5">
            O que dizem os nossos clientes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Resultados clínicos obtidos com acompanhamento dos protocolos MetaSlim Pro.
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-white hover:bg-emerald-50 text-slate-700 flex items-center justify-center border border-slate-200/80 shadow-xs active:scale-95 transition-all"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-white hover:bg-emerald-50 text-slate-700 flex items-center justify-center border border-slate-200/80 shadow-xs active:scale-95 transition-all"
            aria-label="Próximo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Swipe Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth snap-x snap-mandatory"
      >
        {testimonials.map((item) => (
          <div
            key={item.id}
            className="min-w-[290px] max-w-[310px] sm:min-w-[320px] rounded-2xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200/70 hover:border-emerald-500/30 hover:shadow-md transition-all flex flex-col justify-between flex-shrink-0 snap-start"
          >
            {/* Top row: Name & Weight Lost Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-bold text-base text-[#131b2e]">{item.name}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[11px] font-bold border border-emerald-200/60 flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-[#006750]" />
                <span>{item.weightLost}</span>
              </span>
            </div>

            {/* Before / After Split Image Container */}
            <div
              className="relative w-full h-44 rounded-xl overflow-hidden grid grid-cols-2 gap-0.5 bg-slate-100 cursor-pointer group"
              onClick={() => setActiveModalItem(item)}
            >
              {/* Before */}
              <div className="relative w-full h-full overflow-hidden bg-slate-200">
                <img
                  src={item.beforeImage}
                  alt={`Antes - ${item.name}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#131b2e]/80 text-white font-mono text-[9px] uppercase font-bold backdrop-blur-xs">
                  Antes
                </span>
              </div>

              {/* After */}
              <div className="relative w-full h-full overflow-hidden bg-emerald-950/10">
                <img
                  src={item.afterImage}
                  alt={`Depois - ${item.name}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#006750] text-[#93f5d4] font-mono text-[9px] uppercase font-bold shadow-xs">
                  Depois
                </span>
              </div>

              {/* Expand icon on hover */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="p-2 rounded-full bg-white/90 text-slate-800 shadow-md">
                  <Maximize2 className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Protocol tag */}
            <div className="mt-2 text-[10px] text-slate-500 font-mono">
              Protocolo: <span className="font-semibold text-slate-700">{item.protocol}</span> • {item.duration}
            </div>

            {/* Quote */}
            <p className="text-xs text-slate-600 leading-relaxed italic mt-2 line-clamp-3">
              "{item.quote}"
            </p>

            {/* Verification Footer */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#006750]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-[11px]">Membro verificado MetaSlim Pro</span>
              </div>
              <button
                onClick={() => setActiveModalItem(item)}
                className="text-slate-400 hover:text-slate-600 text-[11px]"
              >
                Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full Before/After inspection */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{activeModalItem.name}</h3>
                <span className="text-xs text-emerald-700 font-semibold font-mono">
                  {activeModalItem.weightLost} • {activeModalItem.protocol}
                </span>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Before / After view */}
            <div className="p-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2 h-64 sm:h-72 rounded-xl overflow-hidden">
                <div className="relative w-full h-full">
                  <img
                    src={activeModalItem.beforeImage}
                    alt="Antes"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] uppercase font-bold">
                    Antes
                  </span>
                </div>
                <div className="relative w-full h-full">
                  <img
                    src={activeModalItem.afterImage}
                    alt="Depois"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#006750] text-[#93f5d4] font-mono text-[10px] uppercase font-bold">
                    Depois
                  </span>
                </div>
              </div>

              {/* Story */}
              <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{activeModalItem.quote}"
                </p>
                <div className="mt-2 text-xs text-slate-500 font-mono">
                  Duração do ciclo: <strong className="text-slate-800">{activeModalItem.duration}</strong> com acompanhamento nutricional e biomédico.
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
