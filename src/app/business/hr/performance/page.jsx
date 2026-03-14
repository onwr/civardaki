"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  UserIcon,
  StarIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowUpIcon,
  TrophyIcon,
  BoltIcon
} from "@heroicons/react/24/outline";
import { mockPerformanceReviews } from "@/lib/mock-data/hr";
import { toast } from "sonner";

export default function PerformancePage() {
  const [reviews, setReviews] = useState(mockPerformanceReviews);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredReviews = reviews.filter((review) =>
    review.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.reviewPeriodLabel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: reviews.length,
    avgScore: reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviews.length,
    highPerformers: reviews.filter((r) => r.overallScore >= 90).length,
    needsImprovement: reviews.filter((r) => r.overallScore < 80).length,
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 80) return "text-amber-500";
    return "text-rose-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-blue-50 border-t-[#004aad] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 max-w-[1600px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. ELITE PERFORMANCE HERO */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <ChartBarIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none italic">Performans Değerlendirilmesi</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Personnel KPI & Meritocracy Engine</p>
              </div>
            </div>
          </div>

          <button className="px-10 py-6 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-4 active:scale-95">
            <TrophyIcon className="w-6 h-6" /> YENİ DEĞERLENDİRME BAŞLAT
          </button>
        </div>

        {/* Dynamic Matrix Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mt-14 pt-10 border-t border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <CheckCircleIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Toplam Kayıt</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.total} Adet</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <StarIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Genel Başarı</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.avgScore.toFixed(1)}/100</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-amber-300">
              <BoltIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Yüksek Performans</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.highPerformers} Personel</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-rose-400">
              <ArrowUpIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Gelişim Gerekli</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.needsImprovement} Kişi</span>
          </div>
        </div>
      </motion.div>

      {/* 2. ADVANCED SEARCH */}
      <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 mx-2 flex items-center gap-6">
        <div className="flex-1 relative group">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Personel veya dönem bazlı arama..."
            className="w-full h-20 pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. PERFORMANCE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mx-2">
        <AnimatePresence mode="popLayout">
          {filteredReviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all flex flex-col items-center gap-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

              <div className="w-28 h-28 rounded-[3rem] bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner group-hover:rotate-6 transition-transform">
                <UserIcon className="w-12 h-12 text-[#004aad]" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tighter italic leading-none">{review.employeeName}</h3>
                <p className="text-[11px] font-black text-gray-400 tracking-widest uppercase">{review.reviewPeriodLabel}</p>
              </div>

              <div className="w-full flex items-center justify-between p-6 bg-gray-50 rounded-[2.5rem]">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">GENEL SKOR</p>
                  <p className={`text-3xl font-black italic ${getScoreColor(review.overallScore)}`}>{review.overallScore}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">DEĞERLENDİREN</p>
                  <p className="text-sm font-bold text-gray-950 italic">{review.reviewer}</p>
                </div>
              </div>

              <button
                onClick={() => { setSelectedReview(review); setShowDetailModal(true); }}
                className="w-full py-5 border border-gray-100 bg-white text-[#004aad] rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#004aad] hover:text-white transition-all shadow-sm flex items-center justify-center gap-3"
              >
                DETAYLI RAPORU GÖR <EyeIcon className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 4. AI CAREER PATH INSIGHT */}
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
              <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">AI Kariyer <span className="text-blue-400">Yolu</span></h3>
              <p className="text-gray-400 italic max-w-xl text-sm leading-relaxed">
                Mevcut performans skorlarına göre <span className="text-white font-bold">2 Personel</span> terfi potansiyeline sahip. Verimlilik artışı için bu çalışanlara ileri seviye liderlik eğitimleri tanımlamanızı öneririz. Takım istikrarı: <span className="text-emerald-400 font-bold">%94</span>
              </p>
            </div>
          </div>
          <button className="px-12 py-6 bg-white text-gray-950 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-400 hover:text-white transition-all shrink-0 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            POTANSİYEL ANALİZİNİ GÖR
          </button>
        </div>
      </motion.div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {showDetailModal && selectedReview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetailModal(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }} className="relative w-full max-w-4xl bg-white rounded-[5rem] p-10 md:p-14 shadow-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-blue-50 rounded-[2.2rem] flex items-center justify-center">
                    <TrophyIcon className="w-10 h-10 text-[#004aad]" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-950 uppercase italic tracking-tighter leading-none">{selectedReview.employeeName}</h2>
                    <p className="text-gray-400 font-bold italic text-[10px] mt-2 tracking-widest uppercase">{selectedReview.reviewPeriodLabel} Raporu</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-4 bg-gray-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all"><XMarkIcon className="w-6 h-6" /></button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                  <div className="bg-gray-50 p-10 rounded-[3.5rem] space-y-8">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">KPI Metrikleri</h4>
                    <div className="space-y-6">
                      {selectedReview.criteria.map((c, i) => (
                        <div key={i} className="space-y-3">
                          <div className="flex justify-between items-end">
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tighter italic">{c.name}</p>
                            <p className="text-lg font-black text-[#004aad]">{c.score}/{c.maxScore}</p>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(c.score / c.maxScore) * 100}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="h-full bg-gradient-to-r from-[#004aad] to-blue-400 rounded-full" />
                          </div>
                          <p className="text-xs text-gray-500 italic mt-2">"{c.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-[#004aad] p-10 rounded-[3.5rem] text-white">
                    <p className="text-[9px] font-black uppercase tracking-widest mb-4 opacity-70">GENEL PERFORMANS</p>
                    <p className="text-6xl font-black italic tracking-tighter">{selectedReview.overallScore}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-6 bg-white/10 py-3 rounded-full text-center">EXCELLENT STATUS</p>
                  </div>

                  <div className="bg-gray-50 p-8 rounded-[3.5rem] space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Gelişim Alanları</h4>
                    {selectedReview.improvements.map((im, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700 italic">
                        <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        {im}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => setShowDetailModal(false)} className="w-full mt-12 py-8 bg-gray-950 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[11px] hover:bg-[#004aad] transition-all shadow-4xl italic">RAPORU KAPT VE PDF OLARAK KAYDET</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
