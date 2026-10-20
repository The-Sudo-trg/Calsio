const PRODUCTS = [
  { slug: 'stepone-court-sneaker-ivory', name: 'StepOne Court Sneaker (Ivory)', price: 2499, mrp: 3499, category: 'SNEAKERS' },
  { slug: 'regal-loafer-tan', name: 'Regal Loafer (Tan)', price: 2799, mrp: 3699, category: 'LOAFERS' },
  { slug: 'agrabad-sandal-raag-brown', name: 'Agrabad Sandal (Raag Brown)', price: 1499, mrp: 2199, category: 'SANDALS' },
  { slug: 'metro-formal-oxford-onyx', name: 'Metro Formal Oxford (Onyx)', price: 4499, mrp: 5999, category: 'FORMAL' },
  { slug: 'ghoomar-strap-sandal-maroon', name: 'Ghoomar Strap Sandal (Maroon)', price: 1799, mrp: 2399, category: 'SANDALS' },
  { slug: 'tara-runner-blush', name: 'Tara Runner (Blush)', price: 2199, mrp: 2999, category: 'SNEAKERS' },
  { slug: 'durbar-monk-strap-black', name: 'Durbar Monk Strap (Black)', price: 4499, mrp: 5499, category: 'FORMAL' },
  { slug: 'nawabi-slide-olive', name: 'Nawabi Slide (Olive)', price: 1299, mrp: 1899, category: 'SANDALS' },
] as const;

export default function ApiHome() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: 4, margin: '0 0 8px' }}>
        CALSIO
      </h1>
      <p style={{ marginTop: 0, color: '#C4552D', fontWeight: 600 }}>
        Agra se. Aapke kadmon tak.
      </p>
      <p style={{ lineHeight: 1.6 }}>
        Backend API for the CALSIO native app. Phase 1 shell — core commerce endpoints
        (catalog, checkout, OTP) arrive in Phase 2; AI endpoints in Phase 3.
      </p>
      <ul>
        <li>
          <a href="/api/health">/api/health</a> — service heartbeat
        </li>
      </ul>
      <p style={{ color: '#1F7A4D', fontWeight: 600 }}>
        Library status: {PRODUCTS.length} flagship products staged for seed.
      </p>
    </main>
  );
}
