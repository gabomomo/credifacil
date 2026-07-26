import type { Institution } from "@/lib/institutions";
import { logoSrc } from "@/lib/logos";
import { cn } from "@/lib/cn";

/**
 * Logo de institución. Si existe /public/logos/<key>.svg|png se muestra ese logo
 * (sobre fondo blanco). Si no, se usa el monograma de color como respaldo.
 */
export function InstitutionLogo({
  institution,
  className,
}: {
  institution: Institution;
  className?: string;
}) {
  const src = logoSrc(institution.key);

  if (src) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200",
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={institution.name}
          className="size-full object-contain p-1.5"
          loading="lazy"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-display font-bold text-white select-none",
        className,
      )}
      style={{ backgroundColor: institution.color }}
      aria-hidden="true"
    >
      {institution.monogram}
    </span>
  );
}
