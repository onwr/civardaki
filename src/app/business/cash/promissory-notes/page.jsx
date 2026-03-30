"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CreditCardIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

const TABS = [
  { id: "all", label: "Tümü" },
  { id: "overdue", label: "Vadesi Geçenler" },
  { id: "portfolio", label: "Portföydekiler" },
  { id: "supplier", label: "Tedarikçiye Verilenler" },
  { id: "bank", label: "Bankaya Verilenler" },
  { id: "paid", label: "Tam Ödenmişler" },
  { id: "partial", label: "Kısmi Ödenmişler" },
  { id: "cancelled", label: "İptaller" },
];

const STATUS_OPTIONS = [
  { value: "IN_PORTFOLIO", label: "Portföyde" },
  { value: "OVERDUE", label: "Vadesi Geçti" },
  { value: "GIVEN_TO_SUPPLIER", label: "Tedarikçiye Verildi" },
  { value: "GIVEN_TO_BANK", label: "Bankaya Verildi" },
  { value: "PAID", label: "Tam Ödendi" },
  { value: "PARTIAL_PAID", label: "Kısmi Ödendi" },
  { value: "CANCELLED", label: "İptal" },
];

const emptyForm = () => ({
  direction: "RECEIVED",
  status: "IN_PORTFOLIO",
  noteNumber: "",
  amount: "",
  paidAmount: "",
  issueDate: "",
  dueDate: "",
  drawerName: "",
  payeeName: "",
  notes: "",
});

function statusLabel(v) {
  return STATUS_OPTIONS.find((s) => s.value === v)?.label || v;
}

function tabLabel(v) {
  return TABS.find((t) => t.id === v)?.label || v;
}

function formatTry(n) {
  return `₺${Number(n || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusPillClass(status) {
  if (status === "PAID") return "bg-emerald-100 text-emerald-800";
  if (status === "PARTIAL_PAID") return "bg-amber-100 text-amber-900";
  if (status === "OVERDUE") return "bg-red-100 text-red-800";
  if (status === "GIVEN_TO_BANK") return "bg-blue-100 text-blue-800";
  if (status === "GIVEN_TO_SUPPLIER") return "bg-violet-100 text-violet-800";
  if (status === "CANCELLED") return "bg-slate-200 text-slate-700";
  return "bg-slate-100 text-slate-700";
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

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-16 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-5 w-24 rounded-full bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 text-right md:px-5">
            <div className="ml-auto h-4 w-24 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 text-right md:px-5">
            <div className="ml-auto h-4 w-24 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function PromissoryNotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [tab, setTab] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQ, setSearchQ] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput.length === 0 || searchInput.length >= 3) {
        setSearchQ(searchInput.trim());
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    try {
      const params = new URLSearchParams({ tab });
      if (searchQ.length >= 3) params.set("q", searchQ);

      const res = await fetch(`/api/business/cash/promissory-notes?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Liste yüklenemedi");

      setNotes(data.notes || []);
    } catch (e) {
      console.error(e);
      setApiError(e.message);
      toast.error("Senetler yüklenemedi.");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [tab, searchQ]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const summary = useMemo(() => {
    const total = notes.reduce((s, n) => s + Number(n.amount || 0), 0);
    const paid = notes.reduce((s, n) => s + Number(n.paidAmount || 0), 0);
    const remaining = total - paid;

    return {
      count: notes.length,
      total,
      paid,
      remaining,
    };
  }, [notes]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      direction: row.direction || "RECEIVED",
      status: row.status || "IN_PORTFOLIO",
      noteNumber: row.noteNumber || "",
      amount: row.amount != null ? String(row.amount) : "",
      paidAmount: row.paidAmount != null ? String(row.paidAmount) : "",
      issueDate: row.issueDate
        ? new Date(row.issueDate).toISOString().slice(0, 10)
        : "",
      dueDate: row.dueDate
        ? new Date(row.dueDate).toISOString().slice(0, 10)
        : "",
      drawerName: row.drawerName || "",
      payeeName: row.payeeName || "",
      notes: row.notes || "",
    });
    setModalOpen(true);
  };

  const submitModal = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        direction: form.direction,
        status: form.status,
        noteNumber: form.noteNumber.trim() || null,
        amount: form.amount === "" ? null : form.amount,
        paidAmount: form.paidAmount === "" ? null : form.paidAmount,
        issueDate: form.issueDate || null,
        dueDate: form.dueDate || null,
        drawerName: form.drawerName.trim() || null,
        payeeName: form.payeeName.trim() || null,
        notes: form.notes.trim() || null,
      };

      const url = editingId
        ? `/api/business/cash/promissory-notes/${editingId}`
        : "/api/business/cash/promissory-notes";

      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "İşlem başarısız");

      toast.success(editingId ? "Senet güncellendi." : "Senet kaydedildi.");
      setModalOpen(false);
      fetchList();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (row) => {
    if (!confirm(`“${row.noteNumber || "Senet"}” kaydı silinsin mi?`)) return;

    try {
      const res = await fetch(`/api/business/cash/promissory-notes/${row.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Silme başarısız");

      toast.success("Senet silindi.");
      fetchList();
    } catch (err) {
      toast.error(err.message);
    }
  };

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
              <DocumentTextIcon className="h-4 w-4" />
              Senet Yönetimi
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
              Senetler
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Alınan ve verilen senetlerinizi yönetin, ödeme durumlarını takip edin
              ve kalan tutarları tek ekranda görüntüleyin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ActionButton onClick={openNew} icon={PlusIcon} tone="green">
              Yeni Senet Ekle
            </ActionButton>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Toplam Kayıt"
          value={String(summary.count)}
          sub="Listelenen senet sayısı"
          icon={DocumentTextIcon}
          tone="blue"
        />
        <StatCard
          title="Toplam Tutar"
          value={formatTry(summary.total)}
          sub="Tüm senet toplamı"
          icon={BanknotesIcon}
          tone="emerald"
        />
        <StatCard
          title="Ödenen"
          value={formatTry(summary.paid)}
          sub="Toplam tahsil / ödeme"
          icon={CreditCardIcon}
          tone="amber"
        />
        <StatCard
          title="Kalan"
          value={formatTry(summary.remaining)}
          sub="Açık bakiye toplamı"
          icon={ClockIcon}
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
              Filtreler
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Senetleri sekmelere göre ayırın, numara veya isim ile arama yapın.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    tab === t.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="arama... (en az 3 karakter)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

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

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Senet Listesi</h3>
            <p className="mt-1 text-sm text-slate-500">
              Seçili filtreye göre listelenen senet kayıtları
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
              Sekme: {tabLabel(tab)}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
              Kayıt: {notes.length}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
              Kalan: {formatTry(summary.remaining)}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-900 text-white">
                  <th className="px-4 py-3 font-semibold md:px-5">Senet No</th>
                  <th className="px-4 py-3 font-semibold md:px-5">Yön</th>
                  <th className="px-4 py-3 font-semibold md:px-5">Durum</th>
                  <th className="px-4 py-3 font-semibold md:px-5">Keşideci / Lehtar</th>
                  <th className="px-4 py-3 font-semibold md:px-5">Vade</th>
                  <th className="px-4 py-3 text-right font-semibold md:px-5">Tutar</th>
                  <th className="px-4 py-3 text-right font-semibold md:px-5">Ödenen</th>
                  <th className="w-24 px-4 py-3 font-semibold md:px-5">İşlem</th>
                </tr>
              </thead>
              <tbody>
                <TableSkeleton />
              </tbody>
            </table>
          </div>
        ) : notes.length === 0 ? (
          <div className="px-4 py-14 text-center md:px-5">
            <div className="mx-auto max-w-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CreditCardIcon className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-base font-bold text-slate-900">
                Kayıt bulunamadı
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Seçtiğiniz kriterlere uygun senet bulunmuyor.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-900 text-white">
                  <th className="px-4 py-3 font-semibold md:px-5">Senet No</th>
                  <th className="px-4 py-3 font-semibold md:px-5">Yön</th>
                  <th className="px-4 py-3 font-semibold md:px-5">Durum</th>
                  <th className="px-4 py-3 font-semibold md:px-5">Keşideci / Lehtar</th>
                  <th className="px-4 py-3 font-semibold md:px-5">Vade</th>
                  <th className="px-4 py-3 text-right font-semibold md:px-5">Tutar</th>
                  <th className="px-4 py-3 text-right font-semibold md:px-5">Ödenen</th>
                  <th className="w-24 px-4 py-3 font-semibold md:px-5">İşlem</th>
                </tr>
              </thead>

              <tbody>
                {notes.map((r, index) => (
                  <tr
                    key={r.id}
                    className={`border-b border-slate-100 transition hover:bg-sky-50/70 ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    }`}
                  >
                    <td className="px-4 py-3.5 font-medium text-slate-900 md:px-5">
                      {r.noteNumber || "—"}
                    </td>

                    <td className="px-4 py-3.5 md:px-5">
                      {r.direction === "RECEIVED" ? "Alınan" : "Verilen"}
                    </td>

                    <td className="px-4 py-3.5 md:px-5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusPillClass(
                          r.status
                        )}`}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 md:px-5">
                      {r.drawerName || r.payeeName || "—"}
                    </td>

                    <td className="px-4 py-3.5 md:px-5">
                      {r.dueDate
                        ? new Date(r.dueDate).toLocaleDateString("tr-TR")
                        : "—"}
                    </td>

                    <td className="px-4 py-3.5 text-right tabular-nums font-semibold md:px-5">
                      {formatTry(r.amount)}
                    </td>

                    <td className="px-4 py-3.5 text-right tabular-nums font-semibold md:px-5">
                      {formatTry(r.paidAmount)}
                    </td>

                    <td className="px-4 py-3.5 md:px-5">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                          title="Düzenle"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteNote(r)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Sil"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !saving && setModalOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                    Senet Tanımı
                  </p>
                  <h3 className="mt-1 text-lg font-bold">
                    {editingId ? "Senedi Düzenle" : "Yeni Senet"}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => !saving && setModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
                  disabled={saving}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={submitModal} className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Yön</label>
                  <select
                    value={form.direction}
                    onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value }))}
                    className={inp}
                  >
                    <option value="RECEIVED">Alınan</option>
                    <option value="ISSUED">Verilen</option>
                  </select>
                </div>

                <div>
                  <label className={label}>Durum</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className={inp}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Senet Numarası</label>
                  <input
                    value={form.noteNumber}
                    onChange={(e) => setForm((f) => ({ ...f, noteNumber: e.target.value }))}
                    placeholder="Senet numarası"
                    className={inp}
                  />
                </div>

                <div>
                  <label className={label}>Toplam Tutar</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="Toplam tutar"
                    className={inp}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Ödenen Tutar</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.paidAmount}
                    onChange={(e) => setForm((f) => ({ ...f, paidAmount: e.target.value }))}
                    placeholder="Ödenen tutar"
                    className={inp}
                  />
                </div>

                <div>
                  <label className={label}>Düzenlenme Tarihi</label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
                    className={inp}
                  />
                </div>
              </div>

              <div>
                <label className={label}>Vade Tarihi</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className={inp}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Keşideci</label>
                  <input
                    value={form.drawerName}
                    onChange={(e) => setForm((f) => ({ ...f, drawerName: e.target.value }))}
                    placeholder="Keşideci"
                    className={inp}
                  />
                </div>

                <div>
                  <label className={label}>Lehtar</label>
                  <input
                    value={form.payeeName}
                    onChange={(e) => setForm((f) => ({ ...f, payeeName: e.target.value }))}
                    placeholder="Lehtar"
                    className={inp}
                  />
                </div>
              </div>

              <div>
                <label className={label}>Not</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Not"
                  className={inp}
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => !saving && setModalOpen(false)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Vazgeç
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" />
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