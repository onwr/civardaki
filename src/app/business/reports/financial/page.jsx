"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Banknote,
  Download,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  ShieldCheck,
  CreditCard,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { mockFinancialData } from "@/lib/mock-data/reports";

export default function FinancialReportPage() {
  const [data] = useState(mockFinancialData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-12 p-8 animate-pulse">
        <div className="h-64 bg-slate-200 rounded-[3.5rem]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem]" />)}
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
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#004aad] italic">Finansal Analiz</span>
          </div>
          <div>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-950 tracking-tighter leading-none italic uppercase">
              FİNANSAL <br /> <span className="text-blue-600">PERFORMANS</span>
            </h1>
            <p className="text-slate-400 font-bold text-lg lg:text-xl italic opacity-80 mt-6 max-w-2xl">
              Gelir-gider dengesini, kar marjlarını ve nakit akışını kurumsal düzeyde analiz edin.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="px-10 py-6 bg-slate-950 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-3xl flex items-center gap-4 italic">
            <Download className="w-5 h-5" /> RAPORU İNDİR
          </button>
        </div>
      </section>

      {/* 2. CORE FINANCIAL METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { label: 'TOPLAM GELİR', value: data.revenue.total, trend: `+%${data.revenue.growth}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'TOPLAM GİDER', value: data.expenses.total, trend: `+%${data.expenses.growth}`, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
          { label: 'NET KAR', value: data.profit.total, trend: `Marj: %${data.profit.margin}`, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-white p-12 rounded-[3.5rem] border ${stat.border} shadow-sm group hover:shadow-2xl transition-all duration-500 relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform"><stat.icon className="w-24 h-24" /></div>
            <div className="flex items-center justify-between mb-10">
              <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color} shadow-inner group-hover:rotate-12 transition-transform`}><stat.icon className="w-7 h-7" /></div>
              <span className={`text-[10px] font-black ${stat.color} uppercase tracking-[0.2em] italic bg-white px-3 py-1 rounded-full border border-current opacity-60`}>{stat.trend}</span>
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">{stat.label}</p>
            <h3 className="text-5xl font-black text-slate-950 italic tracking-tighter leading-none mb-4">
              {stat.value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* 3. BREAKDOWN BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Revenue Distribution */}
        <div className="bg-white rounded-[4rem] p-12 lg:p-16 border border-slate-100 shadow-2xl space-y-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02]"><TrendingUp className="w-40 h-40" /></div>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform">
              <PieChartIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">GELİR DAĞILIMI</h2>
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-3 italic">Revenue Source Analysis</p>
            </div>
          </div>

          <div className="space-y-10">
            {data.revenue.breakdown.map((item, index) => (
              <div key={index} className="space-y-4 group cursor-pointer">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{item.category}</span>
                    <p className="text-2xl font-black text-slate-950 italic tracking-tighter mt-1">{item.percentage}% PAY</p>
                  </div>
                  <p className="text-xl font-black text-emerald-600 italic tracking-tighter">
                    {item.amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                  </p>
                </div>
                <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-slate-950 rounded-[4rem] p-12 lg:p-16 text-white shadow-4xl space-y-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.05]"><TrendingDown className="w-40 h-40 text-rose-500" /></div>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-rose-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform relative">
              <div className="absolute inset-0 bg-rose-600/30 blur-xl animate-pulse" />
              <CreditCard className="w-8 h-8 relative z-10" />
            </div>
            <div>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-white">GİDER DAĞILIMI</h2>
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mt-3 italic">Operational Cost Center</p>
            </div>
          </div>

          <div className="space-y-10">
            {data.expenses.breakdown.map((item, index) => (
              <div key={index} className="space-y-4 group cursor-pointer">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{item.category}</span>
                    <p className="text-2xl font-black text-white italic tracking-tighter mt-1">{item.percentage}% PAY</p>
                  </div>
                  <p className="text-xl font-black text-rose-500 italic tracking-tighter">
                    {item.amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                  </p>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-700 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 flex flex-col items-center">
            <div className="w-full p-8 bg-white/5 rounded-[3rem] border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 shadow-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-blue-400/20 blur-lg" />
                  <ShieldCheck className="w-6 h-6 relative z-10" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Nakit Akışı Koruması</p>
                  <p className="text-lg font-black italic text-white mt-1">SİSTEM AKTİF</p>
                </div>
              </div>
              <ArrowUpRight className="w-6 h-6 text-slate-700 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
