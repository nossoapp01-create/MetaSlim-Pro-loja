import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { BeforeAfterSection } from './components/BeforeAfterSection';
import { CartView } from './components/CartView';
import { AdminPanel } from './components/AdminPanel';
import { DeliveryPolicy } from './components/DeliveryPolicy';
import { ResaleWholesale } from './components/ResaleWholesale';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { DosageCalculatorModal } from './components/DosageCalculatorModal';
import { FloatingConsultationButton } from './components/FloatingConsultationButton';
import { SaaSAuthModal } from './components/SaaSAuthModal';
import { ShieldCheck, Sparkles, AlertCircle, ArrowRight, Dna, Calculator, X, Truck } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    products,
    selectedCategory,
    searchQuery,
    settings,
    toast,
    setToast,
    setSelectedProductId,
  } = useStore();

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Filter products by category and search
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'todos' || prod.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.refCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.whatIsItFor.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#131b2e] flex flex-col font-sans selection:bg-[#71face] selection:text-[#002117]">
      {/* Top Header */}
      <Header onOpenCalculator={() => setIsCalculatorOpen(true)} />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-20 pb-12">
        {/* Floating Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-4 left-4 sm:left-auto sm:max-w-lg z-50 bg-[#131b2e] text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-start gap-3 text-xs font-medium animate-in slide-in-from-top duration-200 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#71face] shrink-0 mt-1 animate-ping" />
            <div className="flex-1 leading-relaxed text-slate-100 break-words font-sans">
              {toast}
            </div>
            <button
              onClick={() => setToast && setToast(null)}
              className="text-slate-400 hover:text-white p-0.5 ml-1 shrink-0 cursor-pointer"
              title="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* VIEW 1: HOME PAGE */}
        {activeTab === 'inicio' && (
          <div className="flex flex-col gap-6">
            {/* 5-Slide Rotating Banner */}
            <HeroBanner />

            {/* Quick Scientific Trust Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-3 rounded-2xl border border-slate-200/70 shadow-xs text-center text-xs">
              <div className="flex items-center justify-center gap-1.5 text-slate-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#006750]" />
                <span>Laudo HPLC &gt;99%</span>
              </div>
              <button
                onClick={() => setActiveTab('prazos-entrega')}
                className="flex items-center justify-center gap-1.5 text-slate-700 hover:text-[#006750] font-semibold transition-colors cursor-pointer group"
                title="Ver Prazos e Condições de Entrega"
              >
                <Truck className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Envio Térmico (Prazos)</span>
              </button>
              <div className="flex items-center justify-center gap-1.5 text-slate-700 font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Liofilização Pura</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-slate-700 font-semibold">
                <span className="font-mono font-bold text-[#006750]">MB WAY / PIX</span>
              </div>
            </div>

            {/* Categories Filter with Hover Micro-effects */}
            <CategoryFilter />

            {/* Featured Product Banner (Retatrutide 10mg) */}
            <div className="bg-gradient-to-r from-[#006750] via-[#0b745c] to-[#0d8267] rounded-2xl p-5 sm:p-6 text-white shadow-lg shadow-emerald-950/15 flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-white/10 backdrop-blur-md p-2 flex items-center justify-center border border-white/20 shrink-0">
                  <img
                    src={products[0]?.image}
                    alt={products[0]?.name}
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#93f5d4] tracking-wider bg-black/20 px-2 py-0.5 rounded-full w-fit">
                    Destaque Clínico • Tri-Agonista
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold mt-1">
                    {products[0]?.name || 'Retatrutide 10mg'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-100 max-w-md mt-1 leading-relaxed line-clamp-2">
                    {products[0]?.whatIsItFor}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end w-full sm:w-auto relative z-10 shrink-0">
                <span className="text-[11px] text-emerald-200 font-mono">A partir de</span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#93f5d4]">
                  €59,00
                </span>
                <button
                  onClick={() => {
                    setSelectedProductId(products[0]?.id || 'retatrutide-10mg');
                    setActiveTab('produto-detalhe');
                  }}
                  className="mt-2 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-[#006750] hover:bg-emerald-50 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>Ver Detalhes do Frasco</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
            </div>

            {/* Products Section Header */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#131b2e] tracking-tight">
                  Peptídeos Disponíveis
                </h2>
                <p className="text-xs text-slate-500">
                  {filteredProducts.length} compostos com laudo de pureza cromatográfica.
                </p>
              </div>

              <button
                onClick={() => setIsCalculatorOpen(true)}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#006750] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculadora BAC</span>
              </button>
            </div>

            {/* Product Cards Grid with Hover Effects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Before and After Carousel with Real Client Experiences */}
            <BeforeAfterSection />

            {/* Lab Reconstitution Educational Callout */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#006750] shrink-0">
                  <Dna className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-base text-slate-900">
                    Dúvidas sobre a Reconstituição ou Dosagem?
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-lg mt-0.5">
                    Utilize a nossa calculadora de água bacteriostática estéril para obter a equivalência exata de unidades na seringa de insulina.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCalculatorOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#006750] hover:bg-[#0d8267] text-white font-bold text-xs shadow-sm transition-all active:scale-95 shrink-0"
              >
                Abrir Calculadora
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: PRODUCTS CATALOG ONLY */}
        {activeTab === 'produtos' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                Catálogo de Peptídeos Liofilizados
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Selecione o peptídeo para verificar dosagens, cromatografia HPLC e link direto de pagamento.
              </p>
            </div>

            <CategoryFilter />

            {searchQuery && (
              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                <span>
                  Resultados da busca por: <strong>"{searchQuery}"</strong> ({filteredProducts.length} encontrados)
                </span>
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800">Nenhum peptídeo encontrado</h3>
                <p className="text-xs text-slate-500 mt-1">Tente buscar por outro termo ou categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: PRODUCT DETAIL (SINGLE PRODUCT) */}
        {activeTab === 'produto-detalhe' && <ProductDetail />}

        {/* VIEW 4: RESULTS / BEFORE & AFTER */}
        {activeTab === 'resultados' && (
          <div className="flex flex-col gap-5 max-w-4xl mx-auto">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                Antes &amp; Depois dos Clientes
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Relatos reais, evoluções de composição corporal e relatos de perda ponderal com MetaSlim Pro.
              </p>
            </div>
            <BeforeAfterSection />
          </div>
        )}

        {/* VIEW 5: CART */}
        {activeTab === 'carrinho' && <CartView />}

        {/* VIEW 6: ADMIN PANEL */}
        {activeTab === 'admin' && <AdminPanel />}

        {/* VIEW 7: PRAZOS E CONDIÇÕES DE ENTREGA */}
        {activeTab === 'prazos-entrega' && <DeliveryPolicy />}

        {/* VIEW 8: PROGRAMA DE REVENDA E ATACADO */}
        {activeTab === 'revenda' && <ResaleWholesale />}
      </main>

      {/* Dosage Reconstitution Modal */}
      <DosageCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Global Footer */}
      <Footer />

      {/* Floating Free Medical Consultation Button */}
      {activeTab !== 'admin' && (
        <FloatingConsultationButton
          consultationUrl={settings.consultationUrl || 'https://consulta.metaslim-pro.shop/'}
        />
      )}

      {/* SaaS Multi-Tenant Authentication & Store Manager Modal */}
      <SaaSAuthModal />

      {/* Floating Bottom Navigation Bar for Mobile */}
      <BottomNav />
    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}

export default App;
