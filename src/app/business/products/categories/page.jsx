"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
  Bars3Icon,
  Squares2X2Icon,
  FolderIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

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
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
            {title}
          </p>
          <p className="mt-3 truncate text-2xl font-bold tracking-tight">
            {value}
          </p>
          {sub ? <p className="mt-2 text-xs text-white/75">{sub}</p> : null}
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ActionButton({
  children,
  onClick,
  icon: Icon,
  tone = "white",
  type = "button",
  disabled = false,
  className = "",
}) {
  const tones = {
    green:
      "border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-700",
    blue: "border-sky-600 bg-sky-500 text-white hover:bg-sky-600",
    white:
      "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm",
    amber:
      "border-amber-500 bg-amber-500 text-white hover:bg-amber-600",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

export default function ProductCategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newName, setNewName] = useState("");
  const [newOrder, setNewOrder] = useState("0");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState("0");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/business/product-categories", {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Liste alınamadı");
      }

      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      toast.error(e.message || "Kategoriler yüklenemedi.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditName(row.name);
    setEditOrder(String(row.order ?? 0));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditOrder("0");
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    const name = newName.trim();
    if (name.length < 2) {
      toast.error("Kategori adı en az 2 karakter olmalı.");
      return;
    }

    const order = Number.parseInt(newOrder, 10);

    setSaving(true);
    try {
      const res = await fetch("/api/business/product-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          order: Number.isFinite(order) ? order : 0,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Kayıt oluşturulamadı");
      }

      toast.success("Kategori eklendi.");
      setNewName("");
      setNewOrder("0");
      await load();
    } catch (err) {
      toast.error(err.message || "Kayıt oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (id) => {
    const name = editName.trim();
    if (name.length < 2) {
      toast.error("Kategori adı en az 2 karakter olmalı.");
      return;
    }

    const order = Number.parseInt(editOrder, 10);

    setSaving(true);
    try {
      const res = await fetch(`/api/business/product-categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          order: Number.isFinite(order) ? order : 0,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Güncellenemedi");
      }

      toast.success("Kategori güncellendi.");
      cancelEdit();
      await load();
    } catch (err) {
      toast.error(err.message || "Güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const ok = window.confirm(
      `"${row.name}" kategorisini silmek istediğinize emin misiniz? Bu kategoride ürün varsa silme engellenir.`
    );
    if (!ok) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/business/product-categories/${row.id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Silinemedi");
      }

      toast.success("Kategori silindi.");
      await load();
    } catch (err) {
      toast.error(err.message || "Silinemedi.");
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    const total = items.length;
    const highestOrder = items.length
      ? Math.max(...items.map((item) => Number(item.order ?? 0)))
      : 0;

    return {
      total,
      highestOrder,
      hasEditing: editingId ? "Aktif" : "Yok",
      createReady: newName.trim().length >= 2 ? "Hazır" : "Bekliyor",
    };
  }, [items, editingId, newName]);

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 pb-16 pt-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <Link
                  href="/business/products"
                  className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 transition hover:bg-white/15"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Ürünlere Dön
                </Link>

                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Ürün Kategorileri
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Ürünlerinizi düzenli gruplamak için kategori tanımlayın,
                  sıralayın ve güncelleyin. Sıra numarası listeleme önceliğini etkiler.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton
                  type="submit"
                  onClick={handleCreate}
                  icon={PlusIcon}
                  tone="green"
                  disabled={saving || newName.trim().length < 2}
                >
                  Yeni Kategori Ekle
                </ActionButton>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Toplam Kategori"
              value={stats.total}
              sub="Tanımlı kategori sayısı"
              icon={Squares2X2Icon}
              tone="blue"
            />
            <StatCard
              title="En Yüksek Sıra"
              value={stats.highestOrder}
              sub="Mevcut maksimum sıra değeri"
              icon={AdjustmentsHorizontalIcon}
              tone="emerald"
            />
            <StatCard
              title="Düzenleme"
              value={stats.hasEditing}
              sub="Satır düzenleme durumu"
              icon={CheckCircleIcon}
              tone="amber"
            />
            <StatCard
              title="Yeni Kayıt"
              value={stats.createReady}
              sub="Form gönderim durumu"
              icon={FolderIcon}
              tone="slate"
            />
          </div>
        </section>

        <SectionCard
          title="Yeni Kategori"
          subtitle="Aynı işletmede kategori adı benzersiz olmalıdır"
        >
          <form
            onSubmit={handleCreate}
            className="grid gap-4 lg:grid-cols-[1fr_140px_auto]"
          >
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Kategori Adı
              </label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Örn. İçecekler"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#004aad]/40 focus:ring-4 focus:ring-[#004aad]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Sıra
              </label>
              <input
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#004aad]/40 focus:ring-4 focus:ring-[#004aad]/10"
              />
            </div>

            <div className="flex items-end">
              <ActionButton
                type="submit"
                icon={PlusIcon}
                tone="green"
                disabled={saving || newName.trim().length < 2}
                className="h-12 w-full justify-center lg:w-auto"
              >
                {saving ? "Ekleniyor..." : "Ekle"}
              </ActionButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Tanımlı Kategoriler"
          subtitle="Kayıtları düzenleyin veya silin"
          right={
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
              <Bars3Icon className="h-4 w-4" />
              Liste Görünümü
            </div>
          }
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#004aad]" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center text-sm text-slate-500">
              Henüz kategori yok. Yukarıdan ilk kategorinizi ekleyin.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((row, index) => (
                <div
                  key={row.id}
                  className={`rounded-[24px] border p-4 shadow-sm transition ${
                    editingId === row.id
                      ? "border-[#004aad]/20 bg-blue-50/40"
                      : index % 2 === 0
                      ? "border-slate-200 bg-white hover:shadow-md"
                      : "border-slate-200 bg-slate-50/60 hover:shadow-md"
                  }`}
                >
                  {editingId === row.id ? (
                    <div className="grid gap-4 lg:grid-cols-[1fr_120px_auto]">
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          Kategori Adı
                        </label>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#004aad]/40 focus:ring-4 focus:ring-[#004aad]/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          Sıra
                        </label>
                        <input
                          type="number"
                          value={editOrder}
                          onChange={(e) => setEditOrder(e.target.value)}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#004aad]/40 focus:ring-4 focus:ring-[#004aad]/10"
                        />
                      </div>

                      <div className="flex flex-wrap items-end gap-2">
                        <ActionButton
                          onClick={() => handleSaveEdit(row.id)}
                          tone="green"
                          disabled={saving}
                        >
                          Kaydet
                        </ActionButton>
                        <ActionButton
                          onClick={cancelEdit}
                          tone="white"
                          disabled={saving}
                        >
                          Vazgeç
                        </ActionButton>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                            <TagIcon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {row.name}
                            </p>
                            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                              Sıra: {row.order ?? 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => startEdit(row)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-[#004aad]/20 hover:text-[#004aad] disabled:opacity-50"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          Düzenle
                        </button>

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleDelete(row)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Sil
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}