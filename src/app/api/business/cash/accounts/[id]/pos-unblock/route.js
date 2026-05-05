import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const posAccountId = resolved?.id;
    if (!posAccountId) {
      return NextResponse.json({ error: "POS hesabı bulunamadı." }, { status: 400 });
    }

    const body = await req.json();
    const transferAccountId = body?.transferAccountId;
    const blockedAmount = toNum(body?.blockedAmount);
    const commissionRate = Math.max(0, toNum(body?.commissionRate));
    const commissionCostAccount = body?.commissionCostAccount || null;
    const date = body?.date ? new Date(body.date) : new Date();

    if (!(blockedAmount > 0)) {
      return NextResponse.json({ error: "Çözülen tutar geçersiz." }, { status: 400 });
    }
    if (!transferAccountId) {
      return NextResponse.json({ error: "Aktarılacak banka hesabı zorunlu." }, { status: 400 });
    }

    const [posAccount, bankAccount] = await Promise.all([
      prisma.cash_account.findFirst({
        where: { id: posAccountId, businessId },
      }),
      prisma.cash_account.findFirst({
        where: { id: transferAccountId, businessId, type: "BANK" },
      }),
    ]);

    if (!posAccount || posAccount.type !== "POS") {
      return NextResponse.json({ error: "Geçerli bir POS hesabı bulunamadı." }, { status: 404 });
    }
    if (!bankAccount) {
      return NextResponse.json({ error: "Geçerli bir banka hesabı seçin." }, { status: 404 });
    }

    const commissionAmountRaw = (blockedAmount * commissionRate) / 100;
    const commissionAmount = Math.round(commissionAmountRaw * 100) / 100;
    const netAmount = Math.round(Math.max(0, blockedAmount - commissionAmount) * 100) / 100;

    await prisma.$transaction(async (tx) => {
      if (netAmount > 0) {
        await tx.cash_transaction.create({
          data: {
            id: crypto.randomUUID(),
            businessId,
            accountId: posAccountId,
            toAccountId: transferAccountId,
            type: "TRANSFER",
            amount: netAmount,
            category: "POS_BLOCKAGE_NET",
            description: "POS bloke çözülmesi - net aktarım",
            date,
          },
        });

        await tx.cash_account.update({
          where: { id: posAccountId },
          data: { balance: { decrement: netAmount } },
        });
        await tx.cash_account.update({
          where: { id: transferAccountId },
          data: { balance: { increment: netAmount } },
        });
      }

      if (commissionAmount > 0) {
        await tx.cash_transaction.create({
          data: {
            id: crypto.randomUUID(),
            businessId,
            accountId: posAccountId,
            type: "EXPENSE",
            amount: commissionAmount,
            category: commissionCostAccount
              ? `POS_BLOCKAGE_COST_${commissionCostAccount}`
              : "POS_BLOCKAGE_COST",
            description: "POS bloke çözülmesi - komisyon masrafı",
            date,
          },
        });

        await tx.cash_account.update({
          where: { id: posAccountId },
          data: { balance: { decrement: commissionAmount } },
        });
      }
    });

    return NextResponse.json(
      {
        ok: true,
        blockedAmount,
        commissionRate,
        commissionAmount,
        netAmount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("POS unblock POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

