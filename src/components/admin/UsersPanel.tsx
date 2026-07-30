"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Info } from "lucide-react";
import { listAdmins, createAdminUser, revokeAdmin } from "@/lib/db/admins";
import { authErrorMessage } from "@/lib/admin/useAdminAuth";
import { roleLabels, type AdminUser } from "@/lib/db/types";
import { Button } from "@/components/ui/Button";

const input =
  "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

const dateFmt = new Intl.DateTimeFormat("es-CR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function UsersPanel({ admin }: { admin: AdminUser }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminUser["role"]>("editor");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<string | null>(null);

  const isOwner = admin.role === "owner";

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listAdmins()
      .then((d) => !cancelled && setUsers(d))
      .catch(
        (e: unknown) =>
          !cancelled && setError(e instanceof Error ? e.message : "Error al cargar"),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const load = useCallback(() => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || password.length < 6) return;
    setCreating(true);
    setError(null);
    setCreated(null);
    try {
      const r = await createAdminUser({
        email: email.trim(),
        password,
        displayName: displayName.trim() || undefined,
        role,
      });
      if (r.permissionSaved) {
        setCreated(email.trim());
        setEmail("");
        setDisplayName("");
        setPassword("");
        load();
      } else {
        // La cuenta existe pero el permiso no se guardó: hay que decirlo, no
        // dejar a alguien con una cuenta que no sirve y sin explicación.
        setError(
          `Se creó la cuenta de ${email.trim()} (uid ${r.uid}) pero no se pudo guardar ` +
            "su permiso. Volvé a intentarlo o asignalo desde la consola de Firebase.",
        );
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function revoke(u: AdminUser) {
    if (!confirm(`¿Quitar el acceso de ${u.email}?`)) return;
    try {
      await revokeAdmin(u.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo revocar");
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="font-display text-xl font-bold text-ink">Personas con acceso</h2>

        {loading ? (
          <p className="mt-6 text-center text-ink-soft">Cargando…</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-3 pr-4 font-semibold">Correo</th>
                  <th className="pb-3 pr-4 font-semibold">Rol</th>
                  <th className="pb-3 pr-4 font-semibold">Desde</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 pr-4">
                      <span className="font-medium text-ink">{u.email}</span>
                      {u.id === admin.id && (
                        <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                          vos
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{roleLabels[u.role]}</td>
                    <td className="py-3 pr-4 text-xs text-slate-500">
                      {dateFmt.format(u.createdAt)}
                    </td>
                    <td className="py-3 text-right">
                      {/* Un owner no puede revocarse a sí mismo: las reglas lo
                          rechazan, y ofrecerlo aquí solo produciría un error. */}
                      {isOwner && u.id !== admin.id && (
                        <button
                          type="button"
                          onClick={() => revoke(u)}
                          aria-label={`Quitar acceso de ${u.email}`}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isOwner ? (
        <form
          onSubmit={grant}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
        >
          <h2 className="font-display text-xl font-bold text-ink">Crear usuario</h2>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-mist px-4 py-3 text-sm text-ink-soft">
            <Info className="mt-0.5 size-4 shrink-0 text-brand-600" />
            <span>
              Se crea la cuenta y su permiso en un solo paso. Pasale la contraseña por un
              canal seguro; puede cambiarla desde <em>“Olvidé mi contraseña”</em> en la
              pantalla de acceso.
            </span>
          </div>

          {created && (
            <p className="mt-4 rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700">
              Usuario <strong>{created}</strong> creado. Ya puede entrar al panel.
            </p>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-ink">Correo</span>
              <input
                type="email"
                className={input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="persona@credifacil.cr"
                autoComplete="off"
                required
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-ink">Nombre (opcional)</span>
              <input
                className={input}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ana Rojas"
                autoComplete="off"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-ink">
                Contraseña provisional
              </span>
              <input
                type="text"
                className={input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="off"
                minLength={6}
                required
              />
              {password.length > 0 && password.length < 6 && (
                <span className="mt-1 block text-xs text-red-600">
                  Faltan {6 - password.length} caracteres
                </span>
              )}
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-ink">Rol</span>
              <select
                className={input}
                value={role}
                onChange={(e) => setRole(e.target.value as AdminUser["role"])}
              >
                {Object.entries(roleLabels).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </label>
          </div>
          <Button type="submit" size="sm" className="mt-4" disabled={creating}>
            {creating ? "Creando…" : "Crear usuario"}
          </Button>
        </form>
      ) : (
        <p className="rounded-2xl bg-white p-5 text-sm text-ink-soft shadow-soft">
          Solo un propietario puede otorgar o revocar accesos.
        </p>
      )}
    </div>
  );
}
