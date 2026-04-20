"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BoltIcon,
  ArrowUturnLeftIcon,
  PlusIcon,
  TrashIcon,
  BuildingOffice2Icon,
  CubeIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

const fmtMoney = (n) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
const fmtTry = (n) => `₺${fmtMoney(n)}`;

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value || "");
  } catch {
    return value || "";
  }
};

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-44 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 text-right md:px-5">
            <div className="ml-auto h-4 w-14 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 text-right md:px-5">
            <div className="ml-auto h-4 w-20 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 text-right md:px-5">
            <div className="ml-auto h-4 w-20 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="ml-auto h-8 w-8 rounded bg-slate-200 animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
}

function YeniContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const supplierId = searchParams.get("supplierId") || "";
  const supplierName = safeDecode(searchParams.get("supplierName") || "");

  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [products, setProducts] = useState([]);

  const [purchaseDate, setPurchaseDate] = useState(() => {
    const d = new Date();
    const tzOff = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOff).toISOString().slice(0, 16);
  });
  const [cashAccountId, setCashAccountId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [description, setDescription] = useState("");

  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);

  useEffect(() => {
    if (!supplierId) {
      router.replace("/business/purchases");
      return;
    }
    let cancelled = false;
    (async () => {
      setPageLoading(true);
      try {
        const [accountsRes, productsRes] = await Promise.all([
          fetch("/api/business/cash/accounts"),
          fetch("/api/business/products?limit=200"),
        ]);
        const [accountsData, productsData] = await Promise.all([
          accountsRes.json(),
          productsRes.json(),
        ]);
        if (cancelled) return;
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
        setProducts(productsData?.items || []);
      } catch (e) {
        if (cancelled) return;
        setAccounts([]);
        setProducts([]);
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [supplierId, router]);

  const totalAmount = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.total) || 0), 0),
    [items]
  );
  const totalPaid = Number(String(paymentAmount || "0").replace(",", ".")) || 0;

  const addLine = () => {
    if (!selectedProduct) {
      alert("Lütfen bir ürün / hizmet seçin.");
      return;
    }
    const product = products.find((p) => p.id === selectedProduct);
    const qty = Number(selectedQty) || 0;
    if (qty <= 0) {
      alert("Miktar 0'dan büyük olmalıdır.");
      return;
    }
    const name = product?.name || "Ürün / Hizmet";
    const price = Number(product?.discountPrice ?? product?.price ?? 0);
    const total = price * qty;
    setItems((prev) => [
      ...prev,
      {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        productId: product?.id || null,
        name,
        quantity: qty,
        unitPrice: price,
        total,
      },
    ]);
    setSelectedProduct("");
    setSelectedQty(1);
  };

  const removeLine = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const fillPaymentFull = () => setPaymentAmount(String(totalAmount || 0));

  const handleSave = async () => {
    if (items.length === 0) {
      alert("En az bir ürün/hizmet ekleyin.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/business/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          supplierName: supplierName || undefined,
          documentType: "ORDER",
          purchaseDate: new Date(purchaseDate).toISOString(),
          totalAmount,
          paymentAmount: totalPaid,
          cashAccountId: cashAccountId || null,
          description: description || null,
          items: items.map((it) => ({
            productId: it.productId,
            name: it.name,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt başarısız");
      router.push("/business/purchases");
    } catch (e) {
      alert(e.message || "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const inp =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400";
  const label =
    "mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500";

  if (!supplierId) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <BuildingOffice2Icon className="h-4 w-4" />
              Tedarikçi
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
              {supplierName || "Seçili tedarikçi"}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Bu tedarikçi için alış oluşturun, ürün ekleyin ve ödeme bilgisini girin.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-700 bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <BoltIcon className="h-4 w-4" />
              {saving ? "Kaydediliyor..." : "Alış Kaydet"}
            </button>
            <Link
              href="/business/purchases"
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
          <div className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/65">
              Alış Bilgileri
            </p>
            <h2 className="mt-1 text-lg font-bold">Genel bilgiler</h2>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <label className={label}>Tarih</label>
              <div className="relative">
                <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="datetime-local"
                  className={`${inp} pl-10`}
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={label}>Toplam Tutar</label>
              <input type="text" className={inp} readOnly value={fmtTry(totalAmount)} />
            </div>
            <div>
              <label className={label}>Kasa / Hesap</label>
              <select
                className={inp}
                value={cashAccountId}
                onChange={(e) => setCashAccountId(e.target.value)}
              >
                <option value="">Hesap seçin</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Ödeme / Tahsilat</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className={inp}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value.replace(",", "."))}
                  placeholder="0,00"
                />
                <button
                  type="button"
                  onClick={fillPaymentFull}
                  className="shrink-0 rounded-xl border border-emerald-700 bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  title="Toplamı ödeme alanına aktar"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div>
              <label className={label}>Toplam Ödenen</label>
              <input type="text" className={inp} readOnly value={fmtTry(totalPaid)} />
            </div>
            <div>
              <label className={label}>Açıklama</label>
              <textarea
                className={inp}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Alış açıklaması..."
              />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-200 bg-emerald-600 px-5 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
              Ürün / Hizmetler
            </p>
            <h2 className="mt-1 text-lg font-bold">Alış kalemleri</h2>
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
                  onClick={addLine}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-700 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Ekle
                </button>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              {pageLoading ? (
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 font-semibold text-slate-700">Ürün / Hizmet</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Miktar</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Birim Fiyat</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Toplam</th>
                      <th className="w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    <TableSkeleton />
                  </tbody>
                </table>
              ) : items.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <CubeIcon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">Henüz satır eklenmedi</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Alışı oluşturmak için ürün veya hizmet ekleyin.
                  </p>
                </div>
              ) : (
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 font-semibold text-slate-700">Ürün / Hizmet</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Miktar</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Birim Fiyat</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Toplam</th>
                      <th className="w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, index) => (
                      <tr
                        key={it.id}
                        className={`border-b border-slate-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                      >
                        <td className="px-4 py-3.5 font-medium text-slate-900">{it.name}</td>
                        <td className="px-4 py-3.5 text-right tabular-nums text-slate-700">{it.quantity}</td>
                        <td className="px-4 py-3.5 text-right tabular-nums text-slate-700">{fmtTry(it.unitPrice)}</td>
                        <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-slate-900">{fmtTry(it.total)}</td>
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={() => removeLine(it.id)}
                            className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function PurchasesYeniPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Yükleniyor…</div>}>
      <YeniContent />
    </Suspense>
  );
}
