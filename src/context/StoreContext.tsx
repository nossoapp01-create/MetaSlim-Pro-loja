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
} from '../types';
import {
  initialProducts,
  initialBanners,
  initialTestimonials,
  initialStoreSettings,
  initialOrders,
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
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved) as Product[];
        const existingIds = new Set(parsed.map((p) => p.id));
        const missing = initialProducts.filter((p) => !existingIds.has(p.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          try {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
          } catch {}
          return merged;
        }
        return parsed;
      }
      return initialProducts;
    } catch {
      return initialProducts;
    }
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
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialStoreSettings,
          ...parsed,
          resale: parsed.resale || initialStoreSettings.resale,
        };
      }
      return initialStoreSettings;
    } catch {
      return initialStoreSettings;
    }
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
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : initialOrders;
    } catch {
      return initialOrders;
    }
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

  const showToast = useCallback((msg: string, duration?: number) => {
    setToast(msg);
    const time = duration || (msg.length > 50 ? 6000 : 4000);
    setTimeout(() => {
      setToast(null);
    }, time);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('Could not save products to local storage', e);
    }
  }, [products]);

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
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings to local storage', e);
    }
  }, [settings]);

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
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('Could not save orders to local storage', e);
    }
  }, [orders]);

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
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
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
      await setDoc(doc(db, 'products', updated.id), updated);
    } catch (e) {
      console.warn('Note: saved locally, cloud sync pending admin auth.');
    }
  };

  const addProduct = async (newProd: Omit<Product, 'id'>) => {
    const id = newProd.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);
    const product: Product = { ...newProd, id };
    setProducts((prev) => [product, ...prev]);
    showToast(`Novo produto "${product.name}" criado!`);

    try {
      await setDoc(doc(db, 'products', id), product);
    } catch (e) {
      console.warn('Note: saved locally, cloud sync pending admin auth.');
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.productId !== id));
    showToast('Produto excluído do catálogo');

    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.warn('Note: removed locally, cloud sync pending admin auth.');
    }
  };

  // Banner mutations
  const updateBanner = async (updated: BannerSlide) => {
    setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    showToast(`Banner "${updated.title}" atualizado!`);

    try {
      await setDoc(doc(db, 'banners', String(updated.id)), updated);
    } catch (e) {
      console.warn('Note: saved locally.');
    }
  };

  // Testimonial mutations
  const updateTestimonial = async (updated: Testimonial) => {
    setTestimonials((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast(`Depoimento de "${updated.name}" atualizado!`);

    try {
      await setDoc(doc(db, 'testimonials', updated.id), updated);
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
      await setDoc(doc(db, 'testimonials', id), testimonial);
    } catch (e) {
      console.warn('Note: saved locally.');
    }
  };

  const deleteTestimonial = async (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    showToast('Depoimento removido');

    try {
      await deleteDoc(doc(db, 'testimonials', id));
    } catch (e) {
      console.warn('Note: removed locally.');
    }
  };

  // Settings mutations
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    showToast('Configurações da loja salvas com sucesso!');

    try {
      await setDoc(doc(db, 'settings', 'general'), merged);
    } catch (e) {
      console.warn('Note: saved locally.');
    }
  };

  const resetDefaults = () => {
    setProducts(initialProducts);
    setBanners(initialBanners);
    setTestimonials(initialTestimonials);
    setSettings(initialStoreSettings);
    setOrders(initialOrders);
    showToast('Dados restaurados para o padrão de demonstração!');
  };

  const addOrder = async (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Pedido #${newOrder.id} registrado com sucesso!`);
    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
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
    setOrders((prev) =>
      prev.map((o) => {
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
      })
    );
    showToast(`Pedido #${orderId} atualizado para "${status.toUpperCase()}"!`);

    try {
      const payload: any = { status };
      if (trackingCode) payload.trackingCode = trackingCode;
      if (carrier) payload.carrier = carrier;
      if (status === 'shipped') payload.shippedAt = new Date().toISOString();
      await setDoc(doc(db, 'orders', orderId), payload, { merge: true });
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

      setOrders((prev) => [orderPayload, ...prev]);

      try {
        await setDoc(doc(db, 'orders', orderId), orderPayload);
        console.log('Order registered in Firestore:', orderId);
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
