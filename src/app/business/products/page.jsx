"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FileSpreadsheet,
  RefreshCw,
  Images,
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
  Download,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { parseTrMoney } from "@/lib/tr-money";
import ProductFormWizard, {
  emptyProductForm,
  productToForm,
} from "./_components/ProductFormWizard";

function productDisplayCode(row) {
  const digits = String(row?.slug || "").replace(/\D/g, "");
  if (digits.length >= 4) return `DKV${digits.slice(-4)}`;

  const alnum = String(row?.id || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  const tail = alnum.slice(-4).padStart(4, "0");
  return `DKV${tail.slice(-4)}`;
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
  const tones = {
    blue: "from-blue-600 to-indigo-700 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    amber: "from-amber-400 to-orange-500 text-white",
    slate: "from-slate-800 to-slate-900 text-white",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br ${tones[tone]} p-5 shadow-[0_12px_30px_rgba(15,23,42,0.14)]`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
            {title}
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
          {sub ? <p className="mt-2 text-xs text-white/75">{sub}</p> : null}
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
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
  const [uploadingBulkImages, setUploadingBulkImages] = useState(false);
  const bulkImageInputRef = useRef(null);
  const [uploadingBulkUpdate, setUploadingBulkUpdate] = useState(false);
  const bulkUpdateInputRef = useRef(null);
  const [uploadingExcelCreate, setUploadingExcelCreate] = useState(false);
  const excelCreateImportRef = useRef(null);

  const [mainTab, setMainTab] = useState("list");
  const [bulkDelProducts, setBulkDelProducts] = useState([]);
  const [bulkDelLoading, setBulkDelLoading] = useState(false);
  const [bulkDelPage, setBulkDelPage] = useState(1);
  const [bulkDelTotalPages, setBulkDelTotalPages] = useState(1);
  const [bulkDelQ, setBulkDelQ] = useState("");
  const [bulkDelStatus, setBulkDelStatus] = useState("all");
  const [bulkDelStock, setBulkDelStock] = useState("");
  const [bulkDelCat, setBulkDelCat] = useState("");
  const [bulkDelBrand, setBulkDelBrand] = useState("");
  const [bulkDelWarehouse, setBulkDelWarehouse] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [bulkSelected, setBulkSelected] = useState(() => new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

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
    if (mainTab !== "bulk-delete") return;
    (async () => {
      try {
        const res = await fetch("/api/business/warehouses");
        if (res.ok) {
          const data = await res.json();
          setWarehouses(Array.isArray(data) ? data : []);
        }
      } catch {
        /* ignore */
      }
    })();
  }, [mainTab]);

  const runBulkList = async (p) => {
    setBulkDelLoading(true);
    setBulkDelPage(p);
    try {
      const q = new URLSearchParams({
        page: String(p),
        limit: "100",
        status: bulkDelStatus,
        sort: "order",
        bulk: "1",
      });
      if (bulkDelCat) q.set("categoryId", bulkDelCat);
      if (bulkDelBrand) q.set("brand", bulkDelBrand);
      if (bulkDelStock) q.set("stockFilter", bulkDelStock);
      if (bulkDelWarehouse) q.set("warehouseId", bulkDelWarehouse);
      if (bulkDelQ.trim().length >= 2) q.set("q", bulkDelQ.trim());

      const res = await fetch(`/api/business/products?${q.toString()}`);
      if (!res.ok) {
        toast.error("Ürünler yüklenemedi.");
        return;
      }
      const data = await res.json();
      setBulkDelProducts(data.items || []);
      setBulkDelTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      console.error(e);
      toast.error("Ürünler yüklenemedi.");
    } finally {
      setBulkDelLoading(false);
    }
  };

  const toggleBulkOne = (id) => {
    setBulkSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleBulkPage = () => {
    const pageIds = bulkDelProducts.map((x) => x.id);
    const allOn =
      pageIds.length > 0 && pageIds.every((id) => bulkSelected.has(id));
    setBulkSelected((prev) => {
      const n = new Set(prev);
      if (allOn) pageIds.forEach((id) => n.delete(id));
      else pageIds.forEach((id) => n.add(id));
      return n;
    });
  };

  const deleteBulkSelected = async () => {
    const ids = [...bulkSelected];
    if (ids.length === 0) return;
    if (
      !confirm(
        `${ids.length} ürün kalıcı olarak silinsin mi? Bu işlem geri alınamaz.`,
      )
    ) {
      return;
    }
    setBulkDeleting(true);
    try {
      const res = await fetch("/api/business/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Silinemedi.");
        return;
      }
      toast.success(data.message || "Silindi.");
      setBulkSelected(new Set());
      await runBulkList(bulkDelPage);
      fetchProducts();
    } catch {
      toast.error("Silinemedi.");
    } finally {
      setBulkDeleting(false);
    }
  };

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
    try {
      const res = await fetch("/api/business/masterdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "PRODUCT_BRAND", name: t }),
      });
      if (!res.ok && res.status !== 409) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Marka kaydedilemedi.");
        return;
      }
      await fetchProductOptions();
      setProdForm((p) => ({ ...p, brand: t }));
      setIsBrandModalOpen(false);
      setBrandDraft("");
      toast.success(
        res.status === 409
          ? "Bu marka zaten tanımlıydı; seçildi."
          : "Marka tanımlara kaydedildi ve seçildi.",
      );
    } catch {
      toast.error("Marka kaydedilemedi.");
    }
  };

  const downloadProductImageList = async () => {
    try {
      const res = await fetch("/api/business/products/export-images");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Liste indirilemedi.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `urun-resim-listesi-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Ürün listesi indirildi.");
    } catch {
      toast.error("İndirme başarısız.");
    }
  };

  const downloadProductUpdateList = async () => {
    try {
      const res = await fetch("/api/business/products/export-update");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Liste indirilemedi.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `urun-toplu-guncelleme-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Ürün listesi indirildi.");
    } catch {
      toast.error("İndirme başarısız.");
    }
  };

  const onBulkUpdateFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingBulkUpdate(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/business/products/import-update", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Yükleme başarısız.");
        return;
      }
      toast.success(data.message || "Tamamlandı.");
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        data.errors.slice(0, 8).forEach((err) =>
          toast.message(`Satır ${err.row}: ${err.message}`),
        );
        if (data.errors.length > 8) {
          toast.message(`…ve ${data.errors.length - 8} satır daha.`);
        }
      }
      fetchProducts();
    } catch {
      toast.error("Yükleme başarısız.");
    } finally {
      setUploadingBulkUpdate(false);
    }
  };

  const downloadExcelCreateTemplate = async () => {
    try {
      const res = await fetch("/api/business/products/import-create");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Şablon indirilemedi.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `urun-yukleme-sablonu-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Şablon indirildi.");
    } catch {
      toast.error("İndirme başarısız.");
    }
  };

  const onExcelCreateImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingExcelCreate(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/business/products/import-create", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Yükleme başarısız.");
        return;
      }
      toast.success(data.message || "Tamamlandı.");
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        data.errors.slice(0, 8).forEach((err) =>
          toast.message(`Satır ${err.row}: ${err.message}`),
        );
        if (data.errors.length > 8) {
          toast.message(`…ve ${data.errors.length - 8} satır daha.`);
        }
      }
      fetchProducts();
    } catch {
      toast.error("Yükleme başarısız.");
    } finally {
      setUploadingExcelCreate(false);
    }
  };

  const onBulkImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingBulkImages(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/business/products/import-images", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Yükleme başarısız.");
        return;
      }
      toast.success(data.message || "Tamamlandı.");
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        data.errors.slice(0, 8).forEach((err) =>
          toast.message(`Satır ${err.row}: ${err.message}`),
        );
        if (data.errors.length > 8) {
          toast.message(`…ve ${data.errors.length - 8} satır daha.`);
        }
      }
      fetchProducts();
    } catch {
      toast.error("Yükleme başarısız.");
    } finally {
      setUploadingBulkImages(false);
    }
  };

  const handleShelfModalSubmit = async (e) => {
    e.preventDefault();
    const t = shelfDraft.trim();
    if (t.length < 2) {
      toast.error("Raf yeri en az 2 karakter olmalı.");
      return;
    }
    try {
      const res = await fetch("/api/business/masterdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "SHELF_LOCATION", name: t }),
      });
      if (!res.ok && res.status !== 409) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Raf yeri kaydedilemedi.");
        return;
      }
      await fetchProductOptions();
      setProdForm((p) => ({ ...p, shelfLocation: t }));
      setIsShelfModalOpen(false);
      setShelfDraft("");
      toast.success(
        res.status === 409
          ? "Bu raf yeri zaten tanımlıydı; seçildi."
          : "Raf yeri tanımlara kaydedildi ve seçildi.",
      );
    } catch {
      toast.error("Raf yeri kaydedilemedi.");
    }
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
    <div className="min-h-[calc(100vh-8rem)] space-y-6 bg-slate-100/80 p-4 text-[13px] text-slate-800 antialiased md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
                <Package className="h-4 w-4" />
                Ürün Yönetimi
              </div>

              <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
                Ürünler / Hizmetler
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                Ürün ve hizmetlerinizi yönetin, fiyat ve stok bilgilerini takip edin,
                kategori bazlı filtreleyin ve içerikleri düzenleyin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ActionButton
                onClick={openNewProduct}
                icon={Plus}
                tone="green"
              >
                Yeni Ürün/Hizmet Ekle
              </ActionButton>

                <div className="flex flex-col items-stretch gap-1.5">
                <input
                  ref={excelCreateImportRef}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="sr-only"
                  onChange={onExcelCreateImport}
                />
                <ActionButton
                  onClick={() => excelCreateImportRef.current?.click()}
                  icon={FileSpreadsheet}
                  tone="orange"
                  disabled={uploadingExcelCreate}
                >
                  {uploadingExcelCreate ? "Yükleniyor…" : "Excel'den Ürün Yükle"}
                </ActionButton>
                <button
                  type="button"
                  onClick={downloadExcelCreateTemplate}
                  className="text-center text-[11px] font-semibold text-white/70 underline-offset-2 hover:text-white hover:underline"
                >
                  Boş Excel şablonu indir
                </button>
              </div>

              <ActionButton
                type="button"
                onClick={() => setMainTab("bulk-update")}
                icon={RefreshCw}
                tone="blue"
              >
                Toplu Güncelleme
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

        <div className="flex flex-wrap gap-2 rounded-[24px] border border-slate-200 bg-white p-2 shadow-sm">
          <button
            type="button"
            onClick={() => setMainTab("list")}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              mainTab === "list"
                ? "bg-slate-900 text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Package className="h-4 w-4" />
              Ürün listesi
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab("bulk-images")}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              mainTab === "bulk-images"
                ? "bg-slate-900 text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Images className="h-4 w-4" />
              Toplu resim güncelleme
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab("bulk-update")}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              mainTab === "bulk-update"
                ? "bg-slate-900 text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Toplu ürün güncelleme
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab("bulk-delete")}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              mainTab === "bulk-delete"
                ? "bg-slate-900 text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Toplu ürün silme
            </span>
          </button>
        </div>

        {mainTab === "list" && (
          <>
        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-5">
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
                      ? "bg-slate-900 text-white"
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
                      ? "bg-slate-900 text-white"
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
                  placeholder="arama... (en az 3 karakter)"
                  className="min-w-[220px] rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 md:w-72"
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

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
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

          <div className="max-h-[min(70vh,720px)] overflow-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-900 text-white">
                  <th className="border-b border-slate-800 px-4 py-3 font-semibold md:px-5">
                    Ürün Hizmet Adı
                  </th>
                  <th className="w-40 border-b border-slate-800 px-4 py-3 text-right font-semibold md:px-5">
                    <button
                      type="button"
                      onClick={cyclePriceSort}
                      className="inline-flex w-full items-center justify-end gap-1 hover:opacity-90"
                    >
                      Satış Fiyatı
                      {priceSortIcon}
                    </button>
                  </th>
                  <th className="w-40 border-b border-slate-800 px-4 py-3 text-right font-semibold md:px-5">
                    <button
                      type="button"
                      onClick={cycleStockSort}
                      className="inline-flex w-full items-center justify-end gap-1 hover:opacity-90"
                    >
                      Stok Miktarı
                      {stockSortIcon}
                    </button>
                  </th>
                  <th className="w-28 border-b border-slate-800 px-4 py-3 text-center font-semibold md:px-5">
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
                  products.map((p, index) => (
                    <tr
                      key={p.id}
                      className={`border-b border-slate-100 transition hover:bg-sky-50/70 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }`}
                    >
                      <td className="px-4 py-3.5 md:px-5">
                        <div className="flex min-h-[2.75rem] items-center justify-between gap-2 rounded-md bg-sky-100 px-3 py-2 text-slate-900">
                          <span className="min-w-0 flex-1 font-medium leading-snug">
                            {p.name}
                          </span>
                          <span className="shrink-0 rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">
                            {productDisplayCode(p)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-medium tabular-nums md:px-5">
                        {formatSalePrice(p)}
                      </td>

                      <td className="px-4 py-3.5 text-right font-medium tabular-nums md:px-5">
                        {formatStock(p)}
                      </td>

                      <td className="px-4 py-3.5 text-center md:px-5">
                        <div className="flex justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setProdForm(productToForm(p));
                              setIsProdModalOpen(true);
                            }}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            title="Düzenle"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteProd(p.id)}
                            className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
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
          </>
        )}

        {mainTab === "bulk-images" && (
        <section
          id="toplu-resim"
          className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                Toplu resim güncelleme
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Önce ürün listenizi indirin; resim URL’lerini Excel’de doldurup
                yükleyin.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadProductImageList}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-700 bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Download className="h-4 w-4" />
              Ürün Listesi İndir
            </button>
          </div>

          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm leading-relaxed text-amber-950">
            <p className="font-semibold text-amber-900">Nasıl kullanılır?</p>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-amber-950/90">
              <li>
                Önce ürünlerinizi indirin, resim adreslerini dosyada güncelleyin,
                ardından yükleme düğmesini kullanın.
              </li>
              <li>
                Sütun sırasını değiştirmeyin ve sütun silmeyin. Yeni satır
                eklemeyin; yalnızca mevcut ürünler güncellenir.
              </li>
              <li>
                Resim adresleri <strong>https://</strong> ile başlamalıdır; SSL
                olmayan adresler işlenmez.
              </li>
              <li>
                Uzantı: yalnızca <strong>.jpg</strong>, <strong>.jpeg</strong>,{" "}
                <strong>.gif</strong>, <strong>.png</strong>
              </li>
              <li>
                Yükleme, ilgili ürünlerin mevcut resimlerini bu dosyadaki
                adreslerle değiştirir (en fazla 6 resim / ürün).
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/80 p-4">
            <p className="text-sm font-medium text-emerald-950">
              Hazır dosyayı aşağıdaki düğme ile yükleyin.
            </p>
            <input
              ref={bulkImageInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              onChange={onBulkImageFileChange}
            />
            <button
              type="button"
              disabled={uploadingBulkImages}
              onClick={() => bulkImageInputRef.current?.click()}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-700 bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60 sm:w-auto"
            >
              {uploadingBulkImages ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Excel Dosyası Yükleyin
            </button>
            <p className="mt-3 text-xs leading-relaxed text-red-800/90">
              İşlem sırasında çözemediğiniz bir sorun olursa Excel dosyanızı{" "}
              <a
                href="mailto:destek@bizimhesap.com"
                className="font-semibold underline underline-offset-2"
              >
                destek@bizimhesap.com
              </a>{" "}
              adresine gönderebilirsiniz.
            </p>
          </div>
        </section>
        )}

        {mainTab === "bulk-update" && (
        <section
          id="toplu-urun-guncelleme"
          className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                Toplu ürün güncelleme
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Ürün fiyatlarını ve diğer alanları toplu güncellemek için önce
                mevcut ürün listenizi indirin; Excel’de düzenleyip kaydettikten
                sonra kırmızı düğme ile yükleyin.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadProductUpdateList}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-700 bg-[#5cb85c] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Download className="h-4 w-4" />
              Ürün Listesi İndir
            </button>
          </div>

          <div className="rounded-2xl border border-amber-200/80 bg-[#fffbeb] p-4 text-sm leading-relaxed text-amber-950 shadow-sm">
            <p className="text-amber-950/95">
              Önce yeşil <strong>Ürün Listesi İndir</strong> düğmesiyle
              güncel ürünlerinizi bilgisayarınıza indirin. Fiyat ve diğer
              alanları dosyada güncelleyip kaydettikten sonra kırmızı{" "}
              <strong>Excel Dosyası Yükleyin</strong> düğmesiyle sisteme
              yükleyin.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-amber-950/90">
              <li>Sütun sırasını değiştirmeyin ve sütun silmeyin.</li>
              <li>
                <span className="font-bold text-red-700">
                  Ürün isimlerini değiştirmeyin.
                </span>{" "}
                Diğer sütunları güncelleyebilirsiniz.
              </li>
              <li>
                Para birimi için TL, USD, EUR vb. kullanın (ürün kartında
                gördüğünüz gibi). Boş bırakırsanız varsayılan TL kabul edilir.
              </li>
              <li>
                Satış birimi için adet, kg, metre vb. sistemdeki ifadeleri
                kullanın.
              </li>
              <li>
                Pasifleştirmek istediğiniz ürünler için{" "}
                <strong>Aktif/Pasif</strong> sütununda <strong>P</strong>{" "}
                yazın; aktif için <strong>A</strong>.
              </li>
              <li>
                Eşdeğer ürün kodlarını <strong>Etiketler</strong> sütununda
                virgülle ayırarak güncelleyin.
              </li>
              <li>
                <span className="font-bold text-red-700">
                  Dosyaya yeni satır eklemeyin.
                </span>{" "}
                Bu dosya yalnızca mevcut ürünleri güncellemek içindir.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/90 p-4 shadow-sm">
            <p className="text-sm font-medium text-emerald-950">
              Doldurduğunuz Excel dosyasını aşağıdaki düğme ile sisteme
              yükleyin.
            </p>
            <input
              ref={bulkUpdateInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              onChange={onBulkUpdateFileChange}
            />
            <button
              type="button"
              disabled={uploadingBulkUpdate}
              onClick={() => bulkUpdateInputRef.current?.click()}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-700 bg-[#d9534f] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60 sm:w-auto"
            >
              {uploadingBulkUpdate ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Excel Dosyası Yükleyin
            </button>
            <p className="mt-3 text-xs leading-relaxed text-red-900/95">
              İşlem esnasında çözemediğiniz bir problem olursa Excel dosyanızı{" "}
              <a
                href="mailto:destek@bizimhesap.com"
                className="font-semibold underline underline-offset-2"
              >
                destek@bizimhesap.com
              </a>{" "}
              adresine gönderin.
            </p>
          </div>
        </section>
        )}

        {mainTab === "bulk-delete" && (
        <div className="space-y-4">
          <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-6">
            <div className="mb-4 rounded-xl bg-[#004aad] px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-white">
              Toplu ürün silme
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className={label}>Ürün</label>
                <input
                  type="search"
                  value={bulkDelQ}
                  onChange={(e) => setBulkDelQ(e.target.value)}
                  placeholder="Ürün adı, kodu veya barkod"
                  className={inp}
                />
              </div>
              <div>
                <label className={label}>Ürün durumu</label>
                <select
                  value={bulkDelStatus}
                  onChange={(e) => setBulkDelStatus(e.target.value)}
                  className={inp}
                >
                  <option value="all">Tüm ürünler</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
              <div>
                <label className={label}>Stok durumu</label>
                <select
                  value={bulkDelStock}
                  onChange={(e) => setBulkDelStock(e.target.value)}
                  className={inp}
                >
                  <option value="">Tümü</option>
                  <option value="positive">Stok &gt; 0</option>
                  <option value="zero">Stok = 0</option>
                  <option value="negative">Stok &lt; 0</option>
                  <option value="unset">Stok tanımsız</option>
                </select>
              </div>
              <div>
                <label className={label}>Kategori</label>
                <select
                  value={bulkDelCat}
                  onChange={(e) => setBulkDelCat(e.target.value)}
                  className={inp}
                >
                  <option value="">Tüm kategoriler</option>
                  <option value="null">Kategorisiz</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Marka</label>
                <select
                  value={bulkDelBrand}
                  onChange={(e) => setBulkDelBrand(e.target.value)}
                  className={inp}
                >
                  <option value="">Tüm markalar</option>
                  {brandOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Depo</label>
                <select
                  value={bulkDelWarehouse}
                  onChange={(e) => setBulkDelWarehouse(e.target.value)}
                  className={inp}
                >
                  <option value="">Tüm depolar</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setBulkSelected(new Set());
                  void runBulkList(1);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Ürün Listele
              </button>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={bulkDeleting || bulkSelected.size === 0}
              onClick={deleteBulkSelected}
              className="inline-flex items-center gap-2 rounded-xl border border-red-800 bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Seçilenleri Sil ({bulkSelected.size})
            </button>
          </div>

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="max-h-[min(70vh,720px)] overflow-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-700 text-white">
                    <th className="w-10 border-b border-slate-600 px-2 py-3 text-center md:px-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300"
                        checked={
                          bulkDelProducts.length > 0 &&
                          bulkDelProducts.every((p) => bulkSelected.has(p.id))
                        }
                        onChange={toggleBulkPage}
                        title="Sayfadaki tümünü seç"
                      />
                    </th>
                    <th className="border-b border-slate-600 px-4 py-3 font-semibold md:px-5">
                      Ürün adı
                    </th>
                    <th className="w-28 border-b border-slate-600 px-4 py-3 font-semibold md:px-5">
                      Barkod
                    </th>
                    <th className="w-28 border-b border-slate-600 px-4 py-3 font-semibold md:px-5">
                      Ürün kodu
                    </th>
                    <th className="w-32 border-b border-slate-600 px-4 py-3 font-semibold md:px-5">
                      Marka
                    </th>
                    <th className="w-32 border-b border-slate-600 px-4 py-3 font-semibold md:px-5">
                      Kategori
                    </th>
                    <th className="w-24 border-b border-slate-600 px-4 py-3 text-right font-semibold md:px-5">
                      Stok
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bulkDelLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
                      </td>
                    </tr>
                  ) : bulkDelProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-14 text-center text-slate-500">
                        Ürünleri görmek için filtreleri seçip{" "}
                        <strong>Ürün Listele</strong>ye basın.
                      </td>
                    </tr>
                  ) : (
                    bulkDelProducts.map((p, index) => (
                      <tr
                        key={p.id}
                        className={`border-b border-slate-100 ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                        }`}
                      >
                        <td className="px-2 py-2 text-center md:px-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300"
                            checked={bulkSelected.has(p.id)}
                            onChange={() => toggleBulkOne(p.id)}
                          />
                        </td>
                        <td className="px-4 py-2.5 font-medium text-slate-900 md:px-5">
                          {p.name}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-700 md:px-5">
                          {p.barcode || "—"}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-700 md:px-5">
                          {p.productCode || productDisplayCode(p)}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 md:px-5">
                          {p.brand || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 md:px-5">
                          {p.category?.name || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-slate-800 md:px-5">
                          {formatStock(p)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {bulkDelTotalPages > 1 && (
            <div className="flex justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <button
                type="button"
                disabled={bulkDelPage === 1 || bulkDelLoading}
                onClick={() => void runBulkList(bulkDelPage - 1)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"
              >
                Önceki
              </button>
              <span className="px-4 py-2 text-sm font-bold text-slate-900">
                {bulkDelPage} / {bulkDelTotalPages}
              </span>
              <button
                type="button"
                disabled={
                  bulkDelPage === bulkDelTotalPages || bulkDelLoading
                }
                onClick={() => void runBulkList(bulkDelPage + 1)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"
              >
                Sonraki
              </button>
            </div>
          )}
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
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 px-5 py-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                      Kategori
                    </p>
                    <h3 className="mt-1 flex items-center gap-2 text-lg font-bold">
                      <FolderPlus className="h-5 w-5 opacity-90" />
                      {catForm.id ? "Kategori düzenle" : "Yeni kategori ekle"}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCatModalOpen(false);
                      setCatForm({ id: null, name: "" });
                    }}
                    className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
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
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
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
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 px-5 py-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
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
                    className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
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
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
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
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                      Depo / raf
                    </p>
                    <h3 className="mt-1 flex items-center gap-2 text-lg font-bold">
                      <Boxes className="h-5 w-5 opacity-90" />
                      Yeni raf yeri ekle
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsShelfModalOpen(false);
                      setShelfDraft("");
                    }}
                    className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
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
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
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