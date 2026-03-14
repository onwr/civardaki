"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, LayoutGrid, Plus, Edit, Trash2, ArrowUp, ArrowDown,
  CheckCircle, XCircle, Loader2, Image as ImageIcon, X, GripVertical
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableCategoryItem = ({ cat, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', position: 'relative' };

  return (
    <div ref={setNodeRef} style={style} className={`flex flex-col p-4 rounded-xl border transition-all group ${isDragging ? 'bg-white shadow-xl border-blue-400 scale-105 opacity-90' : 'border-slate-100 hover:border-blue-200 bg-slate-50 hover:bg-white'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button {...attributes} {...listeners} className="p-1 cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 touch-none">
            <GripVertical className="w-4 h-4 text-slate-400" />
          </button>
          <span className="font-bold text-slate-800 tracking-tight">{cat.name}</span>
        </div>
        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(cat)} className="p-1 hover:bg-slate-200 rounded-lg ml-2"><Edit className="w-4 h-4 text-blue-600" /></button>
          <button onClick={() => onDelete(cat.id)} className="p-1 hover:bg-rose-100 rounded-lg"><Trash2 className="w-4 h-4 text-rose-500" /></button>
        </div>
      </div>
    </div>
  );
};

export default function ProductManager() {
  const router = useRouter();

  // Data states
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter/Pagination states
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);

  // Form states
  const [catForm, setCatForm] = useState({ id: null, name: "" });
  const [prodForm, setProdForm] = useState({
    id: null, name: "", description: "", price: "", discountPrice: "",
    categoryId: "", imageUrl: "", isActive: true, stock: "", maxOrderQty: ""
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedProdIds, setSelectedProdIds] = useState([]);

  const fetchCategories = async () => {
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
  };

  const fetchProducts = async () => {
    try {
      const q = new URLSearchParams({ page, limit: 20, status: filterStatus });
      if (filterCat) q.append("categoryId", filterCat);

      const res = await fetch(`/api/business/products?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.items || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
      toast.error("Ürünler yüklenemedi");
    }
  };

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) fetchProducts();
  }, [filterCat, filterStatus, page]);

  // CATEGORY HANDLERS
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catForm.name || catForm.name.length < 2) return toast.error("Kategori adı çok kısa");

    try {
      const url = catForm.id ? `/api/business/product-categories/${catForm.id}` : "/api/business/product-categories";
      const method = catForm.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: catForm.name })
      });

      if (res.ok) {
        toast.success(catForm.id ? "Güncellendi" : "Eklendi");
        setIsCatModalOpen(false);
        fetchCategories();
      } else {
        const err = await res.json();
        toast.error(err.message || "Hata oluştu");
      }
    } catch (err) {
      toast.error("İşlem başarısız");
    }
  };

  const deleteCat = async (id) => {
    if (!confirm("Kategoriyi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/business/product-categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Kategori silindi");
        fetchCategories();
        fetchProducts(); // refresh products to show them in "Uncategorized"
      } else {
        toast.error("Silinemedi");
      }
    } catch (e) { toast.error("Hata oluştu"); }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);

      const newCatOrder = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCatOrder);

      toast.promise(
        Promise.all(newCatOrder.map((cat, idx) =>
          fetch(`/api/business/product-categories/${cat.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: idx })
          })
        )),
        { loading: 'Sıralama güncelleniyor...', success: 'Sıralama kaydedildi', error: 'Sıralama hatası' }
      );
    }
  };

  // PRODUCT HANDLERS
  const handleProdSubmit = async (e) => {
    e.preventDefault();
    if (!prodForm.name || prodForm.name.length < 2) return toast.error("Ürün adı çok kısa");

    try {
      const url = prodForm.id ? `/api/business/products/${prodForm.id}` : "/api/business/products";
      const method = prodForm.id ? "PATCH" : "POST";

      const payload = {
        name: prodForm.name,
        description: prodForm.description,
        price: prodForm.price || null,
        discountPrice: prodForm.discountPrice || null,
        categoryId: prodForm.categoryId || null,
        imageUrl: prodForm.imageUrl || null,
        isActive: prodForm.isActive,
        stock: prodForm.stock === "" || prodForm.stock === null ? null : Number(prodForm.stock),
        maxOrderQty: prodForm.maxOrderQty === "" || prodForm.maxOrderQty === null ? null : Number(prodForm.maxOrderQty),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(prodForm.id ? "Güncellendi" : "Eklendi");
        setIsProdModalOpen(false);
        fetchProducts();
      } else {
        const err = await res.json();
        toast.error(err.message || "Hata oluştu");
      }
    } catch (err) {
      toast.error("İşlem başarısız");
    }
  };

  const deleteProd = async (id) => {
    if (!confirm("Ürünü silmek istediğinize emin misiniz?")) return;

    // Optimistic UI
    setProducts(prev => prev.filter(p => p.id !== id));

    try {
      const res = await fetch(`/api/business/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Ürün silindi");
      } else {
        toast.error("Silinemedi");
        fetchProducts();
      }
    } catch (e) {
      toast.error("Hata");
      fetchProducts();
    }
  };

  const toggleProdStatus = async (id, currentStatus) => {
    // Optimistic UI
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));

    try {
      const res = await fetch(`/api/business/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (!res.ok) throw new Error("Update failed");
    } catch (e) {
      toast.error("Durum güncellenemedi");
      fetchProducts();
    }
  };

  // BULK ACTIONS
  const toggleSelectProd = (id) => {
    setSelectedProdIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkStatus = async (targetActive) => {
    if (selectedProdIds.length === 0) return;

    // Optimistic UI
    setProducts(prev => prev.map(p => selectedProdIds.includes(p.id) ? { ...p, isActive: targetActive } : p));

    toast.promise(
      Promise.all(
        selectedProdIds.map(id => fetch(`/api/business/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: targetActive })
        }))
      ),
      {
        loading: 'Toplu güncelleniyor...',
        success: 'Seçili ürünlerin durumu güncellendi!',
        error: 'Bazı işlemler başarısız oldu'
      }
    );
    setSelectedProdIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedProdIds.length === 0) return;
    if (!confirm(`${selectedProdIds.length} adet ürünü tamamen silmek istediğinize emin misiniz?`)) return;

    // Optimistic UI
    setProducts(prev => prev.filter(p => !selectedProdIds.includes(p.id)));

    toast.promise(
      Promise.all(
        selectedProdIds.map(id => fetch(`/api/business/products/${id}`, { method: "DELETE" }))
      ),
      {
        loading: 'Toplu siliniyor...',
        success: 'Seçili ürünler silindi!',
        error: 'Bazı silme işlemleri başarısız oldu'
      }
    );
    setSelectedProdIds([]);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) return toast.error("Maksimum dosya boyutu 5MB");

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
    } catch (err) {
      toast.error("Dosya yüklenemedi");
    } finally {
      setUploadingImage(false);
      e.target.value = null; // reset file input
    }
  };

  if (loading) {
    return <div className="p-10 flex items-center justify-center min-h-screen text-slate-400"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  }

  return (
    <div className="font-inter antialiased min-h-screen p-6 md:p-10 space-y-10 max-w-7xl mx-auto">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">MENÜ & ÜRÜNLER</h1>
          <p className="text-slate-500 font-bold italic mt-2">İşletmenizin katalog vitrinini yönetin.</p>
        </div>
        <button
          onClick={() => { setProdForm({ id: null, name: "", description: "", price: "", discountPrice: "", categoryId: "", imageUrl: "", isActive: true, stock: "", maxOrderQty: "" }); setIsProdModalOpen(true); }}
          className="bg-[#004aad] text-white px-8 py-4 rounded-2xl font-black text-[11px] tracking-widest uppercase hover:bg-slate-950 transition-colors shadow-xl"
        >
          <Plus className="w-5 h-5 inline-block mr-2" /> YENİ ÜRÜN EKLE
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* KATEGORİ YÖNETİMİ (Sol Panel - 4 Kolon) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 border-b-2 border-slate-100 pb-2 flex-grow">Kategoriler</h2>
              <button
                onClick={() => { setCatForm({ id: null, name: "" }); setIsCatModalOpen(true); }}
                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  {categories.map((cat) => (
                    <SortableCategoryItem
                      key={cat.id}
                      cat={cat}
                      onEdit={(c) => { setCatForm({ id: c.id, name: c.name }); setIsCatModalOpen(true); }}
                      onDelete={(id) => deleteCat(id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              {categories.length === 0 && <p className="text-xs font-semibold text-slate-500 italic text-center p-4">Henüz kategori bulunmuyor.</p>}
            </div>
          </div>
        </div>

        {/* ÜRÜN YÖNETİMİ (Sağ Panel - 8 Kolon) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">

            {/* Filtreler */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-2xl">
              <select
                value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
                className="p-3 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 outline-none flex-1"
              >
                <option value="">Tüm Kategoriler</option>
                <option value="null">Menüsü Olmayanlar (Diğer)</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select
                value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="p-3 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 outline-none flex-1"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Yayında Olanlar</option>
                <option value="inactive">Pasif Olanlar</option>
              </select>
            </div>

            {/* Bulk Actions Bar */}
            <AnimatePresence>
              {selectedProdIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex col-span-12 flex-col md:flex-row items-center justify-between bg-[#004aad]/5 border border-[#004aad]/20 rounded-2xl p-4 mb-6 shadow-sm gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#004aad] text-white flex items-center justify-center font-black text-xs shadow-md">
                      {selectedProdIds.length}
                    </div>
                    <span className="text-sm font-black text-[#004aad] uppercase tracking-widest">Ürün Seçildi</span>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button onClick={() => setSelectedProdIds(products.map(p => p.id))} className="px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm">Tümünü Seç</button>
                    <button onClick={() => handleBulkStatus(true)} className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[10px] border border-emerald-100 font-black uppercase tracking-widest rounded-xl transition-all shadow-sm">Yayınla</button>
                    <button onClick={() => handleBulkStatus(false)} className="px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 text-[10px] border border-amber-100 font-black uppercase tracking-widest rounded-xl transition-all shadow-sm">Gizle</button>
                    <button onClick={handleBulkDelete} className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] border border-rose-100 font-black uppercase tracking-widest rounded-xl transition-all shadow-sm">Sil</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Liste */}
            <div className="space-y-4">
              {products.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold italic">Seçili kriterlere uygun ürün bulunamadı.</p>
                </div>
              ) : (
                products.map(p => (
                  <div key={p.id} className="flex flex-col md:flex-row items-start md:items-center gap-6 p-5 rounded-2xl border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all bg-white group">
                    <div className="flex items-center self-center md:self-auto h-full pr-2">
                      <input
                        type="checkbox"
                        checked={selectedProdIds.includes(p.id)}
                        onChange={() => toggleSelectProd(p.id)}
                        className="w-5 h-5 rounded-md border-slate-300 text-[#004aad] focus:ring-[#004aad] cursor-pointer"
                      />
                    </div>

                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl.startsWith("http") ? p.imageUrl : p.imageUrl.startsWith("/") ? p.imageUrl : `/${p.imageUrl}`}
                          alt={p.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-black text-slate-900 truncate">{p.name}</h4>
                        {p.isActive ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">Aktif</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-200">Pasif</span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {p.category?.name || "Kategorisiz"}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {p.price !== null ? (
                          <>
                            <span className="text-sm font-black text-slate-900">{p.discountPrice || p.price} ₺</span>
                            {p.discountPrice && <span className="text-[10px] font-bold text-slate-400 line-through">{p.price} ₺</span>}
                          </>
                        ) : (
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Teklif Al</span>
                        )}
                        {(p.stock != null || p.maxOrderQty != null) && (
                          <span className="text-[10px] font-bold text-slate-500">
                            Stok: {p.stock != null ? p.stock : "—"} · Max: {p.maxOrderQty != null ? p.maxOrderQty : "∞"}
                          </span>
                        )}
                        {p.variants?.length > 0 && (
                          <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">{p.variants.length} varyant</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <Link
                        href={`/business/products/variants?productId=${p.id}`}
                        className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
                      >
                        Varyasyonlar
                      </Link>
                      <button
                        onClick={() => toggleProdStatus(p.id, p.isActive)}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${p.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                      >
                        {p.isActive ? 'GİZLE' : 'YAYINLA'}
                      </button>
                      <button
        onClick={() => {
          setProdForm({
            id: p.id, name: p.name, description: p.description || "", price: p.price ?? "", discountPrice: p.discountPrice ?? "",
            categoryId: p.categoryId || "", imageUrl: p.imageUrl || "", isActive: p.isActive,
            stock: p.stock ?? "", maxOrderQty: p.maxOrderQty ?? ""
          });
          setIsProdModalOpen(true);
        }}
                        className="p-3 bg-slate-50 text-blue-600 hover:bg-blue-50 rounded-xl"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteProd(p.id)} className="p-3 bg-slate-50 text-rose-500 hover:bg-rose-50 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs disabled:opacity-50">Önceki</button>
                  <span className="px-4 py-2 text-sm font-black text-slate-900">{page} / {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs disabled:opacity-50">Sonraki</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {isCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsCatModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6">{catForm.id ? "Kategori Düzenle" : "Yeni Kategori"}</h3>
              <form onSubmit={handleCatSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Kategori Adı</label>
                  <input type="text" value={catForm.name} onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold border-none" placeholder="Örn: Tatlılar" required minLength={2} />
                </div>
                <button type="submit" className="w-full py-4 bg-[#004aad] text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-slate-950 transition-colors shadow-lg shadow-blue-900/20">
                  {catForm.id ? "CÜNCELLE" : "KAYDET"}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isProdModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white p-8 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsProdModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 z-10"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-8">{prodForm.id ? "Ürün Düzenle" : "Yeni Ürün Ekle"}</h3>

              <form onSubmit={handleProdSubmit} className="space-y-6">
                {/* Görsel Yükleme */}
                <div className="flex items-center gap-6 p-4 rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="w-24 h-24 rounded-xl shrink-0 overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative">
                    {prodForm.imageUrl ? (
                      <>
                        <img src={prodForm.imageUrl} alt="preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setProdForm(p => ({ ...p, imageUrl: "" }))} className="absolute top-1 right-1 bg-slate-900/50 p-1 rounded-md hover:bg-rose-500 transition-colors">
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 mb-2">Ürün Görseli</p>
                    <p className="text-xs font-bold text-slate-500 mb-4 opacity-70">PNG, JPG, WEBP (Max 5MB)</p>
                    <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${uploadingImage ? 'bg-slate-200 text-slate-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                      {uploadingImage ? <><Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...</> : 'GÖRSEL SEÇ'}
                      <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Ürün / Hizmet Adı *</label>
                    <input type="text" value={prodForm.name} onChange={(e) => setProdForm(p => ({ ...p, name: e.target.value }))} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold border-none" required minLength={2} placeholder="Örn: Lahmacun" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Kategori</label>
                    <select value={prodForm.categoryId} onChange={(e) => setProdForm(p => ({ ...p, categoryId: e.target.value }))} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold border-none appearance-none">
                      <option value="">Seçiniz (Opsiyonel)</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Açıklama</label>
                  <textarea value={prodForm.description} onChange={(e) => setProdForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold border-none resize-none" placeholder="Ürün içerik veya hizmet detayları..."></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Satış Fiyatı (₺)</label>
                    <input type="number" step="0.01" value={prodForm.price} onChange={(e) => setProdForm(p => ({ ...p, price: e.target.value }))} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold border-none font-mono" placeholder="Boş = Teklif Al" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">İndirimli Fiyat (₺)</label>
                    <input type="number" step="0.01" value={prodForm.discountPrice} onChange={(e) => setProdForm(p => ({ ...p, discountPrice: e.target.value }))} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold border-none font-mono" placeholder="Opsiyonel" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Stok (adet)</label>
                    <input type="number" min={0} value={prodForm.stock} onChange={(e) => setProdForm(p => ({ ...p, stock: e.target.value }))} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold border-none font-mono" placeholder="Boş = takip yok" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Maks. sipariş adedi</label>
                    <input type="number" min={1} value={prodForm.maxOrderQty} onChange={(e) => setProdForm(p => ({ ...p, maxOrderQty: e.target.value }))} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold border-none font-mono" placeholder="Boş = sınırsız" />
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div>
                    <span className="block text-sm font-black text-slate-900">Yayın Durumu</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Aktif ürünler vitrinde görünür</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={prodForm.isActive} onChange={(e) => setProdForm(p => ({ ...p, isActive: e.target.checked }))} />
                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsProdModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-slate-200 transition-colors">İPTAL</button>
                  <button type="submit" className="flex-1 py-4 bg-[#004aad] text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-slate-950 transition-colors shadow-lg shadow-blue-900/20">KAYDET</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
