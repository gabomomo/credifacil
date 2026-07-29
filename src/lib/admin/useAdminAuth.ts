"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
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

  const signIn = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signInWithPopup(auth, new GoogleAuthProvider());
  }, []);

  const logOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signOut(auth);
  }, []);

  return { state, signIn, logOut };
}

/** Los roles que pueden modificar datos. `viewer` queda en solo lectura. */
export function canEdit(admin: AdminUser): boolean {
  return admin.role === "owner" || admin.role === "editor";
}
