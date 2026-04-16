import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function getEmployeeDocumentDelegate() {
  return prisma.employee_document || prisma.employeeDocument || null;
}

export async function DELETE(_req, { params }) {
  try {
    const delegate = getEmployeeDocumentDelegate();
    if (!delegate) {
      return NextResponse.json(
        { error: "Çalışan evrak modeli hazır değil. Sunucuyu yeniden başlatın ve prisma generate çalıştırın." },
        { status: 500 },
      );
    }

    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const employeeId = resolved?.id;
    const docId = resolved?.docId;
    if (!employeeId || !docId) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const row = await delegate.findFirst({
      where: {
        id: docId,
        employeeId,
        businessId,
      },
      select: { id: true },
    });
    if (!row) {
      return NextResponse.json({ error: "Belge bulunamadı." }, { status: 404 });
    }

    await delegate.delete({ where: { id: docId } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Employee documents DELETE Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
