export interface Product {
  id: string;
  name: string;
  subtitle: string;
  refCode: string;
  category: 'glp1' | 'muscular' | 'longevidade' | 'kits';
  categoryLabel: string;
  price: number;
  originalPrice: number;
  purity: string;
  whatIsItFor: string;
  scientificDescription?: string;
  stock: number;
  image: string;
  batchNumber: string;
  casNumber?: string;
  molecularWeight?: string;
  formula?: string;
  paymentLink: string;
  featured?: boolean;
  badge?: string;
}

export interface CartItem {
  id: string; // unique item id (e.g., productId + tier)
  productId: string;
  product: Product;
  quantity: number;
  vialsCount: number; // 1, 2, or 3
  unitPrice: number; // calculated tier unit price
  totalPrice: number;
}

export interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  badgeText: string;
}

export interface Testimonial {
  id: string;
  name: string;
  age?: number;
  protocol: string;
  duration: string;
  weightLost: string;
  beforeImage: string;
  afterImage: string;
  quote: string;
  verified: boolean;
}

export interface MyPOSConfig {
  enabled: boolean;
  mode: 'sandbox' | 'production';
  integrationType?: 'paylink' | 'hosted_checkout';
  sid: string;
  walletNumber: string;
  keyIndex: number;
  payLink: string;
}

export interface StripeConfig {
  enabled: boolean;
  mode: 'test' | 'live';
  publishableKey: string;
  secretKey?: string;
  webhookSecret?: string;
  accountId?: string;
  paymentLink: string;
  currency: 'eur' | 'brl' | 'usd';
  successUrl?: string;
  cancelUrl?: string;
}

export interface StoreSettings {
  storeName: string;
  storeSubtitle: string;
  logoText: string;
  currencySymbol: '€' | 'R$';
  currencyRateEurToBrl: number;
  defaultPaymentLink: string;
  whatsappNumber: string;
  freeShippingThreshold: number;
  mypos?: MyPOSConfig;
  stripe?: StripeConfig;
}
