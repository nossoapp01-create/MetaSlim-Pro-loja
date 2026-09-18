import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { getClinicalSheet, ClinicalSheetData } from '../data/clinicalSheets';
import {
  Activity,
  Flame,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Syringe,
  Dna,
  Zap,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Download,
  Info,
  Layers,
  Thermometer,
  Lock,
  ChevronDown,
  FileSpreadsheet,
  Check,
  TrendingUp,
  TrendingDown,
  Droplets,
  Calculator,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ClinicalInfographicSheetProps {
  product: Product;
  onOpenCalculator?: () => void;
  onAddToCart?: (vials: number) => void;
  onDirectBuy?: () => void;
  selectedVials?: number;
  onSelectVials?: (vials: number) => void;
}

export const ClinicalInfographicSheet: React.FC<ClinicalInfographicSheetProps> = ({
  product,
  onOpenCalculator,
  onAddToCart,
  onDirectBuy,
  selectedVials = 1,
  onSelectVials,
}) => {
  const { formatPrice, showToast } = useStore();
  const data: ClinicalSheetData = getClinicalSheet(product.id, product.name);

  // Countdown timer matching the user's uploaded image (46:00)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(46 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 46 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  const handleDownloadSheet = () => {
    showToast(`Baixando Ficha Clínica Didática de ${product.name} (PDF)...`);
  };

  return (
    <div className="flex flex-col gap-5 w-full text-[#131b2e]" id="clinical-visual-sheet">
      {/* 1. TOP PROMOTIONAL COUNTDOWN BANNER (Matches user reference image) */}
      <div className="overflow-hidden rounded-2xl shadow-md border border-rose-200">
        {/* Red Countdown Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 p-4 sm:p-5 text-white flex flex-col items-center justify-center text-center gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-amber-200 animate-pulse">
            <span>🔥</span>
            <span>APROVEITE O PREÇO PROMOCIONAL POR TEMPO LIMITADO</span>
            <span>🔥</span>
          </div>

          {/* Large Countdown Cards */}
          <div className="flex items-center gap-3 sm:gap-4 font-mono">
            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="w-16 sm:w-20 h-14 sm:h-16 rounded-xl bg-black/35 backdrop-blur-xs border border-white/20 flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-inner">
                {String(minutes).padStart(2, '0')}
              </div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest mt-1 text-white/80">
                MINUTOS
              </span>
            </div>

            <span className="text-3xl sm:text-4xl font-black text-amber-300 -mt-4">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div className="w-16 sm:w-20 h-14 sm:h-16 rounded-xl bg-black/35 backdrop-blur-xs border border-white/20 flex items-center justify-center text-3xl sm:text-4xl font-black text-amber-300 shadow-inner">
                {String(seconds).padStart(2, '0')}
              </div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest mt-1 text-white/80">
                SEGUNDOS
              </span>
            </div>
          </div>
        </div>

        {/* Green "O Mais Vendido" / Highlight Strip */}
        <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-[#006750] py-2.5 px-4 text-center text-white text-xs sm:text-sm font-black tracking-widest uppercase flex items-center justify-center gap-2 shadow-xs">
          <span>★</span>
          <span>{product.badge ? product.badge.toUpperCase() : 'O MAIS VENDIDO • LAUDO HPLC >99%'}</span>
          <span>★</span>
        </div>
      </div>

      {/* 2. THE CLINICAL INFOGRAPHIC SHEET (Replicating exact didactic layout from reference images) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-7 flex flex-col gap-6">
        {/* Infographic Header */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#006750] text-[#71face] flex items-center justify-center shadow-xs">
                  <Dna className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                    {data.peptideName}
                  </h2>
                  <p className="text-xs text-[#006750] font-semibold font-mono">
                    {data.scientificName}
                  </p>
                </div>
              </div>
            </div>

            {/* Print/Download Sheet Quick Action */}
            <button
              onClick={handleDownloadSheet}
              className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#006750]" />
              <span>Exportar Ficha Didática</span>
            </button>
          </div>

          {/* Badges Ribbon (Route, Frequency, Experimental Use) */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">
              <Dna className="w-3.5 h-3.5 text-[#006750]" />
              <span>{data.moleculeType}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-mono text-[11px] font-semibold border border-emerald-200/60">
              <Syringe className="w-3.5 h-3.5 text-[#006750]" />
              <span>{data.route}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-mono text-[11px] font-semibold border border-blue-200/60">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{data.frequency}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#006750] text-white font-mono text-[11px] font-bold shadow-xs">
              <Sparkles className="w-3 h-3 text-[#71face]" />
              <span>{data.classification}</span>
            </div>
          </div>

          <div className="mt-2 text-slate-400 text-[11px] font-medium italic">
            Ficha clínica visual para consulta rápida e auto-didática • Uso profissional e laboratorial
          </div>
        </div>

        {/* SECTION 1 & SECTION 2: VISÃO RÁPIDA & PARA QUE SERVE (2 Columns Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SECTION 1: VISÃO RÁPIDA (Teal badge) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#006750] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                1
              </div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 font-sans">
                VISÃO RÁPIDA
              </h3>
            </div>

            <ul className="flex flex-col gap-2 text-xs text-slate-600 mt-1">
              {data.quickVision.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006750] mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 2: PARA QUE SERVE (Green badge) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  2
                </div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 font-sans">
                  PARA QUE SERVE
                </h3>
              </div>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                {data.purposeIcon === 'metabolism' && <Flame className="w-4 h-4 text-emerald-700" />}
                {data.purposeIcon === 'muscle' && <Activity className="w-4 h-4 text-emerald-700" />}
                {data.purposeIcon === 'skin' && <Sparkles className="w-4 h-4 text-emerald-700" />}
                {data.purposeIcon === 'longevity' && <Dna className="w-4 h-4 text-emerald-700" />}
              </div>
            </div>

            <ul className="flex flex-col gap-2 text-xs text-slate-700 mt-1">
              {data.primaryPurposes.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span className="font-medium text-slate-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SECTION 3: MECANISMO DE AÇÃO (Cascade Pathway Infographic) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-indigo-50/40 to-slate-50/70 border border-indigo-200/60 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                3
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 font-sans">
                  MECANISMO DE AÇÃO BIOLÓGICO
                </h3>
                <span className="text-[11px] text-indigo-700 font-semibold font-mono">
                  {data.mechanismTitle}
                </span>
              </div>
            </div>
            <Zap className="w-4 h-4 text-indigo-500" />
          </div>

          {/* Biological Cascade Steps with Arrows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {data.mechanismCascade.map((step, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-indigo-100 shadow-xs flex flex-col justify-between relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                    Etapa 0{step.stepNumber}
                  </span>
                  {step.direction === 'up' && (
                    <span className="flex items-center text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                      <TrendingUp className="w-3 h-3 mr-0.5" /> Ativação
                    </span>
                  )}
                  {step.direction === 'down' && (
                    <span className="flex items-center text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                      <TrendingDown className="w-3 h-3 mr-0.5" /> Redução
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-xs text-slate-900 leading-snug">
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-indigo-100/70 italic">
            <strong>Síntese Farmacológica:</strong> {data.mechanismSummary}
          </p>
        </div>

        {/* SECTION 4: DOSES E PROTOCOLOS SUGERIDOS NA LITERATURA / PRÁTICA (Two Columns) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                4
              </div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 font-sans">
                DOSES E PROTOCOLOS DESCRITOS NA LITERATURA / PRÁTICA
              </h3>
            </div>
            {onOpenCalculator && (
              <button
                type="button"
                onClick={onOpenCalculator}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calculadora de Reconstituição</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box A: Monoterapia / Escalonamento */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                  A
                </span>
                <h4 className="text-xs font-bold text-slate-800">
                  1) MONOTERAPIA (Escalonamento Semanal / Diário)
                </h4>
              </div>

              <div className="flex flex-col divide-y divide-slate-100">
                {data.protocolDoses.map((p, idx) => (
                  <div key={idx} className="py-2 first:pt-0 last:pb-0 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{p.phase}</span>
                      <span className="font-mono font-bold text-xs text-[#006750] bg-emerald-50 px-1.5 py-0.5 rounded">
                        {p.dose}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{p.frequency}</span>
                    <p className="text-[11px] text-slate-500 leading-snug">{p.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Box B: Resumo Prático de Aplicação */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                  B
                </span>
                <h4 className="text-xs font-bold text-slate-800">
                  2) RESUMO PRÁTICO &amp; DIRETRIZES
                </h4>
              </div>

              <div className="flex flex-col gap-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800">Janela Ideal:</strong> {data.practicalSummary.timing}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Droplets className="w-3.5 h-3.5 text-cyan-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800">Hidratação:</strong> {data.practicalSummary.hydration}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800">Aporte Nutricional:</strong> {data.practicalSummary.nutrition}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-700 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800">Armazenamento:</strong> {data.practicalSummary.storage}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800">Monitoramento:</strong> {data.practicalSummary.monitoring}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5 & SECTION 6: CONTRAINDICAÇÕES & PRECAUÇÕES (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SECTION 5: CONTRAINDICAÇÕES (Red badge) */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                5
              </div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-900 font-sans">
                CONTRAINDICAÇÕES / EVITAR
              </h3>
            </div>

            <ul className="flex flex-col gap-2 text-xs text-rose-800/90">
              {data.contraindications.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 6: PRECAUÇÕES (Orange badge) */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                6
              </div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-900 font-sans">
                PRECAUÇÕES CLÍNICAS
              </h3>
            </div>

            <ul className="flex flex-col gap-2 text-xs text-amber-800/90">
              {data.precautions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SECTION 7: FARMACOCINÉTICA & MEIA-VIDA (Cyan/Blue badge) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/40 border border-sky-200/70 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                7
              </div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 font-sans">
                FARMACOCINÉTICA &amp; MEIA-VIDA
              </h3>
            </div>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-sky-100 flex flex-col">
              <span className="font-mono text-[9px] uppercase font-bold text-slate-400">Meia-Vida</span>
              <span className="font-bold text-slate-900 text-xs mt-0.5">
                {data.pharmacokinetics.halfLife}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-sky-100 flex flex-col">
              <span className="font-mono text-[9px] uppercase font-bold text-slate-400">Pico Plasmático</span>
              <span className="font-bold text-slate-900 text-xs mt-0.5">
                {data.pharmacokinetics.peakTime}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-sky-100 flex flex-col">
              <span className="font-mono text-[9px] uppercase font-bold text-slate-400">Steady-State</span>
              <span className="font-bold text-slate-900 text-xs mt-0.5">
                {data.pharmacokinetics.steadyState}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-sky-100 flex flex-col">
              <span className="font-mono text-[9px] uppercase font-bold text-slate-400">Depuração / Saída</span>
              <span className="font-bold text-slate-900 text-xs mt-0.5 truncate">
                {data.pharmacokinetics.elimination}
              </span>
            </div>
          </div>
        </div>

        {/* Action strip inside the clinical sheet */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldAlert className="w-4 h-4 text-[#006750]" />
            <span>Informações fundamentadas em ensaios clínicos e laudo HPLC.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onAddToCart && (
              <button
                type="button"
                onClick={() => onAddToCart(selectedVials)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
              >
                Adicionar ao Carrinho
              </button>
            )}

            {onDirectBuy && (
              <button
                type="button"
                onClick={onDirectBuy}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#006750] hover:bg-[#0d8267] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <span>Comprar com Frete Refrigerado</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
