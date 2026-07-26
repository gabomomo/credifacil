import { Star, Quote } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const testimonials = [
  {
    name: "María José R.",
    role: "Compró su primera casa",
    initials: "MJ",
    color: "#5c72cf",
    text: "Estaba perdida entre tanto banco. En Credifácil me compararon todo y me explicaron con peras y manzanas. Firmé mi hipoteca sin estrés.",
  },
  {
    name: "Carlos M.",
    role: "Consolidó sus deudas",
    initials: "CM",
    color: "#259a73",
    text: "Tenía tres tarjetas ahogándome. Me ayudaron a consolidar en un solo crédito con una cuota mucho más baja. Mil gracias.",
  },
  {
    name: "Andrea S.",
    role: "Financió su vehículo",
    initials: "AS",
    color: "#f47920",
    text: "El simulador me dio una idea clara de la cuota antes de decidir. El asesor consiguió una tasa mejor de la que yo había visto por mi cuenta.",
  },
];

export function Testimonials() {
  return (
    <section className="bg-mist py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Testimonios"
          title="Ticos que ya lo lograron 🎉"
          description="Historias reales de personas que encontraron su crédito ideal con nuestra ayuda."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <figure className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-soft">
                <Quote className="size-8 text-brand-200" />
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="size-4 fill-accent-400 text-accent-400" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[0.975rem] leading-relaxed text-ink-soft">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <span
                    className="inline-flex size-11 items-center justify-center rounded-full font-display text-sm font-bold text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.initials}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{t.name}</span>
                    <span className="block text-sm text-slate-500">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Testimonios ilustrativos con fines de demostración.
        </p>
      </div>
    </section>
  );
}
