"use client";

import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { getLayoutLabel, getAudienceLabel, getStatusLabel } from "@/lib/broadcast/config";

function formatDate(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "—";
  }
}

export default function BroadcastTable({ items = [], loading, onEdit, onDelete, pagination = {}, onPageChange }) {
  const { page = 1, pageSize = 20, total = 0, totalPages = 1 } = pagination;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Başlık</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Yerleşim</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Hedef kitle</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Durum</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Başlangıç</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Bitiş</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Sıra</th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-500">Yükleniyor...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-500">Duyuru bulunamadı.</td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-900 max-w-[200px] truncate" title={row.title}>{row.title || "—"}</td>
                  <td className="p-4 text-sm text-slate-600">{getLayoutLabel(row.layout)}</td>
                  <td className="p-4 text-sm text-slate-600">{getAudienceLabel(row.audience)}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                        row.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : row.status === "DRAFT"
                            ? "bg-amber-100 text-amber-800"
                            : row.status === "PAUSED"
                              ? "bg-slate-200 text-slate-700"
                              : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {getStatusLabel(row.status)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(row.startAt)}</td>
                  <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(row.endAt)}</td>
                  <td className="p-4 text-sm text-slate-600">{row.sortOrder ?? 0}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit?.(row)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        title="Düzenle"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(row)}
                        className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-sm text-slate-600">
            Toplam {total} kayıt, sayfa {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600">{page} / {totalPages}</span>
            <button
              type="button"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
