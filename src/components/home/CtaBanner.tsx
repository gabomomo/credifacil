import { MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Sparkle, Star4, HandNote } from "@/components/ui/Doodles";

export function CtaBanner() {
  return (
    <section className="pb-4">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-6 py-14 text-center shadow-lift sm:px-12 sm:py-20">
          <div
            className="animate-blob absolute -left-16 -top-16 size-64 bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="animate-blob absolute -bottom-20 -right-10 size-72 bg-accent-400/25 blur-3xl [animation-delay:-6s]"
            aria-hidden="true"
          />
          {/* Doodles flotantes */}
          <Sparkle className="animate-wiggle absolute left-8 top-10 size-6 text-sun-300" />
          <Star4 className="animate-float absolute right-10 top-12 size-7 text-white/60" />
          <Star4 className="animate-float-slow absolute bottom-10 left-14 size-5 text-sun-300 [animation-delay:-3s]" />

          <div className="relative mx-auto max-w-2xl">
            <HandNote rotate="-5deg" className="text-3xl text-sun-300">
              ¿Le entramos?
            </HandNote>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
              Encontrá tu crédito ideal hoy mismo
            </h2>
            <p className="mt-4 text-lg text-brand-100">
              Simula tu cuota gratis y deja que un asesor te acompañe. Sin costo, sin compromiso
              y sin letra pequeña escondida. 😉
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/simulador" variant="white" size="lg">
                Simular mi crédito
              </ButtonLink>
              <a
                href="https://wa.me/50600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
              >
                <MessageCircle className="size-5" />
                Hablar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
