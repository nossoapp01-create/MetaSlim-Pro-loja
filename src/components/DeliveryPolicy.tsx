import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Truck,
  Package,
  Clock,
  MapPin,
  AlertCircle,
  ShieldCheck,
  Thermometer,
  HelpCircle,
  MessageSquare,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const DeliveryPolicy: React.FC = () => {
  const { setActiveTab, settings } = useStore();

  const handleWhatsapp = () => {
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(
      `https://wa.me/${cleanNumber}?text=Olá,%20gostaria%20de%20tirar%20uma%20dúvida%20sobre%20os%20prazos%20de%20entrega%20da%20minha%20encomenda`,
      '_blank'
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16" id="delivery-policy-view">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-hidden">
          <button
            onClick={() => setActiveTab('inicio')}
            className="hover:text-[#006750] transition-colors flex items-center gap-1"
          >
            <span>Início</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#006750] font-semibold truncate">Prazos e Condições de Entrega</span>
        </div>

        <button
          onClick={() => setActiveTab('produtos')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006750] hover:text-[#0b745c] bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Catálogo</span>
        </button>
      </div>

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#006750] via-[#09755d] to-[#0f876b] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#93f5d4] w-fit border border-white/20">
            <Truck className="w-4 h-4 text-[#71face]" />
            <span>Logística Especializada &amp; Cadeia de Frio</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Prazos e Condições de Entrega
          </h1>

          <p className="text-sm sm:text-base text-emerald-50 max-w-2xl leading-relaxed">
            O tempo estimado para a receção da sua encomenda varia consoante a disponibilidade do artigo e o destino de envio.
          </p>
        </div>
      </section>

      {/* Main Delivery Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: Artigos em Stock */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-[#006750]" />
          
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006750] flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Artigos em Stock</h2>
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider font-mono">
                    Pronta Expedição
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Despacho Rápido
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Produtos disponíveis de imediato no centro de distribuição climatizado com expedição priorizada.
            </p>

            <div className="flex flex-col gap-3">
              {/* Portugal Continental */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#006750] shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Portugal Continental</span>
                    <span className="text-[11px] text-slate-500">CTT Expresso / DPD 24-48h</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-xs font-mono font-bold text-[#006750] shadow-xs">
                    2 a 5 dias úteis
                  </span>
                </div>
              </div>

              {/* Açores e Madeira */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#006750] shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Açores e Madeira</span>
                    <span className="text-[11px] text-slate-500">Envio aéreo prioritário</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-xs font-mono font-bold text-[#006750] shadow-xs">
                    até 10 dias úteis
                  </span>
                </div>
              </div>

              {/* Restante Europa */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#006750] shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Restante Europa</span>
                    <span className="text-[11px] text-slate-500">Espanha, França, Alemanha, Itália, etc.</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-xs font-mono font-bold text-[#006750] shadow-xs">
                    3 a 12 dias úteis
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50/50 p-2.5 rounded-xl">
            <Thermometer className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Acondicionamento com isolamento térmico e gel refrigerante.</span>
          </div>
        </div>

        {/* CARD 2: Artigos por Encomenda */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-indigo-600" />
          
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Artigos por Encomenda</h2>
                  <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider font-mono">
                    Sem Stock Imediato
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full">
                <Layers className="w-3 h-3 text-amber-600" />
                Síntese / Produção
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Compostos liofilizados que demandam lote sob demanda, controle analítico de cromatografia HPLC e esterilização certificada antes da expedição.
            </p>

            <div className="flex flex-col gap-3">
              {/* Todos os Destinos */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/30 border border-amber-200/70">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Todos os destinos</span>
                    <span className="text-[11px] text-slate-500">Portugal, Ilhas, Europa e Internacional</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-mono font-bold text-amber-900 shadow-xs">
                    12 a 20 dias úteis
                  </span>
                </div>
              </div>

              {/* Informação sobre o processo sob encomenda */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Por que alguns artigos levam este prazo?</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Para garantir pureza superior a 99% e frescor celular do peptídeo, determinados itens raros ou concentrações especiais são liofilizados e analisados por lote individual antes de seguirem para o cliente.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-amber-900 bg-amber-50/60 p-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Controle de lote com laudo COA garantido na entrega.</span>
          </div>
        </div>
      </div>

      {/* Informação Adicional Relevante */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/70 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2.5 text-[#006750]">
          <AlertCircle className="w-5 h-5 text-[#006750]" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Informação Adicional
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[#006750] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-900">Início da Contagem de Prazo</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Os prazos começam a contar a partir da <strong>confirmação do pagamento</strong> e envio do comprovativo de expedição com o respetivo código de rastreamento.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
            <Layers className="w-5 h-5 text-[#006750] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-900">Combinação de Artigos no Pedido</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Caso a sua encomenda combine artigos em stock com artigos sob encomenda, os produtos serão enviados <strong>em conjunto assim que todos estiverem disponíveis</strong> (salvo indicação em contrário).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Protocolo de Envio e Segurança Térmica */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800 flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-[#71face]" />
            <h3 className="text-base font-bold text-white">
              Garantia de Transporte &amp; Embalagem Isotérmica
            </h3>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#93f5d4] bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60">
            Cadeia de Frio 2°C a 8°C
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex flex-col gap-1.5">
            <span className="font-bold text-white">1. Rastreamento em Tempo Real</span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Receba notificações automáticas de status e código de rastreamento para acompanhar o percurso da encomenda desde a recolha até a entrega.
            </p>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex flex-col gap-1.5">
            <span className="font-bold text-white">2. Discreção Absoluta</span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Embalagem externa neutra e segura, sem menção ostensiva externa a fórmulas ou compostos, garantindo a sua total privacidade.
            </p>
          </div>
        </div>
      </section>

      {/* Dúvidas e Contacto de Suporte */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#006750] shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-base text-slate-900">
              Precisa de entrega urgente ou tem alguma dúvida?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-lg mt-0.5">
              Nossa equipe médica e de apoio logístico está disponível via WhatsApp para confirmar a disponibilidade de stock em tempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleWhatsapp}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#006750] hover:bg-[#0b745c] text-white font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-[#71face]" />
            <span>Falar no WhatsApp</span>
          </button>
        </div>
      </section>
    </div>
  );
};
