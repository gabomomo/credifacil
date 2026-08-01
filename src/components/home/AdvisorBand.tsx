import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import asesorImg from "@/assets/asesor.webp";
import { ButtonLink } from "@/components/ui/Button";
import { HandNote } from "@/components/ui/Doodles";

const points = [
  "Un asesor real revisa tu caso y resuelve tus dudas",
  "Te decimos qué documentos necesitas, sin vueltas",
  "Negociamos y comparamos por vos entre las instituciones",
  "Te acompañamos hasta la firma, sin costo",
];

export function AdvisorBand() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-x grid items-center gap-10 lg:grid-cols-2">
        {/*
         * La ilustración es cuadrada y con fondo transparente, así que se apoya
         * sobre un círculo de marca: sin él flota en el blanco de la sección y
         * pierde peso frente a la columna de texto.
         */}
        <div className="relative order-2 lg:order-1">
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <div className="absolute inset-[6%] rounded-full bg-gradient-to-br from-brand-50 to-accent-50" />
            <Image
              src={asesorImg}
              alt="Asesor de Credifácil con audífonos, listo para atender"
              sizes="(min-width: 1024px) 40vw, 80vw"
              className="relative size-full object-contain"
            />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <HandNote rotate="-4deg" className="text-brand-500">
            no estás solo en esto
          </HandNote>
          <h2 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            Una persona de verdad, de tu lado
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Detrás de Credifácil hay asesores que conocen el mercado tico y te explican todo
            en cristiano. Nada de letra pequeña ni tecnicismos raros.
          </p>

          <ul className="mt-7 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-ink">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent-500" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <ButtonLink href="/contacto" size="lg">
              Quiero que me acompañen
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
