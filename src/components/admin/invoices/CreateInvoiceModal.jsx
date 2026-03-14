"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { TYPES, getTypeLabel } from "@/lib/admin-invoices/status-config";
import SearchableDropdown from "@/components/listing-detail/SearchableDropdown";

function toDateInputValue(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function CreateInvoiceModal({ open, onClose, onSuccess }) {
  const [saving, setSaving] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [form, setForm] = useState({
    businessId: "",
    invoiceNumber: "",
    type: "MANUAL",
    amount: "",
    currency: "TRY",
    issueDate: toDateInputValue(new Date()),
    dueDate: toDateInputValue(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    description: "",
  });

  useEffect(() => {
    if (open) {
      fetch("/api/admin/businesses?pageSize=500")
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.items) setBusinesses(data.items);
        })
        .catch(() => setBusinesses([]));
    }
  }, [open]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessId) {
      toast.error("İşletme seçiniz.");
      return;
    }
    if (!form.invoiceNumber.trim()) {
      toast.error("Fatura numarası giriniz.");
      return;
    }
    const amount = parseFloat(form.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Geçerli tutar giriniz.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: form.businessId,
          invoiceNumber: form.invoiceNumber.trim(),
          type: form.type,
          amount,
          currency: form.currency,
          issueDate: form.issueDate || new Date().toISOString(),
          dueDate: form.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: form.description.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Oluşturulamadı.");
      toast.success("Fatura oluşturuldu.");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err.message || "Fatura oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" aria-hidden onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-slate-900">Yeni fatura</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">İşletme</label>
            <SearchableDropdown
              options={businesses}
              value={form.businessId}
              onSelect={(b) => handleChange("businessId", b.id)}
              getOptionValue={(b) => b.id}
              getOptionLabel={(b) => `${b.name} (${b.slug})`}
              placeholder="İşletme ara veya seçin..."
              emptyMessage="İşletme bulunamadı"
              loading={open && businesses.length === 0}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Fatura numarası</label>
            <input
              type="text"
              value={form.invoiceNumber}
              onChange={(e) => handleChange("invoiceNumber", e.target.value)}
              placeholder="örn. INV-2025-0001"
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
            {saving ? "Oluşturuluyor..." : "Oluştur"}
          </button>
        </div>
      </div>
    </div>
  );
}
