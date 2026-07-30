"use client";

import { useState } from "react";
import { AlertTriangle, LogOut, Users, Inbox, Landmark, ShieldAlert } from "lucide-react";
import { useAdminAuth, canEdit } from "@/lib/admin/useAdminAuth";
import { roleLabels } from "@/lib/db/types";
import { Button } from "@/components/ui/Button";
import { LoginForm } from "@/components/admin/LoginForm";
import { LeadsPanel } from "@/components/admin/LeadsPanel";
import { CatalogPanel } from "@/components/admin/CatalogPanel";
import { UsersPanel } from "@/components/admin/UsersPanel";
import { cn } from "@/lib/cn";

type Tab = "leads" | "catalogo" | "usuarios";

const TABS: { id: Tab; label: string; icon: typeof Inbox }[] = [
  { id: "leads", label: "Solicitudes", icon: Inbox },
  { id: "catalogo", label: "Instituciones y tasas", icon: Landmark },
  { id: "usuarios", label: "Usuarios", icon: Users },
];

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-mist py-16">
      <div className="container-x max-w-xl">{children}</div>
    </div>
  );
}

export function AdminPanel() {
  const { state, signIn, resetPassword, logOut } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("leads");

  if (state.status === "loading") {
    return (
      <Shell>
        <p className="text-center text-ink-soft">Cargando…</p>
      </Shell>
    );
  }

  if (state.status === "unconfigured") {
    return (
      <Shell>
        <div className="rounded-3xl border-2 border-sun-400 bg-sun-50 p-8">
          <AlertTriangle className="size-10 text-sun-600" />
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">
            Firebase no está configurado
          </h1>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Faltan las variables <code>NEXT_PUBLIC_FIREBASE_*</code>. Mientras no existan,
            el panel no puede funcionar y el sitio público sigue operando con las tasas de
            ejemplo y el envío por correo.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            Los pasos para crear el proyecto están en el README, sección{" "}
            <strong>Configurar Firebase</strong>.
          </p>
        </div>
      </Shell>
    );
  }

  if (state.status === "signed-out") {
    return (
      <Shell>
        <LoginForm signIn={signIn} resetPassword={resetPassword} />
      </Shell>
    );
  }

  if (state.status === "no-access") {
    return (
      <Shell>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
          <ShieldAlert className="size-10 text-brand-600" />
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">
            Tu cuenta no tiene acceso
          </h1>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Iniciaste sesión como <strong>{state.user.email}</strong>, pero esa cuenta no
            tiene permisos asignados. Puede que se los hayan revocado, o que el alta haya
            quedado a medias.
          </p>
          <p className="mt-4 text-sm text-ink-soft">
            Pedile a un propietario que revise tu acceso. Si necesita tu identificador:
          </p>
          <code className="mt-2 block break-all rounded-xl bg-mist px-4 py-3 text-sm text-ink">
            {state.user.uid}
          </code>
          <Button variant="outline" className="mt-6" onClick={logOut}>
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </div>
      </Shell>
    );
  }

  const { admin } = state;
  const editable = canEdit(admin);

  return (
    <div className="min-h-screen bg-mist py-10">
      <div className="container-x">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">Administración</h1>
            <p className="mt-1 text-sm text-ink-soft">
              {admin.email} · {roleLabels[admin.role]}
              {!editable && " · solo lectura"}
            </p>
          </div>
          <Button variant="outline" onClick={logOut}>
            <LogOut className="size-4" />
            Salir
          </Button>
        </header>

        <nav className="mt-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                tab === t.id
                  ? "bg-brand-600 text-white"
                  : "bg-white text-ink-soft hover:bg-brand-50",
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </nav>

        <main className="mt-6">
          {tab === "leads" && <LeadsPanel editable={editable} />}
          {tab === "catalogo" && <CatalogPanel editable={editable} />}
          {tab === "usuarios" && <UsersPanel admin={admin} />}
        </main>
      </div>
    </div>
  );
}
