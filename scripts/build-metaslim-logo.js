import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');

// 1. The Emblem Mark SVG (Perfect for Favicon, Browser Tab, and PWA Icons)
const emblemSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#062822" />
      <stop offset="50%" stop-color="#0a3a30" />
      <stop offset="100%" stop-color="#0b1b24" />
    </linearGradient>

    <!-- Figure & Swoosh Gradient -->
    <linearGradient id="figureGrad" x1="0%" y1="100%" x2="70%" y2="0%">
      <stop offset="0%" stop-color="#054e3f" />
      <stop offset="40%" stop-color="#0d9488" />
      <stop offset="80%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#34d399" />
    </linearGradient>

    <!-- Arrow Head Gradient -->
    <linearGradient id="arrowGrad" x1="0%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%" stop-color="#0d9488" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#4ade80" />
    </linearGradient>

    <!-- Subtle Glow Shadow -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#10b981" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Squircle App Icon Container -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Subtle Inner Border Highlight -->
  <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="#34d399" stroke-opacity="0.2" stroke-width="3" />

  <!-- The Official MetaSlim Pro Rising Athlete & Ascending Arrow Emblem -->
  <g filter="url(#glow)" transform="translate(18, 14) scale(0.93)">
    
    <!-- Outer Circular Dynamic Swoosh (Base of Arrow wrapping from bottom-left) -->
    <path
      fill="url(#figureGrad)"
      d="M 126,268
         C 112,324 138,382 188,412
         C 244,444 316,428 356,378
         C 376,352 388,318 396,276
         L 362,284
         C 356,316 344,342 328,362
         C 298,400 242,412 198,386
         C 158,362 140,318 152,274
         C 160,244 180,214 204,192
         L 182,176
         C 152,204 132,234 126,268 Z"
    />

    <!-- The Ascending Arrow Stem (Surging Upward to Top-Right) -->
    <path
      fill="url(#figureGrad)"
      d="M 334,366
         C 354,324 372,260 384,180
         L 350,174
         C 340,246 322,306 306,344
         Z"
    />

    <!-- Sharp Arrow Head pointing Up and Right -->
    <path
      fill="url(#arrowGrad)"
      d="M 390,74
         L 436,188
         L 378,168
         L 348,162
         Z"
    />

    <!-- Athletic Figure - Head -->
    <circle cx="270" cy="116" r="24" fill="#34d399" />

    <!-- Athletic Figure - Torso & Leaping Upper Body -->
    <path
      fill="url(#figureGrad)"
      d="M 270,144
         C 284,166 294,196 288,228
         C 282,258 266,284 252,312
         C 246,324 240,336 238,348
         L 218,338
         C 224,318 234,298 244,276
         C 254,254 262,234 260,214
         C 258,194 250,176 242,160
         Z"
    />

    <!-- Athletic Figure - Left Arm (Sweeping Gracefully Backward) -->
    <path
      fill="url(#figureGrad)"
      d="M 252,168
         C 222,174 186,168 156,150
         C 148,146 142,140 146,134
         C 150,128 158,130 166,134
         C 192,148 222,154 250,152
         Z"
    />

    <!-- Athletic Figure - Right Arm (Reaching Dynamically Forward/Up) -->
    <path
      fill="url(#arrowGrad)"
      d="M 276,164
         C 298,168 322,166 342,156
         C 350,152 356,146 352,140
         C 348,134 340,136 332,140
         C 314,148 294,152 272,150
         Z"
    />

    <!-- Athletic Figure - Left Leg (Drive Back & Down) -->
    <path
      fill="url(#figureGrad)"
      d="M 242,284
         C 228,312 210,344 194,374
         C 190,382 184,384 180,380
         C 176,376 178,368 182,360
         C 198,332 216,302 230,274
         Z"
    />

    <!-- Athletic Figure - Right Leg (Bent Forward Knee in Kinetic Drive) -->
    <path
      fill="url(#figureGrad)"
      d="M 256,296
         C 270,320 286,348 296,376
         C 300,386 298,394 290,394
         C 284,394 280,386 276,376
         C 268,352 254,328 242,306
         Z"
    />
  </g>
</svg>`;

// 2. Full Horizontal Brand Logo SVG (Emblem + "METASLIM PRO")
const fullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 180" width="640" height="180">
  <defs>
    <linearGradient id="logoFigureGrad" x1="0%" y1="100%" x2="70%" y2="0%">
      <stop offset="0%" stop-color="#054e3f" />
      <stop offset="40%" stop-color="#0d9488" />
      <stop offset="80%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#34d399" />
    </linearGradient>
    <linearGradient id="logoArrowGrad" x1="0%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%" stop-color="#0d9488" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#4ade80" />
    </linearGradient>
  </defs>

  <!-- Icon Emblem (Left) -->
  <g transform="translate(10, 8) scale(0.32)">
    <!-- Outer Swoosh Loop -->
    <path
      fill="url(#logoFigureGrad)"
      d="M 126,268
         C 112,324 138,382 188,412
         C 244,444 316,428 356,378
         C 376,352 388,318 396,276
         L 362,284
         C 356,316 344,342 328,362
         C 298,400 242,412 198,386
         C 158,362 140,318 152,274
         C 160,244 180,214 204,192
         L 182,176
         C 152,204 132,234 126,268 Z"
    />
    <!-- Ascending Arrow Stem -->
    <path
      fill="url(#logoFigureGrad)"
      d="M 334,366
         C 354,324 372,260 384,180
         L 350,174
         C 340,246 322,306 306,344
         Z"
    />
    <!-- Arrow Head -->
    <path
      fill="url(#logoArrowGrad)"
      d="M 390,74
         L 436,188
         L 378,168
         L 348,162
         Z"
    />
    <!-- Head -->
    <circle cx="270" cy="116" r="24" fill="#34d399" />
    <!-- Torso -->
    <path
      fill="url(#logoFigureGrad)"
      d="M 270,144
         C 284,166 294,196 288,228
         C 282,258 266,284 252,312
         C 246,324 240,336 238,348
         L 218,338
         C 224,318 234,298 244,276
         C 254,254 262,234 260,214
         C 258,194 250,176 242,160
         Z"
    />
    <!-- Left Arm -->
    <path
      fill="url(#logoFigureGrad)"
      d="M 252,168
         C 222,174 186,168 156,150
         C 148,146 142,140 146,134
         C 150,128 158,130 166,134
         C 192,148 222,154 250,152
         Z"
    />
    <!-- Right Arm -->
    <path
      fill="url(#logoArrowGrad)"
      d="M 276,164
         C 298,168 322,166 342,156
         C 350,152 356,146 352,140
         C 348,134 340,136 332,140
         C 314,148 294,152 272,150
         Z"
    />
    <!-- Legs -->
    <path
      fill="url(#logoFigureGrad)"
      d="M 242,284
         C 228,312 210,344 194,374
         C 190,382 184,384 180,380
         C 176,376 178,368 182,360
         C 198,332 216,302 230,274
         Z"
    />
    <path
      fill="url(#logoFigureGrad)"
      d="M 256,296
         C 270,320 286,348 296,376
         C 300,386 298,394 290,394
         C 284,394 280,386 276,376
         C 268,352 254,328 242,306
         Z"
    />
  </g>

  <!-- Typography Right Side -->
  <g transform="translate(175, 45)">
    <!-- "METASLIM" -->
    <text x="0" y="55" font-family="'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif" font-size="52" font-weight="800" fill="#0f172a" letter-spacing="1">
      META<tspan font-weight="400" fill="#1e293b">SLIM</tspan>
    </text>

    <!-- Subtitle: "— PRO —" with horizontal lines -->
    <g transform="translate(0, 82)">
      <line x1="2" y1="-7" x2="115" y2="-7" stroke="#0d9488" stroke-width="3" stroke-linecap="round" />
      <text x="175" y="0" text-anchor="middle" font-family="'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif" font-size="28" font-weight="800" fill="#0d9488" letter-spacing="8">
        PRO
      </text>
      <line x1="235" y1="-7" x2="355" y2="-7" stroke="#0d9488" stroke-width="3" stroke-linecap="round" />
    </g>
  </g>
</svg>`;

async function build() {
  console.log('Writing public/icon.svg...');
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), emblemSvg, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), emblemSvg, 'utf-8');

  console.log('Writing public/metaslim-logo.svg...');
  fs.writeFileSync(path.join(publicDir, 'metaslim-logo.svg'), fullLogoSvg, 'utf-8');

  const emblemBuffer = Buffer.from(emblemSvg);
  const fullLogoBuffer = Buffer.from(fullLogoSvg);

  // 1. Favicon & PWA Icons
  console.log('Rendering apple-touch-icon.png (180x180)...');
  await sharp(emblemBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('Rendering pwa-192x192.png...');
  await sharp(emblemBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  console.log('Rendering pwa-512x512.png...');
  await sharp(emblemBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  console.log('Rendering pwa-maskable-512x512.png...');
  await sharp(emblemBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  console.log('Rendering metaslim-logo.png...');
  await sharp(fullLogoBuffer)
    .resize(640, 180)
    .png()
    .toFile(path.join(publicDir, 'metaslim-logo.png'));

  console.log('All official MetaSlim Pro brand assets generated successfully!');
}

build().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
