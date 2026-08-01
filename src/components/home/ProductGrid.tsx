import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products, type ProductSlug } from "@/lib/products";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

import hipotecario from "@/assets/productos/hipotecario.webp";
import personal from "@/assets/productos/personal.webp";
import vehiculo from "@/assets/productos/vehiculo.webp";
import empresa from "@/assets/productos/empresa.webp";

/**
 * Ilustración y velo de cada producto.
 *
 * El velo no es decorativo: dos de las cuatro ilustraciones son muy claras en
 * la parte superior —justo donde va el texto— y el blanco sobre ellas resulta
 * ilegible. En vez de un oscurecimiento neutro se usa un degradado del mismo
 * tono de cada imagen, que garantiza contraste sin apagar el color que le da
 * identidad a la tarjeta.
 */
const art: Record<ProductSlug, { img: StaticImageData; top: string; bottom: string }> = {
  hipotecario: {
    img: hipotecario,
    top: "from-[#3b2d8f]/90 via-[#3b2d8f]/35 to-transparent",
    bottom: "from-[#3b2d8f]/75 to-transparent",
  },
  personal: {
    img: personal,
    top: "from-[#0f5c2a]/90 via-[#0f5c2a]/30 to-transparent",
    bottom: "from-[#0f5c2a]/75 to-transparent",
  },
  vehiculo: {
    img: vehiculo,
    top: "from-[#0f3c72]/90 via-[#0f3c72]/35 to-transparent",
    bottom: "from-[#0f3c72]/75 to-transparent",
  },
  pyme: {
    img: empresa,
    top: "from-[#8a3f04]/90 via-[#8a3f04]/30 to-transparent",
    bottom: "from-[#8a3f04]/75 to-transparent",
  },
};

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
            const { img, top, bottom } = art[p.slug];
            return (
              <Reveal key={p.slug} delay={i * 0.08}>
                <Link
                  href={`/creditos/${p.slug}`}
                  className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-3xl shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
                >
                  {/*
                   * object-left es deliberado: las ilustraciones son apaisadas
                   * con el motivo (la casa, el carro, la tienda) en el extremo
                   * izquierdo. En una tarjeta vertical el recorte centrado, que
                   * es el que viene por defecto, se lo comía entero y solo
                   * quedaba cielo.
                   */}
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    placeholder="blur"
                    className="object-cover object-left transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Dos velos, uno por zona de texto: el título arriba y el
                      enlace abajo. En medio se deja ver la ilustración. */}
                  <div className={cn("absolute inset-x-0 top-0 h-3/5 bg-gradient-to-b", top)} />
                  <div className={cn("absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t", bottom)} />

                  <div className="relative flex h-full flex-col p-6">
                    <h3 className="font-display text-2xl font-extrabold leading-tight text-white drop-shadow-sm">
                      Crédito {p.name}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/90 drop-shadow-sm">
                      {p.tagline}
                    </p>

                    {/* mt-auto empuja el enlace abajo: las tarjetas tienen la
                        misma altura pero descripciones de largo distinto. */}
                    <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-white">
                      Ver detalles
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
