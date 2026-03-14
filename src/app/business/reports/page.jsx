"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Calendar,
  Download,
  Sparkles,
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Clock,
  Filter,
  Eye,
  RefreshCw,
  PieChart as PieChartIcon,
  Banknote,
  Archive,
  Users,
  ChevronDown,
  ArrowRight,
  Target,
  ShieldCheck
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const COLORS = ["#004aad", "#00ffcc", "#6366f1", "#f59e0b", "#ef4444"];

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, sales, financial, inventory
  const [dateRange, setDateRange] = useState("week");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Mock Data
  const salesData = [
    { name: "Pzt", value: 4500, orders: 12 },
    { name: "Sal", value: 5200, orders: 15 },
    { name: "Çar", value: 3800, orders: 10 },
    { name: "Per", value: 6100, orders: 18 },
    { name: "Cum", value: 7500, orders: 22 },
    { name: "Cmt", value: 9200, orders: 28 },
    { name: "Paz", value: 8400, orders: 25 },
  ];

  const categoryDistribution = [
    { name: "Dönerler", value: 45 },
    { name: "Kebaplar", value: 25 },
    { name: "Pideler", value: 15 },
    { name: "Yan Ürünler", value: 10 },
    { name: "İçecekler", value: 5 },
  ];

  const topProducts = [
    { name: "Tavuk Döner Dürüm", sales: 124, revenue: 5580, trend: "+12%" },
    { name: "Adana Kebap", sales: 86, revenue: 4730, trend: "+8%" },
    { name: "Karışık Pide", sales: 64, revenue: 2240, trend: "-2%" },
    { name: "Ayran", sales: 210, revenue: 1680, trend: "+15%" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-12 p-8 animate-pulse">
        <div className="h-80 bg-slate-200 rounded-[4rem]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[30rem] bg-slate-100 rounded-[3.5rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-24 max-w-[1700px] mx-auto px-6 font-inter antialiased">

      {/* 1. ELITE REPORT HERO */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-950 rounded-[4.5rem] p-12 md:p-20 text-white relative overflow-hidden shadow-4xl group"
      >
        <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
          <BarChart3 className="w-[30rem] h-[30rem]" />
        </div>

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-12">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.5)]" />
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-400 italic">Analitik Rapor</span>
            </div>
            <div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
                İŞ <span className="text-blue-500">ANALİTİĞİ</span>
              </h1>
              <p className="text-slate-500 text-lg md:text-xl font-bold italic mt-4 opacity-80 max-w-2xl">
                İşletme performansınızı gerçek zamanlı veriler ve yapay zeka destekli öngörülerle optimize edin.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            <button className="px-10 py-6 bg-white/5 backdrop-blur-2xl text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white hover:text-slate-950 transition-all border border-white/10 flex items-center gap-4 italic shadow-2xl">
              <Download className="w-5 h-5" /> RAPORU İNDİR
            </button>
            <div className="flex items-center bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-2 border border-white/10 shadow-inner">
              {["week", "month", "year"].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all italic ${dateRange === range
                      ? "bg-white text-slate-950 shadow-2xl"
                      : "text-slate-500 hover:text-white"
                    }`}
                >
                  {range === "week" ? "HAFTALIK" : range === "month" ? "AYLIK" : "YILLIK"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Matrix Bento */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mt-20 pt-16 border-t border-white/5">
          <div className="space-y-3 group/stat">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Net Ciro</p>
            <div className="flex items-end gap-4">
              <span className="text-5xl font-black text-white tracking-tighter italic">44.6k₺</span>
              <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl mb-1.5">+14%</span>
            </div>
          </div>
          <div className="space-y-3 group/stat">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Brüt Kar</p>
            <div className="flex items-end gap-4">
              <span className="text-5xl font-black text-white tracking-tighter italic">21.8k₺</span>
              <span className="text-[11px] font-black text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl mb-1.5">48.8%</span>
            </div>
          </div>
          <div className="space-y-3 group/stat">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Maliyetler</p>
            <div className="flex items-center gap-5">
              <span className="text-5xl font-black text-[#6366f1] tracking-tighter italic">22.8k₺</span>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse mt-2 shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
            </div>
          </div>
          <div className="space-y-3 group/stat">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Müşteri Sadakati</p>
            <div className="flex items-center gap-5">
              <span className="text-5xl font-black text-white tracking-tighter italic">8.9</span>
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-[3px] border-slate-900 bg-slate-800 shadow-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. ANALYTICS TABS & CONTROLS */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="bg-white p-2.5 rounded-[3rem] border border-slate-100 shadow-2xl flex flex-wrap items-center gap-2">
          {[
            { id: "overview", label: "GENEL BAKIŞ", icon: BarChart3 },
            { id: "sales", label: "SATIŞ ANALİZİ", icon: DollarSign },
            { id: "inventory", label: "STOK DURUMU", icon: Archive },
            { id: "customers", label: "MÜŞTERİLER", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-10 py-5 rounded-[2.2rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all italic ${activeTab === tab.id
                  ? "bg-slate-950 text-white shadow-3xl scale-[1.02]"
                  : "text-slate-400 hover:text-slate-600"
                }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-blue-400" : ""}`} />
              {tab.label}
            </button>
          ))}
        </div>

        <button className="px-10 py-6 bg-slate-50 rounded-[2.5rem] text-slate-400 hover:bg-slate-950 hover:text-white transition-all shadow-sm flex items-center gap-4 border border-slate-100 group">
          <Filter className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">FİLTRELE</span>
        </button>
      </div>

      {/* 3. MAIN ANALYTICS CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Sales Chart Section */}
        <div className="lg:col-span-8 space-y-12">
          <div className="bg-white p-14 rounded-[4.5rem] border border-slate-100 shadow-2xl relative overflow-hidden group/chart">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16">
              <div>
                <h3 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter">SATIŞ TRENDLERİ</h3>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" /> HAFTALIK PERFORMANS ANALİZİ
                </p>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[1.8rem] border border-slate-100 shadow-inner">
                <div className="flex items-center gap-2.5 px-6 border-r border-slate-200">
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                  <span className="text-[10px] font-black text-slate-600 uppercase italic tracking-widest">GELİR</span>
                </div>
                <div className="flex items-center gap-2.5 px-6">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]" />
                  <span className="text-[10px] font-black text-slate-600 uppercase italic tracking-widest">SİPARİŞ</span>
                </div>
              </div>
            </div>

            <div className="h-[450px] w-full group-hover/chart:scale-[1.01] transition-transform duration-700">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}
                    dy={20}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '2.5rem', border: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.12)', padding: '24px', backgroundColor: '#0f172a' }}
                    itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '11px', color: '#fff' }}
                    labelStyle={{ color: '#64748b', fontWeight: 900, fontSize: '10px', marginBottom: '8px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={5}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl group">
              <div className="flex items-center justify-between mb-10">
                <h4 className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter">KATEGORİ PAYI</h4>
                <PieChartIcon className="w-7 h-7 text-blue-500 group-hover:rotate-12 transition-transform" />
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={12}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={12} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-5 mt-8 justify-center">
                {categoryDistribution.map((cat, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
                    <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest">{cat.name} %{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <h4 className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter">PERFORMANS LİGİ</h4>
                <Target className="w-7 h-7 text-blue-600" />
              </div>
              <div className="space-y-6">
                {topProducts.map((product, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-4 rounded-[2rem] transition-all border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center font-black text-white group-hover:bg-blue-600 transition-all text-sm italic shadow-xl">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-950 italic uppercase leading-none">{product.name}</p>
                        <p className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest mt-2">{product.trend} ARTIŞ</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-950 italic tracking-tighter">{product.revenue.toLocaleString()}₺</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{product.sales} SATIŞ</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="lg:col-span-4 space-y-12">

          {/* AI INSIGHTS BLOCK */}
          <div className="bg-slate-950 p-12 rounded-[4.5rem] text-white shadow-4xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-125 transition-transform duration-1000">
              <Sparkles className="w-48 h-48 text-blue-400" />
            </div>
            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">STRATEJİ ASİSTANI</h4>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] mt-2 italic">AI Smart Engine</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-8 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 relative group/insight cursor-pointer hover:bg-white/10 transition-all shadow-inner">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-3 italic">
                    <TrendingUp className="w-4 h-4" /> VERİMLİLİK MAX
                  </p>
                  <p className="text-sm font-bold text-slate-200 leading-[1.8] italic opacity-90">"Hafta sonu akşam saatlerinde 'Karışık Pide' satışları %18 düştü. Kombo menü optimizasyonu öneriliyor."</p>
                </div>

                <div className="p-8 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 relative group/insight cursor-pointer hover:bg-white/10 transition-all shadow-inner">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-3 italic">
                    <Eye className="w-4 h-4" /> STOK ÖNGÖRÜSÜ
                  </p>
                  <p className="text-sm font-bold text-slate-200 leading-[1.8] italic opacity-90">"Soğuk içecek talebi ısı artışıyla beraber %40 yükseldi. Stok sevkiyatını 2 saat öne çekin."</p>
                </div>
              </div>

              <button className="w-full py-7 bg-white text-slate-950 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all shadow-2xl italic">
                AKSİYON ANALİZİNİ GÖR
              </button>
            </div>
          </div>

          {/* OPERATIONAL HEALTH */}
          <div className="bg-white p-12 rounded-[4.5rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 opacity-[0.02] -rotate-12 translate-y-12 translate-x-12">
              <ShieldCheck className="w-64 h-64 text-slate-900" />
            </div>
            <div className="relative z-10 space-y-12">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-950">SİSTEM SAĞLIĞI</h3>

              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase italic tracking-widest">
                    <span className="text-slate-400">Ortalama Teslimat</span>
                    <span className="text-emerald-500">18 DAKİKA</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase italic tracking-widest">
                    <span className="text-slate-400">Kapasite Kullanımı</span>
                    <span className="text-blue-500">92% OPTİMAL</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">HIZLI SERVİS</p>
                    <p className="text-2xl font-black text-slate-950 italic tracking-tighter leading-none">4.9/5</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">VERİMLİLİK</p>
                    <p className="text-2xl font-black text-slate-950 italic tracking-tighter leading-none">96%</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-950 rounded-[3rem] text-center shadow-3xl hover:bg-slate-900 transition-colors">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 italic">GELECEK DÖNEM TAHMİNİ</p>
                <p className="text-3xl font-black italic text-[#00ffcc] tracking-tighter">+8.5% BÜYÜME</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
