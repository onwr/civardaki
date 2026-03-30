"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
  TagIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";

const TAG_STYLES = {
  white: "bg-white border border-slate-300 text-slate-800 shadow-sm",
  green: "bg-emerald-500/90 text-white",
  sky: "bg-sky-500/90 text-white",
  yellow: "bg-amber-400 text-slate-900",
  slate: "bg-slate-700 text-white",
  red: "bg-red-500/90 text-white",
};

function StatCard({ title, value, sub, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600 to-indigo-700 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    amber: "from-amber-400 to-orange-500 text-white",
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
  tone = "white",
  className = "",
}) {
  const tones = {
    green:
      "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    red: "bg-rose-600 hover:bg-rose-700 border-rose-700 text-white",
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
    dark: "bg-slate-900 hover:bg-slate-800 border-slate-900 text-white",
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

function Tag({ name, color, itemId, onDelete, deleting }) {
  const style = TAG_STYLES[color] || TAG_STYLES.white;

  return (
    <span
      className={`group inline-flex max-w-full items-center gap-1.5 rounded-full py-1 pl-3 pr-1 text-xs font-medium ${style}`}
    >
      <span className="min-w-0 truncate">{name}</span>
      {itemId && onDelete ? (
        <button
          type="button"
          disabled={deleting}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(itemId, name);
          }}
          className="shrink-0 rounded-full p-1 opacity-70 transition hover:bg-black/10 hover:opacity-100 disabled:opacity-40"
          title="Kalemi sil"
          aria-label={`${name} sil`}
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </span>
  );
}

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [mainModal, setMainModal] = useState(false);
  const [subModal, setSubModal] = useState(false);

  const [mainName, setMainName] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subName, setSubName] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/business/expense-categories");
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Kalemler yüklenemedi.");

      setCategories(data.categories || []);
    } catch (e) {
      setApiError(e.message || "Kalemler yüklenemedi.");
      toast.error("Kalemler yüklenemedi.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveMain = async (e) => {
    e.preventDefault();

    if (!mainName.trim()) {
      toast.error("Ana kalem adı girin.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/business/expense-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: mainName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Kayıt başarısız.");

      toast.success("Ana masraf kalemi eklendi.");
      setMainModal(false);
      setMainName("");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openSub = (categoryId) => {
    setSubCategoryId(categoryId || categories[0]?.id || "");
    setSubName("");
    setSubModal(true);
  };

  const saveSub = async (e) => {
    e.preventDefault();

    if (!subName.trim()) {
      toast.error("Masraf kalemi adı girin.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/business/expense-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: subCategoryId,
          name: subName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Kayıt başarısız.");

      toast.success("Alt kalem eklendi.");
      setSubModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (itemId, itemName) => {
    if (
      !confirm(
        `“${itemName}” masraf kalemini silmek istediğinize emin misiniz? Bu kaleme bağlı eski masraf kayıtlarında sadece kalemi siler; kayıtlar kalır.`
      )
    ) {
      return;
    }

    setDeletingId(itemId);

    try {
      const res = await fetch(`/api/business/expense-items/${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Silinemedi");

      toast.success("Masraf kalemi silindi.");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const deleteCategory = async (cat) => {
    const n = cat.items?.length || 0;

    if (
      !confirm(
        `“${cat.name}” ana kalemini ve içindeki ${n} alt kalemi kalıcı olarak silmek istiyor musunuz?`
      )
    ) {
      return;
    }

    setDeletingId(`cat-${cat.id}`);

    try {
      const res = await fetch(`/api/business/expense-categories/${cat.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Silinemedi");

      toast.success("Ana masraf kalemi silindi.");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const leftCol = categories.filter((_, i) => i % 2 === 0);
  const rightCol = categories.filter((_, i) => i % 2 === 1);

  const summary = useMemo(() => {
    const totalItems = categories.reduce(
      (sum, cat) => sum + (cat.items?.length || 0),
      0
    );

    return {
      totalCategories: categories.length,
      totalItems,
      leftCount: leftCol.length,
      rightCount: rightCol.length,
    };
  }, [categories, leftCol.length, rightCol.length]);

  function CategoryCard({ cat }) {
    const catBusy = deletingId === `cat-${cat.id}`;

    return (
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/65">
              Ana Masraf Kalemi
            </p>
            <h2 className="mt-1 text-base font-bold">{cat.name}</h2>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => deleteCategory(cat)}
              disabled={catBusy || !!deletingId}
              className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              title="Ana kalemi sil"
            >
              <TrashIcon className="h-4 w-4" />
              Sil
            </button>

            <button
              type="button"
              onClick={() => openSub(cat.id)}
              className="inline-flex items-center gap-1 rounded-xl bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
            >
              Alt Kalem Ekle
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            {(cat.items || []).map((it) => (
              <Tag
                key={it.id}
                itemId={it.id}
                name={it.name}
                color={it.tagColor}
                onDelete={deleteItem}
                deleting={deletingId === it.id}
              />
            ))}

            {(!cat.items || cat.items.length === 0) && (
              <span className="text-sm text-slate-400">Henüz alt kalem yok.</span>
            )}
          </div>
        </div>
      </section>
    );
  }

  const inp =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400";
  const label =
    "mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500";

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 text-[13px] text-slate-700">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <FolderIcon className="h-4 w-4" />
              Masraf Kalemleri
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
              Masraf Kalemleri
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Ana ve alt masraf kalemlerinizi yönetin. Yeni grup ekleyin, alt
              kalem oluşturun ve gereksiz kayıtları temizleyin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ActionButton
              onClick={() => {
                setMainName("");
                setMainModal(true);
              }}
              icon={PlusIcon}
              tone="green"
            >
              Yeni Ana Masraf Kalemi
            </ActionButton>

            <Link
              href="/business/cash/expenses/yeni"
              className="inline-flex items-center gap-2 rounded-xl border border-rose-700 bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              <PlusIcon className="h-4 w-4" />
              Yeni Masraf Gir
            </Link>

            <Link
              href="/business/cash/expenses"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ← Masraf listesine dön
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard
          title="Ana Kalem"
          value={String(summary.totalCategories)}
          sub="Tanımlı ana masraf kalemi"
          icon={FolderIcon}
          tone="blue"
        />
        <StatCard
          title="Alt Kalem"
          value={String(summary.totalItems)}
          sub="Toplam alt masraf kalemi"
          icon={TagIcon}
          tone="emerald"
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

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            {leftCol.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} />
            ))}
          </div>

          <div className="space-y-6">
            {rightCol.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} />
            ))}
          </div>
        </div>
      )}

      {mainModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !saving && setMainModal(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                    Yeni Ana Kalem
                  </p>
                  <h3 className="mt-1 text-lg font-bold">Ana Masraf Kalemi</h3>
                </div>

                <button
                  type="button"
                  onClick={() => !saving && setMainModal(false)}
                  className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={saveMain} className="space-y-4 p-5">
              <div>
                <label className={label}>Ana Masraf Kalemi</label>
                <input
                  value={mainName}
                  onChange={(e) => setMainName(e.target.value)}
                  placeholder="örneğin Genel Giderler"
                  className={inp}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => !saving && setMainModal(false)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <CheckIcon className="h-5 w-5" />
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {subModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !saving && setSubModal(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                    Yeni Alt Kalem
                  </p>
                  <h3 className="mt-1 text-lg font-bold">Masraf Kalemi Tanımı</h3>
                </div>

                <button
                  type="button"
                  onClick={() => !saving && setSubModal(false)}
                  className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={saveSub} className="space-y-4 p-5">
              <div>
                <label className={label}>Ana Kalem</label>
                <select
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  className={inp}
                  required
                >
                  {categories.length === 0 ? (
                    <option value="">Önce ana kalem ekleyin</option>
                  ) : (
                    categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className={label}>Masraf Kalemi</label>
                <input
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className={inp}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => !saving && setSubModal(false)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <CheckIcon className="h-5 w-5" />
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}