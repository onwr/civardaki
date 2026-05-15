"use client";

import { motion } from "framer-motion";
import {
  TruckIcon,
  PrinterIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const tones = [
  "from-blue-600 to-indigo-700",
  "from-emerald-500 to-emerald-700",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-700",
];

export default function OrdersHero({ stats, onOpenReport, onOpenPanelOrder }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-7 text-white">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
              <TruckIcon className="h-4 w-4" />
              Sipariş Operasyon Merkezi
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Sipariş Yönetimi
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Gelen siparişleri takip edin, durumlarını yönetin, günlük rapor
              alın ve panel üzerinden hızlı sipariş oluşturun.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenReport}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/15"
            >
              <PrinterIcon className="h-5 w-5" />
              Günlük Rapor
            </button>

            <button
              type="button"
              onClick={onOpenPanelOrder}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
            >
              <PlusIcon className="h-5 w-5" />
              Panel Siparişi
            </button>
          </div>
        </div>
      </div>

      {Array.isArray(stats) && stats.length > 0 && (
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br ${
                tones[i % tones.length]
              } p-5 text-white shadow-[0_12px_30px_rgba(15,23,42,0.14)]`}
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
                    {stat.label}
                  </p>

                  <p className="mt-3 text-2xl font-bold tracking-tight">
                    {stat.value}
                  </p>

                  {stat.badge != null && stat.badge !== "" && (
                    <p className="mt-2 text-xs font-semibold text-white/75">
                      {stat.badge}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
                  {stat.icon ? (
                    <stat.icon className="h-5 w-5" />
                  ) : (
                    <SparklesIcon className="h-5 w-5" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}