"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  ArchiveBoxIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import {
  kindLabelTr,
  defaultDocumentTitleForKind,
} from "@/lib/proposal-template-utils";

const KIND_OPTIONS = [
  { value: "QUOTE", label: "Teklif şablonu" },
  { value: "PURCHASE_NOTE", label: "Alış bilgi notu" },
  { value: "SALES_NOTE", label: "Satış bilgi notu" },
  { value: "BA_BS_FORM", label: "BA-BS mutabakat formu" },
  { value: "CUSTOM", label: "Özel / diğer" },
];

function ActionButton({
  children,
  onClick,
  icon: Icon,
  tone = "white",
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
    dark: "bg-slate-900 hover:bg-slate-800 border-slate-900 text-white",
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
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                Şablon İşlemi
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

function kindBadgeClass(kind) {
  if (kind === "QUOTE") return "bg-emerald-100 text-emerald-800";
  if (kind === "PURCHASE_NOTE") return "bg-amber-100 text-amber-900";
  if (kind === "SALES_NOTE") return "bg-sky-100 text-sky-800";
  if (kind === "BA_BS_FORM") return "bg-violet-100 text-violet-800";
  return "bg-slate-100 text-slate-700";
}

export default function ProposalTemplatesPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [newOpen, setNewOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);

  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState("QUOTE");
  const [creating, setCreating] = useState(false);

  const [copySourceId, setCopySourceId] = useState("");
  const [copyName, setCopyName] = useState("");
  const [copying, setCopying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/business/proposal-templates");
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

  const openNew = () => {
    setNewName("");
    setNewKind("QUOTE");
    setNewOpen(true);
  };

  const submitNew = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return toast.error("Şablon adı girin.");

    setCreating(true);
    try {
      const res = await fetch("/api/business/proposal-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          kind: newKind,
          documentTitle: defaultDocumentTitleForKind(newKind),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Oluşturulamadı.");

      toast.success("Şablon oluşturuldu.");
      setNewOpen(false);

      if (data.item?.id) {
        router.push(`/business/settings/proposal-templates/${data.item.id}`);
      } else {
        await load();
      }
    } catch (e) {
      toast.error(e.message || "Hata.");
    } finally {
      setCreating(false);
    }
  };

  const openCopy = () => {
    setCopySourceId(items[0]?.id || "");
    setCopyName("");
    setCopyOpen(true);
  };

  const submitCopy = async (e) => {
    e.preventDefault();
    const name = copyName.trim();
    if (!copySourceId) return toast.error("Kopyalanacak şablonu seçin.");
    if (!name) return toast.error("Yeni şablon adını girin.");

    setCopying(true);
    try {
      const res = await fetch("/api/business/proposal-templates/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: copySourceId, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Kopyalanamadı.");

      toast.success("Şablon kopyalandı.");
      setCopyOpen(false);

      if (data.item?.id) {
        router.push(`/business/settings/proposal-templates/${data.item.id}`);
      } else {
        await load();
      }
    } catch (e) {
      toast.error(e.message || "Hata.");
    } finally {
      setCopying(false);
    }
  };

  const remove = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Bu şablonu silmek istiyor musunuz?")) return;

    try {
      const res = await fetch(`/api/business/proposal-templates/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Silinemedi.");

      toast.success("Şablon silindi.");
      await load();
    } catch (e) {
      toast.error(e.message || "Silinemedi.");
    }
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((row) => {
      const kindText = kindLabelTr(row.kind || "").toLowerCase();
      return (
        row.name?.toLowerCase().includes(q) ||
        kindText.includes(q)
      );
    });
  }, [items, search]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      quotes: items.filter((x) => x.kind === "QUOTE").length,
      notes: items.filter((x) =>
        ["PURCHASE_NOTE", "SALES_NOTE", "BA_BS_FORM"].includes(x.kind)
      ).length,
      custom: items.filter((x) => x.kind === "CUSTOM").length,
    };
  }, [items]);

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
    <div className="min-h-[calc(100vh-8rem)] bg-white px-4 pb-16 pt-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <DocumentTextIcon className="h-4 w-4" />
                  Şablon Yönetimi
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Teklif ve Özel Şablonlar
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Teklif ve bilgi notu şablonlarınızı tanımlayın, sonra düzenleyicide
                  görünüm ve içerik ayarlarını yapın.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton onClick={openNew} icon={PlusIcon} tone="green">
                  Yeni Şablon Ekle
                </ActionButton>
                <ActionButton
                  onClick={openCopy}
                  icon={DocumentDuplicateIcon}
                  tone="orange"
                  disabled={items.length === 0}
                >
                  Mevcut Şablonu Kopyala
                </ActionButton>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Toplam Şablon"
              value={stats.total}
              sub="Tüm kayıtlar"
              icon={Squares2X2Icon}
              tone="blue"
            />
            <StatCard
              title="Teklif Şablonu"
              value={stats.quotes}
              sub="QUOTE tipindekiler"
              icon={DocumentTextIcon}
              tone="emerald"
            />
            <StatCard
              title="Bilgi / Form"
              value={stats.notes}
              sub="Not ve mutabakat şablonları"
              icon={ArchiveBoxIcon}
              tone="amber"
            />
            <StatCard
              title="Özel Şablon"
              value={stats.custom}
              sub="CUSTOM tipindekiler"
              icon={TagIcon}
              tone="slate"
            />
          </div>
        </section>

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
                    ? "Henüz şablon yok. Yeni şablon ekleyin."
                    : "Aramanıza uygun şablon bulunamadı."}
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
                        router.push(`/business/settings/proposal-templates/${row.id}`)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/business/settings/proposal-templates/${row.id}`);
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
                          Şablon detaylarını açmak için tıklayın
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${kindBadgeClass(
                            row.kind
                          )}`}
                        >
                          {kindLabelTr(row.kind)}
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

      {newOpen ? (
        <ModalShell
          title="Yeni Şablon"
          onClose={() => setNewOpen(false)}
          footer={
            <div className="flex justify-end">
              <button
                type="submit"
                form="new-template-form"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4" />
                Oluştur
              </button>
            </div>
          }
        >
          <form id="new-template-form" onSubmit={submitNew} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Şablon adı
              </label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-teal-500/30"
                placeholder="Örn. Teklif Formu"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Şablon tipi
              </label>
              <select
                value={newKind}
                onChange={(e) => setNewKind(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-teal-500/30"
              >
                {KIND_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {copyOpen ? (
        <ModalShell
          title="Şablon Kopyalama"
          onClose={() => setCopyOpen(false)}
          footer={
            <div className="flex justify-end">
              <button
                type="submit"
                form="copy-template-form"
                disabled={copying}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4" />
                Şablon Oluştur
              </button>
            </div>
          }
        >
          <form id="copy-template-form" onSubmit={submitCopy} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Kopyalanacak Şablon
              </label>
              <select
                value={copySourceId}
                onChange={(e) => setCopySourceId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-teal-500/30"
              >
                {items.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Yeni Şablon Adı
              </label>
              <input
                value={copyName}
                onChange={(e) => setCopyName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-teal-500/30"
                placeholder="Şablon adı"
                autoFocus
              />
            </div>
          </form>
        </ModalShell>
      ) : null}
    </div>
  );
}