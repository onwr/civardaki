"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CubeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  IdentificationIcon,
  MegaphoneIcon,
  XMarkIcon,
  InformationCircleIcon,
  BoltIcon
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

export default function AssetsPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Mock Assets with Rich Data
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState({
    totalValue: 0,
    activeCount: 0,
    maintenanceCount: 0,
    depreciation: 0,
    listedCount: 0
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/business/assets");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAssets(data.assets || []);
      setStats(data.stats || stats);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Stats are now coming from API

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || a.category === filterCategory;
    const matchesStatus = filterStatus === "all" || a.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleListingSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const listingPrice = formData.get("listingPrice");
    const description = formData.get("description");

    try {
      const res = await fetch("/api/business/assets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedAsset.id,
          isListed: true,
          listingPrice: parseFloat(listingPrice),
          description
        })
      });
      const updated = await res.json();
      if (updated.error) throw new Error(updated.error);

      toast.success("Varlık pazaryerine başarıyla gönderildi.");
      setIsListingModalOpen(false);
      fetchAssets();
    } catch (error) {
      toast.error("Hata oluştu.");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/business/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      toast.success("Yeni varlık başarıyla kaydedildi.");
      setIsAddModalOpen(false);
      fetchAssets();
    } catch (error) {
      toast.error("Varlık eklenirken hata oluştu.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu varlığı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/business/assets?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Varlık silindi.");
        fetchAssets();
      }
    } catch (error) {
      toast.error("Hata oluştu.");
    }
  };
  bookings_page_mockup
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-50 border-t-[#004aad] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 max-w-[1600px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. ELITE ASSET INVENTORY HERO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <CubeIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <CubeIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none italic">Varlık Envanteri</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Enterprise Asset Management & Appraisal Hub</p>
              </div>
            </div>
          </div>

          <button onClick={() => setIsAddModalOpen(true)} className="px-10 py-6 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-4 active:scale-95">
            <PlusIcon className="w-6 h-6" /> YENİ VARLIK KAYDI
          </button>
        </div>

        {/* Dynamic Valuation & Portfolio Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mt-14 pt-10 border-t border-white/10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Net Portföy Değeri</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">₺{stats.totalValue.toLocaleString()}</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Aktif Operasyon</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.activeCount} Varlık</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-2">Amortisman Oranı</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">%{stats.depreciation}</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Pazaryeri İlanı</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.listedCount} Adet</span>
          </div>
        </div>
      </motion.div>

      {/* 2. ADVANCED DISCOVERY BAR */}
      <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 mx-2 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative group">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Varlık adı, envanter kodu veya departman ara..."
            className="w-full h-20 pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          {['all', 'VEHICLE', 'EQUIPMENT', 'TECHNOLOGY'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-8 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-[#004aad] text-white shadow-2xl scale-105' : 'bg-gray-50 text-gray-400 hover:text-[#004aad]'
                }`}
            >
              {cat === 'all' ? 'TÜMÜ' : cat === 'VEHICLE' ? 'ARAÇLAR' : cat === 'EQUIPMENT' ? 'EKİPMAN' : 'BİLİŞİM'}
            </button>
          ))}
          <div className="w-px h-full bg-gray-100 mx-2 hidden lg:block" />
          <button onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')} className="p-6 bg-gray-50 text-gray-400 rounded-[2rem] hover:text-[#004aad] transition-colors">
            {viewMode === 'grid' ? <ListBulletIcon className="w-8 h-8" /> : <Squares2X2Icon className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* 3. BENTO-GRID ASSETS */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mx-2" : "space-y-6 mx-2"}>
        <AnimatePresence mode="popLayout">
          {filteredAssets.map((asset, idx) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-white rounded-[4.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden flex flex-col ${viewMode === 'list' ? 'md:flex-row md:items-center p-8' : 'p-10'}`}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />

              <div className={`${viewMode === 'list' ? 'w-24' : 'flex items-start justify-between mb-8'}`}>
                <div className="w-20 h-20 rounded-[2.8rem] bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:rotate-3 transition-transform shadow-inner">
                  <CubeIcon className="w-10 h-10 text-[#004aad]" />
                </div>
                {viewMode === 'grid' && (
                  <div className="space-y-2 text-right">
                    <span className={`px-4 py-2 rounded-full text-[8px] font-black tracking-widest border ${asset.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      asset.status === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                      {asset.status === 'ACTIVE' ? 'AKTİF' : asset.status === 'MAINTENANCE' ? 'BAKIMDA' : 'PASİF'}
                    </span>
                    {asset.isListed && (
                      <div className="flex items-center justify-end gap-1 text-blue-600 pt-1">
                        <MegaphoneIcon className="w-3 h-3" />
                        <span className="text-[8px] font-black uppercase tracking-widest italic">PAZARYERİNDE</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-3xl font-black text-gray-950 uppercase tracking-tighter italic leading-none">{asset.name}</h3>
                  <p className="text-[10px] font-black text-gray-400 mt-2 tracking-widest uppercase">{asset.assetCode}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-[3rem]">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">GÜNCEL DEĞER</p>
                    <p className="text-xl font-black text-gray-950 italic">₺{asset.currentValue.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">AMORTİSMAN</p>
                    <p className="text-lg font-black text-rose-500 italic">-%{Math.round((1 - asset.currentValue / asset.purchasePrice) * 100)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase italic space-x-4">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-[#004aad]" />
                    <span>{asset.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <WrenchScrewdriverIcon className="w-4 h-4 text-amber-500" />
                    <span>{asset.nextMaintenance ? new Date(asset.nextMaintenance).toLocaleDateString("tr-TR") : "Belirtilmedi"}</span>
                  </div>
                </div>
              </div>

              <div className={`${viewMode === 'list' ? 'ml-8 flex flex-col gap-2' : 'mt-10 pt-8 border-t border-gray-50 flex gap-4'}`}>
                <button className="flex-1 py-5 px-6 bg-gray-50 text-gray-400 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all italic flex items-center justify-center gap-3">
                  <EyeIcon className="w-5 h-5" /> DETAY
                </button>
                <button onClick={() => handleDelete(asset.id)} className="w-16 h-16 bg-rose-50 text-rose-400 rounded-3xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                  <TrashIcon className="w-6 h-6" />
                </button>
                <button onClick={() => { setSelectedAsset(asset); setIsListingModalOpen(true); }} className={`flex-1 py-5 px-6 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-3 ${asset.isListed ? 'bg-emerald-500 text-white' : 'bg-[#004aad] text-white hover:bg-black shadow-xl'
                  }`}>
                  <MegaphoneIcon className="w-5 h-5" /> {asset.isListed ? 'İLAN GÖR' : 'İLAN VER'}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 4. AI ASSET INTELLIGENCE INSIGHT */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gray-950 rounded-[4rem] p-12 text-white relative overflow-hidden group mx-2"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#004aad]/20 to-transparent pointer-events-none text-white" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl">
              <SparklesIcon className="w-10 h-10 text-blue-400 animate-pulse" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">AI Varlık <span className="text-blue-400">Analizi</span></h3>
              <p className="text-gray-400 italic max-w-xl text-sm leading-relaxed">
                Varlık amortisman verileriniz <span className="text-white font-bold">Lojistik</span> kategorisinde beklenenden %4 daha hızlı ilerliyor. <span className="text-blue-400 font-bold">Ford Transit Van v4</span> aracınızın 2. el piyasa değeri şu an zirve noktasında. Bu varlığı elden çıkararak yeni nesil elektrikli bir modele geçmek için <span className="text-emerald-400 font-bold">Mali Verimlilik Fırsatı</span> bulunuyor.
              </p>
            </div>
          </div>
          <button onClick={() => toast.info("Amortisman ve verimlilik raporu hazırlanıyor...")} className="px-12 py-6 bg-white text-gray-950 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-400 hover:text-white transition-all shrink-0 italic shadow-4xl">
            FULL DEĞERLEME RAPORU
          </button>
        </div>
      </motion.div>

      {/* MODALS */}
      <AnimatePresence>
        {isListingModalOpen && selectedAsset && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsListingModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[5rem] p-12 shadow-4xl overflow-hidden">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black text-gray-950 uppercase italic tracking-tighter leading-none">Varlık İlanı Oluştur</h2>
                <button onClick={() => setIsListingModalOpen(false)} className="p-4 bg-gray-50 text-gray-400 rounded-3xl hover:bg-rose-50 hover:text-rose-500 transition-all"><XMarkIcon className="w-6 h-6" /></button>
              </div>

              <div className="bg-blue-50/50 p-8 rounded-[3rem] mb-12 flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <CubeIcon className="w-8 h-8 text-[#004aad]" />
                </div>
                <div>
                  <h4 className="font-black text-gray-950 uppercase italic tracking-tighter">{selectedAsset.name}</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Envanter Değeri: ₺{selectedAsset.currentValue.toLocaleString()}</p>
                </div>
              </div>

              <form onSubmit={handleListingSubmit} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">İLAN TİPİ</label>
                    <select className="w-full h-18 px-8 bg-gray-50 rounded-[2rem] outline-none font-bold text-gray-950 border-2 border-transparent focus:border-[#004aad]/10 appearance-none">
                      <option>SATILIK İLAN</option>
                      <option>KİRALIK İLAN</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">TALEP EDİLEN FİYAT</label>
                    <input type="number" name="listingPrice" defaultValue={selectedAsset.currentValue} placeholder="0.00 ₺" className="w-full h-18 px-8 bg-gray-50 rounded-[2rem] outline-none font-black text-gray-950 border-2 border-transparent focus:border-[#004aad]/10" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">İLAN AÇIKLAMASI</label>
                  <textarea name="description" rows="4" placeholder="Varlık durumu, garanti ve ek özellikler..." className="w-full p-8 bg-gray-50 rounded-[2.5rem] outline-none font-medium italic text-gray-900 border-2 border-transparent focus:border-[#004aad]/10 resize-none" />
                </div>

                <div className="bg-amber-50 rounded-[2.5rem] p-6 flex items-start gap-4 mb-8">
                  <InformationCircleIcon className="w-6 h-6 text-amber-500 mt-1" />
                  <p className="text-[11px] font-bold text-amber-700 italic leading-relaxed">İlanınız onay alındıktan sonra Civardaki.com Pazaryeri'nde tüm kurumsal ve bireysel alıcılara görünür olacaktır. İskele komisyon oranları %2.5 ile %4.0 arasında değişkenlik gösterebilir.</p>
                </div>

                <button type="submit" className="w-full py-8 bg-[#004aad] text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs hover:bg-black transition-all italic shadow-2xl">VARLIĞI PAZARYERİNDE YAYINLA</button>
              </form>
            </motion.div>
          </div>
        )}
        {/* ADD ASSET MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[5rem] p-12 shadow-4xl overflow-hidden overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black text-gray-950 uppercase italic tracking-tighter leading-none">Yeni Varlık Kaydı</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-4 bg-gray-50 text-gray-400 rounded-3xl hover:bg-rose-50 hover:text-rose-500 transition-all"><XMarkIcon className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">VARLIK ADI</label>
                  <input type="text" name="name" required placeholder="Örn: Ford Transit v4" className="w-full h-18 px-8 bg-gray-50 rounded-[2rem] outline-none font-bold text-gray-950 border-2 border-transparent focus:border-[#004aad]/10" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">KATEGORİ</label>
                    <select name="category" className="w-full h-18 px-8 bg-gray-50 rounded-[2rem] outline-none font-bold text-gray-950 border-2 border-transparent focus:border-[#004aad]/10 appearance-none">
                      <option value="VEHICLE">ARAÇ</option>
                      <option value="EQUIPMENT">EKİPMAN</option>
                      <option value="TECHNOLOGY">TEKNOLOJİ</option>
                      <option value="OFFICE">OFİS</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">DURUMU</label>
                    <select name="condition" className="w-full h-18 px-8 bg-gray-50 rounded-[2rem] outline-none font-bold text-gray-950 border-2 border-transparent focus:border-[#004aad]/10 appearance-none">
                      <option value="EXCELLENT">MÜKEMMEL</option>
                      <option value="GOOD">İYİ</option>
                      <option value="FAIR">ORTA</option>
                      <option value="POOR">ZAYIF</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">ALIS FİYATI</label>
                    <input type="number" name="purchasePrice" required placeholder="₺" className="w-full h-18 px-8 bg-gray-50 rounded-[2rem] outline-none font-bold text-gray-950 border-2 border-transparent focus:border-[#004aad]/10" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">GÜNCEL DEĞER</label>
                    <input type="number" name="currentValue" required placeholder="₺" className="w-full h-18 px-8 bg-gray-50 rounded-[2rem] outline-none font-bold text-gray-950 border-2 border-transparent focus:border-[#004aad]/10" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">KONUM / DEPO</label>
                  <input type="text" name="location" placeholder="Örn: Merkez Garaj" className="w-full h-18 px-8 bg-gray-50 rounded-[2rem] outline-none font-bold text-gray-950 border-2 border-transparent focus:border-[#004aad]/10" />
                </div>

                <button type="submit" className="w-full py-8 bg-gray-900 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs hover:bg-[#004aad] transition-all italic shadow-2xl mt-4">SİSTEME KAYDET</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
