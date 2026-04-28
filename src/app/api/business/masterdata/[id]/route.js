import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toStr(v) {
  return (v ?? "").toString().trim();
}

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  if (!["BUSINESS", "ADMIN"].includes(session.user.role)) return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  const businessId = session.user.businessId;
  if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
  return { businessId };
}

export async function PATCH(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = typeof params?.then === "function" ? await params : params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await prisma.business_masterdata_entry.findFirst({
    where: { id, businessId: auth.businessId },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ message: "Kayıt bulunamadı." }, { status: 404 });

  const body = await req.json();
  const name = body?.name !== undefined ? toStr(body.name) : undefined;
  const order = body?.order !== undefined ? Number(body.order) : undefined;

  const data = {};
  if (name !== undefined) {
    if (!name || name.length < 1) {
      return NextResponse.json({ message: "Tanım adı boş olamaz." }, { status: 400 });
    }
    data.name = name;
  }
  if (order !== undefined && Number.isFinite(order)) data.order = order;

  if (Object.keys(data).length === 0) {
    const row = await prisma.business_masterdata_entry.findUnique({ where: { id } });
    return NextResponse.json(row);
  }

  try {
    const updated = await prisma.business_masterdata_entry.update({
      where: { id },
      data,
      select: { id: true, kind: true, name: true, order: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json(updated);
  } catch (e) {
    if (e?.code === "P2002") {
      return NextResponse.json({ message: "Bu isim aynı grupta zaten var." }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = typeof params?.then === "function" ? await params : params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const deleted = await prisma.business_masterdata_entry.deleteMany({
    where: { id, businessId: auth.businessId },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ message: "Kayıt bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ message: "Silindi" });
}
