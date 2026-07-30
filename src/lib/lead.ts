/**
 * Modelo del "lead": los datos que el visitante va dejando en el wizard del
 * simulador y que luego se reutilizan para prellenar el formulario de contacto.
 *
 * El lead vive en sessionStorage (no en la URL) porque incluye datos personales
 * —nombre, correo, rango de ingresos— que no deben quedar en el historial del
 * navegador, en los encabezados Referer ni en herramientas de analítica.
 */

import { useSyncExternalStore } from "react";
import { site } from "@/lib/site";
import { isFirebaseConfigured } from "@/lib/firebase";
import { products, type ProductSlug } from "@/lib/products";
import { formatCRC, formatTerm } from "@/lib/simulator";

/** Situación laboral: define qué documentación pedirá la institución. */
export type EmploymentId = "publico" | "privado" | "independiente";

export const employmentOptions: {
  id: EmploymentId;
  label: string;
  hint: string;
}[] = [
  {
    id: "publico",
    label: "Asalariado público",
    hint: "Trabajas para una institución del Estado",
  },
  {
    id: "privado",
    label: "Asalariado privado",
    hint: "Trabajas para una empresa privada",
  },
  {
    id: "independiente",
    label: "Independiente",
    hint: "Cuenta propia, profesional liberal o negocio propio",
  },
];

/** Rango de ingreso mensual bruto, en colones. */
export type IncomeId = "r1" | "r2" | "r3" | "r4" | "r5";

export const incomeOptions: { id: IncomeId; label: string }[] = [
  { id: "r1", label: "Menos de ₡400.000" },
  { id: "r2", label: "₡400.000 – ₡800.000" },
  { id: "r3", label: "₡800.000 – ₡1.500.000" },
  { id: "r4", label: "₡1.500.000 – ₡3.000.000" },
  { id: "r5", label: "Más de ₡3.000.000" },
];

export interface Lead {
  name: string;
  email: string;
  /**
   * WhatsApp. Opcional a propósito: es el campo que más abandono provoca, y un
   * lead sin teléfono sigue siendo contactable por correo.
   */
  phone?: string;
  /** El visitante marcó la casilla de tratamiento de datos. */
  acceptedTerms: boolean;
  product: ProductSlug;
  employment: EmploymentId;
  income: IncomeId;
  /** Monto solicitado en colones. */
  amount: number;
  /** Plazo en meses. */
  months: number;
}

const STORAGE_KEY = "credifacil:lead";
/**
 * Id del documento ya creado en Firestore. Vive aparte del lead porque su
 * función es distinta: evitar que un mismo visitante genere varias solicitudes
 * duplicadas al avanzar por el sitio.
 */
const LEAD_ID_KEY = "credifacil:leadId";

export function saveLeadId(id: string): void {
  try {
    sessionStorage.setItem(LEAD_ID_KEY, id);
  } catch {
    // Sin sessionStorage se perdería la referencia y una segunda acción
    // crearía otro documento. Es degradado aceptable: nunca se pierde el lead.
  }
}

export function loadLeadId(): string | null {
  try {
    return sessionStorage.getItem(LEAD_ID_KEY);
  } catch {
    return null;
  }
}

/**
 * Guarda el lead para que sobreviva a la navegación entre /simulador y
 * /contacto. Silencioso si sessionStorage no está disponible (modo privado de
 * Safari, cookies bloqueadas): perder el prellenado no debe romper la página.
 */
export function saveLead(lead: Lead): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lead));
  } catch {
    // sessionStorage no disponible: seguimos sin prellenado.
  }
}

/** Recupera el lead guardado, o null si no hay ninguno o está corrupto. */
export function loadLead(): Lead | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Lead>;
    // Validación mínima: sin estos campos el prellenado no aporta nada.
    if (!parsed.name || !parsed.email || !parsed.product) return null;
    return parsed as Lead;
  } catch {
    return null;
  }
}

export function clearLead(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(LEAD_ID_KEY);
  } catch {
    // Nada que hacer.
  }
}

/**
 * Guarda la solicitud al terminar el wizard.
 *
 * Se llama al pulsar "Ver mi cuota": a partir de ahí el lead ya está en la base
 * aunque la persona no haga nada más. Si Firebase no está configurado o la
 * escritura falla, no se avisa en pantalla —la persona vino a ver su cuota, no
 * a que le informen del backend— pero se devuelve null para que quien llama
 * sepa que después habrá que recurrir al correo.
 */
export async function persistLead(
  lead: Lead,
  result: { monthlyPayment: number },
  annualRate: number,
): Promise<string | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const { createLead, completeLead } = await import("@/lib/db/leads");

    // Rehacer el wizard con "Cambiar mis datos" no debe generar una segunda
    // solicitud de la misma persona: si ya hay documento, se actualiza.
    const existing = loadLeadId();
    if (existing) {
      await completeLead(existing, {
        phone: lead.phone,
        amount: lead.amount,
        months: lead.months,
        monthlyPayment: result.monthlyPayment,
        annualRate,
        product: lead.product,
        employment: lead.employment,
        income: lead.income,
      });
      return existing;
    }

    const id = await createLead({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      product: lead.product,
      employment: lead.employment,
      income: lead.income,
      amount: lead.amount,
      months: lead.months,
      monthlyPayment: result.monthlyPayment,
      annualRate,
      source: "wizard",
    });
    if (id) saveLeadId(id);
    return id;
  } catch {
    return null;
  }
}

/*
 * Lectura del lead desde React.
 *
 * sessionStorage no existe cuando Next prerenderiza el HTML estático, así que
 * el valor solo puede aparecer después de la hidratación. useSyncExternalStore
 * es el mecanismo previsto para eso: devuelve null en el servidor y el valor
 * real en el cliente, sin desajuste de hidratación ni setState en un efecto.
 *
 * El resultado se memoiza contra la cadena cruda porque getSnapshot debe
 * devolver la MISMA referencia mientras el dato no cambie; un JSON.parse en
 * cada llamada crearía un objeto nuevo y React entraría en un bucle infinito.
 */
let cachedRaw: string | null = null;
let cachedLead: Lead | null = null;

function getLeadSnapshot(): Lead | null {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedLead = loadLead();
  }
  return cachedLead;
}

/** El lead no cambia durante la vida de la página: no hay a qué suscribirse. */
function subscribeToLead(): () => void {
  return () => {};
}

function getLeadServerSnapshot(): Lead | null {
  return null;
}

export function useLead(): Lead | null {
  return useSyncExternalStore(subscribeToLead, getLeadSnapshot, getLeadServerSnapshot);
}

function labelFor<T extends { id: string; label: string }>(
  options: T[],
  id: string,
): string {
  return options.find((o) => o.id === id)?.label ?? id;
}

/** Resumen legible del lead, usado en el correo y en el mensaje de WhatsApp. */
export function formatLeadSummary(
  lead: Lead,
  result: { monthlyPayment: number; totalPaid: number },
): string {
  const product = products.find((p) => p.slug === lead.product);
  const term = formatTerm(lead.months);

  return [
    `Simulación de crédito — ${site.name}`,
    "",
    `Nombre: ${lead.name}`,
    `Correo: ${lead.email}`,
    ...(lead.phone ? [`WhatsApp: ${lead.phone}`] : []),
    `Tipo de crédito: ${product ? `Crédito ${product.name}` : lead.product}`,
    `Situación laboral: ${labelFor(employmentOptions, lead.employment)}`,
    `Ingreso mensual: ${labelFor(incomeOptions, lead.income)}`,
    "",
    `Monto solicitado: ${formatCRC(lead.amount)}`,
    `Plazo: ${term}`,
    `Tasa de ejemplo: ${product?.exampleRate ?? "—"}% anual`,
    `Cuota mensual estimada: ${formatCRC(result.monthlyPayment)}`,
    `Total a pagar: ${formatCRC(result.totalPaid)}`,
    "",
    "Cálculo referencial con tasa de ejemplo y sistema de cuota fija. No incluye",
    "seguros, comisiones ni gastos de formalización. No constituye una oferta de crédito.",
  ].join("\n");
}

/** Abre el cliente de correo con el resumen redactado y Credifácil en copia. */
export function openLeadEmail(
  lead: Lead,
  result: { monthlyPayment: number; totalPaid: number },
): void {
  const subject = `Mi simulación de crédito en ${site.name}`;
  const body = formatLeadSummary(lead, result);
  const url =
    `mailto:${encodeURIComponent(lead.email)}` +
    `?cc=${encodeURIComponent(site.email.address)}` +
    `&subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;
  window.location.href = url;
}

export type SubmitOutcome =
  /**
   * Guardado en Firestore: queda en el panel. `updated` es false cuando la
   * solicitud ya existía pero no se pudo completar (normalmente porque un
   * asesor ya la tomó); el lead está a salvo igual.
   */
  | { kind: "saved"; updated?: boolean }
  /** No se pudo guardar: sin Firebase configurado, o la escritura falló. */
  | { kind: "not-saved" };

/**
 * ⚠️ ÚNICO PUNTO DE ENVÍO DE SOLICITUDES.
 *
 * El sitio se exporta estático (`output: "export"`), así que no hay API routes:
 * la persistencia va directo del navegador a Firestore, y lo que protege los
 * datos son las reglas de seguridad (firestore.rules), no este código.
 *
 * Si Firebase no está configurado —o si la escritura falla— se cae al correo.
 * Esa degradación es deliberada: perder el lead sería peor que enviarlo por un
 * camino menos cómodo.
 */
export async function submitLead(
  lead: Lead,
  result: { monthlyPayment: number; totalPaid: number },
  annualRate: number,
  source: "wizard" | "contacto" = "wizard",
  extra?: { phone?: string; message?: string },
): Promise<SubmitOutcome> {
  if (!isFirebaseConfigured()) return { kind: "not-saved" };

  try {
    const { createLead, completeLead } = await import("@/lib/db/leads");

    // Si el wizard ya creó la solicitud, se COMPLETA. Crear otra dejaría a la
    // misma persona dos veces en el panel, una por cada botón que pulse.
    const existing = loadLeadId();
    if (existing) {
      const ok = await completeLead(existing, {
        phone: extra?.phone ?? lead.phone,
        message: extra?.message,
        amount: lead.amount,
        months: lead.months,
        monthlyPayment: result.monthlyPayment,
        annualRate,
        product: lead.product,
        employment: lead.employment,
        income: lead.income,
      });
      // Un rechazo aquí suele significar que un asesor ya tomó la solicitud:
      // está guardada igual, así que se informa como guardada.
      return { kind: "saved", updated: ok };
    }

    const id = await createLead({
      name: lead.name,
      email: lead.email,
      phone: extra?.phone,
      product: lead.product,
      employment: lead.employment,
      income: lead.income,
      amount: lead.amount,
      months: lead.months,
      monthlyPayment: result.monthlyPayment,
      annualRate,
      message: extra?.message,
      source,
    });
    if (id) {
      saveLeadId(id);
      return { kind: "saved" };
    }
    return { kind: "not-saved" };
  } catch {
    // Sin conexión, reglas que rechazan, cuota agotada: el motivo da igual.
    // Quien llama decide el plan B (enviar por correo, avisar en pantalla).
    return { kind: "not-saved" };
  }
}
