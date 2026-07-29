/**
 * Modelo de datos de Firestore.
 *
 * Tres colecciones con reglas de acceso muy distintas (ver firestore.rules):
 *
 *   leads         · cualquiera CREA, solo un admin LEE      → datos personales
 *   institutions  · cualquiera LEE, solo un admin ESCRIBE   → información pública
 *   offers        · cualquiera LEE, solo un admin ESCRIBE   → información pública
 *   admins        · solo un admin LEE, nadie escribe desde el cliente
 *
 * La asimetría de `leads` es deliberada y es lo único que impide que la base de
 * nombres, correos e ingresos de los clientes quede expuesta: el formulario
 * público necesita escribir, pero jamás necesita leer.
 */

import type { ProductSlug } from "@/lib/products";
import type { EmploymentId, IncomeId } from "@/lib/lead";

/** Estado de gestión de una solicitud, editable desde el panel. */
export type LeadStatus = "nuevo" | "contactado" | "en_tramite" | "cerrado" | "descartado";

export const leadStatusLabels: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  en_tramite: "En trámite",
  cerrado: "Cerrado",
  descartado: "Descartado",
};

export interface StoredLead {
  id: string;
  name: string;
  email: string;
  /** Opcional: el wizard no lo pide, el formulario de contacto sí. */
  phone?: string;
  product: ProductSlug;
  /**
   * Opcionales: solo existen si la persona pasó por el wizard. Quien entra
   * directo a /contacto no los declara, y esa solicitud es igual de válida
   * (simplemente no participa del ponderado).
   */
  employment?: EmploymentId;
  income?: IncomeId;
  amount: number;
  months: number;
  /** Cuota estimada en el momento de enviar, para no recalcularla después. */
  monthlyPayment: number;
  /** Tasa usada en esa estimación (ponderada o de ejemplo). */
  annualRate: number;
  /** Mensaje libre del formulario de contacto. */
  message?: string;
  /** Origen: "wizard" (simulador) o "contacto" (formulario). */
  source: "wizard" | "contacto";
  status: LeadStatus;
  /** Notas internas del asesor. No las ve el cliente. */
  notes?: string;
  createdAt: Date;
}

export type InstitutionKind = "banco" | "cooperativa" | "mutual" | "financiera";

export const institutionKindLabels: Record<InstitutionKind, string> = {
  banco: "Banco",
  cooperativa: "Cooperativa",
  mutual: "Mutual",
  financiera: "Financiera",
};

export interface Institution {
  id: string;
  name: string;
  /** Nombre corto para tarjetas y tablas. */
  shortName: string;
  kind: InstitutionKind;
  /** Si está inactiva, no participa del ponderado ni se muestra en el sitio. */
  active: boolean;
  /**
   * Peso relativo en el ponderado (1 = neutro). Permite dar más influencia a
   * las instituciones con las que hay convenio, sin ocultar a las demás.
   */
  weight: number;
  /** Orden de aparición en la página pública. */
  order: number;
  updatedAt: Date;
}

/**
 * Condiciones que una institución ofrece para un tipo de crédito.
 *
 * Se guarda aparte de `institutions` porque una misma institución tiene una
 * oferta por producto, con criterios de elegibilidad distintos en cada una.
 */
export interface Offer {
  id: string;
  institutionId: string;
  product: ProductSlug;
  /** Tasa anual en porcentaje (ej. 8.5). */
  annualRate: number;
  /** Rango de monto que financia, en colones. */
  minAmount: number;
  maxAmount: number;
  /** Rango de plazo, en meses. */
  minMonths: number;
  maxMonths: number;
  /** Ingreso mínimo requerido: el tramo más bajo que acepta. */
  minIncome: IncomeId;
  /** Situaciones laborales que acepta. Vacío = no acepta ninguna. */
  acceptedEmployment: EmploymentId[];
  active: boolean;
  /**
   * Cuándo se verificó esta tasa con la institución. Es obligatoria: una tasa
   * real desactualizada es peor que una de ejemplo declarada como tal, así que
   * el sitio muestra esta fecha junto al resultado.
   */
  verifiedAt: Date;
  updatedAt: Date;
}

/** Persona con acceso al panel. El id del documento es el uid de Firebase Auth. */
export interface AdminUser {
  id: string;
  email: string;
  displayName?: string;
  /**
   * owner  · puede administrar usuarios
   * editor · puede editar instituciones, ofertas y leads
   * viewer · solo lectura
   */
  role: "owner" | "editor" | "viewer";
  createdAt: Date;
}

export const roleLabels: Record<AdminUser["role"], string> = {
  owner: "Propietario",
  editor: "Editor",
  viewer: "Solo lectura",
};
