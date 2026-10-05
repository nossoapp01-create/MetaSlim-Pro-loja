import React from 'react';
import { useStore } from '../context/StoreContext';
import { LayoutGrid, Flame, Dumbbell, Sparkles, TestTube2, TrendingUp } from 'lucide-react';

export const CategoryFilter: React.FC = () => {
  const { selectedCategory, setSelectedCategory, products, activeTab, setActiveTab } = useStore();

  const categories = [
    { id: 'todos', label: 'Todos', icon: LayoutGrid, count: products.length },
    {
      id: 'glp1',
      label: 'GLP-1',
      fullLabel: 'Emagrecimento & GLP-1',
      icon: Flame,
      count: products.filter((p) => p.category === 'glp1').length,
    },
    {
      id: 'muscular',
      label: 'Músculos',
      fullLabel: 'Peptídeos Musculares',
      icon: Dumbbell,
      count: products.filter((p) => p.category === 'muscular').length,
    },
    {
      id: 'longevidade',
      label: 'Longevidade',
      fullLabel: 'Longevidade & Saúde',
      icon: Sparkles,
      count: products.filter((p) => p.category === 'longevidade').length,
    },
    {
      id: 'kits',
      label: 'Kits & BAC',
      fullLabel: 'Packs & Solventes BAC',
      icon: TestTube2,
      count: products.filter((p) => p.category === 'kits').length,
    },
  ];

  return (
    <section className="w-full py-1" id="categories-section">
      {/* Fluid Horizontal Scroll on Mobile, Neat Wrap on Tablet/Desktop */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto overscroll-x-contain touch-pan-x py-1 px-0.5 sm:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id && activeTab === 'produtos';

          return (
            <button
              key={cat.id}
              onClick={() => {
                if (activeTab !== 'produtos') {
                  setActiveTab('produtos');
                }
                setSelectedCategory(cat.id);
              }}
              className={`group relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer shrink-0 whitespace-nowrap shadow-2xs ${
                isActive
                  ? 'bg-gradient-to-r from-[#006750] to-[#0d8267] text-white shadow-sm ring-1.5 ring-emerald-500/30'
                  : 'bg-white text-slate-700 hover:text-[#006750] hover:bg-emerald-50/80 border border-slate-200/80'
              }`}
              id={`cat-pill-${cat.id}`}
              title={cat.fullLabel}
            >
              <Icon
                className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                  isActive ? 'text-[#93f5d4]' : 'text-slate-400 group-hover:text-[#006750]'
                }`}
              />
              <span>{cat.label}</span>
              {cat.count > 0 && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold transition-colors shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-[#e8fff4]'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Resale Category Pill with Compact Pulsing Effect */}
        <button
          onClick={() => {
            setActiveTab('revenda');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`group relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer shrink-0 whitespace-nowrap shadow-2xs ${
            activeTab === 'revenda'
              ? 'bg-[#006750] text-white shadow-sm ring-1.5 ring-emerald-400'
              : 'bg-emerald-50/90 text-[#006750] hover:bg-emerald-100 border border-emerald-300/80'
          }`}
          id="cat-pill-revenda"
          title="Programa Oficial de Revenda & Atacado (Lucros > 300%)"
        >
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#006750]"></span>
          </span>
          <TrendingUp className="w-3.5 h-3.5 text-[#006750] shrink-0" />
          <span>Revenda</span>
          <span className="text-[9px] font-mono px-1 py-0.2 rounded-full font-black bg-amber-400 text-slate-950 shrink-0 shadow-xs">
            +300%
          </span>
        </button>
      </div>
    </section>
  );
};
