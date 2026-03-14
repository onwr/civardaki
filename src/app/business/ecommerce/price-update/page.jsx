"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowPathIcon,
  CurrencyDollarIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ScaleIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

export default function PriceUpdatePage() {
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    totalSku: 0,
    updatableSku: 0,
    averagePrice: 0,
    lastUpdateText: "Henüz güncelleme yok",
    estimatedProfitImpact: 0,
    platformOptions: ["ALL", "Civardaki", "Trendyol", "Hepsiburada", "N11"],
  });
  const [lastResult, setLastResult] = useState(null);
  const [form, setForm] = useState({
    platform: "ALL",
    updateType: "USE_LOCAL",
    value: "",
  });

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/business/ecommerce/price-update/summary", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Fiyat güncelleme özeti alınamadı.");
      }
      setSummary({
        totalSku: Number(data.totalSku || 0),
        updatableSku: Number(data.updatableSku || 0),
        averagePrice: Number(data.averagePrice || 0),
        lastUpdateText: String(data.lastUpdateText || "Henüz güncelleme yok"),
        estimatedProfitImpact: Number(data.estimatedProfitImpact || 0),
        platformOptions: Array.isArray(data.platformOptions) && data.platformOptions.length
          ? data.platformOptions
          : ["ALL", "Civardaki", "Trendyol", "Hepsiburada", "N11"],
      });
    } catch (e) {
      setSummary((prev) => ({ ...prev, platformOptions: prev.platformOptions.length ? prev.platformOptions : ["ALL", "Civardaki", "Trendyol", "Hepsiburada", "N11"] }));
      setError(e.message || "Fiyat güncelleme özeti alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const needsValue = useMemo(
    () => form.updateType === "INCREASE_PERCENT" || form.updateType === "DECREASE_PERCENT" || form.updateType === "ADD_FIXED",
    [form.updateType]
  );

  const handleUpdate = async () => {
    const numericValue = Number(form.value || 0);
    if (needsValue && !Number.isFinite(numericValue)) {
      toast.error("Lütfen geçerli bir değer girin.");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch("/api/business/ecommerce/price-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: form.platform,
          updateType: form.updateType,
          value: needsValue ? numericValue : 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Fiyat güncelleme başarısız.");
      }
      setLastResult(data);
      toast.success(data.message || "Fiyat güncelleme tamamlandı.");
      await fetchSummary();
    } catch (e) {
      toast.error(e.message || "Fiyat güncelleme başarısız.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-10 pb-24 max-w-[1200px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. PREMIUM PRICE UPDATE HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <CurrencyDollarIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <CurrencyDollarIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Fiyat Güncelleme</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Toplu ve Dinamik Fiyat Yönetimi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 mt-14 pt-10 border-t border-white/10 text-left">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <ScaleIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Son Güncelleme</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{summary.lastUpdateText}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <CheckCircleIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Güncellenen Ürün</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{summary.updatableSku} <span className="text-xs">SKU</span></span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <PresentationChartLineIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ortalama Ürün Fiyatı</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">{summary.averagePrice.toLocaleString("tr-TR")} ₺</span>
          </div>
        </div>
      </motion.div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 font-semibold">
          {error}
        </div>
      ) : null}

      {/* 2. CONFIGURATION & ACTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-xl space-y-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
              <AdjustmentsHorizontalIcon className="w-6 h-6 text-[#004aad]" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Güncelleme <span className="text-[#004aad]">Ayarları</span></h3>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Platform Seçimi</label>
              <select
                value={form.platform}
                onChange={(e) => setForm((prev) => ({ ...prev, platform: e.target.value }))}
                className="w-full px-5 py-6 bg-gray-50/50 border-2 border-transparent focus:border-[#004aad]/10 focus:ring-4 focus:ring-[#004aad]/5 rounded-[2rem] outline-none font-black text-lg text-gray-950 appearance-none cursor-pointer italic transition-all"
              >
                {summary.platformOptions.map((item) => (
                  <option key={item} value={item}>
                    {item === "ALL" ? "Tüm Platformlar" : item}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Güncelleme Tipi</label>
              <select
                value={form.updateType}
                onChange={(e) => setForm((prev) => ({ ...prev, updateType: e.target.value }))}
                className="w-full px-5 py-6 bg-gray-50/50 border-2 border-transparent focus:border-[#004aad]/10 focus:ring-4 focus:ring-[#004aad]/5 rounded-[2rem] outline-none font-black text-lg text-gray-950 appearance-none cursor-pointer italic transition-all"
              >
                <option value="USE_LOCAL">Yerel fiyatları kullan</option>
                <option value="INCREASE_PERCENT">Belirli bir oranda artır (%)</option>
                <option value="DECREASE_PERCENT">Belirli bir oranda azalt (%)</option>
                <option value="ADD_FIXED">Sabit tutar ekle/çıkar (₺)</option>
              </select>
            </div>

            {needsValue ? (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Değer</label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                  className="w-full px-5 py-6 bg-gray-50/50 border-2 border-transparent focus:border-[#004aad]/10 focus:ring-4 focus:ring-[#004aad]/5 rounded-[2rem] outline-none font-black text-lg text-gray-950 italic transition-all"
                  placeholder={form.updateType === "ADD_FIXED" ? "Örn: 10 veya -10" : "Örn: 5"}
                />
              </div>
            ) : null}
          </div>

          <button
            onClick={handleUpdate}
            disabled={isUpdating || loading}
            className="w-full py-8 bg-[#004aad] text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-black transition-all shadow-4xl disabled:opacity-50 flex items-center justify-center gap-4 group"
          >
            <ArrowPathIcon className={`w-6 h-6 ${isUpdating ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            {isUpdating ? "GÜNCELLENİYOR..." : "FİYATLARI YAYINLA"}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-950 rounded-[4rem] p-12 text-white relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#004aad]/20 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                <CheckCircleIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">İşlem <span className="text-blue-400">Özeti</span></h3>
            </div>

            <div className="space-y-6">
              {lastResult ? (
                <p className="text-sm font-medium text-gray-300 italic leading-relaxed">
                  {lastResult.message}
                </p>
              ) : (
                <p className="text-sm font-medium text-gray-400 italic leading-relaxed">
                  Toplu fiyat güncellemesini başlattığınızda, bu alanda işlem sonuç özeti gösterilir.
                </p>
              )}
              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">GÜNCELLENEN ÜRÜN</span>
                  <span className="text-xs font-bold text-gray-500">{lastResult?.processedCount ?? summary.updatableSku} SKU</span>
                </div>
                <p className="text-2xl font-black text-white">
                  {lastResult ? `${Number(lastResult.deltaPercent || 0).toLocaleString("tr-TR")} %` : `${summary.estimatedProfitImpact.toLocaleString("tr-TR")} %`}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {lastResult ? `Toplam değişim: ${Number(lastResult.deltaAmount || 0).toLocaleString("tr-TR")} ₺` : "Tahmini etki"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchSummary}
              className="w-full py-6 bg-white text-gray-950 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-400 hover:text-white transition-all"
            >
              ÖZETİ YENİLE
            </button>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
