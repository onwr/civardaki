"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  TrendingUp,
  Filter,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Check,
  ChevronDown,
  Store,
  Tag,
  Sparkles,
  RefreshCw,
  ArrowUpDown,
  Box,
  Eye,
  ShoppingBag,
  Layers,
  BarChart3,
} from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 24,
  total: 0,
  totalPages: 1,
};

const ALLOWED_QUERY_KEYS = [
  "q",
  "categoryId",
  "min",
  "max",
  "inStockOnly",
  "sort",
  "page",
  "pageSize",
];

const SORT_OPTIONS = [
  { value: "updatedDesc", label: "Son Guncellenen" },
  { value: "newest", label: "En Yeni" },
  { value: "priceAsc", label: "Fiyat: Dusukten Yuksege" },
  { value: "priceDesc", label: "Fiyat: Yuksekten Dusuge" },
  { value: "nameAsc", label: "Isim: A-Z" },
];

function buildQueryFromSearchParams(sp) {
  const query = new URLSearchParams();
  ALLOWED_QUERY_KEYS.forEach((key) => {
    const value = sp.get(key);
    if (value != null && value !== "") {
      query.set(key, value);
    }
  });
  return query.toString();
}

function createHrefFromQuery(qs, updates = {}) {
  const next = new URLSearchParams(qs);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
  });
  const str = next.toString();
  return str ? `?${str}` : "?";
}

function getVisiblePages(currentPage, totalPages) {
  const maxVisible = 5;
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }
  if (currentPage >= totalPages - 2) {
    return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
}

function hasAnyActiveFilter(sp) {
  return (
    !!sp.get("q") ||
    !!sp.get("categoryId") ||
    !!sp.get("min") ||
    !!sp.get("max") ||
    sp.get("inStockOnly") === "1" ||
    (!!sp.get("sort") && sp.get("sort") !== "updatedDesc")
  );
}

function formatPrice(price, currency) {
  const v = Number(price);
  if (!Number.isFinite(v)) return null;
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency === "USD" ? "USD" : currency === "EUR" ? "EUR" : "TRY",
      maximumFractionDigits: 2,
    }).format(v);
  } catch {
    return `${v.toFixed(2)} TL`;
  }
}

function StatCard({ title, value, icon: Icon, trend, trendUp }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? "text-emerald-600" : "text-slate-500"}`}>
              {trendUp && <TrendingUp className="h-3 w-3" />}
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-[#004aad] group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({ categories, currentFilters, onFilterChange, onReset, filtered }) {
  const [localSearch, setLocalSearch] = useState(currentFilters.q || "");
  const [priceMin, setPriceMin] = useState(currentFilters.min || "");
  const [priceMax, setPriceMax] = useState(currentFilters.max || "");
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    stock: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ q: localSearch });
  };

  const handlePriceApply = () => {
    onFilterChange({ min: priceMin, max: priceMax });
  };

  return (
    <aside className="sticky top-6 space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-800">Filtreler</h3>
            </div>
            {filtered && (
              <button
                onClick={onReset}
                className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100"
              >
                <X className="h-3 w-3" />
                Temizle
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Search */}
          <div className="p-5">
            <form onSubmit={handleSearchSubmit}>
              <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Arama
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Urun, marka ara..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#004aad] focus:bg-white focus:ring-4 focus:ring-[#004aad]/10"
                />
              </div>
              <button
                type="submit"
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#004aad] text-sm font-semibold text-white transition-all hover:bg-[#003d8f]"
              >
                <Search className="h-4 w-4" />
                Ara
              </button>
            </form>
          </div>

          {/* Categories */}
          <div className="p-5">
            <button
              onClick={() => toggleSection("category")}
              className="mb-3 flex w-full items-center justify-between"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Kategoriler
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${expandedSections.category ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {expandedSections.category && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  <button
                    onClick={() => onFilterChange({ categoryId: "" })}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${!currentFilters.categoryId
                      ? "bg-[#004aad] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    <Layers className="h-4 w-4" />
                    Tum Kategoriler
                  </button>
                  <button
                    onClick={() => onFilterChange({ categoryId: "null" })}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${currentFilters.categoryId === "null"
                      ? "bg-[#004aad] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    <Box className="h-4 w-4" />
                    Kategorisiz
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => onFilterChange({ categoryId: cat.id })}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${currentFilters.categoryId === String(cat.id)
                        ? "bg-[#004aad] text-white"
                        : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <Tag className="h-4 w-4" />
                      {cat.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Price Range */}
          <div className="p-5">
            <button
              onClick={() => toggleSection("price")}
              className="mb-3 flex w-full items-center justify-between"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Fiyat Aralığı
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${expandedSections.price ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {expandedSections.price && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">
                        Min
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                          TL
                        </span>
                        <input
                          type="number"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          placeholder="0"
                          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm font-medium outline-none transition-all focus:border-[#004aad] focus:bg-white focus:ring-2 focus:ring-[#004aad]/10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">
                        Max
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                          TL
                        </span>
                        <input
                          type="number"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          placeholder="Limitsiz"
                          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm font-medium outline-none transition-all focus:border-[#004aad] focus:bg-white focus:ring-2 focus:ring-[#004aad]/10"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handlePriceApply}
                    className="flex h-9 w-full items-center justify-center rounded-lg border border-[#004aad] text-sm font-semibold text-[#004aad] transition-all hover:bg-[#004aad] hover:text-white"
                  >
                    Uygula
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stock Status */}
          <div className="p-5">
            <button
              onClick={() => toggleSection("stock")}
              className="mb-3 flex w-full items-center justify-between"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Stok Durumu
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${expandedSections.stock ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {expandedSections.stock && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <label className="group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-[#004aad] hover:bg-white">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={currentFilters.inStockOnly === "1"}
                        onChange={(e) =>
                          onFilterChange({ inStockOnly: e.target.checked ? "1" : "" })
                        }
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 bg-white transition-all checked:border-[#004aad] checked:bg-[#004aad]"
                      />
                      <Check className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-700">
                        Sadece Stoktakiler
                      </span>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Tukenmis urunleri gizle
                      </p>
                    </div>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ProductCard({ product, viewMode }) {
  const displayPrice = formatPrice(product.discountPrice ?? product.price, product.priceCurrency);
  const originalPrice =
    product.discountPrice != null && product.price != null
      ? formatPrice(product.price, product.priceCurrency)
      : null;
  const inStock = typeof product.stock === "number" ? product.stock > 0 : product.stock == null;
  const businessHref = product.business?.slug ? `/isletme/${product.business.slug}` : null;
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex gap-5 rounded-2xl border border-slate-200/60 bg-white p-4 transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50"
      >
        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="128px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-8 w-8 text-slate-300" />
            </div>
          )}
          {hasDiscount && (
            <div className="absolute left-2 top-2 rounded-lg bg-rose-500 px-2 py-1 text-xs font-bold text-white">
              -{discountPercent}%
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            {product.business?.name && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {product.business.name}
              </p>
            )}
            <h3 className="text-base font-bold text-slate-900 line-clamp-1">{product.name}</h3>
            {product.category?.name && (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                <Tag className="h-3 w-3" />
                {product.category.name}
              </span>
            )}
          </div>

          <div className="flex items-end justify-between">
            <div>
              {originalPrice && (
                <p className="text-sm font-medium text-slate-400 line-through">{originalPrice}</p>
              )}
              <p className="text-xl font-bold text-slate-900">{displayPrice || "-"}</p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${inStock
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
                  }`}
              >
                {inStock ? "Stokta" : "Tukendi"}
              </span>
              {businessHref && (
                <Link
                  href={businessHref}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-[#004aad] hover:text-white"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-slate-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="rounded-lg bg-rose-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              -{discountPercent}%
            </span>
          )}
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-bold shadow-sm ${inStock
              ? "bg-emerald-500 text-white"
              : "bg-slate-800 text-white"
              }`}
          >
            {inStock ? "Stokta" : "Tukendi"}
          </span>
        </div>

        {/* Category Badge */}
        {product.category?.name && (
          <div className="absolute right-3 top-3">
            <span className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
              {product.category.name}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        {businessHref && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
            <Link
              href={businessHref}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-lg transition-transform hover:scale-105"
            >
              <Store className="h-4 w-4" />
              Isletmeye Git
            </Link>
          </div>
        )}
      </div>

      <div className="p-5">
        {product.business?.name && (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 line-clamp-1">
            {product.business.name}
          </p>
        )}
        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        <div className="mt-4 flex items-end justify-between">
          <div>
            {originalPrice && (
              <p className="text-xs font-medium text-slate-400 line-through">{originalPrice}</p>
            )}
            <p className="text-xl font-bold tracking-tight text-slate-900">
              {displayPrice || "-"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProductGrid({ items, loading, viewMode }) {
  if (loading) {
    return (
      <div className={viewMode === "list" ? "space-y-4" : "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={`animate-pulse rounded-2xl border border-slate-200 bg-white ${viewMode === "list" ? "flex gap-5 p-4" : ""
              }`}
          >
            {viewMode === "list" ? (
              <>
                <div className="h-32 w-32 flex-shrink-0 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-3 w-24 rounded bg-slate-100" />
                  <div className="h-5 w-3/4 rounded bg-slate-100" />
                  <div className="h-6 w-32 rounded bg-slate-100" />
                </div>
              </>
            ) : (
              <>
                <div className="aspect-square w-full rounded-t-2xl bg-slate-100" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-20 rounded bg-slate-100" />
                  <div className="h-4 w-full rounded bg-slate-100" />
                  <div className="h-6 w-24 rounded bg-slate-100" />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-8 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
          <ShoppingBag className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Urun Bulunamadi</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Filtrelerinize uygun urun bulunamadi. Farkli filtreler deneyebilir veya tum urunleri gorebilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className={viewMode === "list" ? "space-y-4" : "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"}>
      {items.map((product) => (
        <ProductCard key={product.id} product={product} viewMode={viewMode} />
      ))}
    </div>
  );
}

function Pagination({ qs, page, totalPages }) {
  if (totalPages <= 1) return null;

  const safePage = Math.max(1, Number(page || 1));
  const safeTotalPages = Math.max(1, Number(totalPages || 1));
  const visiblePages = getVisiblePages(safePage, safeTotalPages);

  const prevHref = createHrefFromQuery(qs, { page: Math.max(1, safePage - 1) });
  const nextHref = createHrefFromQuery(qs, { page: Math.min(safeTotalPages, safePage + 1) });

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white px-6 py-4 sm:flex-row">
      <p className="text-sm text-slate-600">
        Sayfa <span className="font-bold text-slate-900">{safePage}</span> /{" "}
        <span className="font-bold text-slate-900">{safeTotalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        <Link
          href={prevHref}
          className={`flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold transition-all ${safePage <= 1
            ? "pointer-events-none bg-slate-50 text-slate-300"
            : "bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
        >
          <ChevronLeft className="h-4 w-4" />
          Onceki
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {visiblePages.map((pageNo) => (
            <Link
              key={pageNo}
              href={createHrefFromQuery(qs, { page: pageNo })}
              className={`flex h-10 min-w-10 items-center justify-center rounded-xl text-sm font-bold transition-all ${pageNo === safePage
                ? "bg-[#004aad] text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              {pageNo}
            </Link>
          ))}
        </div>

        <Link
          href={nextHref}
          className={`flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold transition-all ${safePage >= safeTotalPages
            ? "pointer-events-none bg-slate-50 text-slate-300"
            : "bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
        >
          Sonraki
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function MobileFilterDrawer({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-full max-w-sm overflow-y-auto bg-slate-50 shadow-xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">Filtreler</h2>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CivardakiMagazaContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const qs = useMemo(() => buildQueryFromSearchParams(sp), [sp]);
  const filtered = useMemo(() => hasAnyActiveFilter(sp), [sp]);

  const currentFilters = useMemo(() => ({
    q: sp.get("q") || "",
    categoryId: sp.get("categoryId") || "",
    min: sp.get("min") || "",
    max: sp.get("max") || "",
    inStockOnly: sp.get("inStockOnly") || "",
    sort: sp.get("sort") || "updatedDesc",
  }), [sp]);

  const handleFilterChange = useCallback((updates) => {
    const next = { ...currentFilters, ...updates, page: "1" };
    const query = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v && v !== "" && !(k === "sort" && v === "updatedDesc")) {
        query.set(k, String(v));
      }
    });
    const str = query.toString();
    router.push(str ? `${pathname}?${str}` : pathname);
  }, [currentFilters, pathname, router]);

  const handleReset = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/public/marketplace/products${qs ? `?${qs}` : ""}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setItems([]);
          setPagination(DEFAULT_PAGINATION);
          setError(data?.message || "Urunler yuklenirken bir hata olustu.");
          return;
        }

        setItems(Array.isArray(data?.items) ? data.items : []);
        setCategories(Array.isArray(data?.categories) ? data.categories : []);
        setPagination(data?.pagination || DEFAULT_PAGINATION);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setItems([]);
        setPagination(DEFAULT_PAGINATION);
        setError("Baglanti kurulamadi. Lutfen tekrar deneyin.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();
  }, [qs]);

  const total = Number(pagination?.total || 0);
  const pageNum = Math.max(1, Number(pagination?.page || 1));
  const totalPages = Math.max(1, Number(pagination?.totalPages || 1));
  const pageSize = Number(pagination?.pageSize || 24);

  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === currentFilters.sort)?.label || "Son Guncellenen";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mx-auto pt-6">
        <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
                <Store className="h-4 w-4" />
                Dijital Vitrin
              </div>

              <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
                Civardaki Mağaza
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                İşletmelerin pazaryerinde yayınladığı ürünleri keşfedin,
                stok durumlarını izleyin ve vitrini tek ekranda inceleyin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/business/products"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-5 text-sm font-semibold text-white transition-all hover:bg-white/20 backdrop-blur"
              >
                <Package className="h-4 w-4" />
                Ürünlerim
              </Link>
              <Link
                href="/business/settings/profile"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 shadow-sm"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Mağaza Ayarları
              </Link>
              <Link
                href="/business/civardaki-magaza"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-all hover:bg-blue-500 shadow-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Yenile
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto py-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard title="Toplam Urun" value={total} icon={Package} trend="Pazaryerindeki urunler" />
          <StatCard
            title="Kategori"
            value={categories.length}
            icon={Layers}
            trend="Aktif kategori"
          />
          <StatCard
            title="Sayfa"
            value={`${pageNum}/${totalPages}`}
            icon={BarChart3}
            trend={`${pageSize} urun/sayfa`}
          />
          <StatCard
            title="Filtre"
            value={filtered ? "Aktif" : "Yok"}
            icon={Filter}
            trend={filtered ? "Filtre uygulandi" : "Tum urunler"}
            trendUp={filtered}
          />
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden w-72 flex-shrink-0 lg:block">
            <FilterSidebar
              categories={categories}
              currentFilters={currentFilters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
              filtered={filtered}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtreler
                  {filtered && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#004aad] text-xs font-bold text-white">
                      !
                    </span>
                  )}
                </button>

                <p className="text-sm text-slate-600">
                  <span className="font-bold text-slate-900">{total}</span> urun bulundu
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden sm:inline">{currentSortLabel}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {sortDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              handleFilterChange({ sort: option.value });
                              setSortDropdownOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium transition-colors ${currentFilters.sort === option.value
                              ? "bg-[#004aad] text-white"
                              : "text-slate-700 hover:bg-slate-50"
                              }`}
                          >
                            {currentFilters.sort === option.value && <Check className="h-4 w-4" />}
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${viewMode === "grid"
                      ? "bg-[#004aad] text-white"
                      : "text-slate-400 hover:text-slate-600"
                      }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${viewMode === "list"
                      ? "bg-[#004aad] text-white"
                      : "text-slate-400 hover:text-slate-600"
                      }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {filtered && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Aktif Filtreler:
                </span>
                {currentFilters.q && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                    Arama: {currentFilters.q}
                    <button onClick={() => handleFilterChange({ q: "" })} className="text-slate-400 hover:text-slate-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {currentFilters.categoryId && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                    Kategori: {categories.find((c) => String(c.id) === currentFilters.categoryId)?.name || currentFilters.categoryId}
                    <button onClick={() => handleFilterChange({ categoryId: "" })} className="text-slate-400 hover:text-slate-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(currentFilters.min || currentFilters.max) && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                    Fiyat: {currentFilters.min || "0"} - {currentFilters.max || "Limitsiz"} TL
                    <button onClick={() => handleFilterChange({ min: "", max: "" })} className="text-slate-400 hover:text-slate-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {currentFilters.inStockOnly === "1" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                    Sadece Stokta
                    <button onClick={() => handleFilterChange({ inStockOnly: "" })} className="text-emerald-500 hover:text-emerald-700">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mb-5 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-rose-900">Bir sorun olustu</p>
                  <p className="mt-0.5 text-sm text-rose-700">{error}</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm transition-all hover:bg-rose-100"
                >
                  Tekrar Dene
                </button>
              </div>
            )}

            {/* Product Grid */}
            {!error && <ProductGrid items={items} loading={loading} viewMode={viewMode} />}

            {/* Pagination */}
            {!error && items.length > 0 && (
              <div className="mt-6">
                <Pagination qs={qs} page={pageNum} totalPages={totalPages} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer isOpen={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)}>
        <FilterSidebar
          categories={categories}
          currentFilters={currentFilters}
          onFilterChange={(updates) => {
            handleFilterChange(updates);
            setMobileFilterOpen(false);
          }}
          onReset={() => {
            handleReset();
            setMobileFilterOpen(false);
          }}
          filtered={filtered}
        />
      </MobileFilterDrawer>

      {/* Sort Dropdown Backdrop */}
      {sortDropdownOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setSortDropdownOpen(false)} />
      )}
    </div>
  );
}

export default function CivardakiMagazaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#004aad]" />
            <p className="text-sm font-semibold text-slate-600">Yukleniyor...</p>
          </div>
        </div>
      }
    >
      <CivardakiMagazaContent />
    </Suspense>
  );
}
