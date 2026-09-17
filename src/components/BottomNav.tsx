import React from 'react';
import { useStore } from '../context/StoreContext';
import { Home, Grid, Users, ShoppingBag, ShieldCheck } from 'lucide-react';

interface NavItem {
  id: 'inicio' | 'produtos' | 'resultados' | 'carrinho' | 'admin';
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cartItemsCount } = useStore();

  const navItems: NavItem[] = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'produtos', label: 'Peptídeos', icon: Grid },
    { id: 'resultados', label: 'Resultados', icon: Users },
    { id: 'carrinho', label: 'Carrinho', icon: ShoppingBag, badge: cartItemsCount },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#ffffff]/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] h-16 px-2">
      <div className="max-w-md mx-auto h-full flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'produtos' && activeTab === 'produto-detalhe');

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`relative flex flex-col items-center justify-center w-14 h-full transition-colors active:scale-90 ${
                isActive ? 'text-[#006750]' : 'text-slate-400 hover:text-slate-600'
              }`}
              id={`bottom-nav-${item.id}`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'scale-100'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#006750] text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium tracking-tight ${
                  isActive ? 'font-bold text-[#006750]' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>

              {/* Active Indicator bar */}
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#006750]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
