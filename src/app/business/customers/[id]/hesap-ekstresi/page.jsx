"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";

const money = (n) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const fmtDateShort = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("tr-TR");
  } catch {
    return "—";
  }
};

function StatementInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = params?.id;
  const customerId = Array.isArray(rawId) ? rawId[0] : rawId;
  const modeRaw = (searchParams.get("mode") || "simple").toLowerCase();
  const mode = ["simple", "detailed", "reconciliation"].includes(modeRaw) ? modeRaw : "simple";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!customerId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/business/customers/${customerId}/statement`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Ekstre alınamadı");
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e.message || "Hata");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  if (!customerId) {
    return <div className="p-4 text-sm text-red-600">Geçersiz müşteri.</div>;
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-600">Ekstre yükleniyor…</div>;
  }

  if (error || !data?.customer) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-sm text-red-600">{error || "Veri bulunamadı."}</p>
        <Link href={`/business/customers/${customerId}`} className="mt-4 inline-block text-sm font-semibold text-sky-700">
          Müşteri detayına dön
        </Link>
      </div>
    );
  }

  const { business, customer, summary, lines, checks, notes } = data;
  const title =
    mode === "detailed"
      ? "Detaylı Hesap Ekstresi"
      : mode === "reconciliation"
        ? "Mutabakat Mektubu"
        : "Hesap Ekstresi";

  const bizLine = [business?.name, [business?.district, business?.city].filter(Boolean).join(" / ")].filter(Boolean).join(" — ");

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 text-[13px] text-slate-800">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/business/customers/${customerId}`}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Müşteri detayı
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/business/customers/${customerId}/hesap-ekstresi?mode=simple`}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${mode === "simple" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white"}`}
          >
            Ekstre
          </Link>
          <Link
            href={`/business/customers/${customerId}/hesap-ekstresi?mode=detailed`}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${mode === "detailed" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white"}`}
          >
            Detaylı ekstre
          </Link>
          <Link
            href={`/business/customers/${customerId}/hesap-ekstresi?mode=reconciliation`}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${mode === "reconciliation" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white"}`}
          >
            Mutabakat mektubu
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
          >
            <PrinterIcon className="h-4 w-4" />
            Yazdır
          </button>
        </div>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-4 print:border-slate-300">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900 md:text-2xl">{customer.name}</h1>
          <p className="mt-1 text-xs text-slate-600">
            Sınıf: {customer.customerClass || "GENEL"}
            {customer.taxId ? ` · VKN/TCKN: ${customer.taxId}` : ""}
          </p>
          {business ? (
            <div className="mt-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">{business.name}</p>
              {bizLine ? <p>{bizLine}</p> : null}
              {business.address ? <p className="mt-1 whitespace-pre-wrap">{business.address}</p> : null}
              <p className="mt-1">
                {[business.phone, business.email].filter(Boolean).join(" · ")}
              </p>
            </div>
          ) : null}
          <p className="mt-3 text-xs text-slate-500">Oluşturma: {fmtDate(data.generatedAt)}</p>
        </header>

        {mode === "reconciliation" ? (
          <ReconciliationBody customer={customer} business={business} summary={summary} lines={lines} fmtDateShort={fmtDateShort} />
        ) : (
          <>
            <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatBox label="Açılış bakiyesi" value={`₺${money(summary.openingBalance)}`} />
              <StatBox label="Toplam borç" value={`₺${money(summary.sumBorc)}`} />
              <StatBox label="Toplam alacak" value={`₺${money(summary.sumAlacak)}`} />
              <StatBox label="Güncel bakiye (kayıt)" value={`₺${money(summary.currentBalance)}`} />
            </section>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-600 print:bg-transparent">
                    <th className="px-2 py-2">Tarih</th>
                    <th className="px-2 py-2">Açıklama</th>
                    {mode === "detailed" ? (
                      <>
                        <th className="px-2 py-2">Hesap</th>
                        <th className="px-2 py-2">Tür</th>
                        <th className="px-2 py-2">Kalem / Not</th>
                      </>
                    ) : null}
                    <th className="px-2 py-2 text-right">Borç</th>
                    <th className="px-2 py-2 text-right">Alacak</th>
                    <th className="px-2 py-2 text-right">Bakiye</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 bg-slate-50/80 font-semibold print:bg-transparent">
                    <td className="px-2 py-2">—</td>
                    <td className="px-2 py-2">Açılış bakiyesi (devir)</td>
                    {mode === "detailed" ? (
                      <>
                        <td className="px-2 py-2">—</td>
                        <td className="px-2 py-2">—</td>
                        <td className="px-2 py-2">—</td>
                      </>
                    ) : null}
                    <td className="px-2 py-2 text-right">—</td>
                    <td className="px-2 py-2 text-right">—</td>
                    <td className="px-2 py-2 text-right">₺{money(summary.openingBalance)}</td>
                  </tr>
                  {lines.length === 0 ? (
                    <tr>
                      <td colSpan={mode === "detailed" ? 8 : 5} className="px-2 py-6 text-center text-slate-500">
                        Bu müşteri için listelenecek hareket bulunmuyor.
                      </td>
                    </tr>
                  ) : (
                    lines.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="whitespace-nowrap px-2 py-2 text-slate-600">{fmtDateShort(row.date)}</td>
                        <td className="px-2 py-2">{row.description}</td>
                        {mode === "detailed" ? (
                          <>
                            <td className="px-2 py-2 text-slate-600">{row.accountName || "—"}</td>
                            <td className="px-2 py-2 text-slate-600">
                              {row.kind === "SALE" ? "Satış" : row.operation || "Kasa"}
                            </td>
                            <td className="max-w-[220px] truncate px-2 py-2 text-slate-600" title={itemsTitle(row)}>
                              {itemsTitle(row)}
                            </td>
                          </>
                        ) : null}
                        <td className="px-2 py-2 text-right tabular-nums">{row.borc > 0 ? `₺${money(row.borc)}` : "—"}</td>
                        <td className="px-2 py-2 text-right tabular-nums">{row.alacak > 0 ? `₺${money(row.alacak)}` : "—"}</td>
                        <td className="px-2 py-2 text-right font-medium tabular-nums">₺{money(row.balance)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {(checks?.length > 0 || notes?.length > 0) && mode === "detailed" ? (
              <div className="mt-8">
                <h2 className="mb-2 text-sm font-bold text-slate-900">Çek / senet (bilgi)</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {checks?.length > 0 ? (
                    <MiniTable
                      title="Çekler"
                      rows={checks.map((c) => ({
                        c1: fmtDateShort(c.dueDate || c.createdAt),
                        c2: c.checkNumber || "—",
                        c3: `₺${money(c.amount)}`,
                        c4: c.status,
                      }))}
                    />
                  ) : null}
                  {notes?.length > 0 ? (
                    <MiniTable
                      title="Senetler"
                      rows={notes.map((n) => ({
                        c1: fmtDateShort(n.dueDate || n.createdAt),
                        c2: n.noteNumber || "—",
                        c3: `₺${money(n.amount)}`,
                        c4: n.status,
                      }))}
                    />
                  ) : null}
                </div>
              </div>
            ) : null}

            <p className="mt-4 text-[11px] text-slate-500">
              Bakiye sütunu açılış bakiyesi üzerinden kronolojik borç/alacak hareketleriyle hesaplanır. Kayıtlı cari bakiye: ₺
              {money(summary.currentBalance)}.
              {Math.abs(summary.computedClosing - summary.currentBalance) > 0.02
                ? " Hesaplanan kapanış ile kayıtlı bakiye arasında fark olabilir (eksik tarih aralığı veya manuel kayıtlar)."
                : ""}
            </p>
          </>
        )}
      </article>

    </div>
  );
}

function itemsTitle(row) {
  if (row.kind !== "SALE" || !row.items?.length) return "—";
  return row.items.map((it) => `${it.name} (${it.quantity})`).join(", ");
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 print:border-slate-300">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function MiniTable({ title, rows }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="mb-2 text-xs font-bold text-slate-800">{title}</p>
      <table className="w-full text-left text-[11px]">
        <thead>
          <tr className="text-slate-500">
            <th className="py-1">Vade / Tarih</th>
            <th className="py-1">No</th>
            <th className="py-1 text-right">Tutar</th>
            <th className="py-1">Durum</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className="py-1">{r.c1}</td>
              <td className="py-1">{r.c2}</td>
              <td className="py-1 text-right">{r.c3}</td>
              <td className="py-1">{r.c4}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReconciliationBody({ customer, business, summary, lines, fmtDateShort }) {
  const today = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  const bizName = business?.name || "İşletmemiz";

  return (
    <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-800">
      <p>{today}</p>
      <p>
        <span className="font-semibold">Sayın {customer.name},</span>
      </p>
      <p>
        {bizName} olarak tarafımızdaki muhasebe kayıtlarına göre, hesabınızın özeti aşağıdaki gibidir. Lütfen kendi
        kayıtlarınızla karşılaştırınız.
      </p>

      <div className="my-6 rounded-xl border border-slate-200 bg-slate-50 p-4 print:bg-white">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="py-2 font-medium text-slate-600">Açılış bakiyesi</td>
              <td className="py-2 text-right font-semibold">₺{money(summary.openingBalance)}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-2 font-medium text-slate-600">Dönem toplam borç</td>
              <td className="py-2 text-right font-semibold">₺{money(summary.sumBorc)}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-2 font-medium text-slate-600">Dönem toplam alacak</td>
              <td className="py-2 text-right font-semibold">₺{money(summary.sumAlacak)}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-2 font-medium text-slate-600">Hesaplanan bakiye (hareketlerle)</td>
              <td className="py-2 text-right font-semibold">₺{money(summary.computedClosing)}</td>
            </tr>
            <tr>
              <td className="py-2 font-medium text-slate-600">Sistemde kayıtlı güncel bakiye</td>
              <td className="py-2 text-right font-bold text-slate-900">₺{money(summary.currentBalance)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Yukarıdaki tutarlarla <strong>mutabık iseniz</strong>, bu sayfayı yazdırıp imzalayarak tarafımıza iletmeniz veya
        e-posta ile onaylamanız yeterlidir. <strong>Mutabık değilseniz</strong>, farklılık tutarını ve açıklamanızı
        birlikte bildirmenizi rica ederiz.
      </p>

      {lines.length > 0 ? (
        <div className="mt-6">
          <p className="mb-2 text-xs font-bold uppercase text-slate-500">Hareket özeti (son kayıtlar)</p>
          <table className="w-full border-collapse text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-600 print:bg-transparent">
                <th className="px-1 py-1">Tarih</th>
                <th className="px-1 py-1">Açıklama</th>
                <th className="px-1 py-1 text-right">Borç</th>
                <th className="px-1 py-1 text-right">Alacak</th>
              </tr>
            </thead>
            <tbody>
              {lines.slice(-15).map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="px-1 py-1 whitespace-nowrap">{fmtDateShort(row.date)}</td>
                  <td className="px-1 py-1">{row.description}</td>
                  <td className="px-1 py-1 text-right tabular-nums">{row.borc > 0 ? `₺${money(row.borc)}` : "—"}</td>
                  <td className="px-1 py-1 text-right tabular-nums">{row.alacak > 0 ? `₺${money(row.alacak)}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <p className="mt-10 text-slate-700">Saygılarımızla,</p>
      <p className="font-bold text-slate-900">{bizName}</p>
    </div>
  );
}

export default function CustomerStatementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-600">Yükleniyor…</div>
      }
    >
      <StatementInner />
    </Suspense>
  );
}
