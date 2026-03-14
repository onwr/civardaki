"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "../lib/order-formatters";

export default function PanelOrderModal({
  open,
  form,
  onFormChange,
  products,
  productsLoading,
  submitting,
  onClose,
  onSubmit,
  onAddRow,
  onRemoveRow,
  onUpdateItem,
  onSelectProduct,
}) {
  if (!open) return null;

  const items = Array.isArray(form.items) ? form.items : [];
  const total = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  const productList = Array.isArray(products) ? products : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
        >
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Panel siparişi</h2>
            <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 min-w-[40px] min-h-[40px]" aria-label="Kapat">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Müşteri adı *</label>
                <input
                  type="text"
                  value={form.customerName ?? ""}
                  onChange={(e) => onFormChange({ ...form, customerName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none"
                  placeholder="Ad soyad"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={form.customerPhone ?? ""}
                  onChange={(e) => onFormChange({ ...form, customerPhone: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none"
                  placeholder="5XX XXX XX XX"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Adres (teslimat)</label>
              <input
                type="text"
                value={form.addressLine1 ?? ""}
                onChange={(e) => onFormChange({ ...form, addressLine1: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none"
                placeholder="Sokak, bina no, daire"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">İlçe</label>
                <input
                  type="text"
                  value={form.district ?? ""}
                  onChange={(e) => onFormChange({ ...form, district: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none"
                  placeholder="İlçe"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">İl</label>
                <input
                  type="text"
                  value={form.city ?? ""}
                  onChange={(e) => onFormChange({ ...form, city: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none"
                  placeholder="İl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Teslimat</label>
                <select
                  value={form.deliveryType ?? "delivery"}
                  onChange={(e) => onFormChange({ ...form, deliveryType: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none"
                >
                  <option value="delivery">Teslimat</option>
                  <option value="pickup">Mağazadan al</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ödeme</label>
                <select
                  value={form.paymentMethod ?? "cash"}
                  onChange={(e) => onFormChange({ ...form, paymentMethod: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none"
                >
                  <option value="cash">Kapıda nakit</option>
                  <option value="card">Kapıda kart</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Not</label>
              <textarea
                value={form.note ?? ""}
                onChange={(e) => onFormChange({ ...form, note: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none resize-none"
                placeholder="Sipariş notu"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-600">Ürünler</label>
                <button type="button" onClick={onAddRow} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900">
                  <PlusIcon className="w-3.5 h-3.5" /> Satır ekle
                </button>
              </div>
              {productsLoading ? (
                <div className="py-6 flex items-center justify-center text-slate-500 text-sm">Ürünler yükleniyor...</div>
              ) : (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center flex-wrap p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <select
                        value={item.productId ?? ""}
                        onChange={(e) => onSelectProduct(index, e.target.value)}
                        className="flex-1 min-w-[140px] h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none"
                      >
                        <option value="">Ürün seçin</option>
                        {productList.map((p, pIdx) => (
                          <option key={p && p.id != null ? String(p.id) : `p-${pIdx}`} value={p && p.id != null ? p.id : ""}>
                            {p && p.name != null ? String(p.name) : "—"} — {formatCurrency(p && (p.discountPrice != null ? p.discountPrice : p.price))}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={item.qty ?? 1}
                        onChange={(e) => onUpdateItem(index, "qty", parseInt(e.target.value, 10) || 1)}
                        className="w-14 h-9 px-2 rounded-lg border border-slate-200 text-sm text-center"
                        placeholder="Adet"
                      />
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.price ?? 0}
                        onChange={(e) => onUpdateItem(index, "price", parseFloat(e.target.value) || 0)}
                        className="w-20 h-9 px-2 rounded-lg border border-slate-200 text-sm"
                        placeholder="Fiyat"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveRow(index)}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50"
                        title="Kaldır"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 py-3 px-4 rounded-xl bg-slate-800 text-white flex items-center justify-between">
                <span className="text-sm font-medium">Toplam</span>
                <span className="text-lg font-semibold">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-10 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {submitting ? "Gönderiliyor..." : "Siparişi oluştur"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
