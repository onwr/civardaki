"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Loader2,
  Pencil,
  Trash2,
  BookOpen,
  Search,
  Users,
  Tags,
  Filter,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";

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

export default function FihristPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [master, setMaster] = useState({ FIHRIST_1: [], FIHRIST_2: [] });
  const [classFilter, setClassFilter] = useState("all");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const loadMaster = useCallback(async () => {
    try {
      const r = await fetch("/api/business/masterdata");
      if (!r.ok) return;
      const d = await r.json();
      setMaster({
        FIHRIST_1: d.byKind?.FIHRIST_1 || [],
        FIHRIST_2: d.byKind?.FIHRIST_2 || [],
      });
    } catch {
      // sessiz
    }
  }, []);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (search.trim().length >= 2) sp.set("q", search.trim());

      if (classFilter !== "all") {
        const [slot, cid] = classFilter.split(":");
        if (slot === "1" || slot === "2") {
          sp.set("classSlot", slot);
          sp.set("classEntryId", cid);
        }
      }

      const r = await fetch(`/api/business/fihrist?${sp.toString()}`);
      const d = await r.json().catch(() => ({}));

      if (!r.ok) {
        toast.error(d.message || "Liste alınamadı.");
        setEntries([]);
        return;
      }

      setEntries(Array.isArray(d.entries) ? d.entries : []);
    } catch {
      toast.error("Liste yüklenemedi.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [classFilter, search]);

  useEffect(() => {
    void loadMaster();
  }, [loadMaster]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const downloadExport = async () => {
    try {
      const res = await fetch("/api/business/fihrist/export");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "İndirilemedi.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fihrist-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Dosya indirildi.");
    } catch {
      toast.error("İndirme başarısız.");
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await fetch("/api/business/fihrist/export?template=1");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Şablon indirilemedi.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fihrist-sablon-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Şablon indirildi.");
    } catch {
      toast.error("İndirme başarısız.");
    }
  };

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/business/fihrist/import", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.message || "Yükleme başarısız.");
        return;
      }

      toast.success(data.message || "Tamamlandı.");

      if (Array.isArray(data.errors) && data.errors.length > 0) {
        data.errors.slice(0, 8).forEach((err) =>
          toast.message(`Satır ${err.row}: ${err.message}`)
        );
        if (data.errors.length > 8) {
          toast.message(`…ve ${data.errors.length - 8} satır daha.`);
        }
      }

      void loadEntries();
      void loadMaster();
    } catch {
      toast.error("Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id, name) => {
    if (!confirm(`«${name}» silinsin mi?`)) return;

    try {
      const r = await fetch(`/api/business/fihrist/${id}`, { method: "DELETE" });
      const d = await r.json().catch(() => ({}));

      if (!r.ok) {
        toast.error(d.message || "Silinemedi.");
        return;
      }

      toast.success("Silindi.");
      void loadEntries();
    } catch {
      toast.error("Silinemedi.");
    }
  };

  const stats = useMemo(() => {
    return {
      totalEntries: entries.length,
      class1Count: master.FIHRIST_1.length,
      class2Count: master.FIHRIST_2.length,
      filtered:
        classFilter === "all" && !search.trim()
          ? entries.length
          : entries.length,
    };
  }, [entries, master, classFilter, search]);

  const activeFilterLabel = useMemo(() => {
    if (classFilter === "all") return "Tüm Sınıflar";

    const [slot, id] = classFilter.split(":");
    if (slot === "1") {
      return `Sınıf 1: ${master.FIHRIST_1.find((x) => String(x.id) === String(id))?.name || "Seçili"}`;
    }
    if (slot === "2") {
      return `Sınıf 2: ${master.FIHRIST_2.find((x) => String(x.id) === String(id))?.name || "Seçili"}`;
    }

    return "Tüm Sınıflar";
  }, [classFilter, master]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <BookOpen className="h-4 w-4" />
                  Fihrist Yönetimi
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Rehber / Fihrist
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Müşteri veya tedarikçi olmayan kişi ve kurum kayıtlarını tek
                  ekrandan yönetin, filtreleyin ve Excel ile toplu işlem yapın.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/business/fihrist/new"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  Yeni Kart Ekle
                </Link>

                <button
                  type="button"
                  onClick={downloadExport}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-600 bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel&apos;e Aktar
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Toplam Kayıt"
              value={stats.totalEntries}
              sub="Listelenen fihrist kartları"
              icon={Users}
              tone="blue"
            />
            <StatCard
              title="Sınıf 1"
              value={stats.class1Count}
              sub="Fihrist grup tanımı"
              icon={Tags}
              tone="emerald"
            />
            <StatCard
              title="Sınıf 2"
              value={stats.class2Count}
              sub="İkincil grup tanımı"
              icon={FolderOpen}
              tone="amber"
            />
            <StatCard
              title="Aktif Filtre"
              value={activeFilterLabel}
              sub="Seçili sınıf görünümü"
              icon={Filter}
              tone="slate"
            />
          </div>
        </section>

        <SectionCard
          title="Bilgilendirme"
          subtitle="Fihrist modülünün kullanım amacı"
        >
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-4 text-sm leading-relaxed text-amber-950">
            <p>
              Müşteri ya da tedarikçileriniz haricinde bilgilerini saklamak
              istediğiniz kişi veya firmaları burada kaydedebilirsiniz.
            </p>
            <p className="mt-2">
              Muhasebeciniz, banka şubesi, teknik servis, tedarik dışı çözüm
              ortağı gibi rehber kayıtlarını bu alanda düzenli şekilde
              tutabilirsiniz.
            </p>
          </div>
        </SectionCard>

        <SectionCard
          title="Filtreler"
          subtitle="Sınıf ve arama ile listeyi daraltın"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="w-full max-w-xs">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Sınıf filtresi
              </label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-400"
              >
                <option value="all">Tüm Sınıflar</option>
                {master.FIHRIST_1.map((x) => (
                  <option key={`1-${x.id}`} value={`1:${x.id}`}>
                    Sınıf 1: {x.name}
                  </option>
                ))}
                {master.FIHRIST_2.map((x) => (
                  <option key={`2-${x.id}`} value={`2:${x.id}`}>
                    Sınıf 2: {x.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex max-w-xl flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setSearch(q);
                  }}
                  placeholder="Ara (en az 2 karakter)…"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-teal-400"
                />
              </div>

              <button
                type="button"
                onClick={() => setSearch(q)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Ara
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Fihrist Listesi"
          subtitle="Kayıtları görüntüleyin, düzenleyin veya silin"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">İsim / Unvan</th>
                    <th className="px-4 py-3">Telefon</th>
                    <th className="px-4 py-3">E-Posta</th>
                    <th className="px-4 py-3">Sınıf 1</th>
                    <th className="px-4 py-3">Sınıf 2</th>
                    <th className="px-4 py-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center text-slate-400">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                      </td>
                    </tr>
                  ) : entries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        Kayıt yok.
                      </td>
                    </tr>
                  ) : (
                    entries.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`border-b border-slate-100 transition hover:bg-sky-50/70 ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {row.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {[row.phone1, row.phone2].filter(Boolean).join(" · ") || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.class1?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.class2?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-1">
                            <Link
                              href={`/business/fihrist/${row.id}`}
                              className="inline-flex rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-white"
                              title="Düzenle"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => remove(row.id, row.name)}
                              className="inline-flex rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
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
        </SectionCard>

        <SectionCard
          title="Excel ile Toplu İşlem"
          subtitle="Şablon indir, dışa aktar veya dosya yükle"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-4 text-sm leading-relaxed text-amber-950">
              <p className="font-semibold text-amber-900">Kurallar</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>
                  Sütun başlıkları: İsim, Telefon 1, Telefon 2, E-Posta, Sınıf 1,
                  Sınıf 2, Yetkili Kişi, Adres, Not.
                </li>
                <li>
                  Dışa aktarılan dosyada ilk sütun <strong>ID</strong> olup mevcut
                  kayıtları güncellemek için gereklidir.
                </li>
                <li>
                  Sınıf adları Tanımlar sayfasındaki Fihrist gruplarıyla eşleşir;
                  yeni isim varsa otomatik tanım eklenir.
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-sm font-bold text-slate-900">Şablon İndir</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Boş Excel şablonunu indirip kayıtları toplu hazırlayın.
                </p>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4" />
                  Şablon İndir
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-sm font-bold text-slate-900">Excel Yükle</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Hazırladığınız veya dışa aktardığınız dosyayı tekrar içeri alın.
                </p>

                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="sr-only"
                  onChange={onImport}
                />

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-700 bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Excel Dosyası Yükle
                </button>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}