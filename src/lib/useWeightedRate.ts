"use client";

import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { weightedRate, type Applicant, type WeightedRate } from "@/lib/rating";
import type { Institution, Offer } from "@/lib/db/types";

/**
 * Catálogo compartido por todas las instancias del simulador.
 *
 * Se carga una sola vez por sesión: son datos públicos e idénticos para
 * cualquier visitante, y volver a pedirlos en cada render del simulador sería
 * una lectura de Firestore por cada movimiento del slider.
 */
let catalogPromise: Promise<{ institutions: Institution[]; offers: Offer[] }> | null = null;

function loadCatalogOnce() {
  catalogPromise ??= import("@/lib/db/catalog")
    .then((m) => m.loadCatalog())
    .catch(() => ({ institutions: [], offers: [] }));
  return catalogPromise;
}

/**
 * Tasa ponderada para el perfil dado, o null mientras carga / cuando no hay
 * ninguna oferta que calce.
 *
 * Quien llama debe usar la tasa de ejemplo del producto como valor por defecto:
 * el simulador tiene que mostrar una cifra desde el primer render, sin esperar
 * a la red.
 */
export function useWeightedRate(applicant: Applicant | null): WeightedRate | null {
  const [catalog, setCatalog] = useState<{
    institutions: Institution[];
    offers: Offer[];
  } | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    let cancelled = false;
    loadCatalogOnce().then((c) => {
      if (!cancelled) setCatalog(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!catalog || !applicant) return null;
  return weightedRate(catalog.offers, catalog.institutions, applicant);
}
