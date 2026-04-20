"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  Undo2,
  Tag,
  Banknote,
  List,
  Image as ImageIcon,
  GitBranch,
  Link2,
  Loader2,
  X,
  HelpCircle,
  Camera,
  Plus,
  Package,
  Boxes,
  Barcode,
} from "lucide-react";
import { toast } from "sonner";
import { formatTrMoney, parseTrMoney } from "@/lib/tr-money";
import {
  SALES_UNIT_OPTIONS,
  SALES_UNIT_LABELS,
  normalizeSalesUnit,
} from "@/lib/product-sales-units";
import { PRODUCT_COUNTRY_OPTIONS } from "@/lib/product-country-codes";
import { generateEan13Barcode } from "@/lib/generate-barcode";

const TEAL = "bg-[#0f172b]";
const TEAL_TEXT = "text-[#0f766a]";
const TAB_INACTIVE = `${TEAL} text-white/95 hover:text-white`;

export function emptyProductForm() {
  return {
    id: null,
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    categoryId: "",
    imageUrl: "",
    isActive: true,
    publishedOnMarketplace: false,
    stock: "",
    maxOrderQty: "",
    productType: "STOCKED",
    salesUnit: "ADET",
    priceCurrency: "TL",
    purchasePrice: "",
    salesVatRate: "8",
    purchaseVatRate: "8",
    salesVatIncluded: "EXCLUDED",
    purchaseVatIncluded: "EXCLUDED",
    oivRate: "NONE",
    otvType: "NONE",
    purchaseDiscount: "0",
    purchaseOtvRate: "",
    brand: "",
    productCode: "",
    gtip: "",
    gtin: "",
    countryCode: "",
    serialInvoiceMode: "",
    invoiceTitle: "",
    barcode: "",
    shelfLocation: "",
    stockTracking: "NORMAL",
    criticalStock: "",
    tagsString: "",
    showDescriptionOnInvoice: false,
    linkedSearch: "",
  };
}

export function productToForm(p) {
  return {
    ...emptyProductForm(),
    ...p,
    id: p?.id ?? null,
    name: p?.name ?? "",
    description: p?.description ?? "",
    price:
      numForDisplay(p?.price) != null
        ? formatTrMoney(Number(p.price))
        : "",
    discountPrice:
      numForDisplay(p?.discountPrice) != null
        ? formatTrMoney(Number(p.discountPrice))
        : "",
    categoryId: p?.categoryId ?? "",
    imageUrl: p?.imageUrl ?? "",
    isActive: p?.isActive ?? true,
    stock: p?.stock ?? "",
    maxOrderQty: p?.maxOrderQty ?? "",
    productType: normalizeProductType(p?.productType),
    salesUnit: normalizeSalesUnit(p?.salesUnit),
    priceCurrency: p?.priceCurrency === "USD" || p?.priceCurrency === "EUR" ? p.priceCurrency : "TL",
    purchasePrice:
      numForDisplay(p?.purchasePrice) != null
        ? formatTrMoney(Number(p.purchasePrice))
        : "",
    salesVatRate: String(p?.salesVatRate ?? "8"),
    purchaseVatRate: String(p?.purchaseVatRate ?? "8"),
    salesVatIncluded: p?.salesVatIncluded ?? "EXCLUDED",
    purchaseVatIncluded: p?.purchaseVatIncluded ?? "EXCLUDED",
    oivRate: p?.oivRate ?? "NONE",
    otvType: p?.otvType ?? "NONE",
    purchaseDiscount:
      numForDisplay(p?.purchaseDiscount) != null
        ? formatTrMoney(Number(p.purchaseDiscount), {
          minFractionDigits: 0,
          maxFractionDigits: 2,
        })
        : "0",
    purchaseOtvRate:
      p?.purchaseOtvRate === "" || p?.purchaseOtvRate == null
        ? ""
        : formatTrMoney(Number(p.purchaseOtvRate), {
          minFractionDigits: 0,
          maxFractionDigits: 2,
        }),
    brand: p?.brand ?? p?.brandName ?? "",
    productCode: p?.productCode ?? "",
    gtip: p?.gtip ?? "",
    gtin: p?.gtin ?? "",
    countryCode: p?.countryCode ?? "",
    serialInvoiceMode: normalizeSerialInvoiceMode(
      p?.stockTracking,
      p?.serialInvoiceMode,
    ),
    invoiceTitle: p?.invoiceTitle ?? "",
    barcode: p?.barcode != null ? String(p.barcode) : "",
    shelfLocation: p?.shelfLocation ?? "",
    stockTracking: normalizeStockTracking(p?.stockTracking),
    criticalStock: p?.criticalStock ?? "",
    tagsString: p?.tagsString ?? "",
    showDescriptionOnInvoice: !!p?.showDescriptionOnInvoice,
    linkedSearch: p?.linkedSearch ?? "",
  };
}

const TABS = [
  { id: "definition", label: "ÜRÜN / HİZMET TANIMI", Icon: Tag },
  { id: "pricing", label: "FİYATLANDIRMA", Icon: Banknote },
  { id: "other", label: "DİĞER BİLGİLER", Icon: List },
  { id: "images", label: "RESİMLER", Icon: ImageIcon },
  { id: "variant", label: "VARYANT", Icon: GitBranch },
  { id: "linked", label: "BAĞLI ÜRÜNLER", Icon: Link2 },
];

const PRODUCT_TYPE_LABELS = {
  STOCKED: "Stoklu ürün",
  SERVICE: "Stoksuz ürün (hizmet/danışmanlık)",
  DIGITAL: "Dijital",
};

/** Sadece STOCKED | SERVICE; eski DIGITAL kayıtları özet için etiketlenir. */
function normalizeProductType(value) {
  if (value === "SERVICE" || value === "STOCKED") return value;
  if (value === "DIGITAL") return "SERVICE";
  return "STOCKED";
}

function labelProductType(value) {
  return PRODUCT_TYPE_LABELS[value] || value || "—";
}

function labelSalesUnit(value) {
  return SALES_UNIT_LABELS[value] || value || "—";
}

function normalizeStockTracking(v) {
  if (v === "NORMAL" || v === "NONE" || v === "BATCH" || v === "SERIAL") {
    return v;
  }
  return "NORMAL";
}

function normalizeSerialInvoiceMode(stockTracking, mode) {
  if (normalizeStockTracking(stockTracking) !== "SERIAL") return "";
  if (mode === "HIDE" || mode === "SHOW" || mode === "OPTIONAL") return mode;
  return "OPTIONAL";
}

const addRowBtnClass =
  "mb-2 inline-flex w-auto max-w-full shrink-0 items-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-600 px-2.5 py-1.5 pl-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-emerald-700";

const inp =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30";
/** Flex satırındaki para alanı: w-full kullanma — TL ile yan yana genişlik çakışmasını önler */
const inpMoney =
  "min-w-0 flex-1 basis-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30";
const label =
  "mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-600";

function numForDisplay(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function MoneyField({
  id,
  labelText,
  value,
  onChange,
  placeholder = "0,00",
  suffix = "TL",
  suffixClassName = "",
  disabled = false,
}) {
  const handleChange = (e) => {
    let v = e.target.value.replace(/[^\d.,]/g, "");
    const ci = v.indexOf(",");
    if (ci !== -1) {
      v = v.slice(0, ci + 1) + v.slice(ci + 1).replace(/,/g, "");
    }
    onChange(v);
  };
  const handleBlur = () => {
    const n = parseTrMoney(value);
    onChange(n === null ? "" : formatTrMoney(n));
  };
  return (
    <div className="min-w-0">
      <label className={label} htmlFor={id}>
        {labelText}
      </label>
      <div className="flex min-w-0 items-stretch gap-2">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${inpMoney} min-h-[44px] text-right tabular-nums disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
          placeholder={placeholder}
          disabled={disabled}
        />
        <span
          className={`flex min-h-[44px] w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-2 text-center text-sm font-semibold tabular-nums text-slate-600 ${suffixClassName}`}
          aria-hidden
        >
          {suffix}
        </span>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, right }) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="h-4 w-4 shrink-0 text-white/80" /> : null}
          <h3 className="text-sm font-bold leading-tight">{title}</h3>
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function ProductFormWizard({
  prodForm,
  setProdForm,
  categories,
  onSubmit,
  onClose,
  uploadingImage,
  onImageUpload,
  onRequestCategoryModal,
  brandOptions = [],
  shelfOptions = [],
  onRequestBrandModal,
  onRequestShelfModal,
}) {
  const [activeTab, setActiveTab] = useState("definition");

  useEffect(() => {
    setActiveTab("definition");
  }, [prodForm.id]);

  const generateBarcode = () => {
    const code = generateEan13Barcode();
    setProdForm((p) => ({ ...p, barcode: code }));
    toast.success("EAN-13 barkod üretildi.");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Kapat"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-wizard-title"
        className="relative z-10 flex max-h-[min(96vh,980px)] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <form
          id="product-wizard-form"
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
            <Package className="hidden h-8 w-8 shrink-0 text-teal-600 sm:block" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Ürün / Hizmet
              </p>
              <h2
                id="product-wizard-title"
                className="truncate text-base font-bold text-slate-900 sm:text-lg"
              >
                {prodForm.id ? "Ürün / Hizmet Düzenle" : "Yeni Ürün / Hizmet"}
              </h2>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:text-sm"
            >
              <Check className="h-4 w-4 shrink-0" />
              Kaydet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-900 transition hover:bg-sky-200 sm:text-sm"
            >
              <Undo2 className="h-4 w-4 shrink-0" />
              Geri Dön
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className={`shrink-0 overflow-x-auto ${TEAL} px-2 shadow-inner md:px-4`}>
            <div className="flex min-w-max gap-1 py-2">
              {TABS.map(({ id, label, Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex min-h-[44px] items-center gap-2 rounded-t-lg px-3 py-3 text-[11px] font-bold uppercase tracking-wide transition md:px-4 md:text-xs ${active
                      ? "bg-white text-teal-800 shadow-sm"
                      : `${TAB_INACTIVE} opacity-95`
                      }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? TEAL_TEXT : ""}`} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/90">
            <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-5 md:p-6">
              {activeTab === "definition" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <SectionCard title="Temel Ürün Bilgileri" icon={Tag}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className={label}>
                          Ürün Adı <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={prodForm.name}
                            onChange={(e) =>
                              setProdForm((p) => ({ ...p, name: e.target.value }))
                            }
                            className={`${inp} pl-10`}
                            placeholder="Ürün veya hizmet adı"
                            required
                            minLength={2}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={label}>Satış Birimi</label>
                        <select
                          value={normalizeSalesUnit(prodForm.salesUnit)}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              salesUnit: e.target.value,
                            }))
                          }
                          className={inp}
                        >
                          {SALES_UNIT_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={label}>Ürün Tipi</label>
                        <select
                          value={normalizeProductType(prodForm.productType)}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              productType: e.target.value,
                            }))
                          }
                          className={inp}
                        >
                          <option value="STOCKED">Stoklu ürün</option>
                          <option value="SERVICE">
                            Stoksuz ürün (hizmet/danışmanlık)
                          </option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className={label}>Açıklama</label>
                        <textarea
                          value={prodForm.description}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                          rows={5}
                          className={inp}
                          placeholder="Kısa ürün veya hizmet açıklaması..."
                        />
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Yayın ve Görünürlük" icon={Boxes}>
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <span className="block text-sm font-bold text-slate-900">
                          Yayın Durumu
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          Aktif ürünler vitrinde ve satış ekranlarında görünür.
                        </span>

                        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={prodForm.isActive}
                            onChange={(e) =>
                              setProdForm((p) => ({
                                ...p,
                                isActive: e.target.checked,
                              }))
                            }
                            className="rounded border-slate-300"
                          />
                          Aktif olarak yayınla
                        </label>

                        <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={!!prodForm.publishedOnMarketplace}
                            onChange={(e) =>
                              setProdForm((p) => ({
                                ...p,
                                publishedOnMarketplace: e.target.checked,
                              }))
                            }
                            className="rounded border-slate-300"
                          />
                          Civardaki'de yayınla
                        </label>
                        <p className="mt-2 text-xs text-slate-500">
                          Bu seçenek açık olduğunda ürün işletme vitrininizde görünür.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <span className="block text-sm font-bold text-slate-900">
                          Özet
                        </span>
                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                          <p>
                            <span className="font-semibold text-slate-800">Ad:</span>{" "}
                            {prodForm.name || "—"}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-800">Tip:</span>{" "}
                            {labelProductType(
                              normalizeProductType(prodForm.productType),
                            )}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-800">Birim:</span>{" "}
                            {labelSalesUnit(
                              normalizeSalesUnit(prodForm.salesUnit),
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              )}

              {activeTab === "pricing" && (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-8">
                  <SectionCard title="Satış Fiyatlandırması" icon={Banknote}>
                    <div className="space-y-3.5">
                      <MoneyField
                        id="prod-price"
                        labelText="Satış Fiyatı"
                        value={prodForm.price}
                        onChange={(v) =>
                          setProdForm((p) => ({ ...p, price: v }))
                        }
                        placeholder="0,00"
                        suffix="TL"
                      />

                      <MoneyField
                        id="prod-discount-price"
                        labelText="İndirimli Satış Fiyatı"
                        value={prodForm.discountPrice}
                        onChange={(v) =>
                          setProdForm((p) => ({ ...p, discountPrice: v }))
                        }
                        placeholder="İsteğe bağlı"
                        suffix="TL"
                      />

                      <div>
                        <label className={label}>Satış KDV Oranı (%)</label>
                        <select
                          value={prodForm.salesVatRate}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              salesVatRate: e.target.value,
                            }))
                          }
                          className={inp}
                        >
                          {["0", "1", "8", "10", "18", "20"].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={label}>Satış Fiyatına KDV Dahil mi?</label>
                        <select
                          value={prodForm.salesVatIncluded}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              salesVatIncluded: e.target.value,
                            }))
                          }
                          className={inp}
                        >
                          <option value="EXCLUDED">KDV hariç</option>
                          <option value="INCLUDED">KDV dahil</option>
                        </select>
                      </div>

                      <div>
                        <label className={label}>Ö.İ.V. Oranı (%)</label>
                        <select
                          value={prodForm.oivRate}
                          onChange={(e) =>
                            setProdForm((p) => ({ ...p, oivRate: e.target.value }))
                          }
                          className={inp}
                        >
                          <option value="NONE">Ö.İ.V. yok</option>
                          <option value="5">5</option>
                          <option value="10">10</option>
                        </select>
                      </div>

                      <div>
                        <label className={label}>Ö.T.V Tipi</label>
                        <select
                          value={prodForm.otvType}
                          onChange={(e) =>
                            setProdForm((p) => ({ ...p, otvType: e.target.value }))
                          }
                          className={inp}
                        >
                          <option value="NONE">Ö.T.V Yok</option>
                          <option value="ALT">Alt oran</option>
                          <option value="UST">Üst oran</option>
                        </select>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Alış Fiyatlandırması" icon={Banknote}>
                    <div className="space-y-3.5">
                      <MoneyField
                        id="prod-purchase-price"
                        labelText="Alış Fiyatı"
                        value={prodForm.purchasePrice}
                        onChange={(v) =>
                          setProdForm((p) => ({ ...p, purchasePrice: v }))
                        }
                        placeholder="0,00"
                        suffix="TL"
                      />

                      <div>
                        <label className={label}>Alış KDV Oranı (%)</label>
                        <select
                          value={prodForm.purchaseVatRate}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              purchaseVatRate: e.target.value,
                            }))
                          }
                          className={inp}
                        >
                          {["0", "1", "8", "10", "18", "20"].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={label}>Alış Fiyatına KDV Dahil mi?</label>
                        <select
                          value={prodForm.purchaseVatIncluded}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              purchaseVatIncluded: e.target.value,
                            }))
                          }
                          className={inp}
                        >
                          <option value="EXCLUDED">KDV hariç</option>
                          <option value="INCLUDED">KDV dahil</option>
                        </select>
                      </div>

                      <MoneyField
                        id="prod-purchase-discount"
                        labelText="Alış İskontosu (%)"
                        value={prodForm.purchaseDiscount}
                        onChange={(v) =>
                          setProdForm((p) => ({ ...p, purchaseDiscount: v }))
                        }
                        placeholder="0"
                        suffix="%"
                      />

                      <MoneyField
                        id="prod-purchase-otv"
                        labelText="Alış ÖTV Oranı (%)"
                        value={prodForm.purchaseOtvRate}
                        onChange={(v) =>
                          setProdForm((p) => ({ ...p, purchaseOtvRate: v }))
                        }
                        placeholder="0"
                        suffix="%"
                      />
                    </div>
                  </SectionCard>
                </div>
              )}

              {activeTab === "other" && (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <SectionCard title="Kimlik ve Kategori Bilgileri" icon={Tag}>
                    <div className="space-y-5">
                      <div>
                        <div className="mb-2 flex items-center gap-1">
                          <span className={label}>Kategori</span>
                          <HelpCircle
                            className="h-3.5 w-3.5 text-slate-400"
                            title="Ürününüzün vitrin ve raporlardaki kategorisi."
                            aria-hidden
                          />
                        </div>
                        <button
                          type="button"
                          onClick={onRequestCategoryModal}
                          className={addRowBtnClass}
                        >
                          <Plus className="h-4 w-4 shrink-0" />
                          Yeni kategori ekle
                        </button>
                        <select
                          value={prodForm.categoryId}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              categoryId: e.target.value,
                            }))
                          }
                          className={inp}
                        >
                          <option value="">Seçiniz</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center gap-1">
                          <span className={label}>Marka</span>
                          <HelpCircle
                            className="h-3.5 w-3.5 text-slate-400"
                            title="Kayıtlı markalardan seçin veya yeni ekleyin."
                            aria-hidden
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => onRequestBrandModal?.()}
                          className={addRowBtnClass}
                        >
                          <Plus className="h-4 w-4 shrink-0" />
                          Yeni marka ekle
                        </button>
                        <select
                          value={prodForm.brand}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              brand: e.target.value,
                            }))
                          }
                          className={inp}
                        >
                          <option value="">Seçiniz</option>
                          {prodForm.brand &&
                            !brandOptions.includes(prodForm.brand) ? (
                            <option value={prodForm.brand}>
                              {prodForm.brand}
                            </option>
                          ) : null}
                          {brandOptions.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={label}>
                          Ürün Kodu{" "}
                          <span
                            className="inline-flex"
                            title="İç stok, depo veya tedarikçi ürün kodu (SKU ile aynı olabilir)."
                          >
                            <HelpCircle
                              className="h-3.5 w-3.5 text-slate-400"
                              aria-label="İç stok, depo veya tedarikçi ürün kodu (SKU ile aynı olabilir)."
                            />
                          </span>
                        </label>
                        <input
                          type="text"
                          value={prodForm.productCode}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              productCode: e.target.value,
                            }))
                          }
                          className={inp}
                          placeholder="varsa ürün kodu girin"
                        />
                      </div>

                      <div>
                        <label className={label}>GTIP</label>
                        <input
                          type="text"
                          value={prodForm.gtip}
                          onChange={(e) =>
                            setProdForm((p) => ({ ...p, gtip: e.target.value }))
                          }
                          className={inp}
                          placeholder="varsa GTIP kodu girin"
                        />
                      </div>

                      <div>
                        <label className={label}>GTIN</label>
                        <input
                          type="text"
                          value={prodForm.gtin}
                          onChange={(e) =>
                            setProdForm((p) => ({ ...p, gtin: e.target.value }))
                          }
                          className={inp}
                          placeholder="isteğe bağlı"
                        />
                      </div>

                      <div>
                        <label className={label}>Ülke kodu</label>
                        <select
                          value={prodForm.countryCode}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              countryCode: e.target.value,
                            }))
                          }
                          className={inp}
                        >
                          <option value="">Seçiniz</option>
                          {prodForm.countryCode &&
                            !PRODUCT_COUNTRY_OPTIONS.some(
                              (o) => o.value === prodForm.countryCode,
                            ) ? (
                            <option value={prodForm.countryCode}>
                              {prodForm.countryCode}
                            </option>
                          ) : null}
                          {PRODUCT_COUNTRY_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={label}>Fatura Başlığı</label>
                        <input
                          type="text"
                          value={prodForm.invoiceTitle}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              invoiceTitle: e.target.value,
                            }))
                          }
                          className={inp}
                          placeholder="isteğe bağlı"
                        />
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Stok ve Operasyon Bilgileri" icon={Boxes}>
                    <div className="space-y-5">
                      <div>
                        <div className="mb-2 flex items-center gap-1">
                          <label className={label} htmlFor="product-barcode">
                            Barkodu
                          </label>
                          <HelpCircle
                            className="h-3.5 w-3.5 text-slate-400"
                            title="EAN-13 veya elinizdeki barkod numarası."
                            aria-hidden
                          />
                        </div>
                        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch">
                          <input
                            id="product-barcode"
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            maxLength={32}
                            value={prodForm.barcode}
                            onChange={(e) =>
                              setProdForm((p) => ({
                                ...p,
                                barcode: e.target.value.slice(0, 32),
                              }))
                            }
                            className={`${inpMoney} min-h-[44px] font-mono text-sm tabular-nums`}
                            placeholder="varsa barkod no girin"
                          />
                          <button
                            type="button"
                            onClick={generateBarcode}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-teal-600 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"
                          >
                            <Barcode className="h-4 w-4 shrink-0" />
                            Barkod üret
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center gap-1">
                          <span className={label}>Raf Yeri</span>
                          <HelpCircle
                            className="h-3.5 w-3.5 text-slate-400"
                            title="Depo veya satış alanındaki raf konumu."
                            aria-hidden
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => onRequestShelfModal?.()}
                          className={addRowBtnClass}
                        >
                          <Plus className="h-4 w-4 shrink-0" />
                          Yeni raf yeri ekle
                        </button>
                        <select
                          value={prodForm.shelfLocation}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              shelfLocation: e.target.value,
                            }))
                          }
                          className={inp}
                        >
                          <option value="">Seçiniz</option>
                          {prodForm.shelfLocation &&
                            !shelfOptions.includes(prodForm.shelfLocation) ? (
                            <option value={prodForm.shelfLocation}>
                              {prodForm.shelfLocation}
                            </option>
                          ) : null}
                          {shelfOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center gap-1">
                          <span className={label}>Stok Takibi</span>
                          <HelpCircle
                            className="h-3.5 w-3.5 text-slate-400"
                            title="Stok veya seri numarası ile izleme türü."
                            aria-hidden
                          />
                        </div>
                        <select
                          value={normalizeStockTracking(prodForm.stockTracking)}
                          onChange={(e) => {
                            const stockTracking = e.target.value;
                            setProdForm((p) => ({
                              ...p,
                              stockTracking,
                              serialInvoiceMode:
                                stockTracking === "SERIAL"
                                  ? p.serialInvoiceMode &&
                                    ["HIDE", "SHOW", "OPTIONAL"].includes(
                                      p.serialInvoiceMode,
                                    )
                                    ? p.serialInvoiceMode
                                    : "OPTIONAL"
                                  : "",
                            }));
                          }}
                          className={inp}
                        >
                          <option value="NORMAL">Normal stok takibi</option>
                          <option value="SERIAL">Seri no ile takip</option>
                          <option value="NONE">Takip yok</option>
                          <option value="BATCH">Parti takibi</option>
                        </select>
                      </div>

                      {normalizeStockTracking(prodForm.stockTracking) ===
                        "SERIAL" && (
                          <div>
                            <div className="mb-2 flex items-center gap-1">
                              <span className={label}>Fatura yazdırma</span>
                              <HelpCircle
                                className="h-3.5 w-3.5 text-slate-400"
                                title="Satış faturasında seri numaralarının nasıl görüneceği."
                                aria-hidden
                              />
                            </div>
                            <select
                              value={
                                prodForm.serialInvoiceMode === "HIDE" ||
                                  prodForm.serialInvoiceMode === "SHOW" ||
                                  prodForm.serialInvoiceMode === "OPTIONAL"
                                  ? prodForm.serialInvoiceMode
                                  : "OPTIONAL"
                              }
                              onChange={(e) =>
                                setProdForm((p) => ({
                                  ...p,
                                  serialInvoiceMode: e.target.value,
                                }))
                              }
                              className={inp}
                            >
                              <option value="HIDE">
                                Satış faturasında seri no gözükmesin
                              </option>
                              <option value="SHOW">
                                Satış faturasında seri no gözüksün
                              </option>
                              <option value="OPTIONAL">İsteğe bağlı</option>
                            </select>
                          </div>
                        )}

                      <div>
                        <label className={label}>Kritik Stok Miktarı</label>
                        <input
                          type="number"
                          value={prodForm.criticalStock}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              criticalStock: e.target.value,
                            }))
                          }
                          className={inp}
                          placeholder="isteğe bağlı"
                        />
                      </div>

                      <div>
                        <label className={label}>Stok (adet)</label>
                        <input
                          type="number"
                          min={0}
                          value={prodForm.stock}
                          onChange={(e) =>
                            setProdForm((p) => ({ ...p, stock: e.target.value }))
                          }
                          className={inp}
                          placeholder="Boş = takip yok"
                        />
                      </div>

                      <div>
                        <label className={label}>Maks. sipariş adedi</label>
                        <input
                          type="number"
                          min={1}
                          value={prodForm.maxOrderQty}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              maxOrderQty: e.target.value,
                            }))
                          }
                          className={inp}
                          placeholder="Boş = sınırsız"
                        />
                      </div>

                      <div>
                        <label className={label}>Etiketler</label>
                        <textarea
                          value={prodForm.tagsString}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              tagsString: e.target.value,
                            }))
                          }
                          rows={3}
                          className={inp}
                          placeholder="Her satıra bir etiket"
                        />
                      </div>

                      <div>
                        <label className={label}>Açıklama</label>
                        <textarea
                          value={prodForm.description}
                          onChange={(e) =>
                            setProdForm((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                          rows={4}
                          className={inp}
                          placeholder="isteğe bağlı not..."
                        />
                        <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={prodForm.showDescriptionOnInvoice}
                            onChange={(e) =>
                              setProdForm((p) => ({
                                ...p,
                                showDescriptionOnInvoice: e.target.checked,
                              }))
                            }
                            className="rounded border-slate-300"
                          />
                          Açıklama metnini faturada göster
                        </label>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              )}

              {activeTab === "images" && (
                <SectionCard title="Ürün Görselleri" icon={ImageIcon}>
                  <div className="mx-auto max-w-2xl">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-8 py-14 transition hover:border-teal-400 hover:bg-teal-50/30">
                      <Camera className="mb-3 h-12 w-12 text-sky-500" />
                      <span className="text-base font-bold text-sky-600">
                        Resim Ekle
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={onImageUpload}
                        disabled={uploadingImage}
                      />
                      {uploadingImage && (
                        <span className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Yükleniyor...
                        </span>
                      )}
                    </label>

                    {prodForm.imageUrl ? (
                      <div className="relative mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <img
                          src={prodForm.imageUrl}
                          alt=""
                          className="max-h-72 w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setProdForm((p) => ({ ...p, imageUrl: "" }))
                          }
                          className="absolute right-2 top-2 rounded-lg bg-slate-900/70 p-2 text-white hover:bg-rose-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}

                    <p className="mt-4 text-center text-sm text-slate-500">
                      Ürünlerinize resim eklerseniz teklif ve satış ekranlarında
                      daha güçlü görünür.
                    </p>
                  </div>
                </SectionCard>
              )}

              {activeTab === "variant" && (
                <SectionCard title="Varyant Yönetimi" icon={GitBranch}>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                      Varyantlı ürün tanımlamak için aşağıdaki varyant tanımlarından
                      seçim yapabilirsiniz. Detaylı düzenleme için varyant sayfasını
                      kullanın.
                    </div>

                    <div>
                      <label className={label}>Varyantlar</label>
                      <select className={inp} disabled={!prodForm.id}>
                        <option value="">
                          {prodForm.id
                            ? "Varyant seçin…"
                            : "Önce ürünü kaydedin"}
                        </option>
                      </select>
                    </div>

                    {prodForm.id ? (
                      <Link
                        href={`/business/products/variants?productId=${prodForm.id}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                      >
                        Varyantları yönet
                      </Link>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Kayıt sonrası varyant ekleyebilirsiniz.
                      </p>
                    )}
                  </div>
                </SectionCard>
              )}

              {activeTab === "linked" && (
                <SectionCard title="Bağlı Ürünler" icon={Link2}>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-900">
                      Bu ürün her satıldığında dilerseniz başka ürünleri de stoktan
                      otomatik düşebilirsiniz. Kombin ürünler için bu özelliği
                      kullanabilirsiniz.
                    </div>

                    <div>
                      <label className={label}>Ürün ara (yakında)</label>
                      <input
                        type="search"
                        value={prodForm.linkedSearch}
                        onChange={(e) =>
                          setProdForm((p) => ({
                            ...p,
                            linkedSearch: e.target.value,
                          }))
                        }
                        className={inp}
                        placeholder="Ürün isminden arayın ya da barkod okutun..."
                        disabled={!prodForm.id}
                      />
                    </div>

                    {!prodForm.id ? (
                      <p className="text-sm text-amber-700">
                        Bağlı ürün eklemek için önce ürünü kaydedin.
                      </p>
                    ) : null}
                  </div>
                </SectionCard>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}