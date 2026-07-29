/**
 * Cálculo de crédito por sistema de amortización francés (cuota fija).
 *
 *   cuota = P · i / (1 − (1 + i)^(−n))
 *
 * donde P = monto, i = tasa mensual (anual/12/100), n = plazo en meses.
 */

export interface LoanInput {
  /** Monto del crédito */
  amount: number;
  /** Tasa de interés ANUAL en porcentaje (ej. 8.5) */
  annualRate: number;
  /** Plazo en meses */
  months: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
}

export function calculateLoan({ amount, annualRate, months }: LoanInput): LoanResult {
  if (amount <= 0 || months <= 0) {
    return { monthlyPayment: 0, totalPaid: 0, totalInterest: 0 };
  }

  const i = annualRate / 100 / 12;

  let monthlyPayment: number;
  if (i === 0) {
    monthlyPayment = amount / months;
  } else {
    monthlyPayment = (amount * i) / (1 - Math.pow(1 + i, -months));
  }

  const totalPaid = monthlyPayment * months;
  const totalInterest = totalPaid - amount;

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalPaid: Math.round(totalPaid),
    totalInterest: Math.round(totalInterest),
  };
}

const crc = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  maximumFractionDigits: 0,
});

/**
 * Intl con es-CR separa los miles con espacio duro, no con punto: produce
 * "₡20 000 000". En Costa Rica la convención es el punto, que además es lo que
 * ya usaban los textos del sitio y lo que documenta formatCRC.
 *
 * Los códigos van escapados a propósito: el separador no es un espacio normal,
 * así que ni /\s/ ni un espacio literal en el patrón lo alcanzarían. Según la
 * versión de ICU puede emitirse el duro (U+00A0) o el fino (U+202F).
 * Sin decimales (maximumFractionDigits: 0) la sustitución es inequívoca.
 */
function withDotSeparators(value: string): string {
  return value.replace(/[\u00a0\u202f]/g, ".");
}

/** Formatea un número como colones costarricenses: ₡1.250.000 */
export function formatCRC(value: number): string {
  return withDotSeparators(crc.format(value));
}

const plain = new Intl.NumberFormat("es-CR", { maximumFractionDigits: 0 });

/** Formatea un número sin símbolo de moneda: 1.250.000 */
export function formatNumber(value: number): string {
  return withDotSeparators(plain.format(value));
}

/**
 * Etiqueta de plazo en español, con la concordancia correcta:
 * 6 → "6 meses" · 12 → "1 año" · 60 → "5 años" · 18 → "1 año 6 meses"
 */
export function formatTerm(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${months} ${months === 1 ? "mes" : "meses"}`;
  const yearLabel = `${years} ${years === 1 ? "año" : "años"}`;
  if (rest === 0) return yearLabel;
  return `${yearLabel} ${rest} ${rest === 1 ? "mes" : "meses"}`;
}
