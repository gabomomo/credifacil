import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/products";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export function ProductGrid() {
  return (
    <section id="productos" className="py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Nuestros créditos"
          title="Todos tus créditos, en un solo lugar"
          description="Sea cual sea tu meta —una casa, un carro, un respiro o hacer crecer tu negocio— comparamos todas las opciones y te decimos cuál te conviene más."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.slug} delay={i * 0.08}>
                <Link
                  href={`/creditos/${p.slug}`}
                  className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-lift"
                >
                  <span
                    className={cn(
                      "inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md",
                      p.gradient,
                    )}
                  >
                    <Icon className="size-7" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold text-ink">
                    Crédito {p.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {p.tagline}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                    Ver detalles
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
