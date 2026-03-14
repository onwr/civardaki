"use client";

import { Suspense } from "react";
import BusinessesContent from "./BusinessesContent";

export default function BusinessesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#004aad]/20 border-t-[#004aad] rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold animate-pulse">İşletmeler Yükleniyor...</p>
        </div>
      </div>
    }>
      <BusinessesContent />
    </Suspense>
  );
}
