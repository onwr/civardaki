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
    const customerClass = searchParams.get("class") || "all";
    const q = (searchParams.get("q") || "").trim();

    const where = { businessId };
    if (status === "active") where.isActive = true;
    else if (status === "inactive") where.isActive = false;
    // status === "all" → isActive filtresi yok

    if (customerClass && customerClass !== "all") {
      where.customerClass = customerClass;
    }

    if (q.length >= 3) {
      where.name = { contains: q };
    }

    const rows = await prisma.business_customer.findMany({
      where,
      orderBy: { name: "asc" },
      take: 2000,
    });

    const customers = rows.map((r) => ({
      id: r.id,
      name: r.name,
      isActive: r.isActive,
      customerClass: r.customerClass,
      openBalance: Number(r.openBalance),
      checkNoteBalance: Number(r.checkNoteBalance),
      integrationLabel: r.integrationLabel,
    }));

    const totalAll = await prisma.business_customer.count({ where: { businessId } });

    return NextResponse.json({
      customers,
      totalCount: totalAll,
      filteredCount: customers.length,
    });
  } catch (e) {
    console.error("Customers GET:", e);
    const code = e?.code;
    const msg = String(e?.message || "");
    const missingTable =
      code === "P2021" ||
      (/business_customer/i.test(msg) && /doesn't exist|does not exist|Unknown table/i.test(msg));
    let error = "Sunucu hatası";
    if (missingTable) {
      error =
        "Müşteri tablosu veritabanında yok. Proje klasöründe çalıştırın: npx prisma migrate deploy (veya geliştirme için: npx prisma migrate dev)";
    } else if (process.env.NODE_ENV === "development") {
      error = msg.slice(0, 200) || error;
    }
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

    const created = await prisma.business_customer.create({
      data: {
        businessId,
        name: (body.name || "Yeni müşteri").trim().slice(0, 500),
        isActive: body.isActive !== false,
        customerClass: (body.customerClass || "GENEL").slice(0, 64),
        openBalance: toNum(body.openBalance),
        checkNoteBalance: toNum(body.checkNoteBalance),
        integrationLabel: body.integrationLabel?.slice(0, 64) || null,
        imageUrl: body.imageUrl || null,
        email: body.email || null,
        mobilePhone: body.mobilePhone || null,
        phone2: body.phone2 || null,
        otherAccess: body.otherAccess || null,
        authorizedPerson: body.authorizedPerson || null,
        address: body.address || null,
        shippingAddresses: body.shippingAddresses ?? undefined,
        taxOffice: body.taxOffice || null,
        taxId: body.taxId || null,
        taxExempt: !!body.taxExempt,
        bankInfo: body.bankInfo || null,
        currency: (body.currency || "TRY").slice(0, 8),
        riskLimit: toNum(body.riskLimit),
        maturityDays:
          body.maturityDays != null && body.maturityDays !== ""
            ? parseInt(body.maturityDays, 10) || null
            : null,
        fixedDiscountPct:
          body.fixedDiscountPct != null && body.fixedDiscountPct !== ""
            ? toNum(body.fixedDiscountPct)
            : null,
        priceListMode: body.priceListMode || null,
        openingBalance: toNum(body.openingBalance),
        otherNotes: body.otherNotes || null,
        branchesJson: body.branchesJson ?? undefined,
      },
    });

    return NextResponse.json({ customer: created });
  } catch (e) {
    console.error("Customers POST:", e);
    const msg = String(e?.message || "");
    const missingTable =
      e?.code === "P2021" || /business_customer/i.test(msg);
    return NextResponse.json(
      {
        error: missingTable
          ? "Önce veritabanı migration çalıştırın: npx prisma migrate dev"
          : process.env.NODE_ENV === "development"
            ? msg.slice(0, 200)
            : "Kayıt başarısız",
      },
      { status: 500 }
    );
  }
}
