"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BanknotesIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  UserIcon,
  SparklesIcon,
  ScaleIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  IdentificationIcon,
  CalculatorIcon
} from "@heroicons/react/24/outline";
import { mockPayrolls } from "@/lib/mock-data/hr";
import { toast } from "sonner";

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState(mockPayrolls);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formState, setFormState] = useState({
    employeeName: "",
    period: "",
    baseSalary: "",
    overtime: "",
    bonus: "",
    deductions: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredPayrolls = payrolls.filter((p) => {
    const matchesSearch = p.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalGross: payrolls.reduce((sum, p) => sum + p.grossSalary, 0),
    totalNet: payrolls.reduce((sum, p) => sum + p.netSalary, 0),
    pendingCount: payrolls.filter(p => p.status === 'pending').length,
    taxLoad: 18 // Mock percentage
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Bordro başarıyla işlendi.");
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-50 border-t-[#004aad] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 max-w-[1600px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. ELITE PAYROLL HERO */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <BanknotesIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <BanknotesIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none italic">Maaş Yönetimi</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Financial Personnel Compensation Matrix</p>
              </div>
            </div>
          </div>

          <button onClick={() => setShowAddModal(true)} className="px-10 py-6 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-4 active:scale-95">
            <PlusIcon className="w-6 h-6" /> YENİ BORDRO OLUŞTUR
          </button>
        </div>

        {/* Global Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mt-14 pt-10 border-t border-white/10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Toplam Brüt</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">₺{stats.totalGross.toLocaleString()}</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Net Ödemeler</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">₺{stats.totalNet.toLocaleString()}</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-2">Bekleyen Onay</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.pendingCount} Adet</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Vergi Yükü</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">%{stats.taxLoad}</span>
          </div>
        </div>
      </motion.div>

      {/* 2. ADVANCED FILTERS */}
      <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 mx-2 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative group">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Çalışan ismi veya dönem ara..."
            className="w-full h-20 pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          {['all', 'paid', 'pending'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-8 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${filterStatus === st ? 'bg-[#004aad] text-white shadow-2xl scale-105' : 'bg-gray-50 text-gray-400 hover:text-[#004aad]'
                }`}
            >
              {st === 'all' ? 'TÜMÜ' : st === 'paid' ? 'ÖDENDİ' : 'BEKLEYEN'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. PAYROLL MATRIX */}
      <div className="space-y-6 mx-2">
        <AnimatePresence mode="popLayout">
          {filteredPayrolls.map((payroll, idx) => (
            <motion.div
              key={payroll.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-10 rounded-[4.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden flex flex-col lg:flex-row items-center gap-10"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

              <div className="flex items-center gap-8 lg:w-[30%] shrink-0">
                <div className="w-20 h-20 rounded-[2.5rem] bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner group-hover:rotate-6 transition-transform">
                  <UserIcon className="w-10 h-10 text-[#004aad]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tighter italic leading-none">{payroll.employeeName}</h3>
                  <p className="text-[10px] font-black text-gray-400 mt-2 tracking-widest uppercase">{payroll.periodLabel}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 w-full">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">BRÜT MAAŞ</p>
                  <p className="text-xl font-black text-gray-950 italic">₺{payroll.grossSalary.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">NET HAKEDİŞ</p>
                  <p className="text-xl font-black text-[#004aad] italic">₺{payroll.netSalary.toLocaleString()}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">DURUM</p>
                  <span className={`px-4 py-2 rounded-full text-[8px] font-black tracking-widest border ${payroll.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {payroll.status === 'paid' ? 'ÖDENDİ' : 'BEKLEYEN'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <button onClick={() => { setSelectedPayroll(payroll); setShowDetailModal(true); }} className="p-5 bg-gray-50 text-gray-400 rounded-[1.5rem] hover:bg-black hover:text-white transition-all"><EyeIcon className="w-6 h-6" /></button>
                <button className="px-8 py-5 bg-[#004aad] text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all">DEKONT</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 4. AI FINANCIAL INSIGHT */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gray-950 rounded-[4rem] p-12 text-white relative overflow-hidden group mx-2"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#004aad]/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl">
              <SparklesIcon className="w-10 h-10 text-blue-400 animate-pulse" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">AI Finansal <span className="text-blue-400">Analiz</span></h3>
              <p className="text-gray-400 italic max-w-xl text-sm leading-relaxed">
                Bu dönem personel maliyetleriniz geçen aya göre <span className="text-white font-bold">%4.2 oranında arttı.</span> Vergi dilimi değişimleri nedeniyle önümüzdeki 2 ay boyunca net ödemelerde sığ bir dalgalanma bekliyoruz. Nakit akışınızı buna göre optimize edin.
              </p>
            </div>
          </div>
          <button className="px-12 py-6 bg-white text-gray-950 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-400 hover:text-white transition-all shrink-0 italic">
            MALİYET RAPORUNU İNDİR
          </button>
        </div>
      </motion.div>

      {/* MODALS */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[5rem] p-12 shadow-4xl overflow-hidden">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black text-gray-950 uppercase italic tracking-tighter">Bordro Kaydı</h2>
                <button onClick={() => setShowAddModal(false)} className="p-4 bg-gray-50 text-gray-400 rounded-2xl"><XMarkIcon className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">PERSONEL SEÇİMİ</label>
                  <input type="text" placeholder="Çalışan ismi..." className="w-full h-18 px-8 bg-gray-50 rounded-[2rem] outline-none font-bold text-gray-950 border-2 border-transparent focus:border-[#004aad]/10" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">TABAN MAAŞ</label>
                    <input type="number" className="w-full h-18 px-8 bg-gray-50 rounded-[2rem] outline-none font-black text-gray-950" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-4">DÖNEM</label>
                    <input type="month" className="w-full h-18 px-8 bg-gray-50 rounded-[2rem] outline-none font-black text-gray-950" />
                  </div>
                </div>
                <button type="submit" className="w-full py-8 bg-[#004aad] text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs hover:bg-black transition-all italic shadow-2xl">BORDROYU SİSTEME İŞLE</button>
              </form>
            </motion.div>
          </div>
        )}

        {showDetailModal && selectedPayroll && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetailModal(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[5rem] p-12 shadow-4xl text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <BanknotesIcon className="w-10 h-10 text-[#004aad]" />
              </div>
              <h2 className="text-3xl font-black text-gray-950 uppercase italic tracking-tighter leading-none">{selectedPayroll.employeeName}</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-3">{selectedPayroll.periodLabel} MAAŞ DETAYLARI</p>

              <div className="mt-12 space-y-4 text-left">
                <div className="flex justify-between p-6 bg-gray-50 rounded-[2rem]">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">BRÜT TUTAR</span>
                  <span className="font-black italic text-gray-950 text-xl">₺{selectedPayroll.grossSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                  <span className="text-[10px] font-black text-[#004aad] uppercase tracking-widest">NET HAKEDİŞ</span>
                  <span className="font-black italic text-[#004aad] text-2xl">₺{selectedPayroll.netSalary.toLocaleString()}</span>
                </div>
              </div>

              <button onClick={() => setShowDetailModal(false)} className="w-full py-6 mt-10 bg-gray-950 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all italic">PENCEREYİ KAPAT</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
