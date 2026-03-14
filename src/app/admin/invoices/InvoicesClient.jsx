"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Plus } from "lucide-react";
import InvoiceFiltersBar from "@/components/admin/invoices/InvoiceFiltersBar";
import InvoicesTable from "@/components/admin/invoices/InvoicesTable";
import CreateInvoiceModal from "@/components/admin/invoices/CreateInvoiceModal";
import EditInvoiceModal from "@/components/admin/invoices/EditInvoiceModal";
import InvoiceDetailDrawer from "@/components/admin/invoices/InvoiceDetailDrawer";
import { formatAmount } from "@/lib/admin-invoices/formatters";

const DEFAULT_FILTERS = {
  q: "",
  status: "",
  type: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "issueDate",
  sortOrder: "desc",
  page: 1,
  pageSize: 20,
};

function buildQuery(filters) {
  const p = new URLSearchParams();
  if (filters.q) p.set("q", filters.q);
  if (filters.status) p.set("status", filters.status);
  if (filters.type) p.set("type", filters.type);
  if (filters.dateFrom) p.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) p.set("dateTo", filters.dateTo);
  p.set("sortBy", filters.sortBy || "issueDate");
  p.set("sortOrder", filters.sortOrder || "desc");
  p.set("page", String(filters.page || 1));
  p.set("pageSize", String(filters.pageSize || 20));
  return p.toString();
}

export default function InvoicesClient() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    draftCount: 0,
    issuedCount: 0,
    paidCount: 0,
    cancelledCount: 0,
    totalAmount: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [detailInvoice, setDetailInvoice] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildQuery(filters);
      const res = await fetch(`/api/admin/invoices?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Liste alınamadı.");
      if (!data.success) throw new Error(data.error || "Liste alınamadı.");
      setItems(data.items ?? []);
      setPagination(data.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 1 });
      setStats(data.stats ?? { totalCount: 0, draftCount: 0, issuedCount: 0, paidCount: 0, cancelledCount: 0, totalAmount: 0 });
    } catch (e) {
      setError(e.message || "Bir hata oluştu.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleEdit = useCallback((row) => {
    setEditInvoice(row);
  }, []);

  const handleView = useCallback((row) => {
    setDetailInvoice(row);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-slate-600" />
          <h1 className="text-2xl font-bold text-slate-900">Faturalar</h1>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Yeni fatura
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Toplam fatura</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? "—" : stats.totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Toplam tutar</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{loading ? "—" : formatAmount(stats.totalAmount)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Taslak</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{loading ? "—" : stats.draftCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Kesildi</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{loading ? "—" : stats.issuedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Ödendi</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{loading ? "—" : stats.paidCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">İptal</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{loading ? "—" : stats.cancelledCount}</p>
        </div>
      </div>

      <InvoiceFiltersBar filters={filters} onChange={handleFilterChange} />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 text-sm">
          {error}
        </div>
      )}

      <InvoicesTable
        items={items}
        loading={loading}
        onEdit={handleEdit}
        onView={handleView}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {createModalOpen && (
        <CreateInvoiceModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            fetchInvoices();
          }}
        />
      )}

      {editInvoice && (
        <EditInvoiceModal
          open={!!editInvoice}
          invoice={editInvoice}
          onClose={() => setEditInvoice(null)}
          onSuccess={() => {
            setEditInvoice(null);
            fetchInvoices();
          }}
        />
      )}

      <InvoiceDetailDrawer
        open={!!detailInvoice}
        invoice={detailInvoice}
        onClose={() => setDetailInvoice(null)}
        onEdit={(inv) => setEditInvoice(inv)}
      />
    </div>
  );
}
