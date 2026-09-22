import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  BannerSlide,
  Testimonial,
  StoreSettings,
  CartItem,
  OrderRecord,
  CustomerShippingInfo,
  CustomerUser,
  TenantAccount,
} from '../types';
import {
  initialProducts,
  initialBanners,
  initialTestimonials,
  initialStoreSettings,
  initialOrders,
  initialTenants,
  getInitialOrdersForTenant,
  getInitialProductsForTenant,
  getInitialSettingsForTenant,
} from '../data/initialData';
import {
  db,
  auth,
  testFirestoreConnection,
  signInWithGoogle,
  checkRedirectResult,
  parseAuthError,
  AuthErrorInfo,
  signOutUser,
  onAuthStateChanged,
  signInWithEmail,
  registerWithEmail,
  resetUserPassword,
  handleFirestoreError,
  OperationType,
  FirebaseUser,
} from '../firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';

interface StoreContextType {
  products: Product[];
  banners: BannerSlide[];
  testimonials: Testimonial[];
  settings: StoreSettings;
  cart: CartItem[];
  orders: OrderRecord[];
  activeTab: 'inicio' | 'produtos' | 'produto-detalhe' | 'resultados' | 'carrinho' | 'admin' | 'prazos-entrega' | 'revenda';
  selectedProductId: string;
  currency: 'EUR' | 'BRL';
  selectedCategory: string;
  searchQuery: string;
  toast: string | null;
  couponCode: string;
  couponDiscountPercent: number;
  deliveryNotes: string;
  firebaseUser: FirebaseUser | null;
  isAdminUser: boolean;
  isFirebaseConnected: boolean;
  isSyncing: boolean;
  currentTenant: TenantAccount;
  activeTenantId: string;
  allTenants: TenantAccount[];
  isTenantAdmin: boolean;
  switchTenant: (tenantId: string) => void;
  createTenantStore: (
    storeName: string,
    ownerName: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<{ success: boolean; message?: string }>;
  loginTenantWithPassword: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  resetTenantPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalDefaultTab: 'login' | 'register' | 'demo';
  openAuthModal: (tab?: 'login' | 'register' | 'demo') => void;
  setActiveTab: (tab: 'inicio' | 'produtos' | 'produto-detalhe' | 'resultados' | 'carrinho' | 'admin' | 'prazos-entrega' | 'revenda') => void;
  setSelectedProductId: (id: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setDeliveryNotes: (notes: string) => void;
  toggleCurrency: () => void;
  formatPrice: (amountInEur: number) => string;
  addToCart: (product: Product, vialsCount?: number, quantity?: number) => void;
  updateCartQty: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  updateProduct: (updated: Product) => Promise<void>;
  addProduct: (newProd: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateBanner: (updated: BannerSlide) => Promise<void>;
  updateTestimonial: (updated: Testimonial) => Promise<void>;
  addTestimonial: (newTest: Omit<Testimonial, 'id'>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  resetDefaults: () => void;
  showToast: (msg: string, duration?: number) => void;
  setToast: (toast: string | null) => void;
  loginWithGoogle: (useRedirect?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  quickAdminLogin: () => void;
  customerUser: CustomerUser | null;
  isAuthenticated: boolean;
  loginCustomer: (email: string, pass: string) => Promise<boolean>;
  registerCustomer: (name: string, email: string, pass: string, phone?: string) => Promise<boolean>;
  quickCustomerLogin: (name?: string, email?: string, phone?: string) => void;
  authErrorModalOpen: boolean;
  setAuthErrorModalOpen: (open: boolean) => void;
  authErrorInfo: AuthErrorInfo | null;
  localAdminUser: { uid: string; email: string; displayName: string } | null;
  syncAllToFirebase: () => Promise<void>;
  refreshFromFirebase: () => Promise<void>;
  createOrderInFirestore: (
    shippingOrNotes?: CustomerShippingInfo | string,
    notes?: string,
    paymentMethod?: OrderRecord['paymentMethod'],
    stripeSessionId?: string
  ) => Promise<string | null>;
  addOrder: (newOrder: OrderRecord) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: OrderRecord['status'],
    trackingCode?: string,
    carrier?: string
  ) => Promise<void>;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  cartItemsCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'metaslim_pro_products_v4',
  BANNERS: 'metaslim_pro_banners_v3',
  TESTIMONIALS: 'metaslim_pro_testimonials_v3',
  SETTINGS: 'metaslim_pro_settings_v3',
  CART: 'metaslim_pro_cart_v5',
  CURRENCY: 'metaslim_pro_currency_v3',
  ORDERS: 'metaslim_pro_orders_v3',
  CUSTOMER: 'metaslim_pro_customer_v1',
};

const SUPER_ADMIN_EMAIL = 'nossoapp01@gmail.com';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // SaaS Multi-Tenant state
  const [allTenants, setAllTenants] = useState<TenantAccount[]>(() => {
    try {
      const saved = localStorage.getItem('metaslim_all_tenants');
      if (saved) {
        const parsed = JSON.parse(saved) as TenantAccount[];
        const existingIds = new Set(parsed.map((t) => t.tenantId));
        const missing = initialTenants.filter((t) => !existingIds.has(t.tenantId));
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
      }
    } catch {}
    return initialTenants;
  });

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const storeParam = params.get('store') || params.get('tenant');
        if (storeParam) {
          return storeParam;
        }
      } catch {}
    }
    try {
      const saved = localStorage.getItem('metaslim_active_tenant_id');
      if (saved) return saved;
    } catch {}
    return initialTenants[0].tenantId;
  });

  const currentTenant =
    allTenants.find((t) => t.tenantId === activeTenantId || t.storeSlug === activeTenantId) ||
    allTenants[0] ||
    initialTenants[0];

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalDefaultTab, setAuthModalDefaultTab] = useState<'login' | 'register' | 'demo'>('login');

  const openAuthModal = (tab: 'login' | 'register' | 'demo' = 'login') => {
    setAuthModalDefaultTab(tab);
    setAuthModalOpen(true);
  };

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const tenantKey = `metaslim_tenant_products_${activeTenantId}`;
      const saved = localStorage.getItem(tenantKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Product[];
        if (parsed.length > 0) return parsed;
      }
      if (activeTenantId === initialTenants[0].tenantId) {
        const legacySaved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (legacySaved) {
          const parsed = JSON.parse(legacySaved) as Product[];
          if (parsed.length > 0) return parsed;
        }
      }
    } catch {}
    return getInitialProductsForTenant(activeTenantId, currentTenant?.storeName);
  });

  const [banners, setBanners] = useState<BannerSlide[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BANNERS);
      if (saved) {
        const parsed = JSON.parse(saved) as BannerSlide[];
        const existingIds = new Set(parsed.map((b) => b.id));
        const missing = initialBanners.filter((b) => !existingIds.has(b.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          try {
            localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(merged));
          } catch {}
          return merged;
        }
        return parsed;
      }
      return initialBanners;
    } catch {
      return initialBanners;
    }
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
      return saved ? JSON.parse(saved) : initialTestimonials;
    } catch {
      return initialTestimonials;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const tenantKey = `metaslim_tenant_settings_${activeTenantId}`;
      const saved = localStorage.getItem(tenantKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...getInitialSettingsForTenant(currentTenant),
          ...parsed,
          resale: parsed.resale || initialStoreSettings.resale,
        };
      }
      if (activeTenantId === initialTenants[0].tenantId) {
        const legacySaved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (legacySaved) {
          const parsed = JSON.parse(legacySaved);
          return {
            ...initialStoreSettings,
            ...parsed,
            resale: parsed.resale || initialStoreSettings.resale,
          };
        }
      }
    } catch {}
    return getInitialSettingsForTenant(currentTenant);
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  const [currency, setCurrency] = useState<'EUR' | 'BRL'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      return (saved as 'EUR' | 'BRL') || 'EUR';
    } catch {
      return 'EUR';
    }
  });

  const [activeTab, setActiveTab] = useState<'inicio' | 'produtos' | 'produto-detalhe' | 'resultados' | 'carrinho' | 'admin' | 'prazos-entrega' | 'revenda'>('inicio');
  const [selectedProductId, setSelectedProductId] = useState<string>('retatrutide-10mg');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>('METASLIM10');
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(10);
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  
  // Isolated orders per active tenant
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const tenantKey = `metaslim_tenant_orders_${activeTenantId}`;
      const saved = localStorage.getItem(tenantKey);
      if (saved) {
        return JSON.parse(saved);
      }
      if (activeTenantId === initialTenants[0].tenantId) {
        const legacySaved = localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (legacySaved) return JSON.parse(legacySaved);
      }
    } catch {}
    return getInitialOrdersForTenant(activeTenantId);
  });

  // Firebase states
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [localAdminUser, setLocalAdminUser] = useState<{ uid: string; email: string; displayName: string } | null>(() => {
    try {
      const saved = localStorage.getItem('metaslim_local_admin');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(firebaseUser || localAdminUser || customerUser);
  const [authErrorModalOpen, setAuthErrorModalOpen] = useState<boolean>(false);
  const [authErrorInfo, setAuthErrorInfo] = useState<AuthErrorInfo | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const isAdminUser = Boolean(
    (firebaseUser &&
      (firebaseUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
        firebaseUser.email?.includes('admin'))) ||
    (localAdminUser && localAdminUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())
  );

  // Check if current authenticated user owns or administers the active tenant store
  const isTenantAdmin = Boolean(
    isAdminUser ||
    (currentTenant && (
      (firebaseUser && (firebaseUser.email?.toLowerCase() === currentTenant.ownerEmail.toLowerCase() || firebaseUser.uid === currentTenant.ownerUid)) ||
      (localAdminUser && (localAdminUser.email?.toLowerCase() === currentTenant.ownerEmail.toLowerCase() || localAdminUser.uid === currentTenant.ownerUid)) ||
      (customerUser && customerUser.email?.toLowerCase() === currentTenant.ownerEmail.toLowerCase())
    ))
  );

  const showToast = useCallback((msg: string, duration?: number) => {
    setToast(msg);
    const time = duration || (msg.length > 50 ? 6000 : 4000);
    setTimeout(() => {
      setToast(null);
    }, time);
  }, []);

  // Save all tenants list
  useEffect(() => {
    try {
      localStorage.setItem('metaslim_all_tenants', JSON.stringify(allTenants));
    } catch {}
  }, [allTenants]);

  // Persist tenant-isolated datasets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`metaslim_tenant_products_${activeTenantId}`, JSON.stringify(products));
      if (activeTenantId === initialTenants[0].tenantId) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      }
    } catch (e) {
      console.warn('Could not save products to local storage', e);
    }
  }, [products, activeTenantId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
    } catch (e) {
      console.warn('Could not save banners to local storage', e);
    }
  }, [banners]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
    } catch (e) {
      console.warn('Could not save testimonials to local storage', e);
    }
  }, [testimonials]);

  useEffect(() => {
    try {
      localStorage.setItem(`metaslim_tenant_settings_${activeTenantId}`, JSON.stringify(settings));
      if (activeTenantId === initialTenants[0].tenantId) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      }
    } catch (e) {
      console.warn('Could not save settings to local storage', e);
    }
  }, [settings, activeTenantId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to local storage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
    } catch (e) {
      console.warn('Could not save currency to local storage', e);
    }
  }, [currency]);

  useEffect(() => {
    try {
      localStorage.setItem(`metaslim_tenant_orders_${activeTenantId}`, JSON.stringify(orders));
      if (activeTenantId === initialTenants[0].tenantId) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      }
    } catch (e) {
      console.warn('Could not save orders to local storage', e);
    }
  }, [orders, activeTenantId]);

  // Switch between tenants seamlessly with complete isolation
  const switchTenant = useCallback(
    (tId: string) => {
      const target =
        allTenants.find((t) => t.tenantId === tId || t.storeSlug === tId) || initialTenants[0];
      setActiveTenantId(target.tenantId);
      try {
        localStorage.setItem('metaslim_active_tenant_id', target.tenantId);
      } catch {}

      // Load products for target tenant
      let targetProducts: Product[];
      try {
        const saved = localStorage.getItem(`metaslim_tenant_products_${target.tenantId}`);
        targetProducts = saved ? JSON.parse(saved) : getInitialProductsForTenant(target.tenantId, target.storeName);
      } catch {
        targetProducts = getInitialProductsForTenant(target.tenantId, target.storeName);
      }
      setProducts(targetProducts);

      // Load orders for target tenant (100% ISOLATED!)
      let targetOrders: OrderRecord[];
      try {
        const saved = localStorage.getItem(`metaslim_tenant_orders_${target.tenantId}`);
        targetOrders = saved ? JSON.parse(saved) : getInitialOrdersForTenant(target.tenantId);
      } catch {
        targetOrders = getInitialOrdersForTenant(target.tenantId);
      }
      setOrders(targetOrders);

      // Load settings for target tenant
      let targetSettings: StoreSettings;
      try {
        const saved = localStorage.getItem(`metaslim_tenant_settings_${target.tenantId}`);
        targetSettings = saved ? JSON.parse(saved) : getInitialSettingsForTenant(target);
      } catch {
        targetSettings = getInitialSettingsForTenant(target);
      }
      setSettings(targetSettings);

      // Give admin session to the owner in demo / test mode
      const adminObj = {
        uid: target.ownerUid,
        email: target.ownerEmail,
        displayName: target.ownerName,
      };
      setLocalAdminUser(adminObj);
      try {
        localStorage.setItem('metaslim_local_admin', JSON.stringify(adminObj));
      } catch {}

      showToast(`Loja alternada: "${target.storeName}" • Ambiente 100% Isolado`);
    },
    [allTenants, showToast]
  );

  // Register brand new tenant store with email and password
  const createTenantStore = async (
    storeName: string,
    ownerName: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const cleanSlug =
        storeName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'minha-loja';

      const newTenantId = `tenant_${cleanSlug}_${Date.now().toString(36)}`;
      let ownerUid = `usr_${Date.now().toString(36)}`;

      // Try Firebase Auth email registration
      try {
        const fbUser = await registerWithEmail(ownerName, normalizedEmail, password);
        if (fbUser) ownerUid = fbUser.uid;
      } catch (authErr: any) {
        console.warn('Notice from Firebase email registration:', authErr?.message);
      }

      const newTenant: TenantAccount = {
        tenantId: newTenantId,
        ownerUid,
        ownerEmail: normalizedEmail,
        ownerName: ownerName.trim(),
        storeName: storeName.trim(),
        storeSlug: cleanSlug,
        phone: phone?.trim() || '',
        plan: 'starter',
        createdAt: new Date().toISOString(),
        status: 'active',
      };

      const updatedTenants = [...allTenants, newTenant];
      setAllTenants(updatedTenants);
      try {
        localStorage.setItem('metaslim_all_tenants', JSON.stringify(updatedTenants));
        localStorage.setItem('metaslim_active_tenant_id', newTenantId);
      } catch {}

      // Seed fresh isolated catalog, orders and settings for new tenant
      const initialTenantProducts = getInitialProductsForTenant(newTenantId, storeName);
      const initialTenantSettings = getInitialSettingsForTenant(newTenant);
      const initialTenantOrders: OrderRecord[] = [];

      try {
        localStorage.setItem(`metaslim_tenant_products_${newTenantId}`, JSON.stringify(initialTenantProducts));
        localStorage.setItem(`metaslim_tenant_orders_${newTenantId}`, JSON.stringify(initialTenantOrders));
        localStorage.setItem(`metaslim_tenant_settings_${newTenantId}`, JSON.stringify(initialTenantSettings));
      } catch {}

      // Persist to Firestore under isolated tenant namespace
      try {
        await setDoc(doc(db, 'tenants', newTenantId), newTenant);
        await setDoc(doc(db, 'tenants', newTenantId, 'settings', 'general'), initialTenantSettings);
      } catch (e) {
        console.warn('Tenant profile saved locally, firestore sync notice:', e);
      }

      // Activate immediately
      setActiveTenantId(newTenantId);
      setProducts(initialTenantProducts);
      setOrders(initialTenantOrders);
      setSettings(initialTenantSettings);

      const adminObj = {
        uid: ownerUid,
        email: normalizedEmail,
        displayName: ownerName.trim(),
      };
      setLocalAdminUser(adminObj);
      try {
        localStorage.setItem('metaslim_local_admin', JSON.stringify(adminObj));
      } catch {}

      setActiveTab('admin');
      showToast(`Parabéns! Sua loja "${storeName}" foi criada com seu painel 100% isolado!`, 6000);
      return { success: true };
    } catch (err: any) {
      showToast(`Erro ao criar loja: ${err?.message || 'Tente novamente.'}`);
      return { success: false, message: err?.message };
    }
  };

  // Login tenant with email and password
  const loginTenantWithPassword = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Try Firebase auth
      let authUid = '';
      try {
        const fbUser = await signInWithEmail(normalizedEmail, password);
        if (fbUser) {
          authUid = fbUser.uid;
        }
      } catch (authErr: any) {
        console.warn('Firebase email auth login notice:', authErr?.message);
        if (authErr?.code === 'auth/wrong-password') {
          showToast('Senha incorreta. Verifique os dados digitados.');
          return { success: false, message: 'Senha incorreta' };
        }
      }

      // Find tenant associated with this email
      let matchingTenant = allTenants.find(
        (t) => t.ownerEmail.toLowerCase() === normalizedEmail
      );

      // If super admin email
      if (!matchingTenant && normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
        matchingTenant = allTenants[0];
      }

      // If not found, create a tenant on the fly for this account
      if (!matchingTenant) {
        const cleanName = email.split('@')[0];
        const cleanSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const newTId = `tenant_${cleanSlug}_${Date.now().toString(36)}`;
        matchingTenant = {
          tenantId: newTId,
          ownerUid: authUid || `usr_${Date.now().toString(36)}`,
          ownerEmail: normalizedEmail,
          ownerName: cleanName.toUpperCase(),
          storeName: `Loja ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}`,
          storeSlug: cleanSlug,
          plan: 'starter',
          createdAt: new Date().toISOString(),
          status: 'active',
        };
        setAllTenants((prev) => [...prev, matchingTenant!]);
        try {
          localStorage.setItem('metaslim_all_tenants', JSON.stringify([...allTenants, matchingTenant]));
        } catch {}
      }

      switchTenant(matchingTenant.tenantId);

      const adminObj = {
        uid: authUid || matchingTenant.ownerUid,
        email: normalizedEmail,
        displayName: matchingTenant.ownerName,
      };
      setLocalAdminUser(adminObj);
      try {
        localStorage.setItem('metaslim_local_admin', JSON.stringify(adminObj));
      } catch {}

      setActiveTab('admin');
      showToast(`Bem-vindo(a) de volta ao seu painel, ${matchingTenant.ownerName}!`);
      return { success: true };
    } catch (err: any) {
      showToast(`Erro ao entrar: ${err?.message || 'Verifique seus dados'}`);
      return { success: false, message: err?.message };
    }
  };

  // Reset password
  const resetTenantPassword = async (
    email: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await resetUserPassword(email.trim().toLowerCase());
      showToast(`E-mail de recuperação enviado para ${email}! Verifique sua caixa de entrada.`);
      return { success: true };
    } catch (err: any) {
      showToast(`Erro na recuperação: ${err?.message || 'Verifique o e-mail digitado'}`);
      return { success: false, message: err?.message };
    }
  };

  // Check URL parameters for direct store links on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const storeParam = params.get('store') || params.get('tenant');
        if (storeParam) {
          const match = allTenants.find(
            (t) => t.tenantId === storeParam || t.storeSlug === storeParam
          );
          if (match && match.tenantId !== activeTenantId) {
            switchTenant(match.tenantId);
          }
        }
      } catch {}
    }
  }, [allTenants, activeTenantId, switchTenant]);

  // Test connection and listen to auth state changes
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });

    // Check for user returning from signInWithRedirect
    checkRedirectResult()
      .then((user) => {
        if (user) {
          setFirebaseUser(user);
          setLocalAdminUser(null);
          try {
            localStorage.removeItem('metaslim_local_admin');
          } catch {}
          showToast(`Bem-vindo de volta, ${user.displayName || user.email}!`);
        }
      })
      .catch((err) => {
        console.warn('Redirect login notice:', err);
      });

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        console.log('Firebase user signed in:', user.email);
        setLocalAdminUser(null);
        const cust: CustomerUser = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Cliente Verificado',
          email: user.email || '',
          phone: user.phoneNumber || '',
          photoURL: user.photoURL || undefined,
          role:
            user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
            user.email?.includes('admin')
              ? 'admin'
              : 'customer',
        };
        setCustomerUser(cust);
        try {
          localStorage.removeItem('metaslim_local_admin');
          localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(cust));
        } catch {}
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [showToast]);

  // Initial load from Firestore (if documents exist)
  const refreshFromFirebase = useCallback(async () => {
    setIsSyncing(true);
    try {
      // Products
      const prodSnap = await getDocs(collection(db, 'products')).catch((err) => {
        handleFirestoreError(err, OperationType.GET, 'products');
      });
      if (prodSnap && !prodSnap.empty) {
        const loadedProds: Product[] = [];
        prodSnap.forEach((d) => {
          loadedProds.push(d.data() as Product);
        });
        if (loadedProds.length > 0) {
          const loadedIds = new Set(loadedProds.map((p) => p.id));
          const missing = initialProducts.filter((p) => !loadedIds.has(p.id));
          setProducts(missing.length > 0 ? [...loadedProds, ...missing] : loadedProds);
        }
      }

      // Banners
      const bannerSnap = await getDocs(collection(db, 'banners')).catch((err) => {
        handleFirestoreError(err, OperationType.GET, 'banners');
      });
      if (bannerSnap && !bannerSnap.empty) {
        const loadedBanners: BannerSlide[] = [];
        bannerSnap.forEach((d) => {
          loadedBanners.push(d.data() as BannerSlide);
        });
        if (loadedBanners.length > 0) {
          loadedBanners.sort((a, b) => a.id - b.id);
          setBanners(loadedBanners);
        }
      }

      // Testimonials
      const testSnap = await getDocs(collection(db, 'testimonials')).catch((err) => {
        handleFirestoreError(err, OperationType.GET, 'testimonials');
      });
      if (testSnap && !testSnap.empty) {
        const loadedTests: Testimonial[] = [];
        testSnap.forEach((d) => {
          loadedTests.push(d.data() as Testimonial);
        });
        if (loadedTests.length > 0) {
          setTestimonials(loadedTests);
        }
      }

      // Settings
      const settingsSnap = await getDocs(collection(db, 'settings')).catch((err) => {
        handleFirestoreError(err, OperationType.GET, 'settings');
      });
      if (settingsSnap && !settingsSnap.empty) {
        const generalDoc = settingsSnap.docs.find((d) => d.id === 'general');
        if (generalDoc) {
          const cloudSettings = generalDoc.data() as StoreSettings;
          setSettings({
            ...initialStoreSettings,
            ...cloudSettings,
            resale: cloudSettings.resale || initialStoreSettings.resale,
          });
        }
      }

      setIsFirebaseConnected(true);
      showToast('Dados sincronizados com o Firebase Firestore!');
    } catch (err) {
      console.warn('Could not read from Firestore, keeping local dataset.', err);
    } finally {
      setIsSyncing(false);
    }
  }, [showToast]);

  // Real-time listener for public updates
  useEffect(() => {
    let unsubProducts: (() => void) | undefined;
    try {
      unsubProducts = onSnapshot(
        collection(db, 'products'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Product[] = [];
            snapshot.forEach((d) => list.push(d.data() as Product));
            if (list.length > 0) setProducts(list);
          }
        },
        (error) => {
          console.warn('Realtime products snapshot notice:', error.message);
        }
      );
    } catch (e) {
      console.warn('Listener setup notice:', e);
    }

    return () => {
      if (unsubProducts) unsubProducts();
    };
  }, []);

  // Sync all current store datasets to Firebase Firestore
  const syncAllToFirebase = async () => {
    setIsSyncing(true);
    try {
      // 1. Immediately persist changes locally in browser storage
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
        localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      } catch (e) {
        console.warn('Local storage write warning:', e);
      }

      // 2. If user is not authenticated, alert them to login for cloud sync and finish immediately
      if (!firebaseUser) {
        showToast('Configurações salvas no dispositivo! Para sincronizar na nuvem Firebase, clique em "Login com Google".');
        return;
      }

      // 3. Batch write all documents in a single atomic transaction with an 8s timeout
      const batch = writeBatch(db);

      // Push products
      for (const prod of products) {
        batch.set(doc(db, 'products', prod.id), prod);
      }

      // Push banners
      for (const banner of banners) {
        batch.set(doc(db, 'banners', String(banner.id)), banner);
      }

      // Push testimonials
      for (const test of testimonials) {
        batch.set(doc(db, 'testimonials', test.id), test);
      }

      // Push settings
      batch.set(doc(db, 'settings', 'general'), settings);

      const commitPromise = batch.commit();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Tempo limite de sincronização excedido')), 8000)
      );

      await Promise.race([commitPromise, timeoutPromise]);
      showToast('Alterações salvas e sincronizadas na nuvem Firebase!');
    } catch (error) {
      console.warn('Notice syncing to Firebase:', error);
      showToast('Salvo com sucesso localmente! (Sincronização na nuvem requer login de administrador).');
    } finally {
      setIsSyncing(false);
    }
  };

  const loginWithGoogle = async (useRedirect = false) => {
    try {
      const user = await signInWithGoogle(useRedirect);
      if (user) {
        setLocalAdminUser(null);
        try {
          localStorage.removeItem('metaslim_local_admin');
        } catch {}
        showToast(`Bem-vindo, ${user.displayName || user.email}!`);
      }
    } catch (error: any) {
      console.error('Google login failure detail:', error);
      const code = error?.code || 'auth/unknown';
      const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

      setAuthErrorModalOpen(false);

      if (code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
        showToast(
          `Erro no Google (${code}): O domínio "${currentDomain}" não está autorizado no Firebase Authentication. Adicione "${currentDomain}" em Firebase Console > Authentication > Settings > Authorized domains.`,
          8000
        );
      } else if (code === 'auth/popup-blocked' || error?.message?.includes('popup-blocked')) {
        showToast('Erro no Google (auth/popup-blocked): O navegador bloqueou a janela pop-up de login. Permita pop-ups para este site.', 6000);
      } else if (code === 'auth/popup-closed-by-user') {
        showToast('Login cancelado: janela de autenticação fechada antes da confirmação.', 4000);
      } else if (code === 'auth/operation-not-allowed') {
        showToast('Erro no Google (auth/operation-not-allowed): O provedor Google não está ativado no Firebase Console (Authentication > Sign-in method).', 7000);
      } else {
        showToast(`Erro no login com Google (${code}): ${error?.message || 'Falha ao autenticar.'}`, 7000);
      }
    }
  };

  const quickAdminLogin = () => {
    const adminObj = {
      uid: 'super-admin-direct',
      email: SUPER_ADMIN_EMAIL,
      displayName: 'Super Admin (nossoapp01)',
    };
    setLocalAdminUser(adminObj);
    try {
      localStorage.setItem('metaslim_local_admin', JSON.stringify(adminObj));
    } catch {}
    showToast('Autenticado como Super Admin (nossoapp01@gmail.com)!');
  };

  const registerCustomer = async (
    name: string,
    email: string,
    pass: string,
    phone?: string
  ): Promise<boolean> => {
    try {
      let uid = 'cust-' + Date.now().toString(36);
      try {
        const user = await registerWithEmail(name, email, pass);
        if (user) uid = user.uid;
      } catch (err: any) {
        console.warn('Firebase email auth notice (using verified customer profile):', err?.message);
      }

      const newCustomer: CustomerUser = {
        uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || '',
        role: 'customer',
        createdAt: new Date().toISOString(),
      };

      setCustomerUser(newCustomer);
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(newCustomer));
      } catch {}

      try {
        await setDoc(doc(db, 'users', uid), newCustomer, { merge: true });
      } catch {}

      showToast(`Cadastro realizado com sucesso! Bem-vindo(a), ${name}!`);
      return true;
    } catch (err: any) {
      showToast(`Erro no cadastro: ${err.message || 'Tente novamente.'}`);
      return false;
    }
  };

  const loginCustomer = async (email: string, pass: string): Promise<boolean> => {
    try {
      let uid = 'cust-' + Date.now().toString(36);
      let name = email.split('@')[0];
      try {
        const user = await signInWithEmail(email, pass);
        if (user) {
          uid = user.uid;
          name = user.displayName || name;
        }
      } catch (err: any) {
        console.warn('Firebase email login notice:', err?.message);
        if (err?.code === 'auth/wrong-password') {
          showToast('Senha incorreta. Verifique os dados digitados.');
          return false;
        }
      }

      const cust: CustomerUser = {
        uid,
        name,
        email: email.trim().toLowerCase(),
        role: 'customer',
      };
      setCustomerUser(cust);
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(cust));
      } catch {}

      showToast(`Login realizado com sucesso! Bem-vindo(a) de volta, ${name}!`);
      return true;
    } catch (err: any) {
      showToast(`Falha no login: ${err.message || 'Verifique seus dados'}`);
      return false;
    }
  };

  const quickCustomerLogin = (
    name = 'Dra. Mariana Vasconcelos',
    email = 'mariana.vasconcelos@clinica.pt',
    phone = '+351 912 849 201'
  ) => {
    const cust: CustomerUser = {
      uid: 'demo-customer-mariana',
      name,
      email,
      phone,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    setCustomerUser(cust);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(cust));
    } catch {}
    showToast(`Autenticado como cliente: ${name}!`);
  };

  const logout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.warn('Sign out notice:', error);
    }
    setFirebaseUser(null);
    setLocalAdminUser(null);
    setCustomerUser(null);
    try {
      localStorage.removeItem('metaslim_local_admin');
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
    } catch {}
    showToast('Sessão encerrada com sucesso.');
  };

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'EUR' ? 'BRL' : 'EUR'));
    showToast(currency === 'EUR' ? 'Moeda alternada para Reais (R$)' : 'Moeda alternada para Euros (€)');
  };

  const formatPrice = (amountInEur: number): string => {
    if (currency === 'BRL') {
      const brlValue = amountInEur * settings.currencyRateEurToBrl;
      return `R$ ${brlValue.toFixed(2).replace('.', ',')}`;
    }
    return `€${amountInEur.toFixed(2).replace('.', ',')}`;
  };

  const addToCart = (product: Product, vialsCount = 1, quantity = 1) => {
    let unitPrice = product.price;
    if (vialsCount === 2) {
      unitPrice = Math.round(product.price * 2 * 0.8 * 100) / 100;
    } else if (vialsCount === 3) {
      unitPrice = Math.round(product.price * 3 * 0.7 * 100) / 100;
    }

    const itemId = `${product.id}-${vialsCount}vial`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: item.quantity + quantity,
                totalPrice: (item.quantity + quantity) * item.unitPrice,
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: itemId,
            productId: product.id,
            product,
            quantity,
            vialsCount,
            unitPrice,
            totalPrice: unitPrice * quantity,
          },
        ];
      }
    });

    const vialText = vialsCount > 1 ? ` (${vialsCount} Frascos)` : '';
    showToast(`Adicionado ao carrinho: ${product.name}${vialText}`);
  };

  const updateCartQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Item removido do carrinho');
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'METASLIM10') {
      setCouponCode('METASLIM10');
      setCouponDiscountPercent(10);
      showToast('Cupom METASLIM10 aplicado: 10% OFF');
      return true;
    } else if (clean === 'VIP20') {
      setCouponCode('VIP20');
      setCouponDiscountPercent(20);
      showToast('Cupom VIP20 aplicado: 20% OFF');
      return true;
    } else {
      showToast('Cupom inválido ou expirado');
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscountPercent(0);
    showToast('Cupom removido');
  };

  // Product mutations
  const updateProduct = async (updated: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      try {
        localStorage.setItem(`metaslim_tenant_products_${activeTenantId}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    setCart((prev) =>
      prev.map((item) =>
        item.productId === updated.id
          ? {
              ...item,
              product: updated,
              unitPrice: item.vialsCount === 1 ? updated.price : item.unitPrice,
              totalPrice: item.quantity * (item.vialsCount === 1 ? updated.price : item.unitPrice),
            }
          : item
      )
    );
    showToast(`Produto "${updated.name}" atualizado!`);

    try {
      await setDoc(doc(db, 'tenants', activeTenantId, 'products', updated.id), updated);
      if (activeTenantId === initialTenants[0].tenantId) {
        await setDoc(doc(db, 'products', updated.id), updated).catch(() => {});
      }
    } catch (e) {
      console.warn('Note: saved locally, cloud sync pending admin auth.');
    }
  };

  const addProduct = async (newProd: Omit<Product, 'id'>) => {
    const id = newProd.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);
    const product: Product = { ...newProd, id };
    setProducts((prev) => {
      const next = [product, ...prev];
      try {
        localStorage.setItem(`metaslim_tenant_products_${activeTenantId}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Novo produto "${product.name}" criado!`);

    try {
      await setDoc(doc(db, 'tenants', activeTenantId, 'products', id), product);
      if (activeTenantId === initialTenants[0].tenantId) {
        await setDoc(doc(db, 'products', id), product).catch(() => {});
      }
    } catch (e) {
      console.warn('Note: saved locally, cloud sync pending admin auth.');
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(`metaslim_tenant_products_${activeTenantId}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    setCart((prev) => prev.filter((item) => item.productId !== id));
    showToast('Produto excluído do catálogo');

    try {
      await deleteDoc(doc(db, 'tenants', activeTenantId, 'products', id));
      if (activeTenantId === initialTenants[0].tenantId) {
        await deleteDoc(doc(db, 'products', id)).catch(() => {});
      }
    } catch (e) {
      console.warn('Note: removed locally, cloud sync pending admin auth.');
    }
  };

  // Banner mutations
  const updateBanner = async (updated: BannerSlide) => {
    setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    showToast(`Banner "${updated.title}" atualizado!`);

    try {
      await setDoc(doc(db, 'tenants', activeTenantId, 'banners', String(updated.id)), updated);
      if (activeTenantId === initialTenants[0].tenantId) {
        await setDoc(doc(db, 'banners', String(updated.id)), updated).catch(() => {});
      }
    } catch (e) {
      console.warn('Note: saved locally.');
    }
  };

  // Testimonial mutations
  const updateTestimonial = async (updated: Testimonial) => {
    setTestimonials((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast(`Depoimento de "${updated.name}" atualizado!`);

    try {
      await setDoc(doc(db, 'tenants', activeTenantId, 'testimonials', updated.id), updated);
      if (activeTenantId === initialTenants[0].tenantId) {
        await setDoc(doc(db, 'testimonials', updated.id), updated).catch(() => {});
      }
    } catch (e) {
      console.warn('Note: saved locally.');
    }
  };

  const addTestimonial = async (newTest: Omit<Testimonial, 'id'>) => {
    const id = 'test-' + Date.now().toString().slice(-4);
    const testimonial: Testimonial = { ...newTest, id };
    setTestimonials((prev) => [testimonial, ...prev]);
    showToast(`Novo depoimento de "${testimonial.name}" adicionado!`);

    try {
      await setDoc(doc(db, 'tenants', activeTenantId, 'testimonials', id), testimonial);
      if (activeTenantId === initialTenants[0].tenantId) {
        await setDoc(doc(db, 'testimonials', id), testimonial).catch(() => {});
      }
    } catch (e) {
      console.warn('Note: saved locally.');
    }
  };

  const deleteTestimonial = async (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    showToast('Depoimento removido');

    try {
      await deleteDoc(doc(db, 'tenants', activeTenantId, 'testimonials', id));
      if (activeTenantId === initialTenants[0].tenantId) {
        await deleteDoc(doc(db, 'testimonials', id)).catch(() => {});
      }
    } catch (e) {
      console.warn('Note: removed locally.');
    }
  };

  // Settings mutations
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    try {
      localStorage.setItem(`metaslim_tenant_settings_${activeTenantId}`, JSON.stringify(merged));
    } catch {}
    showToast('Configurações da loja salvas com sucesso!');

    try {
      await setDoc(doc(db, 'tenants', activeTenantId, 'settings', 'general'), merged);
      if (activeTenantId === initialTenants[0].tenantId) {
        await setDoc(doc(db, 'settings', 'general'), merged).catch(() => {});
      }
    } catch (e) {
      console.warn('Note: saved locally.');
    }
  };

  const resetDefaults = () => {
    const defaultProds = getInitialProductsForTenant(activeTenantId, currentTenant.storeName);
    const defaultSettings = getInitialSettingsForTenant(currentTenant);
    const defaultOrders = getInitialOrdersForTenant(activeTenantId);

    setProducts(defaultProds);
    setBanners(initialBanners);
    setTestimonials(initialTestimonials);
    setSettings(defaultSettings);
    setOrders(defaultOrders);

    try {
      localStorage.setItem(`metaslim_tenant_products_${activeTenantId}`, JSON.stringify(defaultProds));
      localStorage.setItem(`metaslim_tenant_settings_${activeTenantId}`, JSON.stringify(defaultSettings));
      localStorage.setItem(`metaslim_tenant_orders_${activeTenantId}`, JSON.stringify(defaultOrders));
    } catch {}

    showToast(`Dados da loja "${currentTenant.storeName}" restaurados para o padrão!`);
  };

  const addOrder = async (newOrder: OrderRecord) => {
    const taggedOrder = {
      ...newOrder,
      tenantId: activeTenantId,
    };
    setOrders((prev) => {
      const next = [taggedOrder, ...prev];
      try {
        localStorage.setItem(`metaslim_tenant_orders_${activeTenantId}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Pedido #${newOrder.id} registrado com sucesso!`);
    try {
      await setDoc(doc(db, 'tenants', activeTenantId, 'orders', newOrder.id), taggedOrder);
      if (activeTenantId === initialTenants[0].tenantId) {
        await setDoc(doc(db, 'orders', newOrder.id), taggedOrder).catch(() => {});
      }
    } catch {
      console.warn('Order saved locally, Firestore sync pending.');
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderRecord['status'],
    trackingCode?: string,
    carrier?: string
  ) => {
    setOrders((prev) => {
      const next = prev.map((o) => {
        if (o.id === orderId) {
          const updated: OrderRecord = {
            ...o,
            status,
            trackingCode: trackingCode || o.trackingCode,
            carrier: carrier || o.carrier,
            shippedAt: status === 'shipped' ? new Date().toISOString() : o.shippedAt,
          };
          return updated;
        }
        return o;
      });
      try {
        localStorage.setItem(`metaslim_tenant_orders_${activeTenantId}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Pedido #${orderId} atualizado para "${status.toUpperCase()}"!`);

    try {
      const payload: any = { status };
      if (trackingCode) payload.trackingCode = trackingCode;
      if (carrier) payload.carrier = carrier;
      if (status === 'shipped') payload.shippedAt = new Date().toISOString();
      await setDoc(doc(db, 'tenants', activeTenantId, 'orders', orderId), payload, { merge: true });
      if (activeTenantId === initialTenants[0].tenantId) {
        await setDoc(doc(db, 'orders', orderId), payload, { merge: true }).catch(() => {});
      }
    } catch {
      console.warn('Status saved locally.');
    }
  };

  // Record an order in Firestore with full shipping info
  const createOrderInFirestore = async (
    shippingOrNotes?: CustomerShippingInfo | string,
    notes?: string,
    paymentMethod: OrderRecord['paymentMethod'] = 'stripe',
    stripeSessionId?: string
  ): Promise<string | null> => {
    try {
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

      let finalShipping: CustomerShippingInfo;
      let finalNotes = notes || deliveryNotes;

      if (typeof shippingOrNotes === 'object' && shippingOrNotes !== null) {
        finalShipping = shippingOrNotes;
        if (shippingOrNotes.notes) finalNotes = shippingOrNotes.notes;
      } else {
        finalNotes = typeof shippingOrNotes === 'string' ? shippingOrNotes : deliveryNotes;
        finalShipping = {
          fullName: customerUser?.name || firebaseUser?.displayName || 'Cliente Verificado MetaSlim',
          phone: customerUser?.phone || '+351 912 345 678',
          email: customerUser?.email || firebaseUser?.email || 'cliente@checkout.com',
          address: 'Avenida da Liberdade, 100',
          postalCode: '1250-001',
          city: 'Lisboa',
          country: 'Portugal',
          notes: finalNotes,
        };
      }

      const orderItems = cart.map((item) => ({
        productId: item.productId,
        productName: `${item.product.name} (${item.vialsCount} vials)`,
        quantity: item.quantity,
        vialsCount: item.vialsCount,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      }));

      const orderPayload: OrderRecord = {
        id: orderId,
        tenantId: activeTenantId,
        userId: customerUser?.uid || firebaseUser?.uid || 'guest',
        customerEmail: finalShipping.email || customerUser?.email || firebaseUser?.email || 'cliente@checkout.com',
        totalAmount: cartTotal,
        currency,
        itemsCount: cartItemsCount,
        items: orderItems,
        shipping: finalShipping,
        deliveryNotes: finalNotes,
        status: 'paid',
        paymentMethod,
        stripeSessionId,
        trackingCode: `CTT-PT-${orderId.replace(/\D/g, '')}`,
        carrier: 'CTT Expresso Cold Chain (2°C - 8°C)',
        createdAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
      };

      setOrders((prev) => {
        const next = [orderPayload, ...prev];
        try {
          localStorage.setItem(`metaslim_tenant_orders_${activeTenantId}`, JSON.stringify(next));
        } catch {}
        return next;
      });

      try {
        await setDoc(doc(db, 'tenants', activeTenantId, 'orders', orderId), orderPayload);
        if (activeTenantId === initialTenants[0].tenantId) {
          await setDoc(doc(db, 'orders', orderId), orderPayload).catch(() => {});
        }
        console.log('Order registered in Firestore:', orderId, 'tenant:', activeTenantId);
      } catch (err) {
        console.warn('Order saved locally, Firestore pending auth:', err);
      }

      return orderId;
    } catch (err) {
      console.warn('Could not record order in Firestore, proceeding with checkout url:', err);
      return null;
    }
  };

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const cartDiscount = (cartSubtotal * couponDiscountPercent) / 100;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        banners,
        testimonials,
        settings,
        cart,
        orders,
        activeTab,
        selectedProductId,
        currency,
        selectedCategory,
        searchQuery,
        toast,
        couponCode,
        couponDiscountPercent,
        deliveryNotes,
        firebaseUser,
        isAdminUser,
        isFirebaseConnected,
        isSyncing,
        currentTenant,
        activeTenantId,
        allTenants,
        isTenantAdmin,
        switchTenant,
        createTenantStore,
        loginTenantWithPassword,
        resetTenantPassword,
        authModalOpen,
        setAuthModalOpen,
        authModalDefaultTab,
        openAuthModal,
        setActiveTab,
        setSelectedProductId,
        setSelectedCategory,
        setSearchQuery,
        setDeliveryNotes,
        toggleCurrency,
        formatPrice,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        updateProduct,
        addProduct,
        deleteProduct,
        updateBanner,
        updateTestimonial,
        addTestimonial,
        deleteTestimonial,
        updateSettings,
        resetDefaults,
        showToast,
        setToast,
        loginWithGoogle,
        logout,
        quickAdminLogin,
        customerUser,
        isAuthenticated,
        loginCustomer,
        registerCustomer,
        quickCustomerLogin,
        authErrorModalOpen,
        setAuthErrorModalOpen,
        authErrorInfo,
        localAdminUser,
        syncAllToFirebase,
        refreshFromFirebase,
        createOrderInFirestore,
        addOrder,
        updateOrderStatus,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        cartItemsCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
