"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Pencil, MessageCircle } from "lucide-react";
import { products, type ProductSlug } from "@/lib/products";
import {
  employmentOptions,
  incomeOptions,
  saveLead,
  type EmploymentId,
  type IncomeId,
  type Lead,
} from "@/lib/lead";
import { formatCRC, formatTerm } from "@/lib/simulator";
import { CreditSimulator } from "@/components/simulator/CreditSimulator";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const STEPS = ["Tus datos", "Tipo de crédito", "Tus ingresos", "Monto y plazo"] as const;

/** Validación deliberadamente laxa: solo descarta erratas evidentes. */
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/**
 * Los números de Costa Rica son de 8 dígitos. Se ignoran espacios, guiones y un
 * prefijo +506 opcional, porque la gente escribe el número como se le ocurre y
 * rechazarlo por el formato sería absurdo.
 */
function isValidCRPhone(value: string): boolean {
  return /^\d{8}$/.test(value.replace(/[\s()+-]/g, "").replace(/^506/, ""));
}

/** Normaliza a "8888 8888" para guardar y mostrar de forma consistente. */
function normalizeCRPhone(value: string): string {
  const digits = value.replace(/[\s()+-]/g, "").replace(/^506/, "");
  return /^\d{8}$/.test(digits) ? `${digits.slice(0, 4)} ${digits.slice(4)}` : value.trim();
}

const inputBase =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 transition";

/** Tarjeta seleccionable, usada para producto, situación laboral e ingresos. */
function OptionCard({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-2xl border p-4 text-left transition-all",
        active
          ? "border-brand-600 bg-brand-50 ring-2 ring-brand-600/15"
          : "border-slate-200 hover:border-brand-300 hover:bg-slate-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function CreditWizard() {
  const [step, setStep] = useState(0);
  /** Una vez terminado el wizard, se muestra el simulador. */
  const [done, setDone] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [terms, setTerms] = useState(false);
  const [product, setProduct] = useState<ProductSlug>("hipotecario");
  const [employment, setEmployment] = useState<EmploymentId | null>(null);
  const [income, setIncome] = useState<IncomeId | null>(null);

  const selected = products.find((p) => p.slug === product)!;
  const [amount, setAmount] = useState(selected.amount.default);
  const [months, setMonths] = useState(selected.term.default);

  /** Muestra los errores solo después del primer intento de avanzar. */
  const [tried, setTried] = useState(false);

  // Al cambiar de producto, reencuadrar monto y plazo dentro del rango válido.
  function changeProduct(next: ProductSlug) {
    const p = products.find((x) => x.slug === next)!;
    setProduct(next);
    setAmount(Math.min(Math.max(amount, p.amount.min), p.amount.max));
    setMonths(p.term.default);
  }

  const stepErrors: string[] = [];
  if (step === 0) {
    if (!name.trim()) stepErrors.push("Escribe tu nombre.");
    if (!isValidEmail(email)) stepErrors.push("Escribe un correo válido.");
    // Obligatorio, pero se distingue "no lo escribió" de "lo escribió mal": el
    // segundo caso necesita un mensaje distinto para no parecer que no sirvió.
    if (!phone.trim()) {
      stepErrors.push("Escribe tu número de WhatsApp.");
    } else if (!isValidCRPhone(phone)) {
      stepErrors.push("El WhatsApp debe tener 8 dígitos (ej. 8888 8888).");
    }
    if (!terms) stepErrors.push("Debes aceptar el tratamiento de datos.");
  }
  if (step === 2) {
    if (!employment) stepErrors.push("Selecciona tu situación laboral.");
    if (!income) stepErrors.push("Selecciona tu rango de ingresos.");
  }
  const canAdvance = stepErrors.length === 0;

  function buildLead(): Lead {
    return {
      name: name.trim(),
      email: email.trim(),
      // undefined y no "" : un campo vacío no debe llegar a Firestore, que además
      // lo rechazaría por la lista blanca de las reglas.
      phone: phone.trim() ? normalizeCRPhone(phone) : undefined,
      acceptedTerms: terms,
      product,
      employment: employment!,
      income: income!,
      amount,
      months,
    };
  }

  function next() {
    if (!canAdvance) {
      setTried(true);
      return;
    }
    setTried(false);
    if (step === STEPS.length - 1) {
      saveLead(buildLead());
      setDone(true);
      return;
    }
    setStep((s) => s + 1);
  }

  function back() {
    setTried(false);
    setStep((s) => Math.max(0, s - 1));
  }

  /** El simulador puede afinar monto/plazo: hay que reflejarlo en el lead. */
  function handleSimulatorChange(nextAmount: number, nextMonths: number) {
    setAmount(nextAmount);
    setMonths(nextMonths);
    saveLead({ ...buildLead(), amount: nextAmount, months: nextMonths });
  }

  if (done) {
    return (
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent-200 bg-accent-50 px-5 py-4">
          <p className="text-sm text-ink">
            <span className="font-semibold">¡Listo, {name.trim().split(" ")[0]}!</span>{" "}
            Ajusta el monto y el plazo hasta que la cuota te calce.
          </p>
          <button
            type="button"
            onClick={() => {
              setDone(false);
              setStep(0);
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            <Pencil className="size-4" />
            Cambiar mis datos
          </button>
        </div>

        <CreditSimulator
          initialSlug={product}
          lockProduct
          initialAmount={amount}
          initialMonths={months}
          lead={buildLead()}
          onChange={handleSimulatorChange}
        />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      {/* Progreso */}
      <div className="mb-7">
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  i < step && "bg-accent-500 text-white",
                  i === step && "bg-brand-600 text-white",
                  i > step && "bg-slate-100 text-slate-400",
                )}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i < step ? "bg-accent-500" : "bg-slate-100",
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm font-semibold text-brand-600">
          Paso {step + 1} de {STEPS.length} · {STEPS[step]}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        {step === 0 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Empecemos por conocerte
            </h2>
            <p className="mt-2 text-ink-soft">
              Con estos datos te enviamos la simulación y un asesor te acompaña en el
              trámite. Sin costo ni compromiso.
            </p>

            <div className="mt-6 grid gap-5">
              <div>
                <label htmlFor="wz-name" className="mb-1.5 block text-sm font-semibold text-ink">
                  Nombre completo
                </label>
                <input
                  id="wz-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  autoComplete="name"
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor="wz-email" className="mb-1.5 block text-sm font-semibold text-ink">
                  Correo electrónico
                </label>
                <input
                  id="wz-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                  className={inputBase}
                />
              </div>

              {/*
               * Obligatorio: un lead sin teléfono no se puede gestionar. Se
               * encuadra como WhatsApp y no como "teléfono" porque lo que frena
               * a la gente no es dar el número, es imaginarse una llamada de
               * venta. Al ser obligatorio, lo que baja la resistencia ya no es
               * ofrecer omitirlo, sino decir para qué se usa.
               */}
              <div>
                <label htmlFor="wz-phone" className="mb-1.5 block text-sm font-semibold text-ink">
                  WhatsApp
                </label>
                <input
                  id="wz-phone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="8888 8888"
                  autoComplete="tel"
                  className={inputBase}
                />
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-500">
                  <MessageCircle className="mt-0.5 size-3.5 shrink-0 text-accent-500" />
                  <span>
                    Es por donde te enviamos las condiciones y te acompaña el asesor.{" "}
                    <span className="font-semibold text-ink-soft">
                      Te escribimos, no te llamamos.
                    </span>
                  </span>
                </p>
              </div>
            </div>

            <label className="mt-5 flex items-start gap-3 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-1 size-4 shrink-0 accent-[var(--color-brand-600)]"
              />
              <span>
                Acepto los{" "}
                <Link
                  href="/terminos"
                  target="_blank"
                  className="font-semibold text-brand-700 underline"
                >
                  términos y el tratamiento de mis datos
                </Link>{" "}
                y autorizo a Credifácil a contactarme para gestionar mi solicitud, conforme
                a la Ley 8968.
              </span>
            </label>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              ¿Qué crédito estás buscando?
            </h2>
            <p className="mt-2 text-ink-soft">
              Elige el que más se acerque. Después podés cambiarlo.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {products.map((p) => {
                const Icon = p.icon;
                return (
                  <OptionCard
                    key={p.slug}
                    active={p.slug === product}
                    onClick={() => changeProduct(p.slug)}
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <Icon className="size-5" />
                      </span>
                      <span>
                        <span className="block font-semibold text-ink">Crédito {p.name}</span>
                        <span className="block text-xs text-slate-500">{p.tagline}</span>
                      </span>
                    </span>
                  </OptionCard>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Contanos de tus ingresos
            </h2>
            <p className="mt-2 text-ink-soft">
              Cada institución pide documentación distinta según tu situación laboral. Esto
              nos ayuda a filtrar las opciones que de verdad te calzan.
            </p>

            <fieldset className="mt-6">
              <legend className="mb-3 text-sm font-semibold text-ink">
                Situación laboral
              </legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {employmentOptions.map((o) => (
                  <OptionCard
                    key={o.id}
                    active={o.id === employment}
                    onClick={() => setEmployment(o.id)}
                  >
                    <span className="block font-semibold text-ink">{o.label}</span>
                    <span className="mt-1 block text-xs text-slate-500">{o.hint}</span>
                  </OptionCard>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="mb-3 text-sm font-semibold text-ink">
                Ingreso mensual bruto
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {incomeOptions.map((o) => (
                  <OptionCard
                    key={o.id}
                    active={o.id === income}
                    onClick={() => setIncome(o.id)}
                    className="py-3"
                  >
                    <span className="text-sm font-semibold text-ink">{o.label}</span>
                  </OptionCard>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              ¿Cuánto necesitas y a qué plazo?
            </h2>
            <p className="mt-2 text-ink-soft">
              Un aproximado basta. En el siguiente paso vas a poder afinarlo y ver la cuota
              al instante.
            </p>

            <div className="mt-7">
              <div className="mb-2 flex items-end justify-between">
                <label htmlFor="wz-amount" className="text-sm font-semibold text-ink">
                  Monto aproximado
                </label>
                <span className="font-display text-xl font-bold text-brand-600">
                  {formatCRC(amount)}
                </span>
              </div>
              <input
                id="wz-amount"
                type="range"
                min={selected.amount.min}
                max={selected.amount.max}
                step={selected.amount.step}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="cf-range"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>{formatCRC(selected.amount.min)}</span>
                <span>{formatCRC(selected.amount.max)}</span>
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-2 flex items-end justify-between">
                <label htmlFor="wz-term" className="text-sm font-semibold text-ink">
                  Plazo
                </label>
                <span className="font-display text-xl font-bold text-brand-600">
                  {formatTerm(months)}
                </span>
              </div>
              <input
                id="wz-term"
                type="range"
                min={selected.term.min}
                max={selected.term.max}
                step={selected.term.step}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="cf-range"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>{formatTerm(selected.term.min)}</span>
                <span>{formatTerm(selected.term.max)}</span>
              </div>
            </div>
          </div>
        )}

        {tried && stepErrors.length > 0 && (
          <ul
            aria-live="polite"
            className="mt-6 space-y-1 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {stepErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex items-center gap-3">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={back}>
              <ArrowLeft className="size-5" />
              Atrás
            </Button>
          )}
          <Button type="submit" size="lg" className="flex-1">
            {step === STEPS.length - 1 ? "Ver mi cuota" : "Siguiente"}
            <ArrowRight className="size-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
