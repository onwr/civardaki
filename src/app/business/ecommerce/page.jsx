"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBagIcon,
  SparklesIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  TruckIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";

function statusLabel(s) {
  if (s === "DELIVERED") return "TESLİM EDİLDİ";
  if (s === "ON_THE_WAY") return "KARGODA";
  if (s === "CONFIRMED" || s === "PREPARING") return "HAZIRLANIYOR";
  return "BEKLEMEDE";
}

export default function EcommercePage() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({ totalSales: 0, totalCommission: 0, netAmount: 0, pendingReconciliations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/business/ecommerce/sales?limit=5");
        if (res.ok) {
          const data = await res.json();
          setSales(data.sales ?? []);
          setSummary(data.summary ?? {});
        }
      } catch {
        setSales([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const { totalSales, totalCommission, netAmount, pendingReconciliations } = summary;

  return (
    <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. PREMIUM E-COMMERCE HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl group"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <ShoppingBagIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <ShoppingBagIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">E-Ticaret</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Multi-Channel Sales Oversight</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/business/ecommerce/statistics" className="px-8 py-5 bg-white/10 backdrop-blur-xl text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3">
              <SparklesIcon className="w-5 h-5 opacity-70" /> PAZARYERİ ANALİZİ
            </Link>
            <Link href="/business/products" className="px-10 py-5 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-3">
              YENİ ÜRÜN LİSTELE
            </Link>
          </div>
        </div>

        {/* Live Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mt-14 pt-10 border-t border-white/10 text-left">
          <div>
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Toplam Brüt Satış</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-white tracking-tighter">
                {totalSales.toLocaleString("tr-TR")} ₺
              </span>
              <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Net Kazanç</p>
            <span className="text-3xl font-black text-white tracking-tighter">
              {netAmount.toLocaleString("tr-TR")} ₺
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Komisyon Kesintisi</p>
            <span className="text-3xl font-black text-rose-300 tracking-tighter">
              {totalCommission.toLocaleString("tr-TR")} ₺
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Bekleyen Mutabakat</p>
            <span className="text-3xl font-black text-amber-300 tracking-tighter">
              {pendingReconciliations} Adet
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. RECENT SALES & AI INSIGHTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Recent Sales List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-6">
            <div>
              <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tighter">Son İşlemler</h3>
              <p className="text-[9px] font-black text-[#004aad] uppercase tracking-widest mt-1">Real-time Order Stream</p>
            </div>
            <Link href="/business/ecommerce/sales" className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#004aad] transition-all">
              Tümünü Gör
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-[2.5rem] bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : sales.length === 0 ? (
              <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 text-center text-gray-500 font-semibold">
                Henüz sipariş bulunmuyor.
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {sales.map((sale, i) => (
                  <motion.div
                    key={sale.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner group-hover:scale-110 transition-transform">
                        <TruckIcon className={`w-7 h-7 ${sale.status === "DELIVERED" ? "text-emerald-500" : "text-[#004aad]"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black uppercase text-[#004aad] tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                            {sale.platform}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                            sale.status === "DELIVERED" ? "bg-emerald-50 text-emerald-600" :
                            sale.status === "ON_THE_WAY" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                          }`}>
                            {statusLabel(sale.status)}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-gray-950 uppercase leading-none truncate">{sale.orderNumber}</h4>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest italic">{sale.customerName}</p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-8">
                      <div>
                        <p className="text-[10px] font-black text-[#004aad] uppercase tracking-widest mb-1 leading-none">Tutar</p>
                        <p className="text-2xl font-black text-gray-950 tracking-tighter">
                          {Number(sale.total).toLocaleString("tr-TR")} ₺
                        </p>
                      </div>
                      <Link href="/business/ecommerce/sales" className="p-4 bg-gray-50 text-gray-400 rounded-xl hover:bg-[#004aad] hover:text-white transition-all shadow-sm">
                        <ChevronRightIcon className="w-5 h-5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* AI & Marketplace Insights Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-[3.5rem] p-10 border border-blue-100 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <SparklesIcon className="w-32 h-32 text-[#004aad]" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-[#004aad]" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter italic">Pazaryeri <span className="text-[#004aad]">Trendleri</span></h3>
              </div>
              <p className="text-sm font-medium text-gray-500 italic leading-relaxed">
                "Trendyol'daki rakipleriniz benzer ürünlerde %5 indirim uyguladı. <span className="text-[#004aad] font-bold underline">Hızlı Fiyat Güncelleme</span> modülü ile rekabet gücünüzü artırabilirsiniz."
              </p>
              <button className="w-full py-5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[#004aad] transition-all">
                STRATEJİ OLUŞTUR
              </button>
            </div>
          </motion.div>

          <div className="bg-gradient-to-br from-gray-950 to-gray-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-8 text-center">
              <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10">
                <CalculatorIcon className="w-10 h-10 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-2">Net Kazanç (Toplam)</p>
                <p className="text-4xl font-black text-white tracking-tighter">{Number(netAmount).toLocaleString("tr-TR")} ₺</p>
              </div>
              <p className="text-[10px] font-medium text-gray-500 italic uppercase">Son Mutabakat: 2 gün önce</p>
              <Link href="/business/ecommerce/reconciliation" className="block w-full py-5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all text-center">
                MUTABAKATLARI YÖNET
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

