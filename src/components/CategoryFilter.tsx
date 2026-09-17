import React from 'react';
import { useStore } from '../context/StoreContext';
import { LayoutGrid, Flame, Dumbbell, Sparkles, TestTube2 } from 'lucide-react';

export const CategoryFilter: React.FC = () => {
  const { selectedCategory, setSelectedCategory, products } = useStore();

  const categories = [
    { id: 'todos', label: 'Todos', icon: LayoutGrid, count: products.length },
    {
      id: 'glp1',
      label: 'Emagrecimento & GLP-1',
      icon: Flame,
      count: products.filter((p) => p.category === 'glp1').length,
    },
    {
      id: 'muscular',
      label: 'Peptídeos Musculares',
      icon: Dumbbell,
      count: products.filter((p) => p.category === 'muscular').length,
    },
    {
      id: 'longevidade',
      label: 'Longevidade',
      icon: Sparkles,
      count: products.filter((p) => p.category === 'longevidade').length,
    },
    {
      id: 'kits',
      label: 'Packs & Solventes',
      icon: TestTube2,
      count: products.filter((p) => p.category === 'kits').length,
    },
  ];

  return (
    <section className="w-full py-2" id="categories-section">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`group relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-[#006750] to-[#0d8267] text-white shadow-md shadow-emerald-900/15 scale-100 ring-2 ring-emerald-500/20'
                  : 'bg-white text-slate-700 hover:text-[#006750] hover:bg-emerald-50/80 border border-slate-200/70 hover:border-emerald-200'
              }`}
              id={`cat-pill-${cat.id}`}
            >
              <Icon
                className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-6 ${
                  isActive ? 'text-[#93f5d4]' : 'text-slate-400 group-hover:text-[#006750]'
                }`}
              />
              <span>{cat.label}</span>
              {cat.count > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full transition-colors ${
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
      </div>
    </section>
  );
};
