"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  Banknote,
  Pencil,
  ListChecks,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function WarehouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [warehouse, setWarehouse] = useState(null);
  const [items, setItems] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [hasNegative, setHasNegative] = useState(false);
  const [filter, setFilter] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [sectionOpen, setSectionOpen] = useState(true);
  const [warnDismissed, setWarnDismissed] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filter.trim()), 300);
    return () => clearTimeout(t);
  }, [filter]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (debouncedQ.length >= 1) q.set("q", debouncedQ);

      const [whRes, prodRes] = await Promise.all([
        fetch(`/api/business/warehouses/${id}`),
        fetch(`/api/business/warehouses/${id}/products?${q.toString()}`),
      ]);

      if (!whRes.ok) {
        if (whRes.status === 404) {
          toast.error("Depo bulunamadı.");
          router.push("/business/products/warehouses");
          return;
        }
        throw new Error("Yüklenemedi");
      }

      const wh = await whRes.json();
      setWarehouse(wh);
      setEditName(wh.name || "");

      const prodData = await prodRes.json();
      if (!prodRes.ok) throw new Error(prodData.message || "Ürünler alınamadı");

      setItems(prodData.items || []);
      setTotalValue(Number(prodData.totalValue) || 0);
      setHasNegative(!!prodData.hasNegative);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Veri yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [id, debouncedQ, router]);

  useEffect(() => {
    load();
  }, [load]);

  const saveName = async (e) => {
    e.preventDefault();
    const name = editName.trim();
    if (!name || name.length < 2) return toast.error("Depo adı en az 2 karakter.");
    setSaving(true);
    try {
      const res = await fetch(`/api/business/warehouses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Güncellenemedi");
      toast.success("Depo güncellendi.");
      setWarehouse(data);
      setEditOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const stubCount = () => toast.message("Stok sayımı yakında eklenecek.");

  if (loading && !warehouse) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#004aad]" />
      </div>
    );
  }

  if (!warehouse) return null;

  const showWarn = hasNegative && !warnDismissed;

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 pb-16 pt-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link
          href="/business/products/warehouses"
          className="font-medium text-[#004aad] hover:underline"
        >
          ← Depolar
        </Link>
      </div>

      <header className="rounded-lg bg-[#004aad] px-4 py-4 text-center text-white shadow sm:py-5">
        <h1 className="text-xl font-bold uppercase tracking-wide sm:text-2xl">
          {warehouse.name}
        </h1>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50 to-orange-50 px-4 py-4 shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/80 text-rose-500 shadow-sm">
          <Banknote className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-rose-800/90">
            Toplam Stok Değeri
          </p>
          <p className="text-lg font-bold text-rose-950">
            TL{" "}
            {totalValue.toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setEditName(warehouse.name);
            setEditOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-sky-300 bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-200"
        >
          <Pencil className="h-4 w-4" />
          Güncelle
        </button>
        <button
          type="button"
          onClick={stubCount}
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          <ListChecks className="h-4 w-4" />
          Stok Sayımı Yap
        </button>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setSectionOpen((o) => !o)}
          className="flex w-full items-center justify-between border-b border-slate-200 bg-slate-800 px-4 py-3 text-left text-white"
        >
          <span className="text-sm font-bold uppercase tracking-wide">
            DEPODAKİ ÜRÜNLER
          </span>
          {sectionOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {sectionOpen && (
          <div className="p-4">
            {showWarn && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-900">
                <span className="flex-1">
                  Hatalı stok bilgisi! Bu depoda stok miktarı sıfırın altında
                  olan ürün var.
                </span>
                <button
                  type="button"
                  onClick={() => setWarnDismissed(true)}
                  className="shrink-0 rounded p-1 hover:bg-rose-100"
                  aria-label="Kapat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Bul:</span>
              <input
                type="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="filtre"
                className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : items.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Bu kritere uygun ürün yok.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase text-slate-500">
                      <th className="py-2 pr-2">Kod</th>
                      <th className="py-2 pr-2">Barkod</th>
                      <th className="py-2 pr-2">Ürün</th>
                      <th className="py-2 pr-2 text-right">Miktar</th>
                      <th className="py-2 text-right">Değeri (TL)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row) => (
                      <tr
                        key={row.productId}
                        className="border-b border-slate-100 hover:bg-slate-50/80"
                      >
                        <td className="py-2.5 pr-2 font-mono text-xs text-slate-700">
                          {row.code}
                        </td>
                        <td className="py-2.5 pr-2 text-slate-500">
                          {row.barcode || "—"}
                        </td>
                        <td className="py-2.5 pr-2 font-medium text-teal-700">
                          {row.name}
                        </td>
                        <td
                          className={`py-2.5 pr-2 text-right tabular-nums ${
                            row.quantity < 0 ? "font-semibold text-slate-800" : ""
                          }`}
                        >
                          {row.quantity} ad
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-slate-800">
                          {row.lineValue.toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {editOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setEditOpen(false)}
            aria-label="Kapat"
          />
          <form
            onSubmit={saveName}
            className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
          >
            <h3 className="mb-3 text-lg font-bold text-slate-900">
              Depo adını güncelle
            </h3>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              minLength={2}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
