"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Banknote,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  ArrowUpRight,
  Zap,
  DollarSign,
  Activity,
  ArrowRight,
  Clock,
  Filter,
  Search
} from "lucide-react";
import { mockSalesPurchasesData } from "@/lib/mock-data/reports";

export default function SalesPurchasesReportPage() {
  const [data] = useState(mockSalesPurchasesData);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("week");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-12 p-8 animate-pulse">
        <div className="h-64 bg-slate-200 rounded-[3.5rem]" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 rounded-[2.5rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-24 font-inter antialiased">

      {/* 1. ELITE HERO SECTION */}
      <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#004aad] italic">Ticari Hacim Analizi</span>
          </div>
          <div>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-950 tracking-tighter leading-none italic uppercase">
              SATIŞ VE <br /> <span className="text-blue-600">ALIMLAR</span>
            </h1>
            <p className="text-slate-400 font-bold text-lg lg:text-xl italic opacity-80 mt-6 max-w-2xl">
              Satış gelirleri ve alım maliyetleri arasındaki korelasyonu profesyonel veri setleriyle izleyin.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-5">
          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-[2.5rem] p-2 shadow-inner">
            {["week", "month", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all italic ${dateRange === range
                    ? "bg-slate-950 text-white shadow-2xl"
                    : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                {range === "week" ? "HAFTALIK" : range === "month" ? "AYLIK" : "YILLIK"}
              </button>
            ))}
          </div>
          <button className="px-10 py-6 bg-slate-950 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-3xl flex items-center gap-4 italic">
            <Download className="w-5 h-5" /> RAPORU İNDİR
          </button>
        </div>
      </section>

      {/* 2. CORE TRADE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'TOPLAM SATIŞ', value: data.sales.total, growth: data.sales.growth, icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'TOPLAM ALIŞ', value: data.purchases.total, growth: data.purchases.growth, icon: Banknote, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'SATIŞ ADEDİ', value: data.sales.count, sub: 'İşlem Hacmi', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'ORTALAMA SEPET', value: data.sales.average, sub: 'Birim Verimi', icon: DollarSign, color: 'text-slate-950', bg: 'bg-slate-50' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all duration-500"
          >
            <div className="flex items-center justify-between mb-8">
              <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color} shadow-inner group-hover:rotate-12 transition-transform`}><stat.icon className="w-7 h-7" /></div>
              {stat.growth && (
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] italic bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">+%{stat.growth}</span>
              )}
              {stat.sub && (
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">VERİMLİLİK</span>
              )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-950 italic tracking-tighter leading-none mb-3">
              {typeof stat.value === 'number' && stat.label.includes('TOPLAM') || stat.label.includes('SEPET') ?
                stat.value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" }) :
                stat.value
              }
            </h3>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest opacity-60 italic">{stat.sub || 'Haftalık Artış'}</p>
          </motion.div>
        ))}
      </div>

      {/* 3. COMPARISON DATA TABLE */}
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden group">
        <div className="p-12 lg:p-16 border-b border-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-950 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">İŞLEM KARŞILAŞTIRMA</h2>
              <p className="text-slate-400 font-bold italic text-sm mt-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" /> Günlük bazda satış-alış farkı ve brüt kar projeksiyonu.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tarih Filtrele..."
                className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[2.2rem] outline-none focus:ring-4 focus:ring-blue-500/5 font-bold italic text-slate-900 transition-all shadow-inner"
              />
            </div>
            <button className="p-6 bg-slate-50 rounded-[1.8rem] text-slate-400 hover:bg-slate-950 hover:text-white transition-all shadow-sm flex items-center gap-3 group border border-slate-100">
              <Filter className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic border-r border-slate-100">TİCARİ TAKVİM</th>
                <th className="px-12 py-8 text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] italic">GELİR (SATIŞ)</th>
                <th className="px-12 py-8 text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] italic">GİDER (ALIŞ)</th>
                <th className="px-12 py-8 text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] italic">NET FARK</th>
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic text-right">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-inter">
              {data.sales.chartData.map((item, index) => (
                <tr key={index} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                  <td className="px-12 py-10 border-r border-slate-50">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white text-xs font-black italic shadow-xl">
                        {index + 1}
                      </div>
                      <p className="text-lg font-black text-slate-950 italic tracking-tighter uppercase">
                        {new Date(item.date).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <p className="text-xl font-black text-emerald-600 italic tracking-tighter">
                      {item.sales.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </p>
                  </td>
                  <td className="px-12 py-10">
                    <p className="text-xl font-black text-rose-500 italic tracking-tighter">
                      {item.purchases.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </p>
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${(item.sales - item.purchases) > 0 ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                      <p className="text-2xl font-black text-slate-950 italic tracking-tighter">
                        {(item.sales - item.purchases).toLocaleString("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="px-12 py-10 text-right">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-slate-950 group-hover:text-white transition-all shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest italic group-hover:text-blue-400">DETAYI AÇ</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-12 lg:p-16 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-10 border-t border-slate-50">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-500 shadow-inner group/trend hover:rotate-12 transition-transform">
              <TrendingUp className="w-10 h-10" />
            </div>
            <div>
              <p className="text-3xl font-black italic tracking-tighter uppercase leading-none">PERFORMANS PROJEKSİYONU</p>
              <p className="text-slate-400 text-sm font-bold italic mt-3 opacity-80 uppercase tracking-widest leading-none">SON 7 GÜNLÜK VERİYE GÖRE KARLILIĞINIZ %12 ARTIŞ GÖSTERDİ.</p>
            </div>
          </div>
          <button className="text-[11px] font-black text-[#004aad] uppercase tracking-[0.3em] italic hover:border-b-2 border-[#004aad] transition-all pb-1 leading-none">ANALİZİN TAMAMINI İNDİR</button>
        </div>
      </div>

    </div>
  );
}
