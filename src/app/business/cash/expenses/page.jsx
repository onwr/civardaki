"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  ArrowTrendingDownIcon,
  WalletIcon,
  TagIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/business/cash?type=EXPENSE&limit=100");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const list = (data.transactions || []).map((t) => ({
        id: t.id,
        category: t.category || "Diğer",
        amount: t.amount,
        description: t.description || "—",
        date: t.date,
        accountId: t.accountId,
        accountName: t.account?.name || "—",
      }));
      setExpenses(list);
    } catch (e) {
      console.error(e);
      toast.error("Masraflar yüklenirken hata oluştu.");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(
    (exp) =>
      (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (exp.category && exp.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (exp.accountName && exp.accountName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const highestExpense = expenses.length ? Math.max(...expenses.map((e) => e.amount)) : 0;
  const avgExpense = expenses.length ? totalExpenses / expenses.length : 0;

  return (
    <div className="space-y-10 pb-24 max-w-[1400px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. HERO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <BanknotesIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <BanknotesIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Masraflar</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Expense Tracking & Cash Burn Analysis</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-8 py-5 bg-white/10 backdrop-blur-xl text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3">
              <SparklesIcon className="w-5 h-5 opacity-70" /> TASARRUF AI
            </button>
            <Link
              href="/business/cash"
              className="px-10 py-5 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-3"
            >
              <PlusIcon className="w-5 h-5" /> YENİ MASRAF EKLE
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 mt-14 pt-10 border-t border-white/10 text-left">
          <div>
            <div className="flex items-center gap-2 mb-2 text-rose-300">
              <ArrowTrendingDownIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Toplam Masraf</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">
              {totalExpenses.toLocaleString("tr-TR")} ₺
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <CalendarDaysIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">En Yüksek Harcama</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">
              {highestExpense.toLocaleString("tr-TR")} ₺
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <TagIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ortalama Harcama</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">
              {Math.round(avgExpense).toLocaleString("tr-TR")} ₺
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. SEARCH */}
      <div className="bg-white p-6 md:p-8 rounded-[3.5rem] border border-gray-100 shadow-xl flex flex-col xl:flex-row items-center justify-between gap-6 mx-2 md:mx-4">
        <div className="w-full xl:w-auto flex-1 min-w-[300px] relative group h-full">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Açıklama, kategori veya hesap adı ara..."
            className="w-full h-[72px] pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. LIST */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-[#004aad] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6 mx-2 md:mx-4">
          <AnimatePresence mode="popLayout">
            {filteredExpenses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-16 rounded-[3rem] border border-gray-100 text-center space-y-4"
              >
                <ArrowTrendingDownIcon className="w-12 h-12 text-gray-200 mx-auto" />
                <p className="text-sm font-bold text-gray-500">Henüz masraf kaydı yok</p>
                <Link
                  href="/business/cash"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#004aad] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-800"
                >
                  <PlusIcon className="w-5 h-5" /> İlk masrafı ekle
                </Link>
              </motion.div>
            ) : (
              filteredExpenses.map((expense) => (
                <motion.div
                  key={expense.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all flex flex-col lg:flex-row items-center gap-8 group"
                >
                  <div className="flex items-center gap-6 lg:w-[35%] shrink-0">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform bg-rose-50 text-rose-600">
                      <ArrowTrendingDownIcon className="w-8 h-8" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 mb-2 inline-block">
                        {expense.category}
                      </span>
                      <h3 className="text-2xl font-black text-gray-950 truncate group-hover:text-[#004aad] transition-colors leading-none uppercase">
                        {expense.description}
                      </h3>
                      <div className="flex items-center gap-2 mt-2.5">
                        <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {new Date(expense.date).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 px-8 lg:border-x border-gray-100">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Ödeme Kaynağı</p>
                        <div className="flex items-center gap-2">
                          <WalletIcon className="w-4 h-4 text-[#004aad]" />
                          <p className="text-xl font-black text-gray-950 leading-none uppercase tracking-tighter">{expense.accountName}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end justify-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">İşlem Tipi</p>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                          <CreditCardIcon className="w-4 h-4 text-emerald-600" />
                          <span className="text-[10px] font-black text-emerald-700 uppercase">HESAPTAN ÖDEME</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-10 lg:w-[25%] justify-end shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5">Tutar</p>
                      <p className="text-3xl font-black text-rose-600 tracking-tighter leading-none">
                        -{expense.amount.toLocaleString("tr-TR")} ₺
                      </p>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-gray-300" />
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
