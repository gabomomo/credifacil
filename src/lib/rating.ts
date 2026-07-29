/**
 * Cálculo de la tasa ponderada que usa el simulador.
 *
 * La idea: en vez de una tasa de ejemplo fija por producto, se promedian las
 * tasas de las instituciones **para las que la persona efectivamente califica**,
 * según lo que declaró en el wizard (situación laboral e ingresos) y lo que
 * pidió (monto y plazo).
 *
 * Todo aquí es función pura sobre datos ya cargados: no toca Firestore ni React,
 * para poder probarlo de forma aislada.
 */

import type { ProductSlug } from "@/lib/products";
import type { EmploymentId, IncomeId } from "@/lib/lead";
import type { Institution, Offer } from "@/lib/db/types";

/**
 * Orden de los tramos de ingreso, de menor a mayor. El índice es lo que permite
 * comparar "el tramo declarado alcanza el mínimo exigido".
 */
const INCOME_ORDER: IncomeId[] = ["r1", "r2", "r3", "r4", "r5"];

function incomeRank(id: IncomeId): number {
  return INCOME_ORDER.indexOf(id);
}

export interface Applicant {
  product: ProductSlug;
  employment: EmploymentId;
  income: IncomeId;
  amount: number;
  months: number;
}

/** Motivo por el que una oferta quedó fuera; se muestra en el panel admin. */
export type ExclusionReason =
  | "producto"
  | "inactiva"
  | "institucion_inactiva"
  | "empleo"
  | "ingreso"
  | "monto"
  | "plazo";

export interface OfferMatch {
  offer: Offer;
  institution: Institution;
  eligible: boolean;
  /** Vacío si es elegible. */
  reasons: ExclusionReason[];
}

/**
 * Evalúa una oferta contra el perfil. Devuelve TODOS los motivos de exclusión,
 * no solo el primero: al administrar las ofertas es mucho más útil ver que
 * fallan tres criterios que descubrirlos de a uno.
 */
export function evaluateOffer(
  offer: Offer,
  institution: Institution | undefined,
  applicant: Applicant,
): OfferMatch | null {
  if (!institution) return null;

  const reasons: ExclusionReason[] = [];

  if (offer.product !== applicant.product) reasons.push("producto");
  if (!offer.active) reasons.push("inactiva");
  if (!institution.active) reasons.push("institucion_inactiva");
  if (!offer.acceptedEmployment.includes(applicant.employment)) reasons.push("empleo");
  if (incomeRank(applicant.income) < incomeRank(offer.minIncome)) reasons.push("ingreso");
  if (applicant.amount < offer.minAmount || applicant.amount > offer.maxAmount) {
    reasons.push("monto");
  }
  if (applicant.months < offer.minMonths || applicant.months > offer.maxMonths) {
    reasons.push("plazo");
  }

  return { offer, institution, eligible: reasons.length === 0, reasons };
}

export interface WeightedRate {
  /** Tasa anual ponderada, redondeada a dos decimales. */
  rate: number;
  /** Cuántas instituciones respaldan el número. */
  count: number;
  /** La mejor tasa individual entre las elegibles. */
  bestRate: number;
  /** Institución que ofrece esa mejor tasa. */
  bestInstitution: string;
  /** Verificación más antigua entre las ofertas usadas: la que marca la vigencia. */
  oldestVerification: Date;
  matches: OfferMatch[];
}

/**
 * Promedio ponderado de las tasas elegibles.
 *
 * Devuelve null cuando ninguna oferta califica; quien llama debe entonces caer
 * a la tasa de ejemplo de products.ts. Esa degradación es intencional: el
 * simulador nunca debe quedarse sin mostrar una cifra por falta de datos.
 */
export function weightedRate(
  offers: Offer[],
  institutions: Institution[],
  applicant: Applicant,
): WeightedRate | null {
  const byId = new Map(institutions.map((i) => [i.id, i]));

  const matches = offers
    .map((o) => evaluateOffer(o, byId.get(o.institutionId), applicant))
    .filter((m): m is OfferMatch => m !== null);

  const eligible = matches.filter((m) => m.eligible);
  if (eligible.length === 0) return null;

  // Un peso <= 0 dejaría a la institución fuera del promedio sin que se note en
  // el panel; se trata como neutro para que "excluir" sea siempre explícito
  // mediante el interruptor de activa/inactiva.
  const weightOf = (m: OfferMatch) => (m.institution.weight > 0 ? m.institution.weight : 1);

  const totalWeight = eligible.reduce((sum, m) => sum + weightOf(m), 0);
  const weightedSum = eligible.reduce((sum, m) => sum + m.offer.annualRate * weightOf(m), 0);

  const best = eligible.reduce((a, b) => (b.offer.annualRate < a.offer.annualRate ? b : a));
  const oldest = eligible.reduce((a, b) =>
    b.offer.verifiedAt < a.offer.verifiedAt ? b : a,
  );

  return {
    rate: Math.round((weightedSum / totalWeight) * 100) / 100,
    count: eligible.length,
    bestRate: best.offer.annualRate,
    bestInstitution: best.institution.shortName,
    oldestVerification: oldest.offer.verifiedAt,
    matches,
  };
}

/**
 * Cuántos días tiene la verificación más vieja. El simulador lo usa para avisar
 * cuando las tasas llevan demasiado sin confirmarse.
 */
export function verificationAgeInDays(oldest: Date, now: Date): number {
  return Math.floor((now.getTime() - oldest.getTime()) / 86_400_000);
}

/** A partir de estos días, la tasa se muestra con advertencia de vigencia. */
export const STALE_AFTER_DAYS = 60;
