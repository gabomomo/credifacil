"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Info } from "lucide-react";
import { listAdmins, saveAdmin, revokeAdmin } from "@/lib/db/admins";
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
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminUser["role"]>("editor");

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
    if (!uid.trim() || !email.trim()) return;
    try {
      await saveAdmin(uid.trim(), { email: email.trim(), role });
      setUid("");
      setEmail("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo otorgar el acceso");
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
          <h2 className="font-display text-xl font-bold text-ink">Dar acceso</h2>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-mist px-4 py-3 text-sm text-ink-soft">
            <Info className="mt-0.5 size-4 shrink-0 text-brand-600" />
            <span>
              La persona debe iniciar sesión primero en <code>/admin</code>. Ahí verá su
              identificador de usuario; pediéselo y pegalo acá.
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-ink">Identificador (uid)</span>
              <input
                className={input}
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="Ej. K2mXp9..."
                required
              />
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
            <label className="text-sm sm:col-span-3">
              <span className="mb-1 block font-medium text-ink">Correo</span>
              <input
                type="email"
                className={input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="persona@ejemplo.com"
                required
              />
            </label>
          </div>
          <Button type="submit" size="sm" className="mt-4">
            Otorgar acceso
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
