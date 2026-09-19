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

export interface ResaleCompoundConfig {
  id: 'retatrutide' | 'tirzepatide' | 'semaglutide' | 'blend' | string;
  name: string;
  wholesaleCostEur: number;
  defaultSellPriceEur: number;
  marketDemand?: string;
}

export interface ResalePackConfig {
  id: string;
  name: string;
  units: number;
  badge: string;
  popular?: boolean;
  costPerUnitEur: number;
  suggestedSellPriceEur: number;
  highlight?: string;
  description: string;
  features: string[];
}

export interface ResaleSettings {
  whatsappNumber?: string;
  compounds: ResaleCompoundConfig[];
  packs: ResalePackConfig[];
}

export interface StoreSettings {
  storeName: string;
  storeSubtitle: string;
  logoText: string;
  currencySymbol: '€' | 'R$';
  currencyRateEurToBrl: number;
  defaultPaymentLink: string;
  whatsappNumber: string;
  resaleWhatsappNumber?: string;
  resale?: ResaleSettings;
  freeShippingThreshold: number;
  mypos?: MyPOSConfig;
  stripe?: StripeConfig;
}

export interface CustomerShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  complement?: string;
  postalCode: string;
  city: string;
  country: string;
  notes?: string;
}

export interface CustomerUser {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role?: 'customer' | 'admin';
  createdAt?: string;
}

export interface OrderItemDetail {
  productId: string;
  productName: string;
  quantity: number;
  vialsCount: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderRecord {
  id: string;
  userId?: string;
  customerEmail?: string;
  totalAmount: number;
  currency: string;
  itemsCount: number;
  items?: OrderItemDetail[];
  shipping: CustomerShippingInfo;
  deliveryNotes?: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'stripe' | 'mypos' | 'mbway_pix' | 'crypto' | 'direct';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  trackingCode?: string;
  carrier?: string;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
}
