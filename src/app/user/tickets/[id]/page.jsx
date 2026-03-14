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
  if (msg.authorType === "USER") return "Siz";
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

export default function UserTicketDetailPage() {
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
      const res = await fetch(`/api/user/tickets/${id}`);
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
      const res = await fetch(`/api/user/tickets/${id}/messages`, {
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
      <div className="space-y-6">
        <Link
          href="/user/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Taleplere dön
        </Link>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Geçersiz talep.
        </div>
      </div>
    );
  }

  if (loading && !ticket) {
    return (
      <div className="space-y-6">
        <Link
          href="/user/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Taleplere dön
        </Link>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="h-40 animate-pulse bg-slate-100" />
          <div className="space-y-4 p-6">
            <div className="h-6 w-1/2 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-4 w-1/3 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Link
          href="/user/tickets"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Taleplere dön
        </Link>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Talep bulunamadı.
        </div>
      </div>
    );
  }

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
              Kullanıcı Destek Talebi
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {ticket.subject}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/80 md:text-[15px]">
                Destek talebinizle ilgili tüm yanıtları burada görebilir, ek
                açıklama veya yeni bilgi paylaşabilirsiniz.
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
                {categoryLabel}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <ShieldCheck className="mb-2 h-5 w-5 text-white" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                Durum
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {statusLabel}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <Clock3 className="mb-2 h-5 w-5 text-white" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                Oluşturulma
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {formatDateTime(ticket.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MessageSquare className="h-4 w-4 text-[#004aad]" />
              Talep Özeti
            </div>

            <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {ticket.body}
              </p>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Mesaj Geçmişi
              </h2>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                  ticket.status,
                )}`}
              >
                {statusLabel}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {(ticket.messages || []).length > 0 ? (
                ticket.messages.map((msg) => {
                  const isAdmin = msg.authorType === "ADMIN";

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[90%] rounded-[24px] border p-4 shadow-sm md:max-w-[80%] ${
                          isAdmin
                            ? "border-blue-100 bg-blue-50"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {messageAuthor(msg)}
                          </p>
                          <p className="text-xs text-slate-500">
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
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h3 className="text-base font-semibold text-slate-900">
              Yanıt Gönder
            </h3>

            <form onSubmit={handleSendReply} className="mt-4 space-y-4">
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                rows={5}
                placeholder="Yanıtınızı detaylı şekilde yazın..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 resize-none focus:border-[#004aad] focus:bg-white focus:ring-4 focus:ring-[#004aad]/10"
              />

              <button
                type="submit"
                disabled={!replyBody.trim() || sending}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#004aad] px-5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {sending ? "Gönderiliyor..." : "Yanıtı Gönder"}
              </button>
            </form>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Talep Bilgileri
            </h2>
            <div className="mt-4 space-y-4 text-sm">
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
                <p className="mt-1 font-medium text-slate-800">
                  {categoryLabel}
                </p>
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
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Bilgilendirme
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Destek ekibinden gelen tüm güncellemeleri burada
              görüntüleyebilirsiniz. Ek bilgi paylaşmanız gerekiyorsa aşağıdaki
              yanıt alanını kullanabilirsiniz.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
