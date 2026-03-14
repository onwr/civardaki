"use client";

import { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BusinessListClient from "@/components/home/BusinessListClient";

function SearchContent() {
  return (
    <BusinessListClient syncFromUrl showSeoSection={false} />
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      {/* Sabit header altında kalmaması için üst boşluk (h-16 + güvenlik) */}
      <div className="pt-20">
        <Suspense fallback={
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="h-64 rounded-3xl bg-white border border-slate-100 animate-pulse" />
          </div>
        }>
          <SearchContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
