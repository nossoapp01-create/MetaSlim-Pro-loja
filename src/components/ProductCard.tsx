import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Info, ShoppingCart, Zap, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatPrice, addToCart, setActiveTab, setSelectedProductId } = useStore();

  const handleOpenDetail = () => {
    setSelectedProductId(product.id);
    setActiveTab('produto-detalhe');
  };

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <article
      className="group relative flex flex-col justify-between rounded-2xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200/70 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-950/8 transition-all duration-300 transform hover:-translate-y-1"
      id={`product-card-${product.id}`}
    >
      {/* Top Floating Badges */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="font-mono text-[10px] text-slate-500 tracking-wider font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
          REF: {product.refCode}
        </span>
        {product.badge ? (
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#006750] to-[#0d8267] text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-sm">
            {product.badge}
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold">
            COA Verificado
          </span>
        )}
      </div>

      {/* Product Image & Main Details Row */}
      <div className="flex gap-3 sm:gap-4 items-center cursor-pointer" onClick={handleOpenDetail}>
        {/* Vial Image Frame with Hover Zoom */}
        <div className="relative w-28 h-32 sm:w-32 sm:h-36 rounded-xl bg-gradient-to-b from-[#f2f4f8] via-[#eef2f6] to-[#f8f9fa] flex items-center justify-center p-2 shrink-0 overflow-hidden border border-slate-100 group-hover:border-emerald-200 transition-colors">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain filter drop-shadow-md transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-500 ease-out"
            loading="lazy"
          />
          <div className="absolute bottom-1 left-1 right-1 px-1 py-0.5 bg-[#131b2e]/80 backdrop-blur-xs rounded text-center">
            <span className="font-mono text-[8px] text-white tracking-widest uppercase block truncate">
              {product.batchNumber || 'BATCH-2026'}
            </span>
          </div>
        </div>

        {/* Info Column */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="truncate">{product.purity}</span>
          </div>

          <h3 className="font-bold text-base sm:text-lg text-[#131b2e] leading-snug group-hover:text-[#006750] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <span className="text-xs text-slate-500 font-medium truncate mt-0.5">
            {product.subtitle}
          </span>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-2 mt-2.5">
            <span className="text-xl sm:text-2xl font-extrabold text-[#006750] font-mono">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs sm:text-sm text-slate-400 line-through font-mono">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {discountPercent && (
              <span className="text-[10px] font-bold font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                -{discountPercent}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* "Para que serve" Section */}
      <div className="mt-3 p-2.5 rounded-xl bg-[#f2f6f5] border border-emerald-950/5 text-slate-700">
        <p className="text-xs leading-relaxed text-slate-600 line-clamp-2">
          <strong className="text-[#131b2e] font-semibold">Para que serve: </strong>
          {product.whatIsItFor}
        </p>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-1">
        <button
          onClick={handleOpenDetail}
          className="h-10 rounded-xl bg-slate-100 hover:bg-emerald-50 text-[#131b2e] hover:text-[#006750] font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200/60 transition-all active:scale-95"
          id={`btn-details-${product.id}`}
        >
          <Info className="w-4 h-4 text-emerald-700" />
          <span>Ver Detalhes</span>
        </button>

        <button
          onClick={() => addToCart(product, 1, 1)}
          className="h-10 rounded-xl bg-gradient-to-r from-[#006750] to-[#0d8267] hover:from-[#0d8267] hover:to-[#006750] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/15 transition-all active:scale-95"
          id={`btn-add-cart-${product.id}`}
        >
          <ShoppingCart className="w-4 h-4 text-[#93f5d4]" />
          <span>Comprar</span>
        </button>
      </div>
    </article>
  );
};
