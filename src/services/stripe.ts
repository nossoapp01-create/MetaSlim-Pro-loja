import { StripeConfig } from '../types';

export interface StripeCheckoutPayload {
  orderId: string;
  amount: number;
  currency: string;
  cartItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  customer?: {
    email?: string;
    name?: string;
  };
  deliveryNotes?: string;
}

/**
 * Builds a valid Stripe Payment Link URL with prefilled parameters
 * (client_reference_id, prefilled_email, etc.)
 */
export function buildStripeCheckoutUrl(
  config: StripeConfig,
  payload: StripeCheckoutPayload
): string {
  const baseUrl = config.paymentLink?.trim() || 'https://buy.stripe.com/live_metaslimpro_checkout';

  try {
    const url = new URL(baseUrl);
    
    // Stripe Payment Links native query parameter flags:
    if (payload.orderId) {
      url.searchParams.set('client_reference_id', payload.orderId);
    }
    if (payload.customer?.email) {
      url.searchParams.set('prefilled_email', payload.customer.email);
    }
    
    return url.toString();
  } catch {
    // If not a full URL or relative, format with query string
    const separator = baseUrl.includes('?') ? '&' : '?';
    const params = new URLSearchParams();
    if (payload.orderId) params.set('client_reference_id', payload.orderId);
    if (payload.customer?.email) params.set('prefilled_email', payload.customer.email);
    
    return `${baseUrl}${separator}${params.toString()}`;
  }
}

/**
 * Processes checkout using Stripe
 */
export function processStripeCheckout(
  config: StripeConfig,
  payload: StripeCheckoutPayload
): { url: string; orderId: string } {
  const checkoutUrl = buildStripeCheckoutUrl(config, payload);
  
  // Safe redirect or window navigation
  if (typeof window !== 'undefined') {
    window.location.href = checkoutUrl;
  }
  
  return {
    url: checkoutUrl,
    orderId: payload.orderId,
  };
}
