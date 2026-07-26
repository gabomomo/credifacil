import { cn } from "@/lib/cn";

interface Props {
  className?: string;
  /** Usa blanco para fondos oscuros */
  variant?: "color" | "white";
}

/**
 * Logo de Credifácil — marca de texto + isotipo.
 * Isotipo: dos trazos que forman una "C" ascendente (crecimiento/aprobación).
 * Placeholder editable: reemplazar por el logo oficial cuando esté disponible.
 */
export function Logo({ className, variant = "color" }: Props) {
  const isWhite = variant === "white";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          width="40"
          height="40"
          rx="12"
          fill={isWhite ? "rgba(255,255,255,0.14)" : "url(#cf-grad)"}
        />
        {/* Arco tipo "C" abierta + flecha de crecimiento */}
        <path
          d="M27 13.5A9 9 0 1 0 27 26.5"
          stroke={isWhite ? "#fff" : "#fff"}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M22 20l4-4m0 0h-4m4 0v4"
          stroke={isWhite ? "#fff" : "#b0e6d0"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="cf-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5c72cf" />
            <stop offset="1" stopColor="#259a73" />
          </linearGradient>
        </defs>
      </svg>
      <span
        className={cn(
          "font-display text-xl font-extrabold tracking-tight",
          isWhite ? "text-white" : "text-ink",
        )}
      >
        Credi<span className={isWhite ? "text-accent-300" : "text-brand-600"}>fácil</span>
      </span>
    </span>
  );
}
