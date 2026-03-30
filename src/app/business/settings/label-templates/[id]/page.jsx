"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CheckIcon,
  XMarkIcon,
  ArrowUturnLeftIcon,
  TagIcon,
  DocumentTextIcon,
  EyeIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import {
  categoryLabelTr,
  formatLabelTr,
  normalizeSettings,
} from "@/lib/label-template-defaults";

function clampNum(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function ActionButton({
  children,
  onClick,
  icon: Icon,
  tone = "green",
  className = "",
  type = "button",
  disabled = false,
}) {
  const tones = {
    green:
      "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    red: "bg-red-600 hover:bg-red-700 border-red-700 text-white",
    orange:
      "bg-orange-500 hover:bg-orange-600 border-orange-500 text-white",
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
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

function StatMini({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function SectionToggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
          value
            ? "bg-emerald-500 text-white"
            : "border border-slate-200 bg-white text-slate-500"
        }`}
      >
        {value ? "Var" : "Yok"}
      </button>
    </div>
  );
}

function ProductPreview({ settings, format }) {
  const s = settings;
  const isRibbon = format === "RIBBON";
  const cols = isRibbon ? 1 : clampNum(s.labelsPerRow, 1, 12, 1);
  const count = isRibbon ? 1 : cols;

  const cell = (
    <div
      className="flex flex-col overflow-hidden rounded border border-slate-300 bg-white text-[10px] shadow-sm"
      style={{ minHeight: "120px", flex: isRibbon ? "none" : 1 }}
    >
      {s.showProductName ? (
        <div className="bg-blue-600 px-2 py-1.5 font-bold text-white">Bluetooth Kulaklık</div>
      ) : null}
      {s.showProductCode ? (
        <div className="bg-emerald-500 px-2 py-1 font-semibold text-white">AF-008</div>
      ) : null}
      {s.showSalePrice ? (
        <div className="bg-red-500 px-2 py-1 font-bold text-white">16,00 TL</div>
      ) : null}
      {s.showBarcode ? (
        <div className="flex flex-1 items-center justify-center border-y border-dashed border-slate-300 bg-slate-50 py-3 text-[8px] text-slate-400">
          ||| barkod |||
        </div>
      ) : null}
      {s.showLocalProductionLogo ? (
        <div className="bg-slate-200 py-1 text-center text-[8px] font-semibold text-slate-600">
          Yerli Üretim
        </div>
      ) : null}
      {s.showProductTags ? (
        <div className="px-1 py-0.5 text-[8px] text-slate-500">Etiketler</div>
      ) : null}
      {s.showFixedDescription ? (
        <div className="px-1 text-[8px] text-slate-500">Sabit açıklama</div>
      ) : null}
      {s.showShelfLocation ? (
        <div className="px-1 text-[8px] text-slate-500">Raf: A-12</div>
      ) : null}
    </div>
  );

  if (isRibbon) {
    return <div className="max-w-[200px]">{cell}</div>;
  }

  return (
    <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="min-w-0 flex-1" style={{ flexBasis: `${100 / cols}%` }}>
          {cell}
        </div>
      ))}
    </div>
  );
}

function AddressPreview({ settings }) {
  const s = settings;
  const rows = clampNum(s.rowsOnPage, 1, 20, 5);
  const cols = clampNum(s.labelsPerRow, 1, 8, 2);
  const total = rows * cols;

  const sample = (
    <div className="flex h-full min-h-[72px] flex-col overflow-hidden rounded border border-slate-400 text-[9px]">
      {s.showRecipientName ? (
        <div className="bg-blue-600 px-1.5 py-1 font-bold text-white">Murat Şahin</div>
      ) : null}
      {s.showAddress ? (
        <div className="flex-1 bg-red-500 px-1.5 py-1 leading-tight text-white">
          Örnek mah. Örnek sok. No:1/1 Ataşehir İstanbul
        </div>
      ) : null}
      {s.showPhone ? (
        <div className="bg-teal-600 px-1.5 py-0.5 text-white">Tel: 0500 123 45 67</div>
      ) : null}
      {!s.showRecipientName && !s.showAddress && !s.showPhone ? (
        <div className="flex flex-1 items-center justify-center text-slate-400">ETİKET</div>
      ) : null}
    </div>
  );

  return (
    <div
      className="grid gap-1 rounded-lg bg-slate-200 p-2"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="min-h-0">
          {i === 0 ? (
            sample
          ) : (
            <div className="flex h-full min-h-[72px] items-center justify-center rounded border border-slate-300 bg-amber-50/80 text-[10px] text-slate-500">
              ETİKET
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Collapsible({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-bold text-slate-800">{title}</span>
        <span className="text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open ? <div className="border-t border-slate-200 px-4 py-4">{children}</div> : null}
    </div>
  );
}

export default function LabelTemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("PRODUCT");
  const [format, setFormat] = useState("A4");
  const [settings, setSettings] = useState(() => normalizeSettings("PRODUCT", {}));

  const setS = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/business/label-templates/${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Yüklenemedi.");
      const t = data.item;
      if (!t) throw new Error("Bulunamadı.");

      setName(t.name || "");
      setCategory(t.category || "PRODUCT");
      setFormat(t.format || "A4");
      setSettings(normalizeSettings(t.category || "PRODUCT", t.settings));
    } catch (e) {
      toast.error(e.message || "Yüklenemedi.");
      router.push("/business/settings/label-templates");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!id) return;
    const n = name.trim();
    if (!n) return toast.error("Şablon adı zorunludur.");

    setSaving(true);
    try {
      const res = await fetch(`/api/business/label-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: n,
          category,
          format,
          settings,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Kaydedilemedi.");
      toast.success("Kaydedildi.");

      if (data.item) {
        setCategory(data.item.category);
        setFormat(data.item.format);
        setSettings(normalizeSettings(data.item.category, data.item.settings));
      }
    } catch (e) {
      toast.error(e.message || "Hata.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    if (!confirm("Bu şablonu silmek istiyor musunuz?")) return;

    try {
      const res = await fetch(`/api/business/label-templates/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Silinemedi.");
      toast.success("Silindi.");
      router.push("/business/settings/label-templates");
    } catch (e) {
      toast.error(e.message || "Silinemedi.");
    }
  };

  if (loading || !id) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-slate-50 px-4 pb-16 pt-8">
        <div className="mx-auto flex max-w-6xl justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
        </div>
      </div>
    );
  }

  const isProduct = category === "PRODUCT";

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-50 px-4 pb-16 pt-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <Cog6ToothIcon className="h-4 w-4" />
                  Etiket Şablon Editörü
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {name || "Etiket Şablonu"}
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Etiket alanlarını, ölçülerini ve önizlemesini aynı ekranda yönetin.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton onClick={save} disabled={saving} icon={CheckIcon} tone="green">
                  Kaydet
                </ActionButton>
                <ActionButton onClick={remove} icon={XMarkIcon} tone="red">
                  Sil
                </ActionButton>
                <Link
                  href="/business/settings/label-templates"
                  className="inline-flex items-center gap-2 rounded-xl border border-orange-500 bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  <ArrowUturnLeftIcon className="h-4 w-4" />
                  Geri Dön
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatMini
              label="Şablon Türü"
              value={isProduct ? "Ürün" : "Adres"}
              icon={TagIcon}
            />
            <StatMini
              label="Format"
              value={formatLabelTr(format)}
              icon={DocumentTextIcon}
            />
            <StatMini
              label="Kategori"
              value={categoryLabelTr(category)}
              icon={Squares2X2Icon}
            />
            <StatMini
              label="Önizleme"
              value="Aktif"
              icon={EyeIcon}
            />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6">
            <SectionCard
              title="Etiket Tanımı"
              subtitle="Şablon adı ve temel bilgiler"
            >
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Şablon adı
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                    placeholder="Şablona isim verin"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      Şablon türü
                    </label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800">
                      {isProduct ? "Ürün Etiketi" : "Adres Etiketi"}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      Format
                    </label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800">
                      {formatLabelTr(format)}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Canlı Önizleme"
              subtitle="Yaptığınız değişiklikler burada görünür"
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                {isProduct ? (
                  <ProductPreview settings={settings} format={format} />
                ) : (
                  <AddressPreview settings={settings} />
                )}
              </div>
            </SectionCard>
          </div>

          <div className="space-y-4">
            {isProduct ? (
              <>
                <Collapsible title="Sayfa Özellikleri">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs text-slate-600">
                          Sayfanın sol boşluğu (mm)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={settings.pageMarginLeftMm}
                          onChange={(e) =>
                            setS({
                              pageMarginLeftMm: clampNum(e.target.value, 0, 50, 5),
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-600">
                          Sayfanın sağ boşluğu (mm)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={settings.pageMarginRightMm}
                          onChange={(e) =>
                            setS({
                              pageMarginRightMm: clampNum(e.target.value, 0, 50, 5),
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-slate-600">
                        Bir satırdaki etiket sayısı (adet)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={settings.labelsPerRow}
                        onChange={(e) =>
                          setS({
                            labelsPerRow: clampNum(e.target.value, 1, 12, 1),
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                </Collapsible>

                <Collapsible title="Etiket Özellikleri">
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs text-slate-600">
                        Etiket yönü
                      </label>
                      <select
                        value={settings.labelOrientation}
                        onChange={(e) => setS({ labelOrientation: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      >
                        <option value="horizontal">Yatay</option>
                        <option value="vertical">Dikey</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs text-slate-600">
                          Etiket genişliği (mm)
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={200}
                          value={settings.labelWidthMm}
                          onChange={(e) =>
                            setS({
                              labelWidthMm: clampNum(e.target.value, 10, 200, 70),
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-600">
                          Etiket yüksekliği (mm)
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={200}
                          value={settings.labelHeightMm}
                          onChange={(e) =>
                            setS({
                              labelHeightMm: clampNum(e.target.value, 10, 200, 46),
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs text-slate-600">
                          Yan yana boşluk (mm)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={settings.gapHorizontalMm}
                          onChange={(e) =>
                            setS({
                              gapHorizontalMm: clampNum(e.target.value, 0, 20, 2),
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-600">
                          Alt alta boşluk (mm)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={settings.gapVerticalMm}
                          onChange={(e) =>
                            setS({
                              gapVerticalMm: clampNum(e.target.value, 0, 20, 2),
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </Collapsible>

                <Collapsible title="Etiket Kısımları">
                  <div className="space-y-3">
                    <SectionToggle
                      label="Ürün adı"
                      value={settings.showProductName}
                      onChange={(v) => setS({ showProductName: v })}
                    />
                    <SectionToggle
                      label="Ürün kodu"
                      value={settings.showProductCode}
                      onChange={(v) => setS({ showProductCode: v })}
                    />
                    <SectionToggle
                      label="Satış fiyatı"
                      value={settings.showSalePrice}
                      onChange={(v) => setS({ showSalePrice: v })}
                    />
                    <SectionToggle
                      label="Ürün barkodu"
                      value={settings.showBarcode}
                      onChange={(v) => setS({ showBarcode: v })}
                    />
                    <SectionToggle
                      label="Yerli üretim logosu"
                      value={settings.showLocalProductionLogo}
                      onChange={(v) => setS({ showLocalProductionLogo: v })}
                    />
                    <SectionToggle
                      label="Ürün etiketleri"
                      value={settings.showProductTags}
                      onChange={(v) => setS({ showProductTags: v })}
                    />
                    <SectionToggle
                      label="Sabit açıklama"
                      value={settings.showFixedDescription}
                      onChange={(v) => setS({ showFixedDescription: v })}
                    />
                    <SectionToggle
                      label="Raf yeri"
                      value={settings.showShelfLocation}
                      onChange={(v) => setS({ showShelfLocation: v })}
                    />
                  </div>
                </Collapsible>
              </>
            ) : (
              <>
                <Collapsible title="Sayfa Özellikleri">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["pageMarginTopMm", "Sayfanın üst boşluğu (mm)"],
                      ["pageMarginBottomMm", "Sayfanın alt boşluğu (mm)"],
                      ["pageMarginLeftMm", "Sayfanın sol boşluğu (mm)"],
                      ["pageMarginRightMm", "Sayfanın sağ boşluğu (mm)"],
                    ].map(([key, lab]) => (
                      <div key={key}>
                        <label className="mb-1 block text-xs text-slate-600">{lab}</label>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={settings[key]}
                          onChange={(e) =>
                            setS({ [key]: clampNum(e.target.value, 0, 50, 5) })
                          }
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-slate-600">
                        Sayfadaki satır sayısı (adet)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={settings.rowsOnPage}
                        onChange={(e) =>
                          setS({
                            rowsOnPage: clampNum(e.target.value, 1, 20, 5),
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-600">
                        Bir satırdaki etiket sayısı (adet)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={settings.labelsPerRow}
                        onChange={(e) =>
                          setS({
                            labelsPerRow: clampNum(e.target.value, 1, 8, 2),
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                </Collapsible>

                <Collapsible title="Etiket Özellikleri">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-slate-600">
                        Etiket genişliği (mm)
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={200}
                        value={settings.labelWidthMm}
                        onChange={(e) =>
                          setS({
                            labelWidthMm: clampNum(e.target.value, 10, 200, 70),
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-600">
                        Etiket yüksekliği (mm)
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={200}
                        value={settings.labelHeightMm}
                        onChange={(e) =>
                          setS({
                            labelHeightMm: clampNum(e.target.value, 10, 200, 30),
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-600">
                        Yan yana boşluk (mm)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={settings.gapHorizontalMm}
                        onChange={(e) =>
                          setS({
                            gapHorizontalMm: clampNum(e.target.value, 0, 20, 2),
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-600">
                        Alt alta boşluk (mm)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={settings.gapVerticalMm}
                        onChange={(e) =>
                          setS({
                            gapVerticalMm: clampNum(e.target.value, 0, 20, 2),
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                </Collapsible>

                <Collapsible title="Etiket Kısımları">
                  <div className="space-y-3">
                    <SectionToggle
                      label="İsim / unvan"
                      value={settings.showRecipientName}
                      onChange={(v) => setS({ showRecipientName: v })}
                    />
                    <SectionToggle
                      label="Adres"
                      value={settings.showAddress}
                      onChange={(v) => setS({ showAddress: v })}
                    />
                    <SectionToggle
                      label="Telefon"
                      value={settings.showPhone}
                      onChange={(v) => setS({ showPhone: v })}
                    />
                    <SectionToggle
                      label="Sabit açıklama"
                      value={settings.showFixedDescription}
                      onChange={(v) => setS({ showFixedDescription: v })}
                    />
                    <SectionToggle
                      label="Raf yeri"
                      value={settings.showShelfLocation}
                      onChange={(v) => setS({ showShelfLocation: v })}
                    />
                  </div>
                </Collapsible>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}