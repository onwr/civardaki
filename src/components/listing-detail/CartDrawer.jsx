"use client";

import { useState, useEffect } from "react";
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
  Store,
  PackageCheck,
  Home,
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

  const stepTitle =
    cartStep === 1
      ? `Sepetim (${cart?.length || 0})`
      : cartStep === 2
        ? "Teslimat & Ödeme"
        : "Sipariş Alındı";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="absolute bottom-0 right-0 top-0 flex w-full flex-col overflow-hidden bg-[#f8fafc] shadow-2xl lg:w-[760px]"
        >
          {/* HEADER */}
          <div className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
            <div className="flex items-center justify-between px-5 py-4 lg:px-7">
              <button
                type="button"
                onClick={cartStep === 1 ? onClose : () => setCartStep(1)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  {listing?.title || "Civardaki"}
                </p>
                <h2 className="mt-1 text-sm font-black text-slate-950">
                  {stepTitle}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* STEPS */}
            <div className="px-5 pb-4 lg:px-7">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 1, label: "Sepet" },
                  { id: 2, label: "Teslimat" },
                  { id: 3, label: "Onay" },
                ].map((step) => (
                  <div
                    key={step.id}
                    className={`h-2 rounded-full ${
                      cartStep >= step.id ? "bg-[#0057d9]" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto px-5 py-6 pb-36 lg:px-7">
            {cartStep === 1 && (
              <>
                {!cart?.length ? (
                  <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-blue-50">
                      <ShoppingBasket className="h-11 w-11 text-[#0057d9]" />
                    </div>

                    <h3 className="text-3xl font-black text-slate-950">
                      Sepetiniz boş
                    </h3>

                    <p className="mt-3 max-w-sm text-sm leading-7 text-slate-500">
                      Henüz sepetinize ürün eklemediniz. İşletmenin ürün ve
                      hizmetlerini inceleyerek siparişe başlayabilirsiniz.
                    </p>

                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-8 rounded-2xl bg-[#0057d9] px-8 py-4 text-sm font-black text-white shadow-[0_16px_34px_rgba(0,87,217,0.24)]"
                    >
                      Ürünleri İncele
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                          <Store className="h-6 w-6 text-[#0057d9]" />
                        </div>

                        <div>
                          <h3 className="font-black text-slate-950">
                            Sepet Detayları
                          </h3>
                          <p className="text-sm text-slate-500">
                            {cart.length} ürün sepette
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {cart.map((item) => (
                          <motion.div
                            layout
                            key={item.uniqueId}
                            className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                          >
                            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-200">
                              <img
                                src={item.product?.image}
                                alt={item.product?.name}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="line-clamp-2 font-black text-slate-950">
                                  {item.product?.name}
                                  {item.variantName && (
                                    <span className="font-semibold text-slate-500">
                                      {" "}
                                      — {item.variantName}
                                    </span>
                                  )}
                                </h4>

                                <span className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-sm font-black text-[#0057d9]">
                                  {item.totalPrice}₺
                                </span>
                              </div>

                              {item.selectedOptions &&
                                Object.keys(item.selectedOptions).length > 0 && (
                                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                                    {Object.values(item.selectedOptions)
                                      .flat()
                                      .map((o) => o?.name)
                                      .filter(Boolean)
                                      .join(", ")}
                                  </p>
                                )}

                              <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateCartQuantity(item.uniqueId, -1)
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-50"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>

                                  <span className="w-8 text-center text-sm font-black text-slate-950">
                                    {item.quantity}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateCartQuantity(item.uniqueId, 1)
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-50"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.uniqueId)}
                                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <OrderSummary cartTotal={cartTotal} />
                  </div>
                )}
              </>
            )}

            {cartStep === 2 && (
              <div className="space-y-5">
                <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xl font-black text-slate-950">
                      <MapPin className="h-5 w-5 text-[#0057d9]" />
                      Teslimat Adresi
                    </h3>

                    {isAddingAddress && (
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-600"
                      >
                        Vazgeç
                      </button>
                    )}
                  </div>

                  {!isAddingAddress ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
                            selectedAddress === addr.id
                              ? "border-[#0057d9] bg-blue-50"
                              : "border-slate-100 bg-white hover:border-slate-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            className="hidden"
                            checked={selectedAddress === addr.id}
                            onChange={() => setSelectedAddress(addr.id)}
                          />

                          <div className="flex gap-3">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                                selectedAddress === addr.id
                                  ? "bg-[#0057d9] text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <Home className="h-5 w-5" />
                            </div>

                            <div>
                              <span className="font-black text-slate-950">
                                {addr.title}
                              </span>
                              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                {addr.line1}
                                {addr.district || addr.city
                                  ? ` · ${[addr.district, addr.city]
                                      .filter(Boolean)
                                      .join(", ")}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </label>
                      ))}

                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(true)}
                        className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 transition hover:border-[#0057d9] hover:bg-blue-50 hover:text-[#0057d9]"
                      >
                        <Plus className="h-6 w-6" />
                        <span className="font-black">Yeni Adres Ekle</span>
                      </button>
                    </div>
                  ) : (
                    <AddressForm
                      cities={cities}
                      districts={districts}
                      neighborhoods={neighborhoods}
                      loadingDistricts={loadingDistricts}
                      loadingNeighborhoods={loadingNeighborhoods}
                      newAddressForm={newAddressForm}
                      setNewAddressForm={setNewAddressForm}
                      handleSaveAddress={handleSaveAddress}
                    />
                  )}
                </section>

                <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-5 flex items-center gap-2 text-xl font-black text-slate-950">
                    <CreditCard className="h-5 w-5 text-[#0057d9]" />
                    Ödeme
                  </h3>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                        <CheckCircle className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="font-black text-slate-950">
                          Kapıda Ödeme
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Siparişinizi teslim alırken nakit veya POS ile
                          ödeyebilirsiniz.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <OrderSummary cartTotal={cartTotal} />
              </div>
            )}

            {cartStep === 3 && (
              <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="mb-6 flex h-28 w-28 items-center justify-center rounded-[36px] bg-emerald-50 text-emerald-600"
                >
                  <PackageCheck className="h-14 w-14" />
                </motion.div>

                <h2 className="text-3xl font-black text-slate-950">
                  Siparişiniz alındı
                </h2>

                <p className="mt-3 max-w-sm text-sm leading-7 text-slate-500">
                  Teşekkürler. Siparişiniz işletmeye iletildi. Hazırlık süreci
                  başladığında bilgilendirileceksiniz.
                </p>

                <div className="mt-8 w-full max-w-sm rounded-[24px] border border-slate-100 bg-white p-5 text-left shadow-sm">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Sipariş no</span>
                    <span className="font-mono font-black text-slate-950">
                      {orderNumber ? `#${orderNumber}` : "—"}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-slate-500">Tahmini teslimat</span>
                    <span className="font-black text-slate-950">30-40 dk</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onSuccess}
                  className="mt-8 rounded-2xl bg-[#0057d9] px-8 py-4 text-sm font-black text-white shadow-[0_16px_34px_rgba(0,87,217,0.24)]"
                >
                  Alışverişe Devam Et
                </button>
              </div>
            )}
          </div>

          {/* BOTTOM BAR */}
          {cartStep === 1 && cart?.length > 0 && (
            <BottomBar
              total={cartTotal}
              buttonText="Siparişi Tamamla"
              onClick={() => setCartStep(2)}
              icon={ShoppingBasket}
            />
          )}

          {cartStep === 2 && (
            <BottomBar
              total={cartTotal}
              buttonText={isSubmitting ? "Gönderiliyor..." : "Siparişi Onayla"}
              onClick={onPlaceOrder ?? (() => setCartStep(3))}
              disabled={!selectedAddress || addresses?.length === 0 || isSubmitting}
              icon={CheckCircle}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function OrderSummary({ cartTotal }) {
  return (
    <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="mb-5 flex items-center gap-2 text-xl font-black text-slate-950">
        <Info className="h-5 w-5 text-[#0057d9]" />
        Sipariş Özeti
      </h3>

      <div className="space-y-3 border-b border-slate-100 pb-4 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Sepet</span>
          <span className="font-bold">{cartTotal}₺</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Teslimat</span>
          <span className="font-black text-emerald-600">Ücretsiz</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <span className="font-black text-slate-950">Ödenecek</span>
        <span className="text-2xl font-black text-slate-950">{cartTotal}₺</span>
      </div>
    </section>
  );
}

function BottomBar({ total, buttonText, onClick, disabled, icon: Icon }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 p-5 backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">Toplam</p>
          <p className="text-3xl font-black text-slate-950">{total}₺</p>
        </div>

        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#0057d9] px-8 text-sm font-black text-white shadow-[0_16px_34px_rgba(0,87,217,0.24)] transition hover:bg-[#004cc2] disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
        >
          <Icon className="h-5 w-5" />
          {buttonText}
        </button>
      </div>
    </div>
  );
}

function AddressForm({
  cities,
  districts,
  neighborhoods,
  loadingDistricts,
  loadingNeighborhoods,
  newAddressForm,
  setNewAddressForm,
  handleSaveAddress,
}) {
  const isDisabled =
    !newAddressForm.title?.trim() ||
    !newAddressForm.line1?.trim() ||
    !newAddressForm.city?.trim() ||
    !newAddressForm.district?.trim() ||
    !newAddressForm.mahalle?.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Input
        label="Adres başlığı"
        value={newAddressForm.title ?? ""}
        onChange={(value) =>
          setNewAddressForm({ ...newAddressForm, title: value })
        }
        placeholder="Örn: Ev, İş"
      />

      <Field label="İl">
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
      </Field>

      <Field label="İlçe">
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
      </Field>

      <Field label="Mahalle">
        <SearchableDropdown
          options={neighborhoods}
          value={
            neighborhoods.find(
              (n) => n.mahalle_adi === (newAddressForm.mahalle ?? "")
            )?.mahalle_id ?? ""
          }
          onSelect={(n) =>
            setNewAddressForm({
              ...newAddressForm,
              mahalle: n.mahalle_adi,
            })
          }
          getOptionValue={(n) => n.mahalle_id}
          getOptionLabel={(n) => n.mahalle_adi}
          placeholder="Mahalle seçin"
          disabled={!newAddressForm.districtId}
          loading={loadingNeighborhoods}
          emptyMessage="Mahalle bulunamadı"
        />
      </Field>

      <Input
        label="Adres satırı"
        value={newAddressForm.line1 ?? ""}
        onChange={(value) =>
          setNewAddressForm({ ...newAddressForm, line1: value })
        }
        placeholder="Cadde, sokak, bina no..."
      />

      <Input
        label="Adres satırı 2"
        value={newAddressForm.line2 ?? ""}
        onChange={(value) =>
          setNewAddressForm({ ...newAddressForm, line2: value })
        }
        placeholder="Daire, kat, kapı no..."
      />

      <Input
        label="Telefon"
        value={newAddressForm.phone ?? ""}
        onChange={(value) =>
          setNewAddressForm({ ...newAddressForm, phone: value })
        }
        placeholder="05XX XXX XX XX"
        type="tel"
      />

      <button
        type="button"
        onClick={handleSaveAddress}
        disabled={isDisabled}
        className="h-14 w-full rounded-2xl bg-[#0057d9] text-sm font-black text-white shadow-[0_16px_34px_rgba(0,87,217,0.20)] transition hover:bg-[#004cc2] disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
      >
        Adresi Kaydet
      </button>
    </motion.div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0057d9] focus:bg-white"
      />
    </div>
  );
}