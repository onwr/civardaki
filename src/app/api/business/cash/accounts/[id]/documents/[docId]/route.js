import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const accountId = resolved?.id;
    const docId = resolved?.docId;

    if (!accountId || !docId) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const row = await prisma.cash_account_document.findFirst({
      where: {
        id: docId,
        accountId,
        businessId,
      },
      select: { id: true },
    });

    if (!row) {
      return NextResponse.json({ error: "Belge bulunamadı." }, { status: 404 });
    }

    await prisma.cash_account_document.delete({ where: { id: docId } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Account documents DELETE Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

