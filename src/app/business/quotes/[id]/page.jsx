"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  CloudArrowUpIcon,
  ArrowUturnLeftIcon,
  PlusIcon,
  TrashIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

const fmtMoney = (n) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
const fmtTry = (n) => `₺${fmtMoney(n)}`;

function toInputDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function calcTotals(items) {
  const safe = Array.isArray(items) ? items : [];
  const subtotal = safe.reduce((sum, it) => sum + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0);
  const discount = safe.reduce(
    (sum, it) => sum + Number(it.quantity || 0) * Number(it.unitPrice || 0) * (Number(it.discount || 0) / 100),
    0
  );
  const net = subtotal - discount;
  const tax = net * 0.2;
  const total = net + tax;
  return { subtotal, discount, tax, total };
}

export default function QuoteEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState(null);
  const [products, setProducts] = useState([]);

  const [quoteNumber, setQuoteNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [quoteDate, setQuoteDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);

  useEffect(() => {
    if (!id) {
      router.replace("/business/quotes");
      return;
    }
    let cancelled = false;
    Promise.all([
      fetch(`/api/business/quotes/${id}`).then((r) => r.json()),
      fetch("/api/business/products?limit=200").then((r) => r.json()),
    ]).then(([quoteRes, productsRes]) => {
      if (cancelled) return;
      const q = quoteRes?.quote;
      if (!q) {
        router.replace("/business/quotes");
        return;
      }
      setQuote(q);
      setQuoteNumber(q.quoteNumber || "");
      setCustomerName(q.customerName || "");
      setCustomerCompany(q.customerCompany || "");
      setCustomerEmail(q.customerEmail || "");
      setCustomerPhone(q.customerPhone || "");
      setQuoteDate(toInputDate(q.quoteDate));
      setValidUntil(toInputDate(q.validUntil));
      setExchangeRate(q.exchangeRate != null ? String(q.exchangeRate) : "");
      setNotes(q.notes || "");
      setItems(
        (q.items || []).map((it) => ({
          id: it.id || `${Date.now()}-${Math.random()}`,
          title: it.title || "",
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          discount: Number(it.discount) || 0,
          description: it.description || "",
          isService: Boolean(it.isService),
        }))
      );
      setProducts(productsRes?.items || []);
    }).catch(() => {
      if (!cancelled) router.replace("/business/quotes");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id, router]);

  const totals = useMemo(() => calcTotals(items), [items]);

  const addFromProduct = () => {
    if (!selectedProduct) return;
    const product = products.find((p) => p.id === selectedProduct);
    const qty = Number(selectedQty) || 1;
    const name = product?.name || "Ürün";
    const unitPrice = Number(product?.discountPrice ?? product?.price ?? 0);
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        title: name,
        quantity: qty,
        unitPrice,
        discount: 0,
        description: "",
        isService: false,
      },
    ]);
    setSelectedProduct("");
    setSelectedQty(1);
  };

  const addManualLine = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        title: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        description: "",
        isService: true,
      },
    ]);
  };

  const updateItem = (itemId, key, value) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, [key]: value } : it))
    );
  };

  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const handleSave = async () => {
    const validItems = items.filter((it) => String(it.title || "").trim());
    if (validItems.length === 0) {
      alert("En az bir teklif kalemi ekleyin.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/business/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteNumber: quoteNumber.trim() || undefined,
          customerName: customerName.trim(),
          customerCompany: customerCompany.trim() || null,
          customerEmail: customerEmail.trim() || null,
          customerPhone: customerPhone.trim() || null,
          quoteDate: quoteDate || undefined,
          validUntil: validUntil || undefined,
          exchangeRate: exchangeRate.trim() ? Number(exchangeRate.replace(",", ".")) : undefined,
          notes: notes.trim() || null,
          items: validItems.map((it) => ({
            title: it.title.trim(),
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
            discount: Number(it.discount) || 0,
            description: it.description?.trim() || null,
            isService: Boolean(it.isService),
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Güncelleme başarısız.");
      router.push("/business/quotes");
    } catch (e) {
      alert(e.message || "Teklif güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const inp =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400";
  const label =
    "mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500";

  if (loading || !quote) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  const headerTitle = customerCompany.trim() || customerName;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
              Teklif Düzenle
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {quoteNumber || id}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <CloudArrowUpIcon className="h-4 w-4" />
              {saving ? "Kaydediliyor..." : "Teklifi Kaydet"}
            </button>
            <Link
              href="/business/quotes"
              className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <ArrowUturnLeftIcon className="h-4 w-4" />
              Geri Dön
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-200 bg-blue-600 px-5 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">
              Teklif Bilgileri
            </p>
            <h2 className="mt-1 text-lg font-bold truncate">{headerTitle}</h2>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <label className={label}>Teklif No</label>
              <input
                type="text"
                className={inp}
                value={quoteNumber}
                onChange={(e) => setQuoteNumber(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Müşteri Adı</label>
              <input
                type="text"
                className={inp}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Firma / Unvan</label>
              <input
                type="text"
                className={inp}
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>E-posta</label>
              <input
                type="text"
                className={inp}
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Telefon</label>
              <input
                type="text"
                className={inp}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Teklif Tarihi</label>
              <input
                type="date"
                className={inp}
                value={quoteDate}
                onChange={(e) => setQuoteDate(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Geçerlilik</label>
              <input
                type="date"
                className={inp}
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Döviz Kuru</label>
              <input
                type="text"
                className={inp}
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value.replace(",", "."))}
              />
            </div>
            <div>
              <label className={label}>Açıklama</label>
              <textarea
                className={inp}
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-200 bg-emerald-600 px-5 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
              Ürün / Hizmetler
            </p>
            <h2 className="mt-1 text-lg font-bold">Teklif kalemleri</h2>
          </div>
          <div className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_90px_110px]">
              <div>
                <label className={label}>Ürün seçin</label>
                <select
                  className={inp}
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                  <option value="">Seçin...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {fmtTry(p.discountPrice ?? p.price ?? 0)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Miktar</label>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  className={inp}
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(e.target.value)}
                />
              </div>
              <div>
                <label className={label}>&nbsp;</label>
                <button
                  type="button"
                  onClick={addFromProduct}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-700 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Ekle
                </button>
              </div>
            </div>
            <p className="text-sm">
              <button
                type="button"
                onClick={addManualLine}
                className="font-medium text-teal-600 underline decoration-teal-500 underline-offset-2 hover:text-teal-700"
              >
                Listede olmayan ürün eklemek için tıklayın
              </button>
            </p>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              {items.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <CubeIcon className="mx-auto h-14 w-14 text-slate-300" />
                  <h3 className="mt-4 text-base font-bold text-slate-900">Henüz kalem yok</h3>
                </div>
              ) : (
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 font-semibold text-slate-700">Ürün / Hizmet</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Miktar</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Birim Fiyat</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">İndirim %</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Toplam</th>
                      <th className="w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => {
                      const lineTotal =
                        Number(it.quantity || 0) * Number(it.unitPrice || 0) *
                        (1 - Number(it.discount || 0) / 100);
                      return (
                        <tr key={it.id} className="border-b border-slate-100">
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                              value={it.title}
                              onChange={(e) => updateItem(it.id, "title", e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              min={0.01}
                              step={0.01}
                              className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm"
                              value={it.quantity}
                              onChange={(e) =>
                                updateItem(it.id, "quantity", Number(e.target.value || 0))
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm"
                              value={it.unitPrice || ""}
                              onChange={(e) =>
                                updateItem(it.id, "unitPrice", Number(e.target.value || 0))
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm"
                              value={it.discount || ""}
                              onChange={(e) =>
                                updateItem(it.id, "discount", Number(e.target.value || 0))
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-semibold tabular-nums">
                            {fmtTry(lineTotal)}
                          </td>
                          <td className="px-2 py-3">
                            <button
                              type="button"
                              onClick={() => removeItem(it.id)}
                              className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            {items.length > 0 && (
              <div className="flex justify-end text-base font-bold text-slate-900">
                Genel Toplam: {fmtTry(totals.total)}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
