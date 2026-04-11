"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatTurkishMobileDisplay, digitsTurkishMobile } from "@/lib/phone-format";
import {
  Plus,
  Send,
  Search,
  MapPin,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  RefreshCw,
  Trash2,
  X,
  Sparkles,
  LayoutList,
  Briefcase,
  ChevronDown,
  Mail,
  Phone,
  Building2,
} from "lucide-react";

const LEAD_STATUS_META = {
  NEW: {
    label: "Yeni",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock3,
  },
  CONTACTED: {
    label: "İletişime Geçildi",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: CheckCircle2,
  },
  QUOTED: {
    label: "Teklif Verildi",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    icon: CheckCircle2,
  },
  REPLIED: {
    label: "Yanıtlandı",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Tamamlandı",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  LOST: {
    label: "Kapanan Talep",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    icon: AlertCircle,
  },
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

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

function getCurrentPositionOptional(timeoutMs = 8000) {
  if (typeof window === "undefined" || !navigator?.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: false,
        maximumAge: 5 * 60 * 1000,
        timeout: timeoutMs,
      }
    );
  });
}

function useOutsideClick(ref, handler) {
  useEffect(() => {
    function listener(event) {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler();
    }

    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

function SearchableDropdown({
  label,
  placeholder,
  value,
  displayValue,
  options,
  onSelect,
  searchValue,
  onSearchChange,
  disabled = false,
  emptyText = "Sonuç bulunamadı.",
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useOutsideClick(wrapperRef, () => setOpen(false));

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-left transition",
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
        )}
      >
        <span className={cn("truncate text-sm font-medium", !displayValue && "text-slate-400")}>
          {displayValue || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="border-b border-slate-100 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Ara..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-300 focus:bg-white"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto p-2">
              {options.length === 0 ? (
                <div className="px-3 py-3 text-sm text-slate-500">{emptyText}</div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onSelect(option);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full rounded-xl px-3 py-3 text-left text-sm transition",
                      value === option.value
                        ? "bg-blue-50 font-semibold text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, desc, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{title}</p>
          <div className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</div>
          <p className="mt-2 text-sm font-medium text-slate-500">{desc}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>
    </div>
  );
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

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [categorySearch, setCategorySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
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
      phone: session?.user?.phone
        ? formatTurkishMobileDisplay(session.user.phone)
        : prev.phone,
    }));
  }, [session?.user?.email, session?.user?.phone]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === form.categoryId) || null,
    [categories, form.categoryId]
  );

  const selectedCity = useMemo(
    () => cities.find((c) => String(c.sehir_id) === String(form.cityId)) || null,
    [cities, form.cityId]
  );

  const selectedDistrict = useMemo(
    () => districts.find((d) => String(d.ilce_id) === String(form.districtId)) || null,
    [districts, form.districtId]
  );

  const categoryOptions = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    return categories
      .filter((c) => {
        if (!q) return true;
        return [c.name, c.path, c.slug].some((v) => String(v || "").toLowerCase().includes(q));
      })
      .map((c) => ({
        value: c.id,
        label: c.path || c.name,
        raw: c,
      }));
  }, [categories, categorySearch]);

  const cityOptions = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    return cities
      .filter((c) => {
        if (!q) return true;
        return String(c.sehir_adi || "").toLowerCase().includes(q);
      })
      .map((c) => ({
        value: String(c.sehir_id),
        label: c.sehir_adi,
        raw: c,
      }));
  }, [cities, citySearch]);

  const districtOptions = useMemo(() => {
    const q = districtSearch.trim().toLowerCase();
    return districts
      .filter((d) => {
        if (!q) return true;
        return String(d.ilce_adi || "").toLowerCase().includes(q);
      })
      .map((d) => ({
        value: String(d.ilce_id),
        label: d.ilce_adi,
        raw: d,
      }));
  }, [districts, districtSearch]);

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (filter === "new") {
      result = result.filter((r) => r.status === "NEW");
    } else if (filter === "open") {
      result = result.filter((r) => ["NEW", "CONTACTED", "QUOTED", "REPLIED"].includes(r.status));
    } else if (filter === "closed") {
      result = result.filter((r) => ["CLOSED", "LOST"].includes(r.status));
    }

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      result = result.filter((r) =>
        [r.title, r.category, r.message, r.city, r.district]
          .map((v) => String(v || "").toLowerCase())
          .some((v) => v.includes(q))
      );
    }

    return result;
  }, [requests, filter, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      newCount: requests.filter((r) => r.status === "NEW").length,
      openCount: requests.filter((r) =>
        ["NEW", "CONTACTED", "QUOTED", "REPLIED"].includes(r.status)
      ).length,
      closedCount: requests.filter((r) => ["CLOSED", "LOST"].includes(r.status)).length,
    };
  }, [requests]);

  const resetCreateForm = () => {
    setCategorySearch("");
    setCitySearch("");
    setDistrictSearch("");
    setDistricts([]);
    setForm((prev) => ({
      ...prev,
      title: "",
      categoryId: "",
      message: "",
      cityId: "",
      districtId: "",
      city: "",
      district: "",
    }));
  };

  const closeModal = () => {
    if (submitting) return;
    setShowCreate(false);
  };

  const submitRequest = async (e) => {
    e.preventDefault();

    if (!selectedCategory) {
      toast.error("Lütfen bir kategori seçin.");
      return;
    }

    const titleTrim = form.title.trim();
    if (titleTrim.length < 3) {
      toast.error("Talep başlığı en az 3 karakter olmalıdır.");
      return;
    }

    if (titleTrim.length > 200) {
      toast.error("Talep başlığı en fazla 200 karakter olabilir.");
      return;
    }

    if (!form.message.trim() || form.message.trim().length < 10) {
      toast.error("Talep açıklaması en az 10 karakter olmalıdır.");
      return;
    }

    const phoneDigits = digitsTurkishMobile(form.phone);
    if (!form.email.trim() && !phoneDigits) {
      toast.error("Telefon veya e-posta zorunludur.");
      return;
    }
    if (!form.email.trim() && phoneDigits.length < 10) {
      toast.error("Telefon numarasını 10 hane olacak şekilde tamamlayın (ör. (541) 196 18 30).");
      return;
    }
    if (form.email.trim() && phoneDigits.length > 0 && phoneDigits.length < 10) {
      toast.error("Telefon girildiyse 10 haneli olmalıdır.");
      return;
    }

    setSubmitting(true);

    try {
      const coords = await getCurrentPositionOptional(8000);

      const payload = {
        name: session?.user?.name || "Kullanıcı",
        phone: phoneDigits.length >= 10 ? phoneDigits : null,
        email: form.email.trim() || null,
        message: form.message.trim(),
        title: titleTrim,
        category: selectedCategory.slug || selectedCategory.name,
        categoryId: selectedCategory.id,
        categorySlug: selectedCategory.slug,
        source: "CATEGORY_PAGE",
        isDistributed: true,
        city: form.city.trim() || null,
        district: form.district.trim() || null,
        ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
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

      if (sentCount === 0) {
        toast.message("Eşleşen işletme bulunamadı", {
          description:
            "Bu kategoride kayıtlı aktif işletme olmadığı için talep hiçbir işletmeye iletilmedi.",
        });
      } else {
        toast.success("Talebiniz yayınlandı.", {
          description: `${sentCount} uygun işletmeye iletildi.`,
        });
        setShowCreate(false);
        resetCreateForm();
      }

      fetchRequests(true);
    } catch (e) {
      toast.error(e.message || "Talep gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!requestId || deletingId) return;

    const confirmed = window.confirm("Bu talebi kalıcı olarak silmek istediğinize emin misiniz?");
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
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-sm font-semibold text-slate-500">Panel yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 pb-16">
      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="relative bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#1e293b_100%)] px-6 py-8 text-white md:px-8 md:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.14),transparent_28%)]" />
            <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Talep Yönetim Merkezi
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                  Hizmet taleplerinizi daha hızlı yönetin
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                  Yeni kayıt oluşturun, süreçteki talepleri filtreleyin, eşleşen işletmeleri
                  yönetin ve tüm hareketleri tek ekrandan takip edin.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fetchRequests(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  <RefreshCw className="h-4 w-4" />
                  Yenile
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" />
                  Yeni Talep
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4 md:p-6">
            <StatCard
              title="Toplam Talep"
              value={stats.total}
              desc="Tüm kayıtlar"
              icon={LayoutList}
            />
            <StatCard
              title="Yeni"
              value={stats.newCount}
              desc="Yeni açılanlar"
              icon={Clock3}
            />
            <StatCard
              title="Açık Süreç"
              value={stats.openCount}
              desc="Devam edenler"
              icon={Briefcase}
            />
            <StatCard
              title="Kapanan"
              value={stats.closedCount}
              desc="Sonuçlananlar"
              icon={CheckCircle2}
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-4 xl:flex-row xl:items-center">
              <div className="relative w-full xl:max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Başlık, kategori, şehir veya açıklamada ara..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
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
                    className={cn(
                      "rounded-full px-4 py-2.5 text-sm font-bold transition",
                      filter === btn.id
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-sm font-semibold text-slate-500">
              {filteredRequests.length} kayıt gösteriliyor
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((item) => {
              const status = LEAD_STATUS_META[item.status] || {
                label: item.status || "Bilinmiyor",
                badge: "bg-slate-50 text-slate-700 border-slate-200",
                icon: AlertCircle,
              };
              const StatusIcon = status.icon;

              return (
                <motion.article
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 p-5 md:p-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold",
                            status.badge
                          )}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </span>

                        <span className="text-xs font-semibold text-slate-400">
                          {formatDate(item.createdAt)}
                        </span>

                        {item.category ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                            {item.category}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-4 text-xl font-black tracking-tight text-slate-900 md:text-2xl">
                        {item.title || item.category || "Genel Talep"}
                      </h3>

                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-[15px]">
                        {item.message}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2.5">
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
                          <MapPin className="h-4 w-4" />
                          {item.district ? `${item.district}, ${item.city || ""}` : item.city || "Şehir belirtilmedi"}
                        </span>

                        {item.email ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
                            <Mail className="h-4 w-4" />
                            {item.email}
                          </span>
                        ) : null}

                        {item.phone ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
                            <Phone className="h-4 w-4" />
                            {formatTurkishMobileDisplay(item.phone)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[240px]">
                      {item.business?.slug ? (
                        <Link
                          href={`/isletme/${item.business.slug}`}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                        >
                          <Building2 className="h-4 w-4" />
                          {item.business.name || "İşletmeye Git"}
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        <div className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                          Eşleşme bekleniyor
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(item.id)}
                        disabled={deletingId === item.id}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === item.id ? "Siliniyor..." : "Talebi Sil"}
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>

          {filteredRequests.length === 0 && (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <LayoutList className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-900">Talep bulunamadı</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Bu filtrede görüntülenecek kayıt yok. Yeni bir talep oluşturabilir veya farklı
                filtreleri deneyebilirsiniz.
              </p>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Yeni Talep Oluştur
              </button>
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <div className="absolute inset-0 flex items-center justify-center p-3 md:p-6">
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl"
              >
                <div className="shrink-0 border-b border-slate-200 bg-slate-950 px-5 py-5 text-white md:px-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">
                        <Sparkles className="h-3.5 w-3.5" />
                        Yeni Talep
                      </div>
                      <h2 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">
                        Yeni kayıt oluştur
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Talebiniz ilgili kategoriye uygun işletmelere iletilir. Şehir ve ilçe
                        seçimi daha doğru eşleşme için önerilir.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <form onSubmit={submitRequest} className="flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          Talep Başlığı
                        </label>
                        <input
                          value={form.title}
                          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                          placeholder="Örn: Acil web sitesi, tesisat, bakım, tamir..."
                          maxLength={200}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <SearchableDropdown
                          label="Kategori"
                          placeholder="Kategori seçin"
                          value={form.categoryId}
                          displayValue={selectedCategory?.path || selectedCategory?.name || ""}
                          options={categoryOptions}
                          searchValue={categorySearch}
                          onSearchChange={setCategorySearch}
                          onSelect={(option) => {
                            setForm((p) => ({
                              ...p,
                              categoryId: option.value,
                            }));
                          }}
                        />
                      </div>

                      <div>
                        <SearchableDropdown
                          label="Şehir"
                          placeholder="Şehir seçin"
                          value={form.cityId}
                          displayValue={selectedCity?.sehir_adi || ""}
                          options={cityOptions}
                          searchValue={citySearch}
                          onSearchChange={setCitySearch}
                          onSelect={(option) => {
                            setForm((p) => ({
                              ...p,
                              cityId: option.value,
                              city: option.raw?.sehir_adi || "",
                              districtId: "",
                              district: "",
                            }));
                            setDistrictSearch("");
                            fetchDistricts(option.value);
                          }}
                        />
                      </div>

                      <div>
                        <SearchableDropdown
                          label="İlçe"
                          placeholder={form.cityId ? "İlçe seçin" : "Önce şehir seçin"}
                          value={form.districtId}
                          displayValue={selectedDistrict?.ilce_adi || ""}
                          options={districtOptions}
                          searchValue={districtSearch}
                          onSearchChange={setDistrictSearch}
                          disabled={!form.cityId}
                          onSelect={(option) => {
                            setForm((p) => ({
                              ...p,
                              districtId: option.value,
                              district: option.raw?.ilce_adi || "",
                            }));
                          }}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          value={form.phone}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              phone: formatTurkishMobileDisplay(e.target.value),
                            }))
                          }
                          placeholder="(541) 196 18 30"
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          E-posta
                        </label>
                        <input
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          placeholder="mail@ornek.com"
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          Talep Detayı
                        </label>
                        <textarea
                          rows={7}
                          value={form.message}
                          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                          placeholder="İhtiyacınızı detaylı anlatın. Ne yapılacak, ne kadar acil, hangi şehirde, beklentiniz nedir?"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                        />
                      </div>

                      <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                        Konum paylaşımı zorunlu değildir. Şehir ve ilçe seçmeniz, talebinizin
                        daha doğru işletmelere ulaşmasını sağlar.
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 md:px-7">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Vazgeç
                      </button>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                        {submitting ? "Gönderiliyor..." : "Talebi Yayınla"}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}