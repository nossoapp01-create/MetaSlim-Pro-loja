import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, ShoppingBag, ShieldCheck, Dna, X, LogIn, LogOut, CloudCheck, UserCheck, User, Truck, TrendingUp, Stethoscope, Building2, Store } from 'lucide-react';

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
    firebaseUser,
    localAdminUser,
    customerUser,
    isAuthenticated,
    isAdminUser,
    isSuperAdmin,
    allTenants,
    loginWithGoogle,
    logout,
    isFirebaseConnected,
    currentTenant,
    activeTenantId,
    openAuthModal,
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pendingTenantsCount = (allTenants || []).filter((t) => t?.status === 'pending').length;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff]/90 backdrop-blur-md border-b border-emerald-950/5 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab('inicio')}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
          id="logo-button"
        >
          {settings.logoUrl ? (
            <div className="flex items-center gap-2.5">
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="h-10 max-h-10 max-w-[150px] object-contain rounded-lg"
              />
              <div className="flex flex-col hidden sm:flex">
                <div className="flex items-center gap-1 leading-none">
                  <span className="font-extrabold text-[16px] tracking-tight text-[#006750]">
                    {settings.storeName}
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-emerald-800/60 font-semibold font-mono mt-0.5">
                  {settings.storeSubtitle || 'Clinical Peptide Labs'}
                </span>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
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

          {/* Consulta Médica Gratuita App Link */}
          <a
            href={settings.consultationUrl || 'https://consulta.metaslim-pro.shop/'}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-full bg-emerald-100/70 hover:bg-emerald-200/90 text-[#006750] border border-emerald-300/80 transition-colors shadow-2xs"
            title="Faça sua consulta médica grátis online (Dra. Valéria Prado)"
            id="header-consulta-gratis-link"
          >
            <Stethoscope className="w-3.5 h-3.5 text-[#006750]" />
            <span>Consulta Grátis</span>
            <span className="text-[9px] bg-[#006750] text-white px-1.5 py-0.2 rounded-full font-bold">
              IA
            </span>
          </a>

          {/* Delivery Policy Link */}
          <button
            onClick={() => setActiveTab('prazos-entrega')}
            className={`hidden sm:flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-full transition-colors ${
              activeTab === 'prazos-entrega'
                ? 'bg-[#006750] text-white shadow-xs'
                : 'text-slate-700 bg-[#f2f4f8] hover:bg-emerald-50 hover:text-[#006750] border border-slate-200/50'
            }`}
            title="Prazos e Condições de Entrega"
          >
            <Truck className="w-3.5 h-3.5 text-[#006750]" />
            <span>Prazos</span>
          </button>

          {/* Reseller / Revenda Link with Pulse Effect */}
          <button
            onClick={() => setActiveTab('revenda')}
            className={`relative flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'revenda'
                ? 'bg-[#006750] text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-400'
                : 'text-[#006750] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 animate-revenda-pulse'
            }`}
            title="Programa Oficial de Revenda e Atacado (Lucros > 300%)"
            id="header-revenda-btn"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006750]"></span>
            </span>
            <TrendingUp className={`w-3.5 h-3.5 ${activeTab === 'revenda' ? 'text-[#71face]' : 'text-[#006750]'}`} />
            <span className="font-bold">Revenda</span>
            <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full font-black tracking-tight shadow-xs animate-badge-pulse">
              300%+
            </span>
          </button>

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
                        {customerUser ? 'Cliente Cadastrado' : firebaseUser ? 'Google Verificado' : 'Admin Conectado'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('carrinho');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-[#006750] rounded-lg flex items-center gap-2 font-medium"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Meu Carrinho ({cartItemsCount})</span>
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
                      <span>Painel Administrativo</span>
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
                      <span>Super Admin (Lojas)</span>
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
                    <span>Sair da Conta</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('carrinho')}
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 hover:text-[#006750] hover:bg-emerald-50 border border-slate-200/80 px-2.5 py-1.5 rounded-full transition-colors cursor-pointer"
              title="Cadastro e Login do Cliente"
              id="header-login-btn"
            >
              <LogIn className="w-3.5 h-3.5 text-[#006750]" />
              <span>Entrar</span>
            </button>
          )}
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
