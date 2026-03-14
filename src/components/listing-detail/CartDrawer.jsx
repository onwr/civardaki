"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  X,
  MapPin,
  Plus,
  Minus,
  Trash2,
  ShoppingBasket,
  CheckCircle,
  CreditCard,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SearchableDropdown from "./SearchableDropdown";

export default function CartDrawer({
  isOpen,
  onClose,
  listing,
  cart,
  cartTotal,
  cartStep,
  setCartStep,
  removeFromCart,
  updateCartQuantity,
  addresses,
  selectedAddress,
  setSelectedAddress,
  isAddingAddress,
  setIsAddingAddress,
  newAddressForm,
  setNewAddressForm,
  handleSaveAddress,
  onSuccess,
  onPlaceOrder,
  isSubmitting,
  orderNumber,
}) {
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  useEffect(() => {
    if (!isOpen || !isAddingAddress) return;
    if (cities.length === 0) {
      fetch("/api/locations/cities")
        .then((r) => r.json())
        .then((d) => setCities(Array.isArray(d) ? d : []))
        .catch(() => setCities([]));
    }
  }, [isOpen, isAddingAddress, cities.length]);

  useEffect(() => {
    const cityId = newAddressForm?.cityId ?? "";
    if (!cityId) {
      setDistricts([]);
      return;
    }
    setLoadingDistricts(true);
    fetch(`/api/locations/districts?sehir_id=${encodeURIComponent(cityId)}`)
      .then((r) => r.json())
      .then((d) => setDistricts(Array.isArray(d) ? d : []))
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDistricts(false));
  }, [newAddressForm?.cityId]);

  useEffect(() => {
    const districtId = newAddressForm?.districtId ?? "";
    if (!districtId) {
      setNeighborhoods([]);
      return;
    }
    setLoadingNeighborhoods(true);
    fetch(`/api/locations/neighborhoods?ilce_id=${encodeURIComponent(districtId)}`)
      .then((r) => r.json())
      .then((d) => setNeighborhoods(Array.isArray(d) ? d : []))
      .catch(() => setNeighborhoods([]))
      .finally(() => setLoadingNeighborhoods(false));
  }, [newAddressForm?.districtId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[99999] bg-white flex flex-col lg:flex-row overflow-hidden h-[100dvh] w-full"
      >
        {/* Left: summary (desktop) */}
        <div className="hidden lg:flex lg:w-1/3 bg-slate-900 text-white flex-col relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={listing?.coverImage}
              alt=""
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 to-slate-900/60" />
          </div>
          <div className="relative z-10 p-8 flex flex-col h-full">
            <button
              type="button"
              onClick={onClose}
              className="self-start text-white/60 hover:text-white flex items-center gap-2 transition-colors mb-8"
            >
              <ArrowLeft className="w-5 h-5" /> Alışverişe dön
            </button>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Sepet özeti
              </span>
              <h2 className="text-3xl font-bold mb-2 leading-tight">
                {listing?.title}
              </h2>
              <p className="text-slate-400 flex items-center gap-2 text-sm">
                <ShoppingBasket className="w-4 h-4" /> {cart?.length || 0} ürün
              </p>
            </div>
            <div className="mt-auto pt-6">
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">
                  Toplam
                </p>
                <p className="text-3xl font-bold">{cartTotal}₺</p>
                <p className="text-emerald-400 text-sm font-medium mt-1">
                  Teslimat ücretsiz
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: content */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="shrink-0 p-4 border-b border-slate-100 flex justify-between items-center lg:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={cartStep === 1 ? onClose : () => setCartStep(1)}
                className="p-2 -ml-2 text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <span className="font-semibold text-slate-900">
                {cartStep === 1
                  ? `Sepetim (${cart?.length || 0})`
                  : cartStep === 2
                    ? "Ödeme & Sipariş"
                    : "Sipariş alındı"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {cartStep === 1 && (
            <>
              <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-32">
                <div className="max-w-2xl mx-auto">
                  {!cart?.length ? (
                    <div className="flex flex-col items-center justify-center text-center py-16">
                      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                        <ShoppingBasket className="w-10 h-10 text-slate-400" />
                      </div>
                      <h4 className="text-xl font-semibold text-slate-900 mb-2">
                        Sepetiniz boş
                      </h4>
                      <p className="text-slate-500 text-sm max-w-xs mb-8">
                        Henüz sepetinize ürün eklemediniz.
                      </p>
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                      >
                        Menüyü incele
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 hidden lg:block">
                        Sepet detayları
                      </h3>
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <motion.div
                            layout
                            key={item.uniqueId}
                            className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30"
                          >
                            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                              <img
                                src={item.product?.image}
                                alt={item.product?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-semibold text-slate-900 line-clamp-2">
                                  {item.product?.name}
                                  {item.variantName && (
                                    <span className="font-normal text-slate-600"> — {item.variantName}</span>
                                  )}
                                </h4>
                                <span className="font-semibold text-slate-900 shrink-0">
                                  {item.totalPrice}₺
                                </span>
                              </div>
                              {item.selectedOptions &&
                                Object.keys(item.selectedOptions).length > 0 && (
                                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                                    {Object.values(item.selectedOptions)
                                      .flat()
                                      .map((o) => o?.name)
                                      .filter(Boolean)
                                      .join(", ")}
                                  </p>
                                )}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateCartQuantity(item.uniqueId, -1)
                                    }
                                    className="w-8 h-8 flex items-center justify-center rounded-md hover:text-slate-900 text-slate-600"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-6 text-center font-semibold text-slate-900 text-sm">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateCartQuantity(item.uniqueId, 1)
                                    }
                                    className="w-8 h-8 flex items-center justify-center rounded-md hover:text-slate-900 text-slate-600"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.uniqueId)}
                                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {cart?.length > 0 && (
                <div className="shrink-0 p-4 lg:p-6 border-t border-slate-100 bg-white absolute bottom-0 left-0 right-0">
                  <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Toplam</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {cartTotal}₺
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCartStep(2)}
                      className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBasket className="w-5 h-5" /> Siparişi tamamla
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {cartStep === 2 && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50 pb-32">
                <div className="max-w-2xl mx-auto space-y-6">
                  <button
                    type="button"
                    onClick={() => setCartStep(1)}
                    className="hidden lg:flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Sepete dön
                  </button>

                  <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-slate-600" /> Teslimat
                        adresi
                      </h3>
                      {isAddingAddress && (
                        <button
                          type="button"
                          onClick={() => setIsAddingAddress(false)}
                          className="text-sm font-semibold text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg"
                        >
                          Vazgeç
                        </button>
                      )}
                    </div>
                    {!isAddingAddress ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                          <label
                            key={addr.id}
                            className={`cursor-pointer p-4 rounded-xl border-2 transition-colors ${
                              selectedAddress === addr.id
                                ? "border-slate-900 bg-slate-50"
                                : "border-slate-100 hover:border-slate-200"
                            }`}
                          >
                            <input
                              type="radio"
                              name="address"
                              className="hidden"
                              checked={selectedAddress === addr.id}
                              onChange={() => setSelectedAddress(addr.id)}
                            />
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${
                                  selectedAddress === addr.id
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white border-slate-200 text-slate-500"
                                }`}
                              >
                                <MapPin className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="block font-semibold text-slate-900">
                                  {addr.title}
                                </span>
                                <span className="text-sm text-slate-500 line-clamp-2">
                                  {addr.line1}
                                  {addr.district || addr.city
                                    ? ` · ${[addr.district, addr.city].filter(Boolean).join(", ")}`
                                    : ""}
                                </span>
                              </div>
                            </div>
                          </label>
                        ))}
                        <button
                          type="button"
                          onClick={() => setIsAddingAddress(true)}
                          className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-500 font-semibold min-h-[100px]"
                        >
                          <Plus className="w-6 h-6" /> Yeni adres ekle
                        </button>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Adres başlığı
                          </label>
                          <input
                            type="text"
                            value={newAddressForm.title ?? ""}
                            onChange={(e) =>
                              setNewAddressForm({
                                ...newAddressForm,
                                title: e.target.value,
                              })
                            }
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-400 outline-none text-sm"
                            placeholder="Örn: Ev, İş"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">
                            İl
                          </label>
                          <SearchableDropdown
                            options={cities}
                            value={newAddressForm.cityId ?? ""}
                            onSelect={(c) =>
                              setNewAddressForm({
                                ...newAddressForm,
                                cityId: c.sehir_id,
                                city: c.sehir_adi,
                                districtId: "",
                                district: "",
                                mahalle: "",
                              })
                            }
                            getOptionValue={(c) => c.sehir_id}
                            getOptionLabel={(c) => c.sehir_adi}
                            placeholder="İl seçin"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">
                            İlçe
                          </label>
                          <SearchableDropdown
                            options={districts}
                            value={newAddressForm.districtId ?? ""}
                            onSelect={(d) =>
                              setNewAddressForm({
                                ...newAddressForm,
                                districtId: d.ilce_id,
                                district: d.ilce_adi,
                                mahalle: "",
                              })
                            }
                            getOptionValue={(d) => d.ilce_id}
                            getOptionLabel={(d) => d.ilce_adi}
                            placeholder="İlçe seçin"
                            disabled={!newAddressForm.cityId}
                            loading={loadingDistricts}
                            emptyMessage="İlçe bulunamadı"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Mahalle
                          </label>
                          <SearchableDropdown
                            options={neighborhoods}
                            value={
                              neighborhoods.find((n) => n.mahalle_adi === (newAddressForm.mahalle ?? ""))?.mahalle_id ??
                              ""
                            }
                            onSelect={(n) =>
                              setNewAddressForm({ ...newAddressForm, mahalle: n.mahalle_adi })
                            }
                            getOptionValue={(n) => n.mahalle_id}
                            getOptionLabel={(n) => n.mahalle_adi}
                            placeholder="Mahalle seçin"
                            disabled={!newAddressForm.districtId}
                            loading={loadingNeighborhoods}
                            emptyMessage="Mahalle bulunamadı"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Adres satırı (sokak, bina no)
                          </label>
                          <input
                            type="text"
                            value={newAddressForm.line1 ?? ""}
                            onChange={(e) =>
                              setNewAddressForm({
                                ...newAddressForm,
                                line1: e.target.value,
                              })
                            }
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-400 outline-none text-sm"
                            placeholder="Cadde, sokak, bina no..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Adres satırı 2 (isteğe bağlı)
                          </label>
                          <input
                            type="text"
                            value={newAddressForm.line2 ?? ""}
                            onChange={(e) =>
                              setNewAddressForm({
                                ...newAddressForm,
                                line2: e.target.value,
                              })
                            }
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-400 outline-none text-sm"
                            placeholder="Daire, kat, kapı no..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Telefon
                          </label>
                          <input
                            type="tel"
                            value={newAddressForm.phone ?? ""}
                            onChange={(e) =>
                              setNewAddressForm({
                                ...newAddressForm,
                                phone: e.target.value,
                              })
                            }
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-400 outline-none text-sm"
                            placeholder="05XX XXX XX XX"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveAddress}
                          disabled={
                            !newAddressForm.title?.trim() ||
                            !newAddressForm.line1?.trim() ||
                            !newAddressForm.city?.trim() ||
                            !newAddressForm.district?.trim() ||
                            !newAddressForm.mahalle?.trim()
                          }
                          className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Adresi kaydet
                        </button>
                      </motion.div>
                    )}
                  </section>

                  <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-slate-600" /> Ödeme
                    </h3>
                    <div className="rounded-xl p-4 bg-slate-50 border border-slate-100 flex items-start gap-4">
                      <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-slate-900 mb-1">
                          Kapıda ödeme
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                          Siparişinizi teslim alırken nakit veya kart ile
                          ödeyebilirsiniz.
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/50 cursor-pointer mt-4">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-900">
                        Kapıda ödeme (Nakit / POS)
                      </span>
                    </label>
                  </section>

                  <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-slate-600" /> Sipariş özeti
                    </h3>
                    <div className="space-y-2 text-sm text-slate-600 border-b border-slate-100 pb-4">
                      <div className="flex justify-between">
                        <span>Sepet</span>
                        <span>{cartTotal}₺</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Teslimat</span>
                        <span className="text-emerald-600 font-semibold">
                          Ücretsiz
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <span className="font-semibold text-slate-900">
                        Ödenecek
                      </span>
                      <span className="text-xl font-bold text-slate-900">
                        {cartTotal}₺
                      </span>
                    </div>
                  </section>
                </div>
              </div>
              <div className="shrink-0 p-4 lg:p-6 border-t bg-white">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                  <p className="text-xl font-bold text-slate-900 hidden lg:block">
                    {cartTotal}₺
                  </p>
                  <button
                    type="button"
                    onClick={onPlaceOrder ?? (() => setCartStep(3))}
                    disabled={
                      !selectedAddress ||
                      addresses?.length === 0 ||
                      isSubmitting
                    }
                    className="w-full lg:max-w-xs py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      "Gönderiliyor..."
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" /> Siparişi onayla
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {cartStep === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6 text-emerald-600"
              >
                <CheckCircle className="w-12 h-12" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Siparişiniz alındı
              </h2>
              <p className="text-slate-600 max-w-sm mx-auto mb-6">
                Teşekkürler. Siparişiniz hazırlanıyor ve adresinize
                ulaştırılacak.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 w-full max-w-xs mb-6 text-left">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Sipariş no</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {orderNumber ? `#${orderNumber}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tahmini teslimat</span>
                  <span className="font-semibold text-slate-900">
                    30-40 dk
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onSuccess}
                className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Alışverişe devam et
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
