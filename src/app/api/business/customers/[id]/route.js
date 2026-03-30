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
  const row = await prisma.business_customer.findFirst({
    where: { id, businessId },
  });
  return row;
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
      customer: {
        ...row,
        openBalance: Number(row.openBalance),
        checkNoteBalance: Number(row.checkNoteBalance),
        riskLimit: Number(row.riskLimit),
        openingBalance: Number(row.openingBalance),
        fixedDiscountPct: row.fixedDiscountPct != null ? Number(row.fixedDiscountPct) : null,
      },
    });
  } catch (e) {
    console.error("Customer GET:", e);
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
    if (body.customerClass !== undefined) data.customerClass = String(body.customerClass || "GENEL").slice(0, 64);
    if (body.openBalance !== undefined) data.openBalance = toNum(body.openBalance);
    if (body.checkNoteBalance !== undefined) data.checkNoteBalance = toNum(body.checkNoteBalance);
    if (body.integrationLabel !== undefined) data.integrationLabel = body.integrationLabel?.slice(0, 64) || null;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl || null;
    if (body.email !== undefined) data.email = body.email || null;
    if (body.mobilePhone !== undefined) data.mobilePhone = body.mobilePhone || null;
    if (body.phone2 !== undefined) data.phone2 = body.phone2 || null;
    if (body.otherAccess !== undefined) data.otherAccess = body.otherAccess || null;
    if (body.authorizedPerson !== undefined) data.authorizedPerson = body.authorizedPerson || null;
    if (body.address !== undefined) data.address = body.address || null;
    if (body.shippingAddresses !== undefined) data.shippingAddresses = body.shippingAddresses;
    if (body.taxOffice !== undefined) data.taxOffice = body.taxOffice || null;
    if (body.taxId !== undefined) data.taxId = body.taxId || null;
    if (body.taxExempt !== undefined) data.taxExempt = !!body.taxExempt;
    if (body.bankInfo !== undefined) data.bankInfo = body.bankInfo || null;
    if (body.currency !== undefined) data.currency = String(body.currency || "TRY").slice(0, 8);
    if (body.riskLimit !== undefined) data.riskLimit = toNum(body.riskLimit);
    if (body.maturityDays !== undefined) {
      data.maturityDays =
        body.maturityDays != null && body.maturityDays !== ""
          ? parseInt(body.maturityDays, 10) || null
          : null;
    }
    if (body.fixedDiscountPct !== undefined) {
      data.fixedDiscountPct =
        body.fixedDiscountPct != null && body.fixedDiscountPct !== ""
          ? toNum(body.fixedDiscountPct)
          : null;
    }
    if (body.priceListMode !== undefined) data.priceListMode = body.priceListMode || null;
    if (body.openingBalance !== undefined) data.openingBalance = toNum(body.openingBalance);
    if (body.otherNotes !== undefined) data.otherNotes = body.otherNotes || null;
    if (body.branchesJson !== undefined) data.branchesJson = body.branchesJson;

    const updated = await prisma.business_customer.update({
      where: { id },
      data,
    });

    return NextResponse.json({ customer: updated });
  } catch (e) {
    console.error("Customer PATCH:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
