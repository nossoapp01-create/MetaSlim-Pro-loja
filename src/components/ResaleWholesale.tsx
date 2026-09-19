import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ResaleCompoundConfig, ResalePackConfig } from '../types';
import { initialResaleSettings } from '../data/initialData';
import {
  TrendingUp,
  ShieldCheck,
  Package,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Award,
  Truck,
  Sparkles,
  Percent,
  Calculator,
  ChevronRight,
  Clock,
  Layers,
  HelpCircle,
  Dna,
} from 'lucide-react';

export const ResaleWholesale: React.FC = () => {
  const { settings, formatPrice, currency, setActiveTab } = useStore();

  // Dynamic resale settings from store, falling back to initial data
  const resaleConfig = settings.resale || initialResaleSettings;
  const compounds: ResaleCompoundConfig[] =
    resaleConfig.compounds && resaleConfig.compounds.length > 0
      ? resaleConfig.compounds
      : initialResaleSettings.compounds;
  const packs: ResalePackConfig[] =
    resaleConfig.packs && resaleConfig.packs.length > 0
      ? resaleConfig.packs
      : initialResaleSettings.packs;

  // Selected pack for interactive calculator
  const [selectedPackUnits, setSelectedPackUnits] = useState<number>(packs[0]?.units || 20);
  const [selectedCompoundId, setSelectedCompoundId] = useState<string>(compounds[0]?.id || 'retatrutide');
  const activeCompoundInfo =
    compounds.find((c) => c.id === selectedCompoundId) || compounds[0] || initialResaleSettings.compounds[0];

  const [customSellingPriceEur, setCustomSellingPriceEur] = useState<number>(() => {
    return activeCompoundInfo.defaultSellPriceEur || 89;
  });

  // Target WhatsApp number from store settings (with fallback)
  const targetWhatsapp =
    settings.resaleWhatsappNumber?.trim() ||
    resaleConfig.whatsappNumber?.trim() ||
    settings.whatsappNumber?.trim() ||
    '+351912345678';
  const cleanPhone = targetWhatsapp.replace(/\D/g, '');

  const createWhatsAppLink = (customText?: string) => {
    const defaultMsg =
      `Olá! Tenho interesse no Programa Oficial de Revenda MetaSlim Pro (Pedido mínimo a partir de ${packs[0]?.units || 20} unidades). Gostaria de receber a tabela de atacado e tirar algumas dúvidas.`;
    const text = customText || defaultMsg;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleCompoundChange = (comp: ResaleCompoundConfig) => {
    setSelectedCompoundId(comp.id);
    setCustomSellingPriceEur(comp.defaultSellPriceEur);
  };

  // Calculations for current interactive simulation
  const wholesaleUnitCost = activeCompoundInfo.wholesaleCostEur;
  const totalCost = wholesaleUnitCost * selectedPackUnits;
  const totalGrossRevenue = customSellingPriceEur * selectedPackUnits;
  const netProfit = totalGrossRevenue - totalCost;
  const profitPercentage = totalCost > 0 ? Math.round((netProfit / totalCost) * 100) : 0;

  // Dynamic ranges for marketing copy
  const minWholesale = Math.min(
    ...compounds.map((c) => c.wholesaleCostEur),
    ...packs.map((p) => p.costPerUnitEur)
  );
  const maxWholesale = Math.max(
    ...compounds.map((c) => c.wholesaleCostEur),
    ...packs.map((p) => p.costPerUnitEur)
  );
  const minSell = Math.min(
    ...compounds.map((c) => c.defaultSellPriceEur),
    ...packs.map((p) => p.suggestedSellPriceEur)
  );
  const maxSell = Math.max(
    ...compounds.map((c) => c.defaultSellPriceEur),
    ...packs.map((p) => p.suggestedSellPriceEur)
  );

  return (
    <div className="flex flex-col gap-10 sm:gap-14 pb-12">
      {/* 1. HERO BANNER - B2B RESALE */}
      <section className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c1424] via-[#111f38] to-[#00382b] text-white shadow-xl border border-emerald-500/20 p-6 sm:p-10 md:p-14">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-[#006750]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-[#71face]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl flex flex-col gap-5">
          {/* Top Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006750] text-[#71face] text-xs font-bold font-mono tracking-wider uppercase border border-[#71face]/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              PROGRAMA OFICIAL DE REVENDA B2B
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold font-mono uppercase shadow-xs">
              <Percent className="w-3.5 h-3.5" />
              LUCROS &gt; 300% NO ATACADO
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-xs border border-white/15">
              <Package className="w-3.5 h-3.5 text-[#71face]" />
              Pedido Mínimo: Pack de 20 Unidades
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15] text-white">
            Multiplique os seus Ganhos com Peptídeos de Alta Demanda e{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#71face] via-emerald-300 to-teal-200">
              Margens Superiores a 300%
            </span>
          </h1>

          {/* Paragraph */}
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl">
            Forneça a médicos, nutricionistas, clínicas estéticas e clientes particulares os peptídeos
            metabólicos mais procurados do mundo (Retatrutide, Tirzepatide, Semaglutide e BPC-157).
            Qualidade laboratorial testada por HPLC (&gt;99%), entrega discreta em cadeia de frio e pedido mínimo acessível de <strong>apenas 20 unidades</strong>.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-3">
            <a
              href={createWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#1ebe5d] hover:from-[#1ebe5d] hover:to-[#25D366] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/40 active:scale-95 transition-all group cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white/20" />
              <span>Saiba Mais no WhatsApp</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#simulador-revenda"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm backdrop-blur-sm border border-white/20 transition-colors"
            >
              <Calculator className="w-4 h-4 text-[#71face]" />
              <span>Simular Lucro Interativo</span>
            </a>
          </div>

          {/* Quick Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-white/10 mt-3 text-xs">
            <div className="flex flex-col">
              <span className="text-[#71face] font-bold text-base sm:text-lg font-mono">+300%</span>
              <span className="text-slate-300 text-[11px]">Lucro Líquido Médio</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-base sm:text-lg font-mono">20 Unidades</span>
              <span className="text-slate-300 text-[11px]">Pedido Mínimo em Pack</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-base sm:text-lg font-mono">&gt;99% HPLC</span>
              <span className="text-slate-300 text-[11px]">Pureza Farmacêutica</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-base sm:text-lg font-mono">2°C a 8°C</span>
              <span className="text-slate-300 text-[11px]">Cadeia de Frio Garantida</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AS 6 GRANDES VANTAGENS EM REVENDER METASLIM PRO */}
      <section className="flex flex-col gap-6">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <span className="text-xs font-mono uppercase font-bold text-[#006750] tracking-wider">
            Vantagens Comerciais Estratégicas
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
            Por que Revender Peptídeos é o Negócio Mais Lucrativo do Momento?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A revolução dos agonistas incretínicos e peptídeos bioidênticos movimenta bilhões globalmente.
            Ao escolher a MetaSlim Pro, você atua com padrão laboratorial de excelência e altíssima aceitação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Margem 300% */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#006750] flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 flex items-center justify-between">
              <span>Lucros Superiores a 300%</span>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                ROI 3x
              </span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compre direto no atacado a valores de frasco entre <strong>{minWholesale}€ e {maxWholesale}€</strong> e revenda no mercado a valores de <strong>{minSell}€ a {maxSell}€</strong>. O seu investimento inicial retorna triplicado.
            </p>
          </div>

          {/* Card 2: Pedido Mínimo Pack 20 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#006750] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 flex items-center justify-between">
              <span>Pedido Mínimo: Pack de {packs[0]?.units || 20}</span>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-[#006750] px-2 py-0.5 rounded-full">
                Flexível
              </span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Não exigimos investimentos de dezenas de milhares de euros. Comece com apenas <strong>1 pack de {packs[0]?.units || 20} unidades</strong>, permitindo validar a sua carteira de clientes sem risco de capital excessivo.
            </p>
          </div>

          {/* Card 3: Pureza HPLC */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#006750] flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 flex items-center justify-between">
              <span>Pureza &gt;99% com Laudo HPLC</span>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                COA por Lote
              </span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zero queixas e zero devoluções. Cada lote passa por cromatografia líquida de alta eficiência (HPLC) e espectrometria de massa, garantindo a fidelidade dos seus clientes mais exigentes.
            </p>
          </div>

          {/* Card 4: Recorrência Mensal */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#006750] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Demanda Contínua & Recorrência</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Protocolos de emagrecimento duram entre 12 a 24 semanas. Cada cliente conquistado compra de você todos os meses, construindo uma receita previsível e crescente.
            </p>
          </div>

          {/* Card 5: Cadeia Fria e Envio Discreto */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#006750] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Envio Seguro & Cadeia Térmica</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Os seus packs de revenda são enviados com refrigeração controlada (2°C a 8°C) em caixas isotérmicas e embalagem neutra/discreta, garantindo preservação molecular e total privacidade.
            </p>
          </div>

          {/* Card 6: Suporte B2B */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#006750] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Dna className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Material de Apoio & Consultoria</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Você recebe tabelas completas de reconstituição com água BAC estéril, fichas clínicas dos compostos e atendimento direto via WhatsApp para orientar os seus pedidos de reposição.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SIMULADOR INTERATIVO DE LUCRO DE REVENDA */}
      <section
        id="simulador-revenda"
        className="bg-gradient-to-br from-slate-900 via-[#101a2c] to-[#04281f] rounded-3xl p-6 sm:p-10 text-white shadow-lg border border-emerald-500/25 flex flex-col gap-8 scroll-mt-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="text-xs font-mono font-bold text-[#71face] uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              Calculadora Interativa de Rentabilidade
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Simule o seu Lucro com Packs de Revenda
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Ajuste o tamanho do pack (mínimo de 20 unidades) e o composto para visualizar o custo no atacado, o faturamento estimado e a margem de retorno líquido no seu bolso.
            </p>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#006750] text-[#71face] font-mono text-xs font-bold border border-[#71face]/30">
              Margem Média: +{profitPercentage}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls (Left 6-7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Pack Size Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>1. Escolha o Tamanho do Pack</span>
                <span className="text-[11px] text-[#71face] font-normal font-mono">
                  Mínimo: 20 unidades
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {packs.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedPackUnits(item.units)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                      selectedPackUnits === item.units
                        ? 'bg-[#006750] border-[#71face] text-white shadow-md shadow-emerald-950/40 ring-1 ring-[#71face]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <span className="font-bold text-sm">Pack {item.units} Un.</span>
                    <span className="text-[10px] text-slate-300 truncate">{item.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Compound Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                2. Selecione o Peptídeo de Referência
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {compounds.map((comp) => {
                  const isSelected = selectedCompoundId === comp.id;
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => handleCompoundChange(comp)}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/70 border-emerald-400 text-white ring-1 ring-emerald-400'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{comp.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#71face] shrink-0" />}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Custo Atacado: {comp.wholesaleCostEur}€</span>
                        <span className="text-[#71face]">Sugerido: {comp.defaultSellPriceEur}€</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Selling Price Slider */}
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">
                  Preço Praticado de Venda por Frasco ao Cliente Final
                </label>
                <span className="text-base font-bold font-mono text-[#71face]">
                  {customSellingPriceEur} € / frasco
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="130"
                step="1"
                value={customSellingPriceEur}
                onChange={(e) => setCustomSellingPriceEur(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#71face]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>50€ (Venda Rápida)</span>
                <span>89€ (Preço Médio de Mercado)</span>
                <span>130€ (Clínica Especializada)</span>
              </div>
            </div>
          </div>

          {/* Results Summary Box (Right 5-6 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-b from-[#006750]/60 via-[#07362a]/70 to-[#041d17] p-6 rounded-2xl border border-emerald-400/40 shadow-xl">
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-mono uppercase font-bold text-[#71face] tracking-wider">
                Resultado Projetado ({selectedPackUnits} Frascos)
              </span>

              {/* Big Profit Highlight */}
              <div className="bg-black/30 p-4 rounded-xl border border-emerald-500/20 flex flex-col">
                <span className="text-xs text-slate-300">Lucro Líquido Estimado no Bolso:</span>
                <span className="text-3xl sm:text-4xl font-black text-[#71face] font-mono mt-1">
                  +{netProfit.toLocaleString('pt-PT')} €
                </span>
                <div className="flex items-center gap-1.5 text-xs text-emerald-300 mt-1 font-semibold">
                  <TrendingUp className="w-4 h-4 text-[#71face]" />
                  <span>Retorno do Investimento: +{profitPercentage}% de Margem</span>
                </div>
              </div>

              {/* Breakdown Rows */}
              <div className="flex flex-col gap-2 text-xs border-t border-white/10 pt-3">
                <div className="flex justify-between text-slate-300">
                  <span>Custo Total no Atacado ({selectedPackUnits} un × {wholesaleUnitCost}€):</span>
                  <span className="font-mono font-bold text-white">{totalCost.toLocaleString('pt-PT')} €</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Faturamento Bruto ({selectedPackUnits} un × {customSellingPriceEur}€):</span>
                  <span className="font-mono font-bold text-[#71face]">{totalGrossRevenue.toLocaleString('pt-PT')} €</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Lucro Médio por Frasco:</span>
                  <span className="font-mono font-bold text-white">+{customSellingPriceEur - wholesaleUnitCost} € / frasco</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp CTA with simulation text */}
            <div className="pt-5 mt-4 border-t border-white/10 flex flex-col gap-2">
              <a
                href={createWhatsAppLink(
                  `Olá! Fiz uma simulação na página de revenda para o Pack de ${selectedPackUnits} unidades (${activeCompoundInfo.name}). Gostaria de fechar essa condição de atacado.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#1ebe5d] hover:from-[#1ebe5d] hover:to-[#25D366] text-white font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>Garantir Pack de {selectedPackUnits} Unidades no WhatsApp</span>
              </a>
              <span className="text-[10px] text-center text-slate-400">
                Atendimento direto com consultor B2B • Resposta média em 15 minutos
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PACKS DE ENTRADA (MÍNIMO PACK DE 20 UNIDADES) */}
      <section className="flex flex-col gap-6">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <span className="text-xs font-mono uppercase font-bold text-[#006750] tracking-wider">
            Estrutura de Packs Oficiais
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
            Escolha o Pack Ideal para o seu Modelo de Negócio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Todos os packs contam com envio refrigerado e laudos HPLC individuais. O pedido mínimo é a partir de <strong>20 frascos</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className={`relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all ${
                pack.popular
                  ? 'bg-gradient-to-b from-white via-white to-emerald-50/50 border-2 border-[#006750] shadow-lg ring-2 ring-[#006750]/20'
                  : 'bg-white border border-slate-200/80 shadow-xs hover:shadow-md'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    pack.popular
                      ? 'bg-[#006750] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {pack.badge}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {pack.units} Frascos
                </span>
              </div>

              {/* Title & Description */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-extrabold text-slate-900">{pack.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{pack.description}</p>

                {/* Economics Box */}
                <div className="my-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Custo médio unitário:</span>
                    <span className="font-mono font-bold text-slate-900">~{pack.costPerUnitEur} € / frasco</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Venda sugerida:</span>
                    <span className="font-mono font-bold text-slate-900">{pack.suggestedSellPriceEur} € / frasco</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-200">
                    <span className="font-bold text-slate-800">Margem estimada:</span>
                    <span className="font-mono font-black text-[#006750] text-sm">
                      +{Math.round(((pack.suggestedSellPriceEur - pack.costPerUnitEur) / pack.costPerUnitEur) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Features list */}
                <div className="flex flex-col gap-2 py-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    O que está incluído:
                  </span>
                  {pack.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-[#006750] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pack CTA Button */}
              <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col gap-2">
                <a
                  href={createWhatsAppLink(
                    `Olá! Tenho interesse no ${pack.name} (${pack.units} unidades). Gostaria de ver as opções de compostos e formas de envio.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                    pack.popular
                      ? 'bg-[#006750] hover:bg-[#005240] text-white shadow-emerald-950/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Pedir {pack.name}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. COMO FUNCIONA O PROCESSO DE REVENDA (4 PASSOS) */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs flex flex-col gap-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-1.5">
          <span className="text-xs font-mono uppercase font-bold text-[#006750] tracking-wider">
            Fluxo Ágil & Descomplicado
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
            Como Iniciar a sua Operação em 4 Passos
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col gap-2 relative">
            <span className="w-8 h-8 rounded-xl bg-[#006750] text-white font-mono font-black text-sm flex items-center justify-center">
              01
            </span>
            <h4 className="font-bold text-sm text-slate-900 mt-1">Contato & Seleção do Pack</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clique no botão do WhatsApp e defina com nosso consultor os peptídeos do seu pack (mínimo de 20 unidades).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col gap-2 relative">
            <span className="w-8 h-8 rounded-xl bg-[#006750] text-white font-mono font-black text-sm flex items-center justify-center">
              02
            </span>
            <h4 className="font-bold text-sm text-slate-900 mt-1">Fatura & Pagamento</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Faturação formal com opções de Cartão, Transferência SEPA, Multibanco/MBWay ou PIX para praticidade total.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col gap-2 relative">
            <span className="w-8 h-8 rounded-xl bg-[#006750] text-white font-mono font-black text-sm flex items-center justify-center">
              03
            </span>
            <h4 className="font-bold text-sm text-slate-900 mt-1">Envio Frio Prioritário</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Embalagem isotérmica com isolamento térmico e código de rastreamento CTT Expresso ou DHL entregue em mãos.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col gap-2 relative">
            <span className="w-8 h-8 rounded-xl bg-[#006750] text-white font-mono font-black text-sm flex items-center justify-center">
              04
            </span>
            <h4 className="font-bold text-sm text-slate-900 mt-1">Revenda com +300%</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Entregue laudos de pureza aos seus compradores, fidelize a carteira e reponha o stock mensalmente com lucro garantido.
            </p>
          </div>
        </div>
      </section>

      {/* 6. PERGUNTAS FREQUENTES SOBRE REVENDA */}
      <section className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200/80 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono uppercase font-bold text-[#006750] tracking-wider">
            Dúvidas Comuns
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Perguntas Frequentes de Novos Revendedores
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/70 flex flex-col gap-1.5">
            <span className="font-bold text-slate-900 text-sm">
              Posso mesclar peptídeos diferentes no pack de 20 unidades?
            </span>
            <p className="text-slate-600 leading-relaxed">
              Sim! O pedido mínimo são 20 frascos, e você pode combinar por exemplo 10 frascos de Retatrutide e 10 frascos de Tirzepatide, ou a combinação que melhor atender a sua carteira de clientes.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/70 flex flex-col gap-1.5">
            <span className="font-bold text-slate-900 text-sm">
              Qual é a validade e forma de armazenamento dos frascos?
            </span>
            <p className="text-slate-600 leading-relaxed">
              Na forma de pó liofilizado sob vácuo, a estabilidade é de <strong>24 a 36 meses</strong> conservado sob refrigeração simples (2°C a 8°C). Isso garante estocagem segura sem perda de potência.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/70 flex flex-col gap-1.5">
            <span className="font-bold text-slate-900 text-sm">
              Como funciona o envio para o meu endereço?
            </span>
            <p className="text-slate-600 leading-relaxed">
              Os packs são embalados em caixas com proteção isotérmica térmica e almofadas térmicas de refrigeração. O pacote externo é totalmente neutro e discreto para total sigilo e segurança.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/70 flex flex-col gap-1.5">
            <span className="font-bold text-slate-900 text-sm">
              Recebo suporte para orientar os meus clientes sobre doses?
            </span>
            <p className="text-slate-600 leading-relaxed">
              Com certeza. Fornecemos todo o suporte sobre reconstituição em água bacteriostática (BAC water), equivalências em unidades de insulina e literatura clínica de suporte.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="bg-gradient-to-r from-[#006750] via-[#08735b] to-[#0d8267] rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center flex flex-col items-center gap-5">
        <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-xs">
          Vagas Limitadas por Região
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black max-w-2xl leading-tight">
          Pronto para Ter a Sua Própria Operação de Peptídeos com Mais de 300% de Lucro?
        </h2>
        <p className="text-emerald-100 text-xs sm:text-sm max-w-xl leading-relaxed">
          Inicie agora com o <strong>pack mínimo oficial de 20 unidades</strong>. Clique abaixo e fale diretamente com o nosso responsável de atacado no WhatsApp para receber o catálogo completo com preços de revenda.
        </p>
        <a
          href={createWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-[#006750] hover:bg-emerald-50 font-black text-sm sm:text-base shadow-lg shadow-emerald-950/30 active:scale-95 transition-all cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 text-[#25D366] fill-[#25D366]" />
          <span>Falar com o Consultor de Revenda no WhatsApp</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </section>
    </div>
  );
};
