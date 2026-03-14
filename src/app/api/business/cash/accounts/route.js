import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    const { name, type, balance } = body;

    const account = await prisma.cash_account.create({
      data: {
        id: crypto.randomUUID(),
        businessId: session.user.businessId,
        name,
        type: type || "CASH",
        balance: parseFloat(balance) || 0
      }
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error("Accounts POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
