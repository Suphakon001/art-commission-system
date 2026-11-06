// backend/src/sampleArtworks.js
// High-aesthetic, crisp SVG vector artworks encoded as base64 data URLs

function createArtSvg(type, title) {
  let svg = '';
  if (type === 'samurai') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      <defs>
        <radialGradient id="bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#090d16" />
        </radialGradient>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
        <linearGradient id="neon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#818cf8" />
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#bg)" />
      <!-- Moon -->
      <circle cx="400" cy="300" r="160" fill="url(#gold)" opacity="0.85" filter="drop-shadow(0 0 40px #f59e0b)" />
      <!-- Cyber Grid Lines -->
      <path d="M 100 700 L 700 700 M 150 740 L 650 740 M 200 770 L 600 770" stroke="#334155" stroke-width="2" opacity="0.5" />
      <!-- Silhouette Warrior / Cyber Samurai -->
      <path d="M 400 240 Q 420 220 400 190 Q 380 220 400 240 Z" fill="#0f172a" />
      <polygon points="340,320 460,320 440,260 360,260" fill="#0f172a" />
      <polygon points="320,440 480,440 460,320 340,320" fill="#1e293b" stroke="url(#neon)" stroke-width="2" />
      <!-- Katana Blade -->
      <path d="M 280 200 L 520 540" stroke="url(#neon)" stroke-width="6" stroke-linecap="round" filter="drop-shadow(0 0 12px #38bdf8)" />
      <path d="M 270 190 L 310 240" stroke="url(#gold)" stroke-width="8" stroke-linecap="round" />
      <!-- Typography Accent -->
      <text x="400" y="680" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="28" text-anchor="middle" letter-spacing="4">NEON RONIN · CYBER NOIR</text>
      <text x="400" y="715" fill="#94a3b8" font-family="'Noto Sans Thai', sans-serif" font-size="14" text-anchor="middle">ภาพลายเส้นและภาพประกอบระดับพรีเมียม 4K</text>
    </svg>`;
  } else if (type === 'botanical') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      <defs>
        <radialGradient id="bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#14211b" />
          <stop offset="100%" stop-color="#06100d" />
        </radialGradient>
        <linearGradient id="emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#34d399" />
          <stop offset="100%" stop-color="#059669" />
        </linearGradient>
        <linearGradient id="warmGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#bg)" />
      <!-- Subtle Golden Ring -->
      <circle cx="400" cy="380" r="220" fill="none" stroke="url(#warmGold)" stroke-width="2" opacity="0.4" stroke-dasharray="8 6" />
      <circle cx="400" cy="380" r="180" fill="#062e22" opacity="0.4" />
      <!-- Botanical Leaves -->
      <path d="M 400 180 Q 480 260 400 380 Q 320 260 400 180 Z" fill="url(#emerald)" opacity="0.9" />
      <path d="M 400 240 Q 300 320 380 440 Q 420 340 400 240 Z" fill="#10b981" opacity="0.8" />
      <path d="M 400 240 Q 500 320 420 440 Q 380 340 400 240 Z" fill="#059669" opacity="0.8" />
      <!-- Gold accents -->
      <circle cx="400" cy="380" r="16" fill="url(#warmGold)" filter="drop-shadow(0 0 10px #f59e0b)" />
      <!-- Stems -->
      <path d="M 400 380 L 400 580" stroke="url(#warmGold)" stroke-width="4" stroke-linecap="round" />
      <text x="400" y="680" fill="#ecfdf5" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="28" text-anchor="middle" letter-spacing="4">MOONLIT BOTANICA</text>
      <text x="400" y="715" fill="#6ee7b7" font-family="'Noto Sans Thai', sans-serif" font-size="14" text-anchor="middle">งานจิตรกรรมพฤกษศาสตร์ร่วมสมัย</text>
    </svg>`;
  } else if (type === 'fantasy') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      <defs>
        <radialGradient id="bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#2d1537" />
          <stop offset="100%" stop-color="#0a0512" />
        </radialGradient>
        <linearGradient id="aurora" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f43f5e" />
          <stop offset="50%" stop-color="#a855f7" />
          <stop offset="100%" stop-color="#6366f1" />
        </linearGradient>
        <linearGradient id="goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fffbeb" />
          <stop offset="100%" stop-color="#fbbf24" />
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#bg)" />
      <!-- Mystic Halo -->
      <circle cx="400" cy="330" r="190" fill="none" stroke="url(#goldLight)" stroke-width="3" opacity="0.6" />
      <circle cx="400" cy="330" r="140" fill="url(#aurora)" opacity="0.25" filter="blur(20px)" />
      <!-- Star polygon -->
      <polygon points="400,160 435,275 550,285 460,355 490,470 400,405 310,470 340,355 250,285 365,275" fill="none" stroke="url(#goldLight)" stroke-width="2" opacity="0.7" />
      <circle cx="400" cy="330" r="28" fill="url(#goldLight)" filter="drop-shadow(0 0 20px #fbbf24)" />
      <text x="400" y="680" fill="#fdf4ff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="28" text-anchor="middle" letter-spacing="4">CELESTIAL GUARDIAN</text>
      <text x="400" y="715" fill="#d8b4fe" font-family="'Noto Sans Thai', sans-serif" font-size="14" text-anchor="middle">ภาพคาแรคเตอร์ดีไซน์และภาพประกอบแฟนตาซี</text>
    </svg>`;
  } else {
    // Elegant Minimalist Chibi Studio
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      <defs>
        <radialGradient id="bg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#2a241b" />
          <stop offset="100%" stop-color="#0f0c08" />
        </radialGradient>
        <linearGradient id="warmAmber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef3c7" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#bg)" />
      <!-- Coffee Steam & Cup Aesthetic -->
      <ellipse cx="400" cy="460" rx="140" ry="30" fill="#000" opacity="0.4" />
      <rect x="300" y="300" width="200" height="150" rx="40" fill="#1c1917" stroke="url(#warmAmber)" stroke-width="3" />
      <path d="M 500 340 C 550 340 550 420 500 420" fill="none" stroke="url(#warmAmber)" stroke-width="6" stroke-linecap="round" />
      <!-- Cat ears on cup -->
      <polygon points="320,300 350,240 370,300" fill="url(#warmAmber)" />
      <polygon points="430,300 450,240 480,300" fill="url(#warmAmber)" />
      <!-- Steam curves -->
      <path d="M 360 210 Q 380 160 360 120" fill="none" stroke="url(#warmAmber)" stroke-width="3" stroke-linecap="round" opacity="0.6" />
      <path d="M 400 220 Q 420 170 400 130" fill="none" stroke="url(#warmAmber)" stroke-width="4" stroke-linecap="round" opacity="0.8" />
      <path d="M 440 210 Q 460 160 440 120" fill="none" stroke="url(#warmAmber)" stroke-width="3" stroke-linecap="round" opacity="0.6" />
      <text x="400" y="680" fill="#fef3c7" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="28" text-anchor="middle" letter-spacing="4">ARTISAN CAFE · CHIBI</text>
      <text x="400" y="715" fill="#fde68a" font-family="'Noto Sans Thai', sans-serif" font-size="14" text-anchor="middle">ภาพประกอบจิบิน่ารัก คอนเซปต์คาเฟ่</text>
    </svg>`;
  }
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

module.exports = { createArtSvg };

