/**
 * Envío de la simulación por correo.
 *
 * El sitio no envía nada por sí mismo: le pide a un Worker de Cloudflare que lo
 * haga (ver `worker/`). La clave de Brevo vive solo ahí, porque cualquier cosa
 * que llegue al navegador es pública.
 *
 * Se manda únicamente el dato en crudo. El Worker redacta el correo: si el
 * cuerpo viajara desde acá, el endpoint serviría para enviar cualquier cosa
 * firmada con la marca de Credifácil.
 */

import type { Lead } from "@/lib/lead";

const ENDPOINT = process.env.NEXT_PUBLIC_EMAIL_ENDPOINT;

export function isEmailConfigured(): boolean {
  return Boolean(ENDPOINT);
}

export type EmailResult = "sent" | "unconfigured" | "rate-limited" | "failed";

export async function sendSimulationEmail(
  lead: Lead,
  result: { monthlyPayment: number },
  annualRate: number,
): Promise<EmailResult> {
  if (!ENDPOINT) return "unconfigured";

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: lead.name,
        email: lead.email,
        product: lead.product,
        employment: lead.employment,
        income: lead.income,
        amount: lead.amount,
        months: lead.months,
        monthlyPayment: result.monthlyPayment,
        annualRate,
      }),
    });

    if (res.ok) return "sent";
    // 429 merece un mensaje propio: no es un fallo, es "ya enviaste varias".
    if (res.status === 429) return "rate-limited";
    return "failed";
  } catch {
    // Sin conexión, CORS mal configurado, Worker caído.
    return "failed";
  }
}
