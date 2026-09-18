import React, { useState } from 'react';
import { OrderRecord } from '../types';
import {
  Printer,
  X,
  Copy,
  Check,
  Truck,
  Package,
  ShieldCheck,
  MessageSquare,
  ThermometerSnowflake,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  User,
  Barcode,
} from 'lucide-react';

interface ShippingLabelModalProps {
  order: OrderRecord;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, newStatus: OrderRecord['status'], trackingCode?: string) => void;
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const [trackingInput, setTrackingInput] = useState(order.trackingCode || `CTT-PT-${order.id.replace(/\D/g, '').slice(-8) || '92817340'}`);
  const [carrierInput, setCarrierInput] = useState(order.carrier || 'CTT Expresso / DHL Cold');

  const handlePrint = () => {
    window.print();
  };

  const formattedAddressText = `
DESTINATÁRIO:
Nome: ${order.shipping.fullName}
Telefone/WhatsApp: ${order.shipping.phone}
E-mail: ${order.shipping.email}
Endereço: ${order.shipping.address}${order.shipping.complement ? ', ' + order.shipping.complement : ''}
Código Postal: ${order.shipping.postalCode}
Cidade: ${order.shipping.city}
País: ${order.shipping.country}
${order.deliveryNotes ? `Obs: ${order.deliveryNotes}` : ''}
Pedido: #${order.id}
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedAddressText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveTracking = () => {
    if (onUpdateStatus) {
      onUpdateStatus(order.id, 'shipped', trackingInput);
    }
  };

  const cleanPhone = order.shipping.phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Olá ${order.shipping.fullName}! Seu pedido #${order.id} da MetaSlim Pro foi preparado com embalagem isotérmica e despacho refrigerado. Código de Rastreio: ${trackingInput} (${carrierInput}).`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Print styling specifically for the label */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-shipping-label, #printable-shipping-label * {
            visibility: visible !important;
          }
          #printable-shipping-label {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 16px !important;
            box-shadow: none !important;
            border: 2px solid #000 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="no-print bg-[#131b2e] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#006750] text-white flex items-center justify-center shadow-sm">
              <Truck className="w-5 h-5 text-[#93f5d4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Etiqueta Oficial de Despacho &amp; Envio
                </h3>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  Pronta para Impressão
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Pedido #{order.id} • {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'itens'} • {order.currency.toUpperCase()} {order.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#006750] hover:bg-[#0d8267] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir Etiqueta</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
          {/* Quick Action Toolbar */}
          <div className="no-print bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="flex-1">
                <label className="text-[10px] font-mono text-slate-500 block">CÓDIGO DE RASTREIO</label>
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Ex: CTT-PT-12345678"
                  className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-mono text-slate-500 block">TRANSPORTADORA</label>
                <input
                  type="text"
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  placeholder="Ex: CTT Expresso"
                  className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800"
                />
              </div>
              <button
                onClick={handleSaveTracking}
                className="self-end h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="h-8 px-3 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Copiar dados para colar no site dos CTT / DHL / Correios"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copiado!' : 'Copiar Dados'}</span>
              </button>

              {cleanPhone && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-3 rounded-lg bg-[#006750] hover:bg-[#0d8267] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Avisar no WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* THE PRINTABLE SHIPPING LABEL (Standard Physical Courier Spec) */}
          <div
            id="printable-shipping-label"
            className="bg-white border-2 border-slate-900 rounded-2xl p-5 sm:p-6 text-slate-900 flex flex-col gap-4 font-sans shadow-md"
          >
            {/* Header: Carrier & Cold Chain Priority */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-3">
                <div className="font-black text-xl tracking-tighter text-slate-900 flex items-center gap-1">
                  <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-sm font-mono">EXPRESS</span>
                  <span>{carrierInput || 'CTT EXPRESSO / DHL'}</span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="font-mono font-bold text-xs bg-black text-white px-2 py-0.5 rounded">
                  PRIORIDADE 24H
                </span>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Rastreio: {trackingInput}
                </span>
              </div>
            </div>

            {/* Cold Chain Warning Banner */}
            <div className="bg-sky-50 border border-sky-300 rounded-xl p-2.5 flex items-center justify-between gap-3 text-sky-950">
              <div className="flex items-center gap-2">
                <ThermometerSnowflake className="w-5 h-5 text-sky-600 shrink-0" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block">
                    ❄️ PRODUTO TERMOSSENSÍVEL — REFRIGERADO (2°C A 8°C)
                  </span>
                  <span className="text-[10.5px] text-sky-800">
                    Contém gel de transporte farmacêutico liofilizado. Não expor ao calor. Entrega urgente.
                  </span>
                </div>
              </div>
              <span className="font-mono font-bold text-xs bg-sky-200 text-sky-900 px-2 py-1 rounded shrink-0">
                LAB URGENTE
              </span>
            </div>

            {/* Main Destination (DESTINATÁRIO) - High visual contrast for delivery driver */}
            <div className="border-2 border-slate-900 rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-300">
                <span className="font-mono text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-800" />
                  <span>DESTINATÁRIO / ENTREGA</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  PAGAMENTO CONFIRMADO
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-lg font-black text-slate-950 tracking-tight uppercase">
                  {order.shipping.fullName}
                </div>

                <div className="flex items-start gap-1.5 text-sm text-slate-900 font-semibold mt-1">
                  <MapPin className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                  <span>
                    {order.shipping.address}
                    {order.shipping.complement ? ` (${order.shipping.complement})` : ''}
                  </span>
                </div>

                {/* Postal Code & City Highlighted */}
                <div className="flex flex-wrap items-center gap-3 mt-1.5 pt-1.5 border-t border-slate-200">
                  <div className="bg-slate-900 text-white font-mono font-black text-base px-3 py-1 rounded-lg">
                    {order.shipping.postalCode}
                  </div>
                  <div className="text-base font-extrabold text-slate-950 uppercase">
                    {order.shipping.city}
                  </div>
                  <div className="text-sm font-bold text-slate-700 uppercase font-mono ml-auto">
                    {order.shipping.country}
                  </div>
                </div>

                {/* Contact Phone & Email */}
                <div className="flex flex-wrap items-center gap-4 mt-2 pt-2 border-t border-slate-200 text-xs text-slate-800 font-bold">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1 rounded-lg">
                    <Phone className="w-3.5 h-3.5 text-[#006750]" />
                    <span>Tel/WhatsApp: {order.shipping.phone}</span>
                  </div>
                  {order.shipping.email && (
                    <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1 rounded-lg">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{order.shipping.email}</span>
                    </div>
                  )}
                </div>

                {/* Delivery Notes */}
                {(order.deliveryNotes || order.shipping.notes) && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950">
                    <strong>Obs. do Cliente:</strong> {order.deliveryNotes || order.shipping.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Sender (REMETENTE) Block */}
            <div className="border border-slate-300 rounded-xl p-3 bg-white text-xs text-slate-700 flex flex-col gap-1">
              <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                REMETENTE (DEVOLUÇÃO EM CASO DE NÃO ENTREGA):
              </span>
              <div className="font-bold text-slate-900">
                MetaSlim Pro Laboratories &bull; Centro de Despacho Térmico UE
              </div>
              <div className="text-[11px] text-slate-600">
                Avenida da Liberdade 245, 4º Andar, 1250-143 Lisboa, Portugal &bull; Tel: +351 912 345 678
              </div>
            </div>

            {/* Order Contents & Barcode Footer */}
            <div className="border-t-2 border-slate-900 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-col text-xs text-slate-700">
                <span className="font-mono font-bold text-slate-900">
                  CONTEÚDO DECLARADO:
                </span>
                <span className="text-[11px] text-slate-600">
                  {order.items && order.items.length > 0
                    ? order.items.map((it) => `${it.productName} (${it.quantity}x)`).join(', ')
                    : `Protocolo MetaSlim Pro (${order.itemsCount} itens)`}
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Valor Declarado: {order.currency.toUpperCase()} {order.totalAmount.toFixed(2)} &bull; Peso Estimado: 280g
                </span>
              </div>

              {/* Graphical Barcode Simulation */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-[2px] h-10 px-2 py-1 bg-white border border-slate-300 rounded">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2].map((w, idx) => (
                    <div
                      key={idx}
                      className="bg-black h-full"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] font-bold tracking-widest mt-0.5">
                  *{order.id}*
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="no-print bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Dica: Ao clicar em <strong>Imprimir</strong>, selecione papel etiqueta 100x150mm ou A4.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-[#006750] hover:bg-[#0d8267] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Agora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
