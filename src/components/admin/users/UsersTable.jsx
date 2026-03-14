"use client";

import { useRef, useEffect } from "react";
import { User, ChevronLeft, ChevronRight, Mail, Phone, Eye, UserCheck, UserX, Ban } from "lucide-react";
import { formatLastLogin, safeStr } from "@/lib/admin-users/formatters";
import { getRoleLabel, getRoleBadgeClass, getStatusLabel, getStatusBadgeClass } from "@/lib/admin-users/status-config";

export default function UsersTable({
  items = [],
  loading = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  onOpenDetail,
  onSuspend,
  onActivate,
  onBan,
  pagination = {},
  onPageChange,
  currentUserId,
}) {
  const { page = 1, pageSize = 20, total = 0, totalPages = 1 } = pagination;
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0;
  const headerCheckRef = useRef(null);

  useEffect(() => {
    if (headerCheckRef.current) {
      headerCheckRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  const toggleAll = () => {
    if (typeof onSelectionChange !== "function") return;
    if (allSelected) onSelectionChange([]);
    else onSelectionChange(items.map((u) => u.id));
  };

  const toggleOne = (id) => {
    if (typeof onSelectionChange !== "function") return;
    if (selectedIds.includes(id)) onSelectionChange(selectedIds.filter((x) => x !== id));
    else onSelectionChange([...selectedIds, id]);
  };

  const isSelf = (id) => currentUserId && id === currentUserId;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="p-4 w-12">
                <input
                  type="checkbox"
                  ref={headerCheckRef}
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Profil</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">İletişim</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Rol</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Durum</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Son giriş</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">İşletme</th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-40">İşlem</th>
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
              items.map((u) => {
                const roleClass = getRoleBadgeClass(u.role);
                const statusClass = getStatusBadgeClass(u.status);
                const self = isSelf(u.id);
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => typeof onRowClick === "function" && onRowClick(u)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(u.id)}
                        onChange={() => toggleOne(u.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 font-semibold">
                          {u.image ? (
                            <img src={u.image} alt="" className="w-10 h-10 rounded-xl object-cover" />
                          ) : (
                            (u.name || "?").charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{safeStr(u.name)}</p>
                          <p className="text-xs text-slate-500">{getRoleLabel(u.role)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-700 text-sm">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {safeStr(u.email)}
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-2 text-slate-500 text-xs">
                            <Phone className="w-3 h-3" />
                            {u.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${roleClass}`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${statusClass}`}>
                        {getStatusLabel(u.status)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{formatLastLogin(u.lastLoginAt)}</td>
                    <td className="p-4">
                      {u.business ? (
                        <span className="text-sm text-slate-700">{u.business.name}</span>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => typeof onOpenDetail === "function" && onOpenDetail(u)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                          title="Detay"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!self && (
                          <>
                            {u.status !== "ACTIVE" && (
                              <button
                                type="button"
                                onClick={() => typeof onActivate === "function" && onActivate(u)}
                                className="p-2 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                title="Aktif yap"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            {u.status === "ACTIVE" && (
                              <button
                                type="button"
                                onClick={() => typeof onSuspend === "function" && onSuspend(u)}
                                className="p-2 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50"
                                title="Askıya al"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => typeof onBan === "function" && onBan(u)}
                              className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                              title="Yasakla"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </>
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
