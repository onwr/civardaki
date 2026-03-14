"use client";

import { useEffect, useState } from "react";
import { MailCheck, MailX, ShieldAlert } from "lucide-react";

const USER_STATUSES = ["ACTIVE", "SUSPENDED", "BANNED", "PENDING"];
const USER_ROLES = ["USER", "BUSINESS", "ADMIN"];

export default function BusinessOwnerAccessPanel({
  business,
  loading = false,
  onOwnerAction,
}) {
  const owner = business?.owner || null;
  const [status, setStatus] = useState(owner?.status || "ACTIVE");
  const [role, setRole] = useState(owner?.role || "BUSINESS");

  useEffect(() => {
    setStatus(owner?.status || "ACTIVE");
    setRole(owner?.role || "BUSINESS");
  }, [owner?.status, owner?.role]);

  if (!business) return <p className="text-slate-500">Yükleniyor...</p>;
  if (!owner) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
        Bu işletmeye bağlı birincil sahip kullanıcı bulunamadı.
      </div>
    );
  }

  const handleAction = (payload, withConfirm = false) => {
    if (withConfirm) {
      const ok = window.confirm("Bu işlem yüksek etkilidir. Devam etmek istiyor musunuz?");
      if (!ok) return;
    }
    onOwnerAction?.(payload);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 p-4 space-y-2">
        <p className="text-sm font-semibold text-slate-900">{owner.name || "İsimsiz kullanıcı"}</p>
        <p className="text-sm text-slate-600">{owner.email || "—"}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span
            className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${
              owner.emailVerified
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : "text-amber-700 bg-amber-50 border-amber-200"
            }`}
          >
            {owner.emailVerified ? "Mail doğrulandı" : "Mail doğrulanmadı"}
          </span>
          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium border text-slate-700 bg-slate-50 border-slate-200">
            Durum: {owner.status || "-"}
          </span>
          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium border text-blue-700 bg-blue-50 border-blue-200">
            Rol: {owner.role || "-"}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">E-posta doğrulama</h4>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || !!owner.emailVerified}
            onClick={() => handleAction({ action: "verifyOwnerEmail" })}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
          >
            <MailCheck className="w-4 h-4" /> Maili doğrula
          </button>
          <button
            type="button"
            disabled={loading || !owner.emailVerified}
            onClick={() => handleAction({ action: "unverifyOwnerEmail" }, true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          >
            <MailX className="w-4 h-4" /> Doğrulamayı kaldır
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">Erişim kontrolü</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">
              Kullanıcı durumu
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200"
            >
              {USER_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">
              Kullanıcı rolü
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200"
            >
              {USER_ROLES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || status === owner.status}
            onClick={() => handleAction({ action: "setOwnerStatus", status }, true)}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
          >
            Durumu güncelle
          </button>
          <button
            type="button"
            disabled={loading || role === owner.role}
            onClick={() => handleAction({ action: "setOwnerRole", role }, true)}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
          >
            Rolü güncelle
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        Sahip rol/durum değişiklikleri kullanıcı paneli erişimini etkiler. Kritik işlemler onay sonrası uygulanır.
      </div>
    </div>
  );
}
