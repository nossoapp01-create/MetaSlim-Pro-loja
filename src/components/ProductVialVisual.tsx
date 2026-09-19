import React from 'react';
import { Product } from '../types';

interface ProductVialVisualProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProductVialVisual: React.FC<ProductVialVisualProps> = ({
  product,
  size = 'md',
  className = '',
}) => {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  return (
    <div
      className={`relative rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] border border-slate-200/80 group ${
        isLarge
          ? 'w-full aspect-[4/3] max-h-[380px] p-4'
          : isSmall
          ? 'w-20 h-24 p-1.5'
          : 'w-28 h-32 sm:w-32 sm:h-36 p-2'
      } ${className}`}
    >
      {/* Background Soft Studio Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(113,250,206,0.18)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Product Image (Vial & Box Packaging) */}
      <img
        src={product.image}
        alt={`${product.name} - MetaSlim Pro`}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-contain filter drop-shadow-md transform transition-all duration-500 ease-out group-hover:scale-105 ${
          isLarge ? 'drop-shadow-2xl' : ''
        }`}
        loading="lazy"
      />

      {/* MetaSlim Pro Official Brand Watermark / Stamp on Card */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-[#131b2e]/85 backdrop-blur-xs text-white px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold font-mono tracking-wider shadow-xs pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#71face] animate-pulse" />
        <span className="text-[#93f5d4]">METASLIM</span>
        <span className="text-white">PRO</span>
      </div>

      {/* Bottom Batch & Ref Bar */}
      <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 bg-[#131b2e]/90 backdrop-blur-xs rounded text-center pointer-events-none flex items-center justify-between">
        <span className="font-mono text-[7px] sm:text-[8px] text-[#93f5d4] font-semibold tracking-wider uppercase block truncate">
          {product.refCode || 'MSP'}
        </span>
        <span className="font-mono text-[7px] sm:text-[8px] text-slate-300 tracking-wider uppercase block truncate">
          {product.batchNumber || 'BATCH-2026'}
        </span>
      </div>
    </div>
  );
};
