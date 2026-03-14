"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BusinessCard } from "@/components/user/BusinessCard";
import { normalizeBusinessForCard } from "@/lib/dashboard-helpers";
import {
  Search,
  MapPin,
  Grid,
  Layers,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SearchableDropdown from "@/components/listing-detail/SearchableDropdown";

function normalizeToken(value) {
  return (value || "")
    .toString()
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function findCategoryByParam(list, value) {
  const normalized = normalizeToken(value);
  if (!normalized) return null;
  return (
    list.find((item) => normalizeToken(item.value) === normalized) ||
    list.find((item) => normalizeToken(item.slug) === normalized) ||
    list.find((item) => normalizeToken(item.id) === normalized)
  );
}

function renderCategoryIcon(iconName) {
  if (!iconName || typeof iconName !== "string") {
    return <Layers className="w-4 h-4" />;
  }
  const IconComp = LucideIcons[iconName];
  if (typeof IconComp === "function") {
    return <IconComp className="w-4 h-4" />;
  }
  return <Layers className="w-4 h-4" />;
}

/** Liste öğesi için güvenli normalize; null/undefined'da fallback */
function safeBusinessForCard(raw) {
  if (!raw || typeof raw !== "object") return null;
  return normalizeBusinessForCard(raw);
}

export default function BusinessesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const qParam = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const cityParam = searchParams.get("city") ?? "";
  const districtParam = searchParams.get("district") ?? "";
  const sortParam = searchParams.get("sort") || "newest";
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const [searchTerm, setSearchTerm] = useState(qParam);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryError, setCategoryError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 12 });
  const selectedCategory = useMemo(
    () => findCategoryByParam(categories, categoryParam),
    [categories, categoryParam]
  );

  // Arama inputunu URL ile senkron tut (geri butonu vb.)
  useEffect(() => {
    setSearchTerm(qParam);
  }, [qParam]);

  // Konum: izin verilirse kullan, reddedilirse kullanıcıya net bilgi ver
  const requestUserLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setUserLocation(null);
      setLocationError("Tarayıcınız konum erişimini desteklemiyor.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      (geoError) => {
        setUserLocation(null);
        if (geoError?.code === 1) {
          setLocationError("Konum izni verilmedi. Yakınlığa göre sıralama pasif.");
          return;
        }
        if (geoError?.code === 2) {
          setLocationError("Konum bilgisi alınamadı. Daha sonra tekrar deneyin.");
          return;
        }
        setLocationError("Konum bilgisi zamanında alınamadı.");
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    requestUserLocation();
  }, [requestUserLocation]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLocationLoading(true);
      try {
        const res = await fetch("/api/locations/cities", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          setCities(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) setCities([]);
      } finally {
        if (!cancelled) setIsLocationLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!cities.length) return;
    if (!cityParam) {
      setSelectedCityId("");
      setSelectedDistrictId("");
      setDistricts([]);
      return;
    }
    const found = cities.find(
      (item) => normalizeToken(item.sehir_adi) === normalizeToken(cityParam)
    );
    if (found) setSelectedCityId(String(found.sehir_id));
  }, [cities, cityParam]);

  useEffect(() => {
    if (!selectedCityId) return;
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch(
          `/api/locations/districts?sehir_id=${encodeURIComponent(selectedCityId)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!cancelled) setDistricts(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setDistricts([]);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedCityId]);

  useEffect(() => {
    if (!districtParam) {
      setSelectedDistrictId("");
      return;
    }
    if (!districts.length) return;
    const found = districts.find(
      (item) => normalizeToken(item.ilce_adi) === normalizeToken(districtParam)
    );
    if (found) setSelectedDistrictId(String(found.ilce_id));
  }, [districts, districtParam]);

  // Kategori kaynağı: yalnızca API
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsCategoryLoading(true);
      setCategoryError(null);
      try {
        const res = await fetch("/api/public/categories", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) {
            setCategories([]);
            setCategoryError(data?.message || "Kategoriler yüklenemedi.");
          }
          return;
        }

        const list = Array.isArray(data?.categories) ? data.categories : [];
        const normalized = list
          .map((item) => ({
            id: item?.id || item?.slug || item?.name,
            value: item?.name || "",
            label: item?.name || "Kategori",
            slug: item?.slug || "",
            icon: item?.icon || "",
          }))
          .filter((item) => item.id && item.value);

        const unique = [];
        const seen = new Set();
        for (const item of normalized) {
          const key = normalizeToken(item.value);
          if (!key || seen.has(key)) continue;
          seen.add(key);
          unique.push(item);
        }

        if (!cancelled) setCategories(unique);
      } catch {
        if (!cancelled) {
          setCategories([]);
          setCategoryError("Kategori servisine ulaşılamadı.");
        }
      } finally {
        if (!cancelled) setIsCategoryLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateUrl = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams.toString());
      if (updates.q !== undefined) {
        const v = (updates.q ?? "").trim();
        if (v) next.set("q", v);
        else next.delete("q");
      }
      if (updates.category !== undefined) {
        if (updates.category) next.set("category", updates.category);
        else next.delete("category");
      }
      if (updates.city !== undefined) {
        if (updates.city) next.set("city", updates.city);
        else next.delete("city");
      }
      if (updates.district !== undefined) {
        if (updates.district) next.set("district", updates.district);
        else next.delete("district");
      }
      if (updates.sort !== undefined) {
        if (updates.sort && updates.sort !== "newest") next.set("sort", updates.sort);
        else next.delete("sort");
      }
      if (updates.page !== undefined) {
        if (updates.page > 1) next.set("page", String(updates.page));
        else next.delete("page");
      }
      if (updates.status !== undefined) {
        if (updates.status && updates.status !== "all") next.set("status", updates.status);
        else next.delete("status");
      }
      if (updates.minRating !== undefined) {
        if (updates.minRating != null && updates.minRating !== "") next.set("minRating", String(updates.minRating));
        else next.delete("minRating");
      }
      if (updates.maxDistance !== undefined) {
        if (updates.maxDistance != null && updates.maxDistance > 0) next.set("maxDistance", String(updates.maxDistance));
        else next.delete("maxDistance");
      }
      if (updates.lat === false) next.delete("lat");
      if (updates.lng === false) next.delete("lng");
      if (userLocation && (updates.lat === true || updates.lng === true)) {
        next.set("lat", String(userLocation.lat));
        next.set("lng", String(userLocation.lng));
      }
      const query = next.toString();
      router.push(query ? `/user/isletmeler?${query}` : "/user/isletmeler", { scroll: false });
    },
    [router, searchParams, userLocation]
  );

  // URL'deki kategori slug/id ise kategori adıyla normalize et
  useEffect(() => {
    if (!categoryParam || !categories.length) return;
    const matched = findCategoryByParam(categories, categoryParam);
    if (matched?.value && categoryParam !== matched.value) {
      updateUrl({ category: matched.value, page: 1 });
    }
  }, [categoryParam, categories, updateUrl]);

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(searchParams.toString());
      if (userLocation) {
        params.set("lat", String(userLocation.lat));
        params.set("lng", String(userLocation.lng));
      }
      const res = await fetch(`/api/public/businesses?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || data?.error || "İşletmeler yüklenemedi.");
        setBusinesses([]);
        setPagination({ page: 1, totalPages: 1, total: 0, limit: 12 });
        return;
      }

      let items = Array.isArray(data.items) ? data.items : [];
      const maxDistanceParam = searchParams.get("maxDistance");
      const maxDistance = maxDistanceParam != null && maxDistanceParam !== "" ? parseFloat(maxDistanceParam) : null;
      if (maxDistance != null && !Number.isNaN(maxDistance)) {
        items = items.filter((b) => b.distance != null && !Number.isNaN(b.distance) && b.distance <= maxDistance);
      }

      const normalized = items
        .map((b) => safeBusinessForCard(b))
        .filter(Boolean);
      setBusinesses(normalized);

      const pag = data.pagination || {};
      const totalFromApi = pag.total ?? 0;
      const totalPagesFromApi = Math.max(1, pag.totalPages ?? 1);
      setPagination({
        page: Math.min(pag.page ?? pageParam, totalPagesFromApi),
        totalPages: totalPagesFromApi,
        total: maxDistance != null ? normalized.length : totalFromApi,
        limit: pag.limit ?? 12,
      });
    } catch (err) {
      setError("Bağlantı hatası oluştu.");
      setBusinesses([]);
      setPagination({ page: 1, totalPages: 1, total: 0, limit: 12 });
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, userLocation, pageParam]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    const q = (searchTerm != null ? String(searchTerm) : "").trim();
    updateUrl({ q: q || undefined, page: 1 });
  };

  const handleCategoryClick = (id) => {
    updateUrl({ category: id ?? "", page: 1 });
  };

  const handleSortChange = (newSort) => {
    updateUrl({ sort: newSort, page: 1 });
  };

  const clearAllFilters = () => {
    updateUrl({
      q: (searchTerm != null ? String(searchTerm) : "").trim() || undefined,
      category: undefined,
      sort: sortParam !== "newest" ? sortParam : undefined,
      status: undefined,
      minRating: undefined,
      maxDistance: undefined,
      city: undefined,
      district: undefined,
      page: 1,
    });
  };

  const handleCitySelect = (cityId) => {
    const nextCityId = String(cityId || "");
    setSelectedCityId(nextCityId);
    setSelectedDistrictId("");
    setUserLocation(null);
    const cityObj = cities.find((item) => String(item.sehir_id) === nextCityId);
    updateUrl({
      city: cityObj?.sehir_adi || "",
      district: "",
      lat: false,
      lng: false,
      page: 1,
    });
  };

  const handleDistrictSelect = (districtId) => {
    const nextDistrictId = String(districtId || "");
    setSelectedDistrictId(nextDistrictId);
    setUserLocation(null);
    const districtObj = districts.find((item) => String(item.ilce_id) === nextDistrictId);
    updateUrl({
      district: districtObj?.ilce_adi || "",
      lat: false,
      lng: false,
      page: 1,
    });
  };

  const clearLocationSelection = () => {
    setUserLocation(null);
    setLocationError(null);
    setSelectedCityId("");
    setSelectedDistrictId("");
    setDistricts([]);
    setSearchTerm("");
    router.push("/user/isletmeler", { scroll: false });
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    updateUrl({ page: nextPage });
  };

  const totalPages = Math.max(1, Number(pagination.totalPages) || 1);
  const currentPage = Math.max(1, Math.min(Number(pagination.page) || 1, totalPages));
  const hasActiveFilters = Boolean(qParam || categoryParam || cityParam || districtParam);
  const sortByDistanceWithoutLocation = sortParam === "distance" && !userLocation;
  const activeSummary = [
    qParam ? `Arama: "${qParam}"` : null,
    selectedCategory?.label ? `Kategori: ${selectedCategory.label}` : null,
    cityParam ? `Il: ${cityParam}` : null,
    districtParam ? `Ilce: ${districtParam}` : null,
    sortParam === "distance" ? "Sıralama: Yakınlık" : null,
  ].filter(Boolean);

  const pageNumbers = [];
  const showPages = 5;
  let start = Math.max(1, currentPage - Math.floor(showPages / 2));
  const end = Math.min(totalPages, start + showPages - 1);
  if (end - start + 1 < showPages) start = Math.max(1, end - showPages + 1);
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  return (
    <div className="space-y-8 sm:space-y-10 pb-16 sm:pb-20 px-4 sm:px-0 max-w-6xl mx-auto font-inter antialiased text-left">
      {/* Hero & Search */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-[#004aad]" />
            Yakınındaki işletmeler
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            İşletmeleri keşfedin
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-lg">
            Arama yapın, kategori seçin veya konuma göre sıralayın.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="w-full lg:max-w-md flex-shrink-0">
          <div className="relative flex rounded-xl border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#004aad]/20 focus-within:border-[#004aad]/40 transition-all">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="İşletme veya hizmet ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchSubmit(e);
                }
              }}
              className="w-full pl-11 pr-24 py-3.5 sm:py-4 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm sm:text-base outline-none rounded-xl"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSortChange("distance")}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${sortParam === "distance" ? "text-[#004aad] bg-blue-50" : "text-slate-500 hover:text-[#004aad]"}`}
              >
                <MapPin className="w-4 h-4" />
                {userLocation ? "Yakın" : "Konum"}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#004aad] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Ara
              </button>
            </div>
          </div>
          {userLocation && (
            <p className="mt-1.5 text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Konumunuz kullanılıyor
            </p>
          )}
          {sortByDistanceWithoutLocation && (
            <p className="mt-1.5 text-xs text-amber-600 font-medium flex items-center gap-2">
              {locationError || "Yakınlığa göre sıralamak için konum izni verin."}
              <button
                type="button"
                onClick={requestUserLocation}
                className="underline underline-offset-2 font-semibold"
              >
                Tekrar dene
              </button>
            </p>
          )}
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Konum Secimi</p>
            <p className="text-sm text-slate-600">
              {userLocation
                ? "Su an otomatik konum kullaniliyor. Istersen temizleyip il/ilce secimi yapabilirsin."
                : "Il ve ilce icin aramali dropdown ile manuel konum secimi yapabilirsin."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={requestUserLocation}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#004aad] bg-blue-50 hover:bg-blue-100"
            >
              <MapPin className="w-3.5 h-3.5" />
              Konumu Al
            </button>
            <button
              type="button"
              onClick={clearLocationSelection}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              <X className="w-3.5 h-3.5" />
              Konumu Temizle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1.5">Il</p>
            <SearchableDropdown
              options={cities}
              value={selectedCityId}
              onSelect={(city) => handleCitySelect(city?.sehir_id)}
              getOptionValue={(item) => String(item?.sehir_id || "")}
              getOptionLabel={(item) => item?.sehir_adi || ""}
              placeholder={isLocationLoading ? "Iller yukleniyor..." : "Il ara ve sec"}
              loading={isLocationLoading}
              emptyMessage="Il bulunamadi"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1.5">Ilce</p>
            <SearchableDropdown
              options={districts}
              value={selectedDistrictId}
              onSelect={(district) => handleDistrictSelect(district?.ilce_id)}
              getOptionValue={(item) => String(item?.ilce_id || "")}
              getOptionLabel={(item) => item?.ilce_adi || ""}
              placeholder={selectedCityId ? "Ilce ara ve sec" : "Once il sec"}
              disabled={!selectedCityId}
              emptyMessage="Ilce bulunamadi"
            />
          </div>
        </div>
      </section>

      {/* Category chips */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${!selectedCategory ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
        >
          <Layers className="w-4 h-4" /> Tümü
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCategoryClick(c.value)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${selectedCategory?.id === c.id ? "bg-[#004aad] text-white border-[#004aad]" : "bg-white text-slate-600 border-slate-200 hover:border-[#004aad]/30 hover:bg-blue-50/50"}`}
          >
            <span className="text-base">{renderCategoryIcon(c.icon)}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>
      {!isCategoryLoading && categoryError && (
        <p className="text-xs text-amber-700 -mt-4">
          Kategori yüklenemedi: {categoryError} (yalnızca "Tümü" kullanılabilir)
        </p>
      )}

      {/* Results */}
      <div className="space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#004aad]" />
            Sonuçlar
          </h2>
          <span className="text-sm text-slate-500 font-medium">
            {!error && !isLoading ? `${pagination.total ?? 0} işletme` : "—"}
          </span>
        </div>
        {activeSummary.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeSummary.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {item}
              </span>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-[#004aad] hover:text-blue-700"
            >
              Temizle
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
            <AlertCircle className="w-10 h-10 text-slate-400" />
            <p className="text-slate-600 font-medium">{error}</p>
            <button
              type="button"
              onClick={() => fetchBusinesses()}
              className="px-5 py-2.5 bg-[#004aad] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Tekrar dene
            </button>
          </div>
        )}

        {!error && isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="h-48 sm:h-52 bg-slate-100 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-2/3 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-7 w-14 bg-slate-100 rounded-lg animate-pulse" />
                    <div className="h-7 w-16 bg-slate-100 rounded-lg animate-pulse" />
                  </div>
                  <div className="h-12 bg-slate-100 rounded-xl animate-pulse mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!error && !isLoading && Array.isArray(businesses) && businesses.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {businesses.map((business, idx) => {
                  if (!business || !(business.slug || business.id)) return null;
                  return (
                    <motion.div
                      key={business.id || business.slug || idx}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.04, 0.25) }}
                    >
                      <BusinessCard business={business} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-6 sm:pt-8">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  aria-label="Önceki sayfa"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex items-center gap-1">
                  {pageNumbers.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => goToPage(num)}
                      className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${currentPage === num ? "bg-[#004aad] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  aria-label="Sonraki sayfa"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
                <span className="text-sm text-slate-500 ml-1">
                  {currentPage} / {totalPages}
                </span>
              </div>
            )}
          </>
        )}

        {!error && !isLoading && (!Array.isArray(businesses) || businesses.length === 0) && (
          <div className="py-16 sm:py-20 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center px-6 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Eşleşen sonuç yok
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              Seçtiğiniz arama ve kategoriye uygun sonuç bulunamadı. Kategoriyi degistirip tekrar deneyin.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fetchBusinesses()}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Tekrar dene
              </button>
              {hasActiveFilters || qParam || categoryParam ? (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 bg-[#004aad] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Filtreleri sıfırla
                </button>
              ) : (
                <a
                  href="/user/isletmeler"
                  className="px-5 py-2.5 bg-[#004aad] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors inline-block"
                >
                  Tüm işletmeler
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
