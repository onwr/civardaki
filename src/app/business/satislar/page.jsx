"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  UserPlusIcon,
  UserCircleIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import QuickAddCustomerModal from "@/components/business/QuickAddCustomerModal";
import CustomerSearchModal from "@/components/business/CustomerSearchModal";

const DOCUMENT_TYPES = [
  { value: "ORDER", label: "Sipariş" },
  { value: "WAYBILL", label: "İrsaliye" },
  { value: "INVOICED_EFATURA", label: "E-Faturalaşmış", parent: "Faturalaşmış" },
  { value: "INVOICED_NOT_EFATURA", label: "E-Faturalaşmamış", parent: "Faturalaşmış" },
];

const DATE_RANGES = [
  { value: "1w", label: "Son 1 Hafta" },
  { value: "1m", label: "Son 1 Ay" },
  { value: "3m", label: "Son 3 Ay" },
  { value: "1y", label: "Bu Yıl" },
];

function getDateRange(value) {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const from = new Date(now);
  if (value === "1w") from.setDate(from.getDate() - 7);
  else if (value === "1m") from.setMonth(from.getMonth() - 1);
  else if (value === "3m") from.setMonth(from.getMonth() - 3);
  else if (value === "1y") {
    from.setMonth(0);
    from.setDate(1);
  } else {
    from.setMonth(from.getMonth() - 1);
  }

  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
  };
}

const fmtMoney = (n) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

const fmtTry = (n) => `₺${fmtMoney(n)}`;
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString("tr-TR") : "");

const documentTypeLabel = (v) =>
  DOCUMENT_TYPES.find((d) => d.value === v)?.label || v;

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
  tone = "dark",
  className = "",
}) {
  const tones = {
    green:
      "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    blue: "bg-sky-500 hover:bg-sky-600 border-sky-600 text-white",
    red: "bg-rose-600 hover:bg-rose-700 border-rose-700 text-white",
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
      {Array.from({ length: 7 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 text-right md:px-5">
            <div className="ml-auto h-4 w-20 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 text-right md:px-5">
            <div className="ml-auto h-4 w-20 rounded bg-slate-200 animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function SatislarPage() {
  const router = useRouter();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [documentTypeOpen, setDocumentTypeOpen] = useState(false);
  const [selectedDocTypes, setSelectedDocTypes] = useState([]);

  const [dateRange, setDateRange] = useState("1m");
  const [dateRangeOpen, setDateRangeOpen] = useState(false);

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    try {
      const { dateFrom, dateTo } = getDateRange(dateRange);
      const params = new URLSearchParams();

      params.set("dateFrom", dateFrom);
      params.set("dateTo", dateTo);

      if (selectedDocTypes.length) {
        params.set("documentType", selectedDocTypes.join(","));
      }

      const res = await fetch(`/api/business/sales?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Liste alınamadı");

      setSales(data.sales || []);
    } catch (e) {
      console.error(e);
      setApiError(e.message || "Satış listesi alınamadı");
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedDocTypes]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const toggleDocType = (value) => {
    setSelectedDocTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const selectAllDocTypes = () => {
    setSelectedDocTypes([]);
    setDocumentTypeOpen(false);
  };

  const handleQuickAddContinue = (customer) => {
    setQuickAddOpen(false);

    if (customer?.id) {
      router.push(
        `/business/satislar/musteriye?customerId=${encodeURIComponent(
          customer.id
        )}&customerName=${encodeURIComponent(
          customer.name || ""
        )}&saleKind=TO_NEW_CUSTOMER`
      );
    }
  };

  const handleSearchSelect = (customer) => {
    setSearchOpen(false);

    if (customer?.id) {
      router.push(
        `/business/satislar/musteriye?customerId=${encodeURIComponent(
          customer.id
        )}&customerName=${encodeURIComponent(
          customer.name || ""
        )}&saleKind=TO_REGISTERED_CUSTOMER`
      );
    }
  };

  const summary = useMemo(() => {
    return sales.reduce(
      (acc, row) => {
        acc.totalAmount += Number(row.totalAmount) || 0;
        acc.collectionAmount += Number(row.collectionAmount) || 0;
        return acc;
      },
      {
        totalAmount: 0,
        collectionAmount: 0,
      }
    );
  }, [sales]);

  const currentRangeLabel =
    DATE_RANGES.find((r) => r.value === dateRange)?.label || "Son 1 Ay";

  const selectedDocTypeText = useMemo(() => {
    if (selectedDocTypes.length === 0) return "Tüm Belge Tipleri";

    const labels = selectedDocTypes.map((v) => documentTypeLabel(v));
    if (labels.length <= 2) return labels.join(", ");
    return `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
  }, [selectedDocTypes]);

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 text-[13px] text-slate-700">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <DocumentTextIcon className="h-4 w-4" />
              Satış Yönetimi
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
              Satışlar
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Perakende, yeni müşteri ve kayıtlı müşteri satışlarını tek
              merkezden yönetin. Belge tipine ve tarihe göre filtreleyin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/business/satislar/perakende"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <PlusIcon className="h-4 w-4" />
              Perakende Satış Gir
            </Link>

            <ActionButton
              onClick={() => setQuickAddOpen(true)}
              icon={UserPlusIcon}
              tone="blue"
            >
              Yeni Müşteriye Satış Gir
            </ActionButton>

            <ActionButton
              onClick={() => setSearchOpen(true)}
              icon={UserCircleIcon}
              tone="red"
            >
              Kayıtlı Müşteriye Satış Gir
            </ActionButton>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Toplam Kayıt"
          value={String(sales.length)}
          sub="Filtreye göre listelenen satış hareketi"
          icon={DocumentTextIcon}
          tone="blue"
        />
        <StatCard
          title="Toplam Satış"
          value={fmtTry(summary.totalAmount)}
          sub="Listelenen satışların toplam tutarı"
          icon={BanknotesIcon}
          tone="emerald"
        />
        <StatCard
          title="Toplam Tahsilat"
          value={fmtTry(summary.collectionAmount)}
          sub="Listelenen satışlara ait tahsilat toplamı"
          icon={CreditCardIcon}
          tone="amber"
        />
        <StatCard
          title="Dönem"
          value={currentRangeLabel}
          sub="Seçili tarih aralığı"
          icon={DocumentTextIcon}
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

      {sales.length === 0 && !loading && !apiError && (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-slate-700 shadow-sm">
          Hiç satış işlemi kaydetmemişsiniz.
        </div>
      )}

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              Filtreler
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Belge tipine ve tarih aralığına göre satışları filtreleyin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setDocumentTypeOpen((o) => !o)}
                className="inline-flex min-w-[230px] items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800"
              >
                <span className="truncate">{selectedDocTypeText}</span>
                <ChevronDownIcon className="h-4 w-4 text-slate-500" />
              </button>

              {documentTypeOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDocumentTypeOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-20 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-slate-50"
                      onClick={selectAllDocTypes}
                    >
                      <input
                        type="checkbox"
                        readOnly
                        checked={selectedDocTypes.length === 0}
                        className="rounded"
                      />
                      Tümünü Seç
                    </button>

                    <div className="border-t border-slate-100" />

                    {DOCUMENT_TYPES.filter((d) => !d.parent).map((d) => (
                      <label
                        key={d.value}
                        className="flex cursor-pointer items-center gap-2 px-4 py-3 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDocTypes.includes(d.value)}
                          onChange={() => toggleDocType(d.value)}
                          className="rounded"
                        />
                        <span className="text-sm text-slate-700">{d.label}</span>
                      </label>
                    ))}

                    <div className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Faturalaşmış
                    </div>

                    {DOCUMENT_TYPES.filter((d) => d.parent).map((d) => (
                      <label
                        key={d.value}
                        className="flex cursor-pointer items-center gap-2 px-4 py-3 pl-6 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDocTypes.includes(d.value)}
                          onChange={() => toggleDocType(d.value)}
                          className="rounded"
                        />
                        <span className="text-sm text-slate-700">{d.label}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setDateRangeOpen((o) => !o)}
                className="inline-flex min-w-[170px] items-center justify-between gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
              >
                <span>{currentRangeLabel}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {dateRangeOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDateRangeOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
                    {DATE_RANGES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => {
                          setDateRange(r.value);
                          setDateRangeOpen(false);
                        }}
                        className={`block w-full px-4 py-3 text-left text-sm hover:bg-slate-50 ${
                          dateRange === r.value
                            ? "bg-slate-50 font-semibold text-slate-900"
                            : "text-slate-700"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <ActionButton
              onClick={fetchSales}
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
            <h3 className="text-base font-bold text-slate-900">Satış Listesi</h3>
            <p className="mt-1 text-sm text-slate-500">
              Seçili filtrelere göre oluşturulan satış kayıtları
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
              Belge Tipi: {selectedDocTypeText}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
              Tarih: {currentRangeLabel}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
              Kayıt: {sales.length}
            </span>
          </div>
        </div>

        <div className="overflow-auto max-h-[calc(100vh-320px)]">
          <table className="min-w-full border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-900 text-white">
                <th className="px-4 py-3 font-semibold md:px-5">Tarih</th>
                <th className="px-4 py-3 font-semibold md:px-5">Belge Tipi</th>
                <th className="px-4 py-3 font-semibold md:px-5">Müşteri / Cari</th>
                <th className="px-4 py-3 text-right font-semibold md:px-5">
                  Toplam
                </th>
                <th className="px-4 py-3 text-right font-semibold md:px-5">
                  Tahsilat
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center md:px-5">
                    <div className="mx-auto max-w-md">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <DocumentTextIcon className="h-6 w-6" />
                      </div>
                      <h4 className="mt-4 text-base font-bold text-slate-900">
                        Kayıt bulunamadı
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Bu filtrelere uygun satış kaydı bulunmuyor.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sales.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-slate-100 transition hover:bg-sky-50/70 ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    }`}
                  >
                    <td className="px-4 py-3.5 md:px-5">{fmtDate(row.saleDate)}</td>
                    <td className="px-4 py-3.5 md:px-5">
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {documentTypeLabel(row.documentType)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 md:px-5 font-medium text-slate-900">
                      {row.customerName || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-slate-800 md:px-5">
                      {fmtTry(row.totalAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-slate-800 md:px-5">
                      {fmtTry(row.collectionAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <QuickAddCustomerModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onContinue={handleQuickAddContinue}
      />

      <CustomerSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSearchSelect}
      />
    </div>
  );
}