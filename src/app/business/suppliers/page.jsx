"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BuildingOffice2Icon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhoneIcon,
  MapPinIcon,
  StarIcon,
  PencilSquareIcon,
  ArrowUpIcon,
  SparklesIcon,
  BanknotesIcon,
  CheckBadgeIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { mockSuppliers, supplierStats } from "@/lib/mock-data/suppliers";

export default function SuppliersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [suppliers, setSuppliers] = useState(mockSuppliers);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || s.category.includes(filterCategory);
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-10 p-4">
        <div className="h-48 bg-gray-100 rounded-[4rem] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-50 rounded-[3rem] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 max-w-[1600px] mx-auto">

      {/* 1. PREMIUM HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-2xl">
          <BuildingOffice2Icon className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl bg-[#004aad] flex items-center justify-center shadow-lg shadow-blue-500/20">
                <BuildingOffice2Icon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Tedarikçi Ağı</h1>
            </div>
            <p className="text-gray-400 font-bold text-lg max-w-xl italic">İşletmenizin can damarı olan tedarikçilerinizi yönetin, performanslarını analiz edin ve en iyi fiyatları yakalayın.</p>
          </div>

          <button className="px-10 py-5 bg-[#004aad] text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-white hover:text-[#004aad] transition-all shadow-2xl flex items-center gap-3 active:scale-95">
            <PlusIcon className="w-5 h-5" /> YENİ TEDARİKÇİ EKLE
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-14 pt-10 border-t border-white/5">
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Aktif Partnerler</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-white">{supplierStats.activePartners}</span>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">+1</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Toplam Harcama</p>
            <span className="text-3xl font-black text-white">{supplierStats.totalSpend.toLocaleString()}₺</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Ortalama Sadakat</p>
            <span className="text-3xl font-black text-blue-400">{supplierStats.avgReliability}%</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Bekleyen Teklifler</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-white">{supplierStats.pendingQuotes}</span>
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. FILTERS & SEARCH */}
      <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-wrap items-center justify-between gap-6 mx-4">
        <div className="flex-1 min-w-[300px] relative">
          <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            placeholder="Tedarikçi adı veya yetkili ara..."
            className="w-full pl-16 pr-8 py-5 bg-gray-50 rounded-3xl outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center p-1.5 bg-gray-100 rounded-3xl">
            {["all", "Gıda", "Lojistik"].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? "bg-white text-[#004aad] shadow-lg" : "text-gray-400 hover:text-gray-600"}`}
              >
                {cat === "all" ? "TÜMÜ" : cat.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="p-5 bg-gray-50 rounded-3xl text-gray-400 hover:bg-[#004aad] hover:text-white transition-all shadow-sm">
            <FunnelIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 3. SUPPLIER LISTING */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
        <AnimatePresence>
          {filteredSuppliers.map((supplier) => (
            <motion.div
              key={supplier.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[4rem] p-10 border border-gray-100 shadow-2xl shadow-gray-200/30 flex flex-col gap-10 relative group transition-all hover:bg-gray-50/50"
            >
              {/* Header info */}
              <div className="flex items-start justify-between">
                <div className="flex gap-6">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-white p-1 shadow-2xl border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:rotate-6 transition-transform">
                    <img src={supplier.logo} alt={supplier.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-gray-900 leading-none group-hover:text-[#004aad] transition-colors">{supplier.name}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{supplier.category}</p>
                    <div className="flex items-center gap-1.5 pt-2">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-black text-gray-700">{supplier.rating}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${supplier.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                  {supplier.status === 'active' ? 'AKTİF PARTNER' : 'PASİF'}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-6 p-6 bg-white rounded-[2.5rem] border border-gray-50 shadow-inner group-hover:bg-white/80 transition-colors">
                <div className="space-y-1 text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">İşlem Hacmi</p>
                  <p className="text-lg font-black text-gray-900">{supplier.totalPurchases.toLocaleString()}₺</p>
                </div>
                <div className="space-y-1 text-center border-l border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Güven Skoru</p>
                  <p className="text-lg font-black text-emerald-500">%{supplier.reliability}</p>
                </div>
              </div>

              {/* Contact & Location */}
              <div className="space-y-4 px-2">
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-blue-50 group-hover/item:text-[#004aad] transition-all">
                    <MapPinIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-gray-500 line-clamp-1">{supplier.address}</p>
                </div>
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-emerald-50 group-hover/item:text-emerald-600 transition-all">
                    <PhoneIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs font-black text-gray-900">{supplier.contactPerson}</p>
                    <p className="text-[10px] font-bold text-gray-400">{supplier.phone}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 px-2">
                {supplier.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-[8px] font-black uppercase tracking-widest rounded-lg">{tag}</span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 mt-auto">
                <button className="flex-1 py-5 bg-[#004aad] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-blue-900/10">SİPARİŞ VER</button>
                <button className="w-16 h-16 bg-gray-100 text-gray-400 rounded-[2.5rem] flex items-center justify-center hover:bg-gray-200 transition-all group/edit">
                  <PencilSquareIcon className="w-6 h-6 group-hover/edit:scale-110 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 4. AI INSIGHTS FOR PROCUREMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        <div className="lg:col-span-8 bg-white p-12 rounded-[5rem] border border-gray-100 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
            <SparklesIcon className="w-64 h-64 text-[#004aad]" />
          </div>

          <div className="flex flex-col md:flex-row gap-12 relative z-10">
            <div className="md:w-1/3 space-y-6">
              <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-[#004aad] flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <SparklesIcon className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900 uppercase leading-none">AI Tedarik Analizi</h3>
                <p className="text-[10px] font-black text-[#004aad] uppercase tracking-[0.2em] mt-3">Smart Procurement Engine</p>
              </div>
              <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckBadgeIcon className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase">Öneri</span>
                </div>
                <p className="text-xs font-bold text-emerald-800 leading-relaxed">"Taze Et Ltd. ile olan hacminiz %20 arttı. Yıllık iskonto talebi için en uygun dönemdesiniz."</p>
              </div>
            </div>

            <div className="flex-1 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-black text-gray-900 uppercase">Kritik Uyarılar</h4>
                  <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full uppercase">Dikkat</span>
                </div>
                <div className="space-y-4">
                  {[
                    { title: "Fiyat Dalgalanması", desc: "Sebze grubunda %15 maliyet artışı öngörülüyor.", icon: ArrowUpIcon, color: "text-rose-500", bg: "bg-rose-50" },
                    { title: "Alternatif Tedarikçi", desc: "Süt ürünleri için Gebze bölgesinde 2 yeni potansiyel firma saptandı.", icon: UsersIcon, color: "text-blue-500", bg: "bg-blue-50" },
                  ].map((alert, i) => (
                    <div key={i} className="flex gap-6 p-6 bg-gray-50/50 rounded-[2.5rem] border border-white hover:bg-white hover:shadow-xl transition-all">
                      <div className={`w-12 h-12 rounded-2xl ${alert.bg} flex items-center justify-center shrink-0`}>
                        <alert.icon className={`w-6 h-6 ${alert.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{alert.title}</p>
                        <p className="text-[11px] font-bold text-gray-500 mt-1">{alert.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-black transition-all">TÜM ANALİZİ İNDİR</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-gradient-to-br from-[#004aad] to-blue-900 rounded-[5rem] p-10 text-white shadow-2xl relative overflow-hidden h-full">
            <div className="absolute bottom-0 right-0 opacity-10 translate-x-1/2 translate-y-1/2">
              <BanknotesIcon className="w-64 h-64 text-white" />
            </div>
            <div className="relative z-10 space-y-10">
              <h3 className="text-2xl font-black uppercase tracking-tight">Finansal Özet</h3>
              <div className="space-y-8">
                <div className="p-8 bg-white/10 backdrop-blur-xl rounded-[3rem] border border-white/10">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">Toplam Borç</p>
                  <p className="text-4xl font-black">{mockSuppliers.reduce((s, x) => s + x.outstandingBalance, 0).toLocaleString()}₺</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-[9px] font-bold text-blue-200 uppercase mb-1">Valör Ort.</p>
                    <p className="text-lg font-black italic">22 Gün</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-[9px] font-bold text-blue-200 uppercase mb-1">Maliyet Tasarruf</p>
                    <p className="text-lg font-black text-emerald-400">%{supplierStats.avgReliability - 80}</p>
                  </div>
                </div>
              </div>
              <button className="w-full py-5 bg-white text-gray-900 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 hover:text-white transition-all">ÖDEME PLANINA GİT</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
