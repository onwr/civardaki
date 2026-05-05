import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getBusinessId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) return null;
  return session.user.businessId;
}

export async function PATCH(req, { params }) {
  try {
    const businessId = await getBusinessId();
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const accountId = resolved?.id;
    if (!accountId) {
      return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 400 });
    }

    const body = await req.json();
    const existing = await prisma.cash_account.findFirst({
      where: { id: accountId, businessId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });
    }

    const updated = await prisma.cash_account.update({
      where: { id: accountId },
      data: {
        ...(body?.name !== undefined ? { name: String(body.name || "").trim() || existing.name } : {}),
        ...(body?.labelColor !== undefined ? { labelColor: body.labelColor || null } : {}),
        ...(body?.accountNo !== undefined ? { accountNo: body.accountNo || null } : {}),
        ...(body?.balance !== undefined
          ? { balance: Number.isFinite(Number(body.balance)) ? Number(body.balance) : existing.balance }
          : {}),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Account PATCH Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const businessId = await getBusinessId();
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const accountId = resolved?.id;
    if (!accountId) {
      return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 400 });
    }

    const existing = await prisma.cash_account.findFirst({
      where: { id: accountId, businessId },
    });
    
    if (!existing) {
      return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });
    }

    await prisma.cash_account.delete({
      where: { id: accountId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Account DELETE Error:", error);
    
    // Check if it's a foreign key constraint error (P2003 in Prisma)
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "Bu hesaba bağlı satış, alış veya başka kayıtlar olduğu için hesap silinemiyor." }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Hesap silinirken bir hata oluştu." }, { status: 500 });
  }
}
