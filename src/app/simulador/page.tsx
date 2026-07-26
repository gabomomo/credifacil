import type { Metadata } from "next";
import { CreditSimulator } from "@/components/simulator/CreditSimulator";
import { ButtonLink } from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Simulador de crédito",
  description:
    "Simula tu cuota mensual de crédito hipotecario, personal, de vehículo o para tu negocio en segundos. Gratis y sin compromiso.",
};

const points = [
  "Ajusta el monto y el plazo y ve tu cuota al instante",
  "Compara entre tipos de crédito",
  "Sin registro ni datos personales para simular",
];

export default function SimuladorPage() {
  return (
    <div className="bg-mist">
      <div className="container-x grid items-start gap-12 py-16 lg:grid-cols-2 lg:py-20">
        <div className="lg:sticky lg:top-28">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Simulador
          </span>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
            Calcula tu cuota <span className="text-gradient">en segundos</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
            Mueve los controles y descubre cuánto pagarías cada mes. Cuando estés listo,
            un asesor te ayuda a conseguir las mejores condiciones reales entre todas las
            instituciones.
          </p>

          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-ink">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent-500" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <ButtonLink href="/contacto" size="lg">
              Quiero asesoría gratis
            </ButtonLink>
          </div>
        </div>

        <CreditSimulator />
      </div>
    </div>
  );
}
