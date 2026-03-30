"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  SwatchIcon,
  CubeIcon,
  QueueListIcon,
  CheckIcon,
  Squares2X2Icon,
  ArchiveBoxIcon,
  TagIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

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
    rose: "bg-rose-600 hover:bg-rose-700 border-rose-700 text-white",
    amber:
      "bg-amber-500 hover:bg-amber-600 border-amber-500 text-white",
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
    dark: "bg-slate-900 hover:bg-slate-800 border-slate-900 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
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

function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ModalShell({ title, children, onClose, footer, wide = false }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className={`relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)] ${
          wide ? "max-w-2xl" : "max-w-lg"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                Varyant Yönetimi
              </p>
              <h2 className="mt-1 text-lg font-bold">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer ? (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
            {footer}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

function DefinitionSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="h-14 bg-slate-200 animate-pulse" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
            <div className="flex flex-wrap gap-2">
              <div className="h-7 w-16 rounded-lg bg-slate-100 animate-pulse" />
              <div className="h-7 w-20 rounded-lg bg-slate-100 animate-pulse" />
              <div className="h-7 w-14 rounded-lg bg-slate-100 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="bg-slate-900 text-white">
          <tr>
            <th className="px-4 py-3 font-semibold">Varyant / Ürün</th>
            <th className="px-4 py-3 font-semibold">Fiyat</th>
            <th className="px-4 py-3 font-semibold">Stok / Max Sipariş</th>
            <th className="px-4 py-3 font-semibold">SKU</th>
            <th className="px-4 py-3 font-semibold text-right">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 7 }).map((_, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="px-4 py-4">
                <div className="h-4 w-44 rounded bg-slate-200 animate-pulse" />
                <div className="mt-2 h-3 w-24 rounded bg-slate-100 animate-pulse" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
                <div className="mt-2 h-3 w-20 rounded bg-slate-100 animate-pulse" />
              </td>
              <td className="px-4 py-4">
                <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
              </td>
              <td className="px-4 py-4">
                <div className="ml-auto flex w-fit gap-2">
                  <div className="h-9 w-9 rounded-lg bg-slate-100 animate-pulse" />
                  <div className="h-9 w-9 rounded-lg bg-slate-100 animate-pulse" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProductVariantsPage() {
  const searchParams = useSearchParams();
  const productIdFromUrl = searchParams.get("productId");

  const [activeTab, setActiveTab] = useState(
    productIdFromUrl ? "inventory" : "definitions"
  );

  const [dimLoading, setDimLoading] = useState(true);
  const [dimensions, setDimensions] = useState([]);
  const [dimSaving, setDimSaving] = useState(false);
  const [dimModalOpen, setDimModalOpen] = useState(false);
  const [newDimName, setNewDimName] = useState("");
  const [valueModalDim, setValueModalDim] = useState(null);
  const [newValueText, setNewValueText] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [form, setForm] = useState({
    productId: "",
    name: "",
    sku: "",
    price: "",
    discountPrice: "",
    stock: 0,
    maxOrderQty: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchDimensions = useCallback(() => {
    return fetch("/api/business/variant-dimensions")
      .then((r) => r.json())
      .then((data) => setDimensions(Array.isArray(data) ? data : []))
      .catch(() => setDimensions([]))
      .finally(() => setDimLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "definitions") {
      setDimLoading(true);
      fetchDimensions();
    }
  }, [activeTab, fetchDimensions]);

  useEffect(() => {
    fetch("/api/business/products?status=all&limit=100")
      .then((r) => r.json())
      .then((data) => setProducts(data?.items ?? []))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (productIdFromUrl && products.length) {
      setSelectedProductId(productIdFromUrl);
    }
  }, [productIdFromUrl, products]);

  const fetchVariants = useCallback(() => {
    const q = selectedProductId ? `?productId=${selectedProductId}` : "";
    return fetch(`/api/business/product-variants${q}`)
      .then((r) => r.json())
      .then((data) => setVariants(Array.isArray(data) ? data : []))
      .catch(() => setVariants([]))
      .finally(() => setIsLoading(false));
  }, [selectedProductId]);

  useEffect(() => {
    if (activeTab !== "inventory") return;
    setIsLoading(true);
    fetchVariants();
  }, [activeTab, fetchVariants]);

  const filteredVariants = useMemo(() => {
    return variants.filter((v) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        (v.sku || "").toLowerCase().includes(q) ||
        (v.product?.name || "").toLowerCase().includes(q)
      );
    });
  }, [variants, searchTerm]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId]
  );

  const definitionStats = useMemo(() => {
    const totalValues = dimensions.reduce(
      (sum, d) => sum + (d.values?.length || 0),
      0
    );
    return {
      totalDimensions: dimensions.length,
      totalValues,
      filledDimensions: dimensions.filter((d) => (d.values?.length || 0) > 0).length,
      emptyDimensions: dimensions.filter((d) => !(d.values?.length || 0)).length,
    };
  }, [dimensions]);

  const inventoryStats = useMemo(() => {
    return {
      totalVariants: variants.length,
      totalStock: variants.reduce((s, v) => s + (v.stock || 0), 0),
      limitedVariants: variants.filter((v) => v.maxOrderQty != null).length,
      productCount: products.length,
    };
  }, [variants, products]);

  const openNewDimensionModal = () => {
    setNewDimName("");
    setDimModalOpen(true);
  };

  const saveNewDimension = async (e) => {
    e?.preventDefault();
    const name = newDimName.trim();
    if (!name) return toast.error("Varyant adı girin.");

    setDimSaving(true);
    try {
      const res = await fetch("/api/business/variant-dimensions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Eklenemedi.");
      toast.success("Varyant eklendi.");
      setDimModalOpen(false);
      await fetchDimensions();
    } catch (err) {
      toast.error(err.message || "Hata.");
    } finally {
      setDimSaving(false);
    }
  };

  const openValueModal = (dim) => {
    setValueModalDim(dim);
    setNewValueText("");
  };

  const saveNewValue = async (e) => {
    e?.preventDefault();
    if (!valueModalDim) return;
    const value = newValueText.trim();
    if (!value) return toast.error("Varyant değeri girin.");

    setDimSaving(true);
    try {
      const res = await fetch(
        `/api/business/variant-dimensions/${valueModalDim.id}/values`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Eklenemedi.");
      toast.success("Değer eklendi.");
      setValueModalDim(null);
      await fetchDimensions();
    } catch (err) {
      toast.error(err.message || "Hata.");
    } finally {
      setDimSaving(false);
    }
  };

  const deleteDimension = async (dim) => {
    if (!confirm(`"${dim.name}" varyantını ve tüm değerlerini silmek istiyor musunuz?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/business/variant-dimensions/${dim.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Silinemedi.");
      }
      toast.success("Varyant silindi.");
      await fetchDimensions();
    } catch (err) {
      toast.error(err.message || "Silinemedi.");
    }
  };

  const deleteValue = async (valueId) => {
    if (!confirm("Bu değeri silmek istiyor musunuz?")) return;
    try {
      const res = await fetch(`/api/business/variant-dimension-values/${valueId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Silinemedi.");
      }
      toast.success("Değer silindi.");
      await fetchDimensions();
    } catch (err) {
      toast.error(err.message || "Silinemedi.");
    }
  };

  const openCreateModal = () => {
    setEditingVariant(null);
    setForm({
      productId: selectedProductId || "",
      name: "",
      sku: "",
      price: "",
      discountPrice: "",
      stock: 0,
      maxOrderQty: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingVariant(v);
    setForm({
      productId: v.productId,
      name: v.name,
      sku: v.sku || "",
      price: v.price ?? "",
      discountPrice: v.discountPrice ?? "",
      stock: v.stock ?? 0,
      maxOrderQty: v.maxOrderQty ?? "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Varyant adı zorunludur.");
    if (!form.productId) return toast.error("Ürün seçin.");

    setSaving(true);
    try {
      if (editingVariant) {
        const res = await fetch(`/api/business/product-variants/${editingVariant.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            sku: form.sku.trim() || null,
            price: form.price === "" ? null : Number(form.price),
            discountPrice: form.discountPrice === "" ? null : Number(form.discountPrice),
            stock: Math.max(0, parseInt(form.stock, 10) || 0),
            maxOrderQty:
              form.maxOrderQty === ""
                ? null
                : Math.max(1, parseInt(form.maxOrderQty, 10)),
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Güncellenemedi");
        }
        toast.success("Varyant güncellendi.");
      } else {
        const res = await fetch("/api/business/product-variants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: form.productId,
            name: form.name.trim(),
            sku: form.sku.trim() || null,
            price: form.price === "" ? null : Number(form.price),
            discountPrice: form.discountPrice === "" ? null : Number(form.discountPrice),
            stock: Math.max(0, parseInt(form.stock, 10) || 0),
            maxOrderQty:
              form.maxOrderQty === ""
                ? null
                : Math.max(1, parseInt(form.maxOrderQty, 10)),
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Eklenemedi");
        }
        toast.success("Varyant eklendi.");
      }
      setIsModalOpen(false);
      fetchVariants();
    } catch (err) {
      toast.error(err.message || "İşlem başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu varyantı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/business/product-variants/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Silinemedi");
      toast.success("Varyant silindi.");
      fetchVariants();
    } catch (err) {
      toast.error(err.message || "Silinemedi.");
    }
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-400";
  const labelCls =
    "mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500";

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 bg-slate-100/80 p-4 text-[13px] text-slate-800 antialiased md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/business/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#004aad]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Ürünlere Dön
          </Link>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] transition ${
                activeTab === "definitions"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              onClick={() => setActiveTab("definitions")}
            >
              Varyant Tanımları
            </button>
            <button
              type="button"
              className={`rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] transition ${
                activeTab === "inventory"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              onClick={() => setActiveTab("inventory")}
            >
              Ürün Varyantları
            </button>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
                {activeTab === "definitions" ? (
                  <SwatchIcon className="h-4 w-4" />
                ) : (
                  <CubeIcon className="h-4 w-4" />
                )}
                {activeTab === "definitions"
                  ? "Varyant Tanımları"
                  : "Ürün Varyantları"}
              </div>

              <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
                {activeTab === "definitions"
                  ? "Varyant Boyutları ve Değerleri"
                  : "Varyant Stok ve Fiyat Yönetimi"}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                {activeTab === "definitions"
                  ? "Renk, boyut, ebat gibi işletme genelinde kullanılacak varyant boyutlarını ve değerlerini yönetin."
                  : "Ürün bazlı varyantları, stoklarını, fiyatlarını ve maksimum sipariş adetlerini düzenleyin."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {activeTab === "definitions" ? (
                <ActionButton
                  onClick={openNewDimensionModal}
                  icon={PlusIcon}
                  tone="green"
                >
                  Yeni Varyant Ekle
                </ActionButton>
              ) : (
                <ActionButton
                  onClick={openCreateModal}
                  icon={PlusIcon}
                  tone="green"
                >
                  Yeni Varyant Ekle
                </ActionButton>
              )}
            </div>
          </div>
        </section>

        {activeTab === "definitions" && (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Toplam Boyut"
                value={String(definitionStats.totalDimensions)}
                sub="Tanımlı varyant tipi"
                icon={Squares2X2Icon}
                tone="blue"
              />
              <StatCard
                title="Toplam Değer"
                value={String(definitionStats.totalValues)}
                sub="Tanımlı seçenek sayısı"
                icon={TagIcon}
                tone="emerald"
              />
              <StatCard
                title="Dolu Boyut"
                value={String(definitionStats.filledDimensions)}
                sub="Değeri olan varyantlar"
                icon={CheckIcon}
                tone="amber"
              />
              <StatCard
                title="Boş Boyut"
                value={String(definitionStats.emptyDimensions)}
                sub="Henüz değer eklenmeyen"
                icon={ExclamationTriangleIcon}
                tone="slate"
              />
            </section>

            <SectionCard
              title="Varyant Tanımları"
              subtitle="İşletme geneli kullanılacak boyutları ve değerleri yönetin"
              right={
                <ActionButton
                  onClick={openNewDimensionModal}
                  icon={PlusIcon}
                  tone="green"
                >
                  Yeni Varyant Ekle
                </ActionButton>
              }
            >
              {dimLoading ? (
                <DefinitionSkeleton />
              ) : dimensions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center text-slate-500">
                  Henüz varyant boyutu yok. Yeni varyant ekleyerek başlayın.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {dimensions.map((dim) => (
                    <div
                      key={dim.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold uppercase tracking-wide">
                            {dim.name}
                          </p>
                          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
                            {(dim.values || []).length} değer
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openValueModal(dim)}
                            className="rounded-lg bg-orange-500 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-orange-600"
                          >
                            Değer Ekle
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteDimension(dim)}
                            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                            title="Varyantı sil"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-4">
                        {(dim.values || []).length === 0 ? (
                          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-xs text-slate-400">
                            Henüz değer yok.
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(dim.values || []).map((v) => (
                              <span
                                key={v.id}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                              >
                                {v.value}
                                <button
                                  type="button"
                                  onClick={() => deleteValue(v.id)}
                                  className="rounded p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-rose-600"
                                  aria-label="Kaldır"
                                >
                                  <XMarkIcon className="h-3.5 w-3.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </>
        )}

        {activeTab === "inventory" && (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Toplam Varyant"
                value={String(inventoryStats.totalVariants)}
                sub="Listelenen varyant sayısı"
                icon={CubeIcon}
                tone="blue"
              />
              <StatCard
                title="Toplam Stok"
                value={String(inventoryStats.totalStock)}
                sub="Varyant stok toplamı"
                icon={ArchiveBoxIcon}
                tone="emerald"
              />
              <StatCard
                title="Limitli Sipariş"
                value={String(inventoryStats.limitedVariants)}
                sub="Max sipariş tanımlı varyant"
                icon={QueueListIcon}
                tone="amber"
              />
              <StatCard
                title="Ürün Sayısı"
                value={String(inventoryStats.productCount)}
                sub="Toplam ürün adedi"
                icon={Squares2X2Icon}
                tone="slate"
              />
            </section>

            <SectionCard
              title="Filtreler"
              subtitle="Ürün seçin, ardından varyantları arayın"
              right={
                <ActionButton
                  onClick={openCreateModal}
                  icon={PlusIcon}
                  tone="green"
                >
                  Yeni Varyant Ekle
                </ActionButton>
              }
            >
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div>
                  <label className={labelCls}>Ürün Filtresi</label>
                  <div className="relative">
                    <QueueListIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className={`${inputCls} pl-10`}
                    >
                      <option value="">Tüm ürünlerin varyantları</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedProduct ? (
                    <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
                      <p className="text-sm font-bold text-slate-900">
                        {selectedProduct.name}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                        {(selectedProduct.variants?.length ?? 0)} varyant
                      </p>
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className={labelCls}>Arama</label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Varyant adı, SKU veya ürün adı..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Varyant Listesi"
              subtitle="Stok, fiyat ve SKU bilgileri"
            >
              {isLoading && variants.length === 0 ? (
                <InventorySkeleton />
              ) : filteredVariants.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-slate-500">
                  Varyant yok. Yeni varyant ekleyin veya filtreyi değiştirin.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Varyant / Ürün</th>
                        <th className="px-4 py-3 font-semibold">Fiyat</th>
                        <th className="px-4 py-3 font-semibold">Stok / Max Sipariş</th>
                        <th className="px-4 py-3 font-semibold">SKU</th>
                        <th className="px-4 py-3 font-semibold text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVariants.map((v, i) => (
                        <tr
                          key={v.id}
                          className={i % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                        >
                          <td className="px-4 py-4">
                            <p className="font-bold text-slate-900">{v.name}</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                              {v.product?.name || "—"}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-bold text-slate-900">
                              {v.discountPrice != null
                                ? v.discountPrice
                                : v.price != null
                                ? v.price
                                : "—"}{" "}
                              ₺
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-bold text-slate-900">
                              Stok: {v.stock ?? 0}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Max sipariş: {v.maxOrderQty != null ? v.maxOrderQty : "∞"}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#004aad]">
                              {v.sku || "—"}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(v)}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-[#004aad]"
                                title="Düzenle"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(v.id)}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
                                title="Sil"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </>
        )}
      </div>

      <AnimatePresence>
        {dimModalOpen && (
          <ModalShell
            title="Yeni Varyant Boyutu"
            onClose={() => setDimModalOpen(false)}
            footer={
              <div className="flex justify-end">
                <ActionButton
                  type="submit"
                  onClick={saveNewDimension}
                  icon={CheckIcon}
                  tone="green"
                  disabled={dimSaving}
                >
                  {dimSaving ? "Kaydediliyor..." : "Kaydet"}
                </ActionButton>
              </div>
            }
          >
            <form onSubmit={saveNewDimension} className="space-y-4">
              <div>
                <label className={labelCls}>Varyant Adı</label>
                <input
                  autoFocus
                  value={newDimName}
                  onChange={(e) => setNewDimName(e.target.value)}
                  placeholder="Örn. RENK, BOYUT/EBAT"
                  className={inputCls}
                />
              </div>
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {valueModalDim && (
          <ModalShell
            title="Varyant Değeri Ekle"
            onClose={() => setValueModalDim(null)}
            footer={
              <div className="flex justify-end">
                <ActionButton
                  type="submit"
                  onClick={saveNewValue}
                  icon={CheckIcon}
                  tone="green"
                  disabled={dimSaving}
                >
                  {dimSaving ? "Kaydediliyor..." : "Kaydet"}
                </ActionButton>
              </div>
            }
          >
            <form onSubmit={saveNewValue} className="space-y-4">
              <div>
                <label className={labelCls}>Varyant İsmi</label>
                <input
                  readOnly
                  value={valueModalDim.name}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
                />
              </div>

              <div>
                <label className={labelCls}>Varyant Değeri</label>
                <input
                  autoFocus
                  value={newValueText}
                  onChange={(e) => setNewValueText(e.target.value)}
                  placeholder="Değer girin"
                  className={inputCls}
                />
              </div>
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <ModalShell
            title={editingVariant ? "Varyant Düzenle" : "Yeni Varyant"}
            wide
            onClose={() => setIsModalOpen(false)}
            footer={
              <div className="flex justify-end gap-3">
                <ActionButton onClick={() => setIsModalOpen(false)} tone="white">
                  İptal
                </ActionButton>
                <ActionButton
                  type="submit"
                  onClick={handleSubmit}
                  icon={CheckIcon}
                  tone="green"
                  disabled={saving}
                >
                  {saving
                    ? "Kaydediliyor..."
                    : editingVariant
                    ? "Güncelle"
                    : "Kaydet"}
                </ActionButton>
              </div>
            }
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {!editingVariant && (
                <div className="md:col-span-2">
                  <label className={labelCls}>Ürün *</label>
                  <select
                    value={form.productId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, productId: e.target.value }))
                    }
                    className={inputCls}
                    required
                  >
                    <option value="">Seçin</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="md:col-span-2">
                <label className={labelCls}>Varyant Adı *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Örn: Büyük Boy"
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Fiyat (₺)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="Boş = ürün fiyatı"
                />
              </div>

              <div>
                <label className={labelCls}>İndirimli Fiyat (₺)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.discountPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discountPrice: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="Opsiyonel"
                />
              </div>

              <div>
                <label className={labelCls}>Stok</label>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: e.target.value }))
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Max Sipariş Adedi</label>
                <input
                  type="number"
                  min={1}
                  value={form.maxOrderQty}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxOrderQty: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="Boş = sınırsız"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelCls}>SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sku: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="Opsiyonel"
                />
              </div>
            </form>
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}