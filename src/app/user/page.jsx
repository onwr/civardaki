"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  MapPin,
  Clock,
  ChevronRight,
  Zap,
  TrendingUp,
  Star,
  Heart,
  Search,
  Wrench,
  MessageSquare,
  Repeat,
  ArrowRight,
  Sparkles,
  Award,
  Bell,
  Navigation,
  ArrowUpRight,
  AlertCircle,
  LifeBuoy,
  Store,
} from "lucide-react";
import { useSocket } from "@/components/providers/SocketProvider";
import { BusinessCard } from "@/components/user/BusinessCard";
import BroadcastSlot from "@/components/broadcast/BroadcastSlot";
import { toast } from "sonner";
import {
  normalizeDashboardResponse,
  formatCurrency,
  formatDate,
  formatDateTime,
  textFallback,
  DEFAULT_IMAGE,
} from "@/lib/dashboard-helpers";

const ICON_MAP = { Repeat, Wrench, Heart, MessageSquare };

const DEFAULT_QUICK_ACTIONS = [
  {
    label: "Tekrar sipariş",
    sub: "Siparişlerim",
    icon: "repeat",
    href: "/user/orders",
  },
  {
    label: "Acil usta",
    sub: "Tesisat & Elektrik",
    icon: "wrench",
    href: "/user/isletmeler?category=hizmet",
  },
  {
    label: "Favorilerim",
    sub: "Hızlı erişim",
    icon: "heart",
    href: "/user/profile",
  },
  { label: "Destek", sub: "Yardım", icon: "message", href: "/user/settings" },
];

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-white/30 bg-white/10 text-white text-sm placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-white";
const selectClass =
  "w-full px-3 py-2 rounded-lg border border-white/30 bg-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white [&>option]:bg-slate-800 [&>option]:text-white";

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
        {Icon && <Icon className="w-6 h-6 text-[#004aad] shrink-0" />}
        {title}
      </h2>
      {subtitle && <p className="text-slate-500 text-sm mt-1.5">{subtitle}</p>}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-4 flex items-center gap-4">
      <div
        className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center shrink-0`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-lg font-bold text-slate-900 mt-0.5 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyStateCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-10 sm:p-12 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-200/80 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-7 h-7 text-slate-500" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#004aad] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

export default function UserHomePage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { socket, isConnected } = useSocket();
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [addressForm, setAddressForm] = useState({
    title: "",
    line1: "",
    line2: "",
    city: "",
    district: "",
    mahalle: "",
    phone: "",
  });
  const [citiesList, setCitiesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [neighborhoodsList, setNeighborhoodsList] = useState([]);
  const [selectedSehirId, setSelectedSehirId] = useState("");
  const [selectedIlceId, setSelectedIlceId] = useState("");
  const [locationsLoading, setLocationsLoading] = useState({
    cities: false,
    districts: false,
    neighborhoods: false,
  });

  const fetchDashboard = () => {
    if (sessionStatus !== "authenticated" || !session?.user) return;
    return fetch("/api/user/dashboard")
      .then((res) => {
        if (!res.ok)
          throw new Error(
            res.status === 401 ? "Oturum gerekli" : "Yüklenemedi",
          );
        return res.json();
      })
      .then((data) => setDashboard(normalizeDashboardResponse(data)))
      .catch((err) => {
        setError(err.message);
        setDashboard(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !session?.user) {
      setLoading(false);
      setDashboard(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchDashboard();
  }, [sessionStatus, session?.user]);

  useEffect(() => {
    if (!socket || !isConnected || sessionStatus !== "authenticated") return;
    const handler = () => fetchDashboard();
    socket.on("order_status_updated", handler);
    return () => socket.off("order_status_updated", handler);
  }, [socket, isConnected, sessionStatus]);

  useEffect(() => {
    if (!showAddressForm) return;
    setLocationsLoading((p) => ({ ...p, cities: true }));
    fetch("/api/locations/cities")
      .then((r) => r.json())
      .then((data) => setCitiesList(Array.isArray(data) ? data : []))
      .catch(() => setCitiesList([]))
      .finally(() => setLocationsLoading((p) => ({ ...p, cities: false })));
  }, [showAddressForm]);

  useEffect(() => {
    if (!selectedSehirId) {
      setDistrictsList([]);
      setSelectedIlceId("");
      setNeighborhoodsList([]);
      return;
    }
    setLocationsLoading((p) => ({ ...p, districts: true }));
    setAddressForm((prev) => ({ ...prev, district: "", mahalle: "" }));
    setSelectedIlceId("");
    setNeighborhoodsList([]);
    fetch(
      `/api/locations/districts?sehir_id=${encodeURIComponent(selectedSehirId)}`,
    )
      .then((r) => r.json())
      .then((data) => setDistrictsList(Array.isArray(data) ? data : []))
      .catch(() => setDistrictsList([]))
      .finally(() => setLocationsLoading((p) => ({ ...p, districts: false })));
  }, [selectedSehirId]);

  useEffect(() => {
    if (!selectedIlceId) {
      setNeighborhoodsList([]);
      return;
    }
    setLocationsLoading((p) => ({ ...p, neighborhoods: true }));
    setAddressForm((prev) => ({ ...prev, mahalle: "" }));
    fetch(
      `/api/locations/neighborhoods?ilce_id=${encodeURIComponent(selectedIlceId)}`,
    )
      .then((r) => r.json())
      .then((data) => setNeighborhoodsList(Array.isArray(data) ? data : []))
      .catch(() => setNeighborhoodsList([]))
      .finally(() =>
        setLocationsLoading((p) => ({ ...p, neighborhoods: false })),
      );
  }, [selectedIlceId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = (searchQuery != null ? String(searchQuery) : "").trim();
    if (!q) return;
    router.push(`/user/isletmeler?q=${encodeURIComponent(q)}`);
  };

  const handleAddressFormSubmit = (e) => {
    e.preventDefault();
    const title = (addressForm.title || "").trim();
    const line1 = (addressForm.line1 || "").trim();
    const city = (addressForm.city || "").trim();
    if (!title || !line1 || !city) {
      toast.error("Adres başlığı, adres satırı ve il zorunludur.");
      return;
    }
    setAddressSubmitting(true);
    fetch("/api/user/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        line1,
        line2: (addressForm.line2 || "").trim() || undefined,
        city,
        district: (addressForm.district || "").trim() || undefined,
        mahalle: (addressForm.mahalle || "").trim() || undefined,
        phone: (addressForm.phone || "").trim() || undefined,
      }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          toast.success("Adres eklendi.");
          setShowAddressForm(false);
          setAddressForm({
            title: "",
            line1: "",
            line2: "",
            city: "",
            district: "",
            mahalle: "",
            phone: "",
          });
          setSelectedSehirId("");
          setSelectedIlceId("");
          setDistrictsList([]);
          setNeighborhoodsList([]);
          fetchDashboard();
        } else {
          toast.error(data?.error || "Adres kaydedilemedi.");
        }
      })
      .catch(() => toast.error("Bir hata oluştu."))
      .finally(() => setAddressSubmitting(false));
  };

  const displayName =
    (dashboard?.user?.displayName &&
      String(dashboard.user.displayName).trim()) ||
    (dashboard?.user?.firstName && String(dashboard.user.firstName).trim()) ||
    (session?.user?.name && String(session.user.name).trim()) ||
    "Kullanıcı";

  const statsList = dashboard?.stats
    ? [
        {
          label: "Sadakat puanı",
          value: String(dashboard.stats.loyaltyPoints ?? 0),
          icon: Award,
          color: "text-[#004aad]",
          c: "bg-blue-50",
        },
        {
          label: "Toplam sipariş",
          value: String(dashboard.stats.totalOrders ?? 0),
          icon: ShoppingBag,
          color: "text-slate-700",
          c: "bg-slate-100",
        },
        {
          label: "Toplam harcama",
          value: formatCurrency(dashboard.stats.spendingLimit),
          icon: Zap,
          color: "text-amber-600",
          c: "bg-amber-50",
        },
      ]
    : [];

  const quickActions =
    Array.isArray(dashboard?.quickActions) && dashboard.quickActions.length > 0
      ? dashboard.quickActions
      : DEFAULT_QUICK_ACTIONS;

  const popularBusinesses = Array.isArray(dashboard?.popularBusinesses)
    ? dashboard.popularBusinesses
    : [];
  const recentlyViewedBusinesses = Array.isArray(
    dashboard?.recentlyViewedBusinesses,
  )
    ? dashboard.recentlyViewedBusinesses
    : [];
  const recentActivities = Array.isArray(dashboard?.recentActivities)
    ? dashboard.recentActivities
    : [];
  const activeOrder = dashboard?.activeOrder ?? null;
  const upcomingAppointment = dashboard?.upcomingAppointment ?? null;
  const location = dashboard?.location ?? null;

  const nearbySource = popularBusinesses?.length
    ? popularBusinesses
    : recentlyViewedBusinesses;

  if (sessionStatus === "loading" || (session?.user && loading)) {
    return (
      <div className="space-y-10 pb-20 px-4 sm:px-0 font-inter antialiased max-w-7xl mx-auto">
        <div className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/80 p-8 sm:p-10 shadow-sm">
          <div className="h-5 w-24 bg-slate-200 rounded-lg animate-pulse mb-4" />
          <div className="h-10 sm:h-12 w-64 sm:w-80 bg-slate-200 rounded-xl animate-pulse mb-3" />
          <div className="h-4 w-72 bg-slate-100 rounded-lg animate-pulse mb-8" />
          <div className="h-14 w-full max-w-md bg-slate-200 rounded-2xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError =
      error === "Oturum gerekli" ||
      (typeof error === "string" && error.toLowerCase().includes("oturum"));
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 py-16 font-inter antialiased">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-lg shadow-slate-200/50 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-7 h-7 text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Bir sorun oluştu
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            {textFallback(error, "Dashboard yüklenemedi.")}
          </p>
          {isAuthError ? (
            <Link
              href="/user/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#004aad] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Giriş yap
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Tekrar dene
            </button>
          )}
        </div>
      </div>
    );
  }

  const isGuest = sessionStatus === "unauthenticated" || !session?.user;

  return (
    <div className="space-y-10 sm:space-y-12 pb-20 px-4 sm:px-0 font-inter antialiased max-w-7xl mx-auto">
      {isGuest && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
          <p className="text-slate-700 text-sm sm:text-base font-medium">
            Dashboard verilerinizi görmek için giriş yapın.
          </p>
          <Link
            href="/user/login"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#004aad] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shrink-0"
          >
            Giriş yap
          </Link>
        </div>
      )}

      <BroadcastSlot layout="BANNER" audience="USER" />

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl bg-gradient-to-br from-[#004aad] via-blue-700 to-blue-900 text-white p-8 sm:p-10 shadow-xl border border-blue-600/30"
      >
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between gap-8">
          <div className="space-y-4 flex-1">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              Ana sayfanız
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Merhaba, {displayName}
            </h1>
            <p className="text-white/90 text-sm sm:text-base max-w-xl">
              Yakınınızdaki işletmeleri keşfedin, siparişlerinizi takip edin ve
              hızlıca işlem yapın.
            </p>
            <form
              onSubmit={handleSearchSubmit}
              className="w-full max-w-lg pt-2"
            >
              <div className="relative flex rounded-xl bg-white/15 border border-white/25 focus-within:border-white focus-within:ring-2 focus-within:ring-white/30 transition-all">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 pointer-events-none" />
                <input
                  type="text"
                  placeholder="İşletme veya hizmet ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-28 py-3.5 sm:py-4 bg-transparent text-white placeholder:text-white/60 text-sm sm:text-base outline-none rounded-xl"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-white text-[#004aad] rounded-lg text-sm font-semibold hover:bg-white/95 transition-colors"
                >
                  Ara
                </button>
              </div>
            </form>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/user/isletmeler"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#004aad] rounded-xl text-sm font-semibold hover:bg-white/95 transition-colors"
              >
                İşletmeleri keşfet
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/user/orders"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 text-white border border-white/30 rounded-xl text-sm font-semibold hover:bg-white/25 transition-colors"
              >
                Siparişlerim
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-4 lg:min-w-[280px]">
            {statsList.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
                {statsList.slice(0, 4).map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className={
                      stat.label === "Toplam harcama" ? "col-span-2" : ""
                    }
                  >
                    <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center">
                      <p className="text-xl font-bold text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-white/70 mt-0.5 truncate">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            <div className="rounded-xl bg-white/10 border border-white/20 p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" /> Teslimat adresiniz
              </h3>
              {location && (location.address || location.city) ? (
                <>
                  <p className="text-xs text-white/80 leading-snug">
                    {[location.district, location.city]
                      .filter(Boolean)
                      .join(", ") || "Konum"}
                  </p>
                  <p className="text-sm text-white leading-snug line-clamp-2">
                    {textFallback(location.address, "")}
                  </p>
                  <Link
                    href="/user/profile"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:underline"
                  >
                    Adresi düzenle <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              ) : !showAddressForm ? (
                <>
                  <p className="text-xs text-white/80">
                    Konumunuzu ekleyin – sipariş ve öneriler için.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="w-full py-2.5 bg-white text-[#004aad] rounded-lg text-sm font-semibold hover:bg-white/95 transition-colors flex items-center justify-center gap-1.5"
                  >
                    Adres ekle <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <form onSubmit={handleAddressFormSubmit} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Adres başlığı (örn. Ev)"
                    value={addressForm.title}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                  <select
                    value={selectedSehirId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedSehirId(id);
                      const city = citiesList.find(
                        (c) => String(c.sehir_id) === id,
                      );
                      setAddressForm((prev) => ({
                        ...prev,
                        city: city ? city.sehir_adi : "",
                        district: "",
                        mahalle: "",
                      }));
                    }}
                    className={selectClass}
                    disabled={locationsLoading.cities}
                  >
                    <option value="">
                      {locationsLoading.cities ? "Yükleniyor…" : "İl seçin"}
                    </option>
                    {citiesList.map((c) => (
                      <option key={c.sehir_id} value={c.sehir_id}>
                        {c.sehir_adi}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedIlceId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedIlceId(id);
                      const district = districtsList.find(
                        (d) => String(d.ilce_id) === id,
                      );
                      setAddressForm((prev) => ({
                        ...prev,
                        district: district ? district.ilce_adi : "",
                        mahalle: "",
                      }));
                    }}
                    className={selectClass}
                    disabled={!selectedSehirId || locationsLoading.districts}
                  >
                    <option value="">
                      {locationsLoading.districts
                        ? "Yükleniyor…"
                        : "İlçe seçin"}
                    </option>
                    {districtsList.map((d) => (
                      <option key={d.ilce_id} value={d.ilce_id}>
                        {d.ilce_adi}
                      </option>
                    ))}
                  </select>
                  <select
                    value={addressForm.mahalle}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        mahalle: e.target.value,
                      }))
                    }
                    className={selectClass}
                    disabled={!selectedIlceId || locationsLoading.neighborhoods}
                  >
                    <option value="">
                      {locationsLoading.neighborhoods
                        ? "Yükleniyor…"
                        : "Mahalle seçin"}
                    </option>
                    {neighborhoodsList.map((n) => (
                      <option key={n.mahalle_id} value={n.mahalle_adi}>
                        {n.mahalle_adi}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Sokak, bina no *"
                    value={addressForm.line1}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        line1: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Ek adres (daire, kapı no vb.)"
                    value={addressForm.line2}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        line2: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                  <input
                    type="tel"
                    placeholder="Telefon"
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setAddressForm({
                          title: "",
                          line1: "",
                          line2: "",
                          city: "",
                          district: "",
                          mahalle: "",
                          phone: "",
                        });
                        setSelectedSehirId("");
                        setSelectedIlceId("");
                        setDistrictsList([]);
                        setNeighborhoodsList([]);
                      }}
                      className="flex-1 py-2 rounded-lg border border-white/30 text-white text-xs font-semibold hover:bg-white/10"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={addressSubmitting}
                      className="flex-1 py-2 rounded-lg bg-white text-[#004aad] text-xs font-semibold disabled:opacity-60"
                    >
                      {addressSubmitting ? "Kaydediliyor…" : "Kaydet"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Yakındaki İşletmeler */}
      <section>
        <SectionHeader
          icon={Store}
          title="Yakındaki İşletmeler"
          subtitle="Keşfetmek için size özel öneriler"
        />
        {nearbySource.length > 0 ? (
          <div className="overflow-x-auto pb-2 -mx-1 sm:mx-0 sm:overflow-visible scrollbar-thin">
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-[min(100%,320px)] sm:min-w-0">
              {nearbySource.slice(0, 6).map((business) => (
                <div
                  key={business?.id ?? business?.slug ?? Math.random()}
                  className="w-[280px] sm:w-auto shrink-0 sm:shrink"
                >
                  <BusinessCard business={business} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyStateCard
            icon={Store}
            title="Yakın çevrende henüz işletme bulunamadı"
            description="Keşfetmeye başlayın, size uygun işletmeleri listeliyoruz."
            actionLabel="İşletmeleri keşfet"
            actionHref="/user/isletmeler"
          />
        )}
      </section>

      {/* Aktif sipariş + Yaklaşan randevu */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {activeOrder ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#004aad] to-blue-800 p-6 sm:p-8 text-white shadow-lg shadow-blue-900/20 border border-blue-400/20"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/90 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  Sipariş yolda
                </span>
                {activeOrder.etaMinutes != null && (
                  <span className="px-3 py-1.5 bg-white/20 rounded-lg text-sm font-bold">
                    ~{activeOrder.etaMinutes} dk
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shrink-0 overflow-hidden relative">
                  <Image
                    src={activeOrder.businessLogo || DEFAULT_IMAGE}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-white truncate">
                    {textFallback(activeOrder.businessName, "İşletme")}
                  </h3>
                  {activeOrder.courierName && (
                    <p className="text-xs text-white/70 mt-0.5">
                      Kurye: {activeOrder.courierName}
                    </p>
                  )}
                  <p className="text-white font-semibold mt-2">
                    {formatCurrency(activeOrder.total)}
                  </p>
                </div>
              </div>
              <div className="h-1 w-full bg-white/20 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full w-2/3 bg-white/60 rounded-full animate-pulse"
                  style={{ width: "66%" }}
                />
              </div>
              <Link
                href={
                  activeOrder.id
                    ? `/user/orders/${activeOrder.id}`
                    : "/user/orders"
                }
                className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 bg-white text-[#004aad] rounded-xl text-sm font-semibold hover:bg-white/95 transition-colors shadow-lg"
              >
                <Navigation className="w-4 h-4" /> Sipariş detayı
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center min-h-[240px] shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-200/80 flex items-center justify-center mb-3">
              <ShoppingBag className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-600 font-medium">Aktif siparişiniz yok</p>
            <p className="text-slate-400 text-sm mt-1">
              Yeni sipariş verdiğinizde burada görünecek.
            </p>
            <Link
              href="/user/isletmeler"
              className="mt-4 text-sm font-semibold text-[#004aad] hover:underline"
            >
              İşletmelere göz at
            </Link>
          </div>
        )}

        {upcomingAppointment ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Yaklaşan randevu
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-100">
                {upcomingAppointment.status === "confirmed"
                  ? "Onaylandı"
                  : textFallback(upcomingAppointment.status, "Randevu")}
              </span>
            </div>
            <p className="text-xl font-bold text-slate-900 mb-4">
              {formatDateTime(upcomingAppointment.dateTime)}
            </p>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl shrink-0 overflow-hidden relative border border-slate-100">
                <Image
                  src={upcomingAppointment.image || DEFAULT_IMAGE}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-slate-900 truncate">
                  {textFallback(
                    upcomingAppointment.businessName ||
                      upcomingAppointment.providerName,
                    "İşletme",
                  )}
                </h4>
                {upcomingAppointment.title && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {upcomingAppointment.title}
                  </p>
                )}
              </div>
              <Link
                href={
                  upcomingAppointment.businessSlug
                    ? `/isletme/${String(upcomingAppointment.businessSlug)}`
                    : "/user/appointments"
                }
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-[#004aad] hover:border-[#004aad]/30 hover:bg-blue-50/50 transition-colors shrink-0"
              >
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
            <Link
              href="/user/appointments"
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Tüm randevular <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center min-h-[240px] shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-200/80 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-600 font-medium">
              Yaklaşan randevunuz yok
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Randevu oluşturduğunuzda burada listelenecek.
            </p>
            <Link
              href="/user/appointments"
              className="mt-4 text-sm font-semibold text-[#004aad] hover:underline"
            >
              Randevularım
            </Link>
          </div>
        )}
      </div>

      {/* Hızlı işlemler */}
      <section>
        <SectionHeader
          icon={Sparkles}
          title="Hızlı işlemler"
          subtitle="Sık kullandığınız sayfalara tek tıkla erişin"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => {
            const Icon = ICON_MAP[action.icon] || Repeat;
            const href = action?.href ? String(action.href) : "/user";
            const colors = [
              {
                bg: "bg-blue-50",
                color: "text-[#004aad]",
                border: "hover:border-blue-200",
              },
              {
                bg: "bg-amber-50",
                color: "text-amber-600",
                border: "hover:border-amber-200",
              },
              {
                bg: "bg-slate-100",
                color: "text-slate-700",
                border: "hover:border-slate-300",
              },
              {
                bg: "bg-emerald-50",
                color: "text-emerald-600",
                border: "hover:border-emerald-200",
              },
            ][i % 4];
            return (
              <Link key={i} href={href}>
                <div
                  className={`p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl flex flex-col gap-3 group shadow-sm hover:shadow-md transition-all duration-200 ${colors.border}`}
                >
                  <div
                    className={`w-12 h-12 ${colors.bg} ${colors.color} rounded-xl flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {textFallback(action?.label, "İşlem")}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {textFallback(action?.sub, "")}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#004aad] group-hover:translate-x-0.5 transition-all mt-auto" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Ana içerik + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section>
            <SectionHeader
              icon={TrendingUp}
              title="Popüler işletmeler"
              subtitle="En çok tercih edilen işletmeler"
            />
            {popularBusinesses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {popularBusinesses.slice(0, 4).map((business) => (
                  <BusinessCard
                    key={business?.id ?? `b-${business?.slug ?? Math.random()}`}
                    business={business}
                  />
                ))}
              </div>
            ) : (
              <EmptyStateCard
                icon={Store}
                title="Henüz işletme listesi yok"
                description="Keşfetmeye başlayın, sizin için öneriler hazırlıyoruz."
                actionLabel="İşletmeleri keşfet"
                actionHref="/user/isletmeler"
              />
            )}
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-slate-600" /> Son aktiviteler
            </h3>
            <div className="space-y-2">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 4).map((activity) => (
                  <Link
                    key={activity?.id ?? `a-${Math.random()}`}
                    href="/user/orders"
                  >
                    <div className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100">
                      <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0 group-hover:bg-blue-50">
                        {activity?.icon ?? "🛒"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate group-hover:text-[#004aad] transition-colors">
                          {textFallback(activity?.title, "Aktivite")}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDate(activity?.date)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 self-center" />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-slate-500 text-sm font-medium py-6 text-center">
                  Henüz aktivite yok.
                </p>
              )}
            </div>
            <Link
              href="/user/orders"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors pt-4 mt-2 border-t border-slate-100"
            >
              Tüm hareketler <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <Link
            href="/user/tickets"
            className="block bg-white rounded-2xl border border-slate-200 shadow-md p-5 hover:shadow-lg hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <LifeBuoy className="w-5 h-5 text-[#004aad]" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-[#004aad] transition-colors">
                  Destek taleplerin
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sorularınız için destek talebi oluşturun
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#004aad] ml-auto shrink-0" />
            </div>
          </Link>
        </aside>
      </div>
    </div>
  );
}
