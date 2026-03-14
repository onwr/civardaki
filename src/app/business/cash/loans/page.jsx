"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  SparklesIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  CreditCardIcon,
  ClockIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline";
import { mockLoans } from "@/lib/mock-data/cash";

export default function LoansPage() {
  const [loans] = useState(mockLoans);

  const totalDebt = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
  const totalMonthly = loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  const avgInterest = loans.reduce((sum, loan) => sum + loan.interestRate, 0) / (loans.length || 1);

  return (
    <div className="space-y-10 pb-24 max-w-[1400px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. PREMIUM LOANS HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <BuildingLibraryIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <BuildingLibraryIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Krediler</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Liability & Debt Structuring Hub</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-8 py-5 bg-white/10 backdrop-blur-xl text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3">
              <SparklesIcon className="w-5 h-5 opacity-70" /> RE-FİNANSMAN AI
            </button>
            <button className="px-10 py-5 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-3">
              <PlusIcon className="w-5 h-5" /> YENİ KREDİ TANIMLA
            </button>
          </div>
        </div>

        {/* Live Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 mt-14 pt-10 border-t border-white/10 text-left">
          <div>
            <div className="flex items-center gap-2 mb-2 text-rose-300">
              <ArrowTrendingUpIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Kalan Toplam Borç</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">
              {totalDebt.toLocaleString("tr-TR")} ₺
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <CreditCardIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Aylık Taksit Yükü</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">
              {totalMonthly.toLocaleString("tr-TR")} ₺
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <PresentationChartLineIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ortalama Faiz Oranı</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">
              %{avgInterest.toFixed(2)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. LOAN CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        <AnimatePresence>
          {loans.map((loan) => (
            <motion.div
              key={loan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#004aad]/10 transition-colors" />

              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                  <BuildingLibraryIcon className="w-10 h-10 text-[#004aad]" />
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-[#004aad] uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                    Ticari Kredi
                  </span>
                  <h2 className="text-xl font-black text-gray-950 mt-4 uppercase leading-none">{loan.lenderName}</h2>
                </div>
              </div>

              <div className="space-y-8 relative z-10">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kalan Anapara Borcu</p>
                  <p className="text-4xl font-black text-gray-950 tracking-tighter">
                    {loan.remainingAmount.toLocaleString("tr-TR")} ₺
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-50">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Aylık Taksit</p>
                    <p className="text-lg font-black text-gray-950">{loan.monthlyPayment.toLocaleString("tr-TR")} ₺</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Yıllık Faiz</p>
                    <p className="text-lg font-black text-emerald-600">%{loan.interestRate}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Bitiş Tarihi</p>
                      <p className="text-[11px] font-black text-gray-950 mt-1 uppercase">{new Date(loan.endDate).toLocaleDateString("tr-TR")}</p>
                    </div>
                  </div>
                  <button className="p-4 bg-gray-950 text-white rounded-2xl hover:bg-[#004aad] transition-all shadow-xl shadow-black/10">
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 3. AI REPAYMENT ADVISOR */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#004aad] to-[#01142f] rounded-[4rem] p-12 text-white relative overflow-hidden shadow-2xl mx-2 md:mx-4 group mt-12"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <SparklesIcon className="w-80 h-80 rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
              <span className="text-xs font-black uppercase tracking-[0.4em] text-blue-200">Re-Finansman Analizi</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black leading-tight italic uppercase tracking-tighter">Maliyetlerinizi <span className="text-blue-200">Düşürün!</span></h2>
            <p className="text-blue-100/70 text-xl font-medium max-w-2xl leading-relaxed italic">"Mevcut piyasa faiz oranları, portföyünüzdeki ABC Bankası kredisinden %1.5 daha düşük. Krediyi yapılandırarak vade sonuna kadar toplam '42.000 ₺' faiz tasarrufu sağlayabilirsiniz."</p>
          </div>
          <button className="px-12 py-6 bg-white text-[#004aad] rounded-[2rem] font-black text-sm uppercase tracking-widest hover:shadow-3xl transition-all active:scale-95 italic text-nowrap">HESAPLAMAYI GÖR</button>
        </div>
      </motion.div>
    </div>
  );
}

