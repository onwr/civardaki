"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ArrowsUpDownIcon,
  BuildingLibraryIcon,
  TrashIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";

function formatDateTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(currency, amount) {
  const n = (Number(amount) || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (currency === "EUR") return `EUR ${n}`;
  if (currency === "USD") return `USD ${n}`;
  return `TL ${n}`;
}

function transactionDirection(tx, accountId) {
  if (tx.type === "TRANSFER" && tx.toAccountId === accountId) return "IN";
  if (tx.type === "TRANSFER" && tx.accountId === accountId) return "OUT";
  if (tx.type === "INCOME") return "IN";
  return "OUT";
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Türkçe ondalık (virgüllü) rakam girdisini temizler.
 * Kullanıcı yazarken "1.234,56" veya "1234,56" girebilir.
 * Yalnızca rakam, nokta ve virgüle izin verir; birden fazla
 * ayraç karakterini kaldırır.
 */
function formatTrAmountInput(raw) {
  // Sadece rakam, virgül ve noktaya izin ver
  let v = String(raw).replace(/[^0-9.,]/g, "");
  // Birden fazla virgül varsa sonuncusunu tut
  const parts = v.split(",");
  if (parts.length > 2) v = parts.slice(0, -1).join("") + "," + parts[parts.length - 1];
  return v;
}

/**
 * "1.234,56" veya "1234,56" veya "1234.56" biçimindeki string'i
 * JS float'a çevirir.
 */
function parseTrAmount(raw) {
  if (!raw) return 0;
  const s = String(raw)
    .replace(/\./g, "")   // binlik ayraçları (nokta) kaldır
    .replace(",", ".");   // ondalık virgülü noktaya çevir
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function typeLabel(type) {
  if (type === "INCOME") return "Para Girişi";
  if (type === "EXPENSE") return "Para Çıkışı";
  if (type === "TRANSFER") return "Transfer";
  return type || "-";
}

const POS_BLOCKAGE_COST_GROUPS = [
  {
    label: "Araç Giderleri",
    options: [
      { value: "4123151", label: "Bakım/Onarım" },
      { value: "4123153", label: "Ceza" },
      { value: "4123148", label: "Kasko/Sigorta" },
      { value: "4123150", label: "Kiralama" },
      { value: "4123152", label: "Muayene" },
      { value: "4123149", label: "Vergi" },
      { value: "4123147", label: "Yakıt" },
    ],
  },
  {
    label: "Hammadde",
    options: [
      { value: "6841623", label: "Kağıt-İlaç-Mürekkep" },
      { value: "6841622", label: "Mdf-Sunta" },
      { value: "6841624", label: "Tutkal-Yapıştırıcı" },
    ],
  },
  {
    label: "İşletme Giderleri",
    options: [
      { value: "4123134", label: "Aidat" },
      { value: "6841626", label: "Demirbaş" },
      { value: "4123135", label: "Elektrik" },
      { value: "4123137", label: "Isınma" },
      { value: "4123138", label: "İletişim" },
      { value: "6841625", label: "Kargo" },
      { value: "4123140", label: "Kırtasiye" },
      { value: "4123133", label: "Kira" },
      { value: "6841627", label: "Makine Servis" },
      { value: "6841621", label: "Pazaryeri Komisyon" },
      { value: "4123136", label: "Su" },
      { value: "4123139", label: "Temizlik" },
    ],
  },
  {
    label: "Mali Giderler",
    options: [
      { value: "4123156", label: "Banka Masrafları" },
      { value: "4123157", label: "Faiz" },
      { value: "4123159", label: "KDV" },
      { value: "4123155", label: "Kur Farkı" },
      { value: "4123160", label: "Kurumlar Vergisi" },
      { value: "4123154", label: "Mali Müşavir" },
      { value: "4123158", label: "Noter" },
      { value: "4123161", label: "Stopaj" },
    ],
  },
  {
    label: "Personel Giderleri",
    options: [
      { value: "4123141", label: "Maaş" },
      { value: "4123146", label: "Prim" },
      { value: "4123145", label: "Tazminat" },
      { value: "4123144", label: "Ulaşım" },
      { value: "4123142", label: "Vergi/SSK" },
      { value: "4123143", label: "Yemek" },
    ],
  },
];

function parseTrAmount(input) {
  if (input == null) return 0;
  const raw = String(input).trim();
  if (!raw) return 0;
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function formatTrAmountInput(value) {
  const n = parseTrAmount(value);
  if (!n && n !== 0) return "";
  return n.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
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
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
            {title}
          </p>
          <p className="mt-3 truncate text-2xl font-bold tracking-tight">
            {value}
          </p>
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
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ActionButton({
  children,
  onClick,
  icon: Icon,
  tone = "white",
  type = "button",
  disabled = false,
  className = "",
}) {
  const tones = {
    green:
      "border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-700",
    blue: "border-sky-600 bg-sky-500 text-white hover:bg-sky-600",
    white:
      "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm",
    amber:
      "border-amber-500 bg-amber-500 text-white hover:bg-amber-600",
    rose: "border-rose-700 bg-rose-600 text-white hover:bg-rose-700",
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

function ModalShell({ title, children, onClose, footer }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                Hesap İşlemi
              </p>
              <h3 className="mt-1 text-lg font-bold">{title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/15"
            >
              Kapat
            </button>
          </div>
        </div>

        <div className="p-5">{children}</div>

        {footer ? (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <input
        {...props}
        className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#004aad]/40 focus:ring-4 focus:ring-[#004aad]/10 ${props.className || ""}`}
      />
    </label>
  );
}

function Textarea({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <textarea
        {...props}
        className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#004aad]/40 focus:ring-4 focus:ring-[#004aad]/10 ${props.className || ""}`}
      />
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <select
        {...props}
        className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#004aad]/40 focus:ring-4 focus:ring-[#004aad]/10 ${props.className || ""}`}
      >
        {children}
      </select>
    </label>
  );
}

export default function AccountTransactionsPage() {
  const params = useParams();
  const accountId = params?.id?.toString() || "";

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [transferMenuOpen, setTransferMenuOpen] = useState(false);
  const [transferDirection, setTransferDirection] = useState("FROM_THIS");
  const [saving, setSaving] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef(null);
  const [posBlockageForm, setPosBlockageForm] = useState({
    date: todayStr(),
    transferAccountId: "",
    blockedAmount: "",
    commissionRate: "0",
    commissionCostAccount: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    labelColor: "#f5f0e6",
    accountNo: "",
    balance: "0",
  });

  const [txForm, setTxForm] = useState({
    amount: "",
    description: "",
    date: todayStr(),
    transferAccountId: "",
  });

  const loadData = useCallback(async (cancelled = false) => {
    setLoading(true);
    setApiError(null);

    try {
      const [txRes, accountsRes] = await Promise.all([
        fetch(`/api/business/cash/accounts/${accountId}/transactions`),
        fetch("/api/business/cash/accounts"),
      ]);

      const data = await txRes.json();
      const accountsData = await accountsRes.json();

      if (!txRes.ok) throw new Error(data?.error || "Hareketler alınamadı.");
      if (cancelled) return;

      setAccount(data.account || null);
      setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
      setAllAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch (e) {
      if (cancelled) return;
      setApiError(e.message || "Hareketler alınamadı.");
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, [accountId]);

  const loadDocuments = useCallback(async () => {
    if (!accountId) return;
    setDocumentsLoading(true);
    try {
      const res = await fetch(`/api/business/cash/accounts/${accountId}/documents`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Belgeler alınamadı.");
      setDocuments(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      toast.error(err.message || "Belgeler alınamadı.");
    } finally {
      setDocumentsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    let cancelled = false;
    if (accountId) loadData(cancelled);
    return () => {
      cancelled = true;
    };
  }, [accountId, loadData]);

  useEffect(() => {
    if (showDocuments) loadDocuments();
  }, [showDocuments, loadDocuments]);

  const openEditModal = () => {
    setEditForm({
      name: account?.name || "",
      labelColor: account?.labelColor || "#f5f0e6",
      accountNo: account?.accountNo || "",
      balance: String(account?.balance || 0).replace(".", ","),
    });
    setModalType("EDIT");
  };

  const openTxModal = (type) => {
    setTxForm({
      amount: "",
      description: "",
      date: todayStr(),
      transferAccountId: "",
    });
    setModalType(type);
  };

  const openPosBlockageModal = () => {
    setPosBlockageForm({
      date: todayStr(),
      transferAccountId: "",
      blockedAmount: "",
      commissionRate: "0",
      commissionCostAccount: "",
    });
    setModalType("POS_BLOCKAGE");
  };

  const openTransferFromThis = () => {
    setTransferDirection("FROM_THIS");
    setTransferMenuOpen(false);
    openTxModal("TRANSFER");
  };

  const openTransferToThis = () => {
    setTransferDirection("TO_THIS");
    setTransferMenuOpen(false);
    openTxModal("TRANSFER");
  };

  const closeModal = () => {
    if (saving) return;
    setModalType(null);
    setEditingTx(null);
  };

  const openEditTransaction = (tx) => {
    setTxForm({
      amount: String(tx.amount || 0).replace(".", ","),
      description: tx.description || "",
      date: tx.date ? new Date(tx.date).toISOString().slice(0, 10) : todayStr(),
      transferAccountId: tx.transferAccountId || "",
    });
    setEditingTx(tx);
    setModalType("EDIT_TX");
  };

  const handleEditTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!editingTx?.id) return;
    const amount = parseTrAmount(txForm.amount);
    if (!(amount > 0)) {
      toast.error("Tutar 0'dan büyük olmalı.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/business/cash/transactions/${editingTx.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          description: txForm.description?.trim() || null,
          date: txForm.date ? new Date(txForm.date).toISOString() : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Hareket güncellenemedi.");
      toast.success("Hareket güncellendi.");
      setModalType(null);
      setEditingTx(null);
      await loadData(false);
    } catch (err) {
      toast.error(err.message || "Hareket güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransaction = async (tx) => {
    if (!tx?.id) return;
    if (!window.confirm("Bu hareket silinsin mi?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/business/cash/transactions/${tx.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Hareket silinemedi.");
      toast.success("Hareket silindi.");
      await loadData(false);
    } catch (err) {
      toast.error(err.message || "Hareket silinemedi.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDocument = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "DOCUMENT");

      const uploadRes = await fetch("/api/business/upload", {
        method: "POST",
        body: fd,
      });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) {
        throw new Error(uploadData?.message || "Dosya yüklenemedi.");
      }

      const saveRes = await fetch(`/api/business/cash/accounts/${accountId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name,
          url: uploadData?.url,
          fileId: uploadData?.media?.fileId || null,
          mimeType: file.type || null,
          sizeBytes: file.size || null,
        }),
      });
      const saveData = await saveRes.json().catch(() => ({}));
      if (!saveRes.ok) {
        throw new Error(saveData?.error || "Belge kaydı oluşturulamadı.");
      }

      toast.success("Belge yüklendi.");
      await loadDocuments();
    } catch (err) {
      toast.error(err.message || "Belge yükleme başarısız.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Bu belge silinsin mi?")) return;
    try {
      const res = await fetch(
        `/api/business/cash/accounts/${accountId}/documents/${docId}`,
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Belge silinemedi.");
      toast.success("Belge silindi.");
      await loadDocuments();
    } catch (err) {
      toast.error(err.message || "Belge silinemedi.");
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();

    if (!editForm.name?.trim()) {
      toast.error("Hesap adı zorunlu.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/business/cash/accounts/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          labelColor: editForm.labelColor || null,
          accountNo: editForm.accountNo?.trim() || null,
          balance: parseTrAmount(editForm.balance),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Hesap güncellenemedi.");

      toast.success("Hesap güncellendi.");
      setModalType(null);
      await loadData(false);
    } catch (err) {
      toast.error(err.message || "Hesap güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();

    const amount = parseTrAmount(txForm.amount);
    if (!(amount > 0)) {
      toast.error("Tutar 0'dan büyük olmalı.");
      return;
    }

    if (modalType === "TRANSFER" && !txForm.transferAccountId) {
      toast.error("Hedef hesap seçin.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type: modalType,
        amount,
        accountId:
          modalType === "TRANSFER" && transferDirection === "TO_THIS"
            ? txForm.transferAccountId
            : accountId,
        toAccountId:
          modalType === "TRANSFER"
            ? transferDirection === "TO_THIS"
              ? accountId
              : txForm.transferAccountId
            : null,
        category: "ACCOUNT_MOVEMENT",
        description: txForm.description?.trim() || null,
        date: txForm.date
          ? new Date(txForm.date).toISOString()
          : new Date().toISOString(),
      };

      const res = await fetch("/api/business/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "İşlem kaydedilemedi.");

      toast.success("İşlem kaydedildi.");
      setModalType(null);
      await loadData(false);
    } catch (err) {
      toast.error(err.message || "İşlem kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const handlePosBlockageSubmit = async (e) => {
    e.preventDefault();
    const blockedAmount = parseTrAmount(posBlockageForm.blockedAmount);
    const commissionRate = parseTrAmount(posBlockageForm.commissionRate);

    if (!(blockedAmount > 0)) {
      toast.error("Çözülen tutar 0'dan büyük olmalı.");
      return;
    }
    if (!posBlockageForm.transferAccountId) {
      toast.error("Aktarılacak banka hesabını seçin.");
      return;
    }
    if (commissionRate < 0) {
      toast.error("Komisyon oranı 0 veya daha büyük olmalı.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/business/cash/accounts/${accountId}/pos-unblock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: posBlockageForm.date,
          transferAccountId: posBlockageForm.transferAccountId,
          blockedAmount,
          commissionRate,
          commissionCostAccount: posBlockageForm.commissionCostAccount || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "POS bloke çözme işlemi başarısız.");
      toast.success("POS bloke çözme işlemi tamamlandı.");
      setModalType(null);
      await loadData(false);
    } catch (err) {
      toast.error(err.message || "POS bloke çözme işlemi başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const transferTargets = useMemo(
    () => allAccounts.filter((x) => x.id !== accountId),
    [allAccounts, accountId]
  );
  const bankTargets = useMemo(
    () => allAccounts.filter((x) => x.type === "BANK" && x.id !== accountId),
    [allAccounts, accountId],
  );
  const blockageAmountValue = useMemo(
    () => parseTrAmount(posBlockageForm.blockedAmount),
    [posBlockageForm.blockedAmount],
  );
  const blockageCommissionRate = useMemo(
    () => parseTrAmount(posBlockageForm.commissionRate),
    [posBlockageForm.commissionRate],
  );
  const blockageCommissionAmount = useMemo(
    () => (blockageAmountValue * blockageCommissionRate) / 100,
    [blockageAmountValue, blockageCommissionRate],
  );
  const blockageNetAmount = useMemo(
    () => Math.max(0, blockageAmountValue - blockageCommissionAmount),
    [blockageAmountValue, blockageCommissionAmount],
  );

  const totals = useMemo(() => {
    let borc = 0;
    let alacak = 0;

    for (const tx of transactions) {
      const amount = Number(tx.amount) || 0;
      const direction = transactionDirection(tx, accountId);
      if (direction === "OUT") borc += amount;
      else alacak += amount;
    }

    return { borc, alacak };
  }, [transactions, accountId]);

  const transactionCount = transactions.length;
  const currency = account?.currency || "TRY";

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <Link
                  href="/business/cash/accounts"
                  className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 transition hover:bg-white/15"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Hesaplara Dön
                </Link>

                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {account?.name || "Hesap Hareketleri"}
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Hesabın güncel bakiyesini, giriş-çıkış hareketlerini ve transfer
                  işlemlerini bu ekrandan yönetin.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton
                  onClick={openEditModal}
                  icon={PencilSquareIcon}
                  tone="white"
                  disabled={!account}
                >
                  Hesabı Güncelle
                </ActionButton>

                <ActionButton
                  onClick={() => openTxModal("INCOME")}
                  icon={ArrowDownTrayIcon}
                  tone="green"
                  disabled={!account}
                >
                  Para Girişi
                </ActionButton>

                <ActionButton
                  onClick={() => openTxModal("EXPENSE")}
                  icon={ArrowUpTrayIcon}
                  tone="rose"
                  disabled={!account}
                >
                  Para Çıkışı
                </ActionButton>

                <div className="relative">
                  <ActionButton
                    onClick={() => setTransferMenuOpen((p) => !p)}
                    icon={ArrowsRightLeftIcon}
                    tone="amber"
                    disabled={!account}
                  >
                    Transfer
                    <ChevronDownIcon className="h-4 w-4" />
                  </ActionButton>

                  {transferMenuOpen && (
                    <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
                      <button
                        type="button"
                        onClick={openTransferFromThis}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <ArrowUpTrayIcon className="h-5 w-5 text-emerald-700" />
                        Buradan Başka Hesaba Transfer Et
                      </button>
                      <button
                        type="button"
                        onClick={openTransferToThis}
                        className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5 text-amber-700" />
                        Başka Hesaptan Buraya Transfer Et
                      </button>
                    </div>
                  )}
                </div>

                {account?.type === "POS" ? (
                  <ActionButton
                    onClick={openPosBlockageModal}
                    icon={CheckCircleIcon}
                    tone="blue"
                    disabled={!account}
                  >
                    POS Bloke Çöz
                  </ActionButton>
                ) : null}

                <ActionButton
                  onClick={() => setShowDocuments(true)}
                  icon={DocumentTextIcon}
                  tone="blue"
                  disabled={!account}
                >
                  Dökümanlar
                </ActionButton>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Güncel Bakiye"
              value={formatMoney(currency, account?.balance || 0)}
              sub="Hesabın toplam bakiyesi"
              icon={BanknotesIcon}
              tone="blue"
            />
            <StatCard
              title="Hareket Sayısı"
              value={transactionCount}
              sub="Kayıtlı toplam işlem"
              icon={ArrowsUpDownIcon}
              tone="slate"
            />
            <StatCard
              title="Toplam Giriş"
              value={formatMoney(currency, totals.alacak)}
              sub="Dönem içi tüm girişler"
              icon={ArrowDownTrayIcon}
              tone="emerald"
            />
            <StatCard
              title="Toplam Çıkış"
              value={formatMoney(currency, totals.borc)}
              sub="Dönem içi tüm çıkışlar"
              icon={ArrowUpTrayIcon}
              tone="amber"
            />
          </div>
        </section>

        {apiError ? (
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
        ) : null}

        <SectionCard
          title="Hesap Özeti"
          subtitle="Seçili hesap için temel görünüm"
          right={
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
              <BuildingLibraryIcon className="h-4 w-4" />
              {account?.accountNo || "Hesap No Yok"}
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Hesap Adı
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {account?.name || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Para Birimi
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {currency}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Hesap No
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {account?.accountNo || "-"}
              </p>
            </div>
          </div>
        </SectionCard>

        {showDocuments ? (
          <SectionCard
            title="Hesap Dökümanları"
            subtitle="Bu hesaba ait önemli belgeleri yükleyip daha sonra kullanabilirsiniz."
            right={
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleUploadDocument}
                />
                <ActionButton
                  onClick={() => fileInputRef.current?.click()}
                  icon={CloudArrowUpIcon}
                  tone="green"
                  disabled={uploadingDoc}
                >
                  {uploadingDoc ? "Yükleniyor..." : "Yeni Belge Yükle"}
                </ActionButton>
                <ActionButton onClick={() => setShowDocuments(false)} tone="amber">
                  Geri Dön
                </ActionButton>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900">
                Bu hesap ile ilgili önemli belgeleri (sözleşme, taahhüt, ekstre...)
                buraya yükleyebilirsiniz. İstediğiniz zaman bu alandan tekrar indirip
                kullanabilirsiniz.
              </div>

              {documentsLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">
                  Belgeler yükleniyor...
                </div>
              ) : documents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-slate-500">
                  Henüz belge yüklenmedi.
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {doc.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(doc.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700"
                        >
                          İndir
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="rounded border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        ) : (
          <SectionCard
          title="Hareketler"
          subtitle="Hesaba ait tüm giriş, çıkış ve transfer kayıtları"
          >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-4 py-3 font-semibold">Tarih</th>
                  <th className="px-4 py-3 font-semibold">İşlem</th>
                  <th className="px-4 py-3 font-semibold">Açıklama</th>
                  <th className="px-4 py-3 font-semibold">Yön</th>
                  <th className="px-4 py-3 text-right font-semibold">Tutar</th>
                  <th className="px-4 py-3 text-center font-semibold">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      Yükleniyor...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      Eşleşen kayıt bulunamadı.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, index) => {
                    const amount = Number(tx.amount) || 0;
                    const direction = transactionDirection(tx, accountId);

                    return (
                      <tr
                        key={tx.id}
                        className={`border-b border-slate-100 transition hover:bg-sky-50/70 ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        <td className="px-4 py-3.5">{formatDateTime(tx.date)}</td>
                        <td className="px-4 py-3.5 font-medium text-slate-900">
                          {typeLabel(tx.type)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {tx.description || "-"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                              direction === "IN"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {direction === "IN" ? "Giriş" : "Çıkış"}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3.5 text-right font-semibold tabular-nums ${
                            direction === "IN" ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {formatMoney(currency, amount)}
                        </td>
                        <td className="px-4 py-3.5">
                          {tx.source === "cash_transaction" ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditTransaction(tx)}
                                className="rounded border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                              >
                                Düzenle
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTransaction(tx)}
                                className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="block text-center text-xs text-slate-400">
                              Kaynak kaydı
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          </SectionCard>
        )}

        {modalType === "EDIT_TX" && editingTx && (
          <ModalShell
            title="Hareket Düzenleme"
            onClose={closeModal}
            footer={
              <div className="flex justify-end gap-3">
                <ActionButton onClick={closeModal} tone="white" disabled={saving}>
                  Vazgeç
                </ActionButton>
                <ActionButton
                  onClick={handleEditTransactionSubmit}
                  icon={CheckCircleIcon}
                  tone="green"
                  disabled={saving}
                >
                  Kaydet
                </ActionButton>
              </div>
            }
          >
            <form onSubmit={handleEditTransactionSubmit} className="grid gap-4 md:grid-cols-2">
              <Textarea
                label="Açıklama"
                rows={4}
                className="md:col-span-2"
                value={txForm.description}
                onChange={(e) =>
                  setTxForm((p) => ({ ...p, description: e.target.value }))
                }
              />
              <Input
                label="Tarih"
                type="date"
                value={txForm.date}
                onChange={(e) =>
                  setTxForm((p) => ({ ...p, date: e.target.value }))
                }
              />
              <Input
                label="Tutar"
                type="text"
                inputMode="decimal"
                value={txForm.amount}
                onChange={(e) =>
                  setTxForm((p) => ({
                    ...p,
                    amount: formatTrAmountInput(e.target.value),
                  }))
                }
              />
            </form>
          </ModalShell>
        )}

        {modalType === "EDIT" && (
          <ModalShell
            title="Hesap Güncelleme"
            onClose={closeModal}
            footer={
              <div className="flex justify-end gap-3">
                <ActionButton onClick={closeModal} tone="white" disabled={saving}>
                  Vazgeç
                </ActionButton>
                <ActionButton
                  onClick={handleUpdateAccount}
                  icon={CheckCircleIcon}
                  tone="green"
                  disabled={saving}
                >
                  Kaydet
                </ActionButton>
              </div>
            }
          >
            <form onSubmit={handleUpdateAccount} className="grid gap-4 md:grid-cols-2">
              <Input
                label="Hesap Adı"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
              />

              <Input
                label="Hesap No"
                value={editForm.accountNo}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, accountNo: e.target.value }))
                }
              />

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Etiket Rengi
                </span>
                <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <input
                    type="color"
                    value={editForm.labelColor}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, labelColor: e.target.value }))
                    }
                    className="h-8 w-10 rounded border border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-600">
                    {editForm.labelColor}
                  </span>
                </div>
              </label>

              <Input
                label="Güncel Bakiye"
                type="number"
                step="0.01"
                value={editForm.balance}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, balance: e.target.value }))
                }
              />
            </form>
          </ModalShell>
        )}

        {(modalType === "INCOME" ||
          modalType === "EXPENSE" ||
          modalType === "TRANSFER") && (
          <ModalShell
            title={
              modalType === "INCOME"
                ? "Hesaba Para Girişi"
                : modalType === "EXPENSE"
                ? "Hesaptan Para Çıkışı"
                : transferDirection === "FROM_THIS"
                ? "Buradan Başka Hesaba Transfer"
                : "Başka Hesaptan Buraya Transfer"
            }
            onClose={closeModal}
            footer={
              <div className="flex justify-end gap-3">
                <ActionButton onClick={closeModal} tone="white" disabled={saving}>
                  Vazgeç
                </ActionButton>
                <ActionButton
                  onClick={handleTransactionSubmit}
                  icon={CheckCircleIcon}
                  tone="green"
                  disabled={saving}
                >
                  {modalType === "TRANSFER" ? "Transfer Yap" : "Kaydet"}
                </ActionButton>
              </div>
            }
          >
            <form onSubmit={handleTransactionSubmit} className="grid gap-4 md:grid-cols-2">
              <Textarea
                label="Açıklama"
                rows={4}
                className="md:col-span-2"
                value={txForm.description}
                onChange={(e) =>
                  setTxForm((p) => ({ ...p, description: e.target.value }))
                }
              />

              <Input
                label="Tarih"
                type="date"
                value={txForm.date}
                onChange={(e) =>
                  setTxForm((p) => ({ ...p, date: e.target.value }))
                }
              />

              {modalType === "TRANSFER" ? (
                <Select
                  label={
                    transferDirection === "FROM_THIS"
                      ? "Gönderilecek Hesap"
                      : "Çıkış Yapılacak Hesap"
                  }
                  value={txForm.transferAccountId}
                  onChange={(e) =>
                    setTxForm((p) => ({ ...p, transferAccountId: e.target.value }))
                  }
                >
                  <option value="">Hesap seçin</option>
                  {transferTargets.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              ) : (
                <div />
              )}

              <Input
                label="Tutar"
                type="text"
                inputMode="decimal"
                value={txForm.amount}
                onChange={(e) =>
                  setTxForm((p) => ({
                    ...p,
                    amount: formatTrAmountInput(e.target.value),
                  }))
                }
                className={modalType === "TRANSFER" ? "" : "md:col-span-2"}
              />
            </form>
          </ModalShell>
        )}

        {modalType === "POS_BLOCKAGE" && (
          <ModalShell
            title="POS Bloke Çözülmesi"
            onClose={closeModal}
            footer={
              <div className="flex justify-end gap-3">
                <ActionButton onClick={closeModal} tone="white" disabled={saving}>
                  Vazgeç
                </ActionButton>
                <ActionButton
                  onClick={handlePosBlockageSubmit}
                  icon={CheckCircleIcon}
                  tone="rose"
                  disabled={saving}
                >
                  Blokeyi Çöz
                </ActionButton>
              </div>
            }
          >
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <strong>Bloke Çözme</strong> Çözülen miktarı ve komisyon oranını girdiğinizde,
              aradaki fark masraf olarak seçtiğiniz hesaba kaydedilir.
            </div>
            <form onSubmit={handlePosBlockageSubmit} className="grid gap-4 md:grid-cols-2">
              <Input
                label="İşlem Tarihi"
                type="date"
                value={posBlockageForm.date}
                onChange={(e) =>
                  setPosBlockageForm((p) => ({ ...p, date: e.target.value }))
                }
              />
              <Select
                label="Aktarılacak Hesap"
                value={posBlockageForm.transferAccountId}
                onChange={(e) =>
                  setPosBlockageForm((p) => ({ ...p, transferAccountId: e.target.value }))
                }
              >
                <option value="">Banka Hesabı Seçin</option>
                {bankTargets.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Çözülen Tutar"
                type="text"
                inputMode="decimal"
                value={posBlockageForm.blockedAmount}
                onChange={(e) =>
                  setPosBlockageForm((p) => ({
                    ...p,
                    blockedAmount: formatTrAmountInput(e.target.value),
                  }))
                }
              />
              <Input
                label="Komisyon Oranı (%)"
                type="text"
                inputMode="decimal"
                value={posBlockageForm.commissionRate}
                onChange={(e) =>
                  setPosBlockageForm((p) => ({
                    ...p,
                    commissionRate: formatTrAmountInput(e.target.value),
                  }))
                }
              />
              <Input
                label="Hesaba Geçecek Net Tutar"
                type="text"
                readOnly
                value={formatMoney(currency, blockageNetAmount)}
                className="md:col-span-2 font-bold"
              />
              <Select
                label="Komisyon Masraf Hesabı"
                value={posBlockageForm.commissionCostAccount}
                onChange={(e) =>
                  setPosBlockageForm((p) => ({
                    ...p,
                    commissionCostAccount: e.target.value,
                  }))
                }
                className="md:col-span-2"
              >
                <option value=""></option>
                {POS_BLOCKAGE_COST_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </form>
          </ModalShell>
        )}
      </div>
    </div>
  );
}