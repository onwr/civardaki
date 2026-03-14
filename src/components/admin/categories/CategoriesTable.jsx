"use client";

import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { formatDateTime, safeStr } from "@/lib/admin-categories/formatters";

export default function CategoriesTable({
  items = [],
  loading = false,
  onEdit,
  onDelete,
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
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Ad</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Slug</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Üst kategori</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Seviye</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Sıra</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Aktif</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Öne çıkan</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">İşletme</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Güncelleme</th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-28">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={10} className="p-12 text-center text-slate-500">
                  Yükleniyor...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-12 text-center text-slate-500">
                  Sonuç bulunamadı.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{safeStr(row.name)}</td>
                  <td className="p-4 text-sm text-slate-600">{safeStr(row.slug)}</td>
                  <td className="p-4 text-sm text-slate-600">{safeStr(row.parentName)}</td>
                  <td className="p-4 text-center text-sm text-slate-600">{row.level ?? 0}</td>
                  <td className="p-4 text-center text-sm text-slate-600">{row.sortOrder ?? 0}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${row.isActive ? "bg-emerald-200 text-emerald-900" : "bg-slate-200 text-slate-700"}`}>
                      {row.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {row.isFeatured ? (
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-amber-200 text-amber-900">Öne çıkan</span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center text-sm text-slate-600">{row.businessCount ?? 0}</td>
                  <td className="p-4 text-sm text-slate-500">{formatDateTime(row.updatedAt)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => typeof onEdit === "function" && onEdit(row)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        title="Düzenle"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => typeof onDelete === "function" && onDelete(row)}
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
