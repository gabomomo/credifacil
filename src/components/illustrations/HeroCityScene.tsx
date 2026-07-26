/**
 * Escena panorámica de ciudad + parque para el hero de la Home.
 * Estilo plano en la paleta de Credifácil (azul + verde + sol + coral).
 * Pensada para anclarse al fondo, a lo ancho, detrás del contenido.
 */

type Props = { className?: string };

/** Grilla de ventanas para un edificio. */
function Windows({
  x,
  y,
  w,
  h,
  cols,
  rows,
  fill = "#fde68a",
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  cols: number;
  rows: number;
  fill?: string;
}) {
  const gapX = w / cols;
  const gapY = h / rows;
  const ww = gapX * 0.5;
  const wh = gapY * 0.5;
  const rects = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rects.push(
        <rect
          key={`${r}-${c}`}
          x={x + gapX * c + (gapX - ww) / 2}
          y={y + gapY * r + (gapY - wh) / 2}
          width={ww}
          height={wh}
          rx={1.5}
          fill={fill}
          opacity={0.85}
        />,
      );
    }
  }
  return <g>{rects}</g>;
}

export function HeroCityScene({ className }: Props) {
  return (
    <svg
      viewBox="0 0 1440 560"
      className={className}
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="Ilustración de una ciudad con un parque, personas caminando y en bicicleta"
    >
      {/* Nubes */}
      <g fill="#ffffff">
        <g opacity="0.95">
          <circle cx="240" cy="90" r="26" />
          <circle cx="278" cy="90" r="34" />
          <circle cx="320" cy="92" r="24" />
          <rect x="238" y="90" width="86" height="26" rx="13" />
        </g>
        <g opacity="0.9">
          <circle cx="1040" cy="70" r="22" />
          <circle cx="1072" cy="70" r="30" />
          <circle cx="1106" cy="72" r="20" />
          <rect x="1038" y="72" width="70" height="22" rx="11" />
        </g>
      </g>

      {/* Aves */}
      <g stroke="#5c72cf" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.75">
        <path d="M150 150c8-9 16-9 24 0M174 150c8-9 16-9 24 0" />
        <path d="M980 130c7-8 14-8 21 0M1001 130c7-8 14-8 21 0" />
      </g>

      {/* ====== SKYLINE (base en y=470) ====== */}
      {/* Torre piramidal */}
      <path d="M60 470L150 150l90 320z" fill="#6d84d8" />
      <path d="M150 150l90 320h-40l-50-260z" fill="#5c72cf" opacity="0.55" />

      {/* Edificios */}
      <g>
        <rect x="230" y="250" width="70" height="220" fill="#4b5eb0" />
        <Windows x={230} y={262} w={70} h={200} cols={2} rows={7} />

        <rect x="305" y="205" width="86" height="265" fill="#1f8362" />
        <Windows x={305} y={218} w={86} h={240} cols={3} rows={8} fill="#d6f2e6" />

        <rect x="398" y="165" width="80" height="305" fill="#5c72cf" />
        <Windows x={398} y={178} w={80} h={280} cols={3} rows={9} />

        <rect x="486" y="300" width="70" height="170" fill="#cbd5e1" />
        <Windows x={486} y={312} w={70} h={150} cols={2} rows={5} fill="#f8fafc" />

        <rect x="565" y="230" width="104" height="240" fill="#889fe4" />
        <Windows x={565} y={244} w={104} h={214} cols={4} rows={7} />

        <rect x="676" y="285" width="78" height="185" fill="#1b6b51" />
        <Windows x={676} y={298} w={78} h={162} cols={3} rows={5} fill="#d6f2e6" />

        <rect x="845" y="195" width="66" height="275" fill="#364475" />
        <Windows x={845} y={208} w={66} h={250} cols={2} rows={8} />

        <rect x="915" y="255" width="110" height="215" fill="#94a3b8" />
        <Windows x={915} y={268} w={110} h={190} cols={4} rows={6} fill="#f1f5f9" />

        <rect x="1030" y="210" width="80" height="260" fill="#5c72cf" />
        <Windows x={1030} y={224} w={80} h={234} cols={3} rows={8} />

        <rect x="1300" y="280" width="90" height="190" fill="#6d84d8" />
        <Windows x={1300} y={292} w={90} h={168} cols={3} rows={6} />
      </g>

      {/* Edificio clásico amarillo (der.) */}
      <g>
        <rect x="1120" y="245" width="180" height="225" fill="#fbbf24" />
        <rect x="1110" y="235" width="200" height="18" rx="4" fill="#f59e0b" />
        {/* Arcos */}
        <g fill="#fef3c7">
          <path d="M1140 470v-90a20 20 0 0 1 40 0v90z" />
          <path d="M1200 470v-90a20 20 0 0 1 40 0v90z" />
          <path d="M1260 470v-90a20 20 0 0 1 30 0v90z" />
        </g>
        <rect x="1150" y="270" width="120" height="14" rx="4" fill="#f59e0b" opacity="0.7" />
      </g>

      {/* Farola */}
      <g>
        <rect x="792" y="235" width="10" height="255" rx="4" fill="#4b5eb0" />
        <rect x="770" y="225" width="54" height="26" rx="8" fill="#5c72cf" />
        <rect x="778" y="230" width="38" height="16" rx="5" fill="#fde68a" />
        <circle cx="797" cy="238" r="30" fill="#fbbf24" opacity="0.25" />
      </g>

      {/* ====== PARQUE ====== */}
      {/* Árboles (copas) */}
      <g>
        <rect x="404" y="404" width="12" height="70" rx="6" fill="#1a5642" />
        <circle cx="410" cy="398" r="40" fill="#259a73" />
        <circle cx="386" cy="410" r="26" fill="#5cc39c" />
        <circle cx="434" cy="410" r="26" fill="#1f8362" />

        <rect x="1046" y="410" width="12" height="70" rx="6" fill="#1a5642" />
        <circle cx="1052" cy="404" r="36" fill="#259a73" />
        <circle cx="1030" cy="416" r="24" fill="#86d6b6" />
        <circle cx="1074" cy="416" r="24" fill="#1f8362" />
      </g>

      {/* Césped / arbustos (varias capas) */}
      <path d="M0 470h1440v90H0z" fill="#5cc39c" />
      <g fill="#259a73">
        <ellipse cx="120" cy="470" rx="150" ry="46" />
        <ellipse cx="520" cy="472" rx="200" ry="50" />
        <ellipse cx="900" cy="470" rx="180" ry="44" />
        <ellipse cx="1300" cy="472" rx="200" ry="52" />
      </g>
      <g fill="#1f8362">
        <ellipse cx="300" cy="500" rx="220" ry="46" />
        <ellipse cx="760" cy="502" rx="240" ry="50" />
        <ellipse cx="1180" cy="500" rx="240" ry="48" />
      </g>
      <rect x="0" y="524" width="1440" height="40" fill="#1b6b51" />

      {/* ====== PERSONAS ====== */}
      {/* Ejecutivo caminando (izq.) */}
      <g>
        <path d="M92 470l-8 34M120 470l6 34" stroke="#364475" strokeWidth="11" strokeLinecap="round" />
        <path d="M96 420h22l6 52h-32z" fill="#5c72cf" />
        <rect x="86" y="452" width="14" height="30" rx="6" fill="#f3c9a3" />
        <rect x="76" y="470" width="20" height="16" rx="3" fill="#4b5eb0" />
        <circle cx="107" cy="404" r="16" fill="#f3c9a3" />
        <path d="M92 402a15 15 0 0 1 30 0z" fill="#0f172a" />
      </g>

      {/* Ciclista (centro) */}
      <g>
        <circle cx="602" cy="516" r="30" fill="none" stroke="#0f172a" strokeWidth="6" />
        <circle cx="690" cy="516" r="30" fill="none" stroke="#0f172a" strokeWidth="6" />
        <path d="M602 516l44-4 44 4M646 512v-30" stroke="#4b5eb0" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M624 486h44" stroke="#4b5eb0" strokeWidth="6" strokeLinecap="round" />
        <path d="M646 482l-14-40 30 6" fill="#fb7185" />
        <rect x="656" y="452" width="22" height="14" rx="4" fill="#5c72cf" transform="rotate(20 667 459)" />
        <circle cx="640" cy="428" r="14" fill="#f3c9a3" />
        <path d="M628 424a12 12 0 0 1 24 0z" fill="#7c2d12" />
        <path d="M632 442l-18 34M660 448l18 26" stroke="#5c72cf" strokeWidth="8" strokeLinecap="round" />
      </g>

      {/* Niño en patineta */}
      <g>
        <rect x="812" y="540" width="52" height="8" rx="4" fill="#f43f5e" />
        <circle cx="822" cy="552" r="6" fill="#0f172a" />
        <circle cx="854" cy="552" r="6" fill="#0f172a" />
        <path d="M832 512l4 28M844 512l2 28" stroke="#4b5eb0" strokeWidth="8" strokeLinecap="round" />
        <path d="M828 484h20l2 30h-24z" fill="#259a73" />
        <circle cx="838" cy="474" r="12" fill="#f3c9a3" />
        <path d="M827 472a11 11 0 0 1 22 0z" fill="#0f172a" />
      </g>

      {/* Persona paseando al perro (der.) */}
      <g>
        {/* Perro */}
        <path d="M1120 540c0-14 8-22 22-22h34c8 0 14 6 14 14v18h-8v-10h-48v10z" fill="#b45309" />
        <path d="M1176 522l16-8-4 14z" fill="#b45309" />
        <path d="M1128 540v10M1140 540v10M1170 540v10M1182 540v10" stroke="#b45309" strokeWidth="6" strokeLinecap="round" />
        <path d="M1120 530l-12 6" stroke="#b45309" strokeWidth="6" strokeLinecap="round" />
        {/* Correa */}
        <path d="M1188 512c20 4 34 10 44 18" stroke="#0f172a" strokeWidth="3" fill="none" />
        {/* Persona */}
        <path d="M1236 470l-6 40M1256 470l8 40" stroke="#334155" strokeWidth="11" strokeLinecap="round" />
        <path d="M1234 418h26l6 54h-38z" fill="#5c72cf" />
        <g stroke="#ffffff" strokeWidth="4">
          <path d="M1236 428h22M1236 438h24M1236 448h24" />
        </g>
        <rect x="1258" y="452" width="13" height="30" rx="6" fill="#f3c9a3" />
        <circle cx="1247" cy="402" r="16" fill="#f3c9a3" />
        <path d="M1231 400a16 16 0 0 1 32 0c0-4-32-4-32 0z" fill="#7c2d12" />
      </g>
    </svg>
  );
}
