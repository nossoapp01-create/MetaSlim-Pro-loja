import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { banners, setActiveTab, setSelectedProductId } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = banners.length || 5;

  useEffect(() => {
    if (isPaused || total === 0) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % total);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, total]);

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + total) % total);
  };

  const handleCtaClick = (slide: typeof banners[0]) => {
    if (slide.id === 6 || slide.ctaLink === '#revenda' || slide.title.toLowerCase().includes('revend')) {
      setActiveTab('revenda');
    } else if (slide.id === 1) {
      setSelectedProductId('retatrutide-10mg');
      setActiveTab('produto-detalhe');
    } else if (slide.id === 4) {
      setSelectedProductId('tirzepatide-15mg');
      setActiveTab('produto-detalhe');
    } else if (slide.id === 5) {
      setActiveTab('resultados');
    } else {
      setActiveTab('produtos');
    }
  };

  if (!banners.length) return null;

  const current = banners[currentSlide] || banners[0];

  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl bg-white shadow-sm border border-emerald-950/5 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      id="rotating-hero-banner"
    >
      {/* Banner Inner Content with Background Presentation */}
      <div className="relative min-h-[220px] sm:min-h-[280px] md:min-h-[310px] w-full flex flex-col justify-between overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover object-center filter brightness-[0.92] transition-all duration-700 ease-out transform scale-100 group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#131b2e]/95 via-[#131b2e]/75 to-transparent sm:w-3/4" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e]/85 via-transparent to-black/20" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 p-5 sm:p-7 md:p-8 flex flex-col justify-between h-full max-w-xl text-white">
          {/* Top Tag & Slide Counter */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#006750]/90 backdrop-blur-md text-[#93f5d4] text-[11px] font-bold font-mono tracking-wider uppercase border border-emerald-400/20 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#71face] animate-ping" />
              {current.tag}
            </span>
            <span className="text-[12px] font-mono font-semibold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white/90">
              {currentSlide + 1} / {total}
            </span>
          </div>

          {/* Heading & Subtitle */}
          <div className="my-auto py-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
              {current.title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-200/90 leading-relaxed line-clamp-2 max-w-lg">
              {current.subtitle}
            </p>
          </div>

          {/* Bottom CTA Row & Badge */}
          <div className="flex items-center justify-between gap-3 pt-3 mt-1">
            <button
              onClick={() => handleCtaClick(current)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#006750] to-[#0d8267] hover:from-[#0d8267] hover:to-[#006750] text-[#93f5d4] hover:text-white font-bold text-sm shadow-lg shadow-emerald-950/40 active:scale-95 transition-all group/btn"
              id={`banner-cta-${currentSlide}`}
            >
              <span>{current.ctaText || 'Ver Protocolo'}</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>

            <div className="hidden xs:flex items-center gap-1.5 text-xs text-emerald-200/90 font-mono">
              <ShieldCheck className="w-4 h-4 text-[#71face]" />
              <span>{current.badgeText}</span>
            </div>
          </div>
        </div>

        {/* Prev / Next Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Próximo slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-5 bg-[#71face]'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Ir para slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
