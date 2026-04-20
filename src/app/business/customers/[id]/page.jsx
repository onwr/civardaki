"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import CustomerFormModal from "@/components/business/CustomerFormModal";
import {
  BanknotesIcon,
  ChevronDownIcon,
  CreditCardIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  EnvelopeOpenIcon,
  PencilSquareIcon,
  QueueListIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

const money = (n) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const customerId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [docs, setDocs] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState("");
  const [modalType, setModalType] = useState("");
  const [customerEditOpen, setCustomerEditOpen] = useState(false);

  const [docTitle, setDocTitle] = useState("");
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toolbarRef = useRef(null);

  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "CASH",
    accountId: "",
    amount: "",
    date: "",
    description: "",
  });
  const [checkForm, setCheckForm] = useState({
    accountId: "",
    amount: "",
    checkNumber: "",
    bankName: "",
    drawerName: "",
    payeeName: "",
    issueDate: "",
    dueDate: "",
    description: "",
  });
  const [noteForm, setNoteForm] = useState({
    operation: "CUSTOMER_NOTE_RECEIVED",
    accountId: "",
    amount: "",
    noteNumber: "",
    drawerName: "",
    payeeName: "",
    issueDate: "",
    dueDate: "",
    description: "",
  });
  const [balanceForm, setBalanceForm] = useState({
    operation: "DEBIT",
    accountId: "",
    amount: "",
    date: "",
    description: "",
  });

  const defaultAccountId = useMemo(() => accounts?.[0]?.id || "", [accounts]);

  const resetModalForms = useCallback(() => {
    setPaymentForm((prev) => ({ ...prev, accountId: defaultAccountId, amount: "", description: "", date: "" }));
    setCheckForm((prev) => ({
      ...prev,
      accountId: defaultAccountId,
      amount: "",
      checkNumber: "",
      bankName: "",
      drawerName: "",
      payeeName: "",
      issueDate: "",
      dueDate: "",
      description: "",
    }));
    setNoteForm((prev) => ({
      ...prev,
      accountId: defaultAccountId,
      amount: "",
      noteNumber: "",
      drawerName: "",
      payeeName: "",
      issueDate: "",
      dueDate: "",
      description: "",
    }));
    setBalanceForm((prev) => ({ ...prev, accountId: defaultAccountId, amount: "", date: "", description: "" }));
  }, [defaultAccountId]);

  const fetchDetail = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError("");
    try {
      const [detailRes, docsRes] = await Promise.all([
        fetch(`/api/business/customers/${customerId}/detail`),
        fetch(`/api/business/customers/${customerId}/documents`),
      ]);
      const [detailData, docsData] = await Promise.all([detailRes.json(), docsRes.json()]);

      if (!detailRes.ok) throw new Error(detailData.error || "Detay alınamadı");
      if (!docsRes.ok) throw new Error(docsData.error || "Dökümanlar alınamadı");

      setDetail(detailData);
      setDocs(docsData.items || []);
    } catch (e) {
      setError(e.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/business/cash/accounts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Hesaplar alınamadı");
      setAccounts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchDetail(), fetchAccounts()]);
  }, [fetchDetail, fetchAccounts]);

  useEffect(() => {
    resetModalForms();
  }, [resetModalForms]);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setActiveDropdown("");
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

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

      const createRes = await fetch(`/api/business/customers/${customerId}/documents`, {
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
      const res = await fetch(`/api/business/customers/${customerId}/documents/${docId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Silme başarısız");
      await fetchDetail();
    } catch (e) {
      alert(e.message || "Silme başarısız");
    }
  };

  const closeModal = () => {
    setModalType("");
    resetModalForms();
  };

  const openModal = (type) => {
    setModalType(type);
    setActiveDropdown("");
  };

  const postAction = async (path, payload, successMessage) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/business/customers/${customerId}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İşlem başarısız");
      alert(successMessage);
      closeModal();
      await fetchDetail();
    } catch (e) {
      alert(e.message || "İşlem başarısız");
    } finally {
      setSubmitting(false);
    }
  };

  const submitPayment = async () => {
    await postAction(
      "payments",
      {
        paymentMethod: paymentForm.paymentMethod,
        accountId: paymentForm.accountId,
        amount: Number(paymentForm.amount),
        date: paymentForm.date || undefined,
        description: paymentForm.description,
      },
      "Tahsilat kaydedildi."
    );
  };

  const submitCheck = async () => {
    await postAction(
      "checks",
      {
        operation: "CUSTOMER_CHECK_RECEIVED",
        accountId: checkForm.accountId || undefined,
        amount: Number(checkForm.amount),
        checkNumber: checkForm.checkNumber || undefined,
        bankName: checkForm.bankName || undefined,
        drawerName: checkForm.drawerName || undefined,
        payeeName: checkForm.payeeName || undefined,
        issueDate: checkForm.issueDate || undefined,
        dueDate: checkForm.dueDate || undefined,
        description: checkForm.description,
      },
      "Çek kaydı oluşturuldu."
    );
  };

  const submitNote = async () => {
    await postAction(
      "notes",
      {
        operation: noteForm.operation,
        accountId: noteForm.accountId || undefined,
        amount: Number(noteForm.amount),
        noteNumber: noteForm.noteNumber || undefined,
        drawerName: noteForm.drawerName || undefined,
        payeeName: noteForm.payeeName || undefined,
        issueDate: noteForm.issueDate || undefined,
        dueDate: noteForm.dueDate || undefined,
        description: noteForm.description,
      },
      "Senet kaydı oluşturuldu."
    );
  };

  const submitBalanceAdjust = async () => {
    await postAction(
      "actions",
      {
        actionType: "BALANCE_ADJUST",
        operation: balanceForm.operation,
        accountId: balanceForm.accountId,
        amount: Number(balanceForm.amount),
        date: balanceForm.date || undefined,
        description: balanceForm.description,
      },
      "Bakiye düzeltme kaydedildi."
    );
  };

  const onMenuSelect = (key) => {
    if (key === "payment") return openModal("payment");
    if (key === "check") return openModal("check");
    if (key === "note_receive") {
      setNoteForm((prev) => ({ ...prev, operation: "CUSTOMER_NOTE_RECEIVED" }));
      return openModal("note");
    }
    if (key === "note_give") {
      setNoteForm((prev) => ({ ...prev, operation: "CUSTOMER_NOTE_GIVEN" }));
      return openModal("note");
    }
    if (key === "balance") return openModal("balance");

    if (key === "statement") {
      router.push(`/business/customers/${customerId}/hesap-ekstresi?mode=simple`);
      return;
    }
    if (key === "statement_detailed") {
      router.push(`/business/customers/${customerId}/hesap-ekstresi?mode=detailed`);
      return;
    }
    if (key === "reconciliation_letter") {
      router.push(`/business/customers/${customerId}/hesap-ekstresi?mode=reconciliation`);
      return;
    }

  };

  if (loading) return <div className="p-4 text-sm text-slate-600">Yükleniyor...</div>;
  if (error || !detail?.customer) {
    return <div className="p-4 text-sm text-red-600">{error || "Müşteri bulunamadı."}</div>;
  }

  const { customer, summary, sales, cashMovements = [], checks = [], notes = [] } = detail;

  return (
    <div className="space-y-5 text-[13px] text-slate-700">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-4 text-white shadow-lg">
        <div>
          <p className="text-xs text-slate-300">Müşteri</p>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-xs text-slate-300">Sınıf: {customer.customerClass || "GENEL"}</p>
        </div>
        <Link href="/business/customers" className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold text-white">
          Listeye Dön
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card title="Açık Bakiye" value={`₺${money(customer.openBalance)}`} />
        <Card title="Çek/Senet Bakiye" value={`₺${money(customer.checkNoteBalance)}`} />
        <Card title="Toplam Satış" value={`₺${money(summary.totalSales)}`} />
        <Card title="Belge Sayısı" value={String(summary.documentsCount)} />
      </div>

      <section
        ref={toolbarRef}
        className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white p-3 shadow-sm print:hidden"
      >
        <div className="flex flex-wrap items-stretch gap-2">
          <Link
            href={`/business/satislar/musteriye?customerId=${encodeURIComponent(customerId)}&customerName=${encodeURIComponent(customer.name || "")}&saleKind=TO_REGISTERED_CUSTOMER`}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-600"
          >
            <ShoppingCartIcon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            Satış Yap
          </Link>
          <Link
            href={`/business/quotes/yeni?customerId=${encodeURIComponent(customerId)}`}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-400"
          >
            <DocumentTextIcon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            Teklif Hazırla
          </Link>

          <div className="relative">
            <button
              type="button"
              aria-expanded={activeDropdown === "collection"}
              aria-haspopup="menu"
              onClick={() => setActiveDropdown((prev) => (prev === "collection" ? "" : "collection"))}
              className="inline-flex min-h-[40px] w-full items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              <span className="text-sm font-bold leading-none" aria-hidden>
                ₺
              </span>
              Tahsilat/Ödeme
              <ChevronDownIcon className="ml-0.5 h-4 w-4 shrink-0 opacity-90" aria-hidden />
            </button>
            {activeDropdown === "collection" && (
              <IconMenu
                onSelect={(key) => {
                  onMenuSelect(key);
                  setActiveDropdown("");
                }}
                groups={[
                  {
                    items: [
                      { key: "payment", label: "Nakit - Kredi Kartı - Banka", Icon: BanknotesIcon, iconClass: "text-emerald-600" },
                      { key: "check", label: "Çek", Icon: CreditCardIcon, iconClass: "text-sky-600" },
                      { key: "note_receive", label: "Müşteriden Senet Al", Icon: DocumentArrowDownIcon, iconClass: "text-rose-600" },
                      { key: "note_give", label: "Müşteriye Senet Ver", Icon: DocumentArrowUpIcon, iconClass: "text-amber-700" },
                    ],
                  },
                  {
                    items: [
                      { key: "balance", label: "Bakiye düzelt", Icon: PencilSquareIcon, iconClass: "text-sky-600" },
                    ],
                  },
                ]}
              />
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              aria-expanded={activeDropdown === "statement"}
              aria-haspopup="menu"
              onClick={() => setActiveDropdown((prev) => (prev === "statement" ? "" : "statement"))}
              className="inline-flex min-h-[40px] w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              <QueueListIcon className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
              Hesap Ekstresi
              <ChevronDownIcon className="ml-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            </button>
            {activeDropdown === "statement" && (
              <IconMenu
                onSelect={(key) => {
                  onMenuSelect(key);
                  setActiveDropdown("");
                }}
                groups={[
                  {
                    items: [
                      { key: "statement", label: "Ekstre", Icon: DocumentTextIcon, iconClass: "text-slate-600" },
                      { key: "statement_detailed", label: "Detaylı Ekstre", Icon: DocumentDuplicateIcon, iconClass: "text-slate-600" },
                      { key: "reconciliation_letter", label: "Mutabakat Mektubu", Icon: EnvelopeOpenIcon, iconClass: "text-rose-600" },
                    ],
                  },
                ]}
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => setCustomerEditOpen(true)}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-500"
          >
            <PencilSquareIcon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            Müşteri Bilgilerini Güncelle
          </button>
        </div>
      </section>

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
            id="customer-doc-file"
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
                <a href={doc.url} target="_blank" rel="noreferrer" className="truncate text-xs font-medium text-sky-700">
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

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold text-slate-900">Son Tahsilat Hareketleri</h2>
        <div className="space-y-2">
          {cashMovements.length === 0 ? (
            <p className="text-xs text-slate-500">Tahsilat hareketi bulunmuyor.</p>
          ) : (
            cashMovements.slice(0, 8).map((m) => (
              <div key={m.id} className="rounded-md border border-slate-200 px-3 py-2 text-xs">
                <p className="font-semibold text-slate-800">
                  ₺{money(m.amount)} / {new Date(m.date).toLocaleDateString("tr-TR")}
                </p>
                <p className="text-slate-500">
                  {m.description || "-"} / {m.accountName || "Hesap yok"}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Çek Hareketleri</h2>
          <div className="space-y-2">
            {checks.length === 0 ? (
              <p className="text-xs text-slate-500">Çek kaydı bulunmuyor.</p>
            ) : (
              checks.slice(0, 6).map((c) => (
                <div key={c.id} className="rounded-md border border-slate-200 px-3 py-2 text-xs">
                  <p className="font-semibold text-slate-800">₺{money(c.amount)} / {c.checkNumber || "-"}</p>
                  <p className="text-slate-500">{c.bankName || "Banka yok"} / {c.status}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Senet Hareketleri</h2>
          <div className="space-y-2">
            {notes.length === 0 ? (
              <p className="text-xs text-slate-500">Senet kaydı bulunmuyor.</p>
            ) : (
              notes.slice(0, 6).map((n) => (
                <div key={n.id} className="rounded-md border border-slate-200 px-3 py-2 text-xs">
                  <p className="font-semibold text-slate-800">₺{money(n.amount)} / {n.noteNumber || "-"}</p>
                  <p className="text-slate-500">{n.direction} / {n.status}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold text-slate-900">Son Satışlar</h2>
        <div className="space-y-2">
          {sales.length === 0 ? (
            <p className="text-xs text-slate-500">Satış kaydı bulunmuyor.</p>
          ) : (
            sales.map((sale) => (
              <div
                key={sale.id}
                onClick={() => router.push(`/business/satislar/${sale.id}`)}
                className="cursor-pointer rounded-md border border-slate-200 px-3 py-2 text-xs transition hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">
                    ₺{money(sale.totalAmount)} / {new Date(sale.saleDate).toLocaleDateString("tr-TR")}
                  </p>
                  <p className="font-semibold text-sky-600">Düzenle &rarr;</p>
                </div>
                <p className="text-slate-500 mt-1">
                  Tahsilat: ₺{money(sale.collectionAmount)} / {sale.cashAccountName || "Hesap yok"}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            {modalType === "payment" && (
              <>
                <h3 className="mb-3 text-sm font-bold text-slate-900">Nakit - Kredi Kartı - Banka Tahsilatı</h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <Select label="Ödeme Yöntemi" value={paymentForm.paymentMethod} onChange={(v) => setPaymentForm((p) => ({ ...p, paymentMethod: v }))}>
                    <option value="CASH">Nakit</option>
                    <option value="CREDIT_CARD">Kredi Kartı</option>
                    <option value="BANK">Banka</option>
                  </Select>
                  <AccountSelect accounts={accounts} value={paymentForm.accountId} onChange={(v) => setPaymentForm((p) => ({ ...p, accountId: v }))} />
                  <Input label="Tutar" type="number" value={paymentForm.amount} onChange={(v) => setPaymentForm((p) => ({ ...p, amount: v }))} />
                  <Input label="Tarih" type="date" value={paymentForm.date} onChange={(v) => setPaymentForm((p) => ({ ...p, date: v }))} />
                </div>
                <Input label="Açıklama" value={paymentForm.description} onChange={(v) => setPaymentForm((p) => ({ ...p, description: v }))} />
                <ModalButtons onClose={closeModal} onSubmit={submitPayment} submitting={submitting} />
              </>
            )}

            {modalType === "check" && (
              <>
                <h3 className="mb-3 text-sm font-bold text-slate-900">Müşteriden Alınan Çek Kaydı</h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <AccountSelect accounts={accounts} value={checkForm.accountId} onChange={(v) => setCheckForm((p) => ({ ...p, accountId: v }))} />
                  <Input label="Tutar" type="number" value={checkForm.amount} onChange={(v) => setCheckForm((p) => ({ ...p, amount: v }))} />
                  <Input label="Çek No" value={checkForm.checkNumber} onChange={(v) => setCheckForm((p) => ({ ...p, checkNumber: v }))} />
                  <Input label="Banka" value={checkForm.bankName} onChange={(v) => setCheckForm((p) => ({ ...p, bankName: v }))} />
                  <Input label="Keşideci" value={checkForm.drawerName} onChange={(v) => setCheckForm((p) => ({ ...p, drawerName: v }))} />
                  <Input label="Lehtar" value={checkForm.payeeName} onChange={(v) => setCheckForm((p) => ({ ...p, payeeName: v }))} />
                  <Input label="Düzenleme Tarihi" type="date" value={checkForm.issueDate} onChange={(v) => setCheckForm((p) => ({ ...p, issueDate: v }))} />
                  <Input label="Vade Tarihi" type="date" value={checkForm.dueDate} onChange={(v) => setCheckForm((p) => ({ ...p, dueDate: v }))} />
                </div>
                <Input label="Açıklama" value={checkForm.description} onChange={(v) => setCheckForm((p) => ({ ...p, description: v }))} />
                <ModalButtons onClose={closeModal} onSubmit={submitCheck} submitting={submitting} />
              </>
            )}

            {modalType === "note" && (
              <>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  {noteForm.operation === "CUSTOMER_NOTE_GIVEN" ? "Müşteriye Senet Ver" : "Müşteriden Senet Al"}
                </h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <AccountSelect accounts={accounts} value={noteForm.accountId} onChange={(v) => setNoteForm((p) => ({ ...p, accountId: v }))} />
                  <Input label="Tutar" type="number" value={noteForm.amount} onChange={(v) => setNoteForm((p) => ({ ...p, amount: v }))} />
                  <Input label="Senet No" value={noteForm.noteNumber} onChange={(v) => setNoteForm((p) => ({ ...p, noteNumber: v }))} />
                  <Input label="Düzenleyen" value={noteForm.drawerName} onChange={(v) => setNoteForm((p) => ({ ...p, drawerName: v }))} />
                  <Input label="Lehtar" value={noteForm.payeeName} onChange={(v) => setNoteForm((p) => ({ ...p, payeeName: v }))} />
                  <Input label="Düzenleme Tarihi" type="date" value={noteForm.issueDate} onChange={(v) => setNoteForm((p) => ({ ...p, issueDate: v }))} />
                  <Input label="Vade Tarihi" type="date" value={noteForm.dueDate} onChange={(v) => setNoteForm((p) => ({ ...p, dueDate: v }))} />
                </div>
                <Input label="Açıklama" value={noteForm.description} onChange={(v) => setNoteForm((p) => ({ ...p, description: v }))} />
                <ModalButtons onClose={closeModal} onSubmit={submitNote} submitting={submitting} />
              </>
            )}

            {modalType === "balance" && (
              <>
                <h3 className="mb-3 text-sm font-bold text-slate-900">Bakiye Düzelt</h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <Select label="Yön" value={balanceForm.operation} onChange={(v) => setBalanceForm((p) => ({ ...p, operation: v }))}>
                    <option value="DEBIT">Borçlandır (Çıkış)</option>
                    <option value="CREDIT">Alacaklandır (Giriş)</option>
                  </Select>
                  <AccountSelect accounts={accounts} value={balanceForm.accountId} onChange={(v) => setBalanceForm((p) => ({ ...p, accountId: v }))} />
                  <Input label="Tutar" type="number" value={balanceForm.amount} onChange={(v) => setBalanceForm((p) => ({ ...p, amount: v }))} />
                  <Input label="Tarih" type="date" value={balanceForm.date} onChange={(v) => setBalanceForm((p) => ({ ...p, date: v }))} />
                </div>
                <Input label="Açıklama" value={balanceForm.description} onChange={(v) => setBalanceForm((p) => ({ ...p, description: v }))} />
                <ModalButtons onClose={closeModal} onSubmit={submitBalanceAdjust} submitting={submitting} />
              </>
            )}
          </div>
        </div>
      )}

      <CustomerFormModal
        open={customerEditOpen}
        customerId={customerId}
        onClose={() => setCustomerEditOpen(false)}
        onSaved={fetchDetail}
      />
    </div>
  );
}

function IconMenu({ groups, onSelect }) {
  return (
    <div
      role="menu"
      className="absolute left-0 top-full z-30 mt-1.5 min-w-[17rem] max-w-[20rem] rounded-lg border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-black/5"
    >
      {groups.map((group, gi) => (
        <div key={gi}>
          {gi > 0 && <div className="my-1 border-t border-slate-100" role="separator" />}
          {group.items.map(({ key, label, Icon, iconClass, rowClass, badge }) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-slate-800 transition hover:bg-slate-100 ${rowClass || ""}`}
              onClick={() => onSelect(key)}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50 ${iconClass || "text-slate-600"}`}>
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 leading-snug">{label}</span>
              {badge ? (
                <span className="shrink-0 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ))}
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

function Label({ children }) {
  return <label className="text-xs font-semibold text-slate-600">{children}</label>;
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div className="mt-2">
      <Label>{label}</Label>
      <input
        type={type}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <div className="mt-2">
      <Label>{label}</Label>
      <select
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  );
}

function AccountSelect({ accounts, value, onChange }) {
  return (
    <Select label="Kasa/Hesap" value={value} onChange={onChange}>
      <option value="">Hesap seçin</option>
      {accounts.map((acc) => (
        <option key={acc.id} value={acc.id}>
          {acc.name}
        </option>
      ))}
    </Select>
  );
}

function ModalButtons({ onClose, onSubmit, submitting }) {
  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold">
        Vazgeç
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </div>
  );
}

