"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import FihristForm from "../_components/FihristForm";

export default function FihristNewPage() {
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
          <span className="font-medium text-slate-700">Yeni kart</span>
        </div>
        <FihristForm mode="create" />
      </div>
    </div>
  );
}
