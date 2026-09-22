import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Building2,
  Store,
  ShieldCheck,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Users,
  LogIn,
  Layers,
  Database,
  Globe,
  AlertCircle,
  TrendingUp,
  Package,
  ShoppingBag,
  Share2,
} from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

export const SaaSTenantsManager: React.FC = () => {
  const {
    currentTenant,
    activeTenantId,
    allTenants,
    isTenantAdmin,
    isSuperAdmin,
    switchTenant,
    openAuthModal,
    settings,
    updateSettings,
    orders,
    products,
    formatPrice,
    showToast,
    setActiveTab,
  } = useStore();

  const [copiedLink, setCopiedLink] = useState(false);
  const [storeNameInput, setStoreNameInput] = useState(settings.storeName);
  const [storeSubtitleInput, setStoreSubtitleInput] = useState(settings.storeSubtitle);
  const [storeWhatsappInput, setStoreWhatsappInput] = useState(settings.whatsappNumber);
  const [storeLogoInput, setStoreLogoInput] = useState(settings.logoUrl || '');

  React.useEffect(() => {
    setStoreNameInput(settings.storeName);
    setStoreSubtitleInput(settings.storeSubtitle);
    setStoreWhatsappInput(settings.whatsappNumber);
    setStoreLogoInput(settings.logoUrl || '');
  }, [settings.storeName, settings.storeSubtitle, settings.whatsappNumber, settings.logoUrl]);

  // Compute public store URL
  const publicStoreUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?store=${currentTenant.tenantId}`
      : `https://metaslim-pro.shop/?store=${currentTenant.tenantId}`;

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(publicStoreUrl);
      setCopiedLink(true);
      showToast('Link da sua loja pública copiado com sucesso!');
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      showToast(publicStoreUrl);
    }
  };

  const handleSaveStoreInfo = () => {
    updateSettings({
      storeName: storeNameInput,
      storeSubtitle: storeSubtitleInput,
      whatsappNumber: storeWhatsappInput,
      logoUrl: storeLogoInput,
    });
    showToast('Identidade visual e logo da sua loja salvas com sucesso!');
  };

  return (
    <div className="flex flex-col gap-6" id="saas-tenants-manager">
      {/* SaaS Architecture & Isolation Banner */}
      <div className="bg-gradient-to-r from-[#002117] via-[#00382b] to-[#00513e] rounded-2xl p-6 text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-[#71face]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest bg-emerald-400/20 text-[#93f5d4] px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  ARQUITETURA SAAS MULTI-TENANT ISOLADA
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/15 text-white">
                  Plano: {currentTenant.plan.toUpperCase()}
                </span>
                {currentTenant.status === 'pending' ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                    <AlertCircle className="w-3 h-3 text-slate-950" />
                    AGUARDANDO AUTORIZAÇÃO DO SUPER ADMIN
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-400/30 text-[#93f5d4] border border-emerald-400/40 flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#93f5d4]" />
                    LOJA AUTORIZADA &amp; ATIVA
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1.5 text-white">
                Loja Ativa: {currentTenant.storeName}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl leading-relaxed">
                Cada cliente possui seu próprio login, senha, catálogo de peptídeos, pedidos e métricas de vendas totalmente isolados. Nenhum lojista tem acesso aos dados ou faturamento de outros lojistas.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('super-admin')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer ring-2 ring-amber-300"
              title="Acessar painel do Super Admin para autorizar ou suspender lojas"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>Painel Super Admin (Lojas)</span>
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2.5 rounded-xl bg-white text-[#006750] hover:bg-emerald-50 text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar com Outro Login</span>
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 text-xs font-bold transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#71face]" />
              <span>Criar Nova Loja SaaS</span>
            </button>
          </div>
        </div>

        {/* Security Invariants Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-100">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#71face] shrink-0" />
            <span>
              <strong>Banco Particionado:</strong> <code className="font-mono text-[10px] bg-black/30 px-1 py-0.5 rounded">/tenants/{activeTenantId}/</code>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#71face] shrink-0" />
            <span>
              <strong>Regras Firestore:</strong> Bloqueio estrito de leitura cruzada
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#71face] shrink-0" />
            <span>
              <strong>Acesso Público:</strong> Exclusivo via parâmetro <code className="font-mono text-[10px] bg-black/30 px-1 py-0.5 rounded">?store={activeTenantId}</code>
            </span>
          </div>
        </div>
      </div>

      {/* Public Store Link Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#006750]" />
              <span>Link Exclusivo da Sua Loja para Clientes</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Envie este link para seus clientes. Eles verão apenas a sua identidade visual, seu catálogo e seus preços.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006750] border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
            <button
              onClick={() => setActiveTab('inicio')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver como Cliente</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 font-mono text-xs text-slate-700 break-all select-all flex items-center justify-between gap-2">
          <span>{publicStoreUrl}</span>
          <span className="shrink-0 text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold">
            GET ?store
          </span>
        </div>
      </div>

      {/* Multi-Tenant Switcher (Proof of Data Isolation) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#006750]" />
              <span>Alternar Entre Contas SaaS (Demonstração de Isolamento)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Clique em qualquer uma das lojas cadastradas para verificar como cada lojista visualiza apenas os seus próprios pedidos, faturamento e catálogo.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {allTenants.length} Lojas Cadastradas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {allTenants.map((t) => {
            const isSelected = t.tenantId === activeTenantId;
            return (
              <div
                key={t.tenantId}
                onClick={() => {
                  if (!isSelected) switchTenant(t.tenantId);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-[#006750] bg-emerald-50/50 shadow-sm ring-2 ring-[#006750]/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                      ID: {t.tenantId.replace('tenant-', '')}
                    </span>
                    {isSelected ? (
                      <span className="text-[10px] font-bold bg-[#006750] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Loja Ativa</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {t.plan}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-1">
                    {t.storeName}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                    {t.ownerEmail}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium text-[11px]">
                    {isSelected ? 'Painel Carregado' : 'Clique para Carregar'}
                  </span>
                  <span className="text-[#006750] font-bold">
                    {t.currency === 'BRL' ? 'R$' : '€'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Isolated Stats for this Tenant */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#006750] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Faturamento Exclusivo</span>
            <p className="text-lg font-bold font-mono text-slate-900">
              {formatPrice(orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalAmount : 0), 0))}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-[#635BFF] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Pedidos Desta Loja</span>
            <p className="text-lg font-bold font-mono text-slate-900">
              {orders.length} pedidos
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Produtos no Catálogo</span>
            <p className="text-lg font-bold font-mono text-slate-900">
              {products.length} itens ativos
            </p>
          </div>
        </div>
      </div>

      {/* Custom Store Identity Settings for Active Tenant */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-[#006750]" />
            <span>Personalização da Loja "{currentTenant.storeName}"</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Estas alterações refletem imediatamente na loja exibida para os clientes que acessam o seu link.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <ImageUploadField
              label="Logotipo da Sua Loja (Upload de Arquivo)"
              value={storeLogoInput}
              onChange={(newLogo) => setStoreLogoInput(newLogo)}
              helperText="Upload do logotipo personalizado da sua loja (PNG transparente, JPG ou WebP). Seus clientes verão sua logo ao entrar pelo seu link."
              aspectRatio="logo"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome da Loja
            </label>
            <input
              type="text"
              value={storeNameInput}
              onChange={(e) => setStoreNameInput(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subtítulo / Especialidade
            </label>
            <input
              type="text"
              value={storeSubtitleInput}
              onChange={(e) => setStoreSubtitleInput(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp para Suporte aos Seus Clientes
            </label>
            <input
              type="text"
              value={storeWhatsappInput}
              onChange={(e) => setStoreWhatsappInput(e.target.value)}
              placeholder="+351 912 345 678"
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              E-mail do Proprietário da Conta
            </label>
            <input
              type="text"
              value={currentTenant.ownerEmail}
              disabled
              className="w-full h-10 px-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={handleSaveStoreInfo}
            className="px-4 py-2 rounded-xl bg-[#006750] hover:bg-[#0b745c] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Salvar Dados da Loja
          </button>
        </div>
      </div>
    </div>
  );
};
