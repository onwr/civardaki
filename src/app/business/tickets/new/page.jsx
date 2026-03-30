"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Headphones,
  Send,
  ShieldCheck,
  Tag,
  FileText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { CATEGORY_OPTIONS } from "@/lib/tickets/config";

function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function InfoMiniCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <Icon className="mb-2 h-5 w-5 text-white" />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function BusinessTicketsNewPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [loading, setLoading] = useState(false);

  const selectedCategoryLabel = useMemo(() => {
    return (
      CATEGORY_OPTIONS.find((item) => item.value === category)?.label || "Genel"
    );
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !body.trim()) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/business/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          body: body.trim(),
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Talep gönderilemedi.");

      toast.success("Destek talebiniz oluşturuldu.");
      router.push(
        data.ticket?.id
          ? `/business/tickets/${data.ticket.id}`
          : "/business/tickets",
      );
    } catch (err) {
      toast.error(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 pb-16 pt-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          href="/business/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Taleplere dön
        </Link>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <Headphones className="h-4 w-4" />
                  İşletme Destek Merkezi
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Yeni destek talebi oluşturun
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Teknik sorun, abonelik, ödeme, panel kullanımı veya içerik
                  düzenleme gibi konularda destek ekibine detaylı kayıt bırakın.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <InfoMiniCard
                  icon={Tag}
                  label="Kategori"
                  value={selectedCategoryLabel}
                />
                <InfoMiniCard
                  icon={FileText}
                  label="Konu"
                  value={subject.trim() || "Henüz başlık girilmedi"}
                />
                <InfoMiniCard
                  icon={ShieldCheck}
                  label="Durum"
                  value="Oluşturulmaya hazır"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <SectionCard
            title="Talep formu"
            subtitle="Zorunlu alanları doldurarak destek kaydı oluşturun"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Talep konusu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  maxLength={120}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/70"
                  placeholder="Örn: Abonelik faturam görüntülenmiyor"
                />
                <div className="text-right text-xs font-medium text-slate-400">
                  {subject.length}/120
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/70"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Mesajınız <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  rows={8}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/70"
                  placeholder="Yaşadığınız durumu, hata adımlarını ve beklediğiniz sonucu detaylı şekilde yazın..."
                />
                <div className="text-right text-xs font-medium text-slate-400">
                  {body.length} karakter
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Gönderiliyor..." : "Talebi Gönder"}
                </button>

                <Link
                  href="/business/tickets"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  İptal
                </Link>
              </div>
            </form>
          </SectionCard>

          <div className="space-y-6">
            <SectionCard title="İyi bir destek talebi için">
              <ul className="space-y-3 text-sm leading-6 text-slate-600">
                <li>Konuyu kısa ve net bir başlıkla özetleyin.</li>
                <li>Hatanın hangi sayfada veya işlemde oluştuğunu belirtin.</li>
                <li>Adım adım ne yaptığınızı mümkünse yazın.</li>
                <li>Ödeme konusuysa tarih ve paket bilgisini ekleyin.</li>
              </ul>
            </SectionCard>

            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-blue-700 to-slate-900 text-white shadow-[0_14px_35px_rgba(15,23,42,0.10)]">
              <div className="p-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <Sparkles className="h-4 w-4" />
                  Not
                </div>
                <p className="text-sm leading-7 text-blue-100/90">
                  Talep oluşturulduktan sonra destek ekibi tarafından incelenir.
                  Durum güncellemeleri ve yeni mesajlar talep detay ekranında görünür.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}