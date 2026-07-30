/**
 * Personas con acceso al panel.
 *
 * El id de cada documento es el uid de Firebase Auth, no el correo: es lo que
 * permite que las reglas resuelvan "¿este usuario es admin?" con una sola
 * lectura por uid, sin poder falsificarla desde el cliente.
 *
 * ⚠️ El PRIMER admin hay que crearlo a mano en la consola de Firebase: las
 * reglas exigen ser owner para otorgar acceso, así que sin ese documento
 * inicial nadie puede entrar. Ver el README.
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { AdminUser } from "@/lib/db/types";

const COLLECTION = "admins";

function toDate(value: unknown): Date {
  return value instanceof Timestamp ? value.toDate() : new Date(0);
}

/**
 * Devuelve el registro de admin del uid dado, o null si no lo es.
 *
 * Es la consulta que decide si se abre el panel. Un fallo de permisos también
 * devuelve null: quien no puede leer su propio documento, no es admin.
 */
export async function getAdmin(uid: string): Promise<AdminUser | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, COLLECTION, uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      email: data.email ?? "",
      displayName: data.displayName,
      role: data.role ?? "viewer",
      createdAt: toDate(data.createdAt),
    } satisfies AdminUser;
  } catch {
    return null;
  }
}

export async function listAdmins(): Promise<AdminUser[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      email: data.email ?? "",
      displayName: data.displayName,
      role: data.role ?? "viewer",
      createdAt: toDate(data.createdAt),
    } satisfies AdminUser;
  });
}

/**
 * Otorga o actualiza acceso. Requiere el uid, que la persona obtiene al
 * iniciar sesión por primera vez (el panel se lo muestra aunque no tenga
 * permiso todavía, justamente para que se lo pase a un owner).
 */
export async function saveAdmin(
  uid: string,
  data: { email: string; displayName?: string; role: AdminUser["role"] },
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const payload: Record<string, unknown> = {
    email: data.email,
    role: data.role,
    createdAt: serverTimestamp(),
  };
  if (data.displayName) payload.displayName = data.displayName;
  await setDoc(doc(db, COLLECTION, uid), payload, { merge: true });
}

export async function revokeAdmin(uid: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, COLLECTION, uid));
}

/**
 * Da de alta a una persona: crea la cuenta en Firebase Auth y su permiso en
 * `admins`, en un solo paso.
 *
 * La cuenta se crea sobre una instancia secundaria de Firebase (ver
 * `withSecondaryAuth`) porque `createUserWithEmailAndPassword` deja la sesión
 * iniciada como el usuario nuevo: hacerlo sobre la instancia principal
 * expulsaría de su sesión a quien está dando el alta.
 *
 * Si falla la escritura del permiso, la cuenta de Auth ya quedó creada y no se
 * puede deshacer desde el cliente (borrar usuarios ajenos exige el Admin SDK,
 * que necesita servidor). Por eso se avisa explícitamente en vez de fingir que
 * no pasó nada: esa persona podrá iniciar sesión pero verá "sin acceso", y hay
 * que reintentar el alta con el uid que se devuelve.
 */
export async function createAdminUser(data: {
  email: string;
  password: string;
  displayName?: string;
  role: AdminUser["role"];
}): Promise<{ uid: string; permissionSaved: boolean }> {
  const { withSecondaryAuth } = await import("@/lib/firebase");
  const { createUserWithEmailAndPassword } = await import("firebase/auth");

  const uid = await withSecondaryAuth(async (auth) => {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    return cred.user.uid;
  });

  try {
    await saveAdmin(uid, {
      email: data.email,
      displayName: data.displayName,
      role: data.role,
    });
    return { uid, permissionSaved: true };
  } catch {
    return { uid, permissionSaved: false };
  }
}
