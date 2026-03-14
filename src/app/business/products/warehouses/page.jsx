"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  XMarkIcon,
  PhoneIcon,
  UserIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  Squares2X2Icon
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

const defaultForm = () => ({
  name: "",
  address: "",
  capacity: "",
  currentStock: "0",
  manager: "",
  phone: "",
});

export default function WarehousesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);

  const fetchWarehouses = useCallback(() => {
    return fetch("/api/business/warehouses")
      .then((r) => r.json())
      .then((data) => setWarehouses(Array.isArray(data) ? data : []))
      .catch(() => setWarehouses([]));
  }, []);

  useEffect(() => {
    fetchWarehouses().finally(() => setIsLoading(false));
  }, [fetchWarehouses]);

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter(
      (wh) =>
        wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (wh.address || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, warehouses]);

  const stats = useMemo(() => {
    const totalCapacity = warehouses.reduce((acc, w) => acc + (w.capacity ?? 0), 0);
    const totalStock = warehouses.reduce((acc, w) => acc + (w.currentStock ?? 0), 0);
    const withCapacity = warehouses.filter((w) => (w.capacity ?? 0) > 0);
    const avgOccupancy = withCapacity.length
      ? Math.round((withCapacity.reduce((acc, w) => acc + (w.currentStock ?? 0) / (w.capacity || 1), 0) / withCapacity.length) * 100)
      : 0;
    return { totalCapacity, totalStock, avgOccupancy };
  }, [warehouses]);

  const handleSubmitWarehouse = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Depo adı girin.");
    setSaving(true);
    try {
      const res = await fetch("/api/business/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          address: form.address.trim() || null,
          capacity: form.capacity === "" ? null : parseInt(form.capacity, 10),
          currentStock: parseInt(form.currentStock, 10) || 0,
          manager: form.manager.trim() || null,
          phone: form.phone.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Oluşturulamadı.");
      toast.success("Depo oluşturuldu.");
      setForm(defaultForm());
      setIsModalOpen(false);
      await fetchWarehouses();
    } catch (err) {
      toast.error(err.message || "Depo oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-[#004aad] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto px-4">

      {/* 1. BENTO STATS HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-gray-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <BuildingStorefrontIcon className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#004aad] rounded-2xl flex items-center justify-center shadow-xl">
                <BuildingStorefrontIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight">Depo Yönetimi</h1>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Global Envanter Ağı</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Toplam Kapasite</p>
                <p className="text-3xl font-black">{stats.totalCapacity.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ort. Doluluk</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-black">%{stats.avgOccupancy}</p>
                  {stats.avgOccupancy > 80 && <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-xl flex flex-col justify-between"
        >
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Depo Durumu</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-500">Aktif Depo</span>
                <span className="text-gray-900">{warehouses.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-rose-500">
                <span>Kritik Seviye</span>
                <span>{warehouses.filter(w => (w.capacity ?? 0) > 0 && ((w.currentStock ?? 0) / (w.capacity || 1)) > 0.8).length}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-4 bg-[#004aad] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg"
          >
            YENİ DEPO EKLE
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-emerald-50 rounded-[3rem] p-8 border border-emerald-100 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <CheckBadgeIcon className="w-40 h-40 text-emerald-600" />
          </div>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Lojistik Verimlilik</p>
          <div className="space-y-2">
            <p className="text-2xl font-black text-emerald-900 leading-none">94.2</p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase">Sağlık Skoru</p>
          </div>
          <div className="h-1 bg-emerald-200 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-emerald-500 w-[94%]" />
          </div>
        </motion.div>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="max-w-2xl group relative">
        <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
        <input
          type="text"
          placeholder="Depo adı veya adresi ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-8 py-5 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl outline-none focus:ring-4 focus:ring-[#004aad]/5 font-bold transition-all"
        />
      </div>

      {/* 3. WAREHOUSES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 text-center">
        <AnimatePresence>
          {filteredWarehouses.map((warehouse, index) => {
            const cap = warehouse.capacity ?? 1;
            const occupancyRate = cap > 0 ? Math.round(((warehouse.currentStock ?? 0) / cap) * 100) : 0;
            const isCritical = occupancyRate > 80;

            return (
              <motion.div
                key={warehouse.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[4rem] group border border-gray-100 shadow-2xl hover:shadow-blue-900/10 transition-all overflow-hidden relative"
              >
                <div className={`h-2 w-full ${isCritical ? 'bg-rose-500' : 'bg-[#004aad]'}`} />

                <div className="p-10 space-y-8">
                  <div className="flex justify-between items-start text-left">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-gray-900">{warehouse.name}</h3>
                        {warehouse.isActive ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase rounded-lg">AKTİF</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[8px] font-black uppercase rounded-lg">PASİF</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPinIcon className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold truncate max-w-[200px]">{warehouse.address || "—"}</span>
                      </div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                      <BuildingStorefrontIcon className="w-7 h-7 text-[#004aad]" />
                    </div>
                  </div>

                  {/* Occupancy Chart - Modern Mini Circle */}
                  <div className="flex items-center gap-8 py-4 bg-gray-50/50 rounded-[2.5rem] p-6">
                    <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - occupancyRate / 100)}
                          className={isCritical ? 'text-rose-500' : 'text-[#004aad]'}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-gray-900">%{occupancyRate}</span>
                        <span className="text-[8px] font-black text-gray-400 uppercase">DOLULUK</span>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 gap-4 text-left">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mevcut Stok / Kapasite</p>
                        <p className="text-lg font-black text-gray-900">
                          {(warehouse.currentStock ?? 0).toLocaleString()} <span className="text-gray-300 text-sm">/ {(warehouse.capacity ?? 0).toLocaleString()}</span>
                        </p>
                      </div>
                      {isCritical && (
                        <div className="flex items-center gap-2 text-rose-500">
                          <ExclamationTriangleIcon className="w-4 h-4 animate-bounce" />
                          <span className="text-[10px] font-black uppercase">Alan Daralıyor</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 items-center">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200/50">
                        <UserIcon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase">SORUMLU</p>
                        <p className="text-xs font-bold text-gray-700">{warehouse.manager || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200/50">
                        <PhoneIcon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase">İLETİŞİM</p>
                        <p className="text-xs font-bold text-gray-700">{warehouse.phone || "—"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button className="flex-1 py-4 bg-gray-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#004aad] transition-all shadow-xl shadow-black/10">STOKLARI GÖR</button>
                    <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:text-[#004aad] hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                      <Squares2X2Icon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 4. MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[4.5rem] p-10 md:p-14 shadow-3xl text-center"
            >
              <div className="flex flex-col items-center gap-6 mb-10">
                <div className="w-20 h-20 rounded-[2.5rem] bg-blue-50 flex items-center justify-center">
                  <BuildingStorefrontIcon className="w-10 h-10 text-[#004aad]" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 uppercase">Yeni Depo Kaydı</h2>
                  <p className="text-gray-400 font-medium">Lojistik ağınızı genişletmek için bilgileri girin.</p>
                </div>
              </div>

              <form onSubmit={handleSubmitWarehouse} className="space-y-4">
                <input
                  type="text"
                  placeholder="Depo Adı *"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                  required
                />
                <input
                  type="text"
                  placeholder="Adres"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    min="0"
                    placeholder="Kapasite"
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Mevcut Stok"
                    value={form.currentStock}
                    onChange={(e) => setForm((f) => ({ ...f, currentStock: e.target.value }))}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Sorumlu"
                    value={form.manager}
                    onChange={(e) => setForm((f) => ({ ...f, manager: e.target.value }))}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Telefon"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                  />
                </div>

                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black text-[10px] uppercase tracking-widest">İPTAL</button>
                  <button type="submit" disabled={saving} className="flex-1 py-5 bg-[#004aad] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl disabled:opacity-50">
                    {saving ? "Kaydediliyor..." : "KAYDI OLUŞTUR"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
