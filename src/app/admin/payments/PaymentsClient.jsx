"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard } from "lucide-react";
import PaymentFiltersBar from "@/components/admin/payments/PaymentFiltersBar";
import PaymentsTable from "@/components/admin/payments/PaymentsTable";
import { formatAmount } from "@/lib/admin-payments/formatters";
import { toast } from "sonner";

const DEFAULT_FILTERS = {
  q: "",
  status: "",
  provider: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  pageSize: 20,
};

function buildQuery(filters) {
  const p = new URLSearchParams();
  if (filters.q) p.set("q", filters.q);
  if (filters.status) p.set("status", filters.status);
  if (filters.provider) p.set("provider", filters.provider);
  if (filters.dateFrom) p.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) p.set("dateTo", filters.dateTo);
  p.set("sortBy", filters.sortBy || "createdAt");
  p.set("sortOrder", filters.sortOrder || "desc");
  p.set("page", String(filters.page || 1));
  p.set("pageSize", String(filters.pageSize || 20));
  return p.toString();
}

export default function PaymentsClient() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    totalRevenue: 0,
    pendingCount: 0,
    completedCount: 0,
    failedCount: 0,
    refundedCount: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refundConfirm, setRefundConfirm] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildQuery(filters);
      const res = await fetch(`/api/admin/payments?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Liste alınamadı.");
      if (!data.success) throw new Error(data.error || "Liste alınamadı.");
      setItems(data.items ?? []);
      setPagination(data.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 1 });
      setStats(data.stats ?? { totalCount: 0, totalRevenue: 0, pendingCount: 0, completedCount: 0, failedCount: 0, refundedCount: 0 });
    } catch (e) {
      setError(e.message || "Bir hata oluştu.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleRefundClick = useCallback((row) => {
    setRefundConfirm(row);
  }, []);

  const handleRefundConfirm = useCallback(async () => {
    if (!refundConfirm?.id) return;
    setRefundLoading(true);
    try {
      const res = await fetch(`/api/admin/payments/${refundConfirm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REFUNDED" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncellenemedi.");
      toast.success("Ödeme iade edildi olarak işaretlendi.");
      setRefundConfirm(null);
      fetchPayments();
    } catch (e) {
      toast.error(e.message || "İşlem başarısız.");
    } finally {
      setRefundLoading(false);
    }
  }, [refundConfirm, fetchPayments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-slate-600" />
        <h1 className="text-2xl font-bold text-slate-900">Abonelik Ödemeleri</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Toplam tahsilat</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{loading ? "—" : formatAmount(stats.totalRevenue)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Toplam kayıt</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? "—" : stats.totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Beklemede</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{loading ? "—" : stats.pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Tamamlandı</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{loading ? "—" : stats.completedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Başarısız</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{loading ? "—" : stats.failedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">İade edildi</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{loading ? "—" : stats.refundedCount}</p>
        </div>
      </div>

      <PaymentFiltersBar filters={filters} onChange={handleFilterChange} />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 text-sm">
          {error}
        </div>
      )}

      <PaymentsTable
        items={items}
        loading={loading}
        onRefund={handleRefundClick}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {refundConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" aria-hidden onClick={() => !refundLoading && setRefundConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">İade işaretle</h3>
            <p className="mt-2 text-sm text-slate-600">
              <strong>{refundConfirm.business?.name ?? "Bu ödeme"}</strong> kaydını &quot;İade edildi&quot; olarak işaretlemek istediğinize emin misiniz?
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => !refundLoading && setRefundConfirm(null)}
                disabled={refundLoading}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleRefundConfirm}
                disabled={refundLoading}
                className="px-4 py-2 rounded-xl font-medium bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {refundLoading ? "İşleniyor..." : "İade et"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
