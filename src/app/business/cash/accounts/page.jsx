"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  PlusIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  WalletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";

const ACCOUNT_TYPE_OPTIONS = [
  { type: "CASH", label: "Kasa Ekle" },
  { type: "BANK", label: "Banka Hesabı Ekle" },
  { type: "POS", label: "POS Hesabı Ekle" },
  { type: "PARTNER", label: "Ortaklar Hesabı Ekle" },
  { type: "CREDIT", label: "Veresiye Hesabı Ekle" },
  { type: "CREDIT_CARD", label: "Kredi Kartı Ekle" },
];

const PANELS_LEFT = [
  {
    type: "CASH",
    title: "KASA TANIMLARI",
    showHelp: true,
    helpText:
      "İşletmenizdeki fiziksel kasaları burada ayrı ayrı tanımlayabilirsiniz. Nakit giriş-çıkışlar bu hesaplarda takip edilir ve kasa bakiyesi anlık güncellenir.",
  },
  {
    type: "POS",
    title: "POS HESAPLARI",
    showHelp: true,
    helpText:
      "Her POS cihazınız için ayrı bir hesap açabilirsiniz. Kredi kartı ile tahsilat yaptığınızda tahsilat tutarları bu hesaplarda birikir. Bloke çözülme tarihinde çözülen tutarı Hesaplar Arası Transfer ile banka hesabınıza alabilirsiniz.",
  },
  {
    type: "CREDIT_CARD",
    title: "KREDİ KARTLARI",
    showHelp: true,
    helpText:
      "İşletme kredi kartlarınızı burada yönetebilirsiniz. Kartla yapılan ödemeleri ve kart bazlı hareketleri ayrı izleyerek nakit akışını daha doğru takip edebilirsiniz.",
  },
];

const PANELS_RIGHT = [
  {
    type: "BANK",
    title: "BANKA HESAPLARI",
    showHelp: true,
    helpText:
      "Banka hesaplarınızı ayrı ayrı tanımlayarak havale/EFT girişlerini, ödemeleri ve transferleri banka bazında takip edebilirsiniz.",
  },
  {
    type: "PARTNER",
    title: "ŞİRKET ORTAKLARI HESAPLARI",
    showHelp: true,
    helpText:
      "Ortaklara ait para giriş-çıkışlarını bu hesaplarda takip edebilirsiniz. Ortak bazlı bakiye ve borç-alacak takibini net şekilde görmenizi sağlar.",
  },
  {
    type: "CREDIT",
    title: "VERESİYE HESAPLARI",
    showHelp: true,
    helpText:
      "Veresiye işlemlerinde müşteriden tahsil edilmemiş tutarları burada izleyebilirsiniz. Tahsilat aldıkça ilgili hareketi işleyip veresiye bakiyesini düşürebilirsiniz.",
  },
];

const MODAL_TITLES = {
  CASH: "Kasa",
  BANK: "Banka Hesabı",
  POS: "POS Hesabı",
  PARTNER: "Ortaklar Hesabı",
  CREDIT: "Veresiye Hesabı",
  CREDIT_CARD: "Kredi Kartı",
  ESCROW: "Havuz Hesap",
};

const CURRENCIES = [
  { value: "TRY", label: "TL" },
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
];

function formatCurrency(currency, amount) {
  const n = (Number(amount) || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (currency === "EUR") return `EUR ${n}`;
  if (currency === "USD") return `USD ${n}`;
  return `TL ${n}`;
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
}) {
  const tones = {
    green:
      "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    blue: "bg-sky-500 hover:bg-sky-600 border-sky-600 text-white",
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
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

function AccountCard({ acc }) {
  return (
    <Link
      href={`/business/cash/accounts/${acc.id}`}
      className="min-w-[170px] rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md"
      title={`${acc.name} hareketlerine git`}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-3.5 w-3.5 shrink-0 rounded"
          style={{ backgroundColor: acc.labelColor || "#e5e7eb" }}
        />
        <p className="truncate text-sm font-semibold text-slate-900">{acc.name}</p>
      </div>

      {acc.accountNo ? (
        <p className="mt-1 truncate text-xs text-slate-400">{acc.accountNo}</p>
      ) : (
        <p className="mt-1 text-xs text-slate-400">Hesap numarası yok</p>
      )}

      <p className="mt-3 text-lg font-bold text-slate-900">
        {formatCurrency(acc.currency || "TRY", acc.balance)}
      </p>
    </Link>
  );
}

function calculatePanelTotal(accountList = []) {
  const totals = accountList.reduce((acc, item) => {
    const currency = item.currency || "TRY";
    acc[currency] = (acc[currency] || 0) + (Number(item.balance) || 0);
    return acc;
  }, {});

  const orderedCurrencies = ["TRY", "EUR", "USD"];
  const parts = orderedCurrencies
    .filter((currency) => totals[currency] != null)
    .map((currency) => formatCurrency(currency, totals[currency]));

  return parts.length > 0 ? parts.join(" · ") : formatCurrency("TRY", 0);
}

function Panel({ title, showHelp, helpText, accountList }) {
  const panelTotal = useMemo(
    () => calculatePanelTotal(accountList),
    [accountList],
  );

  return (
    <section className="overflow-visible rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/65">
            Hesap Grubu
          </p>
          <h2 className="mt-1 text-base font-bold">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
            {panelTotal}
          </span>
          {showHelp ? (
            <div className="group relative">
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
                aria-label="Yardım"
              >
                <QuestionMarkCircleIcon className="h-5 w-5" />
              </button>

              <div className="pointer-events-none absolute right-0 top-12 z-20 hidden w-72 rounded-md border border-white/30 bg-[#5f95a1] px-4 py-3 text-sm leading-6 text-white shadow-xl group-hover:block">
                {helpText || "Bu alan için bilgilendirme metni yakında eklenecek."}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="p-5">
        {accountList.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
            Bu grupta tanımlı hesap bulunmuyor.
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {accountList.map((acc) => (
              <AccountCard key={acc.id} acc={acc} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [typeSelectModalOpen, setTypeSelectModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("CASH");

  const [form, setForm] = useState({
    name: "",
    labelColor: "#f5f0e6",
    currency: "TRY",
    accountNo: "",
    balance: 0,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/business/cash/accounts");
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setAccounts(data);
      } else {
        throw new Error(data?.error || "Hesaplar yüklenemedi.");
      }
    } catch (e) {
      console.error(e);
      setApiError(e.message || "Hesaplar yüklenirken hata oluştu.");
      toast.error("Hesaplar yüklenirken hata oluştu.");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const openFormModal = (type) => {
    setModalType(type);
    setForm({
      name: "",
      labelColor: "#f5f0e6",
      currency: "TRY",
      accountNo: "",
      balance: 0,
    });
    setTypeSelectModalOpen(false);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name?.trim()) {
      toast.error("Tanım girin.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/business/cash/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          type: modalType,
          balance: parseFloat(form.balance) || 0,
          currency: form.currency,
          accountNo: form.accountNo?.trim() || null,
          labelColor: form.labelColor || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Kayıt başarısız.");
      }

      toast.success("Hesap eklendi.");
      setModalOpen(false);
      fetchAccounts();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Kayıt sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const byType = (type) => accounts.filter((a) => a.type === type);
  const escrowAccounts = accounts.filter((a) => a.type === "ESCROW");

  const summary = useMemo(() => {
    return {
      totalAccounts: accounts.length,
      cashAndBank: byType("CASH").length + byType("BANK").length,
      cardAndPos: byType("POS").length + byType("CREDIT_CARD").length,
      otherAccounts:
        byType("PARTNER").length + byType("CREDIT").length + escrowAccounts.length,
    };
  }, [accounts]);

  const inp =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400";
  const label =
    "mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500";

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 text-[13px] text-slate-700">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <WalletIcon className="h-4 w-4" />
              Nakit Yönetimi
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
              Hesaplarım
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Kasa, banka, POS, kredi kartı ve diğer hesaplarınızı tek ekranda
              yönetin.
            </p>
          </div>

          <ActionButton
            onClick={() => setTypeSelectModalOpen(true)}
            icon={PlusIcon}
            tone="green"
          >
            Yeni Hesap Ekle
          </ActionButton>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Toplam Hesap"
          value={String(summary.totalAccounts)}
          sub="Tanımlı tüm hesap kayıtları"
          icon={WalletIcon}
          tone="blue"
        />
        <StatCard
          title="Kasa + Banka"
          value={String(summary.cashAndBank)}
          sub="Nakit ve banka hesap adedi"
          icon={BanknotesIcon}
          tone="emerald"
        />
        <StatCard
          title="POS + Kart"
          value={String(summary.cardAndPos)}
          sub="POS ve kredi kartı hesap adedi"
          icon={CreditCardIcon}
          tone="amber"
        />
        <StatCard
          title="Diğer Hesaplar"
          value={String(summary.otherAccounts)}
          sub="Ortak, veresiye ve diğer hesaplar"
          icon={BuildingLibraryIcon}
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

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {PANELS_LEFT.map((p) => (
              <Panel
                key={p.type}
                title={p.title}
                showHelp={p.showHelp}
                helpText={p.helpText}
                accountList={byType(p.type)}
              />
            ))}

            {escrowAccounts.length > 0 && (
              <Panel
                title="DİĞER HESAPLAR"
                showHelp={false}
                accountList={escrowAccounts}
              />
            )}
          </div>

          <div className="space-y-6">
            {PANELS_RIGHT.map((p) => (
              <Panel
                key={p.type}
                title={p.title}
                showHelp={p.showHelp}
                helpText={p.helpText}
                accountList={byType(p.type)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hesap tipi seçim modalı */}
      {typeSelectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setTypeSelectModalOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-200 bg-emerald-600 px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">Yeni Hesap Ekle</h2>
                <button
                  type="button"
                  className="rounded-lg p-1.5 transition hover:bg-white/20"
                  onClick={() => setTypeSelectModalOpen(false)}
                  aria-label="Kapat"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="mb-4 text-sm text-slate-500">
                Eklemek istediğiniz hesap tipini seçin.
              </p>
              <div className="space-y-1">
                {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.type}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    onClick={() => openFormModal(opt.type)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !saving && setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                    Yeni Hesap
                  </p>
                  <h2 className="mt-1 text-lg font-bold">
                    {MODAL_TITLES[modalType] || "Yeni Hesap"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
                  onClick={() => !saving && setModalOpen(false)}
                  aria-label="Kapat"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className={label}>Tanım</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className={inp}
                  placeholder="Hesap adı"
                />
              </div>

              <div>
                <label className={label}>Etiket Rengi</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <input
                    type="color"
                    value={form.labelColor}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, labelColor: e.target.value }))
                    }
                    className="h-10 w-12 cursor-pointer rounded border border-slate-300 bg-white"
                  />
                  <span className="text-sm font-medium text-slate-600">
                    {form.labelColor}
                  </span>
                </div>
              </div>

              <div>
                <label className={label}>Para Birimi</label>
                <select
                  value={form.currency}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, currency: e.target.value }))
                  }
                  className={inp}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={label}>Hesap No</label>
                <input
                  type="text"
                  value={form.accountNo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, accountNo: e.target.value }))
                  }
                  className={inp}
                  placeholder="İsteğe bağlı"
                />
              </div>

              <div>
                <label className={label}>Güncel Bakiye</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.balance}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, balance: e.target.value }))
                  }
                  className={inp}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => !saving && setModalOpen(false)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <CheckIcon className="h-5 w-5" />
                  )}
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