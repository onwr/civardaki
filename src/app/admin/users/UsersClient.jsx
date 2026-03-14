"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Store, ShieldCheck, Target } from "lucide-react";
import { toast } from "sonner";
import UserFiltersBar from "@/components/admin/users/UserFiltersBar";
import UsersTable from "@/components/admin/users/UsersTable";
import UserDetailDrawer from "@/components/admin/users/UserDetailDrawer";
import CreateAdminModal from "@/components/admin/users/CreateAdminModal";
import ConfirmUserActionModal from "@/components/admin/users/ConfirmUserActionModal";
import { exportUsersCsv } from "@/lib/admin-users/export-csv";

const DEFAULT_FILTERS = {
  q: "",
  role: "",
  status: "",
  verified: "",
  hasBusiness: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  pageSize: 20,
};

function buildQuery(filters) {
  const p = new URLSearchParams();
  if (filters.q) p.set("q", filters.q);
  if (filters.role) p.set("role", filters.role);
  if (filters.status) p.set("status", filters.status);
  if (filters.verified) p.set("verified", filters.verified);
  if (filters.hasBusiness) p.set("hasBusiness", filters.hasBusiness);
  p.set("sortBy", filters.sortBy || "createdAt");
  p.set("sortOrder", filters.sortOrder || "desc");
  p.set("page", String(filters.page || 1));
  p.set("pageSize", String(filters.pageSize || 20));
  return p.toString();
}

export default function UsersClient() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalBusinesses: 0,
    totalAdmins: 0,
    suspendedCount: 0,
    bannedCount: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailUserId, setDetailUserId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, title: "", message: "", onConfirm: null, loading: false });
  const [actionLoading, setActionLoading] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildQuery(filters);
      const res = await fetch(`/api/admin/users?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Liste alınamadı.");
      if (!data.success) throw new Error(data.error || "Liste alınamadı.");
      setItems(data.items ?? []);
      setPagination(data.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 1 });
      setStats(data.stats ?? { totalUsers: 0, totalCustomers: 0, totalBusinesses: 0, totalAdmins: 0, suspendedCount: 0, bannedCount: 0 });
    } catch (e) {
      setError(e.message || "Bir hata oluştu.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setCurrentUserId(d?.user?.id ?? null))
      .catch(() => setCurrentUserId(null));
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleOpenDetail = useCallback((user) => {
    setDetailUserId(user?.id ?? null);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setDetailUserId(null);
  }, []);

  const patchStatus = useCallback(async (id, status) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncelleme başarısız.");
      toast.success("Durum güncellendi.");
      await fetchUsers();
    } catch (e) {
      toast.error(e.message || "Güncelleme başarısız.");
    } finally {
      setActionLoading(null);
    }
  }, [fetchUsers]);

  const handleSuspend = useCallback(
    (user) => {
      setConfirm({
        open: true,
        title: "Hesabı askıya al",
        message: `${user?.name ?? user?.email} kullanıcısını askıya almak istediğinize emin misiniz?`,
        loading: false,
        onConfirm: () => {
          setConfirm((c) => ({ ...c, loading: true }));
          patchStatus(user.id, "SUSPENDED").finally(() => setConfirm((c) => ({ ...c, open: false, loading: false })));
        },
      });
    },
    [patchStatus]
  );

  const handleActivate = useCallback(
    (user) => {
      setConfirm({
        open: true,
        title: "Hesabı aktif yap",
        message: `${user?.name ?? user?.email} kullanıcısını tekrar aktif yapmak istediğinize emin misiniz?`,
        loading: false,
        onConfirm: () => {
          setConfirm((c) => ({ ...c, loading: true }));
          patchStatus(user.id, "ACTIVE").finally(() => setConfirm((c) => ({ ...c, open: false, loading: false })));
        },
      });
    },
    [patchStatus]
  );

  const handleBan = useCallback(
    (user) => {
      setConfirm({
        open: true,
        title: "Hesabı yasakla",
        message: `${user?.name ?? user?.email} kullanıcısını yasaklamak istediğinize emin misiniz?`,
        loading: false,
        onConfirm: () => {
          setConfirm((c) => ({ ...c, loading: true }));
          patchStatus(user.id, "BANNED").finally(() => setConfirm((c) => ({ ...c, open: false, loading: false })));
        },
      });
    },
    [patchStatus]
  );

  const handleBulkStatus = useCallback(
    async (status) => {
      if (selectedIds.length === 0) {
        toast.error("Lütfen en az bir kullanıcı seçin.");
        return;
      }
      setConfirm((c) => ({ ...c, loading: true }));
      try {
        for (const id of selectedIds) {
          await fetch(`/api/admin/users/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
        }
        toast.success(`${selectedIds.length} kullanıcı güncellendi.`);
        setSelectedIds([]);
        await fetchUsers();
      } catch (e) {
        toast.error("Toplu işlem başarısız.");
      } finally {
        setConfirm((c) => ({ ...c, open: false, loading: false }));
      }
    },
    [selectedIds, fetchUsers]
  );

  const handleExport = useCallback(() => {
    const toExport = selectedIds.length > 0 ? items.filter((u) => selectedIds.includes(u.id)) : items;
    if (toExport.length === 0) {
      toast.error("Dışa aktarılacak kayıt yok.");
      return;
    }
    exportUsersCsv(toExport);
    toast.success("CSV indirildi.");
  }, [items, selectedIds]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-100">
            <Users className="w-3.5 h-3.5" /> Kullanıcı Veritabanı
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
            KULLANICI <br /><span className="text-blue-600">YÖNETİMİ</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setCreateAdminOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 flex items-center gap-2"
        >
          <Target className="w-4 h-4" /> Yeni yönetici ekle
        </button>
      </div>

      <UserFiltersBar filters={filters} onChange={handleFilterChange} loading={loading} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Toplam kullanıcı</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? "—" : stats.totalUsers}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">İşletme sahipleri</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? "—" : stats.totalBusinesses}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Yönetici kadrosu</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? "—" : stats.totalAdmins}</p>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-sm font-medium text-slate-700">{selectedIds.length} seçili</span>
          <button
            type="button"
            onClick={() => handleBulkStatus("ACTIVE")}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
          >
            Aktif yap
          </button>
          <button
            type="button"
            onClick={() => handleBulkStatus("SUSPENDED")}
            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700"
          >
            Askıya al
          </button>
          <button
            type="button"
            onClick={() => handleBulkStatus("BANNED")}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
          >
            Yasakla
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-1.5 rounded-lg bg-slate-600 text-white text-sm font-medium hover:bg-slate-700"
          >
            Dışa aktar
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

      <UsersTable
        items={items}
        loading={loading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={handleOpenDetail}
        onOpenDetail={handleOpenDetail}
        onSuspend={handleSuspend}
        onActivate={handleActivate}
        onBan={handleBan}
        pagination={pagination}
        onPageChange={handlePageChange}
        currentUserId={currentUserId}
      />

      {drawerOpen && detailUserId && (
        <UserDetailDrawer
          userId={detailUserId}
          open={drawerOpen}
          onClose={handleCloseDrawer}
          onUserUpdated={fetchUsers}
        />
      )}
      {createAdminOpen && (
        <CreateAdminModal
          open={createAdminOpen}
          onClose={() => setCreateAdminOpen(false)}
          onSuccess={() => {
            setCreateAdminOpen(false);
            fetchUsers();
          }}
        />
      )}
      {confirm.open && (
        <ConfirmUserActionModal
          open={confirm.open}
          title={confirm.title}
          message={confirm.message}
          loading={confirm.loading}
          onConfirm={() => confirm.onConfirm?.()}
          onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
        />
      )}
    </div>
  );
}
