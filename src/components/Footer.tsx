import React from 'react';
import { useStore } from '../context/StoreContext';
import { MetaSlimLogo } from './MetaSlimLogo';
import { LANGUAGE_OPTIONS } from '../utils/i18n';
import { ShieldCheck, Lock, PhoneCall, Truck, TrendingUp, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setActiveTab, allTenants, language, setLanguage, t, showToast } = useStore();
  const pendingTenantsCount = (allTenants || []).filter((t) => t?.status === 'pending').length;

  return (
    <footer className="w-full bg-[#131b2e] text-slate-300 pt-12 pb-24 border-t border-slate-800" id="store-footer">
      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="flex flex-col gap-3 md:col-span-2">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <div className="flex items-center gap-3">
                  <img
                    src={settings.logoUrl}
                    alt={settings.storeName}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/metaslim-logo.svg';
                    }}
                    className="h-10 max-h-10 max-w-[160px] object-contain rounded-lg bg-white/5 p-1"
                  />
                  <span className="text-xl font-extrabold text-white tracking-tight">
                    {settings.storeName}
                  </span>
                </div>
              ) : (
                <MetaSlimLogo size="lg" variant="white" />
              )}
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {t('footer.brand_desc')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`tel:${(settings?.whatsappNumber || '+351912345678').replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-[#71face] border border-emerald-500/30 text-xs font-semibold transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{t('footer.phone_support')} {settings.whatsappNumber || '+351 912 345 678'}</span>
              </a>
            </div>

            {/* Language Selector in Footer */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Globe className="w-3.5 h-3.5 text-[#71face]" />
                {t('footer.choose_language')}
              </span>
              <div className="flex items-center gap-1.5">
                {LANGUAGE_OPTIONS.map((opt) => {
                  const isSelected = language === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setLanguage(opt.code);
                        showToast(
                          opt.code === 'pt'
                            ? 'Idioma alterado para Português 🇵🇹'
                            : opt.code === 'es'
                            ? 'Idioma cambiado a Español 🇪🇸'
                            : 'Language changed to English 🇬🇧'
                        );
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#006750] text-white border border-emerald-400/50 shadow-sm'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      <span>{opt.flag}</span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase font-bold text-white tracking-wider">
              {t('footer.navigation')}
            </span>
            <button
              onClick={() => setActiveTab('inicio')}
              className="text-xs text-slate-400 hover:text-[#71face] text-left transition-colors"
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => setActiveTab('produtos')}
              className="text-xs text-slate-400 hover:text-[#71face] text-left transition-colors"
            >
              {t('nav.catalog')}
            </button>
            <button
              onClick={() => setActiveTab('resultados')}
              className="text-xs text-slate-400 hover:text-[#71face] text-left transition-colors"
            >
              {t('nav.results')}
            </button>
            <button
              onClick={() => setActiveTab('carrinho')}
              className="text-xs text-slate-400 hover:text-[#71face] text-left transition-colors"
            >
              {t('nav.cart_full')}
            </button>
            <button
              onClick={() => setActiveTab('prazos-entrega')}
              className="text-xs text-[#71face] hover:text-[#93f5d4] text-left transition-colors flex items-center gap-1.5 font-medium"
            >
              <Truck className="w-3.5 h-3.5 text-[#71face]" />
              <span>{t('nav.delivery_full')}</span>
            </button>
            <button
              onClick={() => setActiveTab('revenda')}
              className="text-xs text-amber-300 hover:text-amber-200 text-left transition-colors flex items-center gap-1.5 font-semibold"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('nav.resale_full')}</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="text-xs text-emerald-400 hover:text-emerald-300 text-left font-semibold transition-colors"
            >
              {t('nav.admin_panel')}
            </button>
            <button
              onClick={() => setActiveTab('super-admin')}
              className="text-xs text-amber-400 hover:text-amber-300 text-left font-semibold transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('nav.super_admin')}</span>
            </button>
          </div>

          {/* Compliance & Lab Certification */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase font-bold text-white tracking-wider">
              {t('footer.quality_title')}
            </span>
            <button
              onClick={() => setActiveTab('prazos-entrega')}
              className="flex items-start gap-2 text-xs text-slate-400 hover:text-[#71face] text-left transition-colors cursor-pointer group"
            >
              <Truck className="w-4 h-4 text-[#71face] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <span>{t('footer.quality_delivery')}</span>
            </button>
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#71face] shrink-0 mt-0.5" />
              <span>{t('footer.quality_hplc')}</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <Lock className="w-4 h-4 text-[#71face] shrink-0 mt-0.5" />
              <span>{t('footer.quality_security')}</span>
            </div>
          </div>
        </div>

        {/* Dedicated Super Admin Panel Card in Footer */}
        <div className="bg-slate-900/95 rounded-2xl p-4 sm:p-5 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs sm:text-sm font-bold text-amber-300">
                  {t('nav.super_admin')}
                </span>
                {pendingTenantsCount > 0 ? (
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                    {pendingTenantsCount} loja(s) aguardando autorização
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Todas as lojas autorizadas
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
                Área reservada para o Super Admin gerenciar lojas cadastradas, aprovar novas solicitações, auditar e configurar o ambiente multi-tenant.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('super-admin')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
            id="footer-super-admin-btn"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>{t('nav.super_admin')}</span>
          </button>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p className="text-center sm:text-left">
            &copy; 2026 {settings.storeName}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
            <span>STRIPE</span>
            <span>•</span>
            <span>CARTÃO DE CRÉDITO / DÉBITO</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
