"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserPlus,
  Crown,
  TrendingUp,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  Star,
  Target,
  Zap,
  TrendingDown,
  Clock
} from "lucide-react";
import { mockCustomerListData } from "@/lib/mock-data/reports";

export default function CustomersReportPage() {
  const [data] = useState(mockCustomerListData);
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
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#004aad] italic">Müşteri Analitiği</span>
          </div>
          <div>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-950 tracking-tighter leading-none italic uppercase">
              MÜŞTERİ <br /> <span className="text-blue-600">PORTFÖYÜ</span>
            </h1>
            <p className="text-slate-400 font-bold text-lg lg:text-xl italic opacity-80 mt-6 max-w-2xl">
              Müşteri segmentasyonu, bağlılık oranları ve harcama alışkanlıklarını derinlemesine inceleyin.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="px-10 py-6 bg-slate-950 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-3xl flex items-center gap-4 italic">
            <Download className="w-5 h-5" /> RAPORU İNDİR
          </button>
        </div>
      </section>

      {/* 2. CORE METRICS BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'TOPLAM MÜŞTERİ', value: data.totalCustomers, sub: 'Aktif Kullanıcılar', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          ...data.segments.map(s => ({
            label: s.name.toUpperCase(),
            value: s.count,
            sub: s.totalSpent.toLocaleString("tr-TR", { style: "currency", currency: "TRY" }),
            icon: s.name.includes('VIP') ? Crown : Star,
            color: s.name.includes('VIP') ? 'text-amber-500' : 'text-emerald-500',
            bg: s.name.includes('VIP') ? 'bg-amber-50' : 'bg-emerald-50'
          }))
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
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">CANLI</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-4xl font-black text-slate-950 italic tracking-tighter leading-none mb-3">{stat.value}</h3>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest opacity-60 italic">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* 3. RFM ANALİZİ & VIP LİSTESİ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* RFM Analysis Section */}
        <div className="lg:col-span-12 space-y-10">
          <div className="bg-slate-950 rounded-[4rem] p-12 lg:p-16 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000"><Zap className="w-60 h-60" /></div>
            <div className="relative z-10 space-y-12">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/5 backdrop-blur-3xl rounded-[1.8rem] flex items-center justify-center border border-white/10 text-blue-400 group-hover:rotate-12 transition-transform">
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">RFM SEGMENTASYONU</h2>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mt-3 italic">Behavioral Analysis Engine</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.rfmAnalysis.map((segment, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] space-y-6 hover:bg-white/10 transition-all group/card">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">{segment.segment}</h3>
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-extrabold text-sm shadow-2xl">
                        {segment.count}
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm font-bold italic leading-relaxed opacity-80 group-hover/card:opacity-100 transition-opacity">
                      {segment.description}
                    </p>
                    <div className="pt-4 flex items-center gap-3 text-blue-400 text-[10px] font-black uppercase tracking-widest italic cursor-pointer group-hover/card:translate-x-2 transition-transform">
                      SEGMENTİ İNCELE <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* VIP Customer Table */}
        {data.segments[0].customers && (
          <div className="lg:col-span-12">
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden">
              <div className="p-12 lg:p-16 border-b border-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div>
                  <h2 className="text-4xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">ELITE MÜŞTERİLER</h2>
                  <p className="text-slate-400 font-bold italic text-sm mt-3 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" /> En yüksek sadakat ve harcama hacmine sahip kullanıcılar.
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Müşteri Ara..."
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/5 font-bold italic text-slate-900 transition-all"
                    />
                  </div>
                  <button className="p-5 bg-slate-50 rounded-3xl text-slate-400 hover:bg-slate-950 hover:text-white transition-all shadow-sm">
                    <Filter className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">MÜŞTERİ PROFİLİ</th>
                      <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">SİPARİŞ HACMİ</th>
                      <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">TOPLAM CİRO</th>
                      <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">SON ETKİLEŞİM</th>
                      <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic text-right">AKSİYON</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.segments[0].customers.map((customer) => (
                      <tr key={customer.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                        <td className="px-12 py-10">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center text-white font-black italic shadow-xl group-hover:bg-blue-600 transition-colors">
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-lg font-black text-slate-950 italic tracking-tighter uppercase">{customer.name}</p>
                              <p className="text-[10px] font-extrabold text-[#004aad] uppercase tracking-widest mt-1.5 italic">VIP SEGMENT</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-12 py-10">
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-black text-slate-950 italic tracking-tighter">{customer.totalOrders}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">SİPARİŞ</span>
                          </div>
                        </td>
                        <td className="px-12 py-10">
                          <p className="text-2xl font-black text-slate-950 italic tracking-tighter">
                            {customer.totalSpent.toLocaleString("tr-TR", {
                              style: "currency",
                              currency: "TRY",
                            })}
                          </p>
                        </td>
                        <td className="px-12 py-10">
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <p className="text-sm font-bold text-slate-500 italic">
                              {new Date(customer.lastOrderDate).toLocaleDateString("tr-TR")}
                            </p>
                          </div>
                        </td>
                        <td className="px-12 py-10 text-right text-left">
                          <button className="px-8 py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl italic">
                            PROFİLİ GÖR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-10 bg-slate-50/50 text-center border-t border-slate-50">
                <button className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] italic hover:text-[#004aad] transition-colors">TÜM LİSTEYİ YÜKLE</button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
