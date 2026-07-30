"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Info, ArrowRight, Mail } from "lucide-react";
import { products, type ProductSlug } from "@/lib/products";
import { calculateLoan, formatCRC, formatNumber, formatTerm } from "@/lib/simulator";
import { submitLead, type Lead, type SubmitOutcome } from "@/lib/lead";
import { useWeightedRate } from "@/lib/useWeightedRate";
import { verificationAgeInDays, STALE_AFTER_DAYS } from "@/lib/rating";
import { cn } from "@/lib/cn";

interface Props {
  /** Producto inicial seleccionado */
  initialSlug?: ProductSlug;
  /** Oculta el selector de tipo de crédito (para páginas de un solo producto) */
  lockProduct?: boolean;
  /** Monto inicial; por defecto, el sugerido del producto */
  initialAmount?: number;
  /** Plazo inicial en meses; por defecto, el sugerido del producto */
  initialMonths?: number;
  /**
   * Datos capturados en el wizard. Si vienen, se habilita el botón de enviar la
   * simulación por correo y el CTA arrastra la información al formulario.
   */
  lead?: Lead;
  /** Avisa al wizard de los ajustes de monto/plazo para mantener el lead al día. */
  onChange?: (amount: number, months: number) => void;
  className?: string;
}

export function CreditSimulator({
  initialSlug = "hipotecario",
  lockProduct = false,
  initialAmount,
  initialMonths,
  lead,
  onChange,
  className,
}: Props) {
  const [slug, setSlug] = useState<ProductSlug>(initialSlug);
  const product = useMemo(() => products.find((p) => p.slug === slug)!, [slug]);

  const [amount, setAmount] = useState(initialAmount ?? product.amount.default);
  const [months, setMonths] = useState(initialMonths ?? product.term.default);

  function updateAmount(next: number) {
    setAmount(next);
    onChange?.(next, months);
  }

  function updateMonths(next: number) {
    setMonths(next);
    onChange?.(amount, next);
  }

  // Al cambiar de producto, reajustar monto/plazo a los rangos válidos
  function changeProduct(next: ProductSlug) {
    const p = products.find((x) => x.slug === next)!;
    const nextAmount = Math.min(Math.max(amount, p.amount.min), p.amount.max);
    setSlug(next);
    setAmount(nextAmount);
    setMonths(p.term.default);
    onChange?.(nextAmount, p.term.default);
  }

  /*
   * Tasa: la ponderada de las instituciones para las que la persona califica y,
   * si no hay catálogo o ninguna oferta calza, la de ejemplo del producto. El
   * orden importa: `exampleRate` se usa desde el primer render, así que el
   * simulador siempre muestra una cifra sin esperar a la red.
   */
  const applicant = useMemo(
    () =>
      lead
        ? {
            product: slug,
            employment: lead.employment,
            income: lead.income,
            amount,
            months,
          }
        : null,
    [lead, slug, amount, months],
  );
  const weighted = useWeightedRate(applicant);
  const annualRate = weighted?.rate ?? product.exampleRate;

  const result = useMemo(
    () => calculateLoan({ amount, annualRate, months }),
    [amount, months, annualRate],
  );

  const staleDays = weighted
    ? verificationAgeInDays(weighted.oldestVerification, new Date())
    : 0;

  const termLabel = formatTerm(months);

  const [sending, setSending] = useState(false);
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null);

  async function sendByEmail() {
    if (!lead) return;
    setSending(true);
    const r = await submitLead({ ...lead, amount, months }, result, annualRate, "wizard", {
      phone: lead.phone,
    });
    setOutcome(r);
    setSending(false);
  }

  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8",
        className,
      )}
    >
      {!lockProduct && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-ink">
            Tipo de crédito
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {products.map((p) => {
              const Icon = p.icon;
              const active = p.slug === slug;
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => changeProduct(p.slug)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center text-xs font-semibold transition-all",
                    active
                      ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-600/15"
                      : "border-slate-200 text-ink-soft hover:border-brand-300 hover:bg-slate-50",
                  )}
                >
                  <Icon className="size-5" />
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Monto */}
      <div className="mb-6">
        <div className="mb-2 flex items-end justify-between">
          <label className="text-sm font-semibold text-ink">Monto del crédito</label>
          <span className="font-display text-xl font-bold text-brand-600">
            {formatCRC(amount)}
          </span>
        </div>
        <input
          type="range"
          min={product.amount.min}
          max={product.amount.max}
          step={product.amount.step}
          value={amount}
          onChange={(e) => updateAmount(Number(e.target.value))}
          className="cf-range"
          aria-label="Monto del crédito"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>₡{formatNumber(product.amount.min)}</span>
          <span>₡{formatNumber(product.amount.max)}</span>
        </div>
      </div>

      {/* Plazo */}
      <div className="mb-6">
        <div className="mb-2 flex items-end justify-between">
          <label className="text-sm font-semibold text-ink">Plazo</label>
          <span className="font-display text-xl font-bold text-brand-600">{termLabel}</span>
        </div>
        <input
          type="range"
          min={product.term.min}
          max={product.term.max}
          step={product.term.step}
          value={months}
          onChange={(e) => updateMonths(Number(e.target.value))}
          className="cf-range"
          aria-label="Plazo en meses"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>{formatTerm(product.term.min)}</span>
          <span>{formatTerm(product.term.max)}</span>
        </div>
      </div>

      {/* Resultado */}
      <div className="relative rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white">
        <span className="absolute -top-3 right-4 rotate-3 rounded-full bg-sun-400 px-3 py-0.5 font-hand text-lg font-bold text-brand-950 shadow-sm">
          ¡en segundos!
        </span>
        <p className="text-sm font-medium text-brand-100">Cuota mensual estimada</p>
        <p
          key={result.monthlyPayment}
          className="animate-pop mt-1 font-display text-4xl font-extrabold tracking-tight"
        >
          {formatCRC(result.monthlyPayment)}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/15 pt-4 text-sm">
          <div>
            {/* La etiqueta cambia con la procedencia del número: presentar una
                tasa real como "de ejemplo" (o al revés) sería engañoso. */}
            <p className="text-brand-200">
              {weighted ? "Tasa ponderada" : "Tasa de ejemplo"}
            </p>
            <p className="font-semibold">{annualRate}% anual</p>
            {weighted && (
              <p className="mt-0.5 text-xs text-brand-200">
                {weighted.count} institución{weighted.count === 1 ? "" : "es"} · mejor:{" "}
                {weighted.bestRate}% ({weighted.bestInstitution})
              </p>
            )}
          </div>
          <div>
            <p className="text-brand-200">Total a pagar</p>
            <p className="font-semibold">{formatCRC(result.totalPaid)}</p>
          </div>
        </div>

        {weighted && staleDays > STALE_AFTER_DAYS && (
          <p className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-xs text-brand-100">
            Algunas de estas tasas llevan {staleDays} días sin verificarse. Confirmá las
            condiciones vigentes con la institución.
          </p>
        )}
      </div>

      <Link
        href="/contacto"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-600"
      >
        Solicitar con estas condiciones
        <ArrowRight className="size-5" />
      </Link>

      {lead && (
        <button
          type="button"
          onClick={sendByEmail}
          disabled={sending}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-200 px-6 py-3 font-semibold text-brand-700 transition-colors hover:border-brand-600 hover:bg-brand-50 disabled:opacity-60"
        >
          <Mail className="size-5" />
          {sending ? "Enviando…" : "Enviarme esta simulación por correo"}
        </button>
      )}

      {outcome && (
        <p
          aria-live="polite"
          className={cn(
            "mt-3 rounded-xl px-4 py-3 text-sm",
            outcome.kind === "error"
              ? "bg-red-50 text-red-700"
              : "bg-accent-50 text-accent-700",
          )}
        >
          {outcome.kind === "saved" &&
            "¡Listo! Guardamos tu simulación y un asesor te va a contactar."}
          {outcome.kind === "emailed" &&
            "Te abrimos el correo con el resumen. Solo falta que lo envíes."}
          {outcome.kind === "error" && outcome.message}
        </p>
      )}

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
        <Info className="mt-0.5 size-4 shrink-0 text-slate-400" />
        Cálculo referencial con tasa de ejemplo y sistema de cuota fija. No incluye
        seguros, comisiones ni gastos de formalización. No constituye una oferta de crédito.
      </p>
    </div>
  );
}
