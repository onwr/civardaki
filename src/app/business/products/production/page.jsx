"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CubeIcon,
  CalendarIcon,
  DocumentTextIcon,
  SparklesIcon,
  ChevronRightIcon,
  BeakerIcon,
  ArrowPathIcon,
  BoltIcon,
  Square3Stack3DIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline";
import { SkeletonListItem } from "@/components/ui/skeleton";
import { toast } from "sonner";

const defaultForm = () => ({
  productId: "",
  quantity: 0,
  unit: "kg",
  recipe: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
  cost: 0,
});

export default function ProductionPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [production, setProduction] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
  const [productionForm, setProductionForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);

  const fetchProduction = useCallback(() => {
    return fetch("/api/business/production")
      .then((r) => r.json())
      .then((data) => setProduction(Array.isArray(data) ? data : []))
      .catch(() => setProduction([]));
  }, []);

  useEffect(() => {
    fetch("/api/business/products?status=all&limit=100")
      .then((r) => r.json())
      .then((data) => setProducts(data?.items ?? []))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    fetchProduction().finally(() => setIsLoading(false));
  }, [fetchProduction]);

  const handleAddProduction = async (e) => {
    e.preventDefault();
    const product = products.find((p) => p.id === productionForm.productId);
    if (!product) {
      toast.error("Lütfen bir ürün seçin!");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/business/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productionForm.productId,
          quantity: Number(productionForm.quantity) || 0,
          unit: productionForm.unit || "kg",
          recipe: productionForm.recipe || null,
          startDate: productionForm.startDate,
          endDate: productionForm.endDate,
          cost: Number(productionForm.cost) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Oluşturulamadı.");
      toast.success("Üretim kaydı eklendi.");
      setProductionForm(defaultForm());
      setIsProductionModalOpen(false);
      await fetchProduction();
    } catch (err) {
      toast.error(err.message || "Üretim kaydı eklenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const filteredProduction = production.filter((prod) => {
    const matchesSearch =
      prod.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && prod.status === "COMPLETED") ||
      (filterStatus === "in_progress" && prod.status === "IN_PROGRESS");
    return matchesSearch && matchesStatus;
  });

  const totalCost = production.reduce((sum, p) => sum + p.cost, 0);
  const completedCount = production.filter((p) => p.status === "COMPLETED").length;
  const inProgressCount = production.filter((p) => p.status === "IN_PROGRESS").length;

  return (
    <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. PREMIUM PRODUCTION HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <BeakerIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <BeakerIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Üretim Yönetimi</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Industrial Execution & Batch Tracking</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-8 py-5 bg-white/10 backdrop-blur-xl text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3">
              <SparklesIcon className="w-5 h-5 opacity-70" /> AI RECIPE OPTIMIZER
            </button>
            <button
              onClick={() => setIsProductionModalOpen(true)}
              className="px-10 py-5 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-3"
            >
              <PlusIcon className="w-5 h-5" /> YENİ ÜRETİM EMRİ
            </button>
          </div>
        </div>

        {/* Live Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mt-14 pt-10 border-t border-white/10 text-left">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <CurrencyDollarIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Toplam Üretim Maliyeti</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{totalCost.toLocaleString("tr-TR")} ₺</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <CheckCircleIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Tamamlanan Batch</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{completedCount}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-amber-300">
              <ClockIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Devam Eden Süreç</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{inProgressCount}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <BoltIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Üretim Verimliliği</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none">%94.2</span>
          </div>
        </div>
      </motion.div>

      {/* 2. SEARCH & FILTERS */}
      <div className="bg-white p-6 md:p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col xl:flex-row items-center justify-between gap-6 mx-2 md:mx-4">
        <div className="w-full xl:w-auto flex-1 min-w-[300px] relative group h-full">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Ürün adı veya üretim kodu ara..."
            className="w-full h-[72px] pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[240px] w-full xl:w-auto h-full group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full h-[72px] px-10 bg-gray-50/50 border-2 border-transparent focus:border-[#004aad]/10 focus:ring-4 focus:ring-[#004aad]/5 rounded-[2.5rem] outline-none font-black text-base text-gray-950 appearance-none cursor-pointer italic transition-all text-center"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="completed">Tamamlananlar</option>
            <option value="in_progress">Devam Edenler</option>
          </select>
        </div>
      </div>

      {/* 3. PRODUCTION LIST */}
      <div className="space-y-6 mx-2 md:mx-4">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <SkeletonListItem key={i} />)}
            </div>
          ) : filteredProduction.map((prod, i) => (
            <motion.div
              key={prod.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all flex flex-col lg:flex-row items-center gap-12 group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

              <div className="flex items-center gap-8 lg:w-[30%] shrink-0 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center shadow-inner border border-gray-100 group-hover:scale-110 transition-transform">
                  <Square3Stack3DIcon className="w-9 h-9 text-[#004aad]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${prod.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                      {prod.status === 'COMPLETED' ? 'TAMAMLANDI' : 'ÜRETİLİYOR'}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-gray-950 uppercase tracking-tighter leading-none">{prod.productName}</h3>
                  <p className="text-[10px] font-black text-gray-400 mt-2 tracking-widest leading-none">VARYANT: STANDART</p>
                </div>
              </div>

              <div className="flex-1 min-w-0 px-8 lg:border-x border-gray-100 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Üretim Miktarı</p>
                    <p className="text-lg font-black text-gray-950">{prod.quantity} {prod.unit}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Başlangıç</p>
                    <p className="text-sm font-bold text-gray-600 italic">
                      {new Date(prod.startDate).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Bitiş Hedefi</p>
                    <p className="text-sm font-bold text-gray-600 italic">
                      {new Date(prod.endDate).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-[#004aad] uppercase tracking-widest mb-1.5 leading-none">Maliyet</p>
                    <p className="text-xl font-black text-[#004aad]">{prod.cost.toLocaleString("tr-TR")} ₺</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end lg:w-[15%] shrink-0 gap-6 relative z-10">
                <button className="flex items-center justify-center p-5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-[#004aad] hover:text-white transition-all shadow-sm border border-gray-100">
                  <DocumentTextIcon className="w-6 h-6" />
                </button>
                <button className="flex items-center justify-center p-5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-[#004aad] hover:text-white transition-all shadow-sm border border-gray-100">
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 4. AI INSIGHT SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-950 rounded-[4rem] p-12 text-white relative overflow-hidden group mx-4"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#004aad]/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center border border-white/10">
              <SparklesIcon className="w-10 h-10 text-blue-400" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic">AI Üretim <span className="text-blue-400">Verimliliği</span></h3>
              <p className="text-gray-400 italic max-w-xl">
                Son 30 günlük üretim verilerinize dayanarak, parti boyutlarını %15 oranında artırmanız durumunda birim maliyetlerinizi %4.2 oranında düşürebileceğinizi öngörüyoruz.
              </p>
            </div>
          </div>
          <button className="px-12 py-6 bg-white text-gray-950 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-400 hover:text-white transition-all shrink-0">
            ANALİZİ UYGULA
          </button>
        </div>
      </motion.div>

      {/* Production Modal (Updated to fit Premium Theme) */}
      <AnimatePresence>
        {isProductionModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductionModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[4rem] p-12 z-[101] max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-4xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-gray-950 uppercase tracking-tighter italic">Yeni Üretim <span className="text-[#004aad]">Emri</span></h2>
                <button
                  onClick={() => setIsProductionModalOpen(false)}
                  className="p-4 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-8 w-8 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddProduction} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Ürün Seçimi</label>
                  <select
                    required
                    value={productionForm.productId}
                    onChange={(e) => setProductionForm({ ...productionForm, productId: e.target.value })}
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-[#004aad]/10 focus:ring-4 focus:ring-[#004aad]/5 rounded-[2rem] outline-none font-black text-lg text-gray-950 italic appearance-none cursor-pointer"
                  >
                    <option value="">Ürün seçin</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Miktar</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={productionForm.quantity}
                      onChange={(e) => setProductionForm({ ...productionForm, quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-[#004aad]/10 focus:ring-4 focus:ring-[#004aad]/5 rounded-[2rem] outline-none font-black text-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Birim</label>
                    <select
                      required
                      value={productionForm.unit}
                      onChange={(e) => setProductionForm({ ...productionForm, unit: e.target.value })}
                      className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-[#004aad]/10 focus:ring-4 focus:ring-[#004aad]/5 rounded-[2rem] outline-none font-black text-lg appearance-none cursor-pointer"
                    >
                      <option value="kg">kg</option>
                      <option value="gr">gr</option>
                      <option value="lt">lt</option>
                      <option value="ml">ml</option>
                      <option value="adet">adet</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Başlangıç</label>
                    <input
                      type="date"
                      required
                      value={productionForm.startDate}
                      onChange={(e) => setProductionForm({ ...productionForm, startDate: e.target.value })}
                      className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-[#004aad]/10 focus:ring-4 focus:ring-[#004aad]/5 rounded-[2rem] outline-none font-black text-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Bitiş Hedefi</label>
                    <input
                      type="date"
                      required
                      value={productionForm.endDate}
                      onChange={(e) => setProductionForm({ ...productionForm, endDate: e.target.value })}
                      className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-[#004aad]/10 focus:ring-4 focus:ring-[#004aad]/5 rounded-[2rem] outline-none font-black text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Tahmini Maliyet (₺)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={productionForm.cost}
                    onChange={(e) => setProductionForm({ ...productionForm, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-[#004aad]/10 focus:ring-4 focus:ring-[#004aad]/5 rounded-[2rem] outline-none font-black text-lg"
                  />
                </div>

                <div className="pt-6 flex gap-6">
                  <button
                    type="button"
                    onClick={() => setIsProductionModalOpen(false)}
                    className="flex-1 py-6 border-2 border-gray-100 rounded-[2rem] text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                  >
                    KAPAT
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-6 bg-[#004aad] text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-50"
                  >
                    {saving ? "Kaydediliyor..." : "ÜRETİM EMRİNİ YAYINLA"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
