"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Send,
  Search,
  ChevronDown,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  RefreshCcw,
  Trash2,
} from "lucide-react";

const LEAD_STATUS_META = {
  NEW: { label: "Yeni", className: "text-indigo-700 bg-indigo-50", icon: Clock },
  CONTACTED: { label: "İletişime Geçildi", className: "text-amber-700 bg-amber-50", icon: CheckCircle2 },
  QUOTED: { label: "Teklif Verildi", className: "text-violet-700 bg-violet-50", icon: CheckCircle2 },
  REPLIED: { label: "Yanıtlandı", className: "text-cyan-700 bg-cyan-50", icon: CheckCircle2 },
  CLOSED: { label: "Tamamlandı", className: "text-emerald-700 bg-emerald-50", icon: CheckCircle2 },
  LOST: { label: "Kapanan Talep", className: "text-rose-700 bg-rose-50", icon: AlertCircle },
};

function formatDate(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RequestsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    categoryId: "",
    message: "",
    cityId: "",
    districtId: "",
    city: "",
    district: "",
    phone: "",
    email: "",
  });

  const fetchRequests = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/user/requests", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Talepler alınamadı.");
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (e) {
      toast.error(e.message || "Talepler alınamadı.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories/flat", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Kategoriler alınamadı.");
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (e) {
      toast.error(e.message || "Kategori listesi alınamadı.");
    }
  };

  const fetchCities = async () => {
    try {
      const res = await fetch("/api/locations/cities", { cache: "no-store" });
      const data = await res.json().catch(() => []);
      setCities(Array.isArray(data) ? data : []);
    } catch {
      setCities([]);
    }
  };

  const fetchDistricts = async (cityId) => {
    if (!cityId) {
      setDistricts([]);
      return;
    }
    try {
      const res = await fetch(`/api/locations/districts?sehir_id=${encodeURIComponent(cityId)}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => []);
      setDistricts(Array.isArray(data) ? data : []);
    } catch {
      setDistricts([]);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchCategories();
    fetchCities();
  }, []);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      email: session?.user?.email || prev.email,
      phone: session?.user?.phone || prev.phone,
    }));
  }, [session?.user?.email, session?.user?.phone]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === form.categoryId) || null,
    [categories, form.categoryId],
  );

  const categoryOptions = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => {
      const name = String(c.name || "").toLowerCase();
      const path = String(c.path || "").toLowerCase();
      const slug = String(c.slug || "").toLowerCase();
      return name.includes(q) || path.includes(q) || slug.includes(q);
    });
  }, [categories, categoryQuery]);

  const filteredRequests = useMemo(() => {
    if (filter === "all") return requests;
    if (filter === "new") return requests.filter((r) => r.status === "NEW");
    if (filter === "open") {
      return requests.filter((r) => ["NEW", "CONTACTED", "QUOTED", "REPLIED"].includes(r.status));
    }
    if (filter === "closed") return requests.filter((r) => ["CLOSED", "LOST"].includes(r.status));
    return requests;
  }, [requests, filter]);

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      toast.error("Lütfen bir kategori seçin.");
      return;
    }
    if (!form.city.trim()) {
      toast.error("Şehir alanı zorunludur.");
      return;
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      toast.error("Talep açıklaması en az 10 karakter olmalıdır.");
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      toast.error("Telefon veya e-posta zorunludur.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: session?.user?.name || "Kullanıcı",
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        message: form.message.trim(),
        category: selectedCategory.slug || selectedCategory.name,
        categoryId: selectedCategory.id,
        categorySlug: selectedCategory.slug,
        source: "CATEGORY_PAGE",
        isDistributed: true,
        city: form.city.trim(),
        district: form.district.trim() || null,
        _honeypot: "",
      };
      const res = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Talep gönderilemedi.");

      const sentCount = Array.isArray(data.leads) ? data.leads.length : 0;
      toast.success("Talebiniz yayınlandı.", {
        description: `${sentCount} uygun işletmeye iletildi.`,
      });

      setShowCreate(false);
      setCategoryQuery("");
      setCategoryOpen(false);
      setDistricts([]);
      setForm((prev) => ({
        ...prev,
        categoryId: "",
        message: "",
        district: "",
        city: "",
        cityId: "",
        districtId: "",
      }));
      fetchRequests(true);
    } catch (e) {
      toast.error(e.message || "Talep gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!requestId || deletingId) return;
    const confirmed = window.confirm("Bu talebi kalici olarak silmek istediginize emin misiniz?");
    if (!confirmed) return;

    setDeletingId(requestId);
    try {
      const res = await fetch(`/api/user/requests/${requestId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Talep silinemedi.");

      setRequests((prev) => prev.filter((item) => item.id !== requestId));
      toast.success("Talep silindi.");
    } catch (e) {
      toast.error(e.message || "Talep silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[45vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#004aad] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <section className="bg-slate-950 text-white rounded-3xl p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-300 font-black">Hizmet Talepleri</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-black italic tracking-tight">TALEPLERİM</h1>
            <p className="mt-3 text-slate-300 font-semibold">
              Geniş kategori havuzundan talep açın, uygun işletmelerle hızlıca eşleşin.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchRequests(true)}
              className="px-4 py-3 rounded-xl border border-white/20 text-white font-semibold inline-flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" /> Yenile
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="px-5 py-3 rounded-xl bg-[#004aad] hover:bg-blue-700 font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Yeni Talep
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "Tümü" },
          { id: "new", label: "Yeni" },
          { id: "open", label: "Açık Süreç" },
          { id: "closed", label: "Kapananlar" },
        ].map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => setFilter(btn.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold ${
              filter === btn.id ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredRequests.map((item) => {
            const status = LEAD_STATUS_META[item.status] || {
              label: item.status || "Bilinmiyor",
              className: "text-slate-700 bg-slate-100",
              icon: AlertCircle,
            };
            const StatusIcon = status.icon;
            return (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="bg-white border border-slate-100 rounded-2xl p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${status.className}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{formatDate(item.createdAt)}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900">{item.category || "Genel Talep"}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{item.message}</p>
                    <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.district ? `${item.district}, ${item.city || ""}` : item.city || "Şehir belirtilmedi"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.business?.slug ? (
                      <Link
                        href={`/isletme/${item.business.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-bold text-[#004aad]"
                      >
                        {item.business.name || "İşletmeye Git"} <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">Eşleşme bekleniyor</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(item.id)}
                      disabled={deletingId === item.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingId === item.id ? "Siliniyor..." : "Sil"}
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>

        {filteredRequests.length === 0 && (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <p className="font-semibold text-slate-600">Bu filtrede talep bulunmuyor.</p>
          </div>
        )}
      </section>

      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
              className="absolute inset-0 bg-slate-950/60"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl p-6"
            >
              <h2 className="text-2xl font-black text-slate-900">Yeni Talep Oluştur</h2>
              <p className="mt-1 text-sm text-slate-500 font-medium">
                Talebiniz aynı şehir ve kategori eşleşmesine göre uygun işletmelere gönderilir.
              </p>

              <form onSubmit={submitRequest} className="mt-5 space-y-3">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kategori Seç</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={categoryQuery}
                      onFocus={() => setCategoryOpen(true)}
                      onChange={(e) => {
                        setCategoryQuery(e.target.value);
                        setCategoryOpen(true);
                      }}
                      placeholder="Kategori seçin veya arayın..."
                      className="w-full h-11 pl-9 pr-10 rounded-xl border border-slate-200"
                    />
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  {categoryOpen && (
                    <div className="absolute left-0 right-0 z-20 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-auto">
                      {categoryOptions.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-slate-500">Sonuç bulunamadı.</p>
                      ) : (
                        categoryOptions.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setForm((p) => ({ ...p, categoryId: c.id }));
                              setCategoryQuery(c.path || c.name || "");
                              setCategoryOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${
                              form.categoryId === c.id ? "bg-blue-50 text-[#004aad] font-semibold" : "text-slate-700"
                            }`}
                          >
                            {c.path || c.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={form.cityId}
                    onChange={(e) => {
                      const cityId = e.target.value;
                      const cityObj = cities.find((c) => String(c.sehir_id) === String(cityId));
                      setForm((p) => ({
                        ...p,
                        cityId,
                        city: cityObj?.sehir_adi || "",
                        districtId: "",
                        district: "",
                      }));
                      fetchDistricts(cityId);
                    }}
                    className="h-11 px-3 rounded-xl border border-slate-200"
                  >
                    <option value="">Şehir seçin *</option>
                    {cities.map((city) => (
                      <option key={city.sehir_id} value={city.sehir_id}>
                        {city.sehir_adi}
                      </option>
                    ))}
                  </select>
                  <select
                    value={form.districtId}
                    onChange={(e) => {
                      const districtId = e.target.value;
                      const districtObj = districts.find((d) => String(d.ilce_id) === String(districtId));
                      setForm((p) => ({
                        ...p,
                        districtId,
                        district: districtObj?.ilce_adi || "",
                      }));
                    }}
                    disabled={!form.cityId}
                    className="h-11 px-3 rounded-xl border border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">{form.cityId ? "İlçe seçin" : "Önce şehir seçin"}</option>
                    {districts.map((district) => (
                      <option key={district.ilce_id} value={district.ilce_id}>
                        {district.ilce_adi}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Telefon"
                    className="h-11 px-3 rounded-xl border border-slate-200"
                  />
                  <input
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="E-posta"
                    className="h-11 px-3 rounded-xl border border-slate-200"
                  />
                </div>

                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Talebinizi detaylı yazın (en az 10 karakter)..."
                  className="w-full p-3 rounded-xl border border-slate-200"
                />

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg bg-[#004aad] text-white font-semibold disabled:opacity-60 inline-flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Gönderiliyor..." : "Talebi Yayınla"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
