"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  EyeIcon,
  BanknotesIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  WalletIcon
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/business/cash");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAccounts(data.accounts || []);
    } catch (e) {
      console.error(e);
      toast.error("Hesaplar yüklenirken hata oluştu.");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter((account) =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  const getAccountIcon = (type) => {
    switch (type) {
      case "CASH":
        return BanknotesIcon;
      case "BANK":
        return BuildingLibraryIcon;
      case "ESCROW":
        return CurrencyDollarIcon;
      default:
        return CurrencyDollarIcon;
    }
  };

  const getAccountTypeLabel = (type) => {
    switch (type) {
      case "CASH":
        return "Kasa";
      case "BANK":
        return "Banka";
      case "ESCROW":
        return "Havuz Hesap";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-10 pb-24 max-w-[1400px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. PREMIUM ACCOUNTS HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <WalletIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <BuildingLibraryIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Hesaplarım</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Cash & Asset Management Hub</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-8 py-5 bg-white/10 backdrop-blur-xl text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3">
              <SparklesIcon className="w-5 h-5 opacity-70" /> AI ANALİZ
            </button>
            <Link href="/business/cash" className="px-10 py-5 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-3">
              <PlusIcon className="w-5 h-5" /> NAKİT YÖNETİMİNE GİT
            </Link>
          </div>
        </div>

        {/* Live Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mt-14 pt-10 border-t border-white/10 text-left">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <CurrencyDollarIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Toplam Bakiye</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tracking-tighter">
                {totalBalance.toLocaleString("tr-TR")} ₺
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <BanknotesIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Kasa Bakiyesi</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">
              {accounts.filter(a => a.type === "CASH").reduce((sum, a) => sum + (a.balance || 0), 0).toLocaleString("tr-TR")} ₺
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <ArrowTrendingUpIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Banka Bakiyesi</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">
              {accounts.filter(a => a.type === "BANK").reduce((sum, a) => sum + (a.balance || 0), 0).toLocaleString("tr-TR")} ₺
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <CreditCardIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Toplam Hesap</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">{accounts.length}</span>
          </div>
        </div>
      </motion.div>

      {/* 2. ADVANCED SEARCH & ACCOUNT FILTERS */}
      <div className="bg-white p-6 md:p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col xl:flex-row items-center justify-between gap-6 mx-2 md:mx-4">
        {/* Search Input */}
        <div className="w-full xl:w-auto flex-1 min-w-[300px] relative group h-full">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Hesap adı, banka veya IBAN ara..."
            className="w-full h-[72px] pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters & Actions Overlay */}
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <button className="flex-1 md:flex-none px-10 py-5 bg-gray-50 hover:bg-white text-gray-400 hover:text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest transition-all border border-transparent hover:border-blue-100 flex items-center justify-center gap-3">
            <ArrowTrendingUpIcon className="w-5 h-5" /> HAREKET ÖZETİ
          </button>
        </div>
      </div>

      {/* 3. ACCOUNTS LIST */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-[#004aad] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6 mx-2 md:mx-4">
          {filteredAccounts.length === 0 ? (
            <div className="bg-white p-16 rounded-[3rem] border border-gray-100 text-center space-y-4">
              <BuildingLibraryIcon className="w-12 h-12 text-gray-200 mx-auto" />
              <p className="text-sm font-bold text-gray-500">Henüz hesap tanımlı değil</p>
              <Link href="/business/cash" className="inline-flex items-center gap-2 px-6 py-3 bg-[#004aad] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-800">
                Nakit yönetimine git
              </Link>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredAccounts.map((account) => {
                const Icon = getAccountIcon(account.type);
                return (
                  <motion.div
                    key={account.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all flex flex-col lg:flex-row items-center gap-8 group"
                  >
                    <div className="flex items-center gap-6 lg:w-[35%] shrink-0">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${account.type === "BANK" ? "bg-blue-50 text-[#004aad]" : account.type === "CASH" ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-600"}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${account.type === "BANK" ? "bg-blue-100 text-blue-700" : account.type === "CASH" ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"}`}>
                            {getAccountTypeLabel(account.type)}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tight bg-emerald-50 px-2 py-0.5 rounded-md">AKTİF</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-950 truncate group-hover:text-[#004aad] transition-colors leading-none uppercase">{account.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 mt-2.5 uppercase tracking-widest">{account.type === "BANK" ? "BANKA HESABI" : "NAKİT POZİSYONU"}</p>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 px-8 lg:border-x border-gray-100 text-center lg:text-left">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Döviz</p>
                          <p className="text-sm font-black text-gray-950 leading-none">{account.currency || "TRY"}</p>
                        </div>
                        <div className="text-right lg:text-center">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Güncel</p>
                          <p className="text-sm font-black text-gray-950 leading-none">—</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-10 lg:w-[25%] justify-end shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Bakiye</p>
                        <p className="text-3xl font-black text-gray-950 tracking-tighter leading-none">
                          {(account.balance ?? 0).toLocaleString("tr-TR")} ₺
                        </p>
                      </div>
                      <Link href="/business/cash" className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-blue-50 hover:text-[#004aad] transition-all border border-gray-100">
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* 4. AI FINANCE WIDGET */}
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
              <span className="text-xs font-black uppercase tracking-[0.4em] text-blue-200">Finansal Optimizasyon Önerisi</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black leading-tight italic uppercase tracking-tighter">Atıl Nakdi <span className="text-blue-200">Değerlendirin!</span></h2>
            <p className="text-blue-100/70 text-xl font-medium max-w-2xl leading-relaxed italic">"Banka hesaplarınızdaki toplam bakiyenin %30'u son 90 gündür hareketsiz. Bu tutarı kısa vadeli repo veya para piyasası fonlarında değerlendirerek pasif gelir elde edebilirsiniz."</p>
          </div>
          <button className="px-12 py-6 bg-white text-[#004aad] rounded-[2rem] font-black text-sm uppercase tracking-widest hover:shadow-3xl transition-all active:scale-95 italic">ÖNERİLERİ UYGULA</button>
        </div>
      </motion.div>
    </div>
  );
}

