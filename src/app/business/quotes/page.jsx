"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

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

function emptyForm() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return {
    id: "",
    quoteNumber: "",
    customerName: "",
    customerCompany: "",
    customerEmail: "",
    customerPhone: "",
    quoteDate: now.toISOString().slice(0, 10),
    validUntil: nextMonth.toISOString().slice(0, 10),
    status: "DRAFT",
    priority: "NORMAL",
    probability: 40,
    followUpDate: "",
    notes: "",
    items: [{ title: "", quantity: 1, unitPrice: 0, discount: 0, description: "", isService: true }],
  };
}

function statusMeta(status) {
  const key = String(status || "").toUpperCase();
  const map = {
    DRAFT: { text: "Taslak", color: "bg-slate-100 text-slate-700", icon: ClockIcon },
    SENT: { text: "Gönderildi", color: "bg-blue-100 text-blue-700", icon: EyeIcon },
    ACCEPTED: { text: "Kabul Edildi", color: "bg-emerald-100 text-emerald-700", icon: CheckCircleIcon },
    REJECTED: { text: "Reddedildi", color: "bg-rose-100 text-rose-700", icon: XCircleIcon },
    EXPIRED: { text: "Süresi Doldu", color: "bg-amber-100 text-amber-700", icon: ClockIcon },
  };
  return map[key] || map.DRAFT;
}

function priorityMeta(priority) {
  const key = String(priority || "").toUpperCase();
  if (key === "HIGH") return { text: "Yüksek", color: "bg-rose-100 text-rose-700" };
  if (key === "LOW") return { text: "Düşük", color: "bg-emerald-100 text-emerald-700" };
  return { text: "Normal", color: "bg-slate-100 text-slate-700" };
}

function toInputDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function calcPreviewTotals(items) {
  const safeItems = Array.isArray(items) ? items : [];
  const subtotal = safeItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
  const discount = safeItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0) * (Number(item.discount || 0) / 100),
    0,
  );
  const net = subtotal - discount;
  const tax = net * 0.2;
  const total = net + tax;
  return { subtotal, discount, tax, total };
}

function probabilityText(value) {
  const v = Number(value || 0);
  if (v >= 80) return "Yüksek olasılık";
  if (v >= 50) return "Orta olasılık";
  if (v > 0) return "Düşük olasılık";
  return "Belirsiz";
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const fetchQuotes = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (status && status !== "ALL") params.set("status", status);
      params.set("limit", "200");
      const res = await fetch(`/api/business/quotes?${params.toString()}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Teklifler alınamadı.");
      setQuotes(Array.isArray(data.quotes) ? data.quotes : []);
      setMetrics(data.metrics || null);
    } catch (error) {
      toast.error(error.message || "Teklifler alınamadı.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [q, status]);

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

  const resetForm = useCallback(() => {
    setForm(emptyForm());
    setShowForm(false);
  }, []);

  const openCreateForm = () => {
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEditForm = (quote) => {
    setForm({
      id: quote.id,
      quoteNumber: quote.quoteNumber || "",
      customerName: quote.customerName || "",
      customerCompany: quote.customerCompany || "",
      customerEmail: quote.customerEmail || "",
      customerPhone: quote.customerPhone || "",
      quoteDate: toInputDate(quote.quoteDate),
      validUntil: toInputDate(quote.validUntil),
      status: quote.status || "DRAFT",
      priority: quote.priority || "NORMAL",
      probability: Number(quote.probability || 0),
      followUpDate: toInputDate(quote.followUpDate),
      notes: quote.notes || "",
      items:
        Array.isArray(quote.items) && quote.items.length > 0
          ? quote.items.map((item) => ({
              id: item.id,
              title: item.title || "",
              quantity: Number(item.quantity || 1),
              unitPrice: Number(item.unitPrice || 0),
              discount: Number(item.discount || 0),
              description: item.description || "",
              isService: Boolean(item.isService),
            }))
          : emptyForm().items,
    });
    setShowForm(true);
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { title: "", quantity: 1, unitPrice: 0, discount: 0, description: "", isService: true }],
    }));
  };

  const removeItem = (idx) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const updateItem = (idx, key, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === idx ? { ...item, [key]: value } : item)),
    }));
  };

  const saveQuote = async () => {
    if (!form.customerName.trim()) return toast.error("Müşteri adı zorunludur.");
    if (!form.quoteDate || !form.validUntil) return toast.error("Teklif tarihi ve geçerlilik tarihi zorunludur.");
    const validItems = form.items.filter((item) => String(item.title || "").trim());
    if (validItems.length === 0) return toast.error("En az bir teklif kalemi eklemelisiniz.");

    const payload = {
      quoteNumber: form.quoteNumber || undefined,
      customerName: form.customerName,
      customerCompany: form.customerCompany || null,
      customerEmail: form.customerEmail || null,
      customerPhone: form.customerPhone || null,
      quoteDate: form.quoteDate,
      validUntil: form.validUntil,
      status: form.status,
      priority: form.priority,
      probability: Number(form.probability || 0),
      followUpDate: form.followUpDate || null,
      notes: form.notes || null,
      items: validItems.map((item) => ({
        title: item.title,
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        discount: Number(item.discount || 0),
        description: item.description || null,
        isService: Boolean(item.isService),
      })),
    };

    setSaving(true);
    try {
      const isEdit = Boolean(form.id);
      const res = await fetch(isEdit ? `/api/business/quotes/${form.id}` : "/api/business/quotes", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Kayıt işlemi başarısız.");
      toast.success(isEdit ? "Teklif güncellendi." : "Teklif oluşturuldu.");
      resetForm();
      await fetchQuotes(true);
    } catch (error) {
      toast.error(error.message || "Teklif kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuote = async (quoteId) => {
    if (!quoteId || !window.confirm("Bu teklifi silmek istediğinizden emin misiniz?")) return;
    setDeletingId(quoteId);
    try {
      const res = await fetch(`/api/business/quotes/${quoteId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Teklif silinemedi.");
      toast.success("Teklif silindi.");
      await fetchQuotes(true);
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
      await fetchQuotes(true);
    } catch (error) {
      toast.error(error.message || "Durum güncellenemedi.");
    }
  };

  const previewTotals = useMemo(() => calcPreviewTotals(form.items), [form.items]);

  return (
    <div className="space-y-6">
      <section className="bg-[#004aad] rounded-[3rem] p-8 md:p-10 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <DocumentTextIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase">Teklif Yönetimi</h1>
              <p className="text-blue-100 font-semibold">Canlı teklif, durum ve dönüşüm takibi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[#004aad] font-black uppercase text-xs tracking-widest hover:bg-slate-100"
          >
            <PlusIcon className="w-5 h-5" />
            Yeni Teklif
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <StatCard label="Toplam Teklif" value={totals.totalQuotes} />
          <StatCard label="Kabul Edilen" value={totals.acceptedQuotes} />
          <StatCard label="Dönüşüm" value={`%${totals.conversionRate.toFixed(1)}`} />
          <StatCard label="Toplam Değer" value={`${totals.totalValue.toLocaleString("tr-TR")} ₺`} />
        </div>
      </section>

      <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Teklif no, müşteri, e-posta, not..."
            className="w-full h-12 pl-10 pr-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-12 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]">
          {STATUS_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {statusOptionLabel(item)}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => fetchQuotes()} className="h-12 px-5 rounded-xl bg-slate-950 text-white font-semibold">
          Filtrele
        </button>
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button type="button" onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-white text-[#004aad]" : "text-slate-400"}`}>
            <ListBulletIcon className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-white text-[#004aad]" : "text-slate-400"}`}>
            <Squares2X2Icon className="w-5 h-5" />
          </button>
        </div>
      </section>

      {loading ? (
        <div className="min-h-[35vh] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#004aad] animate-spin" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-500 font-semibold">
          Filtreye uygun teklif bulunamadı.
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-4"}>
          {quotes.map((quote) => {
            const s = statusMeta(quote.status);
            const p = priorityMeta(quote.priority);
            return (
              <motion.article key={quote.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-[#004aad]">{quote.quoteNumber}</p>
                    <h3 className="text-lg font-black text-slate-900 mt-1">{quote.customerName}</h3>
                    <p className="text-xs text-slate-500">{quote.customerCompany || "-"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${s.color}`}>{s.text}</span>
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${p.color}`}>{p.text}</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-slate-500 font-bold">Geçerlilik</p>
                    <p className="font-semibold text-slate-800">{toInputDate(quote.validUntil) || "-"}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-slate-500 font-bold">Tutar</p>
                    <p className="font-black text-slate-900">{Number(quote.total || 0).toLocaleString("tr-TR")} ₺</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <select value={quote.status} onChange={(e) => updateStatus(quote.id, e.target.value)} className="h-9 px-2 rounded-lg border border-slate-200 text-xs font-semibold">
                    {STATUS_OPTIONS.filter((item) => item !== "ALL").map((item) => (
                      <option key={item} value={item}>
                        {statusOptionLabel(item)}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={() => openEditForm(quote)} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                    <PencilIcon className="w-4 h-4" />
                    Düzenle
                  </button>
                  <button type="button" onClick={() => deleteQuote(quote.id)} disabled={deletingId === quote.id} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold disabled:opacity-60">
                    <TrashIcon className="w-4 h-4" />
                    {deletingId === quote.id ? "Siliniyor..." : "Sil"}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MiniCard label="Ort. Teklif Değeri" value={`${totals.avgQuoteValue.toLocaleString("tr-TR")} ₺`} />
        <MiniCard label="Kabul Edilen Değer" value={`${totals.acceptedValue.toLocaleString("tr-TR")} ₺`} />
        <MiniCard label="Ort. Olasılık" value={`%${totals.avgProbability.toFixed(1)}`} />
        <MiniCard label="Takip Bekleyen" value={totals.pendingFollowUp} />
      </section>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm p-4 overflow-auto">
            <div className="max-w-6xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between gap-3 mb-5">
                <h2 className="text-2xl font-black text-slate-900">{form.id ? "Teklif Düzenle" : "Yeni Teklif Oluştur"}</h2>
                <button type="button" onClick={resetForm} className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold">
                  Kapat
                </button>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 mb-5">
                <p className="text-sm font-bold text-indigo-900">Hızlı bilgi</p>
                <p className="text-xs text-indigo-700 mt-1">
                  Olasılık alanındaki sayı (`0-100`), teklifin kapanma ihtimalini ifade eder. Kalemlerdeki sayılar sırasıyla
                  <span className="font-semibold"> adet / birim fiyat / indirim %</span> değerleridir.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 md:p-5">
                <h3 className="text-base font-black text-slate-900 mb-3">1) Müşteri ve teklif bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={form.customerName} onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))} placeholder="Müşteri adı *" className="h-11 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]" />
                  <input value={form.customerCompany} onChange={(e) => setForm((prev) => ({ ...prev, customerCompany: e.target.value }))} placeholder="Firma" className="h-11 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]" />
                  <input value={form.customerEmail} onChange={(e) => setForm((prev) => ({ ...prev, customerEmail: e.target.value }))} placeholder="E-posta" className="h-11 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]" />
                  <input value={form.customerPhone} onChange={(e) => setForm((prev) => ({ ...prev, customerPhone: e.target.value }))} placeholder="Telefon" className="h-11 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]" />
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Teklif Tarihi</label>
                    <input type="date" value={form.quoteDate} onChange={(e) => setForm((prev) => ({ ...prev, quoteDate: e.target.value }))} className="h-11 w-full px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Geçerlilik Tarihi (Son Gün)</label>
                    <input type="date" value={form.validUntil} onChange={(e) => setForm((prev) => ({ ...prev, validUntil: e.target.value }))} className="h-11 w-full px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Teklif Durumu</label>
                    <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="h-11 w-full px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]">
                      {STATUS_OPTIONS.filter((item) => item !== "ALL").map((item) => (
                        <option key={item} value={item}>
                          {statusOptionLabel(item)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Öncelik</label>
                    <select value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))} className="h-11 w-full px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]">
                      {PRIORITY_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {priorityOptionLabel(item)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 rounded-xl border border-slate-200 p-3 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-600">Tahmini kapanma olasılığı</label>
                      <span className="text-xs font-black text-[#004aad]">%{form.probability} · {probabilityText(form.probability)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={form.probability}
                      onChange={(e) => setForm((prev) => ({ ...prev, probability: Number(e.target.value) }))}
                      className="w-full accent-[#004aad]"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      {[25, 50, 75].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, probability: preset }))}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold hover:border-[#004aad] hover:text-[#004aad]"
                        >
                          %{preset}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Takip Tarihi (Opsiyonel)</label>
                    <input type="date" value={form.followUpDate} onChange={(e) => setForm((prev) => ({ ...prev, followUpDate: e.target.value }))} className="h-11 w-full px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]" />
                  </div>
                  <textarea rows={3} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Teklif notları, müşteri özel talepleri vb." className="md:col-span-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]" />
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 p-4 md:p-5 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">2) Teklif Kalemleri</h3>
                    <p className="text-xs text-slate-500">Her satır bir ürün/hizmet satırını temsil eder.</p>
                  </div>
                  <button type="button" onClick={addItem} className="h-9 px-3 rounded-lg bg-slate-950 text-white text-xs font-bold">
                    Kalem Ekle
                  </button>
                </div>
                <div className="space-y-3">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 rounded-xl p-3">
                      <div className="md:col-span-4">
                        <p className="text-[11px] font-bold text-slate-500 mb-1">Kalem / Hizmet Adı</p>
                        <input value={item.title} onChange={(e) => updateItem(idx, "title", e.target.value)} placeholder="Örn: Web tasarım hizmeti" className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]" />
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[11px] font-bold text-slate-500 mb-1">Adet</p>
                        <input type="number" min={0} step="0.01" value={item.quantity || ""} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value || 0))} placeholder="1" className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]" />
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[11px] font-bold text-slate-500 mb-1">Birim Fiyat (TL)</p>
                        <input type="number" min={0} step="0.01" value={item.unitPrice || ""} onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value || 0))} placeholder="1500" className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]" />
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[11px] font-bold text-slate-500 mb-1">İndirim (%)</p>
                        <input type="number" min={0} max={100} value={item.discount || ""} onChange={(e) => updateItem(idx, "discount", Number(e.target.value || 0))} placeholder="10" className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]" />
                      </div>
                      <button type="button" onClick={() => removeItem(idx)} disabled={form.items.length <= 1} className="md:col-span-2 h-10 px-3 rounded-lg bg-rose-100 text-rose-700 text-xs font-bold disabled:opacity-50">
                        Sil
                      </button>
                      <div className="md:col-span-12">
                        <p className="text-[11px] font-bold text-slate-500 mb-1">Açıklama (Opsiyonel)</p>
                        <textarea rows={2} value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} placeholder="Bu kaleme özel detay notu..." className="w-full p-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                <MiniCard label="Ara Toplam" value={`${previewTotals.subtotal.toLocaleString("tr-TR")} ₺`} />
                <MiniCard label="İndirim" value={`${previewTotals.discount.toLocaleString("tr-TR")} ₺`} />
                <MiniCard label="KDV (%20)" value={`${previewTotals.tax.toLocaleString("tr-TR")} ₺`} />
                <MiniCard label="Genel Toplam" value={`${previewTotals.total.toLocaleString("tr-TR")} ₺`} />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button type="button" onClick={resetForm} className="h-11 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold">
                  Vazgeç
                </button>
                <button type="button" disabled={saving} onClick={saveQuote} className="h-11 px-5 rounded-xl bg-[#004aad] text-white font-semibold disabled:opacity-60">
                  {saving ? "Kaydediliyor..." : form.id ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
      <p className="text-[11px] uppercase tracking-wider font-bold text-blue-100">{label}</p>
      <p className="text-2xl md:text-3xl font-black mt-1">{value}</p>
    </div>
  );
}

function MiniCard({ label, value }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
      <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">{label}</p>
      <p className="text-lg font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}
