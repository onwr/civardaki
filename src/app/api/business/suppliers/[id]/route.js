import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function toNum(v) {
  if (v === null || v === undefined || v === "") return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

async function assertOwn(businessId, id) {
  return prisma.business_supplier.findFirst({
    where: { id, businessId },
    include: {
      category: { select: { id: true, name: true } },
    },
  });
}

export async function GET(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const row = await assertOwn(session.user.businessId, id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      supplier: {
        ...row,
        openingBalance: Number(row.openingBalance),
        categoryId: row.categoryId || null,
        categoryName: row.category?.name || null,
      },
    });
  } catch (e) {
    console.error("Supplier GET:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const existing = await assertOwn(session.user.businessId, id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const data = {};

    if (body.name !== undefined) data.name = String(body.name || "").trim().slice(0, 500) || existing.name;
    if (body.isActive !== undefined) data.isActive = !!body.isActive;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl || null;
    if (body.taxOffice !== undefined) data.taxOffice = body.taxOffice || null;
    if (body.taxId !== undefined) data.taxId = body.taxId || null;
    if (body.taxExempt !== undefined) data.taxExempt = !!body.taxExempt;
    if (body.bankInfo !== undefined) data.bankInfo = body.bankInfo || null;
    if (body.currency !== undefined) data.currency = String(body.currency || "TRY").slice(0, 8);
    if (body.maturityDays !== undefined) {
      data.maturityDays =
        body.maturityDays != null && body.maturityDays !== ""
          ? parseInt(body.maturityDays, 10) || null
          : null;
    }
    if (body.openingBalance !== undefined) data.openingBalance = toNum(body.openingBalance);
    if (body.categoryId !== undefined) data.categoryId = body.categoryId || null;
    if (body.authorizedPerson !== undefined) data.authorizedPerson = body.authorizedPerson || null;
    if (body.email !== undefined) data.email = body.email || null;
    if (body.address !== undefined) data.address = body.address || null;
    if (body.phone !== undefined) data.phone = body.phone || null;
    if (body.otherAccess !== undefined) data.otherAccess = body.otherAccess || null;
    if (body.otherNotes !== undefined) data.otherNotes = body.otherNotes || null;

    const updated = await prisma.business_supplier.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      supplier: {
        ...updated,
        categoryName: updated.category?.name || null,
      },
    });
  } catch (e) {
    console.error("Supplier PATCH:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
