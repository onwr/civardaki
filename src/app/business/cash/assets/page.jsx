"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
  TableCellsIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

function formatTry(n) {
  const v = Number(n || 0);
  if (!v) return "—";
  return `₺${v.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">{title}</p>
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

function ActionButton({ children, onClick, icon: Icon, tone = "white", className = "" }) {
  const tones = {
    green: "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    orange: "bg-orange-500 hover:bg-orange-600 border-orange-600 text-white",
    white: "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
    dark: "bg-slate-900 hover:bg-slate-800 border-slate-900 text-white",
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

const emptyForm = () => ({
  name: "",
  description: "",
  serialNo: "",
  purchaseDate: "",
  purchasePrice: "",
  notes: "",
});

export default function FixedAssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [reportOpen, setReportOpen] = useState(true);
  const reportRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput.length === 0 || searchInput.length >= 3) setSearchQ(searchInput.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams();
      if (searchQ.length >= 3) params.set("q", searchQ);
      const qs = params.toString();
      const res = await fetch(`/api/business/assets${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Liste yüklenemedi");
      setAssets(data.assets || []);
    } catch (e) {
      console.error(e);
      setApiError(e.message);
      toast.error("Demirbaşlar yüklenemedi.");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [searchQ]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const summary = useMemo(() => {
    const totalPurchase = assets.reduce((s, a) => s + Number(a.purchasePrice || 0), 0);
    return { count: assets.length, totalPurchase };
  }, [assets]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      description: row.description || "",
      serialNo: row.serialNo || "",
      purchaseDate: row.purchaseDate ? new Date(row.purchaseDate).toISOString().slice(0, 10) : "",
      purchasePrice:
        row.purchasePrice != null && row.purchasePrice !== "" ? String(row.purchasePrice) : "",
      notes: row.notes || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) setModalOpen(false);
  };

  const submitModal = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Demirbaş adı gerekli.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        serialNo: form.serialNo.trim() || null,
        purchaseDate: form.purchaseDate || null,
        purchasePrice: form.purchasePrice === "" ? null : form.purchasePrice,
        notes: form.notes.trim() || null,
      };
      const url = editingId ? `/api/business/assets/${editingId}` : "/api/business/assets";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "İşlem başarısız");
      toast.success(editingId ? "Demirbaş güncellendi." : "Demirbaş kaydedildi.");
      setModalOpen(false);
      fetchList();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteAsset = async (row) => {
    if (!confirm(`“${row.name}” kaydını silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/business/assets/${row.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      toast.success("Demirbaş silindi.");
      fetchList();
    } catch (err) {
      toast.error(err.message);
    }
  };

  function escapeCsvCell(s) {
    const str = s == null ? "" : String(s);
    if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  }

  const downloadExcel = () => {
    const headers = ["Demirbaş", "Seri No", "Alış Tarihi", "Açıklama", "Fiyatı", "Not"];
    const rows = assets.map((a) => [
      a.name,
      a.serialNo || "",
      a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString("tr-TR") : "",
      (a.description || "").replace(/\r?\n/g, " "),
      a.purchasePrice != null ? Number(a.purchasePrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 }) : "",
      (a.notes || "").replace(/\r?\n/g, " "),
    ]);
    const csv = [headers, ...rows].map((line) => line.map(escapeCsvCell).join(",")).join("\r\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demirbas-raporu-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Excel (CSV) indirildi.");
  };

  const printPdf = () => {
    window.print();
  };

  const scrollToReport = () => {
    setReportOpen(true);
    setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const hasRows = assets.length > 0;
  const showWideEmpty = !loading && !hasRows && searchQ.length < 3;
  const showFilterEmpty = !loading && !hasRows && searchQ.length >= 3;

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 text-[13px] text-slate-700 print:bg-white">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-assets,
          #print-assets * {
            visibility: visible;
          }
          #print-assets {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)] print:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <CubeIcon className="h-4 w-4" />
              Nakit Yönetimi
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">Demirbaşlar</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Araç, telefon, bilgisayar gibi varlıklarınızı kaydedin; fatura, garanti ve önemli tarihleri
              tek yerden takip edin.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ActionButton onClick={openNew} icon={PlusIcon} tone="green">
              Yeni Demirbaş Ekle
            </ActionButton>
            <ActionButton onClick={scrollToReport} icon={ChartBarIcon} tone="orange">
              Rapor
            </ActionButton>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3 print:hidden">
        <StatCard
          title="Kayıtlı demirbaş"
          value={String(summary.count)}
          sub="Filtreye göre listelenen"
          icon={CubeIcon}
          tone="emerald"
        />
        <StatCard
          title="Toplam alış değeri"
          value={formatTry(summary.totalPurchase)}
          sub="Girilen fiyatların toplamı"
          icon={ChartBarIcon}
          tone="blue"
        />
        <StatCard
          title="Arama"
          value={searchQ.length >= 3 ? `"${searchQ}"` : "—"}
          sub={searchQ.length >= 3 ? "3+ karakter filtre aktif" : "Tüm kayıtlar"}
          icon={MagnifyingGlassIcon}
          tone="slate"
        />
      </section>

      {apiError && (
        <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900 shadow-sm print:hidden">
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

      {showFilterEmpty && (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-slate-700 print:hidden">
          Eşleşen demirbaş bulunamadı. Aramayı değiştirip yenileyin.
        </div>
      )}

      {showWideEmpty && (
        <div className="rounded-[24px] border border-amber-100 bg-amber-50 px-5 py-5 text-sm text-slate-800 shadow-sm print:hidden">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-lg font-bold text-white">
              !
            </div>
            <div>
              <p className="font-semibold text-slate-900">Demirbaş kaydı yok — buradan başlayın</p>
              <p className="mt-2 leading-relaxed text-slate-700">
                Araç, cep telefonu, bilgisayar gibi şirketinize ait demirbaşları buraya ekleyebilirsiniz.
                Satın alma faturalarını, garanti belgelerini, tamir faturalarını yükleyebilir; araç muayenesi,
                sigorta bitişi, garanti süresi gibi önemli tarihleri hatırlatabilirsiniz.
              </p>
              <p className="mt-3 text-slate-700">
                İşleme başlamak için yukarıdaki{" "}
                <button
                  type="button"
                  onClick={openNew}
                  className="inline-flex items-center rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white"
                >
                  + Yeni Demirbaş Ekle
                </button>{" "}
                düğmesini kullanın.
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-5 print:hidden">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Filtreler</h2>
            <p className="mt-2 text-sm text-slate-500">
              Ad, seri / plaka, açıklama veya not içinde arama (en az 3 karakter).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="arama... (en az 3 karakter)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </div>
            <ActionButton onClick={fetchList} icon={ArrowPathIcon} tone="white" className="rounded-xl px-3 py-2.5">
              Yenile
            </ActionButton>
          </div>
        </div>
      </section>

      <section
        ref={reportRef}
        id="print-assets"
        className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
      >
        <button
          type="button"
          onClick={() => setReportOpen((o) => !o)}
          className="flex w-full items-center justify-between bg-slate-900 px-4 py-3 text-left text-white md:px-5 print:hidden"
        >
          <span className="text-sm font-bold uppercase tracking-[0.14em]">Rapor sonucu</span>
          {reportOpen ? (
            <ChevronUpIcon className="h-5 w-5 shrink-0" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 shrink-0" />
          )}
        </button>

        {reportOpen && (
          <div className="border-t border-slate-100">
            <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-3 md:px-5 print:hidden">
              <button
                type="button"
                onClick={downloadExcel}
                disabled={!hasRows}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TableCellsIcon className="h-4 w-4" />
                Excel
              </button>
              <button
                type="button"
                onClick={printPdf}
                disabled={!hasRows}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PrinterIcon className="h-4 w-4" />
                PDF
              </button>
            </div>

            <div className="overflow-x-auto px-2 pb-4 pt-2 md:px-4">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-3 py-2 font-semibold text-slate-800 md:px-4">Demirbaş</th>
                    <th className="px-3 py-2 font-semibold text-slate-800 md:px-4">Seri No</th>
                    <th className="px-3 py-2 font-semibold text-slate-800 md:px-4 whitespace-nowrap">
                      Alış Tarihi
                    </th>
                    <th className="min-w-[200px] px-3 py-2 font-semibold text-slate-800 md:px-4">Açıklama</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-800 md:px-4">Fiyatı</th>
                    <th className="min-w-[120px] px-3 py-2 font-semibold text-slate-800 md:px-4">Not</th>
                    <th className="w-24 px-3 py-2 font-semibold text-slate-800 md:px-4 print:hidden">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        Yükleniyor…
                      </td>
                    </tr>
                  ) : !hasRows ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                        {searchQ.length >= 3
                          ? "Aramaya uygun kayıt yok."
                          : "Henüz demirbaş eklenmedi. Yukarıdan yeni kayıt oluşturabilirsiniz."}
                      </td>
                    </tr>
                  ) : (
                    assets.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                        <td className="px-3 py-2.5 font-medium text-slate-900 md:px-4">{row.name}</td>
                        <td className="px-3 py-2.5 text-slate-700 md:px-4">{row.serialNo || "—"}</td>
                        <td className="px-3 py-2.5 text-slate-700 md:px-4 whitespace-nowrap">
                          {row.purchaseDate
                            ? new Date(row.purchaseDate).toLocaleDateString("tr-TR")
                            : "—"}
                        </td>
                        <td className="max-w-md px-3 py-2.5 text-slate-600 md:px-4">
                          <span className="line-clamp-2 whitespace-pre-wrap">{row.description || "—"}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-slate-900 md:px-4">
                          {formatTry(row.purchasePrice)}
                        </td>
                        <td className="max-w-[200px] px-3 py-2.5 text-slate-600 md:px-4">
                          <span className="line-clamp-2 whitespace-pre-wrap">{row.notes || "—"}</span>
                        </td>
                        <td className="px-3 py-2.5 md:px-4 print:hidden">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(row)}
                              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                              title="Düzenle"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteAsset(row)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              title="Sil"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-teal-500 px-5 py-4 text-white">
              <h3 className="text-lg font-bold">Demirbaş Tanımı</h3>
              <button type="button" onClick={closeModal} className="rounded-lg p-1 hover:bg-white/20" disabled={saving}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={submitModal} className="space-y-4 p-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <label className="w-full shrink-0 text-sm font-medium text-slate-700 sm:w-40 sm:text-right">
                  Demirbaş Adı
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
                <label className="w-full shrink-0 pt-0 text-sm font-medium text-slate-700 sm:w-40 sm:pt-2 sm:text-right">
                  Açıklaması
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <label className="w-full shrink-0 text-sm font-medium text-slate-700 sm:w-40 sm:text-right">
                  Seri No
                </label>
                <div className="flex-1">
                  <input
                    value={form.serialNo}
                    onChange={(e) => setForm((f) => ({ ...f, serialNo: e.target.value }))}
                    placeholder="varsa seri no, plaka no vs girebilirsiniz."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
                <label className="w-full shrink-0 pt-0 text-sm font-medium text-slate-700 sm:w-40 sm:pt-2 sm:text-right">
                  Alış Tarihi
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">(isteğe bağlı)</span>
                </label>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
                <label className="w-full shrink-0 pt-0 text-sm font-medium text-slate-700 sm:w-40 sm:pt-2 sm:text-right">
                  Fiyatı
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">(isteğe bağlı)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.purchasePrice}
                  onChange={(e) => setForm((f) => ({ ...f, purchasePrice: e.target.value }))}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
                <label className="w-full shrink-0 pt-0 text-sm font-medium text-slate-700 sm:w-40 sm:pt-2 sm:text-right">
                  Not
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Raporda görünecek kısa not"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" />
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
