import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const VALID_ACCOUNT_TYPES = ["CASH", "BANK", "ESCROW", "POS", "CREDIT_CARD", "PARTNER", "CREDIT"];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.cash_account.findMany({
      where: { businessId: session.user.businessId },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Accounts GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, balance, currency, accountNo, labelColor } = body;

    const accountType = type && VALID_ACCOUNT_TYPES.includes(type) ? type : "CASH";

    const account = await prisma.cash_account.create({
      data: {
        id: crypto.randomUUID(),
        businessId: session.user.businessId,
        name: name || "Hesap",
        type: accountType,
        balance: parseFloat(balance) ?? 0,
        currency: currency && ["TRY", "EUR", "USD"].includes(currency) ? currency : "TRY",
        accountNo: accountNo && String(accountNo).trim() ? String(accountNo).trim() : null,
        labelColor: labelColor && String(labelColor).trim() ? String(labelColor).trim() : null
      }
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error("Accounts POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
