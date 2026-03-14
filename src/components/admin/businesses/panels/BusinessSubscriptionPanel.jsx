"use client";

import { formatDate, formatSubscriptionExpiry, daysUntil } from "@/lib/admin-businesses/formatters";
import { getSubscriptionStatusConfig, getSubscriptionPlanConfig } from "@/lib/admin-businesses/status-config";

export default function BusinessSubscriptionPanel({ business, onEditSubscription }) {
  if (!business) return <p className="text-slate-500">Yükleniyor...</p>;

  const sub = business.subscription;
  const statusCfg = sub ? getSubscriptionStatusConfig(sub.status) : { label: "Yok", badge: "bg-slate-100 text-slate-500" };
  const planCfg = sub ? getSubscriptionPlanConfig(sub.plan) : { label: "—", badge: "" };
  const days = sub?.expiresAt ? daysUntil(sub.expiresAt) : null;

  return (
    <div className="space-y-6">
      {!sub ? (
        <p className="text-slate-600">Bu işletme için abonelik kaydı yok.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Plan</label>
            <p className="mt-1">
              <span className={`inline-flex px-2 py-0.5 rounded-md text-sm font-medium border ${planCfg.badge}`}>
                {planCfg.label}
              </span>
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Durum</label>
            <p className="mt-1">
              <span className={`inline-flex px-2 py-0.5 rounded-md text-sm font-medium border ${statusCfg.badge}`}>
                {statusCfg.label}
              </span>
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Başlangıç</label>
            <p className="mt-1 text-slate-700">{formatDate(sub.startedAt)}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Bitiş</label>
            <p className="mt-1 text-slate-700">{formatSubscriptionExpiry(sub.expiresAt)}</p>
            {days != null && (
              <p className="mt-0.5 text-xs text-slate-500">
                {days < 0 ? "Süresi doldu" : `${days} gün kaldı`}
              </p>
            )}
          </div>
        </div>
      )}
      {typeof onEditSubscription === "function" && (
        <button
          type="button"
          onClick={onEditSubscription}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Aboneliği düzenle
        </button>
      )}
    </div>
  );
}
