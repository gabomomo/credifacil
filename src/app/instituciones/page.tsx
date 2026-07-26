import type { Metadata } from "next";
import { institutions, type InstitutionType } from "@/lib/institutions";
import { products } from "@/lib/products";
import { InstitutionLogo } from "@/components/ui/InstitutionLogo";
import { CtaBanner } from "@/components/home/CtaBanner";

export const metadata: Metadata = {
  title: "Instituciones aliadas",
  description:
    "Bancos, cooperativas y mutuales de Costa Rica con los que comparamos créditos en Credifácil.",
};

const typeOrder: InstitutionType[] = ["Banco", "Cooperativa", "Mutual", "Financiera"];
const typeLabel: Record<InstitutionType, string> = {
  Banco: "Bancos",
  Cooperativa: "Cooperativas",
  Mutual: "Mutuales",
  Financiera: "Otras entidades",
};

function productName(slug: string) {
  return products.find((p) => p.slug === slug)?.name ?? slug;
}

export default function InstitucionesPage() {
  return (
    <div>
      <section className="bg-mist py-16">
        <div className="container-x max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Instituciones aliadas
          </span>
          <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">
            Comparamos entre las principales del país
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">
            Trabajamos con bancos, cooperativas y mutuales de Costa Rica para encontrarte
            la mejor combinación de tasa, plazo y condiciones.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-x space-y-14">
          {typeOrder.map((type) => {
            const group = institutions.filter((i) => i.type === type);
            if (group.length === 0) return null;
            return (
              <div key={type}>
                <h2 className="font-display text-2xl font-bold text-ink">{typeLabel[type]}</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((inst) => (
                    <div
                      key={inst.name}
                      className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
                    >
                      <div className="flex items-center gap-4">
                        <InstitutionLogo institution={inst} className="size-14 text-base" />
                        <div>
                          <h3 className="font-display text-lg font-bold text-ink">
                            {inst.name}
                          </h3>
                          <p className="text-sm text-slate-500">{inst.type}</p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {inst.products.map((slug) => (
                          <span
                            key={slug}
                            className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                          >
                            {productName(slug)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <p className="rounded-2xl bg-mist p-5 text-center text-sm text-slate-500">
            Los logos mostrados son representaciones temporales. Las marcas pertenecen a sus
            respectivas instituciones. Credifácil no representa oficialmente a estas entidades
            en esta demostración.
          </p>
        </div>
      </section>

      <CtaBanner />
    </div>
  );
}
