import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, BannerSlide, Testimonial, StoreSettings, CartItem } from '../types';
import { initialProducts, initialBanners, initialTestimonials, initialStoreSettings } from '../data/initialData';

interface StoreContextType {
  products: Product[];
  banners: BannerSlide[];
  testimonials: Testimonial[];
  settings: StoreSettings;
  cart: CartItem[];
  activeTab: 'inicio' | 'produtos' | 'produto-detalhe' | 'resultados' | 'carrinho' | 'admin';
  selectedProductId: string;
  currency: 'EUR' | 'BRL';
  selectedCategory: string;
  searchQuery: string;
  toast: string | null;
  couponCode: string;
  couponDiscountPercent: number;
  deliveryNotes: string;
  setActiveTab: (tab: 'inicio' | 'produtos' | 'produto-detalhe' | 'resultados' | 'carrinho' | 'admin') => void;
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
  updateProduct: (updated: Product) => void;
  addProduct: (newProd: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  updateBanner: (updated: BannerSlide) => void;
  updateTestimonial: (updated: Testimonial) => void;
  addTestimonial: (newTest: Omit<Testimonial, 'id'>) => void;
  deleteTestimonial: (id: string) => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetDefaults: () => void;
  showToast: (msg: string) => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  cartItemsCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'metaslim_pro_products_v2',
  BANNERS: 'metaslim_pro_banners_v2',
  TESTIMONIALS: 'metaslim_pro_testimonials_v2',
  SETTINGS: 'metaslim_pro_settings_v2',
  CART: 'metaslim_pro_cart_v2',
  CURRENCY: 'metaslim_pro_currency_v2',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [banners, setBanners] = useState<BannerSlide[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BANNERS);
      return saved ? JSON.parse(saved) : initialBanners;
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
      return saved ? JSON.parse(saved) : initialStoreSettings;
    } catch {
      return initialStoreSettings;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
      // Pre-populate with initial items matching the reference design!
      const p1 = initialProducts[0];
      const p2 = initialProducts.find((p) => p.id === 'agua-bacteriostatica-10ml') || initialProducts[1];
      return [
        {
          id: `${p1.id}-1vial`,
          productId: p1.id,
          product: p1,
          quantity: 1,
          vialsCount: 1,
          unitPrice: 59.0,
          totalPrice: 59.0,
        },
        {
          id: `${p2.id}-1vial`,
          productId: p2.id,
          product: p2,
          quantity: 1,
          vialsCount: 1,
          unitPrice: p2.price,
          totalPrice: p2.price,
        },
      ];
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

  const [activeTab, setActiveTab] = useState<'inicio' | 'produtos' | 'produto-detalhe' | 'resultados' | 'carrinho' | 'admin'>('inicio');
  const [selectedProductId, setSelectedProductId] = useState<string>('retatrutide-10mg');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>('METASLIM10');
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(10);
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  }, [currency]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3200);
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
    // calculate unit price based on vialsCount discount tier
    let unitPrice = product.price;
    if (vialsCount === 2) {
      unitPrice = Math.round(product.price * 2 * 0.8 * 100) / 100; // 20% discount on 2 vials total
    } else if (vialsCount === 3) {
      unitPrice = Math.round(product.price * 3 * 0.7 * 100) / 100; // 30% discount on 3 vials total
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

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    // Also update any cart items that hold this product
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
  };

  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = newProd.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);
    const product: Product = { ...newProd, id };
    setProducts((prev) => [product, ...prev]);
    showToast(`Novo produto "${product.name}" criado com sucesso!`);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.productId !== id));
    showToast('Produto excluído do catálogo');
  };

  const updateBanner = (updated: BannerSlide) => {
    setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    showToast(`Banner "${updated.title}" atualizado!`);
  };

  const updateTestimonial = (updated: Testimonial) => {
    setTestimonials((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast(`Depoimento de "${updated.name}" atualizado!`);
  };

  const addTestimonial = (newTest: Omit<Testimonial, 'id'>) => {
    const id = 'test-' + Date.now().toString().slice(-4);
    const testimonial: Testimonial = { ...newTest, id };
    setTestimonials((prev) => [testimonial, ...prev]);
    showToast(`Novo depoimento de "${testimonial.name}" adicionado!`);
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    showToast('Depoimento removido');
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Configurações da loja salvas com sucesso!');
  };

  const resetDefaults = () => {
    setProducts(initialProducts);
    setBanners(initialBanners);
    setTestimonials(initialTestimonials);
    setSettings(initialStoreSettings);
    showToast('Dados restaurados para o padrão de demonstração!');
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
        activeTab,
        selectedProductId,
        currency,
        selectedCategory,
        searchQuery,
        toast,
        couponCode,
        couponDiscountPercent,
        deliveryNotes,
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
