"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  HomeIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  QuestionMarkCircleIcon,
  ArrowUpTrayIcon,
  PhotoIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  PlusIcon,
  TrashIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

const TABS = [
  { id: "identity", label: "Kimlik", Icon: UserIcon },
  { id: "contact", label: "İletişim", Icon: EnvelopeIcon },
  { id: "cari", label: "Cari", Icon: BanknotesIcon },
  { id: "other", label: "Diğer", Icon: Cog6ToothIcon },
  { id: "branches", label: "Şubeler", Icon: HomeIcon },
];

const emptyForm = () => ({
  name: "",
  customerClass: "GENEL",
  imageUrl: "",
  email: "",
  mobilePhone: "",
  phone2: "",
  otherAccess: "",
  authorizedPerson: "",
  address: "",
  shippingExtra: "",
  taxOffice: "",
  taxId: "",
  taxExempt: false,
  bankInfo: "",
  currency: "TRY",
  riskLimit: "",
  maturityDays: "",
  fixedDiscountPct: "",
  priceListMode: "none",
  openingBalance: "",
  openBalance: "",
  checkNoteBalance: "",
  integrationLabel: "",
  otherNotes: "",
  isActive: true,
});

const inp =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200/80";
const label = "mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600";

function FieldIcon({ Icon, className = "text-slate-400" }) {
  return <Icon className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${className}`} aria-hidden />;
}

export default function CustomerFormModal({ open, customerId, onClose, onSaved }) {
  const [tab, setTab] = useState("identity");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [branches, setBranches] = useState([{ name: "", address: "" }]);
  const [form, setForm] = useState(emptyForm);
  const fileInputRef = useRef(null);

  const load = useCallback(async () => {
    if (!customerId) {
      setForm(emptyForm());
      setBranches([{ name: "", address: "" }]);
      setTab("identity");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/business/customers/${customerId}`);
      const data = await res.json();
      if (!data.customer) throw new Error("Yüklenemedi");
      const c = data.customer;
      setForm({
        name: c.name || "",
        customerClass: c.customerClass || "GENEL",
        imageUrl: c.imageUrl || "",
        email: c.email || "",
        mobilePhone: c.mobilePhone || "",
        phone2: c.phone2 || "",
        otherAccess: c.otherAccess || "",
        authorizedPerson: c.authorizedPerson || "",
        address: c.address || "",
        shippingExtra: "",
        taxOffice: c.taxOffice || "",
        taxId: c.taxId || "",
        taxExempt: !!c.taxExempt,
        bankInfo: c.bankInfo || "",
        currency: c.currency || "TRY",
        riskLimit: c.riskLimit != null ? String(c.riskLimit) : "",
        maturityDays: c.maturityDays != null ? String(c.maturityDays) : "",
        fixedDiscountPct: c.fixedDiscountPct != null ? String(c.fixedDiscountPct) : "",
        priceListMode: c.priceListMode || "none",
        openingBalance: String(c.openingBalance ?? 0),
        openBalance: String(c.openBalance ?? 0),
        checkNoteBalance: String(c.checkNoteBalance ?? 0),
        integrationLabel: c.integrationLabel || "",
        otherNotes: c.otherNotes || "",
        isActive: c.isActive !== false,
      });
      const br = Array.isArray(c.branchesJson) ? c.branchesJson : [];
      if (br.length) {
        setBranches(br.map((b) => ({ name: b.name || "", address: b.address || "" })));
      } else {
        setBranches([{ name: "", address: "" }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const uploadCustomerImage = async (file) => {
    if (!file) return;
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "GALLERY");
      const res = await fetch("/api/business/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Yükleme başarısız");
      const url = data.url || data?.media?.url;
      if (url) set("imageUrl", url);
      else throw new Error("Sunucu URL döndürmedi.");
    } catch (e) {
      alert(e.message || "Görsel yüklenemedi");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("İsim / unvan zorunludur.");
      setTab("identity");
      return;
    }
    setSaving(true);
    try {
      const branchesJson = branches
        .filter((b) => b.name.trim() || b.address.trim())
        .map((b) => ({ name: b.name.trim(), address: b.address.trim() }));

      const payload = {
        ...form,
        riskLimit: form.riskLimit,
        maturityDays: form.maturityDays,
        fixedDiscountPct: form.fixedDiscountPct,
        priceListMode: form.priceListMode === "none" ? null : form.priceListMode,
        branchesJson: branchesJson.length ? branchesJson : null,
      };

      const url = customerId ? `/api/business/customers/${customerId}` : "/api/business/customers";
      const res = await fetch(url, {
        method: customerId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt başarısız");
      onSaved?.();
      onClose();
    } catch (e) {
      alert(e.message || "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div
        className="flex max-h-[100dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-slate-200/80 bg-white shadow-2xl sm:max-h-[95vh] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-modal-title"
      >
        <header className="relative shrink-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 py-4 text-white sm:px-6 sm:py-5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.12),transparent_50%)]" aria-hidden />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">Müşteri kartı</p>
              <h2 id="customer-modal-title" className="mt-1 text-lg font-bold tracking-tight sm:text-xl">
                {customerId ? "Bilgileri güncelle" : "Yeni müşteri"}
              </h2>
              <p className="mt-1 max-w-xl text-xs text-slate-300 sm:text-sm">
                Kimlik, iletişim ve cari alanlarını sekmelerden düzenleyin. Profil görseli için dosya yükleyebilirsiniz.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Kapat"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50/90 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckIcon className="h-4 w-4" />
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Vazgeç
          </button>
        </div>

        <nav className="shrink-0 border-b border-slate-200 bg-white px-2 pt-2 sm:px-4">
          <div className="-mx-1 flex gap-1 overflow-x-auto pb-0.5">
            {TABS.map(({ id, label: lb, Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex shrink-0 items-center gap-2 rounded-t-lg px-3 py-2.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                    active
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4 opacity-90" />
                  {lb}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" aria-hidden />
              <p className="text-sm font-medium">Kayıt yükleniyor…</p>
            </div>
          ) : (
            <>
              {tab === "identity" && (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_minmax(260px,320px)]">
                  <div className="space-y-5">
                    <div>
                      <label className={label}>İsim / unvan</label>
                      <div className="relative">
                        <FieldIcon Icon={UserIcon} />
                        <input
                          className={`${inp} pl-11`}
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          placeholder="Örn. Ahmet Yılmaz veya Şirket A.Ş."
                        />
                      </div>
                    </div>
                    <div>
                      <label className={label}>Müşteri sınıfı</label>
                      <div className="relative">
                        <FieldIcon Icon={BuildingOffice2Icon} />
                        <select
                          className={`${inp} cursor-pointer pl-11`}
                          value={form.customerClass}
                          onChange={(e) => set("customerClass", e.target.value)}
                        >
                          <option value="GENEL">GENEL</option>
                          <option value="KURUMSAL">KURUMSAL</option>
                          <option value="BAYI">BAYİ</option>
                          <option value="TOPTAN">TOPTAN</option>
                          <option value="PERAKENDE">PERAKENDE</option>
                        </select>
                      </div>
                    </div>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition hover:bg-slate-100">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        checked={form.isActive}
                        onChange={(e) => set("isActive", e.target.checked)}
                      />
                      <span className="text-sm font-medium text-slate-800">Aktif müşteri</span>
                    </label>
                  </div>

                  <div className="rounded-2xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-white p-5 shadow-inner">
                    <div className="mb-3 flex items-center gap-2 text-slate-800">
                      <PhotoIcon className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-bold">Profil görseli</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        uploadCustomerImage(f);
                      }}
                    />
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        {form.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={form.imageUrl}
                            alt=""
                            className="h-32 w-32 rounded-2xl object-cover shadow-lg ring-4 ring-white"
                          />
                        ) : (
                          <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-slate-200/90 text-slate-400 shadow-inner">
                            <CameraIcon className="h-14 w-14" />
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          disabled={imageUploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-slate-800 disabled:opacity-60"
                        >
                          <ArrowUpTrayIcon className="h-4 w-4" />
                          {imageUploading ? "Yükleniyor…" : "Dosyadan yükle"}
                        </button>
                        {form.imageUrl ? (
                          <button
                            type="button"
                            onClick={() => set("imageUrl", "")}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Kaldır
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">
                        JPEG, PNG veya WebP · en fazla 5 MB
                      </p>
                      <details className="mt-4 w-full rounded-xl border border-slate-200 bg-white/80 p-3">
                        <summary className="flex cursor-pointer list-none items-center justify-center gap-2 text-xs font-semibold text-slate-600 [&::-webkit-details-marker]:hidden">
                          <LinkIcon className="h-3.5 w-3.5" />
                          Bağlantı ile ekle (URL)
                        </summary>
                        <input
                          className={`${inp} mt-3`}
                          value={form.imageUrl}
                          onChange={(e) => set("imageUrl", e.target.value)}
                          placeholder="https://..."
                        />
                      </details>
                    </div>
                  </div>
                </div>
              )}

              {tab === "contact" && (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-5">
                    <div>
                      <label className={label}>E-posta</label>
                      <div className="relative">
                        <FieldIcon Icon={EnvelopeIcon} />
                        <input
                          className={`${inp} pl-11`}
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          placeholder="ornek@firma.com"
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-500">Birden fazla adres için virgül kullanabilirsiniz.</p>
                    </div>
                    <div>
                      <label className={label}>Cep telefonu</label>
                      <div className="relative">
                        <FieldIcon Icon={PhoneIcon} />
                        <input
                          className={`${inp} pl-11`}
                          value={form.mobilePhone}
                          onChange={(e) => set("mobilePhone", e.target.value)}
                          placeholder="05xx…"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={label}>İkinci telefon</label>
                      <div className="relative">
                        <FieldIcon Icon={PhoneIcon} />
                        <input
                          className={`${inp} pl-11`}
                          value={form.phone2}
                          onChange={(e) => set("phone2", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={label}>Diğer erişim</label>
                      <textarea
                        className={inp}
                        rows={3}
                        placeholder="Sabit hat, faks vb."
                        value={form.otherAccess}
                        onChange={(e) => set("otherAccess", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className={label}>Yetkili kişi</label>
                      <div className="relative">
                        <FieldIcon Icon={UserIcon} />
                        <input
                          className={`${inp} pl-11`}
                          value={form.authorizedPerson}
                          onChange={(e) => set("authorizedPerson", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={label}>Adres</label>
                      <div className="relative">
                        <MapPinIcon className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <textarea
                          className={`${inp} min-h-[120px] resize-y pl-11 pt-2.5`}
                          rows={5}
                          value={form.address}
                          onChange={(e) => set("address", e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-emerald-700 underline-offset-2 hover:underline"
                      onClick={() => set("shippingExtra", form.shippingExtra ? "" : "1")}
                    >
                      + Farklı sevk adresi (yakında)
                    </button>
                    {form.shippingExtra ? (
                      <textarea className={`${inp} opacity-60`} rows={2} placeholder="Sevk adresi" disabled />
                    ) : null}
                  </div>
                </div>
              )}

              {tab === "cari" && (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-5">
                    <div>
                      <label className={`${label}`}>
                        Vergi dairesi
                        <QuestionMarkCircleIcon
                          className="h-4 w-4 text-slate-400"
                          title="Resmi unvana bağlı vergi dairesi adı"
                        />
                      </label>
                      <input className={inp} value={form.taxOffice} onChange={(e) => set("taxOffice", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Vergi / TC kimlik no</label>
                      <input className={inp} value={form.taxId} onChange={(e) => set("taxId", e.target.value)} />
                    </div>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                        checked={form.taxExempt}
                        onChange={(e) => set("taxExempt", e.target.checked)}
                      />
                      <span className="text-sm font-medium text-slate-800">Vergiden muaf</span>
                    </label>
                    <div>
                      <label className={label}>Banka bilgileri</label>
                      <textarea
                        className={inp}
                        rows={4}
                        placeholder="IBAN, hesap adı vb."
                        value={form.bankInfo}
                        onChange={(e) => set("bankInfo", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={label}>Açık bakiye (liste)</label>
                      <input className={inp} value={form.openBalance} onChange={(e) => set("openBalance", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Çek / senet bakiyesi</label>
                      <input className={inp} value={form.checkNoteBalance} onChange={(e) => set("checkNoteBalance", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Entegrasyon kodu</label>
                      <input
                        className={inp}
                        value={form.integrationLabel}
                        onChange={(e) => set("integrationLabel", e.target.value)}
                        placeholder="Örn. TY-…"
                      />
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className={label}>Para birimi</label>
                      <select className={`${inp} cursor-pointer`} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                        <option value="TRY">TRY (₺)</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                    <div>
                      <label className={label}>Risk limiti</label>
                      <input className={inp} value={form.riskLimit} onChange={(e) => set("riskLimit", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Vade (gün)</label>
                      <input className={inp} value={form.maturityDays} onChange={(e) => set("maturityDays", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Sabit iskonto (%)</label>
                      <input className={inp} value={form.fixedDiscountPct} onChange={(e) => set("fixedDiscountPct", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Özel fiyat listesi</label>
                      <select className={`${inp} cursor-pointer`} value={form.priceListMode} onChange={(e) => set("priceListMode", e.target.value)}>
                        <option value="none">Uygulanmasın</option>
                        <option value="list_a">Liste A</option>
                        <option value="list_b">Liste B</option>
                      </select>
                    </div>
                    <div>
                      <label className={label}>Açılış bakiyesi</label>
                      <input className={inp} value={form.openingBalance} onChange={(e) => set("openingBalance", e.target.value)} />
                      <p className="mt-1.5 text-[11px] text-slate-500">Müşteri sizden alacaklıysa eksi değer kullanın.</p>
                    </div>
                  </div>
                </div>
              )}

              {tab === "other" && (
                <div>
                  <label className={label}>Notlar</label>
                  <textarea
                    className={`${inp} min-h-[200px]`}
                    rows={10}
                    value={form.otherNotes}
                    onChange={(e) => set("otherNotes", e.target.value)}
                    placeholder="Serbest not alanı…"
                  />
                </div>
              )}

              {tab === "branches" && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">Şube kayıtları — farklı lokasyonlar için kullanın.</p>
                  {branches.map((b, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2"
                    >
                      <div className="relative">
                        <FieldIcon Icon={BuildingOffice2Icon} />
                        <input
                          className={`${inp} pl-11`}
                          placeholder="Şube adı"
                          value={b.name}
                          onChange={(e) => {
                            const next = [...branches];
                            next[i] = { ...next[i], name: e.target.value };
                            setBranches(next);
                          }}
                        />
                      </div>
                      <div className="relative">
                        <FieldIcon Icon={MapPinIcon} />
                        <input
                          className={`${inp} pl-11`}
                          placeholder="Adres"
                          value={b.address}
                          onChange={(e) => {
                            const next = [...branches];
                            next[i] = { ...next[i], address: e.target.value };
                            setBranches(next);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-800"
                    onClick={() => setBranches([...branches, { name: "", address: "" }])}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Şube ekle
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
