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

/** GET - list price lists for business */
export async function GET() {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const lists = await prisma.pricelist.findMany({
    where: { businessId: auth.businessId },
    include: { _count: { select: { items: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const items = lists.map((l) => ({
    id: l.id,
    name: l.name,
    description: l.description,
    customerGroup: l.customerGroup,
    discountRate: l.discountRate,
    validFrom: l.validFrom,
    validUntil: l.validUntil,
    isActive: l.isActive,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
    productCount: l._count.items,
  }));

  return NextResponse.json(items);
}

/** POST - create price list */
export async function POST(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const body = await req.json();
  const name = toStr(body?.name);
  const copyFromId = toStr(body?.copyFromId);
  const description = toStr(body?.description) || null;
  const customerGroup = toStr(body?.customerGroup) || "ALL";
  const discountRate = typeof body?.discountRate === "number" ? Math.max(0, Math.min(100, body.discountRate)) : 0;
  const validFrom = body?.validFrom ? new Date(body.validFrom) : new Date();
  const validUntil = body?.validUntil ? new Date(body.validUntil) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const productIds = Array.isArray(body?.productIds) ? body.productIds.filter((id) => typeof id === "string" && id) : [];

  if (!name || name.length < 2) return NextResponse.json({ message: "Fiyat listesi adı en az 2 karakter olmalı." }, { status: 400 });

  let sourceList = null;
  if (copyFromId) {
    sourceList = await prisma.pricelist.findFirst({
      where: { id: copyFromId, businessId: auth.businessId },
      include: { items: { orderBy: { order: "asc" } } },
    });
    if (!sourceList) return NextResponse.json({ message: "Kopyalanacak liste bulunamadı." }, { status: 404 });
  }

  let itemsCreate = [];
  if (sourceList) {
    itemsCreate = sourceList.items.map((it, index) => ({ productId: it.productId, order: index }));
  } else if (productIds.length) {
    const businessProducts = await prisma.product.findMany({
      where: { businessId: auth.businessId, id: { in: productIds } },
      select: { id: true },
    });
    itemsCreate = businessProducts.map((p, index) => ({ productId: p.id, order: index }));
  }

  const list = await prisma.pricelist.create({
    data: {
      businessId: auth.businessId,
      name,
      description: sourceList ? sourceList.description : description,
      customerGroup: sourceList ? sourceList.customerGroup : customerGroup,
      discountRate: sourceList ? sourceList.discountRate : discountRate,
      validFrom: sourceList ? sourceList.validFrom : validFrom,
      validUntil: sourceList ? sourceList.validUntil : validUntil,
      items: { create: itemsCreate },
    },
    include: { _count: { select: { items: true } } },
  });

  return NextResponse.json(
    {
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
    },
    { status: 201 }
  );
}
