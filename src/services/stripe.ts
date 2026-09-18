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
 * Checks whether a given Stripe Payment Link is a real valid link,
 * or if it's empty, an example/placeholder, or invalid.
 * Prevents AWS/CloudFront S3 AccessDenied XML errors from dead buy.stripe.com routes.
 */
export function isValidStripePaymentLink(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  
  // Must be HTTPS URL
  if (!trimmed.startsWith('https://')) return false;

  // Check if it matches Stripe official domains: buy.stripe.com, checkout.stripe.com, or invoice.stripe.com
  const isStripeDomain =
    trimmed.startsWith('https://buy.stripe.com/') ||
    trimmed.startsWith('https://checkout.stripe.com/') ||
    trimmed.startsWith('https://invoice.stripe.com/');

  if (!isStripeDomain) return false;

  // Known fictitious placeholder slugs that return 403 AccessDenied XML on AWS/Stripe CDN
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('live_metaslimpro') ||
    lower.includes('test_metaslimpro') ||
    lower.includes('checkoutkey') ||
    lower.includes('example') ||
    lower === 'https://buy.stripe.com/' ||
    lower === 'https://buy.stripe.com'
  ) {
    return false;
  }

  // Must have a real link token after domain
  try {
    const parsed = new URL(trimmed);
    const pathname = parsed.pathname.replace(/^\/+/, '');
    return pathname.length >= 4;
  } catch {
    return false;
  }
}

/**
 * Builds a valid Stripe Payment Link URL with prefilled parameters
 * (client_reference_id, prefilled_email, etc.)
 */
export function buildStripeCheckoutUrl(
  config: StripeConfig,
  payload: StripeCheckoutPayload
): string | null {
  const rawUrl = config.paymentLink?.trim();

  // If link is missing or is an invalid placeholder, return null to signal fallback handling
  if (!isValidStripePaymentLink(rawUrl)) {
    return null;
  }

  const baseUrl = rawUrl!;

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
    const separator = baseUrl.includes('?') ? '&' : '?';
    const params = new URLSearchParams();
    if (payload.orderId) params.set('client_reference_id', payload.orderId);
    if (payload.customer?.email) params.set('prefilled_email', payload.customer.email);
    
    return `${baseUrl}${separator}${params.toString()}`;
  }
}

export interface StripeCheckoutResult {
  success: boolean;
  action: 'redirected' | 'fallback_required';
  url?: string;
  orderId: string;
  reason?: string;
}

/**
 * Processes checkout using Stripe.
 * If a valid real buy.stripe.com link is provided, opens it safely in a new tab
 * without closing the store or crashing with AccessDenied.
 * If no valid link is present, signals fallback to in-app payment modal.
 */
export function processStripeCheckout(
  config: StripeConfig,
  payload: StripeCheckoutPayload
): StripeCheckoutResult {
  const checkoutUrl = buildStripeCheckoutUrl(config, payload);

  if (checkoutUrl) {
    // Open in new tab so user never loses their active cart or store state
    if (typeof window !== 'undefined') {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    }
    return {
      success: true,
      action: 'redirected',
      url: checkoutUrl,
      orderId: payload.orderId,
    };
  }

  // Fallback: Link not yet configured with a live Stripe Payment Link
  return {
    success: false,
    action: 'fallback_required',
    orderId: payload.orderId,
    reason: 'missing_or_placeholder_link',
  };
}

