"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserCircleIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  HeartIcon,
  TrophyIcon,
  SparklesIcon,
  FireIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon,
  GiftIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
// import { mockCustomers, customerStats } from "@/lib/mock-data/customers";
import Image from "next/image";

export default function CustomersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    vip: 0,
    newThisMonth: 0,
    totalRevenue: 0,
    avgSatisfaction: "5.0"
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/business/customers");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCustomers(data.customers || []);
      setStats(data.stats || stats);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || c.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-10 p-4">
        <div className="h-64 bg-gray-100 rounded-[4rem] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-80 bg-gray-50 rounded-[3rem] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 max-w-[1600px] mx-auto">

      {/* 1. PREMIUM CRM HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 blur-3xl pointer-events-none">
          <UsersIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2.5rem] bg-gradient-to-br from-[#004aad] to-indigo-600 flex items-center justify-center shadow-2xl">
                <UsersIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Müşteri İlişkileri</h1>
                <p className="text-[#00ffcc] text-[10px] font-black uppercase tracking-[0.3em] mt-1">Customer Relationship Management (CRM)</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-8 py-5 bg-white/5 backdrop-blur-xl text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10 flex items-center gap-3">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-400" /> KAMPANYA BAŞLAT
            </button>
            <button className="px-10 py-5 bg-[#004aad] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-[#004aad] transition-all shadow-2xl flex items-center gap-3">
              <PlusIcon className="w-5 h-5" /> YENİ MÜŞTERİ EKLE
            </button>
          </div>
        </div>

        {/* CRM Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-14 pt-10 border-t border-white/5">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Toplam Rehber</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-white">{stats.total}</span>
              <span className="text-[10px] font-black text-emerald-400 mb-2">+{stats.newThisMonth} Yeni</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">VIP Portföy</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-amber-400">{stats.vip}</span>
              <TrophyIcon className="w-6 h-6 text-amber-500 mb-2" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Harcama Hacmi</p>
            <span className="text-4xl font-black text-white">{stats.totalRevenue.toLocaleString()}₺</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Memnuniyet</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black text-white">{stats.avgSatisfaction}</span>
              <StarIcon className="w-6 h-6 text-amber-400 fill-amber-400 mb-2" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. SMART SEARCH & CRM FILTERS */}
      <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-wrap items-center justify-between gap-6 mx-4">
        <div className="flex-1 min-w-[300px] relative group">
          <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Müşteri adı, mail veya kod ara..."
            className="w-full pl-16 pr-8 py-5 bg-gray-50 rounded-3xl outline-none focus:ring-4 focus:ring-[#004aad]/5 font-bold text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center p-1.5 bg-gray-100/50 rounded-[2rem]">
            {["all", "VIP", "Regular", "New"].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-8 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? "bg-white text-[#004aad] shadow-md border border-gray-100" : "text-gray-400 hover:text-gray-600"}`}
              >
                {cat === "all" ? "TÜMÜ" : cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. CUSTOMER GRID */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200 mx-4">
          <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Müşteri bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
          <AnimatePresence>
            {filteredCustomers.map((customer) => (
              <motion.div
                key={customer.id}
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
                    <div className="w-20 h-20 rounded-[2.5rem] bg-white p-1 shadow-2xl border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:rotate-6 transition-transform relative">
                      <Image src={customer.avatar} alt={customer.name} fill className="object-cover" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-gray-900 leading-none group-hover:text-[#004aad] transition-colors">{customer.name}</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{customer.customerCode}</p>
                      <div className="flex items-center gap-1.5 pt-2">
                        <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-black text-gray-700">{customer.satisfaction}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${customer.category === 'VIP' ? 'bg-amber-50 text-amber-600 border border-amber-100' : customer.category === 'New' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    {customer.category}
                  </div>
                </div>

                {/* Metrics for Customer */}
                <div className="grid grid-cols-2 gap-6 p-6 bg-white rounded-[2.5rem] border border-gray-50 shadow-inner group-hover:bg-white/80 transition-colors">
                  <div className="space-y-1 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Toplam Sipariş</p>
                    <p className="text-lg font-black text-gray-900">{customer.totalOrders}</p>
                  </div>
                  <div className="space-y-1 text-center border-l border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Harcama</p>
                    <p className="text-lg font-black text-emerald-500">{customer.totalSpent.toLocaleString()}₺</p>
                  </div>
                </div>

                {/* CRM Details */}
                <div className="space-y-4 px-2">
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-blue-50 group-hover/item:text-[#004aad] transition-all border border-gray-100">
                      <EnvelopeIcon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 line-clamp-1">{customer.email}</p>
                  </div>
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-emerald-50 group-hover/item:text-emerald-600 transition-all border border-gray-100">
                      <PhoneIcon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black text-gray-900">{customer.phone}</p>
                  </div>
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-amber-50 group-hover/item:text-amber-600 transition-all border border-gray-100">
                      <HeartIcon className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">SADAKAT PUANI: <span className="text-gray-900 font-black">{customer.loyaltyPoints}</span></p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 mt-auto">
                  <button className="flex-1 py-5 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-[#004aad] transition-all shadow-xl">DETAYLI PROFİL</button>
                  <button className="w-16 h-16 bg-gray-100 text-gray-400 rounded-[2.5rem] flex items-center justify-center hover:bg-white hover:text-[#004aad] transition-all border border-gray-100 shadow-sm active:scale-90">
                    <ChatBubbleLeftRightIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Churn Alert Badge */}
                {customer.churnRisk === 'high' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-500 text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl animate-bounce">
                    KAYBETME RİSKİ YÜKSEK
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 4. AI CRM INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        <div className="lg:col-span-8 bg-white p-12 rounded-[5rem] border border-gray-100 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
            <SparklesIcon className="w-64 h-64 text-[#004aad]" />
          </div>

          <div className="flex flex-col md:flex-row gap-12 relative z-10">
            <div className="md:w-1/3 space-y-6">
              <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-[#004aad] to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900 uppercase leading-none">AI Müşteri Analizi</h3>
                <p className="text-[10px] font-black text-[#004aad] uppercase tracking-[0.2em] mt-3 underline underline-offset-8 decoration-gray-200">Behavioral Intelligence</p>
              </div>
              <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <GiftIcon className="w-5 h-5 text-amber-600" />
                  <span className="text-[10px] font-black text-amber-700 uppercase">Fırsat</span>
                </div>
                <p className="text-xs font-bold text-amber-800 leading-relaxed">"Canan Öz 3 aydır pasif. VIP statüsünü canlandırmak için %20 'Seni Özledik' kuponu gönderin."</p>
              </div>
            </div>

            <div className="flex-1 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-black text-gray-900 uppercase">Segment Önerileri</h4>
                  <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase">Canlı Veri</span>
                </div>
                <div className="space-y-4">
                  {[
                    { title: "Yeni VIP Adayları", desc: "Ayşe Kaya son 3 hafta içinde harcamasını 2 katına çıkardı.", icon: ArrowTrendingUpIcon, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { title: "Geri Bildirim Alarmı", desc: "Memnuniyet skoru 5'in altına düşen 3 müşteri saptandı.", icon: FireIcon, color: "text-rose-500", bg: "bg-rose-50" },
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
              <button className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl border border-white/10">SEGMENT RAPORLARINI GÖR</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-gray-900 rounded-[5rem] p-10 text-white shadow-3xl relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute bottom-0 right-0 opacity-10 translate-x-1/4 translate-y-1/4">
              <ShieldCheckIcon className="w-80 h-80 text-white" />
            </div>

            <div className="space-y-10 relative z-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase text-[#00ffcc]">Sistem Sağlığı</h3>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Data Integrity Score</p>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-center bg-white/5 border border-white/5 p-6 rounded-[2.5rem]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase">Aktiflik Oranı</p>
                    <p className="text-3xl font-black text-white">%{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-[#004aad] border-t-transparent animate-spin-slow flex items-center justify-center">
                    <UsersIcon className="w-6 h-6 text-blue-400" />
                  </div>
                </div>

                <div className="p-8 bg-gradient-to-br from-indigo-500/20 to-blue-600/20 rounded-[3rem] border border-blue-500/20 space-y-4">
                  <div className="flex items-center gap-3">
                    <FireIcon className="w-6 h-6 text-rose-500" />
                    <p className="text-[10px] font-black uppercase text-gray-300">Churn Isı Haritası</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className={`h-10 flex-1 rounded-lg ${i < 3 ? 'bg-rose-500 shadow-lg shadow-rose-500/20' : i < 6 ? 'bg-amber-500/50' : 'bg-emerald-500/20'}`} />
                    ))}
                  </div>
                  <p className="text-[9px] font-bold text-gray-500 text-center uppercase mt-2">Müşteri Sadakat Kayıp Grafiği</p>
                </div>
              </div>
            </div>

            <button className="w-full py-5 bg-white text-gray-900 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-[#00ffcc] hover:text-black transition-all shadow-2xl mt-10 relative z-10">TÜMÜNÜ ANALİZ ET</button>
          </div>
        </div>
      </div>

    </div>
  );
}
