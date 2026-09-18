import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for Vercel functions
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' });
  }

  try {
    const {
      items,
      amount,
      orderId,
      customerEmail,
      secretKey,
      currency = 'eur',
      successUrl,
      cancelUrl,
    } = req.body || {};

    const rawKey = secretKey || process.env.STRIPE_SECRET_KEY;
    if (!rawKey || typeof rawKey !== 'string' || !rawKey.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Chave Secreta da Stripe (Secret Key) não configurada. Salve sua chave sk_live_... no Painel Admin ou nas variáveis do Vercel.',
      });
    }

    const key = rawKey.trim();
    const stripe = new Stripe(key);

    const reqOrigin =
      req.headers.origin ||
      (req.headers.referer ? new URL(req.headers.referer as string).origin : '') ||
      'https://meta-slim-pro-loja-omega.vercel.app';

    // Format line items for Stripe Checkout
    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (Array.isArray(items) && items.length > 0) {
      line_items = items.map((item: any) => {
        const unitAmount = Math.max(50, Math.round(Number(item.price || 0) * 100));
        return {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: item.name || 'Protocolo MetaSlim Pro',
              description: item.description ? String(item.description).slice(0, 500) : `Pedido #${orderId}`,
            },
            unit_amount: unitAmount,
          },
          quantity: Math.max(1, Number(item.quantity) || 1),
        };
      });
    } else {
      const unitAmount = Math.max(50, Math.round(Number(amount || 0.90) * 100));
      line_items = [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `MetaSlim Pro - Pedido #${orderId || 'Oficial'}`,
              description: 'Protocolo clínico certificado com despacho refrigerado.',
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ];
    }

    const effectiveSuccessUrl =
      successUrl ||
      `${reqOrigin}/?payment=success&order_id=${encodeURIComponent(orderId || '')}&session_id={CHECKOUT_SESSION_ID}`;
    const effectiveCancelUrl =
      cancelUrl ||
      `${reqOrigin}/?payment=cancelled&order_id=${encodeURIComponent(orderId || '')}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      client_reference_id: orderId || undefined,
      customer_email: customerEmail || undefined,
      metadata: {
        orderId: orderId || '',
        source: 'MetaSlim Pro Store Checkout',
      },
      success_url: effectiveSuccessUrl,
      cancel_url: effectiveCancelUrl,
    });

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Vercel Stripe Checkout Session creation failed:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Falha ao conectar com o gateway Stripe.',
    });
  }
}
