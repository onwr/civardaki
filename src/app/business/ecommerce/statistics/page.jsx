"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PresentationChartLineIcon,
  CircleStackIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export default function EcommerceStatisticsPage() {
  const [platformStats, setPlatformStats] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setError("");
      try {
        const res = await fetch("/api/business/ecommerce/stats", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setPlatformStats(data.platformStats ?? {});
          setTotalRevenue(data.totalRevenue ?? 0);
          setTotalOrders(data.totalOrders ?? 0);
          setTotalCommission(data.totalCommission ?? 0);
        } else {
          setPlatformStats({});
          setTotalRevenue(0);
          setTotalOrders(0);
          setTotalCommission(0);
          setError("İstatistik verileri alınamadı.");
        }
      } catch {
        setPlatformStats({});
        setTotalRevenue(0);
        setTotalOrders(0);
        setTotalCommission(0);
        setError("İstatistik verileri alınamadı.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. PREMIUM STATISTICS HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <PresentationChartLineIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <PresentationChartLineIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">E-Ticaret Analitiği</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Platform Bazlı Canlı Performans</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-14 pt-10 border-t border-white/10 text-left">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <CurrencyDollarIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Toplam Ciro</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{Number(totalRevenue).toLocaleString("tr-TR")} ₺</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <CircleStackIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Toplam Sipariş</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{totalOrders}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-rose-300">
              <ScaleIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Toplam Komisyon</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{Number(totalCommission).toLocaleString("tr-TR")} ₺</span>
          </div>
        </div>
      </motion.div>

      {error ? (
        <div className="mx-2 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700 font-semibold">
          {error}
        </div>
      ) : null}

      {/* 2. PLATFORM PERFORMANCE TABLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mx-2">
        {loading ? (
          <div className="col-span-full flex flex-wrap gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full md:w-[calc(50%-12px)] xl:w-[calc(33.333%-22px)] h-64 rounded-[4rem] bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : Object.keys(platformStats).length === 0 ? (
          <div className="col-span-full bg-white p-14 rounded-[4rem] border border-gray-100 text-center text-gray-500 font-semibold">
            Henüz sipariş verisi yok. Platform bazlı analiz siparişler geldikçe görünecektir.
          </div>
        ) : (
        <AnimatePresence>
          {Object.entries(platformStats).map(([platform, stats], i) => {
            const platformTotal = Number(stats?.total) || 0;
            const platformCount = Number(stats?.count) || 0;
            const platformCommission = Number(stats?.commission) || 0;
            const basketAverage = platformCount > 0 ? platformTotal / platformCount : 0;
            const performanceRate = totalRevenue > 0 ? (platformTotal / Number(totalRevenue)) * 100 : 0;
            const performanceWidth = `${Math.max(0, Math.min(100, performanceRate)).toFixed(0)}%`;

            return (
            <motion.div
              key={platform}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/30 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none transition-colors group-hover:bg-blue-100/50" />

              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center shadow-inner border border-gray-100 group-hover:scale-110 transition-transform">
                    <GlobeAltIcon className="w-8 h-8 text-[#004aad]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tighter leading-none">{platform}</h3>
                    <p className="text-[9px] font-black text-gray-400 mt-2 tracking-widest uppercase">Verified Integration</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-end border-b border-gray-50 pb-6">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">CİRO</p>
                    <p className="text-2xl font-black text-gray-950 leading-none">{platformTotal.toLocaleString("tr-TR")} ₺</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">KOMİSYON</p>
                    <p className="text-lg font-black text-rose-500 leading-none">{platformCommission.toLocaleString("tr-TR")} ₺</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-2">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">SİPARİŞ</p>
                    <p className="text-xl font-black text-gray-950 leading-none">{platformCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">SEPET ORT.</p>
                    <p className="text-xl font-black text-[#004aad] leading-none">{basketAverage.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺</p>
                  </div>
                </div>
              </div>

              {/* Performance Indicator Bar */}
              <div className="mt-8 h-2 bg-gray-50 rounded-full overflow-hidden shrink-0">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: performanceWidth }}
                  className="h-full bg-[#004aad] shadow-[0_0_15px_rgba(0,74,173,0.3)]"
                />
              </div>
              <div className="mt-3 text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Ciro Payı %{performanceRate.toFixed(1)}
                </span>
              </div>
            </motion.div>
            );
          })}
        </AnimatePresence>
        )}
      </div>
    </div>
  );
}

