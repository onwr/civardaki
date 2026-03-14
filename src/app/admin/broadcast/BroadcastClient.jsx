"use client";

import { useState, useEffect, useCallback } from "react";
import { Globe, Plus } from "lucide-react";
import { LAYOUT_OPTIONS, AUDIENCE_OPTIONS, STATUS_OPTIONS } from "@/lib/broadcast/config";
import BroadcastTable from "@/components/admin/broadcast/BroadcastTable";
import BroadcastFormModal from "@/components/admin/broadcast/BroadcastFormModal";

const DEFAULT_FILTERS = {
  layout: "",
  audience: "",
  status: "",
  page: 1,
  pageSize: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
};

function buildQuery(filters) {
  const p = new URLSearchParams();
  if (filters.layout) p.set("layout", filters.layout);
  if (filters.audience) p.set("audience", filters.audience);
  if (filters.status) p.set("status", filters.status);
  p.set("page", String(filters.page || 1));
  p.set("pageSize", String(filters.pageSize || 20));
  p.set("sortBy", filters.sortBy || "createdAt");
  p.set("sortOrder", filters.sortOrder || "desc");
  return p.toString();
}

export default function BroadcastClient() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ totalCount: 0, draftCount: 0, activeCount: 0, pausedCount: 0, endedCount: 0 });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBroadcast, setEditBroadcast] = useState(null);

  const fetchBroadcasts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildQuery(filters);
      const res = await fetch(`/api/admin/broadcasts?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Liste alınamadı.");
      if (!data.success) throw new Error(data.error || "Liste alınamadı.");
      setItems(data.items ?? []);
      setPagination(data.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 1 });
      setStats(data.stats ?? { totalCount: 0, draftCount: 0, activeCount: 0, pausedCount: 0, endedCount: 0 });
    } catch (e) {
      setError(e.message || "Bir hata oluştu.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleEdit = useCallback((row) => {
    setEditBroadcast(row);
    setModalOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditBroadcast(null);
    setModalOpen(true);
  }, []);

  const handleModalSuccess = useCallback(() => {
    setModalOpen(false);
    setEditBroadcast(null);
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  const handleDelete = useCallback(async (row) => {
    if (!confirm(`"${row.title}" duyurusunu silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/broadcasts/${row.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Silinemedi.");
      fetchBroadcasts();
    } catch (e) {
      alert(e.message || "Bir hata oluştu.");
    }
  }, [fetchBroadcasts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-slate-600" />
          <h1 className="text-2xl font-bold text-slate-900">Duyurular</h1>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Yeni duyuru
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Toplam</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? "—" : stats.totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Taslak</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{loading ? "—" : stats.draftCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Aktif</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{loading ? "—" : stats.activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Duraklatıldı</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{loading ? "—" : stats.pausedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sona erdi</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{loading ? "—" : stats.endedCount}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
        <select
          value={filters.layout ?? ""}
          onChange={(e) => handleFilterChange({ layout: e.target.value || "" })}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Tüm yerleşimler</option>
          {LAYOUT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={filters.audience ?? ""}
          onChange={(e) => handleFilterChange({ audience: e.target.value || "" })}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:border-blue-300 focus:outline-none"
        >
          <option value="">Tüm hedef kitleler</option>
          {AUDIENCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
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
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 text-sm">{error}</div>
      )}

      <BroadcastTable
        items={items}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      <BroadcastFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditBroadcast(null); }}
        onSuccess={handleModalSuccess}
        editBroadcast={editBroadcast}
      />
    </div>
  );
}
