import {
  Home,
  Wallet,
  Car,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export type ProductSlug = "hipotecario" | "personal" | "vehiculo" | "pyme";

export interface CreditProduct {
  slug: ProductSlug;
  /** Nombre corto para tarjetas y navegación */
  name: string;
  /** Título largo para páginas */
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  /** Clases de gradiente para acentos visuales */
  gradient: string;
  /** Tasa anual de EJEMPLO (%). No representa una oferta real. */
  exampleRate: number;
  /** Rango de monto sugerido en colones */
  amount: { min: number; max: number; default: number; step: number };
  /** Plazo en meses */
  term: { min: number; max: number; default: number; step: number };
  highlights: string[];
  /** Preguntas frecuentes específicas del producto */
  faqs: { q: string; a: string }[];
  /** Requisitos generales de ejemplo */
  requirements: string[];
}

export const products: CreditProduct[] = [
  {
    slug: "hipotecario",
    name: "Hipotecario",
    title: "Crédito hipotecario y de vivienda",
    tagline: "Tu casa propia, más cerca y sin dar vueltas por cada banco.",
    description:
      "Compra de casa nueva o usada, construcción, remodelación o compra de lote. Comparamos las mejores condiciones de bancos, mutuales y cooperativas para que elijas con claridad.",
    icon: Home,
    gradient: "from-brand-600 to-brand-400",
    exampleRate: 8.5,
    amount: { min: 10_000_000, max: 250_000_000, default: 60_000_000, step: 1_000_000 },
    term: { min: 60, max: 360, default: 240, step: 12 },
    highlights: [
      "Casa nueva, usada, construcción y remodelación",
      "Plazos de hasta 30 años",
      "Financiamiento hasta del 90% del valor",
      "Opción en colones o dólares",
    ],
    requirements: [
      "Cédula vigente (nacional o DIMEX)",
      "Comprobante de ingresos de los últimos 3 meses",
      "Orden patronal o estados de cuenta si es independiente",
      "Avalúo de la propiedad (te acompañamos en el proceso)",
    ],
    faqs: [
      {
        q: "¿Cuánto puedo financiar de mi vivienda?",
        a: "Según la institución y tu perfil, normalmente entre el 80% y el 90% del valor de la propiedad. La prima restante la aportas tú.",
      },
      {
        q: "¿Conviene el crédito en colones o en dólares?",
        a: "Depende de la moneda en la que recibes tus ingresos. Si ganas en colones, lo más prudente suele ser endeudarte en colones para evitar el riesgo cambiario. En tu asesoría gratuita lo revisamos contigo.",
      },
    ],
  },
  {
    slug: "personal",
    name: "Personal",
    title: "Crédito personal y de consumo",
    tagline: "Para ese proyecto, imprevisto o meta que no da espera.",
    description:
      "Préstamos personales de libre uso: consolidar deudas, estudios, salud, viajes o un gasto imprevisto. Compara tasas y plazos de bancos y cooperativas en un solo lugar.",
    icon: Wallet,
    gradient: "from-accent-500 to-accent-400",
    exampleRate: 18.9,
    amount: { min: 500_000, max: 30_000_000, default: 5_000_000, step: 100_000 },
    term: { min: 6, max: 96, default: 48, step: 6 },
    highlights: [
      "Libre uso, sin explicar en qué lo gastas",
      "Aprobación ágil y trámite en línea",
      "Ideal para consolidar y ordenar tus deudas",
      "Cuotas fijas y predecibles",
    ],
    requirements: [
      "Cédula vigente (nacional o DIMEX)",
      "Comprobante de ingresos de los últimos 3 meses",
      "Récord crediticio al día",
    ],
    faqs: [
      {
        q: "¿Puedo usar el crédito para consolidar deudas?",
        a: "Sí. Consolidar varias deudas caras (tarjetas, préstamos) en un solo crédito con menor tasa es uno de los usos más frecuentes y puede reducir tu cuota total.",
      },
      {
        q: "¿Qué tan rápido me aprueban?",
        a: "Con la documentación completa, muchas instituciones responden en 24 a 72 horas. Nosotros te ayudamos a llegar bien preparado.",
      },
    ],
  },
  {
    slug: "vehiculo",
    name: "Vehículo",
    title: "Crédito de vehículo",
    tagline: "Estrena carro nuevo o usado con la mejor cuota posible.",
    description:
      "Financiamiento para vehículo nuevo o usado, con el mismo carro como garantía. Comparamos prima, tasa y plazo entre las instituciones para que manejes tranquilo.",
    icon: Car,
    gradient: "from-brand-500 to-accent-500",
    exampleRate: 11.5,
    amount: { min: 3_000_000, max: 60_000_000, default: 15_000_000, step: 500_000 },
    term: { min: 12, max: 96, default: 72, step: 12 },
    highlights: [
      "Vehículo nuevo o usado",
      "Primas desde el 10% del valor",
      "Plazos de hasta 8 años",
      "El vehículo queda como garantía",
    ],
    requirements: [
      "Cédula vigente (nacional o DIMEX)",
      "Comprobante de ingresos de los últimos 3 meses",
      "Proforma o factura del vehículo",
    ],
    faqs: [
      {
        q: "¿Cuánta prima necesito?",
        a: "Suele ir del 10% al 20% del valor del vehículo, según la institución, el año del carro y tu perfil crediticio.",
      },
      {
        q: "¿Puedo financiar un carro usado?",
        a: "Sí, siempre que cumpla con la antigüedad máxima que pide cada institución (normalmente vehículos de pocos años). Te decimos cuáles aplican.",
      },
    ],
  },
  {
    slug: "pyme",
    name: "Empresa y más",
    title: "Crédito para empresa, refinanciamiento y más",
    tagline: "Capital para tu negocio y soluciones para ordenar tus finanzas.",
    description:
      "Crédito para PYME y emprendimientos, capital de trabajo, refinanciamiento y consolidación de deudas, además de opciones de tarjetas de crédito. Te conectamos con la institución adecuada según tu caso.",
    icon: Briefcase,
    gradient: "from-brand-700 to-brand-500",
    exampleRate: 14.5,
    amount: { min: 1_000_000, max: 150_000_000, default: 20_000_000, step: 500_000 },
    term: { min: 12, max: 120, default: 60, step: 12 },
    highlights: [
      "Capital de trabajo y crecimiento para tu PYME",
      "Refinanciamiento y consolidación de deudas",
      "Líneas de crédito y tarjetas empresariales",
      "Asesoría según el giro de tu negocio",
    ],
    requirements: [
      "Cédula jurídica o física con actividad económica",
      "Estados financieros o flujo de caja recientes",
      "Declaraciones de impuestos al día",
    ],
    faqs: [
      {
        q: "¿Atienden emprendimientos pequeños?",
        a: "Sí. Trabajamos con bancos y cooperativas que tienen productos pensados para PYME y emprendedores, incluso en etapas tempranas.",
      },
      {
        q: "¿Qué es refinanciar y cuándo conviene?",
        a: "Refinanciar es sustituir una o varias deudas por otra con mejores condiciones (menor tasa o plazo más cómodo). Conviene cuando baja tu cuota total o te ordena los pagos.",
      },
    ],
  },
];

export function getProduct(slug: string): CreditProduct | undefined {
  return products.find((p) => p.slug === slug);
}
