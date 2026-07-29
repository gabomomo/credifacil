"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, RefreshCw, Trash2 } from "lucide-react";
import { listLeads, updateLead, deleteLead } from "@/lib/db/leads";
import { leadStatusLabels, type LeadStatus, type StoredLead } from "@/lib/db/types";
import { employmentOptions, incomeOptions } from "@/lib/lead";
import { products } from "@/lib/products";
import { formatCRC, formatTerm } from "@/lib/simulator";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const STATUS_STYLES: Record<LeadStatus, string> = {
  nuevo: "bg-brand-50 text-brand-700",
  contactado: "bg-sun-50 text-sun-700",
  en_tramite: "bg-accent-50 text-accent-700",
  cerrado: "bg-slate-100 text-slate-600",
  descartado: "bg-red-50 text-red-700",
};

function labelOf(list: { id: string; label: string }[], id: string): string {
  return list.find((o) => o.id === id)?.label ?? id;
}

function productName(slug: string): string {
  return products.find((p) => p.slug === slug)?.name ?? slug;
}

const dateFmt = new Intl.DateTimeFormat("es-CR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Escapa un valor para CSV. Sin esto, una coma o un salto de línea dentro de un
 * mensaje libre parte la fila y desalinea todo el archivo.
 */
function csvCell(value: unknown): string {
  const s = String(value ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(leads: StoredLead[]): void {
  const headers = [
    "Fecha", "Nombre", "Correo", "Teléfono", "Producto", "Situación laboral",
    "Ingreso", "Monto", "Plazo (meses)", "Cuota estimada", "Tasa", "Origen",
    "Estado", "Mensaje", "Notas",
  ];
  const rows = leads.map((l) => [
    dateFmt.format(l.createdAt), l.name, l.email, l.phone ?? "",
    productName(l.product),
    l.employment ? labelOf(employmentOptions, l.employment) : "",
    l.income ? labelOf(incomeOptions, l.income) : "",
    l.amount, l.months, l.monthlyPayment,
    l.annualRate, l.source, leadStatusLabels[l.status], l.message ?? "", l.notes ?? "",
  ]);

  // El BOM hace que Excel en Windows abra el archivo como UTF-8; sin él, los
  // acentos y el símbolo de colón se corrompen.
  const csv = "﻿" + [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `solicitudes-credifacil.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function LeadsPanel({ editable }: { editable: boolean }) {
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LeadStatus | "todos">("todos");
  const [expanded, setExpanded] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  // El efecto solo dispara la carga; los setState ocurren en las callbacks de
  // la promesa, no en el cuerpo síncrono. `cancelled` evita escribir estado
  // sobre un componente ya desmontado.
  useEffect(() => {
    let cancelled = false;
    listLeads()
      .then((d) => !cancelled && setLeads(d))
      .catch(
        (e: unknown) =>
          !cancelled && setError(e instanceof Error ? e.message : "Error al cargar"),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  /** Recarga manual. Al vivir en un manejador de evento sí puede tocar estado. */
  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  async function changeStatus(id: string, status: LeadStatus) {
    // Actualización optimista: la tabla responde de inmediato y se revierte
    // recargando si Firestore rechaza el cambio.
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      await updateLead(id, { status });
    } catch {
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta solicitud? No se puede deshacer.")) return;
    try {
      await deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  }

  const visible = filter === "todos" ? leads : leads.filter((l) => l.status === filter);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["todos", ...Object.keys(leadStatusLabels)] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f as LeadStatus | "todos")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                filter === f ? "bg-ink text-white" : "bg-mist text-ink-soft hover:bg-slate-200",
              )}
            >
              {f === "todos" ? "Todas" : leadStatusLabels[f as LeadStatus]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="size-4" />
            Recargar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCsv(visible)}
            disabled={visible.length === 0}
          >
            <Download className="size-4" />
            CSV
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="mt-8 text-center text-ink-soft">Cargando solicitudes…</p>
      ) : visible.length === 0 ? (
        <p className="mt-8 text-center text-ink-soft">
          {leads.length === 0
            ? "Todavía no hay solicitudes."
            : "Ninguna solicitud con ese estado."}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-3 pr-4 font-semibold">Fecha</th>
                <th className="pb-3 pr-4 font-semibold">Persona</th>
                <th className="pb-3 pr-4 font-semibold">Crédito</th>
                <th className="pb-3 pr-4 font-semibold">Perfil</th>
                <th className="pb-3 pr-4 font-semibold">Cuota</th>
                <th className="pb-3 pr-4 font-semibold">Estado</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((l) => (
                <tr key={l.id} className="align-top">
                  <td className="py-3 pr-4 text-xs text-slate-500">
                    {dateFmt.format(l.createdAt)}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="block font-semibold text-ink">{l.name}</span>
                    <a href={`mailto:${l.email}`} className="block text-brand-700 hover:underline">
                      {l.email}
                    </a>
                    {l.phone && <span className="block text-slate-500">{l.phone}</span>}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="block text-ink">{productName(l.product)}</span>
                    <span className="block text-slate-500">
                      {formatCRC(l.amount)} · {formatTerm(l.months)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {l.employment || l.income ? (
                      <>
                        <span className="block">
                          {l.employment ? labelOf(employmentOptions, l.employment) : "—"}
                        </span>
                        <span className="block">
                          {l.income ? labelOf(incomeOptions, l.income) : "—"}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs italic text-slate-400">
                        No pasó por el simulador
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="block font-semibold text-ink">
                      {formatCRC(l.monthlyPayment)}
                    </span>
                    <span className="block text-xs text-slate-500">{l.annualRate}% anual</span>
                  </td>
                  <td className="py-3 pr-4">
                    {editable ? (
                      <select
                        value={l.status}
                        onChange={(e) => changeStatus(l.id, e.target.value as LeadStatus)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-semibold",
                          STATUS_STYLES[l.status],
                        )}
                      >
                        {Object.entries(leadStatusLabels).map(([v, label]) => (
                          <option key={v} value={v}>
                            {label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={cn(
                          "inline-block rounded-full px-3 py-1.5 text-xs font-semibold",
                          STATUS_STYLES[l.status],
                        )}
                      >
                        {leadStatusLabels[l.status]}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {l.message && (
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === l.id ? null : l.id)}
                        className="text-xs font-semibold text-brand-700 hover:underline"
                      >
                        {expanded === l.id ? "Ocultar" : "Mensaje"}
                      </button>
                    )}
                    {editable && (
                      <button
                        type="button"
                        onClick={() => remove(l.id)}
                        aria-label="Eliminar solicitud"
                        className="ml-3 text-slate-400 transition-colors hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                    {expanded === l.id && l.message && (
                      <p className="mt-2 max-w-xs rounded-xl bg-mist p-3 text-left text-xs leading-relaxed text-ink-soft">
                        {l.message}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-slate-500">
        {visible.length} solicitud{visible.length === 1 ? "" : "es"}
        {filter !== "todos" && ` · ${leads.length} en total`}
      </p>
    </div>
  );
}
