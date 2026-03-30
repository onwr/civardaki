"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  HomeIcon,
  CheckIcon,
  ArrowUturnLeftIcon,
  CameraIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const TABS = [
  { id: "identity", label: "KİMLİK BİLGİLERİ", Icon: UserIcon },
  { id: "contact", label: "İLETİŞİM", Icon: EnvelopeIcon },
  { id: "cari", label: "CARİ", Icon: BanknotesIcon },
  { id: "other", label: "DİĞER", Icon: Cog6ToothIcon },
  { id: "branches", label: "ŞUBELER", Icon: HomeIcon },
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

export default function CustomerFormModal({ open, customerId, onClose, onSaved }) {
  const [tab, setTab] = useState("identity");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([{ name: "", address: "" }]);
  const [form, setForm] = useState(emptyForm);

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

  const inp =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#17a2b8] focus:ring-1 focus:ring-[#17a2b8] outline-none";
  const label = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col my-4">
        <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-medium text-white bg-[#5cb85c] hover:bg-[#4cae4c] disabled:opacity-50"
          >
            <CheckIcon className="h-4 w-4" />
            Kaydet
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-medium text-white bg-[#5bc0de] hover:bg-[#46b8da]"
          >
            <ArrowUturnLeftIcon className="h-4 w-4" />
            Geri Dön
          </button>
        </div>

        <div className="flex flex-wrap bg-[#17a2b8] px-1 pt-1 gap-0.5">
          {TABS.map(({ id, label: lb, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-md transition-colors ${
                tab === id
                  ? "bg-white text-[#17a2b8]"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              {lb}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1 border border-t-0 border-gray-200 rounded-b-md">
          {loading ? (
            <p className="text-gray-500 text-sm">Yükleniyor…</p>
          ) : (
            <>
              {tab === "identity" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className={label}>İsmi / Unvanı</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          className={`${inp} pl-10`}
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          placeholder=""
                        />
                      </div>
                    </div>
                    <div>
                      <label className={label}>Müşteri sınıfı</label>
                      <select
                        className={inp}
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
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={form.isActive}
                        onChange={(e) => set("isActive", e.target.checked)}
                      />
                      <label htmlFor="isActive" className="text-sm text-gray-700">
                        Aktif müşteri
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className={label}>Resim</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center bg-gray-50">
                      <CameraIcon className="h-10 w-10 text-[#5bc0de] mx-auto mb-2" />
                      <p className="text-xs text-gray-500 mb-2">Resim URL (isteğe bağlı)</p>
                      <input
                        className={inp}
                        value={form.imageUrl}
                        onChange={(e) => set("imageUrl", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {tab === "contact" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className={label}>E-Posta</label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          className={`${inp} pl-10`}
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          placeholder=""
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        virgül ile ayırarak birden fazla adres girebilirsiniz.
                      </p>
                    </div>
                    <div>
                      <label className={label}>Cep Telefonu</label>
                      <input className={inp} value={form.mobilePhone} onChange={(e) => set("mobilePhone", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>İkinci telefon</label>
                      <input className={inp} value={form.phone2} onChange={(e) => set("phone2", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Diğer Erişim Bilgileri</label>
                      <textarea
                        className={inp}
                        rows={3}
                        placeholder="Sabit telefon, faks vb"
                        value={form.otherAccess}
                        onChange={(e) => set("otherAccess", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={label}>Yetkili Kişi</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          className={`${inp} pl-10`}
                          value={form.authorizedPerson}
                          onChange={(e) => set("authorizedPerson", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={label}>Adres</label>
                      <textarea
                        className={inp}
                        rows={5}
                        value={form.address}
                        onChange={(e) => set("address", e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="text-sm text-[#17a2b8] font-medium hover:underline"
                      onClick={() => set("shippingExtra", form.shippingExtra ? "" : "1")}
                    >
                      farklı sevk adresi ekle
                    </button>
                    {form.shippingExtra && (
                      <textarea
                        className={inp}
                        rows={2}
                        placeholder="Sevk adresi"
                        onChange={() => {}}
                        disabled
                      />
                    )}
                  </div>
                </div>
              )}

              {tab === "cari" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className={`${label} inline-flex items-center gap-1`}>
                        Vergi Dairesi
                        <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400" title="" />
                      </label>
                      <input className={inp} value={form.taxOffice} onChange={(e) => set("taxOffice", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Vergi / TC Kimlik No</label>
                      <input className={inp} value={form.taxId} onChange={(e) => set("taxId", e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="taxExempt" checked={form.taxExempt} onChange={(e) => set("taxExempt", e.target.checked)} />
                      <label htmlFor="taxExempt" className="text-sm">
                        Vergiden muaf?
                      </label>
                    </div>
                    <div>
                      <label className={label}>Banka Bilgileri</label>
                      <textarea
                        className={inp}
                        rows={4}
                        placeholder="müşterinizin banka hesap bilgilerini girebilirsiniz"
                        value={form.bankInfo}
                        onChange={(e) => set("bankInfo", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={label}>Açık bakiye (liste)</label>
                      <input className={inp} value={form.openBalance} onChange={(e) => set("openBalance", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Çek/Senet bakiyesi</label>
                      <input className={inp} value={form.checkNoteBalance} onChange={(e) => set("checkNoteBalance", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Entegrasyon kodu (örn. TY-…)</label>
                      <input
                        className={inp}
                        value={form.integrationLabel}
                        onChange={(e) => set("integrationLabel", e.target.value)}
                        placeholder="Boş bırakılabilir"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={label}>Müşteri Para Birimi</label>
                      <select className={inp} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                        <option value="TRY">TL</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                    <div>
                      <label className={label}>Açık Hesap Risk Limiti</label>
                      <input className={inp} value={form.riskLimit} onChange={(e) => set("riskLimit", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Vadesi (gün)</label>
                      <input className={inp} value={form.maturityDays} onChange={(e) => set("maturityDays", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Sabit İskonto (%)</label>
                      <input className={inp} value={form.fixedDiscountPct} onChange={(e) => set("fixedDiscountPct", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Özel Fiyat Listesi</label>
                      <select className={inp} value={form.priceListMode} onChange={(e) => set("priceListMode", e.target.value)}>
                        <option value="none">Özel fiyat uygulanmasın</option>
                        <option value="list_a">Liste A</option>
                        <option value="list_b">Liste B</option>
                      </select>
                    </div>
                    <div>
                      <label className={label}>Açılış Bakiyesi</label>
                      <input className={inp} value={form.openingBalance} onChange={(e) => set("openingBalance", e.target.value)} />
                      <p className="text-xs text-gray-500 mt-1">müşteri sizden alacaklı ise eksi girin</p>
                    </div>
                  </div>
                </div>
              )}

              {tab === "other" && (
                <div>
                  <label className={label}>Notlar / diğer</label>
                  <textarea
                    className={inp}
                    rows={10}
                    value={form.otherNotes}
                    onChange={(e) => set("otherNotes", e.target.value)}
                    placeholder="Serbest not alanı"
                  />
                </div>
              )}

              {tab === "branches" && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Şube kayıtları</p>
                  {branches.map((b, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border border-gray-100 rounded-md bg-gray-50">
                      <input
                        className={inp}
                        placeholder="Şube adı"
                        value={b.name}
                        onChange={(e) => {
                          const next = [...branches];
                          next[i] = { ...next[i], name: e.target.value };
                          setBranches(next);
                        }}
                      />
                      <input
                        className={inp}
                        placeholder="Adres"
                        value={b.address}
                        onChange={(e) => {
                          const next = [...branches];
                          next[i] = { ...next[i], address: e.target.value };
                          setBranches(next);
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="text-sm text-[#17a2b8] font-medium"
                    onClick={() => setBranches([...branches, { name: "", address: "" }])}
                  >
                    + Şube ekle
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
