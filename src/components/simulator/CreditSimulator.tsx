"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Info, ArrowRight } from "lucide-react";
import { products, type ProductSlug } from "@/lib/products";
import { calculateLoan, formatCRC, formatNumber } from "@/lib/simulator";
import { cn } from "@/lib/cn";

interface Props {
  /** Producto inicial seleccionado */
  initialSlug?: ProductSlug;
  /** Oculta el selector de tipo de crédito (para páginas de un solo producto) */
  lockProduct?: boolean;
  className?: string;
}

export function CreditSimulator({ initialSlug = "hipotecario", lockProduct = false, className }: Props) {
  const [slug, setSlug] = useState<ProductSlug>(initialSlug);
  const product = useMemo(() => products.find((p) => p.slug === slug)!, [slug]);

  const [amount, setAmount] = useState(product.amount.default);
  const [months, setMonths] = useState(product.term.default);

  // Al cambiar de producto, reajustar monto/plazo a los rangos válidos
  function changeProduct(next: ProductSlug) {
    const p = products.find((x) => x.slug === next)!;
    setSlug(next);
    setAmount((a) => Math.min(Math.max(a, p.amount.min), p.amount.max));
    setMonths(p.term.default);
  }

  const result = useMemo(
    () => calculateLoan({ amount, annualRate: product.exampleRate, months }),
    [amount, months, product.exampleRate],
  );

  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const termLabel =
    years > 0
      ? `${years} ${years === 1 ? "año" : "años"}${remMonths ? ` ${remMonths} m` : ""}`
      : `${months} meses`;

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
          onChange={(e) => setAmount(Number(e.target.value))}
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
          onChange={(e) => setMonths(Number(e.target.value))}
          className="cf-range"
          aria-label="Plazo en meses"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>{Math.round(product.term.min / 12) || product.term.min} {product.term.min >= 12 ? "años" : "meses"}</span>
          <span>{Math.round(product.term.max / 12)} años</span>
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
            <p className="text-brand-200">Tasa de ejemplo</p>
            <p className="font-semibold">{product.exampleRate}% anual</p>
          </div>
          <div>
            <p className="text-brand-200">Total a pagar</p>
            <p className="font-semibold">{formatCRC(result.totalPaid)}</p>
          </div>
        </div>
      </div>

      <Link
        href="/contacto"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-600"
      >
        Solicitar con estas condiciones
        <ArrowRight className="size-5" />
      </Link>

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
        <Info className="mt-0.5 size-4 shrink-0 text-slate-400" />
        Cálculo referencial con tasa de ejemplo y sistema de cuota fija. No incluye
        seguros, comisiones ni gastos de formalización. No constituye una oferta de crédito.
      </p>
    </div>
  );
}
