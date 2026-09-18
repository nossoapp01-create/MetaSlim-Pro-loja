import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sessionId = (req.query.sessionId as string) || '';
    const rawKey = (req.query.secretKey as string) || process.env.STRIPE_SECRET_KEY;

    if (!sessionId || !rawKey) {
      return res.status(400).json({ success: false, error: 'Parâmetros incompletos' });
    }

    const stripe = new Stripe(rawKey.trim());
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return res.status(200).json({
      success: true,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
      customerEmail: session.customer_details?.email || session.customer_email,
      orderId: session.client_reference_id || session.metadata?.orderId,
    });
  } catch (err: any) {
    console.error('Vercel Stripe verify error:', err);
    return res.status(400).json({ success: false, error: err?.message });
  }
}
