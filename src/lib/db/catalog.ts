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
import type { Institution as CodeInstitution } from "@/lib/institutions";

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

// ---------- Importación inicial ----------

const KIND_BY_TYPE: Record<CodeInstitution["type"], Institution["kind"]> = {
  Banco: "banco",
  Cooperativa: "cooperativa",
  Mutual: "mutual",
  Financiera: "financiera",
};

/**
 * Vuelca las instituciones que ya están en `src/lib/institutions.ts` a Firestore,
 * para no teclear trece fichas a mano.
 *
 * Dos decisiones importantes:
 *
 * 1. Los ids de documento son la `key` del código y `<key>_<producto>`, así que
 *    reimportar ACTUALIZA en vez de duplicar. Se puede correr sin miedo.
 *
 * 2. Las ofertas se crean **inactivas** y con `verifiedAt` en el epoch. Los
 *    nombres y tipos de institución son hechos; las tasas NO: las de
 *    `products.ts` son de ejemplo. Importarlas activas metería cifras
 *    inventadas en el ponderado, que es justo lo que no debe pasar. Quedan como
 *    borradores: hay que poner la tasa real y activarlas una por una.
 */
export async function seedFromCode(): Promise<{ institutions: number; offers: number }> {
  const db = getDb();
  if (!db) return { institutions: 0, offers: 0 };

  const [{ institutions: source }, { products }] = await Promise.all([
    import("@/lib/institutions"),
    import("@/lib/products"),
  ]);

  let offerCount = 0;

  await Promise.all(
    source.map(async (i, index) => {
      await setDoc(
        doc(db, INSTITUTIONS, i.key),
        {
          name: i.name,
          shortName: i.monogram,
          kind: KIND_BY_TYPE[i.type],
          active: true,
          weight: 1,
          order: index,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      await Promise.all(
        i.products.map(async (slug) => {
          const p = products.find((x) => x.slug === slug);
          if (!p) return;
          offerCount++;
          await setDoc(
            doc(db, OFFERS, `${i.key}_${slug}`),
            {
              institutionId: i.key,
              product: slug,
              annualRate: p.exampleRate,
              minAmount: p.amount.min,
              maxAmount: p.amount.max,
              minMonths: p.term.min,
              maxMonths: p.term.max,
              minIncome: "r1",
              acceptedEmployment: ["publico", "privado", "independiente"],
              // Inactiva y sin verificar: no entra al ponderado hasta que
              // alguien confirme la tasa con la institución.
              active: false,
              verifiedAt: Timestamp.fromDate(new Date(0)),
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );
        }),
      );
    }),
  );

  return { institutions: source.length, offers: offerCount };
}
