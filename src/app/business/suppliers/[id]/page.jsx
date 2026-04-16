"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BanknotesIcon,
  ChevronDownIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const money = (n) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

const toInputDate = (d = new Date()) => {
  const dt = new Date(d);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().slice(0, 10);
};

export default function SupplierDetailPage() {
  const params = useParams();
  const supplierId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [docs, setDocs] = useState([]);

  const [docTitle, setDocTitle] = useState("");
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [cashForm, setCashForm] = useState({
    type: "EXPENSE",
    accountId: "",
    amount: "",
    date: toInputDate(),
    description: "",
  });
  const [cashSaving, setCashSaving] = useState(false);

  const [purchaseForm, setPurchaseForm] = useState({
    purchaseKind: "PRODUCT",
    purchaseDate: toInputDate(),
    cashAccountId: "",
    name: "",
    quantity: "1",
    unitPrice: "",
    paymentAmount: "",
    description: "",
  });
  const [purchaseSaving, setPurchaseSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [portfolioChecks, setPortfolioChecks] = useState([]);

  const [paymentForm, setPaymentForm] = useState({
    operation: "SUPPLIER_PAYMENT",
    paymentMethod: "CASH",
    accountId: "",
    date: toInputDate(),
    description: "",
    amount: "",
  });
  const [paymentSaving, setPaymentSaving] = useState(false);

  const [checkForm, setCheckForm] = useState({
    operation: "SUPPLIER_CHECK_GIVEN",
    mode: "NEW",
    date: toInputDate(),
    accountId: "",
    description: "",
    amount: "",
    checkNumber: "",
    issueDate: toInputDate(),
    dueDate: "",
    bankName: "",
    drawerName: "",
    payeeName: "",
    portfolioCheckIds: [],
  });
  const [checkSaving, setCheckSaving] = useState(false);

  const [noteForm, setNoteForm] = useState({
    operation: "SUPPLIER_NOTE_GIVEN",
    date: toInputDate(),
    accountId: "",
    description: "",
    amount: "",
    noteNumber: "",
    issueDate: toInputDate(),
    dueDate: "",
    drawerName: "",
    payeeName: "",
  });
  const [noteSaving, setNoteSaving] = useState(false);

  const [actionForm, setActionForm] = useState({
    actionType: "DEBIT_CREDIT_SLIP",
    operation: "CREDIT",
    accountId: "",
    targetSupplierId: "",
    date: toInputDate(),
    dueDate: toInputDate(),
    projectName: "",
    description: "",
    amount: "",
  });
  const [actionSaving, setActionSaving] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!supplierId) return;
    setLoading(true);
    setError("");
    try {
      const [detailRes, cashRes, docsRes, suppliersRes] = await Promise.all([
        fetch(`/api/business/suppliers/${supplierId}/detail`),
        fetch("/api/business/cash?limit=20"),
        fetch(`/api/business/suppliers/${supplierId}/documents`),
        fetch("/api/business/suppliers"),
      ]);

      const [detailData, cashData, docsData, suppliersData] = await Promise.all([
        detailRes.json(),
        cashRes.json(),
        docsRes.json(),
        suppliersRes.json(),
      ]);

      if (!detailRes.ok) throw new Error(detailData.error || "Detay alınamadı");
      if (!cashRes.ok) throw new Error(cashData.error || "Kasa hesapları alınamadı");
      if (!docsRes.ok) throw new Error(docsData.error || "Dökümanlar alınamadı");
      if (!suppliersRes.ok) throw new Error(suppliersData.error || "Cari listesi alınamadı");

      setDetail(detailData);
      setAccounts(cashData.accounts || []);
      setAllSuppliers((suppliersData.suppliers || []).filter((s) => s.id !== supplierId));
      setDocs(docsData.items || []);

      setCashForm((prev) => ({
        ...prev,
        accountId: prev.accountId || cashData.accounts?.[0]?.id || "",
      }));
      setPaymentForm((prev) => ({
        ...prev,
        accountId: prev.accountId || cashData.accounts?.[0]?.id || "",
      }));
      setCheckForm((prev) => ({
        ...prev,
        accountId: prev.accountId || cashData.accounts?.[0]?.id || "",
      }));
      setNoteForm((prev) => ({
        ...prev,
        accountId: prev.accountId || cashData.accounts?.[0]?.id || "",
      }));
      setActionForm((prev) => ({
        ...prev,
        accountId: prev.accountId || cashData.accounts?.[0]?.id || "",
      }));
      setPurchaseForm((prev) => ({
        ...prev,
        cashAccountId: prev.cashAccountId || cashData.accounts?.[0]?.id || "",
      }));
    } catch (e) {
      setError(e.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const totalLine = useMemo(() => {
    const qty = Number(purchaseForm.quantity) || 0;
    const price = Number(purchaseForm.unitPrice) || 0;
    return qty * price;
  }, [purchaseForm.quantity, purchaseForm.unitPrice]);

  const openModal = async (key) => {
    setMenuOpen(false);
    setActiveModal(key);
    if (key === "check") {
      try {
        const res = await fetch(`/api/business/suppliers/${supplierId}/checks`);
        const data = await res.json();
        if (res.ok) {
          setPortfolioChecks(data.portfolioChecks || []);
        }
      } catch {
        setPortfolioChecks([]);
      }
    }
  };

  const savePayment = async () => {
    if (!paymentForm.accountId || !paymentForm.amount) {
      alert("Hesap ve tutar zorunludur.");
      return;
    }
    setPaymentSaving(true);
    try {
      const res = await fetch(`/api/business/suppliers/${supplierId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: paymentForm.operation,
          paymentMethod: paymentForm.paymentMethod,
          accountId: paymentForm.accountId,
          amount: Number(paymentForm.amount),
          description: paymentForm.description,
          date: paymentForm.date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kaydedilemedi");
      setPaymentForm((p) => ({ ...p, amount: "", description: "" }));
      setActiveModal(null);
      await fetchDetail();
    } catch (e) {
      alert(e.message || "Kaydedilemedi");
    } finally {
      setPaymentSaving(false);
    }
  };

  const saveCheck = async () => {
    setCheckSaving(true);
    try {
      const res = await fetch(`/api/business/suppliers/${supplierId}/checks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Çek kaydı başarısız");
      setActiveModal(null);
      await fetchDetail();
    } catch (e) {
      alert(e.message || "Çek kaydı başarısız");
    } finally {
      setCheckSaving(false);
    }
  };

  const saveNote = async () => {
    setNoteSaving(true);
    try {
      const res = await fetch(`/api/business/suppliers/${supplierId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Senet kaydı başarısız");
      setActiveModal(null);
      await fetchDetail();
    } catch (e) {
      alert(e.message || "Senet kaydı başarısız");
    } finally {
      setNoteSaving(false);
    }
  };

  const saveAction = async () => {
    setActionSaving(true);
    try {
      const res = await fetch(`/api/business/suppliers/${supplierId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...actionForm,
          amount: Number(actionForm.amount || 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İşlem başarısız");
      setActiveModal(null);
      await fetchDetail();
    } catch (e) {
      alert(e.message || "İşlem başarısız");
    } finally {
      setActionSaving(false);
    }
  };

  const saveCashMovement = async () => {
    if (!cashForm.accountId || !cashForm.amount) {
      alert("Kasa hesabı ve tutar zorunludur.");
      return;
    }
    setCashSaving(true);
    try {
      const res = await fetch("/api/business/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: cashForm.type,
          accountId: cashForm.accountId,
          amount: Number(cashForm.amount),
          category: `SUPPLIER:${supplierId}`,
          description: cashForm.description || "Tedarikçi ödeme/tahsilat",
          date: cashForm.date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt başarısız");
      setCashForm((prev) => ({ ...prev, amount: "", description: "" }));
      await fetchDetail();
    } catch (e) {
      alert(e.message || "Kayıt başarısız");
    } finally {
      setCashSaving(false);
    }
  };

  const savePurchase = async () => {
    if (!purchaseForm.name || !purchaseForm.unitPrice || !purchaseForm.quantity) {
      alert("Ürün/Hizmet adı, miktar ve birim fiyat zorunludur.");
      return;
    }

    setPurchaseSaving(true);
    try {
      const payload = {
        documentType: "INVOICE",
        supplierId,
        supplierName: detail?.supplier?.name || null,
        purchaseDate: purchaseForm.purchaseDate,
        totalAmount: totalLine,
        paymentAmount: Number(purchaseForm.paymentAmount || 0),
        cashAccountId: purchaseForm.cashAccountId || null,
        description: purchaseForm.description || `${purchaseForm.purchaseKind === "PRODUCT" ? "Ürün" : "Hizmet"} alımı`,
        items: [
          {
            name: purchaseForm.name,
            quantity: Number(purchaseForm.quantity),
            unitPrice: Number(purchaseForm.unitPrice),
            total: totalLine,
          },
        ],
      };
      const res = await fetch("/api/business/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Alış kaydedilemedi");

      setPurchaseForm((prev) => ({
        ...prev,
        name: "",
        quantity: "1",
        unitPrice: "",
        paymentAmount: "",
        description: "",
      }));
      await fetchDetail();
    } catch (e) {
      alert(e.message || "Alış kaydedilemedi");
    } finally {
      setPurchaseSaving(false);
    }
  };

  const uploadDocument = async () => {
    if (!docFile) {
      alert("Dosya seçiniz.");
      return;
    }
    setUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append("file", docFile);
      fd.append("type", "DOCUMENT");
      const uploadRes = await fetch("/api/business/upload", {
        method: "POST",
        body: fd,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message || "Yükleme başarısız");

      const createRes = await fetch(`/api/business/suppliers/${supplierId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: docTitle || docFile.name || "Belge",
          url: uploadData.url,
          fileId: uploadData?.media?.fileId || null,
          mimeType: docFile.type || null,
          sizeBytes: typeof docFile.size === "number" ? docFile.size : null,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Belge kaydedilemedi");

      setDocTitle("");
      setDocFile(null);
      await fetchDetail();
    } catch (e) {
      alert(e.message || "Belge yüklenemedi");
    } finally {
      setUploadingDoc(false);
    }
  };

  const deleteDocument = async (docId) => {
    if (!confirm("Belge silinsin mi?")) return;
    try {
      const res = await fetch(`/api/business/suppliers/${supplierId}/documents/${docId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Silme başarısız");
      await fetchDetail();
    } catch (e) {
      alert(e.message || "Silme başarısız");
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-slate-600">Yükleniyor...</div>;
  }

  if (error || !detail?.supplier) {
    return <div className="p-4 text-sm text-red-600">{error || "Tedarikçi bulunamadı."}</div>;
  }

  const { supplier, summary, purchases, cashMovements, checks = [], notes = [], timeline = [] } = detail;
  const isGivenCheck = checkForm.operation === "SUPPLIER_CHECK_GIVEN";
  const showPortfolioOption = isGivenCheck;
  const effectiveCheckMode = isGivenCheck ? checkForm.mode : "NEW";
  const tabs = [
    { id: "overview", label: "Özet" },
    { id: "movements", label: "Hareketler" },
    { id: "documents", label: "Dökümanlar" },
    { id: "trade", label: "Alışlar" },
    { id: "instruments", label: "Çek/Senet" },
  ];

  return (
    <div className="space-y-5 text-[13px] text-slate-700">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-4 text-white shadow-lg">
        <div>
          <p className="text-xs text-slate-300">Tedarikçi</p>
          <h1 className="text-2xl font-bold">{supplier.name}</h1>
          <p className="text-xs text-slate-300">
            Kategori: {supplier.categoryName || "Kategorisiz"}
          </p>
        </div>
        <Link href="/business/suppliers" className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold text-white">
          Listeye Dön
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card title="Cari Bakiye" value={`₺${money(summary.currentBalance)}`} />
        <Card title="Toplam Alış" value={`₺${money(summary.totalPurchase)}`} />
        <Card title="Toplam Ödeme" value={`₺${money(summary.totalPayment)}`} />
        <Card title="Belge Sayısı" value={String(summary.documentsCount)} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => openModal("payment")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Ödeme/Tahsilat</button>
            <button type="button" onClick={() => openModal("check")} className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white">Çek</button>
            <button type="button" onClick={() => openModal("note")} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">Senet</button>
          </div>
        </div>
      </section>

      {activeTab === "overview" && (
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
            >
              ₺ Ödeme/Tahsilat
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 w-72 rounded-md border border-slate-200 bg-white p-1 shadow-xl">
                {[
                  ["payment", "Nakit - Kredi Kartı - Banka"],
                  ["check", "Çek"],
                  ["note", "Senet"],
                  ["action_balance", "Bakiye Düzelt"],
                  ["action_slip", "Borç-Alacak Fişleri"],
                  ["action_virman", "Cari Virman"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className="block w-full rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                      if (key === "action_balance") setActionForm((p) => ({ ...p, actionType: "BALANCE_ADJUST", operation: "DEBIT" }));
                      if (key === "action_slip") setActionForm((p) => ({ ...p, actionType: "DEBIT_CREDIT_SLIP", operation: "CREDIT" }));
                      if (key === "action_virman") setActionForm((p) => ({ ...p, actionType: "CURRENT_TRANSFER", operation: "CREDIT" }));
                      openModal(key.startsWith("action_") ? "action" : key);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {activeTab === "documents" && (
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold text-slate-900">Dökümanlar</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            placeholder="Belge başlığı"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
          />
          <input
            type="file"
            className="rounded-md border border-slate-300 px-3 py-2"
            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            onClick={uploadDocument}
            disabled={uploadingDoc}
            className="rounded-md bg-slate-800 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            {uploadingDoc ? "Yükleniyor..." : "Belge Yükle"}
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {docs.length === 0 ? (
            <p className="text-xs text-slate-500">Henüz belge yok.</p>
          ) : (
            docs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                <a href={doc.url} target="_blank" className="truncate text-xs font-medium text-sky-700" rel="noreferrer">
                  {doc.title}
                </a>
                <button type="button" onClick={() => deleteDocument(doc.id)} className="text-xs font-semibold text-rose-600">
                  Sil
                </button>
              </div>
            ))
          )}
        </div>
      </section>
      )}

      {activeTab === "overview" && (
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Ödeme / Tahsilat</h2>
          <div className="space-y-2">
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              value={cashForm.type}
              onChange={(e) => setCashForm((p) => ({ ...p, type: e.target.value }))}
            >
              <option value="EXPENSE">Ödeme (Çıkış)</option>
              <option value="INCOME">Tahsilat (Giriş)</option>
            </select>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              value={cashForm.accountId}
              onChange={(e) => setCashForm((p) => ({ ...p, accountId: e.target.value }))}
            >
              <option value="">Kasa hesabı seçin</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="Tutar"
              type="number"
              min="0"
              value={cashForm.amount}
              onChange={(e) => setCashForm((p) => ({ ...p, amount: e.target.value }))}
            />
            <input
              type="date"
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              value={cashForm.date}
              onChange={(e) => setCashForm((p) => ({ ...p, date: e.target.value }))}
            />
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="Açıklama"
              value={cashForm.description}
              onChange={(e) => setCashForm((p) => ({ ...p, description: e.target.value }))}
            />
            <button
              type="button"
              onClick={saveCashMovement}
              disabled={cashSaving}
              className="w-full rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {cashSaving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Alış Yap (Ürün / Hizmet)</h2>
          <div className="space-y-2">
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              value={purchaseForm.purchaseKind}
              onChange={(e) => setPurchaseForm((p) => ({ ...p, purchaseKind: e.target.value }))}
            >
              <option value="PRODUCT">Ürün Al</option>
              <option value="SERVICE">Hizmet Al</option>
            </select>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder={purchaseForm.purchaseKind === "PRODUCT" ? "Ürün adı" : "Hizmet adı"}
              value={purchaseForm.name}
              onChange={(e) => setPurchaseForm((p) => ({ ...p, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="Miktar"
                type="number"
                min="0"
                value={purchaseForm.quantity}
                onChange={(e) => setPurchaseForm((p) => ({ ...p, quantity: e.target.value }))}
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="Birim Fiyat"
                type="number"
                min="0"
                value={purchaseForm.unitPrice}
                onChange={(e) => setPurchaseForm((p) => ({ ...p, unitPrice: e.target.value }))}
              />
            </div>
            <input
              type="date"
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              value={purchaseForm.purchaseDate}
              onChange={(e) => setPurchaseForm((p) => ({ ...p, purchaseDate: e.target.value }))}
            />
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              value={purchaseForm.cashAccountId}
              onChange={(e) => setPurchaseForm((p) => ({ ...p, cashAccountId: e.target.value }))}
            >
              <option value="">Ödeme hesabı (opsiyonel)</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="Peşin ödeme (opsiyonel)"
              type="number"
              min="0"
              value={purchaseForm.paymentAmount}
              onChange={(e) => setPurchaseForm((p) => ({ ...p, paymentAmount: e.target.value }))}
            />
            <p className="text-xs text-slate-500">Satır Toplamı: ₺{money(totalLine)}</p>
            <button
              type="button"
              onClick={savePurchase}
              disabled={purchaseSaving}
              className="w-full rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {purchaseSaving ? "Kaydediliyor..." : "Alış Kaydet"}
            </button>
          </div>
        </div>
      </section>
      )}

      {activeTab === "overview" && (
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Son Hareket Zaman Akışı</h3>
        <div className="space-y-2">
          {timeline.length === 0 ? (
            <p className="text-xs text-slate-500">Zaman akışı kaydı bulunmuyor.</p>
          ) : (
            timeline.slice(0, 12).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{item.title}</p>
                  <p className="text-slate-500">{item.description || "-"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₺{money(item.amount)}</p>
                  <p className="text-slate-500">{new Date(item.date).toLocaleDateString("tr-TR")}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      )}

      {activeTab === "movements" && (
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Son Ödeme/Tahsilat Hareketleri</h3>
          <div className="space-y-2">
            {cashMovements.length === 0 ? (
              <p className="text-xs text-slate-500">Hareket bulunmuyor.</p>
            ) : (
              cashMovements.map((m) => (
                <div key={m.id} className="rounded-md border border-slate-200 px-3 py-2 text-xs">
                  <p className="font-semibold text-slate-800">
                    {m.type === "INCOME" ? "Tahsilat" : "Ödeme"} - ₺{money(m.amount)}
                  </p>
                  <p className="text-slate-500">{new Date(m.date).toLocaleDateString("tr-TR")} / {m.accountName}</p>
                  {m.description ? <p className="text-slate-500">{m.description}</p> : null}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Son Alışlar</h3>
          <div className="space-y-2">
            {purchases.length === 0 ? (
              <p className="text-xs text-slate-500">Alış kaydı bulunmuyor.</p>
            ) : (
              purchases.map((p) => (
                <div key={p.id} className="rounded-md border border-slate-200 px-3 py-2 text-xs">
                  <p className="font-semibold text-slate-800">
                    ₺{money(p.totalAmount)} / {new Date(p.purchaseDate).toLocaleDateString("tr-TR")}
                  </p>
                  <p className="text-slate-500">
                    Kalem: {p.items?.[0]?.name || "-"} / Ödeme: ₺{money(p.paymentAmount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      )}

      {activeTab === "instruments" && (
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Çek Hareketleri</h3>
          <div className="space-y-2">
            {checks.length === 0 ? (
              <p className="text-xs text-slate-500">Çek hareketi yok.</p>
            ) : (
              checks.map((c) => (
                <div key={c.id} className="rounded-md border border-slate-200 px-3 py-2 text-xs">
                  <p className="font-semibold">{c.direction === "ISSUED" ? "Verilen Çek" : "Alınan Çek"} - ₺{money(c.amount)}</p>
                  <p className="text-slate-500">{c.bankName || "-"} / {c.checkNumber || "No yok"}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Senet Hareketleri</h3>
          <div className="space-y-2">
            {notes.length === 0 ? (
              <p className="text-xs text-slate-500">Senet hareketi yok.</p>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="rounded-md border border-slate-200 px-3 py-2 text-xs">
                  <p className="font-semibold">{n.direction === "ISSUED" ? "Verilen Senet" : "Alınan Senet"} - ₺{money(n.amount)}</p>
                  <p className="text-slate-500">{n.noteNumber || "No yok"}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      )}

      {activeTab === "trade" && (
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Son Alışlar</h3>
        <div className="space-y-2">
          {purchases.length === 0 ? (
            <p className="text-xs text-slate-500">Alış kaydı bulunmuyor.</p>
          ) : (
            purchases.map((p) => (
              <div key={p.id} className="rounded-md border border-slate-200 px-3 py-2 text-xs">
                <p className="font-semibold text-slate-800">
                  ₺{money(p.totalAmount)} / {new Date(p.purchaseDate).toLocaleDateString("tr-TR")}
                </p>
                <p className="text-slate-500">
                  Kalem: {p.items?.[0]?.name || "-"} / Ödeme: ₺{money(p.paymentAmount)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
      )}

      {activeModal === "payment" && (
        <Modal title="Nakit - Kredi Kartı - Banka" onClose={() => setActiveModal(null)}>
          <div className="space-y-2">
            <Label>İşlem</Label>
            <select className={inpCls} value={paymentForm.operation} onChange={(e) => setPaymentForm((p) => ({ ...p, operation: e.target.value }))}>
              <option value="SUPPLIER_PAYMENT">Tedarikçiye Ödeme</option>
              <option value="SUPPLIER_COLLECTION">Tedarikçiden Tahsilat</option>
            </select>
            <Label>Ödeme Yöntemi</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["CASH", "Nakit", BanknotesIcon],
                ["CREDIT_CARD", "Kredi Kartı", CreditCardIcon],
                ["BANK", "Banka", BuildingLibraryIcon],
              ].map(([v, t, Icon]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setPaymentForm((p) => ({ ...p, paymentMethod: v }))}
                  className={`flex items-center justify-center gap-2 rounded border px-2 py-2 text-xs ${paymentForm.paymentMethod === v ? "border-emerald-500 bg-emerald-50" : "border-slate-300"}`}
                >
                  <Icon className="h-4 w-4" /> {t}
                </button>
              ))}
            </div>
            <Label>Tarih</Label>
            <input type="date" className={inpCls} value={paymentForm.date} onChange={(e) => setPaymentForm((p) => ({ ...p, date: e.target.value }))} />
            <Label>Açıklama</Label>
            <textarea className={inpCls} rows={3} value={paymentForm.description} onChange={(e) => setPaymentForm((p) => ({ ...p, description: e.target.value }))} />
            <Label>Kasa/Hesap</Label>
            <select className={inpCls} value={paymentForm.accountId} onChange={(e) => setPaymentForm((p) => ({ ...p, accountId: e.target.value }))}>
              <option value="">Hesap seçin</option>
              {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
            <Label>Tutar</Label>
            <input type="number" min="0" className={inpCls} value={paymentForm.amount} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))} />
            <button type="button" onClick={savePayment} disabled={paymentSaving} className="w-full rounded bg-emerald-600 py-2 text-xs font-semibold text-white">
              {paymentSaving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </Modal>
      )}

      {activeModal === "check" && (
        <Modal title="Çek İşlemleri" onClose={() => setActiveModal(null)}>
          <div className="space-y-2">
            <Label>İşlem</Label>
            <select className={inpCls} value={checkForm.operation} onChange={(e) => setCheckForm((p) => ({ ...p, operation: e.target.value }))}>
              <option value="SUPPLIER_CHECK_GIVEN">Tedarikçiye Verilen Çek Kaydı</option>
              <option value="SUPPLIER_CHECK_RECEIVED">Tedarikçiden Alınan Çek Kaydı</option>
            </select>
            {showPortfolioOption && (
              <>
                <Label>Çek Kaynak Tipi</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setCheckForm((p) => ({ ...p, mode: "NEW" }))} className={`rounded border px-2 py-2 text-xs ${checkForm.mode === "NEW" ? "border-emerald-500 bg-emerald-50" : "border-slate-300"}`}>
                    + Yeni Çek Ekle (kendi çekiniz)
                  </button>
                  <button type="button" onClick={() => setCheckForm((p) => ({ ...p, mode: "PORTFOLIO" }))} className={`rounded border px-2 py-2 text-xs ${checkForm.mode === "PORTFOLIO" ? "border-emerald-500 bg-emerald-50" : "border-slate-300"}`}>
                    + Müşteri Çeki Ekle (portföyden)
                  </button>
                </div>
              </>
            )}
            {!isGivenCheck && (
              <p className="rounded border border-sky-200 bg-sky-50 px-2 py-1 text-xs text-sky-800">Bu işlemde sadece: Yeni Çek Ekle (tedarikçiden alınan çek)</p>
            )}
            {effectiveCheckMode === "PORTFOLIO" ? (
              <>
                <Label>Portföy Çekleri</Label>
                <div className="max-h-40 space-y-1 overflow-auto rounded border border-slate-300 p-2">
                  {portfolioChecks.length === 0 ? (
                    <p className="text-xs text-slate-500">Portföyde çek yok.</p>
                  ) : (
                    portfolioChecks.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={checkForm.portfolioCheckIds.includes(item.id)}
                          onChange={(e) => {
                            setCheckForm((p) => ({
                              ...p,
                              portfolioCheckIds: e.target.checked ? [...p.portfolioCheckIds, item.id] : p.portfolioCheckIds.filter((x) => x !== item.id),
                            }));
                          }}
                        />
                        <span>{item.checkNumber || "No yok"} - ₺{money(item.amount)}</span>
                      </label>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <Label>İşlem Tarihi</Label>
                <input type="date" className={inpCls} value={checkForm.issueDate} onChange={(e) => setCheckForm((p) => ({ ...p, issueDate: e.target.value }))} />
                <Label>Vadesi</Label>
                <input type="date" className={inpCls} value={checkForm.dueDate} onChange={(e) => setCheckForm((p) => ({ ...p, dueDate: e.target.value }))} />
                <Label>Tutar</Label>
                <input type="number" className={inpCls} value={checkForm.amount} onChange={(e) => setCheckForm((p) => ({ ...p, amount: e.target.value }))} />
                <Label>Seri No</Label>
                <input className={inpCls} value={checkForm.checkNumber} onChange={(e) => setCheckForm((p) => ({ ...p, checkNumber: e.target.value }))} />
                <Label>Bankası</Label>
                <input className={inpCls} value={checkForm.bankName} onChange={(e) => setCheckForm((p) => ({ ...p, bankName: e.target.value }))} />
              </>
            )}
            <Label>Kasa/Hesap</Label>
            <select className={inpCls} value={checkForm.accountId} onChange={(e) => setCheckForm((p) => ({ ...p, accountId: e.target.value }))}>
              <option value="">Hesap seçin</option>
              {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
            <button type="button" onClick={saveCheck} disabled={checkSaving} className="w-full rounded bg-emerald-600 py-2 text-xs font-semibold text-white">
              {checkSaving ? "Kaydediliyor..." : "Tamam"}
            </button>
          </div>
        </Modal>
      )}

      {activeModal === "note" && (
        <Modal title="Senet İşlemleri" onClose={() => setActiveModal(null)}>
          <div className="space-y-2">
            <Label>İşlem</Label>
            <select className={inpCls} value={noteForm.operation} onChange={(e) => setNoteForm((p) => ({ ...p, operation: e.target.value }))}>
              <option value="SUPPLIER_NOTE_GIVEN">Tedarikçiye Verilen Senet</option>
              <option value="SUPPLIER_NOTE_RECEIVED">Tedarikçiden Alınan Senet</option>
            </select>
            <Label>İşlem Tarihi</Label>
            <input type="date" className={inpCls} value={noteForm.issueDate} onChange={(e) => setNoteForm((p) => ({ ...p, issueDate: e.target.value }))} />
            <Label>Vade</Label>
            <input type="date" className={inpCls} value={noteForm.dueDate} onChange={(e) => setNoteForm((p) => ({ ...p, dueDate: e.target.value }))} />
            <Label>Tutar</Label>
            <input type="number" className={inpCls} value={noteForm.amount} onChange={(e) => setNoteForm((p) => ({ ...p, amount: e.target.value }))} />
            <Label>Senet No</Label>
            <input className={inpCls} value={noteForm.noteNumber} onChange={(e) => setNoteForm((p) => ({ ...p, noteNumber: e.target.value }))} />
            <Label>Kasa/Hesap</Label>
            <select className={inpCls} value={noteForm.accountId} onChange={(e) => setNoteForm((p) => ({ ...p, accountId: e.target.value }))}>
              <option value="">Hesap seçin</option>
              {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
            <button type="button" onClick={saveNote} disabled={noteSaving} className="w-full rounded bg-emerald-600 py-2 text-xs font-semibold text-white">
              {noteSaving ? "Kaydediliyor..." : "Tamam"}
            </button>
          </div>
        </Modal>
      )}

      {activeModal === "action" && (
        <Modal
          title={actionForm.actionType === "CURRENT_TRANSFER" ? "Cari Virman Fişleri" : "Borç-Alacak Fişleri"}
          onClose={() => setActiveModal(null)}
        >
          <div className="space-y-3">
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] leading-5 text-amber-900">
              {actionForm.actionType === "CURRENT_TRANSFER"
                ? "Bu carideki borcun bir miktarını veya tamamını başka bir cariye aktarabilirsiniz."
                : "Herhangi bir tahsilat, ödeme, alış ya da iade işlemi olmadan tedarikçinizin bakiyesini değiştirmek için borç/alaçak fişi oluşturabilirsiniz."}
            </div>

            <Label>İşlem Tipi</Label>
            {actionForm.actionType === "CURRENT_TRANSFER" ? (
              <select
                className={inpCls}
                value={actionForm.operation}
                onChange={(e) => setActionForm((p) => ({ ...p, operation: e.target.value }))}
              >
                <option value="CREDIT">Bu cari alacaklansın</option>
                <option value="DEBIT">Bu cari borçlansın</option>
              </select>
            ) : (
              <select
                className={inpCls}
                value={actionForm.operation}
                onChange={(e) => setActionForm((p) => ({ ...p, operation: e.target.value }))}
              >
                <option value="CREDIT">Alacak Fişi</option>
                <option value="DEBIT">Borç Fişi</option>
              </select>
            )}

            <Label>İşlem Tarihi</Label>
            <input
              type="date"
              className={inpCls}
              value={actionForm.date}
              onChange={(e) => setActionForm((p) => ({ ...p, date: e.target.value }))}
            />

            <Label>Vade Tarihi</Label>
            <input
              type="date"
              className={inpCls}
              value={actionForm.dueDate}
              onChange={(e) => setActionForm((p) => ({ ...p, dueDate: e.target.value }))}
            />

            {actionForm.actionType === "CURRENT_TRANSFER" ? (
              <>
                <Label>Seçilen Diğer Cari</Label>
                <select
                  className={inpCls}
                  value={actionForm.targetSupplierId}
                  onChange={(e) => setActionForm((p) => ({ ...p, targetSupplierId: e.target.value }))}
                >
                  <option value="">İsim, telefon, vergi/TC no ile ara...</option>
                  {allSuppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <Label>Proje (isteğe bağlı)</Label>
                <input
                  className={inpCls}
                  value={actionForm.projectName}
                  onChange={(e) => setActionForm((p) => ({ ...p, projectName: e.target.value }))}
                  placeholder="Proje adı"
                />
              </>
            )}

            <Label>Tutar</Label>
            <input
              type="number"
              className={inpCls}
              value={actionForm.amount}
              onChange={(e) => setActionForm((p) => ({ ...p, amount: e.target.value }))}
            />

            <Label>Açıklama</Label>
            <textarea
              className={inpCls}
              rows={3}
              value={actionForm.description}
              onChange={(e) => setActionForm((p) => ({ ...p, description: e.target.value }))}
            />

            <Label>Kasa/Hesap</Label>
            <select
              className={inpCls}
              value={actionForm.accountId}
              onChange={(e) => setActionForm((p) => ({ ...p, accountId: e.target.value }))}
            >
              <option value="">Hesap seçin</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded bg-amber-500 px-4 py-2 text-xs font-semibold text-white"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={saveAction}
                disabled={actionSaving}
                className="rounded bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
              >
                {actionSaving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-emerald-400 px-4 py-3 text-white">
          <h4 className="text-lg font-semibold">{title}</h4>
          <button type="button" onClick={onClose} className="text-xl font-bold">x</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <label className="block text-xs font-semibold text-slate-600">{children}</label>;
}

const inpCls = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm";
