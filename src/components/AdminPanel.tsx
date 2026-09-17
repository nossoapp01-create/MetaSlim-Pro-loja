import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, BannerSlide, Testimonial } from '../types';
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
  } = useStore();

  const [activeAdminTab, setActiveAdminTab] = useState<'produtos' | 'banners' | 'depoimentos' | 'configuracoes'>('produtos');
  const [selectedProdId, setSelectedProdId] = useState<string>(products[0]?.id || 'retatrutide-10mg');
  const [expandedBannerId, setExpandedBannerId] = useState<number | null>(1);
  const [isSaving, setIsSaving] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProdId) || products[0];

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

  const triggerGlobalSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Todas as alterações foram sincronizadas na loja!');
    }, 700);
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
            v2.4.9-core
          </span>
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
