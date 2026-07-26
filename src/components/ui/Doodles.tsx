import { cn } from "@/lib/cn";

/** Subrayado dibujado a mano para resaltar una palabra. */
export function Squiggle({ className }: { className?: string }) {
  return (
    <svg
      className={cn("absolute left-0 -bottom-2 w-full", className)}
      viewBox="0 0 300 18"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M3 12C60 4 120 4 160 8c40 4 90 6 137-2"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Destello / brillo tipo sparkle. */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 0c.7 5.4 5.9 10.6 11.3 11.3v1.4C17.9 13.4 12.7 18.6 12 24h-1.4C9.9 18.6 4.7 13.4 -0.7 12.7v-1.4C4.7 10.6 9.9 5.4 10.6 0H12z" />
    </svg>
  );
}

/** Estrella redondeada de 4 puntas. */
export function Star4({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 1c.5 5.5 5 10 10.5 10.5v1C17 13 12.5 17.5 12 23h-1C10.5 17.5 6 13 .5 12.5v-1C6 11 10.5 6.5 11 1h1z" />
    </svg>
  );
}

/** Moneda flotante (₡). */
export function Coin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      <circle cx="24" cy="24" r="22" fill="#fcd34d" />
      <circle cx="24" cy="24" r="22" stroke="#f59e0b" strokeWidth="3" />
      <circle cx="24" cy="24" r="16" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2 3" opacity="0.6" />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fontSize="20"
        fontWeight="800"
        fill="#b45309"
        fontFamily="var(--font-display)"
      >
        ₡
      </text>
    </svg>
  );
}

/** Flechita curva dibujada a mano. */
export function CurvyArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <path
        d="M8 12c18 0 34 8 40 26"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M38 34c4 2 8 3 12 4M48 46c1-4 2-8 2-12"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Notita manuscrita rotada, tipo sticker.
 * Ideal para frases con chispa: "¡100% gratis!".
 */
export function HandNote({
  children,
  className,
  rotate = "-6deg",
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: string;
}) {
  return (
    <span
      className={cn("font-hand text-2xl leading-none", className)}
      style={{ display: "inline-block", transform: `rotate(${rotate})` }}
    >
      {children}
    </span>
  );
}
