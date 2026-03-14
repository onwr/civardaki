"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AcademicCapIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ArrowRightIcon,
  BookOpenIcon,
  VideoCameraIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { mockTrainings } from "@/lib/mock-data/hr";
import { toast } from "sonner";

export default function TrainingPage() {
  const [trainings, setTrainings] = useState(mockTrainings);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch =
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || training.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: trainings.length,
    completed: trainings.filter((t) => t.status === "completed").length,
    scheduled: trainings.filter((t) => t.status === "scheduled").length,
    totalCost: trainings.reduce((sum, t) => sum + t.cost, 0),
    totalParticipants: trainings.reduce((sum, t) => sum + t.participants.length, 0),
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

      {/* 1. ELITE TRAINING HERO */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <AcademicCapIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none italic">Kurumsal Eğitimler</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Personnel Intellectual Capital Growth</p>
              </div>
            </div>
          </div>

          <button className="px-10 py-6 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-4 active:scale-95">
            <PlusIcon className="w-6 h-6" /> YENİ EĞİTİM PLANI
          </button>
        </div>

        {/* Dynamic Analytics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mt-14 pt-10 border-t border-white/10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Aktif Kurslar</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.total} Adet</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Başarı Oranı</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">%{Math.round((stats.completed / stats.total) * 100)}</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-2">Kayıtlı Personel</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.totalParticipants} Kişi</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Yıllık Bütçe</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">{stats.totalCost.toLocaleString()} ₺</span>
          </div>
        </div>
      </motion.div>

      {/* 2. DISCOVERY BAR */}
      <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 mx-2 flex flex-wrap items-center justify-between gap-6">
        <div className="flex-1 min-w-[300px] relative group h-full">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Eğitim başlığı veya kategori ara..."
            className="w-full h-20 pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex p-2 bg-gray-100 rounded-[2.5rem]">
            {['all', 'completed', 'scheduled'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === st ? 'bg-white text-[#004aad] shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {st === 'all' ? 'TÜMÜ' : st === 'completed' ? 'BİTEN' : 'PLANLI'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. TRAINING CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mx-2">
        <AnimatePresence mode="popLayout">
          {filteredTrainings.map((training, idx) => (
            <motion.div
              key={training.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-10 rounded-[4.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />

              <div className="flex items-start justify-between mb-8">
                <div className="w-20 h-20 rounded-[2.5rem] bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner group-hover:scale-110 transition-transform">
                  <BookOpenIcon className="w-10 h-10 text-[#004aad]" />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${training.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    training.status === 'scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                  {training.status === 'completed' ? 'TAMAMLANDI' : training.status === 'scheduled' ? 'PLANLANDI' : 'TASLAK'}
                </span>
              </div>

              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tighter italic leading-snug">{training.title}</h3>
                <p className="text-sm font-medium text-gray-500 italic line-clamp-2">"{training.description}"</p>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">KATILIMCI</p>
                  <p className="text-lg font-black text-gray-950 italic tracking-tighter">{training.participants.length} Personel</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">SÜRE</p>
                  <p className="text-lg font-black text-[#004aad] italic tracking-tighter">{training.duration} GÜN</p>
                </div>
              </div>

              <button
                onClick={() => handleViewDetail(training)}
                className="w-full mt-10 py-5 bg-gray-50 text-gray-400 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-[#004aad] hover:text-white transition-all flex items-center justify-center gap-3 italic"
              >
                MATERYAL VE DETAYLAR <ArrowRightIcon className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 4. AI LEARNING INSIGHT */}
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
              <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">AI Öğrenme <span className="text-blue-400">Yönetimi</span></h3>
              <p className="text-gray-400 italic max-w-xl text-sm leading-relaxed">
                Şirketinizin dijital yetkinlik skoru bu çeyrekte <span className="text-white font-bold">%12 artış gösterdi.</span> Personellerin %65'i video tabanlı içerikleri tercih ediyor. Yeni dönemde <span className="text-blue-400 font-bold">Veri Analitiği</span> workshoplarına odaklanmanızı öneririz.
              </p>
            </div>
          </div>
          <button className="px-12 py-6 bg-white text-gray-950 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-400 hover:text-white transition-all shrink-0 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            ÖĞRENME ANALİZİNİ İNDİR
          </button>
        </div>
      </motion.div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {showDetailModal && selectedTraining && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetailModal(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-4xl bg-white rounded-[5rem] p-10 md:p-14 shadow-4xl max-h-[90vh] overflow-y-auto">

              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-blue-50 rounded-[2.5rem] flex items-center justify-center">
                    <AcademicCapIcon className="w-10 h-10 text-[#004aad]" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-950 uppercase italic tracking-tighter leading-none">{selectedTraining.title}</h2>
                    <p className="text-gray-400 font-bold italic text-[10px] mt-2 tracking-widest uppercase">Intellectual Asset Report</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-4 bg-gray-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all"><XMarkIcon className="w-6 h-6" /></button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-10">
                  <div className="bg-gray-50 p-10 rounded-[3.5rem] space-y-6">
                    <div className="flex items-center gap-4 text-gray-950">
                      <InformationCircleIcon className="w-6 h-6 text-[#004aad]" />
                      <p className="font-black text-xs uppercase tracking-widest">EĞİTİM KAPSAMI</p>
                    </div>
                    <p className="text-gray-600 italic leading-relaxed font-medium">"{selectedTraining.description}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-8 rounded-[2.5rem]">
                      <p className="text-[9px] font-black text-[#004aad] uppercase tracking-widest mb-1">PROGRAM MALİYETİ</p>
                      <p className="text-2xl font-black text-gray-950 italic tracking-tighter">{selectedTraining.cost.toLocaleString()} ₺</p>
                    </div>
                    <div className="bg-blue-50 p-8 rounded-[2.5rem]">
                      <p className="text-[9px] font-black text-[#004aad] uppercase tracking-widest mb-1">TOPLAM SÜRE</p>
                      <p className="text-2xl font-black text-gray-950 italic tracking-tighter">{selectedTraining.duration} SAAT</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] pl-6">MATERYAL LİSTESİ</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedTraining.materials.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] group hover:bg-[#004aad] transition-all">
                        <div className="flex items-center gap-4">
                          <VideoCameraIcon className="w-6 h-6 text-[#004aad] group-hover:text-white" />
                          <p className="font-bold text-gray-900 group-hover:text-white uppercase italic tracking-tighter text-sm">{m}</p>
                        </div>
                        <ArrowRightIcon className="w-5 h-5 text-gray-300 group-hover:text-white" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-4">
                    {[1, 2, 3].map(p => <div key={p} className="w-12 h-12 rounded-full bg-gray-200 border-4 border-white" />)}
                  </div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{selectedTraining.participants.length} PERSONEL KAYITLI</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="px-12 py-6 bg-gray-950 text-white rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-[#004aad] transition-all shadow-4xl italic">OTURUMU KAPAT</button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
