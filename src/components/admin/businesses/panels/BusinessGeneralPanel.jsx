"use client";

import { formatDate, formatDateTime, safeStr } from "@/lib/admin-businesses/formatters";
import { getActiveBadge, getVerifiedBadge } from "@/lib/admin-businesses/status-config";

export default function BusinessGeneralPanel({ business, onEdit, onQuickToggle, actionLoading = false }) {
  if (!business) return <p className="text-slate-500">Yükleniyor...</p>;

  const activeCfg = getActiveBadge(business.isActive);
  const verifiedCfg = getVerifiedBadge(business.isVerified);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">İşletme adı</label>
          <p className="mt-1 text-slate-900 font-medium">{safeStr(business.name)}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Slug</label>
          <p className="mt-1 font-mono text-sm text-slate-700">{safeStr(business.slug)}</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Açıklama</label>
          <p className="mt-1 text-slate-700 text-sm whitespace-pre-wrap">{safeStr(business.description) || "—"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Kategori</label>
          <p className="mt-1 text-slate-700">{business.primaryCategory?.name ?? safeStr(business.category) ?? "—"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
          <p className="mt-1 text-slate-700">{safeStr(business.email) || "—"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Telefon</label>
          <p className="mt-1 text-slate-700">{safeStr(business.phone) || "—"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Web site</label>
          <p className="mt-1 text-slate-700">{safeStr(business.website) || "—"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Adres</label>
          <p className="mt-1 text-slate-700 text-sm">{safeStr(business.address) || "—"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Şehir / İlçe</label>
          <p className="mt-1 text-slate-700">{[business.city, business.district].filter(Boolean).join(" / ") || "—"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Koordinatlar</label>
          <p className="mt-1 text-slate-700 text-sm">
            {business.latitude != null && business.longitude != null
              ? `${business.latitude}, ${business.longitude}`
              : "—"}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Çalışma saatleri</label>
          <p className="mt-1 text-slate-700 text-sm whitespace-pre-wrap">{safeStr(business.workingHours) || "—"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Durum</label>
          <div className="mt-1 flex gap-2 flex-wrap">
            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${activeCfg.badge}`}>
              {activeCfg.label}
            </span>
            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${verifiedCfg.badge}`}>
              {verifiedCfg.label}
            </span>
            <span
              className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${
                business.isOpen
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : "text-rose-700 bg-rose-50 border-rose-200"
              }`}
            >
              {business.isOpen ? "Açık" : "Kapalı"}
            </span>
            <span
              className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${
                business.reservationEnabled
                  ? "text-indigo-700 bg-indigo-50 border-indigo-200"
                  : "text-slate-700 bg-slate-50 border-slate-200"
              }`}
            >
              {business.reservationEnabled ? "Rezervasyon açık" : "Rezervasyon kapalı"}
            </span>
          </div>
          {typeof onQuickToggle === "function" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onQuickToggle("isActive")}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 disabled:opacity-50"
              >
                {business.isActive ? "Pasif yap" : "Aktif yap"}
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onQuickToggle("isVerified")}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 disabled:opacity-50"
              >
                {business.isVerified ? "Doğrulamayı kaldır" : "İşletmeyi doğrula"}
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onQuickToggle("isOpen")}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 disabled:opacity-50"
              >
                {business.isOpen ? "Kapalıya al" : "Açık yap"}
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onQuickToggle("reservationEnabled")}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 disabled:opacity-50"
              >
                {business.reservationEnabled ? "Rezervasyonu kapat" : "Rezervasyonu aç"}
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Sahip</label>
          <p className="mt-1 text-slate-700">
            {business.owner ? (
              <>
                {safeStr(business.owner.name) || "—"} ({safeStr(business.owner.email)})
              </>
            ) : (
              "—"
            )}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Oluşturulma</label>
          <p className="mt-1 text-slate-600 text-sm">{formatDateTime(business.createdAt)}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Son güncelleme</label>
          <p className="mt-1 text-slate-600 text-sm">{formatDateTime(business.updatedAt)}</p>
        </div>
      </div>
      {typeof onEdit === "function" && (
        <button
          type="button"
          onClick={onEdit}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Bilgileri düzenle
        </button>
      )}
    </div>
  );
}
