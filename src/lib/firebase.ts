/**
 * Inicialización del cliente de Firebase.
 *
 * La configuración llega por variables NEXT_PUBLIC_*, que Next incrusta en el
 * bundle al compilar. Eso es lo normal y esperado en Firebase: la config de una
 * app web NO es un secreto. Lo que protege los datos son las reglas de
 * Firestore (firestore.rules), no ocultar estos valores.
 *
 * Si faltan las variables, `getDb()` devuelve null y toda la app degrada con
 * gracia: el simulador usa las tasas de ejemplo de products.ts y el formulario
 * cae al envío por correo. El sitio nunca debe romperse por falta de backend.
 */

import { initializeApp, getApps, deleteApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** true si hay configuración suficiente para hablar con Firebase. */
export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

let app: FirebaseApp | null = null;

function getApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (app) return app;
  // getApps() evita reinicializar durante el hot reload del servidor de desarrollo.
  app = getApps()[0] ?? initializeApp(config as Required<typeof config>);
  return app;
}

let db: Firestore | null = null;

export function getDb(): Firestore | null {
  const a = getApp();
  if (!a) return null;
  db ??= getFirestore(a);
  return db;
}

let auth: Auth | null = null;

export function getFirebaseAuth(): Auth | null {
  const a = getApp();
  if (!a) return null;
  auth ??= getAuth(a);
  return auth;
}

/**
 * Ejecuta `fn` sobre una instancia de Firebase APARTE, con su propia sesión.
 *
 * Existe por una particularidad de Firebase Auth: crear un usuario con
 * `createUserWithEmailAndPassword` deja la sesión iniciada como ESE usuario. Si
 * se hiciera sobre la instancia principal, el administrador que da de alta a
 * alguien quedaría expulsado de su propia sesión en el acto.
 *
 * La instancia secundaria se destruye al terminar, pase lo que pase.
 */
export async function withSecondaryAuth<T>(fn: (auth: Auth) => Promise<T>): Promise<T> {
  if (!isFirebaseConfigured()) throw new Error("Firebase no está configurado");

  // El nombre debe ser único: dos altas seguidas no pueden chocar entre sí.
  const name = `alta-${Math.random().toString(36).slice(2)}`;
  const secondary = initializeApp(config as Required<typeof config>, name);
  try {
    return await fn(getAuth(secondary));
  } finally {
    await deleteApp(secondary);
  }
}
