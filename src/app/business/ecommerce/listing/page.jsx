"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  RectangleGroupIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  TagIcon,
  GlobeAltIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function ListingPage() {
  const [listings, setListings] = useState([]);
  const [summary, setSummary] = useState({ activeListings: 0, totalListings: 0, syncStatus: "Civardaki" });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("ALL");
  const [platform, setPlatform] = useState("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("q", searchTerm);
      if (status !== "ALL") params.set("status", status);
      if (platform !== "ALL") params.set("platform", platform);
      params.set("page", String(page));
      params.set("limit", "20");
      const res = await fetch(`/api/business/ecommerce/listings?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setListings(data.listings ?? []);
        setSummary(data.summary ?? {});
        setPagination(data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 });
      } else {
        setListings([]);
        setSummary({ activeListings: 0, totalListings: 0, syncStatus: "Pasif" });
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 });
        setError(data.error || "Listeleme verileri alınamadı.");
      }
    } catch {
      setListings([]);
      setSummary({ activeListings: 0, totalListings: 0, syncStatus: "Pasif" });
      setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 });
      setError("Listeleme verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [page, platform, searchTerm, status]);

  useEffect(() => {
    const t = setTimeout(() => fetchListings(), searchTerm ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchListings, searchTerm, status, platform, page]);

  return (
    <div className="space-y-10 pb-24 max-w-[1400px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. PREMIUM LISTING HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <RectangleGroupIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <RectangleGroupIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Listeleme</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Cross-Platform Inventory Sync</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/business/ecommerce/statistics" className="px-8 py-5 bg-white/10 backdrop-blur-xl text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3">
              <SparklesIcon className="w-5 h-5 opacity-70" /> AI İÇERİK OLUŞTUR
            </Link>
            <Link href="/business/products" className="px-10 py-5 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-3">
              <CloudArrowUpIcon className="w-5 h-5" /> YENİ ÜRÜN EKLE
            </Link>
          </div>
        </div>

        {/* Live Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 mt-14 pt-10 border-t border-white/10 text-left">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <ShieldCheckIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Aktif Listeleme</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">{summary.activeListings ?? 0}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-amber-300">
              <ArrowPathIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Senkronizasyon Durumu</p>
            </div>
            <span className="text-4xl font-black text-blue-100 tracking-tighter uppercase leading-none">{String(summary.syncStatus || "Civardaki").toUpperCase()}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <GlobeAltIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Toplam Ürün</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">{summary.totalListings ?? 0}</span>
          </div>
        </div>
      </motion.div>

      {/* 2. SEARCH & FILTERS */}
      <div className="bg-white p-6 md:p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col xl:flex-row items-center justify-between gap-6 mx-2 md:mx-4">
        <div className="w-full xl:w-auto flex-1 min-w-[300px] relative group h-full">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Ürün adı veya platform ara..."
            className="w-full h-[72px] pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full xl:w-auto flex items-center gap-3">
          <select
            value={platform}
            onChange={(e) => {
              setPage(1);
              setPlatform(e.target.value);
            }}
            className="h-[56px] min-w-[160px] px-4 bg-gray-50/50 rounded-2xl border border-gray-200 outline-none text-sm font-semibold"
          >
            <option value="ALL">Tüm Platformlar</option>
            <option value="Civardaki">Civardaki</option>
            <option value="Trendyol">Trendyol</option>
            <option value="Hepsiburada">Hepsiburada</option>
            <option value="N11">N11</option>
          </select>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="h-[56px] min-w-[160px] px-4 bg-gray-50/50 rounded-2xl border border-gray-200 outline-none text-sm font-semibold"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="ACTIVE">Aktif</option>
            <option value="PENDING">Beklemede</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="mx-2 md:mx-4 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 font-semibold">
          {error}
        </div>
      ) : null}

      {/* 3. LISTINGS GRID */}
      <div className="space-y-6 mx-2 md:mx-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-[3rem] bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white p-14 rounded-[3rem] border border-gray-100 text-center text-gray-500 font-semibold">
            Ürün bulunamadı. <Link href="/business/products" className="text-[#004aad] underline">Ürün ekle</Link> sayfasından yeni ürün ekleyebilirsiniz.
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {listings.map((listing, i) => (
              <motion.div
                key={listing.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all flex flex-col lg:flex-row items-center gap-8 group"
              >
                <div className="flex items-center gap-6 lg:w-[35%] shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                    {listing.imageUrl ? (
                      <img src={listing.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <TagIcon className="w-8 h-8 text-[#004aad]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-black uppercase text-[#004aad] tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                        {listing.platform}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                        listing.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {listing.status === "ACTIVE" ? "AKTİF" : "BEKLEMEDE"}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-950 truncate group-hover:text-[#004aad] transition-colors leading-none uppercase">{listing.productName}</h3>
                  </div>
                </div>

                <div className="flex-1 min-w-0 px-8 lg:border-x border-gray-100">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">LİSTELEME FİYATI</p>
                      <p className="text-xl font-black text-gray-950 leading-none">{Number(listing.price).toLocaleString("tr-TR")} ₺</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">TALEP / SATIŞ</p>
                      <p className="text-xl font-black text-[#004aad] leading-none">{listing.sales ?? 0} ADET</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10 lg:w-[20%] justify-end shrink-0">
                  <Link href={`/business/products`} className="p-5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-[#004aad] hover:text-white transition-all shadow-sm border border-gray-100">
                    <ChevronRightIcon className="w-6 h-6" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {pagination.totalPages > 1 ? (
        <div className="mx-2 md:mx-4 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-50"
          >
            Geri
          </button>
          <span className="text-sm font-semibold text-gray-500 px-3">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-50"
          >
            İleri
          </button>
        </div>
      ) : null}
    </div>
  );
}

