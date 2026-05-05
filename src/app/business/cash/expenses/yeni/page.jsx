"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  PaperClipIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

const VAT_OPTIONS = [0, 1, 8, 10, 18, 20];

function formatTry(n) {
  return `₺${Number(n || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function parseTrAmount(input) {
  if (input == null) return 0;
  const raw = String(input).trim();
  if (!raw) return 0;
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function formatTrAmountInput(raw) {
  if (!raw) return "";
  let v = String(raw).replace(/[^0-9,]/g, "");
  const parts = v.split(",");
  if (parts.length > 2) {
    v = parts[0] + "," + parts.slice(1).join("");
  }
  const [integerPart, decimalPart] = v.split(",");
  let formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (decimalPart !== undefined) {
    return formattedInteger + "," + decimalPart;
  }
  return formattedInteger;
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

export default function NewExpensePage() {
  const router = useRouter();

  const [accounts, setAccounts] = useState([]);
  const [flatItems, setFlatItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [expenseItemId, setExpenseItemId] = useState("");
  const [transactionDate, setTransactionDate] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  });
  const [receiptNo, setReceiptNo] = useState("");
  const [description, setDescription] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [paymentDate, setPaymentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  });
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [vatRate, setVatRate] = useState("0");
  const [accountId, setAccountId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [notes, setNotes] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualCategory, setManualCategory] = useState("");
  const [manualItemName, setManualItemName] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setApiError(null);

      try {
        const [accRes, catRes] = await Promise.all([
          fetch("/api/business/cash/accounts"),
          fetch("/api/business/expense-categories"),
        ]);

        const accData = await accRes.json();
        const catData = await catRes.json();

        if (accRes.ok && Array.isArray(accData)) {
          setAccounts(accData);
          if (accData[0]) setAccountId(accData[0].id);
        }

        if (catRes.ok && catData.categories) {
          const flat = [];
          for (const c of catData.categories) {
            for (const it of c.items || []) {
              flat.push({
                id: it.id,
                label: `${c.name}: ${it.name}`,
                categoryName: c.name,
                itemName: it.name,
              });
            }
          }
          setFlatItems(flat);
        }
      } catch (e) {
        console.error(e);
        setApiError("Veriler yüklenemedi.");
        toast.error("Veriler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const amountNumber = parseTrAmount(amount);
  const vatNumber = Number(vatRate || 0);
  const vatIncluded = amountNumber > 0 ? (amountNumber * vatNumber) / (100 + vatNumber) : 0;
  const baseAmount = amountNumber - vatIncluded;

  const selectedExpenseLabel = useMemo(() => {
    if (manualMode) {
      if (manualCategory && manualItemName) return `${manualCategory} ⬺ ${manualItemName}`;
      if (manualItemName) return manualItemName;
      return "Liste dışı giriş";
    }

    const selected = flatItems.find((x) => x.id === expenseItemId);
    return selected?.label || "Masraf kalemi seçin";
  }, [manualMode, manualCategory, manualItemName, expenseItemId, flatItems]);

  const submit = async (e) => {
    e.preventDefault();

    if (!accountId) {
      toast.error("Ödeme hesabı seçin.");
      return;
    }

    if (!amount || parseTrAmount(amount) <= 0) {
      toast.error("Geçerli tutar girin.");
      return;
    }

    let categoryPayload;
    let itemIdPayload = null;

    if (manualMode) {
      const m1 = manualCategory.trim();
      const m2 = manualItemName.trim();

      if (!m2) {
        toast.error("Liste dışı masraf adı girin.");
        return;
      }

      categoryPayload = m1 ? `${m1} ⬺ ${m2}` : m2;
    } else {
      const selected = flatItems.find((x) => x.id === expenseItemId);

      if (!selected) {
        toast.error("Masraf kalemi seçin veya liste dışı girişi açın.");
        return;
      }

      categoryPayload = `${selected.categoryName} ⬺ ${selected.itemName}`;
      itemIdPayload = selected.id;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/business/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          amount: parseTrAmount(amount),
          category: categoryPayload,
          description: description.trim() || null,
          date: transactionDate,
          expenseItemId: itemIdPayload,
          paymentStatus,
          paymentDate: paymentDate || null,
          dueDate: dueDate || null,
          receiptNo: receiptNo.trim() || null,
          vatRate: vatRate === "" ? null : parseFloat(vatRate),
          projectName: projectName.trim() || null,
          notes: notes.trim() || null,
          recurring,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Kayıt başarısız.");

      toast.success("Masraf kaydedildi.");
      router.push("/business/cash/expenses");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inp =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400";
  const label =
    "mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500";

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-slate-500">Yükleniyor⬦</div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 text-[13px] text-slate-700">
      <form onSubmit={submit} className="space-y-6">
        <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
                <DocumentTextIcon className="h-4 w-4" />
                Yeni Masraf
              </div>

              <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
                Yeni Masraf Kaydı
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                Masraf kalemi, ödeme hesabı, tutar ve tarih bilgilerini girerek
                yeni masraf kaydı oluşturun.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckIcon className="h-5 w-5" />
                Kaydet
              </button>

              <Link
                href="/business/cash/expenses"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Geri Dön
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Masraf Kalemi"
            value={selectedExpenseLabel}
            sub="Seçili veya manuel kalem"
            icon={ClipboardDocumentListIcon}
            tone="blue"
          />
          <StatCard
            title="Tutar"
            value={formatTry(amountNumber)}
            sub="KDV dahil tutar"
            icon={BanknotesIcon}
            tone="emerald"
          />
          <StatCard
            title="KDV"
            value={`%${vatNumber}`}
            sub={formatTry(vatIncluded)}
            icon={DocumentTextIcon}
            tone="amber"
          />
          <StatCard
            title="İşlem Tarihi"
            value={transactionDate || "-"}
            sub="Masrafın işleneceği tarih"
            icon={CalendarDaysIcon}
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
                <p className="mt-1 text-sm leading-6">{apiError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/65">
                Hesap Kalemi
              </p>
              <h2 className="mt-1 text-lg font-bold">Masraf bilgileri</h2>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className={label}>Masraf Kalemi</label>

                {!manualMode ? (
                  <>
                    <select
                      value={expenseItemId}
                      onChange={(e) => setExpenseItemId(e.target.value)}
                      className={inp}
                    >
                      <option value="">Masraf kalemi seçin</option>
                      {flatItems.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.label}
                        </option>
                      ))}
                    </select>

                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      <Link
                        href="/business/cash/expenses/kalemler"
                        className="font-medium text-emerald-600 hover:underline"
                      >
                        listeyi düzenlemek için tıklayın
                      </Link>
                      <button
                        type="button"
                        onClick={() => setManualMode(true)}
                        className="font-medium text-emerald-600 hover:underline"
                      >
                        listede olmayan masraf eklemek için tıklayın
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-3">
                    <input
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      placeholder="Ana grup (isteğe bağlı)"
                      className={inp}
                    />
                    <input
                      value={manualItemName}
                      onChange={(e) => setManualItemName(e.target.value)}
                      placeholder="Masraf adı"
                      className={inp}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setManualMode(false);
                        setManualCategory("");
                        setManualItemName("");
                      }}
                      className="text-xs font-medium text-slate-600 hover:underline"
                    >
                      Listeden seç
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className={label}>İşlem Tarihi</label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className={inp}
                />
              </div>

              <div>
                <label className={label}>Fiş / Belge No</label>
                <input
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  placeholder="İsteğe bağlı"
                  className={inp}
                />
              </div>

              <div>
                <label className={label}>Proje</label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="İsteğe bağlı"
                  className={inp}
                />
              </div>

              <div>
                <label className={label}>Açıklama</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={inp}
                />
              </div>

              <div>
                <label className={label}>Arşiv</label>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
                  onClick={() => toast.message("Belge yükleme yakında eklenecek.")}
                >
                  <PaperClipIcon className="h-4 w-4" />
                  Arşiv Belgesi Yükle
                </button>
                <p className="mt-2 text-xs text-slate-500">
                  Masraf ile ilgili belge varsa buraya ekleyebilirsiniz.
                </p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="border-b border-slate-200 bg-emerald-600 px-5 py-4 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
                Tutar
              </p>
              <h2 className="mt-1 text-lg font-bold">Ödeme bilgileri</h2>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className={label}>Ödeme Hesabı</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className={inp}
                  required
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={label}>Ödeme Durumu</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className={inp}
                >
                  <option value="PENDING">Daha sonra ödenecek</option>
                  <option value="PAID">Ödendi</option>
                </select>
              </div>

              <div>
                <label className={label}>Vade Tarihi</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inp}
                />
              </div>

              <div>
                <label className={label}>Ödeme Tarihi</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className={inp}
                />
              </div>

              <div>
                <label className={label}>Tutar (KDV Dahil)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(formatTrAmountInput(e.target.value))}
                  className={inp}
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className={label}>
                  KDV Oranı (%) <span className="font-normal text-slate-400">isteğe bağlı</span>
                </label>
                <select
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  className={inp}
                >
                  {VAT_OPTIONS.map((v) => (
                    <option key={v} value={String(v)}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={label}>Not</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className={inp}
                  placeholder='Tablo "Not" sütununda görünür'
                />
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600"
              />
              Tekrarlayan masraf kaydı oluştur
            </label>

            <div className="flex items-center gap-2 text-slate-400">
              <QuestionMarkCircleIcon className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Tutar
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatTry(amountNumber)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                KDV Tutarı
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatTry(vatIncluded)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                KDV Hariç
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatTry(baseAmount)}
              </p>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
