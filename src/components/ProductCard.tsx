import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Info, ShoppingCart } from 'lucide-react';
import { ProductVialVisual } from './ProductVialVisual';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatPrice, addToCart, setActiveTab, setSelectedProductId } = useStore();

  const handleOpenDetail = () => {
    setSelectedProductId(product.id);
    setActiveTab('produto-detalhe');
  };

  const hasDosages = Boolean(product.dosageOptions && product.dosageOptions.length > 0);

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <article
      className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl bg-white p-2.5 sm:p-4 shadow-2xs border border-slate-200/80 hover:border-emerald-500/30 hover:shadow-md transition-all duration-200"
      id={`product-card-${product.id}`}
    >
      {/* Top Floating Badges */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1 overflow-hidden">
          <span className="font-mono text-[8px] sm:text-[9px] text-slate-500 tracking-wider font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
            REF: {product.refCode}
          </span>
          {hasDosages && (
            <span className="font-mono text-[8px] sm:text-[9px] text-[#006750] bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
              10 a 100mg
            </span>
          )}
        </div>
        {product.status === 'offline' ? (
          <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono text-[8px] sm:text-[9px] font-bold uppercase tracking-wider shrink-0">
            Offline
          </span>
        ) : product.badge ? (
          <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-[#006750] to-[#0d8267] text-white font-mono text-[8px] sm:text-[9px] font-bold uppercase tracking-wider shadow-2xs shrink-0">
            {product.badge}
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[8px] sm:text-[9px] font-bold shrink-0">
            COA 99%+
          </span>
        )}
      </div>

      {/* Product Image & Main Details Row */}
      <div className="flex gap-2 sm:gap-3.5 items-center cursor-pointer" onClick={handleOpenDetail}>
        {/* Vial Image Frame */}
        <ProductVialVisual product={product} size="md" className="shrink-0 w-16 h-20 sm:w-28 sm:h-32" />

        {/* Info Column */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-700 font-semibold mb-0.5">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            <span className="truncate">{product.purity}</span>
          </div>

          <h3 className="font-bold text-xs sm:text-base text-[#131b2e] leading-snug group-hover:text-[#006750] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate mt-0.5">
            {product.subtitle}
          </span>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-1 sm:gap-1.5 mt-1 sm:mt-1.5">
            <span className="text-sm sm:text-xl font-extrabold text-[#006750] font-mono leading-none">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through font-mono">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {discountPercent && (
              <span className="text-[8px] sm:text-[9px] font-bold font-mono text-rose-600 bg-rose-50 px-1 py-0.2 rounded">
                -{discountPercent}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* "Para que serve" Section */}
      <div className="mt-2 p-1.5 sm:p-2 rounded-lg bg-[#f4f7f6] border border-emerald-950/5 text-slate-700">
        <p className="text-[9px] sm:text-xs leading-relaxed text-slate-600 line-clamp-2">
          <strong className="text-[#131b2e] font-semibold">Indicação: </strong>
          {product.whatIsItFor}
        </p>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-2 pt-0.5">
        <button
          onClick={handleOpenDetail}
          className="h-7 sm:h-9 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-emerald-50 text-[#131b2e] hover:text-[#006750] font-semibold text-[10px] sm:text-xs flex items-center justify-center gap-1 border border-slate-200/60 transition-all active:scale-95 cursor-pointer"
          id={`btn-details-${product.id}`}
        >
          <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-700 shrink-0" />
          <span>Detalhes</span>
        </button>

        <button
          onClick={() => {
            const defaultDosage = hasDosages && product.dosageOptions && product.dosageOptions.length > 0
              ? product.dosageOptions[0].mg
              : undefined;
            addToCart(product, 1, 1, defaultDosage);
            setActiveTab('carrinho');
          }}
          className="h-7 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#006750] to-[#0d8267] hover:from-[#0d8267] hover:to-[#006750] text-white font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
          id={`btn-add-cart-${product.id}`}
        >
          <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#93f5d4] shrink-0" />
          <span>Comprar</span>
        </button>
      </div>
    </article>
  );
};
