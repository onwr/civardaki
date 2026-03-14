"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BanknotesIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowsRightLeftIcon,
  SparklesIcon,
  LightBulbIcon,
  ChartBarIcon,
  WalletIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  TagIcon,
  BuildingLibraryIcon,
  ReceiptPercentIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import Image from "next/image";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const defaultChartData = [
  { name: "Pzt", income: 0, expense: 0 },
  { name: "Sal", income: 0, expense: 0 },
  { name: "Çar", income: 0, expense: 0 },
  { name: "Per", income: 0, expense: 0 },
  { name: "Cum", income: 0, expense: 0 },
  { name: "Cmt", income: 0, expense: 0 },
  { name: "Paz", income: 0, expense: 0 },
];

export default function CashManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState(defaultChartData);
  const [stats, setStats] = useState({
    netLiquidity: 0,
    monthlyNetFlow: 0,
    expectedPayments: 0,
    expectedCollections: 0,
    incomeTrend: "+0%",
    expenseTrend: "-0%"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/business/cash");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAccounts(data.accounts || []);
      setTransactions(data.transactions || []);
      if (data.stats) setStats(data.stats);
      setChartData(Array.isArray(data.chartData) && data.chartData.length ? data.chartData : defaultChartData);
    } catch (error) {
      console.error(error);
      toast.error("Veriler yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (!data.accountId || !data.amount) {
      toast.error("Lütfen hesap ve tutar giriniz.");
      return;
    }

    try {
      const res = await fetch("/api/business/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          type: activeTransactionType, // We need to track this in state
          amount: parseFloat(data.amount)
        })
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      toast.success("İşlem başarıyla kaydedildi.");
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("İşlem sırasında hata oluştu.");
    }
  };

  const [activeTransactionType, setActiveTransactionType] = useState("INCOME");

  const totalAssets = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-[#004aad] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-4 md:px-8">

      {/* 1. PREMIUM FINANCE HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-8 bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl shadow-blue-900/20 group"
        >
          <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl group-hover:scale-110 transition-transform duration-1000">
            <WalletIcon className="w-96 h-96" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-200">Financial Intelligence Hub</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Nakit <br /><span className="text-blue-100/50">Yönetimi</span></h1>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-8 py-5 bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-3"
                >
                  <ArrowsRightLeftIcon className="w-5 h-5 text-blue-200" /> TRANSFER
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-10 py-5 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-3"
                >
                  <PlusIcon className="w-5 h-5" /> YENİ İŞLEM
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pt-10 border-t border-white/10">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Net Likidite</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black tracking-tighter">{stats.netLiquidity.toLocaleString()}₺</span>
                  <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-400 mb-2" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Aylık Net Akış</p>
                <p className={`text-3xl font-black tracking-tighter ${stats.monthlyNetFlow >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {stats.monthlyNetFlow >= 0 ? '+' : ''}{(stats.monthlyNetFlow / 1000).toFixed(1)}k₺
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Gelecek Ödemeler</p>
                <p className="text-3xl font-black text-amber-300 tracking-tighter">{stats.expectedPayments.toLocaleString()}₺</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Beklenen Tahsilat</p>
                <p className="text-3xl font-black text-blue-100 tracking-tighter">{stats.expectedCollections.toLocaleString()}₺</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 bg-white rounded-[4rem] p-12 border border-gray-100 shadow-2xl relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <SparklesIcon className="w-48 h-48 text-[#004aad]" />
          </div>
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-blue-50 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
                <SparklesIcon className="w-8 h-8 text-[#004aad]" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">AI Finansal<br /><span className="text-[#004aad]">Asistan</span></h3>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 leading-relaxed italic pr-4">
              "Kasa ve banka bakiyeleriniz son 30 günde <span className="text-[#004aad] font-black underline underline-offset-4 decoration-blue-200">%15 arttı.</span> Atıl nakti düşük riskli repo veya para piyasası fonlarında değerlendirerek ek kazanç sağlayabilirsiniz."
            </p>
          </div>
          <button className="w-full mt-10 py-6 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-[2.5rem] hover:bg-[#004aad] transition-all flex items-center justify-center gap-3 shadow-xl">
            DAHA FAZLA ANALİZ <ChevronRightIcon className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* 2. ANALYTICS & ACCOUNTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        {/* Left Sidebar: Detailed Account Stack */}
        <div className="lg:col-span-4 space-y-8 sticky top-32">
          <div className="flex items-center justify-between px-6">
            <div>
              <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tighter">Varlıklar</h3>
              <p className="text-[9px] font-black text-[#004aad] uppercase tracking-widest leading-none mt-1">Asset Allocation</p>
            </div>
            <button className="p-4 bg-gray-50 rounded-2xl hover:bg-[#004aad] hover:text-white transition-all border border-gray-100 shadow-sm">
              <AdjustmentsHorizontalIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {accounts.length === 0 ? (
              <div className="bg-gray-50 rounded-[3rem] p-12 border-2 border-dashed border-gray-200 text-center space-y-4">
                <BuildingLibraryIcon className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hesap Bulunamadı</p>
                <button className="text-[10px] font-black text-[#004aad] uppercase underline">Hemen Hesap Tanımla</button>
              </div>
            ) : accounts.map((account, i) => (
              <motion.div
                key={account.id}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-xl hover:shadow-[#004aad]/10 transition-all group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#004aad]/5 transition-colors" />

                <div className="flex items-start justify-between mb-10 relative z-10">
                  <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-6
                         ${account.type === 'CASH' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-500/10' :
                      account.type === 'BANK' ? 'bg-blue-50 text-[#004aad] shadow-blue-500/10' : 'bg-purple-50 text-purple-600 shadow-purple-500/10'}`}>
                    {account.type === 'CASH' ? <BanknotesIcon className="w-8 h-8" /> :
                      account.type === 'BANK' ? <BuildingLibraryIcon className="w-8 h-8" /> : <CreditCardIcon className="w-8 h-8" />}
                  </div>
                  <div className="text-right">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100`}>
                      AKTİF
                    </span>
                    <h4 className="text-xl font-black text-gray-950 mt-3 uppercase leading-none">{account.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest italic">{account.type}</p>
                  </div>
                </div>

                <div className="flex items-end justify-between relative z-10 pt-2 border-t border-gray-50">
                  <div>
                    <p className="text-4xl font-black text-gray-950 tracking-tighter">{account.balance.toLocaleString()}₺</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-3 flex items-center gap-2 uppercase tracking-wide">
                      <ClockIcon className="w-3.5 h-3.5" /> Güncel Bakiye
                    </p>
                  </div>
                  <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-[#004aad] hover:text-white transition-all shadow-sm border border-gray-100">
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions / Tax Widget */}
          <div className="bg-gradient-to-br from-gray-950 to-gray-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
              <ReceiptPercentIcon className="w-48 h-48 rotate-12 text-blue-500" />
            </div>
            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Vergi & Komisyon</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Ay Sonu Vergi Tahmini</p>
                <p className="text-3xl font-black uppercase tracking-tighter leading-none text-white">-4.875,00₺ <span className="text-rose-500 text-sm">Stopaj</span></p>
              </div>
              <button className="w-full py-6 bg-white text-gray-950 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-[#00ffcc] transition-all shadow-xl shadow-black/20">DETAYLI RAPORU GÖR</button>
            </div>
          </div>
        </div>

        {/* Right Content: Flow Chart & Stream */}
        <div className="lg:col-span-8 space-y-12">

          {/* Visual Cash Flow Chart */}
          <div className="bg-white rounded-[4rem] border border-gray-100 shadow-2xl p-10 md:p-14 space-y-10 group/chart">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tighter italic">Nakit <span className="text-[#004aad]">Döngüsü</span></h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Weekly Cash Flow Analysis</p>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GELİR</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GİDER</span>
                </div>
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                  <YAxis hide={true} />
                  <Tooltip
                    contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '1.5rem' }}
                    itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#incomeGradient)" />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={5} fillOpacity={1} fill="url(#expenseGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction Stream */}
          <div className="space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-[3.5rem] border border-gray-100 shadow-xl flex flex-col xl:flex-row items-center justify-between gap-6">
              <div className="w-full xl:w-auto flex-1 relative group h-full">
                <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
                <input
                  type="text"
                  placeholder="Açıklama, kategori veya hesap ara..."
                  className="w-full h-[72px] pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center p-2 bg-gray-50 rounded-[2.5rem] shrink-0">
                {['overview', 'all'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#004aad] text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {tab === 'overview' ? 'ÖZET' : 'TÜMÜ'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {transactions.length === 0 ? (
                <div className="bg-white p-16 rounded-[3rem] border border-gray-100 text-center space-y-4">
                  <ArrowsRightLeftIcon className="w-12 h-12 text-gray-200 mx-auto" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Henüz bir finansal hareket yok</p>
                </div>
              ) : transactions.filter(tr =>
                tr.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tr.category?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((tr, i) => (
                <motion.div
                  key={tr.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex flex-col lg:flex-row items-center justify-between p-8 bg-white hover:bg-gray-50/50 rounded-[3rem] border border-gray-100 hover:border-[#004aad]/10 shadow-sm hover:shadow-2xl transition-all gap-8 cursor-pointer relative overflow-hidden"
                >
                  <div className="flex items-center gap-8 flex-1">
                    <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center shrink-0 shadow-2xl transition-all group-hover:scale-110
                             ${tr.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' :
                        tr.type === 'EXPENSE' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-[#004aad]'}`}>
                      {tr.type === 'INCOME' ? <ArrowUpIcon className="w-8 h-8 stroke-[3]" /> :
                        tr.type === 'EXPENSE' ? <ArrowDownIcon className="w-8 h-8 stroke-[3]" /> : <ArrowsRightLeftIcon className="w-8 h-8 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${tr.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : tr.type === 'EXPENSE' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-[#004aad]'}`}>
                          {tr.category}
                        </span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          {tr.account?.name} {tr.toAccount ? `→ ${tr.toAccount.name}` : ''}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-gray-950 italic group-hover:text-[#004aad] transition-colors leading-none uppercase">{tr.description}</h4>
                      <p className="text-[10px] font-bold text-gray-400 mt-3 flex items-center gap-2 uppercase tracking-wide">
                        <ClockIcon className="w-3.5 h-3.5" /> {new Date(tr.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-10 text-right min-w-[240px]">
                    <div>
                      <p className={`text-4xl font-black italic tracking-tighter ${tr.type === 'INCOME' ? 'text-emerald-500' : tr.type === 'EXPENSE' ? 'text-rose-500' : 'text-[#004aad]'}`}>
                        {tr.type === 'EXPENSE' && '-'}{tr.amount.toLocaleString()}₺
                      </p>
                    </div>
                    <button className="p-5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-[#004aad] hover:text-white transition-all shadow-xl group-hover:translate-x-1">
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="w-full py-8 bg-gray-950 text-white rounded-[3.5rem] font-black text-[11px] uppercase tracking-[0.6em] hover:bg-[#004aad] transition-all shadow-4xl text-center group">
              FİNANSAL DÖKÜMÜN TAMAMINI GÜNCELLE <ArrowRightIcon className="w-5 h-5 inline-block ml-4 group-hover:translate-x-3 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. MODAL (Calendar Hub Style) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[5rem] p-10 md:p-14 shadow-3xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#004aad]/5 rounded-full blur-3xl -mr-32 -mt-32" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/10">
                      <BanknotesIcon className="w-8 h-8 text-[#004aad]" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-gray-950 uppercase italic">İşlem Kaydı</h2>
                      <p className="text-gray-400 font-medium italic">Kasa giriş-çıkış hareketini kaydet.</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-4 bg-gray-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all shadow-sm">
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>

                <form onSubmit={handleTransactionSubmit} className="space-y-8">
                  <div className="flex p-2 bg-gray-100 rounded-[2.5rem] gap-2">
                    {['INCOME', 'EXPENSE', 'TRANSFER'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setActiveTransactionType(type)}
                        className={`flex-1 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all
                                 ${activeTransactionType === type ? 'bg-white text-[#004aad] shadow-2xl' : 'text-gray-400 hover:bg-white/50'}`}>
                        {type === 'INCOME' ? 'GELİR' : type === 'EXPENSE' ? 'GİDER' : 'TRANSFER'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Tutar</label>
                      <div className="relative">
                        <CurrencyDollarIcon className={`absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 ${activeTransactionType === 'INCOME' ? 'text-emerald-500' : activeTransactionType === 'EXPENSE' ? 'text-rose-500' : 'text-blue-500'}`} />
                        <input type="number" step="0.01" name="amount" required placeholder="0.00" className={`w-full pl-20 pr-8 py-8 bg-gray-50 rounded-[2.5rem] border-none outline-none font-black text-3xl italic ${activeTransactionType === 'INCOME' ? 'text-emerald-600' : activeTransactionType === 'EXPENSE' ? 'text-rose-600' : 'text-blue-600'}`} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">{activeTransactionType === 'TRANSFER' ? 'Kaynak Hesap' : 'Hesap / Kasa'}</label>
                      <div className="relative">
                        <BuildingLibraryIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-blue-500" />
                        <select name="accountId" required className="w-full pl-20 pr-8 py-8 bg-gray-50 rounded-[2.5rem] border-none outline-none font-black text-xl italic appearance-none cursor-pointer">
                          <option value="">Seçiniz...</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name} ({acc.balance.toLocaleString()}₺)</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {activeTransactionType === 'TRANSFER' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Hedef Hesap</label>
                      <div className="relative">
                        <BuildingLibraryIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-emerald-500" />
                        <select name="toAccountId" required className="w-full pl-20 pr-8 py-8 bg-gray-50 rounded-[2.5rem] border-none outline-none font-black text-xl italic appearance-none cursor-pointer">
                          <option value="">Seçiniz...</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Kategori</label>
                      <input type="text" name="category" placeholder="Örn: Satış, Kira, Tedarik" className="w-full p-8 bg-gray-50 rounded-[2.5rem] border-none outline-none font-black text-xl italic" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Açıklama</label>
                      <input type="text" name="description" placeholder="İşlem detayı..." className="w-full p-8 bg-gray-50 rounded-[2.5rem] border-none outline-none font-black text-xl italic" />
                    </div>
                  </div>

                  <div className="pt-10 flex gap-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-7 bg-gray-100 text-gray-400 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-all">İPTAL</button>
                    <button type="submit" className="flex-[2] py-7 bg-gray-950 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-4xl hover:bg-[#004aad] transition-all">KAYDI TAMAMLA</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
