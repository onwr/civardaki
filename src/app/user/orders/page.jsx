"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Package,
  Clock,
  CheckCircle2,
  MapPin,
  Utensils,
  Truck,
  Star,
  RotateCcw,
  X,
  ShoppingBag,
  Search,
  ArrowUpRight,
} from "lucide-react";
import {
  PLACEHOLDER_LOGO,
  normalizeOrdersList,
  filterOrdersBySearch,
  isActiveStatus,
  isDeliveredOrCompleted,
  formatOrderDate,
  formatOrderTime,
  formatMoney,
  productSummary,
} from "@/lib/user-orders";
import { useMultiCart } from "@/contexts/MultiCartContext";
import { useSocket } from "@/components/providers/SocketProvider";

const REVIEW_STEPS = { RATING: 1, DETAILS: 2, COMMENT: 3, SUCCESS: 4 };

const STATUS_LABELS = {
  pending: "Beklendi",
  confirmed: "Onaylandı",
  preparing: "Hazırlanıyor",
  on_the_way: "Yolda",
  delivered: "Teslim edildi",
  cancelled: "İptal edildi",
  completed: "Tamamlandı",
};
const INITIAL_REVIEW_DATA = {
  rating: 0,
  speed: 0,
  quality: 0,
  packaging: 0,
  comment: "",
  images: [],
};

function sortByOrderDate(a, b) {
  const ta = a?.orderDate?.getTime?.() ?? 0;
  const tb = b?.orderDate?.getTime?.() ?? 0;
  return tb - ta;
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToCart } = useMultiCart();
  const { socket, isConnected } = useSocket();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewStep, setReviewStep] = useState(REVIEW_STEPS.RATING);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState(INITIAL_REVIEW_DATA);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/orders");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Siparişler yüklenemedi.");
      }
      const data = await res.json();
      setOrders(normalizeOrdersList(data));
    } catch (e) {
      setError(e?.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    const handler = (payload) => {
      const orderId = payload?.orderId;
      // Normalize status (API may send uppercase enum e.g. ON_THE_WAY, DELIVERED)
      const newStatus = payload?.status != null ? String(payload.status).toLowerCase() : null;
      if (!orderId || !newStatus) return;
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o && String(o.id) === String(orderId));
        if (idx < 0) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], status: newStatus };
        return next;
      });
      const label = STATUS_LABELS[newStatus] || newStatus;
      const desc = payload?.orderNumber ? `#${payload.orderNumber}` : payload?.businessName || "";
      toast.success("Sipariş durumu güncellendi", {
        description: [label, desc].filter(Boolean).join(" · "),
      });
    };
    socket.on("order_status_updated", handler);
    return () => socket.off("order_status_updated", handler);
  }, [socket, isConnected]);

  const filteredOrders = filterOrdersBySearch(orders, searchTerm);
  const activeOrders = filteredOrders
    .filter((o) => o && isActiveStatus(o.status))
    .sort(sortByOrderDate);
  const pastOrders = filteredOrders
    .filter((o) => o && !isActiveStatus(o.status))
    .sort(sortByOrderDate);

  const hasSearch = (searchTerm || "").trim().length > 0;
  const noResults = hasSearch && filteredOrders.length === 0;
  const noOrdersAtAll = orders.length === 0;
  const noActiveOrders = activeOrders.length === 0;
  const noPastOrders = pastOrders.length === 0;

  const closeReviewModal = useCallback(() => {
    setIsReviewModalOpen(false);
    setSelectedOrder(null);
    setReviewStep(REVIEW_STEPS.RATING);
    setReviewData(INITIAL_REVIEW_DATA);
    setReviewSubmitting(false);
  }, []);

  const handleOpenReview = useCallback((order) => {
    if (!order) return;
    setSelectedOrder(order);
    setReviewStep(REVIEW_STEPS.RATING);
    setReviewData(INITIAL_REVIEW_DATA);
    setIsReviewModalOpen(true);
  }, []);

  const handleReviewNextStep = useCallback(() => {
    setReviewStep((prev) => Math.min(prev + 1, REVIEW_STEPS.SUCCESS));
  }, []);

  const handleReviewPrevStep = useCallback(() => {
    setReviewStep((prev) => Math.max(prev - 1, REVIEW_STEPS.RATING));
  }, []);

  const handleSubmitReview = async () => {
    if (!selectedOrder?.businessSlug) {
      toast.error("İşletme bilgisi bulunamadı.");
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/public/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: selectedOrder.businessSlug,
          reviewerName:
            (session?.user?.name || "Misafir").trim() || "Sipariş Müşterisi",
          reviewerEmail: (session?.user?.email || "").trim() || undefined,
          rating:
            reviewData.rating >= 1 && reviewData.rating <= 5
              ? reviewData.rating
              : 5,
          content: (reviewData.comment || "").trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Değerlendirme gönderilemedi.");
      setReviewStep(REVIEW_STEPS.SUCCESS);
      toast.success("Değerlendirmeniz paylaşıldı!", {
        description: data.message || "Teşekkür ederiz.",
      });
    } catch (e) {
      toast.error(e?.message || "Değerlendirme gönderilirken hata oluştu.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReorder = useCallback(
    (order) => {
      const slug = order?.businessSlug;
      const items = Array.isArray(order?.items) ? order.items : [];
      if (!slug || items.length === 0) {
        if (slug) router.push(`/isletme/${slug}`);
        return;
      }
      const ts = Date.now();
      items.forEach((item, idx) => {
        const qty = item.quantity != null ? Number(item.quantity) : 1;
        const price = item.price != null ? Number(item.price) : 0;
        const total = item.total != null ? Number(item.total) : qty * price;
        addToCart(slug, {
          uniqueId: `reorder-${order.id}-${item.id || idx}-${ts}`,
          product: {
            name: item.productName || "Ürün",
            price,
          },
          quantity: qty,
          unitPrice: price,
          totalPrice: total,
        });
      });
      toast.success("Sepete eklendi", {
        description: `${items.length} ürün işletme sayfasına yönlendiriliyorsunuz.`,
      });
      router.push(`/isletme/${slug}`);
    },
    [addToCart, router]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 font-inter antialiased">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-8 py-12 flex flex-col items-center">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-600 font-medium text-sm">Siparişler yükleniyor</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 font-inter antialiased px-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-8 py-12 max-w-md w-full text-center">
          <p className="text-slate-800 font-semibold mb-1">Siparişler yüklenemedi</p>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors"
          >
            Tekrar dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16 font-inter antialiased text-left">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Siparişlerim
          </h1>
          <p className="text-slate-500 text-sm">
            Aktif siparişlerinizi takip edin, geçmiş siparişlerinizi görüntüleyin.
          </p>
        </div>

        <div className="relative w-full md:max-w-sm flex-shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Sipariş no, işletme veya ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-shadow"
            aria-label="Sipariş veya işletme ara"
          />
        </div>
      </section>

      {noOrdersAtAll && (
        <EmptyState
          title="Henüz siparişiniz yok"
          description="Sipariş vermek için bir işletme seçin ve siparişinizi tamamlayın."
        />
      )}

      {!noOrdersAtAll && noResults && (
        <EmptyState
          title="Arama sonucu bulunamadı"
          description="Sipariş numarası, işletme adı veya ürün adı ile tekrar deneyin."
          onClear={() => setSearchTerm("")}
          clearLabel="Aramayı temizle"
        />
      )}

      {!noOrdersAtAll && !noResults && (
        <>
          {noActiveOrders && !noPastOrders && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-8 px-6 text-center">
              <p className="text-slate-500 text-sm font-medium">
                Şu an devam eden aktif siparişiniz yok.
              </p>
            </div>
          )}

          {activeOrders.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Devam eden siparişler
                </h2>
                <span className="text-xs text-slate-400 font-medium">{activeOrders.length} sipariş</span>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {activeOrders.map((order) => (
                  <ActiveOrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Geçmiş siparişler
              </h2>
              <span className="text-xs text-slate-400 font-medium">{pastOrders.length} sipariş</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {pastOrders.map((order) => (
                <PastOrderCard
                  key={order.id}
                  order={order}
                  onRateClick={() => handleOpenReview(order)}
                  onReorder={() => handleReorder(order)}
                />
              ))}
              {noPastOrders && (
                <EmptyState
                  title="Geçmiş sipariş yok"
                  description={
                    hasSearch
                      ? "Aradığınız kriterlere uygun geçmiş sipariş bulunamadı."
                      : "Henüz tamamlanmış siparişiniz yok."
                  }
                  onClear={hasSearch ? () => setSearchTerm("") : undefined}
                  clearLabel={hasSearch ? "Aramayı temizle" : undefined}
                />
              )}
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {isReviewModalOpen && selectedOrder && (
          <ReviewModal
            selectedOrder={selectedOrder}
            reviewStep={reviewStep}
            reviewData={reviewData}
            setReviewData={setReviewData}
            reviewSubmitting={reviewSubmitting}
            onClose={closeReviewModal}
            onNextStep={handleReviewNextStep}
            onPrevStep={handleReviewPrevStep}
            onSubmit={handleSubmitReview}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ title, description, onClear, clearLabel }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 px-6 text-center">
      <p className="text-slate-800 font-semibold mb-1">{title}</p>
      <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">{description}</p>
      {onClear && clearLabel && (
        <button
          type="button"
          onClick={onClear}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 transition-colors"
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}

function ReviewModal({
  selectedOrder,
  reviewStep,
  reviewData,
  setReviewData,
  reviewSubmitting,
  onClose,
  onNextStep,
  onPrevStep,
  onSubmit,
}) {
  const businessName = selectedOrder?.businessName ?? "İşletme";
  const businessLogo = selectedOrder?.businessLogo || PLACEHOLDER_LOGO;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        role="presentation"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 px-6 py-5 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white p-0.5 relative overflow-hidden shrink-0">
              <Image src={businessLogo} alt="" fill className="object-cover rounded-[10px]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate">{businessName}</h3>
              <p className="text-slate-400 text-xs mt-0.5">Değerlendirme</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors shrink-0"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {reviewStep === REVIEW_STEPS.RATING && (
              <motion.div
                key="s1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-slate-900">Nasıl buldunuz?</h2>
                  <p className="text-slate-500 text-sm">Genel puan verin.</p>
                </div>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setReviewData((prev) => ({ ...prev, rating: star }));
                        setTimeout(onNextStep, 400);
                      }}
                      className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                        reviewData.rating >= star ? "text-amber-500" : "text-slate-200 hover:text-slate-300"
                      }`}
                    >
                      <Star className={`w-10 h-10 ${reviewData.rating >= star ? "fill-amber-500" : ""}`} />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {reviewStep === REVIEW_STEPS.DETAILS && (
              <motion.div
                key="s2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-semibold text-slate-900">Detaylar</h2>
                  <p className="text-slate-500 text-xs">Hizmet kalitesini değerlendirin.</p>
                </div>
                <div className="space-y-4">
                  {[
                    { key: "quality", label: "Lezzet / Hizmet", icon: Utensils },
                    { key: "speed", label: "Teslimat hızı", icon: Clock },
                    { key: "packaging", label: "Sunum & Paket", icon: Package },
                  ].map((metric) => {
                    const MetricIcon = metric.icon;
                    return (
                      <div
                        key={metric.key}
                        className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100"
                      >
                        <span className="text-slate-700 text-sm font-medium flex items-center gap-2">
                          <MetricIcon className="w-4 h-4 text-slate-500 shrink-0" /> {metric.label}
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3].map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() =>
                                setReviewData((prev) => ({ ...prev, [metric.key]: v }))
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                                reviewData[metric.key] === v
                                  ? "bg-slate-800 text-white"
                                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              {v === 1 ? "Zayıf" : v === 2 ? "İyi" : "Çok iyi"}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onPrevStep}
                    className="flex-1 py-3 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  >
                    Geri
                  </button>
                  <button
                    type="button"
                    onClick={onNextStep}
                    className="flex-[2] py-3 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    Devam et
                  </button>
                </div>
              </motion.div>
            )}

            {reviewStep === REVIEW_STEPS.COMMENT && (
              <motion.div
                key="s3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5 text-left"
              >
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-slate-900">Notunuz (isteğe bağlı)</h2>
                  <p className="text-slate-500 text-sm">Deneyiminizi kısaca yazabilirsiniz.</p>
                </div>
                <textarea
                  rows="3"
                  placeholder="Deneyiminizi anlatın..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 resize-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData((prev) => ({ ...prev, comment: e.target.value }))
                  }
                />
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={reviewSubmitting}
                  className="w-full py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {reviewSubmitting ? "Gönderiliyor…" : "Değerlendirmeyi gönder"}
                </button>
              </motion.div>
            )}

            {reviewStep === REVIEW_STEPS.SUCCESS && (
              <motion.div
                key="s4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-slate-900">Teşekkürler</h2>
                  <p className="text-slate-500 text-sm">Değerlendirmeniz işletmeye iletildi.</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  Kapat
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const ACTIVE_STEPS = [
  { status: "pending", label: "ALINDI", icon: Clock },
  { status: "preparing", label: "HAZIRLIK", icon: Utensils },
  { status: "on_the_way", label: "YOLDA", icon: Truck },
  { status: "delivered", label: "TESLİMAT", icon: CheckCircle2 },
];

function ActiveOrderCard({ order }) {
  if (!order) return null;
  const currentStepIndex = ACTIVE_STEPS.findIndex(
    (s) => s.status === (order.status || "")
  );
  const safeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const progressWidth =
    ACTIVE_STEPS.length > 0 ? ((safeIndex + 0.5) / ACTIVE_STEPS.length) * 100 : 0;

  const items = Array.isArray(order.items) ? order.items : [];
  const total = order.total != null ? Number(order.total) : 0;
  const businessName = order.businessName != null ? String(order.businessName) : "";
  const businessLogo = order.businessLogo || PLACEHOLDER_LOGO;
  const deliveryNote = order.deliveryNote != null ? String(order.deliveryNote) : "";
  const orderId = order.id != null ? String(order.id) : "";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-72 bg-slate-800 flex flex-col justify-between p-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-white/90" />
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium">Takip</p>
              <p className="text-white font-semibold text-sm">Aktif sipariş</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-white/70 text-xs">Tahmini varış</span>
            <span className="text-white font-medium text-sm">~15 dk</span>
          </div>
          <Link
            href={`/user/orders/${orderId}`}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            Detay <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex-1 p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 p-0.5 relative overflow-hidden shrink-0">
                <Image src={businessLogo} alt="" fill className="object-cover rounded-[10px]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{businessName || "İşletme"}</h3>
                <p className="text-slate-500 text-xs mt-0.5">Sipariş takip ediliyor</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-slate-500 text-xs font-medium">Toplam</p>
              <p className="text-slate-900 font-semibold text-lg">{formatMoney(total)}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="h-1.5 bg-slate-100 rounded-full w-full overflow-hidden mb-4">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            <div className="flex justify-between gap-2">
              {ACTIVE_STEPS.map((step, idx) => {
                const isActive = idx <= safeIndex;
                const Icon = step.icon;
                return (
                  <div key={step.status} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                        isActive ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-medium text-center truncate w-full ${
                      isActive ? "text-slate-700" : "text-slate-400"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
            <div>
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">İçerik</h4>
              <div className="space-y-1.5">
                {items.length === 0 ? (
                  <p className="text-slate-400 text-sm">Ürün listesi yok.</p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id || item.productName || Math.random()}
                      className="flex justify-between text-sm text-slate-700 gap-2"
                    >
                      <span className="truncate">{(item.quantity || 0)}× {item.productName || "—"}</span>
                      <span className="text-slate-500 shrink-0">{formatMoney(item.total != null ? Number(item.total) : 0)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Teslimat notu</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {deliveryNote || "Not eklenmedi."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PAST_STATUS_MAP = {
  delivered: {
    text: "TESLİM EDİLDİ",
    color: "text-emerald-500 bg-emerald-50",
    icon: CheckCircle2,
  },
  completed: {
    text: "TAMAMLANDI",
    color: "text-blue-500 bg-blue-50",
    icon: CheckCircle2,
  },
  cancelled: {
    text: "İPTAL EDİLDİ",
    color: "text-rose-500 bg-rose-50",
    icon: RotateCcw,
  },
};

function PastOrderCard({ order, onRateClick, onReorder }) {
  if (!order) return null;
  const status = (order.status || "").toLowerCase();
  const statusInfo = PAST_STATUS_MAP[status] || PAST_STATUS_MAP.completed;
  const Icon = statusInfo.icon;

  const orderDate = order.orderDate;
  const dateStr = formatOrderDate(orderDate);
  const timeStr = formatOrderTime(orderDate);
  const total = order.total != null ? Number(order.total) : 0;
  const businessName = order.businessName != null ? String(order.businessName) : "";
  const businessLogo = order.businessLogo || PLACEHOLDER_LOGO;
  const items = Array.isArray(order.items) ? order.items : [];
  const summary = productSummary(items);
  const canReview = isDeliveredOrCompleted(status) && onRateClick;
  const slug = order.businessSlug != null ? String(order.businessSlug) : "";
  const orderId = order.id != null ? String(order.id) : "";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-5 hover:border-slate-300 transition-colors">
      <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 p-0.5 relative overflow-hidden shrink-0">
        <Image src={businessLogo} alt="" fill className="object-cover rounded-[10px]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href={`/user/orders/${orderId}`}
            className="font-semibold text-slate-900 hover:text-blue-600 truncate pr-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 rounded"
          >
            {businessName || "İşletme"}
          </Link>
          <span className="font-semibold text-slate-900 shrink-0">{formatMoney(total)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusInfo.color}`}>
            <Icon className="w-3.5 h-3.5 shrink-0" /> {statusInfo.text}
          </span>
          <span className="text-slate-400 text-xs flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {dateStr} · {timeStr}
          </span>
        </div>
        <p className="text-slate-500 text-sm truncate mt-1">{summary}</p>
      </div>

      <div className="flex gap-2 shrink-0">
        {slug ? (
          <button
            type="button"
            onClick={() => onReorder?.(order)}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 flex items-center gap-2 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" /> Tekrarla
          </button>
        ) : (
          <span className="px-4 py-2.5 text-sm font-medium text-slate-400 bg-slate-50 rounded-lg cursor-not-allowed flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 shrink-0" /> Tekrarla
          </span>
        )}
        {canReview && (
          <button
            type="button"
            onClick={onRateClick}
            className="px-4 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-300 flex items-center gap-2 transition-colors"
          >
            <Star className="w-4 h-4 shrink-0 fill-amber-500" /> Puanla
          </button>
        )}
      </div>
    </div>
  );
}
