"use client";

import { useCallback, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { getAdmin } from "@/lib/db/admins";
import type { AdminUser } from "@/lib/db/types";

export type AuthState =
  | { status: "loading" }
  /** Falta configurar Firebase: el panel no puede funcionar. */
  | { status: "unconfigured" }
  | { status: "signed-out" }
  /** Autenticado pero sin registro en /admins: no tiene permiso. */
  | { status: "no-access"; user: User }
  | { status: "ready"; user: User; admin: AdminUser };

/**
 * Sesión del panel.
 *
 * Estar autenticado no basta: cualquiera con una cuenta de Google puede iniciar
 * sesión. El permiso lo da existir en la colección `admins`, y esa comprobación
 * la repiten las reglas de Firestore en cada operación. Este hook solo decide
 * qué pantalla mostrar; no es la barrera de seguridad.
 */
export function useAdminAuth() {
  // Si falta la configuración se sabe en el primer render, sin efectos: es una
  // lectura de variables de entorno, no un dato que llegue después.
  const configured = isFirebaseConfigured();
  const [state, setState] = useState<AuthState>(
    configured ? { status: "loading" } : { status: "unconfigured" },
  );

  useEffect(() => {
    if (!configured) return;
    const auth = getFirebaseAuth();
    if (!auth) return;

    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (cancelled) return;
      if (!user) {
        setState({ status: "signed-out" });
        return;
      }
      // Comprobación asíncrona del permiso; mientras tanto, "loading".
      setState({ status: "loading" });
      getAdmin(user.uid).then((admin) => {
        if (cancelled) return;
        setState(admin ? { status: "ready", user, admin } : { status: "no-access", user });
      });
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase no está configurado");
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  /** Envía el correo de restablecimiento a quien olvidó su contraseña. */
  const resetPassword = useCallback(async (email: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase no está configurado");
    await sendPasswordResetEmail(auth, email);
  }, []);

  const logOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signOut(auth);
  }, []);

  return { state, signIn, resetPassword, logOut };
}

/**
 * Traduce los códigos de Firebase Auth a algo legible.
 *
 * En el inicio de sesión se responde lo mismo ante usuario inexistente y
 * contraseña incorrecta: distinguirlos le confirmaría a un desconocido qué
 * correos tienen cuenta en el panel.
 */
export function authErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/invalid-email":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Correo o contraseña incorrectos.";
    case "auth/too-many-requests":
      return "Demasiados intentos fallidos. Esperá unos minutos.";
    case "auth/email-already-in-use":
      return "Ya existe un usuario con ese correo.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/network-request-failed":
      return "Sin conexión. Revisá tu red.";
    case "auth/operation-not-allowed":
      return "Falta activar el proveedor Correo/Contraseña en la consola de Firebase.";
    default:
      return "No se pudo completar la operación. Intentá de nuevo.";
  }
}

/** Los roles que pueden modificar datos. `viewer` queda en solo lectura. */
export function canEdit(admin: AdminUser): boolean {
  return admin.role === "owner" || admin.role === "editor";
}
