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

async function getDimension(id, businessId) {
  return prisma.productvariantdimension.findFirst({
    where: { id, businessId },
    include: { values: { orderBy: [{ order: "asc" }, { value: "asc" }] } },
  });
}

/** PATCH */
export async function PATCH(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = typeof params?.then === "function" ? await params : params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getDimension(id, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Varyant bulunamadı." }, { status: 404 });

  const body = await req.json();
  const name = body?.name !== undefined ? toStr(body.name) : undefined;
  const order = body?.order !== undefined ? Number(body.order) : undefined;

  const data = {};
  if (name !== undefined) {
    if (!name || name.length < 1) {
      return NextResponse.json({ message: "Varyant adı boş olamaz." }, { status: 400 });
    }
    data.name = name;
  }
  if (order !== undefined && Number.isFinite(order)) data.order = order;

  if (Object.keys(data).length === 0) {
    return NextResponse.json(existing);
  }

  const updated = await prisma.productvariantdimension.update({
    where: { id },
    data,
    include: { values: { orderBy: [{ order: "asc" }, { value: "asc" }] } },
  });

  return NextResponse.json(updated);
}

/** DELETE */
export async function DELETE(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = typeof params?.then === "function" ? await params : params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await prisma.productvariantdimension.findFirst({
    where: { id, businessId: auth.businessId },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ message: "Varyant bulunamadı." }, { status: 404 });

  await prisma.productvariantdimension.delete({ where: { id } });
  return NextResponse.json({ message: "Silindi" });
}
