"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap } from "lucide-react";
import SubscriptionFiltersBar from "@/components/admin/subscriptions/SubscriptionFiltersBar";
import SubscriptionsTable from "@/components/admin/subscriptions/SubscriptionsTable";
import EditSubscriptionModal from "@/components/admin/subscriptions/EditSubscriptionModal";
import ConfirmActionModal from "@/components/admin/subscriptions/ConfirmActionModal";

const DEFAULT_FILTERS = {
  q: "",
  status: "",
  plan: "",
  expiring: undefined,
  sortBy: "expiresAt",
  sortOrder: "asc",
  page: 1,
  pageSize: 20,
};

function buildQuery(filters) {
  const p = new URLSearchParams();
  if (filters.q) p.set("q", filters.q);
  if (filters.status) p.set("status", filters.status);
  if (filters.plan) p.set("plan", filters.plan);
  if (filters.expiring) p.set("expiring", filters.expiring);
  p.set("sortBy", filters.sortBy || "expiresAt");
  p.set("sortOrder", filters.sortOrder || "asc");
  p.set("page", String(filters.page || 1));
  p.set("pageSize", String(filters.pageSize || 20));
  return p.toString();
}

export default function SubscriptionsClient() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    trialCount: 0,
    activeCount: 0,
    expiredCount: 0,
    basicCount: 0,
    premiumCount: 0,
    expiringIn30Days: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editSubscription, setEditSubscription] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, type: "", title: "", message: "", payload: null, loading: false });

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildQuery(filters);
      const res = await fetch(`/api/admin/subscriptions?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Liste alınamadı.");
      if (!data.success) throw new Error(data.error || "Liste alınamadı.");
      setItems(data.items ?? []);
      setPagination(data.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 1 });
      setStats(data.stats ?? { totalSubscriptions: 0, trialCount: 0, activeCount: 0, expiredCount: 0, basicCount: 0, premiumCount: 0, expiringIn30Days: 0 });
    } catch (e) {
      setError(e.message || "Bir hata oluştu.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleEdit = useCallback((row) => {
    setEditSubscription(row);
  }, []);

  const handleExtend = useCallback((row) => {
    setConfirm({
      open: true,
      type: "extend",
      title: "Süre uzat",
      message: `${row.business?.name ?? "İşletme"} aboneliğini 30 gün uzatmak istediğinize emin misiniz?`,
      payload: row,
      loading: false,
    });
  }, []);

  const handleCancel = useCallback((row) => {
    setConfirm({
      open: true,
      type: "cancel",
      title: "Aboneliği iptal et",
      message: `${row.business?.name ?? "İşletme"} aboneliğini iptal etmek (süresi doldu yapmak) istediğinize emin misiniz?`,
      payload: row,
      loading: false,
    });
  }, []);

  const handleConfirmAction = useCallback(async () => {
    const { type, payload } = confirm;
    if (!payload?.id) return;
    setConfirm((c) => ({ ...c, loading: true }));
    try {
      if (type === "extend") {
        const expiresAt = new Date(payload.expiresAt);
        const now = new Date();
        const newExpires = expiresAt.getTime() < now.getTime()
          ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          : new Date(expiresAt.getTime() + 30 * 24 * 60 * 60 * 1000);
        const res = await fetch(`/api/admin/subscriptions/${payload.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expiresAt: newExpires.toISOString() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Güncellenemedi.");
        await fetchSubscriptions();
      } else if (type === "cancel") {
        const res = await fetch(`/api/admin/subscriptions/${payload.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "EXPIRED" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Güncellenemedi.");
        await fetchSubscriptions();
      }
    } catch (e) {
      setError(e.message || "İşlem başarısız.");
    } finally {
      setConfirm((c) => ({ ...c, open: false, loading: false, payload: null }));
    }
  }, [confirm.type, confirm.payload, fetchSubscriptions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-100">
            <Zap className="w-3.5 h-3.5" /> Abonelik Yönetimi
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
            ABONELİKLER
          </h1>
        </div>
      </div>

      <SubscriptionFiltersBar filters={filters} onChange={handleFilterChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Toplam</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? "—" : stats.totalSubscriptions}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">D</div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Deneme</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? "—" : stats.trialCount}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">A</div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Aktif</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? "—" : stats.activeCount}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">S</div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Süresi dolan</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? "—" : stats.expiredCount}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">30</div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">30 günde biten</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? "—" : stats.expiringIn30Days}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 text-sm">
          {error}
        </div>
      )}

      <SubscriptionsTable
        items={items}
        loading={loading}
        onEdit={handleEdit}
        onExtend={handleExtend}
        onCancel={handleCancel}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {editSubscription && (
        <EditSubscriptionModal
          open={!!editSubscription}
          subscription={editSubscription}
          onClose={() => setEditSubscription(null)}
          onSuccess={() => {
            setEditSubscription(null);
            fetchSubscriptions();
          }}
        />
      )}

      {confirm.open && (
        <ConfirmActionModal
          open={confirm.open}
          title={confirm.title}
          message={confirm.message}
          loading={confirm.loading}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirm((c) => ({ ...c, open: false, payload: null }))}
        />
      )}
    </div>
  );
}
