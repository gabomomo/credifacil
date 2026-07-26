import { Check, X } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const rows = [
  "Comparas todas las instituciones en un solo lugar",
  "Simulas tu cuota antes de comprometerte",
  "Asesoría personalizada y gratuita",
  "Te ayudamos a ordenar y preparar tus documentos",
  "Ahorras tiempo: sin filas ni visitas a cada banco",
  "Sin costo ni compromiso para vos",
];

export function Comparison() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Por qué Credifácil"
          title="Con nosotros vs. por tu cuenta 🤔"
          description="Buscar crédito banco por banco es lento y confuso. Nosotros hacemos el trabajo aburrido por vos."
        />

        <div className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-3xl border border-slate-200 shadow-soft">
          <div className="grid grid-cols-[1fr_auto_auto] items-stretch">
            {/* Encabezado */}
            <div className="bg-white p-5" />
            <div className="flex items-center justify-center bg-brand-600 px-6 py-5 text-center">
              <span className="font-display text-sm font-bold text-white sm:text-base">
                Con Credifácil
              </span>
            </div>
            <div className="flex items-center justify-center bg-slate-100 px-6 py-5 text-center">
              <span className="font-display text-sm font-bold text-ink-soft sm:text-base">
                Por tu cuenta
              </span>
            </div>

            {/* Filas */}
            {rows.map((row, i) => (
              <div key={row} className="contents">
                <div
                  className={`flex items-center p-5 text-sm font-medium text-ink sm:text-base ${
                    i % 2 ? "bg-white" : "bg-mist"
                  }`}
                >
                  {row}
                </div>
                <div
                  className={`flex items-center justify-center px-6 ${
                    i % 2 ? "bg-brand-50/60" : "bg-brand-50"
                  }`}
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-accent-500 text-white">
                    <Check className="size-5" strokeWidth={3} />
                  </span>
                </div>
                <div
                  className={`flex items-center justify-center px-6 ${
                    i % 2 ? "bg-white" : "bg-mist"
                  }`}
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                    <X className="size-5" strokeWidth={3} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
