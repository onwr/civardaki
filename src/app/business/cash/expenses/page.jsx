"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  PlusIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

const TABS = [
  { id: "paid", label: "Ödenmişler" },
  { id: "pending", label: "Ödenecekler" },
  { id: "overdue", label: "Gecikmişler" },
  { id: "all", label: "Tümü" },
];

const DATE_RANGES = [
  { id: "week", label: "Son 1 Hafta" },
  { id: "month", label: "Son 1 Ay" },
  { id: "3months", label: "Son 3 Ay" },
  { id: "year", label: "Bu Yıl" },
];

function paymentLabel(status) {
  if (status === "PENDING") return "Bekliyor";
  return "Ödendi";
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

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
            <div className="mt-2 h-3 w-20 rounded bg-slate-100 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 text-right md:px-5">
            <div className="ml-auto h-4 w-20 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-5 w-20 rounded-full bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-5 w-20 rounded-full bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-6 rounded bg-slate-200 animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [tab, setTab] = useState("paid");
  const [range, setRange] = useState("3months");
  const [rangeOpen, setRangeOpen] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchQ, setSearchQ] = useState("");

  const rangeRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rangeRef.current && !rangeRef.current.contains(e.target)) {
        setRangeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      const params = new URLSearchParams({ tab, range });
      if (searchQ.trim().length >= 3) params.set("q", searchQ.trim());

      const res = await fetch(`/api/business/expenses?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Masraflar yüklenemedi.");

      setExpenses(data.expenses || []);
    } catch (e) {
      console.error(e);
      setApiError(e.message || "Masraflar yüklenemedi.");
      toast.error("Masraflar yüklenemedi.");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [tab, range, searchQ]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const rangeLabel =
    DATE_RANGES.find((r) => r.id === range)?.label || "Son 3 Ay";

  const summary = useMemo(() => {
    return expenses.reduce(
      (acc, row) => {
        const amount = Number(row.amount) || 0;
        acc.total += amount;

        if (row.paymentStatus === "PAID") {
          acc.paid += amount;
          acc.paidCount += 1;
        } else {
          acc.pending += amount;
          acc.pendingCount += 1;

          const isOverdue =
            row.dueDate &&
            new Date(row.dueDate) <
              new Date(new Date().setHours(0, 0, 0, 0));

          if (isOverdue) {
            acc.overdue += amount;
            acc.overdueCount += 1;
          }
        }

        return acc;
      },
      {
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        paidCount: 0,
        pendingCount: 0,
        overdueCount: 0,
      }
    );
  }, [expenses]);

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 text-[13px] text-slate-700">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <DocumentTextIcon className="h-4 w-4" />
              Masraf Yönetimi
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
              Masraflar
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Masraflarınızı tarih, durum ve arama filtreleri ile yönetin.
              Ödenmiş, bekleyen ve gecikmiş kayıtları tek ekranda izleyin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/business/cash/expenses/yeni"
              className="inline-flex items-center gap-2 rounded-xl border border-rose-700 bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              <PlusIcon className="h-4 w-4" />
              Yeni Masraf Gir
            </Link>

            <Link
              href="/business/cash/expenses/kalemler"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <PlusIcon className="h-4 w-4" />
              Masraf Kalemleri
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Toplam Masraf"
          value={formatTry(summary.total)}
          sub="Filtreye göre listelenen toplam tutar"
          icon={BanknotesIcon}
          tone="blue"
        />
        <StatCard
          title="Ödenmiş"
          value={String(summary.paidCount)}
          sub={formatTry(summary.paid)}
          icon={CheckCircleIcon}
          tone="emerald"
        />
        <StatCard
          title="Bekleyen"
          value={String(summary.pendingCount)}
          sub={formatTry(summary.pending)}
          icon={ClockIcon}
          tone="amber"
        />
        <StatCard
          title="Gecikmiş"
          value={String(summary.overdueCount)}
          sub={formatTry(summary.overdue)}
          icon={ExclamationTriangleIcon}
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

      {expenses.length === 0 && !loading && !apiError && (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-slate-700 shadow-sm">
          Eşleşen masraf kaydı bulunamadı.
        </div>
      )}

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              Filtreler
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Masrafları durum, tarih aralığı ve arama ile filtreleyin.
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

            <div className="relative" ref={rangeRef}>
              <button
                type="button"
                onClick={() => setRangeOpen((o) => !o)}
                className="inline-flex min-w-[170px] items-center justify-between gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
              >
                <span>{rangeLabel}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {rangeOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
                  {DATE_RANGES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`block w-full px-4 py-3 text-left text-sm hover:bg-slate-50 ${
                        range === r.id
                          ? "bg-slate-50 font-semibold text-slate-900"
                          : "text-slate-700"
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
            <h3 className="text-base font-bold text-slate-900">Masraf Listesi</h3>
            <p className="mt-1 text-sm text-slate-500">
              Seçili filtrelere göre listelenen masraflar
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
              Durum: {TABS.find((t) => t.id === tab)?.label}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
              Tarih: {rangeLabel}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
              Kayıt: {expenses.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-900 text-white">
                <th className="px-4 py-3 font-semibold whitespace-nowrap md:px-5">
                  İşlem Tarihi / Vade
                </th>
                <th className="px-4 py-3 font-semibold md:px-5">Proje</th>
                <th className="px-4 py-3 font-semibold md:px-5">Masraf</th>
                <th className="px-4 py-3 font-semibold md:px-5">Hesap</th>
                <th className="px-4 py-3 text-right font-semibold md:px-5">
                  Tutar
                </th>
                <th className="px-4 py-3 font-semibold md:px-5">Ödeme</th>
                <th className="px-4 py-3 font-semibold md:px-5">Durumu</th>
                <th className="px-4 py-3 font-semibold md:px-5">Not</th>
                <th className="px-4 py-3 w-10 md:px-5" />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center md:px-5">
                    <div className="mx-auto max-w-md">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <DocumentTextIcon className="h-6 w-6" />
                      </div>
                      <h4 className="mt-4 text-base font-bold text-slate-900">
                        Kayıt bulunamadı
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Bu filtrelere uygun masraf kaydı bulunmuyor.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((row, index) => {
                  const dateStr = row.date
                    ? new Date(row.date).toLocaleDateString("tr-TR")
                    : "—";

                  const dueStr = row.dueDate
                    ? new Date(row.dueDate).toLocaleDateString("tr-TR")
                    : null;

                  const isOverdue =
                    row.paymentStatus === "PENDING" &&
                    row.dueDate &&
                    new Date(row.dueDate) <
                      new Date(new Date().setHours(0, 0, 0, 0));

                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-100 transition hover:bg-sky-50/70 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }`}
                    >
                      <td className="px-4 py-3.5 align-top text-slate-700 md:px-5">
                        <div>{dateStr}</div>
                        {dueStr ? (
                          <div className="text-xs text-slate-500">
                            Vade: {dueStr}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-4 py-3.5 align-top text-slate-700 md:px-5">
                        {row.projectName || "—"}
                      </td>

                      <td className="px-4 py-3.5 align-top font-medium text-slate-900 md:px-5">
                        {row.category}
                      </td>

                      <td className="px-4 py-3.5 align-top text-slate-700 md:px-5">
                        {row.accountName}
                      </td>

                      <td className="px-4 py-3.5 align-top text-right font-semibold tabular-nums text-slate-800 md:px-5">
                        {formatTry(row.amount)}
                      </td>

                      <td className="px-4 py-3.5 align-top text-slate-700 md:px-5">
                        {paymentLabel(row.paymentStatus)}
                      </td>

                      <td className="px-4 py-3.5 align-top md:px-5">
                        {isOverdue ? (
                          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                            Gecikmiş
                          </span>
                        ) : row.paymentStatus === "PAID" ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            Tamam
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                            Bekliyor
                          </span>
                        )}
                      </td>

                      <td className="max-w-[220px] truncate px-4 py-3.5 align-top text-slate-600 md:px-5">
                        {row.notes || row.description || "—"}
                      </td>

                      <td className="px-4 py-3.5 align-top md:px-5" />
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}