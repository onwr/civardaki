"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Search,
  BookOpen,
  Copy,
  Mail,
  ArrowLeft,
  Check,
  AlertCircle,
  Tags,
  Package,
  Boxes,
  FileText,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

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
    rose: "bg-rose-600 hover:bg-rose-700 border-rose-700 text-white",
    amber:
      "bg-amber-400 hover:bg-amber-500 border-amber-500 text-slate-900",
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
    dark: "bg-slate-900 hover:bg-slate-800 border-slate-900 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition ${tones[tone]} ${
        disabled ? "pointer-events-none opacity-50" : ""
      } ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      {children}
    </button>
  );
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
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
          <div className="mt-2 h-3 w-64 rounded bg-slate-100 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function ModalShell({ title, children, onClose, footer, wide = false }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)] ${
          wide ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                Katalog
              </p>
              <h2 className="mt-1 text-lg font-bold">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer ? (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const defaultDefinition = {
  name: "",
  description: "",
  priceListId: "",
  priceDisplay: "SHOW_SALES",
  brandDisplay: "HIDE",
  stockQtyDisplay: "HIDE",
  stockFilter: "ALL",
  sortOrder: "BY_NAME",
};

export default function CatalogsPage() {
  const [view, setView] = useState("list");
  const [activeCatalogId, setActiveCatalogId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [catalogs, setCatalogs] = useState([]);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [priceLists, setPriceLists] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  const [defModalOpen, setDefModalOpen] = useState(false);
  const [defMode, setDefMode] = useState("create");
  const [definition, setDefinition] = useState(defaultDefinition);

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [bulkBrand, setBulkBrand] = useState("");

  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [addProductSelectKey, setAddProductSelectKey] = useState(0);

  useEffect(() => {
    fetch("/api/business/products?status=all&limit=500")
      .then((r) => r.json())
      .then((data) => setProducts(data?.items ?? []))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    fetch("/api/business/price-lists")
      .then((r) => r.json())
      .then((data) => setPriceLists(Array.isArray(data) ? data : []))
      .catch(() => setPriceLists([]));
  }, []);

  useEffect(() => {
    fetch("/api/business/product-categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data?.items) ? data.items : []))
      .catch(() => setCategories([]));
  }, []);

  const fetchCatalogs = useCallback(() => {
    return fetch("/api/business/catalogs")
      .then((r) => r.json())
      .then((data) => setCatalogs(Array.isArray(data) ? data : []))
      .catch(() => setCatalogs([]));
  }, []);

  useEffect(() => {
    fetchCatalogs().finally(() => setIsLoading(false));
  }, [fetchCatalogs]);

  const loadDetail = useCallback(async (id) => {
    if (!id) return;
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/business/catalogs/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Yüklenemedi.");
      setDetail(data);
    } catch (e) {
      toast.error(e.message || "Detay yüklenemedi.");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openCreateDefinition = () => {
    setDefMode("create");
    setDefinition(defaultDefinition);
    setDefModalOpen(true);
  };

  const openEditDefinition = () => {
    if (!detail) return;
    const disp = detail.priceDisplay || "SHOW_SALES";
    let sort = detail.sortOrder || "BY_NAME";
    if (disp === "HIDE" && (sort === "PRICE_ASC" || sort === "PRICE_DESC")) {
      sort = "BY_NAME";
    }

    setDefMode("edit");
    setDefinition({
      name: detail.name || "",
      description: detail.description || "",
      priceListId: disp === "HIDE" ? "" : detail.priceListId || "",
      priceDisplay: disp,
      brandDisplay: detail.brandDisplay || "HIDE",
      stockQtyDisplay: detail.stockQtyDisplay || "HIDE",
      stockFilter: detail.stockFilter || "ALL",
      sortOrder: sort,
    });
    setDefModalOpen(true);
  };

  const saveDefinition = async (e) => {
    e?.preventDefault();
    const name = definition.name.trim();
    if (name.length < 2) return toast.error("Katalog adı en az 2 karakter olmalı.");

    const body = {
      name,
      description: definition.description.trim() || null,
      priceListId:
        definition.priceDisplay === "HIDE" ? null : definition.priceListId || null,
      priceDisplay: definition.priceDisplay,
      brandDisplay: definition.brandDisplay,
      stockQtyDisplay: definition.stockQtyDisplay,
      stockFilter: definition.stockFilter,
      sortOrder: definition.sortOrder,
    };

    setSaving(true);
    try {
      if (defMode === "create") {
        const res = await fetch("/api/business/catalogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Oluşturulamadı.");

        toast.success("Katalog oluşturuldu.");
        setDefModalOpen(false);
        await fetchCatalogs();
        setActiveCatalogId(data.id);
        setView("detail");
        await loadDetail(data.id);
      } else if (activeCatalogId) {
        const res = await fetch(`/api/business/catalogs/${activeCatalogId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Güncellenemedi.");

        toast.success("Katalog güncellendi.");
        setDefModalOpen(false);
        setDetail(data);
        await fetchCatalogs();
      }
    } catch (err) {
      toast.error(err.message || "İşlem başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const publishCatalog = async () => {
    if (!activeCatalogId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/business/catalogs/${activeCatalogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Yayınlanamadı.");
      setDetail(data);
      await fetchCatalogs();
      toast.success("Katalog yayına alındı.");
    } catch (e) {
      toast.error(e.message || "Yayınlanamadı.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCatalog = async () => {
    if (!activeCatalogId) return;
    if (!confirm("Bu kataloğu silmek istediğinize emin misiniz?")) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/business/catalogs/${activeCatalogId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Silinemedi.");
      }
      toast.success("Katalog silindi.");
      setView("list");
      setActiveCatalogId(null);
      setDetail(null);
      await fetchCatalogs();
    } catch (e) {
      toast.error(e.message || "Silinemedi.");
    } finally {
      setSaving(false);
    }
  };

  const addProductToCatalog = async (productId) => {
    if (!activeCatalogId || !productId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/business/catalogs/${activeCatalogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addProductIds: [productId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Eklenemedi.");
      setDetail(data);
      await fetchCatalogs();
      toast.success("Ürün kataloğa eklendi.");
      setAddProductSelectKey((k) => k + 1);
      setAddProductModalOpen(false);
    } catch (e) {
      toast.error(e.message || "Eklenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const removeProductFromCatalog = async (productId) => {
    if (!activeCatalogId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/business/catalogs/${activeCatalogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeProductIds: [productId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Kaldırılamadı.");
      setDetail(data);
      await fetchCatalogs();
      toast.success("Ürün katalogdan çıkarıldı.");
    } catch (e) {
      toast.error(e.message || "Kaldırılamadı.");
    } finally {
      setSaving(false);
    }
  };

  const bulkAddFiltered = async (e) => {
    e?.preventDefault();
    if (!bulkCategoryId && !bulkBrand) {
      return toast.error("En az bir filtre seçin: kategori veya marka.");
    }
    if (!activeCatalogId) return;

    setSaving(true);
    try {
      const body = {};
      if (bulkCategoryId) body.addByCategoryId = bulkCategoryId;
      if (bulkBrand) body.addByBrand = bulkBrand;

      const res = await fetch(`/api/business/catalogs/${activeCatalogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Eklenemedi.");
      setDetail(data);
      await fetchCatalogs();
      toast.success("Filtreye uyan ürünler eklendi.");
      setBulkModalOpen(false);
      setBulkCategoryId("");
      setBulkBrand("");
    } catch (err) {
      toast.error(err.message || "Hata.");
    } finally {
      setSaving(false);
    }
  };

  const copyShareUrl = () => {
    const url = detail?.publicCatalogUrl || detail?.shareUrl;
    if (!url) return toast.error("Paylaşım adresi yok.");
    navigator.clipboard.writeText(url).then(
      () => toast.success("Adres panoya kopyalandı."),
      () => toast.error("Kopyalanamadı.")
    );
  };

  const shareByEmail = () => {
    const url = detail?.publicCatalogUrl || detail?.shareUrl;
    if (!url) return toast.error("Paylaşım adresi yok.");
    const subject = encodeURIComponent(
      detail?.name ? `Katalog: ${detail.name}` : "Ürün kataloğum"
    );
    const body = encodeURIComponent(
      `Merhaba,\n\nGüncel kataloğumu buradan inceleyebilirsiniz:\n${url}\n`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const enterDetail = async (id) => {
    setActiveCatalogId(id);
    setView("detail");
    await loadDetail(id);
  };

  const backToList = () => {
    setView("list");
    setActiveCatalogId(null);
    setDetail(null);
    fetchCatalogs();
  };

  const filteredCatalogs = useMemo(
    () =>
      catalogs.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cat.description || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [catalogs, searchTerm]
  );

  const detailProductIds = detail?.productIds ?? [];
  const inCatalogIds = useMemo(() => new Set(detailProductIds), [detailProductIds]);

  const detailRows = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return detailProductIds.map((id) => byId.get(id)).filter(Boolean);
  }, [detailProductIds, products]);

  const addableProducts = useMemo(
    () => products.filter((p) => !inCatalogIds.has(p.id)),
    [products, inCatalogIds]
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
      totalCatalogs: catalogs.length,
      totalProducts: products.length,
      totalCategories: categories.length,
      publishedCount: catalogs.filter((c) => c.isPublished).length,
    };
  }, [catalogs, products, categories]);

  const detailSummary = useMemo(() => {
    return {
      productCount: detailRows.length,
      published: detail?.isPublished ? "Yayında" : "Taslak",
      priceMode:
        detail?.priceDisplay === "HIDE" ? "Fiyat gizli" : "Fiyat gösteriliyor",
      stockMode:
        detail?.stockFilter === "IN_STOCK_ONLY"
          ? "Sadece stoktakiler"
          : "Tüm ürünler",
    };
  }, [detailRows.length, detail]);

  if (view === "detail" && activeCatalogId) {
    const shareUrl = detail?.publicCatalogUrl || detail?.shareUrl;

    return (
      <div className="min-h-[calc(100vh-8rem)] space-y-6 bg-slate-100/80 p-4 text-[13px] text-slate-800 antialiased md:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <button
            type="button"
            onClick={backToList}
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Katalog listesine dön
          </button>

          <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
            <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
                  <BookOpen className="h-4 w-4" />
                  Katalog Detayı
                </div>

                <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
                  {detail?.name || "Katalog"}
                </h1>

                {detail?.description ? (
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                    {detail.description}
                  </p>
                ) : (
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                    Katalog ayarlarını yönetin, ürün ekleyin ve paylaşım bağlantısını kullanın.
                  </p>
                )}

                <div className="mt-4 space-y-1 text-sm text-slate-200">
                  {detail?.priceDisplay !== "HIDE" ? (
                    <p>
                      Fiyat Listesi:{" "}
                      <span className="font-semibold text-white">
                        {detail?.priceListName || "—"}
                      </span>
                    </p>
                  ) : (
                    <p>Fiyat bilgisi gizleniyor.</p>
                  )}
                  <p>
                    Paylaşım Adresi:{" "}
                    {shareUrl ? (
                      <a
                        href={shareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-teal-200 underline decoration-teal-300/60 hover:text-white"
                      >
                        {shareUrl}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ActionButton tone="green" icon={Plus} onClick={() => setAddProductModalOpen(true)}>
                  Kataloğa Ürün Ekle
                </ActionButton>
                <ActionButton tone="orange" icon={Plus} onClick={() => setBulkModalOpen(true)}>
                  Toplu Ürün Ekle
                </ActionButton>
                <ActionButton tone="blue" icon={Pencil} onClick={openEditDefinition}>
                  Bilgileri Güncelle
                </ActionButton>
                {!detail?.isPublished ? (
                  <ActionButton tone="white" icon={Check} onClick={publishCatalog} disabled={saving}>
                    Yayınla
                  </ActionButton>
                ) : null}
                {shareUrl ? (
                  <ActionButton tone="amber" icon={Mail} onClick={shareByEmail}>
                    Paylaş
                  </ActionButton>
                ) : null}
                {shareUrl ? (
                  <ActionButton tone="white" icon={Copy} onClick={copyShareUrl}>
                    Linki Kopyala
                  </ActionButton>
                ) : null}
                <ActionButton tone="rose" icon={Trash2} onClick={deleteCatalog} disabled={saving}>
                  Sil
                </ActionButton>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Ürün Sayısı"
              value={String(detailSummary.productCount)}
              sub="Bu katalogdaki toplam ürün"
              icon={Package}
              tone="blue"
            />
            <StatCard
              title="Durum"
              value={detailSummary.published}
              sub="Katalog yayında mı"
              icon={Globe}
              tone="emerald"
            />
            <StatCard
              title="Fiyat"
              value={detailSummary.priceMode}
              sub="Katalog fiyat gösterimi"
              icon={Tags}
              tone="amber"
            />
            <StatCard
              title="Stok Filtresi"
              value={detailSummary.stockMode}
              sub="Listeleme davranışı"
              icon={Boxes}
              tone="slate"
            />
          </section>

          <SectionCard
            title="Bilgilendirme"
            subtitle="Katalogların çalışma mantığı"
          >
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <ol className="list-decimal space-y-2 pl-5">
                <li>Bu kataloğa özel ürünler ekleyerek müşteriye özel sunum hazırlayabilirsiniz.</li>
                <li>Bu bağlantıyı paylaştığınız müşteriler ürünlerinizi online görebilir.</li>
              </ol>

              <div className="mt-4 flex gap-2 rounded-md border border-amber-300/60 bg-amber-100/50 p-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <p>
                  Eğer bir ürün bu katalogda yoksa müşteri onu göremez. Sadece göstermek istediğiniz ürünleri ekleyin.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Liste Bilgisi"
            subtitle="Katalog adı ve ürün ekleme alanı"
          >
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Katalog Adı
                </label>
                <input
                  value={detail?.name || ""}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base font-semibold text-slate-900 outline-none"
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
                    if (v) addProductToCatalog(v);
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
                <ActionButton tone="orange" icon={Plus} onClick={() => setBulkModalOpen(true)}>
                  Toplu Ürün Ekle
                </ActionButton>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Katalog Ürünleri"
            subtitle="Bu kataloğa bağlı ürünler"
            right={
              <div className="text-xs font-semibold text-slate-500">
                Toplam: {detailRows.length}
              </div>
            }
          >
            {detailLoading ? (
              <TableSkeleton />
            ) : detailRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-500">
                Bu kataloğa hiç ürün eklenmemiş.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-900 text-white">
                      <th className="px-4 py-3 font-semibold">Ürün</th>
                      <th className="w-24 px-4 py-3 font-semibold">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailRows.map((p, i) => (
                      <tr
                        key={p.id}
                        className={i % 2 === 0 ? "bg-white" : "bg-slate-50/80"}
                      >
                        <td className="px-4 py-3 font-medium text-teal-800">{p.name}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => removeProductFromCatalog(p.id)}
                            className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                            aria-label="Kaldır"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        {addProductModalOpen ? (
          <ModalShell
            title="Kataloğa ürün ekle"
            onClose={() => setAddProductModalOpen(false)}
            footer={
              <p className="text-xs text-slate-500">
                Ürün seçildiğinde hemen kataloğa eklenir.
              </p>
            }
          >
            <select
              key={addProductSelectKey}
              defaultValue=""
              disabled={saving || addableProducts.length === 0}
              onChange={(e) => {
                const v = e.target.value;
                if (v) addProductToCatalog(v);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm"
            >
              <option value="">
                {addableProducts.length === 0 ? "Eklenecek ürün kalmadı" : "Ürün seçin"}
              </option>
              {addableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </ModalShell>
        ) : null}

        {bulkModalOpen ? (
          <ModalShell
            title="Toplu ürün ekle"
            onClose={() => {
              setBulkModalOpen(false);
              setBulkCategoryId("");
              setBulkBrand("");
            }}
            footer={
              <div className="flex justify-end">
                <ActionButton onClick={bulkAddFiltered} icon={Plus} tone="green" disabled={saving}>
                  Kataloğa ekle
                </ActionButton>
              </div>
            }
          >
            <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              Marka veya kategori seçerek eşleşen tüm ürünleri kataloğa ekleyin.
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

        {defModalOpen ? (
          <DefinitionModal
            definition={definition}
            setDefinition={setDefinition}
            priceLists={priceLists}
            onClose={() => setDefModalOpen(false)}
            onSubmit={saveDefinition}
            saving={saving}
          />
        ) : null}
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
                <BookOpen className="h-4 w-4" />
                Katalog Yönetimi
              </div>

              <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
                Kataloglar
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                Resimli kataloglar oluşturun, müşterilerinizle paylaşın ve ürünlerinizi
                online olarak sunun.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ActionButton tone="green" icon={Plus} onClick={openCreateDefinition}>
                Yeni Katalog Ekle
              </ActionButton>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Toplam Katalog"
            value={String(listSummary.totalCatalogs)}
            sub="Tanımlı katalog sayısı"
            icon={BookOpen}
            tone="blue"
          />
          <StatCard
            title="Toplam Ürün"
            value={String(listSummary.totalProducts)}
            sub="Kullanılabilir ürün sayısı"
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
            title="Yayında"
            value={String(listSummary.publishedCount)}
            sub="Paylaşılabilir katalog"
            icon={Globe}
            tone="slate"
          />
        </section>

        <SectionCard title="Bilgilendirme" subtitle="Katalogların amacı">
          <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-5 text-sm leading-relaxed text-amber-950 shadow-sm">
            <p>
              Yukarıdaki <strong className="text-teal-700">Yeni Katalog Ekle</strong> düğmesine
              tıklayarak satışını yaptığınız ürünleriniz ve hizmetleriniz için{" "}
              <strong className="text-teal-700">resimli kataloglar</strong> hazırlayabilirsiniz.
            </p>
            <p className="mt-3">
              Böylece müşterileriniz güncel ürün ve fiyatlarınıza online olarak erişebilir.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Katalog Arama" subtitle="Ad veya açıklamaya göre filtreleyin">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Katalog ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none ring-teal-500/20 focus:ring-2"
            />
          </div>
        </SectionCard>

        <SectionCard title="Katalog Listesi" subtitle="Açmak için karta tıklayın">
          {isLoading ? (
            <TableSkeleton />
          ) : filteredCatalogs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
              <BookOpen className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              Henüz katalog yok. Yukarıdan yeni katalog ekleyin.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCatalogs.map((c, index) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => enterDetail(c.id)}
                  className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left shadow-sm transition hover:border-teal-300 hover:bg-teal-50/30 ${
                    index % 2 === 0
                      ? "border-sky-100 bg-sky-50/90"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {c.priceDisplay === "HIDE"
                        ? "Fiyat gösterilmiyor"
                        : c.priceListName || "Fiyat listesi seçilmedi"}{" "}
                      · {c.productCount} ürün
                    </p>
                  </div>
                  <div className="shrink-0 text-xs font-semibold text-slate-500">
                    {c.isPublished ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-800">
                        Yayında
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                        Taslak
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {defModalOpen ? (
        <DefinitionModal
          definition={definition}
          setDefinition={setDefinition}
          priceLists={priceLists}
          onClose={() => setDefModalOpen(false)}
          onSubmit={saveDefinition}
          saving={saving}
        />
      ) : null}
    </div>
  );
}

function DefinitionModal({
  definition,
  setDefinition,
  priceLists,
  onClose,
  onSubmit,
  saving,
}) {
  return (
    <ModalShell
      title="Katalog Tanımı"
      wide
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Kaydet
          </button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:items-center">
          <label className="text-sm font-semibold text-slate-700 sm:text-right">
            Katalog Adı
          </label>
          <input
            required
            value={definition.name}
            onChange={(e) => setDefinition((d) => ({ ...d, name: e.target.value }))}
            placeholder="ör. 2026 İlkbahar Kataloğu"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:items-start">
          <label className="text-sm font-semibold text-slate-700 sm:pt-2 sm:text-right">
            Açıklama
          </label>
          <textarea
            value={definition.description}
            onChange={(e) =>
              setDefinition((d) => ({ ...d, description: e.target.value }))
            }
            placeholder="isteğe bağlı açıklama"
            rows={3}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:items-center">
          <label className="text-sm font-semibold text-slate-700 sm:text-right">
            Fiyat Bilgisi
          </label>
          <select
            value={definition.priceDisplay}
            onChange={(e) => {
              const v = e.target.value;
              setDefinition((d) => {
                const next = { ...d, priceDisplay: v };
                if (v === "HIDE") {
                  next.priceListId = "";
                  if (d.sortOrder === "PRICE_ASC" || d.sortOrder === "PRICE_DESC") {
                    next.sortOrder = "BY_NAME";
                  }
                }
                return next;
              });
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="SHOW_SALES">Satış fiyatı gözüksün</option>
            <option value="HIDE">Fiyat gösterilmesin</option>
          </select>
        </div>

        {definition.priceDisplay === "SHOW_SALES" ? (
          <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:items-center">
            <label className="text-sm font-semibold text-slate-700 sm:text-right">
              Fiyat Listesi
            </label>
            <select
              value={definition.priceListId}
              onChange={(e) =>
                setDefinition((d) => ({ ...d, priceListId: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">— Seçin —</option>
              {priceLists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:items-center">
          <label className="text-sm font-semibold text-slate-700 sm:text-right">
            Marka Bilgisi
          </label>
          <select
            value={definition.brandDisplay}
            onChange={(e) =>
              setDefinition((d) => ({ ...d, brandDisplay: e.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="SHOW">Marka adı gözüksün</option>
            <option value="HIDE">Marka adı gözükmesin</option>
          </select>
        </div>

        <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:items-center">
          <label className="text-sm font-semibold text-slate-700 sm:text-right">
            Stok Miktar Bilgisi
          </label>
          <select
            value={definition.stockQtyDisplay}
            onChange={(e) =>
              setDefinition((d) => ({ ...d, stockQtyDisplay: e.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="SHOW">Stok miktarları gözüksün</option>
            <option value="HIDE">Stok miktarları gözükmesin</option>
          </select>
        </div>

        <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:items-center">
          <label className="text-sm font-semibold text-slate-700 sm:text-right">
            Stok Durumu
          </label>
          <select
            value={definition.stockFilter}
            onChange={(e) =>
              setDefinition((d) => ({ ...d, stockFilter: e.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="ALL">Tüm ürünler gözüksün</option>
            <option value="IN_STOCK_ONLY">Yalnızca stokta olanlar</option>
          </select>
        </div>

        <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:items-start">
          <label className="text-sm font-semibold text-slate-700 sm:pt-2 sm:text-right">
            Sıralama
          </label>
          <div>
            <select
              value={definition.sortOrder}
              onChange={(e) =>
                setDefinition((d) => ({ ...d, sortOrder: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="BY_NAME">Ürün ismine göre</option>
              <option value="BY_SLUG">Ürün koduna göre</option>
              <option value="BY_CATEGORY">Ürün kategorisine göre</option>
              <option value="BY_CATALOG_ORDER">Katalog sırasına göre</option>
              {definition.priceDisplay === "SHOW_SALES" ? (
                <>
                  <option value="PRICE_ASC">Fiyata göre artan</option>
                  <option value="PRICE_DESC">Fiyata göre azalan</option>
                </>
              ) : null}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Paylaşılan katalogdaki sıralamayı belirler.
            </p>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}