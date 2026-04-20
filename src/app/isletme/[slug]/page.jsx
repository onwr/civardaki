"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMultiCart } from "@/contexts/MultiCartContext";
import { toast } from "sonner";
import { ShoppingBasket } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import Header from "@/components/layout/Header";
import { useListingDetail } from "@/hooks/useListingDetail";
import { getSectorConfig } from "@/lib/listing/sector-config";
import { trackBusinessEvent } from "@/lib/listing/trackBusinessEvent";

import ListingHero from "@/components/listing-detail/ListingHero";
import ListingStickyNav from "@/components/listing-detail/ListingStickyNav";
import ListingOverviewSection from "@/components/listing-detail/ListingOverviewSection";
import ListingOfferingsSection from "@/components/listing-detail/ListingOfferingsSection";
import ListingReviewsSection from "@/components/listing-detail/ListingReviewsSection";
import ListingGallerySection from "@/components/listing-detail/ListingGallerySection";
import ListingSidebar from "@/components/listing-detail/ListingSidebar";
import ProductDetailSheet from "@/components/listing-detail/ProductDetailSheet";
import CartDrawer from "@/components/listing-detail/CartDrawer";
import ReservationDrawer from "@/components/listing-detail/ReservationDrawer";

export default function ListingDetailPage() {
  const params = useParams();
  const slug = (params?.slug || "").toString().trim();
  const { listing, loading, notFound } = useListingDetail(slug);

  const [activeTab, setActiveTab] = useState("overview");
  const [showAllHours, setShowAllHours] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationStep, setReservationStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedGuests, setSelectedGuests] = useState(2);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reservationSubmitting, setReservationSubmitting] = useState(false);
  const [reservationReferenceCode, setReservationReferenceCode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [productQuantity, setProductQuantity] = useState(1);
  const [productOptions, setProductOptions] = useState({});
  const [productNote, setProductNote] = useState("");
  const [cartStep, setCartStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [newAddressForm, setNewAddressForm] = useState({
    title: "",
    line1: "",
    line2: "",
    city: "",
    district: "",
    mahalle: "",
    phone: "",
    cityId: "",
    districtId: "",
  });
  const [orderNumber, setOrderNumber] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: session } = useSession();
  const {
    getCart,
    addToCart: ctxAddToCart,
    removeFromCart: ctxRemoveFromCart,
    updateCartItem,
    clearCart,
  } = useMultiCart();
  const cart = useMemo(() => getCart(slug), [getCart, slug]);
  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + (item.totalPrice || 0), 0),
    [cart],
  );
  const sectorConfig = useMemo(
    () => getSectorConfig(listing?.categorySlug || listing?.sector),
    [listing?.categorySlug, listing?.sector],
  );

  // Profil görünümü telemetrisi: VIEW_PROFILE (60sn dedupe)
  useEffect(() => {
    if (!slug || !listing) return;
    trackBusinessEvent("VIEW_PROFILE", slug, { useViewProfileDedupe: true });
  }, [slug, listing]);

  const track = (type, productId) => {
    if (!slug) return;
    trackBusinessEvent(type, slug, productId != null ? { productId } : undefined);
  };

  useEffect(() => {
    if (selectedProduct) {
      setProductQuantity(1);
      setProductOptions({});
      setProductNote("");
      setSelectedVariant(null);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/user/addresses")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAddresses(data);
          setSelectedAddress(data[0].id);
        }
      })
      .catch(() => setAddresses([]));
  }, [session?.user]);

  const handleSaveAddress = async () => {
    if (!newAddressForm.title?.trim() || !newAddressForm.line1?.trim()) return;
    const line1Full = [
      (newAddressForm.mahalle || "").trim(),
      (newAddressForm.line1 || "").trim(),
    ].filter(Boolean).join(", ");
    const payload = {
      title: newAddressForm.title.trim(),
      line1: line1Full || newAddressForm.line1.trim(),
      line2: (newAddressForm.line2 || "").trim() || undefined,
      city: (newAddressForm.city || "").trim(),
      district: (newAddressForm.district || "").trim() || undefined,
      mahalle: (newAddressForm.mahalle || "").trim() || undefined,
      phone: (newAddressForm.phone || "").trim() || undefined,
    };
    const resetForm = () => {
      setNewAddressForm({
        title: "",
        line1: "",
        line2: "",
        city: "",
        district: "",
        mahalle: "",
        phone: "",
        cityId: "",
        districtId: "",
      });
      setIsAddingAddress(false);
    };
    if (session?.user) {
      try {
        const res = await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.error || "Adres kaydedilemedi.");
          return;
        }
        setAddresses((prev) => [...prev, data]);
        setSelectedAddress(data.id);
        resetForm();
        toast.success("Adres kaydedildi.");
      } catch {
        toast.error("Adres kaydedilirken bir hata oluştu.");
      }
      return;
    }
    const newAddr = {
      id: String(Date.now()),
      ...payload,
      type: "other",
    };
    setAddresses((prev) => [...prev, newAddr]);
    setSelectedAddress(newAddr.id);
    resetForm();
  };

  const calculateExtrasPrice = () => {
    let total = 0;
    Object.keys(productOptions).forEach((key) => {
      const choices = productOptions[key] || [];
      choices.forEach((c) => (total += c.price || 0));
    });
    return total;
  };

  const addToCart = () => {
    if (!selectedProduct || !slug) return;
    const extrasTotal = calculateExtrasPrice();
    const basePrice = Number(selectedProduct.basePrice ?? selectedProduct.price) || 0;
    const variantExtra = selectedVariant != null ? (Number(selectedVariant.price) || 0) : 0;
    const unitPrice = basePrice + variantExtra + extrasTotal;
    const itemTotal = unitPrice * productQuantity;
    const displayName = selectedVariant?.name
      ? `${selectedProduct.name} - ${selectedVariant.name}`
      : selectedProduct.name;
    const newItem = {
      uniqueId: `item-${selectedProduct.id ?? Date.now()}-${Date.now()}`,
      product: selectedProduct,
      quantity: productQuantity,
      selectedOptions: productOptions,
      note: productNote,
      unitPrice,
      totalPrice: itemTotal,
      variantId: selectedVariant?.id ?? null,
      variantName: selectedVariant?.name ?? null,
    };
    ctxAddToCart(slug, newItem);
    track("ADD_TO_CART", selectedProduct?.id ?? undefined);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setIsCartOpen(true);
    toast.success("Sepete eklendi", {
      description: `${displayName} × ${productQuantity}`,
    });
  };

  const removeFromCart = (uniqueId) => {
    ctxRemoveFromCart(slug, uniqueId);
  };

  const updateCartQuantity = (uniqueId, change) => {
    const item = cart.find((i) => i.uniqueId === uniqueId);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + change);
    updateCartItem(slug, uniqueId, {
      quantity: newQty,
      totalPrice: (item.unitPrice || 0) * newQty,
    });
  };

  const handleOptionChange = (optionTitle, choice, type, isChecked) => {
    setProductOptions((prev) => {
      const current = prev[optionTitle] || [];
      if (type === "radio") return { ...prev, [optionTitle]: [choice] };
      if (type === "check") {
        if (isChecked) return { ...prev, [optionTitle]: [...current, choice] };
        return {
          ...prev,
          [optionTitle]: current.filter((c) => c.name !== choice.name),
        };
      }
      return prev;
    });
  };

  const handleSelectProduct = (product) => {
    track("VIEW_PRODUCT", product?.id ?? undefined);
    setSelectedProduct(product);
  };

  const handleReservationClick = () => {
    if (listing?.reservationEnabled === false) {
      toast.info("Bu işletme şu anda rezervasyon kabul etmiyor.");
      return;
    }
    track("START_RESERVATION");
    setIsReservationOpen(true);
    setReservationStep(1);
    setReservationReferenceCode("");
  };

  const handleReservationSubmit = async (payload) => {
    if (!slug) return { ok: false, error: "İşletme bilgisi bulunamadı." };
    setReservationSubmitting(true);
    try {
      const res = await fetch("/api/public/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: slug,
          serviceName: payload?.serviceName || sectorConfig?.typeTag || "Rezervasyon",
          customerName: payload?.customerName || "",
          customerPhone: payload?.customerPhone || "",
          customerEmail: payload?.customerEmail || "",
          notes: payload?.notes || "",
          questionAnswers: Array.isArray(payload?.questionAnswers)
            ? payload.questionAnswers
            : [],
          startAt: payload?.startAt,
          endAt: payload?.endAt,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: data.error || "Rezervasyon gönderilemedi." };
      }
      track("COMPLETE_RESERVATION");
      setReservationReferenceCode(data?.reservation?.referenceCode || "");
      setReservationStep(4);
      return { ok: true };
    } catch {
      return { ok: false, error: "Rezervasyon sırasında bir hata oluştu." };
    } finally {
      setReservationSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    const addr = addresses.find((a) => a.id === selectedAddress);
    if (!addr || !slug || !cart?.length) {
      toast.error("Lütfen bir adres seçin ve sepetinizde ürün olduğundan emin olun.");
      return;
    }
    const customerName = session?.user?.name || "Misafir";
    const customerPhone = addr.phone || "";
    const deliveryAddress = {
      line1: addr.line1,
      line2: addr.line2 || undefined,
      city: addr.city,
      district: addr.district || undefined,
      phone: addr.phone || undefined,
    };
    const items = cart.map((item) => ({
      productId: item.product?.id ?? null,
      variantId: item.variantId ?? null,
      name: item.variantName
        ? `${item.product?.name || "Ürün"} - ${item.variantName}`
        : (item.product?.name || "Ürün"),
      qty: item.quantity || 1,
      price: item.unitPrice || 0,
    }));
    const total = cartTotal;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: slug,
          customerName,
          customerPhone,
          deliveryAddress,
          deliveryType: "delivery",
          paymentMethod: paymentMethod === "card" ? "card" : "cash",
          items,
          subtotal: total,
          deliveryFee: 0,
          total,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Sipariş gönderilemedi.");
        return;
      }
      setOrderNumber(data.orderNumber || null);
      clearCart(slug);
      setCartStep(3);
    } catch (e) {
      toast.error("Sipariş gönderilirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCartSuccess = () => {
    setIsCartOpen(false);
    setCartStep(1);
    setOrderNumber(null);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">Yükleniyor...</p>
          </div>
        </main>
      </>
    );
  }

  if (notFound || !listing) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              İşletme bulunamadı
            </h1>
            <p className="text-slate-600 mb-6">
              Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.
            </p>
            <Link
              href="/search"
              className="text-slate-900 font-semibold hover:underline"
            >
              Aramaya dön
            </Link>
          </div>
        </main>
      </>
    );
  }

  const showHeader =
    !isReservationOpen && !selectedProduct && !isCartOpen;

  return (
    <>
      {showHeader && <Header />}
      <main className="min-h-screen bg-slate-50 pb-24 lg:pb-8">
        <ListingHero
          listing={listing}
          sectorConfig={sectorConfig}
          onReservationClick={handleReservationClick}
          onTrack={track}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
          <ListingStickyNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            listing={listing}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
            <div className="lg:col-span-2 space-y-8">
              {activeTab === "overview" && (
                <ListingOverviewSection
                  listing={listing}
                  sectorConfig={sectorConfig}
                  onTabChange={setActiveTab}
                  onSelectProduct={handleSelectProduct}
                />
              )}
              {activeTab === "offerings" && (
                <ListingOfferingsSection
                  listing={listing}
                  sectorConfig={sectorConfig}
                  onSelectProduct={handleSelectProduct}
                />
              )}
              {activeTab === "reviews" && (
                <ListingReviewsSection listing={listing} />
              )}
              {activeTab === "photos" && (
                <ListingGallerySection listing={listing} />
              )}
            </div>

            <ListingSidebar
              listing={listing}
              sectorConfig={sectorConfig}
              showAllHours={showAllHours}
              onToggleHours={() => setShowAllHours((v) => !v)}
              onReservationClick={handleReservationClick}
              onTrack={track}
            />
          </div>
        </div>

        {/* Floating cart button */}
        <AnimatePresence>
          {!isCartOpen && (
            <motion.button
              initial={{ scale: 0, y: 80 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 80 }}
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 bg-white rounded-full font-semibold text-slate-900 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <ShoppingBasket
                  className={`w-6 h-6 ${cart.length > 0 ? "text-slate-900" : "text-slate-400"
                    }`}
                />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                    {cart.length}
                  </span>
                )}
              </div>
              <span className="text-sm hidden sm:block">
                {cart.length > 0 ? `${cartTotal}₺` : "Sepetim"}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence mode="wait">
        {selectedProduct && (
          <ProductDetailSheet
            key={selectedProduct?.id ?? "product-sheet"}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            productQuantity={productQuantity}
            setProductQuantity={setProductQuantity}
            productOptions={productOptions}
            handleOptionChange={handleOptionChange}
            productNote={productNote}
            setProductNote={setProductNote}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
            addToCart={addToCart}
            calculateExtrasPrice={calculateExtrasPrice}
          />
        )}
      </AnimatePresence>

      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          listing={listing}
          cart={cart}
          cartTotal={cartTotal}
          cartStep={cartStep}
          setCartStep={setCartStep}
          removeFromCart={removeFromCart}
          updateCartQuantity={updateCartQuantity}
          addresses={addresses}
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
          isAddingAddress={isAddingAddress}
          setIsAddingAddress={setIsAddingAddress}
          newAddressForm={newAddressForm}
          setNewAddressForm={setNewAddressForm}
          handleSaveAddress={handleSaveAddress}
          onSuccess={handleCartSuccess}
          onPlaceOrder={handlePlaceOrder}
          isSubmitting={isSubmitting}
          orderNumber={orderNumber}
        />
      )}

      {isReservationOpen && (
        <ReservationDrawer
          isOpen={isReservationOpen}
          onClose={() => {
            setIsReservationOpen(false);
            setReservationStep(1);
          }}
          listing={listing}
          sectorConfig={sectorConfig}
          reservationStep={reservationStep}
          setReservationStep={setReservationStep}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedGuests={selectedGuests}
          setSelectedGuests={setSelectedGuests}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          handleReservationSubmit={handleReservationSubmit}
          isSubmitting={reservationSubmitting}
          referenceCode={reservationReferenceCode}
        />
      )}
    </>
  );
}
