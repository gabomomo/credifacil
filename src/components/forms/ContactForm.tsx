"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { products } from "@/lib/products";
import { Button } from "@/components/ui/Button";

const inputBase =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 transition";

interface Props {
  /** Producto preseleccionado */
  defaultProduct?: string;
}

export function ContactForm({ defaultProduct }: Props) {
  const [sent, setSent] = useState(false);

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
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-ink">
            Nombre completo
          </label>
          <input id="name" name="name" required placeholder="Tu nombre" className={inputBase} />
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
            placeholder="tucorreo@ejemplo.com"
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
            defaultValue={defaultProduct ?? ""}
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

      <label className="mt-5 flex items-start gap-3 text-sm text-ink-soft">
        <input type="checkbox" required className="mt-1 size-4 accent-[var(--color-brand-600)]" />
        Autorizo a Credifácil a contactarme y tratar mis datos para gestionar mi solicitud.
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
