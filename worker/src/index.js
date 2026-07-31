/**
 * Envío de la simulación por correo, vía Brevo.
 *
 * Existe porque el sitio es estático y no puede guardar la clave de Brevo: todo
 * lo que va al navegador es público. Este Worker es el único lugar donde vive
 * la clave, y el sitio le pide que envíe.
 *
 * Al ser un endpoint público, se protege por capas:
 *
 *  1. Solo POST y solo desde los orígenes permitidos.
 *  2. El cuerpo se valida campo por campo, con tipos, rangos y catálogos.
 *  3. **El correo lo redacta este Worker.** Nunca se acepta HTML ni texto libre
 *     del cliente: sin eso, cualquiera podría usar el endpoint como relé para
 *     enviar spam arbitrario firmado con la marca de Credifácil. Lo peor que
 *     puede lograr un abusador es enviar una simulación de Credifácil a una
 *     dirección que él elija.
 *  4. Límite por IP, si hay un KV enlazado.
 */

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

/** Catálogos: deben coincidir con src/lib/products.ts y src/lib/lead.ts */
const PRODUCTS = {
  hipotecario: "Crédito hipotecario y de vivienda",
  personal: "Crédito personal y de consumo",
  vehiculo: "Crédito de vehículo",
  pyme: "Crédito para empresa",
};

const EMPLOYMENT = {
  publico: "Asalariado público",
  privado: "Asalariado privado",
  independiente: "Independiente",
};

const INCOME = {
  r1: "Menos de ₡400.000",
  r2: "₡400.000 – ₡800.000",
  r3: "₡800.000 – ₡1.500.000",
  r4: "₡1.500.000 – ₡3.000.000",
  r5: "Más de ₡3.000.000",
};

/** Máximo de envíos por IP dentro de la ventana. */
const RATE_LIMIT = 5;
const RATE_WINDOW_SECONDS = 3600;

function corsHeaders(origin, allowed) {
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (allowed.includes(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function json(body, status, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

/** Formatea colones con punto como separador, igual que el sitio. */
function crc(value) {
  return "₡" + Math.round(value).toLocaleString("de-DE");
}

/** "1 año 6 meses" con la concordancia correcta. */
function term(months) {
  const y = Math.floor(months / 12);
  const r = months % 12;
  if (y === 0) return `${months} ${months === 1 ? "mes" : "meses"}`;
  const yl = `${y} ${y === 1 ? "año" : "años"}`;
  return r === 0 ? yl : `${yl} ${r} ${r === 1 ? "mes" : "meses"}`;
}

/** Escapa para insertar texto de la persona en el HTML del correo. */
function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Valida el cuerpo. Devuelve { ok, data } o { ok: false, error }.
 * Es deliberadamente estricta: todo lo que no encaje se rechaza.
 */
function validate(body) {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Cuerpo inválido" };

  const { name, email, product, employment, income, amount, months, monthlyPayment, annualRate } = body;

  if (typeof name !== "string" || !name.trim() || name.length > 120) {
    return { ok: false, error: "Nombre inválido" };
  }
  if (typeof email !== "string" || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { ok: false, error: "Correo inválido" };
  }
  if (!PRODUCTS[product]) return { ok: false, error: "Producto inválido" };
  if (employment != null && !EMPLOYMENT[employment]) return { ok: false, error: "Situación laboral inválida" };
  if (income != null && !INCOME[income]) return { ok: false, error: "Rango de ingreso inválido" };

  const nums = { amount, months, monthlyPayment, annualRate };
  for (const [k, v] of Object.entries(nums)) {
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
      return { ok: false, error: `Valor numérico inválido: ${k}` };
    }
  }
  if (amount > 1_000_000_000) return { ok: false, error: "Monto fuera de rango" };
  if (months < 1 || months > 480) return { ok: false, error: "Plazo fuera de rango" };
  if (annualRate > 100) return { ok: false, error: "Tasa fuera de rango" };

  return {
    ok: true,
    data: {
      name: name.trim(),
      email: email.trim(),
      product,
      employment: employment ?? null,
      income: income ?? null,
      amount,
      months,
      monthlyPayment,
      annualRate,
    },
  };
}

/** Cuerpo del correo, redactado aquí y no recibido del cliente. */
function buildEmail(d, siteName, siteUrl) {
  const filas = [
    ["Tipo de crédito", PRODUCTS[d.product]],
    ["Monto", crc(d.amount)],
    ["Plazo", term(d.months)],
    ["Tasa de referencia", `${d.annualRate}% anual`],
    ...(d.employment ? [["Situación laboral", EMPLOYMENT[d.employment]]] : []),
    ...(d.income ? [["Ingreso mensual", INCOME[d.income]]] : []),
  ];

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;padding:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2337">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <p style="margin:0 0 24px;font-size:20px;font-weight:700;color:#5c72cf">${esc(siteName)}</p>

    <p style="margin:0 0 8px;font-size:16px">Hola ${esc(d.name.split(" ")[0])},</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4a4f66">
      Esta es la simulación que hiciste. Guardala para comparar cuando hablés con las
      instituciones.
    </p>

    <div style="background:#5c72cf;border-radius:16px;padding:24px;color:#fff;margin-bottom:24px">
      <p style="margin:0;font-size:13px;opacity:.85">Cuota mensual estimada</p>
      <p style="margin:4px 0 0;font-size:32px;font-weight:800;letter-spacing:-.5px">${crc(d.monthlyPayment)}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${filas
        .map(
          ([k, v]) =>
            `<tr><td style="padding:10px 0;color:#6b7089;border-bottom:1px solid #e8eaf2">${esc(k)}</td>` +
            `<td style="padding:10px 0;text-align:right;font-weight:600;border-bottom:1px solid #e8eaf2">${esc(v)}</td></tr>`,
        )
        .join("")}
    </table>

    <p style="margin:28px 0 0;font-size:15px;line-height:1.6;color:#4a4f66">
      Un asesor te va a contactar para ayudarte a conseguir las mejores condiciones
      reales entre bancos, cooperativas y mutuales. Sin costo ni compromiso.
    </p>

    <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#8a8fa6;border-top:1px solid #e8eaf2;padding-top:20px">
      Cálculo referencial con tasa de referencia y sistema de cuota fija. No incluye
      seguros, comisiones ni gastos de formalización. <strong>No constituye una oferta de
      crédito</strong>: la aprobación y las condiciones finales dependen de cada institución
      financiera.
    </p>
    <p style="margin:12px 0 0;font-size:12px;color:#8a8fa6">
      Recibís este correo porque lo solicitaste en ${esc(siteUrl)}.
    </p>
  </div>
</body></html>`;

  const text = [
    `${siteName} — tu simulación`,
    "",
    `Hola ${d.name.split(" ")[0]},`,
    "",
    `Cuota mensual estimada: ${crc(d.monthlyPayment)}`,
    "",
    ...filas.map(([k, v]) => `${k}: ${v}`),
    "",
    "Un asesor te va a contactar. Sin costo ni compromiso.",
    "",
    "Cálculo referencial. No constituye una oferta de crédito: la aprobación y las",
    "condiciones finales dependen de cada institución financiera.",
  ].join("\n");

  return { html, text };
}

/** Límite por IP. Si no hay KV enlazado, no limita (y se avisa en el registro). */
async function withinRateLimit(env, ip) {
  if (!env.RATE_LIMIT_KV) {
    console.warn("Sin KV enlazado: el endpoint no tiene límite por IP.");
    return true;
  }
  const key = `rl:${ip}`;
  const current = Number((await env.RATE_LIMIT_KV.get(key)) ?? 0);
  if (current >= RATE_LIMIT) return false;
  await env.RATE_LIMIT_KV.put(key, String(current + 1), {
    expirationTtl: RATE_WINDOW_SECONDS,
  });
  return true;
}

const handler = {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
    const origin = request.headers.get("Origin") ?? "";
    const cors = corsHeaders(origin, allowed);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json({ error: "Método no permitido" }, 405, cors);
    }
    // Sin origen permitido no se responde con CORS, así que el navegador
    // bloquea la respuesta igual; se corta antes para no gastar cuota.
    if (!allowed.includes(origin)) {
      return json({ error: "Origen no permitido" }, 403, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "JSON inválido" }, 400, cors);
    }

    const check = validate(body);
    if (!check.ok) return json({ error: check.error }, 400, cors);

    // El límite se cuenta DESPUÉS de validar, a propósito: una petición
    // inválida no envía correo, así que no gasta cuota de Brevo ni sirve para
    // spam. Contarla castigaría a quien se equivoca al escribir, que es
    // justamente el usuario legítimo. Del ruido volumétrico se encarga
    // Cloudflare antes de llegar acá.
    const ip = request.headers.get("CF-Connecting-IP") ?? "desconocida";
    if (!(await withinRateLimit(env, ip))) {
      return json({ error: "Demasiados envíos. Probá más tarde." }, 429, cors);
    }

    const siteName = env.SITE_NAME ?? "Credifácil";
    const siteUrl = env.SITE_URL ?? "";
    const { html, text } = buildEmail(check.data, siteName, siteUrl);

    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: env.SENDER_EMAIL, name: siteName },
        to: [{ email: check.data.email, name: check.data.name }],
        subject: `Tu simulación de crédito — ${siteName}`,
        htmlContent: html,
        textContent: text,
      }),
    });

    // El detalle de Brevo se registra pero NUNCA se devuelve al navegador:
    // puede incluir información de la cuenta.
    const detalle = await res.text();

    if (!res.ok) {
      console.error("Brevo rechazó:", res.status, detalle);
      return json({ error: "No se pudo enviar el correo" }, 502, cors);
    }

    // Se registra el messageId para poder rastrear un envío concreto en los
    // registros de Brevo cuando alguien reporte que no le llegó.
    console.log(
      "Brevo aceptó:",
      res.status,
      detalle,
      `de ${env.SENDER_EMAIL} → ${check.data.email}`,
    );
    return json({ ok: true }, 200, cors);
  },
};

export default handler;
