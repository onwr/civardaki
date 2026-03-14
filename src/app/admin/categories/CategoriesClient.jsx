"use client";

import { useState, useEffect, useCallback } from "react";
import { Layers } from "lucide-react";
import CategoryFiltersBar from "@/components/admin/categories/CategoryFiltersBar";
import CategoriesTable from "@/components/admin/categories/CategoriesTable";
import CreateCategoryModal from "@/components/admin/categories/CreateCategoryModal";
import EditCategoryModal from "@/components/admin/categories/EditCategoryModal";
import ConfirmDeleteCategoryModal from "@/components/admin/categories/ConfirmDeleteCategoryModal";

const DEFAULT_FILTERS = {
  q: "",
  parentId: undefined,
  isActive: "",
  isFeatured: "",
  sortBy: "sortOrder",
  sortOrder: "asc",
  page: 1,
  pageSize: 20,
};

function buildQuery(filters) {
  const p = new URLSearchParams();
  if (filters.q) p.set("q", filters.q);
  if (filters.parentId === "root" || filters.parentId === "") p.set("parentId", "root");
  else if (filters.parentId && filters.parentId !== "all") p.set("parentId", filters.parentId);
  if (filters.isActive === "true" || filters.isActive === "false") p.set("isActive", filters.isActive);
  if (filters.isFeatured === "true" || filters.isFeatured === "false") p.set("isFeatured", filters.isFeatured);
  p.set("sortBy", filters.sortBy || "sortOrder");
  p.set("sortOrder", filters.sortOrder || "asc");
  p.set("page", String(filters.page || 1));
  p.set("pageSize", String(filters.pageSize || 20));
  return p.toString();
}

export default function CategoriesClient() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ totalCategories: 0, activeCount: 0, featuredCount: 0, rootCount: 0 });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: "" });
  const [rootOptions, setRootOptions] = useState([]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildQuery(filters);
      const res = await fetch(`/api/admin/categories?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Liste alınamadı.");
      if (!data.success) throw new Error(data.error || "Liste alınamadı.");
      setItems(data.items ?? []);
      setPagination(data.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 1 });
      setStats(data.stats ?? { totalCategories: 0, activeCount: 0, featuredCount: 0, rootCount: 0 });
    } catch (e) {
      setError(e.message || "Bir hata oluştu.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (createModalOpen || editCategory) {
      fetch("/api/admin/categories?parentId=root&pageSize=500")
        .then((r) => r.json())
        .then((d) => setRootOptions(d.items ?? []))
        .catch(() => setRootOptions([]));
    }
  }, [createModalOpen, editCategory]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleEdit = useCallback((row) => {
    setEditCategory({ id: row.id, ...row });
  }, []);

  const handleDeleteClick = useCallback((row) => {
    setDeleteConfirm({ open: true, id: row.id, name: row.name || "Bu kategori" });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm.id) return;
    try {
      const res = await fetch(`/api/admin/categories/${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Silinemedi.");
      setDeleteConfirm({ open: false, id: null, name: "" });
      await fetchCategories();
    } catch (e) {
      setError(e.message || "Silme başarısız.");
    }
  }, [deleteConfirm.id, fetchCategories]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-100">
            <Layers className="w-3.5 h-3.5" /> Kategori Yönetimi
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
            KATEGORİLER
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700"
        >
          Yeni kategori ekle
        </button>
      </div>

      <CategoryFiltersBar filters={filters} onChange={handleFilterChange} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Toplam kategori</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? "—" : stats.totalCategories}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <span className="text-lg font-bold">✓</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Aktif</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? "—" : stats.activeCount}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <span className="text-lg">★</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Öne çıkan</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? "—" : stats.featuredCount}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <span className="text-lg font-bold">1</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Üst kategori</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? "—" : stats.rootCount}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 text-sm">
          {error}
        </div>
      )}

      <CategoriesTable
        items={items}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {createModalOpen && (
        <CreateCategoryModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            fetchCategories();
          }}
          parentOptions={rootOptions.map((i) => ({ id: i.id, name: i.name }))}
        />
      )}

      {editCategory && (
        <EditCategoryModal
          open={!!editCategory}
          category={editCategory}
          onClose={() => setEditCategory(null)}
          onSuccess={() => {
            setEditCategory(null);
            fetchCategories();
          }}
          parentOptions={rootOptions.filter((i) => i.id !== editCategory.id).map((i) => ({ id: i.id, name: i.name }))}
        />
      )}

      {deleteConfirm.open && (
        <ConfirmDeleteCategoryModal
          open={deleteConfirm.open}
          name={deleteConfirm.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm({ open: false, id: null, name: "" })}
        />
      )}
    </div>
  );
}
