"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Factory,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  Zap,
  Trash2,
  Search,
  CalendarDays,
  Plus,
  Package,
  Boxes,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { id: 1, label: "Üretilen Ürünü Seçin" },
  { id: 2, label: "İçerik Ürünleri Ekleyin" },
  { id: 3, label: "Kaydedin" },
];

function todayISODate() {
  return new Date().toISOString().split("T")[0];
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
  type = "button",
  disabled = false,
}) {
  const tones = {
    green:
      "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
    dark: "bg-slate-900 hover:bg-slate-800 border-slate-900 text-white",
    rose: "bg-rose-600 hover:bg-rose-700 border-rose-700 text-white",
    amber: "bg-amber-500 hover:bg-amber-600 border-amber-500 text-white",
    teal: "bg-teal-600 hover:bg-teal-700 border-teal-700 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Stepper({ wizardStep }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {STEPS.map((s, idx) => {
          const active = wizardStep === s.id;
          const done = wizardStep > s.id;

          return (
            <div
              key={s.id}
              className={`relative flex items-center justify-center px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.14em] ${
                active
                  ? "bg-slate-900 text-white"
                  : done
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-white text-slate-400"
              } ${idx !== STEPS.length - 1 ? "border-b md:border-b-0 md:border-r border-slate-200" : ""}`}
            >
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px]">
                {done ? "✓" : s.id}
              </span>
              {s.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
        >
          <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
          <div className="mt-2 h-3 w-56 rounded bg-slate-100 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function ProductionPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [production, setProduction] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [saving, setSaving] = useState(false);

  const [wizardStep, setWizardStep] = useState(1);
  const [selectedOutputProductId, setSelectedOutputProductId] = useState("");

  const [productionModalOpen, setProductionModalOpen] = useState(false);
  const [prodDate, setProdDate] = useState(todayISODate);
  const [outputQty, setOutputQty] = useState("");
  const [outputWarehouseId, setOutputWarehouseId] = useState("");
  const [outputDescription, setOutputDescription] = useState("");

  const [ingredientModalOpen, setIngredientModalOpen] = useState(false);
  const [ingredientProductId, setIngredientProductId] = useState("");
  const [ingredientSelectReset, setIngredientSelectReset] = useState(0);
  const [lineVariantId, setLineVariantId] = useState("");
  const [lineQty, setLineQty] = useState("1");
  const [lineUnitCost, setLineUnitCost] = useState("0");
  const [lineWarehouseId, setLineWarehouseId] = useState("");
  const [lineDescription, setLineDescription] = useState("");
  const [warehouseStockHint, setWarehouseStockHint] = useState(null);

  const [lines, setLines] = useState([]);

  const fetchProduction = useCallback(() => {
    return fetch("/api/business/production")
      .then((r) => r.json())
      .then((data) => setProduction(Array.isArray(data) ? data : []))
      .catch(() => setProduction([]));
  }, []);

  useEffect(() => {
    fetch("/api/business/products?status=all&limit=200")
      .then((r) => r.json())
      .then((data) => setProducts(data?.items ?? []))
      .catch(() => setProducts([]));

    fetch("/api/business/warehouses")
      .then((r) => r.json())
      .then((data) => setWarehouses(Array.isArray(data) ? data : []))
      .catch(() => setWarehouses([]));
  }, []);

  useEffect(() => {
    fetchProduction().finally(() => setIsLoading(false));
  }, [fetchProduction]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedOutputProductId) ?? null,
    [products, selectedOutputProductId]
  );

  const hadProductionForSelected = useMemo(() => {
    if (!selectedOutputProductId) return false;
    return production.some((p) => p.productId === selectedOutputProductId);
  }, [production, selectedOutputProductId]);

  const ingredientProduct = useMemo(
    () => products.find((p) => p.id === ingredientProductId) ?? null,
    [products, ingredientProductId]
  );

  const variants = ingredientProduct?.variants ?? [];

  useEffect(() => {
    if (!ingredientModalOpen || !lineWarehouseId || !ingredientProductId) {
      setWarehouseStockHint(null);
      return;
    }

    let cancelled = false;

    fetch(`/api/business/warehouses/${lineWarehouseId}/products`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const row = data.items?.find((i) => i.productId === ingredientProductId);
        setWarehouseStockHint(row?.quantity ?? null);
      })
      .catch(() => setWarehouseStockHint(null));

    return () => {
      cancelled = true;
    };
  }, [ingredientModalOpen, lineWarehouseId, ingredientProductId]);

  const openProductionModal = (opts = { reset: true }) => {
    if (!selectedOutputProductId) {
      toast.error("Önce üretilen ürünü seçin.");
      return;
    }

    if (opts.reset) {
      setProdDate(todayISODate());
      setOutputQty("");
      setOutputWarehouseId("");
      setOutputDescription("");
    }

    setProductionModalOpen(true);
  };

  const continueFromProductionModal = () => {
    const q = Number(String(outputQty).replace(",", "."));

    if (!Number.isFinite(q) || q <= 0) {
      toast.error("Geçerli bir üretim miktarı girin.");
      return;
    }

    if (!outputWarehouseId) {
      toast.error("Çıktının gireceği depoyu seçin.");
      return;
    }

    setProductionModalOpen(false);
    setWizardStep(2);
  };

  const openIngredientForProduct = (pid) => {
    if (!pid) return;
    setIngredientProductId(pid);
    setLineVariantId("");
    setLineQty("1");
    setLineUnitCost("0");
    setLineWarehouseId(warehouses[0]?.id ?? "");
    setLineDescription("");
    setIngredientModalOpen(true);
  };

  const addIngredientLine = () => {
    const q = Number(String(lineQty).replace(",", "."));
    const uc = Number(String(lineUnitCost).replace(",", "."));

    if (!ingredientProduct) {
      toast.error("Ürün bulunamadı.");
      return;
    }

    if (!Number.isFinite(q) || q <= 0) {
      toast.error("Kullanılan miktar girin.");
      return;
    }

    if (!lineWarehouseId) {
      toast.error("Depo seçin.");
      return;
    }

    if (variants.length > 0 && !lineVariantId) {
      toast.error("Varyant seçin.");
      return;
    }

    const wh = warehouses.find((w) => w.id === lineWarehouseId);
    const variant = variants.find((v) => v.id === lineVariantId);
    const lineCost = q * (Number.isFinite(uc) ? uc : 0);
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `ln-${Date.now()}`;

    setLines((prev) => [
      ...prev,
      {
        id,
        productId: ingredientProduct.id,
        productName: ingredientProduct.name,
        warehouseId: lineWarehouseId,
        warehouseName: wh?.name ?? "",
        productVariantId: lineVariantId || null,
        variantName: variant?.name ?? null,
        quantity: q,
        unitCost: Number.isFinite(uc) ? uc : 0,
        lineCost,
        description: lineDescription.trim() || "",
      },
    ]);

    setIngredientModalOpen(false);
    setIngredientProductId("");
    setIngredientSelectReset((n) => n + 1);
    toast.success("Satır eklendi.");
  };

  const removeLine = (id) => setLines((prev) => prev.filter((l) => l.id !== id));

  const totalLineCost = useMemo(
    () => lines.reduce((s, l) => s + l.lineCost, 0),
    [lines]
  );

  const outputQtyNum = useMemo(() => {
    const q = Number(String(outputQty).replace(",", "."));
    return Number.isFinite(q) ? q : 0;
  }, [outputQty]);

  const submitProduction = async () => {
    if (!selectedOutputProductId || outputQtyNum <= 0 || !outputWarehouseId) {
      toast.error("Eksik üretim bilgisi.");
      return;
    }

    if (lines.length === 0) {
      toast.error("En az bir içerik ürünü ekleyin.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/business/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedOutputProductId,
          quantity: outputQtyNum,
          unit: "adet",
          startDate: prodDate,
          endDate: prodDate,
          outputWarehouseId,
          description: outputDescription.trim() || null,
          lines: lines.map((l) => ({
            productId: l.productId,
            warehouseId: l.warehouseId,
            quantity: l.quantity,
            unitCost: l.unitCost,
            description: l.description || null,
            productVariantId: l.productVariantId,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Kaydedilemedi.");

      toast.success("Üretim kaydedildi.");

      setWizardStep(1);
      setSelectedOutputProductId("");
      setLines([]);
      setOutputQty("");
      setOutputDescription("");
      setOutputWarehouseId("");

      await fetchProduction();
    } catch (e) {
      toast.error(e.message || "Kayıt başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const filteredProduction = production.filter((prod) => {
    const matchesSearch =
      (prod.productName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.status || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && prod.status === "COMPLETED") ||
      (filterStatus === "in_progress" && prod.status === "IN_PROGRESS");

    return matchesSearch && matchesStatus;
  });

  const totalCost = production.reduce((sum, p) => sum + (p.cost || 0), 0);
  const totalQuantity = production.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const completedCount = production.filter((p) => p.status === "COMPLETED").length;

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-400";
  const labelCls = "mb-1.5 block text-xs font-semibold text-slate-600";

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 bg-slate-100/80 p-4 text-[13px] text-slate-800 antialiased md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
                <Factory className="h-4 w-4" />
                Üretim Yönetimi
              </div>

              <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
                Üretim
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                Üretilen ürünü seçin, içerik satırlarını ekleyin ve üretim kaydını
                tamamlayın. Geçmiş üretimleri de aynı ekrandan takip edin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {wizardStep === 1 ? (
                <ActionButton
                  onClick={() => openProductionModal()}
                  icon={Plus}
                  tone="green"
                  disabled={!selectedOutputProductId}
                >
                  Yeni Üretim Yap
                </ActionButton>
              ) : wizardStep === 2 ? (
                <ActionButton
                  onClick={() => {
                    if (lines.length === 0) {
                      toast.error("Önce içerik ürünleri ekleyin.");
                      return;
                    }
                    setWizardStep(3);
                  }}
                  icon={ChevronRight}
                  tone="rose"
                >
                  Üretimi Tamamla
                </ActionButton>
              ) : (
                <ActionButton
                  onClick={submitProduction}
                  icon={CheckCircle2}
                  tone="green"
                  disabled={saving}
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </ActionButton>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Toplam Kayıt"
            value={String(production.length)}
            sub="Kayıtlı üretim sayısı"
            icon={ClipboardList}
            tone="blue"
          />
          <StatCard
            title="Toplam Maliyet"
            value={`${totalCost.toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
            })} ₺`}
            sub="Tüm üretim maliyeti"
            icon={Factory}
            tone="emerald"
          />
          <StatCard
            title="Toplam Üretim"
            value={`${totalQuantity.toLocaleString("tr-TR")} Adet`}
            sub="Kayıtlı üretim miktarı"
            icon={Boxes}
            tone="amber"
          />
          <StatCard
            title="Tamamlanan"
            value={String(completedCount)}
            sub="COMPLETED durumundaki kayıt"
            icon={Package}
            tone="slate"
          />
        </section>

        <Stepper wizardStep={wizardStep} />

        {wizardStep === 1 && (
          <SectionCard
            title="Üretilen Ürünü Seçin"
            subtitle="Üretim yapılacak nihai ürünü listeden seçin"
          >
            <div className="space-y-5">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                Üretimini yaptığınız ürünü aşağıdaki listeden seçin.
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <label className={labelCls}>Ürün</label>
                  <select
                    value={selectedOutputProductId}
                    onChange={(e) => setSelectedOutputProductId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Ürün seçin</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <ActionButton
                  onClick={() => openProductionModal()}
                  icon={Zap}
                  tone="rose"
                  disabled={!selectedOutputProductId}
                >
                  Yeni Üretim Yap
                </ActionButton>
              </div>

              {selectedOutputProductId && !hadProductionForSelected && (
                <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                  Bu üründen daha önce hiç üretim yapılmamış.
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {wizardStep === 2 && selectedProduct && (
          <SectionCard
            title="İçerik Ürünleri"
            subtitle="Üretimde kullanılan ürün ve hizmetleri satır satır ekleyin"
            right={
              <ActionButton
                onClick={() => setWizardStep(1)}
                icon={ChevronLeft}
                tone="amber"
              >
                Geri
              </ActionButton>
            }
          >
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  Üretim tarihi
                </label>
                <input
                  type="date"
                  value={prodDate}
                  onChange={(e) => setProdDate(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <p>
                  <strong>{outputQtyNum || "—"}</strong> adet{" "}
                  <strong>{selectedProduct.name}</strong> üretmek için kullandığınız
                  ürünleri ekleyin.
                </p>
                <button
                  type="button"
                  onClick={() => openProductionModal({ reset: false })}
                  className="mt-3 text-left text-sm font-semibold text-emerald-700 underline hover:text-emerald-800"
                >
                  Üretim miktarını ve açıklamayı değiştirmek için tıklayın.
                </button>
              </div>

              <div>
                <label className={labelCls}>İçerik için ürün seçin</label>
                <select
                  key={ingredientSelectReset}
                  defaultValue=""
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v) openIngredientForProduct(v);
                  }}
                  className={inputCls}
                >
                  <option value="">Ürün seçin</option>
                  {products
                    .filter((p) => p.id !== selectedOutputProductId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>

              {lines.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        <th className="px-3 py-3">Ürün</th>
                        <th className="px-3 py-3">Depo</th>
                        <th className="px-3 py-3">Miktar</th>
                        <th className="px-3 py-3">Birim Maliyet</th>
                        <th className="px-3 py-3">Satır Maliyeti</th>
                        <th className="px-3 py-3">Açıklama</th>
                        <th className="w-12 px-2 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l, i) => (
                        <tr
                          key={l.id}
                          className={i % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                        >
                          <td className="px-3 py-3 font-medium text-slate-900">
                            {l.productName}
                            {l.variantName ? (
                              <span className="block text-xs font-normal text-slate-500">
                                {l.variantName}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-3 py-3 text-slate-700">{l.warehouseName}</td>
                          <td className="px-3 py-3">
                            {l.quantity.toLocaleString("tr-TR")} Adet
                          </td>
                          <td className="px-3 py-3">
                            {l.unitCost.toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-3 py-3 font-semibold">
                            {l.lineCost.toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            className="max-w-[180px] truncate px-3 py-3 text-slate-600"
                            title={l.description}
                          >
                            {l.description || "—"}
                          </td>
                          <td className="px-2 py-3">
                            <button
                              type="button"
                              onClick={() => removeLine(l.id)}
                              className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                              aria-label="Satırı sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-slate-100 font-semibold">
                        <td colSpan={4} className="px-3 py-3 text-right">
                          {outputQtyNum || "—"} adet için toplam maliyet
                        </td>
                        <td className="px-3 py-3" colSpan={3}>
                          {totalLineCost.toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          ₺
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  Henüz içerik satırı eklenmedi.
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <ActionButton
                  onClick={() => {
                    if (lines.length === 0) {
                      toast.error("Önce içerik ürünleri ekleyin.");
                      return;
                    }
                    setWizardStep(3);
                  }}
                  icon={ChevronRight}
                  tone="rose"
                >
                  Üretimi Tamamla
                </ActionButton>
              </div>
            </div>
          </SectionCard>
        )}

        {wizardStep === 3 && selectedProduct && (
          <SectionCard
            title="Özet ve Kayıt"
            subtitle="Üretim kaydı öncesi son kontrol"
            right={
              <ActionButton
                onClick={() => setWizardStep(2)}
                icon={ChevronLeft}
                tone="amber"
              >
                Geri
              </ActionButton>
            }
          >
            <div className="space-y-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Üretilen ürün
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {selectedProduct.name}
                  </dd>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Miktar
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {outputQtyNum} adet
                  </dd>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Tarih
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {prodDate
                      ? new Date(prodDate + "T12:00:00").toLocaleDateString("tr-TR")
                      : "—"}
                  </dd>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Çıktı deposu
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {warehouses.find((w) => w.id === outputWarehouseId)?.name ?? "—"}
                  </dd>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-3 sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Açıklama
                  </dt>
                  <dd className="mt-1 text-slate-700">
                    {outputDescription.trim() || "—"}
                  </dd>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-3 sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    İçerik özeti
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {lines.length} kalem — toplam{" "}
                    {totalLineCost.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </dd>
                </div>
              </dl>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <ActionButton
                  onClick={submitProduction}
                  icon={CheckCircle2}
                  tone="green"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    "Kaydet"
                  )}
                </ActionButton>
              </div>
            </div>
          </SectionCard>
        )}

        <SectionCard
          title="Üretim Geçmişi"
          subtitle="Kayıtlı üretimleri arayın ve duruma göre filtreleyin"
        >
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
              >
                <option value="all">Tüm durumlar</option>
                <option value="completed">Tamamlananlar</option>
                <option value="in_progress">Devam edenler</option>
              </select>
            </div>

            {isLoading ? (
              <HistorySkeleton />
            ) : filteredProduction.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-500">
                Kayıt yok.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProduction.map((prod, index) => (
                  <div
                    key={prod.id}
                    className={`flex flex-col gap-2 rounded-xl border px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
                      index % 2 === 0
                        ? "border-sky-100 bg-sky-50/80"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{prod.productName}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(prod.startDate).toLocaleDateString("tr-TR")} ·{" "}
                        {prod.quantity} {prod.unit} ·{" "}
                        {(prod.cost ?? 0).toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        ₺
                        {prod.lineCount != null ? ` · ${prod.lineCount} içerik` : ""}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                        prod.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {prod.status === "COMPLETED" ? "Tamamlandı" : "Devam ediyor"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {productionModalOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[100] bg-black/50"
            aria-label="Kapat"
            onClick={() => setProductionModalOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-[101] w-[min(100%,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                    Üretim Bilgisi
                  </p>
                  <h2 className="mt-1 text-lg font-bold">Üretim</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setProductionModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
                  aria-label="Kapat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
              <div>
                <label className={labelCls}>Üretim tarihi</label>
                <input
                  type="date"
                  value={prodDate}
                  onChange={(e) => setProdDate(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Üretim miktarı (Adet)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={outputQty}
                  onChange={(e) => setOutputQty(e.target.value)}
                  className={inputCls}
                  placeholder="0"
                />
              </div>

              <div>
                <label className={labelCls}>Çıktının gireceği depo</label>
                <select
                  value={outputWarehouseId}
                  onChange={(e) => setOutputWarehouseId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Depo seçin</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Açıklama</label>
                <textarea
                  value={outputDescription}
                  onChange={(e) => setOutputDescription(e.target.value)}
                  rows={3}
                  placeholder="İsteğe bağlı"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <ActionButton
                onClick={() => setProductionModalOpen(false)}
                icon={X}
                tone="amber"
              >
                Vazgeç
              </ActionButton>
              <ActionButton
                onClick={continueFromProductionModal}
                icon={ChevronRight}
                tone="green"
              >
                Devam Et
              </ActionButton>
            </div>
          </div>
        </>
      )}

      {ingredientModalOpen && ingredientProduct && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[100] bg-black/50"
            aria-label="Kapat"
            onClick={() => {
              setIngredientModalOpen(false);
              setIngredientSelectReset((n) => n + 1);
            }}
          />
          <div className="fixed left-1/2 top-1/2 z-[101] w-[min(100%,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                    İçerik Satırı
                  </p>
                  <h2 className="mt-1 text-lg font-bold">Üretim İçeriği</h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIngredientModalOpen(false);
                    setIngredientSelectReset((n) => n + 1);
                  }}
                  className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
                  aria-label="Kapat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
              {variants.length > 0 && (
                <div>
                  <label className={labelCls}>Kullandığınız varyant</label>
                  <select
                    value={lineVariantId}
                    onChange={(e) => setLineVariantId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Seçin</option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.stock ?? 0} ad)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className={labelCls}>Kullanılan miktar (Adet)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={lineQty}
                  onChange={(e) => setLineQty(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Birim maliyet</label>
                <div className="flex rounded-xl border border-slate-200 bg-slate-50">
                  <span className="flex items-center border-r border-slate-200 px-3 text-sm text-slate-600">
                    TL
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={lineUnitCost}
                    onChange={(e) => setLineUnitCost(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                    placeholder="0,0000"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Kullanılan depo</label>
                <select
                  value={lineWarehouseId}
                  onChange={(e) => setLineWarehouseId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Depo seçin</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                {lineWarehouseId && warehouseStockHint != null && (
                  <p className="mt-1 text-xs text-slate-500">
                    Bu depoda stok: {warehouseStockHint} adet
                  </p>
                )}
              </div>

              <div>
                <label className={labelCls}>Açıklama</label>
                <textarea
                  value={lineDescription}
                  onChange={(e) => setLineDescription(e.target.value)}
                  rows={3}
                  placeholder="İsteğe bağlı açıklama..."
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <ActionButton
                onClick={() => {
                  setIngredientModalOpen(false);
                  setIngredientSelectReset((n) => n + 1);
                }}
                icon={X}
                tone="amber"
              >
                Vazgeç
              </ActionButton>
              <ActionButton onClick={addIngredientLine} icon={Plus} tone="green">
                Ekle
              </ActionButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}