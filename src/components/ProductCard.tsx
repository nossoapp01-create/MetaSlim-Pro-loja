import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Info, ShoppingCart } from 'lucide-react';
import { ProductVialVisual } from './ProductVialVisual';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatPrice, addToCart, setActiveTab, setSelectedProductId, t, td } = useStore();

  const handleOpenDetail = () => {
    setSelectedProductId(product.id);
    setActiveTab('produto-detalhe');
  };

  const hasDosages = Boolean(product.dosageOptions && product.dosageOptions.length > 0);

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const statusTag =
    product.status === 'offline'
      ? 'Offline'
      : product.badge && !/compre\s*[12]\s*(e\s*leve\s*2|ganhe\s*1)/i.test(product.badge)
      ? td(product.badge)
      : null;

  return (
    <article
      className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl bg-white p-3.5 sm:p-4 border border-slate-200/80 hover:border-emerald-600/35 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
      id={`product-card-${product.id}`}
    >
      {/* Clean single-line metadata header */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="font-mono tabular-nums text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-medium truncate">
          {product.refCode} · {td(product.purity)}
        </span>

        {statusTag && (
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide shrink-0 ${
              product.status === 'offline' ? 'text-rose-700' : 'text-[#006750]'
            }`}
          >
            {statusTag}
          </span>
        )}
      </div>

      {/* Product Image & Main Details Row */}
      <div className="flex gap-3 sm:gap-3.5 items-center cursor-pointer" onClick={handleOpenDetail}>
        <ProductVialVisual product={product} size="md" className="shrink-0 w-20 h-24 sm:w-28 sm:h-32" />

        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="font-bold text-sm sm:text-base text-[#131b2e] leading-snug group-hover:text-[#006750] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <span className="text-[11px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
            {td(product.subtitle)}
          </span>

          {hasDosages && (
            <span className="text-[10px] font-mono text-slate-500 mt-1">
              {t('product.dosage_range')}
            </span>
          )}

          {/* Pricing Row */}
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-base sm:text-xl font-extrabold text-[#006750] font-mono tabular-nums leading-none">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through font-mono tabular-nums">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {discountPercent && (
              <span className="text-[10px] font-bold font-mono tabular-nums text-emerald-700">
                -{discountPercent}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Concise indication summary */}
      <p className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] sm:text-xs leading-relaxed text-slate-600 line-clamp-2">
        <strong className="text-[#131b2e] font-semibold">{t('product.indication')} </strong>
        {td(product.whatIsItFor)}
      </p>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          type="button"
          onClick={handleOpenDetail}
          className="h-9 rounded-lg bg-slate-50 hover:bg-emerald-50 text-[#131b2e] hover:text-[#006750] font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200/80 transition-colors cursor-pointer"
          id={`btn-details-${product.id}`}
        >
          <Info className="w-3.5 h-3.5 text-[#006750] shrink-0" />
          <span>{t('home.details')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const defaultDosage =
              hasDosages && product.dosageOptions && product.dosageOptions.length > 0
                ? product.dosageOptions[0].mg
                : undefined;
            addToCart(product, 1, 1, defaultDosage);
            setActiveTab('carrinho');
          }}
          className="h-9 rounded-lg bg-[#006750] hover:bg-[#005240] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          id={`btn-add-cart-${product.id}`}
        >
          <ShoppingCart className="w-3.5 h-3.5 text-[#93f5d4] shrink-0" />
          <span>{t('home.buy')}</span>
        </button>
      </div>
    </article>
  );
};
