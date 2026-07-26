import { Calculator, GitCompareArrows, FileCheck2, Handshake } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    icon: Calculator,
    title: "Simula",
    text: "Elige el tipo de crédito, el monto y el plazo. En segundos ves tu cuota estimada.",
    color: "bg-brand-600",
    ring: "text-brand-100",
  },
  {
    icon: GitCompareArrows,
    title: "Compara",
    text: "Te mostramos las opciones de bancos y cooperativas para que elijas con claridad.",
    color: "bg-accent-500",
    ring: "text-accent-100",
  },
  {
    icon: FileCheck2,
    title: "Solicita",
    text: "Reúnes tus documentos con nuestra guía y enviamos tu solicitud a la institución.",
    color: "bg-sun-400",
    ring: "text-sun-100",
  },
  {
    icon: Handshake,
    title: "¡Y a firmar!",
    text: "Un asesor te acompaña gratis, sin compromiso, hasta la firma de tu crédito.",
    color: "bg-coral-400",
    ring: "text-coral-100",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-mist py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Cómo funciona"
          title="Tu crédito en 4 pasos (y sin dolores de cabeza)"
          description="Sin filas, sin ir de banco en banco y sin que te cueste un cinco."
        />

        <div className="relative mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Línea punteada conectora en desktop */}
          <div
            className="pointer-events-none absolute inset-x-0 top-16 hidden border-t-2 border-dashed border-slate-300 lg:block"
            aria-hidden="true"
          />
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="group relative h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition-transform hover:-translate-y-1">
                <span className="absolute right-5 top-5 font-hand text-5xl font-bold text-slate-200">
                  {i + 1}
                </span>
                <span
                  className={`inline-flex size-14 items-center justify-center rounded-2xl ${s.color} text-white shadow-md transition-transform group-hover:rotate-6`}
                >
                  <s.icon className="size-7" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
