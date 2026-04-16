import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getBusinessAndAccountId(params) {
  const session = await getServerSession(authOptions);
  const businessId = session?.user?.businessId;
  if (!businessId) return { error: "Unauthorized", status: 401 };

  const resolved = await params;
  const accountId = resolved?.id;
  if (!accountId) return { error: "Hesap bulunamadı.", status: 400 };

  const account = await prisma.cash_account.findFirst({
    where: { id: accountId, businessId },
    select: { id: true, businessId: true },
  });
  if (!account) return { error: "Hesap bulunamadı.", status: 404 };

  return { businessId, accountId };
}

export async function GET(_req, { params }) {
  try {
    const context = await getBusinessAndAccountId(params);
    if (context.error) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const items = await prisma.cash_account_document.findMany({
      where: {
        businessId: context.businessId,
        accountId: context.accountId,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Account documents GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const context = await getBusinessAndAccountId(params);
    if (context.error) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const body = await req.json();
    const title = String(body?.title || "").trim();
    const url = String(body?.url || "").trim();
    const fileId = body?.fileId ? String(body.fileId).trim() : null;
    const mimeType = body?.mimeType ? String(body.mimeType).trim() : null;
    const sizeBytes =
      body?.sizeBytes != null && Number.isFinite(Number(body.sizeBytes))
        ? Number(body.sizeBytes)
        : null;

    if (!url) {
      return NextResponse.json({ error: "Dosya URL zorunludur." }, { status: 400 });
    }

    const created = await prisma.cash_account_document.create({
      data: {
        businessId: context.businessId,
        accountId: context.accountId,
        title: title || "Belge",
        url,
        fileId,
        mimeType,
        sizeBytes,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Account documents POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

