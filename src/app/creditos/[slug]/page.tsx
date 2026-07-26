import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight, FileText, HandCoins, Clock, ShieldCheck } from "lucide-react";
import { products, getProduct } from "@/lib/products";
import { institutionsFor } from "@/lib/institutions";
import { productScenes } from "@/components/illustrations/Scenes";
import { Sparkle, Star4 } from "@/components/ui/Doodles";
import { InstitutionLogo } from "@/components/ui/InstitutionLogo";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CtaBanner } from "@/components/home/CtaBanner";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Crédito no encontrado" };
  return {
    title: product.title,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const Icon = product.icon;
  const Scene = productScenes[product.slug];
  const insts = institutionsFor(product.slug);
  // Alterna la ilustración izquierda/derecha por producto (jugamos con la posición)
  const index = products.findIndex((p) => p.slug === product.slug);
  const imageLeft = index % 2 === 1;

  return (
    <div>
      {/* Hero del producto */}
      <section className="relative overflow-hidden bg-mist">
        <div className="bg-grid absolute inset-0 opacity-70" aria-hidden="true" />
        {/* Blobs orgánicos de fondo */}
        <div
          className="animate-blob absolute -top-28 -left-24 size-[30rem] bg-gradient-to-br from-brand-200/45 to-accent-200/45 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="animate-blob absolute -bottom-32 right-1/3 size-[24rem] bg-gradient-to-br from-sun-200/35 to-coral-100/45 blur-3xl [animation-delay:-5s]"
          aria-hidden="true"
        />

        <div className="container-x relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className={imageLeft ? "lg:order-2" : "lg:order-1"}>
            <span
              className={`inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md ${product.gradient}`}
            >
              <Icon className="size-7" />
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
              {product.title}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
              {product.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/contacto" size="lg">
                Solicitar asesoría gratis
              </ButtonLink>
              <ButtonLink href="/simulador" variant="outline" size="lg">
                Simular mi cuota
              </ButtonLink>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {[
                { icon: HandCoins, label: "Asesoría gratis" },
                { icon: Clock, label: "Respuesta en 24 h" },
                { icon: ShieldCheck, label: "Sin compromiso" },
              ].map((b) => (
                <li key={b.label} className="flex items-center gap-2 text-sm font-medium text-ink">
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-accent-100 text-accent-600">
                    <b.icon className="size-4" />
                  </span>
                  {b.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Ilustración protagonista, sin marco, con doodles */}
          <div
            className={`relative mx-auto w-full max-w-lg ${imageLeft ? "lg:order-1" : "lg:order-2"}`}
          >
            <Star4 className="animate-float-slow absolute right-4 top-6 z-10 size-9 text-accent-400 [animation-delay:-3s]" />
            <Sparkle className="animate-wiggle absolute bottom-8 right-12 z-10 size-7 text-sun-400" />

            <Scene className="w-full" />

            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-lift ring-1 ring-slate-100">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-500 text-white">
                <Check className="size-4" strokeWidth={3} />
              </span>
              <span className="text-sm font-semibold text-ink">{product.highlights[0]}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink">
              ¿Qué incluye este crédito?
            </h2>
            <ul className="mt-6 space-y-4">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-500 text-white">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  <span className="text-ink">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-soft">
            <h3 className="flex items-center gap-2 font-display text-xl font-bold text-ink">
              <FileText className="size-5 text-brand-600" />
              Requisitos generales
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Referenciales. Cada institución puede solicitar documentos adicionales.
            </p>
            <ul className="mt-5 space-y-3">
              {product.requirements.map((r) => (
                <li key={r} className="flex items-start gap-3 text-ink-soft">
                  <Check className="mt-0.5 size-5 shrink-0 text-brand-600" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Instituciones para este producto */}
      <section className="bg-mist py-16 sm:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="Dónde comparamos"
            title={`Instituciones con crédito ${product.name.toLowerCase()}`}
            description="Comparamos las condiciones de estas entidades para encontrarte la mejor opción."
          />
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {insts.map((inst) => (
              <div
                key={inst.name}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-soft"
              >
                <InstitutionLogo institution={inst} className="size-10 text-sm" />
                <span className="font-semibold text-ink">{inst.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/instituciones"
              className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-700"
            >
              Ver todas las instituciones
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ del producto */}
      <section className="py-16 sm:py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Preguntas frecuentes" title={`Sobre el crédito ${product.name.toLowerCase()}`} />
          <div className="mx-auto mt-10 max-w-3xl">
            <Accordion items={product.faqs} />
          </div>
        </div>
      </section>

      <CtaBanner />
    </div>
  );
}
