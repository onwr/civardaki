"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  Package,
  AlertTriangle,
  TrendingDown,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  Zap,
  Target,
  Box,
  LayoutGrid,
  ShieldAlert,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { mockInventoryData } from "@/lib/mock-data/reports";

export default function InventoryReportPage() {
  const [data] = useState(mockInventoryData);
  const [isLoading, setIsLoading] = useState(true);

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
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#004aad] italic">Envanter Takibi</span>
          </div>
          <div>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-950 tracking-tighter leading-none italic uppercase">
              STOK <br /> <span className="text-blue-600">DURUMU</span>
            </h1>
            <p className="text-slate-400 font-bold text-lg lg:text-xl italic opacity-80 mt-6 max-w-2xl">
              Ürün stok seviyelerini, envanter değerini ve kritik uyarıları tek bir profesyonel panelden yönetin.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="px-10 py-6 bg-slate-950 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-3xl flex items-center gap-4 italic">
            <Download className="w-5 h-5" /> RAPORU İNDİR
          </button>
        </div>
      </section>

      {/* 2. INVENTORY METRICS BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'TOPLAM ÜRÜN', value: data.totalProducts, sub: 'Aktif Envanter', icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'TOPLAM DEĞER', value: data.totalValue.toLocaleString("tr-TR", { style: "currency", currency: "TRY" }), sub: 'Mali Hacim', icon: Archive, color: 'text-slate-950', bg: 'bg-slate-50' },
          { label: 'DÜŞÜK STOK', value: data.lowStockCount, sub: 'Kritik Seviye', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'STOKTA YOK', value: data.outOfStockCount, sub: 'Acil Tedarik', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-50' }
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
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">GÜNCEL</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-950 italic tracking-tighter leading-none mb-3">{stat.value}</h3>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest opacity-60 italic">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* 3. INVENTORY TABLE SECTION */}
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-16 opacity-[0.01] pointer-events-none group-hover:scale-110 transition-transform duration-1000 rotate-12 translate-x-12 translate-y-12">
          <Box className="w-[40rem] h-[40rem]" />
        </div>

        <div className="p-12 lg:p-16 border-b border-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-950 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">ÜRETİM ENVANTERİ</h2>
              <p className="text-slate-400 font-bold italic text-sm mt-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Stok devir hızı ve depo optimizasyon verileri.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-96">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ürün veya SKU Ara..."
                className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[2.2rem] outline-none focus:ring-4 focus:ring-blue-500/5 font-bold italic text-slate-900 transition-all shadow-inner"
              />
            </div>
            <button className="p-6 bg-slate-50 rounded-[1.8rem] text-slate-400 hover:bg-slate-950 hover:text-white transition-all shadow-sm flex items-center gap-3 group border border-slate-100">
              <Filter className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="hidden md:block text-[11px] font-black uppercase tracking-widest italic">FİLTRE</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">ÜRÜN TANIMI</th>
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">MEVCUT STOK</th>
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">MİNİMUM EŞİK</th>
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">STOK DEĞERİ</th>
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">DURUM</th>
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic text-right">EYLEM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.products.map((product) => (
                <tr key={product.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-all shadow-sm">
                        <Package className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-950 italic tracking-tighter uppercase leading-none">{product.name}</p>
                        <p className="text-[10px] font-extrabold text-[#004aad] uppercase tracking-widest mt-2 italic leading-none">ID: #{product.id.split('-')[1]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-slate-950 italic tracking-tighter">{product.currentStock}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{product.unit}</span>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <div className="px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 inline-flex items-center gap-3">
                      <TrendingDown className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-black text-slate-950 italic tracking-tight">{product.minStock} {product.unit}</span>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <p className="text-xl font-black text-slate-950 italic tracking-tighter">
                      {product.value.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </p>
                  </td>
                  <td className="px-12 py-10">
                    {product.status === "OUT_OF_STOCK" ? (
                      <span className="inline-flex items-center px-5 py-2 text-[9px] font-black uppercase tracking-[0.15em] rounded-xl bg-rose-500 text-white shadow-lg italic">
                        <ShieldAlert className="h-3.5 w-3.5 mr-2" />
                        STOKTA YOK
                      </span>
                    ) : product.status === "LOW" ? (
                      <span className="inline-flex items-center px-5 py-2 text-[9px] font-black uppercase tracking-[0.15em] rounded-xl bg-amber-500 text-white shadow-lg italic">
                        <AlertTriangle className="h-3.5 w-3.5 mr-2" />
                        DÜŞÜK SEVİYE
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-5 py-2 text-[9px] font-black uppercase tracking-[0.15em] rounded-xl bg-emerald-500 text-white shadow-lg italic">
                        <ShieldCheck className="h-3.5 w-3.5 mr-2" />
                        OPTİMAL
                      </span>
                    )}
                  </td>
                  <td className="px-12 py-10 text-right">
                    <button className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-950 hover:text-white transition-all shadow-sm sm:float-right">
                      <ArrowUpRight className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-12 lg:p-16 bg-slate-950 text-white flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-blue-500 rounded-[2rem] flex items-center justify-center shadow-2xl relative overflow-hidden group/star">
              <div className="absolute inset-0 bg-blue-400 blur-xl opacity-50 animate-pulse" />
              <Zap className="w-10 h-10 text-white relative z-10 group-hover/star:scale-125 transition-transform" />
            </div>
            <div>
              <p className="text-4xl font-black italic tracking-tighter uppercase leading-none">AKILLI TEDARİK</p>
              <p className="text-slate-500 text-sm font-bold italic mt-3 opacity-80 uppercase tracking-widest leading-none">TÜM DÜŞÜK STOKLAR İÇİN TEK TIKLA SİPARİŞ OLUŞTURUN.</p>
            </div>
          </div>
          <button className="px-12 py-7 bg-white text-slate-950 rounded-[2.5rem] font-black uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all shadow-3xl flex items-center gap-4 italic group">
            SİPARİŞLERİ OLUŞTUR <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>

    </div>
  );
}
