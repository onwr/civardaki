"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

function toDateInputValue(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export default function EditSubscriptionModal({ open, subscription, onClose, onSuccess }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    plan: "BASIC",
    status: "TRIAL",
    startedAt: "",
    expiresAt: "",
  });

  useEffect(() => {
    if (subscription) {
      setForm({
        plan: subscription.plan || "BASIC",
        status: subscription.status || "TRIAL",
        startedAt: toDateInputValue(subscription.startedAt),
        expiresAt: toDateInputValue(subscription.expiresAt),
      });
    }
  }, [subscription]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subscription?.id) return;
    setSaving(true);
    try {
      const startedAt = form.startedAt ? new Date(form.startedAt) : new Date();
      const expiresAt = form.expiresAt ? new Date(form.expiresAt) : new Date(startedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      const res = await fetch(`/api/admin/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: form.plan,
          status: form.status,
          startedAt: startedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncellenemedi.");
      toast.success("Abonelik güncellendi.");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err.message || "Güncelleme başarısız.");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !subscription) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" aria-hidden onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Aboneliği düzenle</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        {subscription.business?.name && (
          <p className="px-4 pt-2 text-sm text-slate-500">İşletme: {subscription.business.name}</p>
        )}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Plan</label>
            <select
              value={form.plan}
              onChange={(e) => handleChange("plan", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="BASIC">Temel</option>
              <option value="PREMIUM">Premium</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Durum</label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="TRIAL">Deneme</option>
              <option value="ACTIVE">Aktif</option>
              <option value="EXPIRED">Süresi doldu</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Başlangıç</label>
            <input
              type="datetime-local"
              value={form.startedAt}
              onChange={(e) => handleChange("startedAt", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Bitiş</label>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => handleChange("expiresAt", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </form>
        <div className="flex justify-end gap-2 p-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm hover:bg-slate-50">
            İptal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
