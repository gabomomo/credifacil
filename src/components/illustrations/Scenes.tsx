/**
 * Ilustraciones planas de Credifácil.
 * Estilo: formas geométricas suaves, paleta de marca (azul + verde + sol + coral),
 * sin dependencias externas. Editables y escalables.
 *
 * Paleta usada:
 *   brand  #5c72cf / #889fe4 / #e7edfc / #4b5eb0
 *   accent #259a73 / #86d6b6 / #d6f2e6
 *   sun    #fbbf24 / #fde68a / #fef3c7
 *   coral  #fb7185 / #ffe4e6
 *   ink    #0f172a   crema #fff7ed
 */

type SceneProps = { className?: string };

/** Fondo tipo blob suave compartido por las escenas. */
function Backdrop({ fill = "#e7edfc" }: { fill?: string }) {
  return (
    <path
      d="M240 24c78-8 154 22 186 92 30 66 8 150-44 196-54 48-152 60-224 36C86 324 30 268 22 196 14 120 60 52 132 32c34-9 72-5 108-8z"
      fill={fill}
    />
  );
}

/** Asesor amigable con audífonos, globo de chat y moneda. */
export function AdvisorScene({ className }: SceneProps) {
  return (
    <svg viewBox="0 0 480 380" className={className} role="img" aria-label="Asesor de Credifácil acompañándote">
      <Backdrop fill="#e7edfc" />
      {/* Globo de chat con check */}
      <g>
        <rect x="300" y="70" width="120" height="82" rx="22" fill="#ffffff" />
        <path d="M330 150l-6 26 30-20z" fill="#ffffff" />
        <circle cx="360" cy="111" r="24" fill="#259a73" />
        <path d="M350 111l7 8 14-16" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      {/* Cuerpo / hombros */}
      <path d="M150 356c0-52 42-92 94-92s94 40 94 92z" fill="#5c72cf" />
      <path d="M150 356c0-52 42-92 94-92 10 0 20 2 29 5-14 40-52 63-123 87z" fill="#4b5eb0" opacity="0.35" />
      {/* Cuello */}
      <rect x="228" y="214" width="32" height="40" rx="14" fill="#e8b48c" />
      {/* Cabeza */}
      <circle cx="244" cy="188" r="52" fill="#f3c9a3" />
      {/* Pelo */}
      <path d="M196 180c0-30 22-54 50-54s50 22 50 52c-10-16-28-24-50-24-18 0-34 8-44 22-3 2-6 4-6 4z" fill="#0f172a" />
      {/* Sonrisa + ojos */}
      <circle cx="228" cy="188" r="4.5" fill="#0f172a" />
      <circle cx="262" cy="188" r="4.5" fill="#0f172a" />
      <path d="M232 206c8 8 20 8 28 0" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      {/* Audífonos */}
      <path d="M190 190a54 54 0 0 1 108 0" stroke="#0f172a" strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="182" y="184" width="18" height="30" rx="8" fill="#fb7185" />
      <rect x="288" y="184" width="18" height="30" rx="8" fill="#fb7185" />
      <path d="M297 210c8 6 8 20-4 26" stroke="#0f172a" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* Moneda flotante */}
      <g>
        <circle cx="86" cy="150" r="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="4" />
        <text x="86" y="161" textAnchor="middle" fontSize="28" fontWeight="800" fill="#b45309">₡</text>
      </g>
      {/* Destellos */}
      <path d="M400 220c1 8 8 15 16 16-8 1-15 8-16 16-1-8-8-15-16-16 8-1 15-8 16-16z" fill="#fbbf24" />
      <path d="M120 300c1 6 6 11 12 12-6 1-11 6-12 12-1-6-6-11-12-12 6-1 11-6 12-12z" fill="#86d6b6" />
    </svg>
  );
}

/** Casa (crédito hipotecario). */
export function HouseScene({ className }: SceneProps) {
  return (
    <svg viewBox="0 0 480 380" className={className} role="img" aria-label="Crédito para tu casa">
      <Backdrop fill="#d6f2e6" />
      {/* Sol */}
      <circle cx="378" cy="96" r="34" fill="#fbbf24" />
      <g stroke="#fbbf24" strokeWidth="6" strokeLinecap="round">
        <path d="M378 40v-14M424 96h14M336 54l-10-10M420 54l10-10" />
      </g>
      {/* Suelo */}
      <path d="M70 300h340" stroke="#259a73" strokeWidth="8" strokeLinecap="round" />
      {/* Casa */}
      <rect x="150" y="196" width="180" height="108" rx="10" fill="#ffffff" />
      <path d="M138 200l102-74 102 74z" fill="#5c72cf" />
      <path d="M240 126l102 74h-20l-82-60-82 60h-20z" fill="#4b5eb0" />
      {/* Puerta */}
      <rect x="222" y="240" width="40" height="64" rx="8" fill="#259a73" />
      <circle cx="253" cy="274" r="4" fill="#ffffff" />
      {/* Ventana */}
      <rect x="168" y="222" width="42" height="42" rx="8" fill="#fde68a" />
      <path d="M189 222v42M168 243h42" stroke="#f59e0b" strokeWidth="4" />
      {/* Chimenea */}
      <rect x="300" y="150" width="22" height="40" rx="4" fill="#fb7185" />
      {/* Arbolito */}
      <rect x="360" y="256" width="12" height="48" rx="6" fill="#4b5eb0" opacity="0.5" />
      <circle cx="366" cy="250" r="26" fill="#259a73" />
      <circle cx="350" cy="262" r="18" fill="#86d6b6" />
      {/* Corazón */}
      <path d="M240 208c-6-8-20-6-20 6 0 8 12 16 20 22 8-6 20-14 20-22 0-12-14-14-20-6z" fill="#fb7185" />
      {/* Moneda */}
      <g>
        <circle cx="98" cy="212" r="28" fill="#fbbf24" stroke="#f59e0b" strokeWidth="4" />
        <text x="98" y="222" textAnchor="middle" fontSize="26" fontWeight="800" fill="#b45309">₡</text>
      </g>
    </svg>
  );
}

/** Billetera con tarjeta y monedas (crédito personal). */
export function WalletScene({ className }: SceneProps) {
  return (
    <svg viewBox="0 0 480 380" className={className} role="img" aria-label="Crédito personal">
      <Backdrop fill="#fef3c7" />
      {/* Monedas apiladas */}
      <g>
        <ellipse cx="120" cy="292" rx="46" ry="16" fill="#f59e0b" />
        <rect x="74" y="262" width="92" height="30" fill="#fbbf24" />
        <ellipse cx="120" cy="262" rx="46" ry="16" fill="#fde68a" />
        <rect x="74" y="234" width="92" height="28" fill="#fbbf24" />
        <ellipse cx="120" cy="234" rx="46" ry="16" fill="#fde68a" />
        <text x="120" y="244" textAnchor="middle" fontSize="24" fontWeight="800" fill="#b45309">₡</text>
      </g>
      {/* Tarjeta saliendo */}
      <g transform="rotate(-12 300 150)">
        <rect x="230" y="110" width="150" height="94" rx="14" fill="#259a73" />
        <rect x="230" y="132" width="150" height="18" fill="#1a5642" />
        <rect x="246" y="170" width="46" height="12" rx="6" fill="#d6f2e6" />
        <circle cx="352" cy="182" r="12" fill="#86d6b6" />
      </g>
      {/* Billetera */}
      <rect x="196" y="200" width="200" height="128" rx="20" fill="#5c72cf" />
      <path d="M196 236h200v92a20 20 0 0 1-20 20H216a20 20 0 0 1-20-20z" fill="#4b5eb0" />
      <rect x="320" y="262" width="90" height="44" rx="12" fill="#e7edfc" />
      <circle cx="352" cy="284" r="12" fill="#5c72cf" />
      {/* Destellos */}
      <path d="M410 150c1 8 8 15 16 16-8 1-15 8-16 16-1-8-8-15-16-16 8-1 15-8 16-16z" fill="#fb7185" />
    </svg>
  );
}

/** Carro (crédito de vehículo). */
export function CarScene({ className }: SceneProps) {
  return (
    <svg viewBox="0 0 480 380" className={className} role="img" aria-label="Crédito de vehículo">
      <Backdrop fill="#e7edfc" />
      {/* Camino */}
      <path d="M56 320h368" stroke="#4b5eb0" strokeWidth="10" strokeLinecap="round" opacity="0.35" />
      <path d="M120 320h44M212 320h44M304 320h44" stroke="#fde68a" strokeWidth="8" strokeLinecap="round" />
      {/* Carrocería */}
      <path d="M96 286V236c0-14 10-24 24-24h56l40-44c8-8 18-12 30-12h56c16 0 30 8 38 22l26 44h20c14 0 24 10 24 24v40z" fill="#5c72cf" />
      <path d="M204 168h44c10 0 20 6 24 16l18 32H186z" fill="#86d6b6" />
      <path d="M150 176c4-5 10-8 18-8h20v48h-74z" fill="#fde68a" />
      {/* Franja */}
      <rect x="96" y="260" width="330" height="14" fill="#4b5eb0" />
      {/* Ruedas */}
      <circle cx="162" cy="290" r="34" fill="#0f172a" />
      <circle cx="162" cy="290" r="15" fill="#e7edfc" />
      <circle cx="342" cy="290" r="34" fill="#0f172a" />
      <circle cx="342" cy="290" r="15" fill="#e7edfc" />
      {/* Faro */}
      <rect x="410" y="236" width="18" height="16" rx="6" fill="#fbbf24" />
      {/* Destellos */}
      <path d="M100 150c1 8 8 15 16 16-8 1-15 8-16 16-1-8-8-15-16-16 8-1 15-8 16-16z" fill="#fbbf24" />
      <circle cx="380" cy="150" r="9" fill="#fb7185" />
    </svg>
  );
}

/** Negocio en crecimiento (crédito pyme / empresa). */
export function BusinessScene({ className }: SceneProps) {
  return (
    <svg viewBox="0 0 480 380" className={className} role="img" aria-label="Crédito para tu negocio">
      <Backdrop fill="#ffe4e6" />
      {/* Base */}
      <path d="M70 320h340" stroke="#fb7185" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
      {/* Barras de crecimiento */}
      <rect x="120" y="236" width="52" height="84" rx="10" fill="#889fe4" />
      <rect x="188" y="196" width="52" height="124" rx="10" fill="#5c72cf" />
      <rect x="256" y="156" width="52" height="164" rx="10" fill="#259a73" />
      <rect x="324" y="116" width="52" height="204" rx="10" fill="#fbbf24" />
      {/* Flecha ascendente */}
      <path d="M120 250l84-54 62 24 96-92" stroke="#0f172a" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M340 108h30v30" stroke="#0f172a" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Moneda */}
      <g>
        <circle cx="96" cy="150" r="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="4" />
        <text x="96" y="161" textAnchor="middle" fontSize="28" fontWeight="800" fill="#b45309">₡</text>
      </g>
      {/* Destello */}
      <path d="M406 210c1 8 8 15 16 16-8 1-15 8-16 16-1-8-8-15-16-16 8-1 15-8 16-16z" fill="#259a73" />
    </svg>
  );
}

/** Mapa slug de producto -> escena. */
export const productScenes = {
  hipotecario: HouseScene,
  personal: WalletScene,
  vehiculo: CarScene,
  pyme: BusinessScene,
} as const;
