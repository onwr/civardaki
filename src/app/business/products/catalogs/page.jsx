"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  XMarkIcon,
  BookOpenIcon,
  CalendarIcon,
  GlobeAltIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { SkeletonStatCard } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function CatalogsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [catalogs, setCatalogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [saving, setSaving] = useState(false);

  const [catalogForm, setCatalogForm] = useState({
    name: "",
    description: "",
    selectedProducts: [],
  });

  useEffect(() => {
    fetch("/api/business/products?status=all&limit=100")
      .then((r) => r.json())
      .then((data) => setProducts(data?.items ?? []))
      .catch(() => setProducts([]));
  }, []);

  const fetchCatalogs = useCallback(() => {
    return fetch("/api/business/catalogs")
      .then((r) => r.json())
      .then((data) => setCatalogs(Array.isArray(data) ? data : []))
      .catch(() => setCatalogs([]));
  }, []);

  useEffect(() => {
    fetchCatalogs().finally(() => setIsLoading(false));
  }, [fetchCatalogs]);

  const handleAddCatalog = async (e) => {
    e.preventDefault();
    if (!catalogForm.name.trim()) return toast.error("Katalog adı girin.");
    if (catalogForm.selectedProducts.length === 0) return toast.error("En az bir ürün seçin.");
    setSaving(true);
    try {
      const res = await fetch("/api/business/catalogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catalogForm.name.trim(),
          description: catalogForm.description.trim() || null,
          productIds: catalogForm.selectedProducts,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Oluşturulamadı.");
      toast.success("Katalog oluşturuldu.");
      setCatalogForm({ name: "", description: "", selectedProducts: [] });
      setIsCatalogModalOpen(false);
      await fetchCatalogs();
    } catch (err) {
      toast.error(err.message || "Katalog oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditCatalog = (catalog) => {
    setSelectedCatalog(catalog);
    setCatalogForm({
      name: catalog.name,
      description: catalog.description || "",
      selectedProducts: [],
    });
    fetch(`/api/business/catalogs/${catalog.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.productIds) setCatalogForm((f) => ({ ...f, selectedProducts: data.productIds }));
      })
      .catch(() => {});
    setIsCatalogModalOpen(true);
  };

  const handleUpdateCatalog = async (e) => {
    e.preventDefault();
    if (!selectedCatalog) return;
    if (!catalogForm.name.trim()) return toast.error("Katalog adı girin.");
    if (catalogForm.selectedProducts.length === 0) return toast.error("En az bir ürün seçin.");
    setSaving(true);
    try {
      const res = await fetch(`/api/business/catalogs/${selectedCatalog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catalogForm.name.trim(),
          description: catalogForm.description.trim() || null,
          productIds: catalogForm.selectedProducts,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Güncellenemedi.");
      toast.success("Katalog güncellendi.");
      setSelectedCatalog(null);
      setIsCatalogModalOpen(false);
      await fetchCatalogs();
    } catch (err) {
      toast.error(err.message || "Katalog güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCatalog = async (catalogId) => {
    if (!confirm("Bu kataloğu silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/business/catalogs/${catalogId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi.");
      toast.success("Katalog silindi.");
      await fetchCatalogs();
    } catch (err) {
      toast.error(err.message || "Katalog silinemedi.");
    }
  };

  const handlePublishCatalog = async (catalogId) => {
    try {
      const res = await fetch(`/api/business/catalogs/${catalogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: true }),
      });
      if (!res.ok) throw new Error("Yayınlanamadı.");
      toast.success("Katalog yayınlandı.");
      await fetchCatalogs();
    } catch (err) {
      toast.error(err.message || "Yayınlanamadı.");
    }
  };

  const toggleProductSelection = (productId) => {
    if (catalogForm.selectedProducts.includes(productId)) {
      setCatalogForm({
        ...catalogForm,
        selectedProducts: catalogForm.selectedProducts.filter((id) => id !== productId),
      });
    } else {
      setCatalogForm({
        ...catalogForm,
        selectedProducts: [...catalogForm.selectedProducts, productId],
      });
    }
  };

  const filteredCatalogs = catalogs.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", damping: 25 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kataloglarınız</h1>
          <p className="mt-1 text-sm text-gray-600">
            Kataloglarınızı görüntüleyin ve yönetin
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedCatalog(null);
            setCatalogForm({
              name: "",
              description: "",
              selectedProducts: [],
            });
            setIsCatalogModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Yeni Katalog
        </motion.button>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-4"
      >
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Katalog ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </motion.div>

      {/* Catalogs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {filteredCatalogs.map((catalog, index) => (
            <motion.div
              key={catalog.id}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <BookOpenIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{catalog.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{catalog.description || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Ürün Sayısı</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {catalog.productCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Oluşturulma</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900">
                      {new Date(catalog.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Durum</span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        catalog.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {catalog.isPublished ? "Yayında" : "Taslak"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {!catalog.isPublished && (
                    <button
                      onClick={() => handlePublishCatalog(catalog.id)}
                      className="w-full px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center"
                    >
                      <GlobeAltIcon className="h-4 w-4 mr-1" />
                      Yayınla
                    </button>
                  )}
                  <div className="flex space-x-2">
                    {catalog.pdfUrl && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                        PDF
                      </motion.button>
                    )}
                    {catalog.shareUrl && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <ShareIcon className="h-4 w-4 mr-1" />
                        Paylaş
                      </motion.button>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCatalog(catalog)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDeleteCatalog(catalog.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {filteredCatalogs.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Katalog bulunamadı.</p>
        </div>
      )}

      {/* Catalog Modal */}
      <AnimatePresence>
        {isCatalogModalOpen && (
          <>
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsCatalogModalOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl sm:rounded-2xl p-6 z-50 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCatalog ? "Katalog Düzenle" : "Yeni Katalog Oluştur"}
                </h2>
                <button
                  onClick={() => setIsCatalogModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <form
                onSubmit={selectedCatalog ? handleUpdateCatalog : handleAddCatalog}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Katalog Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={catalogForm.name}
                    onChange={(e) =>
                      setCatalogForm({ ...catalogForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Örn: 2024 Kış Kataloğu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={catalogForm.description}
                    onChange={(e) =>
                      setCatalogForm({ ...catalogForm, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Katalog açıklaması"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ürünler *
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {products.length > 0 ? (
                      <div className="space-y-2">
                        {products.map((product) => (
                          <label
                            key={product.id}
                            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={catalogForm.selectedProducts.includes(product.id)}
                              onChange={() => toggleProductSelection(product.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <span className="text-sm text-gray-900">{product.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                {(product.discountPrice ?? product.price ?? 0).toLocaleString("tr-TR")} ₺
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Ürün bulunamadı.
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {catalogForm.selectedProducts.length} ürün seçildi
                  </p>
                </div>

                <div className="pt-4 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCatalogModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={catalogForm.selectedProducts.length === 0 || saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Kaydediliyor..." : selectedCatalog ? "Güncelle" : "Oluştur"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
