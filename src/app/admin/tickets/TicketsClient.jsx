"use client";

import { useState, useEffect, useCallback } from "react";
import { Inbox } from "lucide-react";
import { STATUS_OPTIONS, PRIORITY_OPTIONS, CATEGORY_OPTIONS, CREATOR_TYPE_OPTIONS } from "@/lib/tickets/config";
import TicketsTable from "@/components/admin/tickets/TicketsTable";
import TicketDetailDrawer from "@/components/admin/tickets/TicketDetailDrawer";

const DEFAULT_FILTERS = {
  status: "",
  priority: "",
  category: "",
  creatorType: "",
  page: 1,
  pageSize: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
};

function buildQuery(filters) {
  const p = new URLSearchParams();
  if (filters.status) p.set("status", filters.status);
  if (filters.priority) p.set("priority", filters.priority);
  if (filters.category) p.set("category", filters.category);
  if (filters.creatorType) p.set("creatorType", filters.creatorType);
  p.set("page", String(filters.page || 1));
  p.set("pageSize", String(filters.pageSize || 20));
  p.set("sortBy", filters.sortBy || "createdAt");
  p.set("sortOrder", filters.sortOrder || "desc");
  return p.toString();
}

export default function TicketsClient() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ totalCount: 0, openCount: 0, waitingCount: 0, resolvedCount: 0 });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildQuery(filters);
      const res = await fetch(`/api/admin/tickets?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Liste alınamadı.");
      if (!data.success) throw new Error(data.error || "Liste alınamadı.");
      setItems(data.items ?? []);
      setPagination(data.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 1 });
      setStats(data.stats ?? { totalCount: 0, openCount: 0, waitingCount: 0, resolvedCount: 0 });
    } catch (e) {
      setError(e.message || "Bir hata oluştu.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleSelectTicket = useCallback((row) => {
    setSelectedTicketId(row?.id ?? null);
    setDrawerOpen(!!row?.id);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedTicketId(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Inbox className="w-8 h-8 text-slate-600" />
          <h1 className="text-2xl font-bold text-slate-900">Destek Talepleri</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Toplam</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? "—" : stats.totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Açık</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{loading ? "—" : stats.openCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">Yanıt bekleyen</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{loading ? "—" : stats.waitingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Çözüldü</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{loading ? "—" : stats.resolvedCount}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
        <select
          value={filters.status ?? ""}
          onChange={(e) => handleFilterChange({ status: e.target.value || "" })}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Tüm durumlar</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={filters.priority ?? ""}
          onChange={(e) => handleFilterChange({ priority: e.target.value || "" })}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Tüm öncelikler</option>
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={filters.category ?? ""}
          onChange={(e) => handleFilterChange({ category: e.target.value || "" })}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Tüm kategoriler</option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={filters.creatorType ?? ""}
          onChange={(e) => handleFilterChange({ creatorType: e.target.value || "" })}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Tüm oluşturanlar</option>
          {CREATOR_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 text-sm">{error}</div>
      )}

      <TicketsTable
        items={items}
        loading={loading}
        onSelect={handleSelectTicket}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      <TicketDetailDrawer
        open={drawerOpen}
        ticketId={selectedTicketId}
        onClose={handleCloseDrawer}
        onUpdated={fetchTickets}
      />
    </div>
  );
}
