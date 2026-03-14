"use client";

import { motion } from "framer-motion";
import { TruckIcon, PrinterIcon, PlusIcon } from "@heroicons/react/24/outline";

/**
 * stats: [{ label, value, icon, badge?, badgePositive? }]
 */
export default function OrdersHero({ stats, onOpenReport, onOpenPanelOrder }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <TruckIcon className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Sipariş Yönetimi</h1>
            <p className="text-slate-500 text-sm mt-0.5">Anlık sipariş operasyonları</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200/80 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors min-h-[40px]"
          >
            <PrinterIcon className="w-4 h-4 shrink-0" /> Günlük Rapor
          </button>
          <button
            type="button"
            onClick={onOpenPanelOrder}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 border border-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors min-h-[40px]"
          >
            <PlusIcon className="w-4 h-4 shrink-0" /> Panel Siparişi
          </button>
        </div>
      </div>

      {Array.isArray(stats) && stats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
          {stats.map((stat, i) => (
            <div key={i} className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {stat.icon && <stat.icon className="w-4 h-4 text-slate-400 shrink-0" />}
                <span className="text-xs font-medium text-slate-500 truncate">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-lg md:text-xl font-semibold text-slate-900 truncate">{stat.value}</span>
                {stat.badge != null && stat.badge !== "" && (
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded ${stat.badgePositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                  >
                    {stat.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
