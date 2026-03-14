"use client";

import { ChevronLeft, ChevronRight, Pencil, CalendarPlus, Ban, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDate, kalanGun, kalanGunSayisi } from "@/lib/admin-subscriptions/formatters";
import { getPlanLabel, getPlanBadgeClass, getStatusLabel, getStatusBadgeClass } from "@/lib/admin-subscriptions/status-config";

export default function SubscriptionsTable({
  items = [],
  loading = false,
  onEdit,
  onExtend,
  onCancel,
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
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">İşletme</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Plan</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Durum</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Başlangıç</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Bitiş</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Kalan</th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-44">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-500">
                  Yükleniyor...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-500">
                  Sonuç bulunamadı.
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const daysLeft = row.status !== "EXPIRED" ? kalanGunSayisi(row.expiresAt) : null;
                const isSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
                return (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-slate-900">{row.business?.name ?? "—"}</p>
                        <p className="text-xs text-slate-500">{row.business?.slug ?? ""}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getPlanBadgeClass(row.plan)}`}>
                        {getPlanLabel(row.plan)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getStatusBadgeClass(row.status)}`}>
                        {getStatusLabel(row.status)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{formatDate(row.startedAt)}</td>
                    <td className="p-4 text-sm text-slate-600">{formatDate(row.expiresAt)}</td>
                    <td className="p-4">
                      <span className={isSoon ? "text-amber-600 font-medium" : row.status === "EXPIRED" ? "text-red-600" : "text-slate-600"}>
                        {kalanGun(row.expiresAt)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => typeof onEdit === "function" && onEdit(row)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                          title="Düzenle"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {row.status !== "EXPIRED" && (
                          <button
                            type="button"
                            onClick={() => typeof onExtend === "function" && onExtend(row)}
                            className="p-2 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            title="Süre uzat"
                          >
                            <CalendarPlus className="w-4 h-4" />
                          </button>
                        )}
                        {row.status !== "EXPIRED" && (
                          <button
                            type="button"
                            onClick={() => typeof onCancel === "function" && onCancel(row)}
                            className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                            title="İptal et"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {!loading && items.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-sm text-slate-600">
            Toplam <strong>{total}</strong> kayıt, sayfa {page} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => typeof onPageChange === "function" && onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => typeof onPageChange === "function" && onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
