"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useSocket } from "@/components/providers/SocketProvider";
import {
  ShoppingCartIcon,
  SparklesIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

import { getStatusLabel } from "./lib/order-status";
import { formatCurrency, formatOrderTime } from "./lib/order-formatters";
import { getLiveCount, getTodayRevenue, getYesterdayRevenue, getRevenueChangePercent } from "./lib/order-stats";

import OrdersHero from "./components/OrdersHero";
import OrdersToolbar from "./components/OrdersToolbar";
import OrdersList from "./components/OrdersList";
import OrderDetailsModal from "./components/OrderDetailsModal";
import OrdersReportModal from "./components/OrdersReportModal";
import PanelOrderModal from "./components/PanelOrderModal";

const DEFAULT_PANEL_FORM = {
  customerName: "",
  customerPhone: "",
  addressLine1: "",
  city: "İstanbul",
  district: "",
  deliveryType: "delivery",
  paymentMethod: "cash",
  note: "",
  items: [{ productId: "", name: "", qty: 1, price: 0 }],
};

export default function OrdersPage() {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDate, setReportDate] = useState("");
  const [reportOrders, setReportOrders] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const reportPrintRef = useRef(null);

  const [showPanelOrderModal, setShowPanelOrderModal] = useState(false);
  const [panelProducts, setPanelProducts] = useState([]);
  const [panelProductsLoading, setPanelProductsLoading] = useState(false);
  const [panelSubmitting, setPanelSubmitting] = useState(false);
  const [panelForm, setPanelForm] = useState(DEFAULT_PANEL_FORM);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== "all") params.set("status", filterStatus);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const res = await fetch(`/api/business/orders?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data && data.error) || "Siparişler yüklenemedi.");
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      const msg = err && err.message ? err.message : "Siparişler yüklenemedi.";
      setError(msg);
      toast.error(msg);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    const onNewOrder = () => fetchOrders();
    socket.on("new_order", onNewOrder);
    return () => socket.off("new_order", onNewOrder);
  }, [socket, isConnected, fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId) return;
    try {
      const res = await fetch("/api/business/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error || "Güncelleme başarısız.");

      const updatedOrder = data && typeof data === "object" ? data : null;
      setOrders((prev) => (Array.isArray(prev) ? prev.map((o) => (o && o.id === orderId && updatedOrder ? updatedOrder : o)) : []));
      if (selectedOrder && selectedOrder.id === orderId && updatedOrder) setSelectedOrder(updatedOrder);
      toast.success("Sipariş durumu güncellendi.");
    } catch (err) {
      toast.error(err && err.message ? err.message : "Durum güncellenirken hata oluştu.");
      console.error(err);
    }
  };

  const liveCount = getLiveCount(orders);
  const todayRevenue = getTodayRevenue(orders);
  const yesterdayRevenue = getYesterdayRevenue(orders);
  const revenueChangePercent = getRevenueChangePercent(todayRevenue, yesterdayRevenue);

  const stats = [
    { label: "Canlı Sipariş", value: String(liveCount), icon: ShoppingCartIcon, badge: null },
    {
      label: "Günlük Gelir",
      value: formatCurrency(todayRevenue),
      icon: BanknotesIcon,
      badge: revenueChangePercent != null ? (revenueChangePercent >= 0 ? `+${revenueChangePercent}%` : `${revenueChangePercent}%`) : null,
      badgePositive: revenueChangePercent != null && revenueChangePercent >= 0,
    },
    { label: "Gelen Çağrılar", value: "0", icon: ChatBubbleLeftRightIcon, badge: null },
    { label: "Tamamlanma", value: "%100", icon: CheckCircleIcon, badge: null },
  ];

  const filteredOrders = orders.filter((o) => {
    if (!o) return false;
    const term = (searchTerm || "").trim().toLowerCase();
    const matchesSearch =
      term === "" ||
      (String(o.orderNumber ?? "").toLowerCase().includes(term)) ||
      (String(o.customerName ?? "").toLowerCase().includes(term));
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const createDemoOrders = async () => {
    setIsLoading(true);
    try {
      toast.info("Demo siparişler oluşturuluyor...");
      const res = await fetch("/api/business/orders/seed", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Seed isteği başarısız.");
      await fetchOrders();
      toast.success("Demo siparişler hazır!");
    } catch (err) {
      toast.error((err && err.message) || "Demo verisi oluşturulamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReportOrders = useCallback(async (dateStr) => {
    if (!dateStr) return;
    setReportLoading(true);
    try {
      const res = await fetch(`/api/business/orders?dateFrom=${dateStr}&dateTo=${dateStr}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data && data.error) || "Rapor yüklenemedi.");
      setReportOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err && err.message ? err.message : "Rapor yüklenemedi.");
      setReportOrders([]);
    } finally {
      setReportLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showReportModal && reportDate) fetchReportOrders(reportDate);
  }, [showReportModal, reportDate, fetchReportOrders]);

  useEffect(() => {
    if (!showPanelOrderModal) return;
    setPanelProductsLoading(true);
    fetch("/api/business/products?status=active&limit=100")
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        const items = data && Array.isArray(data.items) ? data.items : [];
        setPanelProducts(items);
      })
      .catch(() => setPanelProducts([]))
      .finally(() => setPanelProductsLoading(false));
  }, [showPanelOrderModal]);

  const handlePrintReport = () => {
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Yazdırma penceresi engellendi. Lütfen tarayıcı izinlerini kontrol edin.");
      return;
    }
    const list = Array.isArray(reportOrders) ? reportOrders : [];
    const dateStr = typeof reportDate === "string" ? reportDate : "";
    const totalRevenue = list
      .filter((o) => o && o.status === "DELIVERED")
      .reduce((s, o) => s + (Number(o.total) || 0), 0);
    const byStatus = list.reduce((acc, o) => {
      if (!o) return acc;
      const st = o.status || "UNKNOWN";
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {});
    win.document.write(`
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>Günlük Rapor - ${dateStr || ""}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
        h1 { font-size: 1.5rem; margin-bottom: 8px; }
        .meta { color: #666; font-size: 0.875rem; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #eee; }
        th { background: #f5f5f5; font-weight: 600; }
        .summary { display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
        .summary div { background: #f8f8f8; padding: 16px 24px; border-radius: 8px; }
        .summary strong { display: block; font-size: 1.25rem; margin-top: 4px; }
      </style></head><body>
      <h1>Günlük Sipariş Raporu</h1>
      <p class="meta">Tarih: ${dateStr || ""} | Oluşturulma: ${new Date().toLocaleString("tr-TR")}</p>
      <div class="summary">
        <div><span>Toplam Sipariş</span><strong>${list.length}</strong></div>
        <div><span>Toplam Ciro (Teslim)</span><strong>${formatCurrency(totalRevenue)}</strong></div>
        ${Object.entries(byStatus).map(([k, v]) => `<div><span>${getStatusLabel(k)}</span><strong>${v}</strong></div>`).join("")}
      </div>
      <table>
        <thead><tr><th>Sipariş No</th><th>Müşteri</th><th>Durum</th><th>Tutar</th><th>Saat</th></tr></thead>
        <tbody>
        ${list.map((o) => `
          <tr>
            <td>${o && o.orderNumber != null ? String(o.orderNumber) : "-"}</td>
            <td>${o && o.customerName != null ? String(o.customerName) : "-"}</td>
            <td>${getStatusLabel(o && o.status)}</td>
            <td>${formatCurrency(o && o.total)}</td>
            <td>${formatOrderTime(o && o.createdAt)}</td>
          </tr>
        `).join("")}
        </tbody>
      </table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.onafterprint = () => win.close();
    }, 250);
  };

  const addPanelOrderRow = () => {
    setPanelForm((f) => ({ ...f, items: [...(f.items || []), { productId: "", name: "", qty: 1, price: 0 }] }));
  };
  const removePanelOrderRow = (index) => {
    setPanelForm((f) => ({
      ...f,
      items: (f.items || []).length > 1 ? f.items.filter((_, i) => i !== index) : f.items,
    }));
  };
  const updatePanelOrderItem = (index, field, value) => {
    setPanelForm((f) => ({
      ...f,
      items: (f.items || []).map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };
  const selectPanelProduct = (index, productId) => {
    const list = Array.isArray(panelProducts) ? panelProducts : [];
    const product = list.find((p) => p && p.id != null && String(p.id) === String(productId));
    if (!product) {
      updatePanelOrderItem(index, "productId", "");
      updatePanelOrderItem(index, "name", "");
      updatePanelOrderItem(index, "price", 0);
      return;
    }
    const price = product.discountPrice != null ? product.discountPrice : product.price;
    const numPrice = Number(price);
    setPanelForm((f) => ({
      ...f,
      items: (f.items || []).map((item, i) =>
        i === index
          ? { ...item, productId: product.id, name: product.name != null ? String(product.name) : "", price: !Number.isNaN(numPrice) ? numPrice : 0 }
          : item
      ),
    }));
  };

  const handlePanelOrderSubmit = async (e) => {
    e.preventDefault();
    const slug = session?.user?.businessSlug;
    if (!slug) {
      toast.error("İşletme bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
      return;
    }
    const { customerName, customerPhone, addressLine1, city, district, deliveryType, paymentMethod, note, items } = panelForm;
    if (!(customerName || "").trim()) {
      toast.error("Müşteri adı zorunludur.");
      return;
    }
    const validItems = (items || []).filter((i) => (i.name || "").trim() && Number(i.qty) >= 1 && Number(i.price) >= 0);
    if (validItems.length === 0) {
      toast.error("En az bir ürün seçin.");
      return;
    }
    const subtotal = validItems.reduce((s, i) => s + (Number(i.qty) * Number(i.price)), 0);
    const total = subtotal;
    setPanelSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: slug,
          customerName: (customerName || "").trim(),
          customerPhone: (customerPhone || "").trim(),
          deliveryAddress: {
            title: "Adres",
            line1: (addressLine1 || "Mağazadan alacak").trim(),
            city: (city || "").trim(),
            district: (district || "").trim(),
            address: [addressLine1, district, city].filter(Boolean).join(", ") || "Mağazadan alacak",
          },
          deliveryType: deliveryType || "pickup",
          paymentMethod: paymentMethod || "cash",
          note: (note || "").trim() || undefined,
          items: validItems.map((i) => ({ name: (i.name || "").trim(), qty: Number(i.qty) || 1, price: Number(i.price) || 0 })),
          subtotal,
          deliveryFee: 0,
          total,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data && data.error) || "Sipariş oluşturulamadı.");
      const orderNum = data && data.orderNumber != null ? String(data.orderNumber) : "Sipariş";
      toast.success(`Sipariş oluşturuldu: ${orderNum}`);
      setShowPanelOrderModal(false);
      setPanelForm({
        customerName: "",
        customerPhone: "",
        addressLine1: "",
        city: "İstanbul",
        district: "",
        deliveryType: "delivery",
        paymentMethod: "cash",
        note: "",
        items: [{ productId: "", name: "", qty: 1, price: 0 }],
      });
      fetchOrders();
    } catch (err) {
      toast.error((err && err.message) || "Sipariş oluşturulurken hata oluştu.");
    } finally {
      setPanelSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-6 px-4 md:px-6 max-w-[1400px] mx-auto space-y-6">
        <div className="h-28 md:h-32 bg-white border border-slate-200 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-14 bg-white border border-slate-200 rounded-2xl animate-pulse w-full max-w-md" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 md:h-28 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 md:px-6 pb-24 max-w-[1400px] mx-auto font-sans space-y-6">
      <OrdersHero
        stats={stats}
        onOpenReport={() => {
          setReportDate(new Date().toISOString().slice(0, 10) || "");
          setShowReportModal(true);
        }}
        onOpenPanelOrder={() => setShowPanelOrderModal(true)}
      />

      <OrdersToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <OrdersList
        orders={filteredOrders}
        viewMode={viewMode}
        onOrderDetails={setSelectedOrder}
        onStatusUpdate={handleStatusChange}
        onCreateDemoOrders={createDemoOrders}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tahmin</span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 leading-snug">
              Yoğunluk uyarısı: 18:00 – 20:00 arası sipariş artışı bekleniyor
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-2xl">
              Geçmiş verilere göre akşam saatlerinde yaklaşık %35 sipariş artışı öngörülüyor. Hazırlığı erkene alabilirsiniz.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button type="button" onClick={() => toast.info("Tahmin detayları yakında.")} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200/80 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors min-h-[40px]">
              Detaylar
            </button>
            <button type="button" onClick={() => toast.success("Mesaj kapatıldı.")} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors min-h-[40px]">
              Kapat
            </button>
          </div>
        </div>
      </motion.div>

      <OrdersReportModal
        open={showReportModal}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
        reportOrders={reportOrders}
        reportLoading={reportLoading}
        onClose={() => setShowReportModal(false)}
        onPrint={handlePrintReport}
        printRef={reportPrintRef}
      />

      <PanelOrderModal
        open={showPanelOrderModal}
        form={panelForm}
        onFormChange={setPanelForm}
        products={panelProducts}
        productsLoading={panelProductsLoading}
        submitting={panelSubmitting}
        onClose={() => setShowPanelOrderModal(false)}
        onSubmit={handlePanelOrderSubmit}
        onAddRow={addPanelOrderRow}
        onRemoveRow={removePanelOrderRow}
        onUpdateItem={updatePanelOrderItem}
        onSelectProduct={selectPanelProduct}
      />

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
