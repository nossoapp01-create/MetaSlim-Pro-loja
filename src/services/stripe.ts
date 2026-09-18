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

/**
 * Extracts a secret key if it was accidentally pasted into the publishable key field
 * (e.g., 'pk_live_51Msk_live_51T9lOSCdMOMI4BWDy4vDERItIxNNHErRD58gDwcfJpzK99lc1YBLHVfyCmYgr1DYCJmJloxkMDsU7lv42YI')
 */
export function extractSecretKeyIfPastedInPublishableKey(key?: string): string | null {
  if (!key) return null;
  const match = key.match(/(sk_live_[a-zA-Z0-9]+|sk_test_[a-zA-Z0-9]+|rk_live_[a-zA-Z0-9]+|rk_test_[a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Sanitizes publishable key by removing accidental secret keys
 */
export function sanitizeStripePublishableKey(key?: string): string {
  if (!key) return '';
  const trimmed = key.trim();
  // If it starts with pk_live_51Msk_live_..., remove the secret key part
  if (trimmed.includes('sk_live_') || trimmed.includes('sk_test_')) {
    return '';
  }
  return trimmed;
}

/**
 * Creates a real Stripe Checkout Session via the backend server.
 * This redirects the customer to the official checkout.stripe.com where
 * real credit cards are processed, charged, and deposited in the merchant's account.
 */
export async function createRealStripeCheckoutSession(
  config: StripeConfig,
  payload: StripeCheckoutPayload
): Promise<{ success: boolean; url?: string; sessionId?: string; error?: string }> {
  try {
    // Check if secret key was in config or accidentally in publishable key
    const secretKey =
      config.secretKey?.trim() ||
      extractSecretKeyIfPastedInPublishableKey(config.publishableKey) ||
      undefined;

    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: payload.cartItems,
        amount: payload.amount,
        currency: (config.currency || payload.currency || 'eur').toLowerCase(),
        orderId: payload.orderId,
        customerEmail: payload.customer?.email,
        secretKey,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Não foi possível gerar a sessão de pagamento na Stripe.',
      };
    }

    return {
      success: true,
      url: data.url,
      sessionId: data.sessionId,
    };
  } catch (err: any) {
    console.error('Error creating Stripe session:', err);
    return {
      success: false,
      error: err.message || 'Erro de rede ao conectar com o gateway Stripe.',
    };
  }
}

/**
 * Tests connection to Stripe using the provided Secret Key.
 */
export async function testStripeConnection(
  secretKey: string
): Promise<{ success: boolean; mode?: 'live' | 'test'; businessName?: string; available?: string[]; error?: string }> {
  try {
    const res = await fetch('/api/stripe/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secretKey }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Falha ao validar chave secreta na Stripe.',
      };
    }

    return {
      success: true,
      mode: data.mode,
      businessName: data.businessName,
      available: data.available,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Erro ao conectar ao servidor para teste.',
    };
  }
}

/**
 * Verifies a Stripe Checkout Session status
 */
export async function verifyStripeSession(
  sessionId: string,
  secretKey?: string
): Promise<{ success: boolean; paymentStatus?: string; amountTotal?: number; orderId?: string; error?: string }> {
  try {
    const params = new URLSearchParams({ sessionId });
    if (secretKey) params.append('secretKey', secretKey);

    const res = await fetch(`/api/stripe/verify-session?${params.toString()}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Falha ao verificar status do pagamento.' };
    }

    return {
      success: true,
      paymentStatus: data.paymentStatus,
      amountTotal: data.amountTotal,
      orderId: data.orderId,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao verificar sessão.' };
  }
}


