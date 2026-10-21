export type AppLanguage = 'pt' | 'es' | 'en';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  shortLabel: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'pt', label: 'Português', shortLabel: 'PT', flag: '🇵🇹' },
  { code: 'es', label: 'Español', shortLabel: 'ES', flag: '🇪🇸' },
  { code: 'en', label: 'English', shortLabel: 'EN', flag: '🇬🇧' },
];

export const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  pt: {
    // Header & Navigation
    'nav.home': 'Início',
    'nav.products': 'Peptídeos',
    'nav.catalog': 'Catálogo de Peptídeos',
    'nav.results': 'Antes & Depois dos Clientes',
    'nav.cart': 'Carrinho',
    'nav.cart_full': 'Carrinho de Compras',
    'nav.delivery': 'Prazos',
    'nav.delivery_full': 'Prazos de Entrega',
    'nav.resale': 'Revenda',
    'nav.resale_full': 'Programa de Revenda (Lucros > 300%)',
    'nav.affiliate': 'Indique',
    'nav.affiliate_btn': 'Indique & Ganhe',
    'nav.my_affiliate_link': 'Meu Link de Afiliado',
    'nav.my_cart': 'Meu Carrinho',
    'nav.admin': 'Admin',
    'nav.admin_panel': 'Painel Administrativo',
    'nav.super_admin': 'Super Admin (Lojas)',
    'nav.login': 'Entrar',
    'nav.logout': 'Sair da Conta',
    'header.search_placeholder': 'Buscar peptídeo (Retatrutide, Tirzepatide, BPC-157)...',
    'header.search_mobile': 'Buscar peptídeo...',
    'header.language_title': 'Escolher Idioma (Português / Español / English)',
    'header.language_changed': 'Idioma alterado para Português 🇵🇹',
    'header.verified_customer': 'Cliente Cadastrado',
    'header.google_verified': 'Google Verificado',
    'header.admin_connected': 'Admin Conectado',

    // Referral Top Banner
    'referral.active_banner': 'Indicação Ativa: Você está comprando através do link do parceiro',
    'referral.view_program': 'Ver Programa de Afiliados',
    'referral.toast_linked': '✨ Indicação Ativa: Código {code} vinculado com sucesso!',

    // Home View
    'home.trust_hplc': 'Laudo HPLC >99%',
    'home.trust_shipping': 'Envio Térmico',
    'home.trust_lyophilized': 'Liofilização Pura',
    'home.featured_tag': 'Destaque • Tri-Agonista',
    'home.from_price': 'A partir de',
    'home.details': 'Detalhes',
    'home.buy_now': 'Comprar Agora',
    'home.buy': 'Comprar',
    'home.available_peptides': 'Peptídeos Disponíveis',
    'home.certified_count': '{count} compostos certificados por HPLC.',
    'home.calc_title': 'Dúvidas sobre a Reconstituição ou Dosagem?',
    'home.calc_desc': 'Utilize a nossa calculadora de água bacteriostática estéril para obter a equivalência exata de unidades na seringa de insulina.',
    'home.calc_btn': 'Abrir Calculadora',

    // Catalog View
    'catalog.title': 'Catálogo de Peptídeos Liofilizados',
    'catalog.subtitle': 'Selecione o peptídeo para verificar dosagens, cromatografia HPLC e link direto de pagamento.',
    'catalog.search_results': 'Resultados da busca por:',
    'catalog.found': 'encontrados',
    'catalog.empty_title': 'Nenhum peptídeo encontrado',
    'catalog.empty_desc': 'Tente buscar por outro termo.',

    // Product Card & Detail
    'product.indication': 'Indicação:',
    'product.dosage_range': '10 a 100mg',
    'product.batch_validated': 'Lote Validado',
    'product.coa_verified': 'COA Verificado',
    'product.storage_temp': 'Conservação: 2°C - 8°C',
    'product.batch_label': 'LOTE:',
    'product.bio_formula': 'Bio-Fórmula de Alta Pureza',
    'product.in_stock': 'Em Estoque ({count} un)',
    'product.promo_price': 'Preço Promocional',
    'product.choose_dosage': 'Escolha a Dosagem do Frasco (10mg a 100mg)',
    'product.selected_mg': '{mg} mg selecionado',
    'product.lyophilized_note': '* Frasco liofilizado com selo de garantia farmacêutica e laudo HPLC (>99%).',
    'product.select_vials': 'Selecione a Quantidade de Frascos',
    'product.free_cold_shipping': 'Envio Refrigerado Grátis > €100',
    'product.vial_1': '1 Frasco',
    'product.vial_1_sub': 'Dose Inicial',
    'product.vial_2': '2 Frascos',
    'product.vial_2_sub': 'Ciclo 60 Dias',
    'product.save_20': 'POUPE 20%',
    'product.vial_3': '3 Frascos',
    'product.vial_3_sub': 'Poupe 30%',
    'product.best_value': 'MELHOR VALOR',
    'product.add_to_cart': 'Adicionar ao Carrinho',
    'product.secure_checkout': 'Checkout Seguro 256-bit',
    'product.immediate_dispatch': 'Expedição Imediata',
    'product.delivery_time': 'Prazos: 2 a 5 dias úteis',
    'product.warranty_28': 'Garantia 28 Dias',
    'product.tab_didactic': 'Guia Prático & Diluição',
    'product.tab_self_guided': 'Auto-Guiado',
    'product.tab_targets': 'Alvos Biológicos',
    'product.tab_technical': 'Ficha Técnica & COA',

    // Before & After Section
    'results.badge': 'Resultados Reais & Verificados',
    'results.title': 'Antes & Depois da Comunidade',
    'results.subtitle': 'Transformações documentadas com protocolos clínicos certificados.',
    'results.before': 'Antes',
    'results.after': 'Depois',
    'results.protocol': 'Protocolo:',
    'results.verified_member': 'Membro Verificado',

    // Footer
    'footer.brand_desc': 'Plataforma europeia e brasileira especializada em peptídeos liofilizados de alta pureza (HPLC > 99%). Fórmulas desenvolvidas para longevidade, recomposição metabólica e recuperação celular.',
    'footer.phone_support': 'Atendimento Telefónico:',
    'footer.navigation': 'Navegação',
    'footer.quality_title': 'Padrão de Qualidade',
    'footer.quality_delivery': 'Entrega Garantida: Portugal, Europa (2-5 dias) e Brasil (Expresso)',
    'footer.quality_hplc': 'Análise cromatográfica HPLC > 99% em todos os lotes',
    'footer.quality_security': 'Transações criptografadas via Stripe Checkout 256-bit',
    'footer.choose_language': 'Idioma da Loja:',

    // Affiliate Modal
    'affiliate.badge': 'Programa Oficial de Afiliados & Indicação',
    'affiliate.title_prefix': 'Indique Amigos & Ganhe',
    'affiliate.title_commission': '{percent}% de Comissão',
    'affiliate.subtitle': 'Compartilhe seu link exclusivo de afiliado. Sempre que alguém realizar uma compra através do seu link ou código, você recebe {percent}% do valor da venda diretamente via PIX ou IBAN!',
    'affiliate.tab_link': 'Meu Link & Código',
    'affiliate.tab_sales': 'Minhas Indicações',
    'affiliate.tab_payout': 'Receber via PIX / IBAN',
    'affiliate.guest_title': 'Crie sua conta grátis para ativar seu Link Exclusivo!',
    'affiliate.guest_desc': 'Para que possamos rastrear suas vendas e transferir suas comissões via PIX ou IBAN, cadastre-se ou entre na sua conta de cliente em menos de 30 segundos.',
    'affiliate.register_btn': 'Criar Conta de Afiliado Grátis',
    'affiliate.copied': 'Link de afiliado copiado!',
  },

  es: {
    // Header & Navigation
    'nav.home': 'Inicio',
    'nav.products': 'Péptidos',
    'nav.catalog': 'Catálogo de Péptidos',
    'nav.results': 'Antes y Después de Clientes',
    'nav.cart': 'Carrito',
    'nav.cart_full': 'Carrito de Compras',
    'nav.delivery': 'Envíos',
    'nav.delivery_full': 'Plazos de Entrega',
    'nav.resale': 'Reventa',
    'nav.resale_full': 'Programa de Reventa (Margen > 300%)',
    'nav.affiliate': 'Recomienda',
    'nav.affiliate_btn': 'Recomienda y Gana',
    'nav.my_affiliate_link': 'Mi Enlace de Afiliado',
    'nav.my_cart': 'Mi Carrito',
    'nav.admin': 'Admin',
    'nav.admin_panel': 'Panel de Administración',
    'nav.super_admin': 'Super Admin (Tiendas)',
    'nav.login': 'Entrar',
    'nav.logout': 'Cerrar Sesión',
    'header.search_placeholder': 'Buscar péptido (Retatrutide, Tirzepatide, BPC-157)...',
    'header.search_mobile': 'Buscar péptido...',
    'header.language_title': 'Elegir Idioma (Português / Español / English)',
    'header.language_changed': 'Idioma cambiado a Español 🇪🇸',
    'header.verified_customer': 'Cliente Registrado',
    'header.google_verified': 'Google Verificado',
    'header.admin_connected': 'Admin Conectado',

    // Referral Top Banner
    'referral.active_banner': 'Recomendación Activa: Estás comprando a través del enlace del socio',
    'referral.view_program': 'Ver Programa de Afiliados',
    'referral.toast_linked': '✨ Recomendación Activa: ¡Código {code} vinculado con éxito!',

    // Home View
    'home.trust_hplc': 'Certificado HPLC >99%',
    'home.trust_shipping': 'Envío Térmico',
    'home.trust_lyophilized': 'Liofilización Pura',
    'home.featured_tag': 'Destacado • Tri-Agonista',
    'home.from_price': 'Desde',
    'home.details': 'Detalles',
    'home.buy_now': 'Comprar Ahora',
    'home.buy': 'Comprar',
    'home.available_peptides': 'Péptidos Disponibles',
    'home.certified_count': '{count} compuestos certificados por HPLC.',
    'home.calc_title': '¿Dudas sobre la Reconstitución o Dosificación?',
    'home.calc_desc': 'Utilice nuestra calculadora de agua bacteriostática estéril para obtener la equivalencia exacta de unidades en la jeringa de insulina.',
    'home.calc_btn': 'Abrir Calculadora',

    // Catalog View
    'catalog.title': 'Catálogo de Péptidos Liofilizados',
    'catalog.subtitle': 'Seleccione el péptido para verificar dosis, cromatografía HPLC y enlace directo de pago.',
    'catalog.search_results': 'Resultados de búsqueda para:',
    'catalog.found': 'encontrados',
    'catalog.empty_title': 'Ningún péptido encontrado',
    'catalog.empty_desc': 'Intente buscar con otro término.',

    // Product Card & Detail
    'product.indication': 'Indicación:',
    'product.dosage_range': '10 a 100mg',
    'product.batch_validated': 'Lote Validado',
    'product.coa_verified': 'COA Verificado',
    'product.storage_temp': 'Conservación: 2°C - 8°C',
    'product.batch_label': 'LOTE:',
    'product.bio_formula': 'Bio-Fórmula de Alta Pureza',
    'product.in_stock': 'En Stock ({count} uds)',
    'product.promo_price': 'Precio Promocional',
    'product.choose_dosage': 'Elija la Dosis del Vial (10mg a 100mg)',
    'product.selected_mg': '{mg} mg seleccionado',
    'product.lyophilized_note': '* Vial liofilizado con sello de garantía farmacéutica y certificado HPLC (>99%).',
    'product.select_vials': 'Seleccione la Cantidad de Viales',
    'product.free_cold_shipping': 'Envío Refrigerado Gratis > €100',
    'product.vial_1': '1 Vial',
    'product.vial_1_sub': 'Dosis Inicial',
    'product.vial_2': '2 Viales',
    'product.vial_2_sub': 'Ciclo 60 Días',
    'product.save_20': 'AHORRA 20%',
    'product.vial_3': '3 Viales',
    'product.vial_3_sub': 'Ahorra 30%',
    'product.best_value': 'MEJOR VALOR',
    'product.add_to_cart': 'Añadir al Carrito',
    'product.secure_checkout': 'Pago Seguro 256-bit',
    'product.immediate_dispatch': 'Expedición Inmediata',
    'product.delivery_time': 'Plazos: 2 a 5 días hábiles',
    'product.warranty_28': 'Garantía 28 Días',
    'product.tab_didactic': 'Guía Práctica y Dilución',
    'product.tab_self_guided': 'Auto-Guiado',
    'product.tab_targets': 'Objetivos Biológicos',
    'product.tab_technical': 'Ficha Técnica y COA',

    // Before & After Section
    'results.badge': 'Resultados Reales y Verificados',
    'results.title': 'Antes y Después de la Comunidad',
    'results.subtitle': 'Transformaciones documentadas con protocolos clínicos certificados.',
    'results.before': 'Antes',
    'results.after': 'Después',
    'results.protocol': 'Protocolo:',
    'results.verified_member': 'Miembro Verificado',

    // Footer
    'footer.brand_desc': 'Plataforma europea y brasileña especializada en péptidos liofilizados de alta pureza (HPLC > 99%). Fórmulas desarrolladas para longevidad, recomposición metabólica y recuperación celular.',
    'footer.phone_support': 'Atención Telefónica:',
    'footer.navigation': 'Navegación',
    'footer.quality_title': 'Estándar de Calidad',
    'footer.quality_delivery': 'Entrega Garantizada: Portugal, España, Europa (2-5 días) y Brasil (Expreso)',
    'footer.quality_hplc': 'Análisis cromatográfico HPLC > 99% en todos los lotes',
    'footer.quality_security': 'Transacciones encriptadas vía Stripe Checkout 256-bit',
    'footer.choose_language': 'Idioma de la Tienda:',

    // Affiliate Modal
    'affiliate.badge': 'Programa Oficial de Afiliados y Recomendación',
    'affiliate.title_prefix': 'Recomienda Amigos y Gana',
    'affiliate.title_commission': '{percent}% de Comisión',
    'affiliate.subtitle': 'Comparte tu enlace exclusivo de afiliado. Siempre que alguien realice una compra con tu enlace o código, recibes el {percent}% del valor de la venta directamente vía PIX o IBAN.',
    'affiliate.tab_link': 'Mi Enlace y Código',
    'affiliate.tab_sales': 'Mis Recomendaciones',
    'affiliate.tab_payout': 'Cobrar vía PIX / IBAN',
    'affiliate.guest_title': '¡Crea tu cuenta gratis para activar tu Enlace Exclusivo!',
    'affiliate.guest_desc': 'Para rastrear tus ventas y transferir tus comisiones vía PIX o IBAN, regístrate o inicia sesión en menos de 30 segundos.',
    'affiliate.register_btn': 'Crear Cuenta de Afiliado Gratis',
    'affiliate.copied': '¡Enlace de afiliado copiado!',
  },

  en: {
    // Header & Navigation
    'nav.home': 'Home',
    'nav.products': 'Peptides',
    'nav.catalog': 'Peptide Catalog',
    'nav.results': 'Customer Before & After',
    'nav.cart': 'Cart',
    'nav.cart_full': 'Shopping Cart',
    'nav.delivery': 'Shipping',
    'nav.delivery_full': 'Delivery Policy & Times',
    'nav.resale': 'Wholesale',
    'nav.resale_full': 'Reseller & Wholesale Program (300%+ Margin)',
    'nav.affiliate': 'Refer',
    'nav.affiliate_btn': 'Refer & Earn',
    'nav.my_affiliate_link': 'My Affiliate Link',
    'nav.my_cart': 'My Cart',
    'nav.admin': 'Admin',
    'nav.admin_panel': 'Admin Dashboard',
    'nav.super_admin': 'Super Admin (Stores)',
    'nav.login': 'Sign In',
    'nav.logout': 'Sign Out',
    'header.search_placeholder': 'Search peptide (Retatrutide, Tirzepatide, BPC-157)...',
    'header.search_mobile': 'Search peptide...',
    'header.language_title': 'Select Language (Português / Español / English)',
    'header.language_changed': 'Language changed to English 🇬🇧',
    'header.verified_customer': 'Verified Customer',
    'header.google_verified': 'Google Verified',
    'header.admin_connected': 'Admin Connected',

    // Referral Top Banner
    'referral.active_banner': 'Active Referral: You are shopping through partner link',
    'referral.view_program': 'View Affiliate Program',
    'referral.toast_linked': '✨ Active Referral: Code {code} linked successfully!',

    // Home View
    'home.trust_hplc': 'HPLC Report >99%',
    'home.trust_shipping': 'Cold Chain Shipping',
    'home.trust_lyophilized': 'Pure Lyophilized',
    'home.featured_tag': 'Featured • Tri-Agonist',
    'home.from_price': 'Starting at',
    'home.details': 'Details',
    'home.buy_now': 'Buy Now',
    'home.buy': 'Buy',
    'home.available_peptides': 'Available Peptides',
    'home.certified_count': '{count} HPLC-certified compounds.',
    'home.calc_title': 'Questions about Reconstitution or Dosage?',
    'home.calc_desc': 'Use our sterile bacteriostatic water calculator to get the exact insulin syringe unit equivalence.',
    'home.calc_btn': 'Open Calculator',

    // Catalog View
    'catalog.title': 'Lyophilized Peptide Catalog',
    'catalog.subtitle': 'Select a peptide to check dosages, HPLC chromatography, and direct checkout.',
    'catalog.search_results': 'Search results for:',
    'catalog.found': 'found',
    'catalog.empty_title': 'No peptides found',
    'catalog.empty_desc': 'Try searching for another term.',

    // Product Card & Detail
    'product.indication': 'Indication:',
    'product.dosage_range': '10 to 100mg',
    'product.batch_validated': 'Validated Batch',
    'product.coa_verified': 'Verified COA',
    'product.storage_temp': 'Storage: 2°C - 8°C',
    'product.batch_label': 'BATCH:',
    'product.bio_formula': 'High-Purity Bio-Formula',
    'product.in_stock': 'In Stock ({count} units)',
    'product.promo_price': 'Promotional Price',
    'product.choose_dosage': 'Select Vial Dosage (10mg to 100mg)',
    'product.selected_mg': '{mg} mg selected',
    'product.lyophilized_note': '* Lyophilized vial with pharmaceutical quality seal and HPLC report (>99%).',
    'product.select_vials': 'Select Number of Vials',
    'product.free_cold_shipping': 'Free Cold Shipping > €100',
    'product.vial_1': '1 Vial',
    'product.vial_1_sub': 'Starter Dose',
    'product.vial_2': '2 Vials',
    'product.vial_2_sub': '60-Day Cycle',
    'product.save_20': 'SAVE 20%',
    'product.vial_3': '3 Vials',
    'product.vial_3_sub': 'Save 30%',
    'product.best_value': 'BEST VALUE',
    'product.add_to_cart': 'Add to Cart',
    'product.secure_checkout': '256-bit Secure Checkout',
    'product.immediate_dispatch': 'Immediate Dispatch',
    'product.delivery_time': 'Delivery: 2 to 5 business days',
    'product.warranty_28': '28-Day Guarantee',
    'product.tab_didactic': 'Practical & Dilution Guide',
    'product.tab_self_guided': 'Self-Guided',
    'product.tab_targets': 'Biological Targets',
    'product.tab_technical': 'Technical Sheet & COA',

    // Before & After Section
    'results.badge': 'Real & Verified Results',
    'results.title': 'Community Before & After',
    'results.subtitle': 'Documented transformations with certified clinical protocols.',
    'results.before': 'Before',
    'results.after': 'After',
    'results.protocol': 'Protocol:',
    'results.verified_member': 'Verified Member',

    // Footer
    'footer.brand_desc': 'European and Brazilian platform specialized in high-purity lyophilized peptides (HPLC > 99%). Formulas developed for longevity, metabolic recomposition, and cellular recovery.',
    'footer.phone_support': 'Phone Support:',
    'footer.navigation': 'Navigation',
    'footer.quality_title': 'Quality Standard',
    'footer.quality_delivery': 'Guaranteed Delivery: Portugal, Europe (2-5 days) & Brazil (Express)',
    'footer.quality_hplc': 'HPLC chromatographic analysis > 99% on all batches',
    'footer.quality_security': 'Encrypted transactions via 256-bit Stripe Checkout',
    'footer.choose_language': 'Store Language:',

    // Affiliate Modal
    'affiliate.badge': 'Official Affiliate & Referral Program',
    'affiliate.title_prefix': 'Refer Friends & Earn',
    'affiliate.title_commission': '{percent}% Commission',
    'affiliate.subtitle': 'Share your exclusive affiliate link. Whenever someone completes a purchase through your link or code, you earn {percent}% of the order value directly via PIX or IBAN!',
    'affiliate.tab_link': 'My Link & Code',
    'affiliate.tab_sales': 'My Referrals',
    'affiliate.tab_payout': 'Payout via PIX / IBAN',
    'affiliate.guest_title': 'Create your free account to activate your Exclusive Link!',
    'affiliate.guest_desc': 'So we can track your referrals and transfer your commissions via PIX or IBAN, sign up or log into your customer account in under 30 seconds.',
    'affiliate.register_btn': 'Create Free Affiliate Account',
    'affiliate.copied': 'Affiliate link copied!',
  },
};

const DYNAMIC_PHRASES: Record<string, { es: string; en: string }> = {
  'Mais Vendido': {
    es: 'Más Vendido',
    en: 'Best Seller',
  },
  'Lançamento': {
    es: 'Lanzamiento',
    en: 'New Release',
  },
  'Alta Procura': {
    es: 'Alta Demanda',
    en: 'High Demand',
  },
  'Fórmula Avançada': {
    es: 'Fórmula Avanzada',
    en: 'Advanced Formula',
  },
  'Ver Protocolo': {
    es: 'Ver Protocolo',
    en: 'View Protocol',
  },
  'Explorar Catálogo': {
    es: 'Explorar Catálogo',
    en: 'Explore Catalog',
  },
  'Ver Resultados Reais': {
    es: 'Ver Resultados Reales',
    en: 'See Real Results',
  },
  'Quero Revender': {
    es: 'Quiero Revender',
    en: 'Become a Reseller',
  },
  'Protocolo Clínico Europeu': {
    es: 'Protocolo Clínico Europeo',
    en: 'European Clinical Protocol',
  },
  'Padrão Ouro': {
    es: 'Estándar de Oro',
    en: 'Gold Standard',
  },
  'Combo Completo': {
    es: 'Combo Completo',
    en: 'Complete Bundle',
  },
};

export function translateText(
  lang: AppLanguage,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.pt;
  let value = dict[key] || TRANSLATIONS.pt[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return value;
}

export function translateDynamicText(lang: AppLanguage, text?: string): string {
  if (!text || lang === 'pt') return text || '';

  if (DYNAMIC_PHRASES[text]) {
    return DYNAMIC_PHRASES[text][lang];
  }

  let out = text;

  if (lang === 'es') {
    out = out
      .replace(/Pureza HPLC/gi, 'Pureza HPLC')
      .replace(/Liofilizado/gi, 'Liofilizado')
      .replace(/Agonista Triplo/gi, 'Triple Agonista')
      .replace(/Triplo Agonista/gi, 'Triple Agonista')
      .replace(/Duplo Agonista/gi, 'Doble Agonista')
      .replace(/Agonista Duplo/gi, 'Doble Agonista')
      .replace(/Redução acelerada de gordura visceral e controle glicêmico/gi, 'Reducción acelerada de grasa visceral y control glucémico')
      .replace(/Controle avançado de saciedade e redução de gordura corporal/gi, 'Control avanzado de saciedad y reducción de grasa corporal')
      .replace(/perda de peso/gi, 'pérdida de peso')
      .replace(/saciedade/gi, 'saciedad')
      .replace(/emagrecimento/gi, 'adelgazamiento')
      .replace(/recuperação muscular/gi, 'recuperación muscular')
      .replace(/reparo tecidual/gi, 'reparación tisular')
      .replace(/gordura abdominal/gi, 'grasa abdominal')
      .replace(/gordura visceral/gi, 'grasa visceral')
      .replace(/Frasco/g, 'Vial')
      .replace(/frasco/g, 'vial')
      .replace(/meses/g, 'meses')
      .replace(/Mais energia e/gi, 'Más energía y')
      .replace(/perdidos em/gi, 'perdidos en');
  } else if (lang === 'en') {
    out = out
      .replace(/Pureza HPLC/gi, 'HPLC Purity')
      .replace(/Pureza/gi, 'Purity')
      .replace(/Liofilizado/gi, 'Lyophilized')
      .replace(/Agonista Triplo/gi, 'Triple Agonist')
      .replace(/Triplo Agonista/gi, 'Triple Agonist')
      .replace(/Duplo Agonista/gi, 'Dual Agonist')
      .replace(/Agonista Duplo/gi, 'Dual Agonist')
      .replace(/Seletivo/gi, 'Selective')
      .replace(/Redução acelerada de gordura visceral e controle glicêmico/gi, 'Accelerated visceral fat reduction and glycemic control')
      .replace(/Controle avançado de saciedade e redução de gordura corporal/gi, 'Advanced satiety control and body fat reduction')
      .replace(/perda de peso/gi, 'weight loss')
      .replace(/saciedade/gi, 'satiety')
      .replace(/emagrecimento/gi, 'weight loss')
      .replace(/recuperação muscular/gi, 'muscle recovery')
      .replace(/reparo tecidual/gi, 'tissue repair')
      .replace(/gordura abdominal/gi, 'abdominal fat')
      .replace(/gordura visceral/gi, 'visceral fat')
      .replace(/Frasco/g, 'Vial')
      .replace(/frasco/g, 'vial')
      .replace(/em (\d+) meses/gi, 'in $1 months')
      .replace(/(\d+) meses e meio/gi, '$1.5 months')
      .replace(/(\d+) meses/gi, '$1 months')
      .replace(/Mais energia e/gi, 'More energy &')
      .replace(/perdidos em/gi, 'lost in');
  }

  return out;
}
