"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  MapPin,
  Clock,
  ChevronLeft,
  CheckCircle2,
  Truck,
  Utensils,
  CreditCard,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { useSocket } from "@/components/providers/SocketProvider";

const PLACEHOLDER_LOGO =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop";

const STATUS_STEPS = [
  { status: "pending", label: "Alındı", icon: Clock },
  { status: "confirmed", label: "Onaylandı", icon: CheckCircle2 },
  { status: "preparing", label: "Hazırlanıyor", icon: Utensils },
  { status: "on_the_way", label: "Yolda", icon: Truck },
  { status: "delivered", label: "Teslim edildi", icon: CheckCircle2 },
];

function normalizeOrder(data) {
  if (!data || typeof data !== "object") return null;
  const orderDate = data.orderDate != null ? new Date(data.orderDate) : null;
  const validDate = orderDate && !isNaN(orderDate.getTime()) ? orderDate : null;
  return {
    id: data.id != null ? String(data.id) : "",
    orderNumber: data.orderNumber != null ? String(data.orderNumber) : "",
    status: data.status != null ? String(data.status).toLowerCase() : "pending",
    total: data.total != null ? Number(data.total) : 0,
    subtotal: data.subtotal != null ? Number(data.subtotal) : 0,
    orderDate: validDate,
    businessId: data.businessId != null ? String(data.businessId) : "",
    businessName: data.businessName != null ? String(data.businessName) : "",
    businessSlug: data.businessSlug != null ? String(data.businessSlug) : "",
    businessLogo:
      data.businessLogo && String(data.businessLogo).trim()
        ? String(data.businessLogo).trim()
        : PLACEHOLDER_LOGO,
    items: Array.isArray(data.items)
      ? data.items.map((item) => ({
          id: item.id != null ? String(item.id) : "",
          productName:
            item.productName != null
              ? String(item.productName)
              : item.name != null
                ? String(item.name)
                : "—",
          quantity:
            item.quantity != null
              ? Number(item.quantity)
              : item.qty != null
                ? Number(item.qty)
                : 1,
          price: item.price != null ? Number(item.price) : 0,
          total:
            item.total != null
              ? Number(item.total)
              : (item.quantity != null ? Number(item.quantity) : 1) *
                (item.price != null ? Number(item.price) : 0),
        }))
      : [],
    deliveryAddress:
      data.deliveryAddress != null ? String(data.deliveryAddress) : "",
    deliveryNote: data.deliveryNote != null ? String(data.deliveryNote) : "",
    deliveryType: data.deliveryType != null ? data.deliveryType : null,
    paymentMethod:
      data.paymentMethod != null ? String(data.paymentMethod) : "",
  };
}

function DetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 text-sm font-medium">Sipariş yükleniyor</p>
      </div>
    </div>
  );
}

function DetailError({ message, onRetry }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 md:p-12 text-center">
        <p className="text-slate-800 font-semibold mb-1">Sipariş yüklenemedi</p>
        <p className="text-slate-500 text-sm mb-6">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="px-5 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Tekrar dene
        </button>
      </div>
    </div>
  );
}

function DetailNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 md:p-12 text-center">
        <p className="text-slate-800 font-semibold mb-1">Sipariş bulunamadı</p>
        <p className="text-slate-500 text-sm mb-6">
          Bu sipariş size ait değil veya mevcut değil.
        </p>
        <Link
          href="/user/orders"
          className="inline-block px-5 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Siparişlerime dön
        </Link>
      </div>
    </div>
  );
}

const STATUS_LABELS = {
  pending: "Beklendi",
  confirmed: "Onaylandı",
  preparing: "Hazırlanıyor",
  on_the_way: "Yolda",
  delivered: "Teslim edildi",
  cancelled: "İptal edildi",
  completed: "Tamamlandı",
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId != null ? String(params.orderId) : "";
  const { socket, isConnected } = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!socket || !isConnected || !orderId) return;
    const handler = (payload) => {
      const id = payload?.orderId != null ? String(payload.orderId) : "";
      if (id !== orderId) return;
      // Normalize status (API may send uppercase enum e.g. ON_THE_WAY, DELIVERED)
      const newStatus = payload?.status != null ? String(payload.status).toLowerCase() : null;
      if (!newStatus) return;
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      const label = STATUS_LABELS[newStatus] || newStatus;
      toast.success("Sipariş durumu güncellendi", { description: label });
    };
    socket.on("order_status_updated", handler);
    return () => socket.off("order_status_updated", handler);
  }, [socket, isConnected, orderId]);

  useEffect(() => {
    if (!orderId || orderId.trim() === "") {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;
    async function fetchOrder() {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const res = await fetch(
          `/api/user/orders/${encodeURIComponent(orderId)}`
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.status === 404) {
          setNotFound(true);
          setOrder(null);
          return;
        }
        if (!res.ok) {
          setError(data.error || "Sipariş yüklenemedi.");
          setOrder(null);
          return;
        }
        setOrder(normalizeOrder(data));
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Bir hata oluştu.");
          setOrder(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) return <DetailLoading />;
  if (notFound) return <DetailNotFound />;
  if (error)
    return <DetailError message={error} onRetry={() => window.location.reload()} />;
  if (!order)
    return (
      <DetailError
        message="Siparis verisi okunamadi."
        onRetry={() => window.location.reload()}
      />
    );

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.status === order.status);
  const safeStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const lineHeightPercent =
    STATUS_STEPS.length > 1
      ? (safeStepIndex / (STATUS_STEPS.length - 1)) * 100
      : 0;

  const businessName = order.businessName || "İşletme";
  const businessLogo = order.businessLogo || PLACEHOLDER_LOGO;
  const deliveryAddress = order.deliveryAddress || "Adres belirtilmemiş.";
  const deliveryNote = order.deliveryNote || "";
  const paymentMethod = order.paymentMethod || "—";
  const items = order.items || [];
  const subtotal = order.subtotal != null ? Number(order.subtotal) : 0;
  const total = order.total != null ? Number(order.total) : 0;
  const isComplete =
    order.status === "delivered" || order.status === "cancelled";

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16 pt-4 md:pt-6">
      <header className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-colors"
          aria-label="Geri"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-slate-900 truncate">
            Sipariş #{order.orderNumber || order.id}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Sipariş detayı ve takip
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-800 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-white p-0.5 relative overflow-hidden shrink-0">
                  <Image
                    src={businessLogo}
                    alt=""
                    fill
                    className="object-cover rounded-[10px]"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-white truncate">
                    {businessName}
                  </h2>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {isComplete
                      ? order.status === "cancelled"
                        ? "İptal edildi"
                        : "Teslim edildi"
                      : "Sipariş takip ediliyor"}
                  </p>
                </div>
              </div>
              {order.businessSlug && (
                <Link
                  href={`/isletme/${order.businessSlug}`}
                  className="text-sm font-medium text-white/90 hover:text-white underline focus:outline-none focus:ring-2 focus:ring-white/30 rounded"
                >
                  İşletmeyi aç
                </Link>
              )}
            </div>

            <div className="p-6">
              <div className="relative pl-6 space-y-0">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100 rounded-full" />
                <div
                  className="absolute left-[11px] top-2 w-0.5 bg-blue-600 rounded-full transition-all duration-500"
                  style={{ height: `${lineHeightPercent}%` }}
                />

                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = idx <= safeStepIndex;
                  return (
                    <div
                      key={step.status}
                      className="relative flex items-start gap-4 pb-8 last:pb-0"
                    >
                      <div
                        className={`absolute left-0 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 shrink-0 ${
                          isActive
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        {isActive && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 pl-8 flex-1 min-w-0">
                        <div
                          className={`p-2.5 rounded-lg shrink-0 ${
                            isActive ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`font-medium text-sm ${
                              isActive ? "text-slate-900" : "text-slate-400"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {isActive ? "Tamamlandı" : "Bekleniyor"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Truck className="w-6 h-6" />
              </div>
              <p className="text-slate-600 font-medium text-sm">
                Canlı konum takibi
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Bu özellik yakında eklenecek
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-500" /> Sipariş özeti
            </h3>
            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="text-slate-400 text-sm">Ürün listesi yok.</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id || item.productName}
                    className="flex justify-between items-start text-sm gap-2"
                  >
                    <span className="text-slate-700 flex-1 min-w-0 truncate">
                      <span className="text-slate-500 font-medium">
                        {item.quantity}x
                      </span>{" "}
                      {item.productName}
                    </span>
                    <span className="font-medium text-slate-900 shrink-0">
                      {(item.total != null ? Number(item.total) : 0).toFixed(2)} ₺
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Ara toplam</span>
                <span className="text-slate-700 font-medium">
                  {subtotal.toFixed(2)} ₺
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Teslimat</span>
                <span className="text-emerald-600 text-xs font-medium">
                  Dahil
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-900">Toplam</span>
                <span className="font-semibold text-blue-600">
                  {total.toFixed(2)} ₺
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded-lg flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500 font-medium">
                  Ödeme yöntemi
                </p>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {paymentMethod}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" /> Teslimat
            </h3>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-500 font-medium mb-1">
                Adres
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                {deliveryAddress}
              </p>
            </div>
            {deliveryNote.trim() !== "" && (
              <div className="mt-3 flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-amber-700 mb-0.5">
                    Müşteri notu
                  </p>
                  <p className="text-sm text-amber-800 leading-relaxed break-words">
                    {deliveryNote}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
