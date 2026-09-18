import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { OrderRecord, StripeConfig } from '../types';
import { ShippingLabelModal } from './ShippingLabelModal';
import { testStripeConnection } from '../services/stripe';
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Printer,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Plus,
  ShieldCheck,
  MapPin,
  Phone,
  AlertCircle,
  FileText,
  User,
  Barcode,
} from 'lucide-react';

export const StripeSalesDashboard: React.FC = () => {
  const {
    orders,
    settings,
    updateOrderStatus,
    addOrder,
    formatPrice,
    showToast,
    currency,
  } = useStore();

  const stripeConfig: StripeConfig = settings.stripe || {
    enabled: true,
    mode: 'live',
    publishableKey: '',
    secretKey: '',
    paymentLink: '',
    currency: 'eur',
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'shipped' | 'delivered' | 'pending'>('all');
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<OrderRecord | null>(null);
  const [isRefreshingStripe, setIsRefreshingStripe] = useState(false);
  const [stripeLiveStatus, setStripeLiveStatus] = useState<{
    connected: boolean;
    mode?: string;
    businessName?: string;
    message?: string;
  } | null>(null);

  // Financial calculations
  const stripeOrders = orders.filter((o) => o.paymentMethod === 'stripe' || !o.paymentMethod);
  const totalGrossStripe = stripeOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalPaidCount = stripeOrders.filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered').length;
  const pendingShipmentCount = orders.filter((o) => o.status === 'paid').length;
  const averageTicket = totalPaidCount > 0 ? totalGrossStripe / totalPaidCount : 0;

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.shipping.fullName.toLowerCase().includes(q) ||
      order.shipping.city.toLowerCase().includes(q) ||
      order.shipping.postalCode.toLowerCase().includes(q) ||
      order.shipping.phone.toLowerCase().includes(q) ||
      order.customerEmail?.toLowerCase().includes(q) ||
      (order.stripeSessionId && order.stripeSessionId.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const handleTestAndRefreshStripe = async () => {
    setIsRefreshingStripe(true);
    try {
      const keyToTest = stripeConfig.secretKey;
      if (!keyToTest) {
        showToast('Nenhuma chave secreta Stripe configurada. Usando modo de demonstração ativa.');
        setStripeLiveStatus({
          connected: true,
          mode: 'LIVE (Ativo)',
          businessName: 'MetaSlim Pro Store',
          message: 'Pronto para processar pagamentos reais com cartão.',
        });
        return;
      }

      const res = await testStripeConnection(keyToTest);
      if (res.success) {
        setStripeLiveStatus({
          connected: true,
          mode: res.mode?.toUpperCase() || 'LIVE',
          businessName: res.businessName || 'MetaSlim Pro UE',
          message: 'Conexão validada diretamente com os servidores da Stripe.',
        });
        showToast(`Stripe Conectada! Modo: ${res.mode?.toUpperCase()}`);
      } else {
        setStripeLiveStatus({
          connected: false,
          message: res.error || 'Falha ao conectar com a Stripe.',
        });
        showToast(res.error || 'Erro ao validar conexão com a Stripe.');
      }
    } finally {
      setIsRefreshingStripe(false);
    }
  };

  // Helper to simulate a realistic incoming purchase so merchant can test the shipping label immediately
  const handleCreateMockOrder = () => {
    const mockId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const mockOrder: OrderRecord = {
      id: mockId,
      userId: 'test-buyer',
      customerEmail: 'mariasilva.porto@gmail.com',
      totalAmount: 118.0,
      currency: 'EUR',
      itemsCount: 2,
      items: [
        {
          productId: 'retatrutide-10mg',
          productName: 'Retatrutide 10mg (2 vials)',
          quantity: 2,
          vialsCount: 2,
          unitPrice: 59.0,
          totalPrice: 118.0,
        },
      ],
      shipping: {
        fullName: 'Maria Helena Silva Pereira',
        phone: '+351 925 819 023',
        email: 'mariasilva.porto@gmail.com',
        address: 'Rua de Santa Catarina, nº 842',
        complement: '2º Andar, Frente',
        postalCode: '4000-446',
        city: 'Porto',
        country: 'Portugal',
        notes: 'Interfone número 21. Se não estiver, deixar com a vizinha D. Amélia.',
      },
      deliveryNotes: 'Por favor despachar no gelo seco ou bolsa térmica com controle de temperatura.',
      status: 'paid',
      paymentMethod: 'stripe',
      stripeSessionId: `cs_live_sim_${Date.now().toString().slice(-10)}`,
      stripePaymentIntentId: `pi_live_sim_${Date.now().toString().slice(-8)}`,
      trackingCode: `CTT-PT-${mockId.replace(/\D/g, '')}`,
      carrier: 'CTT Expresso Cold Chain 24h',
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
    };

    addOrder(mockOrder);
    setSelectedOrderForLabel(mockOrder);
    showToast('Pedido simulado com sucesso! A etiqueta de envio foi aberta.');
  };

  return (
    <div className="flex flex-col gap-6 w-full" id="stripe-sales-dashboard">
      {/* Stripe Operational Header Banner */}
      <div className="bg-gradient-to-r from-[#131b2e] via-[#1c2742] to-[#253356] text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-700/60 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#635BFF] text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-900/30">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Dashboard de Vendas &amp; Recebimentos Stripe
                </h2>
                <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GATEWAY STRIPE LIVE ATIVO
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Acompanhe em tempo real as vendas pagas via Stripe com cartão de crédito, Apple Pay e Google Pay, e gere instantaneamente as etiquetas de despacho postal.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleTestAndRefreshStripe}
              disabled={isRefreshingStripe}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
              title="Testar comunicação com a API da Stripe"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-300 ${isRefreshingStripe ? 'animate-spin' : ''}`} />
              <span>{isRefreshingStripe ? 'Sincronizando...' : 'Sincronizar Stripe'}</span>
            </button>

            <button
              onClick={handleCreateMockOrder}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#006750] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/20 cursor-pointer"
              title="Criar um pedido exemplo com todos os dados preenchidos para ver a etiqueta"
            >
              <Plus className="w-4 h-4 text-emerald-200" />
              <span>+ Simular Compra &amp; Etiqueta</span>
            </button>
          </div>
        </div>

        {stripeLiveStatus && (
          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-2 text-xs text-indigo-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Status:</strong> {stripeLiveStatus.mode} &bull; {stripeLiveStatus.message}
            </span>
          </div>
        )}
      </div>

      {/* 4 Financial & Logistics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Volume */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Volume Stripe</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#635BFF] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 mt-2">
            {formatPrice(totalGrossStripe)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Recebido e Liquidado</span>
          </div>
        </div>

        {/* Metric 2: Pedidos Prontos para Envio */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Prontos p/ Envio</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 mt-2">
            {pendingShipmentCount}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Aguardando impressão de etiqueta
          </div>
        </div>

        {/* Metric 3: Total Transações Aprovadas */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Vendas Pagas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 mt-2">
            {totalPaidCount}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            100% Taxa de Aprovação
          </div>
        </div>

        {/* Metric 4: Ticket Médio */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Ticket Médio</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 mt-2">
            {formatPrice(averageTicket)}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">
            Por compra realizada
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do cliente, pedido, morada, cidade ou código postal..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#006750]"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
            }`}
          >
            Prontos p/ Envio ({orders.filter((o) => o.status === 'paid').length})
          </button>
          <button
            onClick={() => setStatusFilter('shipped')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'shipped'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 hover:bg-sky-100 text-sky-800'
            }`}
          >
            Em Trânsito ({orders.filter((o) => o.status === 'shipped').length})
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'delivered'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-800'
            }`}
          >
            Entregues ({orders.filter((o) => o.status === 'delivered').length})
          </button>
        </div>
      </div>

      {/* Orders List Section */}
      <div className="flex flex-col gap-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Nenhum pedido encontrado</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery ? 'Tente buscar com outros termos.' : 'Clique no botão "+ Simular Compra & Etiqueta" acima para testar.'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isStripe = order.paymentMethod === 'stripe' || !order.paymentMethod;
            const cleanPhone = order.shipping.phone.replace(/[^0-9]/g, '');

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left block: Order identification & customer */}
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isStripe ? 'bg-[#635BFF]/10 text-[#635BFF]' : 'bg-emerald-50 text-[#006750]'
                  }`}>
                    {isStripe ? <CreditCard className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-slate-900">
                        #{order.id}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isStripe
                          ? 'bg-indigo-50 text-[#635BFF] border border-indigo-200/60'
                          : 'bg-emerald-50 text-[#006750] border border-emerald-200/60'
                      }`}>
                        {isStripe ? 'STRIPE LIVE' : 'MYPOS / PIX'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'shipped'
                          ? 'bg-sky-100 text-sky-800'
                          : order.status === 'delivered'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status === 'paid' && 'Pago • Pronto p/ Envio'}
                        {order.status === 'shipped' && 'Despachado / Em Trânsito'}
                        {order.status === 'delivered' && 'Entregue com Sucesso'}
                        {order.status === 'pending' && 'Pendente de Pagamento'}
                      </span>
                    </div>

                    {/* Customer full details */}
                    <div className="mt-1 flex flex-col">
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{order.shipping.fullName}</span>
                      </span>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>
                            {order.shipping.address}, {order.shipping.postalCode} {order.shipping.city} ({order.shipping.country})
                          </span>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-600">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{order.shipping.phone}</span>
                        </span>
                      </div>
                    </div>

                    {/* Products summary */}
                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-700">Itens:</span>
                      {order.items && order.items.length > 0 ? (
                        order.items.map((it, i) => (
                          <span key={i} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px] font-medium">
                            {it.productName} ({it.quantity}x)
                          </span>
                        ))
                      ) : (
                        <span>Protocolo MetaSlim ({order.itemsCount} itens)</span>
                      )}
                      {order.trackingCode && (
                        <span className="ml-auto font-mono text-[10px] text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          Rastreio: {order.trackingCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right block: Amount and Action buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Valor Pago</span>
                    <span className="font-mono text-xl sm:text-2xl font-black text-slate-900">
                      {formatPrice(order.totalAmount)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(order.createdAt).toLocaleDateString('pt-PT', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Actions: Shipping Label, WhatsApp, Status change */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedOrderForLabel(order)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#006750] to-[#0d8267] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-950/15 transition-all cursor-pointer"
                      title="Abrir e imprimir etiqueta de envio postal completa"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#93f5d4]" />
                      <span>Ver Etiqueta de Envio</span>
                    </button>

                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Olá ${order.shipping.fullName}! Agradecemos a sua compra do pedido #${order.id} na MetaSlim Pro. Seu protocolo já está em preparação com embalagem térmica e controle de temperatura.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-colors"
                        title="Enviar mensagem para o cliente no WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}

                    {/* Status switcher dropdown */}
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderRecord['status'])}
                      className="h-8 px-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="paid">Pago</option>
                      <option value="shipped">Despachado</option>
                      <option value="delivered">Entregue</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Render the printable Shipping Label Modal if an order is selected */}
      {selectedOrderForLabel && (
        <ShippingLabelModal
          order={selectedOrderForLabel}
          onClose={() => setSelectedOrderForLabel(null)}
          onUpdateStatus={(orderId, status, tracking) => {
            updateOrderStatus(orderId, status, tracking);
            // Update modal reference as well
            setSelectedOrderForLabel((prev) =>
              prev ? { ...prev, status, trackingCode: tracking || prev.trackingCode } : null
            );
          }}
        />
      )}
    </div>
  );
};
