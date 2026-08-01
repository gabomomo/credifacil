import Image from "next/image";
import Link from "next/link";
import heroImg from "@/assets/hero.png";
import familyImg from "@/assets/family.webp";
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
      {/*
       * Imagen de fondo + velo. El texto vuelve a la izquierda ahora que la
       * ilustración de la familia ocupa la derecha, así que el velo también:
       * es más denso de ese lado y se abre hacia el otro para no ensuciar la
       * escena justo detrás de la ilustración.
       */}
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
        <div className="absolute inset-0 bg-brand-950/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/80 via-brand-950/45 to-brand-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/55 via-transparent to-transparent" />
      </div>

      <div className="container-x relative z-10 grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-24">
        {/* Columna de texto. En móvil va primero: es lo que explica el sitio. */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white ring-1 ring-white/25 backdrop-blur-sm">
            <Star4 className="size-4 text-sun-300" />
            El comparador de créditos de Costa Rica
          </span>

          {/* El emoji va dentro del grupo whitespace-nowrap: suelto, se descolgaba
              a una línea propia cuando el titular ocupaba todo el ancho. */}
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.12] text-white drop-shadow-md sm:text-5xl lg:text-[3.4rem]">
            Tu crédito ideal,{" "}
            <span className="whitespace-nowrap">
              <span className="relative inline-block">
                sin salir de casa
                <Squiggle className="text-sun-300" />
              </span>
              <span className="ml-2 inline-block align-baseline text-3xl">👋</span>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white drop-shadow-md lg:mx-0">
            Nada de dar vueltas por cada banco. Comparamos créditos hipotecarios,
            personales, de vehículo y para tu negocio en un solo lugar. Simula tu cuota en
            segundos y deja que un asesor te lleve de la mano{" "}
            <span className="font-semibold text-white">gratis</span>, hasta la firma. 🙌
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
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

          <ul className="mt-10 flex flex-wrap justify-center gap-x-7 gap-y-4 lg:justify-start">
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

        {/*
         * La ilustración tiene canal alfa, así que se funde con la escena en
         * vez de recortarse como un rectángulo. Por eso no lleva marco: un
         * borde o un anillo dibujarían una caja alrededor de nada.
         *
         * La sombra sí hace falta: sin ella la familia se pierde entre los
         * edificios del fondo.
         */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <Image
            src={familyImg}
            alt="Un asesor de Credifácil acompañando a una familia a elegir su crédito"
            priority
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="w-full [filter:drop-shadow(0_18px_28px_rgba(15,20,45,0.45))]"
          />
        </div>
      </div>
    </section>
  );
}
