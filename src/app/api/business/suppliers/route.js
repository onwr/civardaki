import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function toNum(v) {
  if (v === null || v === undefined || v === "") return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";
    const q = (searchParams.get("q") || "").trim();

    const where = { businessId };
    if (status === "active") where.isActive = true;
    else if (status === "inactive") where.isActive = false;

    if (q.length >= 3) {
      where.name = { contains: q };
    }

    const rows = await prisma.business_supplier.findMany({
      where,
      orderBy: { name: "asc" },
      take: 2000,
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    const suppliers = rows.map((r) => ({
      id: r.id,
      name: r.name,
      isActive: r.isActive,
      openingBalance: Number(r.openingBalance),
      categoryId: r.categoryId || null,
      categoryName: r.category?.name || null,
    }));

    const totalAll = await prisma.business_supplier.count({ where: { businessId } });

    return NextResponse.json({
      suppliers,
      totalCount: totalAll,
      filteredCount: suppliers.length,
    });
  } catch (e) {
    console.error("Suppliers GET:", e);
    const code = e?.code;
    const msg = String(e?.message || "");
    const missingTable =
      code === "P2021" ||
      (/business_supplier/i.test(msg) && /doesn't exist|does not exist|Unknown table/i.test(msg));
    const error = missingTable
      ? "Tedarikçi tablosu veritabanında yok. npx prisma migrate deploy çalıştırın."
      : process.env.NODE_ENV === "development"
        ? msg.slice(0, 200)
        : "Sunucu hatası";
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;
    const body = await request.json();

    const created = await prisma.business_supplier.create({
      data: {
        businessId,
        name: (body.name || "Yeni tedarikçi").trim().slice(0, 500),
        isActive: body.isActive !== false,
        imageUrl: body.imageUrl || null,
        taxOffice: body.taxOffice || null,
        taxId: body.taxId || null,
        taxExempt: !!body.taxExempt,
        bankInfo: body.bankInfo || null,
        currency: (body.currency || "TRY").slice(0, 8),
        maturityDays:
          body.maturityDays != null && body.maturityDays !== ""
            ? parseInt(body.maturityDays, 10) || null
            : null,
        openingBalance: toNum(body.openingBalance),
        categoryId: body.categoryId || null,
        authorizedPerson: body.authorizedPerson || null,
        email: body.email || null,
        address: body.address || null,
        phone: body.phone || null,
        otherAccess: body.otherAccess || null,
        otherNotes: body.otherNotes || null,
      },
    });

    return NextResponse.json({ supplier: created });
  } catch (e) {
    console.error("Suppliers POST:", e);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? String(e?.message || "").slice(0, 200)
            : "Kayıt başarısız",
      },
      { status: 500 }
    );
  }
}
