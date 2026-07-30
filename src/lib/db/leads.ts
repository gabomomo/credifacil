/**
 * Lectura y escritura de solicitudes.
 *
 * Escribir es público (lo hace el formulario); leer requiere ser admin. Esa
 * asimetría la impone Firestore, no este archivo: ver firestore.rules.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { StoredLead, LeadStatus } from "@/lib/db/types";

const COLLECTION = "leads";

/** Datos que aporta quien envía el formulario. El resto lo pone el sistema. */
export type NewLead = Omit<StoredLead, "id" | "createdAt" | "status" | "notes">;

/**
 * Guarda una solicitud. Devuelve el id, o null si Firebase no está configurado
 * (en cuyo caso quien llama debe caer al envío por correo).
 *
 * `createdAt` usa serverTimestamp() a propósito: las reglas exigen que la fecha
 * la ponga el servidor, para que un cliente no pueda antedatar solicitudes.
 */
export async function createLead(lead: NewLead): Promise<string | null> {
  const db = getDb();
  if (!db) return null;

  // Firestore rechaza los campos undefined, y las reglas usan lista blanca:
  // se envía solo lo que tiene valor.
  const payload: Record<string, unknown> = {
    name: lead.name,
    email: lead.email,
    product: lead.product,
    amount: lead.amount,
    months: lead.months,
    monthlyPayment: lead.monthlyPayment,
    annualRate: lead.annualRate,
    source: lead.source,
    status: "nuevo",
    createdAt: serverTimestamp(),
  };
  if (lead.phone) payload.phone = lead.phone;
  if (lead.message) payload.message = lead.message;
  if (lead.employment) payload.employment = lead.employment;
  if (lead.income) payload.income = lead.income;

  const ref = await addDoc(collection(db, COLLECTION), payload);
  return ref.id;
}

function toDate(value: unknown): Date {
  return value instanceof Timestamp ? value.toDate() : new Date(0);
}

/** Lista todas las solicitudes, de la más reciente a la más antigua. */
export async function listLeads(): Promise<StoredLead[]> {
  const db = getDb();
  if (!db) return [];

  const snap = await getDocs(
    query(collection(db, COLLECTION), orderBy("createdAt", "desc")),
  );

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name ?? "",
      email: data.email ?? "",
      phone: data.phone,
      product: data.product,
      employment: data.employment,
      income: data.income,
      amount: data.amount ?? 0,
      months: data.months ?? 0,
      monthlyPayment: data.monthlyPayment ?? 0,
      annualRate: data.annualRate ?? 0,
      message: data.message,
      source: data.source ?? "contacto",
      status: (data.status ?? "nuevo") as LeadStatus,
      notes: data.notes,
      createdAt: toDate(data.createdAt),
    } satisfies StoredLead;
  });
}

export async function updateLead(
  id: string,
  changes: Partial<Pick<StoredLead, "status" | "notes">>,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await updateDoc(doc(db, COLLECTION, id), changes);
}

/** Campos que el propio visitante puede completar sobre su solicitud. */
export type LeadCompletion = Partial<
  Pick<
    StoredLead,
    | "phone" | "message" | "amount" | "months"
    | "monthlyPayment" | "annualRate" | "product" | "employment" | "income"
  >
>;

/**
 * Completa una solicitud ya guardada, desde el sitio público.
 *
 * Se usa cuando la persona afina el monto en el simulador o agrega un mensaje
 * en el formulario: sin esto habría que crear un documento por cada paso y el
 * panel se llenaría de duplicados de la misma persona.
 *
 * Las reglas solo lo permiten mientras `status` siga en 'nuevo' y únicamente
 * sobre estos campos. Devuelve false si Firestore lo rechaza —por ejemplo,
 * porque un asesor ya tomó la solicitud— para que quien llama decida qué hacer.
 */
export async function completeLead(id: string, changes: LeadCompletion): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  // Firestore rechaza undefined y las reglas usan lista blanca: se envía
  // solo lo que tiene valor.
  const payload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(changes)) {
    if (v !== undefined && v !== "") payload[k] = v;
  }
  if (Object.keys(payload).length === 0) return true;

  try {
    await updateDoc(doc(db, COLLECTION, id), payload);
    return true;
  } catch {
    return false;
  }
}

export async function deleteLead(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, COLLECTION, id));
}
