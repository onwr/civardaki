"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  TagIcon,
  CalendarIcon,
  UserGroupIcon,
  PercentBadgeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { SkeletonStatCard } from "@/components/ui/skeleton";
import { toast } from "sonner";

const defaultForm = () => ({
  name: "",
  description: "",
  customerGroup: "ALL",
  discountRate: 0,
  validFrom: new Date().toISOString().split("T")[0],
  validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  selectedProducts: [],
});

export default function PriceListsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [priceLists, setPriceLists] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPriceListModalOpen, setIsPriceListModalOpen] = useState(false);
  const [selectedPriceList, setSelectedPriceList] = useState(null);
  const [priceListForm, setPriceListForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);

  const fetchPriceLists = useCallback(() => {
    return fetch("/api/business/price-lists")
      .then((r) => r.json())
      .then((data) => setPriceLists(Array.isArray(data) ? data : []))
      .catch(() => setPriceLists([]));
  }, []);

  useEffect(() => {
    fetch("/api/business/products?status=all&limit=100")
      .then((r) => r.json())
      .then((data) => setProducts(data?.items ?? []))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    fetchPriceLists().finally(() => setIsLoading(false));
  }, [fetchPriceLists]);

  const handleAddPriceList = async (e) => {
    e.preventDefault();
    if (!priceListForm.name.trim()) return toast.error("Liste adı girin.");
    setSaving(true);
    try {
      const res = await fetch("/api/business/price-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: priceListForm.name.trim(),
          description: priceListForm.description.trim() || null,
          customerGroup: priceListForm.customerGroup,
          discountRate: Number(priceListForm.discountRate) || 0,
          validFrom: priceListForm.validFrom,
          validUntil: priceListForm.validUntil,
          productIds: priceListForm.selectedProducts,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Oluşturulamadı.");
      toast.success("Fiyat listesi oluşturuldu.");
      setPriceListForm(defaultForm());
      setIsPriceListModalOpen(false);
      await fetchPriceLists();
    } catch (err) {
      toast.error(err.message || "Fiyat listesi oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditPriceList = (list) => {
    setSelectedPriceList(list);
    setPriceListForm({
      name: list.name,
      description: list.description || "",
      customerGroup: list.customerGroup || "ALL",
      discountRate: list.discountRate ?? 0,
      validFrom: new Date(list.validFrom).toISOString().split("T")[0],
      validUntil: new Date(list.validUntil).toISOString().split("T")[0],
      selectedProducts: [],
    });
    fetch(`/api/business/price-lists/${list.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.productIds) setPriceListForm((f) => ({ ...f, selectedProducts: data.productIds }));
      })
      .catch(() => {});
    setIsPriceListModalOpen(true);
  };

  const handleUpdatePriceList = async (e) => {
    e.preventDefault();
    if (!selectedPriceList) return;
    if (!priceListForm.name.trim()) return toast.error("Liste adı girin.");
    setSaving(true);
    try {
      const res = await fetch(`/api/business/price-lists/${selectedPriceList.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: priceListForm.name.trim(),
          description: priceListForm.description.trim() || null,
          customerGroup: priceListForm.customerGroup,
          discountRate: Number(priceListForm.discountRate) || 0,
          validFrom: priceListForm.validFrom,
          validUntil: priceListForm.validUntil,
          productIds: priceListForm.selectedProducts,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Güncellenemedi.");
      toast.success("Fiyat listesi güncellendi.");
      setSelectedPriceList(null);
      setIsPriceListModalOpen(false);
      await fetchPriceLists();
    } catch (err) {
      toast.error(err.message || "Fiyat listesi güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePriceList = async (listId) => {
    if (!confirm("Bu fiyat listesini silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/business/price-lists/${listId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi.");
      toast.success("Fiyat listesi silindi.");
      await fetchPriceLists();
    } catch (err) {
      toast.error(err.message || "Fiyat listesi silinemedi.");
    }
  };

  const toggleProductSelection = (productId) => {
    if (priceListForm.selectedProducts.includes(productId)) {
      setPriceListForm({
        ...priceListForm,
        selectedProducts: priceListForm.selectedProducts.filter((id) => id !== productId),
      });
    } else {
      setPriceListForm({
        ...priceListForm,
        selectedProducts: [...priceListForm.selectedProducts, productId],
      });
    }
  };

  const filteredPriceLists = priceLists.filter(
    (pl) =>
      pl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pl.description || "").toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Özel Fiyat Listeleri</h1>
          <p className="mt-1 text-sm text-gray-600">
            Fiyat listelerini görüntüleyin ve yönetin
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedPriceList(null);
            setPriceListForm(defaultForm());
            setIsPriceListModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Yeni Fiyat Listesi
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
            placeholder="Fiyat listesi ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </motion.div>

      {/* Price Lists Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredPriceLists.map((list, index) => (
            <motion.div
              key={list.id}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <TagIcon className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{list.description || "—"}</p>
                  </div>
                  {list.isActive && <Badge variant="new">Aktif</Badge>}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Müşteri Grubu</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {list.customerGroup}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <PercentBadgeIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">İndirim Oranı</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      %{list.discountRate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Ürün Sayısı</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {list.productCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Geçerlilik</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900">
                      {new Date(list.validFrom).toLocaleDateString("tr-TR")} -{" "}
                      {new Date(list.validUntil).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditPriceList(list)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeletePriceList(list.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {filteredPriceLists.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <TagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Fiyat listesi bulunamadı.</p>
        </div>
      )}

      {/* Price List Modal */}
      <AnimatePresence>
        {isPriceListModalOpen && (
          <>
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsPriceListModalOpen(false)}
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
                  {selectedPriceList ? "Fiyat Listesi Düzenle" : "Yeni Fiyat Listesi"}
                </h2>
                <button
                  onClick={() => setIsPriceListModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <form
                onSubmit={selectedPriceList ? handleUpdatePriceList : handleAddPriceList}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Liste Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={priceListForm.name}
                    onChange={(e) =>
                      setPriceListForm({ ...priceListForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Örn: VIP Müşteri Fiyat Listesi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={priceListForm.description}
                    onChange={(e) =>
                      setPriceListForm({ ...priceListForm, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Fiyat listesi açıklaması"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Müşteri Grubu *
                  </label>
                  <select
                    required
                    value={priceListForm.customerGroup}
                    onChange={(e) =>
                      setPriceListForm({ ...priceListForm, customerGroup: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ALL">Tüm Müşteriler</option>
                    <option value="VIP">VIP</option>
                    <option value="BULK">Toplu Alım</option>
                    <option value="NEW">Yeni Müşteri</option>
                    <option value="CORPORATE">Kurumsal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İndirim Oranı (%) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    value={priceListForm.discountRate}
                    onChange={(e) =>
                      setPriceListForm({
                        ...priceListForm,
                        discountRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Geçerlilik Başlangıcı *
                    </label>
                    <input
                      type="date"
                      required
                      value={priceListForm.validFrom}
                      onChange={(e) =>
                        setPriceListForm({ ...priceListForm, validFrom: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Geçerlilik Bitişi *
                    </label>
                    <input
                      type="date"
                      required
                      value={priceListForm.validUntil}
                      onChange={(e) =>
                        setPriceListForm({ ...priceListForm, validUntil: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ürünler (Opsiyonel)
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {products.length > 0 ? (
                      <div className="space-y-2">
                        {products.map((product) => (
                          <label
                            key={product.id}
                            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={priceListForm.selectedProducts.includes(product.id)}
                              onChange={() => toggleProductSelection(product.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-900">{product.name}</span>
                            <span className="text-xs text-gray-500 ml-auto">
                              {(product.discountPrice ?? product.price ?? 0).toLocaleString("tr-TR")} ₺
                            </span>
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
                    {priceListForm.selectedProducts.length} ürün seçildi
                  </p>
                </div>

                <div className="pt-4 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsPriceListModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Kaydediliyor..." : selectedPriceList ? "Güncelle" : "Ekle"}
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
