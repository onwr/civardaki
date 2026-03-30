import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toStr(v) { return (v ?? "").toString().trim(); }

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 })};
  if (session.user.role !== "BUSINESS") return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 })};
  const businessId = session.user.businessId;
  if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 })};
  return { businessId };
}

async function getWarehouseAndCheck(id, businessId) {
  return prisma.warehouse.findFirst({
    where: { id, businessId },
  });
}

/** GET - single warehouse */
export async function GET(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const wh = await getWarehouseAndCheck(id, auth.businessId);
  if (!wh) return NextResponse.json({ message: "Depo bulunamadı." }, { status: 404 });

  return NextResponse.json(wh);
}

/** PATCH - update warehouse */
export async function PATCH(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getWarehouseAndCheck(id, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Depo bulunamadı." }, { status: 404 });

  const body = await req.json();
  const name = body?.name !== undefined ? toStr(body.name) : undefined;
  const address = body?.address !== undefined ? (toStr(body.address) || null) : undefined;
  const capacity = body?.capacity !== undefined ? (body.capacity === null || body.capacity === "" ? null : Math.max(0, parseInt(String(body.capacity), 10))) : undefined;
  const currentStock = body?.currentStock !== undefined ? Math.max(0, parseInt(String(body.currentStock), 10)) : undefined;
  const manager = body?.manager !== undefined ? (toStr(body.manager) || null) : undefined;
  const phone = body?.phone !== undefined ? (toStr(body.phone) || null) : undefined;
  const isActive = typeof body?.isActive === "boolean" ? body.isActive : undefined;

  if (name !== undefined && name.length < 2) return NextResponse.json({ message: "Depo adı en az 2 karakter olmalı." }, { status: 400 });

  const updated = await prisma.warehouse.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(capacity !== undefined ? { capacity } : {}),
      ...(currentStock !== undefined ? { currentStock } : {}),
      ...(manager !== undefined ? { manager } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
  });

  return NextResponse.json(updated);
}

/** DELETE */
export async function DELETE(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getWarehouseAndCheck(id, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Depo bulunamadı." }, { status: 404 });

  await prisma.warehouse.delete({ where: { id } });
  return NextResponse.json({ message: "Silindi" });
}
