"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  CheckIcon,
  ArrowUturnLeftIcon,
  CameraIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const TABS = [
  { id: "identity", label: "KİMLİK BİLGİLERİ", Icon: UserIcon },
  { id: "cari", label: "CARİ", Icon: BanknotesIcon },
  { id: "contact", label: "İLETİŞİM", Icon: EnvelopeIcon },
  { id: "other", label: "DİĞER", Icon: Cog6ToothIcon },
];

const TEAL = "#5bbd9e";

const emptyForm = () => ({
  name: "",
  imageUrl: "",
  isActive: true,
  taxOffice: "",
  taxId: "",
  taxExempt: false,
  bankInfo: "",
  currency: "TRY",
  maturityDays: "",
  openingBalance: "",
  authorizedPerson: "",
  email: "",
  address: "",
  phone: "",
  otherAccess: "",
  otherNotes: "",
});

export default function SupplierFormModal({ open, supplierId, onClose, onSaved }) {
  const [tab, setTab] = useState("identity");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    if (!supplierId) {
      setForm(emptyForm());
      setTab("identity");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/business/suppliers/${supplierId}`);
      const data = await res.json();
      if (!data.supplier) throw new Error("Yüklenemedi");
      const s = data.supplier;
      setForm({
        name: s.name || "",
        imageUrl: s.imageUrl || "",
        isActive: s.isActive !== false,
        taxOffice: s.taxOffice || "",
        taxId: s.taxId || "",
        taxExempt: !!s.taxExempt,
        bankInfo: s.bankInfo || "",
        currency: s.currency || "TRY",
        maturityDays: s.maturityDays != null ? String(s.maturityDays) : "",
        openingBalance: String(s.openingBalance ?? 0),
        authorizedPerson: s.authorizedPerson || "",
        email: s.email || "",
        address: s.address || "",
        phone: s.phone || "",
        otherAccess: s.otherAccess || "",
        otherNotes: s.otherNotes || "",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

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
      const payload = {
        ...form,
        maturityDays: form.maturityDays === "" ? null : form.maturityDays,
        openingBalance: form.openingBalance,
      };
      const url = supplierId ? `/api/business/suppliers/${supplierId}` : "/api/business/suppliers";
      const res = await fetch(url, {
        method: supplierId ? "PATCH" : "POST",
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

        <div className="flex flex-wrap px-1 pt-1 gap-0.5" style={{ backgroundColor: TEAL }}>
          {TABS.map(({ id, label: lb, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-md transition-colors ${
                tab === id ? "bg-white text-[#5bbd9e]" : "text-white hover:bg-white/10"
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
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={form.isActive}
                        onChange={(e) => set("isActive", e.target.checked)}
                      />
                      <label htmlFor="isActive" className="text-sm text-gray-700">
                        Aktif tedarikçi
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className={label}>Resim</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center bg-gray-50">
                      <CameraIcon className="h-10 w-10 mx-auto mb-2" style={{ color: TEAL }} />
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

              {tab === "cari" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className={`${label} inline-flex items-center gap-1`}>
                        Vergi Dairesi
                        <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400" />
                      </label>
                      <input className={inp} value={form.taxOffice} onChange={(e) => set("taxOffice", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Vergi / TC Kimlik No</label>
                      <input className={inp} value={form.taxId} onChange={(e) => set("taxId", e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="taxExempt"
                        checked={form.taxExempt}
                        onChange={(e) => set("taxExempt", e.target.checked)}
                      />
                      <label htmlFor="taxExempt" className="text-sm">
                        Vergiden muaf?
                      </label>
                    </div>
                    <div>
                      <label className={label}>Banka Bilgileri</label>
                      <textarea
                        className={inp}
                        rows={4}
                        placeholder="tedarikçinizin banka hesap bilgilerini girebilirsiniz"
                        value={form.bankInfo}
                        onChange={(e) => set("bankInfo", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={`${label} inline-flex items-center gap-1`}>
                        Tedarikçi Para Birimi
                        <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400" />
                      </label>
                      <select className={inp} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                        <option value="TRY">TL</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                    <div>
                      <label className={`${label} inline-flex items-center gap-1`}>
                        Vade (gün)
                        <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400" />
                      </label>
                      <input className={inp} value={form.maturityDays} onChange={(e) => set("maturityDays", e.target.value)} />
                    </div>
                    <div>
                      <label className={`${label} inline-flex items-center gap-1`}>
                        Açılış Bakiyesi
                        <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400" />
                      </label>
                      <input className={inp} value={form.openingBalance} onChange={(e) => set("openingBalance", e.target.value)} />
                      <p className="text-xs text-gray-500 mt-1">tedarikçi size borçlu ise eksi girin</p>
                    </div>
                  </div>
                </div>
              )}

              {tab === "contact" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <label className={label}>E-Posta</label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          className={`${inp} pl-10`}
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">virgül ile ayırarak birden fazla adres girebilirsiniz.</p>
                    </div>
                    <div>
                      <label className={label}>Adres</label>
                      <textarea className={inp} rows={5} value={form.address} onChange={(e) => set("address", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={label}>Telefon</label>
                      <input className={inp} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Diğer Erişim Bilgileri</label>
                      <textarea
                        className={inp}
                        rows={4}
                        placeholder="Sabit telefon, faks vb"
                        value={form.otherAccess}
                        onChange={(e) => set("otherAccess", e.target.value)}
                      />
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
