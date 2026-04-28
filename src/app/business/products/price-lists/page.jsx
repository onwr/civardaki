"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Copy,
  BarChart3,
  Check,
  Pencil,
  Trash2,
  Undo2,
  X,
  Loader2,
  AlertCircle,
  Search,
  Package,
  Tags,
  Boxes,
  Percent,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

function productCode(slug, id) {
  const digits = String(slug || "").replace(/\D/g, "");
  if (digits.length >= 4) return `PRD${digits.slice(-4)}`;
  const alnum = String(id || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  return `PRD${alnum.slice(-4).padStart(4, "0")}`;
}

function baseUnitPrice(price, discountPrice) {
  const d =
    discountPrice != null && Number.isFinite(Number(discountPrice))
      ? Number(discountPrice)
      : null;
  const p = price != null && Number.isFinite(Number(price)) ? Number(price) : 0;
  return d ?? p;
}

function listUnitPrice(base, discountRate) {
  const r = Number(discountRate) || 0;
  return base * (1 - Math.min(100, Math.max(0, r)) / 100);
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
    orange:
      "bg-orange-500 hover:bg-orange-600 border-orange-500 text-white",
    blue: "bg-sky-500 hover:bg-sky-600 border-sky-600 text-white",
    dark: "bg-slate-900 hover:bg-slate-800 border-slate-900 text-white",
    rose: "bg-rose-600 hover:bg-rose-700 border-rose-700 text-white",
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
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

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-56 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 md:px-5">
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 text-center md:px-5">
            <div className="mx-auto h-8 w-8 rounded bg-slate-200 animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
}

function ModalShell({ title, children, footer, onClose }) {
  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[100] bg-black/50"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-[101] w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                Fiyat Listesi
              </p>
              <h2 className="mt-1 text-lg font-bold">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-5">{children}</div>
        {footer ? <div className="border-t border-slate-100 px-5 py-4">{footer}</div> : null}
      </div>
    </>
  );
}

export default function PriceListsPage() {
  const [view, setView] = useState("list");
  const [isLoading, setIsLoading] = useState(true);
  const [priceLists, setPriceLists] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  const [activeListId, setActiveListId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const [newListName, setNewListName] = useState("");
  const [copySourceId, setCopySourceId] = useState("");
  const [copyNewName, setCopyNewName] = useState("");
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [bulkBrand, setBulkBrand] = useState("");

  const [addProductSelectKey, setAddProductSelectKey] = useState(0);

  const fetchPriceLists = useCallback(() => {
    return fetch("/api/business/price-lists")
      .then((r) => r.json())
      .then((data) => setPriceLists(Array.isArray(data) ? data : []))
      .catch(() => setPriceLists([]));
  }, []);

  const loadDetail = useCallback(async (id) => {
    if (!id) return;
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/business/price-lists/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Yüklenemedi");
      setDetail(data);
      setNameDraft(data.name || "");
    } catch (e) {
      toast.error(e.message || "Detay yüklenemedi.");
      setView("list");
      setActiveListId(null);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/business/products?status=all&limit=500")
      .then((r) => r.json())
      .then((data) => setProducts(data?.items ?? []))
      .catch(() => setProducts([]));

    fetch("/api/business/product-categories")
      .then((r) => r.json())
      .then((data) => setCategories(data?.items ?? []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetchPriceLists().finally(() => setIsLoading(false));
  }, [fetchPriceLists]);

  useEffect(() => {
    if (view === "detail" && activeListId) loadDetail(activeListId);
  }, [view, activeListId, loadDetail]);

  const openList = (id) => {
    setActiveListId(id);
    setView("detail");
  };

  const backToList = () => {
    setView("list");
    setActiveListId(null);
    setDetail(null);
    fetchPriceLists();
  };

  const createList = async (e) => {
    e?.preventDefault();
    const name = newListName.trim();
    if (name.length < 2) return toast.error("Liste adı en az 2 karakter olmalı.");

    setSaving(true);
    try {
      const res = await fetch("/api/business/price-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Oluşturulamadı.");

      toast.success("Fiyat listesi oluşturuldu.");
      setCreateModalOpen(false);
      setNewListName("");
      await fetchPriceLists();
      openList(data.id);
    } catch (err) {
      toast.error(err.message || "Hata.");
    } finally {
      setSaving(false);
    }
  };

  const copyList = async (e) => {
    e?.preventDefault();
    const name = copyNewName.trim();
    if (!copySourceId) return toast.error("Kopyalanacak listeyi seçin.");
    if (name.length < 2) return toast.error("Yeni liste adı girin.");

    setSaving(true);
    try {
      const res = await fetch("/api/business/price-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, copyFromId: copySourceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Kopyalanamadı.");

      toast.success("Liste kopyalandı.");
      setCopyModalOpen(false);
      setCopyNewName("");
      setCopySourceId("");
      await fetchPriceLists();
      openList(data.id);
    } catch (err) {
      toast.error(err.message || "Hata.");
    } finally {
      setSaving(false);
    }
  };

  const saveListName = async () => {
    const name = nameDraft.trim();
    if (name.length < 2) return toast.error("Liste adı en az 2 karakter olmalı.");
    if (!activeListId || !detail) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/business/price-lists/${activeListId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Kaydedilemedi.");

      toast.success("Kaydedildi.");
      setDetail((d) => (d ? { ...d, name: data.name } : d));
      await fetchPriceLists();
    } catch (e) {
      toast.error(e.message || "Hata.");
    } finally {
      setSaving(false);
    }
  };

  const reloadDetail = async () => {
    if (activeListId) await loadDetail(activeListId);
    await fetchPriceLists();
    toast.success("Liste sunucudan yenilendi.");
  };

  const deleteActiveList = async () => {
    if (!activeListId) return;
    if (!confirm("Bu fiyat listesini silmek istediğinize emin misiniz?")) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/business/price-lists/${activeListId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Silinemedi.");

      toast.success("Liste silindi.");
      backToList();
    } catch (e) {
      toast.error(e.message || "Silinemedi.");
    } finally {
      setSaving(false);
    }
  };

  const addProductToList = async (productId) => {
    if (!productId || !activeListId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/business/price-lists/${activeListId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addProductIds: [productId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Eklenemedi.");

      await loadDetail(activeListId);
      await fetchPriceLists();
      toast.success("Ürün eklendi.");
      setAddProductSelectKey((k) => k + 1);
    } catch (e) {
      toast.error(e.message || "Hata.");
    } finally {
      setSaving(false);
    }
  };

  const removeProductFromList = async (productId) => {
    if (!activeListId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/business/price-lists/${activeListId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeProductIds: [productId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Kaldırılamadı.");

      await loadDetail(activeListId);
      await fetchPriceLists();
      toast.success("Ürün listeden çıkarıldı.");
    } catch (e) {
      toast.error(e.message || "Hata.");
    } finally {
      setSaving(false);
    }
  };

  const bulkAddFiltered = async (e) => {
    e?.preventDefault();
    if (!bulkCategoryId && !bulkBrand) {
      return toast.error("En az bir filtre seçin: kategori veya marka.");
    }
    if (!activeListId) return;

    setSaving(true);
    try {
      const body = {};
      if (bulkCategoryId) body.addByCategoryId = bulkCategoryId;
      if (bulkBrand) body.addByBrand = bulkBrand;

      const res = await fetch(`/api/business/price-lists/${activeListId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Eklenemedi.");

      await loadDetail(activeListId);
      await fetchPriceLists();
      toast.success("Filtreye uyan ürünler listeye eklendi.");
      setBulkModalOpen(false);
      setBulkCategoryId("");
      setBulkBrand("");
    } catch (e) {
      toast.error(e.message || "Hata.");
    } finally {
      setSaving(false);
    }
  };

  const reportStub = () => toast.info("Fiyat listeleri raporu yakında.");

  const detailItems = detail?.items ?? [];
  const inListIds = useMemo(
    () => new Set(detailItems.map((i) => i.productId)),
    [detailItems]
  );

  const addableProducts = useMemo(
    () => products.filter((p) => !inListIds.has(p.id)),
    [products, inListIds]
  );

  const brandOptions = useMemo(() => {
    const set = new Set();
    for (const p of products) {
      const b = (p.brand ?? "").toString().trim();
      if (b) set.add(b);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "tr"));
  }, [products]);

  const listSummary = useMemo(() => {
    return {
      totalLists: priceLists.length,
      totalProducts: products.length,
      totalCategories: categories.length,
      readyLists: priceLists.length,
    };
  }, [priceLists, products, categories]);

  const detailSummary = useMemo(() => {
    return {
      itemCount: detailItems.length,
      discountRate: Number(detail?.discountRate || 0),
      addableCount: addableProducts.length,
      categoriesUsed: new Set(
        detailItems.map((i) => i.categoryId).filter(Boolean)
      ).size,
    };
  }, [detailItems, detail, addableProducts]);

  if (view === "detail" && activeListId) {
    return (
      <div className="min-h-[calc(100vh-8rem)] space-y-6 bg-slate-100/80 p-4 text-[13px] text-slate-800 antialiased md:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
            <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
                  <Tags className="h-4 w-4" />
                  Fiyat Listesi Detayı
                </div>

                <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
                  {detail?.name || "Fiyat Listesi"}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                  Liste adını düzenleyin, ürün ekleyin veya çıkarın ve bu listeye
                  özel fiyat yapısını yönetin.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ActionButton
                  onClick={saveListName}
                  icon={Check}
                  tone="green"
                  disabled={saving}
                >
                  Kaydet
                </ActionButton>

                <ActionButton
                  onClick={reloadDetail}
                  icon={Pencil}
                  tone="blue"
                >
                  Güncelle
                </ActionButton>

                <ActionButton
                  onClick={deleteActiveList}
                  icon={Trash2}
                  tone="rose"
                  disabled={saving}
                >
                  Listeyi sil
                </ActionButton>

                <ActionButton
                  onClick={backToList}
                  icon={Undo2}
                  tone="white"
                >
                  Geri dön
                </ActionButton>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Ürün Sayısı"
              value={String(detailSummary.itemCount)}
              sub="Bu listedeki toplam ürün"
              icon={Package}
              tone="blue"
            />
            <StatCard
              title="İndirim Oranı"
              value={`%${detailSummary.discountRate.toLocaleString("tr-TR")}`}
              sub="Liste bazlı oran"
              icon={Percent}
              tone="emerald"
            />
            <StatCard
              title="Eklenebilir Ürün"
              value={String(detailSummary.addableCount)}
              sub="Henüz listede olmayan"
              icon={Boxes}
              tone="amber"
            />
            <StatCard
              title="Kategori"
              value={String(detailSummary.categoriesUsed)}
              sub="Listede kullanılan kategori"
              icon={FileText}
              tone="slate"
            />
          </section>

          <SectionCard
            title="Bilgilendirme"
            subtitle="Liste mantığı ve çalışma biçimi"
          >
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <ol className="list-decimal space-y-2 pl-5">
                <li>Bu fiyat listesine özel fiyat girmek için ürün ekleyin.</li>
                <li>Bu fiyatların geçerli olmasını istediğiniz müşterilerin sayfasında bu listeyi seçin.</li>
              </ol>

              <div className="mt-4 flex gap-2 rounded-md border border-amber-300/60 bg-amber-100/50 p-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <p className="text-sm text-amber-950">
                  Eğer bir ürün bu fiyat listesinde yer almıyorsa, ürün kartındaki fiyat geçerli olur.
                  Sadece farklı fiyat uygulanacak ürünleri eklemeniz yeterlidir.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Liste Bilgisi"
            subtitle="Liste adı ve ürün ekleme alanı"
          >
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Liste Adı
                </label>
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base font-semibold text-slate-900 outline-none focus:border-slate-400"
                  placeholder="Liste adı"
                />
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Ürün Ekle
                </label>
                <select
                  key={addProductSelectKey}
                  defaultValue=""
                  disabled={detailLoading || saving || addableProducts.length === 0}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v) addProductToList(v);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-emerald-500/20 focus:ring-2"
                >
                  <option value="">
                    {addableProducts.length === 0
                      ? "Eklenecek ürün kalmadı"
                      : "Ürün seçin"}
                  </option>
                  {addableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/90 p-4">
                <ActionButton
                  onClick={() => setBulkModalOpen(true)}
                  icon={Plus}
                  tone="orange"
                >
                  Toplu ürün ekle
                </ActionButton>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Liste Ürünleri"
            subtitle="Bu fiyat listesine bağlı ürünler"
            right={
              <div className="text-xs font-semibold text-slate-500">
                İndirim: %{detailSummary.discountRate}
              </div>
            }
          >
            {detailLoading ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-900 text-white">
                      <th className="px-4 py-3 font-semibold md:px-5">Kod</th>
                      <th className="px-4 py-3 font-semibold md:px-5">Barkod</th>
                      <th className="px-4 py-3 font-semibold md:px-5">Ürün</th>
                      <th className="px-4 py-3 font-semibold md:px-5">Liste Fiyatı</th>
                      <th className="px-4 py-3 font-semibold md:px-5">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    <TableSkeleton />
                  </tbody>
                </table>
              </div>
            ) : detailItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-500">
                Bu listeye hiç ürün eklenmemiş.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-900 text-white">
                      <th className="px-4 py-3 font-semibold md:px-5">Kod</th>
                      <th className="px-4 py-3 font-semibold md:px-5">Barkod</th>
                      <th className="px-4 py-3 font-semibold md:px-5">Ürün</th>
                      <th className="px-4 py-3 font-semibold md:px-5">Liste Fiyatı (TL)</th>
                      <th className="w-16 px-4 py-3 font-semibold md:px-5">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailItems.map((row, i) => {
                      const base = baseUnitPrice(row.price, row.discountPrice);
                      const listed = listUnitPrice(base, detail.discountRate);

                      return (
                        <tr
                          key={row.id}
                          className={`border-b border-slate-100 ${
                            i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                          }`}
                        >
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-700 md:px-5">
                            {productCode(row.slug, row.productId)}
                          </td>
                          <td className="px-4 py-3.5 text-slate-400 md:px-5">—</td>
                          <td className="px-4 py-3.5 font-medium text-teal-700 md:px-5">
                            {row.productName}
                          </td>
                          <td className="px-4 py-3.5 font-semibold tabular-nums md:px-5">
                            {listed.toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-4 py-3.5 md:px-5">
                            <button
                              type="button"
                              onClick={() => removeProductFromList(row.productId)}
                              className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                              aria-label="Kaldır"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {bulkModalOpen ? (
            <ModalShell
              title="Ürün filtreleme"
              onClose={() => {
                setBulkModalOpen(false);
                setBulkCategoryId("");
                setBulkBrand("");
              }}
              footer={
                <div className="flex justify-end">
                  <ActionButton
                    onClick={bulkAddFiltered}
                    icon={Plus}
                    tone="green"
                    disabled={saving}
                  >
                    Listeye ekle
                  </ActionButton>
                </div>
              }
            >
              <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                Marka veya kategori seçerek (ikisini birden de kullanabilirsiniz) eşleşen tüm ürünleri listeye
                topluca ekleyin.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Marka
                  </label>
                  <select
                    value={bulkBrand}
                    onChange={(e) => setBulkBrand(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Tüm markalar</option>
                    {brandOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  {brandOptions.length === 0 ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Ürün kartlarına marka girildiğinde burada listelenir.
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Kategori
                  </label>
                  <select
                    value={bulkCategoryId}
                    onChange={(e) => setBulkCategoryId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Tüm kategoriler</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </ModalShell>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 bg-slate-100/80 p-4 text-[13px] text-slate-800 antialiased md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
                <Tags className="h-4 w-4" />
                Fiyat Listeleri
              </div>

              <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
                Özel Fiyat Listeleri
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                Müşterilere özel ürün fiyatları oluşturun, listeleri kopyalayın ve
                kategori bazlı ürün ekleyin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ActionButton
                onClick={() => {
                  setNewListName("");
                  setCreateModalOpen(true);
                }}
                icon={Plus}
                tone="green"
              >
                Yeni fiyat listesi ekle
              </ActionButton>

              <ActionButton
                onClick={() => {
                  setCopySourceId(priceLists[0]?.id ?? "");
                  setCopyNewName("");
                  setCopyModalOpen(true);
                }}
                icon={Copy}
                tone="orange"
              >
                Listeyi kopyala
              </ActionButton>

              <ActionButton
                onClick={reportStub}
                icon={BarChart3}
                tone="dark"
              >
                Fiyat listeleri raporu
              </ActionButton>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Toplam Liste"
            value={String(listSummary.totalLists)}
            sub="Tanımlı fiyat listesi"
            icon={Tags}
            tone="blue"
          />
          <StatCard
            title="Toplam Ürün"
            value={String(listSummary.totalProducts)}
            sub="Hesaptaki ürün sayısı"
            icon={Package}
            tone="emerald"
          />
          <StatCard
            title="Kategori"
            value={String(listSummary.totalCategories)}
            sub="Tanımlı kategori sayısı"
            icon={FileText}
            tone="amber"
          />
          <StatCard
            title="Hazır Liste"
            value={String(listSummary.readyLists)}
            sub="Kullanılabilir fiyat listesi"
            icon={Boxes}
            tone="slate"
          />
        </section>

        <SectionCard
          title="Bilgilendirme"
          subtitle="Özel fiyat listelerinin çalışma mantığı"
        >
          <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-amber-950">
                Özel fiyat listeleri
              </p>
              <p className="mt-2 text-sm leading-relaxed text-amber-950/95">
                Ürün sayfasındaki standart fiyatlarınız dışında, belirli müşterilere
                özel ürün fiyatları tanımlayabilir ve satış ekranında otomatik
                kullanılmasını sağlayabilirsiniz.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Fiyat Listeleri"
          subtitle="Açmak için listedeki karta tıklayın"
        >
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : priceLists.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-500">
              Henüz fiyat listesi yok.
            </div>
          ) : (
            <div className="space-y-3">
              {priceLists.map((pl, index) => (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => openList(pl.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    index % 2 === 0
                      ? "border-sky-100 bg-sky-50/90 text-slate-900"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                >
                  <span>{pl.name}</span>
                  <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-sky-700 shadow-sm">
                    Aç
                  </span>
                </button>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {createModalOpen ? (
        <ModalShell
          title="Yeni Liste"
          onClose={() => {
            setCreateModalOpen(false);
            setNewListName("");
          }}
          footer={
            <div className="flex justify-end gap-2">
              <ActionButton
                onClick={() => {
                  setCreateModalOpen(false);
                  setNewListName("");
                }}
                icon={X}
                tone="orange"
              >
                Vazgeç
              </ActionButton>
              <ActionButton
                onClick={createList}
                icon={Check}
                tone="green"
                disabled={saving}
              >
                Kaydet
              </ActionButton>
            </div>
          }
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Liste adı
            </label>
            <input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              placeholder="Liste adı"
            />
          </div>
        </ModalShell>
      ) : null}

      {copyModalOpen ? (
        <ModalShell
          title="Liste Kopyalama"
          onClose={() => {
            setCopyModalOpen(false);
            setCopyNewName("");
            setCopySourceId("");
          }}
          footer={
            <div className="flex justify-end">
              <ActionButton
                onClick={copyList}
                icon={Check}
                tone="green"
                disabled={saving}
              >
                Liste oluştur
              </ActionButton>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Kopyalanacak liste
              </label>
              <select
                value={copySourceId}
                onChange={(e) => setCopySourceId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              >
                <option value="">Seçin</option>
                {priceLists.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Yeni liste adı
              </label>
              <input
                value={copyNewName}
                onChange={(e) => setCopyNewName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                placeholder="Liste adı"
              />
            </div>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}