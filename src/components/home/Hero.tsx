import Image from "next/image";
import Link from "next/link";
import heroImg from "@/assets/hero.png";
import { ShieldCheck, Clock, HandCoins } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { CreditSimulator } from "@/components/simulator/CreditSimulator";
import { Squiggle, Star4, HandNote } from "@/components/ui/Doodles";

const badges = [
  { icon: HandCoins, label: "Asesoría 100% gratis" },
  { icon: Clock, label: "Respuesta en 24 horas" },
  { icon: ShieldCheck, label: "Sin costo ni compromiso" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Imagen de fondo + velo para legibilidad */}
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
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/60 via-brand-950/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/35 via-transparent to-transparent" />
      </div>

      <div className="container-x relative z-10 grid items-start gap-10 pt-14 pb-14 sm:pt-16 lg:min-h-[700px] lg:grid-cols-2 lg:gap-12 lg:pt-24 lg:pb-24">
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-white drop-shadow-sm">
            <Star4 className="size-4 text-sun-300" />
            El comparador de créditos de Costa Rica
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] text-white drop-shadow-md sm:text-5xl lg:text-6xl">
            Tu crédito ideal,{" "}
            <span className="relative inline-block">
              sin salir de casa
              <Squiggle className="text-sun-300" />
            </span>
            <span className="ml-2 inline-block align-top text-3xl">👋</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/90 drop-shadow">
            Nada de dar vueltas por cada banco. Comparamos créditos hipotecarios, personales,
            de vehículo y para tu negocio en un solo lugar. Simula tu cuota en segundos y deja
            que un asesor te lleve de la mano{" "}
            <span className="font-semibold text-white">gratis</span>, hasta la firma. 🙌
          </p>

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/simulador" variant="white" size="lg">
              Simular mi crédito
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

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {badges.map((b) => (
              <li key={b.label} className="flex items-center gap-2 text-sm font-medium text-white drop-shadow">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-accent-600 shadow-sm">
                  <b.icon className="size-4" />
                </span>
                {b.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:pb-2">
          <CreditSimulator />
        </div>
      </div>
    </section>
  );
}
