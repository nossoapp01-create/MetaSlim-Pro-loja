import React from 'react';
import { useStore } from '../context/StoreContext';
import { MetaSlimLogo } from './MetaSlimLogo';
import { LANGUAGE_OPTIONS } from '../utils/i18n';
import { ShieldCheck, Lock, PhoneCall, Truck, TrendingUp, Globe, Gift } from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    settings,
    setActiveTab,
    isAdminUser,
    isSuperAdmin,
    isTenantAdmin,
    setIsAffiliateModalOpen,
    language,
    setLanguage,
    t,
    showToast,
  } = useStore();

  return (
    <footer className="w-full bg-[#131b2e] text-slate-300 pt-12 pb-24 border-t border-slate-800" id="store-footer">
      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="flex flex-col gap-3 md:col-span-2">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName || 'MetaSlim Pro'}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/metaslim-logo.svg';
                  }}
                  className="h-10 max-h-10 max-w-[180px] object-contain rounded-lg bg-white/5 p-1"
                />
              ) : (
                <MetaSlimLogo size="lg" variant="white" />
              )}
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              {t('footer.desc')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={`tel:${(settings?.whatsappNumber || '+351912345678').replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#71face] border border-emerald-500/25 text-xs font-semibold transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span className="font-mono">{settings.whatsappNumber || '+351 912 345 678'}</span>
              </a>
            </div>

            {/* Language Selector in Footer */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Globe className="w-3.5 h-3.5 text-[#71face]" />
                {t('nav.language')}:
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
                            ? 'Idioma alterado para Português'
                            : opt.code === 'es'
                            ? 'Idioma cambiado a Español'
                            : 'Language changed to English'
                        );
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#006750] text-white border border-emerald-400/50'
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
            <span className="font-mono text-xs uppercase font-bold text-white tracking-wider mb-1">
              {t('footer.nav_title')}
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('inicio')}
              className="text-xs text-slate-400 hover:text-[#71face] text-left transition-colors cursor-pointer"
            >
              {t('footer.home_catalog')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('produtos')}
              className="text-xs text-slate-400 hover:text-[#71face] text-left transition-colors cursor-pointer"
            >
              {t('footer.all_peptides')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resultados')}
              className="text-xs text-slate-400 hover:text-[#71face] text-left transition-colors cursor-pointer"
            >
              {t('footer.before_after')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('carrinho')}
              className="text-xs text-slate-400 hover:text-[#71face] text-left transition-colors cursor-pointer"
            >
              {t('footer.cart_checkout')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('prazos-entrega')}
              className="text-xs text-[#71face] hover:text-[#93f5d4] text-left transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-[#71face]" />
              <span>{t('footer.delivery_policy')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('revenda')}
              className="text-xs text-slate-300 hover:text-[#71face] text-left transition-colors flex items-center gap-1.5 font-semibold cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#71face]" />
              <span>{t('footer.resale_program')}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAffiliateModalOpen(true)}
              className="text-xs text-slate-400 hover:text-[#71face] text-left transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('footer.affiliate_program')}</span>
            </button>

            {(isAdminUser || isTenantAdmin) && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className="text-xs text-emerald-400 hover:text-emerald-300 text-left font-semibold transition-colors pt-1 cursor-pointer"
              >
                {t('nav.admin')}
              </button>
            )}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('super-admin')}
                className="text-xs text-amber-400 hover:text-amber-300 text-left font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('nav.super_admin')}</span>
              </button>
            )}
          </div>

          {/* Compliance & Lab Certification */}
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-xs uppercase font-bold text-white tracking-wider mb-0.5">
              {t('footer.quality_title')}
            </span>
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#71face] shrink-0 mt-0.5" />
              <span>{t('footer.quality_1')}</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#71face] shrink-0 mt-0.5" />
              <span>{t('footer.quality_2')}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('prazos-entrega')}
              className="flex items-start gap-2 text-xs text-slate-400 hover:text-[#71face] text-left transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4 text-[#71face] shrink-0 mt-0.5" />
              <span>{t('footer.quality_4')}</span>
            </button>
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <Lock className="w-4 h-4 text-[#71face] shrink-0 mt-0.5" />
              <span>{t('footer.support_hours')}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p className="text-center sm:text-left">
            &copy; 2026 {settings.storeName}. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
            <span>STRIPE</span>
            <span>•</span>
            <span>MULTIBANCO / MBWAY / PIX</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
