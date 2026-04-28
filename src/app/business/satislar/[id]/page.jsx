"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowUturnLeftIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

// Helper functions for parsing and calculating
const parseMoneyInput = (val) => {
  if (!val) return 0;
  const s = String(val).replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};
const fmtMoney = (n) =>
  new Intl.NumberFormat("tr-TR", { minFractionDigits: 2, maxFractionDigits: 2 }).format(Number(n) || 0);

const DOC_TYPES = [
  { value: "ORDER", label: "Sipariş" },
  { value: "WAYBILL", label: "İrsaliye" },
  { value: "INVOICED_EFATURA", label: "E-Faturalaşmış" },
  { value: "INVOICED_NOT_EFATURA", label: "Faturalaşmış" },
];

export default function SaleEditPage({ params }) {
  const router = useRouter();

  // Next.js 15 requires unwrapping `params` via React.use()
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const submittingRef = useRef(false);

  const [sale, setSale] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [products, setProducts] = useState([]);

  // Form State
  const [documentType, setDocumentType] = useState("ORDER");
  const [saleDate, setSaleDate] = useState("");
  const [description, setDescription] = useState("");
  const [collectionAmount, setCollectionAmount] = useState("");
  const [cashAccountId, setCashAccountId] = useState("");
  const [items, setItems] = useState([]);

  // Line Item Input State
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedUnitPrice, setSelectedUnitPrice] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [saleRes, accRes, prodRes] = await Promise.all([
          fetch(`/api/business/sales/${id}`),
          fetch("/api/business/cash/accounts"),
          fetch("/api/business/products?limit=200"),
        ]);
        
        if (!saleRes.ok) {
          toast.error("Satış bulunamadı.");
          router.push("/business/satislar");
          return;
        }

        const saleData = await saleRes.json();
        const accData = await accRes.json();
        const prodData = await prodRes.json();

        if (cancelled) return;

        setAccounts(accData.accounts || []);
        setProducts(prodData.products || []);

        const s = saleData.sale;
        setSale(s);

        setDocumentType(s.documentType || "ORDER");
        const getLocString = (iso) => {
          const d = iso ? new Date(iso) : new Date();
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        };
        setSaleDate(getLocString(s.saleDate));
        setDescription(s.description || "");
        setCollectionAmount(s.collectionAmount > 0 ? String(s.collectionAmount).replace(".", ",") : "");
        setCashAccountId(s.cashAccountId || "");

        const initialItems = (s.items || []).map((it) => ({
          id: Math.random().toString(36).substring(2),
          productId: it.productId,
          productVariantId: it.productVariantId,
          name: it.name,
          quantity: it.quantity,
          unitPrice: String(it.unitPrice).replace(".", ","),
          total: it.total,
        }));
        setItems(initialItems);

      } catch (e) {
        toast.error("Yüklenirken hata oluştu.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, router]);

  const linesTotal = items.reduce((sum, line) => sum + line.total, 0);

  const handleProductSelect = (e) => {
    const pId = e.target.value;
    setSelectedProduct(pId);
    setSelectedVariant("");
    if (!pId || pId === "MANUAL") {
      setSelectedUnitPrice("");
      return;
    }
    const p = products.find((x) => x.id === pId);
    if (p) {
      setSelectedUnitPrice(String(p.price || 0).replace(".", ","));
    }
  };

  useEffect(() => {
    if (!selectedProduct || selectedProduct === "MANUAL") return;
    const p = products.find(x => x.id === selectedProduct);
    if (!p) return;
    if (selectedVariant) {
      const v = p.variants?.find(x => x.id === selectedVariant);
      const vp = v?.discountPrice ?? v?.price ?? p.discountPrice ?? p.price ?? 0;
      setSelectedUnitPrice(String(vp).replace(".", ","));
    } else {
      const bp = p.discountPrice ?? p.price ?? 0;
      setSelectedUnitPrice(String(bp).replace(".", ","));
    }
  }, [selectedVariant]);

  const addLine = () => {
    if (!selectedProduct) {
      toast.error("Lütfen bir ürün seçin veya 'Manuel Tanımsız Ürün' girin.");
      return;
    }
    if (selectedQty <= 0) {
      toast.error("Geçerli bir miktar girin.");
      return;
    }
    const pu = parseMoneyInput(selectedUnitPrice);
    if (pu < 0) {
      toast.error("Geçerli bir birim fiyat girin.");
      return;
    }

    let name = "Manuel Ürün";
    if (selectedProduct !== "MANUAL") {
      const p = products.find((x) => x.id === selectedProduct);
      if (p) {
        name = p.name;
        if (selectedVariant) {
          const v = p.variants?.find((x) => x.id === selectedVariant);
          if (v && v.name) name += ` - ${v.name}`;
        }
      }
    }

    const newLineTotal = pu * selectedQty;
    const newItem = {
      id: Math.random().toString(36).substring(2),
      productId: selectedProduct === "MANUAL" ? null : selectedProduct,
      productVariantId: selectedVariant || null,
      name,
      quantity: selectedQty,
      unitPrice: selectedUnitPrice,
      total: newLineTotal,
    };
    setItems((prev) => [...prev, newItem]);

    setSelectedProduct("");
    setSelectedVariant("");
    setSelectedQty(1);
    setSelectedUnitPrice("");
  };

  const removeLine = (lineId) => {
    setItems((prev) => prev.filter((i) => i.id !== lineId));
  };

  const handleSave = async () => {
    if (submittingRef.current) return;

    if (items.length === 0) {
      toast.error("En az 1 satır eklemelisiniz.");
      return;
    }

    const collAmt = parseMoneyInput(collectionAmount);
    if (collAmt > linesTotal + 0.05) {
      toast.error("Tahsilat, toplam satış tutarından büyük olamaz.");
      return;
    }

    if (collAmt > 0 && !cashAccountId) {
      toast.error("Tahsilat girdiğinizde bir Kasa Hesabı seçmelisiniz.");
      return;
    }

    setSaving(true);
    submittingRef.current = true;

    try {
      const payload = {
        documentType,
        saleDate: new Date(saleDate).toISOString(),
        totalAmount: linesTotal,
        collectionAmount: collAmt,
        cashAccountId: collAmt > 0 ? cashAccountId : null,
        description,
        items: items.map((it) => ({
          productId: it.productId,
          productVariantId: it.productVariantId,
          name: it.name,
          quantity: it.quantity,
          unitPrice: parseMoneyInput(it.unitPrice),
          total: it.total,
        })),
        customerId: sale.customerId,
      };

      const res = await fetch(`/api/business/sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncelleme başarısız.");

      toast.success("Satış başarıyla güncellendi!");
      router.push("/business/satislar");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Bilinmeyen bir hata oluştu.");
      setSaving(false);
      submittingRef.current = false;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bu satışı tamamen silmek istiyor musunuz? İşlem kasa ve cari bakiyelerinden düşülecektir.")) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/business/sales/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Silme işlemi başarısız");

      toast.success("Satış başarıyla silindi ve bakiyeler düzeltildi.");
      router.push("/business/satislar");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Bilinmeyen bir hata oluştu.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20 text-[13px] text-slate-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <DocumentTextIcon className="h-3.5 w-3.5" />
            Satış Düzenleme
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Satışı Düzenle</h1>
        </div>
        <Link
          href="/business/satislar"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50"
        >
          <ArrowUturnLeftIcon className="h-4 w-4" />
          Listeye Dön
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold uppercase tracking-widest text-slate-500">Kalemler (Ürün/Hizmet)</h3>
            <div className="grid grid-cols-12 gap-3 mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="col-span-12 md:col-span-4">
                <label className="mb-1 block text-xs font-semibold text-slate-500">Ürün Seç</label>
                <select
                  value={selectedProduct}
                  onChange={handleProductSelect}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">Seçiniz...</option>
                  <option value="MANUAL">-- LİSTEDE OLMAYAN (MANUEL) --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {selectedProduct && selectedProduct !== "MANUAL" && products.find(p => p.id === selectedProduct)?.variants?.length > 0 && (
                  <div className="mt-2">
                    <label className="mb-1 block text-xs font-semibold text-slate-500">Varyant Seç</label>
                    <select
                      value={selectedVariant}
                      onChange={(e) => setSelectedVariant(e.target.value)}
                      className="w-full rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-sm outline-none focus:border-sky-500"
                    >
                      <option value="">Varyant seçiniz...</option>
                      {products.find(p => p.id === selectedProduct).variants.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="col-span-6 md:col-span-3">
                 <label className="mb-1 block text-xs font-semibold text-slate-500">Miktar</label>
                 <input
                    type="number"
                    min="1"
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                 />
              </div>
              <div className="col-span-6 md:col-span-3">
                 <label className="mb-1 block text-xs font-semibold text-slate-500">Birim Fiyat (₺)</label>
                 <input
                    value={selectedUnitPrice}
                    onChange={(e) => setSelectedUnitPrice(e.target.value)}
                    placeholder="100,00"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                 />
              </div>
              <div className="col-span-12 md:col-span-2 flex items-end">
                <button
                  type="button"
                  onClick={addLine}
                  className="w-full h-[38px] rounded-lg bg-sky-600 font-bold text-white hover:bg-sky-700 flex items-center justify-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" /> Ekle
                </button>
              </div>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="py-2 px-3 font-semibold text-slate-600">Ürün Açıklaması</th>
                  <th className="py-2 px-3 text-center font-semibold text-slate-600">Miktar</th>
                  <th className="py-2 px-3 text-right font-semibold text-slate-600">B. Fiyat</th>
                  <th className="py-2 px-3 text-right font-semibold text-slate-600">Tutar</th>
                  <th className="py-2 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="py-4 text-center text-slate-400">Henüz kalem eklenmedi</td>
                   </tr>
                ) : (
                  items.map((i, idx) => (
                    <tr key={i.id || idx} className="border-t border-slate-100">
                      <td className="py-3 px-3 font-medium text-slate-900">{i.name}</td>
                      <td className="py-3 px-3 text-center text-slate-700">{i.quantity}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-600">{i.unitPrice} ₺</td>
                      <td className="py-3 px-3 text-right font-semibold tabular-nums text-slate-800">{fmtMoney(i.total)} ₺</td>
                      <td className="py-3 px-3 text-right">
                         <button onClick={() => removeLine(i.id)} className="p-1 rounded text-rose-500 hover:bg-rose-50">
                           <TrashIcon className="h-4 w-4" />
                         </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:col-span-1 space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-bold uppercase tracking-widest text-slate-500">Satış Bilgileri</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Müşteri / Cari</label>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-bold">
                {sale?.customerName || "Perakende Satış (Tanımsız)"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tarih</label>
              <input 
                type="datetime-local" 
                value={saleDate} 
                onChange={(e) => setSaleDate(e.target.value)} 
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Belge Tipi</label>
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500">
                {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Genel Toplam ₺</label>
              <div className="w-full rounded-lg bg-sky-50 text-sky-800 font-black text-xl px-3 py-2 tabular-nums">
                {fmtMoney(linesTotal)}
              </div>
            </div>
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Şimdi Tahsil Edilen (₺)</label>
                <input 
                   value={collectionAmount}
                   onChange={e => setCollectionAmount(e.target.value)}
                   placeholder="Örn: 250,50"
                   className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">HESAP / KASA (TAHSİLAT VARSA)</label>
                <select 
                  value={cashAccountId} 
                  onChange={e => setCashAccountId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
                >
                  <option value="">Seçiniz...</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({fmtMoney(a.balance)} ₺)</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">İşlem Açıklaması</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none min-h-[80px]"
                placeholder="Fatura no, detaylar vs."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDelete}
              disabled={saving}
              className="w-full rounded-xl border border-rose-200 bg-white py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors shadow-sm disabled:opacity-50"
            >
              Satışı Sil
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Güncelleniyor..." : "Güncelle (Kaydet)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
