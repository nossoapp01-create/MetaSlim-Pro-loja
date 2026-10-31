import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, X, ShoppingBag, MapPin, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { translateText } from '../utils/i18n';

interface EuropeanBuyer {
  name: string;
  city: string;
  country: {
    pt: string;
    es: string;
    en: string;
  };
  flag: string;
}

const EUROPEAN_BUYERS: EuropeanBuyer[] = [
  { name: 'Diogo M.', city: 'Lisboa', country: { pt: 'Portugal', es: 'Portugal', en: 'Portugal' }, flag: '🇵🇹' },
  { name: 'Sofia R.', city: 'Porto', country: { pt: 'Portugal', es: 'Portugal', en: 'Portugal' }, flag: '🇵🇹' },
  { name: 'Alejandro G.', city: 'Madrid', country: { pt: 'Espanha', es: 'España', en: 'Spain' }, flag: '🇪🇸' },
  { name: 'Lucía V.', city: 'Barcelona', country: { pt: 'Espanha', es: 'España', en: 'Spain' }, flag: '🇪🇸' },
  { name: 'Camille L.', city: 'Paris', country: { pt: 'França', es: 'Francia', en: 'France' }, flag: '🇫🇷' },
  { name: 'Antoine B.', city: 'Lyon', country: { pt: 'França', es: 'Francia', en: 'France' }, flag: '🇫🇷' },
  { name: 'Matteo R.', city: 'Milano', country: { pt: 'Itália', es: 'Italia', en: 'Italy' }, flag: '🇮🇹' },
  { name: 'Giulia F.', city: 'Roma', country: { pt: 'Itália', es: 'Italia', en: 'Italy' }, flag: '🇮🇹' },
  { name: 'Lukas W.', city: 'Berlin', country: { pt: 'Alemanha', es: 'Alemania', en: 'Germany' }, flag: '🇩🇪' },
  { name: 'Hannah S.', city: 'München', country: { pt: 'Alemanha', es: 'Alemania', en: 'Germany' }, flag: '🇩🇪' },
  { name: 'Marc K.', city: 'Zürich', country: { pt: 'Suíça', es: 'Suiza', en: 'Switzerland' }, flag: '🇨🇭' },
  { name: 'Chloé D.', city: 'Genève', country: { pt: 'Suíça', es: 'Suiza', en: 'Switzerland' }, flag: '🇨🇭' },
  { name: 'Daan V.', city: 'Amsterdam', country: { pt: 'Países Baixos', es: 'Países Bajos', en: 'Netherlands' }, flag: '🇳🇱' },
  { name: 'Thomas M.', city: 'Bruxelles', country: { pt: 'Bélgica', es: 'Bélgica', en: 'Belgium' }, flag: '🇧🇪' },
  { name: 'Oliver H.', city: 'London', country: { pt: 'Reino Unido', es: 'Reino Unido', en: 'United Kingdom' }, flag: '🇬🇧' },
  { name: 'Liam O.', city: 'Dublin', country: { pt: 'Irlanda', es: 'Irlanda', en: 'Ireland' }, flag: '🇮🇪' },
  { name: 'Sebastian E.', city: 'Wien', country: { pt: 'Áustria', es: 'Austria', en: 'Austria' }, flag: '🇦🇹' },
  { name: 'Nicolas P.', city: 'Luxembourg', country: { pt: 'Luxemburgo', es: 'Luxemburgo', en: 'Luxembourg' }, flag: '🇱🇺' },
  { name: 'Erik N.', city: 'Stockholm', country: { pt: 'Suécia', es: 'Suecia', en: 'Sweden' }, flag: '🇸🇪' },
  { name: 'Katarzyna Z.', city: 'Warszawa', country: { pt: 'Polónia', es: 'Polonia', en: 'Poland' }, flag: '🇵🇱' },
  { name: 'Mikkel J.', city: 'København', country: { pt: 'Dinamarca', es: 'Dinamarca', en: 'Denmark' }, flag: '🇩🇰' },
  { name: 'Elena K.', city: 'Athína', country: { pt: 'Grécia', es: 'Grecia', en: 'Greece' }, flag: '🇬🇷' },
  { name: 'Gonçalo T.', city: 'Braga', country: { pt: 'Portugal', es: 'Portugal', en: 'Portugal' }, flag: '🇵🇹' },
  { name: 'Javier S.', city: 'Valencia', country: { pt: 'Espanha', es: 'España', en: 'Spain' }, flag: '🇪🇸' },
];

export const LivePurchasePopup: React.FC = () => {
  const store = useStore();
  const language = store?.language || 'pt';
  const t = typeof store?.t === 'function' ? store.t : (key: any) => translateText(language, key);
  const products = store?.products || [];
  const setSelectedProductId = store?.setSelectedProductId;
  const setActiveTab = store?.setActiveTab;

  const [isVisible, setIsVisible] = useState(false);
  const [buyerIndex, setBuyerIndex] = useState(0);
  const [productIndex, setProductIndex] = useState(0);
  const [minutesAgo, setMinutesAgo] = useState(2);
  const [vialQty, setVialQty] = useState(1);

  const onlineProducts = products.filter((p) => p && p.status !== 'offline');

  const triggerNotification = useCallback(() => {
    if (onlineProducts.length === 0) return;

    setBuyerIndex((prev) => {
      const next = (prev + 1 + Math.floor(Math.random() * 3)) % EUROPEAN_BUYERS.length;
      return next;
    });
    setProductIndex(Math.floor(Math.random() * onlineProducts.length));
    setMinutesAgo(Math.floor(Math.random() * 6) + 1);
    setVialQty(Math.random() > 0.65 ? 2 : 1);
    setIsVisible(true);
  }, [onlineProducts.length]);

  useEffect(() => {
    if (onlineProducts.length === 0) return;

    // Show first notification after 8 seconds so the user sees it working
    const initialTimeout = setTimeout(() => {
      triggerNotification();
    }, 8000);

    // Repeat every 75 seconds (75,000 ms) as requested
    const interval = setInterval(() => {
      triggerNotification();
    }, 75000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [onlineProducts.length, triggerNotification]);

  // Auto-hide popup 8 seconds after appearing
  useEffect(() => {
    if (!isVisible) return;
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 8000);
    return () => clearTimeout(hideTimeout);
  }, [isVisible]);

  if (!isVisible || onlineProducts.length === 0) return null;

  const buyer = EUROPEAN_BUYERS[buyerIndex % EUROPEAN_BUYERS.length];
  const product = onlineProducts[productIndex % onlineProducts.length];
  const dosage = product.dosageOptions?.[0]?.mg || '10mg';

  const purchasedLabel =
    language === 'es'
      ? 'compró recientemente'
      : language === 'en'
      ? 'recently purchased'
      : 'comprou recentemente';

  const verifiedLabel =
    language === 'es'
      ? 'Compra Verificada UE'
      : language === 'en'
      ? 'Verified EU Order'
      : 'Compra Verificada UE';

  const timeLabel =
    language === 'es'
      ? `hace ${minutesAgo} min`
      : language === 'en'
      ? `${minutesAgo} min ago`
      : `há ${minutesAgo} min`;

  const vialLabel =
    language === 'es'
      ? `${vialQty} ${vialQty > 1 ? 'Frascos' : 'Frasco'} (${dosage})`
      : language === 'en'
      ? `${vialQty} ${vialQty > 1 ? 'Vials' : 'Vial'} (${dosage})`
      : `${vialQty} ${vialQty > 1 ? 'Frascos' : 'Frasco'} (${dosage})`;

  const handleOpenProduct = () => {
    if (setSelectedProductId && setActiveTab) {
      setSelectedProductId(product.id);
      setActiveTab('produto-detalhe');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsVisible(false);
    }
  };

  return (
    <div
      className="fixed bottom-16 sm:bottom-6 left-3 sm:left-6 z-[55] max-w-[330px] sm:max-w-[360px] w-[calc(100vw-24px)] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-2xl p-3 sm:p-3.5 transition-all duration-500 animate-in slide-in-from-bottom-5 fade-in cursor-pointer group hover:border-blue-500/50"
      onClick={handleOpenProduct}
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
        }}
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
        aria-label="Fechar notificação"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-center gap-3 pr-5">
        <div className="relative w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center p-1">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute -bottom-0.5 -right-0.5 text-sm leading-none bg-white rounded-full p-0.5 shadow-sm">
            {buyer.flag}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 truncate">
            <span className="truncate">{buyer.name}</span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-0.5 text-slate-600 font-medium truncate">
              <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
              {buyer.city}, {buyer.country[language] || buyer.country.pt}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {purchasedLabel}{' '}
            <span className="font-bold text-blue-600 group-hover:underline">
              {t(product.name as any)}
            </span>
          </p>

          <div className="flex items-center justify-between gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              {verifiedLabel}
            </span>

            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
              <ShoppingBag className="w-2.5 h-2.5 text-slate-400" />
              {vialLabel} • <Clock className="w-2.5 h-2.5" /> {timeLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
