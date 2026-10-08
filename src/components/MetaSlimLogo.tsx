import React from 'react';

interface MetaSlimLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'light' | 'white';
}

export const MetaSlimLogo: React.FC<MetaSlimLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
}) => {
  // Height sizing
  const heights = {
    sm: 'h-8',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const isWhite = variant === 'white';

  if (variant === 'icon-only') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${iconSizes[size]} ${className}`}>
        <img
          src="/icon.svg"
          alt="MetaSlim Pro"
          className="w-full h-full object-contain rounded-xl shadow-xs"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 shrink-0 ${heights[size]} ${className}`}>
      {/* Official Emblem Mark */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 512 512"
          className={
            size === 'sm'
              ? 'w-7 h-7 sm:w-8 sm:h-8'
              : size === 'md'
              ? 'w-9 h-9 sm:w-10 sm:h-10'
              : size === 'lg'
              ? 'w-11 h-11 sm:w-12 sm:h-12'
              : 'w-14 h-14 sm:w-16 sm:h-16'
          }
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="msFigGrad" x1="0%" y1="100%" x2="70%" y2="0%">
              <stop offset="0%" stopColor="#054e3f" />
              <stop offset="40%" stopColor="#0d9488" />
              <stop offset="80%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="msArrGrad" x1="0%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
          </defs>

          {/* Outer Circular Dynamic Swoosh */}
          <path
            fill="url(#msFigGrad)"
            d="M 126,268 C 112,324 138,382 188,412 C 244,444 316,428 356,378 C 376,352 388,318 396,276 L 362,284 C 356,316 344,342 328,362 C 298,400 242,412 198,386 C 158,362 140,318 152,274 C 160,244 180,214 204,192 L 182,176 C 152,204 132,234 126,268 Z"
          />

          {/* Ascending Arrow Stem */}
          <path
            fill="url(#msFigGrad)"
            d="M 334,366 C 354,324 372,260 384,180 L 350,174 C 340,246 322,306 306,344 Z"
          />

          {/* Sharp Arrow Head */}
          <path
            fill="url(#msArrGrad)"
            d="M 390,74 L 436,188 L 378,168 L 348,162 Z"
          />

          {/* Head */}
          <circle cx="270" cy="116" r="24" fill="#34d399" />

          {/* Torso */}
          <path
            fill="url(#msFigGrad)"
            d="M 270,144 C 284,166 294,196 288,228 C 282,258 266,284 252,312 C 246,324 240,336 238,348 L 218,338 C 224,318 234,298 244,276 C 254,254 262,234 260,214 C 258,194 250,176 242,160 Z"
          />

          {/* Left Arm */}
          <path
            fill="url(#msFigGrad)"
            d="M 252,168 C 222,174 186,168 156,150 C 148,146 142,140 146,134 C 150,128 158,130 166,134 C 192,148 222,154 250,152 Z"
          />

          {/* Right Arm */}
          <path
            fill="url(#msArrGrad)"
            d="M 276,164 C 298,168 322,166 342,156 C 350,152 356,146 352,140 C 348,134 340,136 332,140 C 314,148 294,152 272,150 Z"
          />

          {/* Legs */}
          <path
            fill="url(#msFigGrad)"
            d="M 242,284 C 228,312 210,344 194,374 C 190,382 184,384 180,380 C 176,376 178,368 182,360 C 198,332 216,302 230,274 Z"
          />
          <path
            fill="url(#msFigGrad)"
            d="M 256,296 C 270,320 286,348 296,376 C 300,386 298,394 290,394 C 284,394 280,386 276,376 C 268,352 254,328 242,306 Z"
          />
        </svg>
      </div>

      {/* Official Typography from user's logo */}
      <div className="flex flex-col justify-center select-none">
        <div className="flex items-baseline leading-none tracking-tight">
          <span
            className={`font-extrabold font-['Space_Grotesk',sans-serif] ${
              isWhite ? 'text-white' : 'text-[#0f172a]'
            } ${
              size === 'sm'
                ? 'text-sm sm:text-base'
                : size === 'md'
                ? 'text-base sm:text-lg'
                : size === 'lg'
                ? 'text-lg sm:text-xl'
                : 'text-2xl sm:text-3xl'
            }`}
          >
            META
          </span>
          <span
            className={`font-normal font-['Space_Grotesk',sans-serif] ${
              isWhite ? 'text-slate-200' : 'text-[#334155]'
            } ${
              size === 'sm'
                ? 'text-sm sm:text-base'
                : size === 'md'
                ? 'text-base sm:text-lg'
                : size === 'lg'
                ? 'text-lg sm:text-xl'
                : 'text-2xl sm:text-3xl'
            }`}
          >
            SLIM
          </span>
        </div>

        {/* Subtitle: "— PRO —" */}
        <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
          <div
            className={`h-[1.5px] rounded-full flex-1 ${
              isWhite ? 'bg-emerald-400/80' : 'bg-[#0d9488]'
            }`}
          />
          <span
            className={`font-extrabold uppercase font-mono tracking-[0.25em] ${
              isWhite ? 'text-[#71face]' : 'text-[#0d9488]'
            } ${
              size === 'sm'
                ? 'text-[7px]'
                : size === 'md'
                ? 'text-[8px] sm:text-[9px]'
                : size === 'lg'
                ? 'text-[10px]'
                : 'text-xs'
            }`}
          >
            PRO
          </span>
          <div
            className={`h-[1.5px] rounded-full flex-1 ${
              isWhite ? 'bg-emerald-400/80' : 'bg-[#0d9488]'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
