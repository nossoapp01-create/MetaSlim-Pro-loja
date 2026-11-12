import React from 'react';
import { useStore } from '../context/StoreContext';

const CATEGORIES: Array<{
  id: string;
  labels: { pt: string; es: string; en: string };
}> = [
  { id: 'todos', labels: { pt: 'Todos', es: 'Todos', en: 'All' } },
  { id: 'glp1', labels: { pt: 'Emagrecimento & GLP-1', es: 'Pérdida de Peso & GLP-1', en: 'Weight & GLP-1' } },
  { id: 'muscular', labels: { pt: 'Muscular & Reparo', es: 'Muscular y Reparación', en: 'Muscle & Repair' } },
  { id: 'longevidade', labels: { pt: 'Longevidade & Neuro', es: 'Longevidad y Neuro', en: 'Longevity & Neuro' } },
  { id: 'kits', labels: { pt: 'Kits & Solventes', es: 'Kits y Solventes', en: 'Kits & Solvents' } },
];

export const CategoryFilter: React.FC = () => {
  const { selectedCategory, setSelectedCategory, products, language } = useStore();
  const onlineProducts = (products || []).filter((p) => p && p.status !== 'offline');

  const getCount = (catId: string) => {
    if (catId === 'todos') return onlineProducts.length;
    return onlineProducts.filter((p) => p.category === catId).length;
  };

  return (
    <div
      className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none"
      role="tablist"
      aria-label="Categorias de peptídeos"
      id="category-filter-bar"
    >
      {CATEGORIES.map((cat) => {
        const count = getCount(cat.id);
        if (cat.id !== 'todos' && count === 0) return null;
        const isActive = (selectedCategory || 'todos') === cat.id;
        const label = cat.labels[language] || cat.labels.pt;

        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setSelectedCategory(cat.id)}
            id={`filter-cat-${cat.id}`}
            className={`shrink-0 h-8 sm:h-9 px-3 sm:px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
              isActive
                ? 'bg-[#006750] text-white border-[#006750] shadow-xs'
                : 'bg-white text-slate-600 hover:text-[#006750] hover:border-emerald-300 border-slate-200/80'
            }`}
          >
            <span>{label}</span>
            <span
              className={`font-mono tabular-nums text-[10px] px-1.5 py-0.5 rounded ${
                isActive ? 'bg-white/15 text-[#93f5d4]' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
