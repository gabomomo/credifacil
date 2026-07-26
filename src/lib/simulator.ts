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

/** Formatea un número como colones costarricenses: ₡1.250.000 */
export function formatCRC(value: number): string {
  return crc.format(value);
}

const plain = new Intl.NumberFormat("es-CR", { maximumFractionDigits: 0 });

/** Formatea un número sin símbolo de moneda: 1.250.000 */
export function formatNumber(value: number): string {
  return plain.format(value);
}
