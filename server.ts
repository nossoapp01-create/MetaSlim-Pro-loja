import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support larger payloads for base64 PDFs and high-res PNG images
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ limit: '60mb', extended: true }));

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

  // ==========================================
  // AI PRODUCT EXTRACTOR & AGENT ENDPOINTS
  // Support for Google Gemini & DeepSeek
  // ==========================================

  // 1. Test AI Key connection
  app.post('/api/ai/test-connection', async (req, res) => {
    try {
      const {
        provider = 'gemini',
        geminiApiKey,
        deepseekApiKey,
        geminiModel = 'gemini-3.8-flash',
        deepseekModel = 'deepseek-chat',
      } = req.body;

      if (provider === 'gemini') {
        const key = geminiApiKey?.trim() || process.env.GEMINI_API_KEY;
        if (!key) {
          return res.status(400).json({
            success: false,
            error: 'Nenhuma chave Gemini informada ou configurada no ambiente.',
          });
        }

        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
          model: geminiModel || 'gemini-3.8-flash',
          contents: 'Responda estritamente: "Conexão Gemini ativa e operacional".',
        });

        return res.json({
          success: true,
          provider: 'gemini',
          model: geminiModel,
          reply: response.text?.slice(0, 100).trim() || 'Conexão ativa',
          source: geminiApiKey ? 'Chave personalizada' : 'Chave do ambiente (servidor)',
        });
      } else if (provider === 'deepseek') {
        const key = deepseekApiKey?.trim();
        if (!key) {
          return res.status(400).json({
            success: false,
            error: 'Chave de API do DeepSeek não informada. Insira sua chave sk-...',
          });
        }

        const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: deepseekModel || 'deepseek-chat',
            messages: [
              {
                role: 'user',
                content: 'Responda estritamente: "Conexão DeepSeek ativa e operacional".',
              },
            ],
            max_tokens: 30,
          }),
        });

        if (!dsRes.ok) {
          const errData = (await dsRes.json().catch(() => ({}))) as any;
          return res.status(dsRes.status).json({
            success: false,
            error: errData?.error?.message || `Erro da API DeepSeek: HTTP ${dsRes.status}`,
          });
        }

        const dsData = (await dsRes.json()) as any;
        return res.json({
          success: true,
          provider: 'deepseek',
          model: deepseekModel,
          reply: dsData.choices?.[0]?.message?.content?.trim() || 'Conexão DeepSeek ativa',
        });
      }

      return res.status(400).json({ success: false, error: 'Provedor de IA desconhecido.' });
    } catch (err: any) {
      console.error('AI Test Connection Error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Falha ao testar conexão com a IA.',
      });
    }
  });

  // 2. Extract products from image or PDF
  app.post('/api/ai/extract-products', async (req, res) => {
    try {
      const {
        fileBase64,
        mimeType = 'image/png',
        fileName = 'documento',
        extractedText = '',
        provider = 'gemini',
        geminiApiKey,
        deepseekApiKey,
        geminiModel = 'gemini-3.8-flash',
        deepseekModel = 'deepseek-chat',
        enableWebSearch = true,
        targetTenantName = 'MetaSlim Pro Store',
      } = req.body;

      if (!fileBase64 && !extractedText) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum arquivo (PDF/Imagem) ou texto fornecido para extração.',
        });
      }

      const promptInstruction = `Você é um Agente Clínico e Farmacêutico Especialista em Peptídeos, Medicina da Longevidade e Gestão de E-commerce Médico (Loja: ${targetTenantName}).

Sua missão é analisar minuciosamente o documento/imagem em anexo (catálogo de peptídeos, lista de preços, folheto de laboratório, fotos de frascos ou laudo HPLC) e EXTRAIR TODOS OS PRODUTOS identificados nele.

DIRETRIZ CRÍTICA DE ENRIQUECIMENTO E PESQUISA:
- Se o documento tiver o nome do produto mas faltar descrição detalhada, mecanismo de ação, posologia, pureza HPLC ou benefícios, REALIZE A PESQUISA CLÍNICA E PREENCHA com dados científicos reais e confiáveis.
- Se não houver preço no documento, sugira um preço de mercado de alta qualidade em Euros (€) entre 45.00 e 180.00 EUR (e converta para BRL multiplicando por ~5.8).
- Para pureza cromatográfica (HPLC), indique com precisão (ex: "HPLC >99.2%").
- Para categoria, escolha a mais adequada entre: 'emagrecimento', 'massa-muscular', 'antienvelhecimento', 'cognicao', 'recuperacao', 'outro'.
- Para cada produto, retorne um objeto estritamente dentro da propriedade "products" no seguinte formato JSON:
{
  "products": [
    {
      "name": "Nome comercial do produto e dosagem (ex: Retatrutide 10mg)",
      "dosage": "ex: 10mg ou 5mg",
      "category": "emagrecimento | massa-muscular | antienvelhecimento | cognicao | recuperacao | outro",
      "price": 89.90,
      "priceBrl": 520.00,
      "description": "Texto clínico rico, profissional e persuasivo. Explique o que é, indicações médicas, mecanismo de ação (receptores envolvidos), principais benefícios esperados, modo correto de reconstituição com BAC water (Água Bacteriostática estéril) e conservação sob refrigeração de 2°C a 8°C.",
      "purity": "HPLC >99.4%",
      "halfLife": "Meia-vida (ex: ~6 dias)",
      "vialsCount": 1,
      "stock": 50,
      "featured": true,
      "suggestedBadge": "ex: Mais Vendido, Triagonista, Pureza >99%, Novo",
      "benefits": ["Redução potente do apetite", "Preservação da massa magra", "Estímulo mitocondrial"],
      "confidenceScore": 95
    }
  ],
  "summary": "Breve resumo descritivo do que foi detectado e enriquecido",
  "totalDetected": 1
}

IMPORTANTE: Retorne ESTRITAMENTE a estrutura JSON válida.`;

      // Option A: Gemini
      if (provider === 'gemini') {
        const key = geminiApiKey?.trim() || process.env.GEMINI_API_KEY;
        if (!key) {
          return res.status(400).json({
            success: false,
            error: 'Chave da API do Google Gemini não configurada. Forneça uma chave no painel do Agente.',
          });
        }

        const ai = new GoogleGenAI({ apiKey: key });
        const parts: any[] = [];

        if (fileBase64) {
          const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
          parts.push({
            inlineData: {
              mimeType: mimeType || 'image/png',
              data: cleanBase64,
            },
          });
        }

        if (extractedText) {
          parts.push({
            text: `Texto complementar lido do arquivo:\n${extractedText}`,
          });
        }

        parts.push({
          text: promptInstruction,
        });

        const chosenModel = geminiModel || 'gemini-3.8-flash';
        const config: any = {
          responseMimeType: 'application/json',
        };

        if (enableWebSearch) {
          config.tools = [{ googleSearch: {} }];
        }

        const response = await ai.models.generateContent({
          model: chosenModel,
          contents: { parts },
          config,
        });

        const rawText = response.text || '';
        let parsedResult: any = null;
        try {
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
          } else {
            parsedResult = JSON.parse(rawText);
          }
        } catch (jsonErr) {
          console.warn('Falha no JSON direto do Gemini, fallback:', jsonErr);
          parsedResult = {
            products: [],
            summary: rawText.slice(0, 300),
          };
        }

        return res.json({
          success: true,
          provider: 'gemini',
          model: chosenModel,
          products: parsedResult.products || [],
          summary: parsedResult.summary || 'Produtos extraídos e enriquecidos com sucesso via Gemini.',
          totalDetected: parsedResult.products?.length || 0,
        });
      }

      // Option B: DeepSeek
      if (provider === 'deepseek') {
        const key = deepseekApiKey?.trim();
        if (!key) {
          return res.status(400).json({
            success: false,
            error: 'Chave de API do DeepSeek não informada. Insira sua chave no painel do Agente.',
          });
        }

        let contentToSend = promptInstruction;
        if (extractedText) {
          contentToSend += `\n\nCONTEÚDO TEXTUAL DO ARQUIVO (${fileName}):\n${extractedText}`;
        } else if (fileBase64 && process.env.GEMINI_API_KEY) {
          // If no pre-extracted text, run quick OCR helper via Gemini vision
          try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
            const ocrRes = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: {
                parts: [
                  { inlineData: { mimeType, data: cleanBase64 } },
                  { text: 'Extraia todo o texto, tabelas, rótulos e nomes de produtos presentes nesta imagem/documento.' },
                ],
              },
            });
            const ocrText = ocrRes.text || '';
            contentToSend += `\n\nCONTEÚDO IDENTIFICADO NO ARQUIVO:\n${ocrText}`;
          } catch (ocrErr) {
            console.warn('OCR helper notice:', ocrErr);
          }
        }

        const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: deepseekModel || 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'Você é um assistente pericial de e-commerce e farmacologia que responde estritamente em JSON válido.',
              },
              {
                role: 'user',
                content: contentToSend,
              },
            ],
            response_format: { type: 'json_object' },
          }),
        });

        if (!dsRes.ok) {
          const errData = (await dsRes.json().catch(() => ({}))) as any;
          return res.status(dsRes.status).json({
            success: false,
            error: errData?.error?.message || `Erro da API DeepSeek: HTTP ${dsRes.status}`,
          });
        }

        const dsData = (await dsRes.json()) as any;
        const dsContent = dsData.choices?.[0]?.message?.content || '{}';
        const parsed = JSON.parse(dsContent);

        return res.json({
          success: true,
          provider: 'deepseek',
          model: deepseekModel,
          products: parsed.products || [],
          summary: parsed.summary || 'Extração e enriquecimento finalizados com sucesso via DeepSeek.',
          totalDetected: parsed.products?.length || 0,
        });
      }

      return res.status(400).json({ success: false, error: 'Provedor de IA inválido' });
    } catch (err: any) {
      console.error('Extract Products Error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Falha ao processar e extrair produtos com IA.',
      });
    }
  });

  // 3. Enrich single product with clinical research
  app.post('/api/ai/enrich-product', async (req, res) => {
    try {
      const {
        productName,
        provider = 'gemini',
        geminiApiKey,
        deepseekApiKey,
        geminiModel = 'gemini-3.8-flash',
        deepseekModel = 'deepseek-chat',
      } = req.body;

      if (!productName || typeof productName !== 'string' || !productName.trim()) {
        return res.status(400).json({ success: false, error: 'Nome do produto não informado.' });
      }

      const prompt = `Realize uma pesquisa científica e farmacológica completa sobre o peptídeo/composto "${productName.trim()}".
Gere a ficha técnica comercial de alto padrão com indicações clínicas, dosagem, reconstituição com BAC water e pureza.
Retorne um objeto JSON estritamente no seguinte formato:
{
  "name": "${productName.trim()}",
  "category": "emagrecimento | massa-muscular | antienvelhecimento | cognicao | recuperacao | outro",
  "dosage": "ex: 10mg",
  "description": "Texto clínico rico e aprofundado com indicações médicas, mecanismo de ação nos receptores, benefícios comprovados, conservação refrigerada a 2°C-8°C e reconstituição.",
  "purity": "HPLC >99.4%",
  "price": 89.90,
  "priceBrl": 520.00,
  "benefits": ["Benefício 1", "Benefício 2", "Benefício 3"],
  "halfLife": "Meia-vida aproximada",
  "suggestedBadge": "Destaque"
}`;

      if (provider === 'gemini') {
        const key = geminiApiKey?.trim() || process.env.GEMINI_API_KEY;
        if (!key) {
          return res.status(400).json({ success: false, error: 'Chave Gemini não configurada.' });
        }
        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
          model: geminiModel || 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            tools: [{ googleSearch: {} }],
          },
        });

        const raw = response.text || '{}';
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
        return res.json({ success: true, data: parsed });
      } else {
        const key = deepseekApiKey?.trim();
        if (!key) {
          return res.status(400).json({ success: false, error: 'Chave DeepSeek não informada.' });
        }
        const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: deepseekModel || 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
          }),
        });
        const dsData = (await dsRes.json()) as any;
        const raw = dsData.choices?.[0]?.message?.content || '{}';
        const parsed = JSON.parse(raw);
        return res.json({ success: true, data: parsed });
      }
    } catch (err: any) {
      console.error('Enrich Product Error:', err);
      return res.status(500).json({ success: false, error: err.message });
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
