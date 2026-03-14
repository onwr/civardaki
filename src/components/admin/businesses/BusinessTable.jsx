"use client";

import { useRef, useEffect } from "react";
import { Store, ChevronLeft, ChevronRight, Eye, CheckCircle, Ban, ShieldCheck, ShieldOff, MailCheck, MailX } from "lucide-react";
import {
  formatDate,
  formatSubscriptionExpiry,
  formatCount,
  safeStr,
} from "@/lib/admin-businesses/formatters";
import {
  getSubscriptionStatusConfig,
  getSubscriptionPlanConfig,
  getActiveBadge,
  getVerifiedBadge,
} from "@/lib/admin-businesses/status-config";

export default function BusinessTable({
  items = [],
  loading = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  onToggleActive,
  onVerify,
  onUnverify,
  onVerifyOwnerEmail,
  onUnverifyOwnerEmail,
  onOpenDetail,
  pagination = {},
  onPageChange,
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
    else onSelectionChange(items.map((b) => b.id));
  };

  const toggleOne = (id) => {
    if (typeof onSelectionChange !== "function") return;
    if (selectedIds.includes(id)) onSelectionChange(selectedIds.filter((x) => x !== id));
    else onSelectionChange([...selectedIds, id]);
  };

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
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">İşletme</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">İletişim</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Kategori / Konum</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Sahip</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Abonelik</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Lead</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Yorum</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Ürün</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Sipariş</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Durum</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Güncelleme</th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={13} className="p-12 text-center text-slate-500">
                  Yükleniyor...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={13} className="p-12 text-center text-slate-500">
                  Sonuç bulunamadı.
                </td>
              </tr>
            ) : (
              items.map((b) => {
                const subCfg = getSubscriptionStatusConfig(b.subscription?.status);
                const planCfg = getSubscriptionPlanConfig(b.subscription?.plan);
                const activeCfg = getActiveBadge(b.isActive);
                const verifiedCfg = getVerifiedBadge(b.isVerified);
                const count = b._count || {};
                return (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                    onClick={() => typeof onRowClick === "function" && onRowClick(b)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(b.id)}
                        onChange={() => toggleOne(b.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <Store className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{safeStr(b.name)}</p>
                          <p className="text-xs text-slate-400 font-mono">{safeStr(b.slug)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-slate-700">{safeStr(b.email) || "—"}</p>
                        <p className="text-slate-500 text-xs">{safeStr(b.phone) || "—"}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-slate-700">{b.primaryCategory?.name ?? safeStr(b.category) ?? "—"}</p>
                        <p className="text-slate-500 text-xs">{[b.city, b.district].filter(Boolean).join(" / ") || "—"}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {b.owner ? (
                        <>
                          <p>{safeStr(b.owner.name) || "—"}</p>
                          <p className="text-xs text-slate-400">{safeStr(b.owner.email)}</p>
                          <div className="mt-1 flex items-center gap-1 flex-wrap">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                                b.owner.emailVerified
                                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                  : "text-amber-700 bg-amber-50 border-amber-200"
                              }`}
                            >
                              {b.owner.emailVerified ? "Mail doğrulandı" : "Mail doğrulanmadı"}
                            </span>
                            <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border text-slate-700 bg-slate-50 border-slate-200">
                              {safeStr(b.owner.status) || "—"}
                            </span>
                          </div>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${subCfg.badge}`}>
                          {subCfg.label}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border w-fit ${planCfg.badge}`}>
                          {planCfg.label}
                        </span>
                        {b.subscription?.expiresAt && (
                          <span className="text-xs text-slate-500">{formatSubscriptionExpiry(b.subscription.expiresAt)}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] h-8 rounded-lg bg-slate-100 text-slate-700 font-medium text-sm">
                        {formatCount(count.leads)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] h-8 rounded-lg bg-slate-100 text-slate-700 font-medium text-sm">
                        {formatCount(count.reviews)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] h-8 rounded-lg bg-slate-100 text-slate-700 font-medium text-sm">
                        {formatCount(count.products)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] h-8 rounded-lg bg-slate-100 text-slate-700 font-medium text-sm">
                        {formatCount(count.orders)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${activeCfg.badge}`}>
                          {activeCfg.label}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${verifiedCfg.badge}`}>
                          {verifiedCfg.label}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500">{formatDate(b.updatedAt)}</td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onOpenDetail?.(b); }}
                          className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                          title="Detay"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onToggleActive?.(b); }}
                          className={`p-2 rounded-lg transition-colors ${b.isActive ? "text-emerald-600 hover:bg-rose-50" : "text-rose-600 hover:bg-emerald-50"}`}
                          title={b.isActive ? "Pasif yap" : "Aktif yap"}
                        >
                          {b.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        {b.isVerified ? (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onUnverify?.(b); }}
                            className="p-2 text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Doğrulamayı kaldır"
                          >
                            <ShieldOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onVerify?.(b); }}
                            className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                            title="Doğrula"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        {b.owner ? (
                          b.owner.emailVerified ? (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onUnverifyOwnerEmail?.(b); }}
                              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Sahip e-posta doğrulamasını kaldır"
                            >
                              <MailX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onVerifyOwnerEmail?.(b); }}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Sahip e-postasını doğrula"
                            >
                              <MailCheck className="w-4 h-4" />
                            </button>
                          )
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-sm text-slate-600">
            Toplam <strong>{total}</strong> kayıt, sayfa <strong>{page}</strong> / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange?.(page - 1)}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange?.(page + 1)}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
