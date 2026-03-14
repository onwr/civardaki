"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  SparklesIcon,
  PresentationChartLineIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  BriefcaseIcon,
  ClockIcon,
  ChartBarIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";
import { mockProjects } from "@/lib/mock-data/cash";

export default function ProjectsPage() {
  const [projects] = useState(mockProjects);

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / (projects.length || 1));

  return (
    <div className="space-y-10 pb-24 max-w-[1400px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. PREMIUM PROJECTS HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <PresentationChartLineIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <PresentationChartLineIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Projeler</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1">CAPEX & Project Finance Hub</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-8 py-5 bg-white/10 backdrop-blur-xl text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3">
              <SparklesIcon className="w-5 h-5 opacity-70" /> ROI ANALİZİ
            </button>
            <button className="px-10 py-5 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-3">
              <PlusIcon className="w-5 h-5" /> YENİ PROJE BAŞLAT
            </button>
          </div>
        </div>

        {/* Live Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 mt-14 pt-10 border-t border-white/10 text-left">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <CurrencyDollarIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Toplam Proje Bütçesi</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">
              {totalBudget.toLocaleString("tr-TR")} ₺
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-rose-300">
              <ArrowTrendingUpIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Gerçekleşen Harcama</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">
              {totalSpent.toLocaleString("tr-TR")} ₺
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <ChartBarIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Genel İlerleme</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">%{avgProgress}</span>
          </div>
        </div>
      </motion.div>

      {/* 2. PROJECT CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <AnimatePresence>
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/40 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-[#004aad]/10 transition-colors" />

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${project.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700 border-blue-100" :
                      project.status === "NEAR_COMPLETION" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        "bg-gray-50 text-gray-700 border-gray-200"
                      }`}>
                      {project.status === "IN_PROGRESS" ? "DEVAM EDİYOR" :
                        project.status === "NEAR_COMPLETION" ? "TAMAMLANMAK ÜZERE" : "PLANLANDI"}
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-950 uppercase tracking-tighter leading-none">{project.name}</h3>
                  <p className="text-sm font-medium text-gray-400 max-w-md italic">{project.description}</p>
                </div>
                <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                  <BriefcaseIcon className="w-8 h-8 text-[#004aad]" />
                </div>
              </div>

              <div className="space-y-8 relative z-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Proje İlerleme Durumu</p>
                    <span className="text-2xl font-black text-gray-950 tracking-tighter">%{project.progress}</span>
                  </div>
                  <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${project.progress > 80 ? "bg-emerald-500" :
                        project.progress > 40 ? "bg-[#004aad]" : "bg-amber-500"
                        } shadow-[0_0_10px_rgba(0,74,173,0.3)]`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10 py-8 border-y border-gray-50">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Tahsis Edilen Bütçe</p>
                    <p className="text-2xl font-black text-gray-950 tracking-tighter">{project.budget.toLocaleString("tr-TR")} ₺</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Kullanılan Tutar</p>
                    <p className="text-2xl font-black text-rose-600 tracking-tighter">{project.spent.toLocaleString("tr-TR")} ₺</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-[10px] font-black uppercase text-gray-950">12 AY VADE</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-[10px] font-black uppercase text-gray-950">İSTANBUL HO</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-3 px-8 py-4 bg-gray-950 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-[#004aad] transition-all shadow-xl active:scale-95">
                    DETAYLAR <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 3. PROJECT AI ANALYTICS WIDGET */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[4rem] p-12 border border-blue-100 shadow-2xl relative overflow-hidden group mt-12"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 pointer-events-none">
          <PresentationChartLineIcon className="w-96 h-96 text-[#004aad]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#004aad] animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#004aad]">AI Project Health Score</span>
            </div>
            <h2 className="text-4xl font-black text-gray-950 tracking-tighter leading-none uppercase italic">Proje Verimliliğinde <span className="text-[#004aad]">Optimale Yakın!</span></h2>
            <p className="text-lg text-gray-500 font-medium max-w-2xl italic leading-relaxed">"Mevcut harcama hızınız ve projenizin ilerleme durumu analiz edildiğinde, 'Yeni Depo İnşaatı' projesinin bütçe sınırları içerisinde %5 tasarrufla tamamlanacağı öngörülmektedir."</p>
          </div>
          <div className="flex flex-col items-center gap-4 bg-[#004aad]/5 p-10 rounded-[3rem] border border-[#004aad]/10">
            <span className="text-6xl font-black text-[#004aad] tracking-tighter">94</span>
            <span className="text-[10px] font-black text-[#004aad] uppercase tracking-widest">PROJE PUANI</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

