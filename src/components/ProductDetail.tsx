import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ClinicalInfographicSheet } from './ClinicalInfographicSheet';
import {
  ShieldCheck,
  Check,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Bolt,
  Thermometer,
  Lock,
  Package,
  RotateCcw,
  FileText,
  Download,
  Info,
  Layers,
  ArrowRight,
  ZoomIn,
  BookOpen,
  FlaskConical,
  Award,
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const {
    products,
    selectedProductId,
    formatPrice,
    addToCart,
    setActiveTab,
    settings,
    showToast,
  } = useStore();

  const [selectedVials, setSelectedVials] = useState<number>(1);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'didatico' | 'mecanismo' | 'tecnica'>('didatico');

  const product =
    products.find((p) => p.id === selectedProductId) || products[0];

  if (!product) return null;

  // Calculate pricing based on tier
  const calculateTierPrice = (vials: number) => {
    if (vials === 1) return { total: product.price, unit: product.price, discount: 0 };
    if (vials === 2) {
      const total = Math.round(product.price * 2 * 0.8 * 100) / 100;
      return { total, unit: total / 2, discount: 20 };
    }
    // 3 vials
    const total = Math.round(product.price * 3 * 0.7 * 100) / 100;
    return { total, unit: total / 3, discount: 30 };
  };

  const currentTier = calculateTierPrice(selectedVials);

  // Determine payment link (product specific or default fallback)
  const paymentUrl =
    product.paymentLink ||
    `${settings.defaultPaymentLink}?ref=${product.refCode}&vials=${selectedVials}&price=${currentTier.total}`;

  const handleDirectBuy = () => {
    if (paymentUrl.startsWith('http')) {
      window.open(paymentUrl, '_blank');
    } else {
      showToast('Redirecionando para o gateway de pagamento seguro...');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16" id="product-detail-view">
      {/* Breadcrumb & Lot Validated Status */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-hidden">
          <button
            onClick={() => setActiveTab('inicio')}
            className="hover:text-[#006750] transition-colors"
          >
            Início
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => setActiveTab('produtos')}
            className="hover:text-[#006750] transition-colors"
          >
            Peptídeos
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#006750] font-semibold truncate">{product.name}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          Lote Validado
        </div>
      </div>

      {/* Hero Showcase Area */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/70">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-[#131b2e] text-white px-3 py-1 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#71face]" />
            <span>{product.purity}</span>
          </div>

          <div className="flex items-center gap-1 bg-[#006750] text-[#93f5d4] px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#71face]" />
            <span>COA Verificado</span>
          </div>
        </div>

        {/* Presentation Frame */}
        <div className="relative w-full aspect-[4/3] max-h-[380px] rounded-xl bg-gradient-to-b from-[#f4f7fb] via-[#eef2f8] to-[#f8fafc] flex items-center justify-center overflow-hidden p-4 border border-slate-100 group">
          <img
            src={product.image}
            alt={product.name}
            className={`h-full w-full object-contain filter drop-shadow-xl transition-transform duration-500 ease-out cursor-zoom-in ${
              isZoomed ? 'scale-150' : 'group-hover:scale-105'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />

          {/* Zoom Toggle */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-700 hover:text-[#006750] transition-all active:scale-90"
            title="Ampliar Detalhes do Frasco"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Temperature Tag Overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm text-xs font-medium text-slate-700">
            <Thermometer className="w-3.5 h-3.5 text-cyan-600" />
            <span>Conservação: 2°C - 8°C</span>
          </div>
        </div>

        {/* REF & Batch info Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="font-semibold text-slate-800">LOTE:</span>
            <span>{product.batchNumber || 'RT10-EU782'}</span>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">REF ID</span>
            <span className="text-xs font-bold text-slate-800">{product.refCode}</span>
          </div>
        </div>
      </section>

      {/* Title & Pricing Summary */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/70">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-1.5 text-[#006750] font-bold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#006750]" />
              <span>Bio-Fórmula de Alta Pureza</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
              {product.name}
            </h1>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              {product.subtitle} — {product.whatIsItFor}
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 font-semibold text-xs px-3 py-1 rounded-full shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Em Estoque ({product.stock} un)
          </span>
        </div>

        {/* Pricing Row */}
        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#006750] font-mono">
            {formatPrice(currentTier.total)}
          </span>
          {product.originalPrice > currentTier.total && (
            <span className="text-base text-slate-400 line-through font-mono">
              {formatPrice(product.originalPrice * selectedVials)}
            </span>
          )}
          {currentTier.discount > 0 ? (
            <span className="px-2 py-0.5 rounded-md bg-[#71face] text-[#002117] font-mono text-xs font-bold">
              -{currentTier.discount}% OFF
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
              Preço Promocional
            </span>
          )}
        </div>

        {/* Multi-Vial Tier Selector */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Layers className="w-4 h-4 text-[#006750]" />
              <span>Selecione a Quantidade de Frascos</span>
            </div>
            <span className="text-[11px] font-semibold text-[#006750]">
              Envio Refrigerado Grátis &gt; €100
            </span>
          </div>

          {/* 3 Tier Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* 1 Vial */}
            <button
              onClick={() => setSelectedVials(1)}
              className={`relative flex flex-col items-center justify-between p-3 rounded-xl text-center transition-all duration-200 active:scale-95 border ${
                selectedVials === 1
                  ? 'border-[#006750] bg-emerald-50/50 ring-2 ring-[#006750]/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="text-xs font-bold text-slate-800">1 Frasco</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Dose Inicial</div>
              <div className="mt-2 w-full pt-1.5 bg-white rounded-lg border border-slate-100">
                <div className="font-mono text-xs font-bold text-[#006750]">
                  {formatPrice(product.price)}
                </div>
                <div className="text-[9px] text-slate-400 font-mono">1x frasco</div>
              </div>
            </button>

            {/* 2 Vials */}
            <button
              onClick={() => setSelectedVials(2)}
              className={`relative flex flex-col items-center justify-between p-3 rounded-xl text-center transition-all duration-200 active:scale-95 border ${
                selectedVials === 2
                  ? 'border-[#006750] bg-emerald-50/50 ring-2 ring-[#006750]/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-700 text-white px-2 py-0.2 rounded-full font-mono text-[9px] font-bold tracking-wider uppercase whitespace-nowrap shadow-xs">
                POUPE 20%
              </span>
              <div className="text-xs font-bold text-slate-800">2 Frascos</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Ciclo 60 Dias</div>
              <div className="mt-2 w-full pt-1.5 bg-white rounded-lg border border-slate-100">
                <div className="font-mono text-xs font-bold text-slate-800">
                  {formatPrice(calculateTierPrice(2).total)}
                </div>
                <div className="text-[9px] text-emerald-700 font-semibold font-mono">
                  {formatPrice(calculateTierPrice(2).unit)}/un
                </div>
              </div>
            </button>

            {/* 3 Vials */}
            <button
              onClick={() => setSelectedVials(3)}
              className={`relative flex flex-col items-center justify-between p-3 rounded-xl text-center transition-all duration-200 active:scale-95 border ${
                selectedVials === 3
                  ? 'border-[#006750] bg-emerald-50/50 ring-2 ring-[#006750]/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#006750] to-[#0d8267] text-white px-2 py-0.2 rounded-full font-mono text-[9px] font-bold tracking-wider uppercase whitespace-nowrap shadow-sm">
                MELHOR VALOR
              </span>
              <div className="text-xs font-bold text-slate-800">3 Frascos</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Poupe 30%</div>
              <div className="mt-2 w-full pt-1.5 bg-white rounded-lg border border-slate-100">
                <div className="font-mono text-xs font-bold text-slate-800">
                  {formatPrice(calculateTierPrice(3).total)}
                </div>
                <div className="text-[9px] text-emerald-700 font-semibold font-mono">
                  {formatPrice(calculateTierPrice(3).unit)}/un
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="mt-6 flex flex-col gap-2.5">
          {/* Direct Fast Checkout Gateway CTA */}
          <button
            onClick={handleDirectBuy}
            className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#006750] via-[#0d8267] to-[#006750] hover:opacity-95 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-pointer"
            id="product-direct-checkout-cta"
          >
            <Bolt className="w-5 h-5 text-[#71face]" />
            <span>
              Comprar Agora ({selectedVials}x Frasco{selectedVials > 1 ? 's' : ''}) • {formatPrice(currentTier.total)}
            </span>
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={() => addToCart(product, selectedVials, 1)}
            className="w-full py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            id="product-add-to-cart-cta"
          >
            <ShoppingBag className="w-4 h-4 text-[#006750]" />
            <span>Adicionar ao Carrinho</span>
          </button>
        </div>

        {/* Quick Reassurance Strip */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-slate-500 text-xs pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            Checkout Seguro 256-bit
          </span>
          <span className="flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-emerald-700" />
            Expedição Imediata
          </span>
          <span className="flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
            Garantia 28 Dias
          </span>
        </div>
      </section>

      {/* Section Navigation Tabs: Ficha Didática Visual (Default) / Alvos Biológicos / Ficha Técnica */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 overflow-x-auto scrollbar-none" id="product-detail-tabs">
        <button
          onClick={() => setActiveDetailTab('didatico')}
          className={`flex-1 min-w-[180px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeDetailTab === 'didatico'
              ? 'bg-[#006750] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Ficha Didática Visual</span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase font-black ${
              activeDetailTab === 'didatico'
                ? 'bg-[#71face] text-[#006750]'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            Auto-Didático
          </span>
        </button>

        <button
          onClick={() => setActiveDetailTab('mecanismo')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeDetailTab === 'mecanismo'
              ? 'bg-[#006750] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Alvos Biológicos</span>
        </button>

        <button
          onClick={() => setActiveDetailTab('tecnica')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeDetailTab === 'tecnica'
              ? 'bg-[#006750] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Ficha Técnica &amp; COA</span>
        </button>
      </div>

      {/* 1. CLINICAL DIDACTIC INFOGRAPHIC SHEET (Matches User WhatsApp Reference Images) */}
      {activeDetailTab === 'didatico' && (
        <ClinicalInfographicSheet
          product={product}
          selectedVials={selectedVials}
          onSelectVials={setSelectedVials}
          onAddToCart={(vials) => addToCart(product, vials, 1)}
          onDirectBuy={handleDirectBuy}
          onOpenCalculator={() => {
            setActiveDetailTab('tecnica');
            showToast('Exibindo Instruções de Reconstituição e Diluição...');
          }}
        />
      )}

      {/* 2. Deep-Dive Science Section: "Para Que Serve" (Detailed Biological Targets) */}
      {activeDetailTab === 'mecanismo' && (
        <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/70 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-[#006750] uppercase font-mono tracking-wider">
                Mecanismo Científico
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#131b2e] mt-0.5">
                Para Que Serve o {product.name}?
              </h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#006750]">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            {product.scientificDescription || product.whatIsItFor}
          </p>

          {/* Biological Target Cards */}
          <div className="grid grid-cols-1 gap-3">
            {/* Target 1 */}
            <div className="p-3.5 rounded-xl bg-[#f7f9fa] border border-slate-200/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#006750] text-[#93f5d4] flex items-center justify-center font-mono text-xs font-bold shrink-0">
                01
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">Receptor GLP-1</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full font-semibold">
                    Saciedade Central
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Desacelera suavemente o esvaziamento gástrico e atua diretamente nos neurônios do hipotálamo, suprimindo o apetite basal e episódios de compulsão alimentar.
                </p>
              </div>
            </div>

            {/* Target 2 */}
            <div className="p-3.5 rounded-xl bg-[#f7f9fa] border border-slate-200/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#006750] text-[#93f5d4] flex items-center justify-center font-mono text-xs font-bold shrink-0">
                02
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">Receptor GIP</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full font-semibold">
                    Homeostase Lipídica
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Modula a sensibilidade periférica à insulina e otimiza a partição de nutrientes, direcionando substratos energéticos para o tecido muscular e inibindo depósitos adiposos.
                </p>
              </div>
            </div>

            {/* Target 3 */}
            <div className="p-3.5 rounded-xl bg-[#f7f9fa] border border-slate-200/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#006750] text-[#93f5d4] flex items-center justify-center font-mono text-xs font-bold shrink-0">
                03
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">Receptor de Glucagon</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full font-semibold">
                    Gasto Energético Basal
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  O diferencial exclusivo frente à Semaglutida e Tirzepatida: induz a termogênese hepática e ativação de gordura marrom, elevando o gasto calórico em repouso.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Checklist */}
          <div className="pt-2">
            <h3 className="font-bold text-sm text-[#131b2e] mb-2.5">Principais Benefícios Observados:</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[#006750] shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-slate-700 leading-normal">
                  <strong className="text-slate-900">Redução Acentuada de Gordura Visceral:</strong> Até 24.2% de redução ponderal média registrada em ensaios clínicos fase II de 48 semanas.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[#006750] shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-slate-700 leading-normal">
                  <strong className="text-slate-900">Preservação de Tecido Magro:</strong> Menor depleção sarcopênica quando comparado aos agonistas de primeira geração.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[#006750] shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-slate-700 leading-normal">
                  <strong className="text-slate-900">Otimização de Biomarcadores:</strong> Redução significativa de triglicerídeos, HbA1c e marcadores inflamatórios como PCR ultrassensível.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Technical Lab Specifications Grid */}
      {activeDetailTab === 'tecnica' && (
        <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/70">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#131b2e]">
              Ficha Técnica &amp; Reconstituição
            </h2>
            <span className="font-mono text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded">
              LAB GRADE RUO
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-slate-800">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
              <span className="font-mono text-[10px] uppercase text-slate-400">CAS Number</span>
              <span className="font-mono text-xs sm:text-sm font-bold mt-0.5">
                {product.casNumber || '2381089-83-2'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
              <span className="font-mono text-[10px] uppercase text-slate-400">Massa Molecular</span>
              <span className="font-mono text-xs sm:text-sm font-bold mt-0.5">
                {product.molecularWeight || '~4731.4 g/mol'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
              <span className="font-mono text-[10px] uppercase text-slate-400">Fórmula Química</span>
              <span className="font-mono text-xs sm:text-sm font-bold mt-0.5 truncate">
                {product.formula || 'C₂₂₁H₃₄₂N₄₆O₆₈'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
              <span className="font-mono text-[10px] uppercase text-slate-400">Grau de Pureza HPLC</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-emerald-700 mt-0.5">
                {product.purity}
              </span>
            </div>
          </div>

          {/* Reconstitution Instructions Box */}
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#006750] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-[#131b2e]">Instruções de Reconstituição</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reconstituir com 2.0ml de Água Bacteriostática estéril (BAC). Girar o frasco suavemente sem agitação brusca. Cada 0.1ml na seringa graduada corresponderá a 0.5mg da molécula ativa. Conservar entre 2°C e 8°C.
              </p>
            </div>
          </div>

          {/* COA Download button */}
          <button
            onClick={() =>
              showToast(`Download iniciado: Certificado de Análise HPLC (${product.batchNumber || 'RT-10'}).pdf`)
            }
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#006750]" />
              <span>Baixar Laudo Cromatográfico (COA.pdf)</span>
            </span>
            <Download className="w-4 h-4 text-slate-400" />
          </button>
        </section>
      )}

      {/* 4-Pillar Clinical Trust Matrix */}
      <section className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/70 grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#006750] mb-1">
            <Thermometer className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs text-slate-900">Envio Térmico UE</span>
          <span className="text-[11px] text-slate-500 leading-normal">
            Caixa isotérmica com gelo seco e controle térmico contínuo.
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#006750] mb-1">
            <RotateCcw className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs text-slate-900">Garantia 28 Dias</span>
          <span className="text-[11px] text-slate-500 leading-normal">
            Substituição imediata ou reembolso caso o lacre seja violado.
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#006750] mb-1">
            <Package className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs text-slate-900">Embalagem Discreta</span>
          <span className="text-[11px] text-slate-500 leading-normal">
            Sem menções externas a compostos ou marcas na embalagem.
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#006750] mb-1">
            <Lock className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs text-slate-900">Pagamento Seguro</span>
          <span className="text-[11px] text-slate-500 leading-normal">
            Cartão, Multibanco, MBWay, PIX Brasil e Cripto via gateway encriptado.
          </span>
        </div>
      </section>

      {/* Sticky Bottom Mini Checkout Bar for Mobile / Fast Conversions */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] border-t border-slate-200/80 flex items-center justify-between max-w-4xl mx-auto sm:rounded-t-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Selecionado</span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-lg font-extrabold text-[#006750]">
              {formatPrice(currentTier.total)}
            </span>
            <span className="text-[10px] text-slate-500">
              ({selectedVials} {selectedVials === 1 ? 'Frasco' : 'Frascos'})
            </span>
          </div>
        </div>

        <button
          onClick={handleDirectBuy}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#006750] to-[#0d8267] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
        >
          <span>Finalizar Pedido</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
