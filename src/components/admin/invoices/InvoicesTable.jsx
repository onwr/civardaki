"use client";

import { ChevronLeft, ChevronRight, Pencil, ExternalLink, Eye } from "lucide-react";
import Link from "next/link";
import { formatDate, formatAmount } from "@/lib/admin-invoices/formatters";
import { getTypeLabel, getTypeBadgeClass, getStatusLabel, getStatusBadgeClass } from "@/lib/admin-invoices/status-config";

export default function InvoicesTable({
  items = [],
  loading = false,
  onEdit,
  onView,
  pagination = {},
  onPageChange,
}) {
  const { page = 1, pageSize = 20, total = 0, totalPages = 1 } = pagination;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Fatura No</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">İşletme</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Tip</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Tutar</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Kesim</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Vade</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Durum</th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-28">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-500">
                  Yükleniyor...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-500">
                  Sonuç bulunamadı.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{row.invoiceNumber || "—"}</td>
                  <td className="p-4">
                    {row.business ? (
                      <>
                        <p className="font-medium text-slate-900">{row.business.name}</p>
                        <p className="text-xs text-slate-500">{row.business.slug}</p>
                      </>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getTypeBadgeClass(row.type)}`}>
                      {getTypeLabel(row.type)}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium text-slate-900">
                    {formatAmount(row.amount)}
                  </td>
                  <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(row.issueDate)}</td>
                  <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(row.dueDate)}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getStatusBadgeClass(row.status)}`}>
                      {getStatusLabel(row.status)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {typeof onView === "function" && (
                        <button
                          type="button"
                          onClick={() => onView(row)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                          title="Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => typeof onEdit === "function" && onEdit(row)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        title="Düzenle"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {row.business?.id && (
                        <Link
                          href={`/admin/businesses?highlight=${row.business.id}`}
                          className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50"
                          title="İşletmeye git"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
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
              onClick={() => typeof onPageChange === "function" && onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => typeof onPageChange === "function" && onPageChange(page + 1)}
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
