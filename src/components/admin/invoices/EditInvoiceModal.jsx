"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { TYPES, STATUSES, getTypeLabel, getStatusLabel } from "@/lib/admin-invoices/status-config";

function toDateInputValue(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function EditInvoiceModal({ open, invoice, onClose, onSuccess }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    invoiceNumber: "",
    type: "MANUAL",
    status: "DRAFT",
    amount: "",
    currency: "TRY",
    issueDate: "",
    dueDate: "",
    description: "",
  });

  useEffect(() => {
    if (invoice) {
      setForm({
        invoiceNumber: invoice.invoiceNumber ?? "",
        type: invoice.type ?? "MANUAL",
        status: invoice.status ?? "DRAFT",
        amount: invoice.amount != null ? String(invoice.amount) : "",
        currency: invoice.currency ?? "TRY",
        issueDate: toDateInputValue(invoice.issueDate),
        dueDate: toDateInputValue(invoice.dueDate),
        description: invoice.description ?? "",
      });
    }
  }, [invoice]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!invoice?.id) return;
    const amount = parseFloat(form.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Geçerli tutar giriniz.");
      return;
    }
    if (!form.invoiceNumber.trim()) {
      toast.error("Fatura numarası giriniz.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber: form.invoiceNumber.trim(),
          type: form.type,
          status: form.status,
          amount,
          currency: form.currency,
          issueDate: form.issueDate ? new Date(form.issueDate).toISOString() : undefined,
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
          description: form.description.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncellenemedi.");
      toast.success("Fatura güncellendi.");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err.message || "Güncelleme başarısız.");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !invoice) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" aria-hidden onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-slate-900">Faturayı düzenle</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        {invoice.business?.name && (
          <p className="px-4 pt-2 text-sm text-slate-500">İşletme: {invoice.business.name}</p>
        )}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Fatura numarası</label>
            <input
              type="text"
              value={form.invoiceNumber}
              onChange={(e) => handleChange("invoiceNumber", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Tip</label>
            <select
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {getTypeLabel(t)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Durum</label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Tutar (₺)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Kesim tarihi</label>
              <input
                type="date"
                value={form.issueDate}
                onChange={(e) => handleChange("issueDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Vade tarihi</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Açıklama</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
        </form>
        <div className="flex justify-end gap-2 p-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm hover:bg-slate-50"
          >
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
