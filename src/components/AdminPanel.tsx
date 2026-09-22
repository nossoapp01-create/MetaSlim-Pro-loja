import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Product,
  BannerSlide,
  Testimonial,
  StripeConfig,
  MyPOSConfig,
  ResaleSettings,
  ResaleCompoundConfig,
  ResalePackConfig,
} from '../types';
import { initialResaleSettings } from '../data/initialData';
import { StripeSalesDashboard } from './StripeSalesDashboard';
import { SaaSTenantsManager } from './SaaSTenantsManager';
import { ImageUploadField } from './ImageUploadField';
import {
  testStripeConnection,
  extractSecretKeyIfPastedInPublishableKey,
} from '../services/stripe';
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
  ChevronRight,
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
  Eye,
  EyeOff,
  Key,
  ShieldAlert,
  MessageCircle,
  Calculator,
  Percent,
  Stethoscope,
  Building2,
  Store,
  Users,
  Share2,
  Layers,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    products,
    banners,
    testimonials,
    settings,
    orders,
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
    syncAllToFirebase,
    refreshFromFirebase,
    setActiveTab,
    currentTenant,
    activeTenantId,
    allTenants,
    isTenantAdmin,
    switchTenant,
    openAuthModal,
  } = useStore();

  const [activeAdminTab, setActiveAdminTab] = useState<
    | 'saas-tenants'
    | 'vendas-stripe'
    | 'produtos'
    | 'banners'
    | 'depoimentos'
    | 'revenda'
    | 'configuracoes'
    | 'mypos'
    | 'stripe'
    | 'vercel'
  >('vendas-stripe');
  const [selectedProdId, setSelectedProdId] = useState<string>(products[0]?.id || 'retatrutide-10mg');
  const [expandedBannerId, setExpandedBannerId] = useState<number | null>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [copiedKeyField, setCopiedKeyField] = useState<string | null>(null);

  // Resale & Wholesale Configuration State & Handlers
  const currentResale: ResaleSettings = settings.resale || initialResaleSettings;
  const resaleCompounds: ResaleCompoundConfig[] =
    currentResale.compounds && currentResale.compounds.length > 0
      ? currentResale.compounds
      : initialResaleSettings.compounds;
  const resalePacks: ResalePackConfig[] =
    currentResale.packs && currentResale.packs.length > 0
      ? currentResale.packs
      : initialResaleSettings.packs;

  const handleUpdateResaleCompound = (
    compoundId: string,
    field: keyof ResaleCompoundConfig,
    value: any
  ) => {
    const updated = resaleCompounds.map((c) =>
      c.id === compoundId ? { ...c, [field]: value } : c
    );
    updateSettings({
      resale: {
        ...currentResale,
        compounds: updated,
      },
    });
  };

  const handleUpdateResalePack = (
    packId: string,
    field: keyof ResalePackConfig,
    value: any
  ) => {
    const updated = resalePacks.map((p) =>
      p.id === packId ? { ...p, [field]: value } : p
    );
    updateSettings({
      resale: {
        ...currentResale,
        packs: updated,
      },
    });
  };

  const handleAddResaleCompound = () => {
    const newId = `compound-${Date.now()}`;
    const newCompound: ResaleCompoundConfig = {
      id: newId,
      name: 'Novo Peptídeo Liofilizado',
      wholesaleCostEur: 20,
      defaultSellPriceEur: 85,
      marketDemand: 'Alta Demanda',
    };
    updateSettings({
      resale: {
        ...currentResale,
        compounds: [...resaleCompounds, newCompound],
      },
    });
    showToast('Novo composto adicionado à tabela de atacado!');
  };

  const handleDeleteResaleCompound = (compoundId: string) => {
    if (resaleCompounds.length <= 1) {
      showToast('É necessário manter pelo menos 1 composto cadastrado.');
      return;
    }
    const updated = resaleCompounds.filter((c) => c.id !== compoundId);
    updateSettings({
      resale: {
        ...currentResale,
        compounds: updated,
      },
    });
    showToast('Composto removido.');
  };

  const handleAddResalePack = () => {
    const newId = `pack-${Date.now()}`;
    const newPack: ResalePackConfig = {
      id: newId,
      name: 'Pack Personalizado',
      units: 30,
      badge: 'NOVO LOTE',
      popular: false,
      costPerUnitEur: 21,
      suggestedSellPriceEur: 89,
      highlight: 'Condição sob medida',
      description: 'Lote configurável de frascos liofilizados padrão ouro com laudo HPLC.',
      features: [
        'Pedido Mínimo configurável',
        'Margem líquida de lucro superior a 300%',
        'Laudos cromatográficos HPLC (>99%) inclusos',
        'Cadeia de frio isotérmica 2°C - 8°C',
      ],
    };
    updateSettings({
      resale: {
        ...currentResale,
        packs: [...resalePacks, newPack],
      },
    });
    showToast('Novo pack adicionado!');
  };

  const handleDeleteResalePack = (packId: string) => {
    if (resalePacks.length <= 1) {
      showToast('É necessário manter pelo menos 1 pack cadastrado.');
      return;
    }
    const updated = resalePacks.filter((p) => p.id !== packId);
    updateSettings({
      resale: {
        ...currentResale,
        packs: updated,
      },
    });
    showToast('Pack removido.');
  };

  const handleResetResaleDefaults = () => {
    if (
      window.confirm(
        'Deseja restaurar todos os custos de atacado e valores sugeridos dos packs para o padrão de fábrica?'
      )
    ) {
      updateSettings({
        resale: initialResaleSettings,
        resaleWhatsappNumber: initialResaleSettings.whatsappNumber,
      });
      showToast('Valores de revenda restaurados com sucesso!');
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKeyField(fieldId);
    showToast('Chave copiada para a área de transferência!');
    setTimeout(() => {
      setCopiedKeyField(null);
    }, 2500);
  };

  const selectedProduct = products.find((p) => p.id === selectedProdId) || products[0];

  const currentStripe: StripeConfig = settings.stripe || {
    enabled: true,
    mode: 'live',
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    accountId: '',
    paymentLink: '',
    currency: 'eur',
    successUrl: 'https://meta-slim-pro-loja-omega.vercel.app/?payment=success',
    cancelUrl: 'https://meta-slim-pro-loja-omega.vercel.app/?payment=cancelled',
  };

  const [isTestingStripe, setIsTestingStripe] = useState(false);
  const [stripeTestResult, setStripeTestResult] = useState<{
    success: boolean;
    mode?: string;
    businessName?: string;
    available?: string[];
    error?: string;
  } | null>(null);

  // Detect if secret key was accidentally pasted into publishable key field
  const pastedSecretKeyInPub = extractSecretKeyIfPastedInPublishableKey(currentStripe.publishableKey);

  const handleAutoFixStripeKeys = () => {
    if (!pastedSecretKeyInPub) return;
    const updated: StripeConfig = {
      ...currentStripe,
      secretKey: pastedSecretKeyInPub,
      publishableKey: '', // clear so merchant can paste correct pk_live_
    };
    updateSettings({ stripe: updated });
    showToast('Chave Secreta movida para o campo correto com sucesso!');
  };

  const handleTestStripeConnection = async () => {
    const keyToTest = currentStripe.secretKey || pastedSecretKeyInPub;
    if (!keyToTest) {
      showToast('Insira sua Chave Secreta Stripe (sk_live_...) antes de testar.');
      return;
    }
    setIsTestingStripe(true);
    setStripeTestResult(null);
    try {
      const res = await testStripeConnection(keyToTest);
      setStripeTestResult(res);
      if (res.success) {
        showToast(`Stripe Conectada! Modo: ${res.mode?.toUpperCase()}`);
      } else {
        showToast(res.error || 'Falha ao conectar com a Stripe.');
      }
    } finally {
      setIsTestingStripe(false);
    }
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
      {/* SaaS Multi-Tenant Active Store Workspace Banner */}
      <div className="bg-[#131b2e] text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006750] to-[#0d8267] flex items-center justify-center text-white shrink-0 shadow-md">
            <Building2 className="w-5 h-5 text-[#93f5d4]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#71face] bg-[#006750]/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                🔒 AMBIENTE SAAS ISOLADO
              </span>
              <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">
                ID: {currentTenant.tenantId}
              </span>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full">
                Plano {currentTenant.plan.toUpperCase()}
              </span>
            </div>
            <div className="text-sm sm:text-base font-extrabold text-white mt-1 flex items-center gap-2">
              <span>{currentTenant.storeName}</span>
              <span className="text-xs text-slate-400 font-normal font-mono">({currentTenant.ownerEmail})</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Catálogo de peptídeos, pedidos, clientes e faturamento exclusivos desta conta.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveAdminTab('saas-tenants')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeAdminTab === 'saas-tenants'
                ? 'bg-[#71face] text-[#002117] shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#71face]" />
            <span>Gerenciar Lojas SaaS</span>
          </button>

          <button
            onClick={() => openAuthModal('login')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-[#006750] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Alternar Conta / Login</span>
          </button>
        </div>
      </div>

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
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-[#006750] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                title="Entrar com conta Google do Firebase"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login com Google</span>
              </button>

              <button
                onClick={() => quickAdminLogin()}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
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
            <span className="text-xs font-semibold">Volume Faturado</span>
            <DollarSign className="w-4 h-4 text-[#006750]" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 mt-2">
            {formatPrice(orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalAmount : 0), 0))}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Stripe &bull; Live Liquidado</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Prontos p/ Envio</span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 mt-2">
            {orders.filter((o) => o.status === 'paid').length} Pedidos
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Aguardando impressão
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
            <span className="text-xs font-semibold">Total de Vendas</span>
            <Award className="w-4 h-4 text-[#635BFF]" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 mt-2">
            {orders.length} Pedidos
          </div>
          <div className="flex items-center gap-1 text-[11px] text-indigo-700 font-semibold mt-1">
            <ShieldCheck className="w-3 h-3 text-[#635BFF]" />
            <span>100% Conectado Stripe</span>
          </div>
        </div>
      </section>

      {/* Admin Tabs - Full-width Wrapped Layout that never overflows or cuts off */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setActiveAdminTab('saas-tenants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeAdminTab === 'saas-tenants'
              ? 'bg-[#006750] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200/70 hover:border-emerald-300'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Lojas SaaS &amp; Isolamento</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-[#006750]">
            {allTenants.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('vendas-stripe')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeAdminTab === 'vendas-stripe'
              ? 'bg-[#635BFF] text-white shadow-md shadow-indigo-900/20'
              : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200/70 hover:border-indigo-300'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-indigo-300" />
          <span>Vendas Stripe &amp; Envios</span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
            activeAdminTab === 'vendas-stripe'
              ? 'bg-white/20 text-white'
              : 'bg-indigo-100 text-[#635BFF]'
          }`}>
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('produtos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'produtos'
              ? 'bg-[#006750] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200/70'
          }`}
        >
          Editar Produtos ({products.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('banners')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'banners'
              ? 'bg-[#006750] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200/70'
          }`}
        >
          Banners Rotativos ({banners.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('depoimentos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'depoimentos'
              ? 'bg-[#006750] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200/70'
          }`}
        >
          Antes &amp; Depois ({testimonials.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('revenda')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeAdminTab === 'revenda'
              ? 'bg-[#006750] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200/70'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Revenda &amp; Atacado (Packs e Custos)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('configuracoes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'configuracoes'
              ? 'bg-[#006750] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200/70'
          }`}
        >
          Configurações Gerais
        </button>

        <button
          onClick={() => setActiveAdminTab('stripe')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeAdminTab === 'stripe'
              ? 'bg-[#635BFF] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200/70'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-[#635BFF]" />
          <span>Chaves Stripe</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('mypos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeAdminTab === 'mypos'
              ? 'bg-[#006750] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200/70'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-[#006750]" />
          <span>Gateway myPOS</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('vercel')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeAdminTab === 'vercel'
              ? 'bg-[#131b2e] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/70'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-[#71face]" />
          <span>Deploy Vercel</span>
        </button>
      </div>

      {/* TAB SAAS: Multi-Tenant SaaS Management & Isolation */}
      {activeAdminTab === 'saas-tenants' && (
        <SaaSTenantsManager />
      )}

      {/* TAB 0: Stripe Sales & Shipping Labels Dashboard */}
      {activeAdminTab === 'vendas-stripe' && (
        <StripeSalesDashboard />
      )}

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

          {/* Product Image Upload & Preview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
            <ImageUploadField
              label="Imagem do Frasco / Caixa do Peptídeo"
              value={selectedProduct.image}
              onChange={(newImg) => handleProductFieldChange('image', newImg)}
              helperText="Upload direto do arquivo de imagem do frasco com tampa verde e caixa clínica MetaSlim Pro, ou informe uma URL externa."
              aspectRatio="portrait"
              placeholder="https://..."
            />
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

      {/* TAB 2: Rotating Banners Manager */}
      {activeAdminTab === 'banners' && (
        <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/70 flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Gerenciador dos Banners Rotativos da Home ({banners.length} Slides)
            </h2>
            <p className="text-xs text-slate-500">
              Personalize imagens, títulos, chamadas promocionais e destinos dos slides da página inicial (incluindo o banner oficial de Revenda).
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

                      <div className="pt-2 border-t border-slate-100">
                        <ImageUploadField
                          label="Imagem do Banner"
                          value={slide.image}
                          onChange={(newImg) => handleBannerFieldChange(slide.id, 'image', newImg)}
                          helperText="Faça upload do banner (PNG, JPG, WebP) ou insira a URL externa."
                          aspectRatio="banner"
                          placeholder="https://..."
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <ImageUploadField
                    label="Foto Antes"
                    value={test.beforeImage}
                    onChange={(newImg) => handleTestimonialFieldChange(test.id, 'beforeImage', newImg)}
                    aspectRatio="portrait"
                    placeholder="https://..."
                    helperText="Upload ou link da foto antes"
                  />
                  <ImageUploadField
                    label="Foto Depois"
                    value={test.afterImage}
                    onChange={(newImg) => handleTestimonialFieldChange(test.id, 'afterImage', newImg)}
                    aspectRatio="portrait"
                    placeholder="https://..."
                    helperText="Upload ou link da foto depois"
                  />
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

      {/* TAB: Resale & Wholesale Manager (Custos de Atacado e Valores Sugeridos dos Packs) */}
      {activeAdminTab === 'revenda' && (
        <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/70 flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-[#006750]">
                  <TrendingUp className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Custos de Atacado &amp; Valores Sugeridos dos Packs
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Configure os custos unitários de fábrica, os valores de venda sugeridos ao consumidor final e os parâmetros de cada lote (packs de 20, 50 e 100 frascos). Todas as alterações são sincronizadas em tempo real com a <strong>Página de Revenda</strong> e o <strong>Simulador Interativo</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetResaleDefaults}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Restaurar valores de fábrica"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Restaurar Padrões</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('revenda');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3.5 py-2 rounded-xl bg-[#006750] hover:bg-[#005240] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#71face]" />
                <span>Ver Página de Revenda</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: Compound Costs & Suggested Prices (Simulador) */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#006750]" />
                  <span>1. Custos de Atacado &amp; Preço Sugerido por Peptídeo</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Estes compostos aparecem nos botões do simulador interativo de lucros da Página de Revenda (Screenshot 1).
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddResaleCompound}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006750] text-xs font-bold border border-emerald-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Peptídeo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resaleCompounds.map((comp) => {
                const profitPerVial = comp.defaultSellPriceEur - comp.wholesaleCostEur;
                const profitPct =
                  comp.wholesaleCostEur > 0
                    ? Math.round((profitPerVial / comp.wholesaleCostEur) * 100)
                    : 0;

                return (
                  <div
                    key={comp.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-500/40 transition-all flex flex-col gap-3.5 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                        Composto ID: {comp.id}
                      </span>
                      {resaleCompounds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteResaleCompound(comp.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remover este composto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">
                        Nome do Peptídeo / Apresentação
                      </label>
                      <input
                        type="text"
                        value={comp.name}
                        onChange={(e) => handleUpdateResaleCompound(comp.id, 'name', e.target.value)}
                        className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#006750]"
                        placeholder="Ex: Retatrutide 10mg (Triplo Agonista)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Custo Atacado (€)</span>
                          <span className="text-[10px] font-mono text-slate-400">por frasco</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={comp.wholesaleCostEur}
                            onChange={(e) =>
                              handleUpdateResaleCompound(
                                comp.id,
                                'wholesaleCostEur',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full h-9 pl-3 pr-8 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-[#006750]"
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                            €
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Preço Sugerido (€)</span>
                          <span className="text-[10px] font-mono text-[#006750] font-semibold">venda final</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={comp.defaultSellPriceEur}
                            onChange={(e) =>
                              handleUpdateResaleCompound(
                                comp.id,
                                'defaultSellPriceEur',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full h-9 pl-3 pr-8 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-[#006750] focus:ring-1 focus:ring-[#006750]"
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                            €
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-600">
                        Demanda / Status do Mercado
                      </label>
                      <input
                        type="text"
                        value={comp.marketDemand}
                        onChange={(e) =>
                          handleUpdateResaleCompound(comp.id, 'marketDemand', e.target.value)
                        }
                        className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 focus:ring-1 focus:ring-[#006750]"
                        placeholder="Ex: Altíssima (Tendência Global)"
                      />
                    </div>

                    {/* Financial Performance Pill */}
                    <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1 text-slate-700">
                        <span>Lucro p/ frasco:</span>
                        <strong className="text-slate-900 font-bold">+{profitPerVial} €</strong>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-[#006750]">
                        <Percent className="w-3.5 h-3.5" />
                        <span>Retorno: +{profitPct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Resale Packs Configuration (Packs 20, 50, 100) */}
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#006750]" />
                  <span>2. Packs Oficiais de Atacado (Lotes de Frascos)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Configure os lotes de pedido mínimo (ex: Pack 20, 50 e 100 frascos) exibidos nos cards da vitrine B2B (Screenshot 2).
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddResalePack}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006750] text-xs font-bold border border-emerald-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Novo Pack</span>
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {resalePacks.map((pack) => {
                const totalCostBatch = pack.units * pack.costPerUnitEur;
                const totalGrossBatch = pack.units * pack.suggestedSellPriceEur;
                const netProfitBatch = totalGrossBatch - totalCostBatch;
                const packMarginPct =
                  pack.costPerUnitEur > 0
                    ? Math.round(
                        ((pack.suggestedSellPriceEur - pack.costPerUnitEur) /
                          pack.costPerUnitEur) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={pack.id}
                    className={`p-5 sm:p-6 rounded-2xl border transition-all flex flex-col gap-4 ${
                      pack.popular
                        ? 'bg-emerald-50/30 border-[#006750] shadow-sm ring-1 ring-[#006750]/20'
                        : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {/* Pack Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/70">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold uppercase">
                          {pack.units} Frascos
                        </span>
                        {pack.popular && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#006750] text-white text-[10px] font-mono font-bold uppercase">
                            Destaque Ativo
                          </span>
                        )}
                        <span className="text-xs font-mono text-slate-400">ID: {pack.id}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!pack.popular}
                            onChange={(e) => handleUpdateResalePack(pack.id, 'popular', e.target.checked)}
                            className="rounded text-[#006750] focus:ring-[#006750]"
                          />
                          <span className="font-semibold">Mais Popular</span>
                        </label>

                        {resalePacks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteResalePack(pack.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remover este pack"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Nome do Pack</label>
                        <input
                          type="text"
                          value={pack.name}
                          onChange={(e) => handleUpdateResalePack(pack.id, 'name', e.target.value)}
                          className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#006750]"
                          placeholder="Ex: Pack Start Revenda"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700">Quantidade de Frascos</label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          value={pack.units}
                          onChange={(e) =>
                            handleUpdateResalePack(pack.id, 'units', parseInt(e.target.value) || 1)
                          }
                          className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-[#006750]"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700">Selo / Badge</label>
                        <input
                          type="text"
                          value={pack.badge}
                          onChange={(e) => handleUpdateResalePack(pack.id, 'badge', e.target.value)}
                          className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-[#006750]"
                          placeholder="Ex: PEDIDO MÍNIMO OFICIAL"
                        />
                      </div>
                    </div>

                    {/* Price and Cost Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Custo Médio Unitário de Atacado (€)</span>
                          <span className="text-[10px] font-mono text-slate-400">custo por frasco</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={pack.costPerUnitEur}
                            onChange={(e) =>
                              handleUpdateResalePack(
                                pack.id,
                                'costPerUnitEur',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full h-9 pl-3 pr-8 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-[#006750]"
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                            €
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Venda Sugerida ao Consumidor (€)</span>
                          <span className="text-[10px] font-mono text-[#006750] font-semibold">preço de mercado</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={pack.suggestedSellPriceEur}
                            onChange={(e) =>
                              handleUpdateResalePack(
                                pack.id,
                                'suggestedSellPriceEur',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full h-9 pl-3 pr-8 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-[#006750] focus:ring-1 focus:ring-[#006750]"
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                            €
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Live Financial Metrics Card for this Pack */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-[#00382b] text-white flex flex-wrap items-center justify-between gap-4 font-mono shadow-xs">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                          Investimento Lote ({pack.units} un.)
                        </span>
                        <span className="text-sm font-bold text-white">
                          {totalCostBatch} €
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                          Faturamento Sugerido
                        </span>
                        <span className="text-sm font-bold text-white">
                          {totalGrossBatch} €
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] text-emerald-300 uppercase tracking-wider">
                          Lucro Líquido Estimado
                        </span>
                        <span className="text-base font-black text-[#71face]">
                          +{netProfitBatch} €
                        </span>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-amber-300 uppercase tracking-wider">
                          Margem de Retorno
                        </span>
                        <span className="text-base font-black text-amber-400">
                          +{packMarginPct}%
                        </span>
                      </div>
                    </div>

                    {/* Description & Features */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700">Descrição Comercial</label>
                        <input
                          type="text"
                          value={pack.description}
                          onChange={(e) => handleUpdateResalePack(pack.id, 'description', e.target.value)}
                          className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:ring-1 focus:ring-[#006750]"
                          placeholder="Descrição do pack exibida no card"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Itens Incluídos / Benefícios no Card</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            1 benefício por linha
                          </span>
                        </label>
                        <textarea
                          rows={3}
                          value={pack.features.join('\n')}
                          onChange={(e) =>
                            handleUpdateResalePack(
                              pack.id,
                              'features',
                              e.target.value.split('\n').filter((line) => line.trim().length > 0)
                            )
                          }
                          className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:ring-1 focus:ring-[#006750]"
                          placeholder="Digite cada benefício em uma nova linha..."
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: WhatsApp Support for Resale */}
          <div className="pt-4 border-t border-slate-200/80 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>3. WhatsApp Oficial para Contato de Revenda</span>
            </h3>
            <p className="text-xs text-slate-500">
              Número internacional que recebe os leads do botão <strong>"Saiba Mais"</strong>, dos botões de <strong>"Pedir Pack"</strong> e do formulário da Página de Revenda.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
              <input
                type="text"
                placeholder="+351912345678"
                value={settings.resaleWhatsappNumber ?? settings.whatsappNumber}
                onChange={(e) => updateSettings({ resaleWhatsappNumber: e.target.value })}
                className="flex-1 h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:ring-1 focus:ring-[#006750]"
              />
              <button
                type="button"
                onClick={() => {
                  const cleanNum = (settings.resaleWhatsappNumber || settings.whatsappNumber).replace(
                    /\D/g,
                    ''
                  );
                  window.open(
                    `https://wa.me/${cleanNum}?text=${encodeURIComponent(
                      'Olá! Este é um teste do botão Saiba Mais do Programa de Revenda MetaSlim Pro.'
                    )}`,
                    '_blank'
                  );
                }}
                className="h-10 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Testar Chamada WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Footer Save / Feedback */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#006750]" />
              <span className="text-xs text-slate-600">
                Todas as alterações são salvas automaticamente na memória local e sincronizadas com a nuvem.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  showToast('Configurações de revenda salvas e sincronizadas!');
                }}
                className="px-4 py-2 rounded-xl bg-[#006750] hover:bg-[#005240] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#71face]" />
                <span>Confirmar e Salvar</span>
              </button>
            </div>
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
            {/* Logo da Loja (Upload direto ou URL) */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
              <ImageUploadField
                label="Logotipo Oficial da Loja (Upload de Imagem)"
                value={settings.logoUrl || ''}
                onChange={(newLogo) => updateSettings({ logoUrl: newLogo })}
                helperText="Arraste ou selecione a imagem do logotipo da sua marca (PNG com fundo transparente, JPG ou SVG). O logo será exibido com máxima nitidez no cabeçalho e rodapé."
                aspectRatio="logo"
                placeholder="https://..."
              />
            </div>

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

            {/* Reseller WhatsApp Field */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-emerald-50/70 border border-emerald-300/80 flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                    <MessageCircle className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>WhatsApp Oficial para o Programa de Revenda &amp; Atacado</span>
                      <span className="text-[10px] font-mono font-black bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded">
                        Packs 20+ Un. • Lucros &gt; 300%
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-600">
                      Este é o número acionado pelo botão <strong>"Saiba Mais"</strong>, pelo simulador interativo de lucros e pelos botões de pedido da nova <strong>Página de Revenda</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-1">
                <input
                  type="text"
                  placeholder="+351912345678"
                  value={settings.resaleWhatsappNumber ?? settings.whatsappNumber}
                  onChange={(e) => updateSettings({ resaleWhatsappNumber: e.target.value })}
                  className="flex-1 h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:ring-1 focus:ring-[#006750]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const cleanNum = (settings.resaleWhatsappNumber || settings.whatsappNumber).replace(/\D/g, '');
                    window.open(
                      `https://wa.me/${cleanNum}?text=${encodeURIComponent(
                        'Olá! Este é um teste do botão Saiba Mais do Programa de Revenda MetaSlim Pro.'
                      )}`,
                      '_blank'
                    );
                  }}
                  className="h-10 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Testar WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAdminTab('revenda')}
                  className="h-10 px-4 rounded-xl bg-[#006750] hover:bg-[#005240] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#71face]" />
                  <span>Editar Custos de Atacado &amp; Packs</span>
                </button>
              </div>
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

          {/* App de Consulta Grátis Link Field */}
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-teal-50/70 border border-teal-200/80">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#006750]" />
                <span>Aplicativo de Consulta Médica Gratuita (Botão Flutuante)</span>
                <span className="text-[10px] font-mono font-bold bg-[#006750] text-white px-2 py-0.5 rounded-full">
                  100% Grátis
                </span>
              </label>
            </div>
            <p className="text-[11px] text-slate-600">
              URL do aplicativo de triagem e consulta médica (Dra. Valéria Prado) acionado pelo botão flutuante da loja.
            </p>
            <div className="flex gap-2 mt-1">
              <input
                type="url"
                placeholder="https://consulta.metaslim-pro.shop/"
                value={settings.consultationUrl || 'https://consulta.metaslim-pro.shop/'}
                onChange={(e) => updateSettings({ consultationUrl: e.target.value })}
                className="flex-1 h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:ring-1 focus:ring-[#006750]"
              />
              <button
                type="button"
                onClick={() =>
                  window.open(
                    settings.consultationUrl || 'https://consulta.metaslim-pro.shop/',
                    '_blank'
                  )
                }
                className="h-10 px-4 rounded-xl bg-[#006750] hover:bg-[#005240] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Testar App</span>
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

            {/* SECURE KEYS VAULT CONTAINER */}
            <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 p-4 sm:p-5 rounded-2xl border-2 border-indigo-100/90 shadow-xs flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#635BFF] flex items-center justify-center text-white">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>Cofre Seguro de Chaves de API Stripe</span>
                      <span className="text-[9px] font-mono bg-indigo-100 text-[#635BFF] px-2 py-0.5 rounded-full font-bold">
                        AES-256 ENCRYPTED
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Campos protegidos contra visualização indevida. As chaves são salvas de forma segura no Firestore.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-indigo-900 bg-white px-2.5 py-1 rounded-full border border-indigo-200 shadow-xs font-medium">
                  <Lock className="w-3 h-3 text-[#635BFF]" />
                  <span>Proteção PCI-DSS &bull; Acesso Restrito a Admin</span>
                </div>
              </div>

              {/* Auto-Fix Alert if Secret Key was pasted into Publishable Key */}
              {pastedSecretKeyInPub && (
                <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl flex flex-col gap-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                        Atenção: Chave Secreta Detectada no Campo de Chave Publicável!
                      </h4>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        Identificamos que você colou a sua <strong>Chave Secreta Stripe</strong> (<code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-amber-950 font-bold">{pastedSecretKeyInPub.slice(0, 16)}...</code>) dentro do campo de Chave Publicável.
                        A Chave Secreta é a chave que realmente processa as cobranças bancárias reais.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-amber-200/80">
                    <button
                      type="button"
                      onClick={handleAutoFixStripeKeys}
                      className="py-2 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Mover Automaticamente para Chave Secreta</span>
                    </button>
                    <span className="text-[11px] text-amber-800">
                      Transfere a chave secreta para o local correto com 1 clique.
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Publishable Key */}
                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#635BFF]" />
                      <span>Chave Publicável Stripe (Publishable Key)</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      {currentStripe.publishableKey?.startsWith('pk_live_') && (
                        <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded">
                          PK LIVE &check;
                        </span>
                      )}
                      {currentStripe.publishableKey?.startsWith('pk_test_') && (
                        <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.2 rounded">
                          PK TEST
                        </span>
                      )}
                      <span className="text-[10px] text-indigo-700 font-mono font-bold">
                        pk_live_... ou pk_test_...
                      </span>
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={currentStripe.publishableKey || ''}
                      onChange={(e) => handleStripeChange('publishableKey', e.target.value.trim())}
                      placeholder="Ex: pk_live_51M..."
                      className="w-full h-10 pl-3 pr-20 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentStripe.publishableKey, 'pub')}
                      title="Copiar Chave Publicável"
                      className="absolute right-2 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors"
                    >
                      {copiedKeyField === 'pub' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Utilizada publicamente pelo navegador para inicializar elementos de pagamento seguros e tokenizar cartões.
                  </span>
                </div>

                {/* 2. Secret Key (Protected with password mask & eye toggle) */}
                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-600" />
                      <span>Chave Secreta Stripe (Secret Key / Restricted Key)</span>
                      <span className="bg-rose-50 text-rose-700 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border border-rose-200">
                        CONFIDENCIAL
                      </span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      {currentStripe.secretKey?.startsWith('sk_live_') && (
                        <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded">
                          SK LIVE &check;
                        </span>
                      )}
                      {currentStripe.secretKey?.startsWith('sk_test_') && (
                        <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.2 rounded">
                          SK TEST
                        </span>
                      )}
                      {currentStripe.secretKey?.startsWith('rk_') && (
                        <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.2 rounded">
                          RESTRICTED KEY &check;
                        </span>
                      )}
                      <span className="text-[10px] text-rose-600 font-mono font-bold">
                        sk_live_... / rk_live_...
                      </span>
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showSecretKey ? 'text' : 'password'}
                      value={currentStripe.secretKey || ''}
                      onChange={(e) => handleStripeChange('secretKey', e.target.value.trim())}
                      placeholder="Ex: sk_live_51M... ou rk_live_51M..."
                      className="w-full h-10 pl-3 pr-28 rounded-xl bg-white border border-rose-200/80 text-xs font-mono focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:outline-none transition-all"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        title={showSecretKey ? 'Ocultar Chave' : 'Revelar Chave'}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      >
                        {showSecretKey ? (
                          <EyeOff className="w-3.5 h-3.5 text-slate-700" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-slate-700" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentStripe.secretKey || '', 'sec')}
                        title="Copiar Chave Secreta"
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors"
                      >
                        {copiedKeyField === 'sec' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>
                      Esta chave secreta concede autoridade financeira para criar sessões de checkout e gerenciar cobranças reais. É mantida estritamente segura no backend.
                    </span>
                  </div>

                  {/* Test Stripe Connection Action Button */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleTestStripeConnection}
                      disabled={isTestingStripe}
                      className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-60"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingStripe ? 'animate-spin' : ''}`} />
                      <span>{isTestingStripe ? 'Consultando API Stripe...' : 'Testar Conexão com a Stripe'}</span>
                    </button>
                    <span className="text-[10.5px] text-slate-500">
                      Dispara uma consulta de saldo oficial para atestar se sua chave está ativa.
                    </span>
                  </div>

                  {/* Realtime Stripe Connection Result Banner */}
                  {stripeTestResult && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                        stripeTestResult.success
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50 border-rose-200 text-rose-950'
                      }`}
                    >
                      {stripeTestResult.success ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-bold">
                          {stripeTestResult.success
                            ? `Conexão Stripe Confirmada! (${stripeTestResult.businessName})`
                            : 'Erro na Validação da Chave Stripe'}
                        </span>
                        <span className="text-[11px] leading-relaxed">
                          {stripeTestResult.success
                            ? `Ambiente: ${stripeTestResult.mode?.toUpperCase()} | Saldo da Conta: ${stripeTestResult.available?.join(', ') || '0.00 EUR'}. Sua loja está habilitada para processar pagamentos reais na Stripe!`
                            : stripeTestResult.error}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Webhook Signing Secret (Protected with password mask) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Segredo do Webhook (Signing Secret)</span>
                    </label>
                    <span className="text-[10px] text-indigo-600 font-mono font-bold">
                      whsec_...
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showWebhookSecret ? 'text' : 'password'}
                      value={currentStripe.webhookSecret || ''}
                      onChange={(e) => handleStripeChange('webhookSecret', e.target.value.trim())}
                      placeholder="Ex: whsec_..."
                      className="w-full h-10 pl-3 pr-24 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] focus:outline-none transition-all"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                        title={showWebhookSecret ? 'Ocultar' : 'Revelar'}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      >
                        {showWebhookSecret ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentStripe.webhookSecret || '', 'wh')}
                        title="Copiar Segredo Webhook"
                        className="px-1.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-mono transition-colors"
                      >
                        {copiedKeyField === 'wh' ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Valida a assinatura criptográfica dos eventos enviados pela Stripe (ex: <code className="bg-slate-100 px-1 py-0.2 rounded font-mono">checkout.session.completed</code>).
                  </span>
                </div>

                {/* 4. Stripe Connected Account ID (Optional) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-slate-500" />
                      <span>ID da Conta Stripe / Merchant (Opcional)</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      acct_...
                    </span>
                  </div>
                  <input
                    type="text"
                    value={currentStripe.accountId || ''}
                    onChange={(e) => handleStripeChange('accountId', e.target.value.trim())}
                    placeholder="Ex: acct_1N..."
                    className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:ring-1 focus:ring-[#635BFF] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">
                    Utilizado em contas Stripe Connect ou para roteamento de pagamentos para conta específica.
                  </span>
                </div>
              </div>

              {/* Realtime Key Integrity Feedback */}
              <div className="p-3 bg-white rounded-xl border border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-800 font-semibold text-[11px]">
                    Status das Chaves:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        currentStripe.publishableKey ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      PK: {currentStripe.publishableKey ? 'Configurada' : 'Não inserida'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        currentStripe.secretKey ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      SK: {currentStripe.secretKey ? 'Protegida &bull; Salva' : 'Opcional (Link Direto)'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        currentStripe.webhookSecret ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Webhook: {currentStripe.webhookSecret ? 'Ativo' : 'Não configurado'}
                    </span>
                  </div>
                </div>

                {currentStripe.mode === 'live' && currentStripe.publishableKey?.startsWith('pk_test_') && (
                  <div className="flex items-center gap-1 text-amber-700 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <ShieldAlert className="w-3 h-3" />
                    <span>Atenção: Modo está LIVE mas a chave é de TESTE (pk_test_).</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stripe Payment Link (Buy Link) */}
            <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#635BFF]" />
                  <span>Link de Pagamento Padrão Stripe (Stripe Payment Link URL)</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {currentStripe.paymentLink?.toLowerCase().includes('live_metaslimpro') && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      Link Fictício (Causa erro AccessDenied)
                    </span>
                  )}
                  {currentStripe.paymentLink?.startsWith('https://buy.stripe.com/') &&
                    !currentStripe.paymentLink?.toLowerCase().includes('live_metaslimpro') && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Link Válido
                      </span>
                    )}
                  {(!currentStripe.paymentLink || currentStripe.paymentLink.trim() === '') && (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Checkout Direto por Cartão Ativo
                    </span>
                  )}
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
              </div>
              <input
                type="url"
                value={currentStripe.paymentLink || ''}
                onChange={(e) => handleStripeChange('paymentLink', e.target.value.trim())}
                placeholder="https://buy.stripe.com/..."
                className={`h-10 px-3 rounded-xl bg-slate-50 border text-xs font-mono focus:ring-1 focus:ring-[#635BFF] focus:outline-none transition-colors ${
                  currentStripe.paymentLink?.toLowerCase().includes('live_metaslimpro')
                    ? 'border-amber-300 bg-amber-50/40 text-amber-900'
                    : 'border-slate-200'
                }`}
              />
              <span className="text-[10px] text-slate-500">
                Cole aqui o link criado no painel da Stripe (Menu <strong>Payment Links</strong>). O sistema anexa automaticamente o ID do pedido e e-mail do cliente.
              </span>

              {/* AccessDenied Error Explanation & Fix Box */}
              <div className="mt-1 p-3 rounded-xl border border-amber-200 bg-amber-50/60 text-xs text-amber-900 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center font-black text-[10px]">
                    !
                  </div>
                  <span className="font-bold text-slate-900 text-xs">
                    Entenda e Evite o Erro &lt;Error&gt;&lt;Code&gt;AccessDenied&lt;/Code&gt;&lt;/Error&gt; (XML no Navegador)
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Esse erro ocorre exclusivamente quando o navegador do cliente tenta abrir uma URL do Stripe (ex: <code className="bg-white/80 px-1 py-0.5 rounded border border-amber-200 font-mono text-[10px]">https://buy.stripe.com/live_metaslimpro_...</code>) que não existe na infraestrutura da Stripe/AWS.
                </p>
                <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200/80 flex flex-col gap-1 text-[11px] text-slate-700">
                  <span className="font-bold text-slate-900">Como resolver definitivamente:</span>
                  <ol className="list-decimal pl-4 space-y-1 text-[10.5px]">
                    <li>Acesse seu painel em <strong>dashboard.stripe.com &gt; Payment links</strong>.</li>
                    <li>Clique em <strong>+ Novo link de pagamento</strong> (ou selecione um existente).</li>
                    <li>Copie o link real gerado (ex: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-700 font-bold">https://buy.stripe.com/00g8w...</code>) e cole no campo acima.</li>
                    <li>Clique em <strong>Salvar Configurações Stripe</strong>.</li>
                  </ol>
                </div>
                <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Proteção Ativa:</strong> A loja agora valida o link e nunca mais redirecionará os clientes para páginas de erro XML da AWS. Enquanto não houver link real configurado, o cliente utiliza o Checkout Seguro por Cartão na própria tela.
                  </span>
                </div>
              </div>
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
              <span>Passo a Passo: Onde Encontrar as Chaves no Dashboard da Stripe</span>
            </span>
            <ol className="list-decimal pl-4 space-y-2 text-[11px] text-slate-600 leading-relaxed">
              <li>
                Acesse o painel da Stripe em{' '}
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#635BFF] font-bold underline"
                >
                  dashboard.stripe.com
                </a>{' '}
                com sua conta oficial.
              </li>
              <li>
                <strong>Chaves de API (Publicável e Secreta)</strong>: Vá no menu superior direito ou lateral em <strong>Desenvolvedores (Developers) &gt; Chaves de API (API Keys)</strong>.
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[10.5px]">
                  <li>Copie a <strong>Publishable key</strong> (<code className="font-mono bg-white px-1 py-0.5 rounded">pk_live_...</code>) e cole no campo da Chave Publicável.</li>
                  <li>Clique em <strong>Revelar chave secreta</strong> ou gere uma <strong>Chave Restrita (Restricted key)</strong> (<code className="font-mono bg-white px-1 py-0.5 rounded">sk_live_...</code> ou <code className="font-mono bg-white px-1 py-0.5 rounded">rk_live_...</code>) e cole no campo seguro da Chave Secreta.</li>
                </ul>
              </li>
              <li>
                <strong>Segredo de Webhook (Opcional)</strong>: No menu <strong>Desenvolvedores &gt; Webhooks</strong>, adicione o endpoint da sua loja e copie o <strong>Segredo de assinatura</strong> (<code className="font-mono bg-white px-1 py-0.5 rounded">whsec_...</code>).
              </li>
              <li>
                <strong>Link de Pagamento (Payment Link)</strong>: No menu lateral, vá em <strong>Payment Links &gt; Criar link de pagamento</strong>. Defina os produtos ou valor aberto, ative Apple Pay / Google Pay, e copie a URL (<code className="font-mono bg-white px-1 py-0.5 rounded">https://buy.stripe.com/...</code>).
              </li>
              <li>
                Clique no botão <strong>Salvar Configurações Stripe</strong> abaixo para persistir os dados de forma protegida no Firestore.
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
