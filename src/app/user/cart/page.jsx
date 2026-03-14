"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  MapPin,
  Banknote,
  Clock,
  ShoppingBag,
  Truck,
  Store,
  ChevronRight,
  ChevronLeft,
  StickyNote,
  ArrowRight,
  ShieldCheck,
  ShoppingBasket,
  PlusCircle,
  CreditCard,
  Wallet,
  CheckCircle2,
  Loader2,
  User,
  Phone,
  FileText,
  Save,
} from "lucide-react";
import { useMultiCart } from "@/contexts/MultiCartContext";
import { toast } from "sonner";

const ADDRESSES_STORAGE_KEY = "civardaki_user_addresses";

function loadSavedAddresses() {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(ADDRESSES_STORAGE_KEY) : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAddressesToStorage(addresses) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
    }
  } catch (e) {
    console.warn("Could not save addresses", e);
  }
}

function buildAddressLine(addr) {
  return [addr.line1, addr.line2, addr.district, addr.city].filter(Boolean).join(", ");
}

const DELIVERY_TYPES = [
  { id: "delivery", label: "Teslimat", desc: "Adresinize getirilir" },
  { id: "pickup", label: "Mağazadan Al", desc: "Hazır olunca alırsınız" },
  { id: "getir", label: "Getir / Yemeksepeti", desc: "Platform üzerinden" },
  { id: "yolcu", label: "Yolcu", desc: "Kurye ile teslimat" },
];

const PAYMENT_METHODS = [
  { id: "cash", label: "Kapıda Nakit", icon: Banknote },
  { id: "card", label: "Kapıda Kart", icon: CreditCard },
  { id: "online", label: "Online Ödeme", icon: Wallet },
];

export default function CartPage() {
  const router = useRouter();
  const { carts, removeFromCart, clearCart, updateCartItem } = useMultiCart();
  const activeCarts = Object.entries(carts).filter(([_, items]) => items && items.length > 0);

  if (activeCarts.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="relative mb-10">
          <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center animate-pulse">
            <ShoppingBasket className="w-16 h-16 text-slate-200" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#004aad] rounded-2xl flex items-center justify-center text-white shadow-xl">
            <PlusCircle className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-4xl font-black text-slate-950 uppercase italic tracking-tighter mb-4">Sepetiniz Henüz Boş</h2>
        <p className="text-slate-400 font-bold mb-10 max-w-sm italic">
          Keşfet sayfasından size en yakın işletmeleri inceleyip harika ürünler ekleyebilirsiniz.
        </p>
        <button
          onClick={() => router.push("/user")}
          className="px-12 py-6 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-[#004aad] transition-all shadow-2xl active:scale-95 flex items-center gap-4"
        >
          KEŞFETMEYE BAŞLA <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 font-inter antialiased text-left">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100 mb-4">
            <ShoppingBasket className="w-4 h-4 text-[#004aad]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#004aad]">Aktif Sepetler</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">SEPETİM</h1>
          <p className="text-slate-400 font-bold text-lg italic mt-4">Toplam {activeCarts.length} farklı işletmeden siparişiniz var.</p>
        </div>
        <button
          onClick={() => router.push("/user")}
          className="px-8 py-5 bg-white border border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-[#004aad] hover:text-[#004aad] transition-all shadow-sm"
        >
          ALIŞVERİŞE DEVAM ET
        </button>
      </div>

      <div className="space-y-16">
        {activeCarts.map(([slug, items]) => (
          <CartSection
            key={slug}
            slug={slug}
            items={items}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            updateCartItem={updateCartItem}
          />
        ))}
      </div>
    </div>
  );
}

function CartSection({ slug, items, removeFromCart, clearCart, updateCartItem }) {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [deliveryType, setDeliveryType] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("custom");
  const [customAddress, setCustomAddress] = useState({
    title: "Ev",
    line1: "",
    line2: "",
    city: "",
    district: "",
    phone: "",
  });
  const [customerName, setCustomerName] = useState(session?.user?.name || "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNote, setOrderNote] = useState("");

  useEffect(() => {
    const saved = loadSavedAddresses();
    setAddresses(saved);
    if (saved.length > 0) {
      setSelectedAddressId((prev) => {
        if (prev === "custom") return saved[0].id;
        return saved.some((a) => a.id === prev) ? prev : saved[0].id;
      });
    }
  }, []);

  const persistAddresses = useCallback((nextAddresses) => {
    setAddresses(nextAddresses);
    saveAddressesToStorage(nextAddresses);
  }, []);

  const handleSaveNewAddress = useCallback(
    (addr) => {
      const title = (addr.title || "").trim() || "Adres";
      const line1 = (addr.line1 || "").trim();
      const city = (addr.city || "").trim();
      const district = (addr.district || "").trim();
      if (!line1 || !city || !district) {
        toast.error("Lütfen sokak, ilçe ve il alanlarını doldurun.");
        return;
      }
      const line2 = (addr.line2 || "").trim() || undefined;
      const newAddr = {
        id: "addr-" + Date.now(),
        title,
        line1,
        line2,
        district,
        city,
        phone: (addr.phone || "").trim() || undefined,
        address: [line1, line2, district, city].filter(Boolean).join(", "),
      };
      const next = [...addresses, newAddr];
      persistAddresses(next);
      setSelectedAddressId(newAddr.id);
      toast.success("Adres kaydedildi", { description: "Sonraki siparişlerde listeden seçebilirsiniz." });
    },
    [addresses, persistAddresses]
  );

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = deliveryType === "pickup" ? 0 : 25;
  const total = subtotal + deliveryFee;
  const businessName = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const addressForOrder =
    selectedAddressId === "custom"
      ? {
          title: customAddress.title || "Adres",
          line1: customAddress.line1,
          line2: customAddress.line2,
          city: customAddress.city,
          district: customAddress.district,
          phone: customAddress.phone,
          address: buildAddressLine(customAddress),
        }
      : selectedAddress
        ? {
            title: selectedAddress.title,
            line1: selectedAddress.line1 || selectedAddress.address,
            line2: selectedAddress.line2,
            city: selectedAddress.city,
            district: selectedAddress.district,
            phone: selectedAddress.phone,
            address: selectedAddress.address || buildAddressLine(selectedAddress),
          }
        : null;

  const payload = {
    businessSlug: slug,
    customerName: customerName.trim() || "Müşteri",
    customerPhone: customerPhone.trim() || addressForOrder?.phone || "",
    deliveryAddress: addressForOrder || { line1: "Adres belirtilmedi", city: "", district: "" },
    deliveryType,
    paymentMethod,
    note: orderNote.trim() || undefined,
    items: items.map((item) => {
      const optionsText = item.selectedOptions && Object.values(item.selectedOptions).flat().length > 0
        ? " (" + Object.values(item.selectedOptions).flat().map((o) => o?.name).filter(Boolean).join(", ") + ")"
        : "";
      return {
        name: (item.product?.name || "Ürün") + optionsText + (item.note ? ` [Not: ${item.note}]` : ""),
        qty: item.quantity,
        price: item.unitPrice ?? item.totalPrice / item.quantity,
      };
    }),
    subtotal,
    deliveryFee,
    total,
  };

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Lütfen adınızı girin.");
      return;
    }
    if (deliveryType !== "pickup" && (!addressForOrder?.line1 || !addressForOrder?.district || !addressForOrder?.city)) {
      toast.error("Lütfen teslimat adresini eksiksiz doldurun.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sipariş alınamadı.");
      setOrderSuccess({
        orderNumber: data.orderNumber,
        businessName: data.businessName || businessName,
        total: data.total,
      });
      if (selectedAddressId === "custom" && customAddress?.line1?.trim() && customAddress?.city?.trim() && customAddress?.district?.trim()) {
        handleSaveNewAddress(customAddress);
      }
      clearCart(slug);
      toast.success("Siparişiniz alındı!", {
        description: `Sipariş no: ${data.orderNumber}`,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      });
    } catch (err) {
      toast.error(err.message || "Sipariş oluşturulurken hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden p-12 text-center"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tight mb-2">Siparişiniz Alındı</h2>
        <p className="text-slate-500 font-bold mb-6">{orderSuccess.businessName}</p>
        <div className="inline-block bg-slate-50 rounded-2xl px-8 py-4 mb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sipariş No</p>
          <p className="text-2xl font-black text-[#004aad] tracking-tighter font-mono">{orderSuccess.orderNumber}</p>
        </div>
        <p className="text-slate-600 font-medium mb-8">
          Toplam <span className="font-black text-slate-950">{Number(orderSuccess.total).toFixed(2)}₺</span> — İşletme tarafından onaylandıktan sonra hazırlanacaktır.
        </p>
        <Link
          href="/user"
          className="inline-flex items-center gap-2 px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#004aad] transition-all"
        >
          Alışverişe Dön <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    );
  }

  const steps = [
    { num: 1, label: "Sepet" },
    { num: 2, label: "Teslimat" },
    { num: 3, label: "Ödeme" },
    { num: 4, label: "Onay" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden relative"
    >
      <div className="bg-slate-950 p-8 lg:p-12 flex flex-col md:flex-row justify-between items-center text-white gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-[2rem] flex items-center justify-center border border-white/10 shrink-0">
            <Store className="w-10 h-10 text-blue-400" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{businessName}</h2>
            <Link
              href={`/isletme/${slug}`}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 hover:text-white mt-3 flex items-center justify-center md:justify-start gap-2 transition-colors"
            >
              MENÜYÜ GÖR <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {steps.map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  step === s.num ? "bg-white text-slate-950" : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {s.num}. {s.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tahmini</p>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span className="text-xl font-black italic">30–45 dk</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 lg:p-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepCart
              key="step1"
              slug={slug}
              items={items}
              removeFromCart={removeFromCart}
              updateCartItem={updateCartItem}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              total={total}
              onNext={() => setStep(2)}
              clearCart={clearCart}
            />
          )}
          {step === 2 && (
            <StepDelivery
              key="step2"
              deliveryType={deliveryType}
              setDeliveryType={setDeliveryType}
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
              customAddress={customAddress}
              setCustomAddress={setCustomAddress}
              onSaveNewAddress={handleSaveNewAddress}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              orderNote={orderNote}
              setOrderNote={orderNote}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              deliveryTypes={DELIVERY_TYPES}
            />
          )}
          {step === 3 && (
            <StepPayment
              key="step3"
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              paymentMethods={PAYMENT_METHODS}
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <StepConfirm
              key="step4"
              payload={payload}
              businessName={businessName}
              onBack={() => setStep(3)}
              onSubmit={handleSubmitOrder}
              submitting={submitting}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function StepCart({ slug, items, removeFromCart, updateCartItem, subtotal, deliveryFee, total, onNext, clearCart }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="grid grid-cols-1 xl:grid-cols-12 gap-10"
    >
      <div className="xl:col-span-7 space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Seçilen ürünler</h4>
          <button
            type="button"
            onClick={() => clearCart(slug)}
            className="text-[10px] font-black text-rose-500 hover:text-rose-700 uppercase tracking-widest"
          >
            Sepeti boşalt
          </button>
        </div>
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.uniqueId} className="flex gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                {item.product?.image ? (
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-950 truncate">{item.product?.name}</h3>
                {Object.values(item.selectedOptions || {}).flat().length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    {Object.values(item.selectedOptions).flat().map((o) => o?.name).filter(Boolean).join(", ")}
                  </p>
                )}
                {item.note && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <StickyNote className="w-3 h-3" /> {item.note}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        const q = Math.max(1, item.quantity - 1);
                        const u = item.unitPrice ?? item.totalPrice / item.quantity;
                        updateCartItem(slug, item.uniqueId, { quantity: q, totalPrice: u * q });
                      }}
                      className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-500"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const u = item.unitPrice ?? item.totalPrice / item.quantity;
                        updateCartItem(slug, item.uniqueId, {
                          quantity: item.quantity + 1,
                          totalPrice: u * (item.quantity + 1),
                        });
                      }}
                      className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-[#004aad]">{item.totalPrice?.toFixed(2)}₺</span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(slug, item.uniqueId)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="xl:col-span-5">
        <div className="sticky top-24 bg-slate-50 rounded-3xl border border-slate-100 p-8 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-bold">Ara toplam</span>
            <span className="font-black text-slate-950">{subtotal.toFixed(2)}₺</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-bold">Teslimat</span>
            <span className="font-black text-slate-950">{deliveryFee.toFixed(2)}₺</span>
          </div>
          <div className="border-t border-slate-200 pt-4 flex justify-between items-baseline">
            <span className="text-[10px] font-black uppercase text-slate-500">Toplam</span>
            <span className="text-3xl font-black text-[#004aad]">{total.toFixed(2)}₺</span>
          </div>
          <button
            type="button"
            onClick={onNext}
            className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#004aad] transition-all flex items-center justify-center gap-2"
          >
            Teslimat bilgilerine geç <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StepDelivery({
  deliveryType,
  setDeliveryType,
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  customAddress,
  setCustomAddress,
  onSaveNewAddress,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  orderNote,
  setOrderNote,
  onBack,
  onNext,
  deliveryTypes,
}) {
  const canSaveAddress =
    selectedAddressId === "custom" &&
    customAddress?.line1?.trim() &&
    customAddress?.city?.trim() &&
    customAddress?.district?.trim();
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="max-w-3xl mx-auto space-y-10"
    >
      <div>
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4" /> Teslimat türü
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {deliveryTypes.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDeliveryType(d.id)}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                deliveryType === d.id
                  ? "border-[#004aad] bg-blue-50 text-slate-950"
                  : "border-slate-100 hover:border-slate-200 bg-white"
              }`}
            >
              <p className="font-black text-slate-950">{d.label}</p>
              <p className="text-xs text-slate-500 mt-1">{d.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <User className="w-4 h-4" /> Siparişi veren
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">Ad Soyad</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Adınız soyadınız"
              className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#004aad] focus:border-[#004aad] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">Telefon</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="5XX XXX XX XX"
              className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#004aad] focus:border-[#004aad] outline-none"
            />
          </div>
        </div>
      </div>

      {deliveryType !== "pickup" && (
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Teslimat adresi
          </h4>
          <select
            value={selectedAddressId}
            onChange={(e) => setSelectedAddressId(e.target.value)}
            className="w-full p-4 rounded-2xl border border-slate-200 mb-4 focus:ring-2 focus:ring-[#004aad] focus:border-[#004aad] outline-none"
          >
            <option value="custom">Yeni adres ekle</option>
            {(addresses || []).map((addr) => (
              <option key={addr.id} value={addr.id}>
                {addr.title} — {addr.address || buildAddressLine(addr)}
              </option>
            ))}
          </select>
          {selectedAddressId === "custom" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <input
                  type="text"
                  value={customAddress.title}
                  onChange={(e) => setCustomAddress((a) => ({ ...a, title: e.target.value }))}
                  placeholder="Adres başlığı (Ev / İş)"
                  className="sm:col-span-2 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#004aad] focus:border-[#004aad] outline-none"
                />
                <input
                  type="text"
                  value={customAddress.line1}
                  onChange={(e) => setCustomAddress((a) => ({ ...a, line1: e.target.value }))}
                  placeholder="Sokak, bina no, daire"
                  className="sm:col-span-2 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#004aad] focus:border-[#004aad] outline-none"
                />
                <input
                  type="text"
                  value={customAddress.line2}
                  onChange={(e) => setCustomAddress((a) => ({ ...a, line2: e.target.value }))}
                  placeholder="Mahalle / ek adres"
                  className="sm:col-span-2 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#004aad] focus:border-[#004aad] outline-none"
                />
                <input
                  type="text"
                  value={customAddress.district}
                  onChange={(e) => setCustomAddress((a) => ({ ...a, district: e.target.value }))}
                  placeholder="İlçe"
                  className="p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#004aad] focus:border-[#004aad] outline-none"
                />
                <input
                  type="text"
                  value={customAddress.city}
                  onChange={(e) => setCustomAddress((a) => ({ ...a, city: e.target.value }))}
                  placeholder="İl"
                  className="p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#004aad] focus:border-[#004aad] outline-none"
                />
                <input
                  type="tel"
                  value={customAddress.phone}
                  onChange={(e) => setCustomAddress((a) => ({ ...a, phone: e.target.value }))}
                  placeholder="Telefon"
                  className="sm:col-span-2 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#004aad] focus:border-[#004aad] outline-none"
                />
              </div>
              {canSaveAddress && onSaveNewAddress && (
                <button
                  type="button"
                  onClick={() => onSaveNewAddress(customAddress)}
                  className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <Save className="w-4 h-4" /> Adresi kaydet (sonraki siparişlerde kullan)
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Sipariş notu
        </h4>
        <textarea
          value={orderNote}
          onChange={(e) => setOrderNote(e.target.value)}
          placeholder="Özel istekleriniz, kapı tarifi vb."
          rows={3}
          className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#004aad] focus:border-[#004aad] outline-none resize-none"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="py-4 px-8 rounded-2xl border-2 border-slate-200 font-black text-sm uppercase tracking-widest hover:bg-slate-50 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Geri
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-4 bg-slate-950 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#004aad] flex items-center justify-center gap-2"
        >
          Ödeme seçimine geç <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function StepPayment({ paymentMethod, setPaymentMethod, paymentMethods, onBack, onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="max-w-2xl mx-auto space-y-10"
    >
      <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
        <CreditCard className="w-4 h-4" /> Ödeme yöntemi
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {paymentMethods.map((pm) => (
          <button
            key={pm.id}
            type="button"
            onClick={() => setPaymentMethod(pm.id)}
            className={`p-8 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
              paymentMethod === pm.id
                ? "border-[#004aad] bg-blue-50 text-slate-950"
                : "border-slate-100 hover:border-slate-200 bg-white"
            }`}
          >
            <pm.icon className="w-10 h-10 text-[#004aad]" />
            <span className="font-black text-sm text-center">{pm.label}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="py-4 px-8 rounded-2xl border-2 border-slate-200 font-black text-sm uppercase tracking-widest hover:bg-slate-50 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Geri
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-4 bg-slate-950 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#004aad] flex items-center justify-center gap-2"
        >
          Sipariş özeti <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function StepConfirm({ payload, businessName, onBack, onSubmit, submitting }) {
  const deliveryLabels = { delivery: "Teslimat", pickup: "Mağazadan Al", getir: "Getir/Yemeksepeti", yolcu: "Yolcu" };
  const paymentLabels = { cash: "Kapıda Nakit", card: "Kapıda Kart", online: "Online Ödeme" };
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="max-w-3xl mx-auto space-y-10"
    >
      <div className="bg-slate-50 rounded-3xl border border-slate-100 p-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Sipariş özeti</h4>
        <p className="font-black text-slate-950 text-lg">{businessName}</p>
        <div className="space-y-2 text-sm">
          <p><span className="text-slate-500">Alıcı:</span> {payload.customerName}</p>
          {payload.customerPhone && <p><span className="text-slate-500">Tel:</span> {payload.customerPhone}</p>}
          <p><span className="text-slate-500">Teslimat:</span> {deliveryLabels[payload.deliveryType] || payload.deliveryType}</p>
          {payload.deliveryAddress?.address && <p><span className="text-slate-500">Adres:</span> {payload.deliveryAddress.address}</p>}
          <p><span className="text-slate-500">Ödeme:</span> {paymentLabels[payload.paymentMethod] || payload.paymentMethod}</p>
          {payload.note && <p><span className="text-slate-500">Not:</span> {payload.note}</p>}
        </div>
        <ul className="border-t border-slate-200 pt-4 space-y-2">
          {payload.items.map((item, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-slate-700">{item.name} × {item.qty}</span>
              <span className="font-black text-slate-950">{(item.price * item.qty).toFixed(2)}₺</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between items-baseline pt-4 border-t border-slate-200">
          <span className="text-[10px] font-black uppercase text-slate-500">Toplam</span>
          <span className="text-2xl font-black text-[#004aad]">{payload.total.toFixed(2)}₺</span>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="py-4 px-8 rounded-2xl border-2 border-slate-200 font-black text-sm uppercase tracking-widest hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" /> Geri
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 py-5 bg-slate-950 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#004aad] flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Gönderiliyor...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" /> Siparişi ver
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
