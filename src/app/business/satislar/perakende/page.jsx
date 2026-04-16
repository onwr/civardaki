"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  parseMoneyInput,
  stripDiscountLines,
  sumLineTotals,
  makeDiscountLineItem,
} from "@/lib/sales-cart-helpers";
import {
  BoltIcon,
  ArrowUturnLeftIcon,
  PlusIcon,
  TrashIcon,
  BanknotesIcon,
  CubeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

const fmtMoney = (n) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

const fmtTry = (n) => `₺${fmtMoney(n)}`;

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

export default function PerakendeSatisPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [accounts, setAccounts] = useState([]);
  const [products, setProducts] = useState([]);

  const [saleDate, setSaleDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 16);
  });

  const [cashAccountId, setCashAccountId] = useState("");
  const [collectionAmount, setCollectionAmount] = useState("");
  const [description, setDescription] = useState("");

  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedUnitPrice, setSelectedUnitPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountTl, setDiscountTl] = useState("");

  useEffect(() => {
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

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedProduct) {
      setSelectedUnitPrice("");
      return;
    }
    const product = products.find((p) => p.id === selectedProduct);
    const price = Number(product?.discountPrice ?? product?.price ?? 0);
    setSelectedUnitPrice(String(price));
  }, [selectedProduct, products]);

  const totalAmount = useMemo(() => sumLineTotals(items), [items]);

  const productLineCount = useMemo(
    () => items.filter((it) => !it.isDiscount).length,
    [items],
  );

  const totalCollected = Number(
    String(collectionAmount || "0").replace(",", ".")
  ) || 0;

  const addLine = () => {
    if (!selectedProduct) {
      alert("Lütfen bir ürün / hizmet seçin.");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    const qty = parseMoneyInput(selectedQty);
    const price = parseMoneyInput(selectedUnitPrice);

    if (qty <= 0) {
      alert("Miktar 0'dan büyük olmalıdır.");
      return;
    }

    const name = product?.name || "Ürün / Hizmet";
    const total = qty * price;

    setItems((prev) => {
      const base = stripDiscountLines(prev);
      return [
        ...base,
        {
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random()}`,
          productId: product?.id || null,
          name,
          quantity: qty,
          unitPrice: price,
          total,
        },
      ];
    });

    setSelectedProduct("");
    setSelectedQty(1);
    setSelectedUnitPrice("");
  };

  const updateLine = (id, field, rawValue) => {
    setItems((prev) => {
      const next = prev.map((it) => {
        if (it.id !== id || it.isDiscount) return it;
        if (field === "quantity") {
          const q = parseMoneyInput(rawValue);
          const total = q * (Number(it.unitPrice) || 0);
          return { ...it, quantity: q, total };
        }
        if (field === "unitPrice") {
          const p = parseMoneyInput(rawValue);
          const total = (Number(it.quantity) || 0) * p;
          return { ...it, unitPrice: p, total };
        }
        return it;
      });
      return stripDiscountLines(next);
    });
  };

  const applyDiscount = () => {
    const base = stripDiscountLines(items);
    const gross = sumLineTotals(base);
    if (gross <= 0) {
      alert("İskonto için önce pozitif tutarlı ürün satırları ekleyin.");
      return;
    }
    const pct = parseMoneyInput(discountPercent);
    const tl = parseMoneyInput(discountTl);
    const fromPct = gross * (pct / 100);
    const D = Math.min(gross, fromPct + tl);
    if (D <= 0) {
      alert("İskonto tutarı 0'dan büyük olmalıdır.");
      return;
    }
    const row = makeDiscountLineItem(D);
    if (!row) return;
    setItems([...base, row]);
  };

  const clearDiscount = () => {
    setItems((prev) => stripDiscountLines(prev));
    setDiscountPercent("");
    setDiscountTl("");
  };

  const removeLine = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const fillCollectionFull = () => {
    setCollectionAmount(String(totalAmount || 0));
  };

  const handleSave = async () => {
    const linesForSave = stripDiscountLines(items);
    if (linesForSave.length === 0) {
      alert("En az bir ürün/hizmet ekleyin.");
      return;
    }
    if (sumLineTotals(linesForSave) <= 0) {
      alert("Satış toplamı 0'dan büyük olmalıdır.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/business/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saleKind: "RETAIL",
          documentType: "ORDER",
          saleDate: new Date(saleDate).toISOString(),
          totalAmount,
          collectionAmount: totalCollected,
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

      router.push("/business/satislar");
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

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <BuildingStorefrontIcon className="h-4 w-4" />
              Perakende Satış
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
              Perakende Satış Oluştur
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Perakende satış için ürünleri ekleyin, tahsilatı belirleyin ve
              işlemi hızlıca kaydedin.
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
              {saving ? "Kaydediliyor..." : "Satış Kaydet"}
            </button>

            <Link
              href="/business/satislar"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <ArrowUturnLeftIcon className="h-4 w-4" />
              Geri Dön
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Satış Tipi"
          value="Perakende"
          sub="Cari bağlanmadan oluşturulan satış"
          icon={BuildingStorefrontIcon}
          tone="blue"
        />
        <StatCard
          title="Toplam Tutar"
          value={fmtTry(totalAmount)}
          sub="Eklenen satırların toplamı"
          icon={BanknotesIcon}
          tone="emerald"
        />
        <StatCard
          title="Tahsilat"
          value={fmtTry(totalCollected)}
          sub="İşleme yazılacak tahsilat"
          icon={DocumentTextIcon}
          tone="amber"
        />
        <StatCard
          title="Satır Sayısı"
          value={String(productLineCount)}
          sub="Ürün / hizmet satırı (iskonto ayrı gösterilir)"
          icon={CubeIcon}
          tone="slate"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/65">
              Perakende
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
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={label}>Toplam Tutar</label>
              <input
                type="text"
                className={inp}
                readOnly
                value={fmtTry(totalAmount)}
              />
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
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={label}>Tahsilat</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className={inp}
                  value={collectionAmount}
                  onChange={(e) =>
                    setCollectionAmount(e.target.value.replace(",", "."))
                  }
                  placeholder="0,00"
                />
                <button
                  type="button"
                  onClick={fillCollectionFull}
                  className="shrink-0 rounded-xl border border-emerald-700 bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  title="Toplamı tahsilat alanına aktar"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <label className={label}>Toplam Tahsil Edilen</label>
              <input
                type="text"
                className={inp}
                readOnly
                value={fmtTry(totalCollected)}
              />
            </div>

            <div>
              <label className={label}>Açıklama</label>
              <textarea
                className={inp}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Satış açıklaması..."
              />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-200 bg-emerald-600 px-5 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
              Ürün / Hizmetler
            </p>
            <h2 className="mt-1 text-lg font-bold">Satış kalemleri</h2>
          </div>

          <div className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,120px)_100px_110px]">
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
                <label className={label}>Birim fiyat (₺)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={inp}
                  value={selectedUnitPrice}
                  onChange={(e) => setSelectedUnitPrice(e.target.value)}
                  placeholder="0,00"
                  disabled={!selectedProduct}
                />
              </div>

              <div>
                <label className={label}>Miktar</label>
                <input
                  type="text"
                  inputMode="decimal"
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

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className={label}>Genel iskonto</p>
              <p className="mb-3 text-xs text-slate-500">
                Yüzde ve sabit TL birlikte uygulanır; toplam iskonto satış ara toplamını geçemez.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
                <div>
                  <label className={label}>İskonto %</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={inp}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className={label}>İskonto ₺</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={inp}
                    value={discountTl}
                    onChange={(e) => setDiscountTl(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyDiscount}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Uygula
                </button>
                <button
                  type="button"
                  onClick={clearDiscount}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Kaldır
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              {pageLoading ? (
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 font-semibold text-slate-700">
                        Ürün / Hizmet
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">
                        Miktar
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">
                        Birim Fiyat
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">
                        Toplam
                      </th>
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
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    Henüz satır eklenmedi
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Perakende satış için ürün veya hizmet ekleyin.
                  </p>
                </div>
              ) : (
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 font-semibold text-slate-700">
                        Ürün / Hizmet
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">
                        Miktar
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">
                        Birim Fiyat
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">
                        Toplam
                      </th>
                      <th className="w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, index) => (
                      <tr
                        key={it.id}
                        className={`border-b border-slate-100 ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        } ${it.isDiscount ? "bg-amber-50/40" : ""}`}
                      >
                        <td className="px-4 py-3.5 font-medium text-slate-900">
                          {it.name}
                          {it.isDiscount ? (
                            <span className="ml-2 text-[10px] font-bold uppercase text-amber-700">
                              İskonto
                            </span>
                          ) : null}
                        </td>
                        <td className="px-2 py-2 text-right">
                          {it.isDiscount ? (
                            <span className="inline-block px-2 py-1.5 text-sm tabular-nums text-slate-600">
                              1
                            </span>
                          ) : (
                            <input
                              type="text"
                              inputMode="decimal"
                              className={`${inp} w-24 text-right tabular-nums`}
                              value={String(it.quantity)}
                              onChange={(e) =>
                                updateLine(it.id, "quantity", e.target.value)
                              }
                            />
                          )}
                        </td>
                        <td className="px-2 py-2 text-right">
                          {it.isDiscount ? (
                            <span className="inline-block px-2 py-1.5 text-sm tabular-nums text-slate-700">
                              {fmtTry(it.unitPrice)}
                            </span>
                          ) : (
                            <input
                              type="text"
                              inputMode="decimal"
                              className={`${inp} w-28 text-right tabular-nums`}
                              value={String(it.unitPrice)}
                              onChange={(e) =>
                                updateLine(it.id, "unitPrice", e.target.value)
                              }
                            />
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                          {fmtTry(it.total)}
                        </td>
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