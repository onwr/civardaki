"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon,
  PlusIcon,
  TagIcon,
  Squares2X2Icon,
  UsersIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

const KINDS = {
  PRODUCT_BRAND: "PRODUCT_BRAND",
  CUSTOMER_CLASS_1: "CUSTOMER_CLASS_1",
  CUSTOMER_CLASS_2: "CUSTOMER_CLASS_2",
  SUPPLIER_CLASS_1: "SUPPLIER_CLASS_1",
  SUPPLIER_CLASS_2: "SUPPLIER_CLASS_2",
  FIHRIST_1: "FIHRIST_1",
  FIHRIST_2: "FIHRIST_2",
  SHELF_LOCATION: "SHELF_LOCATION",
};

const CHIP_STYLES = [
  "bg-white border-slate-200 text-slate-800",
  "bg-emerald-50 border-emerald-200 text-emerald-900",
  "bg-teal-50 border-teal-200 text-teal-900",
  "bg-orange-50 border-orange-200 text-orange-900",
  "bg-slate-100 border-slate-300 text-slate-900",
  "bg-rose-50 border-rose-200 text-rose-900",
  "bg-cyan-50 border-cyan-200 text-cyan-900",
  "bg-amber-50 border-amber-200 text-amber-900",
  "bg-indigo-50 border-indigo-200 text-indigo-900",
  "bg-lime-50 border-lime-200 text-lime-900",
  "bg-violet-50 border-violet-200 text-violet-900",
  "bg-sky-50 border-sky-200 text-sky-900",
];

function StatMini({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children, bodyClassName = "bg-white" }) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.06)]">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
          {title}
        </h2>
      </div>
      <div className={`min-h-[88px] p-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

function Chip({ label, styleIndex, onRemove }) {
  const cls = CHIP_STYLES[styleIndex % CHIP_STYLES.length];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-sm ${cls}`}
    >
      <span className="max-w-[180px] truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md p-0.5 text-slate-500 transition hover:bg-black/5 hover:text-rose-600"
        aria-label="Kaldır"
      >
        <XMarkIcon className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

function ModalShell({ title, children, onClose, onSubmit, saving }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/65">
              Yeni Tanım
            </p>
            <h2 className="mt-1 text-lg font-bold">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/10 p-2 transition hover:bg-white/15"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-5">
          {children}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckIcon className="h-4 w-4" />
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MasterdataPage() {
  const [byKind, setByKind] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [modal, setModal] = useState(null);
  const [definitionInput, setDefinitionInput] = useState("");
  const [saving, setSaving] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mdRes, catRes] = await Promise.all([
        fetch("/api/business/masterdata"),
        fetch("/api/business/product-categories"),
      ]);

      const mdJson = await mdRes.json().catch(() => ({}));
      const catJson = await catRes.json().catch(() => ({}));

      if (mdRes.ok && mdJson.byKind) setByKind(mdJson.byKind);
      else setByKind({});

      if (catRes.ok && Array.isArray(catJson.items)) setCategories(catJson.items);
      else setCategories([]);
    } catch {
      setByKind({});
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    function handleClick(e) {
      if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const openModal = (config) => {
    setDefinitionInput("");
    setModal(config);
    setDropdownOpen(false);
  };

  const saveModal = async (e) => {
    e?.preventDefault();
    const name = definitionInput.trim();
    if (!name) return toast.error("Tanım girin.");
    if (modal.mode === "category" && name.length < 2) {
      return toast.error("Kategori adı en az 2 karakter olmalı.");
    }

    setSaving(true);
    try {
      if (modal.mode === "category") {
        const res = await fetch("/api/business/product-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Eklenemedi.");
        toast.success("Kategori eklendi.");
      } else {
        const res = await fetch("/api/business/masterdata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: modal.kind, name }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Eklenemedi.");
        toast.success("Tanım eklendi.");
      }

      setModal(null);
      await loadAll();
    } catch (err) {
      toast.error(err.message || "Hata.");
    } finally {
      setSaving(false);
    }
  };

  const removeMaster = async (id) => {
    if (!confirm("Bu tanımı silmek istiyor musunuz?")) return;
    try {
      const res = await fetch(`/api/business/masterdata/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Silinemedi.");
      toast.success("Silindi.");
      await loadAll();
    } catch (err) {
      toast.error(err.message || "Silinemedi.");
    }
  };

  const removeCategory = async (id) => {
    if (
      !confirm(
        "Bu kategoriyi silmek istiyor musunuz? Ürünlerde kullanılıyorsa hata alabilirsiniz."
      )
    )
      return;

    try {
      const res = await fetch(`/api/business/product-categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Silinemedi.");
      toast.success("Kategori silindi.");
      await loadAll();
    } catch (err) {
      toast.error(err.message || "Silinemedi.");
    }
  };

  const menuItems = [
    {
      label: "Ürün Markası Ekle",
      onSelect: () =>
        openModal({ mode: "master", kind: KINDS.PRODUCT_BRAND, title: "Marka" }),
    },
    {
      label: "Ürün Kategorisi Ekle",
      onSelect: () => openModal({ mode: "category", title: "Ürün Kategorisi" }),
    },
    {
      label: "Müşteri Sınıflandırma 1 Ekle",
      onSelect: () =>
        openModal({
          mode: "master",
          kind: KINDS.CUSTOMER_CLASS_1,
          title: "Müşteri Sınıflandırması 1",
        }),
    },
    {
      label: "Müşteri Sınıflandırma 2 Ekle",
      onSelect: () =>
        openModal({
          mode: "master",
          kind: KINDS.CUSTOMER_CLASS_2,
          title: "Müşteri Sınıflandırması 2",
        }),
    },
    {
      label: "Tedarikçi Sınıflandırma 1 Ekle",
      onSelect: () =>
        openModal({
          mode: "master",
          kind: KINDS.SUPPLIER_CLASS_1,
          title: "Tedarikçi Sınıflandırması 1",
        }),
    },
    {
      label: "Tedarikçi Sınıflandırma 2 Ekle",
      onSelect: () =>
        openModal({
          mode: "master",
          kind: KINDS.SUPPLIER_CLASS_2,
          title: "Tedarikçi Sınıflandırması 2",
        }),
    },
    {
      label: "Fihrist Sınıflandırması 1 Ekle",
      onSelect: () =>
        openModal({
          mode: "master",
          kind: KINDS.FIHRIST_1,
          title: "Fihrist Sınıflandırması 1",
        }),
    },
    {
      label: "Fihrist Sınıflandırması 2 Ekle",
      onSelect: () =>
        openModal({
          mode: "master",
          kind: KINDS.FIHRIST_2,
          title: "Fihrist Sınıflandırması 2",
        }),
    },
    {
      label: "Raf Yeri Ekle",
      onSelect: () =>
        openModal({
          mode: "master",
          kind: KINDS.SHELF_LOCATION,
          title: "Raf Yeri",
        }),
    },
  ];

  const renderChips = (items, removeFn) => (
    <div className="flex flex-wrap gap-2">
      {!items?.length ? (
        <p className="text-xs italic text-slate-400">Henüz tanım yok.</p>
      ) : (
        items.map((row, i) => (
          <Chip
            key={row.id}
            label={row.name}
            styleIndex={i}
            onRemove={() => removeFn(row.id)}
          />
        ))
      )}
    </div>
  );

  const stats = useMemo(() => {
    const totalMaster =
      Object.values(byKind).reduce(
        (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
        0
      ) + categories.length;

    return {
      totalMaster,
      productBrandCount: (byKind[KINDS.PRODUCT_BRAND] || []).length,
      customerClassCount:
        (byKind[KINDS.CUSTOMER_CLASS_1] || []).length +
        (byKind[KINDS.CUSTOMER_CLASS_2] || []).length,
      supplierClassCount:
        (byKind[KINDS.SUPPLIER_CLASS_1] || []).length +
        (byKind[KINDS.SUPPLIER_CLASS_2] || []).length,
    };
  }, [byKind, categories]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-slate-50 px-4 pb-16 pt-8">
        <div className="mx-auto flex max-w-6xl justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-50 px-4 pb-16 pt-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="rounded-t-[28px] bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <Squares2X2Icon className="h-4 w-4" />
                  Tanım Yönetimi
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Tanımlar
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Ürün markası, kategori, müşteri ve tedarikçi sınıflandırmaları ile
                  raf yerlerini tek ekrandan yönetin.
                </p>
              </div>

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-700"
                >
                  <PlusIcon className="h-4 w-4" />
                  Yeni Tanım Ekle
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {dropdownOpen ? (
                  <div className="absolute right-0 z-[80] mt-2 w-72 max-h-[min(70vh,28rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-xl">
                    {menuItems.map((item, idx) => (
                      <div key={item.label}>
                        {[2, 4, 6, 8].includes(idx) ? (
                          <div className="my-1 border-t border-slate-100" />
                        ) : null}
                        <button
                          type="button"
                          onClick={item.onSelect}
                          className="w-full px-4 py-2.5 text-left text-sm text-slate-800 transition hover:bg-slate-50"
                        >
                          {item.label}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-b-[28px] p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatMini
              label="Toplam Tanım"
              value={stats.totalMaster}
              icon={Squares2X2Icon}
            />
            <StatMini
              label="Ürün Markası"
              value={stats.productBrandCount}
              icon={TagIcon}
            />
            <StatMini
              label="Müşteri Sınıfı"
              value={stats.customerClassCount}
              icon={UsersIcon}
            />
            <StatMini
              label="Tedarikçi Sınıfı"
              value={stats.supplierClassCount}
              icon={ArchiveBoxIcon}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <SectionCard title="Ürün Markalarınız">
              {renderChips(byKind[KINDS.PRODUCT_BRAND] || [], removeMaster)}
            </SectionCard>

            <SectionCard title="Ürün Kategorileriniz">
              {renderChips(categories, removeCategory)}
            </SectionCard>

            <SectionCard title="Raf Yerleriniz">
              {renderChips(byKind[KINDS.SHELF_LOCATION] || [], removeMaster)}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Müşteri Sınıflandırmanız 1" bodyClassName="bg-amber-50/70">
              {renderChips(byKind[KINDS.CUSTOMER_CLASS_1] || [], removeMaster)}
            </SectionCard>

            <SectionCard title="Müşteri Sınıflandırmanız 2" bodyClassName="bg-amber-50/70">
              {renderChips(byKind[KINDS.CUSTOMER_CLASS_2] || [], removeMaster)}
            </SectionCard>

            <SectionCard title="Tedarikçi Sınıflandırmanız 1" bodyClassName="bg-emerald-50/70">
              {renderChips(byKind[KINDS.SUPPLIER_CLASS_1] || [], removeMaster)}
            </SectionCard>

            <SectionCard title="Tedarikçi Sınıflandırmanız 2" bodyClassName="bg-emerald-50/70">
              {renderChips(byKind[KINDS.SUPPLIER_CLASS_2] || [], removeMaster)}
            </SectionCard>

            <SectionCard title="Fihrist Gruplarınız 1">
              {renderChips(byKind[KINDS.FIHRIST_1] || [], removeMaster)}
            </SectionCard>

            <SectionCard title="Fihrist Gruplarınız 2">
              {renderChips(byKind[KINDS.FIHRIST_2] || [], removeMaster)}
            </SectionCard>
          </div>
        </div>
      </div>

      {modal ? (
        <ModalShell
          title={modal.title}
          onClose={() => setModal(null)}
          onSubmit={saveModal}
          saving={saving}
        >
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Tanım
            </label>
            <input
              autoFocus
              value={definitionInput}
              onChange={(e) => setDefinitionInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
              placeholder=""
            />
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}