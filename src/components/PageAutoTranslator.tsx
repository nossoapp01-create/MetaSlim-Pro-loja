import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { AppLanguage, translateDynamicText } from '../utils/i18n';

// Comprehensive clause & word-level dictionaries for automatic full-page DOM translation
const CLAUSE_TRANSLATIONS_ES: Array<[RegExp, string]> = [
  [/Para garantir pureza superior a 99% e frescor celular do peptídeo, determinados itens raros ou concentrações especiais são liofilizados e analisados por lote individual antes de seguirem para o cliente\./gi, 'Para garantizar una pureza superior al 99% y frescura celular del péptido, ciertos artículos exclusivos o concentraciones especiales se liofilizan y analizan por lote individual antes de enviarse al cliente.'],
  [/Compostos liofilizados que demandam lote sob demanda, controle analítico de cromatografia HPLC e esterilização certificada antes da expedição\./gi, 'Compuestos liofilizados que requieren lote bajo demanda, control analítico de cromatografía HPLC y esterilización certificada antes de su expedición.'],
  [/Os prazos começam a contar a partir da/gi, 'Los plazos comienzan a contar a partir de la'],
  [/confirmação do pagamento/gi, 'confirmación del pago'],
  [/e envio do comprovativo de expedição com o respetivo código de rastreamento\./gi, 'y el envío del comprobante de expedición con su respectivo código de seguimiento.'],
  [/Caso a sua encomenda combine artigos em stock com artigos sob encomenda, os produtos serão enviados/gi, 'Si tu pedido combina artículos en stock con artículos bajo pedido, los productos se enviarán'],
  [/em conjunto assim que todos estiverem disponíveis/gi, 'conjuntamente tan pronto como todos estén disponibles'],
  [/\(salvo indicação em contrário\)\./gi, '(salvo indicación en contrario).'],
  [/Receba notificações automáticas de status e código de rastreamento para acompanhar o percurso da encomenda desde a recolha até a entrega\./gi, 'Recibe notificaciones automáticas de estado y código de seguimiento para acompañar el recorrido del pedido desde la recogida hasta la entrega.'],
  [/Embalagem externa neutra e segura, sem menção ostensiva externa a fórmulas ou compostos, garantindo a sua total privacidade\./gi, 'Embalaje externo neutro y seguro, sin mención externa a fórmulas o compuestos, garantizando tu total privacidad.'],
  [/Nossa equipe médica e de apoio logístico está disponível para confirmar a disponibilidade de stock e expedição em tempo real\./gi, 'Nuestro equipo médico y de apoyo logístico está disponible para confirmar la disponibilidad de stock y expedición en tiempo real.'],
  [/Forneça a médicos, nutricionistas, clínicas estéticas e clientes particulares os peptídeos metabólicos mais procurados do mundo/gi, 'Suministra a médicos, nutricionistas, clínicas estéticas y clientes particulares los péptidos metabólicos más demandados del mundo'],
  [/Qualidade laboratorial testada por HPLC \(>99%\), entrega discreta em cadeia de frio e pedido mínimo acessível de/gi, 'Calidad de laboratorio probada por HPLC (>99%), entrega discreta en cadena de frío y pedido mínimo accesible de'],
  [/apenas 20 unidades/gi, 'solo 20 unidades'],
  [/A revolução dos agonistas incretínicos e peptídeos bioidênticos movimenta bilhões globalmente\./gi, 'La revolución de los agonistas incretínicos y péptidos bioidénticos mueve miles de millones globalmente.'],
  [/Ao escolher a MetaSlim Pro, você atua com padrão laboratorial de excelência e altíssima aceitação\./gi, 'Al elegir MetaSlim Pro, operas con un estándar de laboratorio de excelencia y altísima aceptación.'],
  [/Compre direto no atacado a valores de frasco entre/gi, 'Compra directo al por mayor a precios por vial entre'],
  [/e revenda no mercado a valores de/gi, 'y revende en el mercado a precios de'],
  [/O seu investimento inicial retorna triplicado\./gi, 'Tu inversión inicial retorna triplicada.'],
  [/Não exigimos investimentos de dezenas de milhares de euros\. Comece com apenas/gi, 'No exigimos inversiones de decenas de miles de euros. Comienza con solo'],
  [/permitindo validar a sua carteira de clientes sem risco de capital excessivo\./gi, 'permitiendo validar tu cartera de clientes sin riesgo de capital excesivo.'],
  [/Zero queixas e zero devoluções\. Cada lote passa por cromatografia líquida de alta eficiência \(HPLC\) e espectrometria de massa, garantindo a fidelidade dos seus clientes mais exigentes\./gi, 'Cero quejas y cero devoluciones. Cada lote pasa por cromatografía líquida de alta eficacia (HPLC) y espectrometría de masas, garantizando la fidelidad de tus clientes más exigentes.'],
  [/Protocolos de emagrecimento duram entre 12 a 24 semanas\. Cada cliente conquistado compra de você todos os meses, construindo uma receita previsível e crescente\./gi, 'Los protocolos de adelgazamiento duran entre 12 y 24 semanas. Cada cliente fidelizado te compra todos los meses, construyendo un ingreso predecible y creciente.'],
  [/Os seus packs de revenda são enviados com refrigeração controlada \(2°C a 8°C\) em caixas isotérmicas e embalagem neutra\/discreta, garantindo preservação molecular e total privacidade\./gi, 'Tus packs de reventa se envían con refrigeración controlada (2°C a 8°C) en cajas isotérmicas y embalaje neutro/discreto, garantizando preservación molecular y total privacidad.'],
  [/Você recebe tabelas completas de reconstituição com água BAC estéril, fichas clínicas dos compostos e assessoria médica especializada para orientar os seus pedidos de reposição\./gi, 'Recibes tablas completas de reconstitución con agua BAC estéril, fichas clínicas de los compuestos y asesoría médica especializada para orientar tus pedidos de reposición.'],
  [/Ajuste o tamanho do pack \(mínimo de 20 unidades\) e o composto para visualizar o custo no atacado, o faturamento estimado e a margem de retorno líquido no seu bolso\./gi, 'Ajusta el tamaño del pack (mínimo de 20 unidades) y el compuesto para visualizar el costo mayorista, la facturación estimada y el margen de retorno neto en tu bolsillo.'],
  [/Todos os packs contam com envio refrigerado e laudos HPLC individuais\. O pedido mínimo é a partir de/gi, 'Todos los packs cuentan con envío refrigerado y certificados HPLC individuales. El pedido mínimo es a partir de'],
  [/Posso mesclar peptídeos diferentes no pack de 20 unidades\?/gi, '¿Puedo mezclar péptidos diferentes en el pack de 20 unidades?'],
  [/Sim! O pedido mínimo são 20 frascos, e você pode combinar por exemplo 10 frascos de Retatrutide e 10 frascos de Tirzepatide, ou a combinação que melhor atender a sua carteira de clientes\./gi, '¡Sí! El pedido mínimo son 20 viales, y puedes combinar por ejemplo 10 viales de Retatrutide y 10 viales de Tirzepatide, o la combinación que mejor atienda tu cartera de clientes.'],
  [/Qual é a validade e forma de armazenamento dos frascos\?/gi, '¿Cuál es la validez y forma de almacenamiento de los viales?'],
  [/Como funciona o envio para o meu endereço\?/gi, '¿Cómo funciona el envío a mi dirección?'],
  [/Recebo suporte para orientar os meus clientes sobre doses\?/gi, '¿Recibo soporte para orientar a mis clientes sobre las dosis?'],
  [/Pronto para Ter a Sua Própria Operação de Peptídeos com Mais de 300% de Lucro\?/gi, '¿Listo para Tener tu Propia Operación de Péptidos con Más del 300% de Ganancia?'],
  [/Desacelera suavemente o esvaziamento gástrico e atua diretamente nos neurônios do hipotálamo, suprimindo o apetite basal e episódios de compulsão alimentar\./gi, 'Ralentiza suavemente el vaciamiento gástrico y actúa directamente en las neuronas del hipotálamo, suprimiendo el apetito basal y los episodios de compulsión alimentaria.'],
  [/Modula a sensibilidade periférica à insulina e otimiza a partição de nutrientes, direcionando substratos energéticos para o tecido muscular e inibindo depósitos adiposos\./gi, 'Modula la sensibilidad periférica a la insulina y optimiza la partición de nutrientes, dirigiendo sustratos energéticos al tejido muscular e inhibiendo depósitos adiposos.'],
  [/O diferencial exclusivo frente à Semaglutida e Tirzepatida: induz a termogênese hepática e ativação de gordura marrom, elevando o gasto calórico em repouso\./gi, 'El diferencial exclusivo frente a Semaglutida y Tirzepatida: induce la termogénesis hepática y la activación de grasa parda, elevando el gasto calórico en reposo.'],
  [/Reconstituir com 2\.0ml de Água Bacteriostática estéril \(BAC\)\. Girar o frasco suavemente sem agitação brusca\. Cada 0\.1ml na seringa graduada corresponderá a 0\.5mg da molécula ativa\. Conservar entre 2°C e 8°C\./gi, 'Reconstituir con 2.0ml de Agua Bacteriostática estéril (BAC). Girar el vial suavemente sin agitar. Cada 0.1ml en la jeringa graduada corresponderá a 0.5mg de la molécula activa. Conservar entre 2°C y 8°C.'],
];

const CLAUSE_TRANSLATIONS_EN: Array<[RegExp, string]> = [
  [/Os prazos começam a contar a partir da/gi, 'Delivery timeframes start counting from'],
  [/confirmação do pagamento/gi, 'payment confirmation'],
  [/e envio do comprovativo de expedição com o respetivo código de rastreamento\./gi, 'and dispatch of the shipping receipt with its tracking code.'],
  [/Caso a sua encomenda combine artigos em stock com artigos sob encomenda, os produtos serão enviados/gi, 'If your order combines in-stock items with made-to-order items, the products will be shipped'],
  [/em conjunto assim que todos estiverem disponíveis/gi, 'together as soon as all items are available'],
  [/\(salvo indicação em contrário\)\./gi, '(unless otherwise requested).'],
  [/Receba notificações automáticas de status e código de rastreamento para acompanhar o percurso da encomenda desde a recolha até a entrega\./gi, 'Receive automatic status notifications and tracking codes to follow your shipment from pickup to delivery.'],
  [/Embalagem externa neutra e segura, sem menção ostensiva externa a fórmulas ou compostos, garantindo a sua total privacidade\./gi, 'Neutral and secure outer packaging with no external mention of formulas or compounds, ensuring complete privacy.'],
  [/Forneça a médicos, nutricionistas, clínicas estéticas e clientes particulares os peptídeos metabólicos mais procurados do mundo \(Retatrutide, Tirzepatide, Semaglutide e BPC-157\)\./gi, 'Supply doctors, nutritionists, aesthetic clinics, and private clients with the world’s most sought-after metabolic peptides (Retatrutide, Tirzepatide, Semaglutide, and BPC-157).'],
  [/Qualidade laboratorial testada por HPLC \(>99%\), entrega discreta em cadeia de frio e pedido mínimo acessível de/gi, 'HPLC-tested laboratory quality (>99%), discreet cold-chain delivery, and an accessible minimum order of'],
  [/apenas 20 unidades/gi, 'just 20 units'],
  [/A revolução dos agonistas incretínicos e peptídeos bioidênticos movimenta bilhões globalmente\./gi, 'The revolution of incretin agonists and bioidentical peptides drives billions globally.'],
  [/Ao escolher a MetaSlim Pro, você atua com padrão laboratorial de excelência e altíssima aceitação\./gi, 'By choosing MetaSlim Pro, you operate with laboratory-grade excellence and unmatched market acceptance.'],
  [/Compre direto no atacado a valores de frasco entre/gi, 'Buy direct at wholesale prices per vial between'],
  [/e revenda no mercado a valores de/gi, 'and resell on the market at'],
  [/O seu investimento inicial retorna triplicado\./gi, 'Your initial investment returns tripled.'],
  [/Não exigimos investimentos de dezenas de milhares de euros\. Comece com apenas/gi, 'We do not require tens of thousands of euros in upfront capital. Start with just'],
  [/permitindo validar a sua carteira de clientes sem risco de capital excessivo\./gi, 'allowing you to validate your client base without excessive capital risk.'],
  [/Zero queixas e zero devoluções\. Cada lote passa por cromatografia líquida de alta eficiência \(HPLC\) e espectrometria de massa, garantindo a fidelidade dos seus clientes mais exigentes\./gi, 'Zero complaints and zero returns. Every batch undergoes High-Performance Liquid Chromatography (HPLC) and mass spectrometry, ensuring loyalty from your most demanding clients.'],
  [/Protocolos de emagrecimento duram entre 12 a 24 semanas\. Cada cliente conquistado compra de você todos os meses, construindo uma receita previsível e crescente\./gi, 'Weight loss protocols last 12 to 24 weeks. Every client you acquire reorders monthly, building predictable and growing recurring revenue.'],
  [/Os seus packs de revenda são enviados com refrigeração controlada \(2°C a 8°C\) em caixas isotérmicas e embalagem neutra\/discreta, garantindo preservação molecular e total privacidade\./gi, 'Your wholesale packs are shipped under controlled refrigeration (2°C to 8°C) in isothermal boxes and neutral/discreet packaging, guaranteeing molecular preservation and total privacy.'],
  [/Você recebe tabelas completas de reconstituição com água BAC estéril, fichas clínicas dos compostos e assessoria médica especializada para orientar os seus pedidos de reposição\./gi, 'You receive complete sterile BAC water reconstitution charts, clinical compound sheets, and specialized medical advisory to guide your restock orders.'],
  [/Ajuste o tamanho do pack \(mínimo de 20 unidades\) e o composto para visualizar o custo no atacado, o faturamento estimado e a margem de retorno líquido no seu bolso\./gi, 'Adjust the pack size (minimum 20 units) and compound to preview wholesale cost, estimated revenue, and net profit margin in your pocket.'],
  [/Todos os packs contam com envio refrigerado e laudos HPLC individuais\. O pedido mínimo é a partir de/gi, 'All packs include cold-chain shipping and individual HPLC reports. Minimum order starts at'],
  [/Posso mesclar peptídeos diferentes no pack de 20 unidades\?/gi, 'Can I mix different peptides in the 20-unit pack?'],
  [/Sim! O pedido mínimo são 20 frascos, e você pode combinar por exemplo 10 frascos de Retatrutide e 10 frascos de Tirzepatide, ou a combinação que melhor atender a sua carteira de clientes\./gi, 'Yes! The minimum order is 20 vials, and you can combine, for example, 10 vials of Retatrutide and 10 vials of Tirzepatide, or whichever mix best serves your clients.'],
  [/Qual é a validade e forma de armazenamento dos frascos\?/gi, 'What is the shelf life and storage method for the vials?'],
  [/Na forma de pó liofilizado sob vácuo, a estabilidade é de/gi, 'In vacuum-lyophilized powder form, stability is'],
  [/24 a 36 meses/gi, '24 to 36 months'],
  [/conservado sob refrigeração simples \(2°C a 8°C\)\. Isso garante estocagem segura sem perda de potência\./gi, 'when kept under standard refrigeration (2°C to 8°C). This ensures safe stocking without loss of potency.'],
  [/Como funciona o envio para o meu endereço\?/gi, 'How does shipping to my address work?'],
  [/Os packs são embalados em caixas com proteção isotérmica térmica e almofadas térmicas de refrigeração\. O pacote externo é totalmente neutro e discreto para total sigilo e segurança\./gi, 'Packs are shipped in boxes with isothermal protection and cooling gel packs. The outer package is completely neutral and discreet for full privacy and security.'],
  [/Recebo suporte para orientar os meus clientes sobre doses\?/gi, 'Do I receive support to guide my clients on dosages?'],
  [/Com certeza\. Fornecemos todo o suporte sobre reconstituição em água bacteriostática \(BAC water\), equivalências em unidades de insulina e literatura clínica de suporte\./gi, 'Absolutely. We provide full guidance on reconstitution with bacteriostatic water (BAC water), insulin unit equivalences, and supporting clinical literature.'],
  [/Inicie agora com o/gi, 'Start today with the'],
  [/pack mínimo oficial de 20 unidades/gi, 'official 20-unit minimum pack'],
  [/Entre em contato diretamente com o nosso responsável de atacado para receber o catálogo completo com preços de revenda\./gi, 'Contact our wholesale manager directly to receive the complete B2B catalog and reseller price list.'],
  [/Contato & Seleção do Pack/gi, 'Contact & Pack Selection'],
  [/Entre em contato com nossa equipe e defina com o consultor os peptídeos do seu pack \(mínimo de 20 unidades\)\./gi, 'Contact our team and select your pack peptides with our advisor (minimum 20 units).'],
  [/Fatura & Pagamento/gi, 'Invoice & Payment'],
  [/Faturação formal com opções de Cartão, Transferência SEPA, Multibanco\/MBWay ou PIX para praticidade total\./gi, 'Formal invoicing with Card, SEPA Bank Transfer, Multibanco/MBWay, or PIX options for total convenience.'],
  [/Envio Frio Prioritário/gi, 'Priority Cold Shipping'],
  [/Embalagem isotérmica com isolamento térmico e código de rastreamento CTT Expresso ou DHL entregue em mãos\./gi, 'Isothermal packaging with thermal insulation and CTT Express or DHL tracking code delivered to your door.'],
  [/Revenda com \+300%/gi, 'Resell at +300%'],
  [/Entregue laudos de pureza aos seus compradores, fidelize a carteira e reponha o stock mensalmente com lucro garantido\./gi, 'Deliver purity certificates to your buyers, build client loyalty, and restock monthly with guaranteed profit.'],
  [/Custo Atacado:/gi, 'Wholesale Cost:'],
  [/Sugerido:/gi, 'Suggested:'],
  [/Venda Rápida/gi, 'Fast Sale'],
  [/Preço Médio de Mercado/gi, 'Market Average Price'],
  [/Clínica Especializada/gi, 'Specialized Clinic'],
  [/Garantir Pack de/gi, 'Reserve Pack of'],
  [/Unidades \(Consultoria B2B\)/gi, 'Units (B2B Advisory)'],
  [/Atendimento direto com consultor B2B • Resposta imediata/gi, 'Direct support with B2B advisor • Immediate response'],
  [/Pedir /gi, 'Order '],
  [/Pack Start Revenda/gi, 'Starter Wholesale Pack'],
  [/Pack Pro Master/gi, 'Pro Master Pack'],
  [/Pack Elite Distribuidor/gi, 'Elite Distributor Pack'],
  [/PEDIDO MÍNIMO OFICIAL/gi, 'OFFICIAL MINIMUM ORDER'],
  [/MAIS POPULAR • MELHOR MARGEM/gi, 'MOST POPULAR • BEST MARGIN'],
  [/MÁXIMA RENTABILIDADE/gi, 'MAXIMUM PROFITABILITY'],
  [/Lote de 20 frascos liofilizados padrão ouro com flexibilidade para escolher um único composto ou mix de incretinas\./gi, 'Batch of 20 gold-standard lyophilized vials with flexibility to choose a single compound or an incretin mix.'],
  [/Condição com desconto de volume ampliado por frasco\. Permite maior competitividade e margens superiores a 345%\./gi, 'Extended volume discount per vial. Enables greater competitiveness and margins exceeding 345%.'],
  [/Menor custo unitário de atacado\. Possibilidade de despacho programado fracionado para manter a frescura\./gi, 'Lowest wholesale unit cost. Includes option for scheduled split shipments to maintain peak freshness.'],
  [/Pedido Mínimo: 20 unidades lacradas/gi, 'Minimum Order: 20 sealed units'],
  [/Margem líquida de lucro superior a 304%/gi, 'Net profit margin exceeding 304%'],
  [/Laudos cromatográficos HPLC \(>99%\) inclusos/gi, 'HPLC chromatographic reports (>99%) included'],
  [/Embalagem isotérmica com cadeia de frio 2°C - 8°C/gi, 'Isothermal packaging with 2°C - 8°C cold chain'],
  [/Envio prioritário rastreado para Portugal e Europa/gi, 'Tracked priority shipping across Portugal & Europe'],
  [/Acesso à Calculadora de Reconstituição e Fichas Técnicas/gi, 'Access to Reconstitution Calculator & Technical Sheets'],
  [/Pack com 50 unidades lacradas/gi, 'Pack with 50 sealed units'],
  [/Margem líquida estimada superior a 345%/gi, 'Estimated net margin exceeding 345%'],
  [/Frete Expresso Térmico 100% Grátis/gi, '100% Free Express Thermal Shipping'],
  [/Mix livre entre Retatrutide, Tirzepatide e Semaglutide/gi, 'Free mix between Retatrutide, Tirzepatide & Semaglutide'],
  [/Canal de suporte prioritário 24\/7/gi, '24/7 priority support channel'],
  [/Material gráfico e digital para divulgação aos seus clientes/gi, 'Print & digital marketing materials for your clients'],
  [/Pack com 100 unidades lacradas/gi, 'Pack with 100 sealed units'],
  [/Margem líquida excepcional superior a 390%/gi, 'Exceptional net margin exceeding 390%'],
  [/Possibilidade de entrega fracionada em até 2 envios/gi, 'Option for split delivery in up to 2 shipments'],
  [/Atendimento VIP dedicado com gerente de conta B2B/gi, 'Dedicated VIP support with a B2B account manager'],
  [/Garantia de reposição imediata e lote reservado/gi, 'Immediate replacement guarantee & reserved batch'],
  [/Prioridade máxima em lançamentos e novos lotes certificados/gi, 'Top priority on new releases & certified batches'],
];

function fullTranslateNodeText(lang: AppLanguage, raw: string): string {
  if (!raw || lang === 'pt') return raw;
  const trimmed = raw.trim();
  if (!trimmed || /^[\d\s.,€$%+•\-:/()#]+$/.test(trimmed)) return raw;

  let out = translateDynamicText(lang, raw);

  const extraRules = lang === 'es' ? CLAUSE_TRANSLATIONS_ES : CLAUSE_TRANSLATIONS_EN;
  for (const [regex, replacement] of extraRules) {
    out = out.replace(regex, replacement);
  }

  // Word-level clinical & UI polish for remaining Portuguese words in ES or EN
  if (lang === 'en') {
    out = out
      .replace(/\bInício\b/g, 'Home')
      .replace(/\bProdutos\b/g, 'Products')
      .replace(/\bCarrinho\b/g, 'Cart')
      .replace(/\bAntes\b/g, 'Before')
      .replace(/\bDepois\b/g, 'After')
      .replace(/\bFechar\b/g, 'Close')
      .replace(/\bCancelar\b/g, 'Cancel')
      .replace(/\bAlterar\b/g, 'Change')
      .replace(/\bDosagem:/g, 'Dosage:')
      .replace(/\bUnidades\b/g, 'Units')
      .replace(/\bunidades\b/g, 'units')
      .replace(/\bsemana\b/g, 'week')
      .replace(/\bsemanas\b/g, 'weeks')
      .replace(/\bdiariamente\b/g, 'daily')
      .replace(/\bmanhã\b/g, 'morning')
      .replace(/\bnoite\b/g, 'night')
      .replace(/\bjejum\b/g, 'fasting')
      .replace(/\bCliques\b/g, 'Clicks')
      .replace(/\bVendas Feitas\b/g, 'Completed Sales')
      .replace(/\bA Receber\b/g, 'Pending Payout')
      .replace(/\bTotal Pago\b/g, 'Total Paid')
      .replace(/\bCopiar Link\b/g, 'Copy Link')
      .replace(/\bLink Copiado!\b/g, 'Link Copied!')
      .replace(/\bCompartilhar no WhatsApp\b/g, 'Share on WhatsApp')
      .replace(/\bSalvar Dados de Saque\b/g, 'Save Payout Details');
  } else if (lang === 'es') {
    out = out
      .replace(/\bInício\b/g, 'Inicio')
      .replace(/\bProdutos\b/g, 'Productos')
      .replace(/\bCarrinho\b/g, 'Carrito')
      .replace(/\bAntes\b/g, 'Antes')
      .replace(/\bDepois\b/g, 'Después')
      .replace(/\bFechar\b/g, 'Cerrar')
      .replace(/\bCancelar\b/g, 'Cancelar')
      .replace(/\bAlterar\b/g, 'Cambiar')
      .replace(/\bDosagem:/g, 'Dosis:')
      .replace(/\bUnidades\b/g, 'Unidades')
      .replace(/\bunidades\b/g, 'unidades')
      .replace(/\bsemana\b/g, 'semana')
      .replace(/\bsemanas\b/g, 'semanas')
      .replace(/\bdiariamente\b/g, 'diariamente')
      .replace(/\bmanhã\b/g, 'mañana')
      .replace(/\bnoite\b/g, 'noche')
      .replace(/\bjejum\b/g, 'ayunas')
      .replace(/\bCliques\b/g, 'Clics')
      .replace(/\bVendas Feitas\b/g, 'Ventas Realizadas')
      .replace(/\bA Receber\b/g, 'Por Cobrar')
      .replace(/\bTotal Pago\b/g, 'Total Pagado')
      .replace(/\bCopiar Link\b/g, 'Copiar Enlace')
      .replace(/\bLink Copiado!\b/g, '¡Enlace Copiado!')
      .replace(/\bCompartilhar no WhatsApp\b/g, 'Compartir en WhatsApp')
      .replace(/\bSalvar Dados de Saque\b/g, 'Guardar Datos de Cobro');
  }

  return out;
}

const originalTextMap = new WeakMap<Text, string>();
const lastTranslatedValueMap = new WeakMap<Text, string>();
const originalAttrMap = new WeakMap<Element, Record<string, string>>();

export const PageAutoTranslator: React.FC = () => {
  const { language } = useStore();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    let isApplying = false;

    const translateSubtree = (root: Node) => {
      if (isApplying) return;
      isApplying = true;

      try {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
          acceptNode(node) {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE') {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        });

        let currentNode = walker.nextNode() as Text | null;
        while (currentNode) {
          const currentVal = currentNode.nodeValue || '';

          // If nodeValue changed from what we last wrote, update original Portuguese baseline
          const lastWrote = lastTranslatedValueMap.get(currentNode);
          if (!originalTextMap.has(currentNode) || (lastWrote !== undefined && currentVal !== lastWrote)) {
            originalTextMap.set(currentNode, currentVal);
          }

          const basePt = originalTextMap.get(currentNode) ?? currentVal;
          const targetVal = language === 'pt' ? basePt : fullTranslateNodeText(language, basePt);

          if (currentNode.nodeValue !== targetVal) {
            currentNode.nodeValue = targetVal;
          }
          lastTranslatedValueMap.set(currentNode, targetVal);

          currentNode = walker.nextNode() as Text | null;
        }

        // Also translate placeholder, title, and aria-label attributes
        if (root instanceof Element || root instanceof Document) {
          const elements = (root instanceof Document ? root.body : root).querySelectorAll(
            '[placeholder], [title], [aria-label]'
          );
          elements.forEach((el) => {
            let stored = originalAttrMap.get(el);
            if (!stored) {
              stored = {};
              originalAttrMap.set(el, stored);
            }

            (['placeholder', 'title', 'aria-label'] as const).forEach((attr) => {
              const val = el.getAttribute(attr);
              if (!val) return;
              if (!(attr in stored!)) {
                stored![attr] = val;
              }
              const baseAttr = stored![attr];
              const translatedAttr =
                language === 'pt' ? baseAttr : fullTranslateNodeText(language, baseAttr);
              if (val !== translatedAttr) {
                el.setAttribute(attr, translatedAttr);
              }
            });
          });
        }
      } finally {
        isApplying = false;
      }
    };

    // Initial pass on language change
    translateSubtree(document.body);

    // Observe dynamic DOM updates (tab changes, modals, cart drawer, etc.)
    const observer = new MutationObserver((mutations) => {
      if (isApplying) return;
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            translateSubtree(node);
          });
        } else if (mutation.type === 'characterData' && mutation.target) {
          translateSubtree(mutation.target.parentNode || document.body);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [language]);

  return null;
};
