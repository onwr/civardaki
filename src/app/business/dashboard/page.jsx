"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function BusinessDashboardEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.replace("/business/login?callbackUrl=/business/dashboard");
      return;
    }

    if (session.user.role !== "BUSINESS") {
      router.replace("/user/dashboard");
      return;
    }

    const tab = searchParams.get("tab");
    if (tab === "reviews") {
      router.replace("/business/reviews");
      return;
    }

    if (session.user.businessSlug) {
      const qs = searchParams.toString();
      const path = `/business/dashboard/${session.user.businessSlug}${qs ? `?${qs}` : ""}`;
      router.replace(path);
      return;
    }

    router.replace("/business/onboarding");
  }, [status, session, router, searchParams]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#004aad]/20 border-t-[#004aad] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">
          Panel hazirlaniyor...
        </p>
      </div>
    </div>
  );
}
