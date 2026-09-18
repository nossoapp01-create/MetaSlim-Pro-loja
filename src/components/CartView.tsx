import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { processMyPOSCheckout, buildMyPOSPurchasePayload, MyPOSConfig } from '../services/mypos';
import {
  createRealStripeCheckoutSession,
  isValidStripePaymentLink,
  extractSecretKeyIfPastedInPublishableKey,
} from '../services/stripe';
import { StripeConfig, OrderRecord, CustomerShippingInfo } from '../types';
import { ShippingLabelModal } from './ShippingLabelModal';
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
  ExternalLink,
  Info,
  Check,
  QrCode,
  X,
  Copy,
  AlertTriangle,
  MessageSquare,
  MapPin,
  User,
  Phone,
  Mail,
  Printer,
  UserCheck,
  KeyRound,
  LogIn,
  UserPlus,
  LogOut,
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
    orders,
    addOrder,
    setActiveTab,
    showToast,
    createOrderInFirestore,
    firebaseUser,
    isAdminUser,
    customerUser,
    isAuthenticated,
    loginCustomer,
    registerCustomer,
    quickCustomerLogin,
    loginWithGoogle,
    logout,
  } = useStore();

  const [inputCoupon, setInputCoupon] = useState('');
  const [isCouponEditing, setIsCouponEditing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(14 * 60 + 59);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mypos' | 'direct' | 'mbway_pix' | 'crypto'>('stripe');
  const [showMyPOSModal, setShowMyPOSModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [stripeErrorModal, setStripeErrorModal] = useState<{ open: boolean; message: string } | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // Customer Auth state for Checkout
  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Customer Shipping details for logistics & immediate label generation
  const [shippingInfo, setShippingInfo] = useState<CustomerShippingInfo>({
    fullName: 'Dra. Mariana Vasconcelos',
    phone: '+351 912 849 201',
    email: 'mariana.vasconcelos@clinica.pt',
    address: 'Avenida da Liberdade, nº 142, 3º Direito',
    complement: 'Edifício Liberdade Prime - Clínica Médica',
    postalCode: '1250-146',
    city: 'Lisboa',
    country: 'Portugal',
    notes: 'Manter estritamente refrigerado 2°C a 8°C. Deixar na recepção.',
  });

  // Sync shipping info with logged in customer or Google user
  useEffect(() => {
    if (customerUser) {
      setShippingInfo((prev) => ({
        ...prev,
        fullName: customerUser.name || prev.fullName,
        email: customerUser.email || prev.email,
        phone: customerUser.phone || prev.phone,
      }));
    } else if (firebaseUser) {
      setShippingInfo((prev) => ({
        ...prev,
        fullName: firebaseUser.displayName || prev.fullName,
        email: firebaseUser.email || prev.email,
        phone: firebaseUser.phoneNumber || prev.phone,
      }));
    }
  }, [customerUser, firebaseUser]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmittingAuth(true);

    try {
      if (authTab === 'register') {
        if (!authName.trim()) {
          setAuthError('Por favor, informe seu nome completo.');
          setIsSubmittingAuth(false);
          return;
        }
        if (!authEmail.trim() || !authEmail.includes('@')) {
          setAuthError('Por favor, informe um e-mail válido.');
          setIsSubmittingAuth(false);
          return;
        }
        if (authPassword.length < 6) {
          setAuthError('A senha deve conter no mínimo 6 caracteres.');
          setIsSubmittingAuth(false);
          return;
        }

        const success = await registerCustomer(authName, authEmail, authPassword, authPhone);
        if (success) {
          setAuthPassword('');
          setAuthError(null);
        } else {
          setAuthError('Não foi possível concluir o cadastro. Verifique os dados e tente novamente.');
        }
      } else {
        if (!authEmail.trim() || !authPassword) {
          setAuthError('Por favor, preencha o e-mail e a senha.');
          setIsSubmittingAuth(false);
          return;
        }

        const success = await loginCustomer(authEmail, authPassword);
        if (success) {
          setAuthPassword('');
          setAuthError(null);
        } else {
          setAuthError('Credenciais incorretas ou conta não encontrada.');
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Erro ao processar autenticação.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<OrderRecord | null>(null);

  const [cardPaymentSuccess, setCardPaymentSuccess] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [cardReceipt, setCardReceipt] = useState<{
    orderId: string;
    authCode: string;
    date: string;
    amount: number;
    last4: string;
    brand: string;
    installments: string;
  } | null>(null);

  // Check for returning from real Stripe Checkout session (?payment=success&session_id=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    const orderIdParam = urlParams.get('order_id');

    if (paymentStatus === 'success') {
      const orderNum = orderIdParam || 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      setCardReceipt({
        orderId: orderNum,
        authCode: sessionId ? `STRIPE-${sessionId.slice(-8).toUpperCase()}` : 'STRIPE-OFFICIAL-PAID',
        date: new Date().toLocaleString('pt-PT'),
        amount: cartTotal > 0 ? cartTotal : 0.90,
        last4: 'OK',
        brand: 'Stripe Checkout Oficial',
        installments: '1',
      });
      setCardPaymentSuccess(true);
      clearCart();
      showToast('Pagamento confirmado com sucesso pela Stripe Oficial!');

      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch {}
    } else if (paymentStatus === 'cancelled') {
      showToast('Pagamento cancelado na Stripe. Seus produtos continuam no carrinho.');
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch {}
    }
  }, []);

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
  const primaryProduct = cart.length > 0 ? cart[0].product : null;
  const paymentUrl =
    primaryProduct?.paymentLink ||
    `${settings.defaultPaymentLink}?amount=${cartTotal}&cart_items=${cart.length}`;

  const effectiveMyposConfig: MyPOSConfig = settings.mypos || {
    enabled: true,
    mode: 'production',
    integrationType: 'paylink',
    sid: '000000000000001',
    walletNumber: '61938166666',
    keyIndex: 1,
    payLink: 'https://pay.mypos.com/metaslimpro',
  };

  const rawStripeConfig: StripeConfig = settings.stripe || {
    enabled: true,
    mode: 'live',
    publishableKey: '',
    secretKey: '',
    paymentLink: primaryProduct?.paymentLink || '',
    currency: 'eur',
    successUrl: typeof window !== 'undefined' ? `${window.location.origin}/?payment=success` : '',
    cancelUrl: typeof window !== 'undefined' ? `${window.location.origin}/?payment=cancelled` : '',
  };

  // Auto-recover Secret Key even if user accidentally pasted it in Publishable Key field
  const recoveredSecretKey =
    rawStripeConfig.secretKey ||
    extractSecretKeyIfPastedInPublishableKey(rawStripeConfig.publishableKey) ||
    '';

  const effectiveStripeConfig: StripeConfig = {
    ...rawStripeConfig,
    secretKey: recoveredSecretKey,
  };

  const handleProceedToPayment = async () => {
    if (cart.length === 0) {
      showToast('Seu carrinho está vazio.');
      return;
    }

    // MANDATORY AUTHENTICATION CHECK: Cadastro ou Login obrigatório para comprar
    if (!isAuthenticated) {
      showToast('⚠️ Cadastro ou Login Obrigatório: Identifique-se no Passo 2 para continuar.');
      const authElem = document.getElementById('checkout-auth-section');
      if (authElem) {
        authElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.postalCode) {
      showToast('Por favor, preencha o Nome, Morada e Código Postal para a etiqueta de envio.');
      return;
    }

    setIsProcessingOrder(true);
    let orderId: string | null = null;
    try {
      orderId = await createOrderInFirestore(shippingInfo, deliveryNotes, paymentMethod);
      if (orderId) {
        setPendingOrderId(orderId);
        showToast(`Pedido #${orderId} registrado com etiqueta de envio gerada!`);
      }
    } finally {
      setIsProcessingOrder(false);
    }

    const effectiveOrderId = orderId || 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    setPendingOrderId(effectiveOrderId);

    // 1. Stripe Checkout flow (REAL Stripe Checkout via secure backend)
    if (paymentMethod === 'stripe') {
      // If merchant configured a valid direct buy.stripe.com link, open it
      if (isValidStripePaymentLink(effectiveStripeConfig.paymentLink)) {
        showToast('Abrindo link oficial da Stripe...');
        window.open(effectiveStripeConfig.paymentLink, '_blank', 'noopener,noreferrer');
        return;
      }

      // Start real Stripe Checkout Session creation via our backend
      setIsStripeLoading(true);
      try {
        const cartItemsForStripe = cart.map((item) => ({
          name: `${item.product.name} (${item.vialsCount} vials)`,
          quantity: item.quantity,
          price: item.unitPrice,
        }));

        const stripeResult = await createRealStripeCheckoutSession(effectiveStripeConfig, {
          orderId: effectiveOrderId,
          amount: cartTotal,
          currency: 'EUR',
          cartItems: cartItemsForStripe,
          customer: {
            email: firebaseUser?.email || undefined,
          },
          deliveryNotes,
        });

        if (stripeResult.success && stripeResult.url) {
          showToast('Redirecionando para o Stripe Checkout oficial...');
          // Redirect browser directly to official Stripe Checkout page
          window.location.href = stripeResult.url;
        } else {
          setStripeErrorModal({
            open: true,
            message:
              stripeResult.error ||
              'Não foi possível gerar a sessão na Stripe. Verifique se a Chave Secreta (sk_live_...) está configurada no Painel Admin.',
          });
        }
      } catch (err: any) {
        setStripeErrorModal({
          open: true,
          message: err?.message || 'Erro de conexão com o gateway Stripe.',
        });
      } finally {
        setIsStripeLoading(false);
      }
      return;
    }

    // 2. myPOS Checkout flow
    if (paymentMethod === 'mypos') {
      const cartItemsForMyPos = cart.map((item) => ({
        name: `${item.product.name} (${item.vialsCount} vials)`,
        quantity: item.quantity,
        price: item.unitPrice,
      }));

      showToast('Iniciando myPOS Checkout seguro...');
      processMyPOSCheckout(effectiveMyposConfig, {
        orderId: effectiveOrderId,
        amount: cartTotal,
        currency: 'EUR',
        cartItems: cartItemsForMyPos,
        customer: {
          email: firebaseUser?.email || undefined,
        },
        deliveryNotes,
      });
      return;
    }

    // 2. Direct external link
    if (paymentMethod === 'direct') {
      if (paymentUrl.startsWith('http')) {
        window.open(paymentUrl, '_blank');
      } else {
        showToast('Iniciando checkout seguro com gateway credenciado...');
      }
      return;
    }

    // 3. Alternative methods (MB WAY / PIX / Crypto)
    if (paymentMethod === 'mbway_pix') {
      showToast(`Chave MB WAY / PIX gerada para o pedido #${effectiveOrderId}. Redirecionando...`);
      if (paymentUrl.startsWith('http')) {
        window.open(paymentUrl, '_blank');
      }
      return;
    }

    if (paymentMethod === 'crypto') {
      showToast(`Endereço USDT/BTC seguro ativado para o pedido #${effectiveOrderId}.`);
      if (paymentUrl.startsWith('http')) {
        window.open(paymentUrl, '_blank');
      }
      return;
    }
  };

  if (cardPaymentSuccess && cardReceipt) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200/80 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
          {/* Top subtle decoration ribbon */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 via-[#635BFF] to-emerald-500" />

          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-2">
            Pagamento Aprovado &bull; Gateway Stripe
          </span>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Pedido Confirmado!
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
            Sua transação foi aprovada e seu protocolo clínico já foi encaminhado para separação prioritária sob cadeia fria de 2°C a 8°C.
          </p>

          {/* Receipt Breakdown Card */}
          <div className="w-full mt-6 bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-left text-xs text-slate-700 flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Número do Pedido:</span>
              <span className="font-mono font-bold text-slate-900">#{cardReceipt.orderId}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Código de Autenticação Stripe:</span>
              <span className="font-mono font-bold text-indigo-700">{cardReceipt.authCode}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Data e Horário:</span>
              <span className="text-slate-800 font-medium">{cardReceipt.date}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Método de Pagamento:</span>
              <span className="text-slate-800 font-medium flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#635BFF]" />
                {cardReceipt.brand} final •••• {cardReceipt.last4} ({cardReceipt.installments === '1' ? 'À vista' : `${cardReceipt.installments}x`})
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-slate-900">Valor Total Pago:</span>
              <span className="font-mono text-base font-black text-[#006750]">{formatPrice(cardReceipt.amount)}</span>
            </div>
          </div>

          {/* Clinical Handling Guarantee */}
          <div className="w-full mt-4 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-left text-xs text-emerald-900">
            <Truck className="w-4 h-4 text-[#006750] shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-bold">Despacho Refrigerado em 24h</span>
              <span className="text-[11px] text-emerald-700">
                Caixa isotérmica discreta sem identificação externa. Laudo HPLC de pureza anexado ao lote.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => {
                const found = orders.find((o) => o.id === cardReceipt.orderId) || {
                  id: cardReceipt.orderId,
                  totalAmount: cardReceipt.amount,
                  currency: 'EUR',
                  itemsCount: 1,
                  items: [],
                  shipping: shippingInfo,
                  status: 'paid',
                  paymentMethod: 'stripe',
                  trackingCode: `CTT-PT-${cardReceipt.orderId.replace(/\D/g, '') || '984210'}`,
                  carrier: 'CTT Expresso Cold Chain 24h',
                  createdAt: new Date().toISOString(),
                };
                setSelectedOrderForLabel(found as any);
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#006750] via-[#0d8267] to-[#006750] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#71face]" />
              <span>🏷️ Ver &amp; Imprimir Etiqueta Oficial de Envio</span>
            </button>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  const text = `Comprovante MetaSlim Pro\nPedido: #${cardReceipt.orderId}\nAutenticação: ${cardReceipt.authCode}\nValor: ${formatPrice(cardReceipt.amount)}\nData: ${cardReceipt.date}`;
                  navigator.clipboard.writeText(text);
                  setCopiedReceipt(true);
                  showToast('Comprovante copiado para a área de transferência!');
                  setTimeout(() => setCopiedReceipt(false), 3000);
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedReceipt ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReceipt ? 'Copiado!' : 'Copiar Comprovante'}</span>
              </button>
              <button
                onClick={() => {
                  setCardPaymentSuccess(false);
                  setCardReceipt(null);
                  setActiveTab('produtos');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Continuar Comprando</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#006750] mb-4 shadow-sm">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Seu Carrinho está Vazio</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-xs leading-relaxed">
          O carrinho inicia vazio conforme o padrão clínico. Navegue pelo catálogo oficial e adicione os peptídeos desejados.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5 w-full justify-center">
          <button
            onClick={() => setActiveTab('produtos')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#006750] to-[#0d8267] text-white font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Explorar Peptídeos
          </button>
          {!isAuthenticated && (
            <button
              onClick={() => loginWithGoogle()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#006750]" />
              <span>Entrar / Cadastrar com Google</span>
            </button>
          )}
        </div>
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

      {/* Passo 2: Identificação do Cliente (Login ou Cadastro Obrigatório) */}
      <div id="checkout-auth-section" className="transition-all">
        {!isAuthenticated ? (
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border-2 border-emerald-600/30 flex flex-col gap-4 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006750] to-[#0d8267] text-white flex items-center justify-center shadow-xs">
                  <Lock className="w-5 h-5 text-[#93f5d4]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Passo 2: Identificação Obrigatória do Cliente
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                      OBRIGATÓRIO
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Para comprar é obrigatório o cadastro e login. Seus dados garantem a rastreabilidade farmacêutica e emissão da etiqueta de envio.
                  </p>
                </div>
              </div>

              {/* Quick 1-click test button */}
              <button
                type="button"
                onClick={() => {
                  quickCustomerLogin();
                  showToast('✅ Login rápido de cliente efetuado com sucesso!');
                }}
                className="text-[11px] font-bold text-[#006750] hover:text-[#00503e] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Acesso de teste em 1 clique"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>1-Clique Demo: Dra. Mariana</span>
              </button>
            </div>

            {/* Auth Tab Switcher */}
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setAuthError(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authTab === 'register'
                    ? 'bg-white text-[#006750] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Criar Nova Conta (Cadastro)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authTab === 'login'
                    ? 'bg-white text-[#006750] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Já Tenho Cadastro (Entrar)</span>
              </button>
            </div>

            {/* Error banner if any */}
            {authError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
              {authTab === 'register' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Nome Completo *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Ex: Dra. Mariana Vasconcelos"
                      className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Telefone / WhatsApp</span>
                    </label>
                    <input
                      type="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="Ex: +351 912 345 678"
                      className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>E-mail do Cliente *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    <span>Senha de Acesso * (mínimo 6 caracteres)</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full sm:flex-1 h-11 rounded-xl bg-[#006750] hover:bg-[#0d8267] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAuth ? (
                    <span>Autenticando...</span>
                  ) : authTab === 'register' ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Concluir Cadastro e Liberar Pagamento</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Acessar Conta e Liberar Pagamento</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="w-full sm:w-auto h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Entrar com Google</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 rounded-2xl p-4 sm:p-5 border-2 border-emerald-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#006750] text-white flex items-center justify-center shrink-0 shadow-sm">
                <UserCheck className="w-5 h-5 text-[#93f5d4]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#006750] uppercase tracking-wide flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Cliente Identificado &amp; Autenticado
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-200/80 text-emerald-900 px-2 py-0.2 rounded font-bold">
                    Compra Liberada
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {customerUser?.name || firebaseUser?.displayName || 'Cliente Verificado'}
                </p>
                <p className="text-[11px] text-slate-600 font-mono">
                  {customerUser?.email || firebaseUser?.email}
                  {customerUser?.phone ? ` • ${customerUser.phone}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => {
                  logout();
                  showToast('Você saiu da sua conta.');
                }}
                className="text-xs font-bold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Trocar Conta / Sair</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dados de Envio para Emissão da Etiqueta de Despacho */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/70 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006750] flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Dados de Envio &amp; Destinatário</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-[#006750] px-2 py-0.5 rounded-full">
                  Etiqueta Automática CTT/DHL
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Preencha para emissão imediata da etiqueta de transporte com controle de temperatura 2°C - 8°C.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setShippingInfo({
                  fullName: 'Dra. Mariana Vasconcelos',
                  phone: '+351 912 849 201',
                  email: 'mariana.vasconcelos@clinica.pt',
                  address: 'Avenida da Liberdade, nº 142, 3º Direito',
                  complement: 'Edifício Liberdade Prime - Recepção Médica',
                  postalCode: '1250-146',
                  city: 'Lisboa',
                  country: 'Portugal',
                  notes: 'Manter estritamente refrigerado 2°C a 8°C. Deixar na recepção.',
                });
                showToast('Dados de envio de exemplo (Lisboa) preenchidos!');
              }}
              className="text-[11px] font-bold text-[#006750] hover:text-[#00503e] bg-emerald-50 hover:bg-emerald-100/70 px-2.5 py-1.5 rounded-xl border border-emerald-200/60 transition-all cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#006750]" />
              <span>Exemplo Lisboa</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShippingInfo({
                  fullName: 'Dr. Rodrigo Albuquerque',
                  phone: '+351 934 521 890',
                  email: 'rodrigo.albuquerque@biolab.pt',
                  address: 'Rua de Santa Catarina, nº 820, Sala 4B',
                  complement: 'Complexo Empresarial Porto Central',
                  postalCode: '4000-444',
                  city: 'Porto',
                  country: 'Portugal',
                  notes: 'Atenção: cadeia fria. Recebimento exclusivo em horário comercial.',
                });
                showToast('Dados de envio de exemplo (Porto) preenchidos!');
              }}
              className="text-[11px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/70 px-2.5 py-1.5 rounded-xl border border-indigo-200/60 transition-all cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Exemplo Porto</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          {/* Nome Completo */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Nome Completo do Destinatário *</span>
            </label>
            <input
              type="text"
              required
              value={shippingInfo.fullName}
              onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
              placeholder="Ex: Dra. Mariana Vasconcelos"
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#006750]"
            />
          </div>

          {/* Contato Telefônico */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Contato Telefônico / WhatsApp *</span>
            </label>
            <input
              type="tel"
              required
              value={shippingInfo.phone}
              onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
              placeholder="Ex: +351 912 345 678"
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#006750]"
            />
          </div>

          {/* E-mail */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>E-mail para Notificação e Rastreio CTT/DHL *</span>
            </label>
            <input
              type="email"
              required
              value={shippingInfo.email}
              onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
              placeholder="Ex: mariana.vasconcelos@clinica.pt"
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#006750]"
            />
          </div>

          {/* Endereço / Morada */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Morada / Endereço Completo (Rua, Número, Bloco) *</span>
            </label>
            <input
              type="text"
              required
              value={shippingInfo.address}
              onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
              placeholder="Ex: Avenida da Liberdade, nº 142, 3º Direito"
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#006750]"
            />
          </div>

          {/* Complemento */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-700">Complemento / Edifício (Opcional)</label>
            <input
              type="text"
              value={shippingInfo.complement || ''}
              onChange={(e) => setShippingInfo({ ...shippingInfo, complement: e.target.value })}
              placeholder="Ex: Recepção Médica, Apto 302"
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#006750]"
            />
          </div>

          {/* Código Postal */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-700">Código Postal / CEP *</label>
            <input
              type="text"
              required
              value={shippingInfo.postalCode}
              onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
              placeholder="Ex: 1250-146 ou 01310-100"
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#006750]"
            />
          </div>

          {/* Cidade */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-700">Cidade *</label>
            <input
              type="text"
              required
              value={shippingInfo.city}
              onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
              placeholder="Ex: Lisboa, Porto, Coimbra"
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#006750]"
            />
          </div>

          {/* País */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-700">País de Destino *</label>
            <select
              value={shippingInfo.country}
              onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#006750]"
            >
              <option value="Portugal">Portugal (Entrega 24h CTT Expresso)</option>
              <option value="Espanha">Espanha (Entrega 24-48h DHL Express)</option>
              <option value="França">França (Entrega 48h DHL Express)</option>
              <option value="Alemanha">Alemanha (Entrega 48h DHL Express)</option>
              <option value="Itália">Itália (Entrega 48h DHL Express)</option>
              <option value="Reino Unido">Reino Unido (Entrega 72h)</option>
              <option value="Brasil">Brasil (Despacho Expresso Prioritário)</option>
              <option value="União Europeia">Outro País da UE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/70 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#635BFF]" />
            <h3 className="text-sm font-bold text-[#131b2e]">Forma de Pagamento</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-[#635BFF] px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#635BFF]" />
              <span>Stripe Ativo</span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-[#006750] px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#006750]" />
              <span>myPOS Ativo</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Method 1: Stripe Checkout (Global Standard) */}
          <div
            onClick={() => setPaymentMethod('stripe')}
            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              paymentMethod === 'stripe'
                ? 'border-[#635BFF] bg-indigo-50/40 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full border-2 border-[#635BFF] flex items-center justify-center mt-0.5 shrink-0">
                  {paymentMethod === 'stripe' && <div className="w-2.5 h-2.5 rounded-full bg-[#635BFF]" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Stripe Checkout</span>
                    <span className="text-[9px] font-bold bg-[#635BFF]/10 text-[#635BFF] px-1.5 py-0.2 rounded font-mono">
                      GLOBAL &amp; APPLE PAY
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Cartões de Crédito/Débito, Apple Pay, Google Pay e Link Seguro Stripe.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-indigo-900 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#635BFF]" />
                PCI-DSS Nível 1 Certificado
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStripeModal(true);
                }}
                className="text-[10px] text-[#635BFF] font-bold hover:underline"
              >
                Ver Parâmetros
              </button>
            </div>
          </div>

          {/* Method 2: myPOS Checkout (Official UE) */}
          <div
            onClick={() => setPaymentMethod('mypos')}
            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              paymentMethod === 'mypos'
                ? 'border-[#006750] bg-emerald-50/40 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full border-2 border-[#006750] flex items-center justify-center mt-0.5 shrink-0">
                  {paymentMethod === 'mypos' && <div className="w-2.5 h-2.5 rounded-full bg-[#006750]" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">myPOS Checkout</span>
                    <span className="text-[9px] font-bold bg-emerald-100 text-[#006750] px-1.5 py-0.2 rounded font-mono">
                      OFICIAL UE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Cartões Visa, MasterCard, Multibanco e terminais myPOS Europa.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-800 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#006750]" />
                Licença Bancária EMI UE
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMyPOSModal(true);
                }}
                className="text-[10px] text-[#006750] font-bold hover:underline"
              >
                Ver Parâmetros
              </button>
            </div>
          </div>

          {/* Method 3: MB WAY / PIX */}
          <div
            onClick={() => setPaymentMethod('mbway_pix')}
            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              paymentMethod === 'mbway_pix'
                ? 'border-[#006750] bg-emerald-50/40 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full border-2 border-[#006750] flex items-center justify-center mt-0.5 shrink-0">
                  {paymentMethod === 'mbway_pix' && <div className="w-2.5 h-2.5 rounded-full bg-[#006750]" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">MB WAY / PIX Instantâneo</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Liquidação em segundos para Portugal e Brasil.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-700 font-bold">Sem taxas de câmbio</span>
              <Zap className="w-3 h-3 text-[#006750]" />
            </div>
          </div>

          {/* Method 4: Crypto */}
          <div
            onClick={() => setPaymentMethod('crypto')}
            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              paymentMethod === 'crypto'
                ? 'border-[#006750] bg-emerald-50/40 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full border-2 border-[#006750] flex items-center justify-center mt-0.5 shrink-0">
                  {paymentMethod === 'crypto' && <div className="w-2.5 h-2.5 rounded-full bg-[#006750]" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">Criptomoedas (USDT / BTC)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Pagamento discreto via USDT (TRC-20) ou Bitcoin.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-700 font-bold">Confidencial</span>
              <Bitcoin className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Checkout Button CTA */}
      <div className="flex flex-col gap-2.5">
        {!isAuthenticated && (
          <div className="bg-amber-50/90 border border-amber-300 text-amber-900 rounded-xl p-3 text-xs flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold">
                Cadastro ou Login Obrigatório: Identifique-se no Passo 2 acima para liberar o pagamento.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('checkout-auth-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-[11px] shrink-0 cursor-pointer"
            >
              Ir ao Passo 2
            </button>
          </div>
        )}

        <button
          onClick={handleProceedToPayment}
          disabled={isProcessingOrder}
          className={`w-full py-4 px-5 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer disabled:opacity-60 active:scale-[0.98] ${
            !isAuthenticated
              ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-slate-900/20'
              : paymentMethod === 'stripe'
              ? 'bg-[#635BFF] hover:bg-[#5349e4] text-white shadow-indigo-950/20'
              : 'bg-gradient-to-r from-[#006750] via-[#0d8267] to-[#006750] hover:opacity-95 text-white shadow-emerald-950/20'
          }`}
          id="btn-pay-now-checkout"
        >
          <Lock className="w-5 h-5 text-white/90" />
          <span>
            {!isAuthenticated
              ? 'Identifique-se no Passo 2 para Pagar'
              : isProcessingOrder
              ? 'Processando Pedido...'
              : paymentMethod === 'stripe'
              ? 'Pagar com Stripe Checkout Seguro'
              : paymentMethod === 'mypos'
              ? 'Pagar com myPOS Checkout Seguro'
              : paymentMethod === 'direct'
              ? 'Ir para Link de Pagamento'
              : paymentMethod === 'mbway_pix'
              ? 'Gerar Referência MB WAY / PIX'
              : 'Gerar Endereço USDT / BTC'}
          </span>
          <ArrowRight className="w-5 h-5 text-white/80" />
        </button>

        {/* Instant Test / Label Simulator Button */}
        <button
          type="button"
          onClick={async () => {
            if (cart.length === 0) {
              showToast('Adicione ao menos um produto ao carrinho para testar a emissão.');
              return;
            }
            if (!isAuthenticated) {
              showToast('⚠️ Cadastro ou Login Obrigatório: Identifique-se no Passo 2.');
              const authElem = document.getElementById('checkout-auth-section');
              if (authElem) {
                authElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              return;
            }
            if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.postalCode) {
              showToast('Por favor, informe Nome, Morada e Código Postal.');
              return;
            }
            const orderId = await createOrderInFirestore(shippingInfo, deliveryNotes, 'stripe');
            const generatedOrder: OrderRecord = {
              id: orderId || 'ORD-' + Math.floor(100000 + Math.random() * 900000),
              totalAmount: cartTotal,
              currency: 'EUR',
              itemsCount: cart.reduce((sum, i) => sum + i.quantity, 0),
              items: cart.map((i) => ({
                productId: i.productId,
                productName: i.product.name,
                quantity: i.quantity,
                vialsCount: i.vialsCount,
                unitPrice: i.unitPrice,
                totalPrice: i.totalPrice,
              })),
              shipping: shippingInfo,
              status: 'paid',
              paymentMethod: 'stripe',
              trackingCode: `CTT-PT-${Math.floor(100000000 + Math.random() * 900000000)}`,
              carrier: 'CTT Expresso Cold Chain 24h',
              createdAt: new Date().toISOString(),
            };
            setSelectedOrderForLabel(generatedOrder);
            showToast('✅ Pedido registrado! Etiqueta de despacho aberta com dados completos.');
          }}
          className="w-full py-3 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#635BFF] border border-indigo-200/80 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
        >
          <Printer className="w-4 h-4 text-[#635BFF]" />
          <span>🏷️ Simular Compra &amp; Abrir Etiqueta Imediata (Teste do Fluxo de Envio)</span>
        </button>

        {/* Supported Payment Methods Ribbon */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/60 shadow-xs flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Gateways Oficiais &amp; Bandeiras Protegidas
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="h-7 px-2.5 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-1.5 text-xs text-[#635BFF] font-mono font-bold">
              <span className="font-black text-sm">stripe</span>
            </div>
            <div className="h-7 px-2.5 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-1.5 text-xs text-[#006750] font-mono font-bold">
              <span className="font-black text-xs">myPOS</span>
            </div>
            <div className="h-7 px-2.5 bg-slate-100 rounded-lg flex items-center gap-1.5 text-xs text-slate-700 font-mono font-bold">
              <CreditCard className="w-3.5 h-3.5 text-[#006750]" />
              <span>VISA / MC / AMEX</span>
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
              <span>Apple / Google Pay</span>
            </div>
            <div className="h-7 px-2.5 bg-slate-100 rounded-lg flex items-center gap-1.5 text-xs text-slate-700 font-mono">
              <Bitcoin className="w-3.5 h-3.5 text-amber-600" />
              <span>USDT / BTC</span>
            </div>
          </div>
        </div>
      </div>

      {/* myPOS Details Inspection Modal */}
      {showMyPOSModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-[#131b2e] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#006750] flex items-center justify-center font-bold text-xs">
                  myPOS
                </div>
                <div>
                  <h3 className="text-sm font-bold">myPOS Checkout IPC Protocol</h3>
                  <span className="text-[10px] text-emerald-400 font-mono">@developermypos SDK v1.4</span>
                </div>
              </div>
              <button
                onClick={() => setShowMyPOSModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/70">
                <span className="font-bold text-[#006750] block mb-1">Status da Configuração</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Modo: <strong>{effectiveMyposConfig.mode.toUpperCase()}</strong> | SID: <code className="font-mono bg-white px-1 py-0.5 rounded">{effectiveMyposConfig.sid}</code> | Wallet: <code className="font-mono bg-white px-1 py-0.5 rounded">{effectiveMyposConfig.walletNumber}</code>
                </p>
              </div>

              <div>
                <span className="font-mono uppercase font-bold text-[10px] text-slate-400">Itens no Payload IPC</span>
                <div className="mt-1.5 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {cart.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <span className="font-bold text-slate-900">{item.product.name}</span>
                        <span className="text-[10px] text-slate-500 block">Qtd: {item.quantity} × {formatPrice(item.unitPrice)}</span>
                      </div>
                      <span className="font-mono font-bold text-[#006750]">{formatPrice(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-900 text-sm">Total da Transação</span>
                <span className="font-mono text-xl font-black text-[#006750]">{formatPrice(cartTotal)}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMyPOSModal(false);
                    handleProceedToPayment();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#006750] hover:bg-[#0d8267] text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-4 h-4" />
                  <span>Prosseguir para Checkout myPOS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMyPOSModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Loading Modal */}
      {isStripeLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-3 border-[#635BFF] border-t-transparent rounded-full animate-spin" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#635BFF] uppercase bg-indigo-50 px-2.5 py-0.5 rounded-full mb-2">
              Stripe Official Checkout
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Conectando com a Stripe...
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Gerando sua sessão oficial e segura para o pedido #{pendingOrderId || 'ORD-NOVO'} no valor de {formatPrice(cartTotal)}. Você será redirecionado em instantes...
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ambiente Criptografado PCI-DSS Nível 1</span>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Configuration or Gateway Error Modal */}
      {stripeErrorModal?.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-rose-200 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Atenção: Gateway Stripe
                </h3>
                <span className="text-[11px] text-slate-500">
                  Não foi possível iniciar a cobrança oficial
                </span>
              </div>
            </div>

            <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100 text-xs text-rose-800 leading-relaxed mb-4">
              <strong>Motivo:</strong> {stripeErrorModal.message}
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Para processar pagamentos reais no Stripe e receber os valores em sua conta bancária, configure sua <strong>Chave Secreta (sk_live_...)</strong> no Painel Admin ou finalize sua compra via WhatsApp / MB WAY.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setStripeErrorModal(null);
                  setActiveTab('admin');
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#635BFF] hover:bg-[#5349e4] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Abrir Painel Admin e Ajustar Chaves</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Olá MetaSlim Pro! Tentei pagar o pedido #${pendingOrderId || 'ORD-NOVO'} no valor de ${formatPrice(cartTotal)} mas preciso de assistência para pagar via MB WAY ou Cartão.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setStripeErrorModal(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006750] font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Pagar via WhatsApp / MB WAY</span>
              </a>

              <button
                type="button"
                onClick={() => setStripeErrorModal(null)}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Shipping Label Modal */}
      {selectedOrderForLabel && (
        <ShippingLabelModal
          order={selectedOrderForLabel}
          onClose={() => setSelectedOrderForLabel(null)}
        />
      )}
    </div>
  );
};
