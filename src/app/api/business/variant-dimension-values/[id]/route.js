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

async function getValueForBusiness(valueId, businessId) {
  return prisma.productvariantdimensionvalue.findFirst({
    where: {
      id: valueId,
      dimension: { businessId },
    },
    include: { dimension: { select: { id: true, name: true, businessId: true } } },
  });
}

/** PATCH */
export async function PATCH(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = typeof params?.then === "function" ? await params : params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getValueForBusiness(id, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Değer bulunamadı." }, { status: 404 });

  const body = await req.json();
  const value = body?.value !== undefined ? toStr(body.value) : undefined;
  const order = body?.order !== undefined ? Number(body.order) : undefined;

  const data = {};
  if (value !== undefined) {
    if (!value || value.length < 1) {
      return NextResponse.json({ message: "Değer boş olamaz." }, { status: 400 });
    }
    data.value = value;
  }
  if (order !== undefined && Number.isFinite(order)) data.order = order;

  if (Object.keys(data).length === 0) {
    return NextResponse.json(existing);
  }

  try {
    const updated = await prisma.productvariantdimensionvalue.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    if (e?.code === "P2002") {
      return NextResponse.json({ message: "Bu değer bu varyant altında zaten var." }, { status: 400 });
    }
    throw e;
  }
}

/** DELETE */
export async function DELETE(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = typeof params?.then === "function" ? await params : params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getValueForBusiness(id, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Değer bulunamadı." }, { status: 404 });

  await prisma.productvariantdimensionvalue.delete({ where: { id } });
  return NextResponse.json({ message: "Silindi" });
}
