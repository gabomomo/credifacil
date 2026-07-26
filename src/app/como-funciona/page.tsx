import type { Metadata } from "next";
import { Calculator, GitCompareArrows, FileCheck2, Handshake, ShieldCheck, HandCoins, Clock } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { CtaBanner } from "@/components/home/CtaBanner";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description:
    "Así te ayuda Credifácil a comparar y conseguir tu crédito en Costa Rica: simula, compara, solicita y recibe asesoría gratis.",
};

const steps = [
  {
    icon: Calculator,
    title: "1. Simula tu crédito",
    text: "Usa el simulador para estimar tu cuota según el monto y el plazo que necesitas. Es gratis y no pedimos datos personales para simular.",
  },
  {
    icon: GitCompareArrows,
    title: "2. Comparamos por vos",
    text: "Analizamos las condiciones de bancos, cooperativas y mutuales y te presentamos las opciones que mejor se ajustan a tu perfil.",
  },
  {
    icon: FileCheck2,
    title: "3. Preparamos tu solicitud",
    text: "Te decimos exactamente qué documentos necesitas y te ayudamos a ordenarlos para que tu solicitud tenga la mejor oportunidad de aprobación.",
  },
  {
    icon: Handshake,
    title: "4. Te acompañamos hasta la firma",
    text: "Un asesor te guía en cada paso del proceso con la institución elegida, resolviendo tus dudas hasta que firmes tu crédito.",
  },
];

const benefits = [
  { icon: HandCoins, title: "100% gratis", text: "Nuestra asesoría y comparación no tienen costo para vos." },
  { icon: Clock, title: "Ahorras tiempo", text: "Un solo trámite en lugar de visitar banco por banco." },
  { icon: ShieldCheck, title: "Sin compromiso", text: "Comparas y decides con libertad, sin presión de venta." },
];

export default function ComoFuncionaPage() {
  return (
    <div>
      <section className="bg-mist py-16">
        <div className="container-x max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Cómo funciona
          </span>
          <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">
            Conseguir tu crédito nunca fue tan simple
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">
            Hacemos el trabajo pesado de comparar por vos, para que tomes la mejor decisión
            con toda la información clara.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl space-y-6">
            {steps.map((s) => (
              <div
                key={s.title}
                className="flex gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8"
              >
                <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
                  <s.icon className="size-7" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold text-ink">{s.title}</h2>
                  <p className="mt-2 leading-relaxed text-ink-soft">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mist py-16 sm:py-20">
        <div className="container-x">
          <div className="grid gap-6 sm:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-soft">
                <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-accent-100 text-accent-600">
                  <b.icon className="size-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{b.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{b.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <ButtonLink href="/simulador" size="lg">
              Empezar mi simulación
            </ButtonLink>
          </div>
        </div>
      </section>

      <div className="pt-4">
        <CtaBanner />
      </div>
    </div>
  );
}
