"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  CalculatorIcon,
  SparklesIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ChartPieIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export default function ReconciliationPage() {
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createPeriod, setCreatePeriod] = useState(new Date().toISOString().slice(0, 7));
  const [createPlatform, setCreatePlatform] = useState("ALL");
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [selectedRec, setSelectedRec] = useState(null);

  const fetchReconciliations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/business/ecommerce/reconciliation", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Mutabakat verileri alınamadı.");
      }
      setReconciliations(Array.isArray(data.reconciliations) ? data.reconciliations : []);
    } catch (e) {
      setReconciliations([]);
      setError(e.message || "Mutabakat verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReconciliations();
  }, [fetchReconciliations]);

  const filteredReconciliations = useMemo(
    () =>
      reconciliations.filter(
        (rec) =>
          String(rec.platform || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(rec.period || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [reconciliations, searchTerm]
  );

  const totalNet = useMemo(
    () => reconciliations.reduce((sum, r) => sum + Number(r.netAmount || 0), 0),
    [reconciliations]
  );
  const totalPaid = useMemo(
    () => reconciliations.reduce((sum, r) => sum + Number(r.paidAmount || 0), 0),
    [reconciliations]
  );
  const totalPending = useMemo(
    () => reconciliations.reduce((sum, r) => sum + Number(r.pendingAmount || 0), 0),
    [reconciliations]
  );

  const platformOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        reconciliations
          .map((item) => String(item.platform || "").trim())
          .filter(Boolean)
      )
    );
    return ["ALL", ...unique];
  }, [reconciliations]);

  const createReconciliation = useCallback(async () => {
    setCreateLoading(true);
    setCreateMessage("");
    try {
      const res = await fetch("/api/business/ecommerce/reconciliation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period: createPeriod,
          platform: createPlatform,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Mutabakat raporu oluşturulamadı.");
      }
      setCreateMessage(data.message || "Mutabakat raporu oluşturuldu.");
      setCreateModalOpen(false);
      await fetchReconciliations();
    } catch (e) {
      setCreateMessage(e.message || "Mutabakat raporu oluşturulamadı.");
    } finally {
      setCreateLoading(false);
    }
  }, [createPeriod, createPlatform, fetchReconciliations]);

  return (
    <div className="space-y-10 pb-24 max-w-[1400px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. PREMIUM RECONCILIATION HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <CalculatorIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <CalculatorIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Mutabakat</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Marketplace Payout Reconciliation</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-8 py-5 bg-white/10 backdrop-blur-xl text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3">
              <SparklesIcon className="w-5 h-5 opacity-70" /> AI DENETÇİ
            </button>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="px-10 py-5 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-3"
            >
              MUTABAKAT OLUŞTUR
            </button>
          </div>
        </div>

        {/* Live Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 mt-14 pt-10 border-t border-white/10 text-left">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <BanknotesIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Toplam Net Tutar</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{totalNet.toLocaleString("tr-TR")} ₺</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <CheckBadgeIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Tahsil Edilen</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{totalPaid.toLocaleString("tr-TR")} ₺</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-amber-300">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Bekleyen Tahsilat</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{totalPending.toLocaleString("tr-TR")} ₺</span>
          </div>
        </div>
      </motion.div>

      {/* 2. SEARCH & FILTERS */}
      <div className="bg-white p-6 md:p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col xl:flex-row items-center justify-between gap-6 mx-2 md:mx-4">
        <div className="w-full xl:w-auto flex-1 min-w-[300px] relative group h-full">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Platform veya dönem ara..."
            className="w-full h-[72px] pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {createMessage ? (
        <div className="mx-2 md:mx-4 rounded-2xl border border-[#004aad]/20 bg-[#004aad]/5 px-5 py-4 text-[#004aad] font-semibold">
          {createMessage}
        </div>
      ) : null}

      {/* 3. RECONCILIATIONS LIST */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-2 md:mx-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 rounded-[4rem] bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="mx-2 md:mx-4 bg-rose-50 border border-rose-200 rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-rose-700 font-semibold">{error}</p>
          <button
            type="button"
            onClick={fetchReconciliations}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold"
          >
            Tekrar Dene
          </button>
        </div>
      ) : filteredReconciliations.length === 0 ? (
        <div className="mx-2 md:mx-4 bg-white p-14 rounded-[4rem] border border-gray-100 text-center text-gray-500 font-semibold">
          Mutabakat kaydı bulunamadı. Arama terimini değiştirmeyi deneyin.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-2 md:mx-4">
          <AnimatePresence mode="popLayout">
            {filteredReconciliations.map((rec, i) => (
              <motion.div
                key={rec.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 border border-gray-100 shadow-inner group-hover:scale-110 transition-transform" />

                <div className="relative z-10 flex flex-col h-full justify-between gap-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 text-[#004aad] shadow-sm">
                        <ChartPieIcon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tighter leading-none">{rec.platform}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{rec.period}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${rec.status === 'RECONCILED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                      {rec.status === 'RECONCILED' ? 'MUTABAKAT OK' : 'BEKLEMEDE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-8 rounded-[3rem] border border-gray-100">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">BRÜT SATIŞ</p>
                        <p className="text-xl font-black text-gray-950">{Number(rec.totalSales || 0).toLocaleString("tr-TR")} ₺</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1 leading-none">KOMİSYON</p>
                        <p className="text-xl font-black text-rose-500">-{Number(rec.totalCommission || 0).toLocaleString("tr-TR")} ₺</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">SİPARİŞ</p>
                        <p className="text-lg font-black text-slate-700">{Number(rec.ordersCount || 0)} Adet</p>
                      </div>
                    </div>
                    <div className="space-y-6 text-right">
                      <div>
                        <p className="text-[9px] font-black text-[#004aad] uppercase tracking-widest mb-1 leading-none">NET KAZANÇ</p>
                        <p className="text-xl font-black text-[#004aad]">{Number(rec.netAmount || 0).toLocaleString("tr-TR")} ₺</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1 leading-none">TAHSİL EDİLEN</p>
                        <p className="text-xl font-black text-emerald-600">{Number(rec.paidAmount || 0).toLocaleString("tr-TR")} ₺</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1 leading-none">BEKLEYEN</p>
                        <p className="text-lg font-black text-amber-600">{Number(rec.pendingAmount || 0).toLocaleString("tr-TR")} ₺</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedRec(rec)}
                    className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-[#004aad] transition-all flex items-center justify-center gap-3"
                  >
                    DETAYLI ANALİZ <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {createModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Mutabakat Oluştur</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Dönem ve platform seç, sistem siparişlerden raporu üretsin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <label className="space-y-2">
                  <span className="text-xs font-bold tracking-wide uppercase text-slate-500">Dönem</span>
                  <input
                    type="month"
                    value={createPeriod}
                    onChange={(e) => setCreatePeriod(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10 focus:border-[#004aad]/30"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold tracking-wide uppercase text-slate-500">Platform</span>
                  <select
                    value={createPlatform}
                    onChange={(e) => setCreatePlatform(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10 focus:border-[#004aad]/30"
                  >
                    {platformOptions.map((item) => (
                      <option key={item} value={item}>
                        {item === "ALL" ? "Tüm Platformlar" : item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Bu işlem yeni sipariş verilerini dönem bazında hesaplar; brüt satış, net tutar, tahsil edilen ve bekleyen kalemleri otomatik üretir.
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="h-11 px-5 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={createReconciliation}
                  disabled={createLoading || !createPeriod}
                  className="h-11 px-5 rounded-xl bg-[#004aad] text-white font-semibold disabled:opacity-60"
                >
                  {createLoading ? "Oluşturuluyor..." : "Mutabakatı Oluştur"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRec ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Mutabakat Detayı</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedRec.platform} - {selectedRec.period}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRec(null)}
                  className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">Brüt Satış</p>
                  <p className="text-2xl font-black mt-1">{Number(selectedRec.totalSales || 0).toLocaleString("tr-TR")} ₺</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">Net Tutar</p>
                  <p className="text-2xl font-black mt-1">{Number(selectedRec.netAmount || 0).toLocaleString("tr-TR")} ₺</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">Tahsil Edilen</p>
                  <p className="text-2xl font-black mt-1 text-emerald-600">{Number(selectedRec.paidAmount || 0).toLocaleString("tr-TR")} ₺</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">Bekleyen</p>
                  <p className="text-2xl font-black mt-1 text-amber-600">{Number(selectedRec.pendingAmount || 0).toLocaleString("tr-TR")} ₺</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Sipariş adedi: <span className="font-bold text-slate-900">{Number(selectedRec.ordersCount || 0)}</span>
                {" · "}
                Durum: <span className="font-bold text-slate-900">{selectedRec.status === "RECONCILED" ? "Mutabakat OK" : "Beklemede"}</span>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

