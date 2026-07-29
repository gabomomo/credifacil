"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, RefreshCw, AlertTriangle, Download } from "lucide-react";
import {
  listInstitutions,
  listOffers,
  saveInstitution,
  saveOffer,
  deleteInstitution,
  deleteOffer,
  type InstitutionInput,
  type OfferInput,
} from "@/lib/db/catalog";
import {
  institutionKindLabels,
  type Institution,
  type InstitutionKind,
  type Offer,
} from "@/lib/db/types";
import { employmentOptions, incomeOptions, type EmploymentId, type IncomeId } from "@/lib/lead";
import { products, type ProductSlug } from "@/lib/products";
import { formatCRC } from "@/lib/simulator";
import { STALE_AFTER_DAYS, verificationAgeInDays } from "@/lib/rating";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const input =
  "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_INSTITUTION: InstitutionInput = {
  name: "",
  shortName: "",
  kind: "banco",
  active: true,
  weight: 1,
  order: 0,
};

function emptyOffer(institutionId: string): OfferInput {
  return {
    institutionId,
    product: "hipotecario",
    annualRate: 10,
    minAmount: 1_000_000,
    maxAmount: 100_000_000,
    minMonths: 12,
    maxMonths: 240,
    minIncome: "r1",
    acceptedEmployment: ["publico", "privado", "independiente"],
    active: true,
    verifiedAt: new Date(),
  };
}

export function CatalogPanel({ editable }: { editable: boolean }) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingInst, setEditingInst] = useState<{ id: string | null; data: InstitutionInput } | null>(null);
  const [editingOffer, setEditingOffer] = useState<{ id: string | null; data: OfferInput } | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listInstitutions(), listOffers()])
      .then(([i, o]) => {
        if (cancelled) return;
        setInstitutions(i);
        setOffers(o);
        setError(null);
      })
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

  const [seeding, setSeeding] = useState(false);

  async function runSeed() {
    setSeeding(true);
    try {
      const { seedFromCode } = await import("@/lib/db/catalog");
      const r = await seedFromCode();
      setError(null);
      load();
      alert(
        `Importadas ${r.institutions} instituciones y ${r.offers} tasas en borrador.\n\n` +
          "Las tasas están inactivas: confirmá cada una con la institución, " +
          "poné la fecha de verificación y activala.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo importar");
    } finally {
      setSeeding(false);
    }
  }

  async function persistInstitution() {
    if (!editingInst) return;
    try {
      await saveInstitution(editingInst.id, editingInst.data);
      setEditingInst(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
    }
  }

  async function persistOffer() {
    if (!editingOffer) return;
    try {
      await saveOffer(editingOffer.id, editingOffer.data);
      setEditingOffer(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
    }
  }

  async function removeInstitution(inst: Institution) {
    const n = offers.filter((o) => o.institutionId === inst.id).length;
    const msg = n
      ? `Eliminar ${inst.shortName} y sus ${n} oferta(s). ¿Continuar?`
      : `Eliminar ${inst.shortName}. ¿Continuar?`;
    if (!confirm(msg)) return;
    await deleteInstitution(inst.id);
    load();
  }

  if (loading) return <p className="text-center text-ink-soft">Cargando catálogo…</p>;

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-ink">Instituciones</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="size-4" />
            </Button>
            {editable && (
              <Button
                size="sm"
                onClick={() => setEditingInst({ id: null, data: { ...EMPTY_INSTITUTION } })}
              >
                <Plus className="size-4" />
                Nueva
              </Button>
            )}
          </div>
        </div>

        {institutions.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-mist p-6 text-center">
            <p className="text-ink-soft">
              No hay instituciones. El simulador seguirá usando las tasas de ejemplo.
            </p>
            {editable && (
              <>
                <Button className="mt-4" onClick={runSeed} disabled={seeding}>
                  <Download className="size-4" />
                  {seeding ? "Importando…" : "Importar las 13 del código"}
                </Button>
                <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-slate-500">
                  Trae los nombres y tipos de <code>institutions.ts</code>. Las tasas se
                  crean <strong>inactivas y sin verificar</strong>: hay que confirmarlas
                  con cada institución y activarlas una por una.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-3 pr-4 font-semibold">Nombre</th>
                  <th className="pb-3 pr-4 font-semibold">Tipo</th>
                  <th className="pb-3 pr-4 font-semibold">Peso</th>
                  <th className="pb-3 pr-4 font-semibold">Ofertas</th>
                  <th className="pb-3 pr-4 font-semibold">Estado</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {institutions.map((i) => (
                  <tr key={i.id}>
                    <td className="py-3 pr-4">
                      <span className="font-semibold text-ink">{i.shortName}</span>
                      <span className="block text-xs text-slate-500">{i.name}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{institutionKindLabels[i.kind]}</td>
                    <td className="py-3 pr-4 text-slate-600">{i.weight}</td>
                    <td className="py-3 pr-4 text-slate-600">
                      {offers.filter((o) => o.institutionId === i.id).length}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          i.active ? "bg-accent-50 text-accent-700" : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {i.active ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {editable && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingInst({
                                id: i.id,
                                data: {
                                  name: i.name, shortName: i.shortName, kind: i.kind,
                                  active: i.active, weight: i.weight, order: i.order,
                                },
                              })
                            }
                            className="text-xs font-semibold text-brand-700 hover:underline"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => removeInstitution(i)}
                            aria-label={`Eliminar ${i.shortName}`}
                            className="ml-3 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editingInst && (
          <div className="mt-6 rounded-2xl bg-mist p-5">
            <h3 className="font-semibold text-ink">
              {editingInst.id ? "Editar institución" : "Nueva institución"}
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-ink">Nombre completo</span>
                <input
                  className={input}
                  value={editingInst.data.name}
                  onChange={(e) =>
                    setEditingInst({ ...editingInst, data: { ...editingInst.data, name: e.target.value } })
                  }
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-ink">Nombre corto</span>
                <input
                  className={input}
                  value={editingInst.data.shortName}
                  onChange={(e) =>
                    setEditingInst({ ...editingInst, data: { ...editingInst.data, shortName: e.target.value } })
                  }
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-ink">Tipo</span>
                <select
                  className={input}
                  value={editingInst.data.kind}
                  onChange={(e) =>
                    setEditingInst({
                      ...editingInst,
                      data: { ...editingInst.data, kind: e.target.value as InstitutionKind },
                    })
                  }
                >
                  {Object.entries(institutionKindLabels).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-ink">
                  Peso en el ponderado (1 = neutro)
                </span>
                <input
                  type="number" min="0" step="0.5" className={input}
                  value={editingInst.data.weight}
                  onChange={(e) =>
                    setEditingInst({
                      ...editingInst,
                      data: { ...editingInst.data, weight: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={editingInst.data.active}
                  onChange={(e) =>
                    setEditingInst({
                      ...editingInst,
                      data: { ...editingInst.data, active: e.target.checked },
                    })
                  }
                  className="size-4 accent-[var(--color-brand-600)]"
                />
                Activa
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={persistInstitution}>Guardar</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingInst(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ---------- Ofertas ---------- */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Tasas por producto</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Estas tasas alimentan el ponderado del simulador.
            </p>
          </div>
          {editable && institutions.length > 0 && (
            <Button
              size="sm"
              onClick={() => setEditingOffer({ id: null, data: emptyOffer(institutions[0].id) })}
            >
              <Plus className="size-4" />
              Nueva
            </Button>
          )}
        </div>

        {offers.length === 0 ? (
          <p className="mt-6 text-center text-ink-soft">
            Sin tasas cargadas. El simulador usa las de ejemplo de <code>products.ts</code>.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-3 pr-4 font-semibold">Institución</th>
                  <th className="pb-3 pr-4 font-semibold">Producto</th>
                  <th className="pb-3 pr-4 font-semibold">Tasa</th>
                  <th className="pb-3 pr-4 font-semibold">Monto</th>
                  <th className="pb-3 pr-4 font-semibold">Requisitos</th>
                  <th className="pb-3 pr-4 font-semibold">Verificada</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offers.map((o) => {
                  const inst = institutions.find((i) => i.id === o.institutionId);
                  const age = verificationAgeInDays(o.verifiedAt, new Date());
                  const stale = age > STALE_AFTER_DAYS;
                  return (
                    <tr key={o.id}>
                      <td className="py-3 pr-4 font-medium text-ink">
                        {inst?.shortName ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {products.find((p) => p.slug === o.product)?.name ?? o.product}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-ink">{o.annualRate}%</td>
                      <td className="py-3 pr-4 text-xs text-slate-600">
                        {formatCRC(o.minAmount)} – {formatCRC(o.maxAmount)}
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-600">
                        {incomeOptions.find((i) => i.id === o.minIncome)?.label}
                        <span className="block">
                          {o.acceptedEmployment.length === 3
                            ? "Todas las situaciones"
                            : o.acceptedEmployment
                                .map((e) => employmentOptions.find((x) => x.id === e)?.label)
                                .join(", ")}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs">
                        <span className={stale ? "font-semibold text-red-600" : "text-slate-600"}>
                          {stale && <AlertTriangle className="mr-1 inline size-3.5" />}
                          hace {age} d
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {editable && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingOffer({
                                  id: o.id,
                                  data: {
                                    institutionId: o.institutionId, product: o.product,
                                    annualRate: o.annualRate, minAmount: o.minAmount,
                                    maxAmount: o.maxAmount, minMonths: o.minMonths,
                                    maxMonths: o.maxMonths, minIncome: o.minIncome,
                                    acceptedEmployment: o.acceptedEmployment,
                                    active: o.active, verifiedAt: o.verifiedAt,
                                  },
                                })
                              }
                              className="text-xs font-semibold text-brand-700 hover:underline"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!confirm("¿Eliminar esta tasa?")) return;
                                await deleteOffer(o.id);
                                load();
                              }}
                              aria-label="Eliminar tasa"
                              className="ml-3 text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {editingOffer && (
          <div className="mt-6 rounded-2xl bg-mist p-5">
            <h3 className="font-semibold text-ink">
              {editingOffer.id ? "Editar tasa" : "Nueva tasa"}
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-ink">Institución</span>
                <select
                  className={input}
                  value={editingOffer.data.institutionId}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      data: { ...editingOffer.data, institutionId: e.target.value },
                    })
                  }
                >
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>{i.shortName}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-ink">Producto</span>
                <select
                  className={input}
                  value={editingOffer.data.product}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      data: { ...editingOffer.data, product: e.target.value as ProductSlug },
                    })
                  }
                >
                  {products.map((p) => (
                    <option key={p.slug} value={p.slug}>{p.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-ink">Tasa anual (%)</span>
                <input
                  type="number" step="0.1" min="0" className={input}
                  value={editingOffer.data.annualRate}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      data: { ...editingOffer.data, annualRate: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-ink">Verificada el</span>
                <input
                  type="date" className={input}
                  value={editingOffer.data.verifiedAt.toISOString().slice(0, 10)}
                  max={todayIso()}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      data: { ...editingOffer.data, verifiedAt: new Date(e.target.value) },
                    })
                  }
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-ink">Monto mínimo (₡)</span>
                <input
                  type="number" className={input}
                  value={editingOffer.data.minAmount}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      data: { ...editingOffer.data, minAmount: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-ink">Monto máximo (₡)</span>
                <input
                  type="number" className={input}
                  value={editingOffer.data.maxAmount}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      data: { ...editingOffer.data, maxAmount: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-ink">Plazo mínimo (meses)</span>
                <input
                  type="number" className={input}
                  value={editingOffer.data.minMonths}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      data: { ...editingOffer.data, minMonths: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-ink">Plazo máximo (meses)</span>
                <input
                  type="number" className={input}
                  value={editingOffer.data.maxMonths}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      data: { ...editingOffer.data, maxMonths: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block font-medium text-ink">Ingreso mínimo exigido</span>
                <select
                  className={input}
                  value={editingOffer.data.minIncome}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      data: { ...editingOffer.data, minIncome: e.target.value as IncomeId },
                    })
                  }
                >
                  {incomeOptions.map((i) => (
                    <option key={i.id} value={i.id}>{i.label}</option>
                  ))}
                </select>
              </label>
              <fieldset className="sm:col-span-2">
                <legend className="mb-2 text-sm font-medium text-ink">
                  Situaciones laborales que acepta
                </legend>
                <div className="flex flex-wrap gap-4">
                  {employmentOptions.map((emp) => (
                    <label key={emp.id} className="flex items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={editingOffer.data.acceptedEmployment.includes(emp.id)}
                        onChange={(e) => {
                          const set = new Set(editingOffer.data.acceptedEmployment);
                          if (e.target.checked) set.add(emp.id);
                          else set.delete(emp.id);
                          setEditingOffer({
                            ...editingOffer,
                            data: {
                              ...editingOffer.data,
                              acceptedEmployment: [...set] as EmploymentId[],
                            },
                          });
                        }}
                        className="size-4 accent-[var(--color-brand-600)]"
                      />
                      {emp.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={editingOffer.data.active}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      data: { ...editingOffer.data, active: e.target.checked },
                    })
                  }
                  className="size-4 accent-[var(--color-brand-600)]"
                />
                Activa
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={persistOffer}>Guardar</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingOffer(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
