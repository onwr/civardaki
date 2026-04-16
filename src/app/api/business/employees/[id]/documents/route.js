import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function getEmployeeDocumentDelegate() {
  return prisma.employee_document || prisma.employeeDocument || null;
}

async function getContext(params) {
  const session = await getServerSession(authOptions);
  const businessId = session?.user?.businessId;
  if (!businessId) return { error: "Unauthorized", status: 401 };

  const resolved = await params;
  const employeeId = resolved?.id;
  if (!employeeId) return { error: "Çalışan bulunamadı.", status: 400 };

  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, businessId },
    select: { id: true },
  });
  if (!employee) return { error: "Çalışan bulunamadı.", status: 404 };

  return { businessId, employeeId };
}

export async function GET(_req, { params }) {
  try {
    const delegate = getEmployeeDocumentDelegate();
    if (!delegate) {
      return NextResponse.json(
        { error: "Çalışan evrak modeli hazır değil. Sunucuyu yeniden başlatın ve prisma generate çalıştırın." },
        { status: 500 },
      );
    }

    const ctx = await getContext(params);
    if (ctx.error) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }

    const items = await delegate.findMany({
      where: { businessId: ctx.businessId, employeeId: ctx.employeeId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Employee documents GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const delegate = getEmployeeDocumentDelegate();
    if (!delegate) {
      return NextResponse.json(
        { error: "Çalışan evrak modeli hazır değil. Sunucuyu yeniden başlatın ve prisma generate çalıştırın." },
        { status: 500 },
      );
    }

    const ctx = await getContext(params);
    if (ctx.error) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }

    const body = await req.json().catch(() => ({}));
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

    const created = await delegate.create({
      data: {
        businessId: ctx.businessId,
        employeeId: ctx.employeeId,
        title: title || "Belge",
        url,
        fileId,
        mimeType,
        sizeBytes,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Employee documents POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
