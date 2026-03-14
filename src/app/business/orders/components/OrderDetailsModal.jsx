"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCartIcon,
  MapPinIcon,
  PrinterIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency, formatOrderDateTime } from "../lib/order-formatters";
import { getStatusLabel } from "../lib/order-status";
import { toast } from "sonner";

const CIVARDAKI_COPYRIGHT = "© Civardaki — civardaki.com";

function buildOrderPrintHtml(order) {
  const orderNumber = order && order.orderNumber != null ? String(order.orderNumber) : "—";
  const customerName = order && order.customerName != null ? String(order.customerName) : "—";
  const customerLoc = order && order.customerLoc != null ? String(order.customerLoc) : "—";
  const customerNote = order && order.customerNote != null && order.customerNote !== "" ? String(order.customerNote) : "—";
  const items = Array.isArray(order && order.items) ? order.items : [];
  const deliveryType = order && order.deliveryType != null ? String(order.deliveryType) : "—";
  const paymentMethod = order && order.paymentMethod != null ? String(order.paymentMethod) : "—";
  const dateTime = formatOrderDateTime(order && order.createdAt);
  const total = formatCurrency(order && order.total);
  const status = getStatusLabel(order && order.status);

  const rows = items
    .map(
      (item) =>
        `<tr><td>${item && item.name != null ? String(item.name).replace(/</g, "&lt;") : "—"}</td><td>${item && item.qty != null ? Number(item.qty) : 0}</td><td>${formatCurrency(item && item.price)}</td><td>${formatCurrency((item && item.qty != null ? Number(item.qty) : 0) * (item && item.price != null ? Number(item.price) : 0))}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>Sipariş ${orderNumber}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.5; }
    h1 { font-size: 1.25rem; margin: 0 0 8px 0; font-weight: 700; }
    .meta { color: #64748b; font-size: 0.8125rem; margin-bottom: 20px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px; }
    .address-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; white-space: pre-wrap; word-break: break-word; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; font-size: 0.75rem; color: #475569; }
    .total-row { font-weight: 700; font-size: 1rem; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 0.75rem; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>Sipariş ${orderNumber}</h1>
  <p class="meta">${dateTime} · ${status}</p>

  <div class="section">
    <div class="section-title">Müşteri</div>
    <p style="margin:0; font-weight: 600;">${customerName.replace(/</g, "&lt;")}</p>
  </div>

  <div class="section">
    <div class="section-title">Teslimat adresi</div>
    <div class="address-block">${customerLoc.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</div>
  </div>

  <div class="section">
    <div class="section-title">Müşteri notu</div>
    <p style="margin:0;">${customerNote.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>
  </div>

  <div class="section">
    <div class="section-title">Sevkiyat</div>
    <p style="margin:0;">Teslimat: ${deliveryType.replace(/</g, "&lt;")} · Ödeme: ${paymentMethod.replace(/</g, "&lt;")}</p>
  </div>

  <div class="section">
    <div class="section-title">Ürünler</div>
    <table>
      <thead><tr><th>Ürün</th><th>Adet</th><th>Birim fiyat</th><th>Tutar</th></tr></thead>
      <tbody>${rows}</tbody>
      <tr class="total-row"><td colspan="3">Toplam</td><td>${total}</td></tr>
    </table>
  </div>

  <div class="footer">${CIVARDAKI_COPYRIGHT}</div>
  <script>
    (function() {
      function doPrint() { try { window.print(); } catch (e) {} }
      if (document.readyState === "complete") setTimeout(doPrint, 250);
      else window.addEventListener("load", function() { setTimeout(doPrint, 250); });
      window.onafterprint = function() { window.close(); };
    })();
  </script>
</body>
</html>`;
}

export default function OrderDetailsModal({
  order,
  onClose,
  onStatusChange,
}) {
  if (!order) return null;

  const orderNumber = order.orderNumber != null ? String(order.orderNumber) : "—";
  const customerName = order.customerName != null ? String(order.customerName) : "—";
  const customerLoc = order.customerLoc != null ? String(order.customerLoc) : "—";
  const customerNote = order.customerNote != null && order.customerNote !== "" ? String(order.customerNote) : "Not bırakılmamış.";
  const items = Array.isArray(order.items) ? order.items : [];

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Yazdırma penceresi engellendi. Lütfen tarayıcı izinlerini kontrol edin.");
      return;
    }
    win.document.write(buildOrderPrintHtml(order));
    win.document.close();
    win.focus();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          aria-hidden
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full sm:max-w-4xl bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[92vh] sm:max-h-[88vh] z-10"
        >
          <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
            <div className="md:w-[280px] shrink-0 bg-slate-800 text-white p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
                  <ShoppingCartIcon className="w-5 h-5 text-slate-300" />
                </div>
                <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-white/30 md:hidden min-w-[40px] min-h-[40px]" aria-label="Kapat">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-1 min-w-0">
                <span className="text-xs font-medium text-slate-400 font-mono block truncate">{orderNumber}</span>
                <h2 className="text-lg font-semibold text-white truncate" title={customerName}>{customerName}</h2>
                <div className="flex items-start gap-2 text-slate-400 text-sm mt-2">
                  <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="break-words whitespace-pre-wrap min-w-0">{customerLoc}</span>
                </div>
              </div>
              <div className="mt-6 flex-1 min-h-0">
                <p className="text-xs font-medium text-slate-500 mb-2">Müşteri notu</p>
                <p className="text-sm text-slate-300 italic break-words line-clamp-4" title={customerNote}>{customerNote}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-700 space-y-4">
                <div className="flex justify-between items-end gap-2">
                  <span className="text-xs text-slate-500">Toplam</span>
                  <span className="text-xl font-semibold text-emerald-400">{formatCurrency(order.total)}</span>
                </div>
                <span className="inline-block text-xs font-medium text-emerald-400/90 bg-emerald-400/10 px-2 py-1 rounded">Ödendi</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-slate-600 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors min-h-[40px]"
                >
                  Kapat
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 min-w-0">
              <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <h4 className="text-base font-semibold text-slate-900">Sipariş akışı</h4>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200/80 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 min-h-[36px]"
                >
                  <PrinterIcon className="w-4 h-4 shrink-0" /> Yazdır
                </button>
              </div>

              <div className="space-y-3 mb-8">
                {order.status === "PENDING" && order.id && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onStatusChange(order.id, "CONFIRMED")}
                      className="flex-1 min-w-[140px] py-3 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 min-h-[44px]"
                    >
                      Siparişi onayla
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange(order.id, "CANCELLED")}
                      className="px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 min-h-[44px]"
                    >
                      Reddet
                    </button>
                  </div>
                )}
                {order.status === "CONFIRMED" && order.id && (
                  <button
                    type="button"
                    onClick={() => onStatusChange(order.id, "PREPARING")}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 min-h-[44px]"
                  >
                    Hazırlık aşamasına geç
                  </button>
                )}
                {order.status === "PREPARING" && order.id && (
                  <button
                    type="button"
                    onClick={() => onStatusChange(order.id, "ON_THE_WAY")}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 min-h-[44px]"
                  >
                    Kurye&apos;ye teslim et
                  </button>
                )}
                {order.status === "ON_THE_WAY" && order.id && (
                  <button
                    type="button"
                    onClick={() => onStatusChange(order.id, "DELIVERED")}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 min-h-[44px]"
                  >
                    Teslimatı tamamla
                  </button>
                )}
                {order.status === "DELIVERED" && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="w-10 h-10 rounded-lg bg-white border border-emerald-100 flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Teslimat tamamlandı</p>
                      <p className="text-xs text-slate-600">Sipariş arşivlendi.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h5 className="text-sm font-semibold text-slate-900 mb-3">Ürünler ({items.length})</h5>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <ArchiveBoxIcon className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{item && item.name != null ? String(item.name) : "—"}</p>
                          <p className="text-xs text-slate-500">{item && item.qty != null ? Number(item.qty) : 0} adet</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 shrink-0">{formatCurrency(item && item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
                <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Teslimat adresi</h5>
                <div className="p-4 rounded-lg bg-white border border-slate-200">
                  <p className="text-sm font-medium text-slate-900 whitespace-pre-wrap break-words">{customerLoc}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Sevkiyat</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 mb-0.5">Yöntem</p>
                    <p className="font-medium text-slate-900 truncate">{order.deliveryType != null ? String(order.deliveryType) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-0.5">Ödeme</p>
                    <p className="font-medium text-slate-900 truncate">{order.paymentMethod != null ? String(order.paymentMethod) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-0.5">Sipariş saati</p>
                    <p className="font-medium text-slate-900">{formatOrderDateTime(order.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
