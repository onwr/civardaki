"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  BanknotesIcon,
  TagIcon,
  ShoppingBagIcon,
  MinusCircleIcon,
  PencilSquareIcon,
  ArrowDownCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  FolderIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

function formatTry(n) {
  return `₺${Number(n || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function StatCard({ title, value, icon: Icon, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-5 text-white shadow-md ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold opacity-90">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="rounded-xl bg-white/20 p-3">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function CollapseSection({ title, open, onToggle, children, empty, emptyText }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-slate-900 px-4 py-3 text-left text-white"
      >
        <span className="text-xs font-bold uppercase tracking-wide">{title}</span>
        <ChevronDownIcon className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="p-4">
          {empty ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50/90 px-4 py-3 text-sm text-slate-700">
              {emptyText}
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [secExp, setSecExp] = useState(true);
  const [secPur, setSecPur] = useState(true);
  const [secSal, setSecSal] = useState(true);
  const [secCari, setSecCari] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/business/cash/projects/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Yüklenemedi");
      setData(json);
    } catch (e) {
      console.error(e);
      toast.error("Proje bulunamadı veya yüklenemedi.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = () => {
    if (!data?.project) return;
    setFormName(data.project.name);
    setFormDesc(data.project.description || "");
    setEditOpen(true);
  };

  const openNotes = () => {
    if (!data?.project) return;
    setFormNotes(data.project.notes || "");
    setNotesOpen(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Proje adı gerekli.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/business/cash/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          description: formDesc.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error);
      toast.success("Proje güncellendi.");
      setEditOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/business/cash/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: formNotes.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error);
      toast.success("Notlar kaydedildi.");
      setNotesOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const closeProject = async () => {
    if (!data?.project) return;
    if (!confirm(`“${data.project.name}” projesini kapatmak (pasife almak) istiyor musunuz?`)) return;
    try {
      const res = await fetch(`/api/business/cash/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error);
      toast.success("Proje kapatıldı.");
      router.push("/business/cash/projects");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteProject = async () => {
    if (!data?.project) return;
    if (
      !confirm(
        `“${data.project.name}” silinecek. Alt projeler ve bağlantılar kaldırılır. Emin misiniz?`
      )
    )
      return;
    try {
      const res = await fetch(`/api/business/cash/projects/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error);
      toast.success("Proje silindi.");
      router.push("/business/cash/projects");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const docsSoon = () => toast.message("Döküman yükleme çok yakında.");

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Yükleniyor…
      </div>
    );
  }

  if (!data?.project) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-slate-600">Proje bulunamadı.</p>
        <Link href="/business/cash/projects" className="text-blue-600 underline">
          Projeler listesine dön
        </Link>
      </div>
    );
  }

  const { project, summary, expenses, purchases, sales, cariMovements } = data;

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 bg-slate-100/80 pb-12 text-[13px] text-slate-800">
      <div className="rounded-none bg-blue-600 px-6 py-4 text-white shadow md:rounded-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <h1 className="text-xl font-bold uppercase tracking-wide md:text-2xl">{project.name}</h1>
          <Link
            href="/business/cash/projects"
            className="shrink-0 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25"
          >
            ← Projeler
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Masraflar"
          value={formatTry(summary.expensesTotal)}
          icon={BanknotesIcon}
          className="bg-gradient-to-br from-rose-400 to-red-500"
        />
        <StatCard
          title="Alışlar"
          value={formatTry(summary.purchasesTotal)}
          icon={TagIcon}
          className="bg-gradient-to-br from-sky-400 to-blue-500"
        />
        <StatCard
          title="Satışlar"
          value={formatTry(summary.salesTotal)}
          icon={ShoppingBagIcon}
          className="bg-gradient-to-br from-teal-400 to-emerald-600"
        />
        <StatCard
          title="Ödemeler"
          value={formatTry(summary.paymentsTotal)}
          icon={MinusCircleIcon}
          className="bg-gradient-to-br from-indigo-500 to-slate-700"
        />
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap gap-2">
        <button
          type="button"
          onClick={openEdit}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-100 px-3 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-200"
        >
          <PencilSquareIcon className="h-4 w-4" />
          Güncelle
        </button>
        <button
          type="button"
          onClick={closeProject}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          <ArrowDownCircleIcon className="h-4 w-4" />
          Projeyi Kapat
        </button>
        <button
          type="button"
          onClick={deleteProject}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          <XCircleIcon className="h-4 w-4" />
          Projeyi Sil
        </button>
        <button
          type="button"
          onClick={openNotes}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900"
        >
          <DocumentTextIcon className="h-4 w-4" />
          Notlar
        </button>
        <button
          type="button"
          onClick={docsSoon}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <FolderIcon className="h-4 w-4" />
          Dökümanlar
        </button>
      </div>

      {project.status === "ARCHIVED" ? (
        <div className="mx-auto max-w-6xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Bu proje pasif (arşivlenmiş).
        </div>
      ) : null}

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2">
        <CollapseSection
          title="Önceki Masraflar"
          open={secExp}
          onToggle={() => setSecExp((v) => !v)}
          empty={!expenses?.length}
          emptyText="Bu proje için hiç masraf yapılmamış."
        >
          <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
            {expenses.map((r) => (
              <li key={r.id} className="flex justify-between gap-2 border-b border-slate-100 py-1">
                <span className="text-slate-600">
                  {new Date(r.date).toLocaleDateString("tr-TR")} — {r.category}
                </span>
                <span className="font-semibold tabular-nums">{formatTry(r.amount)}</span>
              </li>
            ))}
          </ul>
        </CollapseSection>

        <CollapseSection
          title="Önceki Alışlar"
          open={secPur}
          onToggle={() => setSecPur((v) => !v)}
          empty={!purchases?.length}
          emptyText="Bu proje için hiç alış yapılmamış."
        >
          <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
            {purchases.map((r) => (
              <li key={r.id} className="flex justify-between gap-2 border-b border-slate-100 py-1">
                <span className="text-slate-600">
                  {new Date(r.purchaseDate).toLocaleDateString("tr-TR")} — {r.supplierName || "—"}
                </span>
                <span className="font-semibold tabular-nums">{formatTry(r.totalAmount)}</span>
              </li>
            ))}
          </ul>
        </CollapseSection>

        <CollapseSection
          title="Önceki Satışlar"
          open={secSal}
          onToggle={() => setSecSal((v) => !v)}
          empty={!sales?.length}
          emptyText="Bu proje kapsamında hiç satış işlemi kaydedilmemiş."
        >
          <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
            {sales.map((r) => (
              <li key={r.id} className="flex justify-between gap-2 border-b border-slate-100 py-1">
                <span className="text-slate-600">
                  {new Date(r.saleDate).toLocaleDateString("tr-TR")} — {r.customerName || "—"}
                </span>
                <span className="font-semibold tabular-nums">{formatTry(r.totalAmount)}</span>
              </li>
            ))}
          </ul>
        </CollapseSection>

        <CollapseSection
          title="Önceki Cari Hareketler"
          open={secCari}
          onToggle={() => setSecCari((v) => !v)}
          empty={!cariMovements?.length}
          emptyText="Bu proje için hiç cari hareket yapılmamış."
        >
          <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
            {cariMovements.map((r) => (
              <li key={r.id} className="flex justify-between gap-2 border-b border-slate-100 py-1">
                <span className="text-slate-600">
                  {new Date(r.date).toLocaleDateString("tr-TR")} — {r.type} / {r.category}
                </span>
                <span className="font-semibold tabular-nums">{formatTry(r.amount)}</span>
              </li>
            ))}
          </ul>
        </CollapseSection>
      </div>

      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !saving && setEditOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900">Projeyi Güncelle</h3>
            <form onSubmit={saveEdit} className="mt-4 space-y-3">
              <input
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Proje adı"
              />
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Açıklama"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  disabled={saving}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  <CheckIcon className="h-4 w-4" />
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notesOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !saving && setNotesOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Proje Notları</h3>
              <button type="button" onClick={() => setNotesOpen(false)} className="rounded p-1 hover:bg-slate-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveNotes} className="mt-4 space-y-3">
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Bu proje ile ilgili notlarınız…"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNotesOpen(false)}
                  disabled={saving}
                  className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                >
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
