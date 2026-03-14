"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ShoppingCartIcon,
  SparklesIcon,
  ChevronRightIcon,
  BoltIcon,
  BanknotesIcon,
  TruckIcon,
  UserCircleIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

function statusLabel(s) {
  if (s === "DELIVERED") return "TESLİM";
  if (s === "ON_THE_WAY") return "KARGODA";
  return "BEKLEMEDE";
}

export default function EcommerceSalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [platforms, setPlatforms] = useState([]);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterPlatform && filterPlatform !== "all") params.set("platform", filterPlatform);
      if (searchTerm) params.set("q", searchTerm);
      const res = await fetch(`/api/business/ecommerce/sales?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSales(data.sales ?? []);
      } else {
        setSales([]);
      }
    } catch {
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [filterPlatform, searchTerm]);

  useEffect(() => {
    async function loadPlatforms() {
      try {
        const res = await fetch("/api/business/ecommerce/stats");
        if (res.ok) {
          const data = await res.json();
          setPlatforms(Object.keys(data.platformStats ?? {}));
        }
      } catch {}
    }
    loadPlatforms();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchSales(), searchTerm ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchSales, searchTerm]);

  const totalVolume = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const avgOrder = sales.length ? Math.round(totalVolume / sales.length) : 0;

  return (
    <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. PREMIUM SALES HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <ShoppingCartIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <ShoppingCartIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Satış Analizi</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Marketplace Performance & Orders</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-8 py-5 bg-white/10 backdrop-blur-xl text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3">
              <SparklesIcon className="w-5 h-5 opacity-70" /> AI VOLUME FORECAST
            </button>
            <button className="px-10 py-5 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-3">
              <BoltIcon className="w-5 h-5" /> HIZLI RAPOR
            </button>
          </div>
        </div>

        {/* Live Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 mt-14 pt-10 border-t border-white/10 text-left">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <BanknotesIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Toplam Hacim</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{totalVolume.toLocaleString("tr-TR")} ₺</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <ArrowTrendingUpIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ort. Sepet Tutarı</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{avgOrder.toLocaleString("tr-TR")} ₺</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <BoltIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Toplam Sipariş</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{sales.length} Adet</span>
          </div>
        </div>
      </motion.div>

      {/* 2. SEARCH & FILTERS */}
      <div className="bg-white p-6 md:p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col xl:flex-row items-center justify-between gap-6 mx-2 md:mx-4">
        <div className="w-full xl:w-auto flex-1 min-w-[300px] relative group h-full">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Sipariş no veya müşteri ara..."
            className="w-full h-[72px] pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[240px] w-full xl:w-auto h-full group">
          <FunnelIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-hover:text-[#004aad] transition-colors pointer-events-none" />
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="w-full h-[72px] pl-20 pr-10 bg-gray-50/50 border-2 border-transparent focus:border-[#004aad]/10 focus:ring-4 focus:ring-[#004aad]/5 rounded-[2.5rem] outline-none font-black text-base text-gray-950 appearance-none cursor-pointer italic transition-all"
          >
            <option value="all">Tüm Platformlar</option>
            {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* 3. SALES FEED */}
      <div className="space-y-6 mx-2 md:mx-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-[4rem] bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : sales.length === 0 ? (
          <div className="bg-white p-14 rounded-[4rem] border border-gray-100 text-center text-gray-500 font-semibold">
            Sipariş bulunamadı. Arama veya filtreyi değiştirmeyi deneyin.
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {sales.map((sale, i) => (
              <motion.div
                key={sale.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all flex flex-col lg:flex-row items-center gap-12 group"
              >
                <div className="flex items-center gap-8 lg:w-[30%] shrink-0">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center shadow-inner border border-gray-100 group-hover:scale-110 transition-transform">
                    <UserCircleIcon className="w-9 h-9 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-black uppercase text-[#004aad] tracking-widest bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                        {sale.platform}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${
                        sale.status === "DELIVERED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        sale.status === "ON_THE_WAY" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {statusLabel(sale.status)}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-gray-950 uppercase tracking-tighter leading-none">{sale.customerName}</h3>
                    <div className="flex items-center gap-2 mt-2.5">
                      <TruckIcon className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sale.orderNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 px-8 lg:border-x border-gray-100">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none italic">Ürün</p>
                      <p className="text-sm font-black text-gray-950 uppercase truncate">{sale.productName}</p>
                    </div>
                    <div className="text-right lg:text-left">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Tutar</p>
                      <p className="text-lg font-black text-gray-950">{Number(sale.total).toLocaleString("tr-TR")} ₺</p>
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1.5 leading-none">Komisyon</p>
                      <p className="text-lg font-black text-rose-500">-{Number(sale.commission).toLocaleString("tr-TR")} ₺</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-[#004aad] uppercase tracking-widest mb-1.5 leading-none">Net</p>
                      <p className="text-xl font-black text-[#004aad]">{Number(sale.netAmount).toLocaleString("tr-TR")} ₺</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end lg:w-[10%] shrink-0">
                  <span className="p-5 bg-gray-50 text-gray-400 rounded-2xl shadow-sm border border-gray-100">
                    <ChevronRightIcon className="w-6 h-6" />
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

