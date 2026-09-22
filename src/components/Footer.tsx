import React from 'react';
import { useStore } from '../context/StoreContext';
import { Dna, ShieldCheck, Lock, PhoneCall, Mail, MessageSquare, Truck, TrendingUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setActiveTab } = useStore();

  const handleWhatsapp = () => {
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=Olá,%20gostaria%20de%20informações%20sobre%20os%20peptídeos%20MetaSlim%20Pro`, '_blank');
  };

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
                  alt={settings.storeName}
                  className="h-10 max-h-10 max-w-[160px] object-contain rounded-lg bg-white/5 p-1"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-[#006750] flex items-center justify-center text-[#93f5d4] shadow-md">
                  <Dna className="w-5 h-5" />
                </div>
              )}
              <span className="text-xl font-extrabold text-white tracking-tight">
                {settings.storeName}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Líder em biossíntese de peptídeos agonistas triplos (GLP-1/GIP/Glucagon), tirzepatide e compostos regenerativos liofilizados com controle analítico por HPLC.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleWhatsapp}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-[#71face] border border-emerald-500/30 text-xs font-semibold transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Suporte Clínico: {settings.whatsappNumber}</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase font-bold text-white tracking-wider">
              Navegação
            </span>
            <button
              onClick={() => setActiveTab('inicio')}
              className="text-xs text-slate-400 hover:text-[#71face] text-left transition-colors"
            >
              Início
            </button>
            <button
              onClick={() => setActiveTab('produtos')}
              className="text-xs text-slate-400 hover:text-[#71face] text-left transition-colors"
            >
              Catálogo de Peptídeos
            </button>
            <button
              onClick={() => setActiveTab('resultados')}
              className="text-xs text-slate-400 hover:text-[#71face] text-left transition-colors"
            >
              Antes &amp; Depois dos Clientes
            </button>
            <button
              onClick={() => setActiveTab('carrinho')}
              className="text-xs text-slate-400 hover:text-[#71face] text-left transition-colors"
            >
              Carrinho de Compras
            </button>
            <button
              onClick={() => setActiveTab('prazos-entrega')}
              className="text-xs text-[#71face] hover:text-[#93f5d4] text-left transition-colors flex items-center gap-1.5 font-medium"
            >
              <Truck className="w-3.5 h-3.5 text-[#71face]" />
              <span>Prazos de Entrega</span>
            </button>
            <button
              onClick={() => setActiveTab('revenda')}
              className="text-xs text-amber-300 hover:text-amber-200 text-left transition-colors flex items-center gap-1.5 font-semibold"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Programa de Revenda (Lucros &gt; 300%)</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="text-xs text-emerald-400 hover:text-emerald-300 text-left font-semibold transition-colors"
            >
              Painel do Administrador
            </button>
          </div>

          {/* Compliance & Lab Certification */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase font-bold text-white tracking-wider">
              Garantia &amp; Qualidade
            </span>
            <button
              onClick={() => setActiveTab('prazos-entrega')}
              className="flex items-start gap-2 text-xs text-slate-400 hover:text-[#71face] text-left transition-colors cursor-pointer group"
            >
              <Truck className="w-4 h-4 text-[#71face] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <span>Prazos: 2 a 5 dias úteis em stock (Portugal / Europa).</span>
            </button>
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#71face] shrink-0 mt-0.5" />
              <span>HPLC Pureza &gt; 99% comprovada por laudo analítico anexo.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <Lock className="w-4 h-4 text-[#71face] shrink-0 mt-0.5" />
              <span>Transações protegidas por gateway bancário internacional 256-bit.</span>
            </div>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p className="text-center sm:text-left">
            &copy; 2026 {settings.storeName}. Todos os direitos reservados. Expedição climatizada para Portugal, Espanha, União Europeia e Brasil.
          </p>
          <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
            <span>MB WAY</span>
            <span>•</span>
            <span>MULTIBANCO</span>
            <span>•</span>
            <span>PIX BRASIL</span>
            <span>•</span>
            <span>CARTÃO</span>
            <span>•</span>
            <span>CRIPTO</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
