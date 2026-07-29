import Image from "next/image";
import Link from "next/link";
import heroImg from "@/assets/hero.png";
import { ShieldCheck, Clock, HandCoins, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Squiggle, Star4, HandNote } from "@/components/ui/Doodles";

const badges = [
  { icon: HandCoins, label: "Asesoría 100% gratis" },
  { icon: Clock, label: "Respuesta en 24 horas" },
  { icon: ShieldCheck, label: "Sin costo ni compromiso" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Imagen de fondo + velo en tres capas. La ilustración es muy detallada
          justo donde va el texto, así que en vez de oscurecerla entera se usa
          un degradado radial que concentra el velo detrás del bloque de texto
          y deja los bordes de la escena visibles. */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImg}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* 1. Tinte parejo que unifica la escena */}
        <div className="absolute inset-0 bg-brand-950/40" />
        {/* 2. Núcleo oscuro detrás del titular y el párrafo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_68%_at_50%_47%,rgba(34,42,76,0.66)_0%,rgba(34,42,76,0.36)_60%,transparent_82%)]" />
        {/* 3. Asiento inferior para que los distintivos no floten sobre el parque */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-brand-950/10 to-transparent" />
      </div>

      <div className="container-x relative z-10 flex flex-col items-center py-20 text-center sm:py-24 lg:py-32">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white ring-1 ring-white/25 backdrop-blur-sm">
          <Star4 className="size-4 text-sun-300" />
          El comparador de créditos de Costa Rica
        </span>

        {/* El emoji va dentro del grupo whitespace-nowrap: suelto, se descolgaba
            a una línea propia cuando el titular ocupaba todo el ancho. */}
        <h1 className="mt-7 max-w-4xl text-4xl font-extrabold leading-[1.12] text-white drop-shadow-md sm:text-5xl lg:text-6xl">
          Tu crédito ideal,{" "}
          <span className="whitespace-nowrap">
            <span className="relative inline-block">
              sin salir de casa
              <Squiggle className="text-sun-300" />
            </span>
            <span className="ml-2 inline-block align-baseline text-3xl">👋</span>
          </span>
        </h1>

        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white drop-shadow-md">
          Nada de dar vueltas por cada banco. Comparamos créditos hipotecarios, personales,
          de vehículo y para tu negocio en un solo lugar. Simula tu cuota en segundos y deja
          que un asesor te lleve de la mano{" "}
          <span className="font-semibold text-white">gratis</span>, hasta la firma. 🙌
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <ButtonLink href="/simulador" variant="white" size="lg">
            Simular mi crédito
            <ArrowRight className="size-5" />
          </ButtonLink>
          <Link
            href="/#productos"
            className="inline-flex items-center justify-center rounded-full border-2 border-white/60 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            Ver tipos de crédito
          </Link>
          <HandNote rotate="-8deg" className="hidden pl-1 text-sun-200 sm:block">
            ¡y es gratis!
          </HandNote>
        </div>

        <ul className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4">
          {badges.map((b) => (
            <li
              key={b.label}
              className="flex items-center gap-2 text-sm font-medium text-white drop-shadow"
            >
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-accent-600 shadow-sm">
                <b.icon className="size-4" />
              </span>
              {b.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
