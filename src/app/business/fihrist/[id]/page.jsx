"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, Loader2 } from "lucide-react";
import FihristForm from "../_components/FihristForm";

export default function FihristEditPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [initial, setInitial] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/business/fihrist/${id}`);
        const d = await r.json().catch(() => ({}));
        if (!r.ok) {
          setErr(d.message || "Yüklenemedi.");
          return;
        }
        if (!cancelled) setInitial(d);
      } catch {
        if (!cancelled) setErr("Ağ hatası.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Geçersiz adres.
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-slate-100/80 p-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          {err}
        </div>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        Yükleniyor…
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-100/80 p-4 text-[13px] text-slate-800 antialiased md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link
            href="/business/fihrist"
            className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
          >
            <BookOpen className="h-4 w-4" />
            Fihrist
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">Kart düzenle</span>
        </div>
        <FihristForm mode="edit" entryId={id} initial={initial} />
      </div>
    </div>
  );
}
