"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  Squares2X2Icon,
  TrashIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import CustomerSearchModal from "@/components/business/CustomerSearchModal";
import QuickAddCustomerModal from "@/components/business/QuickAddCustomerModal";

const STATUS_OPTIONS = ["ALL", "DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"];
const PRIORITY_OPTIONS = ["LOW", "NORMAL", "HIGH"];

function statusOptionLabel(value) {
  const key = String(value || "").toUpperCase();
  if (key === "ALL") return "Tüm Durumlar";
  if (key === "DRAFT") return "Taslak";
  if (key === "SENT") return "Gönderildi";
  if (key === "ACCEPTED") return "Kabul Edildi";
  if (key === "REJECTED") return "Reddedildi";
  if (key === "EXPIRED") return "Süresi Doldu";
  return value;
}

function priorityOptionLabel(value) {
  const key = String(value || "").toUpperCase();
  if (key === "HIGH") return "Yüksek";
  if (key === "LOW") return "Düşük";
  return "Normal";
}

function statusMeta(status) {
  const key = String(status || "").toUpperCase();
  const map = {
    DRAFT: { text: "Taslak", color: "bg-slate-100 text-slate-700 border-slate-200", icon: ClockIcon },
    SENT: { text: "Gönderildi", color: "bg-blue-100 text-blue-700 border-blue-200", icon: EyeIcon },
    ACCEPTED: { text: "Kabul Edildi", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircleIcon },
    REJECTED: { text: "Reddedildi", color: "bg-rose-100 text-rose-700 border-rose-200", icon: XCircleIcon },
    EXPIRED: { text: "Süresi Doldu", color: "bg-amber-100 text-amber-700 border-amber-200", icon: ClockIcon },
  };
  return map[key] || map.DRAFT;
}

function priorityMeta(priority) {
  const key = String(priority || "").toUpperCase();
  if (key === "HIGH") return { text: "Yüksek", color: "bg-rose-100 text-rose-700 border-rose-200" };
  if (key === "LOW") return { text: "Düşük", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  return { text: "Normal", color: "bg-slate-100 text-slate-700 border-slate-200" };
}

function toDateText(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("tr-TR");
}

function buildQuoteYeniParams(customer) {
  const params = new URLSearchParams();
  if (customer?.id) params.set("customerId", customer.id);
  if (customer?.name) params.set("customerName", customer.name);
  if (customer?.company || customer?.customerCompany) {
    params.set("customerCompany", customer.company || customer.customerCompany || "");
  }
  if (customer?.email || customer?.customerEmail) {
    params.set("customerEmail", customer.email || customer.customerEmail || "");
  }
  if (customer?.mobilePhone || customer?.phone || customer?.customerPhone) {
    params.set(
      "customerPhone",
      customer.mobilePhone || customer.phone || customer.customerPhone || ""
    );
  }
  return params.toString();
}

const fmtTry = (n) =>
  `₺${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0)}`;

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
    green: "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    blue: "bg-sky-500 hover:bg-sky-600 border-sky-600 text-white",
    red: "bg-rose-600 hover:bg-rose-700 border-rose-700 text-white",
    white: "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
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

function QuoteSkeletonCard() {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
          <div className="h-5 w-40 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-20 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

function MiniCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
        </div>
        {Icon ? (
          <div className="rounded-2xl bg-slate-100 p-2.5 text-slate-500">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function QuoteCard({
  quote,
  deletingId,
  onDelete,
  onUpdateStatus,
  onEdit,
}) {
  const s = statusMeta(quote.status);
  const p = priorityMeta(quote.priority);
  const StatusIcon = s.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#004aad]">
            {quote.quoteNumber}
          </p>
          <h3 className="mt-1 truncate text-lg font-bold text-slate-900">
            {quote.customerName || "Müşteri adı yok"}
          </h3>
          <p className="truncate text-xs text-slate-500">
            {quote.customerCompany || "-"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.color}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {s.text}
          </span>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${p.color}`}>
            {p.text}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Geçerlilik
          </p>
          <p className="mt-1 font-semibold text-slate-800">
            {toDateText(quote.validUntil) || "-"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Tutar
          </p>
          <p className="mt-1 font-bold text-slate-900">
            {fmtTry(quote.total)}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <select
          value={quote.status}
          onChange={(e) => onUpdateStatus(quote.id, e.target.value)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#004aad]"
        >
          {STATUS_OPTIONS.filter((item) => item !== "ALL").map((item) => (
            <option key={item} value={item}>
              {statusOptionLabel(item)}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onEdit(quote.id)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <PencilIcon className="h-4 w-4" />
            Düzenle
          </button>

          <button
            type="button"
            onClick={() => onDelete(quote.id)}
            disabled={deletingId === quote.id}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
          >
            <TrashIcon className="h-4 w-4" />
            {deletingId === quote.id ? "Siliniyor..." : "Sil"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function QuotesPage() {
  const router = useRouter();

  const [quotes, setQuotes] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [apiError, setApiError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid");

  const [searchOpen, setSearchOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    try {
      const params = new URLSearchParams();
      if (searchQ.trim()) params.set("q", searchQ.trim());
      if (status && status !== "ALL") params.set("status", status);
      params.set("limit", "200");

      const res = await fetch(`/api/business/quotes?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Teklifler alınamadı.");

      setQuotes(Array.isArray(data.quotes) ? data.quotes : []);
      setMetrics(data.metrics || null);
    } catch (error) {
      setApiError(error.message || "Teklifler alınamadı.");
      toast.error(error.message || "Teklifler alınamadı.");
      setQuotes([]);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [searchQ, status]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const totals = useMemo(() => {
    const m = metrics || {};
    return {
      totalQuotes: Number(m.totalQuotes || 0),
      acceptedQuotes: Number(m.acceptedQuotes || 0),
      sentQuotes: Number(m.sentQuotes || 0),
      rejectedQuotes: Number(m.rejectedQuotes || 0),
      expiredQuotes: Number(m.expiredQuotes || 0),
      totalValue: Number(m.totalValue || 0),
      acceptedValue: Number(m.acceptedValue || 0),
      conversionRate: Number(m.conversionRate || 0),
      avgQuoteValue: Number(m.avgQuoteValue || 0),
      avgProbability: Number(m.avgProbability || 0),
      pendingFollowUp: Number(m.pendingFollowUp || 0),
    };
  }, [metrics]);

  const handleSearchSelect = (customer) => {
    setSearchOpen(false);
    const query = buildQuoteYeniParams(customer);
    router.push(`/business/quotes/yeni?${query}`);
  };

  const handleQuickAddContinue = (customer) => {
    setQuickAddOpen(false);
    const query = buildQuoteYeniParams(customer);
    router.push(`/business/quotes/yeni?${query}`);
  };

  const deleteQuote = async (quoteId) => {
    if (!quoteId || !window.confirm("Bu teklifi silmek istediğinizden emin misiniz?")) {
      return;
    }

    setDeletingId(quoteId);

    try {
      const res = await fetch(`/api/business/quotes/${quoteId}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Teklif silinemedi.");

      toast.success("Teklif silindi.");
      await fetchQuotes();
    } catch (error) {
      toast.error(error.message || "Teklif silinemedi.");
    } finally {
      setDeletingId("");
    }
  };

  const updateStatus = async (quoteId, nextStatus) => {
    try {
      const res = await fetch(`/api/business/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Durum güncellenemedi.");

      toast.success("Teklif durumu güncellendi.");
      await fetchQuotes();
    } catch (error) {
      toast.error(error.message || "Durum güncellenemedi.");
    }
  };

  const applyFilters = () => {
    setSearchQ(searchInput);
  };

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      setSearchQ(searchInput);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 text-[13px] text-slate-700">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <DocumentTextIcon className="h-4 w-4" />
              Teklif Yönetimi
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
              Teklifler
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Tekliflerinizi yönetin, durumlarını takip edin ve dönüşüm
              performansını tek merkezden izleyin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ActionButton
              onClick={() => setSearchOpen(true)}
              icon={PlusIcon}
              tone="red"
            >
              Kayıtlı Müşteriye Teklif Hazırla
            </ActionButton>

            <ActionButton
              onClick={() => setQuickAddOpen(true)}
              icon={PlusIcon}
              tone="blue"
            >
              Yeni Müşteriye Teklif Hazırla
            </ActionButton>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Toplam Teklif"
          value={String(totals.totalQuotes)}
          sub="Listelenen toplam teklif sayısı"
          icon={DocumentTextIcon}
          tone="blue"
        />
        <StatCard
          title="Kabul Edilen"
          value={String(totals.acceptedQuotes)}
          sub="Kabul edilen teklif sayısı"
          icon={CheckCircleIcon}
          tone="emerald"
        />
        <StatCard
          title="Dönüşüm Oranı"
          value={`%${totals.conversionRate.toFixed(1)}`}
          sub="Kabul oranı"
          icon={ChartBarIcon}
          tone="amber"
        />
        <StatCard
          title="Toplam Değer"
          value={fmtTry(totals.totalValue)}
          sub="Listelenen tekliflerin toplam değeri"
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

      {quotes.length === 0 && !loading && !apiError && (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-slate-700 shadow-sm">
          Hiç teklif işlemi kaydetmemişsiniz. Yukarıdaki teklif oluşturma
          düğmelerini kullanarak yeni teklif hazırlayabilirsiniz.
        </div>
      )}

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              Filtreler
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Teklif no, müşteri, e-posta veya duruma göre filtreleme yapın.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder="Teklif no, müşteri, e-posta, not..."
                className="h-11 min-w-[280px] rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-[#004aad]"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#004aad]"
            >
              {STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {statusOptionLabel(item)}
                </option>
              ))}
            </select>

            <ActionButton
              onClick={applyFilters}
              icon={ArrowPathIcon}
              tone="white"
              className="rounded-xl px-3 py-2.5"
            >
              Filtrele
            </ActionButton>

            <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-2 transition ${
                  viewMode === "list"
                    ? "bg-white text-[#004aad] shadow-sm"
                    : "text-slate-400"
                }`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-2 transition ${
                  viewMode === "grid"
                    ? "bg-white text-[#004aad] shadow-sm"
                    : "text-slate-400"
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <QuoteSkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <QuoteSkeletonCard key={i} />
            ))}
          </div>
        )
      ) : quotes.length === 0 ? null : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              deletingId={deletingId}
              onDelete={deleteQuote}
              onUpdateStatus={updateStatus}
              onEdit={(id) => router.push(`/business/quotes/${id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              deletingId={deletingId}
              onDelete={deleteQuote}
              onUpdateStatus={updateStatus}
              onEdit={(id) => router.push(`/business/quotes/${id}`)}
            />
          ))}
        </div>
      )}

      {quotes.length > 0 && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MiniCard
            label="Ort. Teklif Değeri"
            value={fmtTry(totals.avgQuoteValue)}
            icon={BanknotesIcon}
          />
          <MiniCard
            label="Kabul Edilen Değer"
            value={fmtTry(totals.acceptedValue)}
            icon={CheckCircleIcon}
          />
          <MiniCard
            label="Ort. Olasılık"
            value={`%${totals.avgProbability.toFixed(1)}`}
            icon={EyeIcon}
          />
          <MiniCard
            label="Takip Bekleyen"
            value={String(totals.pendingFollowUp)}
            icon={ClockIcon}
          />
        </section>
      )}

      <CustomerSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSearchSelect}
      />

      <QuickAddCustomerModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onContinue={handleQuickAddContinue}
      />
    </div>
  );
}