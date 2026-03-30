"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Check,
  X,
  Loader2,
  Package,
  Boxes,
  MapPin,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";

const emptyForm = () => ({ name: "" });

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
  tone = "green",
  className = "",
  type = "button",
  disabled = false,
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
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function WarehouseSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-4 w-36 rounded bg-slate-200 animate-pulse" />
          <div className="mt-2 h-3 w-20 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

export default function WarehousesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [apiError, setApiError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const fetchWarehouses = useCallback(async () => {
    try {
      setApiError(null);
      const res = await fetch("/api/business/warehouses");
      const data = await res.json();
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setApiError("Depolar yüklenemedi.");
      setWarehouses([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      try {
        await fetchWarehouses();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchWarehouses]);

  const openNew = () => {
    setForm(emptyForm());
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) setIsModalOpen(false);
  };

  const handleSubmitWarehouse = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    if (!name) return toast.error("Depo adı girin.");
    if (name.length < 2) return toast.error("Depo adı en az 2 karakter olmalı.");

    setSaving(true);
    try {
      const res = await fetch("/api/business/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address: null,
          capacity: null,
          currentStock: 0,
          manager: null,
          phone: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Oluşturulamadı.");

      toast.success("Depo oluşturuldu.");
      setForm(emptyForm());
      setIsModalOpen(false);
      await fetchWarehouses();
    } catch (err) {
      toast.error(err.message || "Depo oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    const total = warehouses.length;
    const withStock = warehouses.filter(
      (w) => Number(w?.currentStock || 0) > 0
    ).length;
    const totalStock = warehouses.reduce(
      (sum, w) => sum + Number(w?.currentStock || 0),
      0
    );
    const withAddress = warehouses.filter((w) => !!w?.address).length;

    return {
      total,
      withStock,
      totalStock,
      withAddress,
    };
  }, [warehouses]);

  const inp =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30";
  const label =
    "mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500";

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 bg-slate-100/80 p-4 text-[13px] text-slate-800 antialiased md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
                <Warehouse className="h-4 w-4" />
                Depo Yönetimi
              </div>

              <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
                Depolar
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                Depolarınızı yönetin, stok giriş noktalarını düzenleyin ve detay
                sayfalarına hızlıca geçin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ActionButton onClick={openNew} icon={Plus} tone="green">
                Yeni Depo Ekle
              </ActionButton>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Toplam Depo"
            value={String(summary.total)}
            sub="Tanımlı depo sayısı"
            icon={Warehouse}
            tone="blue"
          />
          <StatCard
            title="Stoklu Depo"
            value={String(summary.withStock)}
            sub="Stok bulunan depolar"
            icon={Boxes}
            tone="emerald"
          />
          <StatCard
            title="Toplam Stok"
            value={String(summary.totalStock)}
            sub="Depolardaki toplam stok"
            icon={Package}
            tone="amber"
          />
          <StatCard
            title="Adresli Depo"
            value={String(summary.withAddress)}
            sub="Adres bilgisi olan depolar"
            icon={MapPin}
            tone="slate"
          />
        </section>

        {apiError ? (
          <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                <X className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Veri alınırken bir hata oluştu</p>
                <p className="mt-1 text-sm leading-6">{apiError}</p>
              </div>
            </div>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Depo Listesi</h3>
              <p className="mt-1 text-sm text-slate-500">
                Detayları görmek için depo kartına tıklayın
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
                Kayıt: {warehouses.length}
              </span>
            </div>
          </div>

          <div className="p-4 md:p-5">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <WarehouseSkeleton key={i} />
                ))}
              </div>
            ) : warehouses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                  <Warehouse className="h-6 w-6" />
                </div>
                <h4 className="mt-4 text-base font-bold text-slate-900">
                  Henüz depo yok
                </h4>
                <p className="mt-2 text-sm text-slate-500">
                  İlk deponuzu eklemek için yukarıdaki butonu kullanın.
                </p>
                <button
                  type="button"
                  onClick={openNew}
                  className="mt-4 font-semibold text-emerald-600 underline"
                >
                  Yeni Depo Ekle
                </button>
              </div>
            ) : (
              <ul className="space-y-3">
                {warehouses.map((w, index) => (
                  <li key={w.id}>
                    <Link
                      href={`/business/products/warehouses/${w.id}`}
                      className={`block rounded-2xl border px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                        index % 2 === 0
                          ? "border-sky-100 bg-sky-50/90"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-bold text-slate-900">
                            {w.name}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>Stok: {Number(w.currentStock || 0)}</span>
                            {w.address ? (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="truncate">{w.address}</span>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <div className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-sky-700 shadow-sm">
                          Detay
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label="Kapat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeModal}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="depo-tanim-baslik"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                      Depo Tanımı
                    </p>
                    <h2 id="depo-tanim-baslik" className="mt-1 text-lg font-bold">
                      Yeni Depo
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
                    aria-label="Kapat"
                    disabled={saving}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitWarehouse} className="space-y-4 p-5">
                <div>
                  <label className={label}>Depo Adı</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className={inp}
                    placeholder="Örn: Ana Depo"
                    required
                    minLength={2}
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}  