"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Headphones,
  MessageSquare,
  Clock3,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { getStatusLabel, getCategoryLabel } from "@/lib/tickets/config";

function formatDateTime(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function messageAuthor(msg) {
  if (msg.authorType === "ADMIN") return "Destek Ekibi";
  if (msg.authorType === "BUSINESS") return "Siz";
  return "—";
}

function statusBadgeClass(status) {
  const s = String(status || "").toUpperCase();

  if (s === "OPEN" || s === "PENDING") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (s === "ANSWERED" || s === "IN_PROGRESS") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  if (s === "RESOLVED" || s === "CLOSED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
}

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

export default function BusinessTicketDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);

  const categoryLabel = useMemo(() => {
    return ticket ? getCategoryLabel(ticket.category) : "—";
  }, [ticket]);

  const statusLabel = useMemo(() => {
    return ticket ? getStatusLabel(ticket.status) : "—";
  }, [ticket]);

  const fetchTicket = async () => {
    if (!id) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/business/tickets/${id}`);
      const data = await res.json();

      if (data.success) {
        setTicket(data.ticket);
      } else {
        setTicket(null);
      }
    } catch {
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!id || !replyBody.trim() || sending) return;

    setSending(true);

    try {
      const res = await fetch(`/api/business/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yanıt gönderilemedi.");

      setReplyBody("");
      toast.success("Yanıtınız gönderildi.");
      fetchTicket();
    } catch (err) {
      toast.error(err.message || "Bir hata oluştu.");
    } finally {
      setSending(false);
    }
  };

  if (!id) {
    return (
      <div className="min-h-[calc(100vh-8rem)] px-4 pb-16 pt-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <Link
            href="/business/tickets"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Taleplere dön
          </Link>

          <SectionCard title="Geçersiz talep">
            <div className="text-sm text-slate-500">Geçersiz talep.</div>
          </SectionCard>
        </div>
      </div>
    );
  }

  if (loading && !ticket) {
    return (
      <div className="min-h-[calc(100vh-8rem)] px-4 pb-16 pt-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <Link
            href="/business/tickets"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Taleplere dön
          </Link>

          <div className="space-y-4">
            <div className="h-44 animate-pulse rounded-[28px] border border-slate-200 bg-slate-100" />
            <div className="h-48 animate-pulse rounded-[28px] border border-slate-200 bg-slate-100" />
            <div className="h-72 animate-pulse rounded-[28px] border border-slate-200 bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-[calc(100vh-8rem)] px-4 pb-16 pt-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <Link
            href="/business/tickets"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Taleplere dön
          </Link>

          <SectionCard title="Talep bulunamadı">
            <div className="text-sm text-slate-500">Talep bulunamadı.</div>
          </SectionCard>
        </div>
      </div>
    );
  }

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
                  Business Destek Talebi
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {ticket.subject}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Destek ekibiyle yazışmalarınızı bu ekran üzerinden takip edebilir,
                  yeni mesaj gönderebilir ve kayıt durumunu izleyebilirsiniz.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <InfoMiniCard
                  icon={Tag}
                  label="Kategori"
                  value={categoryLabel}
                />
                <InfoMiniCard
                  icon={ShieldCheck}
                  label="Durum"
                  value={statusLabel}
                />
                <InfoMiniCard
                  icon={Clock3}
                  label="Oluşturulma"
                  value={formatDateTime(ticket.createdAt)}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <SectionCard
              title="Talep özeti"
              subtitle="İlk oluşturulan kayıt içeriği"
              right={
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${statusBadgeClass(
                    ticket.status,
                  )}`}
                >
                  {statusLabel}
                </span>
              }
            >
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {ticket.body}
                </p>
              </div>
            </SectionCard>

            <SectionCard
              title="Mesaj geçmişi"
              subtitle="Destek ekibiyle yapılan tüm yazışmalar"
            >
              <div className="space-y-4">
                {(ticket.messages || []).length > 0 ? (
                  ticket.messages.map((msg) => {
                    const isAdmin = msg.authorType === "ADMIN";

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[92%] rounded-[24px] border p-4 shadow-sm md:max-w-[80%] ${
                            isAdmin
                              ? "border-blue-100 bg-blue-50"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-bold text-slate-800">
                              {messageAuthor(msg)}
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                              {formatDateTime(msg.createdAt)}
                            </p>
                          </div>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                            {msg.body}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                    Henüz mesaj bulunmuyor.
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Yanıt gönder"
              subtitle="Destek kaydına yeni mesaj ekleyin"
            >
              <form onSubmit={handleSendReply} className="space-y-4">
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={5}
                  placeholder="Yanıtınızı detaylı şekilde yazın..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/70"
                />

                <button
                  type="submit"
                  disabled={!replyBody.trim() || sending}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {sending ? "Gönderiliyor..." : "Yanıtı Gönder"}
                </button>
              </form>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Talep bilgileri">
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Talep No
                  </p>
                  <p className="mt-1 font-medium text-slate-800">{ticket.id}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Kategori
                  </p>
                  <p className="mt-1 font-medium text-slate-800">{categoryLabel}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Durum
                  </p>
                  <p className="mt-1 font-medium text-slate-800">{statusLabel}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Açılış Tarihi
                  </p>
                  <p className="mt-1 font-medium text-slate-800">
                    {formatDateTime(ticket.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Son Güncelleme
                  </p>
                  <p className="mt-1 font-medium text-slate-800">
                    {formatDateTime(ticket.updatedAt)}
                  </p>
                </div>
              </div>
            </SectionCard>

            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-blue-700 to-slate-900 text-white shadow-[0_14px_35px_rgba(15,23,42,0.10)]">
              <div className="p-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <Sparkles className="h-4 w-4" />
                  Bilgilendirme
                </div>
                <p className="text-sm leading-7 text-blue-100/90">
                  Destek ekibi tarafından gönderilen tüm yanıtlar bu sayfada
                  görüntülenir. Yeni mesaj gönderdiğinizde kayıt yeniden incelemeye
                  alınabilir.
                </p>
              </div>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="flex gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">İpucu</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Yeni yanıtınızda ekran adı, hata adımı ve beklenen sonucu açıkça
                    yazmanız çözüm süresini kısaltır.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}