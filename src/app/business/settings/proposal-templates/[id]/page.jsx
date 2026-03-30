"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import {
  kindLabelTr,
  defaultLayoutSettings,
  normalizeLayoutSettings,
} from "@/lib/proposal-template-utils";

const KIND_OPTIONS = [
  { value: "QUOTE", label: "Teklif şablonu" },
  { value: "PURCHASE_NOTE", label: "Alış bilgi notu" },
  { value: "SALES_NOTE", label: "Satış bilgi notu" },
  { value: "BA_BS_FORM", label: "BA-BS mutabakat formu" },
  { value: "CUSTOM", label: "Özel / diğer" },
];

const GENERAL_FIELDS = [
  { key: "showValidityDate", label: "Geçerlilik tarihini göster" },
  { key: "showLogo", label: "Logoyu göster" },
  { key: "showCustomerAddress", label: "Müşteri adresini göster" },
  { key: "showLineTotals", label: "Alt toplam bloğunu göster" },
  { key: "showDescription", label: "Açıklama alanını göster" },
  { key: "showCurrentBalance", label: "Güncel bakiyeyi göster" },
];

const COLUMN_FIELDS = [
  { key: "showDiscountRateInRows", label: "Satırlarda iskonto oranını göster" },
  { key: "showUnitPrice", label: "Birim fiyatı göster" },
  { key: "showUnitPriceExVat", label: "KDV hariç birim fiyatı göster" },
  { key: "showLineTotalIncVat", label: "KDV dahil satır tutarını göster" },
  { key: "showDiscountedPrice", label: "İskontolu fiyatı göster" },
  { key: "showVatRate", label: "KDV oranını göster" },
];

function BoolSelect({ value, onChange, id }) {
  return (
    <select
      id={id}
      value={value ? "yes" : "no"}
      onChange={(e) => onChange(e.target.value === "yes")}
      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
    >
      <option value="yes">Evet</option>
      <option value="no">Hayır</option>
    </select>
  );
}

function TemplatePreview({
  documentTitle,
  introText,
  footerText,
  layoutSettings,
}) {
  const s = normalizeLayoutSettings(layoutSettings);
  const sampleRows = [
    { desc: "Örnek ürün A — SKU-001", qty: "10 AD", price: "27,00 TL", total: "270,00 TL" },
    { desc: "Örnek ürün B", qty: "2 AD", price: "45,00 TL", total: "90,00 TL" },
  ];

  return (
    <div
      className="mx-auto overflow-hidden rounded-lg border border-slate-300 bg-white shadow-inner"
      style={{ aspectRatio: "210 / 297", maxHeight: "min(72vh, 640px)" }}
    >
      <div className="h-full overflow-y-auto p-4 text-[10px] leading-snug text-slate-800">
        <div className="flex gap-3 border-b border-slate-200 pb-3">
          {s.showLogo ? (
            <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-[8px] text-slate-400">
              Logo
            </div>
          ) : null}
          <div className="min-w-0 flex-1 text-center">
            <h3 className="text-[11px] font-bold uppercase tracking-wide">{documentTitle || "—"}</h3>
          </div>
          <div className="shrink-0 text-right text-[9px] text-slate-600">
            <div>Tarih: 27.03.2026</div>
            {s.showValidityDate ? <div>Geçerlilik: 26.04.2026</div> : null}
            <div>No: 19823</div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-[9px]">
          <div>
            <p className="font-semibold">Örnek Ticaret Ltd. Şti.</p>
            <p className="text-slate-600">Ataşehir / İSTANBUL</p>
          </div>
          {s.showCustomerAddress ? (
            <div>
              <p className="font-semibold">Müşteri</p>
              <p className="text-slate-600">Örnek adres satırı</p>
            </div>
          ) : (
            <div />
          )}
        </div>

        {introText ? (
          <p className="mt-3 rounded border border-slate-100 bg-slate-50/80 p-2 text-[9px] text-slate-700">{introText}</p>
        ) : (
          <p className="mt-3 text-[9px] italic text-slate-400">Giriş metni (şablonda boş)</p>
        )}

        <table className="mt-3 w-full border-collapse text-[8px]">
          <thead>
            <tr className="border-b border-slate-300 bg-slate-100">
              <th className="p-1 text-left font-semibold">Açıklama</th>
              <th className="p-1 text-right font-semibold">Miktar</th>
              {s.showUnitPrice ? <th className="p-1 text-right font-semibold">Fiyat</th> : null}
              {s.showUnitPriceExVat ? <th className="p-1 text-right font-semibold">KDV hariç</th> : null}
              {s.showDiscountRateInRows ? <th className="p-1 text-right font-semibold">İsk.%</th> : null}
              {s.showDiscountedPrice ? <th className="p-1 text-right font-semibold">İsk.fiyat</th> : null}
              {s.showVatRate ? <th className="p-1 text-right font-semibold">KDV%</th> : null}
              {s.showLineTotalIncVat ? <th className="p-1 text-right font-semibold">Tutar (KDV dahil)</th> : null}
            </tr>
          </thead>
          <tbody>
            {sampleRows.map((r, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="p-1">{r.desc}</td>
                <td className="p-1 text-right">{r.qty}</td>
                {s.showUnitPrice ? <td className="p-1 text-right">{r.price}</td> : null}
                {s.showUnitPriceExVat ? <td className="p-1 text-right">22,50 TL</td> : null}
                {s.showDiscountRateInRows ? <td className="p-1 text-right">0</td> : null}
                {s.showDiscountedPrice ? <td className="p-1 text-right">—</td> : null}
                {s.showVatRate ? <td className="p-1 text-right">20</td> : null}
                {s.showLineTotalIncVat ? <td className="p-1 text-right font-medium">{r.total}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>

        {s.showLineTotals ? (
          <div className="mt-3 ml-auto w-[55%] space-y-0.5 border border-slate-200 p-2 text-[9px]">
            <div className="flex justify-between"><span>Brüt</span><span>360,00 TL</span></div>
            <div className="flex justify-between"><span>İndirim</span><span>0,00 TL</span></div>
            <div className="flex justify-between"><span>Net</span><span>360,00 TL</span></div>
            <div className="flex justify-between"><span>KDV</span><span>72,00 TL</span></div>
            <div className="flex justify-between font-bold"><span>Toplam</span><span>432,00 TL</span></div>
          </div>
        ) : null}

        {s.showCurrentBalance ? (
          <p className="mt-2 text-[9px] text-slate-600">Güncel bakiye: örnek 0,00 TL</p>
        ) : null}

        {s.showDescription ? (
          <div className="mt-3 border border-dashed border-slate-300 p-2 text-[9px]">
            <span className="font-semibold">Açıklama</span>
            <p className="mt-1 text-slate-600">{footerText || "Alt açıklama metni burada görünür."}</p>
            <p className="mt-2 text-slate-500">Saygılarımızla</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ProposalTemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState("QUOTE");
  const [language, setLanguage] = useState("tr");
  const [documentTitle, setDocumentTitle] = useState("");
  const [pageSize, setPageSize] = useState("A4");
  const [introText, setIntroText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [layoutSettings, setLayoutSettings] = useState(defaultLayoutSettings);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/business/proposal-templates/${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Şablon yüklenemedi.");
      const t = data.item;
      if (!t) throw new Error("Şablon bulunamadı.");
      setName(t.name || "");
      setKind(t.kind || "QUOTE");
      setLanguage(t.language || "tr");
      setDocumentTitle(t.documentTitle || "");
      setPageSize(t.pageSize || "A4");
      setIntroText(t.introText || "");
      setFooterText(t.footerText || "");
      setLayoutSettings(normalizeLayoutSettings(t.layoutSettings));
    } catch (e) {
      toast.error(e.message || "Yüklenemedi.");
      router.push("/business/settings/proposal-templates");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const setLayout = useCallback((key, val) => {
    setLayoutSettings((prev) => ({ ...prev, [key]: val }));
  }, []);

  const save = async () => {
    if (!id) return;
    const n = name.trim();
    if (!n) return toast.error("Şablon adı zorunludur.");
    setSaving(true);
    try {
      const res = await fetch(`/api/business/proposal-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: n,
          kind,
          language,
          documentTitle: documentTitle.trim() || "TEKLİF FORMU",
          pageSize: pageSize || "A4",
          introText: introText.trim() || null,
          footerText: footerText.trim() || null,
          layoutSettings,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Kaydedilemedi.");
      toast.success("Kaydedildi.");
      if (data.item?.layoutSettings) setLayoutSettings(normalizeLayoutSettings(data.item.layoutSettings));
    } catch (e) {
      toast.error(e.message || "Hata.");
    } finally {
      setSaving(false);
    }
  };

  const previewProps = useMemo(
    () => ({
      documentTitle,
      introText,
      footerText,
      layoutSettings,
    }),
    [documentTitle, introText, footerText, layoutSettings],
  );

  if (loading || !id) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 pb-20 font-sans">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
        >
          <CheckIcon className="h-4 w-4" />
          Kaydet
        </button>
        <Link
          href="/business/settings/proposal-templates"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-orange-600"
        >
          <ArrowUturnLeftIcon className="h-4 w-4" />
          Geri Dön
        </Link>
        <span className="text-xs text-slate-500">
          Tür: <strong className="text-slate-800">{kindLabelTr(kind)}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Önizleme</p>
          <TemplatePreview {...previewProps} />
        </div>

        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Şablon ayarları</h2>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Şablon adı</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Şablon tipi</label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                {KIND_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Dil</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Sayfa boyu</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Başlık (belge üstü)</label>
              <input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="TEKLİF FORMU"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Giriş metni</label>
              <textarea
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Teklif metninin giriş paragrafı..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Alt açıklama / kapanış</label>
              <textarea
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Belge altı açıklama ve imza öncesi metin..."
              />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Genel ayarlar</h3>
            <div className="space-y-2">
              {GENERAL_FIELDS.map((f) => (
                <div key={f.key} className="grid grid-cols-[1fr_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_140px]">
                  <label htmlFor={f.key} className="text-sm text-slate-700">
                    {f.label}
                  </label>
                  <BoolSelect
                    id={f.key}
                    value={!!layoutSettings[f.key]}
                    onChange={(v) => setLayout(f.key, v)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Kolon ayarları</h3>
            <div className="space-y-2">
              {COLUMN_FIELDS.map((f) => (
                <div key={f.key} className="grid grid-cols-[1fr_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_140px]">
                  <label htmlFor={`c-${f.key}`} className="text-sm text-slate-700">
                    {f.label}
                  </label>
                  <BoolSelect
                    id={`c-${f.key}`}
                    value={!!layoutSettings[f.key]}
                    onChange={(v) => setLayout(f.key, v)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
