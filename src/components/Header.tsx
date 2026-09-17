import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, ShoppingBag, ShieldCheck, Dna, X } from 'lucide-react';

interface HeaderProps {
  onOpenCalculator?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCalculator }) => {
  const {
    activeTab,
    setActiveTab,
    cartItemsCount,
    currency,
    toggleCurrency,
    settings,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff]/90 backdrop-blur-md border-b border-emerald-950/5 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab('inicio')}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
          id="logo-button"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#006750] to-[#0d8267] flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
            <Dna className="w-5 h-5 text-[#93f5d4]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 leading-none">
              <span className="font-extrabold text-[17px] tracking-tight text-[#006750]">{settings.storeName.split(' ')[0] || 'MetaSlim'}</span>
              <span className="font-light text-[17px] tracking-tight text-[#131b2e]">{settings.storeName.split(' ')[1] || 'Pro'}</span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-emerald-800/60 font-semibold font-mono mt-0.5">
              {settings.storeSubtitle || 'Clinical Peptide Labs'}
            </span>
          </div>
        </button>

        {/* Search Bar on Desktop / Expandable on Mobile */}
        <div className="flex-1 max-w-md mx-3 hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-emerald-800/50 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar peptídeo (Retatrutide, Tirzepatide, BPC-157)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'produtos' && activeTab !== 'inicio') {
                  setActiveTab('produtos');
                }
              }}
              className="w-full h-9 pl-9 pr-8 rounded-full bg-[#f2f4f8] text-[13px] text-[#131b2e] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006750] border border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions Header */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-[#006750] hover:bg-emerald-50 transition-colors"
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Calculator Trigger */}
          {onOpenCalculator && (
            <button
              onClick={onOpenCalculator}
              className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-2.5 py-1.5 rounded-full transition-colors"
              title="Calculadora de Dosagem e Reconstituição"
            >
              <span>Calculadora BAC</span>
            </button>
          )}

          {/* Currency Switcher */}
          <button
            onClick={toggleCurrency}
            className="h-8 px-2.5 rounded-full bg-[#f2f4f8] hover:bg-emerald-50 text-[12px] font-semibold text-slate-700 flex items-center gap-1 border border-slate-200/50 transition-colors"
            title="Alternar Moeda (€ / R$)"
            id="currency-switch-btn"
          >
            <span className={currency === 'EUR' ? 'text-[#006750] font-bold' : 'text-slate-400'}>€</span>
            <span className="text-slate-300">/</span>
            <span className={currency === 'BRL' ? 'text-[#006750] font-bold' : 'text-slate-400'}>R$</span>
          </button>

          {/* Shopping Cart Button */}
          <button
            onClick={() => setActiveTab('carrinho')}
            className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
              activeTab === 'carrinho'
                ? 'bg-emerald-100 text-[#006750]'
                : 'text-slate-700 hover:text-[#006750] hover:bg-emerald-50'
            }`}
            aria-label="Carrinho de Compras"
            id="header-cart-button"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#006750] text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-sm">
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* Admin shortcut badge */}
          <button
            onClick={() => setActiveTab('admin')}
            className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-[#006750] text-white shadow-sm'
                : 'bg-emerald-50 text-[#006750] hover:bg-emerald-100'
            }`}
            id="header-admin-btn"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay Bar */}
      {isSearchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-100 bg-white">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-emerald-800/50 absolute left-3 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder="Buscar peptídeo..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'produtos') setActiveTab('produtos');
              }}
              className="w-full h-10 pl-9 pr-9 rounded-xl bg-[#f2f4f8] text-[14px] text-[#131b2e] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006750]"
            />
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-3 text-slate-400 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
