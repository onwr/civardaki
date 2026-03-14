"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TruckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  DocumentArrowDownIcon,
  PencilSquareIcon,
  TrashIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  InboxArrowDownIcon,
  ArrowTrendingUpIcon,
  ArchiveBoxIcon,
  ChevronRightIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  CalendarDaysIcon,
  XMarkIcon,
  BellIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export default function PurchasesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // list or grid

  // Modal States
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const purchases = [
    {
      id: "1",
      poNumber: "ALIS-24-001",
      supplier: "Taze Et Ticaret Ltd.",
      supplierLogo: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200&h=200&fit=crop",
      supplierLoc: "Başakşehir, İstanbul",
      orderDate: "15 Ocak 2024",
      expectedTime: "18:00",
      expectedDate: "18 Ocak",
      status: "completed", // completed, pending, partial
      total: 2914.60,
      items: [
        { name: "Tavuk Göğsü", qty: "50kg", price: 1250 },
        { name: "Dana Kıyma", qty: "20kg", price: 1664 }
      ],
      priority: "acil",
      warehouse: "Merkez Soğuk Hava"
    },
    {
      id: "2",
      poNumber: "ALIS-24-002",
      supplier: "Süt Ürünleri A.Ş.",
      supplierLogo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop",
      supplierLoc: "Esenyurt, İstanbul",
      orderDate: "12 Ocak 2024",
      expectedTime: "09:00",
      expectedDate: "15 Ocak",
      status: "pending",
      total: 1233.10,
      items: [
        { name: "Tam Yağlı Yoğurt", qty: "40 Kova", price: 800 },
        { name: "Beyaz Peynir", qty: "10kg", price: 433 }
      ],
      priority: "normal",
      warehouse: "Depo B-2"
    },
    {
      id: "3",
      poNumber: "ALIS-24-003",
      supplier: "Bayrampaşa Hal Toptan",
      supplierLogo: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=200&h=200&fit=crop",
      supplierLoc: "Bayrampaşa Hal",
      orderDate: "10 Ocak 2024",
      expectedTime: "06:30",
      expectedDate: "13 Ocak",
      status: "partial",
      total: 403.56,
      items: [
        { name: "Salkım Domates", qty: "25kg", price: 200 },
        { name: "Atom Marul", qty: "15 Adet", price: 203 }
      ],
      priority: "normal",
      warehouse: "Günlük Reyon"
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-10 space-y-10">
        <div className="h-20 w-1/3 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-50 rounded-[2rem] animate-pulse" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-50 rounded-[2.5rem] animate-pulse" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Bekleyen", value: "12", icon: ClockIcon, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Aylık Alım", value: "84.5k ₺", icon: BanknotesIcon, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Tedarik Skoru", value: "9.4", icon: ShieldCheckIcon, color: "text-green-600", bg: "bg-green-50" },
    { label: "Aktif Firmalar", value: "24", icon: BuildingOffice2Icon, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-10 pb-24 max-w-[1400px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. PREMIUM PROCUREMENT HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <TruckIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <ArchiveBoxIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Alış & Tedarik</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Procurement & Supply Chain Management</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-8 py-5 bg-white/10 backdrop-blur-xl text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3">
              <DocumentArrowDownIcon className="w-5 h-5 opacity-70" /> RAPOR AL
            </button>
            <button
              onClick={() => setIsNewOrderModalOpen(true)}
              className="px-10 py-5 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-3"
            >
              <PlusIcon className="w-5 h-5" /> YENİ ALIM EKLE
            </button>
          </div>
        </div>

        {/* Live Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mt-14 pt-10 border-t border-white/10">
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${i === 2 ? 'text-emerald-400' : 'text-blue-200'}`} />
                <p className="text-[10px] font-black text-blue-200/70 uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tighter">{stat.value}</span>
                {i === 1 && <span className="text-[10px] bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded-full font-bold">Trend</span>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 2. ADVANCED SEARCH & PROCUREMENT FILTERS */}
      <div className="bg-white p-6 md:p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col xl:flex-row items-center justify-between gap-6 mx-2 md:mx-4">
        {/* Search Input */}
        <div className="w-full xl:w-auto flex-1 min-w-[300px] relative group h-full">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="PO no, firma adı veya depo ara..."
            className="w-full h-[72px] pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-bold text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center p-2 bg-gray-50 rounded-[2.5rem] w-full md:w-auto overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "TÜMÜ" },
              { id: "pending", label: "YOLDAYDI" },
              { id: "completed", label: "TAMAMLANAN" }
            ].map(status => (
              <button
                key={status.id}
                onClick={() => setFilterStatus(status.id)}
                className={`px-8 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterStatus === status.id ? 'bg-[#004aad] text-white shadow-xl' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}`}
              >
                {status.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-[2rem] shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3.5 rounded-[1.8rem] transition-all ${viewMode === "grid" ? "bg-white text-[#004aad] shadow-md transform scale-105" : "text-gray-400 hover:bg-gray-100"}`}
            >
              <Squares2X2Icon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3.5 rounded-[1.8rem] transition-all ${viewMode === "list" ? "bg-white text-[#004aad] shadow-md transform scale-105" : "text-gray-400 hover:bg-gray-100"}`}
            >
              <ListBulletIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. CONTENT LIST/GRID */}
      <div className={viewMode === "list" ? "space-y-6" : "grid grid-cols-1 md:grid-cols-2 gap-8"}>
        <AnimatePresence mode="popLayout">
          {filteredPurchases.map((purchase) => (
            <PurchaseCard
              key={purchase.id}
              purchase={purchase}
              onDetails={() => setSelectedOrder(purchase)}
              viewMode={viewMode}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 5. AI INSIGHTS WIDGET (Like Active Order Widget) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#004aad] to-[#002d6a] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/30 group"
      >
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <SparklesIcon className="w-64 h-64 rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-6 flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-200">AI Tedarik Danışmanı</span>
            </div>
            <h2 className="text-4xl font-black leading-tight">12.450₺ Tasarruf Potansiyeli Tespit Edildi!</h2>
            <p className="text-blue-100/70 text-lg font-medium max-w-2xl leading-relaxed">Et grubundaki alımlarınızı 15 günlük periyoda yayarak lojistik maliyetlerinizi ciddi oranda düşürebileceğimizi analiz ettik.</p>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto shrink-0">
            <button className="px-10 py-5 bg-white text-[#004aad] rounded-2xl font-black text-sm hover:shadow-2xl transition-all active:scale-95">Raporu Görüntüle</button>
            <button className="px-10 py-5 bg-white/10 backdrop-blur-md rounded-2xl font-bold text-sm hover:bg-white/20 transition-all border border-white/10">Daha Sonra Hatırlat</button>
          </div>
        </div>
      </motion.div>

      {/* MODALS */}
      <AnimatePresence>
        {isNewOrderModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewOrderModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="bg-[#09090b] p-10 text-white relative">
                <button onClick={() => setIsNewOrderModalOpen(false)} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                  <XMarkIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400">
                    <ShoppingBagIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Yeni Sipariş</h2>
                    <p className="text-gray-400 text-xs font-bold mt-2">Alım emri bilgilerini girin.</p>
                  </div>
                </div>
              </div>
              <div className="p-12 text-center space-y-8">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-[#004aad]">
                  <InboxArrowDownIcon className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 uppercase">Hazır Mısınız?</h3>
                  <p className="text-gray-500 font-medium italic">Tedarikçi entegrasyonu tamamlanıyor. Çok yakında doğrudan sipariş verebileceksiniz.</p>
                </div>
                <button onClick={() => setIsNewOrderModalOpen(false)} className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl">Anladım</button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-gray-900/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3.5rem] overflow-hidden shadow-4xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-10 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-3xl bg-gray-50 p-1 border border-gray-100 relative overflow-hidden">
                    <Image src={selectedOrder.supplierLogo} alt={selectedOrder.supplier} fill className="object-cover rounded-2xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{selectedOrder.supplier}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#004aad]">{selectedOrder.poNumber} • {selectedOrder.orderDate}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-all">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-10 overflow-y-auto space-y-10 no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Durum", val: selectedOrder.status === 'completed' ? 'Tamamlandı' : 'Bekliyor', icon: CheckCircleIcon, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Varış", val: selectedOrder.expectedDate, icon: ClockIcon, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Lokasyon", val: selectedOrder.warehouse, icon: MapPinIcon, color: "text-orange-600", bg: "bg-orange-50" },
                  ].map((box, i) => (
                    <div key={i} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                      <div className={`w-12 h-12 ${box.bg} ${box.color} rounded-2xl flex items-center justify-center shrink-0`}>
                        <box.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{box.label}</p>
                        <p className="text-sm font-black text-gray-950">{box.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <h4 className="text-xl font-black uppercase text-gray-900 tracking-tighter flex items-center gap-3">
                    <ArchiveBoxIcon className="w-6 h-6 text-gray-400" /> Sipariş İçeriği
                  </h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-7 bg-white border border-gray-100 rounded-[2rem] hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-gray-50 text-gray-300 rounded-xl flex items-center justify-center">
                            <ArchiveBoxIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-lg font-black text-gray-950">{item.name}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase">{item.qty}</p>
                          </div>
                        </div>
                        <p className="text-xl font-black tracking-tighter text-[#004aad]">{item.price.toLocaleString()} ₺</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-10 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Toplam Alım Tutarı</p>
                  <p className="text-4xl font-black text-gray-950 tracking-tighter">{selectedOrder.total.toLocaleString()} ₺</p>
                </div>
                <div className="flex gap-4">
                  <button className="px-8 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all">Dosya İndir</button>
                  <button onClick={() => setSelectedOrder(null)} className="px-12 py-4 bg-gray-950 text-white rounded-2xl font-black text-sm hover:bg-black transition-all">Kapat</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function PurchaseCard({ purchase, onDetails, viewMode }) {
  const isList = viewMode === "list";
  const statusColors = {
    completed: "text-green-600 bg-green-50 border-green-100",
    pending: "text-blue-600 bg-blue-50 border-blue-100",
    partial: "text-orange-600 bg-orange-50 border-orange-100"
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-[2.5rem] border border-gray-100 group transition-all hover:shadow-2xl hover:shadow-gray-200/50 overflow-hidden ${isList ? 'p-6 flex flex-col md:flex-row items-center gap-8' : 'p-8 flex flex-col gap-8'}`}
    >
      {/* Supplier Section */}
      <div className={`flex items-center gap-6 ${isList ? 'md:w-[35%] shrink-0' : ''}`}>
        <div className="w-20 h-20 rounded-3xl bg-gray-50 p-1 border border-gray-100 relative overflow-hidden group-hover:scale-105 transition-transform duration-500 shrink-0">
          <Image src={purchase.supplierLogo} alt={purchase.supplier} fill className="object-cover rounded-2xl" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black tracking-widest text-[#004aad] uppercase bg-blue-50 px-2 py-0.5 rounded-md">{purchase.poNumber}</span>
            <span className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-md border ${statusColors[purchase.status]}`}>
              {purchase.status === 'completed' ? 'Teslim Edildi' : 'Yolda'}
            </span>
          </div>
          <h3 className="text-xl font-black text-gray-950 truncate group-hover:text-[#004aad] transition-colors leading-tight">{purchase.supplier}</h3>
          <p className="text-xs text-gray-400 font-bold mt-1 flex items-center gap-1.5 uppercase tracking-wider">
            <ClockIcon className="w-3.5 h-3.5" />
            {purchase.orderDate} • {purchase.expectedTime}
          </p>
        </div>
      </div>

      {/* Middle/Content Section */}
      <div className={`flex-1 min-w-0 ${isList ? 'px-8 md:border-x border-gray-100' : 'space-y-6 pt-6 border-t border-gray-50'}`}>
        {isList ? (
          <div className="flex items-center justify-between gap-10">
            <div className="hidden lg:block">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">İÇERİK ÖZETİ</p>
              <p className="text-xs text-gray-600 font-medium truncate max-w-[200px]">
                {purchase.items.map(i => i.name).join(', ')}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">VARAN DEPO</p>
              <p className="text-xs font-black text-gray-950 truncate max-w-[150px]">{purchase.warehouse}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">TOPLAM TUTAR</p>
              <p className="text-2xl font-black text-gray-950 tracking-tighter">{purchase.total.toLocaleString()} ₺</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Teslimat Hedefi</p>
                <p className="text-sm font-black text-gray-900">{purchase.warehouse}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Ayrıntılar</p>
                <p className="text-sm font-black text-gray-900">{purchase.items.length} Kalem Ürün</p>
              </div>
            </div>
            <div className="flex justify-between items-center bg-gray-950 p-6 rounded-[2rem] text-white">
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">TOPLAM TUTAR</p>
                <p className="text-3xl font-black text-[#00ffcc] tracking-tighter leading-none">{purchase.total.toLocaleString()} ₺</p>
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><TrashIcon className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Section */}
      <div className={`flex gap-3 ${isList ? 'md:w-[20%] shrink-0 flex-col sm:flex-row md:flex-col' : 'w-full'}`}>
        <button
          onClick={onDetails}
          className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-black rounded-2xl transition-all active:scale-95"
        >
          Detaylar
        </button>
        <button className="flex-1 py-4 bg-[#004aad] text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-blue-900/10 active:scale-95 flex items-center justify-center gap-2">
          <RotateCcwIcon className="w-4 h-4" /> Yenile
        </button>
      </div>
    </motion.div>
  );
}

function RotateCcwIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
  );
}
