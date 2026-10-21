import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MetaSlimLogo } from './MetaSlimLogo';
import { LANGUAGE_OPTIONS, AppLanguage } from '../utils/i18n';
import { Search, ShoppingBag, ShieldCheck, X, LogIn, LogOut, CloudCheck, UserCheck, Truck, TrendingUp, Gift, Globe } from 'lucide-react';

interface HeaderProps {
  onOpenCalculator?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const {
    activeTab,
    setActiveTab,
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
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const pendingTenantsCount = (allTenants || []).filter((t) => t?.status === 'pending').length;

  const currentLangOption = LANGUAGE_OPTIONS.find((l) => l.code === language) || LANGUAGE_OPTIONS[0];

  const handleSelectLanguage = (lang: AppLanguage) => {
    setLanguage(lang);
    setIsLangMenuOpen(false);
    const messages: Record<AppLanguage, string> = {
      pt: 'Idioma alterado para Português 🇵🇹',
      es: 'Idioma cambiado a Español 🇪🇸',
      en: 'Language changed to English 🇬🇧',
    };
    showToast(messages[lang]);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff]/95 backdrop-blur-md border-b border-emerald-950/5 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto h-14 sm:h-16 px-2.5 sm:px-4 flex items-center justify-between gap-1 sm:gap-2">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab('inicio')}
          className="flex items-center gap-2 text-left group transition-transform active:scale-95 cursor-pointer shrink-0"
          id="logo-button"
        >
          {settings.logoUrl ? (
            <div className="flex items-center gap-2">
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/metaslim-logo.svg';
                }}
                className="h-8 sm:h-10 max-h-8 sm:max-h-10 max-w-[120px] sm:max-w-[160px] object-contain rounded-lg"
              />
              <div className="flex flex-col hidden sm:flex">
                <div className="flex items-center gap-1 leading-none">
                  <span className="font-extrabold text-[15px] sm:text-[16px] tracking-tight text-[#006750]">
                    {settings.storeName}
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-emerald-800/60 font-semibold font-mono mt-0.5">
                  {settings.storeSubtitle || 'Clinical Peptide Labs'}
                </span>
              </div>
            </div>
          ) : (
            <MetaSlimLogo size="md" />
          )}
        </button>

        {/* Search Bar on Desktop / Expandable on Mobile */}
        <div className="flex-1 max-w-md mx-2 hidden lg:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-emerald-800/50 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder={t('header.search_placeholder')}
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
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-[#006750] hover:bg-emerald-50 transition-colors"
            title={t('header.search_mobile')}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Language Selector (PT / ES / EN) */}
          <div className="relative" id="language-selector-container">
            {/* Desktop Inline Pill Selector */}
            <div className="hidden md:flex items-center bg-[#f2f4f8] p-0.5 rounded-full border border-slate-200/70">
              {LANGUAGE_OPTIONS.map((opt) => {
                const isSelected = language === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => handleSelectLanguage(opt.code)}
                    className={`px-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#006750] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-[#006750]'
                    }`}
                    title={opt.label}
                    id={`lang-btn-${opt.code}`}
                  >
                    <span>{opt.flag}</span>
                    <span>{opt.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Compact Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="md:hidden h-8 px-2 rounded-full bg-[#f2f4f8] hover:bg-emerald-50 text-[11px] font-bold text-slate-700 flex items-center gap-1 border border-slate-200/70 transition-colors cursor-pointer"
              title={t('header.language_title')}
              id="lang-mobile-trigger"
            >
              <Globe className="w-3.5 h-3.5 text-[#006750]" />
              <span>{currentLangOption.flag}</span>
              <span>{currentLangOption.shortLabel}</span>
            </button>

            {isLangMenuOpen && (
              <div className="md:hidden absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                {LANGUAGE_OPTIONS.map((opt) => {
                  const isSelected = language === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => handleSelectLanguage(opt.code)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#006750] text-white'
                          : 'text-slate-700 hover:bg-emerald-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{opt.flag}</span>
                        <span>{opt.label}</span>
                      </span>
                      <span className="font-mono text-[10px] opacity-80">{opt.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delivery Policy Link */}
          <button
            onClick={() => setActiveTab('prazos-entrega')}
            className={`hidden sm:flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-full transition-colors ${
              activeTab === 'prazos-entrega'
                ? 'bg-[#006750] text-white shadow-xs'
                : 'text-slate-700 bg-[#f2f4f8] hover:bg-emerald-50 hover:text-[#006750] border border-slate-200/50'
            }`}
            title={t('nav.delivery_full')}
          >
            <Truck className="w-3.5 h-3.5 text-[#006750]" />
            <span>{t('nav.delivery')}</span>
          </button>

          {/* Reseller / Revenda Link with Pulse Effect */}
          <button
            onClick={() => setActiveTab('revenda')}
            className={`relative flex items-center gap-1 text-[11px] font-semibold px-2 sm:px-2.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'revenda'
                ? 'bg-[#006750] text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-400'
                : 'text-[#006750] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 animate-revenda-pulse'
            }`}
            title={t('nav.resale_full')}
            id="header-revenda-btn"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006750]"></span>
            </span>
            <TrendingUp className={`w-3.5 h-3.5 ${activeTab === 'revenda' ? 'text-[#71face]' : 'text-[#006750]'}`} />
            <span className="font-bold hidden xs:inline">{t('nav.resale')}</span>
            <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full font-black tracking-tight shadow-xs animate-badge-pulse">
              300%+
            </span>
          </button>

          {/* Currency Switcher */}
          <button
            onClick={toggleCurrency}
            className="h-8 px-2 rounded-full bg-[#f2f4f8] hover:bg-emerald-50 text-[11px] sm:text-[12px] font-semibold text-slate-700 flex items-center gap-0.5 border border-slate-200/50 transition-colors cursor-pointer"
            title="€ / R$"
            id="currency-switch-btn"
          >
            <span className={currency === 'EUR' ? 'text-[#006750] font-bold' : 'text-slate-400'}>€</span>
            <span className="text-slate-300">/</span>
            <span className={currency === 'BRL' ? 'text-[#006750] font-bold' : 'text-slate-400'}>R$</span>
          </button>

          {/* Shopping Cart Button */}
          <button
            onClick={() => setActiveTab('carrinho')}
            className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
              activeTab === 'carrinho'
                ? 'bg-emerald-100 text-[#006750]'
                : 'text-slate-700 hover:text-[#006750] hover:bg-emerald-50'
            }`}
            aria-label={t('nav.cart_full')}
            id="header-cart-button"
          >
            <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#006750] text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-sm">
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* Indique & Ganhe (Affiliate Program) Shortcut */}
          <button
            type="button"
            onClick={() => setIsAffiliateModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-emerald-500/15 via-[#71face]/20 to-emerald-500/15 text-[#004d3b] hover:bg-emerald-100/70 border border-emerald-300/80 transition-all shadow-2xs hover:scale-102 cursor-pointer"
            title={t('affiliate.badge')}
            id="header-affiliate-btn"
          >
            <Gift className="w-3.5 h-3.5 text-[#006750]" />
            <span className="hidden xl:inline">{t('nav.affiliate_btn')}</span>
            <span className="font-mono text-[10px] bg-[#006750] text-white px-1.5 py-0.2 rounded-full font-black">
              {settings.affiliateProgram?.commissionPercentage ?? 10}%
            </span>
          </button>

          {/* Admin shortcut badge */}
          <button
            onClick={() => setActiveTab('admin')}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-[#006750] text-white shadow-sm'
                : 'bg-emerald-50 text-[#006750] hover:bg-emerald-100'
            }`}
            id="header-admin-btn"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('nav.admin')}</span>
          </button>

          {/* User Auth Button / Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors border border-emerald-300 shadow-xs"
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
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#006750]" />
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {customerUser?.name || firebaseUser?.displayName || (localAdminUser ? 'Super Administrador' : 'Cliente Verificado')}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                      {customerUser?.email || firebaseUser?.email || localAdminUser?.email}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                      <CloudCheck className="w-3 h-3 text-[#006750]" />
                      <span>
                        {customerUser
                          ? t('header.verified_customer')
                          : firebaseUser
                          ? t('header.google_verified')
                          : t('header.admin_connected')}
                      </span>
                    </div>
                  </div>

                  {/* Affiliate Program Item */}
                  <button
                    onClick={() => {
                      setIsAffiliateModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-emerald-950 bg-emerald-50/70 hover:bg-emerald-100 rounded-lg flex items-center justify-between font-bold border border-emerald-200/80 my-1 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5 text-[#006750]" />
                      <span>{t('nav.my_affiliate_link')}</span>
                    </div>
                    <span className="bg-[#006750] text-white px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold">
                      {settings.affiliateProgram?.commissionPercentage ?? 10}%
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('carrinho');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-[#006750] rounded-lg flex items-center gap-2 font-medium"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t('nav.my_cart')} ({cartItemsCount})</span>
                  </button>

                  {isAdminUser && (
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-[#006750] rounded-lg flex items-center gap-2 font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t('nav.admin_panel')}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab('super-admin');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center justify-between font-bold border border-amber-200 my-1"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t('nav.super_admin')}</span>
                    </div>
                    {pendingTenantsCount > 0 && (
                      <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[9px] font-black">
                        {pendingTenantsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium mt-1 border-t border-slate-100 pt-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('carrinho')}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-[#006750] hover:bg-emerald-50 border border-slate-200/80 px-2.5 py-1.5 rounded-full transition-colors cursor-pointer"
              title={t('nav.login')}
              id="header-login-btn"
            >
              <LogIn className="w-3.5 h-3.5 text-[#006750]" />
              <span className="hidden sm:inline">{t('nav.login')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay Bar */}
      {isSearchOpen && (
        <div className="lg:hidden px-4 pb-3 pt-1 border-t border-slate-100 bg-white">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-emerald-800/50 absolute left-3 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder={t('header.search_mobile')}
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

