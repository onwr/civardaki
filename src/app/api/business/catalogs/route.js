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

/** GET - list catalogs for business */
export async function GET() {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const catalogs = await prisma.catalog.findMany({
    where: { businessId: auth.businessId },
    include: {
      _count: { select: { items: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const items = catalogs.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    isPublished: c.isPublished,
    pdfUrl: c.pdfUrl,
    shareUrl: c.shareUrl,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    productCount: c._count.items,
  }));

  return NextResponse.json(items);
}

/** POST - create catalog */
export async function POST(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const body = await req.json();
  const name = toStr(body?.name);
  const description = toStr(body?.description) || null;
  const productIds = Array.isArray(body?.productIds) ? body.productIds.filter((id) => typeof id === "string" && id) : [];

  if (!name || name.length < 2) return NextResponse.json({ message: "Katalog adı en az 2 karakter olmalı." }, { status: 400 });

  const businessProducts = await prisma.product.findMany({
    where: { businessId: auth.businessId, id: { in: productIds } },
    select: { id: true },
  });
  const validProductIds = businessProducts.map((p) => p.id);

  const catalog = await prisma.catalog.create({
    data: {
      businessId: auth.businessId,
      name,
      description,
      items: {
        create: validProductIds.map((productId, index) => ({ productId, order: index })),
      },
    },
    include: { _count: { select: { items: true } } },
  });

  return NextResponse.json({
    id: catalog.id,
    name: catalog.name,
    description: catalog.description,
    isPublished: catalog.isPublished,
    pdfUrl: catalog.pdfUrl,
    shareUrl: catalog.shareUrl,
    createdAt: catalog.createdAt,
    updatedAt: catalog.updatedAt,
    productCount: catalog._count.items,
  }, { status: 201 });
}
