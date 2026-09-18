import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, BannerSlide, Testimonial, StripeConfig, MyPOSConfig } from '../types';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  ExternalLink,
  Upload,
  Link as LinkIcon,
  RefreshCw,
  Image as ImageIcon,
  Sliders,
  Settings,
  Sparkles,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Cloud,
  Database,
  LogIn,
  LogOut,
  Globe,
  Terminal,
  Copy,
  Check,
  CreditCard,
  ShieldCheck,
  Lock,
  Info,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    products,
    banners,
    testimonials,
    settings,
    updateProduct,
    addProduct,
    deleteProduct,
    updateBanner,
    updateTestimonial,
    addTestimonial,
    deleteTestimonial,
    updateSettings,
    resetDefaults,
    showToast,
    formatPrice,
    firebaseUser,
    localAdminUser,
    isAdminUser,
    isFirebaseConnected,
    isSyncing,
    loginWithGoogle,
    logout,
    quickAdminLogin,
    setAuthErrorModalOpen,
    syncAllToFirebase,
    refreshFromFirebase,
  } = useStore();

  const [activeAdminTab, setActiveAdminTab] = useState<'produtos' | 'banners' | 'depoimentos' | 'configuracoes' | 'mypos' | 'stripe' | 'vercel'>('produtos');
  const [selectedProdId, setSelectedProdId] = useState<string>(products[0]?.id || 'retatrutide-10mg');
  const [expandedBannerId, setExpandedBannerId] = useState<number | null>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProdId) || products[0];

  const currentStripe: StripeConfig = settings.stripe || {
    enabled: true,
    mode: 'live',
    publishableKey: 'pk_live_51MetaslimProCheckoutKey',
    paymentLink: 'https://buy.stripe.com/live_metaslimpro_checkout',
    currency: 'eur',
    successUrl: 'https://meta-slim-pro-loja-omega.vercel.app/?payment=success',
    cancelUrl: 'https://meta-slim-pro-loja-omega.vercel.app/?payment=cancelled',
  };

  const handleStripeChange = (field: keyof StripeConfig, value: any) => {
    const updated = { ...currentStripe, [field]: value };
    updateSettings({ stripe: updated });
  };

  const handleProductFieldChange = (field: keyof Product, value: any) => {
    if (!selectedProduct) return;
    const updated = { ...selectedProduct, [field]: value };
    updateProduct(updated);
  };

  const handleBannerFieldChange = (bannerId: number, field: keyof BannerSlide, value: any) => {
    const banner = banners.find((b) => b.id === bannerId);
    if (!banner) return;
    const updated = { ...banner, [field]: value };
    updateBanner(updated);
  };

  const handleTestimonialFieldChange = (testId: string, field: keyof Testimonial, value: any) => {
    const test = testimonials.find((t) => t.id === testId);
    if (!test) return;
    const updated = { ...test, [field]: value };
    updateTestimonial(updated);
  };

  const handleAddNewProduct = () => {
    addProduct({
      name: 'Novo Peptídeo Liofilizado',
      subtitle: 'MetaSlim Pro Research',
      refCode: 'NX-' + Math.floor(10 + Math.random() * 90),
      category: 'glp1',
      categoryLabel: 'Emagrecimento & GLP-1',
      price: 49.0,
      originalPrice: 80.0,
      purity: '99.5% HPLC Grade',
      whatIsItFor: 'Modulação e suporte de homeostase avançada para otimização de composição corporal.',
      scientificDescription: 'Composto sintético liofilizado de grau laboratorial puro auditado por cromatografia.',
      stock: 100,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCUNGHYf5ysPyg9SVloHweRJLVtK7y5NHDOdgmRp-aIaz3Z8fjdAKwE2dDPcuIMx19hngOImZjWukDeXgDra6_XouFN9a8BTVO-hNK3VOwb3QxYPuka98-qURmbj16A4to2F1mJZyu5_qqcLBTpipCTA6cvQmD_7wCoN1qU7PPvBpSeKTcX_I1gpIIoff8NZhFOPZReAbmYzwa5c_1HhnMoZyp69ZmChlEq7iQdllvtjFQ1Tr_Tnoz0vnmHx4_mxB7E5O4',
      batchNumber: 'NX-2026',
      casNumber: '000000-00-0',
      molecularWeight: '~3500 g/mol',
      formula: 'C₁₅₀H₂₄₀N₄₀O₅₀',
      paymentLink: settings.defaultPaymentLink,
      featured: false,
    });
  };

  const handleAddNewTestimonial = () => {
    addTestimonial({
      name: 'Novo Cliente',
      age: 38,
      protocol: 'Retatrutide 10mg',
      duration: '3 meses',
      weightLost: '-11 kg em 3 meses',
      beforeImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB-z2wh0AE-og2pfAHEH8ksl1CkOcNquRAj0kU-bLTJzD5MK6eu1REwqHW_N3LsVJSEpC0EdM9dHZC_Jrnx_pPGQ7neD2X4MwGTbEMmnkGsS0q40GPJilJVOWWLVkhuAfnlPX4dc5e2LmuxhGQdOdxcE_ewhB3eoioX6OtUJ0qCPDFyEmqhQ-RGycXsw-LUUl0xrQUXB3JnRobXFNDHHm7EE4cOt6a1wCgtffUuonU9iAo10M6RFMKPug',
      afterImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDRohMfc9viX62JBIjjxKdJrTcGVlIeaxCTCayfBkzwVMXP2I-frnOWhwongwAhSz9lt1d2LbVHdsKnURZkRotEznw4AIyYyqNRrd33rZ8XvZf7RCLT59BSvI11M-kSUB4AFp5yJTHfF_W-gf55Q48O-hiRG8SFW3MLfSfe2MAFkOsNWW3EyRqIh1JVoVmk9rGg_5i2dkYrwSX2PxBI7IqX4inUnpNHSO4NNNhw8hAcYg1cThaLbw1A_g',
      quote: 'Excelente experiência com os protocolos e suporte contínuo da MetaSlim Pro.',
      verified: true,
    });
  };

  const triggerGlobalSave = async () => {
    setIsSaving(true);
    try {
      // Direct call to syncAllToFirebase which handles local storage & batch cloud write
      await Promise.race([
        syncAllToFirebase(),
        new Promise((resolve) => setTimeout(resolve, 8500)),
      ]);
    } catch (e) {
      console.warn('Save notice:', e);
      showToast('Alterações salvas localmente no seu dispositivo!');
    } finally {
      setIsSaving(false);
    }
  };

  const testGatewayUrl = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      showToast('Por favor insira um link iniciando com https://');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-20" id="admin-panel">
      {/* Admin Context Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
              Painel Administrativo da Loja
            </span>
            <span className="text-sm font-bold text-slate-800">
              {settings.storeName} • Gestão Total em Tempo Real
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetDefaults}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Restaurar dados iniciais de demonstração"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>
          <span className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">
            v2.5.0-cloud
          </span>
        </div>
      </div>

      {/* Cloud & Firebase Sync Card */}
      <div className="bg-gradient-to-r from-[#006750]/5 via-emerald-50/50 to-white rounded-2xl p-4 sm:p-5 border border-emerald-200/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006750] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Cloud className="w-5 h-5 text-[#93f5d4]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Firebase Firestore Nuvem
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-[#006750] font-bold">
                {isFirebaseConnected ? 'Conectado • europe-west2' : 'Conectando...'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Projeto: <span className="font-semibold text-slate-700">gen-lang-client-0356673859</span>
              {(firebaseUser || localAdminUser) && (
                <span className="ml-2 text-emerald-700 font-sans font-medium">
                  • Autenticado: <strong>{firebaseUser?.email || localAdminUser?.email}</strong> {isAdminUser && '(Super Admin)'}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {(firebaseUser || localAdminUser) ? (
            <button
              onClick={() => logout()}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Desconectar</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => loginWithGoogle()}
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-[#006750] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                title="Entrar com conta Google do Firebase"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login com Google</span>
              </button>

              <button
                onClick={() => setAuthErrorModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Ver diagnóstico e autorizar domínio no Firebase"
              >
                <span>Ajuda / Diagnóstico</span>
              </button>

              <button
                onClick={() => quickAdminLogin()}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                title="Acesso de emergência direto para o Super Admin"
              >
                <span>1-Clique Admin</span>
              </button>
            </div>
          )}

          <button
            onClick={() => refreshFromFirebase()}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Recarregar dados do banco de dados na nuvem"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Puxar da Nuvem</span>
          </button>

          <button
            onClick={() => syncAllToFirebase()}
            disabled={isSyncing}
            className="px-3.5 py-1.5 rounded-xl bg-[#006750] hover:bg-[#0d8267] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Sincronizar todo o catálogo com o Firestore"
          >
            <Database className="w-3.5 h-3.5 text-[#93f5d4]" />
            <span>{isSyncing ? 'Sincronizando...' : 'Enviar para Nuvem'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Vendas Hoje</span>
            <DollarSign className="w-4 h-4 text-[#006750]" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 mt-2">
            € 3.840
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4%</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pedidos Pendentes</span>
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 mt-2">14</div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">
            Despacho em 2h
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Produtos Ativos</span>
            <Package className="w-4 h-4 text-[#006750]" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 mt-2">
            {products.length} Viais
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            100% em estoque
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Faturamento Mês</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 mt-2">
            € 68.250
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+29.1% MoM</span>
          </div>
        </div>
      </section>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveAdminTab('produtos')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeAdminTab === 'produtos'
              ? 'bg-[#006750] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
          }`}
        >
          Editar Produtos ({products.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('banners')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeAdminTab === 'banners'
              ? 'bg-[#006750] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
          }`}
        >
          Banners Rotativos ({banners.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('depoimentos')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeAdminTab === 'depoimentos'
              ? 'bg-[#006750] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
          }`}
        >
          Antes &amp; Depois ({testimonials.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('configuracoes')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeAdminTab === 'configuracoes'
              ? 'bg-[#006750] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
          }`}
        >
          Configurações Gerais
        </button>
        <button
          onClick={() => setActiveAdminTab('mypos')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeAdminTab === 'mypos'
              ? 'bg-[#006750] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-[#71face]" />
          <span>Gateway myPOS</span>
          <span className="bg-emerald-100 text-[#006750] text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
            OFICIAL UE
          </span>
        </button>
        <button
          onClick={() => setActiveAdminTab('stripe')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeAdminTab === 'stripe'
              ? 'bg-[#635BFF] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-[#635BFF]" />
          <span>Gateway Stripe</span>
          <span className="bg-indigo-100 text-[#635BFF] text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
            GLOBAL
          </span>
        </button>
        <button
          onClick={() => setActiveAdminTab('vercel')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeAdminTab === 'vercel'
              ? 'bg-[#131b2e] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-[#71face]" />
          <span>Deploy na Vercel</span>
        </button>
      </div>

      {/* TAB 1: Product Editor */}
      {activeAdminTab === 'produtos' && selectedProduct && (
        <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/70 flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Editor de Produto &amp; Link de Pagamento
              </h2>
              <p className="text-xs text-slate-500">
                Altere nome, frascos, valores, descrições e o link de gateway específico deste produto.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedProdId}
                onChange={(e) => setSelectedProdId(e.target.value)}
                className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006750]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.refCode})
                  </option>
                ))}
              </select>

              <button
                onClick={handleAddNewProduct}
                className="h-9 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006750] text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo</span>
              </button>
            </div>
          </div>

          {/* Product Image URL & Preview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-28 h-32 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-xs">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 w-full flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">URL da Imagem do Frasco</label>
              <input
                type="text"
                value={selectedProduct.image}
                onChange={(e) => handleProductFieldChange('image', e.target.value)}
                placeholder="https://..."
                className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006750]"
              />
              <span className="text-[11px] text-slate-500">
                Pode usar imagens de laboratório com frasco com tampa verde e caixa clínica MetaSlim Pro.
              </span>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Nome do Produto</label>
              <input
                type="text"
                value={selectedProduct.name}
                onChange={(e) => handleProductFieldChange('name', e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
              />
            </div>

            {/* Subtítulo */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Subtítulo / Apresentação</label>
              <input
                type="text"
                value={selectedProduct.subtitle}
                onChange={(e) => handleProductFieldChange('subtitle', e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
              />
            </div>

            {/* REF */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Código REF</label>
              <input
                type="text"
                value={selectedProduct.refCode}
                onChange={(e) => handleProductFieldChange('refCode', e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
              />
            </div>

            {/* Pureza */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Pureza HPLC</label>
              <input
                type="text"
                value={selectedProduct.purity}
                onChange={(e) => handleProductFieldChange('purity', e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
              />
            </div>

            {/* Preço Normal */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Preço Normal (€)</label>
              <input
                type="number"
                step="0.01"
                value={selectedProduct.originalPrice}
                onChange={(e) => handleProductFieldChange('originalPrice', parseFloat(e.target.value) || 0)}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
              />
            </div>

            {/* Preço Promocional */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-emerald-800">Preço Promocional (€)</label>
              <input
                type="number"
                step="0.01"
                value={selectedProduct.price}
                onChange={(e) => handleProductFieldChange('price', parseFloat(e.target.value) || 0)}
                className="h-10 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-[#006750] focus:outline-none focus:ring-1 focus:ring-[#006750]"
              />
            </div>
          </div>

          {/* Para Que Serve */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700">
              Para Que Serve (Resumo no Card e Carrinho)
            </label>
            <textarea
              rows={2}
              value={selectedProduct.whatIsItFor}
              onChange={(e) => handleProductFieldChange('whatIsItFor', e.target.value)}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006750]"
            />
          </div>

          {/* Descrição Científica Detalhada */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700">
              Descrição Científica Detalhada (Página de Detalhes)
            </label>
            <textarea
              rows={3}
              value={selectedProduct.scientificDescription || ''}
              onChange={(e) => handleProductFieldChange('scientificDescription', e.target.value)}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006750]"
            />
          </div>

          {/* Link Direto de Pagamento (Gateway URL) */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#006750]" />
                <span className="text-xs font-bold text-slate-900">
                  Link Direto de Pagamento (Gateway URL)
                </span>
              </div>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded text-emerald-800 border border-emerald-200 font-bold">
                Stripe / Mercado Pago / Hotmart / PIX
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={selectedProduct.paymentLink}
                onChange={(e) => handleProductFieldChange('paymentLink', e.target.value)}
                placeholder="https://buy.stripe.com/..."
                className="flex-1 h-10 px-3 rounded-xl bg-white border border-emerald-300 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006750]"
              />
              <button
                type="button"
                onClick={() => testGatewayUrl(selectedProduct.paymentLink)}
                className="h-10 px-4 rounded-xl bg-[#006750] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#0d8267] active:scale-95 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Testar</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-500">
              O botão de pagamento na página deste produto e no carrinho abrirá diretamente este link seguro.
            </span>
          </div>

          {/* Extra Chemical Fields & Stock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600">Estoque (Viais)</label>
              <input
                type="number"
                value={selectedProduct.stock}
                onChange={(e) => handleProductFieldChange('stock', parseInt(e.target.value) || 0)}
                className="h-9 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600">CAS Number</label>
              <input
                type="text"
                value={selectedProduct.casNumber || ''}
                onChange={(e) => handleProductFieldChange('casNumber', e.target.value)}
                className="h-9 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600">Massa Molecular</label>
              <input
                type="text"
                value={selectedProduct.molecularWeight || ''}
                onChange={(e) => handleProductFieldChange('molecularWeight', e.target.value)}
                className="h-9 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600">Fórmula Química</label>
              <input
                type="text"
                value={selectedProduct.formula || ''}
                onChange={(e) => handleProductFieldChange('formula', e.target.value)}
                className="h-9 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800"
              />
            </div>
          </div>

          {/* Delete Action if more than 1 product */}
          {products.length > 1 && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir "${selectedProduct.name}"?`)) {
                    deleteProduct(selectedProduct.id);
                    setSelectedProdId(products.find((p) => p.id !== selectedProduct.id)?.id || '');
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir este Produto</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: Rotating Banners Manager (5 Slides) */}
      {activeAdminTab === 'banners' && (
        <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/70 flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Gerenciador dos 5 Banners Rotativos da Home
            </h2>
            <p className="text-xs text-slate-500">
              Personalize imagens, títulos, chamadas promocionais e destinos dos 5 slides da página inicial.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {banners.map((slide, idx) => {
              const isExpanded = expandedBannerId === slide.id;
              return (
                <div
                  key={slide.id}
                  className="rounded-xl border border-slate-200/80 bg-slate-50 overflow-hidden transition-all"
                >
                  {/* Banner header row */}
                  <div
                    onClick={() => setExpandedBannerId(isExpanded ? null : slide.id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#006750] text-[#93f5d4] font-mono text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-12 h-8 rounded object-cover border border-slate-200"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-xs sm:text-sm text-slate-800">
                            {slide.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Tag: {slide.tag} • CTA: {slide.ctaText}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button className="text-slate-400 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expanded Form for this slide */}
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-bold text-slate-600">Título do Slide</label>
                          <input
                            type="text"
                            value={slide.title}
                            onChange={(e) => handleBannerFieldChange(slide.id, 'title', e.target.value)}
                            className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-bold text-slate-600">Tag Superior (Pill)</label>
                          <input
                            type="text"
                            value={slide.tag}
                            onChange={(e) => handleBannerFieldChange(slide.id, 'tag', e.target.value)}
                            className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">Subtítulo / Descrição</label>
                        <input
                          type="text"
                          value={slide.subtitle}
                          onChange={(e) => handleBannerFieldChange(slide.id, 'subtitle', e.target.value)}
                          className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-bold text-slate-600">Texto do Botão CTA</label>
                          <input
                            type="text"
                            value={slide.ctaText}
                            onChange={(e) => handleBannerFieldChange(slide.id, 'ctaText', e.target.value)}
                            className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-bold text-slate-600">Badge de Confiança</label>
                          <input
                            type="text"
                            value={slide.badgeText}
                            onChange={(e) => handleBannerFieldChange(slide.id, 'badgeText', e.target.value)}
                            className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">URL da Imagem do Banner</label>
                        <input
                          type="text"
                          value={slide.image}
                          onChange={(e) => handleBannerFieldChange(slide.id, 'image', e.target.value)}
                          className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 3: Before & After Testimonials Manager */}
      {activeAdminTab === 'depoimentos' && (
        <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/70 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Depoimentos Clínicos e Antes &amp; Depois
              </h2>
              <p className="text-xs text-slate-500">
                Adicione histórias reais com fotos de antes e depois e perda de peso validada.
              </p>
            </div>
            <button
              onClick={handleAddNewTestimonial}
              className="h-9 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006750] text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Caso</span>
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {testimonials.map((test) => (
              <div
                key={test.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#006750] text-white font-bold flex items-center justify-center text-xs">
                      {test.name.slice(0, 2).toUpperCase()}
                    </span>
                    <input
                      type="text"
                      value={test.name}
                      onChange={(e) => handleTestimonialFieldChange(test.id, 'name', e.target.value)}
                      placeholder="Nome do Cliente"
                      className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={test.weightLost}
                      onChange={(e) => handleTestimonialFieldChange(test.id, 'weightLost', e.target.value)}
                      placeholder="-12 kg"
                      className="h-8 px-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-[#006750] text-right"
                    />
                    {testimonials.length > 1 && (
                      <button
                        onClick={() => deleteTestimonial(test.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      URL Foto Antes
                    </label>
                    <input
                      type="text"
                      value={test.beforeImage}
                      onChange={(e) => handleTestimonialFieldChange(test.id, 'beforeImage', e.target.value)}
                      className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      URL Foto Depois
                    </label>
                    <input
                      type="text"
                      value={test.afterImage}
                      onChange={(e) => handleTestimonialFieldChange(test.id, 'afterImage', e.target.value)}
                      className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Depoimento / Experiência
                  </label>
                  <textarea
                    rows={2}
                    value={test.quote}
                    onChange={(e) => handleTestimonialFieldChange(test.id, 'quote', e.target.value)}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: General Store Settings */}
      {activeAdminTab === 'configuracoes' && (
        <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/70 flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Configurações Gerais da Loja</h2>
            <p className="text-xs text-slate-500">
              Personalize o nome da marca, WhatsApp de suporte farmacêutico, link de pagamento global e taxas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Nome da Loja</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => updateSettings({ storeName: e.target.value })}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Slogan / Subtítulo</label>
              <input
                type="text"
                value={settings.storeSubtitle}
                onChange={(e) => updateSettings({ storeSubtitle: e.target.value })}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Número WhatsApp para Suporte</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => updateSettings({ whatsappNumber: e.target.value })}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Taxa Câmbio EUR &rarr; BRL</label>
              <input
                type="number"
                step="0.1"
                value={settings.currencyRateEurToBrl}
                onChange={(e) => updateSettings({ currencyRateEurToBrl: parseFloat(e.target.value) || 6.0 })}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700">
              Link de Pagamento Padrão da Loja (Checkout Global)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={settings.defaultPaymentLink}
                onChange={(e) => updateSettings({ defaultPaymentLink: e.target.value })}
                className="flex-1 h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900"
              />
              <button
                type="button"
                onClick={() => testGatewayUrl(settings.defaultPaymentLink)}
                className="h-10 px-4 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Testar</span>
              </button>
            </div>
          </div>

          {/* Quick myPOS Status Banner in Settings */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#006750] text-white flex items-center justify-center font-bold text-xs">
                myPOS
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  myPOS Online Checkout ({settings.mypos?.enabled !== false ? 'Ativado' : 'Desativado'})
                </h4>
                <p className="text-[11px] text-slate-500">
                  {settings.mypos?.mode === 'sandbox' ? 'Ambiente Sandbox (Testes)' : 'Ambiente Produção (Live)'} • SID: {settings.mypos?.sid || '000000000000001'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveAdminTab('mypos')}
              className="px-3 py-1.5 rounded-lg bg-[#006750] text-white text-xs font-bold hover:bg-[#0d8267] transition-all"
            >
              Configurar myPOS
            </button>
          </div>
        </section>
      )}

      {/* TAB: myPOS Checkout Gateway Management */}
      {activeAdminTab === 'mypos' && (
        <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/70 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#006750] text-white flex items-center justify-center font-black text-xs shadow-xs">
                  myPOS
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Integração myPOS Online Checkout
                </h2>
                <span className="text-[10px] bg-emerald-100 text-[#006750] font-mono px-2 py-0.5 rounded-full font-bold">
                  @developermypos SDK v1.4
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Aceite pagamentos com cartões de crédito e débito internacionais (Visa, Mastercard, Maestro, AMEX), Apple Pay, Google Pay e Multibanco com licença bancária EMI europeia.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Status do Gateway:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.mypos?.enabled !== false}
                  onChange={(e) =>
                    updateSettings({
                      mypos: {
                        ...(settings.mypos || {
                          enabled: true,
                          mode: 'production',
                          sid: '000000000000001',
                          walletNumber: '61938166666',
                          keyIndex: 1,
                          payLink: 'https://pay.mypos.com/metaslimpro',
                        }),
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006750]"></div>
              </label>
            </div>
          </div>

          {/* Credentials Form */}
          <div className="flex flex-col gap-4">
            {/* Integration Method Selector */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                Método de Integração com a myPOS
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                <label
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    (settings.mypos?.integrationType || 'paylink') === 'paylink'
                      ? 'bg-white border-[#006750] shadow-sm ring-1 ring-[#006750]'
                      : 'bg-slate-100/60 border-slate-200 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="mypos_integration_type"
                    value="paylink"
                    checked={(settings.mypos?.integrationType || 'paylink') === 'paylink'}
                    onChange={() =>
                      updateSettings({
                        mypos: {
                          ...(settings.mypos || {
                            enabled: true,
                            mode: 'production',
                            sid: '',
                            walletNumber: '',
                            keyIndex: 1,
                            payLink: '',
                          }),
                          integrationType: 'paylink',
                        },
                      })
                    }
                    className="mt-0.5 text-[#006750] focus:ring-[#006750]"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      myPOS PayLink Oficial
                      <span className="text-[9px] bg-emerald-100 text-[#006750] px-1.5 py-0.2 rounded font-bold">Recomendado</span>
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Zero erros técnicos. Não precisa de chaves RSA. O cliente paga diretamente no checkout oficial da myPOS com Cartão, Apple Pay e Multibanco.
                    </span>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    settings.mypos?.integrationType === 'hosted_checkout'
                      ? 'bg-white border-[#006750] shadow-sm ring-1 ring-[#006750]'
                      : 'bg-slate-100/60 border-slate-200 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="mypos_integration_type"
                    value="hosted_checkout"
                    checked={settings.mypos?.integrationType === 'hosted_checkout'}
                    onChange={() =>
                      updateSettings({
                        mypos: {
                          ...(settings.mypos || {
                            enabled: true,
                            mode: 'production',
                            sid: '',
                            walletNumber: '',
                            keyIndex: 1,
                            payLink: '',
                          }),
                          integrationType: 'hosted_checkout',
                        },
                      })
                    }
                    className="mt-0.5 text-[#006750] focus:ring-[#006750]"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">
                      API Hosted Checkout (vmp/checkout)
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Requer Store ID numérico válido e Certificado de Assinatura RSA SHA-256 no myPOS.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Direct PayLink Input (Prominent) */}
            <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Link Direto myPOS PayLink da sua loja
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  (Criado em mypos.com &rarr; Lojas online &rarr; PayLinks)
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://pay.mypos.com/seunome"
                  value={settings.mypos?.payLink || ''}
                  onChange={(e) =>
                    updateSettings({
                      mypos: {
                        ...(settings.mypos || {
                          enabled: true,
                          mode: 'production',
                          sid: '',
                          walletNumber: '',
                          keyIndex: 1,
                          payLink: '',
                        }),
                        payLink: e.target.value,
                      },
                    })
                  }
                  className="flex-1 h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006750]"
                />
                <button
                  type="button"
                  onClick={() => testGatewayUrl(settings.mypos?.payLink || 'https://pay.mypos.com/')}
                  className="h-11 px-4 rounded-xl bg-[#006750] text-white text-xs font-semibold hover:bg-[#005240] flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Testar Link</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Insira o link de pagamento público da sua loja myPOS (ex: <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded text-[10px] font-mono">https://pay.mypos.com/...</code>). O cliente é redirecionado para a página oficial do myPOS sem qualquer erro de assinatura ou código 3!
              </p>
            </div>

            {/* API Parameters (Optional for Hosted Checkout) */}
            <div className={`flex flex-col gap-3 transition-opacity ${
              settings.mypos?.integrationType === 'hosted_checkout' ? 'opacity-100' : 'opacity-80'
            }`}>
              <h3 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                <span>Parâmetros Técnicos myPOS (Opcional se usar PayLink)</span>
                {settings.mypos?.integrationType !== 'hosted_checkout' && (
                  <span className="text-[10px] text-emerald-700 font-sans font-medium">Usando modo PayLink</span>
                )}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Ambiente de Execução</label>
                  <select
                    value={settings.mypos?.mode || 'production'}
                    onChange={(e) =>
                      updateSettings({
                        mypos: {
                          ...(settings.mypos || {
                            enabled: true,
                            mode: 'production',
                            sid: '',
                            walletNumber: '',
                            keyIndex: 1,
                            payLink: '',
                          }),
                          mode: e.target.value as 'production' | 'sandbox',
                        },
                      })
                    }
                    className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                  >
                    <option value="production">Produção (Live / Oficial)</option>
                    <option value="sandbox">Sandbox (Testes myPOS)</option>
                  </select>
                  <span className="text-[10px] text-slate-400">
                    {settings.mypos?.mode === 'sandbox' ? 'Endpoint: checkout-test' : 'Endpoint: checkout (Live)'}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Store ID (SID)</label>
                  <input
                    type="text"
                    placeholder="ex: 000000000000001"
                    value={settings.mypos?.sid || ''}
                    onChange={(e) =>
                      updateSettings({
                        mypos: {
                          ...(settings.mypos || {
                            enabled: true,
                            mode: 'production',
                            sid: '',
                            walletNumber: '',
                            keyIndex: 1,
                            payLink: '',
                          }),
                          sid: e.target.value,
                        },
                      })
                    }
                    className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                  />
                  <span className="text-[10px] text-slate-400">ID numérico da loja</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Client / Wallet Number</label>
                  <input
                    type="text"
                    placeholder="ex: 61938166666"
                    value={settings.mypos?.walletNumber || ''}
                    onChange={(e) =>
                      updateSettings({
                        mypos: {
                          ...(settings.mypos || {
                            enabled: true,
                            mode: 'production',
                            sid: '',
                            walletNumber: '',
                            keyIndex: 1,
                            payLink: '',
                          }),
                          walletNumber: e.target.value,
                        },
                      })
                    }
                    className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                  />
                  <span className="text-[10px] text-slate-400">Número da carteira comerciante</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Key Index</label>
                  <input
                    type="number"
                    value={settings.mypos?.keyIndex || 1}
                    onChange={(e) =>
                      updateSettings({
                        mypos: {
                          ...(settings.mypos || {
                            enabled: true,
                            mode: 'production',
                            sid: '',
                            walletNumber: '',
                            keyIndex: 1,
                            payLink: '',
                          }),
                          keyIndex: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                    className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                  />
                  <span className="text-[10px] text-slate-400">Índice do par de chaves (1)</span>
                </div>
              </div>
            </div>

            {/* Informative Tip */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                !
              </div>
              <div className="text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900">Por que o myPOS exibe "Error Code: 3"?</strong>
                <p className="mt-1 text-slate-600">
                  O <strong>Error Code: 3 (E_IPC_ERROR)</strong> da myPOS ocorre quando o envio direto de dados para a API (<em>vmp/checkout</em>) não contém a assinatura digital RSA (<em>Signature</em> com chave privada) ou quando o SID numérico não confere com a assinatura.
                </p>
                <p className="mt-1.5 text-slate-700 font-medium">
                  <strong>Solução mais rápida:</strong> Use a opção <strong>myPOS PayLink</strong> acima! Crie um link em <span className="font-mono text-[11px] bg-amber-100 px-1 py-0.5 rounded">mypos.com &gt; Lojas Online &gt; PayLinks</span> e cole aqui. Funciona imediatamente sem exigir chaves RSA!
                </p>
              </div>
            </div>
          </div>

          {/* Technical Specs & Official Repositories Reference */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#006750]" />
                <h4 className="text-xs font-bold text-slate-900">
                  Especificações Técnicas @developermypos
                </h4>
              </div>
              <a
                href="https://github.com/developermypos"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#006750] font-bold hover:underline flex items-center gap-1"
              >
                <span>github.com/developermypos</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200/60 flex flex-col gap-1">
                <span className="font-bold text-slate-800 font-mono text-[11px]">mypos-js (NodeJS SDK)</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Implementa os métodos <code>IPCPurchase</code>, <code>IPCGetPaymentStatus</code> e webhook verification para liquidação direta.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/60 flex flex-col gap-1">
                <span className="font-bold text-slate-800 font-mono text-[11px]">myPOS-Checkout-SDK-PHP</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Suporta payload assinado v1.4 com detalhamento de carrinho (<code>Article_N</code>, <code>Price_N</code>, <code>Quantity_N</code>).
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/60 flex flex-col gap-1">
                <span className="font-bold text-slate-800 font-mono text-[11px]">3D Secure 2.0 &amp; PCI-DSS</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Os dados do titular do cartão não tocam o servidor do cliente; o processamento ocorre inteiramente em ambiente com licença bancária da myPOS.
                </p>
              </div>
            </div>

            {/* Endpoints Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono font-bold">
                    <th className="py-2">Parâmetro</th>
                    <th className="py-2">Valor Configurado</th>
                    <th className="py-2">Descrição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-mono">
                  <tr>
                    <td className="py-1.5 text-slate-900 font-bold">IPCmethod</td>
                    <td className="py-1.5 text-[#006750]">IPCPurchase</td>
                    <td className="py-1.5 text-slate-500 font-sans">Iniciação de compra e faturamento</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-900 font-bold">IPCVersion</td>
                    <td className="py-1.5 text-[#006750]">1.4</td>
                    <td className="py-1.5 text-slate-500 font-sans">Versão estável da API Checkout</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-900 font-bold">Endpoint Live</td>
                    <td className="py-1.5 text-slate-700">https://www.mypos.com/vmp/checkout</td>
                    <td className="py-1.5 text-slate-500 font-sans">Servidor oficial de produção myPOS (Virtual POS)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-900 font-bold">Endpoint Sandbox</td>
                    <td className="py-1.5 text-slate-700">https://www.mypos.com/vmp/checkout-test</td>
                    <td className="py-1.5 text-slate-500 font-sans">Ambiente para testes sem cobrança real</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 6: Stripe Gateway Configuration */}
      {activeAdminTab === 'stripe' && (
        <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/70 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#635BFF] flex items-center justify-center text-white font-black text-xs">
                  S
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Configurações do Gateway Stripe
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Integração oficial com a Stripe para aceitar cartões globais, Apple Pay, Google Pay e Links de Pagamento.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  currentStripe.enabled
                    ? 'bg-indigo-100 text-[#635BFF]'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{currentStripe.enabled ? 'Stripe Habilitado' : 'Stripe Desativado'}</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                Modo: {currentStripe.mode.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Enable Toggle */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between col-span-1 md:col-span-2">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Ativar Stripe no Checkout</span>
                <span className="text-[11px] text-slate-500">
                  Exibe o Stripe Checkout como opção de pagamento prioritária para os clientes.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentStripe.enabled}
                  onChange={(e) => handleStripeChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#635BFF]"></div>
              </label>
            </div>

            {/* Mode: Live vs Test */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Ambiente de Execução (Modo)</span>
                <span className="text-[10px] text-slate-400 font-mono">mode</span>
              </label>
              <select
                value={currentStripe.mode}
                onChange={(e) => handleStripeChange('mode', e.target.value as 'live' | 'test')}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-[#635BFF] focus:outline-none"
              >
                <option value="live">Produção Real (Live - Cobrança Real)</option>
                <option value="test">Ambiente de Testes (Test / Sandbox)</option>
              </select>
              <span className="text-[10px] text-slate-500">
                Alterne para <strong>Produção Real</strong> para processar transações financeiras reais de clientes.
              </span>
            </div>

            {/* Currency */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Moeda de Faturamento Principal</span>
                <span className="text-[10px] text-slate-400 font-mono">currency</span>
              </label>
              <select
                value={currentStripe.currency}
                onChange={(e) => handleStripeChange('currency', e.target.value as 'eur' | 'brl' | 'usd')}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-[#635BFF] focus:outline-none"
              >
                <option value="eur">EUR (€) - Euro (União Europeia / Portugal)</option>
                <option value="brl">BRL (R$) - Real Brasileiro (Brasil / PIX)</option>
                <option value="usd">USD ($) - Dólar Americano</option>
              </select>
              <span className="text-[10px] text-slate-500">
                A Stripe converte automaticamente para a moeda do cartão de crédito do comprador.
              </span>
            </div>

            {/* Publishable Key */}
            <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Chave Publicável Stripe (Publishable Key)</span>
                <span className="text-[10px] text-indigo-700 font-mono font-bold">pk_live_... ou pk_test_...</span>
              </label>
              <input
                type="text"
                value={currentStripe.publishableKey}
                onChange={(e) => handleStripeChange('publishableKey', e.target.value.trim())}
                placeholder="Ex: pk_live_51M..."
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-1 focus:ring-[#635BFF] focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">
                Esta chave pública identifica sua conta Stripe com segurança para inicializar os pagamentos.
              </span>
            </div>

            {/* Stripe Payment Link (Buy Link) */}
            <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Link de Pagamento Padrão Stripe (Stripe Payment Link URL)
                </label>
                {currentStripe.paymentLink && (
                  <a
                    href={currentStripe.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#635BFF] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Testar Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={currentStripe.paymentLink}
                onChange={(e) => handleStripeChange('paymentLink', e.target.value.trim())}
                placeholder="https://buy.stripe.com/..."
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-1 focus:ring-[#635BFF] focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">
                Cole aqui o link criado no painel da Stripe (Menu <strong>Payment Links</strong>). O sistema anexa automaticamente o ID do pedido e e-mail do cliente.
              </span>
            </div>

            {/* Success URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>URL de Redirecionamento após Sucesso</span>
                <span className="text-[10px] text-slate-400 font-mono">success_url</span>
              </label>
              <input
                type="text"
                value={currentStripe.successUrl || ''}
                onChange={(e) => handleStripeChange('successUrl', e.target.value.trim())}
                placeholder="https://meta-slim-pro-loja-omega.vercel.app/?payment=success"
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-1 focus:ring-[#635BFF] focus:outline-none"
              />
            </div>

            {/* Cancel URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>URL se o Cliente Cancelar</span>
                <span className="text-[10px] text-slate-400 font-mono">cancel_url</span>
              </label>
              <input
                type="text"
                value={currentStripe.cancelUrl || ''}
                onChange={(e) => handleStripeChange('cancelUrl', e.target.value.trim())}
                placeholder="https://meta-slim-pro-loja-omega.vercel.app/?payment=cancelled"
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-1 focus:ring-[#635BFF] focus:outline-none"
              />
            </div>
          </div>

          {/* Step-by-Step Stripe Guide Card */}
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 flex flex-col gap-3 text-xs text-slate-700">
            <span className="font-bold text-[#635BFF] flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>Passo a Passo: Como Obter suas Informações na Stripe</span>
            </span>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
              <li>
                Acesse o dashboard oficial da Stripe em{' '}
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#635BFF] font-bold underline"
                >
                  dashboard.stripe.com
                </a>{' '}
                com sua conta aprovada.
              </li>
              <li>
                Para a <strong>Chave Publicável</strong>: Vá no menu <strong>Desenvolvedores (Developers) &gt; Chaves de API (API Keys)</strong> e copie o valor de <strong>Publishable key</strong> (<code className="font-mono bg-white px-1 py-0.5 rounded">pk_live_...</code>).
              </li>
              <li>
                Para o <strong>Link de Pagamento (Payment Link)</strong>: No menu lateral, clique em <strong>Payment Links &gt; Criar link de pagamento</strong>. Defina o produto ou valor aberto, ative Apple Pay / Google Pay, e copie a URL gerada (<code className="font-mono bg-white px-1 py-0.5 rounded">https://buy.stripe.com/...</code>).
              </li>
              <li>
                Cole os dados nos campos acima e clique em <strong>Salvar Configurações Stripe</strong>. O carrinho atualizará imediatamente!
              </li>
            </ol>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              As alterações são sincronizadas automaticamente com o Firestore e refletem na loja online.
            </span>
            <button
              type="button"
              onClick={async () => {
                setIsSaving(true);
                try {
                  await syncAllToFirebase();
                  showToast('Configurações Stripe salvas com sucesso no Firebase!');
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5349e4] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-950/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Configurações Stripe'}</span>
            </button>
          </div>
        </section>
      )}

      {/* TAB 5: Vercel & Deployment Guide */}
      {activeAdminTab === 'vercel' && (
        <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/70 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#006750]" />
                <h2 className="text-lg font-bold text-slate-900">
                  Deploy na Vercel &amp; Produção
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Seu projeto já está totalmente configurado com <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-mono">vercel.json</code>, Firestore e autenticação Google.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-[#006750] flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Pronto para Vercel</span>
            </span>
          </div>

          {/* Quick Step by Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col">
              <span className="w-6 h-6 rounded-full bg-[#006750] text-white text-xs font-bold flex items-center justify-center mb-2">
                1
              </span>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Exportar ou Subir no GitHub</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Baixe o ZIP do projeto pelo menu AI Studio ou suba este repositório para o seu GitHub pessoal/empresa.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col">
              <span className="w-6 h-6 rounded-full bg-[#006750] text-white text-xs font-bold flex items-center justify-center mb-2">
                2
              </span>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Importar na Vercel</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Acesse <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-[#006750] underline font-semibold">vercel.com</a>, clique em <strong>Add New Project</strong> e selecione o repositório.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col">
              <span className="w-6 h-6 rounded-full bg-[#006750] text-white text-xs font-bold flex items-center justify-center mb-2">
                3
              </span>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Deploy Automático</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                O arquivo <code className="font-mono bg-white px-1 rounded text-slate-700">vercel.json</code> gerencia todas as rotas SPA e cache. Clique em <strong>Deploy</strong> e sua loja estará online!
              </p>
            </div>
          </div>

          {/* Vercel CLI Instructions */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 flex flex-col gap-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 font-bold">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Opção Rápida via Terminal (Vercel CLI)
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <p className="text-slate-500"># 1. Instalar Vercel CLI globalmente (se não tiver):</p>
              <div className="bg-slate-950 p-2.5 rounded-lg text-emerald-400 select-all">
                npm i -g vercel
              </div>
              <p className="text-slate-500 pt-1"># 2. Publicar diretamente em produção:</p>
              <div className="bg-slate-950 p-2.5 rounded-lg text-emerald-400 select-all">
                vercel --prod
              </div>
            </div>
          </div>

          {/* Environment Variables on Vercel */}
          <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Variáveis de Ambiente na Vercel (Opcional se desejar configurar chaves personalizadas)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Adicione em <em>Settings &gt; Environment Variables</em> no painel da Vercel.
                </p>
              </div>
              <button
                onClick={() => {
                  const envContent = `VITE_FIREBASE_PROJECT_ID=gen-lang-client-0356673859\nVITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0356673859.firebaseapp.com\nVITE_FIREBASE_DATABASE_ID=(default)\nVITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0356673859.firebasestorage.app`;
                  navigator.clipboard.writeText(envContent);
                  setCopiedEnv(true);
                  setTimeout(() => setCopiedEnv(false), 2000);
                  showToast('Variáveis copiadas para a área de transferência!');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEnv ? 'Copiado!' : 'Copiar Variáveis'}</span>
              </button>
            </div>

            <pre className="bg-slate-50 p-3 rounded-lg text-[11px] font-mono text-slate-700 border border-slate-200 overflow-x-auto">
{`VITE_FIREBASE_PROJECT_ID=gen-lang-client-0356673859
VITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0356673859.firebaseapp.com
VITE_FIREBASE_DATABASE_ID=(default)
VITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0356673859.firebasestorage.app`}
            </pre>
          </div>

          {/* Vercel.json verification */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#006750] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">
                Arquivo <code className="bg-white px-1.5 py-0.5 rounded text-emerald-900 font-mono">vercel.json</code> já configurado
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Todas as requisições SPA (roteamento sem recarregamento de página, cabeçalhos de segurança e cache otimizado para Vite) já estão configuradas e prontas para entrega global pela CDN da Vercel.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Floating Save Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-slate-200/80 flex items-center justify-between max-w-4xl mx-auto sm:rounded-t-2xl">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800">Sincronização em Tempo Real</span>
          <span className="text-[11px] text-slate-500">Dados salvos automaticamente em cache local.</span>
        </div>

        <button
          onClick={triggerGlobalSave}
          disabled={isSaving}
          className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#006750] to-[#0d8267] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/20 active:scale-95 transition-all"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#93f5d4]" />
              <span>Publicando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#93f5d4]" />
              <span>Salvar Alterações na Loja</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
