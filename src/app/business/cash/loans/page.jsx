"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  PlusIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

const TABS = [
  { id: "active", label: "Aktif Krediler" },
  { id: "closed", label: "Kapatılmış" },
  { id: "all", label: "Tümü" },
];

const DATE_RANGES = [
  { id: "all", label: "Tüm tarihler" },
  { id: "week", label: "Son 1 Hafta (taksit)" },
  { id: "month", label: "Son 1 Ay (taksit)" },
  { id: "3months", label: "Son 3 Ay (taksit)" },
  { id: "year", label: "Bu Yıl (taksit)" },
];

const SCHEDULE_OPTIONS = [
  { value: "MONTHLY", label: "Her Ay" },
  { value: "WEEKLY", label: "Her Hafta" },
  { value: "BIWEEKLY", label: "2 Haftada Bir" },
  { value: "QUARTERLY", label: "Her 3 Ay" },
  { value: "YEARLY", label: "Her Yıl" },
];

function scheduleLabel(v) {
  return SCHEDULE_OPTIONS.find((o) => o.value === v)?.label || v;
}

function formatTry(n) {
  return `₺${Number(n || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">{title}</p>
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

function ActionButton({ children, onClick, icon: Icon, tone = "white", className = "" }) {
  const tones = {
    green: "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    white: "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
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

const emptyForm = () => ({
  name: "",
  remainingDebt: "",
  remainingInstallments: "",
  nextInstallmentDate: new Date().toISOString().slice(0, 10),
  paymentSchedule: "MONTHLY",
  cashAccountId: "",
  notes: "",
  isClosed: false,
});

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [tab, setTab] = useState("active");
  const [range, setRange] = useState("all");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQ, setSearchQ] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const rangeRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rangeRef.current && !rangeRef.current.contains(e.target)) setRangeOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput.length === 0 || searchInput.length >= 3) setSearchQ(searchInput.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/business/cash/accounts");
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setAccounts(data);
          setForm((f) => ({ ...f, cashAccountId: f.cashAccountId || data[0]?.id || "" }));
        }
      } catch (_) {
        /* ignore */
      }
    })();
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams({ tab, range });
      if (searchQ.length >= 3) params.set("q", searchQ);
      const res = await fetch(`/api/business/loans?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Liste yüklenemedi");
      setLoans(data.loans || []);
    } catch (e) {
      console.error(e);
      setApiError(e.message);
      toast.error("Krediler yüklenemedi.");
      setLoans([]);
    } finally {
      setLoading(false);
    }
  }, [tab, range, searchQ]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const rangeLabel = DATE_RANGES.find((r) => r.id === range)?.label || "Tüm tarihler";

  const summary = useMemo(() => {
    const active = loans.filter((l) => !l.isClosed);
    const totalDebt = active.reduce((s, l) => s + Number(l.remainingDebt || 0), 0);
    const totalInst = active.reduce((s, l) => s + (l.remainingInstallments || 0), 0);
    const approx = totalInst > 0 ? totalDebt / totalInst : 0;
    return {
      totalDebt,
      count: active.length,
      totalInst,
      approxInstallment: approx,
    };
  }, [loans]);

  const openNew = () => {
    setEditingId(null);
    setForm({
      ...emptyForm(),
      cashAccountId: accounts[0]?.id || "",
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      name: row.name,
      remainingDebt: String(row.remainingDebt),
      remainingInstallments: String(row.remainingInstallments),
      nextInstallmentDate: row.nextInstallmentDate
        ? new Date(row.nextInstallmentDate).toISOString().slice(0, 10)
        : "",
      paymentSchedule: row.paymentSchedule || "MONTHLY",
      cashAccountId: row.cashAccountId,
      notes: row.notes || "",
      isClosed: !!row.isClosed,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) setModalOpen(false);
  };

  const submitModal = async (e) => {
    e.preventDefault();
    const inst = parseInt(form.remainingInstallments, 10);
    if (Number.isNaN(inst) || inst < 1 || inst > 144) {
      toast.error("Kalan taksit 1 ile 144 arasında olmalıdır.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        remainingDebt: parseFloat(form.remainingDebt),
        remainingInstallments: inst,
        nextInstallmentDate: form.nextInstallmentDate,
        paymentSchedule: form.paymentSchedule,
        cashAccountId: form.cashAccountId,
        notes: form.notes.trim() || null,
      };
      if (editingId) payload.isClosed = !!form.isClosed;
      const url = editingId ? `/api/business/loans/${editingId}` : "/api/business/loans";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "İşlem başarısız");
      toast.success(editingId ? "Kredi güncellendi." : "Kredi kaydedildi.");
      setModalOpen(false);
      fetchList();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteLoan = async (row) => {
    if (!confirm(`“${row.name}” kredisini silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/business/loans/${row.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      toast.success("Kredi silindi.");
      fetchList();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const hasRows = loans.length > 0;
  const showWideEmpty =
    !loading && !hasRows && !searchQ && range === "all" && tab === "active";
  const showFilterEmpty =
    !loading && !hasRows && (searchQ.length >= 3 || range !== "all" || tab !== "active");

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 text-[13px] text-slate-700">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <BuildingLibraryIcon className="h-4 w-4" />
              Nakit Yönetimi
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">Krediler</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Banka kredileri ve ödeme planlarınızı takip edin. Ödeme tarihlerine göre filtreleyin,
              kalan borç ve taksitleri tek ekranda görün.
            </p>
          </div>
          <ActionButton onClick={openNew} icon={PlusIcon} tone="green">
            Yeni Kredi Ekle
          </ActionButton>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Toplam Kalan Borç (aktif)"
          value={formatTry(summary.totalDebt)}
          sub={`${summary.count} aktif kayıt`}
          icon={BanknotesIcon}
          tone="blue"
        />
        <StatCard
          title="Aktif Kredi"
          value={String(summary.count)}
          sub="Filtreye göre listelenen"
          icon={BuildingLibraryIcon}
          tone="emerald"
        />
        <StatCard
          title="Kalan Taksit (toplam)"
          value={String(summary.totalInst)}
          sub="Aktif krediler"
          icon={CalendarDaysIcon}
          tone="amber"
        />
        <StatCard
          title="Tahmini Taksit"
          value={formatTry(summary.approxInstallment)}
          sub="Borç / taksit (ortalama)"
          icon={BanknotesIcon}
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

      {showFilterEmpty && (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-slate-700">
          Eşleşen kredi kaydı bulunamadı. Filtre veya aramayı değiştirip yenileyin.
        </div>
      )}

      {showWideEmpty && (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-5 text-sm text-slate-800 shadow-sm">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-lg font-bold text-white">
              !
            </div>
            <div>
              <p className="font-semibold text-slate-900">Hiç kredi kaydınız bulunmuyor.</p>
              <p className="mt-2 leading-relaxed text-slate-700">
                Banka kredilerinizi, vergi borcu yapılandırmalarınızı ve ödeme planını girin; size hem
                ödemelerinizi hatırlatırız, hem de kalan kredi tutarlarını kolayca takip edersiniz.
              </p>
              <p className="mt-3 text-slate-700">
                Yukarıdaki{" "}
                <button
                  type="button"
                  onClick={openNew}
                  className="inline-flex items-center rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white"
                >
                  + Yeni Kredi Ekle
                </button>{" "}
                düğmesini kullanarak kredilerinizi ve ödeme takvimini kaydedebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Filtreler</h2>
            <p className="mt-2 text-sm text-slate-500">
              Kredileri durum, sonraki taksit tarihi aralığı ve arama ile daraltın.
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
                    tab === t.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative" ref={rangeRef}>
              <button
                type="button"
                onClick={() => setRangeOpen((o) => !o)}
                className="inline-flex min-w-[200px] items-center justify-between gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
              >
                <span>{rangeLabel}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              {rangeOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                  {DATE_RANGES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`block w-full px-4 py-3 text-left text-sm hover:bg-slate-50 ${
                        range === r.id ? "bg-slate-50 font-semibold" : ""
                      }`}
                      onClick={() => {
                        setRange(r.id);
                        setRangeOpen(false);
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
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
            <ActionButton onClick={fetchList} icon={ArrowPathIcon} tone="white" className="rounded-xl px-3 py-2.5">
              Yenile
            </ActionButton>
          </div>
        </div>
      </section>

      {(hasRows || loading) && (
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-200 px-4 py-4 md:px-5">
            <h3 className="text-base font-bold text-slate-900">Kredi Listesi</h3>
            <p className="mt-1 text-sm text-slate-500">{loading ? "…" : `${loans.length} kayıt`}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-4 py-3 font-semibold md:px-5">Kredi Adı</th>
                  <th className="px-4 py-3 font-semibold md:px-5 text-right">Kalan Borç</th>
                  <th className="px-4 py-3 font-semibold md:px-5">Kalan Taksit</th>
                  <th className="px-4 py-3 font-semibold md:px-5">Sonraki Taksit</th>
                  <th className="px-4 py-3 font-semibold md:px-5">Ödeme Takvimi</th>
                  <th className="px-4 py-3 font-semibold md:px-5">Hesap</th>
                  <th className="px-4 py-3 font-semibold md:px-5">Durum</th>
                  <th className="px-4 py-3 font-semibold md:px-5 w-24">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      Yükleniyor…
                    </td>
                  </tr>
                ) : (
                  loans.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium text-slate-900 md:px-5">{row.name}</td>
                      <td className="px-4 py-3 text-right tabular-nums md:px-5">
                        {formatTry(row.remainingDebt)}
                      </td>
                      <td className="px-4 py-3 md:px-5">{row.remainingInstallments}</td>
                      <td className="px-4 py-3 md:px-5">
                        {row.nextInstallmentDate
                          ? new Date(row.nextInstallmentDate).toLocaleDateString("tr-TR")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 md:px-5">{scheduleLabel(row.paymentSchedule)}</td>
                      <td className="px-4 py-3 md:px-5">{row.accountName || "—"}</td>
                      <td className="px-4 py-3 md:px-5">
                        {row.isClosed ? (
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                            Kapatıldı
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                            Aktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 md:px-5">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                            title="Düzenle"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteLoan(row)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            title="Sil"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-teal-500 px-5 py-4 text-white">
              <h3 className="text-lg font-bold">Kredi Tanımı</h3>
              <button type="button" onClick={closeModal} className="rounded-lg p-1 hover:bg-white/20" disabled={saving}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={submitModal} className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <label className="w-40 shrink-0 text-right text-sm font-medium text-slate-700">Kredi Adı</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="w-40 shrink-0 text-right text-sm font-medium text-slate-700">
                  Kalan Borç Tutarı
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.remainingDebt}
                  onChange={(e) => setForm((f) => ({ ...f, remainingDebt: e.target.value }))}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
                <label className="w-40 shrink-0 pt-2 text-right text-sm font-medium text-slate-700 sm:pt-2">
                  Kalan Taksit Sayısı
                </label>
                <div className="flex-1">
                  <input
                    required
                    type="number"
                    min="1"
                    max="144"
                    value={form.remainingInstallments}
                    onChange={(e) => setForm((f) => ({ ...f, remainingInstallments: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-red-600">Maksimum 144 taksit girebilirsiniz</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-40 shrink-0 text-right text-sm font-medium text-slate-700">
                  Sıradaki İlk Taksit Tarihi
                </label>
                <input
                  required
                  type="date"
                  value={form.nextInstallmentDate}
                  onChange={(e) => setForm((f) => ({ ...f, nextInstallmentDate: e.target.value }))}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="w-40 shrink-0 text-right text-sm font-medium text-slate-700">
                  Ödeme Takvimi
                </label>
                <select
                  value={form.paymentSchedule}
                  onChange={(e) => setForm((f) => ({ ...f, paymentSchedule: e.target.value }))}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {SCHEDULE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-40 shrink-0 text-right text-sm font-medium text-slate-700">
                  Ödediğiniz Hesap
                </label>
                <select
                  required
                  value={form.cashAccountId}
                  onChange={(e) => setForm((f) => ({ ...f, cashAccountId: e.target.value }))}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Hesap seçin</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-start gap-3">
                <label className="w-40 shrink-0 pt-2 text-right text-sm font-medium text-slate-700">Notlar</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              {editingId && (
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={!!form.isClosed}
                    onChange={(e) => setForm((f) => ({ ...f, isClosed: e.target.checked }))}
                    className="rounded border-slate-300"
                  />
                  Krediyi kapatılmış olarak işaretle
                </label>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
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
