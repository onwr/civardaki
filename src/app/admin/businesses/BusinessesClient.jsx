"use client";

import { useState, useEffect, useCallback } from "react";
import { Store } from "lucide-react";
import { toast } from "sonner";
import BusinessFiltersBar from "@/components/admin/businesses/BusinessFiltersBar";
import BusinessTable from "@/components/admin/businesses/BusinessTable";
import BusinessDetailDrawer from "@/components/admin/businesses/BusinessDetailDrawer";
import ConfirmActionModal from "@/components/admin/businesses/ConfirmActionModal";
import { exportBusinessesToCsv } from "@/lib/admin-businesses/export-csv";

const DEFAULT_FILTERS = {
  q: "",
  status: "",
  subscription: "",
  verified: "",
  ownerVerified: "",
  ownerStatus: "",
  reservationEnabled: "",
  category: "",
  city: "",
  plan: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  pageSize: 20,
};

function buildQuery(filters) {
  const p = new URLSearchParams();
  if (filters.q) p.set("q", filters.q);
  if (filters.status) p.set("status", filters.status);
  if (filters.subscription) p.set("subscription", filters.subscription);
  if (filters.verified) p.set("verified", filters.verified);
  if (filters.ownerVerified) p.set("ownerVerified", filters.ownerVerified);
  if (filters.ownerStatus) p.set("ownerStatus", filters.ownerStatus);
  if (filters.reservationEnabled) p.set("reservationEnabled", filters.reservationEnabled);
  if (filters.category) p.set("category", filters.category);
  if (filters.city) p.set("city", filters.city);
  if (filters.plan) p.set("plan", filters.plan);
  p.set("sortBy", filters.sortBy || "createdAt");
  p.set("sortOrder", filters.sortOrder || "desc");
  p.set("page", String(filters.page || 1));
  p.set("pageSize", String(filters.pageSize || 20));
  return p.toString();
}

export default function BusinessesClient() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, title: "", message: "", onConfirm: null, loading: false });
  const [actionLoading, setActionLoading] = useState(null);

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildQuery(filters);
      const res = await fetch(`/api/admin/businesses?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Liste alınamadı.");
      if (!data.success) throw new Error(data.error || "Liste alınamadı.");
      setItems(data.items ?? []);
      setPagination(data.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 1 });
    } catch (e) {
      setError(e.message || "Bir hata oluştu.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    fetch("/api/categories/flat")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetch("/api/admin/businesses/cities")
      .then((r) => r.json())
      .then((d) => setCities(d.cities ?? []))
      .catch(() => setCities([]));
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const patchBusiness = useCallback(async (id, body) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncelleme başarısız.");
      toast.success("Güncellendi.");
      await loadBusinesses();
      return data.business;
    } catch (e) {
      toast.error(e.message || "Güncelleme başarısız.");
      throw e;
    } finally {
      setActionLoading(null);
    }
  }, [loadBusinesses]);

  const handleToggleActive = useCallback(
    (b) => {
      patchBusiness(b.id, { action: "toggle" });
    },
    [patchBusiness]
  );

  const handleVerify = useCallback(
    (b) => {
      patchBusiness(b.id, { action: "verify" });
    },
    [patchBusiness]
  );

  const handleUnverify = useCallback(
    (b) => {
      patchBusiness(b.id, { action: "unverify" });
    },
    [patchBusiness]
  );

  const handleOpenDetail = useCallback((b) => {
    setDetailId(b.id);
    setDrawerOpen(true);
  }, []);

  const handleVerifyOwnerEmail = useCallback(
    (b) => {
      patchBusiness(b.id, { action: "verifyOwnerEmail" });
    },
    [patchBusiness],
  );

  const handleUnverifyOwnerEmail = useCallback(
    (b) => {
      patchBusiness(b.id, { action: "unverifyOwnerEmail" });
    },
    [patchBusiness],
  );

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setDetailId(null);
  }, []);

  const handleBulkAction = useCallback(
    async (action) => {
      if (selectedIds.length === 0) {
        toast.error("Lütfen en az bir işletme seçin.");
        return;
      }
      setConfirm((c) => ({ ...c, loading: true }));
      try {
        for (const id of selectedIds) {
          await fetch(`/api/admin/businesses/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              action === "verify"
                ? { action: "verify" }
                : action === "ownerVerify"
                  ? { action: "verifyOwnerEmail" }
                  : action === "ownerUnverify"
                    ? { action: "unverifyOwnerEmail" }
                    : { isActive: action === "active" },
            ),
          });
        }
        toast.success(`${selectedIds.length} işletme güncellendi.`);
        setSelectedIds([]);
        await loadBusinesses();
      } catch (e) {
        toast.error("Toplu işlem başarısız.");
      } finally {
        setConfirm((c) => ({ ...c, open: false, loading: false }));
      }
    },
    [selectedIds, loadBusinesses]
  );

  const handleExport = useCallback(() => {
    if (items.length === 0) {
      toast.error("Dışa aktarılacak kayıt yok.");
      return;
    }
    exportBusinessesToCsv(items);
    toast.success("CSV indirildi.");
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-100">
            <Store className="w-3.5 h-3.5" /> İşletme Dizini
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
            İŞLETMELERİ <br /><span className="text-blue-600">YÖNET</span>
          </h1>
        </div>
      </div>

      <BusinessFiltersBar
        filters={filters}
        onChange={handleFilterChange}
        categories={categories}
        cities={cities}
        loading={loading}
      />

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-sm font-medium text-slate-700">{selectedIds.length} seçili</span>
          <button
            type="button"
            onClick={() => handleBulkAction("active")}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
          >
            Aktif yap
          </button>
          <button
            type="button"
            onClick={() => handleBulkAction("inactive")}
            className="px-3 py-1.5 rounded-lg bg-slate-600 text-white text-sm font-medium hover:bg-slate-700"
          >
            Pasif yap
          </button>
          <button
            type="button"
            onClick={() => handleBulkAction("verify")}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Doğrula
          </button>
          <button
            type="button"
            onClick={() => handleBulkAction("ownerVerify")}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Sahip mail doğrula
          </button>
          <button
            type="button"
            onClick={() => handleBulkAction("ownerUnverify")}
            className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-800"
          >
            Sahip mail kaldır
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-white"
          >
            Seçimi temizle
          </button>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={items.length === 0}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-white disabled:opacity-50"
        >
          CSV dışa aktar
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 text-sm">
          {error}
        </div>
      )}

      <BusinessTable
        items={items}
        loading={loading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={handleOpenDetail}
        onToggleActive={handleToggleActive}
        onVerify={handleVerify}
        onUnverify={handleUnverify}
        onVerifyOwnerEmail={handleVerifyOwnerEmail}
        onUnverifyOwnerEmail={handleUnverifyOwnerEmail}
        onOpenDetail={handleOpenDetail}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      <BusinessDetailDrawer
        businessId={detailId}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onBusinessUpdated={loadBusinesses}
        categories={categories}
      />

      <ConfirmActionModal
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel="Onayla"
        cancelLabel="İptal"
        variant="danger"
        loading={confirm.loading}
        onConfirm={() => confirm.onConfirm?.()}
        onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
      />
    </div>
  );
}
