"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  PlusIcon,
  ArrowPathIcon,
  UserGroupIcon,
  Bars3BottomLeftIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import CustomerFormModal from "@/components/business/CustomerFormModal";

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
    slate:
      "from-slate-800 to-slate-900 text-white",
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
  tone = "dark",
  className = "",
}) {
  const tones = {
    green:
      "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    amber:
      "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white",
    blue: "bg-sky-500 hover:bg-sky-600 border-sky-600 text-white",
    dark: "bg-slate-900 hover:bg-slate-800 border-slate-950 text-white",
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
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

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          <td className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-56 max-w-[70%] rounded bg-slate-200 animate-pulse" />
            </div>
          </td>
          <td className="px-4 py-4 text-right">
            <div className="ml-auto h-4 w-24 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4 text-right">
            <div className="ml-auto h-4 w-24 rounded bg-slate-200 animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("active");
  const [classFilter, setClassFilter] = useState("all");

  const [searchInput, setSearchInput] = useState("");
  const [searchQ, setSearchQ] = useState("");

  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    try {
      const params = new URLSearchParams();
      params.set("status", statusFilter === "all" ? "all" : statusFilter);
      if (classFilter !== "all") params.set("class", classFilter);
      if (searchQ.length >= 3) params.set("q", searchQ);

      const res = await fetch(`/api/business/customers?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Liste alınamadı");
      }

      setCustomers(data.customers || []);
      setTotalCount(data.totalCount ?? (data.customers || []).length);
    } catch (e) {
      console.error(e);
      setApiError(e.message);
      setCustomers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, classFilter, searchQ]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput.length === 0 || searchInput.length >= 3) {
        setSearchQ(searchInput.trim());
      }
    }, 300);

    return () => clearTimeout(t);
  }, [searchInput]);

  const sorted = useMemo(() => {
    const arr = [...customers];
    const dir = sortDir === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      if (sortKey === "name") {
        return dir * String(a.name || "").localeCompare(String(b.name || ""), "tr");
      }
      if (sortKey === "openBalance") {
        return dir * ((a.openBalance || 0) - (b.openBalance || 0));
      }
      if (sortKey === "checkNoteBalance") {
        return dir * ((a.checkNoteBalance || 0) - (b.checkNoteBalance || 0));
      }
      return 0;
    });

    return arr;
  }, [customers, sortKey, sortDir]);

  const summary = useMemo(() => {
    return sorted.reduce(
      (acc, row) => {
        acc.openBalance += Number(row.openBalance) || 0;
        acc.checkNoteBalance += Number(row.checkNoteBalance) || 0;
        if (row.integrationLabel) acc.integrationCount += 1;
        return acc;
      },
      {
        openBalance: 0,
        checkNoteBalance: 0,
        integrationCount: 0,
      }
    );
  }, [sorted]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const openNew = () => {
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (id) => {
    setEditId(id);
    setModalOpen(true);
  };

  const year = new Date().getFullYear();

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 text-[13px] text-slate-700">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <UserGroupIcon className="h-4 w-4" />
              Müşteri Yönetimi
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
              Müşteriler
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Müşteri kayıtlarını yönetin, açık bakiyeleri izleyin ve entegre
              hesapları tek ekranda düzenleyin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ActionButton onClick={openNew} icon={PlusIcon} tone="green">
              Yeni Müşteri Ekle
            </ActionButton>

            <ActionButton
              onClick={() => alert("Excel ile müşteri yükleme yakında eklenecek.")}
              icon={Bars3BottomLeftIcon}
              tone="amber"
            >
              Excelden Müşteri Yükle
            </ActionButton>

            <ActionButton
              onClick={() => alert("Toplu müşteri güncelleme yakında eklenecek.")}
              icon={ArrowPathIcon}
              tone="blue"
            >
              Toplu Güncelleme
            </ActionButton>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Toplam Müşteri"
          value={String(totalCount)}
          sub="Filtreye göre listelenen toplam kayıt"
          icon={UserGroupIcon}
          tone="blue"
        />
        <StatCard
          title="Açık Bakiye Toplamı"
          value={fmtTry(summary.openBalance)}
          sub="Listelenen müşterilerin toplam açık bakiyesi"
          icon={BanknotesIcon}
          tone="emerald"
        />
        <StatCard
          title="Çek / Senet Toplamı"
          value={fmtTry(summary.checkNoteBalance)}
          sub="Listelenen çek-senet toplam bakiyesi"
          icon={CreditCardIcon}
          tone="amber"
        />
        <StatCard
          title="Entegrasyonlu Müşteri"
          value={String(summary.integrationCount)}
          sub="Pazaryeri veya entegrasyon bağlantılı müşteri"
          icon={BuildingOfficeIcon}
          tone="slate"
        />
      </section>

      {apiError && (
        <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Veri alınırken bir hata oluştu</p>
              <p className="mt-1 text-sm leading-6">
                {apiError}
                {apiError.includes("Unauthorized")
                  ? ""
                  : " Veritabanı tablosu yoksa terminalde `npx prisma migrate dev` çalıştırın."}
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-slate-800">
              <FunnelIcon className="h-4 w-4" />
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                Filtreler
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                className="min-w-[170px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="active">Aktif Müşteriler</option>
                <option value="inactive">Pasif Müşteriler</option>
                <option value="all">Tümü</option>
              </select>

              <select
                className="min-w-[150px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="all">Tüm Sınıflar</option>
                <option value="GENEL">GENEL</option>
                <option value="KURUMSAL">KURUMSAL</option>
                <option value="BAYI">BAYİ</option>
                <option value="TOPTAN">TOPTAN</option>
                <option value="PERAKENDE">PERAKENDE</option>
              </select>

              <select
                className="min-w-[150px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400"
                disabled
              >
                <option>Hepsini göster</option>
              </select>

              <ActionButton
                onClick={fetchList}
                icon={ArrowPathIcon}
                tone="white"
                className="rounded-xl px-3 py-2.5"
              >
                Yenile
              </ActionButton>
            </div>
          </div>

          <div className="w-full xl:w-auto">
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Arama
            </label>
            <div className="relative w-full xl:w-[320px]">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                placeholder="arama... (en az 3 karakter)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Müşteri Listesi</h3>
            <p className="mt-1 text-sm text-slate-500">
              Kayıtları görüntülemek veya düzenlemek için satıra tıklayın.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
              Durum: {statusFilter === "active" ? "Aktif" : statusFilter === "inactive" ? "Pasif" : "Tümü"}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
              Sınıf: {classFilter}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
              Kayıt: {sorted.length}
            </span>
          </div>
        </div>

        <div className="overflow-auto max-h-[calc(100vh-300px)]">
          <table className="min-w-full border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-900 text-white">
                <th className="px-4 py-3 font-semibold md:px-5 w-[50%]">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 hover:opacity-90"
                    onClick={() => toggleSort("name")}
                  >
                    İsim / Unvan
                    <ArrowsUpDownIcon className="h-4 w-4 opacity-80" />
                  </button>
                </th>

                <th className="px-4 py-3 text-right font-semibold whitespace-nowrap md:px-5">
                  <button
                    type="button"
                    className="ml-auto inline-flex items-center gap-1.5 hover:opacity-90"
                    onClick={() => toggleSort("openBalance")}
                  >
                    Açık Bakiye
                    <ArrowsUpDownIcon className="h-4 w-4 opacity-80" />
                  </button>
                </th>

                <th className="px-4 py-3 text-right font-semibold whitespace-nowrap md:px-5">
                  <button
                    type="button"
                    className="ml-auto inline-flex items-center gap-1.5 hover:opacity-90"
                    onClick={() => toggleSort("checkNoteBalance")}
                  >
                    Çek / Senet Bakiyesi
                    <ArrowsUpDownIcon className="h-4 w-4 opacity-80" />
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-14 text-center md:px-5">
                    <div className="mx-auto max-w-md">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <UserGroupIcon className="h-6 w-6" />
                      </div>
                      <h4 className="mt-4 text-base font-bold text-slate-900">
                        Kayıt bulunamadı
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Bu filtrelere uygun müşteri yok. Yeni kayıt ekleyerek
                        başlayabilirsiniz.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sorted.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`cursor-pointer border-b border-slate-100 transition hover:bg-sky-50/70 ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    }`}
                    onClick={() => openEdit(row.id)}
                  >
                    <td className="px-4 py-3.5 md:px-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex items-center gap-3">
                          {row.integrationLabel ? (
                            <span
                              className="h-3.5 w-3.5 shrink-0 rounded bg-orange-500 shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                              title="Pazaryeri / entegrasyon"
                            />
                          ) : (
                            <span
                              className="h-3.5 w-3.5 shrink-0 rounded bg-slate-300"
                              title="Standart müşteri"
                            />
                          )}

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {row.name}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Müşteri kaydı
                            </p>
                          </div>
                        </div>

                        {row.integrationLabel ? (
                          <span className="shrink-0 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700">
                            {row.integrationLabel}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right font-semibold tabular-nums whitespace-nowrap text-slate-800 md:px-5">
                      {fmtTry(row.openBalance)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-semibold tabular-nums whitespace-nowrap text-slate-800 md:px-5">
                      {fmtTry(row.checkNoteBalance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="pt-1 text-xs text-slate-400">
        2014, {year} © Civardaki İşletme Paneli
      </p>

      <CustomerFormModal
        open={modalOpen}
        customerId={editId}
        onClose={() => {
          setModalOpen(false);
          setEditId(null);
        }}
        onSaved={fetchList}
      />
    </div>
  );
}