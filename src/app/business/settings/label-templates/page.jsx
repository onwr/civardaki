"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  TagIcon,
  Squares2X2Icon,
  DocumentTextIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { categoryLabelTr, formatLabelTr } from "@/lib/label-template-defaults";

function ActionButton({
  children,
  onClick,
  icon: Icon,
  tone = "green",
  className = "",
  type = "button",
  disabled = false,
}) {
  const tones = {
    green:
      "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    orange:
      "bg-orange-500 hover:bg-orange-600 border-orange-500 text-white",
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
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

function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ModalShell({ title, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Kapat"
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                Etiket Şablonu
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
        </div>

        <div className="p-5">{children}</div>

        {footer ? (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function badgeClass(category) {
  if (category === "PRODUCT") return "bg-emerald-100 text-emerald-800";
  return "bg-sky-100 text-sky-800";
}

export default function LabelTemplatesPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [search, setSearch] = useState("");

  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("A4");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/business/label-templates");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Liste yüklenemedi.");
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      toast.error(e.message || "Liste yüklenemedi.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    function onDocClick(e) {
      if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const openFormatFlow = (category) => {
    setPendingCategory(category);
    setSelectedFormat("A4");
    setFormatModalOpen(true);
    setDropdownOpen(false);
  };

  const submitCreate = async () => {
    if (!pendingCategory) return;
    setCreating(true);
    try {
      const res = await fetch("/api/business/label-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: pendingCategory,
          format: selectedFormat,
          name: "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Oluşturulamadı.");
      toast.success("Şablon oluşturuldu.");
      setFormatModalOpen(false);
      setPendingCategory(null);

      if (data.item?.id) {
        router.push(`/business/settings/label-templates/${data.item.id}`);
      } else {
        await load();
      }
    } catch (e) {
      toast.error(e.message || "Hata.");
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Bu etiket şablonunu silmek istiyor musunuz?")) return;
    try {
      const res = await fetch(`/api/business/label-templates/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Silinemedi.");
      toast.success("Silindi.");
      await load();
    } catch (e) {
      toast.error(e.message || "Silinemedi.");
    }
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((row) => {
      return (
        row.name?.toLowerCase().includes(q) ||
        categoryLabelTr(row.category).toLowerCase().includes(q) ||
        formatLabelTr(row.format).toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      product: items.filter((x) => x.category === "PRODUCT").length,
      address: items.filter((x) => x.category === "ADDRESS").length,
      a4: items.filter((x) => x.format === "A4").length,
    };
  }, [items]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-white px-4 pb-16 pt-8">
        <div className="mx-auto flex max-w-6xl justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-white px-4 pb-16 pt-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <TagIcon className="h-4 w-4" />
                  Etiket Yönetimi
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Etiket Şablonları
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Kargo adres ve ürün barkod / fiyat etiketlerinizi tanımlayın,
                  sonra düzenleyicide görünüm ayarlarını yapın.
                </p>
              </div>

              <div className="relative" ref={dropdownRef}>
                <ActionButton
                  onClick={() => setDropdownOpen((o) => !o)}
                  icon={PlusIcon}
                  tone="green"
                >
                  Yeni Etiket Şablonu Ekle
                  <ChevronDownIcon className="h-4 w-4" />
                </ActionButton>

                {dropdownOpen ? (
                  <div className="absolute right-0 z-[80] mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl">
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                      onClick={() => openFormatFlow("PRODUCT")}
                    >
                      Ürün etiketi
                    </button>
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                      onClick={() => openFormatFlow("ADDRESS")}
                    >
                      Adres etiketi
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Toplam Şablon"
              value={stats.total}
              sub="Tüm etiket şablonları"
              icon={Squares2X2Icon}
              tone="blue"
            />
            <StatCard
              title="Ürün Etiketi"
              value={stats.product}
              sub="PRODUCT kategorisi"
              icon={TagIcon}
              tone="emerald"
            />
            <StatCard
              title="Adres Etiketi"
              value={stats.address}
              sub="ADDRESS kategorisi"
              icon={ArchiveBoxIcon}
              tone="amber"
            />
            <StatCard
              title="A4 Şablon"
              value={stats.a4}
              sub="A4 formatındaki kayıtlar"
              icon={DocumentTextIcon}
              tone="slate"
            />
          </div>
        </section>

        <SectionCard title="Bilgilendirme" subtitle="Kullanım mantığı">
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-4 text-sm leading-relaxed text-amber-950">
            <p>
              Civardaki ile kargo adres etiketlerinizi ve ürün barkod / fiyat etiketlerinizi kolayca hazırlayabilirsiniz.
            </p>
            <p className="mt-2">
              Bunun için ekstra bir etiket yazıcısına ihtiyaç duymazsınız; lazer veya mürekkep püskürtmeli yazıcılardan da çıktı alabilirsiniz.
            </p>
          </div>
        </SectionCard>

        <SectionCard
          title="Şablon Listesi"
          subtitle="Düzenlemek için karta tıklayın"
          right={
            <div className="relative w-full max-w-xs">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Şablon ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400"
              />
            </div>
          }
        >
          <div className="max-h-[min(70vh,720px)] overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
                <p className="text-sm font-medium text-slate-500">
                  {items.length === 0
                    ? "Henüz şablon yok. Yeni etiket şablonu ekleyin."
                    : "Aramanıza uygun etiket şablonu bulunamadı."}
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredItems.map((row, index) => (
                  <li key={row.id}>
                    <div
                      role="link"
                      tabIndex={0}
                      onClick={() =>
                        router.push(`/business/settings/label-templates/${row.id}`)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/business/settings/label-templates/${row.id}`);
                        }
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                        index % 2 === 0
                          ? "border-sky-100 bg-sky-50/90"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {row.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Etiket düzenleyicisini açmak için tıklayın
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeClass(
                            row.category
                          )}`}
                        >
                          {categoryLabelTr(row.category)}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                          {formatLabelTr(row.format)}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => remove(row.id, e)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                          title="Sil"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SectionCard>
      </div>

      {formatModalOpen ? (
        <ModalShell
          title="Etiket Türü Seçin"
          onClose={() => {
            setFormatModalOpen(false);
            setPendingCategory(null);
          }}
          footer={
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormatModalOpen(false);
                  setPendingCategory(null);
                }}
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={creating}
                onClick={submitCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4" />
                Devam
              </button>
            </div>
          }
        >
          <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Kullandığınız etikete göre seçim yapın. Hem şerit tipi etiket hem de A4 etiket kullanabilirsiniz.
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setSelectedFormat("A4")}
              className={`rounded-2xl border-2 p-4 text-left transition ${
                selectedFormat === "A4"
                  ? "border-emerald-500 bg-emerald-50/60"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    selectedFormat === "A4"
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300"
                  }`}
                >
                  {selectedFormat === "A4" ? <CheckIcon className="h-4 w-4" /> : null}
                </span>
                <span className="font-bold text-slate-900">A4 Etiket</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                A4 sayfalar üzerinde çoklu etiket düzeni.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat("RIBBON")}
              className={`rounded-2xl border-2 p-4 text-left transition ${
                selectedFormat === "RIBBON"
                  ? "border-emerald-500 bg-emerald-50/60"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    selectedFormat === "RIBBON"
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300"
                  }`}
                >
                  {selectedFormat === "RIBBON" ? <CheckIcon className="h-4 w-4" /> : null}
                </span>
                <span className="font-bold text-slate-900">Ribbon Etiket</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Şerit / rulo etiket yazıcıları için.
              </p>
            </button>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}