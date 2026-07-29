"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Send, Sparkles } from "lucide-react";
import { products } from "@/lib/products";
import { employmentOptions, incomeOptions, useLead } from "@/lib/lead";
import { formatNumber, formatTerm } from "@/lib/simulator";
import { Button } from "@/components/ui/Button";

const inputBase =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 transition";

interface Props {
  /** Producto preseleccionado */
  defaultProduct?: string;
}

export function ContactForm({ defaultProduct }: Props) {
  const [sent, setSent] = useState(false);
  /** Datos del wizard del simulador, si la persona pasó por ahí. */
  const lead = useLead();

  // Solo diseño: no envía datos a ningún servidor todavía.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-accent-200 bg-accent-50 p-8 text-center">
        <CheckCircle2 className="mx-auto size-14 text-accent-500" />
        <h3 className="mt-4 font-display text-2xl font-bold text-ink">
          ¡Solicitud recibida!
        </h3>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">
          Gracias por tu interés. Un asesor de Credifácil se pondrá en contacto con vos muy
          pronto. (Demostración: el formulario aún no está conectado a un servidor.)
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Enviar otra solicitud
        </Button>
      </div>
    );
  }

  return (
    /*
     * Campos no controlados con defaultValue. La `key` es deliberada: el lead
     * solo aparece tras la hidratación, y cambiarla remonta el formulario para
     * que los defaultValue se apliquen. Sin ella, React ignoraría el dato
     * tardío y los campos quedarían vacíos.
     */
    <form
      key={lead ? "prellenado" : "vacio"}
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8"
    >
      {lead && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-ink">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-brand-600" />
          <span>
            Completamos tus datos con la simulación que acabas de hacer. Revísalos y
            corrige lo que haga falta.
          </span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-ink">
            Nombre completo
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={lead?.name ?? ""}
            placeholder="Tu nombre"
            autoComplete="name"
            className={inputBase}
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={lead?.email ?? ""}
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
            className={inputBase}
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-ink">
            Teléfono / WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="8888 8888"
            autoComplete="tel"
            className={inputBase}
          />
        </div>

        <div>
          <label htmlFor="product" className="mb-1.5 block text-sm font-semibold text-ink">
            Tipo de crédito
          </label>
          <select
            id="product"
            name="product"
            defaultValue={lead?.product ?? defaultProduct ?? ""}
            className={inputBase}
          >
            <option value="" disabled>
              Selecciona…
            </option>
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                Crédito {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="mb-1.5 block text-sm font-semibold text-ink">
            Monto aproximado (₡)
          </label>
          <input
            id="amount"
            name="amount"
            type="text"
            inputMode="numeric"
            defaultValue={lead ? formatNumber(lead.amount) : ""}
            placeholder="15.000.000"
            className={inputBase}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-ink">
            Cuéntanos qué necesitas (opcional)
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Ej. Quiero comprar una casa usada de ₡60 millones…"
            className={`${inputBase} resize-none`}
          />
        </div>
      </div>

      {lead && (
        <div className="mt-5 rounded-2xl bg-mist px-4 py-3 text-sm text-ink-soft">
          <span className="font-semibold text-ink">Del simulador:</span>{" "}
          {employmentOptions.find((o) => o.id === lead.employment)?.label} · ingreso
          mensual {incomeOptions.find((o) => o.id === lead.income)?.label} · plazo{" "}
          {formatTerm(lead.months)}
          {/* Ocultos para que viajen cuando se conecte el backend. */}
          <input type="hidden" name="employment" value={lead.employment} />
          <input type="hidden" name="income" value={lead.income} />
          <input type="hidden" name="months" value={lead.months} />
        </div>
      )}

      <label className="mt-5 flex items-start gap-3 text-sm text-ink-soft">
        <input
          type="checkbox"
          required
          className="mt-1 size-4 shrink-0 accent-[var(--color-brand-600)]"
        />
        <span>
          Autorizo a Credifácil a contactarme y a tratar mis datos para gestionar mi
          solicitud, conforme a los{" "}
          <Link
            href="/terminos"
            target="_blank"
            className="font-semibold text-brand-700 underline"
          >
            términos y el tratamiento de datos
          </Link>
          .
        </span>
      </label>

      <Button type="submit" size="lg" className="mt-6 w-full">
        <Send className="size-5" />
        Enviar solicitud
      </Button>

      <p className="mt-4 text-center text-xs text-slate-400">
        Al enviar aceptas ser contactado. Sin costo ni compromiso.
      </p>
    </form>
  );
}
