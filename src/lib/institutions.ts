import type { ProductSlug } from "./products";

export type InstitutionType = "Banco" | "Cooperativa" | "Mutual" | "Financiera";

export interface Institution {
  /** Identificador estable; nombre de archivo del logo en /public/logos/<key>.svg|png */
  key: string;
  name: string;
  /** Monograma para el logo placeholder (2–4 letras) — se usa si no hay archivo de logo */
  monogram: string;
  type: InstitutionType;
  /** Color de marca aproximado para el placeholder */
  color: string;
  /** Productos que ofrece a través de Credifácil */
  products: ProductSlug[];
}

/**
 * Instituciones financieras de Costa Rica.
 *
 * LOGOS: si existe el archivo /public/logos/<key>.svg (o .png/.webp) se muestra ese logo;
 * de lo contrario se usa el monograma de color como respaldo. Reemplazar por logos
 * oficiales y confirmar permisos de uso de marca antes de producción.
 */
export const institutions: Institution[] = [
  { key: "banco-nacional", name: "Banco Nacional", monogram: "BN", type: "Banco", color: "#0a5b3e", products: ["hipotecario", "personal", "vehiculo", "pyme"] },
  { key: "bcr", name: "Banco de Costa Rica", monogram: "BCR", type: "Banco", color: "#0033a0", products: ["hipotecario", "personal", "vehiculo", "pyme"] },
  { key: "bac", name: "BAC Credomatic", monogram: "BAC", type: "Banco", color: "#c8102e", products: ["hipotecario", "personal", "vehiculo", "pyme"] },
  { key: "banco-popular", name: "Banco Popular", monogram: "BP", type: "Banco", color: "#e21b30", products: ["hipotecario", "personal", "vehiculo", "pyme"] },
  { key: "scotiabank", name: "Scotiabank", monogram: "SCO", type: "Banco", color: "#ec111a", products: ["hipotecario", "personal", "vehiculo"] },
  { key: "davivienda", name: "Davivienda", monogram: "DAV", type: "Banco", color: "#ed1c27", products: ["hipotecario", "personal", "vehiculo"] },
  { key: "promerica", name: "Banco Promerica", monogram: "PRO", type: "Banco", color: "#009639", products: ["personal", "vehiculo", "pyme"] },
  { key: "coopeservidores", name: "Coopeservidores", monogram: "CS", type: "Cooperativa", color: "#e30613", products: ["personal", "vehiculo", "pyme"] },
  { key: "coopealianza", name: "Coopealianza", monogram: "CAL", type: "Cooperativa", color: "#00954c", products: ["hipotecario", "personal", "vehiculo"] },
  { key: "coocique", name: "Coocique", monogram: "COO", type: "Cooperativa", color: "#0069b4", products: ["personal", "vehiculo", "pyme"] },
  { key: "grupo-mutual", name: "Grupo Mutual", monogram: "GM", type: "Mutual", color: "#f47920", products: ["hipotecario", "personal"] },
  { key: "mutual-alajuela", name: "Mutual Alajuela", monogram: "MA", type: "Mutual", color: "#e4002b", products: ["hipotecario", "personal"] },
  { key: "ins", name: "INS", monogram: "INS", type: "Financiera", color: "#005baa", products: ["personal", "vehiculo"] },
];

export function institutionsFor(slug: ProductSlug): Institution[] {
  return institutions.filter((i) => i.products.includes(slug));
}
