import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const rawKey = req.body?.secretKey || process.env.STRIPE_SECRET_KEY;
    if (!rawKey || typeof rawKey !== 'string' || !rawKey.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Chave Secreta Stripe não fornecida. Insira a sua chave sk_live_... no Painel Admin.',
      });
    }

    const key = rawKey.trim();
    const stripe = new Stripe(key);
    const balance = await stripe.balance.retrieve();

    return res.status(200).json({
      success: true,
      mode: balance.livemode ? 'live' : 'test',
      businessName: balance.livemode ? 'Conta Stripe Live Oficial' : 'Conta Stripe Teste',
      available: balance.available.map((b) => `${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`),
    });
  } catch (err: any) {
    console.error('Vercel Stripe test connection error:', err);
    return res.status(400).json({
      success: false,
      error: err?.message || 'Falha ao autenticar chave na API da Stripe.',
    });
  }
}
