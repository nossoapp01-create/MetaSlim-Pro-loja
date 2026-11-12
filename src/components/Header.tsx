import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { MetaSlimLogo } from './MetaSlimLogo';
import { LANGUAGE_OPTIONS, AppLanguage } from '../utils/i18n';
import {
  Search,
  ShoppingBag,
  ShieldCheck,
  X,
  LogIn,
  LogOut,
  CloudCheck,
  UserCheck,
  Gift,
  Calculator,
} from 'lucide-react';

interface HeaderProps {
  onOpenCalculator?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCalculator }) => {
  const {
    activeTab,
    setActiveTab,
    setSelectedCategory,
    cartItemsCount,
    currency,
    toggleCurrency,
    settings,
    searchQuery,
    setSearchQuery,
    firebaseUser,
    localAdminUser,
    customerUser,
    isAuthenticated,
    isAdminUser,
    isSuperAdmin,
    isTenantAdmin,
    allTenants,
    logout,
    setIsAffiliateModalOpen,
    language,
    setLanguage,
    t,
    showToast,
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pendingTenantsCount = (allTenants || []).filter((ten) => ten?.status === 'pending').length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleSelectLanguage = (lang: AppLanguage) => {
    setLanguage(lang);
    const messages: Record<AppLanguage, string> = {
      pt: 'Idioma alterado para Português',
      es: 'Idioma cambiado a Español',
      en: 'Language changed to English',
    };
    showToast(messages[lang]);
  };

  const navItems: Array<{
    id: 'inicio' | 'produtos' | 'resultados' | 'revenda' | 'prazos-entrega';
    label: string;
  }> = [
    { id: 'inicio', label: t('nav.home') },
    { id: 'produtos', label: t('nav.products') },
    { id: 'resultados', label: t('nav.results') },
    { id: 'revenda', label: t('nav.resale') },
    { id: 'prazos-entrega', label: t('nav.delivery') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto h-14 sm:h-16 px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Logo */}
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('todos');
            setActiveTab('inicio');
          }}
          className="flex items-center gap-2 text-left transition-opacity hover:opacity-90 active:scale-[0.98] cursor-pointer shrink-0"
          id="logo-button"
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.storeName || 'MetaSlim Pro'}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/metaslim-logo.svg';
              }}
              className="h-9 sm:h-10 max-h-9 sm:max-h-10 max-w-[145px] sm:max-w-[175px] object-contain rounded-lg"
            />
          ) : (
            <MetaSlimLogo size="md" />
          )}
        </button>

        {/* Zone 2: Clean Single-Line Navigation (Desktop) */}
        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-1 lg:gap-2"
        >
          {navItems.map((item) => {
            const isActive =
              activeTab === item.id ||
              (item.id === 'produtos' && activeTab === 'produto-detalhe');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3 py-2 text-[13px] font-semibold tracking-tight transition-colors cursor-pointer whitespace-nowrap rounded-lg ${
                  isActive
                    ? 'text-[#006750] bg-emerald-50/70'
                    : 'text-slate-600 hover:text-[#131b2e] hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-[#006750]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Compact Utility & Conversion Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Search Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isSearchOpen || searchQuery
                ? 'bg-emerald-50 text-[#006750]'
                : 'text-slate-600 hover:text-[#006750] hover:bg-slate-100'
            }`}
            title={t('nav.search_placeholder')}
            aria-label={t('nav.search_placeholder')}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Language Selector (PT / ES / EN) */}
          <div
            className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 shrink-0"
            id="language-selector-container"
            role="group"
            aria-label={t('nav.language')}
          >
            {LANGUAGE_OPTIONS.map((opt) => {
              const isSelected = language === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => handleSelectLanguage(opt.code)}
                  className={`px-1.5 sm:px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#006750] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-[#006750]'
                  }`}
                  title={opt.label}
                  id={`lang-btn-${opt.code}`}
                >
                  <span className="text-[11px] leading-none hidden sm:inline">{opt.flag}</span>
                  <span>{opt.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Currency Switcher */}
          <button
            type="button"
            onClick={toggleCurrency}
            className="h-8 px-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-[11px] font-mono font-bold text-slate-700 flex items-center gap-0.5 border border-slate-200/80 transition-colors cursor-pointer"
            title="EUR / BRL"
            id="currency-switch-btn"
          >
            <span className={currency === 'EUR' ? 'text-[#006750]' : 'text-slate-400'}>€</span>
            <span className="text-slate-300">/</span>
            <span className={currency === 'BRL' ? 'text-[#006750]' : 'text-slate-400'}>R$</span>
          </button>

          {/* Affiliate Quick Link */}
          <button
            type="button"
            onClick={() => setIsAffiliateModalOpen(true)}
            className="hidden sm:flex items-center gap-1 h-8 px-2.5 rounded-lg text-[11px] font-bold text-[#006750] bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/80 transition-colors cursor-pointer"
            title={t('nav.affiliate')}
            id="header-affiliate-btn"
          >
            <Gift className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">
              {settings.affiliateProgram?.commissionPercentage ?? 10}%
            </span>
          </button>

          {/* Shopping Cart Button */}
          <button
            type="button"
            onClick={() => setActiveTab('carrinho')}
            className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'carrinho'
                ? 'bg-emerald-50 text-[#006750]'
                : 'text-slate-700 hover:text-[#006750] hover:bg-slate-100'
            }`}
            aria-label={t('nav.cart')}
            id="header-cart-button"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#006750] text-white font-mono tabular-nums text-[10px] font-bold flex items-center justify-center shadow-xs">
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* Account / Auth Action */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-[#006750]/20 transition-all border border-emerald-300 cursor-pointer"
                title={customerUser?.email || firebaseUser?.email || localAdminUser?.email || 'Conta'}
                id="header-user-btn"
              >
                {firebaseUser?.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={customerUser?.name || firebaseUser.displayName || 'Avatar'}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#006750] text-white text-[11px] font-bold flex items-center justify-center">
                    {((customerUser?.name || customerUser?.email || firebaseUser?.displayName || firebaseUser?.email || localAdminUser?.email)?.[0] || 'C').toUpperCase()}
                  </div>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#006750]" />
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {customerUser?.name || firebaseUser?.displayName || (localAdminUser ? 'Administrador' : 'Cliente Verificado')}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                      {customerUser?.email || firebaseUser?.email || localAdminUser?.email}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                      <CloudCheck className="w-3 h-3 text-[#006750]" />
                      <span>Sessão ativa e protegida</span>
                    </div>
                  </div>

                  {onOpenCalculator && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenCalculator();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-[#006750] rounded-lg flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>{t('nav.calculator')}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsAffiliateModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-emerald-950 bg-emerald-50/70 hover:bg-emerald-100 rounded-lg flex items-center justify-between font-bold border border-emerald-200/80 my-1 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5 text-[#006750]" />
                      <span>{t('nav.affiliate')}</span>
                    </div>
                    <span className="bg-[#006750] text-white px-1.5 py-0.5 rounded font-mono tabular-nums text-[9px] font-bold">
                      {settings.affiliateProgram?.commissionPercentage ?? 10}%
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('carrinho');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-[#006750] rounded-lg flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>
                      {t('nav.cart')} ({cartItemsCount})
                    </span>
                  </button>

                  {(isAdminUser || isTenantAdmin) && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('admin');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#006750] hover:bg-emerald-50 rounded-lg flex items-center gap-2 font-bold cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t('nav.admin')}</span>
                    </button>
                  )}

                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('super-admin');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-lg flex items-center justify-between font-bold my-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#006750]" />
                        <span>{t('nav.super_admin')}</span>
                      </div>
                      {pendingTenantsCount > 0 && (
                        <span className="bg-[#006750] text-white px-1.5 py-0.5 rounded font-mono tabular-nums text-[9px] font-bold">
                          {pendingTenantsCount}
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium mt-1 border-t border-slate-100 pt-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('carrinho')}
              className="flex items-center gap-1.5 h-8 text-[11px] font-bold text-slate-700 hover:text-[#006750] hover:bg-emerald-50/70 border border-slate-200 px-2.5 rounded-lg transition-colors cursor-pointer"
              title={t('nav.login')}
              id="header-login-btn"
            >
              <LogIn className="w-3.5 h-3.5 text-[#006750]" />
              <span className="hidden sm:inline">{t('nav.login')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Search Bar (Desktop & Mobile) */}
      {isSearchOpen && (
        <div className="px-3 sm:px-5 pb-3 pt-2 border-t border-slate-100 bg-white">
          <div className="max-w-2xl mx-auto relative flex items-center">
            <Search className="w-4 h-4 text-emerald-800/60 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder={t('nav.search_placeholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'produtos' && activeTab !== 'inicio') {
                  setActiveTab('produtos');
                }
              }}
              className="w-full h-10 pl-10 pr-10 rounded-xl bg-slate-100 text-[13px] text-[#131b2e] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006750] focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => {
                if (searchQuery) {
                  setSearchQuery('');
                } else {
                  setIsSearchOpen(false);
                }
              }}
              className="absolute right-3 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
