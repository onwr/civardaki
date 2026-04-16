import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function getCustomerDocumentDelegate() {
  return prisma.customer_document || prisma.customerDocument || null;
}

export async function DELETE(_req, { params }) {
  try {
    const customerDocument = getCustomerDocumentDelegate();
    if (!customerDocument) {
      return NextResponse.json(
        { error: "Müşteri evrak modeli hazır değil. Sunucuyu yeniden başlatın." },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const customerId = resolved?.id;
    const docId = resolved?.docId;
    if (!customerId || !docId) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const row = await customerDocument.findFirst({
      where: {
        id: docId,
        customerId,
        businessId,
      },
      select: { id: true },
    });
    if (!row) {
      return NextResponse.json({ error: "Belge bulunamadı." }, { status: 404 });
    }

    await customerDocument.delete({ where: { id: docId } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Customer documents DELETE Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

