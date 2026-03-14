"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DocumentTextIcon, PrinterIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getStatusLabel } from "../lib/order-status";
import { formatCurrency, formatOrderTime } from "../lib/order-formatters";

export default function OrdersReportModal({
  open,
  reportDate,
  onReportDateChange,
  reportOrders,
  reportLoading,
  onClose,
  onPrint,
  printRef,
}) {
  if (!open) return null;

  const orders = Array.isArray(reportOrders) ? reportOrders : [];
  const deliveredTotal = orders.filter((o) => o && o.status === "DELIVERED").reduce((s, o) => s + (Number(o.total) || 0), 0);
  const statusCounts = orders.reduce((acc, o) => {
    if (!o) return acc;
    const st = o.status || "UNKNOWN";
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

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
          ref={printRef}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
        >
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <DocumentTextIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-900">Günlük rapor</h2>
                <input
                  type="date"
                  value={reportDate ?? ""}
                  onChange={(e) => onReportDateChange(e.target.value)}
                  aria-label="Rapor tarihi"
                  className="mt-0.5 text-sm font-medium text-slate-600 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none min-w-0"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onPrint}
                disabled={reportLoading || orders.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none min-h-[40px]"
              >
                <PrinterIcon className="w-4 h-4 shrink-0" /> Yazdır
              </button>
              <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 min-w-[40px] min-h-[40px]" aria-label="Kapat">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-5">
            {reportLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Rapor yükleniyor...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-slate-500 text-sm font-medium">Bu tarihte sipariş bulunamadı.</p>
                <p className="text-slate-400 text-xs mt-1">Başka bir tarih seçin veya raporu kapatın.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-medium text-slate-500">Toplam sipariş</p>
                    <p className="text-lg font-semibold text-slate-900 mt-1">{orders.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-medium text-slate-500">Ciro (teslim)</p>
                    <p className="text-lg font-semibold text-emerald-600 mt-1">{formatCurrency(deliveredTotal)}</p>
                  </div>
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-medium text-slate-500 truncate">{getStatusLabel(status)}</p>
                      <p className="text-lg font-semibold text-slate-900 mt-1">{count}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left py-3 px-3 font-semibold text-slate-600">Sipariş no</th>
                          <th className="text-left py-3 px-3 font-semibold text-slate-600">Müşteri</th>
                          <th className="text-left py-3 px-3 font-semibold text-slate-600">Durum</th>
                          <th className="text-right py-3 px-3 font-semibold text-slate-600">Tutar</th>
                          <th className="text-left py-3 px-3 font-semibold text-slate-600">Saat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o && o.id != null ? o.id : Math.random()} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{o && o.orderNumber != null ? String(o.orderNumber) : "—"}</td>
                            <td className="py-2.5 px-3 text-slate-700 truncate max-w-[120px]">{o && o.customerName != null ? String(o.customerName) : "—"}</td>
                            <td className="py-2.5 px-3 text-slate-600">{getStatusLabel(o && o.status)}</td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-900">{formatCurrency(o && o.total)}</td>
                            <td className="py-2.5 px-3 text-slate-500">{formatOrderTime(o && o.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
