"use client";

import { useState, useEffect } from "react";
import {
  XMarkIcon,
  CheckIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

const initialForm = {
  name: "",
  phone: "",
  currency: "TRY",
  taxOffice: "",
  taxId: "",
  email: "",
  address: "",
};

export default function QuickAddSupplierModal({ open, onClose, onContinue }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setSaving(false);
    }
  }, [open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleContinue = async () => {
    if (!form.name.trim()) {
      alert("İsim / unvan zorunludur.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/business/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone || null,
          currency: form.currency,
          taxOffice: form.taxOffice || null,
          taxId: form.taxId || null,
          email: form.email || null,
          address: form.address || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tedarikçi eklenemedi");
      onContinue?.(data.supplier);
    } catch (e) {
      alert(e.message || "Kayıt başarısız");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const inp =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400";
  const label =
    "mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
                <UserPlusIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                  Yeni Tedarikçi Ekle
                </p>
                <h2 className="mt-1 text-lg font-bold">Yeni Tedarikçi Ekle</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-slate-700">
            Önceden tedarikçi kaydı olmayan carilerinizi hızlıca buradan ekleyebilirsiniz.
            Diğer detayları tedarikçiler sayfasından güncelleyebilirsiniz.
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={label}>İsim / Unvan</label>
              <input
                className={inp}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Telefon</label>
              <input
                className={inp}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="( ) __ - __"
              />
            </div>
            <div>
              <label className={label}>Para Birimi</label>
              <select
                className={inp}
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
              >
                <option value="TRY">TL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className={label}>Vergi Dairesi</label>
              <input
                className={inp}
                value={form.taxOffice}
                onChange={(e) => set("taxOffice", e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Vergi / TC Kimlik No</label>
              <input
                className={inp}
                value={form.taxId}
                onChange={(e) => set("taxId", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className={label}>E-Posta</label>
              <input
                className={inp}
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-400">
                Virgül ile ayırarak birden fazla adres girebilirsiniz.
              </p>
            </div>
            <div className="md:col-span-2">
              <label className={label}>Adres</label>
              <textarea
                className={inp}
                rows={4}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-800 transition hover:bg-orange-100"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckIcon className="h-4 w-4" />
            {saving ? "Kaydediliyor..." : "Devam Et"}
          </button>
        </div>
      </div>
    </div>
  );
}
