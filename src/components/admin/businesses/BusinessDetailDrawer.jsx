"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Store } from "lucide-react";
import { toast } from "sonner";
import BusinessGeneralPanel from "./panels/BusinessGeneralPanel";
import BusinessOwnerAccessPanel from "./panels/BusinessOwnerAccessPanel";
import BusinessSubscriptionPanel from "./panels/BusinessSubscriptionPanel";
import BusinessLeadsPanel from "./panels/BusinessLeadsPanel";
import BusinessReviewsPanel from "./panels/BusinessReviewsPanel";
import BusinessProductsPanel from "./panels/BusinessProductsPanel";
import BusinessOrdersPanel from "./panels/BusinessOrdersPanel";
import BusinessActivityPanel from "./panels/BusinessActivityPanel";
import BusinessAdminNotesPanel from "./panels/BusinessAdminNotesPanel";
import BusinessEditGeneralModal from "./BusinessEditGeneralModal";
import BusinessEditSubscriptionModal from "./BusinessEditSubscriptionModal";

const TABS = [
  { id: "general", label: "Genel Bilgiler" },
  { id: "ownerAccess", label: "Sahip & Erişim" },
  { id: "subscription", label: "Abonelik" },
  { id: "leads", label: "Lead'ler" },
  { id: "reviews", label: "Yorumlar" },
  { id: "products", label: "Ürünler" },
  { id: "orders", label: "Siparişler" },
  { id: "analytics", label: "Analytics" },
  { id: "notes", label: "Admin Notları" },
];

export default function BusinessDetailDrawer({
  businessId,
  open,
  onClose,
  onBusinessUpdated,
  categories = [],
}) {
  const [business, setBusiness] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [editMode, setEditMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}`);
      const data = await res.json();
      if (data.success && data.business) setBusiness(data.business);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (open && businessId) {
      fetchDetail();
      setActiveTab("general");
    }
  }, [open, businessId, fetchDetail]);

  const refreshLeads = useCallback(() => {
    if (!businessId) return;
    setLeadsLoading(true);
    fetch(`/api/admin/leads?businessId=${encodeURIComponent(businessId)}`)
      .then((r) => r.json())
      .then((arr) => setLeads(Array.isArray(arr) ? arr : []))
      .catch(() => setLeads([]))
      .finally(() => setLeadsLoading(false));
  }, [businessId]);

  useEffect(() => {
    if (!open || !businessId) return;
    if (activeTab === "leads") refreshLeads();
  }, [open, businessId, activeTab, refreshLeads]);

  const refreshReviews = useCallback(() => {
    if (!businessId) return;
    setReviewsLoading(true);
    fetch(`/api/admin/businesses/${businessId}/reviews`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [businessId]);

  useEffect(() => {
    if (!open || !businessId) return;
    if (activeTab === "reviews") refreshReviews();
  }, [open, businessId, activeTab, refreshReviews]);

  const refreshProducts = useCallback(() => {
    if (!businessId) return;
    fetch(`/api/admin/businesses/${businessId}/products`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setProducts([]));
  }, [businessId]);

  useEffect(() => {
    if (!open || !businessId) return;
    if (activeTab === "products") refreshProducts();
  }, [open, businessId, activeTab, refreshProducts]);

  const refreshOrders = useCallback(() => {
    if (!businessId) return;
    setOrdersLoading(true);
    fetch(`/api/admin/businesses/${businessId}/orders`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [businessId]);

  useEffect(() => {
    if (!open || !businessId) return;
    if (activeTab === "orders") refreshOrders();
  }, [open, businessId, activeTab, refreshOrders]);

  useEffect(() => {
    if (!open || !businessId) return;
    if (activeTab === "analytics") {
      setAnalyticsLoading(true);
      fetch(`/api/admin/businesses/${businessId}/analytics`)
        .then((r) => r.json())
        .then((d) => setAnalytics(d.analytics ?? null))
        .catch(() => setAnalytics(null))
        .finally(() => setAnalyticsLoading(false));
    }
  }, [open, businessId, activeTab]);

  const handleSaveGeneral = useCallback(
    async (payload) => {
      if (!businessId) return;
      const res = await fetch(`/api/admin/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kaydetme başarısız.");
      toast.success("Bilgiler güncellendi.");
      await fetchDetail();
      onBusinessUpdated?.();
    },
    [businessId, fetchDetail, onBusinessUpdated]
  );

  const handleSaveSubscription = useCallback(
    async (payload) => {
      if (!businessId) return;
      const res = await fetch(`/api/admin/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kaydetme başarısız.");
      toast.success("Abonelik güncellendi.");
      await fetchDetail();
      onBusinessUpdated?.();
    },
    [businessId, fetchDetail, onBusinessUpdated]
  );

  const runBusinessAction = useCallback(
    async (payload, successMessage = "İşlem başarılı.") => {
      if (!businessId) return;
      setActionLoading(true);
      try {
        const res = await fetch(`/api/admin/businesses/${businessId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.success === false) {
          throw new Error(data?.error || "İşlem başarısız.");
        }
        toast.success(successMessage);
        await fetchDetail();
        onBusinessUpdated?.();
      } catch (e) {
        toast.error(e.message || "İşlem başarısız.");
      } finally {
        setActionLoading(false);
      }
    },
    [businessId, fetchDetail, onBusinessUpdated],
  );

  const handleQuickToggle = useCallback(
    (field) => {
      if (!business) return;
      const map = {
        isActive: "Aktiflik durumu güncellendi.",
        isVerified: "Doğrulama durumu güncellendi.",
        isOpen: "Açık/Kapalı durumu güncellendi.",
        reservationEnabled: "Rezervasyon ayarı güncellendi.",
      };
      runBusinessAction({ [field]: !business[field] }, map[field] || "Güncellendi.");
    },
    [business, runBusinessAction],
  );

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" aria-hidden onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-white shadow-xl z-50 flex flex-col border-l border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-slate-500" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-900 truncate">
                {business ? business.name : "İşletme detayı"}
              </h2>
              <p className="text-xs text-slate-500 truncate">{business?.slug ?? businessId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 overflow-x-auto shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "general" && (
            loading && !business ? (
              <p className="text-slate-500">Yükleniyor...</p>
            ) : (
              <BusinessGeneralPanel
                business={business}
                onEdit={() => setEditMode("general")}
                onQuickToggle={handleQuickToggle}
                actionLoading={actionLoading}
              />
            )
          )}
          {activeTab === "ownerAccess" && (
            <BusinessOwnerAccessPanel
              business={business}
              loading={actionLoading}
              onOwnerAction={(payload) => runBusinessAction(payload, "Sahip erişim bilgisi güncellendi.")}
            />
          )}
          {activeTab === "subscription" && (
            <BusinessSubscriptionPanel
              business={business}
              onEditSubscription={() => setEditMode("subscription")}
            />
          )}
          {activeTab === "leads" && (
            <BusinessLeadsPanel
              businessId={businessId}
              leads={leads}
              loading={leadsLoading}
              totalCount={business?._count?.leads}
              onRefresh={refreshLeads}
            />
          )}
          {activeTab === "reviews" && (
            <BusinessReviewsPanel
              reviews={reviews}
              loading={reviewsLoading}
              totalCount={business?._count?.reviews}
              onRefresh={refreshReviews}
            />
          )}
          {activeTab === "products" && (
            <BusinessProductsPanel
              businessId={businessId}
              productCount={business?._count?.products ?? 0}
              products={products}
              onRefresh={refreshProducts}
            />
          )}
          {activeTab === "orders" && (
            <BusinessOrdersPanel
              businessId={businessId}
              orders={orders}
              loading={ordersLoading}
              totalCount={business?._count?.orders}
              onRefresh={refreshOrders}
            />
          )}
          {activeTab === "analytics" && (
            analyticsLoading ? <p className="text-slate-500">Yükleniyor...</p> : (
              <BusinessActivityPanel analytics={analytics} />
            )
          )}
          {activeTab === "notes" && <BusinessAdminNotesPanel businessId={businessId} />}
        </div>
      </div>

      {editMode === "general" && (
        <BusinessEditGeneralModal
          business={business}
          categories={categories}
          onSave={handleSaveGeneral}
          onClose={() => setEditMode(null)}
        />
      )}
      {editMode === "subscription" && (
        <BusinessEditSubscriptionModal
          business={business}
          onSave={handleSaveSubscription}
          onClose={() => setEditMode(null)}
        />
      )}
    </>
  );
}
