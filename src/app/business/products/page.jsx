"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
  Tag,
  Boxes,
  Search,
  FolderPlus,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { parseTrMoney } from "@/lib/tr-money";
import ProductFormWizard, {
  emptyProductForm,
  productToForm,
} from "./_components/ProductFormWizard";

function productDisplayCode(row) {
  if (row?.productCode) return row.productCode;
  if (row?.barcode) return row.barcode;
  return null;
}

function formatSalePrice(p) {
  const n =
    p?.discountPrice != null
      ? Number(p.discountPrice)
      : p?.price != null
      ? Number(p.price)
      : NaN;

  if (!Number.isFinite(n)) return "—";

  return `${n.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}

function formatStock(p) {
  if (p?.stock == null) return "—";
  const n = Number(p.stock);
  if (!Number.isFinite(n)) return "—";
  return `${n} ad`;
}

function StatCard({ title, value, sub, icon: Icon, tone = "blue" }) {
  const iconTones = {
    blue: "bg-blue-50 text-[#0057d9]",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div
      className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{value}</p>
          {sub ? <p className="mt-1.5 text-xs font-medium text-slate-500">{sub}</p> : null}
        </div>
        <div className={`rounded-2xl p-3 ${iconTones[tone] || iconTones.blue}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  icon: Icon,
  tone = "white",
  className = "",
  type = "button",
  disabled = false,
}) {
  const tones = {
    green:
      "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    blue: "bg-sky-500 hover:bg-sky-600 border-sky-600 text-white",
    orange:
      "bg-orange-400 hover:bg-orange-500 border-orange-400 text-white",
    dark: "bg-slate-900 hover:bg-slate-800 border-slate-900 text-white",
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
    primary:
      "bg-[#0057d9] hover:bg-[#004cc2] border-[#0057d9] text-white shadow-[0_8px_24px_rgba(0,87,217,0.28)]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${tones[tone]} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function ProductRowCell({ product, onEdit, onDelete }) {
  const code = productDisplayCode(product);
  return (
    <>
      <td className="px-4 py-4 md:px-5">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-slate-400">
                <Package className="h-5 w-5" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 leading-snug">{product.name}</p>
            {product.category?.name ? (
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {product.category.name}
              </p>
            ) : null}
            {code ? (
              <span className="mt-1.5 inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {code}
              </span>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-right md:px-5">
        <span className="inline-flex rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-bold tabular-nums text-[#0057d9]">
          {formatSalePrice(product)}
        </span>
      </td>
      <td className="px-4 py-4 text-right md:px-5">
        <span className="inline-flex rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold tabular-nums text-slate-700">
          {formatStock(product)}
        </span>
      </td>
      <td className="px-4 py-4 text-center md:px-5">
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-[#0057d9] transition hover:border-blue-200 hover:bg-blue-50"
            title="Düzenle"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
            title="Sil"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          <td className="px-4 py-4 md:px-5">
            <div className="h-10 rounded-md bg-slate-100 animate-pulse" />
          </td>
          <td className="px-4 py-4 text-right md:px-5">
            <div className="ml-auto h-4 w-24 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 text-right md:px-5">
            <div className="ml-auto h-4 w-16 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 text-center md:px-5">
            <div className="mx-auto flex w-fit gap-1">
              <div className="h-8 w-8 rounded bg-slate-200 animate-pulse" />
              <div className="h-8 w-8 rounded bg-slate-200 animate-pulse" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function ProductManager() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [searchInput, setSearchInput] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [sort, setSort] = useState("order");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);

  const [catForm, setCatForm] = useState({ id: null, name: "" });
  const [prodForm, setProdForm] = useState(() => emptyProductForm());
  const [uploadingImage, setUploadingImage] = useState(false);
  const [brandOptions, setBrandOptions] = useState([]);
  const [shelfOptions, setShelfOptions] = useState([]);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [brandDraft, setBrandDraft] = useState("");
  const [isShelfModalOpen, setIsShelfModalOpen] = useState(false);
  const [shelfDraft, setShelfDraft] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed.length === 0 || trimmed.length >= 3) {
        setSearchQ(trimmed);
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/business/product-categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.items || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Kategoriler yüklenemedi");
    }
  }, []);

  const fetchProductOptions = useCallback(async () => {
    try {
      const res = await fetch("/api/business/product-options");
      if (res.ok) {
        const data = await res.json();
        setBrandOptions(data.brands || []);
        setShelfOptions(data.shelfLocations || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const q = new URLSearchParams({
        page: String(page),
        limit: "50",
        status: filterStatus,
        sort,
      });

      if (filterCat) q.set("categoryId", filterCat);
      if (searchQ.length >= 3) q.set("q", searchQ);

      const res = await fetch(`/api/business/products?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.items || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error("Ürünler yüklenemedi");
      }
    } catch (e) {
      console.error(e);
      toast.error("Ürünler yüklenemedi");
    }
  }, [filterCat, filterStatus, page, searchQ, sort]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProductOptions();
  }, [fetchProductOptions]);

  useEffect(() => {
    if (!isProdModalOpen) return;
    const b = prodForm.brand?.trim();
    if (b) {
      setBrandOptions((prev) =>
        prev.includes(b) ? prev : [...prev, b].sort((a, x) => a.localeCompare(x, "tr")),
      );
    }
    const s = prodForm.shelfLocation?.trim();
    if (s) {
      setShelfOptions((prev) =>
        prev.includes(s) ? prev : [...prev, s].sort((a, x) => a.localeCompare(x, "tr")),
      );
    }
  }, [isProdModalOpen, prodForm.id, prodForm.brand, prodForm.shelfLocation]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchProducts().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [fetchProducts]);

  const summary = useMemo(() => {
    const totalProducts = products.length;
    const pricedProducts = products.filter(
      (p) => p.price != null || p.discountPrice != null
    ).length;
    const stockTracked = products.filter((p) => p.stock != null).length;
    const totalStock = products.reduce(
      (sum, p) => sum + (Number.isFinite(Number(p.stock)) ? Number(p.stock) : 0),
      0
    );

    return {
      totalProducts,
      pricedProducts,
      stockTracked,
      totalStock,
    };
  }, [products]);

  const openNewProduct = () => {
    setProdForm(emptyProductForm());
    setIsProdModalOpen(true);
  };

  const handleBrandModalSubmit = async (e) => {
    e.preventDefault();
    const t = brandDraft.trim();
    if (t.length < 2) {
      toast.error("Marka en az 2 karakter olmalı.");
      return;
    }
    setBrandOptions((prev) =>
      prev.includes(t) ? prev : [...prev, t].sort((a, x) => a.localeCompare(x, "tr")),
    );
    setProdForm((p) => ({ ...p, brand: t }));
    setIsBrandModalOpen(false);
    setBrandDraft("");
    toast.success("Marka seçildi.");
  };

  const handleShelfModalSubmit = async (e) => {
    e.preventDefault();
    const t = shelfDraft.trim();
    if (t.length < 2) {
      toast.error("Raf yeri en az 2 karakter olmalı.");
      return;
    }
    setShelfOptions((prev) =>
      prev.includes(t) ? prev : [...prev, t].sort((a, x) => a.localeCompare(x, "tr")),
    );
    setProdForm((p) => ({ ...p, shelfLocation: t }));
    setIsShelfModalOpen(false);
    setShelfDraft("");
    toast.success("Raf yeri seçildi.");
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catForm.name || catForm.name.length < 2) {
      return toast.error("Kategori adı çok kısa");
    }

    try {
      const url = catForm.id
        ? `/api/business/product-categories/${catForm.id}`
        : "/api/business/product-categories";
      const method = catForm.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: catForm.name }),
      });

      if (res.ok) {
        toast.success(catForm.id ? "Güncellendi" : "Eklendi");
        setIsCatModalOpen(false);
        setCatForm({ id: null, name: "" });
        fetchCategories();
      } else {
        const err = await res.json();
        toast.error(err.message || "Hata oluştu");
      }
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const handleProdSubmit = async (e) => {
    e.preventDefault();
    if (!prodForm.name || prodForm.name.length < 2) {
      return toast.error("Ürün adı çok kısa");
    }

    try {
      const url = prodForm.id
        ? `/api/business/products/${prodForm.id}`
        : "/api/business/products";
      const method = prodForm.id ? "PATCH" : "POST";

      const payload = {
        name: prodForm.name,
        description: prodForm.description,
        brand: prodForm.brand?.trim() ? prodForm.brand.trim() : null,
        price: parseTrMoney(prodForm.price),
        discountPrice: parseTrMoney(prodForm.discountPrice),
        categoryId: prodForm.categoryId || null,
        imageUrl: prodForm.imageUrl || null,
        isActive: prodForm.isActive,
        publishedOnMarketplace: !!prodForm.publishedOnMarketplace,
        stock:
          prodForm.stock === "" || prodForm.stock === null
            ? null
            : Number(prodForm.stock),
        maxOrderQty:
          prodForm.maxOrderQty === "" || prodForm.maxOrderQty === null
            ? null
            : Number(prodForm.maxOrderQty),
        barcode: prodForm.barcode?.trim() ? prodForm.barcode.trim().slice(0, 32) : null,
        productCode: prodForm.productCode?.trim()
          ? prodForm.productCode.trim().slice(0, 64)
          : null,
        gtip: prodForm.gtip?.trim() ? prodForm.gtip.trim().slice(0, 32) : null,
        gtin: prodForm.gtin?.trim() ? prodForm.gtin.trim().slice(0, 32) : null,
        shelfLocation: prodForm.shelfLocation?.trim()
          ? prodForm.shelfLocation.trim().slice(0, 128)
          : null,
        stockTracking: prodForm.stockTracking || "NORMAL",
        countryCode: prodForm.countryCode?.trim()
          ? prodForm.countryCode.trim()
          : null,
        serialInvoiceMode:
          (prodForm.stockTracking || "NORMAL") === "SERIAL"
            ? prodForm.serialInvoiceMode === "HIDE" ||
              prodForm.serialInvoiceMode === "SHOW" ||
              prodForm.serialInvoiceMode === "OPTIONAL"
              ? prodForm.serialInvoiceMode
              : "OPTIONAL"
            : null,
        salesUnit: prodForm.salesUnit || "ADET",
        tagsString: prodForm.tagsString?.trim()
          ? prodForm.tagsString.trim().slice(0, 8000)
          : null,
        priceCurrency:
          prodForm.priceCurrency === "USD" || prodForm.priceCurrency === "EUR"
            ? prodForm.priceCurrency
            : "TL",
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(prodForm.id ? "Güncellendi" : "Eklendi");
        setIsProdModalOpen(false);
        fetchProducts();
        fetchProductOptions();
      } else {
        const err = await res.json();
        toast.error(err.message || "Hata oluştu");
      }
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const deleteProd = async (id) => {
    if (!confirm("Ürünü silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/business/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Ürün silindi");
        fetchProducts();
      } else {
        toast.error("Silinemedi");
      }
    } catch {
      toast.error("Hata");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Maksimum dosya boyutu 5MB");
    }

    setUploadingImage(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "PRODUCT");

    try {
      const res = await fetch("/api/business/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProdForm((prev) => ({ ...prev, imageUrl: data.url }));
        toast.success("Görsel yüklendi");
      } else {
        const error = await res.json();
        toast.error(error.message || "Yükleme başarısız");
      }
    } catch {
      toast.error("Dosya yüklenemedi");
    } finally {
      setUploadingImage(false);
      e.target.value = null;
    }
  };

  const cyclePriceSort = () => {
    setPage(1);
    setSort((s) => (s === "priceAsc" ? "priceDesc" : "priceAsc"));
  };

  const cycleStockSort = () => {
    setPage(1);
    setSort((s) => (s === "stockAsc" ? "stockDesc" : "stockAsc"));
  };

  const priceSortIcon =
    sort === "priceAsc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : sort === "priceDesc" ? (
      <ArrowDown className="h-3.5 w-3.5" />
    ) : (
      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
    );

  const stockSortIcon =
    sort === "stockAsc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : sort === "stockDesc" ? (
      <ArrowDown className="h-3.5 w-3.5" />
    ) : (
      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
    );

  const inp =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400";
  const label =
    "mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-10 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] p-4 text-[13px] text-slate-800 antialiased md:p-6">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] md:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#0057d9]">
                <Package className="h-4 w-4" />
                Ürün Yönetimi
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                Ürünler & Hizmetler
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 md:text-base">
                İşletmenize ait ürün ve hizmetleri yönetin, fiyat ve stok bilgilerini güncelleyin.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ActionButton onClick={openNewProduct} icon={Plus} tone="primary">
                Yeni Ürün / Hizmet Ekle
              </ActionButton>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Toplam Kayıt"
            value={String(summary.totalProducts)}
            sub="Listelenen ürün / hizmet sayısı"
            icon={Package}
            tone="blue"
          />
          <StatCard
            title="Fiyatlı Ürün"
            value={String(summary.pricedProducts)}
            sub="Fiyat bilgisi girilmiş kayıt"
            icon={Tag}
            tone="emerald"
          />
          <StatCard
            title="Stok Takibi"
            value={String(summary.stockTracked)}
            sub="Stok alanı dolu kayıt"
            icon={Boxes}
            tone="amber"
          />
          <StatCard
            title="Toplam Stok"
            value={String(summary.totalStock)}
            sub="Listelenen stok adedi"
            icon={Boxes}
            tone="slate"
          />
        </section>

        <section className="rounded-[28px] border border-slate-100 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                Filtreler
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Durum, kategori ve arama kriterine göre ürünleri filtreleyin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setFilterStatus("active");
                  }}
                  className={`rounded-lg px-3 py-2 transition-colors ${
                    filterStatus === "active"
                      ? "bg-[#0057d9] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Aktif Ürünler
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setFilterStatus("all");
                  }}
                  className={`rounded-lg px-3 py-2 transition-colors ${
                    filterStatus === "all"
                      ? "bg-[#0057d9] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Tüm Ürünler
                </button>
              </div>

              <select
                value={filterCat}
                onChange={(e) => {
                  setPage(1);
                  setFilterCat(e.target.value);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none md:min-w-[180px]"
              >
                <option value="">Tüm kategoriler</option>
                <option value="null">Kategorisiz</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Ürün veya kod ara (en az 3 karakter)"
                  className="min-w-[220px] rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium outline-none placeholder:text-slate-400 focus:border-[#0057d9] focus:ring-4 focus:ring-blue-500/10 md:w-80"
                />
              </div>

              <ActionButton
                onClick={() => {
                  setCatForm({ id: null, name: "" });
                  setIsCatModalOpen(true);
                }}
                icon={FolderPlus}
                tone="white"
              >
                Kategori Ekle
              </ActionButton>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ürün Listesi</h3>
              <p className="mt-1 text-sm text-slate-500">
                Seçili filtrelere göre listelenen ürün / hizmet kayıtları
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
                Kayıt: {products.length}
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
                Sayfa: {page}/{totalPages}
              </span>
            </div>
          </div>

          <div className="max-h-[min(70vh,720px)] overflow-x-auto">
            <table className="min-w-[640px] w-full border-collapse text-left text-[13px]">
              <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide md:px-5">
                    Ürün / Hizmet
                  </th>
                  <th className="w-40 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide md:px-5">
                    <button
                      type="button"
                      onClick={cyclePriceSort}
                      className="inline-flex w-full items-center justify-end gap-1 text-slate-500 hover:text-slate-800"
                    >
                      Satış Fiyatı
                      {priceSortIcon}
                    </button>
                  </th>
                  <th className="w-40 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide md:px-5">
                    <button
                      type="button"
                      onClick={cycleStockSort}
                      className="inline-flex w-full items-center justify-end gap-1 text-slate-500 hover:text-slate-800"
                    >
                      Stok Miktarı
                      {stockSortIcon}
                    </button>
                  </th>
                  <th className="w-32 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide md:px-5">
                    İşlem
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-14 text-center text-slate-500 md:px-5">
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-100 bg-white transition hover:bg-slate-50/80"
                    >
                      <ProductRowCell
                        product={p}
                        onEdit={() => {
                          setProdForm(productToForm(p));
                          setIsProdModalOpen(true);
                        }}
                        onDelete={() => deleteProd(p.id)}
                      />
                    </tr>
                  ))
                )}

                {loading && <TableSkeleton />}
              </tbody>
            </table>
          </div>
        </section>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((x) => x - 1)}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"
            >
              Önceki
            </button>

            <span className="px-4 py-2 text-sm font-bold text-slate-900">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((x) => x + 1)}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCatModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
            >
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Kategori
                    </p>
                    <h3 className="mt-1 flex items-center gap-2 text-lg font-bold text-slate-900">
                      <FolderPlus className="h-5 w-5 text-[#0057d9]" />
                      {catForm.id ? "Kategori düzenle" : "Yeni kategori ekle"}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCatModalOpen(false);
                      setCatForm({ id: null, name: "" });
                    }}
                    className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCatSubmit} className="space-y-4 p-5">
                <div>
                  <label className={label}>Kategori adı</label>
                  <input
                    type="text"
                    value={catForm.name}
                    onChange={(e) =>
                      setCatForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className={inp}
                    placeholder="Örn: Tatlılar"
                    autoFocus
                    required
                    minLength={2}
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCatModalOpen(false);
                      setCatForm({ id: null, name: "" });
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                  >
                    İptal
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0057d9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0046b0]"
                  >
                    <Check className="h-4 w-4" />
                    {catForm.id ? "Güncelle" : "Kaydet"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isProdModalOpen && (
          <ProductFormWizard
            key={prodForm.id || "new-product"}
            prodForm={prodForm}
            setProdForm={setProdForm}
            categories={categories}
            onSubmit={handleProdSubmit}
            onClose={() => setIsProdModalOpen(false)}
            uploadingImage={uploadingImage}
            onImageUpload={handleImageUpload}
            onRequestCategoryModal={() => {
              setCatForm({ id: null, name: "" });
              setIsCatModalOpen(true);
            }}
            brandOptions={brandOptions}
            shelfOptions={shelfOptions}
            onRequestBrandModal={() => {
              setBrandDraft("");
              setIsBrandModalOpen(true);
            }}
            onRequestShelfModal={() => {
              setShelfDraft("");
              setIsShelfModalOpen(true);
            }}
          />
        )}

        {isBrandModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
            >
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Marka
                    </p>
                    <h3 className="mt-1 flex items-center gap-2 text-lg font-bold">
                      <Tag className="h-5 w-5 opacity-90" />
                      Yeni marka ekle
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBrandModalOpen(false);
                      setBrandDraft("");
                    }}
                    className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleBrandModalSubmit} className="space-y-4 p-5">
                <div>
                  <label className={label}>Marka adı</label>
                  <input
                    type="text"
                    value={brandDraft}
                    onChange={(e) => setBrandDraft(e.target.value)}
                    className={inp}
                    placeholder="Örn: Örnek Marka"
                    autoFocus
                    minLength={2}
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBrandModalOpen(false);
                      setBrandDraft("");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0057d9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0046b0]"
                  >
                    <Check className="h-4 w-4" />
                    Seç ve uygula
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isShelfModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
            >
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Depo / raf
                    </p>
                    <h3 className="mt-1 flex items-center gap-2 text-lg font-bold text-slate-900">
                      <Boxes className="h-5 w-5 text-[#0057d9]" />
                      Yeni raf yeri ekle
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsShelfModalOpen(false);
                      setShelfDraft("");
                    }}
                    className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleShelfModalSubmit} className="space-y-4 p-5">
                <div>
                  <label className={label}>Raf yeri veya depo adı</label>
                  <input
                    type="text"
                    value={shelfDraft}
                    onChange={(e) => setShelfDraft(e.target.value)}
                    className={inp}
                    placeholder="Örn: A-12, Ana depo"
                    autoFocus
                    minLength={2}
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsShelfModalOpen(false);
                      setShelfDraft("");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0057d9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0046b0]"
                  >
                    <Check className="h-4 w-4" />
                    Seç ve uygula
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
