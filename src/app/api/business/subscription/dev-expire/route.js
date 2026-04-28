import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function isEnabled() {
  return process.env.SUBSCRIPTION_GRANT_MONTH_ENABLED === "1";
}

export async function POST() {
  try {
    if (!isEnabled()) {
      return NextResponse.json({ ok: false, error: "Bu işlem kapalı." }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user || !["BUSINESS", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return NextResponse.json({ ok: false, error: "Business not found" }, { status: 404 });
    }

    const existing = await prisma.businesssubscription.findUnique({
      where: { businessId },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: "Abonelik bulunamadı." }, { status: 404 });
    }

    const past = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await prisma.businesssubscription.update({
      where: { businessId },
      data: {
        status: "EXPIRED",
        expiresAt: past,
      },
    });

    return NextResponse.json({ ok: true, expiresAt: past.toISOString() }, { status: 200 });
  } catch (e) {
    console.error("[dev-expire] error:", e);
    return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
  }
}
