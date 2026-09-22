import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'MetaSlim Pro Store Backend' });
  });

  // 1. Stripe Test Connection Endpoint
  app.post('/api/stripe/test-connection', async (req, res) => {
    try {
      const rawKey = req.body.secretKey || process.env.STRIPE_SECRET_KEY;
      if (!rawKey || typeof rawKey !== 'string' || !rawKey.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Chave Secreta Stripe (Secret Key) não foi informada.',
        });
      }

      const key = rawKey.trim();
      if (!key.startsWith('sk_') && !key.startsWith('rk_')) {
        return res.status(400).json({
          success: false,
          error: 'Formato de chave inválido. A Chave Secreta deve começar com "sk_live_", "sk_test_" ou "rk_live_".',
        });
      }

      const stripe = new Stripe(key);
      const balance = await stripe.balance.retrieve();

      return res.json({
        success: true,
        mode: balance.livemode ? 'live' : 'test',
        businessName: balance.livemode ? 'Conta Stripe Live Oficial' : 'Conta Stripe Teste',
        available: balance.available.map((b) => `${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`),
      });
    } catch (err: any) {
      console.error('Stripe Test Connection Error:', err);
      return res.status(400).json({
        success: false,
        error: err.message || 'Falha ao autenticar com a API da Stripe. Verifique se a Chave Secreta está ativa no dashboard.',
      });
    }
  });

  // 2. Stripe Create Checkout Session Endpoint (Official Stripe Hosted Checkout)
  app.post('/api/stripe/create-checkout-session', async (req, res) => {
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
      } = req.body;

      const rawKey = secretKey || process.env.STRIPE_SECRET_KEY;
      if (!rawKey || typeof rawKey !== 'string' || !rawKey.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Chave Secreta da Stripe (Secret Key) não configurada. Salve sua chave sk_live_... no Painel Admin.',
        });
      }

      const key = rawKey.trim();
      const stripe = new Stripe(key);

      const reqOrigin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : '');
      const origin = reqOrigin || 'https://meta-slim-pro-loja-omega.vercel.app';

      // Format line items for Stripe Checkout
      let line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      if (Array.isArray(items) && items.length > 0) {
        line_items = items.map((item: any) => {
          // Stripe requires min 50 cents (or equivalent) in most currencies
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
        `${origin}/?payment=success&order_id=${encodeURIComponent(orderId || '')}&session_id={CHECKOUT_SESSION_ID}`;
      const effectiveCancelUrl =
        cancelUrl ||
        `${origin}/?payment=cancelled&order_id=${encodeURIComponent(orderId || '')}`;

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

      return res.json({
        success: true,
        url: session.url,
        sessionId: session.id,
      });
    } catch (err: any) {
      console.error('Stripe Session Creation Error:', err);
      return res.status(400).json({
        success: false,
        error: err.message || 'Erro ao gerar sessão de pagamento na Stripe.',
      });
    }
  });

  // 3. Stripe Verify Session Endpoint
  app.get('/api/stripe/verify-session', async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      const rawKey = (req.query.secretKey as string) || process.env.STRIPE_SECRET_KEY;

      if (!sessionId || !rawKey) {
        return res.status(400).json({ success: false, error: 'Parâmetros incompletos' });
      }

      const stripe = new Stripe(rawKey.trim());
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return res.json({
        success: true,
        paymentStatus: session.payment_status, // 'paid', 'unpaid', 'no_payment_required'
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency,
        customerEmail: session.customer_details?.email || session.customer_email,
        orderId: session.client_reference_id || session.metadata?.orderId,
      });
    } catch (err: any) {
      console.error('Stripe Session Verification Error:', err);
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
