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
    if (!session?.user || session.user.role !== "BUSINESS") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const businessId = session.user.businessId;
    if (!businessId) {
      return NextResponse.json({ ok: false, error: "Business not found" }, { status: 404 });
    }

    const now = new Date();

    const existing = await prisma.businesssubscription.findUnique({
      where: { businessId },
    });

    let base = now;
    if (existing?.expiresAt && existing.expiresAt > now) base = existing.expiresAt;

    const newExpiresAt = new Date(base);
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    await prisma.$transaction(async (tx) => {
      await tx.businesssubscription.upsert({
        where: { businessId },
        create: {
          businessId,
          status: "ACTIVE",
          plan: "BASIC",
          startedAt: now,
          expiresAt: newExpiresAt,
        },
        update: {
          status: "ACTIVE",
          startedAt: existing?.startedAt && existing.startedAt < now ? existing.startedAt : now,
          expiresAt: newExpiresAt,
        },
      });

      await tx.subscription_payment.create({
        data: {
          businessId,
          subscriptionId: existing?.id ?? null,
          amount: 0,
          currency: "TRY",
          status: "COMPLETED",
          provider: "MANUAL",
          providerReference: `grant-month-${now.getTime()}`,
          paidAt: now,
          metadata: {
            reason: "TEMP_MANUAL_GRANT",
            months: 1,
            days: 30,
          },
        },
      });

      await tx.businessevent.create({
        data: {
          businessId,
          type: "SUBSCRIPTION_RENEWED",
        },
      });
    });

    return NextResponse.json(
      { ok: true, expiresAt: newExpiresAt.toISOString() },
      { status: 200 }
    );
  } catch (e) {
    console.error("[grant-month] error:", e);
    return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
  }
}

