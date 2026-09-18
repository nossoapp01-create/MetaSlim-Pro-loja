/**
 * myPOS Checkout Integration Service
 * Grounded in official @developermypos SDK specifications:
 * - developermypos/mypos-js (NodeJS SDK)
 * - developermypos/myPOS-Checkout-SDK-PHP
 * - developermypos/mypos-embedded-checkout
 */

export interface MyPOSConfig {
  enabled: boolean;
  mode: 'sandbox' | 'production';
  integrationType?: 'paylink' | 'hosted_checkout';
  sid: string; // Store ID (SID) assigned in myPOS Merchant account
  walletNumber: string; // Client / Wallet number
  keyIndex: number; // Key index (default: 1)
  payLink: string; // Direct myPOS PayLink / PayButton URL
}

export interface MyPOSCartItem {
  name: string;
  quantity: number;
  price: number;
}

export interface MyPOSCustomer {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  address?: string;
}

export interface MyPOSPurchaseParams {
  orderId: string;
  amount: number;
  currency: 'EUR' | 'BRL';
  cartItems: MyPOSCartItem[];
  customer?: MyPOSCustomer;
  deliveryNotes?: string;
  returnUrlOk?: string;
  returnUrlCancel?: string;
  notifyUrl?: string;
}

// Endpoints from official myPOS Checkout API documentation
export const MYPOS_ENDPOINTS = {
  production: 'https://www.mypos.com/vmp/checkout',
  sandbox: 'https://www.mypos.com/vmp/checkout-test',
  payBase: 'https://pay.mypos.com',
};

/**
 * Generates the full IPC Purchase payload complying with myPOS Checkout API v1.4
 */
export function buildMyPOSPurchasePayload(
  config: MyPOSConfig,
  params: MyPOSPurchaseParams
): Record<string, string> {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://metaslimpro.vercel.app';
  const urlOk = params.returnUrlOk || `${currentOrigin}/?status=success&order=${params.orderId}`;
  const urlCancel = params.returnUrlCancel || `${currentOrigin}/?status=cancelled&order=${params.orderId}`;
  const urlNotify = params.notifyUrl || `${currentOrigin}/api/mypos-webhook`;

  const payload: Record<string, string> = {
    IPCmethod: 'IPCPurchase',
    IPCVersion: '1.4',
    IPCLanguage: 'PT',
    SID: config.sid || '000000000000001',
    WalletNumber: config.walletNumber || '61938166666',
    KeyIndex: String(config.keyIndex || 1),
    Amount: params.amount.toFixed(2),
    Currency: 'EUR', // myPOS standard settles in EUR
    OrderID: params.orderId,
    URL_OK: urlOk,
    URL_Cancel: urlCancel,
    URL_Notify: urlNotify,
    PaymentParametersRequired: '2', // Standard checkout page
    CardTokenRequest: '0',
    PaymentMethod: '1', // 1: Cards (Visa, Mastercard, Maestro, AMEX) + Apple Pay / Google Pay
    CartItems: String(params.cartItems.length),
  };

  // Populate individual cart item fields (Article_1, Quantity_1, Price_1, Amount_1, Currency_1)
  params.cartItems.forEach((item, index) => {
    const idx = index + 1;
    payload[`Article_${idx}`] = item.name.slice(0, 50);
    payload[`Quantity_${idx}`] = String(item.quantity);
    payload[`Price_${idx}`] = item.price.toFixed(2);
    payload[`Amount_${idx}`] = (item.price * item.quantity).toFixed(2);
    payload[`Currency_${idx}`] = 'EUR';
  });

  if (params.customer?.email) {
    payload['CustomerEmail'] = params.customer.email;
  }
  if (params.deliveryNotes) {
    payload['Note'] = params.deliveryNotes.slice(0, 100);
  }

  return payload;
}

/**
 * Initiates the checkout via myPOS.
 * If merchant provided a custom PayLink (e.g. from myPOS portal), uses query params.
 * Otherwise, generates an IPC POST form submission to the official myPOS Checkout gateway (vmp/checkout).
 */
export function processMyPOSCheckout(
  config: MyPOSConfig,
  params: MyPOSPurchaseParams
): void {
  const trimmedPayLink = config.payLink?.trim() || '';
  const integrationType = config.integrationType || (trimmedPayLink.startsWith('http') ? 'paylink' : 'hosted_checkout');

  // Priority 1: Official myPOS PayLink / Payment Tag / Button (Zero RSA error risk)
  if (integrationType === 'paylink' && trimmedPayLink.startsWith('http')) {
    const separator = trimmedPayLink.includes('?') ? '&' : '?';
    const checkoutUrl = `${trimmedPayLink}${separator}order_id=${encodeURIComponent(
      params.orderId
    )}&amount=${params.amount.toFixed(2)}&currency=EUR&desc=${encodeURIComponent(
      'MetaSlim Pro Peptides - Pedido ' + params.orderId
    )}`;
    
    const win = window.open(checkoutUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = checkoutUrl;
    }
    return;
  }

  // Priority 2: Standardized IPC Purchase Form submission to official hosted checkout (vmp/checkout)
  const endpoint =
    config.mode === 'sandbox' ? MYPOS_ENDPOINTS.sandbox : MYPOS_ENDPOINTS.production;

  const payload = buildMyPOSPurchasePayload(config, params);

  // Dynamically create and submit POST form to official vmp/checkout
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = endpoint;
  form.target = '_blank';
  form.style.display = 'none';

  Object.entries(payload).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  setTimeout(() => {
    if (document.body.contains(form)) {
      document.body.removeChild(form);
    }
  }, 1000);
}
