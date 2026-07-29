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
  } catch {
    // Nada que hacer.
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

/**
 * ⚠️ ÚNICO PUNTO DE CONEXIÓN CON EL BACKEND.
 *
 * El sitio se exporta estático (`output: "export"` en next.config.ts), así que
 * NO puede tener API routes de Next. Mientras no se elija un servicio, esta
 * función abre el cliente de correo del visitante con el resumen ya redactado
 * y a Credifácil en copia: el lead llega, pero depende de que la persona
 * presione "enviar" y no queda registrado en ninguna base de datos.
 *
 * Para conectarlo de verdad, sustituir el cuerpo por un POST al servicio
 * elegido (Formspree, Web3Forms, Supabase…). El resto de la app no cambia.
 */
export function submitLead(
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
