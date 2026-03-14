"use client";

import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { getStatusLabel, getPriorityLabel, getCategoryLabel, getCreatorTypeLabel } from "@/lib/tickets/config";

function formatDate(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function creatorInfo(row) {
  if (row.creatorType === "USER" && row.user) {
    return row.user.name || row.user.email || "Kullanıcı";
  }
  if (row.creatorType === "BUSINESS" && row.business) {
    return row.business.name || row.business.slug || "İşletme";
  }
  return getCreatorTypeLabel(row.creatorType);
}

export default function TicketsTable({ items = [], loading, onSelect, pagination = {}, onPageChange }) {
  const { page = 1, pageSize = 20, total = 0, totalPages = 1 } = pagination;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">#</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Konu</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Oluşturan</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Durum</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Öncelik</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Kategori</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Tarih</th>
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
                <td colSpan={8} className="p-12 text-center text-slate-500">Talep bulunamadı.</td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50">
                  <td className="p-4 text-sm font-mono text-slate-500">{row.id.slice(-8)}</td>
                  <td className="p-4 font-medium text-slate-900 max-w-[200px] truncate" title={row.subject}>{row.subject || "—"}</td>
                  <td className="p-4 text-sm text-slate-600">
                    <span className="text-slate-400 text-xs">{getCreatorTypeLabel(row.creatorType)}:</span> {creatorInfo(row)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                        row.status === "OPEN" ? "bg-blue-100 text-blue-800" :
                        row.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-800" :
                        row.status === "WAITING_REPLY" ? "bg-purple-100 text-purple-800" :
                        row.status === "RESOLVED" ? "bg-emerald-100 text-emerald-800" :
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {getStatusLabel(row.status)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{getPriorityLabel(row.priority)}</td>
                  <td className="p-4 text-sm text-slate-600">{getCategoryLabel(row.category)}</td>
                  <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(row.updatedAt)}</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelect?.(row)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 inline-flex items-center gap-1"
                      title="Detay"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-xs font-medium">Detay</span>
                    </button>
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
