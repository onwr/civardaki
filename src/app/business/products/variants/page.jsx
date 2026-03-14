"use client";

import { useState, useEffect, useMemo } from "react";
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
  TagIcon,
  ArrowsRightLeftIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

export default function ProductVariantsPage() {
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

  const searchParams = useSearchParams();
  const productIdFromUrl = searchParams.get("productId");

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

  const fetchVariants = () => {
    const q = selectedProductId ? `?productId=${selectedProductId}` : "";
    fetch(`/api/business/product-variants${q}`)
      .then((r) => r.json())
      .then((data) => setVariants(Array.isArray(data) ? data : []))
      .catch(() => setVariants([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    setIsLoading(true);
    fetchVariants();
  }, [selectedProductId]);

  const filteredVariants = useMemo(() => {
    return variants.filter((v) => {
      const matchSearch =
        !searchTerm ||
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.product?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [variants, searchTerm]);

  const selectedProduct = useMemo(() => products.find((p) => p.id === selectedProductId), [products, selectedProductId]);

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
            maxOrderQty: form.maxOrderQty === "" ? null : Math.max(1, parseInt(form.maxOrderQty, 10)),
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
            maxOrderQty: form.maxOrderQty === "" ? null : Math.max(1, parseInt(form.maxOrderQty, 10)),
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
      const res = await fetch(`/api/business/product-variants/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi");
      toast.success("Varyant silindi.");
      fetchVariants();
    } catch (err) {
      toast.error(err.message || "Silinemedi.");
    }
  };

  if (isLoading && variants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-50 border-t-[#004aad] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-7 bg-gray-900 rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl group"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
            <ArrowsRightLeftIcon className="w-80 h-80" />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
            <div className="space-y-4">
              <Link href="/business/products" className="inline-flex items-center text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
                <ArrowLeftIcon className="w-3 h-3 mr-2" /> Ürünlere Dön
              </Link>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-[#004aad] rounded-[1.8rem] flex items-center justify-center shadow-2xl">
                  <SwatchIcon className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Ürün Varyasyonları</h1>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Stok ve max sipariş yönetimi</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
                <p className="text-[9px] font-black text-blue-400 uppercase mb-1">TOPLAM VARYANT</p>
                <p className="text-2xl font-black">{variants.length}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
                <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">ÜRÜN SAYISI</p>
                <p className="text-2xl font-black">{products.length}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
                <p className="text-[9px] font-black text-amber-400 uppercase mb-1">TOPLAM STOK</p>
                <p className="text-2xl font-black">{variants.reduce((s, v) => s + (v.stock || 0), 0)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 bg-white rounded-[4rem] p-10 border border-gray-100 shadow-xl flex flex-col justify-between"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ürün Filtresi</p>
            </div>
            <div className="relative group">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none font-bold appearance-none transition-all"
              >
                <option value="">Tüm ürünlerin varyantları</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <QueueListIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            {selectedProduct && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                  <CubeIcon className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900">{selectedProduct.name}</p>
                  <p className="text-[10px] text-blue-600 font-bold">{selectedProduct.variants?.length ?? 0} varyant</p>
                </div>
              </motion.div>
            )}
          </div>
          <button type="button" onClick={openCreateModal} className="w-full py-5 mt-6 bg-[#004aad] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl">
            YENİ VARYANT EKLE
          </button>
        </motion.div>
      </div>

      <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-xl flex flex-wrap gap-6 items-center justify-between">
        <div className="flex-1 min-w-[300px] relative group">
          <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            placeholder="Varyant adı veya SKU ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-gray-50 rounded-3xl border-none outline-none focus:ring-4 focus:ring-[#004aad]/5 font-bold"
          />
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Varyant / Ürün</th>
              <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fiyat</th>
              <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stok / Max sipariş</th>
              <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">SKU</th>
              <th className="px-10 py-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredVariants.map((v) => (
              <tr key={v.id} className="group hover:bg-blue-50/30 transition-colors">
                <td className="px-10 py-8">
                  <div>
                    <p className="font-black text-gray-900 leading-none mb-1">{v.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{v.product?.name || "—"}</p>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <span className="text-sm font-black text-gray-900">
                    {v.discountPrice != null ? v.discountPrice : v.price != null ? v.price : "—"} ₺
                  </span>
                </td>
                <td className="px-10 py-8">
                  <p className="text-sm font-black text-gray-900">Stok: {v.stock ?? 0}</p>
                  <p className="text-[10px] font-bold text-gray-500">Max sipariş: {v.maxOrderQty != null ? v.maxOrderQty : "∞"}</p>
                </td>
                <td className="px-10 py-8">
                  <p className="text-[10px] font-bold text-[#004aad] tracking-widest">{v.sku || "—"}</p>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={() => openEditModal(v)} className="p-4 bg-white border border-gray-100 rounded-2xl hover:text-[#004aad] shadow-sm transition-all">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={() => handleDelete(v.id)} className="p-4 bg-white border border-gray-100 rounded-2xl hover:text-rose-500 shadow-sm transition-all">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredVariants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-10 py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CubeIcon className="w-10 h-10 text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-bold italic">Varyant yok. Yeni varyant ekleyin veya filtreyi değiştirin.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900">{editingVariant ? "Varyant Düzenle" : "Yeni Varyant"}</h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100">
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {!editingVariant && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Ürün *</label>
                    <select
                      value={form.productId}
                      onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                      required
                    >
                      <option value="">Seçin</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Varyant adı *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Örn: Büyük Boy"
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Fiyat (₺)</label>
                    <input type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" placeholder="Boş = ürün fiyatı" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">İndirimli fiyat (₺)</label>
                    <input type="number" step="0.01" value={form.discountPrice} onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" placeholder="Opsiyonel" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Stok</label>
                    <input type="number" min={0} value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Max sipariş adedi</label>
                    <input type="number" min={1} value={form.maxOrderQty} onChange={(e) => setForm((f) => ({ ...f, maxOrderQty: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" placeholder="Boş = sınırsız" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">SKU</label>
                  <input type="text" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" placeholder="Opsiyonel" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase">
                    İptal
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 py-4 bg-[#004aad] text-white rounded-2xl font-black text-xs uppercase hover:bg-black transition-all disabled:opacity-50">
                    {saving ? "Kaydediliyor..." : editingVariant ? "Güncelle" : "Kaydet"}
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
