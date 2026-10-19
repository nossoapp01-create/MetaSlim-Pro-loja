export interface DosageOption {
  mg: number;
  label: string;
  price: number;
  originalPrice?: number;
}

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
  dosageOptions?: DosageOption[];
  hasDosageSelector?: boolean;
  status?: 'online' | 'offline';
}

export interface CartItem {
  id: string; // unique item id (e.g., productId + dosage + tier)
  productId: string;
  product: Product;
  quantity: number;
  vialsCount: number; // 1, 2, or 3
  dosageMg?: number;
  dosageLabel?: string;
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

export interface EnabledPaymentMethods {
  stripe?: boolean;
  mbway?: boolean;
  mypos?: boolean;
  crypto?: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeSubtitle: string;
  logoText: string;
  logoUrl?: string;
  currencySymbol: '€' | 'R$';
  currencyRateEurToBrl: number;
  defaultPaymentLink: string;
  whatsappNumber: string;
  resaleWhatsappNumber?: string;
  resale?: ResaleSettings;
  consultationUrl?: string;
  freeShippingThreshold: number;
  mypos?: MyPOSConfig;
  stripe?: StripeConfig;
  enabledPaymentMethods?: EnabledPaymentMethods;
  affiliateProgram?: AffiliateProgramSettings;
}

export interface AffiliateProgramSettings {
  enabled: boolean;
  commissionPercentage: number; // e.g. 10%
  minPayout: number; // e.g. 50 EUR
  cookieDurationDays: number; // e.g. 30 days
  termsNotice?: string;
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
  referralCode?: string; // e.g. 'MARIANA-8F2'
  referredBy?: string; // code of the affiliate who referred this user
  totalReferralClicks?: number;
  totalReferralOrders?: number;
  totalReferralSalesAmount?: number;
  totalCommissionEarned?: number;
  pendingCommission?: number;
  paidCommission?: number;
  payoutPixOrIban?: string;
}

export interface AffiliateSaleRecord {
  id: string;
  orderId: string;
  affiliateCode: string;
  affiliateName: string;
  affiliateEmail: string;
  buyerName: string;
  buyerEmail: string;
  orderTotal: number;
  commissionRate: number; // % (e.g. 10)
  commissionAmount: number; // e.g. 24.50
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
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
  tenantId?: string;
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
  referralCode?: string;
  affiliateCommission?: number;
  affiliateCommissionRate?: number;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
}

export interface TenantAccount {
  tenantId: string;
  ownerUid: string;
  ownerEmail: string;
  ownerName: string;
  storeName: string;
  storeSlug: string;
  logoUrl?: string;
  phone?: string;
  currency?: 'EUR' | 'BRL';
  plan: 'starter' | 'pro' | 'clinic';
  createdAt: string;
  approvedAt?: string;
  status: 'active' | 'pending' | 'suspended';
  notes?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  sender: 'customer' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'pdf' | 'document';
  attachmentSize?: number;
  audioUrl?: string;
  audioDuration?: number; // duration in seconds
  messageType?: 'text' | 'audio' | 'image' | 'pdf' | 'document' | 'call';
  callType?: 'voice' | 'video';
  callDuration?: number; // seconds
  callStatus?: 'completed' | 'missed' | 'declined';
}

export interface ChatConversation {
  id: string;
  customerName: string;
  customerContact: string; // phone or email
  customerPhone?: string;
  customerEmail?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadByAdmin: number;
  unreadByCustomer: number;
  createdAt: string;
  updatedAt: string;
  tenantId?: string;
}

