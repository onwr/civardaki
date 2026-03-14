"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  LinkIcon,
  SparklesIcon,
  PlusIcon,
  ArrowPathIcon,
  RectangleStackIcon,
  ArchiveBoxIcon,
  ShieldCheckIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

const PLATFORM_OPTIONS = ["ALL", "Civardaki", "Trendyol", "Hepsiburada", "N11"];
const STATUS_OPTIONS = ["ALL", "MATCHED", "PENDING", "NOT_LISTED"];

function statusLabel(value) {
  if (value === "MATCHED") return "SİSTEME BAĞLI";
  if (value === "PENDING") return "ONAY BEKLİYOR";
  return "EŞLEŞME YOK";
}

export default function ProductMatchingPage() {
  const [matching, setMatching] = useState([]);
  const [summary, setSummary] = useState({
    coverageRate: 0,
    totalSku: 0,
    pendingSku: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 40,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [platform, setPlatform] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    localProductId: "",
    platform: "Trendyol",
    platformProductId: "",
    platformProductName: "",
    matchStatus: "PENDING",
    notes: "",
  });

  const fetchMatching = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("q", searchTerm);
      if (platform && platform !== "ALL") params.set("platform", platform);
      if (status && status !== "ALL") params.set("status", status);
      params.set("page", String(page));
      params.set("limit", "40");

      const res = await fetch(`/api/business/ecommerce/product-matching?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Ürün eşleştirme verileri alınamadı.");
      }

      setMatching(Array.isArray(data.items) ? data.items : []);
      setSummary({
        coverageRate: Number(data.summary?.coverageRate || 0),
        totalSku: Number(data.summary?.totalSku || 0),
        pendingSku: Number(data.summary?.pendingSku || 0),
      });
      setPagination({
        page: Number(data.pagination?.page || 1),
        limit: Number(data.pagination?.limit || 40),
        total: Number(data.pagination?.total || 0),
        totalPages: Number(data.pagination?.totalPages || 1),
      });
    } catch (e) {
      setMatching([]);
      setSummary({ coverageRate: 0, totalSku: 0, pendingSku: 0 });
      setError(e.message || "Ürün eşleştirme verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [page, platform, searchTerm, status]);

  useEffect(() => {
    const t = setTimeout(fetchMatching, searchTerm ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchMatching, searchTerm]);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/business/products?status=all&limit=200");
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setProducts(Array.isArray(data.items) ? data.items : []);
      }
    } catch {
      setProducts([]);
    }
  }

  function openCreateModal() {
    setEditingItem(null);
    setForm({
      localProductId: products[0]?.id || "",
      platform: "Trendyol",
      platformProductId: "",
      platformProductName: "",
      matchStatus: "PENDING",
      notes: "",
    });
    setModalOpen(true);
    fetchProducts();
  }

  function openEditModal(item) {
    setEditingItem(item);
    setForm({
      localProductId: item.localProductId || "",
      platform: item.platform || "Trendyol",
      platformProductId: item.platformProductId || "",
      platformProductName: item.platformProductName || "",
      matchStatus: item.matchStatus || "PENDING",
      notes: "",
    });
    setModalOpen(true);
    fetchProducts();
  }

  async function runAutoMatch() {
    setSaving(true);
    try {
      const res = await fetch("/api/business/ecommerce/product-matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "AUTO_MATCH" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Otomatik eşleştirme başarısız.");
      }
      toast.success(data.message || "Otomatik eşleştirme tamamlandı.");
      await fetchMatching();
    } catch (e) {
      toast.error(e.message || "Otomatik eşleştirme başarısız.");
    } finally {
      setSaving(false);
    }
  }

  async function submitForm() {
    if (!form.localProductId) {
      toast.error("Yerel ürün seçmelisiniz.");
      return;
    }
    setSaving(true);
    try {
      const targetUrl = editingItem
        ? `/api/business/ecommerce/product-matching/${editingItem.id}`
        : "/api/business/ecommerce/product-matching";
      const method = editingItem ? "PATCH" : "POST";
      const body = {
        localProductId: form.localProductId,
        platform: form.platform,
        platformProductId: form.platformProductId,
        platformProductName: form.platformProductName,
        matchStatus: form.matchStatus,
        notes: form.notes,
      };
      const res = await fetch(targetUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Eşleştirme kaydedilemedi.");
      }
      toast.success(editingItem ? "Eşleştirme güncellendi." : "Eşleştirme oluşturuldu.");
      setModalOpen(false);
      await fetchMatching();
    } catch (e) {
      toast.error(e.message || "Eşleştirme kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMatch(item) {
    setSaving(true);
    try {
      const res = await fetch(`/api/business/ecommerce/product-matching/${item.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Eşleştirme silinemedi.");
      }
      toast.success("Eşleştirme kaldırıldı.");
      await fetchMatching();
    } catch (e) {
      toast.error(e.message || "Eşleştirme silinemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-10 pb-24 max-w-[1400px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. PREMIUM MATCHING HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <LinkIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <LinkIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Ürün Eşleştirme</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Cross-Catalog Mapping Engine</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              disabled={saving}
              onClick={runAutoMatch}
              className="px-8 py-5 bg-white/10 backdrop-blur-xl text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3 disabled:opacity-50"
            >
              <SparklesIcon className="w-5 h-5 opacity-70" /> {saving ? "ÇALIŞIYOR..." : "AI AUTO-MATCH"}
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-10 py-5 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-3"
            >
              <PlusIcon className="w-4 h-4" /> YENİ EŞLEŞTİRME
            </button>
          </div>
        </div>

        {/* Live Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 mt-14 pt-10 border-t border-white/10 text-left">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <ShieldCheckIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Eşleşme Kapsamı</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">%{summary.coverageRate}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200">
              <RectangleStackIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Toplam SKU</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">{summary.totalSku}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-amber-300">
              <ArrowPathIcon className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Bekleyen Eşleşme</p>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">{summary.pendingSku} Adet</span>
          </div>
        </div>
      </motion.div>

      {/* 2. SEARCH & FILTERS */}
      <div className="bg-white p-6 md:p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col xl:flex-row items-center justify-between gap-6 mx-2 md:mx-4">
        <div className="w-full xl:w-auto flex-1 min-w-[300px] relative group h-full">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Yerel veya platform ürün adı ara..."
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
            className="h-[56px] min-w-[170px] px-4 bg-gray-50/50 rounded-2xl border border-gray-200 outline-none font-semibold text-sm"
          >
            {PLATFORM_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item === "ALL" ? "Tüm Platformlar" : item}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="h-[56px] min-w-[170px] px-4 bg-gray-50/50 rounded-2xl border border-gray-200 outline-none font-semibold text-sm"
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item === "ALL" ? "Tüm Durumlar" : statusLabel(item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="mx-2 md:mx-4 bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-700 font-semibold">
          {error}
        </div>
      ) : null}

      {/* 3. MATCHING LIST */}
      <div className="space-y-6 mx-2 md:mx-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-[3rem] bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : matching.length === 0 ? (
          <div className="bg-white p-12 rounded-[3rem] border border-gray-100 text-center text-gray-500 font-semibold">
            Eşleştirme kaydı bulunamadı.
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {matching.map((match, i) => (
            <motion.div
              key={match.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-10 rounded-[4.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all flex flex-col lg:flex-row items-center gap-12 group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

              {/* Local Product */}
              <div className="flex items-center gap-6 lg:w-[35%] shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner group-hover:scale-110 transition-transform">
                  <ArchiveBoxIcon className="w-8 h-8 text-[#004aad]" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">YEREL ÜRÜN</p>
                  <h3 className="text-xl font-black text-gray-950 uppercase tracking-tighter leading-tight">{match.localProductName}</h3>
                </div>
              </div>

              {/* Connector */}
              <div className="hidden lg:flex items-center justify-center flex-1">
                <div className={`w-full h-1 border-t-2 border-dashed ${match.matchStatus === 'MATCHED' ? 'border-emerald-200' : 'border-gray-200'} relative flex items-center justify-center`}>
                  <div className={`p-3 rounded-full border-2 ${match.matchStatus === 'MATCHED' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-400 shadow-inner'}`}>
                    <LinkIcon className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Platform Product */}
              <div className="flex items-center gap-6 lg:w-[35%] lg:text-right flex-row-reverse">
                <div className="w-16 h-16 rounded-2xl bg-[#004aad]/5 flex items-center justify-center border border-[#004aad]/10 shadow-inner group-hover:scale-110 transition-transform shrink-0">
                  <div className="text-[10px] font-black text-[#004aad] uppercase tracking-tighter">{match.platform.charAt(0)}</div>
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-[#004aad] uppercase tracking-widest mb-1.5 leading-none">{match.platform} KATALOĞU</p>
                  <h3 className={`text-xl font-black uppercase tracking-tighter leading-tight truncate ${match.platformProductName ? 'text-gray-950' : 'text-gray-300 italic'}`}>
                    {match.platformProductName || "EŞLEŞTİRİLMEDİ"}
                  </h3>
                  <div className="flex items-center lg:justify-end gap-2 mt-2">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${match.matchStatus === 'MATCHED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      match.matchStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                      {statusLabel(match.matchStatus)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end lg:w-[10%] shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(match)}
                    className="p-4 bg-gray-50 text-gray-500 rounded-2xl hover:bg-[#004aad] hover:text-white transition-all shadow-sm border border-gray-100"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMatch(match)}
                    className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
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

      <AnimatePresence>
        {modalOpen ? (
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
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {editingItem ? "Eşleştirmeyi Düzenle" : "Yeni Eşleştirme"}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Yerel ürün ile platform ürününü bağlayın.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Yerel Ürün</span>
                  <select
                    value={form.localProductId}
                    onChange={(e) => setForm((prev) => ({ ...prev, localProductId: e.target.value }))}
                    disabled={Boolean(editingItem)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10 disabled:bg-slate-50"
                  >
                    <option value="">Ürün seçin</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Platform</span>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm((prev) => ({ ...prev, platform: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                  >
                    {PLATFORM_OPTIONS.filter((x) => x !== "ALL").map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Platform Ürün ID</span>
                  <input
                    value={form.platformProductId}
                    onChange={(e) => setForm((prev) => ({ ...prev, platformProductId: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                    placeholder="TRD-123456"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Platform Ürün Adı</span>
                  <input
                    value={form.platformProductName}
                    onChange={(e) => setForm((prev) => ({ ...prev, platformProductName: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                    placeholder="Platform katalog adı"
                  />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Durum</span>
                  <select
                    value={form.matchStatus}
                    onChange={(e) => setForm((prev) => ({ ...prev, matchStatus: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-[#004aad]/10"
                  >
                    <option value="MATCHED">SİSTEME BAĞLI</option>
                    <option value="PENDING">ONAY BEKLİYOR</option>
                    <option value="NOT_LISTED">EŞLEŞME YOK</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-11 px-5 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={submitForm}
                  disabled={saving}
                  className="h-11 px-5 rounded-xl bg-[#004aad] text-white font-semibold disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor..." : editingItem ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

