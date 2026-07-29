/**
 * Instituciones y sus ofertas de crédito.
 *
 * Van juntas porque casi siempre se consultan juntas: una oferta sin su
 * institución no dice nada, y el ponderado necesita ambas.
 *
 * Lectura pública (es información comercial que el sitio muestra abiertamente),
 * escritura solo para admins.
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
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Institution, Offer } from "@/lib/db/types";

const INSTITUTIONS = "institutions";
const OFFERS = "offers";

function toDate(value: unknown): Date {
  return value instanceof Timestamp ? value.toDate() : new Date(0);
}

// ---------- Instituciones ----------

export async function listInstitutions(): Promise<Institution[]> {
  const db = getDb();
  if (!db) return [];

  const snap = await getDocs(query(collection(db, INSTITUTIONS), orderBy("order", "asc")));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name ?? "",
      shortName: data.shortName ?? data.name ?? "",
      kind: data.kind ?? "banco",
      active: data.active ?? true,
      // Un peso ausente es neutro; nunca 0, que distorsionaría el ponderado.
      weight: typeof data.weight === "number" ? data.weight : 1,
      order: data.order ?? 0,
      updatedAt: toDate(data.updatedAt),
    } satisfies Institution;
  });
}

export type InstitutionInput = Omit<Institution, "id" | "updatedAt">;

export async function saveInstitution(
  id: string | null,
  data: InstitutionInput,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const payload = { ...data, updatedAt: serverTimestamp() };
  if (id) {
    await setDoc(doc(db, INSTITUTIONS, id), payload, { merge: true });
  } else {
    await addDoc(collection(db, INSTITUTIONS), payload);
  }
}

/**
 * Borra la institución y, en cascada, sus ofertas: dejarlas huérfanas las
 * volvería invisibles en el panel pero seguirían pesando en cualquier consulta
 * que no cruce por institución.
 */
export async function deleteInstitution(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  const offers = await listOffers();
  await Promise.all(
    offers.filter((o) => o.institutionId === id).map((o) => deleteOffer(o.id)),
  );
  await deleteDoc(doc(db, INSTITUTIONS, id));
}

// ---------- Ofertas ----------

export async function listOffers(): Promise<Offer[]> {
  const db = getDb();
  if (!db) return [];

  const snap = await getDocs(collection(db, OFFERS));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      institutionId: data.institutionId ?? "",
      product: data.product,
      annualRate: data.annualRate ?? 0,
      minAmount: data.minAmount ?? 0,
      maxAmount: data.maxAmount ?? 0,
      minMonths: data.minMonths ?? 0,
      maxMonths: data.maxMonths ?? 0,
      minIncome: data.minIncome ?? "r1",
      acceptedEmployment: data.acceptedEmployment ?? [],
      active: data.active ?? true,
      verifiedAt: toDate(data.verifiedAt),
      updatedAt: toDate(data.updatedAt),
    } satisfies Offer;
  });
}

export type OfferInput = Omit<Offer, "id" | "updatedAt">;

export async function saveOffer(id: string | null, data: OfferInput): Promise<void> {
  const db = getDb();
  if (!db) return;
  const payload = {
    ...data,
    verifiedAt: Timestamp.fromDate(data.verifiedAt),
    updatedAt: serverTimestamp(),
  };
  if (id) {
    await setDoc(doc(db, OFFERS, id), payload, { merge: true });
  } else {
    await addDoc(collection(db, OFFERS), payload);
  }
}

export async function deleteOffer(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, OFFERS, id));
}

/** Carga el catálogo completo en una sola pasada, para el simulador. */
export async function loadCatalog(): Promise<{
  institutions: Institution[];
  offers: Offer[];
}> {
  const [institutions, offers] = await Promise.all([listInstitutions(), listOffers()]);
  return { institutions, offers };
}
