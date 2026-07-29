import type { Metadata } from "next";
import { CreditWizard } from "@/components/simulator/CreditWizard";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Simulador de crédito",
  description:
    "Simula tu cuota mensual de crédito hipotecario, personal, de vehículo o para tu negocio en cuatro pasos. Gratis y sin compromiso.",
};

const points = [
  "Cuatro pasos cortos: no toma ni dos minutos",
  "Ajusta el monto y el plazo y ve tu cuota al instante",
  "Te enviamos la simulación por correo si querés guardarla",
  "Un asesor retoma desde donde quedaste, sin volver a preguntarte todo",
];

export default function SimuladorPage() {
  return (
    <div className="bg-mist">
      {/*
       * La colocación explícita en la rejilla existe para el móvil: en una sola
       * columna el orden del DOM manda, así que el titular va primero, el
       * wizard enseguida y los argumentos de apoyo al final. Sin esto, el
       * visitante en móvil tenía que recorrer toda la columna de texto antes
       * de llegar al primer campo.
       */}
      <div className="container-x grid items-start gap-x-12 gap-y-10 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:py-20">
        <div className="lg:col-start-1 lg:row-start-1">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Simulador
          </span>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
            Calcula tu cuota <span className="text-gradient">en segundos</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
            Contanos qué necesitas y en cuatro pasos te mostramos cuánto pagarías cada mes.
            Con esa información, un asesor te ayuda a conseguir las mejores condiciones
            reales entre todas las instituciones.
          </p>
        </div>

        <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <CreditWizard />
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <ul className="space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-ink">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent-500" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 flex items-start gap-3 rounded-2xl bg-white p-4 text-sm leading-relaxed text-ink-soft shadow-soft">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-600" />
            Usamos tus datos únicamente para gestionar tu solicitud y ponerte en contacto
            con un asesor. No los vendemos ni los compartimos con terceros ajenos al
            trámite.
          </p>
        </div>
      </div>
    </div>
  );
}
