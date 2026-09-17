import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Trash2,
  Plus,
  Minus,
  Truck,
  Lock,
  ArrowRight,
  ShieldCheck,
  Tag,
  CreditCard,
  Building2,
  Zap,
  Bitcoin,
  CheckCircle,
  HelpCircle,
  FileCheck,
  ShoppingBag,
  Clock,
  Sparkles,
} from 'lucide-react';

export const CartView: React.FC = () => {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    clearCart,
    formatPrice,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    couponCode,
    couponDiscountPercent,
    applyCoupon,
    removeCoupon,
    deliveryNotes,
    setDeliveryNotes,
    settings,
    setActiveTab,
    showToast,
  } = useStore();

  const [inputCoupon, setInputCoupon] = useState('');
  const [isCouponEditing, setIsCouponEditing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(14 * 60 + 59);

  // Reservation Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon) {
      applyCoupon(inputCoupon);
      setIsCouponEditing(false);
      setInputCoupon('');
    }
  };

  // Determine dynamic payment link
  const primaryItem = cart[0]?.product;
  const paymentUrl =
    primaryItem?.paymentLink ||
    `${settings.defaultPaymentLink}?amount=${cartTotal}&cart_items=${cart.length}`;

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      showToast('Seu carrinho está vazio.');
      return;
    }
    if (paymentUrl.startsWith('http')) {
      window.open(paymentUrl, '_blank');
    } else {
      showToast('Iniciando checkout seguro com gateway credenciado...');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#006750] mb-4 shadow-sm">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Seu Carrinho está Vazio</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-xs leading-relaxed">
          Selecione os peptídeos liofilizados com laudo HPLC para iniciar o seu protocolo clínico.
        </p>
        <button
          onClick={() => setActiveTab('produtos')}
          className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#006750] to-[#0d8267] text-white font-bold text-sm shadow-md active:scale-95 transition-all"
        >
          Explorar Peptídeos
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto pb-16" id="cart-screen">
      {/* Header Notification Banner */}
      <div className="w-full bg-[#006750] text-[#e8fff4] px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Truck className="w-5 h-5 text-[#93f5d4] shrink-0" />
          <span className="text-xs font-semibold truncate">
            Frete Seguro Grátis ativo para toda a UE &amp; Brasil
          </span>
        </div>
        <span className="font-mono text-[10px] bg-black/25 text-[#71face] font-bold px-2 py-0.5 rounded-full shrink-0">
          COTA GRÁTIS
        </span>
      </div>

      {/* Page Title & Lot Status */}
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold text-[#131b2e] tracking-tight">Seu Carrinho</h1>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Reserva de Lote Garantida por{' '}
              <strong className="font-mono text-[#006750]">{timeFormatted}</strong>
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs text-slate-700 font-semibold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#006750]" />
          <span>{cart.length} {cart.length === 1 ? 'Item' : 'Itens'} Lab</span>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex flex-col gap-3">
        {cart.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/70 flex flex-col gap-3 transition-all hover:border-emerald-200"
            id={`cart-item-${item.id}`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Thumbnail with Green Cap User Vial */}
              <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center p-1.5">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
                <span className="absolute bottom-1 right-1 bg-black/80 text-white font-mono text-[8px] px-1 py-0.2 rounded font-bold">
                  {item.vialsCount > 1 ? `${item.vialsCount}x` : '1 Vial'}
                </span>
              </div>

              {/* Info Column */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-bold text-sm sm:text-base text-[#131b2e] leading-snug truncate">
                    {item.product.name}
                  </h3>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Remover Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-[11px] text-slate-500 truncate">{item.product.subtitle}</span>

                <div className="mt-1 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-semibold">
                    Ref: {item.product.refCode}
                  </span>
                  {item.vialsCount > 1 && (
                    <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      Kit {item.vialsCount} Frascos
                    </span>
                  )}
                </div>

                {/* Price and Counter */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <span className="font-mono text-base sm:text-lg font-extrabold text-[#006750]">
                    {formatPrice(item.totalPrice)}
                  </span>

                  {/* Quantity Counter */}
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 shadow-inner">
                    <button
                      onClick={() => updateCartQty(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-700 hover:bg-slate-50 shadow-xs active:scale-90 transition-transform"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-700 hover:bg-slate-50 shadow-xs active:scale-90 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Spec strip */}
            <div className="flex items-center gap-2 pt-2 bg-slate-50/70 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 px-4 sm:px-5 py-2 rounded-b-2xl border-t border-slate-100 text-[10px] text-slate-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700">{item.product.purity}</span>
              <span>•</span>
              <span>Armazenamento: 2°C a 8°C</span>
            </div>
          </div>
        ))}
      </div>

      {/* Voucher & Coupon Applied Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/70 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006750] flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            {couponCode ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-slate-900">{couponCode}</span>
                  <span className="bg-emerald-100 text-[#006750] font-mono text-[10px] px-1.5 py-0.2 rounded font-bold">
                    -{couponDiscountPercent}% OFF
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">Cupom de primeira aplicação clínica</span>
              </div>
            ) : (
              <span className="text-xs text-slate-600 font-medium">Tem um cupom de desconto?</span>
            )}
          </div>

          <button
            onClick={() => setIsCouponEditing(!isCouponEditing)}
            className="text-xs font-semibold text-[#006750] hover:underline"
          >
            {isCouponEditing ? 'Cancelar' : couponCode ? 'Alterar' : 'Inserir Cupom'}
          </button>
        </div>

        {isCouponEditing && (
          <form onSubmit={handleApplyCoupon} className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              placeholder="Digite o cupom (ex: METASLIM10)"
              value={inputCoupon}
              onChange={(e) => setInputCoupon(e.target.value)}
              className="flex-1 h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#006750]"
            />
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-[#006750] text-white text-xs font-bold hover:bg-[#0d8267]"
            >
              Aplicar
            </button>
            {couponCode && (
              <button
                type="button"
                onClick={removeCoupon}
                className="h-9 px-3 rounded-xl bg-slate-100 text-slate-600 text-xs hover:bg-slate-200"
              >
                Remover
              </button>
            )}
          </form>
        )}
      </div>

      {/* Order Summary Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/70 flex flex-col gap-3">
        <h2 className="text-base font-bold text-[#131b2e] flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[#006750]" />
          <span>Resumo do Pedido</span>
        </h2>

        <div className="flex flex-col gap-2 pt-1 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-mono text-slate-900 font-semibold">{formatPrice(cartSubtotal)}</span>
          </div>

          {cartDiscount > 0 && (
            <div className="flex items-center justify-between text-emerald-700 font-semibold">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Desconto Cupom ({couponDiscountPercent}%)
              </span>
              <span className="font-mono font-bold">-{formatPrice(cartDiscount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Frete Seguro UE / Brasil</span>
              <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1 rounded">
                TÉRMICO
              </span>
            </span>
            <span className="font-mono font-bold text-emerald-700 uppercase">Grátis</span>
          </div>

          {/* Delivery Special Notes Input */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              <span>Instruções Especiais de Entrega / Discrição:</span>
            </label>
            <textarea
              rows={2}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Ex: Embalagem 100% neutra, deixar na portaria com o Dr. Carlos..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#006750] resize-none"
            />
          </div>

          {/* Total Row */}
          <div className="flex items-end justify-between pt-3 mt-1 bg-slate-50 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 sm:p-5 rounded-b-2xl border-t border-slate-100">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Valor Final Faturado
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#131b2e] leading-none">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <div className="flex flex-col items-end text-right">
              <span className="font-mono text-[10px] text-slate-400">ou 3x sem juros</span>
              <span className="font-mono text-[11px] text-[#006750] font-bold">IOF Zero no PIX</span>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Checkout Button CTA with Payment Gateway Link */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={handleProceedToPayment}
          className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#006750] via-[#0d8267] to-[#006750] hover:opacity-95 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-pointer"
          id="btn-pay-now-checkout"
        >
          <Lock className="w-5 h-5 text-[#93f5d4]" />
          <span>Pagar Agora (Link Seguro)</span>
          <ArrowRight className="w-5 h-5 text-white/80" />
        </button>

        {/* Supported Payment Methods Ribbon */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/60 shadow-xs flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Métodos com Liquidação Instantânea
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="h-7 px-2.5 bg-slate-100 rounded-lg flex items-center gap-1.5 text-xs text-slate-700 font-mono">
              <CreditCard className="w-3.5 h-3.5 text-[#006750]" />
              <span>Cartão</span>
            </div>
            <div className="h-7 px-2.5 bg-slate-100 rounded-lg flex items-center gap-1.5 text-xs text-slate-700 font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>MB WAY</span>
            </div>
            <div className="h-7 px-2.5 bg-slate-100 rounded-lg flex items-center gap-1.5 text-xs text-slate-700 font-mono">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Multibanco</span>
            </div>
            <div className="h-7 px-2.5 bg-slate-100 rounded-lg flex items-center gap-1.5 text-xs text-slate-700 font-mono font-bold">
              <Zap className="w-3.5 h-3.5 text-[#006750]" />
              <span>PIX Brasil</span>
            </div>
            <div className="h-7 px-2.5 bg-slate-100 rounded-lg flex items-center gap-1.5 text-xs text-slate-700 font-mono">
              <Bitcoin className="w-3.5 h-3.5 text-amber-600" />
              <span>USDT / BTC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Clinical Trust Badges */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <div className="bg-white p-3 rounded-xl border border-slate-200/60 flex items-start gap-2 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-[#006750] shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate">Garantia COA Lab</span>
            <span className="text-[10px] text-slate-500 leading-tight">
              Lotes auditados com laudo HPLC impresso e anexo.
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/60 flex items-start gap-2 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-[#006750] shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate">Checkout Blindado</span>
            <span className="text-[10px] text-slate-500 leading-tight">
              Criptografia bancária 256-bit e conformidade GDPR.
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/60 flex items-start gap-2 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-[#006750] shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate">Envio Discreto</span>
            <span className="text-[10px] text-slate-500 leading-tight">
              Caixa térmica neutra sem referências a medicamentos.
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/60 flex items-start gap-2 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-[#006750] shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate">Suporte Clínico</span>
            <span className="text-[10px] text-slate-500 leading-tight">
              Especialistas disponíveis via chat seguro após envio.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
