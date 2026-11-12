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
      className={`relative rounded-xl overflow-hidden flex items-center justify-center bg-[#f4f7f6] border border-slate-200/80 group ${
        isLarge
          ? 'w-full aspect-[4/3] max-h-[380px] p-4'
          : isSmall
          ? 'w-20 h-24 p-1.5'
          : 'w-28 h-32 sm:w-32 sm:h-36 p-2.5'
      } ${className}`}
    >
      <img
        src={product.image}
        alt={`${product.name} - MetaSlim Pro`}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-105 ${
          isLarge ? 'drop-shadow-xl' : 'drop-shadow-sm'
        }`}
        loading="lazy"
      />
    </div>
  );
};
