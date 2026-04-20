"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  Bars3BottomLeftIcon,
  UserGroupIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import SupplierFormModal from "@/components/business/SupplierFormModal";

const fmtMoney = (n) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

const fmtTry = (n) => `₺${fmtMoney(n)}`;

function StatCard({ title, value, sub, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600 to-indigo-700 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    slate: "from-slate-800 to-slate-900 text-white",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br ${tones[tone]} p-5 shadow-[0_12px_30px_rgba(15,23,42,0.14)]`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
            {title}
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
          {sub ? <p className="mt-2 text-xs text-white/75">{sub}</p> : null}
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  icon: Icon,
  tone = "dark",
  className = "",
}) {
  const tones = {
    green:
      "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    amber:
      "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white",
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${tones[tone]} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-56 max-w-[70%] rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 text-right md:px-5">
            <div className="ml-auto h-4 w-24 rounded bg-slate-200 animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [assigningRowId, setAssigningRowId] = useState("");

  const fetchList = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    try {
      const params = new URLSearchParams();
      if (searchQ.length >= 3) params.set("q", searchQ);

      const res = await fetch(`/api/business/suppliers?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Liste alınamadı");

      setSuppliers(data.suppliers || []);
      setTotalCount(data.totalCount ?? (data.suppliers || []).length);
    } catch (e) {
      console.error(e);
      setApiError(e.message);
      setSuppliers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [searchQ]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/business/suppliers/categories");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kategoriler alınamadı");
      setCategories(data.items || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput.length === 0 || searchInput.length >= 3) {
        setSearchQ(searchInput.trim());
      }
    }, 300);

    return () => clearTimeout(t);
  }, [searchInput]);

  const sorted = useMemo(() => {
    const filtered =
      categoryFilter === "ALL"
        ? suppliers
        : suppliers.filter((row) =>
            categoryFilter === "UNCATEGORIZED"
              ? !row.categoryName
              : row.categoryId === categoryFilter
          );

    const arr = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      if (sortKey === "name") {
        return dir * String(a.name || "").localeCompare(String(b.name || ""), "tr");
      }
      if (sortKey === "openingBalance") {
        return dir * ((a.openingBalance || 0) - (b.openingBalance || 0));
      }
      return 0;
    });

    return arr;
  }, [suppliers, sortKey, sortDir, categoryFilter]);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ id: c.id, name: c.name })),
    [categories]
  );

  const summary = useMemo(() => {
    return sorted.reduce(
      (acc, row) => {
        acc.openingBalance += Number(row.openingBalance) || 0;
        return acc;
      },
      {
        openingBalance: 0,
      }
    );
  }, [sorted]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const openNew = () => {
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (id) => {
    setEditId(id);
    setModalOpen(true);
  };

  const openDetail = (id) => {
    router.push(`/business/suppliers/${id}`);
  };

  const createCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setSavingCategory(true);
    try {
      const res = await fetch("/api/business/suppliers/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kategori eklenemedi");
      setNewCategoryName("");
      await fetchCategories();
    } catch (e) {
      alert(e.message || "Kategori eklenemedi");
    } finally {
      setSavingCategory(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!confirm("Kategori silinsin mi?")) return;
    try {
      const res = await fetch(`/api/business/suppliers/categories/${categoryId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kategori silinemedi");
      await Promise.all([fetchCategories(), fetchList()]);
    } catch (e) {
      alert(e.message || "Kategori silinemedi");
    }
  };

  const assignCategoryToSupplier = async (supplierId, categoryId) => {
    setAssigningRowId(supplierId);
    try {
      const res = await fetch(`/api/business/suppliers/${supplierId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: categoryId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kategori atanamadı");
      setSuppliers((prev) =>
        prev.map((row) =>
          row.id === supplierId
            ? {
                ...row,
                categoryId: data?.supplier?.categoryId || null,
                categoryName: data?.supplier?.category?.name || data?.supplier?.categoryName || null,
              }
            : row
        )
      );
    } catch (e) {
      alert(e.message || "Kategori atanamadı");
    } finally {
      setAssigningRowId("");
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 text-[13px] text-slate-700">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <BuildingStorefrontIcon className="h-4 w-4" />
              Tedarikçi Yönetimi
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
              Tedarikçiler
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Ürün ve hizmet aldığınız tedarikçileri yönetin, bakiyeleri izleyin
              ve kayıtları tek ekranda düzenleyin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ActionButton onClick={openNew} icon={PlusIcon} tone="green">
              Yeni Tedarikçi Ekle
            </ActionButton>

            <ActionButton
              onClick={() => alert("Excel ile tedarikçi yükleme yakında eklenecek.")}
              icon={Bars3BottomLeftIcon}
              tone="amber"
            >
              Excelden Tedarikçi Yükle
            </ActionButton>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Toplam Tedarikçi"
          value={String(totalCount)}
          sub="Listelenen toplam tedarikçi kaydı"
          icon={UserGroupIcon}
          tone="blue"
        />
        <StatCard
          title="Açılış Bakiyesi Toplamı"
          value={fmtTry(summary.openingBalance)}
          sub="Listelenen tedarikçilerin toplam açılış bakiyesi"
          icon={BanknotesIcon}
          tone="emerald"
        />
        <StatCard
          title="Görünen Kayıt"
          value={String(sorted.length)}
          sub="Arama sonucuna göre ekranda görünen satır sayısı"
          icon={BuildingStorefrontIcon}
          tone="slate"
        />
      </section>

      {apiError && (
        <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Veri alınırken bir hata oluştu</p>
              <p className="mt-1 text-sm leading-6">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              Arama ve İşlemler
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Tedarikçi adına göre arama yapabilir ve listeyi yenileyebilirsiniz.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
            <div className="relative w-full sm:w-[320px]">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                placeholder="arama... (en az 3 karakter)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <select
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 sm:w-[220px]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">Tüm Kategoriler</option>
              <option value="UNCATEGORIZED">Kategorisiz</option>
              {categoryOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>

            <ActionButton
              onClick={fetchList}
              icon={ArrowPathIcon}
              tone="white"
              className="rounded-xl px-3 py-2.5"
            >
              Yenile
            </ActionButton>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
          Kategori Yönetimi
        </h2>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400 md:max-w-sm"
            placeholder="Yeni kategori adı (örn: Toptancı)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button
            type="button"
            onClick={createCategory}
            disabled={savingCategory}
            className="inline-flex items-center justify-center rounded-xl border border-emerald-700 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {savingCategory ? "Ekleniyor..." : "Kategori Ekle"}
          </button>
        </div>
        {categories.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                {cat.name}
                <button
                  type="button"
                  onClick={() => deleteCategory(cat.id)}
                  className="text-rose-600 hover:text-rose-700"
                  title="Kategoriyi sil"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-500">Henüz kategori yok.</p>
        )}
      </section>

      {suppliers.length === 0 && !loading ? (
        <section className="rounded-[28px] border border-amber-200 bg-amber-50/70 px-5 py-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <BuildingStorefrontIcon className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Henüz tedarikçi kaydı yok
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Yeni tedarikçi ekleyerek ürün veya hizmet aldığınız firmaları
                sisteme tanımlayabilirsiniz.
              </p>

              <button
                type="button"
                onClick={openNew}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <PlusIcon className="h-4 w-4" />
                Yeni Tedarikçi Ekle
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Tedarikçi Listesi</h3>
              <p className="mt-1 text-sm text-slate-500">
                Detay için satıra tıklayın.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
                Kayıt: {sorted.length}
              </span>
            </div>
          </div>

          <div className="overflow-auto max-h-[calc(100vh-300px)]">
            <table className="min-w-full border-collapse text-left">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-900 text-white">
                  <th className="w-[55%] px-4 py-3 font-semibold md:px-5">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 hover:opacity-90"
                      onClick={() => toggleSort("name")}
                    >
                      İsim / Unvan
                      <ArrowsUpDownIcon className="h-4 w-4 opacity-80" />
                    </button>
                  </th>

                  <th className="px-4 py-3 font-semibold whitespace-nowrap md:px-5">
                    Kategori
                  </th>

                  <th className="px-4 py-3 text-right font-semibold whitespace-nowrap md:px-5">
                    <button
                      type="button"
                      className="ml-auto inline-flex items-center gap-1.5 hover:opacity-90"
                      onClick={() => toggleSort("openingBalance")}
                    >
                      Açılış Bakiyesi
                      <ArrowsUpDownIcon className="h-4 w-4 opacity-80" />
                    </button>
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <TableSkeleton />
                ) : (
                  sorted.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`cursor-pointer border-b border-slate-100 transition hover:bg-sky-50/70 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }`}
                      onClick={() => openDetail(row.id)}
                    >
                      <td className="px-4 py-3.5 md:px-5">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {row.name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            Tedarikçi kaydı
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-sm text-slate-600 md:px-5">
                        <select
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700"
                          value={row.categoryId || ""}
                          disabled={assigningRowId === row.id}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => assignCategoryToSupplier(row.id, e.target.value)}
                        >
                          <option value="">Kategorisiz</option>
                          {categoryOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3.5 text-right font-semibold tabular-nums whitespace-nowrap text-slate-800 md:px-5">
                        {fmtTry(row.openingBalance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <SupplierFormModal
        open={modalOpen}
        supplierId={editId}
        categories={categories}
        onClose={() => {
          setModalOpen(false);
          setEditId(null);
        }}
        onSaved={fetchList}
      />
    </div>
  );
}