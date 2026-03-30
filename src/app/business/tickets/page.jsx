"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Plus,
  ChevronRight,
  Ticket,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { getStatusLabel, getCategoryLabel } from "@/lib/tickets/config";

function formatDate(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function StatCard({ title, value, sub, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600 to-indigo-700 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    amber: "from-amber-500 to-orange-600 text-white",
    rose: "from-rose-500 to-pink-700 text-white",
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

function statusPillClass(status) {
  const s = String(status || "").toUpperCase();

  if (s === "OPEN" || s === "PENDING") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (s === "ANSWERED" || s === "IN_PROGRESS") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  if (s === "RESOLVED" || s === "CLOSED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export default function BusinessTicketsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/business/tickets")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items)) setItems(data.items);
        else setError(data.error || "Yüklenemedi");
      })
      .catch(() => setError("Yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const openCount = items.filter((i) =>
      ["OPEN", "PENDING"].includes(String(i.status || "").toUpperCase()),
    ).length;
    const answeredCount = items.filter((i) =>
      ["ANSWERED", "IN_PROGRESS"].includes(String(i.status || "").toUpperCase()),
    ).length;
    const closedCount = items.filter((i) =>
      ["RESOLVED", "CLOSED"].includes(String(i.status || "").toUpperCase()),
    ).length;

    return { total, openCount, answeredCount, closedCount };
  }, [items]);

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 pb-16 pt-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <LifeBuoy className="h-4 w-4" />
                  İşletme Destek Merkezi
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Destek Taleplerim
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Platform ile ilgili destek kayıtlarınızı görüntüleyin, durumlarını
                  takip edin ve ilgili talep detayına hızlıca geçin.
                </p>
              </div>

              <Link
                href="/business/tickets/new"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
                Yeni talep
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Toplam Talep"
              value={stats.total}
              sub="Oluşturulan tüm kayıtlar"
              icon={Ticket}
              tone="blue"
            />
            <StatCard
              title="Açık Talepler"
              value={stats.openCount}
              sub="Yanıt veya işlem bekleyen"
              icon={Clock3}
              tone="amber"
            />
            <StatCard
              title="İşlemde"
              value={stats.answeredCount}
              sub="Destek ekibi üzerinde çalışıyor"
              icon={ArrowUpRight}
              tone="rose"
            />
            <StatCard
              title="Çözümlenen"
              value={stats.closedCount}
              sub="Kapatılan veya sonuçlanan"
              icon={CheckCircle2}
              tone="emerald"
            />
          </div>
        </section>

        {error ? (
          <SectionCard title="Bir sorun oluştu" subtitle="Destek kayıtları getirilemedi">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-medium text-rose-700">
              {error}
            </div>
          </SectionCard>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-[28px] border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <SectionCard
            title="Henüz destek talebi yok"
            subtitle="İlk talebinizi oluşturarak destek ekibine ulaşabilirsiniz"
          >
            <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <LifeBuoy className="mb-4 h-14 w-14 text-slate-300" />
              <p className="text-lg font-semibold text-slate-700">Henüz talep yok</p>
              <p className="mt-2 text-sm text-slate-500">
                Bir sorunuz varsa yeni talep oluşturarak destek ekibimize iletebilirsiniz.
              </p>
              <Link
                href="/business/tickets/new"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Yeni talep oluştur
              </Link>
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title="Tüm talepler"
            subtitle="Destek kayıtlarınızın son durumunu görüntüleyin"
          >
            <div className="grid grid-cols-1 gap-4">
              {items.map((row) => (
                <Link
                  key={row.id}
                  href={`/business/tickets/${row.id}`}
                  className="group rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-bold text-slate-900">
                          {row.subject}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${statusPillClass(
                            row.status,
                          )}`}
                        >
                          {getStatusLabel(row.status)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        {getCategoryLabel(row.category)} · {row._count?.messages ?? 0} mesaj
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 lg:justify-end">
                      <span className="text-xs font-semibold text-slate-400">
                        Son güncelleme: {formatDate(row.updatedAt)}
                      </span>
                      <div className="rounded-xl border border-slate-200 bg-white p-2 transition group-hover:border-slate-300">
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </SectionCard>
        )}

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-white shadow-lg">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">İpucu</h4>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Açtığınız taleplerde başlık ve problem adımlarını net yazmanız, destek
                sürecinin daha hızlı ilerlemesini sağlar.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}