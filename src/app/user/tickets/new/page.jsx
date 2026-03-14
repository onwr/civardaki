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
} from "lucide-react";
import { toast } from "sonner";
import { CATEGORY_OPTIONS } from "@/lib/tickets/config";

export default function UserTicketsNewPage() {
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
      const res = await fetch("/api/user/tickets", {
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

      if (data.ticket?.id) {
        router.push(`/user/tickets/${data.ticket.id}`);
      } else {
        router.push("/user/tickets");
      }
    } catch (err) {
      toast.error(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link
        href="/user/tickets"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Taleplere dön
      </Link>

      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#004aad] via-[#0b57c8] to-[#0f172a] text-white shadow-[0_30px_80px_-30px_rgba(0,74,173,0.45)]">
        <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.25fr_0.75fr] md:px-8 md:py-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
              <Headphones className="h-3.5 w-3.5" />
              Kullanıcı Destek Merkezi
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Yeni destek talebi oluşturun
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/80 md:text-[15px]">
                Siparişler, hesabınız, ödemeler veya yaşadığınız teknik
                sorunlarla ilgili destek talebi oluşturabilir, süreci panel
                üzerinden takip edebilirsiniz.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <Tag className="mb-2 h-5 w-5 text-white" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                Kategori
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {selectedCategoryLabel}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <FileText className="mb-2 h-5 w-5 text-white" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                Konu
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold text-white/90">
                {subject.trim() || "Henüz başlık girilmedi"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <ShieldCheck className="mb-2 h-5 w-5 text-white" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                Durum
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                İncelemeye gönderilecek
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="space-y-6">
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
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#004aad] focus:bg-white focus:ring-4 focus:ring-[#004aad]/10"
                placeholder="Örn: Sipariş durumum güncellenmiyor"
              />
              <div className="text-right text-xs text-slate-400">
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
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all focus:border-[#004aad] focus:bg-white focus:ring-4 focus:ring-[#004aad]/10"
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
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 resize-none focus:border-[#004aad] focus:bg-white focus:ring-4 focus:ring-[#004aad]/10"
                placeholder="Yaşadığınız sorunu veya talebinizi detaylı şekilde yazın..."
              />
              <div className="text-right text-xs text-slate-400">
                {body.length} karakter
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#004aad] px-5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {loading ? "Gönderiliyor..." : "Talebi Gönder"}
              </button>

              <Link
                href="/user/tickets"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                İptal
              </Link>
            </div>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Talebiniz daha hızlı çözülsün
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>İlgili sipariş, ödeme veya işlem adımını açıkça yazın.</li>
              <li>Varsa hata mesajını aynen ekleyin.</li>
              <li>Ne zaman ve hangi sayfada sorun yaşadığınızı belirtin.</li>
              <li>Kısa ama açıklayıcı bir başlık kullanın.</li>
            </ul>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Bilgilendirme
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Oluşturduğunuz destek talepleri ilgili ekip tarafından incelenir.
              Durum ve yanıtlarınızı talep detay sayfasından takip
              edebilirsiniz.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
