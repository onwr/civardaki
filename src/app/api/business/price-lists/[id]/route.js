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
  if (session.user.role !== "BUSINESS") return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  const businessId = session.user.businessId;
  if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
  return { businessId };
}

async function getListAndCheck(id, businessId) {
  const l = await prisma.pricelist.findFirst({
    where: { id, businessId },
    include: { items: { select: { productId: true, order: true } }, _count: { select: { items: true } } },
  });
  return l;
}

/** GET - single price list with productIds */
export async function GET(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const list = await getListAndCheck(id, auth.businessId);
  if (!list) return NextResponse.json({ message: "Fiyat listesi bulunamadı." }, { status: 404 });

  const productIds = list.items.sort((a, b) => a.order - b.order).map((i) => i.productId);

  return NextResponse.json({
    id: list.id,
    name: list.name,
    description: list.description,
    customerGroup: list.customerGroup,
    discountRate: list.discountRate,
    validFrom: list.validFrom,
    validUntil: list.validUntil,
    isActive: list.isActive,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    productCount: list._count.items,
    productIds,
  });
}

/** PATCH - update price list */
export async function PATCH(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getListAndCheck(id, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Fiyat listesi bulunamadı." }, { status: 404 });

  const body = await req.json();
  const name = body?.name !== undefined ? toStr(body.name) : undefined;
  const description = body?.description !== undefined ? (toStr(body.description) || null) : undefined;
  const customerGroup = body?.customerGroup !== undefined ? toStr(body.customerGroup) || "ALL" : undefined;
  const discountRate = body?.discountRate !== undefined ? Math.max(0, Math.min(100, Number(body.discountRate) || 0)) : undefined;
  const validFrom = body?.validFrom !== undefined ? new Date(body.validFrom) : undefined;
  const validUntil = body?.validUntil !== undefined ? new Date(body.validUntil) : undefined;
  const isActive = typeof body?.isActive === "boolean" ? body.isActive : undefined;
  const productIds = Array.isArray(body?.productIds) ? body.productIds.filter((i) => typeof i === "string" && i) : undefined;

  if (name !== undefined && name.length < 2) return NextResponse.json({ message: "Fiyat listesi adı en az 2 karakter olmalı." }, { status: 400 });

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (customerGroup !== undefined) updateData.customerGroup = customerGroup;
  if (discountRate !== undefined) updateData.discountRate = discountRate;
  if (validFrom !== undefined) updateData.validFrom = validFrom;
  if (validUntil !== undefined) updateData.validUntil = validUntil;
  if (isActive !== undefined) updateData.isActive = isActive;

  if (productIds !== undefined) {
    const businessProducts = await prisma.product.findMany({
      where: { businessId: auth.businessId, id: { in: productIds } },
      select: { id: true },
    });
    const validIds = businessProducts.map((p) => p.id);
    await prisma.pricelistitem.deleteMany({ where: { pricelistId: id } });
    await prisma.pricelistitem.createMany({
      data: validIds.map((productId, index) => ({ pricelistId: id, productId, order: index })),
    });
  }

  const updated = await prisma.pricelist.update({
    where: { id },
    data: updateData,
    include: { _count: { select: { items: true } } },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    description: updated.description,
    customerGroup: updated.customerGroup,
    discountRate: updated.discountRate,
    validFrom: updated.validFrom,
    validUntil: updated.validUntil,
    isActive: updated.isActive,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    productCount: updated._count.items,
  });
}

/** DELETE - delete price list */
export async function DELETE(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getListAndCheck(id, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Fiyat listesi bulunamadı." }, { status: 404 });

  await prisma.pricelist.delete({ where: { id } });
  return NextResponse.json({ message: "Silindi" });
}
